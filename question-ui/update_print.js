const fs = require('fs');

let content = fs.readFileSync('src/app/(dashboard)/questions/components/PrintTemplate.tsx', 'utf8');

// 1. Fix CSS
content = content.replace(/\.page-number::after \{\s*counter-increment: page-num;\s*content: counter\(page-num\);\s*\}/g, '');
content = content.replace(/\.qp-page-footer\s*\{[^}]+\}/, `.qp-page-footer {
          position: absolute;
          bottom: \${isA5 ? "4mm" : "6mm"};
          left: \${isA5 ? "8mm" : "12mm"};
          right: \${isA5 ? "8mm" : "12mm"};
          text-align: center;
          font-size: \${isA5 ? "9px" : "11px"};
          font-weight: bold;
          border-top: 1.5px solid #000;
          padding-top: 4px;
        }`);

// 2. Replace Question Paper
let qpStart = content.indexOf('{/* ===== QUESTION PAPER PER SUBJECT ===== */}');
let solStart = content.indexOf('{/* ===== SOLUTIONS ===== */}');
let ansStart = content.indexOf('{/* ===== ANSWER KEY ===== */}');
let endDiv = content.lastIndexOf('</div>\r\n    </div>\r\n  );\r\n}');
if (endDiv === -1) endDiv = content.lastIndexOf('</div>\n    </div>\n  );\n}');

const newQp = `      {/* ===== QUESTION PAPER PER SUBJECT ===== */}
      {(() => {
        const QPP = isA5 ? 4 : 6;
        const qpPages = [];
        subjectsList.forEach((subjectName, subIdx) => {
          const subjectQuestions = groupedSubjects[subjectName] || [];
          const totalSubjectMarks = getSubjectTotalMarks(subjectName);
          const markSections = getMarkSections(subjectQuestions);
          
          let globalQ = 0;
          const items = [];
          items.push({ type: 'subject-header', subjectName, totalSubjectMarks, subIdx });
          
          markSections.forEach((section, secIdx) => {
            const partLetter = String.fromCharCode(65 + secIdx);
            const sectionTotal = section.mark * section.questions.length;
            const startQ = globalQ + 1;
            const endQ = globalQ + section.questions.length;
            items.push({ type: 'part-header', partLetter, sectionTotal, startQ, endQ, mark: section.mark, secIdx });
            section.questions.forEach((q) => {
              globalQ++;
              items.push({ type: 'question', data: q, globalQ, mark: section.mark });
            });
          });
          
          let currentPage = [];
          let currentUnits = 0;
          items.forEach(item => {
            const units = item.type === 'subject-header' ? 2 : (item.type === 'part-header' ? 1 : 1);
            if (currentUnits + units > QPP && currentPage.length > 0) {
              qpPages.push(currentPage);
              currentPage = [];
              currentUnits = 0;
            }
            currentPage.push(item);
            currentUnits += units;
          });
          if (currentPage.length > 0) qpPages.push(currentPage);
        });

        return qpPages.map((pageItems, pageIdx) => {
          return (
            <div key={\`qp-page-\${pageIdx}\`} className={\`qp-page \${pageIdx > 0 ? "print-page-break" : ""}\`}>
              {pageItems.map((item, itemIdx) => {
                if (item.type === 'subject-header') {
                  return (
                    <div key={\`hdr-\${itemIdx}\`}>
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
                                {config.subject || item.subjectName}
                              </div>
                            </td>
                            <td style={{ width: "25%", textAlign: "left" }}>
                              <div><b>Chapter :</b> {chapterNumber || "1"}</div>
                              <div style={{ marginTop: "4px" }}><b>Total Marks :</b> {item.totalSubjectMarks}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div style={{ width: "100%", height: "2px", backgroundColor: "#000", margin: "8px 0 4px 0" }} />
                    </div>
                  );
                } else if (item.type === 'part-header') {
                  return (
                    <div key={\`part-\${itemIdx}\`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "8px 0 6px 0", position: "relative", minHeight: "24px" }}>
                        {item.secIdx === 0 ? (
                          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#000", color: "#fff", padding: "2px 8px", borderRadius: "3px", fontWeight: "bold", fontSize: isA5 ? "8px" : "11px", fontFamily: "sans-serif" }}>
                            <span style={{ marginRight: "3px" }}>📖</span>
                            Ch{chapterNumber || "1"}
                          </div>
                        ) : <div style={{ width: "60px" }} />}
                        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                          <span className="qp-part-label">PART {item.partLetter}</span>
                        </div>
                        <div style={{ width: "60px" }} />
                      </div>
                      <div className="qp-instruction-bar" style={{ marginTop: item.secIdx > 0 ? "6px" : "0" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: isA5 ? "10px" : "13px" }}>➤</span>
                          <span style={{ fontWeight: "bold" }}>
                            {isGujarati
                              ? item.mark === 1
                                ? \`નીચે આપેલા પ્રશ્નો માટે યોગ્ય વિકલ્પ પસંદ કરો. (\${item.startQ} થી \${item.endQ} પ્રશ્નો)\`
                                : \`નીચે આપેલા પ્રશ્નોના ઉત્તર આપો. (\${item.startQ} થી \${item.endQ} પ્રશ્નો)\`
                              : item.mark === 1
                                ? \`Choose the correct option for the following questions. (Q. \${item.startQ} to \${item.endQ})\`
                                : \`Answer the following questions. (Q. \${item.startQ} to \${item.endQ})\`}
                          </span>
                        </span>
                        <span className="marks-total">[{item.sectionTotal}]</span>
                      </div>
                    </div>
                  );
                } else if (item.type === 'question') {
                  const q = item.data;
                  let parsedOptions = [];
                  try { if (q.options) parsedOptions = JSON.parse(q.options); } catch (e) {}
                  let columnsCount = 1;
                  if (parsedOptions.length === 4 && parsedOptions.every((o) => !o.OptionImage)) {
                    const maxLen = Math.max(...parsedOptions.map((o) => (o.OptionText || "").length));
                    if (maxLen < 18) columnsCount = 4;
                    else if (maxLen < 48) columnsCount = 2;
                  }
                  const gridClass = columnsCount === 4 ? "qp-opts-4" : columnsCount === 2 ? "qp-opts-2" : "qp-opts-1";
                  return (
                    <div key={\`q-\${q.questionId}\`} className="print-avoid-break" style={{ borderBottom: "0.5px dotted #ccc" }}>
                      <div className="qp-q-row">
                        <span className="qp-q-num">{item.globalQ}.</span>
                        <div className="qp-q-body">
                          <MathJax dynamic><span dangerouslySetInnerHTML={{ __html: cleanMathML(q.questionText) }} /></MathJax>
                          {q.questionImage && (
                            <div style={{ marginTop: "3px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {q.questionImage.split("|").filter((i) => i.trim()).map((img, idx) => {
                                const wp = img.replace("C:\\\\Teacher\\\\FTP\\\\dev\\\\", "").replace(/\\\\/g, "/");
                                return <img key={idx} src={\`http://localhost:5000/\${wp}\`} alt="" style={{ maxHeight: isA5 ? "60px" : "100px", objectFit: "contain" }} />;
                              })}
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
                }
              })}
              <div className="qp-page-footer">Page No : {pageIdx + 1}</div>
            </div>
          );
        });
      })()}

`;

