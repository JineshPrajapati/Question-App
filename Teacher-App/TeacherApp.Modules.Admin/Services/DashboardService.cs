using Dapper;
using DocumentFormat.OpenXml.Office.CustomUI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Admin.Services
{
    public class DashboardService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;


        public DashboardService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination, IWebHostEnvironment environment, IConfiguration configuration)
        {
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _configuration = configuration;
            _environment = environment;
        }

        public DataResponseEntity GetDashboardData(int schoolId, int academicYearId, string userId)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@SchoolId", schoolId);
                sqlParameter.Add("@UserId", userId);
                sqlParameter.Add("@AcademicYearId", academicYearId);
                
                var data = _sqlRepository.Get<DashboardEntity>("GetDashboardData", sqlParameter);
                response.Data = data;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        public DataResponseEntity GetLessonPlanDashboardData(int schoolId, int academicYearId)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@SchoolId", schoolId);
                sqlParameter.Add("@AcademicYearId", academicYearId);

                var data = _sqlRepository.Get<LessonplanDashboardEntity>("GetLessonplanDashboard", sqlParameter);
                response.Data = data;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        public DataResponseEntity GetExportDailyLessonPlanData(int dailyLessonPlanId)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@DailyLessonPlanId", dailyLessonPlanId);

                var data = _sqlRepository.Get<ExportDailyLessonplanEntity>("GetExportDailyLessonplan", sqlParameter);
                response.Data = data;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        public DataResponseEntity GetLessonPlanPercentage(int stateId, int districtId, int schoolId, int gradeId)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@stateId", stateId);
                sqlParameter.Add("@districtId", districtId);
                sqlParameter.Add("@SchoolId", schoolId);
                sqlParameter.Add("@gradeId", gradeId);

                var data = _sqlRepository.Get<LessonPlanPercentageEntity>("GetLessonPlanPercentage", sqlParameter);
                response.Data = data;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }
    }
}
