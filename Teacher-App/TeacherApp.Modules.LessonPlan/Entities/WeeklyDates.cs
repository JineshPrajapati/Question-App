using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Module.LessonPlan.Entities
{
    public class WeeklyDates
    {
        public int? LessonPlanId { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public int? WeekNumber { get; set; }
        public DateTime? LessonDate { get; set; }
        public DateTime? WeekStartDate { get; set; }
        public DateTime? WeekEndDate { get; set; }
        public DateTime? MaxAvailableDate { get; set; }
        public int? CountLessonPlans { get; set; }
    }
}
