using System;

namespace TeacherApp.Modules.Entities.Entities
{
    public class KnowledgebaseEntity
    {
        public int GradeId { get; set; }
        public int? AcademicYearId { get; set; }
        public string Grade { get; set; }
        public int SubjectId { get; set; }
        public string Subject { get; set; }
        public string KnowledgebaseCode { get; set; }
        public int KnowledgebaseId { get; set; }
        public string CreatedBy { get; set; }
        public int? SchoolId { get; set; }
        public bool IsActive { get; set; }
        public string FileName { get; set; }
        public string FileStatus { get; set; }
        public int FileType { get; set; }
        public int FileTypeId { get; set; }
        public string StorePath { get; set; }
        public string Base64File { get; set; }
        public string CreatedIdentityBy { get; set; }
        public int? TotalRecords { get; set; }
        public long? RowNum { get; set; }
        public string Heading { get; set; }
    }
    public class DeleteKnowledgebaseEntity
    {
        public int KnowledgebaseId { get; set; }
        public int SchoolId { get; set; }
        public string StorePath { get; set; }
        public string FileName { get; set; }
        public bool IsDelete { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; }

        public string CreatedIdentityBy { get; set; }

    }

    public class CreateKnowledgebaseEntity
    {
        public int KnowledgebaseId { get; set; }
        public string FileName { get; set; }
        public string VectoreStoreName { get; set; }
        public string FileIdentityId { get; set; }
        public int SchoolId { get; set; }
        public int GradeId { get; set; }
        public int SubjectId { get; set; }
        public string FilePath { get; set; }

    }
}