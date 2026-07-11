using System.Data;
using System.Text.Json;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.Helper.Extensions;
using TeacherApp.Modules.KnowledgeBase.Helper;
using TeacherApp.Modules.KnowledgeBase.Models;
using TeacherApp.Modules.KnowledgeBase.Services;
using TeacherApp.Modules.Repositories.SchemaDictionary;

public class TeacherAiSqlService
{
    private readonly OpenAIService _client;
    private readonly Dictionary<string, List<string>> _columns;
    private readonly Dictionary<string, List<string>> _tables;
    private readonly Dictionary<string, List<string>> _currentUserParameters;
    private readonly List<(string FromTable, string FromCol, string ToTable, string ToCol)> _relationships;
    private readonly Dictionary<string, string> _templates;
    private readonly List<NamesAbbreviations> _NamesAbbre;
    private readonly Prompts _prompts;

    public TeacherAiSqlService(OpenAIService openAIService)
    {
        _client = openAIService;
        _tables = DatabaseSchema.TablesAbbre;
        _columns = DatabaseSchema.Tables;
        _relationships = DatabaseSchema.Relationships;
        _templates = DatabaseSchema.Templates;
        _prompts = HelperMethods.AiPrompts();
        _NamesAbbre = HelperMethods.JsonDeserialize<List<NamesAbbreviations>>(DatabaseSchema.NamesAbbre);
    }
    public async Task<string> DetectAndGenerateAsync(string prompt, Dictionary<string, object> userContextParameter)
    {
        string resultQuery = "";
        resultQuery = await DetectIntentAIAsync(prompt, userContextParameter);
        return resultQuery;
        //if (IsMarketAnalysis(prompt))
        //{
        //    string analysis = await GenerateSqlAIAsync(prompt); 
        //    return new SqlIntentResult { Operation = "MARKET_ANALYSIS", SqlQuery = analysis, RequiresAI = true };
        //}

        //foreach (var tpl in _templates)
        //    if (prompt.ToLower().Contains(tpl.Key.ToLower().Replace(" ", "")))
        //        return new SqlIntentResult { SqlQuery = tpl.Value, RequiresAI = false };

        //var (operation, aggregates) = DetectOperation(prompt);

        //var intent = new SqlIntentResult
        //{
        //    Operation = operation,
        //    Tables = DetectTables(prompt),
        //    Columns = DetectColumns(prompt),
        //    Aggregates = aggregates,
        //    Conditions = DetectConditions(prompt)
        //};

        //  resultQuery = await DetectIntentAIAsync(prompt, userContextParameter);
        //intent.SqlQuery = await GenerateSqlAIAsync(prompt);

        //bool requiresAI = (prompt.ToLower().Contains("forecast") || prompt.ToLower().Contains("trend") ) && (intent.Tables.Count == 0 || intent.Columns.Count == 0);
        //if (requiresAI)
        //{
        //    intent = await DetectIntentAIAsync(prompt);
        //    intent.SqlQuery = await GenerateSqlAIAsync(prompt);
        //}
        //else
        //{
        //    intent.SqlQuery = GenerateSql(intent);
        //}

        // intent.SqlQuery = ApplyEntityFilter(intent.SqlQuery, prompt);
        //   intent.SqlQuery = MakeHolidayAware(intent.SqlQuery);
        //   intent.SqlQuery = AddForecasting(intent.SqlQuery, prompt);
        // intent.SqlQuery = InjectParameters(intent.SqlQuery, userContext);

        return resultQuery;
    }

    #region sql methods


