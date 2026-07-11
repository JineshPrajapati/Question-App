using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Admin.Services
{
    public class FileService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        public FileService(SQLQueryExecutionRepository sqlRepository)
        {
            _sqlRepository = sqlRepository;
        }

        public FileEntity GetFileDetailById(string fileId)
        {
            DataResponseEntity response = new DataResponseEntity();
            try
            {
                DynamicParameters sqlParameters = new DynamicParameters();
                sqlParameters.Add("@FileIdentityId", fileId);

                response = _sqlRepository.Get<FileEntity>("GetFileDetailsById", sqlParameters);
                if (response.IsSuccess)
                    return response.Data[0];
                else return new FileEntity();
            }
            catch (Exception e)
            {
                response.IsSuccess = false;
                response.Message = e.Message;
                return new FileEntity();
            }
        }
    }
}
