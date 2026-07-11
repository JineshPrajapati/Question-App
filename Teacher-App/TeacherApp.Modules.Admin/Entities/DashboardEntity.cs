using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Admin.Entities
{
    public class DashboardEntity
    {
        public string DataJson { get; set; }
    }

    public class LessonplanDashboardEntity
    {
        public int UserId {get; set;}
        public string TeacherName {get; set;}
        public DateTime? Date {get; set;}
        public int GradeId {get; set;}
        public string GradeName {get; set;}
        public string Subject {get; set;}
        public int LessonPlanCount {get; set;}
        public int DailyLessonPlanId { get; set;}
        public int GradeLessonPlanCount {get; set;}
        public int TotalLessonPlans { get; set; }
    }

    public class LessonPlanPercentageEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public float LessonPlanPercentage { get; set; }
    }

    public class ExportDailyLessonplanEntity
    {
        public int DailyLessonPlanId { get; set; }
        public string SchoolName { get; set; }
        public string SchoolCode { get; set; }
        public string AcademicYear { get; set; }
        public DateTime? ActualDate { get; set; }
        public string LessonContent { get; set; }
        public string Subject { get; set; }
        public string GradeName { get; set; }
        public string UserName { get; set; }
        public string UnitTitle { get; set; }
    }
}
