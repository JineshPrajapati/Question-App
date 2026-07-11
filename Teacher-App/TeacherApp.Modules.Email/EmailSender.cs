using Dapper;
using MailBodyPack;
using Microsoft.CodeAnalysis;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading.Tasks;


namespace TeacherApp.Modules.Email
{
    public class EmailSender : IEmailSender
    {
        private readonly IOptions<EmailSettings> _emailSetting;
        private readonly SQLQueryExecutionRepository _sqlRepository;
        public EmailSender(IOptions<EmailSettings> emailSetting, SQLQueryExecutionRepository sqlRepository)
        {
            _emailSetting = emailSetting;
            _sqlRepository = sqlRepository;
        }
        public Emails SendEmail(string reciever, EmailOptions options, EmailType emailType)
        {
            EmailTemplate emailTemplate = GetEmailTemplate(emailType, options);

            MailMessage mail = new MailMessage();
            mail.From = new MailAddress(_emailSetting.Value.Email);
            mail.To.Add(reciever);
            mail.Subject = emailTemplate.Subject;
            //mail.Body = body;
            mail.IsBodyHtml = true; // Set to true if the body contains HTML

            // Configure SMTP client
            System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient(_emailSetting.Value.MailServer, _emailSetting.Value.MailPort);
            smtp.Credentials = new NetworkCredential(_emailSetting.Value.Email, _emailSetting.Value.Password);
            smtp.EnableSsl = true; // Enable SSL for secure connection
            AlternateView avHtml = AlternateView.CreateAlternateViewFromString(emailTemplate.Body, null, MediaTypeNames.Text.Html);


            mail.AlternateViews.Add(avHtml);
            // Send the email
            mail.Body = emailTemplate.Body;

            Emails email = new Emails
            {
                Id = 0,
                To = reciever,
                From = _emailSetting.Value.Email,
                Status = EmailStatus.Queue,
                Subject = emailTemplate.Subject,
                Body = emailTemplate.Body,
                TempleteType = emailType,
                CreatedBy = 0,
                ErrorMessage = "",
            };
            email.Id = AddSendEmailDetails(email).Id;
            try
            {
                smtp.Send(mail);
                email.Status = EmailStatus.Success;
                email.Id = AddSendEmailDetails(email).Id;
            }
            catch (Exception ex)
            {
                email.Status = EmailStatus.Fail;
                email.ErrorMessage = ex.Message;
                email.Id = AddSendEmailDetails(email).Id;
            }
            return email;
        }
        private EmailTemplate GetEmailTemplate(EmailType emailType, EmailOptions options)
        {
            DynamicParameters parameters = new DynamicParameters();

            parameters.Add("@TemplateType", (int)emailType);

            var data = _sqlRepository.Get<EmailTemplate>("GetEmailTemplate", parameters);
            EmailTemplate emailTemplate = new EmailTemplate();
            emailTemplate = data.Data[0];

            switch (emailType)
            {
                case EmailType.SystemLog:

                    break;
                case EmailType.AccountConfirm:

                    break;
                case EmailType.ForgotPassword:
                    emailTemplate.Body = emailTemplate.Body.Replace("{{resetLink}}", options.Url).Replace("{{BaseUrl}}", emailTemplate.BaseUrl)
                        .Replace("{{CompanyEmail}}", emailTemplate.CompanyEmail).Replace("{{Website}}", emailTemplate.Website).
                        Replace("{{FacebookUrl}}", emailTemplate.FacebookUrl).Replace("{{InstagramUrl}}", emailTemplate.InstagramUrl)
                        .Replace("{{LinkedinUrl}}", emailTemplate.LinkedinUrl).Replace("{{XUrl}}", emailTemplate.XUrl);
                    break;
                case EmailType.ReplyComment:

                    break;
                case EmailType.SubscriptionEmail:

                    break;
                case EmailType.Register:
                    emailTemplate.Subject = emailTemplate.Subject.Replace("{{fullName}}", options.UserName);
                    emailTemplate.Body = emailTemplate.Body.Replace("{{Email}}", options.UserName).Replace("{{Password}}",options.Password);
                    break;
                case EmailType.RegisterTeacher:
                    emailTemplate.Subject = emailTemplate.Subject.Replace("{{fullName}}", options.UserName);
                    emailTemplate.Body = emailTemplate.Body.Replace("{{fullName}}", options.UserName);
                    break;
                default:
                    break;
            }

            return emailTemplate;

        }
        //private EmailTemplate MapEmailTemplate(IDataReader reader)
        //{
        //    return new EmailTemplate
        //    {
        //        Id = Convert.ToInt32(reader["Id"]),
        //        Subject = Convert.ToString(reader["Subject"]),
        //        Body = Convert.ToString(reader["Body"]),
        //        EmailType = EmailType.ForgotPassword,
        //        Description = Convert.ToString(reader["Description"]),
        //        IsActive = Convert.ToBoolean(reader["IsActive"]),
        //        CreatedBy = Convert.ToInt32(reader["CreatedBy"]),
        //        CreatedDate = Convert.ToDateTime(reader["CreatedDate"])
        //    };
        //}

