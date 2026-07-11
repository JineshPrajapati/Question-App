using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using OpenAI.Embeddings;

namespace TeacherApp.Modules.KnowledgeBase.Services
{
    public class EmbeddingService
    {
        private readonly string _apiKey;
        private readonly string _embeddingModel;
        private const string OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings";

        public EmbeddingService(HttpClient httpClient, IConfiguration config)
        {
            _apiKey = config["OpenAI:ApiKey"];
            _embeddingModel = config["OpenAI:EmbeddingModel"];

        }

        public async Task<float[]> GetEmbedding(string input)
        {
            var vector = new List<float>();
            try
            {
                var embeddingRequest = new
                {
                    input,
                    model = _embeddingModel
                };


                using var client = new HttpClient(); ;
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                var response = await client.PostAsync(
                  OPENAI_EMBEDDING_URL,
                   new StringContent(JsonConvert.SerializeObject(embeddingRequest), Encoding.UTF8, "application/json")
               );

                var responseString = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseString);

                foreach (var val in doc.RootElement.GetProperty("data")[0].GetProperty("embedding").EnumerateArray())
                {
                    vector.Add(val.GetSingle());
                }

            }
            catch (Exception ex)
            {


            }
            return vector.ToArray();

        }

        public async Task<List<float[]>> GenerateBatchedEmbeddingsAsync(List<string> texts, int batchSize)
        {
            var results = new List<float[]>();
            try
            {
           
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

                for (int i = 0; i < texts.Count; i += batchSize)
                {
                    var batch = texts.Skip(i).Take(batchSize).ToList();
                    var embeddingRequest = new
                    {
                        input = batch,
                        model = _embeddingModel
                    };

                    var requestBody = System.Text.Json.JsonSerializer.Serialize(embeddingRequest);
                    var response = await client.PostAsync(
                        OPENAI_EMBEDDING_URL,
                        new StringContent(requestBody, Encoding.UTF8, "application/json"));

                    response.EnsureSuccessStatusCode();

                    var responseString = await response.Content.ReadAsStringAsync();

                    using var doc = JsonDocument.Parse(responseString);
                    var dataArray = doc.RootElement.GetProperty("data");

                    foreach (var item in dataArray.EnumerateArray())
                    {
                        var embeddingJson = item.GetProperty("embedding").EnumerateArray();
                        var embedding = embeddingJson.Select(e => e.GetSingle()).ToArray();
                        results.Add(embedding);
                    }

                }
            }
            catch (Exception ex)
            {

            
            }

            return results;
        }
    }
}
