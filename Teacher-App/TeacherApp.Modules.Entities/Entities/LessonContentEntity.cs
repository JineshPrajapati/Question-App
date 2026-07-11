using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class LessonContentEntity
    {
        public string Domain { get; set; }
        public string LessonTitle { get; set; }
        public List<string> Topics { get; set; }
        public List<string> Standards { get; set; }
        public int? TimePeriod { get; set; }
        public List<string> Assessments { get; set; }
        public List<string> Activities { get; set; }
        public List<string> Material { get; set; }
        public List<string> Objectives { get; set; }
    }
}