const newSol = `      {/* ===== SOLUTIONS ===== */}
      {config.includeSolutions && (() => {
        const SOL_QPP = isA5 ? 4 : 6;
        const solPages = [];
        const solItems = [];
        solItems.push({ type: 'main-header' });
        subjectsList.forEach((subjectName) => {
          solItems.push({ type: 'subject-header', subjectName });
          const subjectQuestions = groupedSubjects[subjectName] || [];
          let gIdx = 0;
          subjectQuestions.forEach(q => {
            gIdx++;
            solItems.push({ type: 'solution', data: q, gIdx });
          });
        });
        
        let currentPage = [];
        let currentUnits = 0;
        solItems.forEach(item => {
          const units = item.type === 'solution' ? 1 : 1.5;
          if (currentUnits + units > SOL_QPP && currentPage.length > 0) {
            solPages.push(currentPage);
            currentPage = [];
            currentUnits = 0;
          }
          currentPage.push(item);
          currentUnits += units;
        });
        if (currentPage.length > 0) solPages.push(currentPage);

        return solPages.map((pageItems, pageIdx) => {
          return (
            <div key={\`sol-page-\${pageIdx}\`} className={\`qp-page print-page-break\`}>
              {pageItems.map((item, itemIdx) => {
                if (item.type === 'main-header') {
                  return (
                    <div key={\`s-hdr-\${itemIdx}\`}>
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
                    </div>
                  );
                } else if (item.type === 'subject-header') {
                  return subjectsList.length > 1 ? (
                    <div key={\`s-shdr-\${itemIdx}\`} style={{ fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #000", padding: "4px 0", marginTop: "6px", fontSize: isA5 ? "10px" : "12px" }}>
                      Subject: {item.subjectName}
                    </div>
                  ) : null;
                } else if (item.type === 'solution') {
                  const q = item.data;
                  const correctOpt = getCorrectOption(q);
                  return (
                    <div key={\`sol-\${q.questionId}-\${itemIdx}\`} className="print-avoid-break" style={{ borderBottom: "0.5px dotted #ccc", padding: "4px 0" }}>
                      <div className="qp-q-row">
                        <span className="qp-q-num">{item.gIdx}.</span>
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
                              {q.solutionImage.split("|").filter((i) => i.trim()).map((img, idx) => {
                                const wp = img.replace("C:\\\\Teacher\\\\FTP\\\\dev\\\\", "").replace(/\\\\/g, "/");
                                return <img key={idx} src={\`http://localhost:5000/\${wp}\`} alt="" style={{ maxHeight: isA5 ? "60px" : "100px", objectFit: "contain", border: "1px solid #eee", borderRadius: "2px" }} />;
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
              <div className="qp-page-footer">Page No : {pageIdx + 1}</div>
            </div>
          );
        });
      })()}

`;