        private Emails AddSendEmailDetails(Emails email)
        {
            DynamicParameters sqlParameters = new DynamicParameters();
            sqlParameters.Add("@Id", email.Id );
            sqlParameters.Add("@To", email.To );
            sqlParameters.Add("@From", email.From );
            sqlParameters.Add("@Subject", email.Subject );
            sqlParameters.Add("@Body", email.Body );
            sqlParameters.Add("@TempleteType", email.TempleteType );
            sqlParameters.Add("@Status", email.Status );
            sqlParameters.Add("@ErrorMessage", email.ErrorMessage );
            sqlParameters.Add("@CreatedBy", email.CreatedBy.ToString());
            //SqlParameter[] sqlParameters = new SqlParameter[]
            //{
            //    new SqlParameter("@Id",SqlDbType.Int) {Value = email.Id},
            //    new SqlParameter("@To", SqlDbType.NVarChar) { Value = email.To},
            //    new SqlParameter("@From", SqlDbType.NVarChar) { Value = email.From},
            //    new SqlParameter("@Subject", SqlDbType.NVarChar) { Value = email.Subject},
            //    new SqlParameter("@Body", SqlDbType.NVarChar) { Value = email.Body},
            //    new SqlParameter("@TempleteType", SqlDbType.Int) { Value = email.TempleteType},
            //    new SqlParameter("@Status", SqlDbType.Int) { Value = email.Status},
            //    new SqlParameter("@ErrorMessage", SqlDbType.NVarChar) { Value = email.ErrorMessage},
            //    new SqlParameter("@CreatedBy", SqlDbType.NVarChar) { Value = email.CreatedBy.ToString()},
            //};
            var data = _sqlRepository.Get<Emails>("AddSendEmailDetails", sqlParameters);
            
            return data.Data[0];
        }
        public Task SendEmailAsync(string reciever, string message, EmailOptions options, EmailType emailType)
        {
            var email = new MimeMessage();
            var builder = new BodyBuilder();

            email.From.Add(new MailboxAddress(_emailSetting.Value.SenderName, _emailSetting.Value.Sender));
            email.To.Add(new MailboxAddress(reciever, reciever));

            switch (emailType)
            {
                case EmailType.SystemLog:
                    email.Subject = "System log";
                    builder.HtmlBody = ExceptionEmailRender(message);
                    email.Body = builder.ToMessageBody();
                    break;
                case EmailType.AccountConfirm:
                    email.Subject = "Account confirm";
                    builder.HtmlBody = AccountCreationConfirm(options);
                    email.Body = builder.ToMessageBody();
                    break;
                case EmailType.ForgotPassword:
                    email.Subject = "Your account reset password";
                    builder.HtmlBody = AccountForgotPassword(options);
                    email.Body = builder.ToMessageBody();
                    break;
                case EmailType.ReplyComment:
                    email.Subject = $"{options.UserReply} just replied your comment";
                    builder.HtmlBody = ReplyCommentEmailTemplate(options);
                    email.Body = builder.ToMessageBody();
                    break;
                case EmailType.SubscriptionEmail:
                    email.Subject = $"Hi {reciever}, Here is our weekly post";
                    builder.HtmlBody = EmailSubscriptionTemplate(reciever);
                    email.Body = builder.ToMessageBody();
                    break;
                default:
                    break;
            }

            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(_emailSetting.Value.MailServer, _emailSetting.Value.MailPort, false);
                client.Authenticate(_emailSetting.Value.Email, _emailSetting.Value.Password);

                client.Send(email);
                client.Disconnect(true);
            }

