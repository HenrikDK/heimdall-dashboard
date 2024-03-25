namespace Heimdall.Dashboard.Ui.Infrastructure;

public class K8sClient
{
    private const string _tokenPath = "/var/run/secrets/kubernetes.io/serviceaccount/token";
    private static DateTime? lastRead = null;
    private static string _token = "";
    
    private static Lazy<bool> _inCluster = new(() => IsInCluster());
    private static Lazy<(string host, string token)> _fileConfig = new(() => LoadFromConfig());
    private static Lazy<string> _clusterHost = new(() => GetClusterHost() );
    
    public static string Server => _inCluster.Value ? _clusterHost.Value : _fileConfig.Value.host;
    
    public static bool InCluster => _inCluster.Value;
    
    public static string AccessToken
    {
        get
        {
            if (!lastRead.HasValue || lastRead < DateTime.UtcNow.AddMinutes(15))
            {
                _token = _inCluster.Value ? File.ReadAllText(_tokenPath) : _fileConfig.Value.token;
            }

            return _token;
        }
    }
    
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
        var json = JsonSerializer.Serialize(yamlObject);
        var config = JsonSerializer.Deserialize<JsonNode>(json);
        var currentContext = "" + config["current-context"].GetValue<string>();
        
        var userName = "";
        var clusterName = "";
        foreach (var entry in config["contexts"].AsArray())
        {
            if (entry["name"].GetValue<string>() != currentContext) continue;
            clusterName = entry["context"]["cluster"].GetValue<string>();
            userName = entry["context"]["user"].GetValue<string>();
            break;
        }
        
        var server = "";
        foreach (var entry in config["clusters"].AsArray())
        {
            if (entry["name"].GetValue<string>() != clusterName) continue;
            server = entry["cluster"]["server"].GetValue<string>();
            break;
        }

        if (!string.IsNullOrEmpty(server) && server.Contains("://0.0.0.0:"))
        {
            server = server.Replace("://0.0.0.0:", "://127.0.0.1:");
        }

        var token = "";
        foreach (var entry in config["users"].AsArray())
        {
            if (entry["name"].GetValue<string>() != userName) continue;
            try
            {
                token = entry["user"]["token"].GetValue<string>();
            } catch (Exception e) { }
            break;
        }

        if (string.IsNullOrEmpty(token))
        {
            var customToken = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "c:\\tmp\\token" : "/var/tmp/token";

            if (File.Exists(customToken))
            {
                token = File.ReadAllText(customToken);
            }
        }
        return (server, token);
    }
}