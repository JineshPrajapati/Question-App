namespace TeacherApp.Modules.Entities.Entities
{
    public class DataResponseEntity
    {
        public dynamic Data { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        //public Dictionary<string,string> OutputParams { get; set; }
    }
}
