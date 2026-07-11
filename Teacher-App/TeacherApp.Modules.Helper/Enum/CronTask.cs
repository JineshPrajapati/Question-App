namespace TeacherApp.Modules.Helper.Enum
{
    public static class CronExpression
    {
        public static readonly string EveryMinute = "0 * * * * *";
        public static readonly string EveryDay = "0 0 0 * * *";
        public static readonly string EveryWeek = "0 0 * * 0";
        public static readonly string EveryWeekend = "0 0 0 * * 6,0";
    }
}
