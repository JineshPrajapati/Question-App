using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Account.ViewModels
{
    public class AccessRightsModel
    {
        public string AccessRights { get; set; }
        public string RoutePath { get; set; }
        public string RoleId { get; set; }
    }
    public class GetAccessRightEntity
    {
        public string UserId { get; set; }
        public int SchoolId { get; set; }
    }
}
