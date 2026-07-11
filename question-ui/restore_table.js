const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/questions/components/PrintTemplate.tsx', 'utf8');

const returnBlock = `
  return (
    <div className="print-container" style={{ backgroundColor: "#fff", color: "#000", fontFamily: "serif" }}>
      {/* ===== PRINT CSS ===== */}
      <style dangerouslySetInnerHTML={{ __html: \`
        @media print {
          @page { size: \${isA5 ? "A5" : "A4"} portrait; margin: 0; }
          html, body { margin: 0 !important; padding: 0 !important; background-color: #fff !important; }
          .print-container { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-page-break { break-before: page; page-break-before: always; }
          .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
        .qp-page {
          width: \${isA5 ? "132mm" : "190mm"};
          margin: \${isA5 ? "8mm auto" : "10mm auto"} !important;
          /* Remove border and padding from page div to allow table to handle it */
          background-color: #fff;
        }
        .qp-page-table {
          width: 100%;
          border-collapse: collapse;
          border: \${isA5 ? "1.5px solid #000" : "2px solid #000"};
          background-color: #fff;
        }
        .qp-page-table > thead > tr > th,
        .qp-page-table > tbody > tr > td,
        .qp-page-table > tfoot > tr > td {
          /* Simulate the page padding inside the table cells */
          padding: 0 \${isA5 ? "8mm" : "12mm"};
          border: none;
        }
        .qp-page-table > thead > tr > th {
          padding-top: \${isA5 ? "6mm" : "10mm"};
        }
        .qp-page-table > tfoot > tr > td {
          padding-bottom: \${isA5 ? "12mm" : "16mm"};
        }
        .page-number::after {
          counter-increment: page-num;
          content: counter(page-num);
        }
        .qp-header {
          width: 100%;
          border-collapse: collapse;
          border: \${isA5 ? "1.5px solid #000" : "2px solid #000"};
          font-size: \${isA5 ? "9px" : "12px"};
        }
        .qp-header td {
          border: \${isA5 ? "1.2px solid #000" : "1.5px solid #000"};
          padding: \${isA5 ? "3px 6px" : "5px 10px"};
          vertical-align: middle;
        }
        .qp-header .hdr-title { font-size: \${isA5 ? "13px" : "18px"}; font-weight: bold; line-height: 1.3; }
        .qp-header .hdr-sub { font-size: \${isA5 ? "10px" : "13px"}; font-weight: bold; margin-top: 4px; }
        .qp-part-label { display: inline-block; border: 1.5px dashed #000; padding: 2px 18px; font-weight: bold; font-size: \${isA5 ? "9px" : "12px"}; letter-spacing: 1px; }
        .qp-instruction-bar { display: flex; align-items: center; justify-content: space-between; width: 100%; border-bottom: 1.5px solid #000; padding: 4px 2px; font-size: \${isA5 ? "9px" : "12px"}; margin-bottom: 4px; }
        .qp-instruction-bar .marks-total { font-weight: bold; font-size: \${isA5 ? "10px" : "13px"}; }
        .qp-q-row { display: flex; align-items: flex-start; width: 100%; padding: 4px 0; font-size: \${isA5 ? "9px" : "12px"}; line-height: 1.5; }
        .qp-q-num { font-weight: bold; min-width: \${isA5 ? "16px" : "22px"}; flex-shrink: 0; text-align: right; padding-right: 6px; }
        .qp-q-body { flex: 1; min-width: 0; }
        .qp-opts-1 { display: flex; flex-direction: column; gap: 2px; margin-top: 3px; margin-left: 8px; }
        .qp-opts-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; margin-top: 3px; margin-left: 8px; }
        .qp-opts-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 2px 8px; margin-top: 3px; margin-left: 8px; }
        .qp-opt { display: flex; align-items: flex-start; gap: 3px; font-size: \${isA5 ? "9px" : "11.5px"}; }
        .qp-opt-label { font-weight: bold; white-space: nowrap; }
        .qp-page-footer { text-align: center; font-size: \${isA5 ? "9px" : "11px"}; font-weight: bold; border-top: 1.5px solid #000; padding-top: 4px; margin-top: 15px; }
      \` }} />

      {/* ===== QUESTION PAPER PER SUBJECT ===== */}
      <div style={{ counterReset: "page-num" }}>
        {subjectsList.map((subjectName, subIdx) => {
          const subjectQuestions = groupedSubjects[subjectName] || [];
          const totalSubjectMarks = getSubjectTotalMarks(subjectName);
          const markSections = getMarkSections(subjectQuestions);
          let globalQ = 0;

          return (
            <div key={subjectName} className={\`qp-page \${subIdx > 0 ? "print-page-break" : ""}\`}>
              <table className="qp-page-table">
                <thead style={{ display: "table-header-group" }}>
                  <tr>
                    <th>
                      {config.instituteName && (
                        <div style={{ textAlign: "center", fontSize: isA5 ? "13px" : "18px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {config.instituteName}
                        </div>
                      )}
                      <table className="qp-header">
                        <tbody>
                          <tr>
                            <td style={{ width: "25%", textAlign: "left" }}>
                              <div><b>Date :</b> {config.examDate}</div>
                              {config.examTime && <div style={{ marginTop: "4px" }}><b>Time :</b> {config.examTime}</div>}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="hdr-title">{config.examName}</div>
                              <div className="hdr-sub">
                                {standardLabel ? \`\${standardLabel} : \` : ""}
                                {config.subject || subjectName}
                              </div>
                            </td>
                            <td style={{ width: "25%", textAlign: "left" }}>
                              <div><b>Chapter :</b> {chapterNumber || "1"}</div>
                              <div style={{ marginTop: "4px" }}><b>Total Marks :</b> {totalSubjectMarks}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div style={{ width: "100%", height: "2px", backgroundColor: "#000", margin: "8px 0 4px 0" }} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {markSections.map((section, secIdx) => {
                        const sectionTotal = section.mark * section.questions.length;
                        const startQ = globalQ + 1;
                        const endQ = globalQ + section.questions.length;
                        const partLetter = String.fromCharCode(65 + secIdx);

                        return (
                          <div key={\`sec-\${section.mark}\`}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 6px 0", position: "relative", minHeight: "24px" }}>
                              {secIdx === 0 ? (
                                <div style={{ display: "flex", alignItems: "center", backgroundColor: "#000", color: "#fff", padding: "2px 8px", borderRadius: "3px", fontWeight: "bold", fontSize: isA5 ? "8px" : "11px", fontFamily: "sans-serif" }}>
                                  <span style={{ marginRight: "3px" }}>📖</span>Ch{chapterNumber || "1"}
                                </div>
                              ) : <div style={{ width: "60px" }} />}
                              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                                <span className="qp-part-label">PART {partLetter}</span>
                              </div>
                              <div style={{ width: "60px" }} />
                            </div>
                            <div className="qp-instruction-bar" style={{ marginTop: secIdx > 0 ? "6px" : "0" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: isA5 ? "10px" : "13px" }}>➤</span>
                                <span style={{ fontWeight: "bold" }}>
                                  {isGujarati
                                    ? section.mark === 1 ? \`નીચે આપેલા પ્રશ્નો માટે યોગ્ય વિકલ્પ પસંદ કરો. (\${startQ} થી \${endQ} પ્રશ્નો)\` : \`નીચે આપેલા પ્રશ્નોના ઉત્તર આપો. (\${startQ} થી \${endQ} પ્રશ્નો)\`
                                    : section.mark === 1 ? \`Choose the correct option for the following questions. (Q. \${startQ} to \${endQ})\` : \`Answer the following questions. (Q. \${startQ} to \${endQ})\`}
                                </span>
                              </span>
                              <span className="marks-total">[{sectionTotal}]</span>
                            </div>
                            {section.questions.map((q) => {
                              globalQ++;
                              let parsedOptions = [];
                              try { if (q.options) parsedOptions = JSON.parse(q.options); } catch {}
                              let columnsCount = 1;
                              if (parsedOptions.length === 4 && parsedOptions.every((o) => !o.OptionImage)) {
                                const maxLen = Math.max(...parsedOptions.map((o) => (o.OptionText || "").length));
                                if (maxLen < 18) columnsCount = 4;
                                else if (maxLen < 48) columnsCount = 2;
                              }
                              const gridClass = columnsCount === 4 ? "qp-opts-4" : columnsCount === 2 ? "qp-opts-2" : "qp-opts-1";
                              return (
                                <div key={q.questionId} className="print-avoid-break" style={{ borderBottom: "0.5px dotted #ccc" }}>
                                  <div className="qp-q-row">
                                    <span className="qp-q-num">{globalQ}.</span>
                                    <div className="qp-q-body">
                                      <MathJax dynamic><span dangerouslySetInnerHTML={{ __html: cleanMathML(q.questionText) }} /></MathJax>
                                      {q.questionImage && (
                                        <div style={{ marginTop: "3px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                          {q.questionImage.split("|").filter(i => i.trim()).map((img, idx) => (
                                            <img key={idx} src={\`http://localhost:5000/\${img.replace("C:\\\\Teacher\\\\FTP\\\\dev\\\\", "").replace(/\\\\/g, "/")}\`} alt="" style={{ maxHeight: isA5 ? "60px" : "100px", objectFit: "contain" }} />
                                          ))}
                                        </div>
                                      )}
                                      {parsedOptions.length > 0 && (
                                        <div className={gridClass}>
                                          {parsedOptions.map((opt) => (
                                            <div key={opt.QuestionOptionId} className="qp-opt">
                                              <span className="qp-opt-label">({opt.Option})</span>
                                              <span style={{ flex: 1 }}>
                                                {opt.OptionText && <MathJax dynamic><span dangerouslySetInnerHTML={{ __html: cleanMathML(opt.OptionText) }} /></MathJax>}
                                                {opt.OptionImage && <img src={\`http://localhost:5000/\${opt.OptionImage.replace("C:\\\\Teacher\\\\FTP\\\\dev\\\\", "").replace(/\\\\/g, "/")}\`} alt="" style={{ maxHeight: isA5 ? "30px" : "50px", objectFit: "contain", marginTop: "1px" }} />}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                </tbody>
                <tfoot style={{ display: "table-footer-group" }}>
                  <tr>
                    <td>
                      <div className="qp-page-footer">Page No : <span className="page-number"></span></div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}
      </div>

      {/* ===== SOLUTIONS ===== */}
      {config.includeSolutions && (
        <div className="qp-page print-page-break" style={{ counterReset: "page-num" }}>
          <table className="qp-page-table">
            <thead style={{ display: "table-header-group" }}>
              <tr>
                <th>
                  {config.instituteName && (
                    <div style={{ textAlign: "center", fontSize: isA5 ? "13px" : "18px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {config.instituteName}
                    </div>
                  )}
                  <table className="qp-header">
                    <tbody>
                      <tr>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          <div className="hdr-title">Detailed Solutions &amp; Answers</div>
                          <div className="hdr-sub">{config.examName}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ marginTop: "8px" }}>
                    {subjectsList.map((subjectName) => {
                      const subjectQuestions = groupedSubjects[subjectName] || [];
                      let gIdx = 0;
                      return (
                        <div key={\`sol-\${subjectName}\`}>
                          {subjectsList.length > 1 && (
                            <div style={{ fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #000", padding: "4px 0", marginTop: "6px", fontSize: isA5 ? "10px" : "12px" }}>
                              Subject: {subjectName}
                            </div>
                          )}
                          {subjectQuestions.map((q) => {
                            gIdx++;
                            const correctOpt = getCorrectOption(q);
                            return (
                              <div key={\`sol-\${q.questionId}\`} className="print-avoid-break" style={{ borderBottom: "0.5px dotted #ccc", padding: "4px 0" }}>
                                <div className="qp-q-row">
                                  <span className="qp-q-num">{gIdx}.</span>
                                  <div className="qp-q-body">
                                    <MathJax dynamic><span dangerouslySetInnerHTML={{ __html: cleanMathML(q.questionText) }} /></MathJax>
                                  </div>
                                </div>
                                <div style={{ marginLeft: "30px", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px", fontSize: isA5 ? "9px" : "11.5px" }}>
                                  <b>Ans:</b>
                                  <span style={{ fontWeight: "bold", background: "#f0f0f0", padding: "1px 6px", borderRadius: "2px", border: "1px solid #ccc" }}>({correctOpt})</span>
                                </div>
                                {(q.solutionText || q.solutionImage) && (
                                  <div style={{ marginLeft: "30px", marginTop: "3px", paddingLeft: "6px", borderLeft: "2.5px solid #000" }}>
                                    <div style={{ fontSize: isA5 ? "8px" : "10px", fontWeight: "bold", color: "#000" }}>Solution:</div>
                                    {q.solutionText && (
                                      <MathJax dynamic><div style={{ fontSize: isA5 ? "8.5px" : "11px", color: "#333", marginTop: "1px" }} dangerouslySetInnerHTML={{ __html: cleanMathML(q.solutionText) }} /></MathJax>
                                    )}
                                    {q.solutionImage && (
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "3px" }}>
                                        {q.solutionImage.split("|").filter(i => i.trim()).map((img, idx) => (
                                          <img key={idx} src={\`http://localhost:5000/\${img.replace("C:\\\\Teacher\\\\FTP\\\\dev\\\\", "").replace(/\\\\/g, "/")}\`} alt="" style={{ maxHeight: isA5 ? "60px" : "100px", objectFit: "contain", border: "1px solid #eee", borderRadius: "2px" }} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot style={{ display: "table-footer-group" }}>
              <tr>
                <td>
                  <div className="qp-page-footer">Page No : <span className="page-number"></span></div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ===== ANSWER KEY ===== */}
      {config.includeAnswerKey && (
        <div className="qp-page print-page-break" style={{ counterReset: "page-num" }}>
          <table className="qp-page-table">
            <thead style={{ display: "table-header-group" }}>
              <tr>
                <th>
                  {config.instituteName && (
                    <div style={{ textAlign: "center", fontSize: isA5 ? "13px" : "18px", fontWeight: "bold", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {config.instituteName}
                    </div>
                  )}
                  <table className="qp-header">
                    <tbody>
                      <tr>
                        <td style={{ textAlign: "center", padding: "8px" }}>
                          <div className="hdr-title">Official Answer Key</div>
                          <div className="hdr-sub">{config.examName}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ marginTop: "8px" }}>
                    {subjectsList.map((subjectName) => {
                      const subjectQuestions = groupedSubjects[subjectName] || [];
                      return (
                        <div key={\`ak-\${subjectName}\`}>
                          {subjectsList.length > 1 && (
                            <div style={{ fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #000", padding: "4px 0", marginTop: "6px", fontSize: isA5 ? "10px" : "12px" }}>
                              Subject: {subjectName}
                            </div>
                          )}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                            {/* Render answer chunks */}
                            {Array.from({ length: Math.ceil(subjectQuestions.length / 10) }).map((_, chunkIdx) => {
                              const chunk = subjectQuestions.slice(chunkIdx * 10, chunkIdx * 10 + 10);
                              return (
                                <table key={chunkIdx} style={{ width: "100%", borderCollapse: "collapse", fontSize: isA5 ? "9px" : "11px", marginBottom: "8px" }}>
                                  <tbody>
                                    <tr style={{ background: "#f5f5f5" }}>
                                      {chunk.map((q, idx) => (
                                        <td key={idx} style={{ border: "1.5px solid #000", padding: "4px", textAlign: "center", fontWeight: "bold", width: "10%" }}>
                                          Q.{chunkIdx * 10 + idx + 1}
                                        </td>
                                      ))}
                                      {Array.from({ length: 10 - chunk.length }).map((_, idx) => (
                                        <td key={\`e-\${idx}\`} style={{ border: "1.5px solid #000", width: "10%" }}></td>
                                      ))}
                                    </tr>
                                    <tr>
                                      {chunk.map((q, idx) => (
                                        <td key={idx} style={{ border: "1.5px solid #000", padding: "4px", textAlign: "center", fontWeight: "bold" }}>
                                          {getCorrectOption(q)}
                                        </td>
                                      ))}
                                      {Array.from({ length: 10 - chunk.length }).map((_, idx) => (
                                        <td key={\`ea-\${idx}\`} style={{ border: "1.5px solid #000" }}></td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot style={{ display: "table-footer-group" }}>
              <tr>
                <td>
                  <div className="qp-page-footer">Page No : <span className="page-number"></span></div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
`;

const startIndex = content.indexOf('  return (');
const finalContent = content.substring(0, startIndex) + returnBlock;
fs.writeFileSync('src/app/(dashboard)/questions/components/PrintTemplate.tsx', finalContent);
console.log("Restored Table Structure");
