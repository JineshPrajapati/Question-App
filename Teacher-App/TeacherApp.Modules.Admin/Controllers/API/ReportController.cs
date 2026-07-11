using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Helper.Controllers;
using DocumentFormat.OpenXml.Office2013.PowerPoint.Roaming;
using DocumentFormat.OpenXml.Drawing.Charts;
using TeacherApp.Modules.Admin.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/Report/")]
    public class ReportController : BaseController
    {
        private readonly Services.ReportService _reportService;

        public ReportController(Services.ReportService reportService
            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _reportService = reportService;

        }

        [HttpGet("GetPTEReport")]
        public IActionResult GetReportById([FromQuery] string studentId,[FromQuery] string? note,[FromQuery] string? conferenceType, [FromQuery] int gradeId, [FromQuery] int academicYearId)
        {
            var reportData = _reportService.GetStudentReportById(studentId, gradeId, academicYearId);
            if (reportData.Data != null && reportData.IsSuccess )
            {
                
                var templatePath = "wwwroot/Files/PT_Conference_Report_Format.xlsx";
                byte[] fileBytes;

                using (MemoryStream memStream = new MemoryStream())
                {
                    // Copy the original file to the memory stream
                    using (FileStream fileStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
                    {
                        fileStream.CopyTo(memStream);
                    }

                    memStream.Position = 0;

                    using (SpreadsheetDocument document = SpreadsheetDocument.Open(memStream, true))
                    {
                        WorkbookPart workbookPart = document.WorkbookPart;
                        var sheet = workbookPart.Workbook.Sheets.Elements<Sheet>().FirstOrDefault(s => s.Name == "PT Conference Report");
                        if (sheet == null)
                            throw new Exception("Sheet 'PT Conference Report' not found. Invalid file selected.");

                        WorksheetPart worksheetPart = (WorksheetPart)workbookPart.GetPartById(sheet.Id);
                        Worksheet worksheet = worksheetPart.Worksheet;
                        var name = reportData.Data[0].StudentName;
                        var parentName = reportData.Data[0].ParentName;
                        var email = reportData.Data[0].EmailAddress;
                        var phone = reportData.Data[0].Phonenumber;
                        UpdateCellValue(worksheet, "A5", "STUDENT NAME: " + name);
                        UpdateCellValue(worksheet, "A7",  parentName);  
                        UpdateCellValue(worksheet, "B7",  conferenceType);
                        UpdateCellValue(worksheet, "D7", DateTime.Now.ToString("hh:mm tt"));
                        UpdateCellValue(worksheet, "E7",  phone);    
                        UpdateCellValue(worksheet, "G7",  email);     
                        UpdateCellValue(worksheet, "F10", note);     


                        foreach (var data in reportData.Data)
                        {
                            switch (data.Component)
                            {
                                case "Comp.":
                                    UpdateCellValue(worksheet, "C12", data.F_score);
                                    UpdateCellValue(worksheet, "D12", data.W_score);
                                    UpdateCellValue(worksheet, "E12", data.S_score);
                                    break;
                                case "LNF":
                                    UpdateCellValue(worksheet, "C13", data.F_score);
                                    UpdateCellValue(worksheet, "D13", data.W_score);
                                    UpdateCellValue(worksheet, "E13", data.S_score);
                                    break;
                                case "NWF\n(CLS)":
                                    UpdateCellValue(worksheet, "C15", data.F_score);
                                    UpdateCellValue(worksheet, "D15", data.W_score);
                                    UpdateCellValue(worksheet, "E15", data.S_score);
                                    break;
                                case "NWF\n(WRC)":
                                    UpdateCellValue(worksheet, "C16", data.F_score);
                                    UpdateCellValue(worksheet, "D16", data.W_score);
                                    UpdateCellValue(worksheet, "E16", data.S_score);
                                    break;
                                case "ORF(%)":
                                    UpdateCellValue(worksheet, "C19", data.F_score);
                                    UpdateCellValue(worksheet, "D19", data.W_score);
                                    UpdateCellValue(worksheet, "E19", data.S_score);
                                    break;
                                case "ORF(WC)":
                                    UpdateCellValue(worksheet, "C18", data.F_score);
                                    UpdateCellValue(worksheet, "D18", data.W_score);
                                    UpdateCellValue(worksheet, "E18", data.S_score);
                                    break;
                                case "PSF":
                                    UpdateCellValue(worksheet, "C14", data.F_score);
                                    UpdateCellValue(worksheet, "D14", data.W_score);
                                    UpdateCellValue(worksheet, "E14", data.S_score);
                                    break;
                                case "WRF":
                                    UpdateCellValue(worksheet, "C17", data.F_score);
                                    UpdateCellValue(worksheet, "D17", data.W_score);
                                    UpdateCellValue(worksheet, "E17", data.S_score);
                                    break;
                                case "EARLY LITERACY(G.E.)":
                                    UpdateCellValue(worksheet, "C24", data.F_score);
                                    UpdateCellValue(worksheet, "D24", data.W_score);
                                    UpdateCellValue(worksheet, "E24", data.S_score);
                                    break;
                                case "EARLY LITERACY(PR)":
                                    UpdateCellValue(worksheet, "C28", data.F_score);
                                    UpdateCellValue(worksheet, "D28", data.W_score);
                                    UpdateCellValue(worksheet, "E28", data.S_score);
                                    break;
                                case "EARLY LITERACY(S.S.)":
                                    UpdateCellValue(worksheet, "C26", data.F_score);
                                    UpdateCellValue(worksheet, "D26", data.W_score);
                                    UpdateCellValue(worksheet, "E26", data.S_score);
                                    break;
                                case "STAR Math(G.E.)":
                                    UpdateCellValue(worksheet, "F24", data.F_score);
                                    UpdateCellValue(worksheet, "G24", data.W_score);
                                    UpdateCellValue(worksheet, "H24", data.S_score);
                                    break;
                                case "STAR Math(PR)":
                                    UpdateCellValue(worksheet, "F28", data.F_score);
                                    UpdateCellValue(worksheet, "G28", data.W_score);
                                    UpdateCellValue(worksheet, "H28", data.S_score);
                                    break;
                                case "STAR Math(S.S.)":
                                    UpdateCellValue(worksheet, "F26", data.F_score);
                                    UpdateCellValue(worksheet, "G26", data.W_score);
                                    UpdateCellValue(worksheet, "H26", data.S_score);
                                    break;
                                case "SCA Fact Fluency(-)":
                                    UpdateCellValue(worksheet, "L27", data.F_score);
                                    UpdateCellValue(worksheet, "M27", data.W_score);
                                    UpdateCellValue(worksheet, "N27", data.S_score);
                                    break;
                                case "SCA Fact Fluency(+)":
                                    UpdateCellValue(worksheet, "L24", data.F_score);
                                    UpdateCellValue(worksheet, "M24", data.W_score);
                                    UpdateCellValue(worksheet, "N24", data.S_score);
                                    break;
                            }
                        }

                        worksheet.Save();
                    }

                    memStream.Position = 0;
                    fileBytes = memStream.ToArray();
                }

                var fileName = $"StudentReport_{reportData.Data[0].StudentName}_{studentId}.xlsx";
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            } 
            else{

                return NoContent();
            }

        }

        // Local helper
        void UpdateCellValue(Worksheet worksheet, string cellRef, string value)
        {
            Cell cell = worksheet.Descendants<Cell>().FirstOrDefault(c => c.CellReference == cellRef);
            if (cell != null)
            {
                cell.CellValue = new CellValue(value);
                cell.DataType = new EnumValue<CellValues>(CellValues.String);
            }
        }


    }
}
