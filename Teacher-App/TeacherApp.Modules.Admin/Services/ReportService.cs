using Dapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Admin.Services
{
    public class ReportService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;


        public ReportService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination, IWebHostEnvironment environment, IConfiguration configuration)
        {
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _configuration = configuration;
            _environment = environment;
        }

        public DataResponseEntity GetStudentReportById(string studentId, int gradeId, int academicYearId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@StudentId", studentId);
                sqlParameter.Add("@AcademicYearId", academicYearId);

                var data = _sqlRepository.Get<Entities.PTConferenceReport>("GetStudentPTConferenceReport", sqlParameter);

                response.Data = data.Data;
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
