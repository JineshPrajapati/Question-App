using Dapper;
using TeacherApp.Modules.Entities.Data;
using TeacherApp.Modules.Entities.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;


public class SQLQueryExecutionRepository
{
    private readonly string _connectionString;
    private readonly ApplicationDbContext _context;


    public SQLQueryExecutionRepository(IConfiguration configuration, ApplicationDbContext context)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
        _context = context;
    }

    public int ExecuteNonQuery(string sql, SqlParameter[] parameters)
    {
        using (var connection = new SqlConnection(_connectionString))
        {
            using (var command = new SqlCommand(sql, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddRange(parameters);

                connection.Open();
                return command.ExecuteNonQuery();
            }
        }
    }

    public IEnumerable<T> ExecuteQuery<T>(string sql, SqlParameter[] parameters) where T : new()
    {
        var entities = new List<T>();

        using (var connection = new SqlConnection(_connectionString))
        {
            using (var command = new SqlCommand(sql, connection))
            {
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddRange(parameters);

                connection.Open();
                using (var reader = command.ExecuteReader())
                {
                    var props = typeof(T).GetProperties();
                    while (reader.Read())
                    {
                        T entity = new T();
                        foreach (var prop in props)
                        {
                            try
                            {
                                int ordinal = reader.GetOrdinal(prop.Name);
                                var propValue = (reader.GetValue(ordinal) == null);
                                if (reader.GetValue(ordinal) != DBNull.Value)
                                {
                                    prop.SetValue(entity, reader.GetValue(ordinal));
                                }

                            }
                            catch (IndexOutOfRangeException)
                            {
                                Console.WriteLine($"Column {prop.Name} does not exist.");
                            }
                        }

                        entities.Add(entity);
                    }
                }
            }
        }

        return entities;
    }

    public DataResponseEntity Execute<T>(string procuderName, SqlParameter[] sqlParameters)
    {
        DataResponseEntity response = new DataResponseEntity();
        try
        {
            string strParam = string.Join(",", sqlParameters.Select(i => i.Direction == ParameterDirection.Output ? i.ParameterName + " OUTPUT" : i.ParameterName));
            string query = String.Format("{0} {1}", procuderName, strParam);
            //var data = ExecuteQuerys<T>(procuderName, sqlParameters);

            response.Data = _context.Database.SqlQueryRaw<T>(query, sqlParameters).ToList();
            //response.OutputParams = sqlParameters.Where(x => x.Direction == ParameterDirection.Output).ToDictionary(x => x.ParameterName.Replace("@", ""), x => x.Value.ToString() ?? string.Empty);

            response.IsSuccess = true;
            response.Message = "Execute successfully!";
        }
        catch (Exception e)
        {
            response.IsSuccess = false;
            response.Message = e.Message;
        }
        return response;
    }

    public DataResponseEntity Get<T>(string sqlStoreProcedure, DynamicParameters parameters)
    {
        DataResponseEntity dataResponse = new DataResponseEntity();
        using (SqlConnection _sql = new SqlConnection(_connectionString))
        {
            try
            {
                if (_sql.State == ConnectionState.Closed)
                    _sql.Open();
                //if(IsList)
                dataResponse.Data = _sql.Query<T>(sqlStoreProcedure, parameters, commandType: CommandType.StoredProcedure).ToList();
                //else
                //    dataResponse.Data = _sql.Query<T>(sqlStoreProcedure, parameters, commandType: CommandType.StoredProcedure).FirstOrDefault();

                dataResponse.IsSuccess = true;

                if (_sql.State == ConnectionState.Open)
                    _sql.Close();
            }
            catch (Exception e)
            {
                dataResponse.IsSuccess = false;
                dataResponse.Message = e.Message;
                if (_sql.State == ConnectionState.Open)
                    _sql.Close();
            }
        }

        return dataResponse;
    }
    public void Excute(string sqlStoreProcedure, DynamicParameters parameters)
    {
        //DataResponseEntity response = new DataResponseEntity();
        using (SqlConnection _sql = new SqlConnection(_connectionString))
        {
            try
            {
                if (_sql.State == ConnectionState.Closed)
                    _sql.Open();
                _sql.Execute(sqlStoreProcedure, parameters, commandType: CommandType.StoredProcedure);


                if (_sql.State == ConnectionState.Open)
                    _sql.Close();
            }
            catch (Exception e)
            {
                if (_sql.State == ConnectionState.Open)
                    _sql.Close();
            }
        }
    }

    public DataResponseEntity Get<T>(string sqlStoreProcedure)
    {
        DataResponseEntity dataResponse = new DataResponseEntity();
        using (SqlConnection _sql = new SqlConnection(_connectionString))
        {
            try
            {
                if (_sql.State == ConnectionState.Closed)
                    _sql.Open();
                //if(IsList)
                dataResponse.Data = _sql.Query<T>(sqlStoreProcedure, commandType: CommandType.StoredProcedure).ToList();
                //else
                //    dataResponse.Data = _sql.Query<T>(sqlStoreProcedure, parameters, commandType: CommandType.StoredProcedure).FirstOrDefault();

                dataResponse.IsSuccess = true;

                if (_sql.State == ConnectionState.Open)
                    _sql.Close();
            }
            catch (Exception e)
            {
                dataResponse.IsSuccess = false;
                dataResponse.Message = e.Message;
                if (_sql.State == ConnectionState.Open)
                    _sql.Close();
            }
        }

        return dataResponse;
    }

}


