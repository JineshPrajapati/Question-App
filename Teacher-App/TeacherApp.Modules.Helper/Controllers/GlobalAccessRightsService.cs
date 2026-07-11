using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using TeacherApp.Modules.Entities.Entities;
namespace TeacherApp.Extension
{
    public class GlobalAccessRightsService
    {

        private static List<GlobalAccessRightsEnttity> _accessRights = new List<GlobalAccessRightsEnttity>();
        private static string _connectionString;

        public static void Initialize(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        //public GlobalAccessRightsService(IConfiguration configuration)
        //{
        //    _connectionString = configuration.GetConnectionString("DefaultConnection");
        //}

        public static void SetAccessRights()
        {

            _accessRights.Clear();  // Clear previous rights
            //_connectionString = connectionString;
            //_connectionString = "Data Source=54.82.204.26;Database=DevCaregiverDB;User Id=devUser;password=CementD!g!t@l@2025;Integrated Security=False;TrustServerCertificate=True;MultipleActiveResultSets=True;";

            using (SqlConnection _sql = new SqlConnection(_connectionString))
            {
                try
                {
                    if (_sql.State == ConnectionState.Closed)
                        _sql.Open();
                    //if(IsList)
                    var data = _sql.Query<GlobalAccessRightsEnttity>("GetAllUserRoleRights", commandType: CommandType.StoredProcedure).ToList();
                    //else
                    //    dataResponse.Data = _sql.Query<T>(sqlStoreProcedure, parameters, commandType: CommandType.StoredProcedure).FirstOrDefault();


                    _accessRights = data;

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

        //public static void SetAccessRights()
        //{

        //    _accessRights.Clear();  // Clear previous rights

        //    using (SqlConnection _sql = new SqlConnection(_configuration))
        //    {
        //        try
        //        {
        //            if (_sql.State == ConnectionState.Closed)
        //                _sql.Open();
        //            //if(IsList)
        //            var data = _sql.Query<GlobalAccessRightsEnttity>("GetAllUserRoleRights", commandType: CommandType.StoredProcedure).ToList();
        //            //else
        //            //    dataResponse.Data = _sql.Query<T>(sqlStoreProcedure, parameters, commandType: CommandType.StoredProcedure).FirstOrDefault();


        //            _accessRights = data;

        //            if (_sql.State == ConnectionState.Open)
        //                _sql.Close();
        //        }
        //        catch (Exception e)
        //        {
        //            if (_sql.State == ConnectionState.Open)
        //                _sql.Close();
        //        }
        //    }


        //}

        // Get access rights for a specific role
        public static bool HasAccessRight(string roleId,string controllerName, string actionName)
        {
            
            return _accessRights.Any(r => r.RoleId == roleId && r.ControllerName.ToLower() == controllerName.ToLower() && r.ActionName.ToLower() == actionName.ToLower());
        }

    }
}
