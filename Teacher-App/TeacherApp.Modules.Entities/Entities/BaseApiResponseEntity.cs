namespace TeacherApp.Modules.Entities.Entities
{
    public class BaseApiResponseEntity
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }

        public BaseApiResponseEntity()
        {
            IsSuccess = true; 
            Message = string.Empty;  
        }
    }
}
