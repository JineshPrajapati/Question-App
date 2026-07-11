using System.ComponentModel.DataAnnotations;

namespace TeacherApp.Modules.Account.ViewModels
{
    public class AccountToggleViewModel
    {
        [Required]
        public string AccountId { get; set; }
        [Required]
        public bool ToogleFlag { get; set; }
    }
}
