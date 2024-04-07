using Flurl.Http;
using Heimdall.Dashboard.Ui.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseLamar((context, registry) =>
{
    registry.Scan(x =>
    {
        x.AssemblyContainingType<Program>();
        x.WithDefaultConventions();
        x.LookForRegistries();
    });
});

builder.WebHost
    .ConfigureKestrel(x => x.ListenAnyIP(8080))
    .ConfigureLogging((context, config) =>
    {
        var logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .Enrich.WithExceptionDetails()
            .WriteTo.Console(new JsonFormatter(renderMessage: true))
            .CreateLogger();
        
        config.ClearProviders();
        config.AddSerilog(logger);
    });

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient("K8sClient")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler()
    {
        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
    }
);
builder.Services.AddHttpClient("Prometheus")
    .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler()
    {
        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator,
    }
);
builder.Services.AddRazorPages(options =>
{
    options.Conventions.ConfigureFilter(new IgnoreAntiforgeryTokenAttribute());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment() || Debugger.IsAttached)
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

FlurlHttp.ConfigureClientForUrl(K8sClient.Server)
    .ConfigureInnerHandler(x => x.ServerCertificateCustomValidationCallback = (_, _, _, _) => true);

app.UseWebSockets();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthorization();
app.MapControllers();
app.MapRazorPages();
app.MapMetrics();

app.Run();
