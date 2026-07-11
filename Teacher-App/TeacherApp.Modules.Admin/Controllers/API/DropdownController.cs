using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/options/")]
    public class DropdownController : Controller
    {
        private readonly DropdownService _dropdownService;

        public DropdownController(                      
            DropdownService dropdownService)
        { 
          
            _dropdownService = dropdownService;
        }
     
        [HttpGet("{OptionGroup}")]
        public async Task<IActionResult> Get(string OptionGroup)
        {
           DropDownOptionsEntity result = new DropDownOptionsEntity();
            try
            {
                 result = _dropdownService.BindDropdownOptions(OptionGroup);

            }
            catch (Exception e)
            {
                result.IsSuccess = false;
                result.Message =Convert.ToString(e.Message);           
            }
            return Ok(result);

        }

        [HttpGet("Dropdown")]
        public IActionResult Get(DropdownMaster dropdown)
        {
            var roleList = _dropdownService.GetDropdownData(dropdown);

            return Ok(roleList);
        }

        [HttpGet("GetAllStandardSubjects")]
        public IActionResult Get()
        {
            var subjectMaster = _dropdownService.GetAllStandardSubjects();
            return Ok(subjectMaster);
        }

        [HttpGet("GetCustomDropDown")]
        public IActionResult GetCustomDropDown(CustomDropDown customDropDown)
        {
            var data = _dropdownService.GetCustomDropdown(customDropDown);
            return Ok(data);
        }

    }
}
