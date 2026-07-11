
using System.Text.Json;
using TeacherApp.Modules.Entities.Entities;


namespace TeacherApp.Modules.KnowledgeBase.Helper
{
    public static class HelperMethods
    {

        public static DateTime DateParse(string? dateStr)
        {
            return DateTime.TryParse(dateStr, out var date) ? date : DateTime.MinValue;
        }
        public static List<string> ExtractNonEmptyDistinct(IEnumerable<string?>? source)
        {
            return source?.Where(json => !string.IsNullOrWhiteSpace(json)).Distinct().ToList() ?? new List<string>();


        }

        public static List<T>? DeserializePlans<T>(string json) where T : class
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };


            json = json.Trim();

            if (json.StartsWith("{"))
            {
                var singlePlan = JsonSerializer.Deserialize<T>(json, options);
                return singlePlan != null ? [singlePlan] : new List<T>();
            }


            if (json.StartsWith("["))
            {
                var plans = JsonSerializer.Deserialize<List<T>>(json, options);
                return plans ?? new List<T>();
            }


            throw new ArgumentException("Invalid JSON format for lesson plans.");
        }

        public static T? JsonDeserialize<T>(string json) where T : class
        {
            try
            {
                json = json.Trim();
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                return JsonSerializer.Deserialize<T>(json, options);
            }
            catch
            {
                return null;
            }
        }

        public static string? JsonSerialize(object obj)
        {
            if (obj == null) { return null; }
            try
            {

                var options = new JsonSerializerOptions
                {
                    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
                    WriteIndented = true,
                    PropertyNameCaseInsensitive = true
                };

                return JsonSerializer.Serialize(obj, options);
            }
            catch
            {
                return null;
            }
        }

        public static Prompts AiPrompts()
        {
            Prompts prompts = new Prompts();
            try
            {


                string jsonPath = Path.Combine(AppContext.BaseDirectory, "public", "assets", "files", "prompts.json");
                if (!System.IO.File.Exists(jsonPath))
                {
                    throw new FileNotFoundException($"Prompt file not found: {jsonPath}");
                }
                string jsonContent = System.IO.File.ReadAllText(jsonPath);

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                prompts = JsonSerializer.Deserialize<Prompts>(jsonContent, options);

            }
            catch (Exception ex)
            {


            }

            return prompts;

        }
    }
}
