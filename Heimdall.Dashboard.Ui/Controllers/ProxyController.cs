using AspNetCore.Proxy.Options;
using Heimdall.Dashboard.Ui.Infrastructure;

namespace Heimdall.Dashboard.Ui.Controllers;

[ApiController]
//[Authorize]
public class ProxyController : ControllerBase
{
    private HttpProxyOptions _k8sHttpOptions = HttpProxyOptionsBuilder.Instance
        .WithHttpClientName("K8sClient")
        .WithHandleFailure((ctx, e) =>
        {
            _logger.LogError(e, "Exception proxying k8s request");
            return Task.FromResult(new ContentResult
            {
                StatusCode = 502,
                Content = JsonSerializer.Serialize(e),
                ContentType = "application/json"
            });
        })
        .WithShouldAddForwardedHeaders(false)
        .Build();

    private HttpProxyOptions _prometheusHttpOptions = HttpProxyOptionsBuilder.Instance
        .WithHttpClientName("Prometheus")
        .WithHandleFailure((ctx, e) =>
        {
            _logger.LogError(e, "Exception proxying prometheus request");
            return Task.FromResult(new ContentResult
            {
                StatusCode = 502,
                Content = JsonSerializer.Serialize(e),
                ContentType = "application/json"
            });
        })
        .WithShouldAddForwardedHeaders(false)
        .Build();
    
    private WsProxyOptions _wsOptions = WsProxyOptionsBuilder.Instance
        .WithBeforeConnect((context, wso) =>
        {
            context.Request.Headers.Remove("Origin");
            wso.RemoteCertificateValidationCallback = (_, _, _, _) => true; 
            return Task.CompletedTask;
        })
        .WithHandleFailure((ctx, e) =>
        {
            _logger.LogError(e, "Exception proxying k8s websocket");
            return Task.FromResult(new ContentResult
            {
                StatusCode = 502,
                Content = JsonSerializer.Serialize(e),
                ContentType = "application/json"
            });
        })
        .Build();

    private readonly IConfiguration _configuration;
    private static ILogger<ApiController> _logger;
    private Lazy<string> _token;
    private Lazy<List<string>> _metricsHeaders;
    private Lazy<string> _metricsServer;

    public ProxyController(IConfiguration configuration, ILogger<ApiController> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _token = new Lazy<string>(GetMetricsAuthentication);
        _metricsHeaders = new Lazy<List<string>>(GetHeaders);
        _metricsServer = new Lazy<string>(GetMetricsServer);
    }

    [HttpGet("/prometheus/{**rest}")]
    public Task Proxy()
    {
        try
        {
            if (!string.IsNullOrEmpty(_token.Value))
            {
                HttpContext.Request.Headers.Append("Authorization", $"Basic {_token.Value}");
            }
            else if (!K8sClient.InCluster)
            {
                HttpContext.Request.Headers.Append("Authorization", $"Bearer {K8sClient.AccessToken}");
            }
        
            _metricsHeaders.Value.ForEach(x =>
            {
                var header = x.Split(":");
                HttpContext.Request.Headers.Append(header[0], header[1]);
            });

            var qs = HttpContext.Request.QueryString.Value;
            var url = HttpContext.Request.Path.ToString().Replace("/prometheus/", "/");
            
            return this.HttpProxyAsync($"{_metricsServer.Value}{url}{qs}", _prometheusHttpOptions);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception proxying prometheus request");
            
            return Task.FromResult(StatusCode(502, e.Message));
        }
    }
    
    [HttpGet("/k8s/{**rest}")]
    public Task ProxyKubernetes()
    {
        try
        {
            HttpContext.Request.Headers.Append("Authorization", $"Bearer {K8sClient.AccessToken}");
            var qs = HttpContext.Request.QueryString.Value;
            var url = HttpContext.Request.Path.ToString().Replace("/k8s/", "/");
            var httpServer = K8sClient.Server;
            var wsServer = httpServer.Replace("https://", "wss://");
            return this.ProxyAsync($"{httpServer}{url}{qs}", $"{wsServer}{url}{qs}", _k8sHttpOptions, _wsOptions);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception proxying k8s api request");

            return Task.FromResult(StatusCode(502, e.Message));
        }
    }

    private string GetMetricsServer()
    {
        var type = _configuration.GetValue("metrics-type", "");
        var nameSpace = _configuration.GetValue("cluster-metrics-namespace", "");
        var service = _configuration.GetValue("cluster-metrics-service", "");
        var port = _configuration.GetValue("cluster-metrics-port", "");
        var externalHost = _configuration.GetValue("external-metrics-url", "");
        
        if (type == "cluster" && K8sClient.InCluster)
        {
            return $"http://{service}.{nameSpace}:{port}";
        }

        if (type == "cluster" && !K8sClient.InCluster)
        {
            return $"{K8sClient.Server}/api/v1/namespaces/{nameSpace}/services/{service}:{port}/proxy";
        }
        
        if (type == "external")
        {
            return externalHost;
        }

        return "";
    }

    private string GetMetricsAuthentication()
    {
        var type = _configuration.GetValue("metrics-type", "cluster");
        if (type == "cluster") return "";
        
        var user = _configuration.GetValue("metrics-user", "");
        var pass = _configuration.GetValue("metrics-password", "");
        
        var token = string.IsNullOrEmpty(user) ? "" : $"{user}:{pass}".ToBase64();

        return token;
    }

    private List<string> GetHeaders()
    {
        var headers = _configuration.GetValue("external-metrics-headers", "").Split(",").ToList();

        headers = headers.Where(x => x.Length > 0).ToList();

        return headers;
    }
}