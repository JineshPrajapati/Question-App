using Dapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Enum;
using TeacherApp.Modules.Helper.Extensions;

namespace TeacherApp.Modules.Admin.Services
{
    public class SettingsService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public SettingsService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination, IWebHostEnvironment environment, IConfiguration configuration)
        {
            //_dbContext = dbContext;
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _configuration = configuration;
            _environment = environment;
        }

        public DataResponseEntity AddUpdateGrade(Entities.GradeEntity gradeEntity)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@SchoolId", gradeEntity.SchoolId);
                sqlParameter.Add("@Grades", gradeEntity.Grades);
                sqlParameter.Add("@AcademicYearId", gradeEntity.AcademicYearId);
                sqlParameter.Add("@EffectiveFrom", gradeEntity.EffectiveFrom);
                sqlParameter.Add("@EffectiveTo", gradeEntity.EffectiveTo);
                sqlParameter.Add("@UserIdentityKey", gradeEntity.UserId);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("AddUpdateGradeToSchool", sqlParameter);
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

        public DataResponseEntity AddSubjectToMaster(SubjectMaster gradeEntity)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {

                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@Subject", gradeEntity.Subject);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("AddSubjectToMaster", sqlParameter);
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

        public DataResponseEntity AddUpdateSubject(SubjectMaster gradeEntity)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {

                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@SchoolGradeId", gradeEntity.SchoolGradeId);
                sqlParameter.Add("@SubjectIds", gradeEntity.SubjectIds);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("AddUpdateSubjectToGrade", sqlParameter);
                response.IsSuccess = sqlParameter.Get<bool>("IsSuccess");
                response.Message = sqlParameter.Get<string>("Message");
                //return _dbContext.Database.SqlQueryRaw<ApiResponseEntity>("EXEC UpdateUserProfile @UserId, @FirstName, @LastName, @PhoneNumber, @DateofBirth, @Address, @EmergencyContactName, @EmergencyContactPhone", sqlParameter).AsEnumerable().FirstOrDefault();

            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }

        public DataResponseEntity GetSchoolGradeSubjectDetails(GradeEntity dropdown)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@SchoolId", dropdown.SchoolId);
                sqlParameter.Add("@AcademicYearId", dropdown.AcademicYearId);
                var data = _sqlRepository.Get<GradeEntity>("GetSchoolGrades", sqlParameter);
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

        public DataResponseEntity DeleteGrade(DeleteEntity deleteGrade)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@SchoolGradeId", deleteGrade.Id);
                sqlParameter.Add("@IsDelete", deleteGrade.IsDelete);
                sqlParameter.Add("@CreatedBy", deleteGrade.CreatedIdentityBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("DeleteGrades", sqlParameter);

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

        public DataResponseEntity DeleteSubjectFromGrade(int id)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@SchoolGradeSubjectId", id);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("DeleteSchoolGradeSubject", sqlParameter);

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

        public DataResponseEntity GetSchoolSubjects(SubjectEntity subject)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@SchoolId", subject.SchoolId);
                //sqlParameter.Add("@AcademicYearId", dropdown.AcademicYearId);
                var data = _sqlRepository.Get<SubjectEntity>("GetAllSubjects", sqlParameter);
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
        
        public DataResponseEntity AddUpdateSubjectToSchool(SubjectEntity subject)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {

                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@SchoolSubjectId", subject.SchoolSubjectId);
                sqlParameter.Add("@SchoolId", subject.SchoolId);
                sqlParameter.Add("@SubjectName", subject.Subject);
                sqlParameter.Add("@SubjectCode", subject.SubjectCode);
                sqlParameter.Add("@CreatedBy", subject.CreatedBy);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("AddUpdateSchoolOtherSubjects", sqlParameter);
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

        public DataResponseEntity DeleteSubjectFromSchool(int id)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@SchoolSubjectId", id);
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("DeleteSubjectFromSchool", sqlParameter);

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
