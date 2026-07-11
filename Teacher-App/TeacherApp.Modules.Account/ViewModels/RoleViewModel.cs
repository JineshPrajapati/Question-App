using System.ComponentModel.DataAnnotations;

namespace TeacherApp.Modules.Account.ViewModels
{
    public class RoleViewModel
    {
        [Required]
        public string[] RoleData { get; set; }
        public string RoleOptions { get; set; }
    }
}
