using System;

namespace TeacherApp.Modules.Entities.Entities
{
    public class UserLoginDetailEntity
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleId { get; set; }
        public string RoleName { get; set; }
        public string UserCode { get; set; }
        public string EmailAddress { get; set; }
        public string UserType { get; set; }
        public int UserTypeId { get; set; }
        public string ProfilePicturePath { get; set; }
        public int? UserInternalId { get; set; }
        public string UserId { get; set; }
        public string PhoneNumber { get; set; }
        public string EmergencyContactName { get; set; }
        public string EmergencyContactPhone { get; set; }
        public DateTime? DateofBirth { get; set; }
        public bool IsActive { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public string? FileIdentityId { get; set; }
        public string? ThreadId { get; set; }
        public int? StateId { get; set; }
        public string? StateName { get; set; }
        public int? DistrictId { get; set; }
        public string? DistrictName { get; set; }
        public string? SchoolName { get; set; }
        public int? SchoolId { get; set; }
        public string? AcademicYear { get; set; }
        public int? AcademicYearId { get; set; }
        public string? Source { get; set; }

        public string? ContentString { get; set; }

    }
}
