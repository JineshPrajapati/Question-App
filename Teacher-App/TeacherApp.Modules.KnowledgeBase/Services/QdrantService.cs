using Google.Protobuf.WellKnownTypes;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using OpenAI;
using OpenAI.VectorStores;
using Qdrant.Client.Grpc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using TeacherApp.Modules.Entities.Entities;
using TeacherApp.Modules.KnowledgeBase.Models;
using Struct = Google.Protobuf.WellKnownTypes.Struct;
using Value = Google.Protobuf.WellKnownTypes.Value;

namespace TeacherApp.Modules.KnowledgeBase.Services
{

    public class QdrantService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;
        private readonly PdfChunkService _pdfChunkService;
        private readonly EmbeddingService _embeddingService;
        private readonly OpenAIService _openAIService;
        private readonly ILogger<QdrantService> _logger;
        private readonly int _vectorSize;

        public QdrantService(
        HttpClient httpClient,
          IConfiguration config,
          EmbeddingService embeddingService, OpenAIService openAIService, PdfChunkService pdfChunkService, ILogger<QdrantService> logger)
        {
            _httpClient = httpClient;
            _config = config;
            _embeddingService = embeddingService;
            _pdfChunkService = pdfChunkService;
            _openAIService = openAIService;
            _logger = logger;

        }

