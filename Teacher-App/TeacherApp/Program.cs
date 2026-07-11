using System.Net.Http.Headers;
using System.Text.Encodings.Web;
using Microsoft.OpenApi.Models;
using TeacherApp.Extension;
using TeacherApp.Modules.Admin.Modules;
using TeacherApp.Modules.KnowledgeBase.Services;
using static System.Net.WebRequestMethods;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);


var corsSetting = builder.Configuration.GetSection("CorsSettings").Get<CorsSettings>();


GlobalAccessRightsService.Initialize(builder.Configuration);


builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();


builder.Services.AddCors(options =>
{
    options.AddPolicy("CustomCorsPolicy", policy =>
    {
        policy.WithOrigins(corsSetting.AllowedOrigins.ToArray())
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddCustomizedDataStore(builder.Configuration);
builder.Services.AddCustomAuthentication(builder.Configuration);
builder.Services.AddCustomizedMvc(builder.Configuration, builder.Environment);
builder.Services.InjectAppConfig(builder.Configuration);
builder.Services.InjectApplicationServices(builder.Configuration);
builder.Services.RegisterGzip();

builder.Services.AddSignalR().AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
});

builder.Services.AddHttpClient<QdrantService>(client =>
{
    var host = builder.Configuration["Qdrant:Host"] ?? "localhost";
    var port = builder.Configuration["Qdrant:Port"] ?? "6333";
    client.BaseAddress = new Uri($"http://{host}:{port}/");
});

builder.Services.AddHttpClient<OpenAIService>(client =>
{
    var _uri = builder.Configuration["OpenAI:EndPoint"] ?? "https://api.openai.com/";
    var _key= builder.Configuration["OpenAI:ApiKey"] ?? "";
    client.BaseAddress = new Uri(_uri);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _key);
    client.Timeout = TimeSpan.FromSeconds(60);
});

builder.Services.AddReverseProxy()
    .LoadFromMemory(
        routes: new[]
        {
            new Yarp.ReverseProxy.Configuration.RouteConfig
            {
                RouteId = "qdrant-route",
                ClusterId = "qdrant-cluster",
                Match = new Yarp.ReverseProxy.Configuration.RouteMatch
                {
                    Path = "/qdrant/{**catch-all}"
                },
                Transforms = new[]
                {
                    new Dictionary<string, string> { { "PathRemovePrefix", "/qdrant" } }
                }
            }
        },
        clusters: new[]
        {
            new Yarp.ReverseProxy.Configuration.ClusterConfig
            {
                ClusterId = "qdrant-cluster",
                Destinations = new Dictionary<string, Yarp.ReverseProxy.Configuration.DestinationConfig>
                {
                    { "qdrant-destination", new Yarp.ReverseProxy.Configuration.DestinationConfig
                        {
                            Address = $"http://{builder.Configuration["Qdrant:Host"]}:{builder.Configuration["Qdrant:Port"]}/"
                        }
                    }
                }
            }
        }
    );


builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TeacherApp API",
        Version = "v1",
        Description = "API endpoints + Qdrant reverse-proxied endpoints"
    });
    c.DocumentFilter<QdrantSwaggerDocumentFilter>();
});

var app = builder.Build();

app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseHsts();
}

app.UseCors("CustomCorsPolicy");

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions 
{
    FileProvider = new PhysicalFileProvider(
        @"C:\Teacher\FTP\dev\QuestionImages"),
    RequestPath = "/QuestionImages"
});


app.UseRouting();

app.UseAuthorization();


app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TeacherApp API");
    c.RoutePrefix = "swagger"; 
});

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<ChatHub>("/chathub");
    endpoints.MapReverseProxy();
});


GlobalAccessRightsService.SetAccessRights();

app.Run();
