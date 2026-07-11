#region Perfect text reading but encoding issue 

//using iText.Kernel.Pdf;
//using iText.Kernel.Pdf.Canvas.Parser;
//using iText.Kernel.Pdf.Canvas.Parser.Listener;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Configuration;
//using Newtonsoft.Json;
//using System.Data;
//using System.Text;
//using TeacherApp.Modules.Admin.Entities;
//using TeacherApp.Modules.Helper.Controllers;

//namespace TeacherApp.Modules.Admin.Controllers.API
//{
//    [Route("api/question/")]
//    public class QuestionController : BaseController
//    {
//        private readonly Services.QuestionService _questionService;
//        private readonly IConfiguration _configuration;

//        public QuestionController(Services.QuestionService questionService
//            , IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : base(httpContextAccessor, configuration)
//        {
//            _questionService = questionService;
//            _configuration = configuration;
//        }

//        #region Using iText

//        [HttpPost("Create")]

//        public async Task<IActionResult> AddResult(
//            IFormFile file, int stream, int medium, int standard, int subject, int chapter, int topic)
//        {
//            if (file == null || file.Length == 0)
//                return BadRequest("No file uploaded.");

//            string pdfText;
//            using (var pdfReader = new PdfReader(file.OpenReadStream()))
//            using (var pdfDoc = new iText.Kernel.Pdf.PdfDocument(pdfReader))
//            {
//                var sb = new StringBuilder();
//                for (int page = 1; page <= pdfDoc.GetNumberOfPages(); page++)
//                {
//                    // Use LocationTextExtractionStrategy for better layout preservation
//                    var strategy = new LocationTextExtractionStrategy();
//                    var pageText = PdfTextExtractor.GetTextFromPage(pdfDoc.GetPage(page), strategy);

//                    // Remove only empty lines, keep everything else
//                    var cleaned = string.Join("\n", pageText
//                        .Split('\n')
//                        .Where(line => !string.IsNullOrWhiteSpace(line)));
//                    sb.AppendLine(cleaned);
//                }
//                pdfText = sb.ToString();
//            }

//            // 2️⃣ Prepare OpenAI GPT request
//            var apiKey = _configuration["OpenAI:ApiKey"];
//            var model = _configuration["OpenAI:LlmModel"]; // e.g., gpt-4o-mini

//            using var client = new HttpClient();
//            client.BaseAddress = new Uri("https://api.openai.com/v1/");
//            client.DefaultRequestHeaders.Authorization =
//                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

//            var systemPrompt = @"You are a question extraction assistant.

//        Extract all questions, options, correct answers, and solutions from the PDF text. 
//        The PDF may contain Gujarati, English, mathematical formulas, equations, and scientific symbols.

//        Output a clean JSON array where each item has:
//        - questionNumber: the number of the question
//        - question: full text of the question, preserve all Gujarati, English, formulas, symbols
//        - image: null
//        - options: object with keys A, B, C, D (text content only)
//        - correctOption: the correct option key (A/B/C/D)
//        - solution: full solution text, preserve all content exactly as in PDF

//        Ensure:
//        - JSON is valid and properly formatted
//        - Preserve all fonts, symbols, and Unicode characters
//        - Do NOT include markdown, ```json, or extra formatting
//        - Keep everything human-readable";

//            var requestBody = new
//            {
//                model = model,
//                messages = new object[]
//                {
//                    new { role = "system", content = systemPrompt },
//                    new { role = "user", content = pdfText }
//                },
//                temperature = 0.0 // low temp for deterministic results
//            };

//            var jsonContent = new StringContent(
//                JsonConvert.SerializeObject(requestBody),
//                Encoding.UTF8,
//                "application/json"
//            );

//            var response = await client.PostAsync("chat/completions", jsonContent);
//            if (!response.IsSuccessStatusCode)
//            {
//                var error = await response.Content.ReadAsStringAsync();
//                return StatusCode((int)response.StatusCode, error);
//            }

//            var responseString = await response.Content.ReadAsStringAsync();
//            dynamic gptResult = JsonConvert.DeserializeObject(responseString);
//            string jsonOutput = gptResult.choices[0].message.content;

//            // Clean any markdown/``` if present
//            if (jsonOutput.StartsWith("```"))
//            {
//                int firstLine = jsonOutput.IndexOf('\n');
//                int lastLine = jsonOutput.LastIndexOf("```");
//                jsonOutput = jsonOutput.Substring(firstLine + 1, lastLine - firstLine - 1).Trim();
//            }

