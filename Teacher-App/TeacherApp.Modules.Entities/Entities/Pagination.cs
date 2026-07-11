using System;
using System.ComponentModel.DataAnnotations;

namespace TeacherApp.Modules.Entities.Entities
{
    public class Pagination
    {
        public dynamic Data { get; set; }
        public int ActiveOnly { get; set; }
        public string? Search { get; set; }
        
        [Required]
        public int PageNumber { get; set; } = 1;
        public int? TotalRecords { get; set; } = 0;
        
        [Required]
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; }
        public string SortDirection { get; set; } = "ASC";
        public bool IsSuccess { get; set; }
        public string? Message { get; set; }
        public string? UserId { get; set; }
        public string? TopicIds { get; set; }
    }




}
