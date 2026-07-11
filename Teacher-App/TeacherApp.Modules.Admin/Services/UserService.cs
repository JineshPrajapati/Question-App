using Dapper;
using TeacherApp.Modules.Account.ViewModels;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Enum;
using TeacherApp.Modules.Helper.Extensions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using Microsoft.Data.SqlClient;

namespace TeacherApp.Modules.Admin.Services
{
    public class UserService
    {
        //private readonly ApplicationDbContext _dbContext;
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public UserService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination,IWebHostEnvironment environment,IConfiguration configuration)
        {
            //_dbContext = dbContext;
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _configuration = configuration;
            _environment = environment;
        }
        public Pagination GetUserList(Pagination pagination)
        {
            try
            {
                pagination = _pagination.Execute<AccountViewModel>("GetUserListByPagination", pagination);

            }
            catch(Exception e)
            {
                pagination.IsSuccess = false;
                pagination.Message = e.Message;
            }

            //pagination.TotalRecords = (pagination.Data as List<AccountViewModel>).Select(x => x.TotalRecords).FirstOrDefault();

            return pagination;
        }
        public DataResponseEntity GetUserDetailById(string userId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@UserId", userId);
                //SqlParameter[] sqlParameter =
                //{
                //    new SqlParameter("@UserId",SqlDbType.VarChar) {Value = userId }
                //};
                var data = _sqlRepository.Get<Entities.UserEntity>("GetUsersDetailById", sqlParameter);
                //return _dbContext.Database.SqlQueryRaw<UserProfileEntity>("EXEC GetUsersDetailById @UserId", sqlParameter).AsEnumerable().FirstOrDefault();
                response.Data = data.Data[0];
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            
            return response;
        }

        public DataResponseEntity CreateUser(Entities.UserEntity userProfile)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                var randomPassword = RandomString.GenerateRandomString(AppEnum.MinPasswordChar);
                var passwordHasher = new PasswordHasher<object>();
                string HashPassword = passwordHasher.HashPassword(null, randomPassword);
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@UserIdentityId", userProfile.UserId);
                sqlParameter.Add("@FirstName", userProfile.FirstName);
                sqlParameter.Add("@LastName", userProfile.LastName);
                sqlParameter.Add("@RoleIdentityId", userProfile.RoleIdentityId);
                sqlParameter.Add("@SchoolIds", userProfile.SchoolIds);
                sqlParameter.Add("@CurrentSchoolId", userProfile.CurrentSchoolId);
                sqlParameter.Add("@Gender", userProfile.Gender);
                sqlParameter.Add("@Email", userProfile.EmailAddress);
                sqlParameter.Add("@PasswordHash", HashPassword);
                sqlParameter.Add("@CreatedBy", userProfile.CreatedIdentityBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("AddUpdateUsersManagement", sqlParameter);
                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");
                response.Data = response.IsSuccess? new { Email = userProfile.EmailAddress, Password = randomPassword } : null;              

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }

        

        public DataResponseEntity DeleteUser(DeleteEntity deleteUser)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                
                sqlParameter.Add("@UserIdentityId", deleteUser.UserIdentityId);
                sqlParameter.Add("@IsDelete", deleteUser.IsDelete);
                sqlParameter.Add("@CreatedBy", deleteUser.CreatedIdentityBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("DeleteUsersManagement", sqlParameter);

                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");
            }
            catch(Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }

        public UserLoginDetailEntity GetUserDetailBySchoolId(string UserId, int? SchoolId, int? AcademicYearId)
        {
            UserLoginDetailEntity userDetail = new UserLoginDetailEntity();
            try
            {

                SqlParameter[] sqlParameter = new SqlParameter[]
                {
                new SqlParameter("@UserId",SqlDbType.NVarChar) {Value = UserId },
                new SqlParameter("@SchoolId",SqlDbType.Int) {Value = SchoolId },
                new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value = AcademicYearId }
                };
                userDetail = _sqlRepository.ExecuteQuery<UserLoginDetailEntity>("GetUsersDetailBySchoolId", sqlParameter).FirstOrDefault();
            }
            catch (Exception)
            {

                throw;
            }
            return userDetail;

        }

        public DataResponseEntity UpdateUserStatus(UpdateStatusEntity updateStatus)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@UserIdentityId", updateStatus.UserIdentityId);
                sqlParameter.Add("@IsActive", updateStatus.IsActive);
                sqlParameter.Add("@CreatedBy", updateStatus.CreatedBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("UpdateUserStatus", sqlParameter);

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
    }
}