//            // 3️⃣ Deserialize GPT JSON
//            List<QuestionModel> questions;
//            try
//            {
//                questions = JsonConvert.DeserializeObject<List<QuestionModel>>(jsonOutput);
//            }
//            catch (Exception ex)
//            {
//                return BadRequest(new
//                {
//                    message = "Failed to parse GPT JSON.",
//                    error = ex.Message,
//                    rawJson = jsonOutput
//                });
//            }

//            // 4️⃣ Prepare DataTables for TVP insert
//            DataTable questionsTable = new DataTable();
//            questionsTable.Columns.Add("QuestionText", typeof(string));
//            questionsTable.Columns.Add("QuestionImage", typeof(string));
//            questionsTable.Columns.Add("SolutionText", typeof(string));
//            questionsTable.Columns.Add("SolutionImage", typeof(string));
//            questionsTable.Columns.Add("Marks", typeof(int));
//            questionsTable.Columns.Add("StandardId", typeof(int));
//            questionsTable.Columns.Add("SubjectId", typeof(int));
//            questionsTable.Columns.Add("ChapterId", typeof(int));
//            questionsTable.Columns.Add("QuestionType", typeof(int));
//            questionsTable.Columns.Add("DifficultyLevel", typeof(int));
//            questionsTable.Columns.Add("TopicId", typeof(int));
//            questionsTable.Columns.Add("CreatedBy", typeof(int));

//            DataTable optionsTable = new DataTable();
//            optionsTable.Columns.Add("QuestionNumber", typeof(int));
//            optionsTable.Columns.Add("OptionKey", typeof(string));
//            optionsTable.Columns.Add("OptionText", typeof(string));
//            optionsTable.Columns.Add("OptionImage", typeof(string));
//            optionsTable.Columns.Add("IsCorrect", typeof(bool));

//            int counter = 1;
//            foreach (var q in questions)
//            {
//                questionsTable.Rows.Add(
//                    q.Question,
//                    q.Image ?? (object)DBNull.Value,
//                    q.Solution ?? (object)DBNull.Value,
//                    DBNull.Value,
//                    1,
//                    standard,
//                    subject,
//                    chapter,
//                    1,
//                    1,
//                    topic,
//                    1 // CreatedBy
//                );

//                foreach (var opt in q.Options)
//                {
//                    bool isCorrect = string.Equals(opt.Key, q.CorrectOption, StringComparison.OrdinalIgnoreCase);
//                    optionsTable.Rows.Add(counter, opt.Key, opt.Value, DBNull.Value, isCorrect);
//                }

//                counter++;
//            }

//            // 5️⃣ Send to service
//            var result = await _questionService.AddQuestionsAsync(
//                questionsTable, optionsTable, stream, medium, standard, subject, chapter, topic
//            );

//            return Ok(new { message = "Questions saved successfully.", data = result });
//        }

//        #endregion

//    }

//}

#endregion

#region OCR Based
//using iText.Kernel.Pdf;
//using iText.Kernel.Pdf.Canvas.Parser;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Configuration;
//using Newtonsoft.Json;
//using System;
//using System.Data;
//using System.IO;
//using System.Text;
//using System.Threading.Tasks;
//using TeacherApp.Modules.Admin.Entities;
//using TeacherApp.Modules.Helper.Controllers;
//using Tesseract;
//using ImageMagick;

//namespace TeacherApp.Modules.Admin.Controllers.API
//{
//    [Route("api/question/")]
//    public class QuestionController : BaseController
//    {
//        private readonly Services.QuestionService _questionService;
//        private readonly IConfiguration _configuration;

//        public QuestionController(Services.QuestionService questionService,
//            IHttpContextAccessor httpContextAccessor,
//            IConfiguration configuration) : base(httpContextAccessor, configuration)
//        {
//            _questionService = questionService;
//            _configuration = configuration;
//        }

//        [HttpPost("Create")]
//        public async Task<IActionResult> AddResult(
//            IFormFile file, int stream, int medium, int standard, int subject, int chapter, int topic)
//        {
//            if (file == null || file.Length == 0)
//                return BadRequest("No file uploaded.");

//            string pdfText;

//            using (var ms = new MemoryStream())
//            {
//                await file.CopyToAsync(ms);
//                ms.Position = 0;

