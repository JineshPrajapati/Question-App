using System;
using System.Collections.Generic;

namespace TeacherApp.Modules.Admin.Entities
{
    public class RolesPermissionEntity
    {
        public string RoleId { get; set; }
        public int SchoolId { get; set; } = 1;
        public string RoleCode { get; set; }

        public int UserTypeId { get; set; }
        public string RoleName { get; set; }
        public string UserType { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
        public List<RolesAccessRightsEntity> AccessRights { get; set; }
        public string CreatedIdentityBy { get; set; }
        public int? TotalRecords { get; set; }
        public Int64? RowNum { get; set; }
    }
}
