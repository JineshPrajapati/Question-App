using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class ScopeResponse
    {
        public int? AcademicYearId { get; set; }
        public int? SchoolId { get; set; }
        public int? GradeId { get; set; }
        public int? SubjectId { get; set; }
        public string? AcademicYear { get; set; }
        public string? LessonFormat { get; set; }
        public string? District { get; set; }
        public string? State { get; set; }
        public string? School { get; set; }
        public string? Grade { get; set; }
        public string? Subject { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? LessonPlanId { get; set; }
        public string? User { get; set; }
        public string? RoleName { get; set; }
        public string? UserIdentityKey { get; set; }
        public int? FileId { get; set; }
        public int? WeekNumber { get; set; }
        public DateTime? LessonDate { get; set; }
        public DateTime? GradeStartDate { get; set; }
        public DateTime? GradeEndDate { get; set; }
        public DateTime? LastAvailableDate { get; set; }
        public DateTime? LessonPlanFromDate { get; set; }
        public DateTime? LessonPlanToDate { get; set; }
        public string? CreatedByUser { get; set; }
        public byte[]? ConsolidateContent { get; set; }
        public string? ContentAsString { get; set; }
        public string? PlannedLessonContent { get; set; }
        public string? YearlyLessonPlanJson { get; set; }
        public string? MonthlyLessonPlanJson { get; set; }
        public string? WeeklyLessonPlanJson { get; set; }
        public string? DailyLessonPlanJson { get; set; }
        public string? LessonPromptContent { get; set; }
        public string? GeneratedLessonContent { get; set; }
        public string? PeriodValue { get; set; }
        public string? RequestFrom { get; set; }
        public string? RequestTo { get; set; }
        public int? LessonPlanCreatedBy { get; set; }
        public List<GeneratedLessonPlanEntity> generatedLessonPlans { get; set; } = new();
        public List<YearlyLessonPlan>? LessonPlans { get;set;} = new();


    }
}
