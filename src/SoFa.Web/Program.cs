using JuanGCarmona.SoFa.Modules.Workspace;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 16 * 1024);
// Hosting and authentication diagnostics may include protocol query strings or redirects.
// Keep those categories silent; application failures return fixed, credential-free responses.
builder.Logging.AddFilter("Microsoft.AspNetCore.Hosting.Diagnostics", LogLevel.None);
builder.Logging.AddFilter("Microsoft.AspNetCore.Authentication", LogLevel.None);
builder.Logging.AddFilter("Microsoft.IdentityModel", LogLevel.None);
builder.Services.AddWorkspace();
var app = builder.Build();
app.UseWorkspace();
await app.RunAsync();

public partial class Program;
