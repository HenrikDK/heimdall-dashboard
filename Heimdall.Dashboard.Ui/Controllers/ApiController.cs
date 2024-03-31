using Flurl;
using Flurl.Http;
using Heimdall.Dashboard.Ui.Infrastructure;

namespace Heimdall.Dashboard.Ui.Controllers;

[ApiController]
//[Authorize]
public class ApiController : ControllerBase
{
    private readonly ILogger<ApiController> _logger;
    private readonly Lazy<bool> _canRestartPod;
    private readonly Lazy<bool> _canScalePods;
    private readonly Lazy<string> _filters;

    public ApiController(IConfiguration configuration, ILogger<ApiController> logger)
    {
        _logger = logger;
        _canRestartPod = new Lazy<bool>(() => configuration.GetValue("can-restart-pod", false));
        _canScalePods = new Lazy<bool>(() => configuration.GetValue("can-scale-pods", false));
        _filters = new Lazy<string>(() => configuration.GetValue("filters", ""));
    }

    [HttpDelete("api/namespaces/{nameSpace}/pods/{name}")]
    public async Task<ActionResult> DeletePod(string nameSpace, string name)
    {
        if (!_canRestartPod.Value)
        {
            return BadRequest("Operation not allowed");
        }

        try
        {
            var server = K8sClient.Server;
            var user = "unknown";
            
            var result = await server.AppendPathSegment($"/api/v1/namespaces/{nameSpace}/pods/{name}")
                .WithOAuthBearerToken(K8sClient.AccessToken)
                .DeleteAsync()
                .ReceiveString();

            _logger.LogWarning($"User {user} deleted pod {name} in namespace {nameSpace}");
            
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception restarting pod");
            
            return StatusCode(502, e.Message);
        }
    }

    [HttpPut("api/namespaces/{nameSpace}/replicaset/{name}/scale/{count:int}")]
    public async Task<ActionResult> ScalePod(string nameSpace, string name, int count)
    {
        if (!_canScalePods.Value)
        {
            return BadRequest("Operation not allowed");
        }

        if (count > 10)
        {
            return BadRequest("Operation not allowed, count too high!");
        }

        try
        {
            var server = K8sClient.Server;
            var user = "unknown";
            
            var result = await server.AppendPathSegment($"/api/v1/namespaces/{nameSpace}/replicasets/{name}/scale")
                .WithOAuthBearerToken(K8sClient.AccessToken)
                .PatchJsonAsync(new { spec = new { replicas = count } })
                .ReceiveString();
            
            _logger.LogWarning($"User {user} scaled replicate set {name} in namespace {nameSpace} to {count}");
            
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception restarting pod");
            
            return StatusCode(502, e.Message);
        }
    }

    [HttpGet("api/features")]
    public ActionResult GetFeatures()
    {
        return Ok(new {
            CanRestartPod = _canRestartPod.Value,
            CanScalePods = _canScalePods.Value,
            Filters = _filters.Value
        });
    }
}