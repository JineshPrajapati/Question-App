using TeacherApp.Modules.Helper.Services;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace TeacherApp.Modules.Helper.Filter
{
    public class RoleFilterAttribute : ActionFilterAttribute
    {
        private readonly UserService _userService = new UserService();

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);
            var currentUserRole = _userService.GetCurrentUserRoles();
            if (!currentUserRole.Any())
            {
                context.HttpContext.Response.Redirect("/Error/403");
            }
        }
    }
}
