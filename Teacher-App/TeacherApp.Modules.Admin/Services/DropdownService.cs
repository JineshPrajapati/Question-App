using Dapper;
using TeacherApp.Modules.Entities.Entities;
using Microsoft.Data.SqlClient;
using System;
using System.Data;
using System.Linq;
using TeacherApp.Modules.Admin.Entities;
using DocumentFormat.OpenXml.Office.CustomUI;

namespace TeacherApp.Modules.Admin.Services
{
    public class DropdownService
    {
        private readonly SQLQueryExecutionRepository _sqlRepository;
        public DropdownService(SQLQueryExecutionRepository sqlRepository)
        {      
            _sqlRepository = sqlRepository;       
        }

        public DropDownOptionsEntity BindDropdownOptions(string OptionGroup)
        {
            DropDownOptionsEntity _values = new DropDownOptionsEntity();
            try
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                    new SqlParameter("@OptionGroups", SqlDbType.NVarChar) {Value = OptionGroup}

                };

                var options = _sqlRepository.ExecuteQuery<OptionList>("GetDropDownOptions", parameters).ToList();
                _values.options = options;


            }
            catch (Exception e)
            {
                _values.IsSuccess = false;
                _values.Message = Convert.ToString(e.Message);
            }
            return _values;
        }

        public DataResponseEntity GetDropdownData(DropdownMaster dropdown)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@UserId", dropdown.UserId);
                sqlParameter.Add("@MasterId", dropdown.MasterId);
                sqlParameter.Add("@ChapterId", dropdown.ChapterId);
                sqlParameter.Add("@StandardId", dropdown.StandardId);
                sqlParameter.Add("@SubjectId", dropdown.SubjectId);
                sqlParameter.Add("@MediumId", dropdown.MediumId);

                var data = _sqlRepository.Get<DropdownMaster>("GetDropDownMaster", sqlParameter);
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

        public DataResponseEntity GetAllStandardSubjects()
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                var data = _sqlRepository.Get<StandardSubject>("GetAllStandardSubjects", sqlParameter);
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

        public DataResponseEntity GetCustomDropdown(CustomDropDown customDropDown)
        {
            var sqlParameter = new DynamicParameters();
            DataResponseEntity response = new DataResponseEntity();

            try
            {
                sqlParameter.Add("@StandardIds", customDropDown.StandardIds);
                sqlParameter.Add("@SubjectIds", customDropDown.SubjectIds);
                sqlParameter.Add("@ChepterIds", customDropDown.ChepterIds);
                sqlParameter.Add("@MasterId", customDropDown.MasterId);
                var data = _sqlRepository.Get<DataResponseEntity>("GetCustomDropDownMaster", sqlParameter);
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

    }
}
