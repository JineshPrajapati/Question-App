namespace TeacherApp.Modules.Entities.Entities
{
    public class UserAccessRightEntity
    {
        public int AccessRightsId { get; set; }
        public string ModuleName { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; }
        public int RightId { get; set; }
        public int DisplayOrder { get; set; }
        public string RoutePath { get; set; }


    }
}
