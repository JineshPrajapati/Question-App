using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Admin.Entities
{
    public class GradeEntity
    {
        public int SchoolId { get; set; }
        public int AcademicYearId { get; set; }
        public string Grades { get; set; }
        public int GradeId { get; set; }
        public int SchoolGradeId { get; set; }
        public string Value { get; set; }
        public string Label { get; set; }
        public bool IsDisabled { get; set; }
        public string SubjectJson { get; set; }
        public DateTime? EffectiveFrom {get; set;}
        public DateTime? EffectiveTo {get; set;}
        public string? UserId { get; set; }

    }

    public class SubjectEntity
    {
        public int? SchoolId { get; set; }
        public int? SchoolSubjectId { get; set; }
        public string? Value { get; set; }
        public string? Label { get; set; }
        public string? SubjectCode { get; set; }
        public bool? IsDefault { get; set; }
        public string? Subject { get; set; }
        public string? CreatedBy { get; set; }
    }

}
