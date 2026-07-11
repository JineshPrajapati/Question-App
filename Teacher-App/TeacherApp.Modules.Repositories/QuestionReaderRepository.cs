using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp.Formats.Jpeg;
using System.Text;
using System.Xml;
using System.Xml.Xsl;
using TeacherApp.Modules.Entities.Entities;
using static System.Net.Mime.MediaTypeNames;
using OfficeMath = DocumentFormat.OpenXml.Math.OfficeMath;
using Paragraph = DocumentFormat.OpenXml.Wordprocessing.Paragraph;
using Path = System.IO.Path;
using Table = DocumentFormat.OpenXml.Wordprocessing.Table;
using TableCell = DocumentFormat.OpenXml.Wordprocessing.TableCell;
using TableRow = DocumentFormat.OpenXml.Wordprocessing.TableRow;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
//using SixLabors.ImageSharp.Formats.Jpeg;

namespace TeacherApp.Modules.Repositories
{
    public class QuestionReaderRepository
    {
        private  static readonly XslCompiledTransform OmmlTransform = LoadOmmlTransform();

        public async Task<List<QuestionJson>> ReadQuestionsFromWord(IFormFile file, string imagesFolder)
        {
            var questions = new List<QuestionJson>();
            
            int questionNo = GetNextQuestionNumber(imagesFolder);

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            using var wordDoc = WordprocessingDocument.Open(memoryStream, false);
            var tables = wordDoc.MainDocumentPart!
                                 .Document.Body!
                                 .Elements<Table>();

            //using var wordDoc = WordprocessingDocument.Open(path, false);
            //var tables = wordDoc.MainDocumentPart!.Document.Body!.Elements<Table>();

            foreach (var table in tables)
            {
                string questionBasePath = Path.Combine(imagesFolder, $"{questionNo}");

                string questionImagePath = Path.Combine(questionBasePath, "QuestionImages");
                string optionImagePath = Path.Combine(questionBasePath, "OptionImages");
                string solutionImagePath = Path.Combine(questionBasePath, "SolutionImages");

                Directory.CreateDirectory(questionImagePath);
                Directory.CreateDirectory(optionImagePath);
                Directory.CreateDirectory(solutionImagePath);

                var question = new QuestionJson();

                foreach (var row in table.Elements<TableRow>())
                {
                    var cells = row.Elements<TableCell>().ToList();
                    if (cells.Count < 2) continue;

                    string key = cells[0].InnerText.Trim().ToLowerInvariant();
                    TableCell valueCell = cells[1];

                    // For text rows
                    string value = ExtractCellText(valueCell).Trim();

                    switch (key)
                    {
                        // You can still support Subject/Chapter/Type if they are present
                        case "questiontext":
                        case "question":
                            question.QuestionDetails.QuestionText = value;
                            break;

                        case "questionimage":
                            {
                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, questionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.QuestionDetails.QuestionImagePath = pathImg;
                                break;
                            }

                        case "optiona":
                            {
                                EnsureOption(question, 0);

                                question.OptionDetails[0].OptionText = value;

                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[0].OptionImagePath = pathImg;

                                break;
                            }

                        case "optionaimage":
                            EnsureOption(question, 0);
                            {
                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[0].OptionImagePath = pathImg;
                            }
                            break;

                        case "optionb":
                            {
                                EnsureOption(question, 1);
                                question.OptionDetails[1].OptionText = value;

                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[1].OptionImagePath = pathImg;

                                break;
                            }

                        case "optionbimage":
                            EnsureOption(question, 1);
                            {
                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[1].OptionImagePath = pathImg;
                            }
                            break;

                        case "optionc":
                            {
                                EnsureOption(question, 2);
                                question.OptionDetails[2].OptionText = value;

                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[2].OptionImagePath = pathImg;

                                break;
                            }

                        case "optioncimage":
                            EnsureOption(question, 2);
                            {
                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[2].OptionImagePath = pathImg;
                            }
                            break;

                        case "optiond":
                            {
                                EnsureOption(question, 3);
                                question.OptionDetails[3].OptionText = value;

                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[3].OptionImagePath = pathImg;

                                break;
                            }

                        case "optiondimage":
                            EnsureOption(question, 3);
                            {
                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, optionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.OptionDetails[3].OptionImagePath = pathImg;
                            }
                            break;

                        //case "answer":
                        case "answer":
                            question.QuestionDetails.Answer = value;
                            MarkCorrectOption(question, value);
                            break;

                        case "solution":
                            question.QuestionDetails.SolutionText = value;
                            break;

                        case "solutionimage":
                            {
                                var pathImg = ExtractImageFromCell(valueCell, wordDoc, solutionImagePath);
                                if (!string.IsNullOrEmpty(pathImg))
                                    question.QuestionDetails.SolutionImagePath = pathImg;
                                break;
                            }

                        case "difficultylevel":
                            if (int.TryParse(value, out int d))
                                question.QuestionDetails.DifficultyLevel = d;
                            break;

                        case "marks":
                            if (int.TryParse(value, out int m))
                                question.QuestionDetails.Marks = m;
                            break;
                    }
                }

                // Skip empty tables if needed
                if (!string.IsNullOrWhiteSpace(question.QuestionDetails.QuestionText) ||
                    question.OptionDetails.Any())
                {
                    questions.Add(question);
                }

                questionNo++;
            }

            return questions;
        }

