using TeacherApp.Modules.Account.ViewModels;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Entities.ViewModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Account.Repositories
{
    public interface IAccountRepository
    {
        Pagination GetUserList(Pagination pagination);
        Task<bool> AccountToggle(AccountToggleViewModel accountToggleVm);
        Task<IEnumerable<UserRoleViewModel>> GetUserRoles();
        Task<IEnumerable<string>> GetUserRolesName();
        Task<bool> AddNewUser(UserInputViewModel userInputVm);
        Task<bool> ValidateDuplicateAccountInfo(UserAccountValidateObject accountValidateObject);
        Task<RolesUserViewModel> GetUserRolesById(string userId);
        Task<bool> EditUserRoles(RolesUserViewModel rolesUserVm);
        Task ManageRoles(SelectOptionList roles);
        DataResponseEntity VerifyUser(UserVerifyEntity userToggleEntity);
        DataResponseEntity DeletePenddingApproval(DeletePendingApproval deletePendingApproval);
        DataResponseEntity GetAccessRights(GetAccessRightEntity accessRight);
    }
}
