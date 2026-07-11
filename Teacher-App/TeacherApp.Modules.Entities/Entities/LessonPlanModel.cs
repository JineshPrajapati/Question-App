using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{

    public enum SourceType { 
        Curriculum=1,
        LessonPlan=2,
        KnowledgeBase=3
    }
    public class LessonPlanModel : ScopeResponse
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? LessonFormat { get; set; }
        public string? Notes { get; set; }
        public string? Source { get; set; }
    }
}
