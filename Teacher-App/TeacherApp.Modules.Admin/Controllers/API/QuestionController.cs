using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using OpenAI;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Controllers;
using TeacherApp.Modules.Repositories;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Route("api/question/")]

    public class QuestionController:BaseController
    {
        private readonly Services.QuestionService _questionService;
        private readonly IConfiguration _configuration;
        private readonly QuestionReaderRepository _questionReaderRepository;
                    //private readonly ReportGeneratorRepository _reportGenerateRepo;


        public QuestionController(Services.QuestionService questionService
            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration, QuestionReaderRepository questionReaderRepository) : base(httpContextAccessor, configuration)
        {
            _questionService = questionService;
            _configuration = configuration;
            _questionReaderRepository = questionReaderRepository;
        }

        [HttpPost("AddQuestion")]
        public async Task<IActionResult> AddQuestion(IFormFile file, AddQuestionEntity addQuestionEntity)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is required");
            var baseFilePath = _configuration["FileStoragePaths:BaseFilePath"];
            var questionImagePath = _configuration["FileStoragePaths:QuestionImages"];
            var uploadPath = Path.Combine(
                                            baseFilePath,
                                            questionImagePath,
                                            addQuestionEntity.Stream.ToString(),
                                            addQuestionEntity.Medium.ToString(),
                                            addQuestionEntity.Standard.ToString(),
                                            addQuestionEntity.Subject.ToString(),
                                            addQuestionEntity.Chapter.ToString(),
                                            addQuestionEntity.Topic.ToString()
                                        );

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var questions = await _questionReaderRepository.ReadQuestionsFromWord(file, uploadPath);

            string json = JsonConvert.SerializeObject(questions, Formatting.Indented);

            var result =  _questionService.AddQuestion(json, Convert.ToInt64(addQuestionEntity.TopicId));
            if (result.IsSuccess)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }


        [HttpGet("GetQuestions")]
        public IActionResult GetQuestions(Pagination question)
        {
            var data = _questionService.GetQuestionList(question);
            return Ok(data);
        }
    }
}
