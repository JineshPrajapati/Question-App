using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Module.LessonPlan.Helper
{
    public class BatchProcessor
    {
        public static string BuildPrompt(List<string> blocks)
        {
            var sb = new StringBuilder();
            sb.AppendLine("You are an expert curriculum extraction and structuring assistant.");
            sb.AppendLine("You will be provided with multiple curriculum blocks of text, each representing a standard, lesson, unit, or chapter.");
            sb.AppendLine("Extract each block into an object with these C# property names:");
            sb.AppendLine("Grade, Subject, Source, Domain_Title, Lesson_Number, Lesson_Title, Topics[], Standards[], Standard, Standards_Details, Standards_Activities[], Standards_Assessments[], Standards_Materials[], Standards_Anticipatory_Set, Standards_Objective_Purpose, Standards_Input[], Standards_Model[], Check_for_Understanding[], Guided_Practice[], Closure[], Independent_Practice[].");
            sb.AppendLine("If missing, use \"\" for strings or [] for arrays. Return only a valid JSON array, no extra text.");
            sb.AppendLine();
            for (int i = 0; i < blocks.Count; i++)
            {
                sb.AppendLine($"BLOCK {i + 1}:\n{blocks[i]}\n");
            }
            return sb.ToString();
        }
    }
}
