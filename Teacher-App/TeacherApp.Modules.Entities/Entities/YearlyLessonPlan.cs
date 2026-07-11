using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class LessonPlanContent
    {
        public List<YearlyLessonPlan> LessonContent { get; set; } = new();
    }

    public class YearlyLessonPlan
    {
        public int? YearlyLessonPlanId {  get; set; }
        public string? Grading_Period { get; set; }
        public int? Index { get; set; }
        public string? Domain_Title { get; set; }
        public List<string>? Topics { get; set; }
        public List<string>? Standards { get; set; }
        public int? Weeks_Consider { get; set; }
        public string? Start_Date { get; set; }
        public string? End_Date { get; set; }
        public string? CreatedByUser { get; set; }
        public string? LessonContent { get; set; }

        public List<MonthlyLessonPlan>? MonthlyPlans { get; set; } = new();
    }
}
