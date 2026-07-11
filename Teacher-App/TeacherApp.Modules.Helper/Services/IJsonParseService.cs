namespace TeacherApp.Modules.Helper.Services
{
    public interface IJsonParseService<T> where T : class
    {
        T ToObject(string json);
    }
}
