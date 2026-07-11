using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph.Models;
using OpenAI;
using Org.BouncyCastle.Asn1.Pkcs;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Controllers;
using TeacherApp.Modules.Helper.Extensions;
using TeacherApp.Modules.KnowledgeBase.Models;
using TeacherApp.Modules.KnowledgeBase.Services;

namespace TeacherApp.Modules.KnowledgeBase.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/AiAssistent/")]
    public class AiAssistentController : BaseController
    {
        private readonly AiAssistentService _aiAssistentService;
        private readonly OpenAIService _openAIService;
        private readonly QdrantService _qdrantService;
        private readonly TeacherAiSqlService _teacherAiSqlService;
        private readonly IConfiguration _configuration;

        public AiAssistentController(AiAssistentService aiAssistentService, TeacherAiSqlService teacherAiSqlService, OpenAIService openAIService, QdrantService qdrantService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _aiAssistentService = aiAssistentService;
            _openAIService = openAIService;
            _qdrantService = qdrantService;
            _teacherAiSqlService = teacherAiSqlService;
            _configuration = configuration;
        }



        [HttpPost("NewChatMessage")]
        public async Task<IActionResult> NewChatMessage([FromBody] NewThreadRequest newThread)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (newThread != null)
                {
                    string threadId = await _openAIService.CreateNewAiThread();
                    if (!string.IsNullOrEmpty(threadId))
                    {
                        threadId = _aiAssistentService.NewChatThread(newThread,threadId);
                        response.IsSuccess = true;
                        response.Data = threadId;
                    }
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }
            return Ok(response);

        }


        [HttpPost("GetAiAssistenHistory")]
        public IActionResult GetAiAssistenHistory([FromBody] ReqChatHistory dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    var data = _aiAssistentService.getAiAssistenHistory(dto);
                    if (data != null && data.Count > 0)
                    {
                        response.IsSuccess = true;
                        response.Data = data;
                    }
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }
            return Ok(response);

        }

        [HttpPost("SendMessage")]
        public async Task<IActionResult> SendMessage([FromBody] AiAssistentChatMessage msg)
        {

            DataResponseEntity response = new DataResponseEntity();
            ScopeResponse Scope = new ScopeResponse();

            Scope.SchoolId = msg.SchoolId;

            var userContext = new Dictionary<string, object>
            {
                { "CurrentUserId", msg.UserId },
                { "CurrentUserSchoolId", msg.SchoolId},
                { "CurrentAcademicYearId", msg.AcademicYearId }
            };
           
            var result = await _teacherAiSqlService.DetectAndGenerateAsync(msg.Content, userContext);

            var sqlResult = _aiAssistentService.ExecuteSqlQuery(result, msg.UserId,msg.SchoolId, msg.AcademicYearId);

            try
            {
                if (msg != null)
                {
                    if (string.IsNullOrEmpty(msg.ThreadId))
                    {
                        msg.ThreadId = await _openAIService.CreateNewAiThread();
                    }
                    msg.MessageId = Guid.NewGuid().ToString();
                    msg = _aiAssistentService.SendChatMessage(msg);

                    var aiResponse = await _qdrantService.AnswerQuestionAsync(msg.SchoolId, msg.Content, sqlResult, Scope, msg.ThreadId);
                    if (aiResponse != null && !string.IsNullOrEmpty(aiResponse))
                    {
                        msg.MessageId = Guid.NewGuid().ToString();
                        msg.Sender = "assistent";
                        msg.Content = aiResponse;
                        msg = _aiAssistentService.SendChatMessage(msg);
                    }
                    else
                    {
                        msg.Content = "No Answer found!";
                    }
                    response.IsSuccess = true;
                    response.Data = msg;
                }
                
            }
            catch (Exception ex)
            {

            }
            return Ok(response);

        }



        [HttpPost("getUserAiChatThreadHistory")]
        public IActionResult getUserAiChatThreadHistory([FromBody] ReqChatHistory dto)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                if (dto != null)
                {
                    var msg = _openAIService.GetAiChatHistory(dto.ThreadId);
                    //var data = _aiAssistentService.getUserAiChatThreadHistory(dto);
                    if (msg.Result != null && msg.Result.Count > 0)
                    {
                        response.IsSuccess = true;
                        response.Data = msg.Result;
                    }
                }
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;

            }
            return Ok(response);

        }


    }
}
