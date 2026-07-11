using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Repositories;

namespace TeacherApp.Modules.Admin.Services
{
    public    class ChatMessageService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly IConfiguration _configuration;


        public ChatMessageService(SQLQueryExecutionRepository sqlRepository, IConfiguration configuration)
        {
            this._sqlRepository = sqlRepository;
            _configuration = configuration;

        }

        public DataResponseEntity SentMessage(Entities.SendMessage sendMessage)
        {
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                string fileName = null;
                string storePath = null;

                //  Check if a file is attached before processing base64
                if (!string.IsNullOrWhiteSpace(sendMessage.Base64File) && !string.IsNullOrWhiteSpace(sendMessage.FileName))
                {
                    var baseFilePath = _configuration["FileStoragePaths:BaseFilePath"];
                    var path = _configuration["FileStoragePaths:ChatFilesPath"] + sendMessage.SenderId;
                    var uploadPath = Path.Combine(baseFilePath, path);

                    if (!Directory.Exists(uploadPath))
                        Directory.CreateDirectory(uploadPath);

                    string fileGUID = Guid.NewGuid().ToString();
                    fileName = $"{fileGUID}_{sendMessage.FileName}";
                    string fullFilePath = Path.Combine(uploadPath, fileName);

                    byte[] fileBytes = Convert.FromBase64String(sendMessage.Base64File);
                    File.WriteAllBytes(fullFilePath, fileBytes);  // use sync for better error handling in critical path

                    storePath = Path.Combine(path, fileName);
                }

                // Prepare and execute SQL stored procedure
                var sqlParameter = new DynamicParameters();
                sqlParameter.Add("@SenderId", sendMessage.SenderId);
                sqlParameter.Add("@ReceiverIds", sendMessage.ReceiverIds);
                sqlParameter.Add("@Message", sendMessage.MessageText);
                sqlParameter.Add("@StorePath", storePath);  // can be null
                sqlParameter.Add("@FileType", sendMessage.FileType);
                sqlParameter.Add("@FileName", fileName);    // can be null
                sqlParameter.Add("@SchoolId", sendMessage.SchoolId);
                sqlParameter.Add("@ReplyToMessageId", sendMessage.ReplyToMessageId);
                sqlParameter.Add("@GradeId", sendMessage.GradeId);
                sqlParameter.Add("@IsGroupMessage", sendMessage.IsGroupMessage);


                var result = _sqlRepository.Get<ChatMessagesEntity>("SendMessage", sqlParameter);

                response.Data = result.Data;
                response.IsSuccess = true;
                response.Message = "Message sent successfully";
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.Message = ex.Message;
            }

            return response;
        }


        public DataResponseEntity GetChatByUserId(string SenderId, string ReceiverId)
        {
            DataResponseEntity response = new DataResponseEntity();
            var baseFilePath = _configuration["FileStoragePaths:BaseFilePath"];
            
            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@SenderId", SenderId);
                sqlParameter.Add("@ReceiverId", ReceiverId);
                sqlParameter.Add("@StoredBaseFilePath", baseFilePath);

                var result = _sqlRepository.Get<ChatMessagesEntity>("GetChatByUserId", sqlParameter);

                response.Data = result.Data;
                response.IsSuccess = true;
            }
            catch(Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        public DataResponseEntity GetChatByGrade (string teacherId, int gradeId)
        {
            DataResponseEntity response = new DataResponseEntity();
            var baseFilePath = _configuration["FileStoragePaths:BaseFilePath"];

            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@GradeId", gradeId);
                sqlParameter.Add("@TeacherId", teacherId);
                sqlParameter.Add("@StoredBaseFilePath", baseFilePath);

                var result = _sqlRepository.Get<ChatMessagesEntity>("GetChatByGrade", sqlParameter);

                response.Data = result.Data;
                response.IsSuccess = true;
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        public DataResponseEntity ExportChatHistory(string UserId, string ChatUserId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameters = new DynamicParameters();
                sqlParameters.Add("@UserIdentityId", UserId);
                sqlParameters.Add("@ChatUserIdentityId", ChatUserId);

                var result = _sqlRepository.Get<ExportChatHistoryEntity>("ExportChatHistory", sqlParameters);

                response.Data = result.Data;
                response.IsSuccess = true;

            }catch(Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }
            return response;
        }

        

        public DataResponseEntity UpdateIsReadMessage(string UserIdentityId, string ChatUserIdentityId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameters = new DynamicParameters();
                sqlParameters.Add("@UserIdentityId", UserIdentityId);
                sqlParameters.Add("@ChatWithUserIdentityId", ChatUserIdentityId);

                _sqlRepository.Excute("UpdateIsReadMessage", sqlParameters);

                response.IsSuccess = true;
                response.Message = "Data updatde sucessfully!";

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
