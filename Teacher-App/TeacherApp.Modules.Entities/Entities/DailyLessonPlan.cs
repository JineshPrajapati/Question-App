using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    public class DailyLessonPlan
    {
        public int? DailyLessonPlanId { get; set; }

        public int? WeeklyLessonPlanId { get; set; }

        public string? CreatedByUser { get; set; }
        public string? Day { get; set; }
        public int? Index { get; set; }
        public string? Lesson_Title { get; set; }
        public List<string>? Objectives { get; set; }
        public List<string>? Materials_Resources_Needed { get; set; }
        public string? Anticipatory_Set { get; set; }
        public string? Objective_Purpose { get; set; }
        public string? Input { get; set; }
        public string? Model { get; set; }
        public string? Check_for_Understanding { get; set; }
        public string? Guided_Practice { get; set; }
        public string? Closure { get; set; }
        public string? Independent_Practice { get; set; }
        public string? Actual_Date { get; set; }
        public string? LessonContent { get; set; }

    }
}
