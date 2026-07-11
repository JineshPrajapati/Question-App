using Dapper;
using TeacherApp.Extension;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;


namespace TeacherApp.Modules.Admin.Services
{
    public class RolePermissionService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;

        public RolePermissionService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination)
        {
            _sqlRepository = sqlRepository;
            _pagination = pagination;
        }

        public Pagination GetRoleList(Pagination pagination)
        {

            pagination = _pagination.Execute<RolesPermissionEntity>("GetRoleListByPagination", pagination);

            pagination.TotalRecords = (pagination.Data as List<RolesPermissionEntity>).Select(x => x.TotalRecords).FirstOrDefault();

            return pagination;
        }

        public DataResponseEntity GetRoleDetailById(string roleId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                RolesPermissionEntity roleDetail = new RolesPermissionEntity();
                roleDetail.AccessRights = new List<RolesAccessRightsEntity>();
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@RoleId", roleId);
                var data = _sqlRepository.Get<RolesPermissionEntity>("GetRoleDetailById", sqlParameter);
                roleDetail = data.Data[0];
                var rights = GetAccessRightsByRoleId(roleId);
                roleDetail.AccessRights = rights;
                response.Data = roleDetail;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }


        public List<RolesAccessRightsEntity> GetAccessRightsByRoleId(string roleid)
        {

            List<RolesAccessRightsEntity> moduleList = new List<RolesAccessRightsEntity>();
            try
            {
                SqlParameter[] parameters =
                {
                    new SqlParameter("@RoleId", SqlDbType.NVarChar) { Value = roleid }
                };

                int i = 1;
                List<AccessRightList> AccessRighs = _sqlRepository.ExecuteQuery<AccessRightList>("GetAccessRightsByRoleId", parameters).ToList();
                moduleList = AccessRighs.GroupBy(r => r.ModuleName).Select(rights => new RolesAccessRightsEntity
                {
                    ModuleName = rights.Key,
                    Description = rights.Select(x=>x.Description).First(),
                    Id = i++,
                    Rights = rights.Select(x => new Entities.AccessRight
                    {
                        AccessRightsId = x.AccessRightsId,
                        RightName = x.RightName,
                        CanAccess = x.CanAccess
                    }).ToList()
                }).OrderBy(x => x.ModuleDisplayOrder).OrderBy(x=> x.DisplayOrder).ToList();
            }
            catch (Exception e)
            {
            }

            return moduleList;
        }


        public ApiResponseEntity ManageAccessRights(RolesPermissionEntity roleAccessRights)
        {
            ApiResponseEntity result = new ApiResponseEntity();

            string accessRightIds = "";
            try
            {

                var selectedRights = roleAccessRights.AccessRights.SelectMany(module => module.Rights)
                                                                    .Where(right => right.CanAccess != null && right.CanAccess.Value)
                                                                    .Select(action => action.AccessRightsId)
                                                                    .ToList();

                if (selectedRights != null && selectedRights.Count > 0)
                {
                    accessRightIds = string.Join(",", selectedRights);
                }


                SqlParameter[] sqlParameter = new SqlParameter[]
                {
                new SqlParameter("@RoleIdentityId",SqlDbType.NVarChar) {Value = roleAccessRights.RoleId },
                new SqlParameter("@SchoolId",SqlDbType.Int) {Value = roleAccessRights.SchoolId },
                new SqlParameter("@RoleName",SqlDbType.VarChar) {Value = roleAccessRights.RoleName },
                new SqlParameter("@UserTypeId",SqlDbType.Int) {Value = roleAccessRights.UserTypeId },
                new SqlParameter("@Description",SqlDbType.VarChar) {Value =roleAccessRights.Description },
                new SqlParameter("@IsActive",SqlDbType.Bit) {Value = roleAccessRights.IsActive },
                new SqlParameter("@IsDefault",SqlDbType.Bit) {Value = roleAccessRights.IsDefault },
                new SqlParameter("@AccessRightIds",SqlDbType.NVarChar) {Value =accessRightIds },
                new SqlParameter("@CreatedBy",SqlDbType.NVarChar) {Value=roleAccessRights.CreatedIdentityBy }
                };
                result = _sqlRepository.ExecuteQuery<ApiResponseEntity>("AddUpdateRoleAccessRights", sqlParameter).FirstOrDefault();

                GlobalAccessRightsService.SetAccessRights();
            }
            catch (Exception e)
            {
                throw;
            }
            return result;
        }


        public DataResponseEntity DeleteRole(DeleteEntity role)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@RoleIdentityId", role.RoleIdentityId);
                sqlParameter.Add("@IsDelete", role.IsDelete);
                sqlParameter.Add("@CreatedBy", role.CreatedIdentityBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);


                _sqlRepository.Excute("DeleteRolesManagement", sqlParameter);

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

        public DataResponseEntity UpdateRoleStatus(UpdateStatusEntity updateStatus)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@RoleIdentityId", updateStatus.RoleIdentityId);
                sqlParameter.Add("@IsActive", updateStatus.IsActive);
                sqlParameter.Add("@CreatedBy", updateStatus.CreatedBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("UpdateRoleStatus", sqlParameter);

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