//                pdfText = ExtractTextFromPdf(ms);

//                if (string.IsNullOrWhiteSpace(pdfText))
//                {
//                    ms.Position = 0;
//                    pdfText = ExtractTextFromScannedPdf(ms);
//                }
//            }

//            if (string.IsNullOrWhiteSpace(pdfText))
//                return BadRequest("No text extracted from the PDF.");

//            // 3️⃣ Call OpenAI GPT
//            var apiKey = _configuration["OpenAI:ApiKey"];
//            var model = _configuration["OpenAI:LlmModel"];

//            using var client = new HttpClient();
//            client.BaseAddress = new Uri("https://api.openai.com/v1/");
//            client.DefaultRequestHeaders.Authorization =
//                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

//            var systemPrompt = @"You are a question extraction assistant.

//                                 Extract all questions, options, correct answers, and solutions from the PDF text. 
//                                 The PDF may contain Gujarati, English, mathematical formulas, equations, and scientific symbols.

//                                 Output a clean JSON array where each item has:
//                                 - questionNumber
//                                 - question
//                                 - image: null
//                                 - options: object with keys A, B, C, D
//                                 - correctOption
//                                 - solution

//                                 Preserve all Unicode and formatting.
//                                ";

//            var requestBody = new
//            {
//                model = model,
//                messages = new[]
//                {
//                    new { role = "system", content = systemPrompt },
//                    new { role = "user", content = pdfText }
//                },
//                temperature = 0.0
//            };

//            var jsonContent = new StringContent(
//                JsonConvert.SerializeObject(requestBody),
//                Encoding.UTF8,
//                "application/json"
//            );

//            var response = await client.PostAsync("chat/completions", jsonContent);
//            if (!response.IsSuccessStatusCode)
//            {
//                var error = await response.Content.ReadAsStringAsync();
//                return StatusCode((int)response.StatusCode, error);
//            }

//            var responseString = await response.Content.ReadAsStringAsync();
//            dynamic gptResult = JsonConvert.DeserializeObject(responseString);
//            string jsonOutput = gptResult.choices[0].message.content.ToString();

//            // Clean GPT JSON
//            jsonOutput = jsonOutput.Trim();
//            if (jsonOutput.StartsWith("```json") && jsonOutput.EndsWith("```"))
//            {
//                jsonOutput = jsonOutput.Substring(7, jsonOutput.Length - 14).Trim();
//            }

//            List<QuestionModel> questions;
//            try
//            {
//                questions = JsonConvert.DeserializeObject<List<QuestionModel>>(jsonOutput);
//            }
//            catch (Exception ex)
//            {
//                return BadRequest(new
//                {
//                    message = "Failed to parse GPT JSON.",
//                    error = ex.Message,
//                    rawJson = jsonOutput
//                });
//            }

//            // Prepare DataTables
//            DataTable questionsTable = new();
//            questionsTable.Columns.Add("QuestionText", typeof(string));
//            questionsTable.Columns.Add("QuestionImage", typeof(string));
//            questionsTable.Columns.Add("SolutionText", typeof(string));
//            questionsTable.Columns.Add("SolutionImage", typeof(string));
//            questionsTable.Columns.Add("Marks", typeof(int));
//            questionsTable.Columns.Add("StandardId", typeof(int));
//            questionsTable.Columns.Add("SubjectId", typeof(int));
//            questionsTable.Columns.Add("ChapterId", typeof(int));
//            questionsTable.Columns.Add("QuestionType", typeof(int));
//            questionsTable.Columns.Add("DifficultyLevel", typeof(int));
//            questionsTable.Columns.Add("TopicId", typeof(int));
//            questionsTable.Columns.Add("CreatedBy", typeof(int));

//            DataTable optionsTable = new();
//            optionsTable.Columns.Add("QuestionNumber", typeof(int));
//            optionsTable.Columns.Add("OptionKey", typeof(string));
//            optionsTable.Columns.Add("OptionText", typeof(string));
//            optionsTable.Columns.Add("OptionImage", typeof(string));
//            optionsTable.Columns.Add("IsCorrect", typeof(bool));

//            int counter = 1;
//            foreach (var q in questions)
//            {
//                questionsTable.Rows.Add(
//                    q.Question,
//                    q.Image ?? (object)DBNull.Value,
//                    q.Solution ?? (object)DBNull.Value,
//                    DBNull.Value,
//                    1, // MARKS
//                    standard,
//                    subject,
//                    chapter,
//                    1, // QuestionType
//                    1, // DificultyLevel
//                    topic, 
//                    1 // CreatedBy
//                );

