using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Admin.Entities
{
    public class ReportEntity
    {
    }
    public class PTConferenceReport
    {
        public string StudentId { get; set; }
        public string StudentName { get; set; }

        public string? sheetname { get; set; }
        public string? Assessment { get; set; }
        public string? Component { get; set; }

        public string? F_score { get; set; }
        public string? W_score { get; set; }
        public string? S_score { get; set; }

        public string? ParentName { get; set; }
        public string? EmailAddress { get; set; }
        public string? Phonenumber { get; set; }
        //public string? AssessmentPeriod { get; set; }
        //public string? PeriodSub { get; set; }
        //public string ScoreValue { get; set; }
    }

    public class AddNote
    {
        public int StudentId { get; set; }
        public string? Note { get; set; }
        public string? ConferenceType { get; set; }

    }
}