const newAns = `      {/* ===== ANSWER KEY ===== */}
      {config.includeAnswerKey && (() => {
        const ANS_QPP = isA5 ? 12 : 16;
        const ansPages = [];
        const ansItems = [];
        ansItems.push({ type: 'main-header' });
        subjectsList.forEach(subjectName => {
          ansItems.push({ type: 'subject-header', subjectName });
          const subjectQuestions = groupedSubjects[subjectName] || [];
          for (let i = 0; i < subjectQuestions.length; i += 10) {
            ansItems.push({ type: 'ans-row', chunk: subjectQuestions.slice(i, i + 10), startIndex: i });
          }
        });
        
        let currentPage = [];
        let currentUnits = 0;
        ansItems.forEach(item => {
          const units = item.type === 'ans-row' ? 1 : 1.5;
          if (currentUnits + units > ANS_QPP && currentPage.length > 0) {
            ansPages.push(currentPage);
            currentPage = [];
            currentUnits = 0;
          }
          currentPage.push(item);
          currentUnits += units;
        });
        if (currentPage.length > 0) ansPages.push(currentPage);

        return ansPages.map((pageItems, pageIdx) => {
          return (
            <div key={\`ans-page-\${pageIdx}\`} className={\`qp-page print-page-break\`}>
              {pageItems.map((item, itemIdx) => {
                if (item.type === 'main-header') {
                  return (
                    <div key={\`a-hdr-\${itemIdx}\`}>
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
                    </div>
                  );
                } else if (item.type === 'subject-header') {
                  return subjectsList.length > 1 ? (
                    <div key={\`a-shdr-\${itemIdx}\`} style={{ fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #000", padding: "4px 0", fontSize: isA5 ? "10px" : "12px" }}>
                      Subject: {item.subjectName}
                    </div>
                  ) : null;
                } else if (item.type === 'ans-row') {
                  const chunk = item.chunk;
                  const i = item.startIndex;
                  return (
                    <table key={\`arow-\${itemIdx}\`} style={{ width: "100%", borderCollapse: "collapse", marginTop: "6px", fontSize: isA5 ? "9px" : "11px" }}>
                      <tbody>
                        <tr style={{ background: "#f5f5f5" }}>
                          {chunk.map((q, ci) => (
                            <td key={q.questionId} style={{ border: "1.5px solid #000", padding: "3px 4px", textAlign: "center", fontWeight: "bold", fontSize: isA5 ? "8px" : "10px" }}>
                              Q.{i + ci + 1}
                            </td>
                          ))}
                          {Array.from({ length: 10 - chunk.length }, (_, ci) => (
                            <td key={\`e-\${ci}\`} style={{ border: "1.5px solid #000", padding: "3px 4px" }} />
                          ))}
                        </tr>
                        <tr>
                          {chunk.map((q) => (
                            <td key={\`a-\${q.questionId}\`} style={{ border: "1.5px solid #000", padding: "3px 4px", textAlign: "center", fontWeight: "bold", color: "#000", fontSize: isA5 ? "9.5px" : "12px" }}>
                              {getCorrectOption(q)}
                            </td>
                          ))}
                          {Array.from({ length: 10 - chunk.length }, (_, ci) => (
                            <td key={\`ea-\${ci}\`} style={{ border: "1.5px solid #000", padding: "3px 4px" }} />
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  );
                }
              })}
              <div className="qp-page-footer">Page No : {pageIdx + 1}</div>
            </div>
          );
        });
      })()}
    </div>
  );
}
`;

const finalContent = content.substring(0, qpStart) + newQp + newSol + newAns;
fs.writeFileSync('src/app/(dashboard)/questions/components/PrintTemplate.tsx', finalContent);
console.log("Updated PrintTemplate.tsx");
