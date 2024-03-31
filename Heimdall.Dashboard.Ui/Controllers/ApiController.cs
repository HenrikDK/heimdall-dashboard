using Flurl;
using Flurl.Http;
using Heimdall.Dashboard.Ui.Infrastructure;
using Microsoft.AspNetCore.Authorization;

namespace Heimdall.Dashboard.Ui.Controllers;

[ApiController]
//[Authorize]
public class ApiController : ControllerBase
{
    private readonly Lazy<bool> _canRestartPod;
    private readonly Lazy<bool> _canScalePods;

    public ApiController(IConfiguration configuration)
    {
        _canRestartPod = new Lazy<bool>(() => configuration.GetValue("can-restart-pod", false));
        _canScalePods = new Lazy<bool>(() => configuration.GetValue("can-scale-pods", false));
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
            var result = await server.AppendPathSegment($"/api/v1/namespaces/{nameSpace}/pods/{name}")
                .WithOAuthBearerToken(K8sClient.AccessToken)
                .DeleteAsync()
                .ReceiveString();
            return Ok(result);
        }
        catch (Exception e)
        {
            return Ok(e.Message);
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
        
        var server = K8sClient.Server;
        var result = await server.AppendPathSegment($"/api/v1/namespaces/{nameSpace}/replicasets/{name}/scale")
            .WithOAuthBearerToken(K8sClient.AccessToken)
            .PatchJsonAsync(new { spec = new { replicas = count } })
            .ReceiveString();
        
        return Ok(result);
    }

    [HttpGet("api/features")]
    public ActionResult GetFeatures()
    {
        return Ok(new {
            CanRestartPod = _canRestartPod.Value,
            CanScalePods = _canScalePods.Value
        });
    }
}