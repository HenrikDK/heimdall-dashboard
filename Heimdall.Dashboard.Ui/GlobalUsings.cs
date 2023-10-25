global using System;
global using System.Diagnostics;
global using System.Runtime.InteropServices;
global using System.Text;
global using System.Text.Json;
global using System.Text.Json.Nodes;

global using Microsoft.AspNetCore.Builder;
global using Microsoft.AspNetCore.Hosting;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.Mvc.RazorPages;
global using Microsoft.Extensions.Logging;

global using AspNetCore.Proxy;
global using Lamar.Microsoft.DependencyInjection;
global using Prometheus;
global using Serilog;
global using Serilog.Exceptions;
global using Serilog.Formatting.Json;
global using YamlDotNet.Serialization;
