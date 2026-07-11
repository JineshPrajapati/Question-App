using Dapper;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Enum;
using TeacherApp.Modules.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using TeacherApp.Modules.Email;

namespace TeacherApp.Modules.Helper.Services
{
    public class UserService : IUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly string _currentUserGuid;
        private readonly string _currentUserName;
        private readonly string _currentUserEmail;
        private readonly IConfiguration _configuration;

        public UserService(
            IHttpContextAccessor httpContextAccessor,
            IUnitOfWork unitOfWork,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            RoleManager<ApplicationRole> roleManager,
            SQLQueryExecutionRepository sqlRepository,
            IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _sqlRepository = sqlRepository;
            _currentUserGuid = _httpContextAccessor?.HttpContext?.User?.FindFirst(UserClaimsKey.Sub)?.Value;
            _currentUserName = _httpContextAccessor?.HttpContext?.User?.Identity?.Name;
            _currentUserEmail = _currentUserGuid == null ? "" : userManager.FindByIdAsync(_currentUserGuid)?.Result?.Email;
            _configuration = configuration;
        }

        public UserService()
        {
            _httpContextAccessor = new HttpContextAccessor();
        }

        #region User
        public async Task<User> GetCurrentUserAsync()
        {
            return await _unitOfWork.Repository<User>().GetByUniqueIdAsync(_currentUserGuid);
        }

        public async Task<IEnumerable<User>> GetAllUser()
        {
            return await _unitOfWork.Repository<User>().GetAll().AsQueryable().ToListAsync();
        }

        public async Task<IEnumerable<string>> GetAllUserIds()
        {
            return await _unitOfWork.Repository<User>().Query().Select(u => u.Id).ToListAsync();
        }

        public string GetCurrentUserGuid()
        {
            return _currentUserGuid;
        }

        public string GetCurrentUserName()
        {
            return _currentUserName;
        }

        public string GetCurrentUserEmail()
        {
            return _currentUserEmail;
        }
        #endregion

        #region User info, user account
        public async Task<User> GetUserAsync(ClaimsPrincipal principal)
        {
            return await _userManager.GetUserAsync(principal);
        }

        public async Task<User> FindByNameAsync(string username)
        {
            return await _userManager.FindByNameAsync(username);
        }

        public async Task<User> FindByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<User> FindByIdAsync(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }

        public async Task<IdentityResult> CreateAsync(User user, string password)
        {
            return await _userManager.CreateAsync(user, password);
        }

        public async Task<IdentityResult> SetLockoutEnabledAsync(User user, bool enabled)
        {
            return await _userManager.SetLockoutEnabledAsync(user, enabled);
        }

        public async Task<IdentityResult> ResetPasswordAsync(User user, string code, string password)
        {
            return await _userManager.ResetPasswordAsync(user, code, password);
        }

        public async Task<IdentityResult> ConfirmEmailAsync(User user, string code)
        {
            return await _userManager.ConfirmEmailAsync(user, code);
        }

        public async Task<SignInResult> PasswordSignInAsync(string email, string password, bool rememberMe, bool lockoutOnFailure)
        {
            return await _signInManager.PasswordSignInAsync(email, password, rememberMe, lockoutOnFailure);
        }

        public async Task<ClaimsPrincipal> CreateUserPrincipalAsync(User user)
        {
            return await _signInManager.CreateUserPrincipalAsync(user);
        }

        public async Task SaveResetPasswordRequest(string token, string email)
        {
            var passwordRequest = new PasswordRequest
            {
                Token = token,
                Email = email,
                IsActive = true
            };

            await _unitOfWork.Repository<PasswordRequest>().AddAsync(passwordRequest);
        }

        public async Task<string> GenerateEmailConfirmationTokenAsync(User user)
        {
            return await _userManager.GenerateEmailConfirmationTokenAsync(user);
        }

