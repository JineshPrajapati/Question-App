
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Data;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using TeacherApp.Module.LessonPlan.Entities;
using TeacherApp.Modules.Entities.Data;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.KnowledgeBase.Helper;
using TeacherApp.Modules.KnowledgeBase.Services;

namespace TeacherApp.Module.LessonPlan.Services
{
    public class LessonPlanService
    {

        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly QdrantService _qdrantService;
        private readonly RecursiveLessonPlanGenerator _lessonPlanGenerator;
        private readonly PaginationRepository _pagination;
        private readonly IConfiguration _configuration;

        public LessonPlanService(SQLQueryExecutionRepository sqlRepository, ApplicationDbContext context, QdrantService qdrantService, RecursiveLessonPlanGenerator lessonPlanGenerator, PaginationRepository pagination, IConfiguration configuration)
        {
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _qdrantService = qdrantService;
            _lessonPlanGenerator = lessonPlanGenerator;
            _configuration = configuration;
        }

        public LessonPlanPagination GetLessonPlanList(LessonPlanPagination pagination)
        {
            var parameters = new DynamicParameters();
            try
            {

                parameters.Add("@ActiveOnly", pagination.ActiveOnly);
                parameters.Add("@SearchTerm", pagination.Search);
                parameters.Add("@PageNumber", pagination.PageNumber);
                parameters.Add("@PageSize", pagination.PageSize);
                parameters.Add("@SortBy", pagination.SortBy);
                parameters.Add("@SortDirection", pagination.SortDirection);
                parameters.Add("@SchoolId", pagination.SchoolId);
                parameters.Add("@GradeIds", pagination.GradeIds);
                parameters.Add("@SubjectIds", pagination.SubjectIds);
                parameters.Add("@TeacherIds", pagination.TeacherIds);
                parameters.Add("@AcademicYearId", pagination.AcademicYearId);
                parameters.Add("@UserId", pagination.UserId);
                parameters.Add("@GradeId", pagination.GradeId);
                parameters.Add("@StartDate", pagination.StartDate);
                parameters.Add("@EndDate", pagination.EndDate);

                var data = _sqlRepository.Get<LessonPlanEntity>("GetLessonPlanList", parameters);
                pagination.Data = data.Data;

                if (pagination.Data.Count == 0 || pagination.Data == null)
                {
                    pagination.IsSuccess = false;
                    pagination.Message = "Record not found";

                }
                else
                {
                    var data1 = pagination.Data[0];
                    pagination.IsSuccess = true;
                    pagination.TotalRecords = pagination.Data[0].TotalRecords;
                }
            }
            catch (Exception e)
            {
                pagination.IsSuccess = false;
                pagination.Message = e.Message;
            }


            return pagination;
        }

        public async Task<DataResponseEntity> PrepareLessonPlan(LessonPlanEntity dto)
        {
            var response = new DataResponseEntity();
            try
            {
                var lessonPlan = GetCurriculumDetail(dto);
                lessonPlan.StartDate = dto.StartDate;
                lessonPlan.EndDate = dto.EndDate;
                lessonPlan.WeekNumber = dto.WeekNumber;
                lessonPlan.LessonPlanCreatedBy = dto.LessonPlanCreatedBy;
                lessonPlan.UserIdentityKey = dto.UserIdentityKey;
                dto.LessonPlanId = lessonPlan.LessonPlanId;
                dto.StartDate = lessonPlan.StartDate;
                dto.EndDate = lessonPlan.EndDate;
                if (lessonPlan == null || lessonPlan?.ConsolidateContent == null)
                {
                    response.IsSuccess = false;
                    response.Message = "Curriculum details are incomplete.";
                    return response;
                }
                if (lessonPlan.LessonPlanId == null || lessonPlan.LessonPlanId == 0)
                {
                    lessonPlan.LessonPlanId = SaveLessonPlan(dto);
                }


                string curriculumContent = Encoding.UTF8.GetString(lessonPlan.ConsolidateContent);
                lessonPlan.YearlyLessonPlanJson = lessonPlan.YearlyLessonPlanJson.Replace("{CurriculumContent}", curriculumContent);

                if (lessonPlan.LessonPlanId != null && lessonPlan.LessonPlanId >= 0)
                {

                    var data = await _lessonPlanGenerator.GenerateFullLessonHierarchy(lessonPlan);
                    if (data != null)
                    {
                        response.IsSuccess = true;
                        response.Data = data;
                    }
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = Convert.ToString(ex.Message.ToString());

            }
            return response;
        }

        public int SaveLessonPlan(LessonPlanEntity dto)
        {
            int lessonPlanId = 0;
            try
            {
                if (dto != null)
                {
                    DynamicParameters sqlParameter = new DynamicParameters();
                    sqlParameter.Add("@AcademicYearId", dto.AcademicYearId);
                    sqlParameter.Add("@SchoolId", dto.SchoolId);
                    sqlParameter.Add("@GradeId", dto.GradeId);
                    sqlParameter.Add("@SubjectId", dto.SubjectId);
                    sqlParameter.Add("@LessonFormat", dto.LessonFormat);
                    sqlParameter.Add("@StartDate", dto.StartDate);
                    sqlParameter.Add("@EndDate", dto.EndDate);
                    sqlParameter.Add("@GeneratedLessonContent", dto.PlannedLessonContent);
                    sqlParameter.Add("@CreatedBy", dto.UserId);
                    sqlParameter.Add("@LessonPlanCreatedBy", dto.LessonPlanCreatedBy);
                    sqlParameter.Add("@LessonPlanId", size: 10, dbType: DbType.Int32, direction: ParameterDirection.Output);
                    sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                    sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);
                    _sqlRepository.Excute("AddLessonPlan", sqlParameter);
                    lessonPlanId = sqlParameter.Get<Int32>("LessonPlanId");
                }

            }
            catch (Exception ex)
            {

            }
            return lessonPlanId;
        }

