using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Entities.Entities
{
    internal class QuestionEntity
    {
    }
    public class QuestionDetails
    {
        public string Subject { get; set; } = "";          // optional; you can fill manually
        public string Chapter { get; set; } = "";          // optional
        public string QuestionType { get; set; } = "";     // optional

        public string QuestionText { get; set; } = "";
        public string? QuestionImagePath { get; set; }

        public string? SolutionText { get; set; }
        public string? SolutionImagePath { get; set; }

        public string Answer { get; set; } = "";
        public int DifficultyLevel { get; set; } = 1;
        public int Marks { get; set; } = 1;
    }

    public class QuestionOption
    {
        public string OptionText { get; set; } = "";
        public string? OptionImagePath { get; set; }
        public bool IsCorrect { get; set; }
    }

    public class QuestionJson
    {
        public QuestionDetails QuestionDetails { get; set; } = new();
        public List<QuestionOption> OptionDetails { get; set; } = new();
    }
}
