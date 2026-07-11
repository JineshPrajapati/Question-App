using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Admin.Services
{
    public class NotificationService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        private readonly IConfiguration configuration;

        public NotificationService(SQLQueryExecutionRepository sqlRepository, IConfiguration configuration)
        {
            this._sqlRepository = sqlRepository;
            this.configuration = configuration;
        }

        public DataResponseEntity GetNotification(string UserIdentityId, int SchoolId)
        {
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                DynamicParameters sqlParameter = new DynamicParameters();
                sqlParameter.Add("@UserIdentityID", UserIdentityId);
                sqlParameter.Add("@SchoolId", SchoolId);

                var result = _sqlRepository.Get<NotificationEntity>("GetNotification", sqlParameter);

                if(result != null)
                {
                    response.IsSuccess = true;
                    response.Data = result;
                    response.Message = "Notification Data Retrive Successfully.";
                }

            }catch(Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
            }

            return response;
        }
    }
}
