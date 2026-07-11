using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class ScopeRequest
    {
        public int? Id { get; set; }
        public int? AcademicYearId { get; set; }
        public int? LessonPlanId { get; set; }
        public string? SearchTerm { get; set; } 
        public int? WeekNumber { get; set; }
        public int? StateId { get; set; }
        public int? DistrictId { get; set; }    
        public int? SchoolId { get; set; }
        public int? GradeId { get; set; }
        public int? LessonPlanCreatedBy { get; set; }
        public int? SubjectId { get; set; }
        public string? UserId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? UserIdentityKey { get; set; }
        public string? LessonFormat { get; set; }
        public int? TeacherId { get; set; }    
        public string? AvailableLessonPlans
        { get; set; }


        public YearlyLessonPlan? YearlyLessonObj { get; set; } = new YearlyLessonPlan();
        public MonthlyLessonPlan? MonthlyLessonObj { get; set; } = new MonthlyLessonPlan();
        public WeeklyLessonPlan? WeeklyLessonObj { get; set; } = new WeeklyLessonPlan();
        public DailyLessonPlan? DailyLessonObj { get; set; } = new DailyLessonPlan();

    }
}
