using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;
using System.Text.Json;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.KnowledgeBase.Models;
using JsonSerializer = System.Text.Json.JsonSerializer;


namespace TeacherApp.Modules.KnowledgeBase.Services
{
    public class OpenAIService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private readonly string _llmModel;
        public OpenAIService(IConfiguration config, HttpClient http)
        {
            _http = http;
            _config = config;
            _llmModel = _config["OpenAI:LlmModel"] ?? "gpt-4.1";
     
        }


        public async Task<List<T>> GenerateJson<T>(string prompt, int maxRetries = 3)
        {
            var request = new
            {
                model = _llmModel,
                messages = new[]
                {
            new { role = "system", content = "You are a curriculum AI. Return only valid JSON arrays as response." },
            new { role = "user", content = prompt }
        },
                temperature = 0
            };

            int retryCount = 0;

            while (retryCount < maxRetries)
            {
                try
                {
                    //using var client = _http;
                    //client.DefaultRequestHeaders.Clear();
                    //client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
                    //client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

                    var response = await _http.PostAsync(
                        "v1/chat/completions",
                        new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json")
                    );

                    string responseBody = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        // Retry on rate limit or server errors
                        if ((int)response.StatusCode == 429 || (int)response.StatusCode >= 500)
                        {
                            retryCount++;
                            await Task.Delay(1000 * retryCount);
                            continue;
                        }

                        throw new Exception($"OpenAI API Error: {response.StatusCode} - {responseBody}");
                    }

                    using var doc = JsonDocument.Parse(responseBody);
                    string content = doc.RootElement
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString();


                    if (!IsValidJson(content))
                    {
                        retryCount++;
                        Console.WriteLine($"[Warning] Malformed JSON received. Retrying... Attempt {retryCount}/{maxRetries}");
                        continue;
                    }

                    return JsonSerializer.Deserialize<List<T>>(content, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (Exception ex)
                {
                    retryCount++;
                    Console.WriteLine($"[Retry {retryCount}/{maxRetries}] Error: {ex.Message}");

                    if (retryCount >= maxRetries)
                        throw new Exception($"Failed after {maxRetries} retries. Last error: {ex.Message}", ex);

                    await Task.Delay(1000 * retryCount); // exponential backoff
                }
            }
            return null;


        }

        public async Task<string> GetChatCompletionAsync(string question, List<string> contexts, string threadId = "")
        {
            string returnMessage = "No Answer Found! Please try again later.";

            try
            {               
                var userBuilder = new StringBuilder();
                userBuilder.AppendLine("Context:");
                foreach (var c in contexts)
                {
                    userBuilder.AppendLine(c);
                    userBuilder.AppendLine("---");
                }
                userBuilder.AppendLine();
                userBuilder.AppendLine("User question:");
                userBuilder.AppendLine(question);

                var baseUrl = "https://api.openai.com/v1";
                var assistantId = _config["OpenAI:AssistantId"];

                _http.DefaultRequestHeaders.Clear();
                _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config["OpenAI:ApiKey"]}");
                _http.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");

                if (string.IsNullOrEmpty(threadId))
                {
                    threadId = await CreateNewAiThread();
                }

                // 1. Add user message
                var userMessage = new
                {
                    role = "user",
                    content = userBuilder.ToString()
                };

                var msgContent = new StringContent(JsonSerializer.Serialize(userMessage), Encoding.UTF8, "application/json");
                using var msgResp = await _http.PostAsync($"{baseUrl}/threads/{threadId}/messages", msgContent);
                msgResp.EnsureSuccessStatusCode();

                // 2. Create run
                var runReq = new { assistant_id = assistantId };
                var runContent = new StringContent(JsonSerializer.Serialize(runReq), Encoding.UTF8, "application/json");
                using var runResp = await _http.PostAsync($"{baseUrl}/threads/{threadId}/runs", runContent);
                runResp.EnsureSuccessStatusCode();

                using var runDoc = JsonDocument.Parse(await runResp.Content.ReadAsStringAsync());
                var runId = runDoc.RootElement.GetProperty("id").GetString();

                // 3. Poll run until completed
                string runStatus = "";
                do
                {
                    await Task.Delay(1000); // wait 1s between polls
                    using var statusResp = await _http.GetAsync($"{baseUrl}/threads/{threadId}/runs/{runId}");
                    statusResp.EnsureSuccessStatusCode();

                    using var statusDoc = JsonDocument.Parse(await statusResp.Content.ReadAsStringAsync());
                    runStatus = statusDoc.RootElement.GetProperty("status").GetString();
                }
                while (runStatus == "queued" || runStatus == "in_progress");

                if (runStatus != "completed")
                {
                    return $"Run did not complete successfully. Status: {runStatus}";
                }

                // 4. Get messages (latest assistant response)
                using var historyResp = await _http.GetAsync($"{baseUrl}/threads/{threadId}/messages");
                historyResp.EnsureSuccessStatusCode();

                using var historyDoc = JsonDocument.Parse(await historyResp.Content.ReadAsStringAsync());
                var messages = historyDoc.RootElement.GetProperty("data");

                var responseMessage = messages
                    .EnumerateArray()
                    .Where(m => m.GetProperty("role").GetString() == "assistant")
                    .OrderByDescending(m => m.GetProperty("created_at").GetInt64())
                    .FirstOrDefault();

                if (responseMessage.ValueKind != JsonValueKind.Undefined)
                {
                    var responseContent = responseMessage
                        .GetProperty("content")[0]
                        .GetProperty("text")
                        .GetProperty("value")
                        .GetString();

                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        returnMessage = responseContent
                            .Replace("```markdown", "")
                            .Replace("```md", "")
                            .Replace("```html", "")
                            .Replace("```", "")
                            .Trim();
                    }
                }
            }
            catch (Exception ex)
            {
                returnMessage = $"Error while processing answer: {ex.Message}";
            }

