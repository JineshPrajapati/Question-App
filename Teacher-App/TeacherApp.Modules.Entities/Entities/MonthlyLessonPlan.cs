using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class MonthlyLessonPlan
    {
        public int? MonthlyLessonPlanId { get; set; }

        public int? YearlyLessonPlanId { get; set; }

        public string? CreatedByUser { get; set; }
        public string? Month { get; set; }
        public int? Index { get; set; }
        public string? Domain_Title { get; set; }
        public List<string>? Topics { get; set; }
        public List<string>? Standards { get; set; }
        public List<string>? Activities { get; set; }
        public List<string>? Assessments { get; set; }
        public string? Start_Date { get; set; }
        public string? End_Date { get; set; }

        public string? LessonContent { get; set; }
        public List<WeeklyLessonPlan>? WeeklyPlans { get; set; } = new();
    }
}
