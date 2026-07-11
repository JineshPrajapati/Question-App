using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Module.LessonPlan.Entities
{
    public class StructuredLessonPlan
    {
        public string Date { get; set; }
        public string Topic { get; set; }
        public List<string> Standards { get; set; }
        public List<string> Materials { get; set; }
        public List<string> Activities { get; set; }
        public List<string> Assessments { get; set; }
    }
}
