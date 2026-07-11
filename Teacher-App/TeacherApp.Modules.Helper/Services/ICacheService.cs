using Microsoft.Extensions.Caching.Distributed;

namespace TeacherApp.Modules.Helper.Services
{
    public interface ICacheService : IDistributedCache
    {
    }
}
