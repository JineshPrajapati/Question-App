using Microsoft.Extensions.DependencyInjection;

namespace TeacherApp.Infrastructure.Module
{
    public interface IModuleInitializer
    {
        void Init(IServiceCollection serviceCollection);
    }
}
