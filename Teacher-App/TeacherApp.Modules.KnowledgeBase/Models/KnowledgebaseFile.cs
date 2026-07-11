namespace TeacherApp.Modules.KnowledgeBase.Models
{
    public class KnowledgebaseFile
    {

        public int? AcademicYearId { get; set; }
        public int? SchoolId { get; set; }
        public string Base64File { get; set; }
        public string?  Grade { get; set; }
        public string? Subject { get; set; }
        public string? Title { get; set; }
        public string FilePath { get; set; }

        public string? source { get; set; }
    }
}
