using Csla;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Numerics;
using System.Text.Json;
using TeacherApp.Module.LessonPlan.Entities;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.KnowledgeBase.Helper;
using TeacherApp.Modules.KnowledgeBase.Services;


public class RecursiveLessonPlanGenerator
{
    private readonly IConfiguration _config;
    private readonly SQLQueryExecutionRepository _sqlRepository;
    private readonly OpenAIService _openAIService;
    private readonly PdfChunkService _pdfChunkService;
    private readonly EmbeddingService _embeddingService;
    private readonly QdrantService _qdrantService;
    private readonly int _vectorSize;

    public RecursiveLessonPlanGenerator(SQLQueryExecutionRepository sqlRepository, IConfiguration config, OpenAIService openAIService, EmbeddingService embeddingService, PdfChunkService pdfChunkService, QdrantService qdrantService)
    {
        _config = config;
        _sqlRepository = sqlRepository;
        _openAIService = openAIService;
        _embeddingService = embeddingService;
        _pdfChunkService = pdfChunkService;
        _qdrantService = qdrantService;
        _vectorSize = int.Parse(_config["OpenAI:ChunkSize"] ?? "0");
    }

    public ScopeResponse GetLessonPlanByLessonPlanId(LessonPlanEntity dto, string? lessonFormat=null)
    {
        ScopeResponse response = new ScopeResponse();

        var result = new ScopeResponse();
        try
        {
            SqlParameter[] sqlParameter = new SqlParameter[]
        {
                 new SqlParameter("@LessonPlanId",SqlDbType.Int) {Value =dto.LessonPlanId },
                 new SqlParameter("@Start_Date",SqlDbType.DateTime) {Value =dto.StartDate },
                 new SqlParameter("@End_Date",SqlDbType.DateTime) {Value =dto.EndDate },
                 new SqlParameter("@LessonFormat",SqlDbType.NVarChar) {Value =lessonFormat}
        };
            var data = _sqlRepository.ExecuteQuery<ScopeResponse>("GetLessonPlanByLessonPlanId", sqlParameter).FirstOrDefault();
            if (data != null)
            {
                response = data;
            }
        }
        catch (Exception ex)
        {

        }
        return response;

    }

