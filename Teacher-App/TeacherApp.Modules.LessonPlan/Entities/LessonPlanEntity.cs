
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Module.LessonPlan.Entities
{
  
    public class LessonPlanEntity : ScopeRequest
    {
        public string? SchoolName { get; set; }
        public string? GradeName { get; set; }
        public string? Subject { get; set; }
        public string? Title { get; set; }
        public string? FileName { get; set; }
        public string? FileId { get; set; }
        public string? Content { get; set; }
        public string? FilePath { get; set; }
        public string? FileType { get; set; }      
        public string? Notes { get; set; }
        public int? TotalRecords { get; set; }
        public string? PeriodValue { get; set; }
        public DateTime? LessonDate { get; set; }
        public bool? IsActive { get; set; }
        public string? CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? PlannedLessonContent { get; set; }
        public bool? HolidayAdjusted { get; set; }       
        public string? Base64File { get; set; }
        public string? Source { get; set; }
 
    }
}
