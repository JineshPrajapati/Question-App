using MailKit;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using TeacherApp.Modules.Entities.Entities;

namespace TeacherApp.Modules.Helper.Extensions
{
    public  class ContextParser
    {
        private readonly Dictionary<string, (string OriginalName, string Context)> _abbrevLookup;

        private static readonly Regex WordSplitRegex = new(@"\b[\w\.&]+\b", RegexOptions.Compiled);

        public string Grade;
        public string Subject;

        public ContextParser(List<NamesAbbreviations> sqlResults)
        {
            Grade = string.Empty;
            Subject = string.Empty;
            _abbrevLookup = new Dictionary<string, (string, string)>(StringComparer.OrdinalIgnoreCase);

            _abbrevLookup = ConvertToAbbreviationDictionary(sqlResults);
        }

        public void Parse(string sentence)
        {
            var results = new List<(string, string, string)>();

            if (string.IsNullOrWhiteSpace(sentence))
                return;

            var multiWordKeys = _abbrevLookup.Keys
                //  .Where(k => k.Contains(' '))
                .OrderByDescending(k => k.Length)
                .ToList();

            foreach (var phrase in multiWordKeys)
            {
                foreach (var item in _abbrevLookup[phrase].OriginalName.Split(","))
                {
                    if (sentence.IndexOf(" "+item, StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        var val = _abbrevLookup[phrase];
                        results.Add((phrase, val.OriginalName, val.Context));
              
                    }
                }

            }
            Grade = results.FirstOrDefault(x => x.Item3.Equals("Grade")).Item1;
            Subject = results.FirstOrDefault(x => x.Item3.Equals("Subject")).Item1;
        }

     
       public static Dictionary<string, (string AbbreList, string Context)> ConvertToAbbreviationDictionary(List<NamesAbbreviations> sqlResults)


        {
            var dict = new Dictionary<string, (string AbbreList, string Context)>(StringComparer.OrdinalIgnoreCase);

            foreach (var row in sqlResults)
            {
                string originalName = row.OriginalName?.Trim();
                string abbreList = row.Abbreviations?.Trim();
                string context = row.Context?.Trim();

                if (!string.IsNullOrEmpty(originalName) && !string.IsNullOrEmpty(abbreList) && !string.IsNullOrEmpty(context))
                {
                    if (!dict.ContainsKey(originalName))
                    {
                        dict[originalName] = (abbreList, context);
                    }
                }
            }

            return dict;
        }


    }
}
