using System;

namespace TeacherApp.Modules.Helper.ExceptionHandler
{
    public interface IExceptionHandler
    {
        void HandleException(Exception exception);
    }
}
