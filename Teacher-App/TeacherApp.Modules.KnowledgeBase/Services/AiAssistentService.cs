using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Models;
using Newtonsoft.Json;
using OpenAI;
using OpenAI.Chat;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Text.Json;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.KnowledgeBase.Models;
using TeacherApp.Modules.Repositories.SchemaDictionary;
using static System.Net.WebRequestMethods;


public record NewThreadRequest(string UserId, string? Title, string ThreadId);
public record ChatRequest(string Message);
public class AiAssistentService
{

    private readonly SQLQueryExecutionRepository _sqlRepository;
    private readonly HttpClient _http;
    private readonly Dictionary<string, List<string>> _columns;
    private readonly List<(string FromTable, string FromCol, string ToTable, string ToCol)> _relationships;
    private readonly Dictionary<string, string> _templates;
    public AiAssistentService(IConfiguration config, HttpClient http, SQLQueryExecutionRepository sqlRepository)
    {
        _http = http;
        _sqlRepository = sqlRepository;
        _columns = DatabaseSchema.Tables;
        _relationships = DatabaseSchema.Relationships;

        // Pre-built templates
        _templates = new Dictionary<string, string>
        {
            { "StudentProgress", "SELECT S.Name AS [Student Name], Sub.Name AS [Subject], COUNT(LP.Id) AS [Total Lessons], SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) AS [Lessons Completed], CAST(SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(LP.Id) AS DECIMAL(5,2)) AS [Completion %] FROM Students S JOIN LessonPlans LP ON S.GradeId = LP.GradeId JOIN Subjects Sub ON LP.SubjectId = Sub.Id WHERE S.Id = @CurrentUserId GROUP BY S.Name, Sub.Name;" },
            { "LessonCoverage", "SELECT G.Name AS [Grade], Sub.Name AS [Subject], COUNT(LP.Id) AS [Planned Lessons], SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) AS [Completed Lessons], CAST(SUM(CASE WHEN LP.Completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(LP.Id) AS DECIMAL(5,2)) AS [Coverage %] FROM Grades G JOIN Students S ON S.GradeId = G.Id JOIN LessonPlans LP ON LP.GradeId = G.Id JOIN Subjects Sub ON LP.SubjectId = Sub.Id GROUP BY G.Name, Sub.Name;" },
            { "MissingLessonPlans", "SELECT T.Name AS [Teacher], Sub.Name AS [Subject], LP.Id AS [LessonPlanId], LP.StartDate, LP.EndDate FROM LessonPlans LP JOIN Teachers T ON LP.CreatedById = T.Id JOIN Subjects Sub ON LP.SubjectId = Sub.Id WHERE LP.Completed = 0 AND LP.EndDate < GETDATE() ORDER BY T.Name, LP.StartDate;" }
        };
    }


    public string NewChatThread(NewThreadRequest dto, string threadId)
    {
        var newId = "";
        try
        {
            SqlParameter[] sqlParameter = new SqlParameter[]
        {
                 new SqlParameter("@ThreadId",SqlDbType.NVarChar) {Value =threadId },
                 new SqlParameter("@UserId",SqlDbType.NVarChar) {Value =dto.UserId },
                 new SqlParameter("@Title",SqlDbType.NVarChar) {Value =string.IsNullOrEmpty(dto.Title)?"New Conversation":dto.Title}
        };
            int result = _sqlRepository.ExecuteNonQuery("AddNewChatThread", sqlParameter);
            if (result > 0)
            {
                return dto.ThreadId.ToString();
            }

        }
        catch (Exception ex)
        {

        }

        return threadId;

    }

    public List<AiAssistentChatEntity> getAiAssistenHistory(ReqChatHistory dto)
    {
        List<AiAssistentChatEntity> result = new List<AiAssistentChatEntity>();
        try
        {
            SqlParameter[] sqlParameter = new SqlParameter[]
        {
                 new SqlParameter("@UserId",SqlDbType.NVarChar) {Value =dto.UserId },
                 new SqlParameter("@PageSize",SqlDbType.Int) {Value =dto.PageSize },
                 new SqlParameter("@Offset",SqlDbType.Int) {Value =dto.Offset },
                 new SqlParameter("@SearchText",SqlDbType.NVarChar) {Value =dto.SearchText }
        };
            result = _sqlRepository.ExecuteQuery<AiAssistentChatEntity>("GetUserAiChatHistory", sqlParameter).ToList();

        }
        catch (Exception ex)
        {

        }

        return result;

    }

