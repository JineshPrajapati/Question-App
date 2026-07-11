using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Email;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;


namespace TeacherApp.Modules.Admin.Controllers.API
{
  [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/User/")]
    public class UserController : BaseController
    {
        private readonly Services.UserService _userProfileService;
        private readonly IEmailSender _emailSender;
        public UserController(Services.UserService userProfileService, IEmailSender emailSender
            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _userProfileService = userProfileService;
            _emailSender = emailSender;
        }

        [HttpGet("List")]
        public IActionResult Index(Pagination pagination)
        {
            var userList = _userProfileService.GetUserList(pagination);
            
            return Ok(userList);
        }
        [HttpPost("Create")]
        public IActionResult Create([FromBody] Entities.UserEntity user)
        {
            var response = _userProfileService.CreateUser(user);
            if (response.IsSuccess)
            {
                EmailOptions opt = new EmailOptions { UserName = user.EmailAddress, Password = response.Data.Password };
                Emails email = _emailSender.SendEmail(user.EmailAddress, opt, EmailType.Register);
            }

            return Ok(response);
        }
        [HttpPut("Update")]
        public IActionResult Update([FromBody] Entities.UserEntity user)
        {
            var response = _userProfileService.CreateUser(user);
           
            return Ok(response);
        }
        [HttpGet("{userId}")]
        public IActionResult Get(string userId)
        {
            var user = _userProfileService.GetUserDetailById(userId);

            return Ok(user);
        }

        [HttpDelete("Delete")]
        public IActionResult Delete([FromBody]DeleteEntity deleteUser)
        {
            var response = _userProfileService.DeleteUser(deleteUser);

            return Ok(response);
        }
        
        [HttpPost("UpdateStatus")]
        public IActionResult ActveStatusChange([FromBody] UpdateStatusEntity user)
        {
            var response = _userProfileService.UpdateUserStatus(user);

            return Ok(response);
        }

    }

}
