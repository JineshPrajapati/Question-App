using AspNetCore.IServiceCollection.AddIUrlHelper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TeacherApp.Modules.Account.Repositories;
using TeacherApp.Modules.Admin.Controllers.API;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Email;
using TeacherApp.Modules.Entities.Data;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.ExceptionHandler;
using TeacherApp.Modules.Helper.Extensions;
using TeacherApp.Modules.Helper.Services;
using TeacherApp.Modules.KnowledgeBase.Services;
using TeacherApp.Modules.Mapper;
using TeacherApp.Modules.Repositories;

namespace TeacherApp.Extension
{
    public static class ServiceCollectionExtensions
    {

        public static IServiceCollection InjectApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddControllers();          
            services.AddUrlHelper();

            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddSingleton<JwtTokenService>();
            //infrastructure

            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IJsonParseService<>), typeof(JsonParseService<>));

            //helper service
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUrlHelperExtension, UrlHelperExtension>();
            services.AddScoped<IExceptionHandler, ExceptionHandler>();
            services.AddScoped<IEmailSender, EmailSender>();
            services.AddScoped<TeacherAiSqlService>();

            // 
            services.AddAutoMapper(typeof(Program));
            services.AddAutoMapper(typeof(UserProfile));
            services.AddScoped<SQLQueryExecutionRepository>();
            //repository, service

            services.AddScoped<IUserService, Modules.Helper.Services.UserService>();
            services.AddScoped<IAccountRepository, AccountRepository>();
           
            
            services.AddScoped<Modules.Admin.Services.UserService>();
            services.AddScoped<PaginationRepository>();
            services.AddScoped<QuestionReaderRepository>();
           
            services.AddScoped<RolePermissionService>();
            services.AddScoped<DropdownService>();
            services.AddScoped<ChatMessageService>();

        
            services.AddScoped<FileService>();
            services.AddScoped<QuestionService>();
          
            services.AddScoped<NotificationService>();

            services.AddScoped<ElaMathDataService>();
            services.AddScoped<ReportService>();


        
            services.AddScoped<KnowledgeService>();
            services.AddScoped<PdfChunkService>();
            services.AddSingleton<EmbeddingService>();         
            services.AddSingleton<OpenAIService>();                     
            services.AddScoped<AiAssistentService>();
            services.AddScoped<SettingsService>();
            services.AddScoped<DashboardService>();
           

            return services;
        }

        public static IServiceCollection AddCustomizedDataStore(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDbContextPool<ApplicationDbContext>(options =>
     options.UseLazyLoadingProxies()
            .UseSqlServer(configuration.GetConnectionString("DefaultConnection"))
 );

            return services;
        }
        public static IServiceCollection AddCustomizedMvc(this IServiceCollection services,
            IConfiguration configuration, IHostEnvironment hostingEnvironment)
        {
            services
           .AddControllersWithViews(options =>
           {
               options.EnableEndpointRouting = false;
           })
           .AddJsonOptions(options =>
           {
               options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
           });

         
            return services;
        }


        public static IServiceCollection AddCustomAuthentication(this IServiceCollection services, IConfiguration _configuration)
        {
            services
                .AddIdentity<User, ApplicationRole>(options =>
                {
                    options.Password.RequireDigit = false;
                    options.Password.RequiredLength = 5;
                    options.Password.RequireLowercase = false;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = false;

                   //lock out attempt
                      //options.Lockout.AllowedForNewUsers = true;
                      //  options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                      //  options.Lockout.MaxFailedAccessAttempts = 5;
                })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.Unspecified;
            });

            //The default value is 14 days.
            services.ConfigureApplicationCookie(options =>
            {
                options.ExpireTimeSpan = TimeSpan.FromHours(1);
            });


            // Configure JWT Bearer authentication
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;  // Set to true in production environments
                options.SaveToken = true;

                // Configure JWT token validation parameters
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],   // Set your issuer
                    ValidAudience = _configuration["Jwt:Audience"], // Set your audience
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]))
                };
            });


            services.AddAuthorization();


            return services;
        }

        public static IServiceCollection InjectAppConfig(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSwaggerGen();
            services.AddHttpClient<QdrantService>();
            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
            services.Configure<OpenAiApiSettings>(configuration.GetSection("OpenAiApiSettings"));          

            return services;
        }

     
        public static IServiceCollection RegisterGzip(this IServiceCollection services)
        {
            services.Configure<GzipCompressionProviderOptions>(options =>
                options.Level = System.IO.Compression.CompressionLevel.Optimal);
            services.AddResponseCompression(options =>
            {
                options.MimeTypes = new[]
                {
                    // Default
                    "text/plain",
                    "text/css",
                    "application/javascript",
                    "text/html",
                    "application/xml",
                    "text/xml",
                    "application/json",
                    "text/json",
                    // Custom
                    "image/svg+xml",
                    "font/woff2",
                    "application/font-woff",
                    "application/font-ttf",
                    "application/font-eot",
                    "image/jpeg",
                    "image/png"
                };
            });

            return services;
        }

     



    }
}