    public async Task<List<YearlyLessonPlan>> GenerateFullLessonHierarchy(ScopeResponse inputDto)
    {
        if (inputDto == null) return new();

        var currLessonPlan = new LessonPlanEntity
        {
            LessonPlanId = inputDto.LessonPlanId,
            StartDate = inputDto.StartDate,
            EndDate = inputDto.EndDate
        };

        var reqDate = new LessonPlanEntity
        {
            LessonPlanId = inputDto.LessonPlanId,
            StartDate = inputDto.StartDate,
            EndDate = inputDto.EndDate
        };

        try
        {          
            var yearlyJson = GetLessonPlanJson(currLessonPlan, "yearly");
            if (string.IsNullOrEmpty(yearlyJson))
            {
                var yearlyPlans = await _openAIService.GenerateJson<YearlyLessonPlan>(inputDto.YearlyLessonPlanJson);
                if (yearlyPlans.Any())
                {
                    await AddYearlyLessonPlans(inputDto, yearlyPlans);
                    yearlyJson = GetLessonPlanJson(currLessonPlan, "yearly");
                }
            }

            var yearlyLessonPlans = HelperMethods.JsonDeserialize<List<YearlyLessonPlan>>(yearlyJson);

            if (yearlyLessonPlans == null || !yearlyLessonPlans.Any()) return new();

            foreach (var yearlyPlan in yearlyLessonPlans)
            {       
                var monthlyJson = GetLessonPlanJson(currLessonPlan, "monthly");
                if (string.IsNullOrEmpty(monthlyJson))
                {
                    var prompt = inputDto.MonthlyLessonPlanJson.Replace("{YearlyLessonPlan}", JsonSerializer.Serialize(yearlyPlan.LessonContent));
                    var monthlyPlans = await _openAIService.GenerateJson<MonthlyLessonPlan>(prompt);

                    if (monthlyPlans.Any())
                    {
                        await AddMonthlyLessonPlans(inputDto, yearlyPlan.YearlyLessonPlanId, monthlyPlans);
                        currLessonPlan.StartDate = (from d in monthlyPlans select HelperMethods.DateParse(d.Start_Date)).Min();
                        currLessonPlan.EndDate = (from d in monthlyPlans select HelperMethods.DateParse(d.End_Date)).Max();
                        monthlyJson = GetLessonPlanJson(currLessonPlan, "monthly");
                    }
                }

                var monthlyLessonPlans = HelperMethods.JsonDeserialize<List<MonthlyLessonPlan>>(monthlyJson);
                if (monthlyLessonPlans == null || !monthlyLessonPlans.Any()) continue;

                foreach (var monthlyPlan in monthlyLessonPlans)
                {                 
                    var weeklyJson = GetLessonPlanJson(currLessonPlan, "weekly");
                    if (string.IsNullOrEmpty(weeklyJson))
                    {
                        var prompt = inputDto.WeeklyLessonPlanJson.Replace("{MonthlyLessonPlan}", JsonSerializer.Serialize(monthlyPlan.LessonContent));
                        var weeklyPlans = await _openAIService.GenerateJson<WeeklyLessonPlan>(prompt);
                        currLessonPlan.StartDate = (from d in weeklyPlans select HelperMethods.DateParse(d.Start_Date)).Min();
                        currLessonPlan.EndDate = (from d in weeklyPlans select HelperMethods.DateParse(d.End_Date)).Max();

                        if (weeklyPlans.Any())
                        {
                            await AddWeeklyLessonPlans(inputDto, monthlyPlan.MonthlyLessonPlanId, weeklyPlans);
                            

                            weeklyJson = GetLessonPlanJson(currLessonPlan, "weekly");
                        }
                    }

                    var weeklyLessonPlans = HelperMethods.JsonDeserialize<List<WeeklyLessonPlan>>(weeklyJson);                  
                    if (weeklyLessonPlans == null || !weeklyLessonPlans.Any()) continue;

                    foreach (var weeklyPlan in weeklyLessonPlans)
                    {                     
                        var dailyJson = GetLessonPlanJson(currLessonPlan, "daily");
                        if (string.IsNullOrEmpty(dailyJson))
                        {
                            var prompt = inputDto.DailyLessonPlanJson
                                .Replace("{WeeklyLessonPlan}", JsonSerializer.Serialize(weeklyPlan.LessonContent))
                                .Replace("{WeekStartDate}", weeklyPlan.Start_Date)
                                .Replace("{WeekEndDate}", weeklyPlan.End_Date);

                            var dailyPlans = await _openAIService.GenerateJson<DailyLessonPlan>(prompt);

                            if (dailyPlans.Any())
                            {
                                await AddDailyLessonPlans(inputDto, weeklyPlan.WeeklyLessonPlanId, dailyPlans);
                                dailyJson = GetLessonPlanJson(currLessonPlan, "daily");
                            }
                        }
                    
                    }
                }
            }

            return yearlyLessonPlans;
        }
        catch (Exception ex)
        {   
            Console.Error.WriteLine($"[GenerateFullLessonHierarchy] Error: {ex.Message}");
            return new();
        }
    }