            return Task.CompletedTask;
        }

        #region Email render

        private string ExceptionEmailRender(string stackTrace)
        {
            var body = MailBody
                .CreateBody()
                .Title("Awesome CMS Exception log")
                .Paragraph("Hello,")
                .Paragraph($"The following exception was throw at {DateTime.Now}")
                .Paragraph(stackTrace)
                .Paragraph("— [Awesome CMS Core system log] --")
                .ToString();

            return body;
        }

        private string AccountCreationConfirm(EmailOptions options)
        {
            var emailInfo = new[] {
                $"UserName: {options.UserName}",
                $"Password: {options.Password}"
            };

            var emailInfoFormat = emailInfo.Select(item => MailBody.CreateBlock().Text(item));

            var body = MailBody
                .CreateBody()
                .Paragraph($"Hi {options.UserName} Please confirm your email address by clicking the link below.")
                .Paragraph("Here is your login information")
                .UnorderedList(emailInfoFormat)
                .Paragraph("Please change it after you login")
                .Button($"{options.Url}", "Confirm Email Address")
                .Paragraph("— [Awesome CMS Core]")
                .ToString();

            return body;
        }

        private string AccountForgotPassword(EmailOptions options)
        {
            const string appName = "Awesome CMS Core";

            var body = MailBody
                .CreateBody()
                .Paragraph("Hi,")
                .Paragraph("You're receiving this email because someone requested a password reset for your user account at " + appName + ".")
                .Button(options.Url, "Reset password")
                .Paragraph("Thanks for using " + appName + "!")
                .Paragraph("— [Awesome CMS Core support team]")
                .ToString();


            return body;
        }

        private string ReplyCommentEmailTemplate(EmailOptions options)
        {
            var footer = MailBody
                .CreateBlock()
                .Text("Follow us at ")
                .Link("https://github.com/Awesome-CMS-Core/Awesome-CMS-Core", "@github");

            var body = MailBody
                .CreateBody(footer)
                .Paragraph($"Dear {options.UserComment}")
                .Paragraph($"User {options.UserReply} just reply your commant at")
                .Button($"{options.Url}", "Follow this link to the post")
                .Paragraph("— Awesome CMS Core support team")
                .ToString();

            return body;
        }

        /// <summary>
        /// will add list of blog post later
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        private string EmailSubscriptionTemplate(string email)
        {
            var productName = "ABC";
            var productStatus = "available";
            var productDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sagittis nisl ut tellus egestas facilisis. Nulla eget erat dictum, facilisis libero sit amet, sollicitudin tortor. Morbi iaculis, urna eu tincidunt dapibus, sapien ex dictum nibh, non congue urna tellus vitae risus.";
            var components = new string[] {
                "Part A",
                "Part B"
            };

            // Format product display.
            var items = components.Select(item => MailBody.CreateBlock().Text(item));

            var body = MailBody
                .CreateBody()
                .Paragraph("Hello,")
                .Paragraph("The product " + productName + " is now " + productStatus + ".")
                .SubTitle("Here is the product summary:")
                .Paragraph(MailBody.CreateBlock()
                    .StrongText("Product name: ").Text(productName))
                .Paragraph(MailBody.CreateBlock()
                    .StrongText("Description: ").Text(productDescription))
                .Paragraph(MailBody.CreateBlock()
                    .StrongText("Components:"))
                .UnorderedList(items)
                .Paragraph("— [Insert company name here]")
                .ToString();
            return body;
        }
        #endregion
    }
}
