using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace TeacherApp.Modules.Entities.Entities
{
    public class ApplicationRole : IdentityRole
    {
        public virtual ICollection<IdentityUserRole<string>> Users { get; set; }

        public virtual ICollection<IdentityRoleClaim<string>> Claims { get; set; }
    }
}