//                foreach (var opt in q.Options)
//                {
//                    bool isCorrect = string.Equals(opt.Key, q.CorrectOption, StringComparison.OrdinalIgnoreCase);
//                    optionsTable.Rows.Add(counter, opt.Key, opt.Value, DBNull.Value, isCorrect);
//                }

//                counter++;
//            }

//            var result = await _questionService.AddQuestionsAsync(
//                questionsTable, optionsTable, stream, medium, standard, subject, chapter, topic
//            );

//            return Ok(new { message = "Questions saved successfully.", data = result });
//        }

//        // Extract selectable text from PDF
//        private string ExtractTextFromPdf(Stream pdfStream)
//        {
//            var sb = new StringBuilder();
//            pdfStream.Position = 0;

//            using var reader = new iText.Kernel.Pdf.PdfReader(pdfStream);
//            using var pdf = new iText.Kernel.Pdf.PdfDocument(reader);
//            for (int i = 1; i <= pdf.GetNumberOfPages(); i++)
//            {
//                var page = pdf.GetPage(i);
//                var text = PdfTextExtractor.GetTextFromPage(page);
//                if (!string.IsNullOrWhiteSpace(text))
//                    sb.AppendLine(text);
//            }

//            return sb.ToString();
//        }

//        // OCR for scanned PDFs using Magick.NET + Tesseract
//        private string ExtractTextFromScannedPdf(Stream pdfStream)
//        {
//            var sb = new StringBuilder();
//            pdfStream.Position = 0;

//            using (var images = new MagickImageCollection())
//            {
//                images.Read(pdfStream, new MagickReadSettings { Density = new Density(300, 300) });

//                string tessDataPath = _configuration["Tesseract:TessDataPath"] ?? "tessdata";
//                using (var engine = new TesseractEngine(tessDataPath, "guj+eng", EngineMode.Default))
//                {
//                    int pageNum = 1;
//                    foreach (var image in images)
//                    {
//                        using var ms = new MemoryStream();
//                        image.Write(ms, MagickFormat.Png);
//                        ms.Position = 0;

//                        using var pix = Pix.LoadFromMemory(ms.ToArray());
//                        using var page = engine.Process(pix);

//                        sb.AppendLine($"--- Page {pageNum} ---");
//                        sb.AppendLine(page.GetText());

//                        pageNum++;
//                    }
//                }
//            }

//            return sb.ToString();
//        }
//    }
//}
#endregion

#region OpenApi grok based 90% working 

//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Configuration;
//using Newtonsoft.Json;
//using System.Data;
//using System.Net;
//using System.Net.Http.Headers;
//using System.Text;
//using System.Text.RegularExpressions;
//using TeacherApp.Modules.Admin.Entities;
//using TeacherApp.Modules.Helper.Controllers;

//namespace TeacherApp.Modules.Admin.Controllers.API
//{
//    [Route("api/question/")]
//    public class QuestionController : BaseController
//    {
//        private readonly Services.QuestionService _questionService;
//        private readonly IConfiguration _configuration;
//        private readonly HttpClient _httpClient;

//        public QuestionController(
//            Services.QuestionService questionService,
//            IHttpContextAccessor httpContextAccessor,
//            IConfiguration configuration) : base(httpContextAccessor, configuration)
//        {
//            _questionService = questionService;
//            _configuration = configuration;

//            _httpClient = new HttpClient();
//            _httpClient.DefaultRequestHeaders.Authorization =
//                new AuthenticationHeaderValue("Bearer", _configuration["OpenAI:ApiKey"]);
//            _httpClient.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");
//        }

//        [HttpPost("Create")]
//        public async Task<IActionResult> AddResult(
//            IFormFile file,
//            int stream, int medium, int standard, int subject, int chapter, int topic)
//        {
//            if (file == null || file.Length == 0)
//                return BadRequest("No file uploaded.");

//            var model = _configuration["OpenAI:LlmModel"]; // "gpt-4o-mini" or "gpt-4o"
//            string fileId = null;
//            string threadId = null;
//            string assistantId = null;

//            try
//            {
//                // === 1. Upload PDF ===
//                fileId = await UploadFileAsync(file);
//                if (fileId == null) return StatusCode(500, "Failed to upload file.");