    public AiAssistentChatMessage SendChatMessage(AiAssistentChatMessage messaage)
    {
        DataResponseEntity response = new DataResponseEntity();
        try
        {

            SqlParameter[] sqlParameter = new SqlParameter[]
              {
                 new SqlParameter("@MessageId",SqlDbType.NVarChar) {Value =messaage.MessageId },
                 new SqlParameter("@ThreadId",SqlDbType.NVarChar) {Value =messaage.ThreadId },
                 new SqlParameter("@Sender",SqlDbType.NVarChar) {Value =messaage.Sender},
                 new SqlParameter("@Content",SqlDbType.NVarChar) {Value =messaage.Content},
                 new SqlParameter("@UserId",SqlDbType.NVarChar) {Value =messaage.UserId}
               };
            response = _sqlRepository.ExecuteQuery<DataResponseEntity>("NewAiChatMessage", sqlParameter).FirstOrDefault();
        }
        catch (Exception ex)
        {

        }
        return messaage;
    }

    public List<AiAssistentChatEntity> getUserAiChatThreadHistory(ReqChatHistory dto)
    {
        List<AiAssistentChatEntity> result = new List<AiAssistentChatEntity>();
        try
        {
            SqlParameter[] sqlParameter = new SqlParameter[]
        {
                 new SqlParameter("@UserId",SqlDbType.NVarChar) {Value =dto.UserId },
                 new SqlParameter("@ThreadId",SqlDbType.NVarChar) {Value =dto.ThreadId }
        };
            result = _sqlRepository.ExecuteQuery<AiAssistentChatEntity>("GetUserAiChatThreadHistory", sqlParameter).ToList();

        }
        catch (Exception ex)
        {

        }

        return result;

    }

    public List<NamesAbbreviations> NamesAbbreviations(int? AcademicYearId, int? SchoolId, string? UserId)
    {
        List<NamesAbbreviations> response = new List<NamesAbbreviations>();
        try
        {
            SqlParameter[] sqlParameter = new SqlParameter[]
              {
                 new SqlParameter("@AcademicYearId",SqlDbType.NVarChar) {Value =AcademicYearId },
                 new SqlParameter("@SchoolId",SqlDbType.NVarChar) {Value =SchoolId },
                 new SqlParameter("@UserId",SqlDbType.NVarChar) {Value =UserId}
               };
            response = _sqlRepository.ExecuteQuery<NamesAbbreviations>("getNamesAbbreviations", sqlParameter).ToList();
        }
        catch (Exception ex)
        {

        }
        return response;
    }

    public void LogQueryAudit(string prompt, string role, string sqlQuery, int userId, bool isMarket = false)
    {

        try
        {
            SqlParameter[] sqlParameter = new SqlParameter[]
        {
                 new SqlParameter("@UserId",SqlDbType.Int) {Value =userId },
                 new SqlParameter("@UserRole",SqlDbType.NVarChar) {Value =role},
                 new SqlParameter("@Prompt",SqlDbType.NVarChar) {Value =prompt},
                 new SqlParameter("@SqlQuery",SqlDbType.NVarChar) {Value =sqlQuery},
                 new SqlParameter("@IsMarketAnalysis",SqlDbType.NVarChar) {Value =isMarket}
        };
            int result = _sqlRepository.ExecuteNonQuery("InsertAIQueryAudit", sqlParameter);

        }
        catch (Exception ex)
        {

        }

    }

    public string ExecuteSqlQuery(string sqlQuery,string userId,int? schoolId,int? academicYearId)
    {
        string jsonResult = "";
        try
        {

            SqlParameter[] sqlParameter = new SqlParameter[]
             {
                new SqlParameter("@UserId",SqlDbType.NVarChar) {Value = userId },
                new SqlParameter("@SchoolId",SqlDbType.Int) {Value = schoolId },
                new SqlParameter("@AcademicYearId",SqlDbType.Int) {Value = academicYearId },
                new SqlParameter("@SqlStatement",SqlDbType.NVarChar) {Value = sqlQuery }
             };
            var data = _sqlRepository.ExecuteQuery<SqlStatementResult>("ExecuteDynamicSqlAsJson", sqlParameter).FirstOrDefault();
            if (data != null)
            {
                jsonResult = data.JsonOutput;
            }
         
        }
        catch (Exception ex)
        {

        }
        return jsonResult;
    }


}





