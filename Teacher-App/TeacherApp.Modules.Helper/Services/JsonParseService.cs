using Newtonsoft.Json.Linq;

namespace TeacherApp.Modules.Helper.Services
{
    public class JsonParseService<T> : IJsonParseService<T> where T : class
    {
        public T ToObject(string json)
        {
            return JObject.Parse(json).Root.ToObject<T>();
        }
    }
}
