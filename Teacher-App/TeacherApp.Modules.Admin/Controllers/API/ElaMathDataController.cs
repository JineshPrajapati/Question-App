using Azure;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
//using System.Management.Automation.Tracing;
using TeacherApp.Modules.Admin.Entities;
using TeacherApp.Modules.Admin.Services;
using TeacherApp.Modules.Helper.Controllers;
using Cell = DocumentFormat.OpenXml.Spreadsheet.Cell;
using Row = DocumentFormat.OpenXml.Spreadsheet.Row;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace TeacherApp.Modules.Admin.Controllers.API
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [Route("api/ElaMath/")]
    public class ElaMathDataController : BaseController
    {
        private readonly Services.ElaMathDataService _elaMathDataService;

        public ElaMathDataController(Services.ElaMathDataService elaMathDataService
            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
        {
            _elaMathDataService = elaMathDataService;

        }

        #region AddScore
        [HttpPost("Create/{SchoolId}/{gradeId}/{acadedimicYearId}")]
        public IActionResult AddResult(IFormFile file, int SchoolId, int gradeId, int acadedimicYearId)
        {
            if (file == null || file.Length == 0)
                return Ok("No file uploaded.");

            try
            {
                using var stream = file.OpenReadStream();
                using var memStream = new MemoryStream();
                stream.CopyTo(memStream);
                memStream.Position = 0;

                var elaData = ParseReadingData(memStream, "ELA Data", "ELA");
                memStream.Position = 0;
                var mathData = ParseReadingData(memStream, "Math Data", "Math");

                List<ReadingDataRow> readingDataRows = elaData.Concat(mathData).ToList();
                var scores = new ConcurrentBag<ScoreJsonRow>();

                var assessmentCache = new IdCache<(string Name, string SheetName)>(key => _elaMathDataService.GetOrInsertAssessment(key.Name, key.SheetName));
                var componentCache = new IdCache<(int, string)>(key => _elaMathDataService.GetOrInsertComponent(key.Item1, key.Item2));
                var periodCache = new IdCache<string>(name => _elaMathDataService.GetOrInsertAssessmentPeriod(name));
                var subPeriodCache = new IdCache<(int, string)>(key => _elaMathDataService.GetOrInsertPeriodSub(key.Item1, key.Item2));

                Parallel.ForEach(readingDataRows, student =>
                {
                    foreach (var kv in student.Scores)
                    {
                        var parts = kv.Key.Split('|').Select(p => p.Trim()).ToList();
                        
                        string assessment = parts.ElementAtOrDefault(0);
                        string component = parts.ElementAtOrDefault(1);
                        string period = parts.Count > 4 ? parts[3] : parts[2];
                        string subPeriod = parts.Count > 4 ? parts[4] : parts[3];
                        subPeriod = NormalizePeriodName(subPeriod);

                        Console.WriteLine($"subPeriod raw value: '{subPeriod}'");
                        int assessmentId = assessmentCache.GetOrAdd((assessment, student.SheetName));
                        int componentId = componentCache.GetOrAdd((assessmentId, component));
                        int periodId = periodCache.GetOrAdd(period);
                        int? subPeriodId = !string.IsNullOrEmpty(subPeriod) ? subPeriodCache.GetOrAdd((periodId, subPeriod)) : null;

                        scores.Add(new ScoreJsonRow
                        {
                            StudentNumber = student.StudentNumber,
                            ComponentId = componentId,
                            SubPeriodId = subPeriodId,
                            ScoreValue = ExtractNumericValue(kv.Value)
                        });
                    }
                });

                var scoresJson = JsonConvert.SerializeObject(scores.ToList());
                var response = _elaMathDataService.InsertScore(scoresJson, SchoolId,  gradeId, acadedimicYearId);

                return Ok(response);
            }
            catch (Exception ex)
            {

                return Ok(new { IsSuccess = true, Message = ex.Message });
            }
        }
        private string NormalizePeriodName(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            return input
                .Replace("➖", "-")
                .Replace("➕", "+")
                .Trim();
        }

      
        public static List<ReadingDataRow> ParseReadingData(Stream fileStream, string sheetName, string subjectName)
        {
            using var document = SpreadsheetDocument.Open(fileStream, false);

            //var document = SpreadsheetDocument.Open(filePath, false);
            var sheet = document.WorkbookPart.Workbook.Sheets.Elements<Sheet>()
                .FirstOrDefault(s => s.Name == sheetName);
            if (sheet == null)
                throw new Exception($"Sheet '{sheetName}' not found. Invalid file selected.");

            var worksheetPart = (WorksheetPart)document.WorkbookPart.GetPartById(sheet.Id);
            var sheetData = worksheetPart.Worksheet.Elements<SheetData>().First();

            string GetCellValue(Cell cell)
            {
                if (cell == null) return null;
                string value = cell.InnerText;

                if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
                {
                    int ssid = int.Parse(value);
                    return document.WorkbookPart.SharedStringTablePart.SharedStringTable.Elements<SharedStringItem>().ElementAt(ssid).InnerText;
                }

                return value;
            }

            string GetCellValueWithMergedSupport(string cellRef)
            {
                var cell = GetCellByReference(cellRef);
                string value = GetCellValue(cell);

                if (!string.IsNullOrWhiteSpace(value))
                    return value;

                var mergeCells = worksheetPart.Worksheet.Elements<MergeCells>().FirstOrDefault();
                if (mergeCells != null)
                {
                    foreach (var mergeCell in mergeCells.Elements<MergeCell>())
                    {
                        string[] refs = mergeCell.Reference.Value.Split(':');
                        if (refs.Length == 2 && IsCellInRange(cellRef, refs[0], refs[1]))
                        {
                            var startCell = GetCellByReference(refs[0]);
                            return GetCellValue(startCell);
                        }
                    }
                }

                return null;
            }

            Cell GetCellByReference(string reference)
            {
                int rowIdx = GetRowIndex(reference);
                var row = sheetData.Elements<Row>().FirstOrDefault(r => r.RowIndex == (uint)rowIdx);
                return row?.Elements<Cell>().FirstOrDefault(c => c.CellReference == reference);
            }
            int rowDataColumn = (subjectName == "Math" ? 10 : 11);

            var headerRows = sheetData.Elements<Row>().Where(r => r.RowIndex >= 7 && r.RowIndex <= rowDataColumn).ToList();

            var columnHeaders = new Dictionary<int, string>();
            int maxColIndex = headerRows.SelectMany(r => r.Elements<Cell>()).Max(c => GetColumnIndex(c.CellReference));

            for (int colIndex = 1; colIndex <= maxColIndex; colIndex++)
            {
                if (colIndex <= 4)
                {
                    var c = headerRows[0].Elements<Cell>().FirstOrDefault(x => GetColumnIndex(x.CellReference) == colIndex);
                    columnHeaders[colIndex] = GetCellValue(c);
                }
                else
                {
                    var headers = new List<string>();
                    for (int rowOffset = 0; rowOffset < (subjectName == "Math" ? 4 : 5); rowOffset++)
                    {
                        var row = headerRows[rowOffset];
                        string colLetter = GetColumnLetter(colIndex);
                        string cellRef = colLetter + row.RowIndex;
                        headers.Add(GetCellValueWithMergedSupport(cellRef));
                    }

                    string compositeHeader = string.Join(" | ", headers.Where(h => !string.IsNullOrEmpty(h)));
                    columnHeaders[colIndex] = compositeHeader;
                }
            }

            bool valid = ValidateHeader(columnHeaders);
            if (!valid)
            {
                throw new Exception($"Data is mismatch, Invalid file selected.");
            }

            var dataRows = sheetData.Elements<Row>().Where(r => r.RowIndex > rowDataColumn);
            var results = new List<ReadingDataRow>();

            foreach (var dataRow in dataRows)
            {
                var rowData = new ReadingDataRow()
                {
                    SheetName = subjectName
                };

                foreach (var cell in dataRow.Elements<Cell>())
                {
                    int colIndex = GetColumnIndex(cell.CellReference);
                    string cellValue = GetCellValue(cell);

                    if (colIndex == 1) rowData.FirstName = cellValue;
                    else if (colIndex == 2) rowData.LastName = cellValue;
                    else if (colIndex == 3) rowData.StudentNumber = cellValue;
                    else if (colIndex == 4) rowData.RIMP = cellValue;
                    else if (columnHeaders.ContainsKey(colIndex))
                    {
                        rowData.Scores[columnHeaders[colIndex]] = cellValue;
                    }
                }

                results.Add(rowData);
            }

            return results.Where(x => new[] { x.FirstName, x.LastName, x.StudentNumber, x.RIMP }.All(v => !string.IsNullOrWhiteSpace(v))).ToList();
        }

        public class IdCache<TKey>
        {
            private readonly ConcurrentDictionary<TKey, int> _cache = new();
            private readonly Func<TKey, int> _getOrInsertFunc;

            public IdCache(Func<TKey, int> getOrInsertFunc)
            {
                _getOrInsertFunc = getOrInsertFunc;
            }

            public int GetOrAdd(TKey key) => _cache.GetOrAdd(key, _getOrInsertFunc);
        }


        public static bool ValidateHeader(Dictionary<int, string> columnHeaders)
        {
            bool isValid = true;
            var expectedHeaders = new Dictionary<int, string>
            {
                { 1, "First Name" },
                { 2, "Last Name" },
                { 3, "Student Number" }
            };

            foreach (var kvp in expectedHeaders)
            {
                var colIndex = kvp.Key;
                var expectedHeader = kvp.Value;

                if (!columnHeaders.TryGetValue(colIndex, out var actualHeader) ||
                    string.IsNullOrWhiteSpace(actualHeader) ||
                    !string.Equals(actualHeader.Trim(), expectedHeader, StringComparison.OrdinalIgnoreCase))
                {
                    isValid = false;
                }
            }
            return isValid;
        }
        
        private string ExtractNumericValue(string input)
        {
            var match = System.Text.RegularExpressions.Regex.Match(input, @"\d+(\.\d+)?");
            return match.Success ? match.Value : string.Empty;
        }

        static bool IsCellInRange(string targetRef, string startRef, string endRef)
        {
            int targetCol = GetColumnIndex(targetRef);
            int targetRow = GetRowIndex(targetRef);
            int startCol = GetColumnIndex(startRef);
            int startRow = GetRowIndex(startRef);
            int endCol = GetColumnIndex(endRef);
            int endRow = GetRowIndex(endRef);

            return startCol <= targetCol && targetCol <= endCol &&
                   startRow <= targetRow && targetRow <= endRow;
        }

        static int GetRowIndex(string cellRef)
        {
            string row = new string(cellRef.Where(char.IsDigit).ToArray());
            return int.TryParse(row, out int result) ? result : 0;
        }

        static int GetColumnIndex(string cellRef)
        {
            string col = new string(cellRef.Where(char.IsLetter).ToArray());
            int index = 0;
            foreach (char c in col)
            {
                index *= 26;
                index += (c - 'A' + 1);
            }
            return index;
        }

        static string GetColumnLetter(int colIndex)
        {
            string columnName = "";
            while (colIndex > 0)
            {
                int remainder = (colIndex - 1) % 26;
                columnName = (char)(65 + remainder) + columnName;
                colIndex = (colIndex - 1) / 26;
            }
            return columnName;
        }

        #endregion

        #region AddStudent
        [HttpPost("BulkAddStudent/{SchoolId}/{gradeId}/{acadedimicYearId}/{userId}")]
        public IActionResult AddStudent(IFormFile file, int SchoolId, int gradeId, int acadedimicYearId, string userId)
        {
            if (file == null || file.Length == 0)
                return Ok("No file uploaded.");

            try
            {
                // Copy the uploaded file to a MemoryStream
                using (var stream = new MemoryStream())
                {
                    file.CopyTo(stream);
                    stream.Position = 0;

                    var studentDashboard = ParseStudentDashboard(stream, "Student Dashboard");

                    string studentJson = JsonConvert.SerializeObject(studentDashboard);
                    var response = _elaMathDataService.InsertStudentDashboardData(SchoolId, studentJson, gradeId, acadedimicYearId, userId);

                    return Ok(response);
                }
            }
            catch (Exception e)
            {
                return Ok(new { IsSuccess = true, Message = e.Message });
            }
        }

        public static List<StudentDashboardRow> ParseStudentDashboard(Stream stream, string sheetName)
        {
            using var document = SpreadsheetDocument.Open(stream, false);
            var sheet = document.WorkbookPart.Workbook.Sheets.Elements<Sheet>()
                .FirstOrDefault(s => s.Name == sheetName);

            if (sheet == null)
                throw new Exception($"Sheet '{sheetName}' not found.");

            var worksheetPart = (WorksheetPart)document.WorkbookPart.GetPartById(sheet.Id);
            var sheetData = worksheetPart.Worksheet.Elements<SheetData>().First();

            // Validation
            var headerRow = sheetData.Elements<Row>().Skip(5).FirstOrDefault();
            if (headerRow == null)
                throw new Exception("Header row not found.");

            var expectedHeaders = new[]
            {
                "First Name","Last Name","Student Number","Medical Concerns","Final Forms",
                "Free & Reduced","Power Packs","Supply Fee","Fundrasier","Buyout","IAT","Notes",
                "PreK","Pre1st","K RIMP","1st Grade RIMP","Title Services"
            };

            var headerCells = headerRow.Elements<Cell>().ToList();
            for (int i = 0; i < expectedHeaders.Length; i++)
            {
                string actualHeader = GetCellValue(headerCells, i, document)?.Trim();
                if (!string.Equals(actualHeader, expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
                    throw new Exception("Data is mismatch, Invalid file selected.");
            }

            var rows = sheetData.Elements<Row>().Skip(6); // Data starts from row 7
            var results = new List<StudentDashboardRow>();

            foreach (var row in rows)
            {
                var cells = row.Elements<Cell>().ToList();
                if (cells.Count == 0) continue;


                bool isBlankRow = Enumerable.Range(0, 3).All(i => string.IsNullOrWhiteSpace(GetCellValue(cells, i, document)));

                if (isBlankRow)
                    break;

                var studentNumber = GetCellValue(cells, 2, document)?.Trim().ToLowerInvariant();

                // Validation: StudentNumber must not be empty
                if (string.IsNullOrWhiteSpace(studentNumber))
                    throw new Exception("Student Number is required and cannot be empty.");

                var item = new StudentDashboardRow
                {
                    FirstName = GetCellValue(cells, 0, document),
                    LastName = GetCellValue(cells, 1, document),
                    StudentNumber = GetCellValue(cells, 2, document)?.Trim().ToLowerInvariant()
                    //MedicalConcerns = GetCellValue(cells, 3, document),
                    //FinalForms = GetCellValue(cells, 4, document),
                    //FreeReduced = GetCellValue(cells, 5, document),
                    //PowerPacks = GetCellValue(cells, 6, document),
                    //SupplyFee = GetCellValue(cells, 7, document),
                    //Fundraiser = GetCellValue(cells, 8, document),
                    //Buyout = GetCellValue(cells, 9, document),
                    //IAT = GetCellValue(cells, 10, document),
                    //Notes = GetCellValue(cells, 11, document),
                    //PreK = GetCellValue(cells, 12, document),
                    //Pre1st = GetCellValue(cells, 13, document),
                    //KRIMP = GetCellValue(cells, 14, document),
                    //FirstGradeRIMP = GetCellValue(cells, 15, document),
                    //TitleServices = GetCellValue(cells, 16, document),
                    //SheetName = sheetName
                };

                if (!string.IsNullOrWhiteSpace(item.StudentNumber))
                    results.Add(item);
            }

            return results;
        }

        private static string GetCellValue(List<Cell> cells, int index, SpreadsheetDocument doc)
        {
            if (index >= cells.Count)
                return null;

            var cell = cells[index];
            var value = cell?.InnerText;
            if (cell?.DataType != null && cell.DataType == CellValues.SharedString)
            {
                int id = int.Parse(value);
                return doc.WorkbookPart.SharedStringTablePart.SharedStringTable.Elements<SharedStringItem>().ElementAt(id).InnerText;
            }
            return value;
        }
        
        #endregion

    }
}