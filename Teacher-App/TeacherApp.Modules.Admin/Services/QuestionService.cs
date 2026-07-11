using Dapper;

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;
using UglyToad.PdfPig.Fonts.Standard14Fonts;

namespace TeacherApp.Modules.Admin.Services
{
    public class QuestionService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly PaginationRepository _pagination;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public QuestionService(SQLQueryExecutionRepository sqlRepository, PaginationRepository pagination, IWebHostEnvironment environment, IConfiguration configuration)
        {
            _sqlRepository = sqlRepository;
            _pagination = pagination;
            _configuration = configuration;
            _environment = environment;
        }

        #region Old Method
        //public async Task<DataResponseEntity> AddQuestionsAsync(
        //DataTable questionsTable,
        //DataTable optionsTable,
        //int stream,
        //int medium,
        //int standard,
        //int subject,
        //int chapter,
        //int topic)
        //{
        //    var response = new DataResponseEntity();

        //    try
        //    {
        //        // Prepare Dapper DynamicParameters
        //        DynamicParameters sqlParameter = new DynamicParameters();

        //        sqlParameter.Add("@Questions", questionsTable.AsTableValuedParameter("dbo.QuestionTableType"));
        //        sqlParameter.Add("@Options", optionsTable.AsTableValuedParameter("dbo.QuestionOptionTableType"));


        //        sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
        //        sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);


        //        _sqlRepository.Excute("AddQuestionsWithOptions", sqlParameter);

        //        // Get output values
        //        response.IsSuccess = sqlParameter.Get<bool>("@IsSuccess");
        //        response.Message = sqlParameter.Get<string>("@Message");
        //    }
        //    catch (Exception ex)
        //    {
        //        response.IsSuccess = false;
        //        response.Message = ex.Message;
        //    }

        //    return response;
        //}
        #endregion
        
        public  DataResponseEntity AddQuestion(string json,long topicId)
        {

            DataResponseEntity response = new DataResponseEntity();
            try
            {

                DynamicParameters sqlParameter = new DynamicParameters();

                sqlParameter.Add("@QuestionsJson", json);
                sqlParameter.Add("@TopicId", topicId);
                sqlParameter.Add("@CreatedBy", "043AAB05-8E11-40D1-82F8-86AE5A922122");
                sqlParameter.Add("@IsSuccess", size: 1, dbType: DbType.Boolean, direction: ParameterDirection.Output);
                sqlParameter.Add("@Message", size: 1000, dbType: DbType.String, direction: ParameterDirection.Output);

                _sqlRepository.Excute("AddQuestionsWithOptions", sqlParameter);
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


        public Pagination GetQuestionList(Pagination pagination)
        {

            pagination = _pagination.Execute<Questions>("GetQuestions", pagination);

            //pagination.TotalRecords = (pagination.Data as List<Questions>).Select(x => x.TotalRecords).FirstOrDefault();
            var baseFilePath = _configuration["FileStoragePaths:BaseFilePath"];
            var questionImagePath = _configuration["FileStoragePaths:QuestionImages"];
            var uploadPath = Path.Combine(baseFilePath,questionImagePath);

            var list = pagination.Data as List<Questions>;
            //pagination.TotalRecords = list?.FirstOrDefault()?.TotalRecords ?? 0;
            if (list != null && list.Any())
            {
                pagination.TotalRecords = list.First().TotalRecords;

                foreach (var item in list)
                {
                    item.UploadPath = uploadPath;
                }
            }
            else
            {
                pagination.TotalRecords = 0;
            }

            return pagination;
        }
    }
}