//                // === 2. Create Assistant On-the-Fly ===
//                assistantId = await CreateAssistantAsync(model);
//                if (assistantId == null) return StatusCode(500, "Failed to create assistant.");

//                // === 3. Create Thread + Attach File ===
//                threadId = await CreateThreadAsync(fileId);
//                if (threadId == null) return StatusCode(500, "Failed to create thread.");

//                // === 4. Run Assistant ===
//                string runId = await RunAssistantAsync(threadId, assistantId); 
//                if (runId == null) return StatusCode(500, "Failed to start run.");

//                // === 5. Poll Until Complete ===
//                string jsonOutput = await PollRunUntilCompleteAsync(threadId, runId);
//                if (jsonOutput == null) return BadRequest("No JSON returned from assistant.");

//                // === 6. Parse Questions ===
//                var questions = JsonConvert.DeserializeObject<List<QuestionModel>>(jsonOutput);
//                if (questions == null || !questions.Any())
//                    return BadRequest("No questions extracted.");

//                // === 7. Save to DB ===
//                var (questionsTable, optionsTable) = BuildDataTables(questions, standard, subject, chapter, topic);
//                var dbResult = await _questionService.AddQuestionsAsync(
//                    questionsTable, optionsTable, stream, medium, standard, subject, chapter, topic);

//                // === 8. Cleanup ===
//                await CleanupAsync(fileId, assistantId);

//                return Ok(new
//                {
//                    message = "Questions extracted and saved successfully.",
//                    count = questions.Count,
//                    data = dbResult
//                });
//            }
//            catch (Exception ex)
//            {
//                await CleanupAsync(fileId, assistantId);
//                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
//            }
//        }

//        // ==================== HELPER METHODS ====================

//        private async Task<string> UploadFileAsync(IFormFile file)
//        {
//            var form = new MultipartFormDataContent();
//            form.Add(new StreamContent(file.OpenReadStream()), "file", file.FileName);
//            form.Add(new StringContent("assistants"), "purpose");

//            var response = await RetryAsync(() => _httpClient.PostAsync("https://api.openai.com/v1/files", form));
//            var text = await response.Content.ReadAsStringAsync();
//            return response.IsSuccessStatusCode ? JsonConvert.DeserializeObject<dynamic>(text).id : null;
//        }


//        private async Task<string> CreateAssistantAsync(string model)
//        {
//            var body = new
//            {
//                model,
//                name = "Liberty PDF Scanner - Exact Copy",
//                instructions = @"
//You are a **pixel-perfect text copier**.  
//**DO NOT understand. DO NOT translate. DO NOT rewrite. DO NOT change any word.**

//---

//### EXTRACT EXACTLY FROM PDF:
//1. **QuestionNumber** → number at start: 1., 2., 3.
//2. **Question** → full text after number until options start  
//   → Wrap **only math** in `\( ... \)`
//3. **Options** → find (A), (B), (C), (D) or (a), (b), (c), (d)  
//   → Copy **everything after (A)** until next option or answer line  
//   → **Multi-line OK** — keep line breaks with `\n`
//4. **CorrectOption** → look for:
//   - Gujarati: જવાબ, ઉત્તર, સાચો જવાબ
//   - English: ANS, ans, Answer, ANSWER
//   → Extract **only the letter** after it: `(B)` → `""B""`
//5. **Solution** → **everything from answer line until next question number**  
//   → Copy **exactly**, multi-line OK, wrap math in `\( ... \)`

//---

//### MATH RULES
//- Use `\( ... \)` for all math: `\( A = \{1,2,3\} \)`, `\( x \in R \)`
//- **Never use $ or $$**

//---

//### IGNORE
//- Liberty, Page No., Date, Time, Std 12, Chapter, Total Marks, Answer Key, PART A
//- Watermarks, headers, footers, checkmarks

//---

