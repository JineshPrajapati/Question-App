using System.Collections.Generic;

namespace TeacherApp.Modules.Entities.Entities
{
    public class TokenResponse:BaseApiResponseEntity
    {
        public string AccessToken { get; set; }    
        public string RefreshToken { get; set; }
        public UserLoginDetailEntity User { get; set; }
        public List<UserAccessRightEntity> UserRights { get; set; }
    }
}
