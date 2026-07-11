using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Helper.Controllers;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Route("api/Notification/")]
    public class NotificationController : BaseController
    {
        private readonly NotificationService _notificationService;

        public NotificationController(NotificationService notificationService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            this._notificationService = notificationService;
        }

        [HttpGet("GetNotification/{UserIdentityId}/{SchoolId}")]
        public IActionResult GetNotification(string UserIdentityId, int SchoolId)
        {
            var result = _notificationService.GetNotification(UserIdentityId, SchoolId);
            return Ok(result);
        }
    }
}
