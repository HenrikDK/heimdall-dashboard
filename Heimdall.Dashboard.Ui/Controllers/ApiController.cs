using Flurl;
using Flurl.Http;
using Heimdall.Dashboard.Ui.Infrastructure;
using Microsoft.AspNetCore.Authorization;

namespace Heimdall.Dashboard.Ui.Controllers;

[ApiController]
//[Authorize]
public class ApiController : ControllerBase
{
    private readonly ILogger<ApiController> _logger;
    private readonly Lazy<bool> _canRestartPod;
    private readonly Lazy<bool> _canScalePods;
    private readonly Lazy<string> _filters;
    private readonly Lazy<bool> _metrics;

    public ApiController(IConfiguration configuration, ILogger<ApiController> logger)
    {
        _logger = logger;
        _canRestartPod = new Lazy<bool>(() => configuration.GetValue("can_restart_pods", false));
        _canScalePods = new Lazy<bool>(() => configuration.GetValue("can_scale_pods", false));
        _filters = new Lazy<string>(() => configuration.GetValue("filters", ""));
        _metrics = new Lazy<bool>(() => configuration.GetValue("metrics", true));
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

    [HttpPut("api/namespaces/{nameSpace}/deployments/{name}/scale/{count:int}")]
    public async Task<ActionResult> ScaleDeploymentPods(string nameSpace, string name, int count)
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
            
            var result = await server.AppendPathSegment($"/apis/apps/v1/namespaces/{nameSpace}/deployments/{name}/scale")
                .WithOAuthBearerToken(K8sClient.AccessToken)
                .WithHeader("Content-type", "application/merge-patch+json")
                .PatchJsonAsync(new { spec = new { replicas = count } })
                .ReceiveString();
            
            _logger.LogWarning($"User {user} scaled deployment {name} in namespace {nameSpace} to {count}");
            
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception scaling deployment");
            
            return StatusCode(502, e.Message);
        }
    }
    
    [HttpPut("api/namespaces/{nameSpace}/statefulsets/{name}/scale/{count:int}")]
    public async Task<ActionResult> ScaleStatefulSetPods(string nameSpace, string name, int count)
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

            var result = await server.AppendPathSegment($"/apis/apps/v1/namespaces/{nameSpace}/statefulsets/{name}/scale")
                .WithOAuthBearerToken(K8sClient.AccessToken)
                .WithHeader("Content-type", "application/merge-patch+json")
                .PatchJsonAsync(new { spec = new { replicas = count } })
                .ReceiveString();
            
            _logger.LogWarning($"User {user} scaled stateful set {name} in namespace {nameSpace} to {count}");
            
            return Ok(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Exception scaling stateful set");
            
            return StatusCode(502, e.Message);
        }
    }
    

    [AllowAnonymous]
    [HttpGet("api/features")]
    public ActionResult GetFeatures()
    {
        return Ok(new {
            CanRestartPod = _canRestartPod.Value,
            CanScalePods = _canScalePods.Value,
            Filters = _filters.Value,
            Metrics = _metrics.Value
        });
    }
}