//### OUTPUT **ONLY** THIS JSON:
//```json
//[
//  {
//    ""QuestionNumber"": 1,
//    ""Question"": ""જો A = \\{1, 2, 3\\} અને R = \\{(1, 2), (2, 1), (2, 3)\\} હોય તો _________."",
//    ""QuestionImages"": [],
//    ""Options"": {
//      ""A"": ""R સ્વવાચક હોય."",
//      ""B"": ""R સમમિત હોય."",
//      ""C"": ""R પરંપરિત હોય."",
//      ""D"": ""આમાંથી કોઈ નહીં.""
//    },
//    ""OptionImages"": {""A"": [], ""B"": [], ""C"": [], ""D"": []},
//    ""CorrectOption"": ""B"",
//    ""Solution"": ""જવાબ (B)\n∴ R સમમિત છે.\n∵ (1,1) ∉ R\nપરંતુ (1,2), (2,1) ∈ R"",
//    ""SolutionImages"": []
//  }
//]
//",
//                tools = new[] { new { type = "file_search" } },
//                temperature = 0.0,  // ← CRITICAL: NO RANDOMNESS
//                response_format = new { type = "json_object" }
//                //NO extra text. NO markdown. ONLY JSON.
//            };
//            var response = await _httpClient.PostAsync(
//"https://api.openai.com/v1/assistants",
//new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));
//            var text = await response.Content.ReadAsStringAsync();
//            if (!response.IsSuccessStatusCode)
//            {
//                Console.WriteLine($"Assistant creation failed: {text}");
//                return null;
//            }
//            return JsonConvert.DeserializeObject<dynamic>(text).id;
//        }
//        private async Task<string> CreateThreadAsync(string fileId)
//        {
//            var body = new
//            {
//                messages = new[]
//                {
//            new
//            {
//                role = "user",
//                content = "Copy the PDF text exactly and output in JSON.",
//                attachments = new[]
//                {
//                    new { file_id = fileId, tools = new[] { new { type = "file_search" } } }
//                }
//            }
//        }
//            };

//            var response = await _httpClient.PostAsync(
//                "https://api.openai.com/v1/threads",
//                new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));

//            var text = await response.Content.ReadAsStringAsync();
//            return response.IsSuccessStatusCode ? JsonConvert.DeserializeObject<dynamic>(text).id : null;
//        }

//        private async Task<string> RunAssistantAsync(string threadId, string assistantId)
//        {
//            var body = new { assistant_id = assistantId,
//                temperature = 0.0,
//                response_format = new { type = "json_object" }
//            };

//            var response = await RetryAsync(() =>
//                _httpClient.PostAsync($"https://api.openai.com/v1/threads/{threadId}/runs",
//                    new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json")));

//            var text = await response.Content.ReadAsStringAsync();
//            return response.IsSuccessStatusCode ? JsonConvert.DeserializeObject<dynamic>(text).id : null;
//        }

//        private async Task<string> PollRunUntilCompleteAsync(string threadId, string runId)
//        {
//            dynamic run;
//            do
//            {
//                await Task.Delay(2000);
//                var res = await _httpClient.GetAsync($"https://api.openai.com/v1/threads/{threadId}/runs/{runId}");
//                var txt = await res.Content.ReadAsStringAsync();
//                run = JsonConvert.DeserializeObject<dynamic>(txt);

//                if (run.status == "failed") return null;

//            } while (run.status != "completed");

//            var msgRes = await _httpClient.GetAsync($"https://api.openai.com/v1/threads/{threadId}/messages");
//            var msgTxt = await msgRes.Content.ReadAsStringAsync();
//            string raw = JsonConvert.DeserializeObject<dynamic>(msgTxt).data[0].content[0].text.value;

//            return Regex.Match(raw, @"\[.*\]", RegexOptions.Singleline).Value;
//        }

//        private (DataTable questions, DataTable options) BuildDataTables(
//            List<QuestionModel> questions, int standard, int subject, int chapter, int topic)
//        {
//            var qTable = new DataTable();
//            qTable.Columns.Add("QuestionText", typeof(string));
//            qTable.Columns.Add("QuestionImage", typeof(string));
//            qTable.Columns.Add("SolutionText", typeof(string));
//            qTable.Columns.Add("SolutionImage", typeof(string));
//            qTable.Columns.Add("Marks", typeof(int));
//            qTable.Columns.Add("StandardId", typeof(int));
//            qTable.Columns.Add("SubjectId", typeof(int));
//            qTable.Columns.Add("ChapterId", typeof(int));
//            qTable.Columns.Add("QuestionType", typeof(int));
//            qTable.Columns.Add("DifficultyLevel", typeof(int));
//            qTable.Columns.Add("TopicId", typeof(int));
//            qTable.Columns.Add("CreatedBy", typeof(int));

