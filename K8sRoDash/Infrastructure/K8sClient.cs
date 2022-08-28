namespace K8sRoDash.Infrastructure;

public class K8sClient
{
    private const string _tokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";
    
    private static Lazy<bool> _inCluster = new(() => IsInCluster());
    private static Lazy<(string host, string token)> _fileConfig = new(() => LoadFromConfig());
    private static Lazy<string> _clusterHost = new(() => GetClusterHost() );
    
    public static string AccessToken => _inCluster.Value ? File.ReadAllText(_tokenPath) : _fileConfig.Value.token;

    public static string Server => _inCluster.Value ? _clusterHost.Value : _fileConfig.Value.host;
    
    public static bool InCluster => _inCluster.Value;
    
    private static bool IsInCluster()
    {
        var host = Environment.GetEnvironmentVariable("KUBERNETES_SERVICE_HOST");
        var port = Environment.GetEnvironmentVariable("KUBERNETES_SERVICE_PORT");

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(port))
        {
            return false;
        }

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return false;
        }

        return File.Exists(_tokenPath);
    }
    
    private static string GetClusterHost()
    {
        var host = Environment.GetEnvironmentVariable("KUBERNETES_SERVICE_HOST");
        var port = Environment.GetEnvironmentVariable("KUBERNETES_SERVICE_PORT");
        return $"https://{host}:{port}";
    }

    private static (string host, string token) LoadFromConfig()
    {
        var location = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) 
            ? Path.Combine(Environment.GetEnvironmentVariable("USERPROFILE"), @".kube\config") 
            : Path.Combine(Environment.GetEnvironmentVariable("HOME"), ".kube/config");

        var file = File.ReadAllText(location);
        var yamlObject = new Deserializer().Deserialize(new StringReader(file));
        var json = JsonConvert.SerializeObject(yamlObject);
        dynamic config = JsonConvert.DeserializeObject<ExpandoObject>(json);
        var dict = (IDictionary<string, object>) config;
        var currentContext = "" + dict["current-context"];

        var server = "";
        foreach (var entry in config.clusters)
        {
            if (entry.name != currentContext) continue;
            server = entry.cluster.server;
            break;
        }

        var token = "";
        foreach (var entry in config.users)
        {
            if (!entry.name.ToString().EndsWith(currentContext)) continue;
            try
            {
                token = entry.user.token;
            } catch (Exception e) { }
            break;
        }

        return (server, token);
    }
}