    private string? GetLessonPlanJson(LessonPlanEntity entity, string level)
    {
        var plan = GetLessonPlanByLessonPlanId(entity, level);

        return level switch
        {
            "yearly" => plan.YearlyLessonPlanJson,
            "monthly" => plan.MonthlyLessonPlanJson,
            "weekly" => plan.WeeklyLessonPlanJson,
            "daily" => plan.DailyLessonPlanJson,
            _ => null
        };
    }
    public async Task AddYearlyLessonPlans(ScopeResponse dto, List<YearlyLessonPlan> yearlyList)
    {
        int result = 0;
        try
        {
            foreach (var gradingPlan in yearlyList.Where(x => x != null))
            {
                gradingPlan.LessonContent = HelperMethods.JsonSerialize(gradingPlan);

                List<string> fileChunks = new List<string>();
                fileChunks = _pdfChunkService.ExtractChunksFromText(gradingPlan.LessonContent, _vectorSize);

                 await _qdrantService.UpsertLessonPlanAsync("yearly", gradingPlan.Start_Date, gradingPlan.End_Date, dto, fileChunks);

            }

            string? YearlyLessonContent = yearlyList?.Any() == true
                              ? HelperMethods.JsonSerialize(yearlyList)
                              : "";
            if (string.IsNullOrWhiteSpace(YearlyLessonContent)) 
            { 
                return ; 
            }

            SqlParameter[] SqlParameters = new SqlParameter[]
                  {
            new SqlParameter("@LessonPlanId", SqlDbType.Int) {Value = dto.LessonPlanId },      
            new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = YearlyLessonContent},
            new SqlParameter("@LessonPlanCreatedBy", SqlDbType.Int) {Value = dto.LessonPlanCreatedBy},
            new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey },
            new SqlParameter("@MaxDate",SqlDbType.Date) {Value = dto.EndDate }
         };

            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateYearlyLessonPlans", SqlParameters);           
           
        }
        catch (Exception ex)
        {

        }
     

    }
    public async Task AddMonthlyLessonPlans(ScopeResponse dto, int? YearlyPlanId, List<MonthlyLessonPlan> monthlyList)
    {
        int result = 0;
        try
        {
            foreach (var monthPlan in monthlyList.Where(x => x != null))
            {
                monthPlan.LessonContent = HelperMethods.JsonSerialize(monthPlan);
                List<string> fileChunks = new List<string>();
                fileChunks = _pdfChunkService.ExtractChunksFromText(monthPlan.LessonContent, _vectorSize);

              await  _qdrantService.UpsertLessonPlanAsync("monthly", monthPlan.Start_Date, monthPlan.End_Date, dto, fileChunks);
            }

            string? monthlyLessonContent = monthlyList?.Any() == true
                                   ? HelperMethods.JsonSerialize(monthlyList)
                                   : "";

            if (string.IsNullOrWhiteSpace(monthlyLessonContent))
            {
                return ;
            }

            SqlParameter[] SqlParameters = new SqlParameter[]
                  {            
            new SqlParameter("@YearlyPlanId", SqlDbType.Int) {Value = YearlyPlanId},            
            new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = monthlyLessonContent},
            new SqlParameter("@LessonPlanCreatedBy", SqlDbType.Int) {Value = dto.LessonPlanCreatedBy},
            new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey },
            new SqlParameter("@MaxDate",SqlDbType.Date) {Value = dto.EndDate }
         };

            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateMonthlyLessonPlans", SqlParameters);
           
        }
        catch (Exception ex)
        {

        }
 

    }
    public async Task AddWeeklyLessonPlans(ScopeResponse dto, int? MonthlyPlanId, List<WeeklyLessonPlan> weeklyList)
    {
        int result = 0;
        try
        {
            foreach (var weeklyPlan in weeklyList.Where(x => x != null))
            {
                weeklyPlan.LessonContent = HelperMethods.JsonSerialize(weeklyPlan);
                List<string> fileChunks = new List<string>();
                fileChunks = _pdfChunkService.ExtractChunksFromText(weeklyPlan.LessonContent, _vectorSize);

                await _qdrantService.UpsertLessonPlanAsync("weekly", weeklyPlan.Start_Date, weeklyPlan.End_Date, dto, fileChunks);
            }

            string? weeklyLessonContent = weeklyList?.Any() == true
                              ? HelperMethods.JsonSerialize(weeklyList)
                              : "";

            if (string.IsNullOrWhiteSpace(weeklyLessonContent))
            {
                return ;
            }

            SqlParameter[] SqlParameters = new SqlParameter[]
                  {
            new SqlParameter("@MonthlyPlanId", SqlDbType.Int) {Value = MonthlyPlanId},
            new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = weeklyLessonContent},
            new SqlParameter("@LessonPlanCreatedBy", SqlDbType.Int) {Value = dto.LessonPlanCreatedBy},
            new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey },
            new SqlParameter("@MaxDate",SqlDbType.Date) {Value = dto.EndDate }
         };

            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateWeeklyLessonPlans", SqlParameters);

         

        }
        catch (Exception ex)
        {
                
        }
    
    }
    public async Task AddDailyLessonPlans(ScopeResponse dto, int? WeeklyPlanId, List<DailyLessonPlan> dailyList)
    {
        int result = 0;
        try
        {
            foreach (var dayPlan in dailyList.Where(x=>x!=null))
            {
                dayPlan.LessonContent = HelperMethods.JsonSerialize(dayPlan);
                List<string> fileChunks = new List<string>();
                fileChunks = _pdfChunkService.ExtractChunksFromText(dayPlan.LessonContent, _vectorSize);
              await  _qdrantService.UpsertLessonPlanAsync("daily", dayPlan.Actual_Date, dayPlan.Actual_Date, dto, fileChunks);
            }

            string? dailyLessonContent = dailyList?.Any() == true
                             ? HelperMethods.JsonSerialize(dailyList)
                             : "";
  

            SqlParameter[] SqlParameters = new SqlParameter[]
                  {            
            new SqlParameter("@WeeklyPlanId", SqlDbType.Int) {Value = WeeklyPlanId},            
            new SqlParameter("@LessonContentJson", SqlDbType.NVarChar) {Value = dailyLessonContent},
            new SqlParameter("@LessonPlanCreatedBy", SqlDbType.Int) {Value = dto.LessonPlanCreatedBy},
            new SqlParameter("@UserIdentityId",SqlDbType.NVarChar) {Value = dto.UserIdentityKey },
            new SqlParameter("@MaxDate",SqlDbType.Date) {Value = dto.EndDate }
         };

            result = _sqlRepository.ExecuteNonQuery("AddOrUpdateDailyLessonPlans", SqlParameters);

        }
        catch (Exception ex)
        {

        }
   
    }



}