        public async Task EnsureCollectionExistsAsync(string _collection)
        {
            if (string.IsNullOrEmpty(_collection))
            {
                return;
            }

            var checkResponse = await _httpClient.GetAsync($"/collections/{_collection ?? ""}");
            if (checkResponse.IsSuccessStatusCode)
                return;
            var _vectorSize = int.Parse(_config["OpenAI:ChunkSize"] ?? "0");
            var collectionPayload = new
            {
                vectors = new
                {
                    size = _vectorSize,
                    distance = "Cosine"
                }
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var json = System.Text.Json.JsonSerializer.Serialize(collectionPayload, options);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var createResponse = await _httpClient.PutAsync($"/collections/{_collection ?? ""}", content);



            if (!createResponse.IsSuccessStatusCode)
            {
                var error = await createResponse.Content.ReadAsStringAsync();
                throw new Exception($"Failed to create Qdrant collection: {error}");
            }

        }

        public async Task UpsertLessonPlanAsync(string lessonFormat, string fromDate, string endDate, ScopeResponse dto, List<string> chunks)
        {
            var points = new List<PointStruct>();
            try
            {
                int batchSize = (chunks.Count >= 5) ? (chunks.Count / 5) : chunks.Count;
                var embeddings = await _embeddingService.GenerateBatchedEmbeddingsAsync(chunks, batchSize);

                for (int i = 0; i < embeddings.Count; i++)
                {
                    var pointId = $"{dto.AcademicYearId}_{dto.SchoolId}_{dto.User}_{dto.Grade}_{dto.Subject}_{lessonFormat}_{fromDate}_{endDate}_chunk_{i}";

                    var metaIndex = new Dictionary<string, Google.Protobuf.WellKnownTypes.Value>
                    {
                        ["AcademicYear"] = Value.ForString(dto.AcademicYear),
                        ["State"] = Value.ForString(dto.State),
                        ["District"] = Value.ForString(dto.District),
                        ["School"] = Value.ForString(dto.School),
                        ["User"] = Value.ForString(dto.User),
                        ["Source"] = Value.ForString("lessonPlan"),
                        ["Role"] = Value.ForString(dto.RoleName),
                        ["Grade"] = Value.ForString(dto.Grade),
                        ["Subject"] = Value.ForString(dto.Subject),
                        ["LessonFormat"] = Value.ForString(lessonFormat),
                        ["FromDate"] = Value.ForString(fromDate),
                        ["EndDate"] = Value.ForString(endDate),
                        ["Content"] = Value.ForString(chunks[i])
                    };
                    points.Add(new PointStruct
                    {
                        Id = (ulong)pointId.GetHashCode(),
                        Vector = embeddings[i].ToList(),
                        Payload = metaIndex
                    });
                }

                await UpsertPointsAsync(dto.SchoolId.Value, points);

            }
            catch (Exception ex)
            {


            }
        }

        public async Task UpsertPointsAsync(int schoolId, List<PointStruct> points)
        {

            string _collectionName = _config["Qdrant:Collection"];
            if (schoolId > 0)
            {
                _collectionName = "school_" + schoolId;

            }

            try
            {
                await EnsureCollectionExistsAsync(_collectionName);

                var upsertPayload = new
                {
                    points = points.Select(p => new
                    {
                        id = p.Id,
                        vector = p.Vector,
                        payload = ConvertPayload(p.Payload)
                    }).ToList()
                };

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

                var json = System.Text.Json.JsonSerializer.Serialize(upsertPayload, options);

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PutAsync($"/collections/{_collectionName ?? ""}/points", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Failed to upsert points: {error}");
                }
            }
            catch (Exception ex)
            {


            }
        }

        private static Dictionary<string, object> ConvertPayload(Dictionary<string, Value> payload)
        {
            var dict = new Dictionary<string, object>();

            foreach (var kvp in payload)
            {
                switch (kvp.Value.KindCase)
                {
                    case Value.KindOneofCase.StringValue:
                        dict[kvp.Key] = kvp.Value.StringValue;
                        break;
                    case Value.KindOneofCase.NumberValue:
                        dict[kvp.Key] = kvp.Value.NumberValue;
                        break;
                    case Value.KindOneofCase.BoolValue:
                        dict[kvp.Key] = kvp.Value.BoolValue;
                        break;
                    case Value.KindOneofCase.ListValue:
                        dict[kvp.Key] = kvp.Value.ListValue.Values
                            .Select(v => v.KindCase == Value.KindOneofCase.StringValue ? (object)v.StringValue : v.NumberValue)
                            .ToList();
                        break;
                    default:
                        dict[kvp.Key] = null;
                        break;
                }
            }

            return dict;
        }

        public async Task<(string rawJson, List<QdrantSearchHit> hits)> SearchInQdrantAsync(string collection, float[] embedding, int topK = 3)
        {
            var hits = new List<QdrantSearchHit>();
            string raw = "";

            try
            {


                var payload = new
                {
                    vector = embedding,
                    limit = topK,
                    with_payload = true,
                    with_vector = true
                };

                var json = System.Text.Json.JsonSerializer.Serialize(payload);
                using var content = new StringContent(json, Encoding.UTF8, "application/json");

                var resp = await _httpClient.PostAsync($"/collections/{collection ?? ""}/points/search", content);
                raw = await resp.Content.ReadAsStringAsync();
                resp.EnsureSuccessStatusCode();


                using var doc = JsonDocument.Parse(raw);
                if (doc.RootElement.TryGetProperty("result", out var resArr))
                {
                    foreach (var item in resArr.EnumerateArray())
                    {
                        var hit = new QdrantSearchHit();

                        if (item.TryGetProperty("id", out var idEl))
                            hit.Id = idEl.ValueKind == JsonValueKind.Number ? idEl.GetRawText() : idEl.GetString();

                        if (item.TryGetProperty("score", out var scoreEl))
                            hit.Score = scoreEl.GetDouble();

                        if (item.TryGetProperty("payload", out var payloadEl))
                        {
                            hit.PayloadJson = payloadEl.GetRawText();
                        }

                        if (item.TryGetProperty("vector", out var vectorEl))
                        {
                            var list = new List<float>();
                            foreach (var v in vectorEl.EnumerateArray())
                                list.Add(v.GetSingle());
                            hit.Vector = list.ToArray();
                        }

                        hits.Add(hit);
                    }
                }

            }
            catch (Exception ex)
            {


            }


            return (raw, hits);
        }

        public async Task<(string rawJson, List<QdrantSearchHit> hits)> SemanticSearchInQdrantAsync(string query, ScopeResponse dto)
        {
            string _collectionName = _config["Qdrant:Collection"];
            if (dto.SchoolId > 0)
            {
                _collectionName = "school_" + dto.SchoolId;

            }

            var hits = new List<QdrantSearchHit>();
            string raw = "";

            var results = new List<(int? id, string? type, double? score)>();
            try
            {
                await EnsureCollectionExistsAsync(_collectionName);
                var _vectorSize = int.Parse(_config["OpenAI:ChunkSize"] ?? "0");
                var embedding = await _embeddingService.GetEmbedding(query);
                if (embedding.Length != _vectorSize)
                    throw new Exception($"Embedding size mismatch: expected {_vectorSize}, got {embedding.Length}");

                var mustConditions = new List<object>();
                if (!string.IsNullOrEmpty(dto.State)) mustConditions.Add(new
                {
                    key = "State",
                    match = new
                    {
                        value = dto.State
                    }
                });
                if (!string.IsNullOrEmpty(dto.District)) mustConditions.Add(new
                {
                    key = "District",
                    match = new
                    {
                        value = dto.District
                    }
                });
                if (!string.IsNullOrEmpty(dto.School)) mustConditions.Add(new
                {
                    key = "School",
                    match = new
                    {
                        value = dto.School
                    }
                });
                if (!string.IsNullOrEmpty(dto.Grade)) mustConditions.Add(new
                {
                    key = "Grade",
                    match = new
                    {
                        value = dto.Grade
                    }
                });
                if (!string.IsNullOrEmpty(dto.Subject)) mustConditions.Add(new
                {
                    key = "Subject",
                    match = new
                    {
                        value = dto.Subject
                    }
                });
                if (!string.IsNullOrEmpty(dto.User)) mustConditions.Add(new
                {
                    key = "User",
                    match = new
                    {
                        value = dto.User
                    }
                });

                if (!string.IsNullOrEmpty(dto.RequestFrom)) mustConditions.Add(new
                {
                    key = "FromDate",
                    match = new
                    {
                        value = dto.RequestFrom
                    }
                });


                if (!string.IsNullOrEmpty(dto.RequestTo)) mustConditions.Add(new
                {
                    key = "EndDate",
                    match = new
                    {
                        value = dto.RequestTo
                    }
                });


                var searchPayload = new
                {
                    vector = embedding,
                    top = 5,
                    with_payload = true,
                    with_vector = false,
                    filter = mustConditions.Count > 0 ? new
                    {
                        must = mustConditions
                    } : null
                };

                var json = new StringContent(System.Text.Json.JsonSerializer.Serialize(searchPayload), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"/collections/{_collectionName ?? ""}/points/search", json);
                var responseBody = await response.Content.ReadAsStringAsync();
                response.EnsureSuccessStatusCode();
                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"Qdrant search failed: {responseBody}");
                }

                using var doc = JsonDocument.Parse(responseBody);
                if (doc.RootElement.TryGetProperty("result", out var resArr))
                {
                    foreach (var item in resArr.EnumerateArray())
                    {
                        var hit = new QdrantSearchHit();

                        if (item.TryGetProperty("id", out var idEl))
                            hit.Id = idEl.ValueKind == JsonValueKind.Number ? idEl.GetRawText() : idEl.GetString();

                        if (item.TryGetProperty("score", out var scoreEl))
                            hit.Score = scoreEl.GetDouble();

                        if (item.TryGetProperty("payload", out var payloadEl))
                        {
                            hit.PayloadJson = payloadEl.GetRawText();
                        }

                        if (item.TryGetProperty("vector", out var vectorEl))
                        {
                            var list = new List<float>();
                            foreach (var v in vectorEl.EnumerateArray())
                                list.Add(v.GetSingle());
                            hit.Vector = list.ToArray();
                        }
                        hits.Add(hit);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Search error: {ex.Message}");
            }

            return (raw, hits);

        }
  
        public async Task<string> AnswerQuestionAsync(int? schoolId, string userQuestion,string SqlResult="", ScopeResponse? dto = null, string threadId = "", int topK = 5)
        {
            string _collectionName = _config["Qdrant:Collection"];
            if (schoolId > 0)
            {
                _collectionName = "school_" + schoolId;
            }

            var (raw, hits) = await SemanticSearchInQdrantAsync(userQuestion, dto);

            var contexts = new List<string>();
            foreach (var h in hits)
            {
                try
                {
                    if (h.PayloadJson != null)
                    {
                        using JsonDocument doc = JsonDocument.Parse(h.PayloadJson);
                        string content = doc.RootElement.GetProperty("Content").GetString();
                        if (!string.IsNullOrEmpty(content))
                        {
                            contexts.Add(content);
                            continue;
                        }
                        var parts = new List<string>();
                        parts.Add($"Title: {doc.RootElement.GetProperty("Title")}");
                        parts.Add($"Subject: {doc.RootElement.GetProperty("Subject")}");
                        parts.Add($"Grade: {doc.RootElement.GetProperty("Grade")}");
                        parts.Add($"State: {doc.RootElement.GetProperty("State")}");
                        parts.Add($"Payload: {h.PayloadJson}");
                        contexts.Add(string.Join(" | ", parts));
                    }
                }
                catch (Exception ex)
                {
                    contexts.Add(h.Payload.GetRawText());
                }
            }
            if (!string.IsNullOrEmpty(SqlResult))
            {
                JArray jsonArray = JArray.Parse(SqlResult);
                foreach (JObject obj in jsonArray)
                {
                    contexts.Add(obj.ToString(Formatting.None));
                }

            }


            var aiAnswer = await _openAIService.GetChatCompletionAsync(userQuestion, contexts, threadId);
            return aiAnswer;
        }

    }
}