//            var oTable = new DataTable();
//            oTable.Columns.Add("QuestionNumber", typeof(int));
//            oTable.Columns.Add("OptionKey", typeof(string));
//            oTable.Columns.Add("OptionText", typeof(string));
//            oTable.Columns.Add("OptionImage", typeof(string));
//            oTable.Columns.Add("IsCorrect", typeof(bool));

//            int counter = 1;
//            foreach (var q in questions)
//            {
//                qTable.Rows.Add(
//                    q.Question,
//                    FlattenImages(q.QuestionImages),
//                    q.Solution ?? (object)DBNull.Value,
//                    FlattenImages(q.SolutionImages),
//                    1, standard, subject, chapter, 1, 1, topic, 1);

//                if (q.Options != null)
//                {
//                    foreach (var opt in q.Options)
//                    {
//                        bool isCorrect = string.Equals(opt.Key, q.CorrectOption, StringComparison.OrdinalIgnoreCase);
//                        var optImg = q.OptionImages.ContainsKey(opt.Key)
//                            ? FlattenImages(q.OptionImages[opt.Key])
//                            : null;

//                        oTable.Rows.Add(counter, opt.Key, opt.Value, optImg ?? (object)DBNull.Value, isCorrect);
//                    }
//                }
//                counter++;
//            }

//            return (qTable, oTable);
//        }

//        private async Task CleanupAsync(string fileId, string assistantId)
//        {
//            if (fileId != null) try { await _httpClient.DeleteAsync($"https://api.openai.com/v1/files/{fileId}"); } catch { }
//            if (assistantId != null) try { await _httpClient.DeleteAsync($"https://api.openai.com/v1/assistants/{assistantId}"); } catch { }
//        }

//        private string FlattenImages(List<ImageData> images)
//        {
//            if (images == null || images.Count == 0) return null;
//            return string.Join(";", images.Select(i => $"{i.Description}|{i.Base64}"));
//        }

//        private async Task<HttpResponseMessage> RetryAsync(Func<Task<HttpResponseMessage>> action, int maxRetries = 3)
//        {
//            for (int i = 0; i < maxRetries; i++)
//            {
//                var res = await action();
//                if (res.StatusCode != HttpStatusCode.TooManyRequests)
//                    return res;

//                await Task.Delay(1000 * (i + 1));
//            }
//            return await action();
//        }
//    }

//}

#endregion

#region OPENAPI 2 

//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Configuration;
//using Newtonsoft.Json;
//using System.Net.Http.Headers;
//using System.Text;
//using TeacherApp.Modules.Admin.Entities;
//using TeacherApp.Modules.Helper.Controllers;

//namespace TeacherApp.Modules.Admin.Controllers.API
//{
//    [Route("api/question/")]
//    public class QuestionController : BaseController
//    {
//        private readonly Services.QuestionService _questionService;
//        private readonly IConfiguration _configuration;
//        private readonly HttpClient _httpClient;

//        public QuestionController(
//            Services.QuestionService questionService,
//            IHttpContextAccessor httpContextAccessor,
//            IConfiguration configuration) : base(httpContextAccessor, configuration)
//        {
//            _questionService = questionService;
//            _configuration = configuration;

//            System.Net.ServicePointManager.SecurityProtocol =
//                System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls13;

//            _httpClient = new HttpClient();
//            _httpClient.Timeout = TimeSpan.FromMinutes(10);
//            _httpClient.DefaultRequestHeaders.Authorization =
//                new AuthenticationHeaderValue("Bearer", _configuration["OpenAI:ApiKey"]);
//            _httpClient.DefaultRequestHeaders.Add("OpenAI-Beta", "assistants=v2");
//        }

//        // ======================================================

//        [HttpPost("Create")]
//        public async Task<IActionResult> AddResult(
//            IFormFile file,
//            int stream, int medium, int standard, int subject, int chapter, int topic)
//        {
//            try
//            {
//                if (file == null || file.Length == 0)
//                    return BadRequest("No PDF uploaded.");

//                // STEP 1: Convert PDF → Base64
//                byte[] fileBytes;
//                using (var ms = new MemoryStream())
//                {
//                    await file.CopyToAsync(ms);
//                    fileBytes = ms.ToArray();
//                }

//                string base64Pdf = Convert.ToBase64String(fileBytes);

