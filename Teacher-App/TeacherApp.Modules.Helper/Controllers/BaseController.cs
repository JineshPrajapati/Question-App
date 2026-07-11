using TeacherApp.Extension;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Linq;

namespace TeacherApp.Modules.Helper.Controllers
{
    public class BaseController : Controller
    {
        //TODO Change 
        protected readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        
        public BaseController(IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            bool isServerSide;
            if (!Boolean.TryParse(_configuration["Validation:ServerSideValidation"], out isServerSide) || !isServerSide)
            {
                
                    base.OnActionExecuting(context);
                    return;
                
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress;
            if (ipAddress != null && ipAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetworkV6)
            {
                ipAddress = System.Net.Dns.GetHostEntry(ipAddress).AddressList
                            .FirstOrDefault(x => x.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork);
            }
            string clientIp = ipAddress?.ToString();

            string controllerName = ((Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor)context.ActionDescriptor).ControllerName.ToLower();
            string actionName = ((Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor)context.ActionDescriptor).ActionName.ToLower();
            string userId = _httpContextAccessor.HttpContext.User.Identity.Name;
            
            var rights = _httpContextAccessor.HttpContext.User.Claims;
            var role = rights.Where(x => x.Type.Equals("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")).FirstOrDefault();
            if (role == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            bool IsSuccess = GlobalAccessRightsService.HasAccessRight(role.Value, controllerName, actionName);
            if (IsSuccess)
                base.OnActionExecuting(context);
            else
            {
                context.Result = new UnauthorizedResult();
                return;
            }
        }
    }
}
