using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace TeacherApp.Modules.Helper.Extensions
{
    public static class DateHelperStringValue
    {
        public static List<(DateTime? from, DateTime? to)> ExtractDates(string input)
        {
            List<(DateTime? from, DateTime? to)> result = new List<(DateTime? from, DateTime? to)>();

            string[] formats = new string[]
            {
            "yyyy-MM-dd",
            "MMM-dd-yyyy",
            "MMM-dd-yy",
            "dd-MMM-yy",
            "dd-MM-yy"
             };

             string labeledPattern = @"from\s*date\s*[:\-,'`]*\s*['`]*\s*(\S+?)\s*['`]*\s*[,;\-]*\s*to\s*date\s*[:\-,'`]*\s*['`]*\s*(\S+?)\s*['`]*";
            var labeledMatches = Regex.Matches(input, labeledPattern, RegexOptions.IgnoreCase);

            foreach (Match match in labeledMatches)
            {
                if (TryParseDate(match.Groups[1].Value, formats, out DateTime fromDate) &&
                    TryParseDate(match.Groups[2].Value, formats, out DateTime toDate))
                {
                    result.Add((fromDate, toDate));
                }
            }

            string datePattern = @"\b(\d{2,4}[-/]\d{1,2}[-/]\d{2,4}|[A-Za-z]{3}-\d{1,2}-\d{2,4})\b";
            var dateMatches = Regex.Matches(input, datePattern);

            List<DateTime> standaloneDates = new List<DateTime>();
            foreach (Match match in dateMatches)
            {
                if (TryParseDate(match.Value, formats, out DateTime dt))
                {
                    bool alreadyUsed = false;
                    foreach (var pair in result)
                    {
                        if ((pair.from.HasValue && pair.from.Value == dt) ||
                            (pair.to.HasValue && pair.to.Value == dt))
                        {
                            alreadyUsed = true;
                            break;
                        }
                    }
                    if (!alreadyUsed) standaloneDates.Add(dt);
                }
            }
   
            for (int i = 0; i < standaloneDates.Count; i += 2)
            {
                DateTime? from = standaloneDates[i];
                DateTime? to = (i + 1 < standaloneDates.Count) ? standaloneDates[i + 1] : (DateTime?)null;
                result.Add((from, to));
            }

            return result;
        }
        public static bool TryParseDate(string dateStr, string[] formats, out DateTime date)
        {
            foreach (var format in formats)
            {
                if (DateTime.TryParseExact(dateStr, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out date))
                {
                    return true;
                }
            }
            date = DateTime.MinValue;
            return false;
        }
    }
}
