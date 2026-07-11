using System.Collections.Generic;
using Google.Protobuf.WellKnownTypes;

public class PointStruct
{  
    public ulong Id { get; set; }
    public IList<float> Vector { get; set; } = new List<float>();
    public Dictionary<string, Value> Payload { get; set; } = new Dictionary<string, Value>();
}

public class VectorParams
{
    public int Size { get; set; }
    public string Distance { get; set; }
}

public class CollectionCreateRequest
{
    public object Vectors { get; set; }
}
