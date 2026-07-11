using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Admin.Entities
{
    public class AddQuestionEntity
    {
        public int StreamId { get; set; }
        public int MediumId { get; set; }
        public int STandardId { get; set; }
        public int SubjectId { get; set; }
        public int ChapterId { get; set; }
        public int TopicId { get; set; }

        public string Stream { get; set; }
        public string Medium { get; set; }
        public string Standard { get; set; }
        public string Subject { get; set; }
        public string Chapter { get; set; }
        public string Topic { get; set; }

    }

    //public class QuestionModel
    //{
    //    public string QuestionNumber { get; set; }
    //    public string Question { get; set; }
    //    public string Image { get; set; } // base64 string or null
    //    public Dictionary<string, string> Options { get; set; } // keys: "A","B","C","D"
    //    public string CorrectOption { get; set; }
    //    public string Solution { get; set; }
    //}


    //public class QuestionModel
    //{
    //    public int QuestionNumber { get; set; }
    //    public string Question { get; set; }

    //    public List<ImageData> QuestionImages { get; set; } = new();
    //    public Dictionary<string, string> Options { get; set; } = new();
    //    public Dictionary<string, List<ImageData>> OptionImages { get; set; } = new();

    //    public string CorrectOption { get; set; }
    //    public string Solution { get; set; }
    //    public List<ImageData> SolutionImages { get; set; } = new();
    //}

    //public class ImageData
    //{
    //    public string Description { get; set; }
    //    public string Base64 { get; set; }
    //}

    public class QuestionModel
    {
        public int QuestionNumber { get; set; }
        public string Question { get; set; }
        public List<ImageData> QuestionImages { get; set; } = new();

        public List<OptionModel> Options { get; set; } = new();

        public string CorrectOption { get; set; }
        public string Solution { get; set; }
        public List<ImageData> SolutionImages { get; set; } = new();
    }

    public class OptionModel
    {
        public string Label { get; set; }        // "A", "B", "C", "D"
        public string Text { get; set; }         // "2Ω resistor"
        public List<ImageData> Images { get; set; } = new();
    }

    public class ImageData
    {
        public string Description { get; set; }
        public string Base64 { get; set; }
    }


    //public class QuestionPagination
    //{
    //    public long TopicId { get; set; }
    //    public string? SortBy { get; set; }
    //    public int PageSize { get; set; }
    //    public int PageNumber { get; set; }
    //    public string? SortDirection { get; set; }
    //}

    public class Questions
    {
        public long TopicId { get; set; }
        public long QuestionId { get; set; }
        public string? QuestionText { get; set; }
        public string? QuestionImage { get; set; }
        public string? SolutionText { get; set; }
        public string? SolutionImage { get; set; }
        public string? GroupHeader{get; set;}
        public string? ChapterName{get; set;}
        public long ChapterId{get; set;}
        public string? TopicName { get; set; }
        public string? Options { get; set; }
        public string? UploadPath { get; set; }
        public int Marks { get; set; }
        public int DifficultyLevel { get; set; }
        public int TotalRecords { get; set; }
        public int RowNum { get; set; }
    }
}