    private (string Operation, List<string> Aggregates) DetectOperation(string prompt)
    {
        string p = prompt.ToLower();
        var detectedAggregates = new List<string>();

        // Basic SELECT triggers
        if (p.Contains("show") || p.Contains("list") || p.Contains("get") ||
            p.Contains("select") || p.Contains("detail"))
        {
            return ("SELECT", detectedAggregates);
        }

        // Check for aggregate keywords using AggregatesAbbre
        foreach (var kv in DatabaseSchema.AggregatesAbbre)
        {
            if (kv.Value.Any(alias => p.Contains(alias.ToLower())))
            {
                if (!detectedAggregates.Contains(kv.Key))
                    detectedAggregates.Add(kv.Key);
            }
        }

        if (detectedAggregates.Count > 0)
            return ("AGGREGATE", detectedAggregates);

        return ("UNKNOWN", detectedAggregates);
    }

 

    private List<string> DetectTables(string prompt)
    {
        var tabs = new List<string>();
        string lower = prompt.ToLower();

        foreach (var kv in _tables) 
        {
            foreach (var c in kv.Value)
            {
                if (lower.Contains(c.ToLower()))
                {
                    if (!tabs.Contains(kv.Key)) // avoid duplicates
                        tabs.Add(kv.Key);
                }
            }
        }

        return tabs;
    }


    private List<string> DetectColumns(string prompt)
    {
        var cols = new List<string>();
        string lower = prompt.ToLower();
        foreach (var kv in _columns)
            foreach (var c in kv.Value)
            {               
                if (lower.Contains(" " + c.ToLower() + " ")) cols.Add($"{kv.Key}.{c}");
            }              
        return cols;
    }

    private List<string> DetectConditions(string prompt)
    {
        var conds = new List<string>();
        string lower = prompt.ToLower();

        if (lower.Contains("last 30 days")) conds.Add("StartDate >= DATEADD(DAY, -30, GETDATE())");
        if (lower.Contains("this month")) conds.Add("MONTH(StartDate) = MONTH(GETDATE()) AND YEAR(StartDate) = YEAR(GETDATE())");
      

        return conds;
    }

    private string BuildJoinClause(List<string> tables)
    {
        if (tables.Count <= 1) return "";
        var joinClauses = new List<string>();
        var used = new HashSet<string> { tables[0] };
        foreach (var t in tables.Skip(1))
            foreach (var rel in _relationships)
            {
                if (used.Contains(rel.FromTable) && rel.ToTable == t) { joinClauses.Add($"JOIN [{rel.ToTable}] ON [{rel.FromTable}].[{rel.FromCol}] = [{rel.ToTable}].[{rel.ToCol}]"); used.Add(t); break; }
                if (used.Contains(rel.ToTable) && rel.FromTable == t) { joinClauses.Add($"JOIN [{rel.FromTable}] ON [{rel.FromTable}].[{rel.FromCol}] = [{rel.ToTable}].[{rel.ToCol}]"); used.Add(t); break; }
            }
        return string.Join(" ", joinClauses);
    }

    private string GenerateSql(SqlIntentResult intent)
    {
        if (intent.Tables.Count == 0) return "-- Unable to generate SQL query";

        string baseTable = intent.Tables.First();
        string joins = BuildJoinClause(intent.Tables);
        string whereClause = intent.Conditions.Count > 0 ? " WHERE " + string.Join(" AND ", intent.Conditions) : "";
        string sql = "";

        switch (intent.Operation)
        {
            case "SELECT":
                var cols = intent.Columns.Count > 0 ? string.Join(", ", "["+intent.Columns+"]") : "*";
                sql = $"SELECT {cols} FROM [{baseTable}] {joins}{whereClause}"; break;
            case "AGGREGATE":
                if (intent.Aggregates.Count > 0 && intent.Columns.Count > 0)
                {
                    string col = intent.Columns.First().Split('.').Last();
                    string agg = intent.Aggregates.First();
                    sql = $"SELECT {agg}({baseTable}.{col}) AS [{agg}_{col}] FROM [{baseTable}] {joins}{whereClause}";
                }
                else sql = "-- Could not determine aggregate column"; break;

        }

        return sql;
    }

