using System.Text.Json;
using System.Text.Json.Serialization;

public class QdrantSearchHit
{
    public string? Id { get; set; }
    public double Score { get; set; }
    public JsonElement Payload { get; set; }
    public string PayloadJson { get; set; }
    public float[] Vector { get; set; }
}

public class QdrantSearchResponse
{
    [JsonPropertyName("result")]
    public List<JsonElement> Result { get; set; }
}

public class ChatAnswerResult
{
    public string Answer { get; set; }
    public List<QdrantSearchHit> Hits { get; set; } = new();
    public string RawQdrantResponse { get; set; }
}