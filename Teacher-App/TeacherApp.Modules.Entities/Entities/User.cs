using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;


namespace TeacherApp.Modules.Entities.Entities
{
    public class User : IdentityUser
    {
        public virtual ICollection<IdentityUserRole<string>> Roles { get; set; }

        public virtual ICollection<IdentityUserClaim<string>> Claims { get; set; }
    }
}