    private async Task<string> DetectIntentAIAsync(string prompt, Dictionary<string, object> loggedInUserContext)
    {
        string sqlQyery = "";
        try
        {

            string SystemPrompt =
            @"You are a SQL intent detection expert for the Teacher AI application.

---

**Schema:**  
{schemaInfo}

**Relationships (Foreign Keys):**  
{relationships}

**Logged-In User Parameters:**  
{loggedInParameter}

---

**Instructions:**

1. Detect the SQL operation: `SELECT`, `INSERT`, `UPDATE`, or `DELETE`.
2. Extract relevant:
   - Tables
   - Columns
   - Filter conditions
   - Aggregate functions
3. Use the exact names from the schema.  
   - Do NOT rename or alter any table or column names.  
   - Aliases are allowed for readability.
4. Use **actual values** in the `conditions` array:  
   - If the user query references a value available in `loggedInParameter` (e.g., `@CurrentUserSchoolId with its Actual Value 80.`),  
     replace it with the corresponding actual value .  
   - Example: if `@CurrentUserSchoolId = 1`, then generate `SchoolId = 1`.
5. If the prompt involves analytics or aggregations but lacks required values, populate the `missingInputs` array:
   - Use C# dictionary abbreviation keys (e.g., `""LessonDetail""`, `""User""`).
6. Support advanced analytics when applicable:
   - Time series, forecasting, trends, lesson coverage
7. Always include valid filtering logic based on user and entity context.

---

**Respond ONLY in JSON**, using the format below:

```json
{
  ""operation"": null,
  ""tables"": [],
  ""columns"": [],
  ""aggregates"": [],
  ""conditions"": [],
  ""requiresAI"": true,
  ""analyticsFunctions"": [],
  ""missingInputs"": []
}

";
            string schemaInfo = string.Join(", ",
                _columns.Select(kv => $"[{kv.Key}]({string.Join(", ", kv.Value)})"));

            string relationships = string.Join(", ",
                _relationships.Select(kv => $"[{kv.FromTable}].[{kv.FromCol}] = [{kv.ToTable}].[{kv.ToCol}]"));

            var parser = new ContextParser(_NamesAbbre);
            parser.Parse(prompt);
            if (!string.IsNullOrEmpty(parser.Subject))
            {
                loggedInUserContext.Add("Subject", parser.Subject);
            }
            if (!string.IsNullOrEmpty(parser.Grade))
            {
                loggedInUserContext.Add("Grade", parser.Grade);
            }

            string userParam = string.Join(", ",
               loggedInUserContext.Select(kv => $"@{kv.Key}={kv.Value}"));

            string completePrompt = SystemPrompt
                .Replace("{schemaInfo}", schemaInfo)
                .Replace("{relationships}", relationships)
                .Replace("{loggedInParameter}", userParam);


            string content = await _client.GetSqlIntentAIAsync(prompt, completePrompt);

             sqlQyery = await GenerateSqlAIAsync(content, prompt);

            //content = content.Trim();
            //if (content.StartsWith("```") && content.EndsWith("```"))
            //{
            //    int firstLineEnd = content.IndexOf('\n');
            //    content = content.Substring(firstLineEnd + 1); // Remove the ```json line
            //    content = content.Substring(0, content.LastIndexOf("```")).Trim(); // Remove the ending ```
            //}

            //intent = JsonSerializer.Deserialize<SqlIntentResult>(content) ?? new SqlIntentResult();

            // intent.Conditions.AddRange(DetectConditions(prompt));
        }
        catch (Exception ex)
        {
            // Log exception if needed
            // _logger.LogError(ex, "Error detecting SQL intent");
        }

        return sqlQyery;
    }