//                // STEP 2: Prompt
//                string prompt = @"
//                    You are an OCR model specialized in Gujarati, English, Mathematics and scientific notation. 
//                    You must extract content EXACTLY as it appears in the PDF.

//                    IMPORTANT GUJARATI RULES:
//                    - The PDF uses Gujarati fonts (such as Shruti, LMG, Saral, Rekha, Lekhani or custom fonts). 
//                    - These fonts map glyph shapes to non-Unicode characters.
//                    - You MUST visually analyze the glyph shapes and convert them into correct Gujarati Unicode text.
//                    - DO NOT output fallback ASCII characters (like ò, í, yLku, íkku, Ãkht, etc.)
//                    - Always output proper Gujarati letters (e.g. જો, અને, હોય તો, સંબંધ, વિધેય, વગેરે).
//                    - DO NOT translate. DO NOT correct grammar. DO NOT rewrite.
//                    - Just convert the shapes to correct Gujarati characters.

//                    MATHEMATICS RULES:
//                    - Keep all math expressions EXACTLY as in PDF.
//                    - Preserve LaTeX inside $…$.
//                    - Do not modify equations, subscripts, superscripts, vectors, sets, relations.

//                    IMAGE RULES:
//                    - Extract every image and return as Base64.
//                    - Maintain correct page order.

//                    OUTPUT FORMAT:
//                    Return STRICT JSON only matching this EXACT C# model:

//                    {
//                      ""QuestionNumber"": number,
//                      ""Question"": ""Gujarati + English text with LaTeX"",
//                      ""QuestionImages"": [
//                        { ""Description"": ""string"", ""Base64"": ""string"" }
//                      ],
//                      ""Options"": {
//                        ""A"": ""string"",
//                        ""B"": ""string"",
//                        ""C"": ""string"",
//                        ""D"": ""string""
//                      },
//                      ""OptionImages"": {
//                        ""A"": [ { ""Description"": ""string"", ""Base64"": ""string"" } ],
//                        ""B"": [],
//                        ""C"": [],
//                        ""D"": []
//                      },
//                      ""CorrectOption"": ""A/B/C/D"",
//                      ""Solution"": ""Gujarati + English + LaTeX solution steps"",
//                      ""SolutionImages"": [
//                        { ""Description"": ""string"", ""Base64"": ""string"" }
//                      ]
//                    }

//                    STRICT RULES:
//                    - Do not add Markdown code fences.
//                    - Do not translate anything.
//                    - Do not guess unclear text; visually decode Gujarati shapes.
//                    - Do not change spacing, punctuation, brackets, or LaTeX syntax.
//                    - Do not summarize.
//                    - Output JSON array if multiple questions are present.

//                    ";

//                // STEP 3: CALL /v1/responses (THIS ACCEPTS PDF BASE64)
//                var body = new
//                {
//                    model = "gpt-4.1",
//                    input = new object[]
//                    {
//                        new {
//                            role = "user",
//                            content = new object[]
//                            {
//                                new { type = "input_text", text = prompt },
//                                new {
//                                    type = "input_file",
//                                    filename = file.FileName,
//                                    file_data = $"data:application/pdf;base64,{Convert.ToBase64String(fileBytes)}"
//                                }
//                            }
//                        }
//                    }
//                };

//                var jsonBody = new StringContent(
//                    JsonConvert.SerializeObject(body),
//                    Encoding.UTF8,
//                    "application/json"
//                );

//                var response = await _httpClient.PostAsync("https://api.openai.com/v1/responses", jsonBody);
//                var responseJson = await response.Content.ReadAsStringAsync();

//                if (!response.IsSuccessStatusCode)
//                    return BadRequest("OpenAI Error: " + responseJson);

//                // STEP 4: Extract JSON text
//                dynamic obj = JsonConvert.DeserializeObject(responseJson);
//                string extractedText = obj.output[0].content[0].text.ToString();


//                if (string.IsNullOrWhiteSpace(extractedText))
//                    return BadRequest("OpenAI returned empty JSON.");

//                // STEP 5: Deserialize into your model
//                QuestionModel question = JsonConvert.DeserializeObject<QuestionModel>(extractedText);

//                // STEP 6: Save to DB
//                //await _questionService.SaveAsync(question, stream, medium, standard, subject, chapter, topic);

//                return Ok(new
//                {
//                    message = "Question extracted successfully!",
//                    data = question
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, "Server Error: " + ex.Message);
//            }
//        }

//    }
//}


#endregion