using TeacherApp.Modules.Entities.Enums;

namespace TeacherApp.Modules.Entities.Entities
{
    public class Settings : BaseEntity
    {
        public string Value { get; set; }
        public SettingKey SettingKey { get; set; }
    }
}