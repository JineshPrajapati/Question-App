using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/Role/")]
    public class RolesController : BaseController
    {
        private readonly RolePermissionService _roleService;

        public RolesController(
            RolePermissionService roleService
         , IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _roleService = roleService;
        }


        [HttpGet("List")]
        public IActionResult Index(Pagination pagination)
        {
            var roleList = _roleService.GetRoleList(pagination);

            return Ok(roleList);
        }

        //[HttpGet("{roleId}")]
        //public IActionResult Get(string roleId)
        //{
        //    var role = _roleService.GetRoleDetailById(roleId);
        //    if (role != null && role.IsSuccess)
        //        return Ok(role);
        //    else return BadRequest(role);
        //}

        [HttpGet("{roleId}")]
        //public DataResponseEntity GetAccessRightsListByRoleId(string roleId)
        public DataResponseEntity Get(string roleId)
        {
            DataResponseEntity result = new DataResponseEntity();
            try
            {
                result.Data = _roleService.GetAccessRightsByRoleId(roleId);
                result.IsSuccess = true;

            }
            catch (System.Exception e)
            {

                result.IsSuccess = false;
                result.Message = Convert.ToString(e.Message);
            }
            return result;
        }

        //[HttpPost("ManageRole")]
        //public IActionResult Manage([FromBody] CreateRole role)
        //{
        //    var result = _roleService.ManageRole(role);
        //    return Ok(result);

        //}

        [HttpPost("Create")]
        public IActionResult Create([FromBody] RolesPermissionEntity rolePermision)
        {
            ApiResponseEntity result = new ApiResponseEntity();
            try
            {
                result = _roleService.ManageAccessRights(rolePermision);
            }
            catch (System.Exception)
            {

                throw;
            }
            return Ok(result);
        }
        [HttpPut("Update")]
        public IActionResult Update([FromBody] RolesPermissionEntity rolePermision)
        {
            ApiResponseEntity result = new ApiResponseEntity();
            try
            {
                result = _roleService.ManageAccessRights(rolePermision);
            }
            catch (System.Exception)
            {

                throw;
            }
            return Ok(result);
        }

        [HttpDelete("Delete")]
        public IActionResult Delete([FromBody] DeleteEntity role)
        {
            var response = _roleService.DeleteRole(role);

            //return Ok(response);
            if (response.IsSuccess)
                return Ok(response);
            else return BadRequest(response);

        }

        [HttpPost("UpdateStatus")]
        public IActionResult ActiveStatusChange([FromBody] UpdateStatusEntity Role)
        {
            var response = _roleService.UpdateRoleStatus(Role);

            return Ok(response);
        }

    }
}
