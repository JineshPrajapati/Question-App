using System;

namespace TeacherApp.Modules.Email
{
    public class EmailTemplate
    {
        public int Id { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public EmailType EmailType { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }

        public string CompanyName { get; set; }
        public string CompanyEmail { get; set; }
        public string Website { get; set; }
        public string BaseUrl { get; set; }
        public string FacebookUrl { get; set; }
        public string InstagramUrl { get; set; }
        public string LinkedinUrl { get; set; }
        public string XUrl { get; set; }
    }
}
