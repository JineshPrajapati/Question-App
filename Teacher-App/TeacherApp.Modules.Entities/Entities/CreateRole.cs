namespace TeacherApp.Modules.Entities.Entities
{
    public class CreateRole
    {
        public string RoleName { get; set; }
        public string RoleCode { get; set; }
        public string RoleIdentityId { get; set; }
        public string RoleDiscriminator { get; set; }
        public string CreatedBy { get; set; }
        public int SchoolId { get; set; }
    }
}
