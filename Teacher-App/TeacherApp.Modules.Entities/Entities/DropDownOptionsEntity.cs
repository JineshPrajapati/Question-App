using System.Collections.Generic;

namespace TeacherApp.Modules.Entities.Entities
{


    public class DropDownOptionsEntity : BaseApiResponseEntity
    {
        public List<OptionList> options { get; set; }
    }

    public class OptionList 
    {
        public string OptionGroup { get; set; }
        public string OptionLabel { get; set; }
        public string OptionValue { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class DropdownMaster
    {
        public string UserId { get; set; }
        public int MasterId { get; set; }
        public string Value { get; set; }
        public string Label { get; set; }
        public int? ChapterId { get; set; }
        public int? StandardId {get; set;}
	    public int? SubjectId {get; set;}
	    public int? MediumId { get; set;}
        public int? ChapterNumber { get; set; }

    }
   
    public class SubjectMaster
    {
        public int? GradeId { get; set; }
        public int? SchoolGradeId { get; set; }
        public string? SubjectIds { get; set; }
        public int? SubjectId { get; set; }
        public string? Subject { get; set; }
        public string? Value { get; set; }
        public string? Label { get; set; }
        public bool? IsDisabled { get; set; }
        public bool? IsDefault { get; set; }



    }
   

    public class StandardSubject
    {
        public int StandardId { get; set; }
        public string StandardName { get; set; }
        public int? MediumId { get; set; }
        public string Medium { get; set; }
        public int? StreamId { get; set; }
        public string Stream { get; set; }
        public int? SubjectId { get; set; }
        public string SubjectName { get; set; }
    }

    public class CustomDropDown
    {
        public string StandardIds {get; set;}
        public string SubjectIds {get; set;}
        public string ChepterIds {get; set;}
        public int MasterId { get; set; }
    }
}
