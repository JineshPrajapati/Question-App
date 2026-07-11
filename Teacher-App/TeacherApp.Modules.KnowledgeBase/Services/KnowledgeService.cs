using TeacherApp.Modules.KnowledgeBase.Models;

namespace TeacherApp.Modules.KnowledgeBase.Services
{
    public class KnowledgeService
    {


        public async Task SaveChunk(string title, string content, float[] embedding, string source)
        {
        

            var entity = new KnowledgeChunk
            {
                Title = title,
                Content = content,
                Embedding = FloatArrayToBytes(embedding),
                Source = source
            };
          
        }

        public static byte[] FloatArrayToBytes(float[] array)
        {
            byte[] bytes = new byte[array.Length * sizeof(float)];
            Buffer.BlockCopy(array, 0, bytes, 0, bytes.Length);
            return bytes;
        }

        public static float[] BytesToFloatArray(byte[] bytes)
        {
            float[] floats = new float[bytes.Length / sizeof(float)];
            Buffer.BlockCopy(bytes, 0, floats, 0, bytes.Length);
            return floats;
        }

        public async Task<List<KnowledgeChunk>> SearchSimilar(float[] queryEmbedding, int topK = 3)
        {
            //var chunks =

            //return chunks
            //    .Select(chunk => new
            //    {
            //        Chunk = chunk,
            //        Score = CosineSimilarity(queryEmbedding, BytesToFloatArray(chunk.Embedding))
            //    })
            //    .OrderByDescending(x => x.Score)
            //    .Take(topK)
            //    .Select(x => x.Chunk)
            //    .ToList();

            return new List<KnowledgeChunk>();
        }

        private float CosineSimilarity(float[] a, float[] b)
        {
            float dot = 0, normA = 0, normB = 0;
            for (int i = 0; i < a.Length; i++)
            {
                dot += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            return dot / (MathF.Sqrt(normA) * MathF.Sqrt(normB));
        }
    }

}
