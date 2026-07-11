namespace TeacherApp.Modules.Entities.Entities
{
    public class FileEntity
    {
        public int FileId { get; set; }
        public string FileIdentityId { get; set; }
        public string FileName { get; set; }
        public string? ConsolidatedFilePath { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedDate { get; set; }
    }
}