        public ScopeResponse getScopeDefinition(int? academicYearId, int? schoolId, int? gradeId, int? subjectId, string? userIdentityKey)
        {
            var result = new ScopeResponse();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
                 new SqlParameter("@academicYearId",SqlDbType.VarChar) {Value =(object) academicYearId },
                 new SqlParameter("@schoolIds",SqlDbType.VarChar) {Value =(object) schoolId },
                 new SqlParameter("@gradeIds",SqlDbType.VarChar) {Value =(object) gradeId },
                 new SqlParameter("@subjectIds",SqlDbType.VarChar) {Value =(object) subjectId },
                 new SqlParameter("@userIdentityKey",SqlDbType.VarChar) {Value =(object) userIdentityKey },
            };
                var data = _sqlRepository.ExecuteQuery<ScopeResponse>("getScopeDefinition", sqlParameter).ToList();
                result = data.ElementAt(0);
            }
            catch (Exception ex)
            {

            }

            return result;
        }

        public DataResponseEntity GetGradeSubject(ScopeRequest dto)
        {
            var result = new DataResponseEntity();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
                 new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value = dto.AcademicYearId },
                 new SqlParameter("@SchoolId",SqlDbType.Int) {Value =dto.SchoolId},
                 new SqlParameter("@GradeId",SqlDbType.Int) {Value =dto.GradeId},
                 new SqlParameter("@UserId",SqlDbType.VarChar) {Value = dto.UserIdentityKey },
            };
                var data = _sqlRepository.ExecuteQuery<GradeSubjectEntitiy>("GetGradesSubjectBySchoolAcademicYear", sqlParameter).ToList();
                if (data != null)
                {
                    result.Data = data;
                    result.IsSuccess = true;
                }

            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = Convert.ToString(ex.Message.ToString());
            }

            return result;

        }



        public ScopeResponse GetCurriculumDetail(LessonPlanEntity dto)
        {
            var result = new ScopeResponse();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
                 new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value =dto.AcademicYearId },
                 new SqlParameter("@SchoolId",SqlDbType.Int) {Value =dto.SchoolId},
                 new SqlParameter("@GradeId",SqlDbType.Int) {Value =dto.GradeId},
                 new SqlParameter("@SubjectId",SqlDbType.Int) {Value =dto.SubjectId },
                 new SqlParameter("@StartDate",SqlDbType.DateTime) {Value =dto.StartDate },
                 new SqlParameter("@EndDate",SqlDbType.DateTime) {Value =dto.EndDate },
                 new SqlParameter("@LessonFormat",SqlDbType.VarChar) {Value =dto.LessonFormat },
                 new SqlParameter("@PeriodValue",SqlDbType.VarChar) {Value =dto.PeriodValue },
                 new SqlParameter("@UserId",SqlDbType.VarChar) {Value =dto.UserId},
            };
                var data = _sqlRepository.ExecuteQuery<ScopeResponse>("GetCurriculumDetail", sqlParameter).ToList();
                result = data.ElementAt(0);
            }
            catch (Exception ex)
            {

            }

            return result;

        }

        public DataResponseEntity GetPeriodListByLessonFormat(PeriodEntity dto)
        {
            var result = new DataResponseEntity();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
                 new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value = dto.AcademicYearId },
                 new SqlParameter("@SchoolId",SqlDbType.Int) {Value = dto.SchoolId },
                 new SqlParameter("@WeekNumber",SqlDbType.Int) {Value =dto.WeekNumber},
                 new SqlParameter("@PeriodType",SqlDbType.VarChar) {Value =dto.PeriodType},
                 new SqlParameter("@UserId",SqlDbType.VarChar) {Value = dto.UserId },
            };
                var data = _sqlRepository.ExecuteQuery<PeriodEntity>("GetPeriodListByLessonFormat", sqlParameter).ToList();
                if (data != null)
                {
                    result.Data = data;
                    result.IsSuccess = true;
                }

            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = Convert.ToString(ex.Message.ToString());
            }

            return result;

        }

        public DataResponseEntity GetWeekNumberForLessonPlan(LessonPlanEntity dto)
        {

            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    var result = new ScopeResponse();
                    try
                    {
                        SqlParameter[] sqlParameter = new SqlParameter[]
                    {
                 new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value =dto.AcademicYearId },
                 new SqlParameter("@SchoolId",SqlDbType.Int) {Value =dto.SchoolId},
                 new SqlParameter("@GradeId",SqlDbType.Int) {Value =dto.GradeId},
                 new SqlParameter("@SubjectId",SqlDbType.Int) {Value =dto.SubjectId },
                 new SqlParameter("@UserIdentityKey",SqlDbType.NVarChar) {Value =dto.UserIdentityKey }
                    };
                        var data = _sqlRepository.ExecuteQuery<WeeklyDates>("GetUsersLessonPlans", sqlParameter).ToList();
                        if (data != null)
                        {
                            response.Data = data;
                            response.IsSuccess = true;
                        }

                    }
                    catch (Exception ex)
                    {

                    }
                    return response;
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
            }
            return response;
        }

        public DataResponseEntity GetLessonPlanListFiltered(ScopeRequest dto)
        {
            DataResponseEntity response = new DataResponseEntity();

            var result = new ScopeResponse();

            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
                 new SqlParameter("@LessonPlanId",SqlDbType.Int) {Value =dto.LessonPlanId },
                 new SqlParameter("@StartDate",SqlDbType.DateTime) {Value =dto.StartDate },
                 new SqlParameter("@EndDate",SqlDbType.DateTime) {Value =dto.EndDate },
                 new SqlParameter("@LessonFormat",SqlDbType.NVarChar) {Value =dto.LessonFormat },
                 new SqlParameter("@UserIdentityKey",SqlDbType.NVarChar) {Value =dto.UserIdentityKey },
            };
                var data = _sqlRepository.ExecuteQuery<ScopeResponse>("GetLessonPlanListFiltered", sqlParameter).ToList();
                if (data != null && data.Count > 0)
                {
                    response.IsSuccess = true;
                    response.Data = data;
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = Convert.ToString(ex.Message.ToString());
            }
            return response;


        }

        public DataResponseEntity GetAvailableLessonPlanList(ScopeRequest dto)
        {
            DataResponseEntity response = new DataResponseEntity();

            var result = new ScopeResponse();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
                 new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value =dto.AcademicYearId },
                 new SqlParameter("@SchoolId",SqlDbType.Int) {Value =dto.SchoolId },
                 new SqlParameter("@GradeId",SqlDbType.Int) {Value =dto.GradeId },
                 new SqlParameter("@SubjectId",SqlDbType.Int) {Value =dto.SubjectId },
                 new SqlParameter("@LessonPlanCreatedBy",SqlDbType.Int) {Value =dto.LessonPlanCreatedBy },
                 new SqlParameter("@StartDate",SqlDbType.DateTime) {Value =dto.StartDate },
                 new SqlParameter("@EndDate",SqlDbType.DateTime) {Value =dto.EndDate },
                 new SqlParameter("@SearchTerm",SqlDbType.NVarChar) {Value =dto.SearchTerm },
                 new SqlParameter("@UserIdentityKey",SqlDbType.NVarChar) {Value =dto.UserIdentityKey },
            };
                var data = _sqlRepository.ExecuteQuery<ScopeResponse>("GetAvailableLessonPlanList", sqlParameter).ToList();
                if (data != null && data.Count > 0)
                {
                    response.IsSuccess = true;
                    response.Data = data;
                }


            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = Convert.ToString(ex.Message.ToString());
            }
            return response;


        }

        public ScopeResponse getScopeDefinition(int? knowledgebaseId, int? schoolId, string? userIdentityKey)
        {
            var result = new ScopeResponse();
            try
            {
                SqlParameter[] sqlParameter = new SqlParameter[]
            {
           new SqlParameter("@knowledgebaseId",SqlDbType.Int) {Value = knowledgebaseId },
            new SqlParameter("@schoolId",SqlDbType.Int) {Value = schoolId },
            new SqlParameter("@userIdentityKey",SqlDbType.VarChar) {Value =userIdentityKey },
            };
                var data = _sqlRepository.ExecuteQuery<ScopeResponse>("getUserScope", sqlParameter).FirstOrDefault();
                result = data;
            }
            catch (Exception ex)
            {

            }

            return result;

        }

        public DataResponseEntity UpdateLessonPlan(ScopeRequest dto)
        {
            int result = 0;

            DataResponseEntity response = new DataResponseEntity();

            try
            {
                switch (dto.LessonFormat)
                {
                    case "yearly":
                        if (dto.YearlyLessonObj != null)
                        {
                            dto.YearlyLessonObj.LessonContent = "";
                            dto.YearlyLessonObj.LessonContent = HelperMethods.JsonSerialize(dto.YearlyLessonObj);

                            SqlParameter[] YSqlParameters = new SqlParameter[]
                            {
                        new SqlParameter("@LessonPlanId", SqlDbType.Int) {Value = dto.LessonPlanId },
                        new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value =HelperMethods.JsonSerialize(dto.YearlyLessonObj) },
                        new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey }
                            };

                            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateYearlyLessonPlans", YSqlParameters);
                            response.IsSuccess = true;
                        }


                        break;
                    case "monthly":
                        if (dto.MonthlyLessonObj != null)
                        {
                            dto.MonthlyLessonObj.LessonContent = "";
                            dto.MonthlyLessonObj.LessonContent = HelperMethods.JsonSerialize(dto.MonthlyLessonObj);

                            SqlParameter[] MSqlParameters = new SqlParameter[]
                             {
                        new SqlParameter("@YearlyPlanId", SqlDbType.Int) {Value = dto.MonthlyLessonObj.YearlyLessonPlanId},
                        new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = HelperMethods.JsonSerialize(dto.MonthlyLessonObj) },
                        new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey }
             };

                            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateMonthlyLessonPlans", MSqlParameters);
                            response.IsSuccess = true;
                        }

                        break;
                    case "weekly":
                        if(dto.WeeklyLessonObj!= null)
                        {
                            dto.WeeklyLessonObj.LessonContent = "";
                            dto.WeeklyLessonObj.LessonContent = HelperMethods.JsonSerialize(dto.WeeklyLessonObj);

                            SqlParameter[] WSqlParameters = new SqlParameter[]
                            {
                        new SqlParameter("@MonthlyPlanId", SqlDbType.Int) {Value = dto.WeeklyLessonObj.MonthlyLessonPlanId},
                        new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = HelperMethods.JsonSerialize(dto.WeeklyLessonObj)},
                        new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey }
                     };

                            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateWeeklyLessonPlans", WSqlParameters);
                            response.IsSuccess = true;
                        }


                        break;
                    case "daily":
                        if (dto.DailyLessonObj != null)
                        {
                            dto.DailyLessonObj.LessonContent = "";
                            dto.DailyLessonObj.LessonContent = HelperMethods.JsonSerialize(dto.DailyLessonObj);

                            SqlParameter[] DSqlParameters = new SqlParameter[]
                            {
                        new SqlParameter("@WeeklyPlanId", SqlDbType.Int) {Value = dto.DailyLessonObj.WeeklyLessonPlanId},
                        new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = HelperMethods.JsonSerialize(dto.DailyLessonObj)},
                        new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey }          
                             };

                            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateDailyLessonPlans", DSqlParameters);
                            response.IsSuccess = true;
                        }


                        break;
                    default:
                        break;
                }

            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message.ToLower();
            }
            return response;
        }

    }

}