            return returnMessage;
        }
        public async Task<string> GetSqlIntentAIAsync(string prompt, string sysPrompt)
        {
            string content = "";

            var request = new
            {
                model = _llmModel,
                messages = new[]
               {
            new { role = "system", content = sysPrompt},
            new { role = "user", content = prompt }
        },
                temperature = 0
            };

            try
            {

                var response = await _http.PostAsync(
                    "v1/chat/completions",
                    new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json")
                );

                string responseBody = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseBody);
              content = doc.RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

            

            }
            catch (Exception ex)
            {


            }
            return content;
        }
        public async Task<string> CreateNewAiThread()
        {
            string threadId = "";
            try
            {
                var baseUrl = "https://api.openai.com/v1";
                var assistantId = _config["OpenAI:AssistantId"];

                _http.DefaultRequestHeaders.Clear();
                _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config["OpenAI:ApiKey"]}");
                _http.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");  // 👈 add this line

                // 1. Create a thread
                if (string.IsNullOrEmpty(threadId))
                {
                    using var threadResp = await _http.PostAsync($"{baseUrl}/threads", new StringContent("{}", Encoding.UTF8, "application/json"));
                    var threadBody = await threadResp.Content.ReadAsStringAsync();
                    threadResp.EnsureSuccessStatusCode();

                    using var threadDoc = JsonDocument.Parse(threadBody);
                    threadId = threadDoc.RootElement.GetProperty("id").GetString();
                }
            }
            catch (Exception ex)
            {

                throw;
            }

            return threadId;
        }

        public async Task<List<AiAssistentChatEntity>> GetAiChatHistory(string threadId)
        {
            var messages = new List<AiAssistentChatEntity>();

            try
            {
                var baseUrl = "https://api.openai.com/v1";
                var assistantId = _config["OpenAI:AssistantId"];

                _http.DefaultRequestHeaders.Clear();
                _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config["OpenAI:ApiKey"]}");
                _http.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");  // 👈 add this line

                using var historyResp = await _http.GetAsync($"{baseUrl}/threads/{threadId}/messages");
                var historyBody = await historyResp.Content.ReadAsStringAsync();
                historyResp.EnsureSuccessStatusCode();

                using var doc = JsonDocument.Parse(historyBody);

                foreach (var msg in doc.RootElement.GetProperty("data").EnumerateArray())
                {
                    var id = msg.GetProperty("id").GetString();
                    var role = msg.GetProperty("role").GetString();
                    var createdAt = msg.GetProperty("created_at").GetInt64();

                    // content[0].text.value
                    var value = msg.GetProperty("content")[0]
                                   .GetProperty("text")
                                   .GetProperty("value")
                                   .GetString();

                    if (!string.IsNullOrEmpty(value))
                    {
                        var marker = "User question:";
                        var idx = value.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
                        if (idx >= 0)
                        {
                            value = value.Substring(idx + marker.Length).Trim();
                        }
                    }

                    messages.Add(new AiAssistentChatEntity
                    {
                        Id = id,
                        Sender = role,
                        Content = value,
                        CreatedAt = DateTimeOffset.FromUnixTimeSeconds(createdAt).DateTime,
                        Timestamp = DateTimeOffset.FromUnixTimeSeconds(createdAt).DateTime.ToLocalTime().ToString("dd/MM/yyyy hh:mm tt")
                    });
                }

                return messages.OrderBy(x => x.CreatedAt).ToList();
            }
            catch (Exception ex)
            {

            }

            return messages;
        }

        private string ExtractAnswerAsString(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.String:
                    return element.GetString() ?? "";

                case JsonValueKind.Array:

                    return string.Join(" ", element.EnumerateArray().Select(ExtractAnswerAsString));

                case JsonValueKind.Object:

                    var parts = element.EnumerateObject()
                                       .Select(p => $"{p.Name}: {ExtractAnswerAsString(p.Value)}");
                    return string.Join(" ", parts);

                case JsonValueKind.Number:
                    return element.GetRawText();

                case JsonValueKind.True:
                case JsonValueKind.False:
                    return element.GetBoolean().ToString();

                default:
                    return "";
            }
        }
        private bool IsValidJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json)) return false;

            try
            {
                JsonDocument.Parse(json);
                return true;
            }
            catch
            {
                return false;
            }
        }

       

    }

}
