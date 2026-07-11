using System.Threading.Tasks;

namespace TeacherApp.Modules.Email
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string reciever, string message, EmailOptions options, EmailType emailType);
        Emails SendEmail(string reciever, EmailOptions options, EmailType emailType);
    }
}
