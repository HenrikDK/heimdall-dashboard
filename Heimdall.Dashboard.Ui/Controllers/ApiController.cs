using Microsoft.AspNetCore.Authorization;

namespace Heimdall.Dashboard.Ui.Controllers;

[ApiController]
[Authorize]
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
    public ActionResult DeletePod(string nameSpace, string name)
    {
        if (!_canRestartPod.Value)
        {
            return BadRequest("Operation not allowed");
        }
        
        // TODO: Send Request
        
        return Ok();
    }

    [HttpPut("api/namespaces/{nameSpace}/replicaset/{name}/scale/{count:int}")]
    public ActionResult ScalePod(string nameSpace, string name, int count)
    {
        if (!_canScalePods.Value)
        {
            return BadRequest("Operation not allowed");
        }

        if (count > 10)
        {
            return BadRequest("Operation not allowed, count too high!");
        }

        // PATCH /apis/apps/v1/namespaces/{namespace}/replicasets/{name}/scale
        // https://kubebyexample.com/learning-paths/operator-framework/kubernetes-api-fundamentals/scaling-and-advanced-api-operations
        //A ReplicaSet can be easily scaled up or down by simply updating the .spec.replicas field. 
        
        // TODO: Send Request
        
        return Ok();
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