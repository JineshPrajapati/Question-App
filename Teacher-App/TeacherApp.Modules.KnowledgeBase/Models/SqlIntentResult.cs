using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.KnowledgeBase.Models
{

    public class SqlIntentResult
    {
        public string Operation { get; set; } = "UNKNOWN";
        public List<string> Aggregates { get; set; } = new();
        public List<string> Tables { get; set; } = new();
        public List<string> Columns { get; set; } = new();
        public List<string> Conditions { get; set; } = new();
        public string SqlQuery { get; set; } = "";
        public bool RequiresAI { get; set; } = false;
        public List<string> AnalyticsFunctions { get; set; } = new();
        public string RoleFilter { get; set; } = "";
    }
}