        public async Task<string> GeneratePasswordResetTokenAsync(User user)
        {
            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task<int> GetAccessFailedCountAsync(User user)
        {
            return await _userManager.GetAccessFailedCountAsync(user);
        }

        public List<UserAccessRightEntity> GetUserAccessRightList(string roleName)
        {
            List<UserAccessRightEntity> userSessionEntity = new List<UserAccessRightEntity>();
            SqlParameter[] sqlParameter = new SqlParameter[]
            {
                new SqlParameter("@RoleIds",SqlDbType.NVarChar) {Value = roleName }
            };
            var data = _sqlRepository.ExecuteQuery<UserAccessRightEntity>("GetUserAccessRightList", sqlParameter);
            userSessionEntity = data.ToList();
            return userSessionEntity;
        }
        public UserLoginDetailEntity GetLoggedInUserById(string UserId)
        {
            UserLoginDetailEntity userDetail = new UserLoginDetailEntity();
            try
            {

                SqlParameter[] sqlParameter = new SqlParameter[]
                {
                new SqlParameter("@UserId",SqlDbType.NVarChar) {Value = UserId }
                };
                userDetail = _sqlRepository.ExecuteQuery<UserLoginDetailEntity>("GetLoggedInUserById", sqlParameter).FirstOrDefault();
            }
            catch (Exception)
            {

                throw;
            }
            return userDetail;

        }
        public async Task ToggleRequestPasswordStatusByEmail(string email)
        {
            var passwordRequests = await _unitOfWork.Repository<PasswordRequest>().Query()
                .Where(rq => rq.Email.Equals(email) && rq.IsActive)
                .ToListAsync();

            foreach (var passwordRequest in passwordRequests)
            {
                passwordRequest.IsActive = false;
                await _unitOfWork.Repository<PasswordRequest>().UpdateAsync(passwordRequest);
            }
        }

        public async Task<bool> AddUserRefereshToken(string refreshToken, User user)
        {
            if (user != null)
            {
                var result = await _userManager.SetAuthenticationTokenAsync(user, "CustomProvider", "RefreshToken", refreshToken);
                return result.Succeeded;
            }
            return false;
        }


        public async Task<string> GetUserRefereshToken(User user)
        {
            string Token = "";
            if (user != null)
            {
                Token = await _userManager.GetAuthenticationTokenAsync(user, "CustomProvider", "RefreshToken");
            }
            return Token;
        }
        #endregion

        #region Roles
        public async Task AddUserToRolesAsync(User user, List<string> roles)
        {
            await _userManager.AddToRolesAsync(user, roles);
        }

        public async Task AddUserRoles(string[] userRoles)
        {
            foreach (var role in userRoles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new ApplicationRole
                    {
                        Name = role,
                        NormalizedName = role.ToUpper()
                    });
                }
            }
        }


        public async Task RemoveFromRolesAsync(User user, string roles)
        {
            await _userManager.RemoveFromRoleAsync(user, roles);
        }

        public async Task RemoveFromRolesAsync(User user, string[] roles)
        {
            await _userManager.RemoveFromRolesAsync(user, roles);
        }

        public IEnumerable<string> GetCurrentUserRoles()
        {
            var claims = _httpContextAccessor.HttpContext.User.Claims.ToList();

            foreach (var claim in claims)
            {
                if (claim.Type == UserClaimsKey.Role)
                    yield return claim.Value;
            }
        }

        public async Task<List<string>> GetUserRoles()
        {
            return await _roleManager.Roles.Select(x => x.Name).ToListAsync();
        }

        public async Task<IList<string>> GetUserRolesByGuid(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<IList<string>> GetUserRolesByName(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            return await _userManager.GetRolesAsync(user);
        }


        public async Task<List<User>> GetListRoleOfUser(string role)
        {
            var userList = await _userManager.GetUsersInRoleAsync(role);
            return userList.ToList();
        }

        #endregion

        #region Validate
        public async Task<bool> CanSignInAsync(User user)
        {
            return await _signInManager.CanSignInAsync(user);
        }

        public async Task<bool> IsEmailConfirmedAsync(User user)
        {
            return await _userManager.IsEmailConfirmedAsync(user);
        }

        public async Task<bool> IsLockedOutAsync(User user)
        {
            return await _userManager.IsLockedOutAsync(user);
        }

        public async Task<bool> CheckValidResetPasswordToken(string token, string email)
        {
            var passwordRequest = await _unitOfWork.Repository<PasswordRequest>().Query()
                                        .Where(rq => rq.Email.Equals(email)
                                        && rq.Token.Equals(token)
                                        && rq.IsActive).SingleOrDefaultAsync();
            return passwordRequest != null;
        }

        public async Task<SignInResult> CheckPasswordSignInAsync(User user, string password, bool lockoutOnFailure)
        {
            return await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure);
        }

        public async Task SignInAsync(User user, bool isPersistent)
        {
            await _signInManager.SignInAsync(user, isPersistent);
        }

        public async Task SignOutAsync()
        {
            await _signInManager.SignOutAsync();
        }

        public bool IsAuthenticated()
        {
            return _httpContextAccessor.HttpContext.User.Identity.IsAuthenticated;
        }

        Task<IEnumerable<User>> IUserService.GetAllUser()
        {
            throw new NotImplementedException();
        }

        Task<IEnumerable<string>> IUserService.GetAllUserIds()
        {
            throw new NotImplementedException();
        }

        public async Task<bool> CheckPasswordAsync(User user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task SignInAsync(User user, string password)
        {
            await _signInManager.SignInAsync(user, isPersistent: true);
        }
        public async Task<IdentityResult> ResetAccessFailedCount(User user)
        {
            return await _userManager.ResetAccessFailedCountAsync(user);
        }

        public ApiResponseEntity UserRegistration(UserEntity user)
        {
            ApiResponseEntity result = new ApiResponseEntity();

            var passwordHasher = new PasswordHasher<object>();
            user.Password = passwordHasher.HashPassword(null, user.Password);

            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
           {
                new SqlParameter("@Email",SqlDbType.NVarChar) {Value = user.Email },
                new SqlParameter("@HashedPassword",SqlDbType.NVarChar) {Value = user.Password },
                new SqlParameter("@FirstName",SqlDbType.NVarChar) {Value = user.FirstName },
                new SqlParameter("@LastName",SqlDbType.NVarChar) {Value = user.LastName }
                };

                result = _sqlRepository.ExecuteQuery<ApiResponseEntity>("UserRegistration", sqlParameter).FirstOrDefault();
            }
            catch (Exception e)
            { 
                throw;
            }
            return result;
        }


        public TokenResponse Authenticate(string Email, string HashPassword)
        {
            TokenResponse result = new TokenResponse();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
           {
                new SqlParameter("@Email",SqlDbType.NVarChar) {Value = Email },
                new SqlParameter("@Password",SqlDbType.NVarChar) {Value = HashPassword }
                };

                result = _sqlRepository.ExecuteQuery<TokenResponse>("ValidateUserCredentials", sqlParameter).FirstOrDefault();
            }
            catch (Exception e)
            {
                //throw;
            }
            return result;
        }

        public List<UserAccessRightEntity> UserRightsById(string UserId, string RoleIdentityId)
        {
            ApiResponseEntity result = new ApiResponseEntity();

            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
           {
                new SqlParameter("@UserId",SqlDbType.NVarChar) {Value = UserId }      ,
                       new SqlParameter("@RoleId",SqlDbType.NVarChar) {Value = RoleIdentityId }
                };

                return _sqlRepository.ExecuteQuery<UserAccessRightEntity>("GetUserAccessRightsById", sqlParameter).ToList();


            }
            catch (Exception e)
            {
                throw;
            }

        }




        #endregion

        #region User Profile

        public DataResponseEntity UpdateProfilePicture(ProfilePictureEntity userImage)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                var baseFilePath = _configuration["FileStoragePaths:BaseFilePath"];
                userImage.ImagePath = _configuration["FileStoragePaths:ProfilePicturePath"] + userImage.UserId;
                var uploadPath = Path.Combine(baseFilePath, userImage.ImagePath);
                if (Directory.Exists(uploadPath))
                    Directory.Delete(uploadPath, true);
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                userImage.ImageName = $"{userImage.UserId}.{userImage.ImageExtension}";
                var path = Path.Combine(uploadPath, userImage.ImageName);

                // Convert base64 string to byte array and save file
                byte[] fileBytes = Convert.FromBase64String(userImage.Base64Image);
                File.WriteAllBytesAsync(path, fileBytes);

                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@UserId", userImage.UserId);
                sqlParameter.Add("@ProfilePicturePath", userImage.ImagePath + "\\" + userImage.ImageName);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("UploadProfilePicture", sqlParameter);

                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }

        public DataResponseEntity GetUserFacility(string UserId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@UserId", UserId);
                //SqlParameter[] sqlParameter =
                //{
                //    new SqlParameter("@UserId",SqlDbType.VarChar) {Value = userId }
                //};
                var data = _sqlRepository.Get<UserFacility>("GetUserFacility", sqlParameter);
                //return _dbContext.Database.SqlQueryRaw<UserProfileEntity>("EXEC GetUsersDetailById @UserId", sqlParameter).AsEnumerable().FirstOrDefault();
                response.Data = data.Data;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }

        public DataResponseEntity UpdateUserProfile(UserProfileEntity userProfile)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@UserId", userProfile.UserId);
                sqlParameter.Add("@FirstName", userProfile.FirstName);
                sqlParameter.Add("@LastName", userProfile.LastName);
                //sqlParameter.Add("@PhoneNumber", userProfile.PhoneNumber);
                //sqlParameter.Add("@DateofBirth", userProfile.DateofBirth);
                sqlParameter.Add("@Gender", userProfile.Gender);
                //sqlParameter.Add("@Address", userProfile.Address);
                //sqlParameter.Add("@City", userProfile.City);
                //sqlParameter.Add("@State", userProfile.State);
                //sqlParameter.Add("@Pincode", userProfile.Pincode);
                //sqlParameter.Add("@Country", userProfile.Country);
                //sqlParameter.Add("@EmergencyContactName", userProfile.EmergencyContactName);
                //sqlParameter.Add("@EmergencyContactPhone", userProfile.EmergencyContactPhone);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                //SqlParameter[] sqlParameter =
                //{
                //    new SqlParameter("@UserId",SqlDbType.VarChar) {Value = userProfile.UserId },
                //    new SqlParameter("@FirstName", SqlDbType.VarChar) { Value = userProfile.FirstName},
                //    new SqlParameter("@LastName", SqlDbType.VarChar) { Value = userProfile.LastName},
                //    new SqlParameter("@PhoneNumber", SqlDbType.VarChar) { Value = userProfile.PhoneNumber},
                //    new SqlParameter("@DateofBirth", SqlDbType.Date) { Value = userProfile.DateofBirth},
                //    new SqlParameter("@Address", SqlDbType.VarChar) { Value = userProfile.Address},
                //    new SqlParameter("@EmergencyContactName", SqlDbType.VarChar) { Value = userProfile.EmergencyContactName},
                //    new SqlParameter("@EmergencyContactPhone", SqlDbType.VarChar) { Value = userProfile.EmergencyContactPhone}
                //};

                _sqlRepository.Excute("UpdateUserProfile", sqlParameter);
                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");
                //return _dbContext.Database.SqlQueryRaw<ApiResponseEntity>("EXEC UpdateUserProfile @UserId, @FirstName, @LastName, @PhoneNumber, @DateofBirth, @Address, @EmergencyContactName, @EmergencyContactPhone", sqlParameter).AsEnumerable().FirstOrDefault();

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }


        

        #endregion
    }
}
