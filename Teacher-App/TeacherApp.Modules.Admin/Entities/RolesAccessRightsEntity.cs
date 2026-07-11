using System.Collections.Generic;

namespace TeacherApp.Modules.Admin.Entities
{

    public class AccessRightList {

        public string ModuleName { get; set; }
        public int? DisplayOrder { get; set; }
        public int? ModuleDisplayOrder { get; set; }
        public string Description { get; set; }
        public int AccessRightsId { get; set; }
        public string RightName { get; set; }
        public bool? CanAccess { get; set; }
        public string UserType { get; set; }
    }


    public class RolesAccessRightsEntity
    {
        public string ModuleName { get; set; }
        public List<AccessRight> Rights { get; set; }
        public RolesAccessRightsEntity()
        {
            Rights = new List<AccessRight>(); ;
        }

        public int? Id { get; set; }
        public int? DisplayOrder { get; set; }
        public int? ModuleDisplayOrder { get; set; }
        public string Description { get; set; }
    }


    public class AccessRight {

        public int AccessRightsId { get; set; }
        public string RightName { get; set; }
        public bool? CanAccess { get; set; }

    }






}
