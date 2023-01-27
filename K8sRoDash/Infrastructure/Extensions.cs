namespace K8sRoDash.Infrastructure;

public static class Extensions
{
    public static string ToBase64(this string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        
        var bytes = Encoding.UTF8.GetBytes(value);
        return Convert.ToBase64String(bytes);
    }

    public static string FromBase64(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;

        var bytes = Convert.FromBase64String(value);
        return Encoding.UTF8.GetString(bytes);
    }
}