using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Module.LessonPlan.Entities
{
    public  class GradeSubjectEntitiy
    {
       public int? GradeId { get; set; }
        public string? GradeName { get; set; }
        public int? LessonPlanFileId { get; set; }
        public int? SubjectId { get; set; }
        public DateTime? GradeStartDate { get; set; }
        public DateTime? GradeEndDate { get; set; }
        public string? Subject { get; set; }
    }
}
