namespace TeacherApp.Modules.KnowledgeBase.Services
{
    using System.Text;
    using System.Text.RegularExpressions;
    using iText.Kernel.Pdf;
    using iText.Layout;
    using iText.Layout.Element;
    using Microsoft.Extensions.Configuration;

    public class PdfChunkService
    {
        private readonly int _chunkSize;
        private readonly string _baseFilePath;

        public PdfChunkService(IConfiguration config
            )
        {
            _chunkSize =Convert.ToInt32(config["OpenAI:ChunkSize"]);
            _baseFilePath= config["FileStoragePaths:BaseFilePath"];  
        }

        public  string ExtractPdfText(string pdfPath)
        {
            var sb = new StringBuilder();
            using (var document = UglyToad.PdfPig.PdfDocument.Open(pdfPath))
            {
                foreach (var page in document.GetPages())
                {
                    sb.AppendLine(page.Text);
                }
                document.Dispose();

            }           
            return sb.ToString();
        }


        public List<string> SplitIntoChunks(string text)
        {
            var chunks = new List<string>();
            var lines = text.Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries);
            var buffer = new StringBuilder();

            foreach (var line in lines)
            {
                if (buffer.Length + line.Length > _chunkSize)
                {
                    chunks.Add(buffer.ToString());
                    buffer.Clear();
                }
                buffer.AppendLine(line.Trim());
            }

            if (buffer.Length > 0)
                chunks.Add(buffer.ToString());

            return chunks;
        }

        public List<string> ExtractChunks(string pdfPath, int chunkSize)
        {
            using var pdf = UglyToad.PdfPig.PdfDocument.Open(pdfPath);
            var allText = string.Join("\n", pdf.GetPages().Select(p => p.Text));

            var words = allText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var chunks = new List<string>();

            for (int i = 0; i < words.Length; i += chunkSize)
            {
                chunks.Add(string.Join(" ", words.Skip(i).Take(chunkSize)));
            }

            return chunks;
        }

        public List<string> ExtractChunksFromText(string text, int chunkSize)
        {
            if (string.IsNullOrWhiteSpace(text))
                return new List<string>();

            var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var chunks = new List<string>();

            for (int i = 0; i < words.Length; i += chunkSize)
            {
                chunks.Add(string.Join(" ", words.Skip(i).Take(chunkSize)));
            }

            return chunks;
        }


        public string AddConsolidatedFile(string basePdf,string fileName)
        {

            
            var fullPath = Path.Combine(_baseFilePath, "consolidated");

            if (!Directory.Exists(fullPath))
            {
                Directory.CreateDirectory(fullPath);
            }      
            string completePath = Path.Combine(fullPath, fileName);
            try
            {
                var result = new List<(string, int)>();
                using (var document = UglyToad.PdfPig.PdfDocument.Open(basePdf))
                {
                    foreach (var page in document.GetPages())
                    {
                        var text = page.Text;
                        result.Add((text, page.Number));
                    }
                    document.Dispose();

                }

                using (PdfWriter writer = new PdfWriter(completePath))
                using (iText.Kernel.Pdf.PdfDocument pdf = new iText.Kernel.Pdf.PdfDocument(writer))
                using (Document iTextDocument = new Document(pdf))
                {
                    for (var i = 0; i < result.Count; i++)
                    {
                        iTextDocument.Add(new Paragraph(result[i].Item1));
                    }
                    iTextDocument.Close();
                }

                return completePath;
            }
            catch (Exception ex)
            {

           
            }

            return fullPath;
        }

        public  List<string> SplitIntoBlocks(string text)
        {
            var pattern = @"(?=^\s*(Unit\s+\d+|Lesson\s+\d+|Chapter\s+\d+|Module\s+\d+|Section\s+\d+|Topic\s+\d+|Pattern\b|[A-Z][a-zA-Z0-9 &\-]{3,80}\s*\r?\n|[0-9]\.[A-Z]{1,5}\.[0-9]{1,3})\b)";
            return Regex.Split(text, pattern, RegexOptions.Multiline)
                        .Select(x => x.Trim())
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .ToList();
        }

        public string GetConsolidatedContent(string basePdf,string fileName)
        {
            string consolidatedPath = AddConsolidatedFile(basePdf, fileName);
            string result ="";
            StringBuilder combined = new StringBuilder();
            try
            {
                using(var document = UglyToad.PdfPig.PdfDocument.Open(consolidatedPath))
                {
                    foreach (var page in document.GetPages())
                    {
                        var text = page.Text.Trim();

                        var lines = text.Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries);
                        var buffer = new StringBuilder();

                        foreach (var line in lines)
                        {
                            buffer.AppendLine(line.Trim());

                        }
                        combined.Append(buffer);
                    }
                    document.Dispose();

                }


                result = Convert.ToString(combined.ToString());
 
            }
            catch (Exception ex)
            {


            }

            return result;
        }
    }

}
