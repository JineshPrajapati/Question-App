using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class GeneratedLessonPlanEntity
    {
        public int? LessonPlanId { get; set; }
        public DateTime? Actual_Date { get; set; }
        public int? YearlyLessonPlanId { get; set; }
        public string? YearlyLessonContent { get; set; }
        public int? MonthlyLessonPlanId { get; set; }
        public string? MonthlyLessonContent { get; set; }
        public int? WeeklyLessonPlanId { get; set; }
        public string? WeeklyLessonContent { get; set; }
        public int? DailyLessonPlanId { get; set; }
        public string? DailyLessonContent { get; set; }


    }
}
