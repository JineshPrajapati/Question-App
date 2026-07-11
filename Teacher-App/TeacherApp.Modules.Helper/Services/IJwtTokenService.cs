using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Helper.Services
{
    public interface IJwtTokenService
    {
        TokenResponse GenerateToken(User user, string roles = "");
    }
}
