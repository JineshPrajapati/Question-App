using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;
using Dapper;
using System.Data;
//using System.Management.Automation.Tracing;

namespace TeacherApp.Modules.Admin.Services
{
    public class ElaMathDataService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;


        public ElaMathDataService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination, IWebHostEnvironment environment, IConfiguration configuration)
        {
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _configuration = configuration;
            _environment = environment;
        }

       
        public int GetOrInsertAssessment(string name, string sheetName)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Name", name);
            parameters.Add("@SheetName", sheetName);
            parameters.Add("@AssessmentId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            _sqlRepository.Excute("GetOrInsertAssessment", parameters);
            return parameters.Get<int>("@AssessmentId");
        }
       
        public int GetOrInsertComponent(int assessmentId, string name)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@AssessmentId", assessmentId);
            parameters.Add("@Name", name);
            parameters.Add("@ComponentId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            _sqlRepository.Excute("GetOrInsertComponent", parameters);
            return parameters.Get<int>("@ComponentId");
        }

        public int GetOrInsertAssessmentPeriod(string name)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@Name", name);
            parameters.Add("@PeriodId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            _sqlRepository.Excute("GetOrInsertAssessmentPeriod", parameters);
            return parameters.Get<int>("@PeriodId");
        }
        
        public int GetOrInsertPeriodSub(int periodId, string value)
        {
            var parameters = new DynamicParameters();
            parameters.Add("@PeriodId", periodId);
            parameters.Add("@Value", value);
            parameters.Add("@SubPeriodId", dbType: DbType.Int32, direction: ParameterDirection.Output);

            _sqlRepository.Excute("GetOrInsertPeriodSub", parameters);
            return parameters.Get<int>("@SubPeriodId");
        }
       

        public DataResponseEntity InsertScore(string InsertScoresFromJson, int SchoolId, int gradeId, int acadedimicYearId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@ScoresJson", InsertScoresFromJson);
                sqlParameter.Add("@SchoolId", SchoolId);
                //sqlParameter.Add("@GradeId", gradeId);
                sqlParameter.Add("@AcademicYearId", acadedimicYearId);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("InsertScoresFromJson", sqlParameter);
                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        public DataResponseEntity InsertStudentDashboardData(int schoolId, string InsertStudentsFromJson, int gradeId, int acadedimicYearId, string userId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@SchoolId", schoolId);
                sqlParameter.Add("@StudentJson", InsertStudentsFromJson);
                sqlParameter.Add("@GradeId", gradeId);
                sqlParameter.Add("@AcademicYearId", acadedimicYearId);
                sqlParameter.Add("@CreatedBy", userId);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                 response = _sqlRepository.Get<DataResponseEntity>("InsertStudentDashboardFromJson", sqlParameter);
                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");
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
