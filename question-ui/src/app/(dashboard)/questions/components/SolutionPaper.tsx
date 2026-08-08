import { MathJax } from "better-react-mathjax";
import PageHeader from "./PageHeader";

interface SubjectGroup {
  subjectName: string;
  questions: any[];
}

interface SolutionPaperProps {
  config: {
    instituteName: string;
    examName: string;
    subject: string;
    examDate: string;
    examTime: string;
    pageSize: string;
  };
  subjectGroups: SubjectGroup[];
  cleanMathML: (html: string) => string;
  getCorrectOption: (question: any) => string;
}

export default function SolutionPaper({
  config,
  subjectGroups,
  cleanMathML,
  getCorrectOption,
}: SolutionPaperProps) {
  const isA5 = config.pageSize === "A5";

  return (
    <div>
      {subjectGroups.map((subjectGroup, sgIndex) => {
        let questionNumber = 0;

        return (
          <div
            key={subjectGroup.subjectName}
            className="qp-section"
            style={{ breakBefore: "page" }}
          >
            {sgIndex === 0 && (
              <div className="qp-first-header">
                <PageHeader
                  pageSize={config.pageSize}
                  isFirstPage={true}
                  title="Detailed Solutions & Answers"
                  subtitle={config.examName}
                  instituteName={config.instituteName}
                  examName={config.examName}
                  examDate={config.examDate}
                  examTime={config.examTime}
                  subject={config.subject}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {subjectGroup.questions.map((question) => {
                questionNumber++;
                const correctOpt = getCorrectOption(question);
                return (
                  <div
                    key={question.questionId}
                    className="print-avoid-break"
                    style={{ padding: "4px 0" }}
                  >
                    <div
                      className="qp-q-row"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        width: "100%",
                        padding: "4px 0",
                        fontSize: isA5 ? "9px" : "12px",
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        className="qp-q-num"
                        style={{
                          fontWeight: "bold",
                          minWidth: isA5 ? "16px" : "22px",
                          flexShrink: 0,
                          textAlign: "right",
                          paddingRight: "6px",
                        }}
                      >
                        {questionNumber}.
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <MathJax dynamic>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: cleanMathML(question.questionText),
                            }}
                          />
                        </MathJax>
                      </div>
                    </div>
                    <div
                      style={{
                        marginLeft: "30px",
                        marginTop: "3px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: isA5 ? "9px" : "11.5px",
                      }}
                    >
                      <b>Ans:</b>
                      <span
                        style={{
                          fontWeight: "bold",
                          background: "#f0f0f0",
                          padding: "1px 6px",
                          borderRadius: "2px",
                          border: "1px solid #ccc",
                        }}
                      >
                        ({correctOpt})
                      </span>
                    </div>
                    {(question.solutionText || question.solutionImage) && (
                      <div
                        style={{
                          marginLeft: "30px",
                          marginTop: "3px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: isA5 ? "8px" : "10px",
                            fontWeight: "bold",
                            color: "#000",
                          }}
                        >
                          Solution:
                        </div>
                        {question.solutionText && (
                          <MathJax dynamic>
                            <div
                              style={{
                                fontSize: isA5 ? "8.5px" : "11px",
                                color: "#333",
                                marginTop: "1px",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: cleanMathML(question.solutionText),
                              }}
                            />
                          </MathJax>
                        )}
                        {question.solutionImage && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "3px",
                            }}
                          >
                            {question.solutionImage
                              .split("|")
                              .filter((image: string) => image.trim())
                              .map((image: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={`http://localhost:5000/${image.replace("C:\\Teacher\\FTP\\dev\\", "").replace(/\\/g, "/")}`}
                                  alt=""
                                  style={{
                                    maxHeight: isA5 ? "60px" : "100px",
                                    objectFit: "contain",
                                    border: "1px solid #eee",
                                    borderRadius: "2px",
                                  }}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
