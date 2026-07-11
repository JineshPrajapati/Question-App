using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Helper.Controllers;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/Dashboard/")]
    public class DashboardController : BaseController
    {
        private readonly Services.DashboardService _dashboardService;

        public DashboardController(Services.DashboardService dashboardService
            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("{schoolId}/{currSelectedAcademicYear}/{userId}")]
        public IActionResult Index(int schoolId, int currSelectedAcademicYear, string userId)
        {
            var dashboardData = _dashboardService.GetDashboardData(schoolId, currSelectedAcademicYear, userId);
            return Ok(dashboardData);
        }

        [HttpGet("{schoolId}/{currSelectedAcademicYear}")]
        public IActionResult Get(int schoolId, int currSelectedAcademicYear)
        {
            var LessonPlanDashboardData = _dashboardService.GetLessonPlanDashboardData(schoolId, currSelectedAcademicYear);
            return Ok(LessonPlanDashboardData);
        }

        [HttpGet("{StateId}/{districtId}/{schoolId}/{gradeId}")]
        public IActionResult Get(int stateId,int districtId,int schoolId, int gradeId)
        {
            var LessonPlanDashboardData = _dashboardService.GetLessonPlanPercentage(stateId,districtId,schoolId, gradeId);
            return Ok(LessonPlanDashboardData);
        }

        [HttpGet("{dailyLessonPlanId}")]
        public IActionResult Get(int dailyLessonPlanId)
        {
            var LessonPlanDashboardData = _dashboardService.GetExportDailyLessonPlanData(dailyLessonPlanId);
            return Ok(LessonPlanDashboardData);
        }
    }
}
