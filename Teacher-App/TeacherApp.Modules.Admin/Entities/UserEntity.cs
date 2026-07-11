using System;

namespace TeacherApp.Modules.Admin.Entities
{
    public class UserEntity
    {
        public string UserId { get; set; }     
        public string UserCode { get; set; } = "";
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string UserType { get; set; } = "";
        public int UserTypeId { get; set; } 
        public int RoleId { get; set; }
        public string RoleIdentityId { get; set; }
        public string SchoolIds { get; set; }
        public string CurrentSchoolId { get; set; }
        public bool IsActive { get; set; }
        public DateTime RegistrationDate { get; set; }
        
        //public string PhoneNumber { get; set; } = "";
        //public DateTime DateofBirth { get; set; }

        public string Gender { get; set; } = "";

        //public string Address { get; set; } = "";
        public int CityId { get; set; }
        public int StateId { get; set; }
        public int DistrictId { get; set; }
        public string ZipCode { get; set; }
        
        //public string Country { get; set; }
        //public string EmergencyContactName { get; set; } = "";
        //public string EmergencyContactPhone { get; set; } = "";
        
        public string ProfilePicturePath { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedIdentityBy { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class ProfilePictureEntity
    {
        public string UserId { get; set; }
        public string ImagePath { get; set; }
        public string ImageName { get; set; }
        public string ImageExtension { get; set; }
        public string Base64Image { get; set; }
    }
    public class UserFacility
    {
        public int UserId { get; set; }
        public int FacilityId { get; set; }
        public string FacilityCode { get; set; }
        public string Title { get; set; }

    }

    public class DeleteEntity
    {
        public int Id { get; set; }
        public bool IsDelete { get; set; }
        public string CreatedIdentityBy { get; set; }
        public string? RoleIdentityId { get; set; }
        public string? UserIdentityId { get; set; }

    }
    public class UpdateStatusEntity
    {
        public int Id { get; set; }
        public bool IsActive { get; set; }
        public int Status { get; set; }
        public string CreatedBy { get; set; }
        public string RoleIdentityId { get; set; }
        public string UserIdentityId { get; set; }
        public string Note { get; set; }

    }
}