    private async Task<string> GenerateSqlAIAsync(string sqlIntentJson ,string userPrompt)
    {

        string systemPrompt = @"You are a SQL generator for the Teacher AI application.

Below is the SQL intent along with the schema context.  
Use them to generate a valid and parameterized SQL query.

---

**Intent:**  
{sqlIntentJson}

**Schema:**  
{schemaInfo}

**Relationships:**  
{relationships}

---

**Instructions:**

1. Generate a valid **parameterized SQL query** based on the intent provided.
2. Use only the exact table and column names from the schema.  
   - Do **not** rename, abbreviate, or infer additional fields.
3. Where Clause  
   - Apply all filters listed in the conditions array  
     use that value
   - If a condition includes a literal value (e.g., Grade = '3rd Grade'), use that value directly
   - Do not create new parameters — use only values provided in the intent.
4. Use only the provided relationships to construct necessary JOIN clauses between tables.
5. Aggregates
   - If aggregates are present, apply the correct SQL functions (COUNT, AVG, etc.).
   - Add GROUP BY clauses when required by the aggregation logic.
6. Analytics Functions
   - If present, use appropriate SQL time-based grouping or window functions (e.g., for ""trend"" or ""forecast"").
7. Formatting
   - Output only the SQL query inside a code block.
   - Do not include any explanation, comment, or formatting outside the query itself.

---

**Output Format:**
-- Final parameterized SQL query
";

        string schemaInfo = string.Join(", ", _columns.Select(kv => $"{kv.Key}({string.Join(", ", kv.Value)})"));
        string relationships = string.Join(", ", _relationships.Select(kv => $"[{kv.FromTable}].[{kv.FromCol}]=[{kv.ToTable}].[{kv.ToCol}]"));

        string _CompletePrompt = systemPrompt.Replace("{sqlIntentJson}", sqlIntentJson);
         _CompletePrompt = _CompletePrompt.Replace("{schemaInfo}", schemaInfo);
        _CompletePrompt = _CompletePrompt.Replace("{relationships}", relationships);

        string content = await _client.GetSqlIntentAIAsync(userPrompt, _CompletePrompt);

        return content.Trim();
    }

    private bool IsMarketAnalysis(string prompt)
    {
        string lower = prompt.ToLower();
        return lower.Contains("market") || lower.Contains("financial") || lower.Contains("revenue") || lower.Contains("global") || lower.Contains("comparison");
    }

    private string ApplyEntityFilter(string sql, string prompt)
    {
        string lower = prompt.ToLower();
        if (lower.Contains("student"))
        {
            int startIdx = lower.IndexOf("student") + 7;
            int endIdx = lower.IndexOf(" is", startIdx);
            if (endIdx < 0) endIdx = prompt.Length;
            string studentName = prompt.Substring(startIdx, endIdx - startIdx).Trim();
            if (!string.IsNullOrEmpty(studentName))
                sql += sql.Contains("WHERE") ? $" AND Students.Name = '{studentName}'" : $" WHERE Students.Name = '{studentName}'";
        }
        return sql;
    }

    private string InjectParameters(string sql, Dictionary<string, object> context)
    {
        foreach (var kv in context)
            sql = sql.Replace("@" + kv.Key, kv.Value.ToString());
        return sql;
    }

    private string MakeHolidayAware(string sql)
    {
        string condition = "NOT EXISTS (SELECT 1 FROM SchoolHolidays SH WHERE SH.SchoolId = Students.SchoolId AND LP.StartDate BETWEEN SH.StartDate AND SH.EndDate)";
        return sql.Contains("WHERE") ? sql + " AND " + condition : sql + " WHERE " + condition;
    }

    private string AddForecasting(string sql, string prompt)
    {
        string lower = prompt.ToLower();
        if (!lower.Contains("forecast") && !lower.Contains("trend")) return sql;

        string datePart = lower.Contains("week") ? "WEEK" : "MONTH";
        string forecastSql = $@"
WITH LessonTrend AS (
{sql.Replace(";", "")}
)
SELECT LT.*,
       AVG(CompletedLessons) OVER (ORDER BY DATEPART({datePart}, StartDate) ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS [MovingAvgCompleted],
       LEAD(CompletedLessons, 1) OVER (ORDER BY DATEPART({datePart}, StartDate)) AS [ForecastNextPeriod]
FROM LessonTrend
ORDER BY DATEPART({datePart}, StartDate);";

        return forecastSql;
    }

    #endregion
}
