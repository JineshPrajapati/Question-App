using System;

namespace TeacherApp.Modules.Account.ViewModels
{
    public class AccountViewModel
    {
        //public string UserId { get; set; }
        //public string UserName { get; set; }
        //public string Email { get; set; }
        //public bool EmailConfirmed { get; set; }
        //public string Roles { get; set; }

        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserCode { get; set; }
        public string Email { get; set; }
        public string? UserType { get; set; }
        public string RoleName { get; set; }

        public string Gender { get; set; }
        public string SchoolIds { get; set; }
        public string ProfilePicturePath { get; set; }
        public bool IsActive { get; set; }
        public int TotalRecords { get; set; }
        public Int64 RowNum { get; set; }

        public DateTime? ContractStartDate { get; set; }

        public DateTime? ContractEndDate { get; set; }

        public string PreferedShiftIds { get; set; }
        public DateTime CreatedDate { get; set; }



    }
}
