using AutoMapper;
using TeacherApp.Modules.Account.ViewModels;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Entities.ViewModel;
using Microsoft.AspNetCore.Identity;

namespace TeacherApp.Modules.Mapper
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, AccountViewModel>(MemberList.None).ReverseMap();
            CreateMap<User, UserViewModel>(MemberList.None).ReverseMap();
            CreateMap<IdentityRole, UserRoleViewModel>(MemberList.None).
                ForMember(x => x.Id, opt => opt.MapFrom(y => y.Id))
                .ForMember(x => x.Name, opt => opt.MapFrom(y => y.Name)).ReverseMap();
        }
    }
}