        private static int GetNextQuestionNumber(string imagesFolder)
        {
            if (!Directory.Exists(imagesFolder))
                return 1;

            var dirs = Directory.GetDirectories(imagesFolder);

            var numbers = dirs
                .Select(d => Path.GetFileName(d))
                .Select(name => int.TryParse(name, out int n) ? n : 0)
                .Where(n => n > 0);

            return numbers.Any() ? numbers.Max() + 1 : 1;
        }

        /// <summary>
        /// Extracts text from a table cell, converting OMML math to MathML
        /// and wrapping each paragraph in &lt;p&gt; tags.
        /// </summary>
        static string ExtractCellText(TableCell cell)
        {
            var sb = new StringBuilder();

            foreach (var para in cell.Elements<Paragraph>())
            {
                //sb.Append("<p>");

                foreach (var elem in para.Elements())
                {
                    if (elem is OfficeMath omath)
                    {
                        string omml = omath.OuterXml;
                        string mathml = OMMLToMathML(omml);
                        sb.Append(mathml);
                    }
                    else
                    {
                        // Normal text inside runs, etc.
                        string text = elem.InnerText
                            .Replace("\n", " ")
                            .Replace("\r", "");
                        sb.Append(text);
                    }
                }

                //sb.Append("</p>");
            }

            return sb.ToString();
        }

        /// <summary>
        /// Converts OMML (Word math) to MathML using XSLT.
        /// OMML2MML.xsl must be present next to the executable.
        /// </summary>
        static string OMMLToMathML(string omml)
        {
            using var reader = XmlReader.Create(new StringReader(omml));
            using var ms = new MemoryStream();

            var settings = OmmlTransform.OutputSettings.Clone();
            settings.ConformanceLevel = ConformanceLevel.Fragment;
            settings.OmitXmlDeclaration = true;

            using (var writer = XmlWriter.Create(ms, settings))
            {
                OmmlTransform.Transform(reader, writer);
            }

            ms.Position = 0;
            using var sr = new StreamReader(ms, Encoding.UTF8);
            return sr.ReadToEnd();
        }

        static XslCompiledTransform LoadOmmlTransform()
        {
            var transform = new XslCompiledTransform();
            // Adjust path if needed
            string xsltPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "OMML2MML.xsl");
            transform.Load(xsltPath);
            return transform;
        }

        
        static string? ExtractImageFromCell(TableCell cell,WordprocessingDocument doc,string baseFolder)
        {
            if (cell == null || doc?.MainDocumentPart == null)
                return null;

            Directory.CreateDirectory(baseFolder);
            var imageFiles = new List<string>();

            // 1️⃣ MODERN DRAWING IMAGES
            var blips = cell.Descendants<DocumentFormat.OpenXml.Drawing.Blip>()
                            .Where(b => b.Embed != null)
                            .ToList();

            // 2️⃣ LEGACY VML IMAGES
            var vmlImages = cell.Descendants<DocumentFormat.OpenXml.Vml.ImageData>()
                                .Where(v => v.RelationshipId != null)
                                .ToList();

            // ---------- Process Drawing images ----------
            foreach (var blip in blips)
            {
                SaveImage(blip.Embed!.Value);
            }

            // ---------- Process VML images ----------
            foreach (var vml in vmlImages)
            {
                SaveImage(vml.RelationshipId!.Value);
            }

            return imageFiles.Count == 0
                ? null
                : string.Join("|", imageFiles);

            // LOCAL SAVE METHOD
            void SaveImage(string relId)
            {
                var imagePart = doc.MainDocumentPart!.GetPartById(relId) as ImagePart;
                if (imagePart == null) return;

                var fileName = $"{Guid.NewGuid()}.jpg";
                var savePath = Path.Combine(baseFolder, fileName);

                using var stream = imagePart.GetStream();

                // EMF / WMF → save raw
                if (imagePart.ContentType is "image/x-emf" or "image/x-wmf")
                {
                    using var fs = File.Create(savePath);
                    stream.CopyTo(fs);
                    imageFiles.Add(savePath);
                    return;
                }

                using var image = SixLabors.ImageSharp.Image.Load(stream);

                if (image.Width > 1600)
                {
                    image.Mutate(x =>
                        x.Resize(new ResizeOptions
                        {
                            Size = new Size(1600, 0),
                            Mode = ResizeMode.Max
                        }));
                }

                image.Save(savePath, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder
                {
                    Quality = 85
                });

                //imageFiles.Add(fileName);
                imageFiles.Add(savePath);
            }
        }

        /// <summary>
        /// Ensures that OptionDetails has at least (index+1) items.
        /// </summary>
        static void EnsureOption(QuestionJson question, int index)
        {
            while (question.OptionDetails.Count <= index)
                question.OptionDetails.Add(new QuestionOption());
        }

        static void MarkCorrectOption(QuestionJson question, string ans)
        {
            if (question.OptionDetails.Count == 0) return;

            string a = ans.Trim().ToUpperInvariant();

            if (a.StartsWith("(") && a.EndsWith(")") && a.Length >= 3)
            {
                // convert "(A)" -> "A"
                a = a.Substring(1, a.Length - 2).ToUpperInvariant();
            }

            switch (a)
            {
                case "A":
                    if (question.OptionDetails.Count > 0)
                        question.OptionDetails[0].IsCorrect = true;
                    break;
                case "B":
                    if (question.OptionDetails.Count > 1)
                        question.OptionDetails[1].IsCorrect = true;
                    break;
                case "C":
                    if (question.OptionDetails.Count > 2)
                        question.OptionDetails[2].IsCorrect = true;
                    break;
                case "D":
                    if (question.OptionDetails.Count > 3)
                        question.OptionDetails[3].IsCorrect = true;
                    break;
            }
        }

    }
}
