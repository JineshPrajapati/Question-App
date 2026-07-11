using AutoMapper;
using Dapper;
using TeacherApp.Modules.Account.ViewModels;
using TeacherApp.Modules.Email;
using TeacherApp.Modules.Entities.Data;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Entities.ViewModel;
using TeacherApp.Modules.Helper.Enum;
using TeacherApp.Modules.Helper.Extensions;
using TeacherApp.Modules.Helper.Services;
using TeacherApp.Modules.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace TeacherApp.Modules.Account.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailSender _emailSender;
        private readonly IUrlHelperExtension _urlHelperExtension;
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;
        private readonly PaginationRepository _pagination;
        private readonly SQLQueryExecutionRepository _sqlRepository;

        public AccountRepository(
        IMapper mapper,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            IEmailSender emailSender,
            IUrlHelperExtension urlHelperExtension,
            IUserService userService,
            ApplicationDbContext context,
            PaginationRepository pagination,
            SQLQueryExecutionRepository sqlRepository)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
            _emailSender = emailSender;
            _urlHelperExtension = urlHelperExtension;
            _userService = userService;
            _context = context;
            _pagination = pagination;
            _sqlRepository = sqlRepository;
        }

        public Pagination GetUserList(Pagination pagination)
        {

            pagination = _pagination.Execute<AccountViewModel>("GetUserListByPagination", pagination);

            //pagination.TotalRecords = (pagination.Data as List<AccountViewModel>).Select(x => x.TotalRecords).FirstOrDefault();

            return pagination;
        }
        public DataResponseEntity VerifyUser(UserVerifyEntity userVerifyEntity)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity dataResponse = new DataResponseEntity();
            try
            {
                
                //sqlParameter.Add("@UserType", userVerifyEntity.UserType);
                sqlParameter.Add("@CreatedBy", userVerifyEntity.CreatedBy);
                sqlParameter.Add("@IsActive",userVerifyEntity.IsActive);
                sqlParameter.Add("@UserId",userVerifyEntity.UserId);
                sqlParameter.Add("@RoleIdentityId", userVerifyEntity.RoleId);
                sqlParameter.Add("@SchoolIds", userVerifyEntity.SchoolIds);
                sqlParameter.Add("@IsSuccess", size:1,dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("VerifyUser", sqlParameter);

                dataResponse.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                dataResponse.Message = sqlParameter.Get<string>("Message");
                //SqlParameter[] sqlParameter =
                //{
                //    new SqlParameter("@UserType",SqlDbType.Int) {Value = userToggleEntity.UserType },
                //    new SqlParameter("@IsActive",SqlDbType.Bit) {Value = userToggleEntity.ToogleFlag },
                //    new SqlParameter("@UserId",SqlDbType.NVarChar) {Value = userToggleEntity.UserId }
                //};

                //return _context.Database.SqlQueryRaw<ApiResponseEntity>("EXEC ToggleUser @UserId,@UserType,@IsActive", sqlParameter).AsEnumerable().FirstOrDefault();
            }
            catch (Exception e)
            {
                dataResponse.IsSuccess = false;
                dataResponse.Message = e.Message;
            }
            return dataResponse;
        }
        public async Task<bool> AccountToggle(AccountToggleViewModel accountToggleVm)
        {
            var account = await _unitOfWork.Repository<User>().Query().Where(acc => acc.Id == accountToggleVm.AccountId).FirstOrDefaultAsync();
            if (account == null)
            {
                return false;
            }

            using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    account.EmailConfirmed = accountToggleVm.ToogleFlag;
                    await _unitOfWork.Repository<User>().UpdateAsync(account);
                    transaction.Complete();
                }
                catch (Exception)
                {
                    _unitOfWork.Rollback();
                }
            }

            return true;
        }

        public async Task<IEnumerable<UserRoleViewModel>> GetUserRoles()
        {
            var rolesList = await _unitOfWork.Repository<IdentityRole>().Query().ToListAsync();
            return _mapper.Map<IEnumerable<UserRoleViewModel>>(rolesList);
        }

        public async Task<IEnumerable<string>> GetUserRolesName()
        {
            return await _unitOfWork.Repository<IdentityRole>().Query().Select(r => r.Name).ToListAsync();
        }

        public async Task<bool> AddNewUser(UserInputViewModel userInputVm)
        {
            var user = new User { UserName = userInputVm.Username, Email = userInputVm.Email };
            var randomPassword = RandomString.GenerateRandomString(AppEnum.MinPasswordChar);
            var result = await _userService.CreateAsync(user, randomPassword);

            if (!result.Succeeded)
            {
                return false;
            }

            using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    await _userService.AddUserToRolesAsync(user, userInputVm.Roles);

                    var context = _httpContextAccessor.HttpContext;
                    var code = await _userService.GenerateEmailConfirmationTokenAsync(user);
                    var callbackUrl = _urlHelperExtension.EmailConfirmationLink(user.Id, code, context.Request.Scheme);
                    var emailOptions = new EmailOptions
                    {
                        Url = callbackUrl,
                        Password = randomPassword,
                        UserName = userInputVm.Username
                    };

                    await _emailSender.SendEmailAsync(userInputVm.Email, "", emailOptions, EmailType.AccountConfirm);
                    transaction.Complete();
                }
                catch (Exception)
                {
                    _unitOfWork.Rollback();
                }
            }

            return true;
        }

        public async Task<bool> ValidateDuplicateAccountInfo(UserAccountValidateObject accountValidateObject)
        {
            switch (accountValidateObject.Key)
            {
                case "UserName":
                    var isUserNameDuplicate = await _unitOfWork.Repository<User>().Query().Where(acc =>
                            acc.UserName.Equals(accountValidateObject.Value, StringComparison.OrdinalIgnoreCase))
                        .AnyAsync();
                    return isUserNameDuplicate;
                case "Email":
                    var isEmailDuplicate = await _unitOfWork.Repository<User>().Query().Where(acc =>
                            acc.Email.Equals(accountValidateObject.Value, StringComparison.OrdinalIgnoreCase))
                        .AnyAsync();
                    return isEmailDuplicate;
                default:
                    return false;
            }
        }

        public async Task<RolesUserViewModel> GetUserRolesById(string userId)
        {
            var userRoles = await _userService.GetUserRolesByGuid(userId);
            var roles = await GetUserRolesName();

            var roleUserVm = new RolesUserViewModel
            {
                UserId = userId,
                CurrentUserRoles = userRoles,
                RolesName = roles
            };

            return roleUserVm;
        }

        public async Task<bool> EditUserRoles(RolesUserViewModel rolesUserVm)
        {
            var userRoles = await _userService.GetUserRolesByGuid(rolesUserVm.UserId);
            var currentEditUser = await _userService.FindByIdAsync(rolesUserVm.UserId);

            using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    await _userService.RemoveFromRolesAsync(currentEditUser, userRoles.ToArray());
                    if (rolesUserVm.CurrentUserRoles.Any())
                    {
                        await _userService.AddUserToRolesAsync(currentEditUser, rolesUserVm.CurrentUserRoles.ToList());
                    }

                    transaction.Complete();
                }
                catch (Exception)
                {
                    _unitOfWork.Rollback();
                }
            }

            return true;
        }

        public async Task ManageRoles(SelectOptionList roles)
        {
            var roleList = await GetUserRoles();
            //when add new role value and label will be the same
            var roleToAdd = roles.SelectOptionViewModels.Where(x => x.Label == x.Value).ToList();
            var roleToRemove = roleList.Where(existingRole => roles.SelectOptionViewModels
                .All(item => item.Value != existingRole.Id && existingRole.Name != "Administrator")).ToList();

            using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (roleToRemove.Any())
                    {
                        var roleName = roleToRemove.Select(x => x.Name).ToArray();
                        foreach (var roleRemove in roleToRemove)
                        {
                            var userInRole = await _userService.GetListRoleOfUser(roleRemove.Name);
                            if (!userInRole.Any()) continue;
                            foreach (var user in userInRole)
                            {
                                await _userService.RemoveFromRolesAsync(user, roleName);
                            }

                            var role = await _unitOfWork.Repository<IdentityRole>().FindAsync(x =>
                                x.Name.Equals(roleRemove.Name, StringComparison.OrdinalIgnoreCase));
                            await _unitOfWork.Repository<IdentityRole>().DeleteAsync(role);
                        }
                    }

                    if (roleToAdd.Any())
                    {
                        var roleName = roleToAdd.Select(x => x.Label).ToArray();
                        await _userService.AddUserRoles(roleName);
                    }

                    transaction.Complete();
                }
                catch (Exception)
                {
                    _unitOfWork.Rollback();
                }
            }
        }

        public DataResponseEntity DeletePenddingApproval(DeletePendingApproval deletePendingApproval)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity dataResponse = new DataResponseEntity();
            try
            {
                sqlParameter.Add("@UserIdentityIds", deletePendingApproval.UserIdentityId);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("DeletePendingApprovalUsers", sqlParameter);

                dataResponse.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                dataResponse.Message = sqlParameter.Get<string>("Message");
                //SqlParameter[] sqlParameter =
                //{
                //    new SqlParameter("@UserType",SqlDbType.Int) {Value = userToggleEntity.UserType },
                //    new SqlParameter("@IsActive",SqlDbType.Bit) {Value = userToggleEntity.ToogleFlag },
                //    new SqlParameter("@UserId",SqlDbType.NVarChar) {Value = userToggleEntity.UserId }
                //};

                //return _context.Database.SqlQueryRaw<ApiResponseEntity>("EXEC ToggleUser @UserId,@UserType,@IsActive", sqlParameter).AsEnumerable().FirstOrDefault();
            }
            catch (Exception e)
            {
                dataResponse.IsSuccess = false;
                dataResponse.Message = e.Message;
            }
            return dataResponse;
        }

        public DataResponseEntity GetAccessRights(GetAccessRightEntity accessRight)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@UserIdentityId", accessRight.UserId);
                sqlParameter.Add("@SchoolId", accessRight.SchoolId);

                response = _sqlRepository.Get<AccessRightsModel>("GetAccessRightsByUserSchool", sqlParameter);

                var accessRights = (response.Data as List<AccessRightsModel>).ToDictionary(x => x.RoutePath, x => x.AccessRights);
                response.Data = new { accessRight = accessRights, roleId = response.Data[0].RoleId };

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }

    }
}
