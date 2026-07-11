using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Module.LessonPlan.Entities
{
    public class PeriodEntity
    {

        public int? WeekNumber { get; set; }
        public int? AcademicYearId { get; set; }
        public int? SchoolId { get; set; }
        public string? LessonFormat { get; set; }
        public string? PeriodType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }        
        public string? UserId { get; set; }
        public string? PeriodValue { get; set; }
        public string? DisplayText { get; set; }
    }
}
