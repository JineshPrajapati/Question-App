using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Module.LessonPlan.Entities
{
    public class ChapterSummary : ScopeRequest
    {
        public string? ChapterNo { get; set; }
        public string? Title { get; set; }
        public string? FileName { get; set; }
        public string? Content { get; set; }
        public int? PageStart { get; set; }
        public int? PageEnd { get; set; }
        public string? MetaData { get; set; }      
    }
}
