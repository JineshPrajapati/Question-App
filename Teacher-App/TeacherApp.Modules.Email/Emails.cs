using System;

namespace TeacherApp.Modules.Email
{
    public class Emails
    {
        public int Id { get; set; }
        public string To { get; set; }
        public string From { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public EmailType TempleteType { get; set; }
        public EmailStatus Status { get; set; }
        public string ErrorMessage { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
