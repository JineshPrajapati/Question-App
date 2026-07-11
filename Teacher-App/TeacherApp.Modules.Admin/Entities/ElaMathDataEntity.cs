using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Admin.Entities
{
    public class ElaMathDataEntity
    {
    }
    public class ReadingDataRow
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string StudentNumber { get; set; }
        public string RIMP { get; set; }
        public string SheetName { get; set; }
        // Other properties dynamically created from composite headers
        public Dictionary<string, string> Scores { get; set; } = new Dictionary<string, string>();
    }
    public class ScoreJsonRow
    {
        public string StudentNumber { get; set; }
        public int ComponentId { get; set; }
        public int? SubPeriodId { get; set; }
        public string ScoreValue { get; set; }
    }

    public class LookupEntity
    {
        public string Name { get; set; }
        public int Id { get; set; }
    }

    public class StudentDashboardRow : ReadingDataRow
    {
        public string MedicalConcerns { get; set; }
        public string FinalForms { get; set; }
        public string FreeReduced { get; set; }
        public string PowerPacks { get; set; }
        public string SupplyFee { get; set; }
        public string Fundraiser { get; set; }
        public string Buyout { get; set; }
        public string IAT { get; set; }
        public string Notes { get; set; }
        public string PreK { get; set; }
        public string Pre1st { get; set; }
        public string KRIMP { get; set; }
        public string FirstGradeRIMP { get; set; }
        public string TitleServices { get; set; }
    }
}
