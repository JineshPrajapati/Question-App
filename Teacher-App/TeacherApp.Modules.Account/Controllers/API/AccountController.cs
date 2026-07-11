using TeacherApp.Modules.Account.Repositories;
using TeacherApp.Modules.Account.ViewModels;
using TeacherApp.Modules.Email;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Enum;
using TeacherApp.Modules.Helper.Extensions;
using TeacherApp.Modules.Helper.Filter;
using TeacherApp.Modules.Helper.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Account.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/Account/")]
    public class AccountController : Controller
    {
        private readonly IEmailSender _emailSender;
        private readonly IAccountRepository _accountRepository;
        private readonly IUserService _userService;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IUrlHelperExtension _urlHelper;
        private readonly IConfiguration _configuration;
        
        public AccountController(
            IEmailSender emailSender,
            IAccountRepository accountRepository,
            IUserService userService,
            IUrlHelperExtension urlHelper, JwtTokenService jwtTokenService,
            IConfiguration configuration)
        {
            _emailSender = emailSender;
            _accountRepository = accountRepository;
            _userService = userService;
            _urlHelper = urlHelper;
            _jwtTokenService = jwtTokenService;
            _configuration = configuration;
        }

        #region Login, Register, Password
        [HttpPost("Authenticate")]
        [AllowAnonymous]
        public async Task<IActionResult> Authenticate([FromBody] LoginViewModel model)
        {
            var passwordHasher = new PasswordHasher<object>();
            string HashPassword= passwordHasher.HashPassword(null, model.Password);
            var user = await _userService.FindByEmailAsync(model.Username);
         
            if (user!=null)
            {
          
                var verificationResult = passwordHasher.VerifyHashedPassword(null, user.PasswordHash, model.Password);
                HashPassword = (verificationResult == PasswordVerificationResult.Success) ? user.PasswordHash : HashPassword;
            }
            var result =  _userService.Authenticate(model.Username, HashPassword);
            if (result.IsSuccess)
            {              
                     var UserDetail = _userService.GetLoggedInUserById(user.Id);
                var token = _jwtTokenService.GenerateToken(user, UserDetail.RoleId == null || UserDetail.RoleId == "" ? "" : UserDetail.RoleId);
                if(token!= null)
                {
                    result.AccessToken = token.AccessToken;
                    result.RefreshToken = token.RefreshToken;
                    bool state = await _userService.AddUserRefereshToken(token.RefreshToken, user);

                }
                result.UserRights = _userService.UserRightsById(UserDetail.UserId, UserDetail.RoleId);
                result.User = UserDetail;
                

                return Ok(result); 
            }
           return Ok(result);
        }
        [AllowAnonymous]
        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {

         var user = await _userService.FindByEmailAsync(request.Username);         
            // Validate the refresh token
            var refreshToken =await _userService.GetUserRefereshToken(user);

            if (user == null ||refreshToken == null || !string.Equals(refreshToken, request.RefreshToken))
            {
                return Unauthorized("Invalid refresh token or expired.");
            }
            var role = user.Roles.ToList()[0].RoleId.ToString();
            var token = _jwtTokenService.GenerateToken(user,role);
            if (token != null)
            {
                bool state = await _userService.AddUserRefereshToken(token.RefreshToken, user);
            }         

            return Ok(token);
        }

        [HttpPost("Register"), AllowAnonymous, ValidModel]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            UserEntity userRegister = new UserEntity { Email = model.Email, Password = model.Password, FirstName = model.FirstName, LastName = model.LastName };
            var UserResult = _userService.UserRegistration(userRegister);
            if (UserResult.IsSuccess)
            {
                var user = new User { UserName = model.Email, Email = model.Email };
                var code = await _userService.GenerateEmailConfirmationTokenAsync(user);
                // var callbackUrl = Url.EmailConfirmationLink(user.Id, code, Request.Scheme);
                // EmailOptions opt = new EmailOptions { UserName = model.FirstName + " " + model.LastName };
                ///    Emails email = _emailSender.SendEmail(model.Email, opt, EmailType.Register);
                await _userService.SignInAsync(user, isPersistent: false);
            }

            return Ok(UserResult);
        }

        [HttpPost("ForgotPassword"), AllowAnonymous, ValidModel]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordViewModel model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);
            if (user == null || !await _userService.IsEmailConfirmedAsync(user))
            {
                return Ok();
            }

            var token = await _userService.GeneratePasswordResetTokenAsync(user);

            await _userService.ToggleRequestPasswordStatusByEmail(model.Email);
            await _userService.SaveResetPasswordRequest(token, model.Email);

            string callbackUrl = _configuration.GetValue<string>("ResetPasswordURL").Replace("{{token}}", token.ToString()).Replace("{{email}}", model.Email.ToString());
            var emailOptions = new EmailOptions
            {
                Url = callbackUrl,
                Token = token
            };
            try
            {
                Emails email = _emailSender.SendEmail(model.Email, emailOptions, EmailType.ForgotPassword);
                email.TempleteType = EmailType.ForgotPassword;
                return Ok(new { IsSuccess = true, Message = "Email sent successfully!" });
            }
            catch (Exception ex)
            {
                return Ok(new { StatusCode = AppStatusCode.NotFound, Error = "Server Side" });
            }
        }

        [HttpPost("ResetPassword"), ValidModel, AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordViewModel model)
        {
            if (string.IsNullOrEmpty(model.Token) || string.IsNullOrEmpty(model.Email))
            {
                return RedirectToAction("Index", "Error", new { statusCode = AppStatusCode.NotFound });
            }

            var isResetTokenValid = await _userService.CheckValidResetPasswordToken(model.Token, model.Email);

            if (!isResetTokenValid || string.IsNullOrEmpty(model.Email))
            {
                return StatusCode(AppStatusCode.ResetPassTokenExpire);
            }

            var user = await _userService.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Ok();
            }

            await _userService.ResetPasswordAsync(user, model.Token, model.Password);
            return Ok(new { IsSuccess = true, Message = "Password reset successfully!" });
        }
        #endregion

        #region Account
        //[HttpGet("Users")]
        //public IActionResult Users(Pagination pagination)
        //{
        //    var userList = _accountRepository.GetUserList(pagination);
        //    return Ok(userList);
        //}

        [HttpPost("ValidateDuplicateAccountInfo"), ValidModel]
        public async Task<IActionResult> ValidateDuplicateAccountInfo([FromBody] UserAccountValidateObject accountValidateObject)
        {
            var isDuplicateAccountInfo = await _accountRepository.ValidateDuplicateAccountInfo(accountValidateObject);
            return Ok(isDuplicateAccountInfo);
        }

        [HttpPost("Users"), ValidModel]
        public async Task<IActionResult> AddNewUser([FromBody] UserInputViewModel userInputVm)
        {
            var result = await _accountRepository.AddNewUser(userInputVm);

            return Ok();
        }

        [HttpPost("Status"), ValidModel]
        public async Task<IActionResult> ToggleAccountStatus([FromBody] AccountToggleViewModel accountToggleVm)
        {
            var result = await _accountRepository.AccountToggle(accountToggleVm);
           
                return Ok();
           
        }


        [HttpPost("unlock")]
        [AllowAnonymous]
        public async Task<IActionResult> unlockUser([FromBody] LoginRequest model)
        {

            var user = await _userService.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return StatusCode(AppStatusCode.NotFound, new { Error = "User not found." });
            }
            var validUser = await _userService.CheckPasswordAsync(user, model.Password);
            if (!validUser)
            {
                return StatusCode(500, new { Error = "Invalid Password!" });
            }

            var unlockResult = await _userService.SetLockoutEnabledAsync(user, false);
            if (unlockResult.Succeeded)
            {
                return Ok("User unlocked.");
            }

            return StatusCode(500, new { Error = "Sorry try again after few moments" });


        }

        [HttpPost("VerifyUser")]
        
        public async Task<IActionResult> VerifyUser([FromBody] UserVerifyEntity userToggleVm)
        {
            var result = _accountRepository.VerifyUser(userToggleVm);
            if (result.IsSuccess)
            {
                if (userToggleVm.IsActive)
                {
                    var user = await _userService.FindByIdAsync(userToggleVm.UserId);
                    EmailOptions opt = new EmailOptions { UserName = user.UserName,Password = "If you don't know your password, Please reset your password."};
                    Emails email = _emailSender.SendEmail(user.Email, opt, EmailType.Register);
                }
            }

            return Ok(result);
        }

        [HttpDelete("DeletePendingApproval")]
        public IActionResult DeletePendingApproval([FromBody]DeletePendingApproval deletePendingApproval)
        {
            if (deletePendingApproval == null || deletePendingApproval.UserIdentityId == string.Empty)
                return Ok(new { IsSuccess = false, Message = "User not found" });
            var result = _accountRepository.DeletePenddingApproval(deletePendingApproval);
                
            return Ok(result);
        }

        [HttpPost("GetAccessRights")]
        [AllowAnonymous]
        public IActionResult GetAccessRights([FromBody] GetAccessRightEntity getAccessRight)
        {
            var result = _accountRepository.GetAccessRights(getAccessRight);
            if (result.IsSuccess)
                return Ok(result);
            return BadRequest(result);
        }

        #endregion

        #region User Profile

        [HttpPut("ProfilePicture")]
        public IActionResult UploadProfilePicture([FromBody] ProfilePictureEntity profilePicture)
        {
            var response = _userService.UpdateProfilePicture(profilePicture);

            return Ok(response);
        }
        [HttpGet("UserFacility/{UserId}")]
        public IActionResult GetUserFacility(string UserId)
        {
            var response = _userService.GetUserFacility(UserId);

            return Ok(response);
        }

        [HttpPut("UpdateProfile")]
        public IActionResult UpdateP([FromBody] UserProfileEntity userProfile)
        {
            var user = _userService.UpdateUserProfile(userProfile);
            return Ok(user);
        }

        #endregion
    }
}
