using System.ComponentModel.DataAnnotations;

namespace TeacherApp.Modules.Account.ViewModels
{
    public class ForgotPasswordViewModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
