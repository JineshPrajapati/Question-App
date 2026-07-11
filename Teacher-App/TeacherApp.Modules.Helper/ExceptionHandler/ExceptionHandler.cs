using TeacherApp.Modules.Email;
using Microsoft.Extensions.Options;
using Serilog;
using System;

namespace TeacherApp.Modules.Helper.ExceptionHandler
{
    public class ExceptionHandler : IExceptionHandler
    {
        private readonly IEmailSender _emailSender;
        private readonly IOptions<EmailSettings> _emailSetting;

        public ExceptionHandler(IEmailSender emailSender, IOptions<EmailSettings> emailSetting)
        {
            _emailSender = emailSender;
            _emailSetting = emailSetting;
        }


        public void HandleException(Exception exception)
        {
            var log = new LoggerConfiguration()
                .WriteTo.File("log.txt", outputTemplate: "{NewLine}[{Timestamp:HH:mm:ss}{Level:u3}]{NewLine}{Message}{NewLine}{Exception}{NewLine}-------------{NewLine}")
                .CreateLogger();

            log.Information($"{exception}\r\n");
        }
    }
}
