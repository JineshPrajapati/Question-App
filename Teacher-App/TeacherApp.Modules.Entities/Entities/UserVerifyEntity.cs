using System.ComponentModel.DataAnnotations;

namespace TeacherApp.Modules.Entities.Entities
{
    public class UserVerifyEntity
    {
        [Required]
        public string UserId { get; set; }
        //[Required]
        //public int UserType { get; set; }
        [Required]
        public bool IsActive { get; set; }
        public string RoleId { get; set; }
        public string SchoolIds { get; set; }
        public string CreatedBy { get; set; }
    }
}
