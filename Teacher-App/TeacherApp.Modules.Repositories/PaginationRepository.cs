using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using TeacherApp.Modules.Entities.Entities;


public class PaginationRepository
{
    private readonly string _connectionString;
    private readonly SqlConnection _sql;
    public PaginationRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
        _sql = new SqlConnection(_connectionString);
    }

    public Pagination Execute<T>(string procuderName, Pagination pagination)
    {
        var parameters = new DynamicParameters();
        try
        {
            //var totalRecordsParam = new SqlParameter("@TotalRecords", SqlDbType.Int) { Direction = ParameterDirection.Output };
            parameters.Add("@TopicIds", pagination.TopicIds);
            parameters.Add("@SortBy", pagination.SortBy);
            parameters.Add("@PageSize", pagination.PageSize);
            parameters.Add("@PageNumber", pagination.PageNumber);
            parameters.Add("@SortDirection", pagination.SortDirection);
            //parameters.Add("@UserId", pagination.UserId);


            pagination.Data = _sql.Query<T>(procuderName, parameters, commandType: CommandType.StoredProcedure).ToList();
            if (pagination.Data.Count == 0 || pagination.Data == null)
            {
                pagination.IsSuccess = true;
                pagination.Message = "Record not found";
            }
            else
            {
                var data = (pagination.Data as List<T>).FirstOrDefault();
                pagination.TotalRecords = Convert.ToInt32(data.GetType().GetProperty("TotalRecords").GetValue(data));
                pagination.IsSuccess = true;
            }

            
        }
        catch (Exception e)
        {
            pagination.IsSuccess = false;
            pagination.Message = e.Message;
        }
        return pagination;
    }
    
}

