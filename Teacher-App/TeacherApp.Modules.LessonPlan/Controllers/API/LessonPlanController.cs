using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using TeacherApp.Module.LessonPlan.Entities;
using TeacherApp.Module.LessonPlan.Services;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Controllers;



namespace TeacherApp.Module.LessonPlan.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/LessonPlan/")]
    public class LessonPlanController : BaseController
    {
        private readonly LessonPlanService _lessonPlanService;
        private readonly IConfiguration _configuration;

        public LessonPlanController(LessonPlanService lessonPlanService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _lessonPlanService = lessonPlanService;
            _configuration = configuration;
        }


        [HttpGet("List")]
        public IActionResult Index(LessonPlanPagination pagination)
        {
            var LessonPlanList = _lessonPlanService.GetLessonPlanList(pagination);
            return Ok(LessonPlanList);
        }


        [HttpPost("Create")]
        public IActionResult Create([FromBody] LessonPlanEntity lessonPlan)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (lessonPlan != null)
                {
                    int lessonPlanId = _lessonPlanService.SaveLessonPlan(lessonPlan);
                    response.IsSuccess = true;
                    response.Data = lessonPlanId;

                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return Ok(response);

        }

        [HttpPost("GenerateLessonPlan")]
        public async Task<IActionResult> GenerateLessonPlan([FromBody] LessonPlanEntity lessonPlan)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (lessonPlan != null)
                {    
                    response = await _lessonPlanService.PrepareLessonPlan(lessonPlan);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return Ok(response);

        }

        [HttpPost("GradeSubject")]
        public DataResponseEntity GradeSubject([FromBody] ScopeRequest dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    response = _lessonPlanService.GetGradeSubject(dto);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return response;

        }

        [HttpPost("GetPeriodListByLessonFormat")]
        public DataResponseEntity GetPeriodListByLessonFormat([FromBody] PeriodEntity dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    response = _lessonPlanService.GetPeriodListByLessonFormat(dto);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return response;

        }


        [HttpPost("GetWeekNumberForLessonPlan")]
        public DataResponseEntity GetWeekNumberForLessonPlan([FromBody] LessonPlanEntity dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    response = _lessonPlanService.GetWeekNumberForLessonPlan(dto);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return response;

        }


        [HttpPost("getLessonPlans")]
        public DataResponseEntity getLessonPlans([FromBody] ScopeRequest dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    response = _lessonPlanService.GetLessonPlanListFiltered(dto);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return response;

        }


        [HttpPost("getAvailableLessonPlans")]
        public DataResponseEntity GetAvailableLessonPlanList([FromBody] ScopeRequest dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    response = _lessonPlanService.GetAvailableLessonPlanList(dto);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return response;

        }


        [HttpPost("Update")]
        public IActionResult Update([FromBody] ScopeRequest dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    response= _lessonPlanService.UpdateLessonPlan(dto);
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }

            return Ok(response);

        }



    }
}
