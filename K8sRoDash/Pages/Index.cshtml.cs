namespace K8sRoDash.Pages;

public class IndexModel : PageModel
{
    private readonly IConfiguration _configuration;

    public IndexModel(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public JsonResult OnGetFilters()
    {
        var filters = _configuration.GetValue("filters", "").Split(",")
            .Select(x => x.Trim()).ToList();

        return new JsonResult(filters);
    }
}
