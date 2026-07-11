using Newtonsoft.Json;

namespace TeacherApp.Modules.Entities.Entities
{
    public class PythonAPIResponse
    {
        [JsonProperty("status")]
        public int Status { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("is_error")]
        public bool IsError { get; set; }
    }
}
