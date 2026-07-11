// File: Program.cs

using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace CurriculumExtractor
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Enter your OpenAI API Key:");
            string apiKey = Console.ReadLine();

            Console.WriteLine("Enter full path to the curriculum PDF:");
            string pdfPath = Console.ReadLine();

            var pdfText = PdfReader.ExtractTextFromPdf(pdfPath);

            var aiClient = new OpenAiClient(apiKey);
            var jsonResponse = await aiClient.ExtractLessonsAsync(pdfText);

            var extractedJson = JsonHelper.ExtractJsonFromOpenAIResponse(jsonResponse);

            string outputPath = Path.Combine(Directory.GetCurrentDirectory(), "CurriculumOutput.json");
            await File.WriteAllTextAsync(outputPath, extractedJson);

            Console.WriteLine($"Lesson content extracted and saved to {outputPath}");
        }
    }
}

// File: PdfReader.cs

using System.Text;
using UglyToad.PdfPig;

namespace CurriculumExtractor
{
    public static class PdfReader
    {
        public static string ExtractTextFromPdf(string filePath)
        {
            var sb = new StringBuilder();
            using (var document = PdfDocument.Open(filePath))
            {
                foreach (var page in document.GetPages())
                {
                    sb.AppendLine(page.Text);
                }
            }
            return sb.ToString();
        }
    }
}

// File: OpenAiClient.cs

using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace CurriculumExtractor
{
    public class OpenAiClient
    {
        private readonly string apiKey;
        private readonly HttpClient httpClient;

        public OpenAiClient(string apiKey)
        {
            this.apiKey = apiKey;
            httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        }

        public async Task<string> ExtractLessonsAsync(string curriculumText)
        {
            var requestBody = new
            {
                model = "gpt-4o",
                messages = new[]
                {
                    new { role = "system", content = "You are an AI that extracts curriculum data." },
                    new
                    {
                        role = "user",
                        content = "Extract all lessons from the following curriculum text. Return as JSON in the format: " +
                                  "[{\"Title\": \"Lesson Title\", \"Content\": \"Lesson content...\", \"KeyTopics\": [\"topic1\", \"topic2\"]}]\n\n" +
                                  "Curriculum Text:\n" + curriculumText
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                new StringContent(json, Encoding.UTF8, "application/json"));

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
    }
}

// File: JsonHelper.cs

using System.Text.Json;

namespace CurriculumExtractor
{
    public static class JsonHelper
    {
        public static string ExtractJsonFromOpenAIResponse(string openAiResponse)
        {
            var doc = JsonDocument.Parse(openAiResponse);
            var content = doc.RootElement.GetProperty("choices")[0]
                             .GetProperty("message")
                             .GetProperty("content")
                             .GetString();

            return content;
        }
    }
}
