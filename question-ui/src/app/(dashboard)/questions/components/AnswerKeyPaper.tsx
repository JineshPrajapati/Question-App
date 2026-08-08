import PageHeader from "./PageHeader";

interface AnswerKeyPaperProps {
  config: {
    instituteName: string;
    examName: string;
    subject: string;
    examDate: string;
    examTime: string;
    pageSize: string;
  };
  subjectGroups: Array<{ subjectName: string; questions: any[] }>;
  getCorrectOption: (question: any) => string;
}

export default function AnswerKeyPaper({
  config,
  subjectGroups,
  getCorrectOption,
}: AnswerKeyPaperProps) {
  const isA5 = config.pageSize === "A5";

  return (
    <div>
      {subjectGroups.map((group, sgIndex) => {
        const chunkSize = 10;
        const questionChunks: any[][] = [];
        for (let i = 0; i < group.questions.length; i += chunkSize) {
          questionChunks.push(group.questions.slice(i, i + chunkSize));
        }

        return (
          <div
            key={group.subjectName}
            className="qp-section"
            style={{ breakBefore: "page" }}
          >
            {sgIndex === 0 && (
              <div className="qp-first-header">
                <PageHeader
                  pageSize={config.pageSize}
                  isFirstPage={true}
                  title="Official Answer Key"
                  subtitle={config.examName}
                  instituteName={config.instituteName}
                  examName={config.examName}
                  examDate={config.examDate}
                  examTime={config.examTime}
                  subject={config.subject}
                />
              </div>
            )}

            <div style={{ marginTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {questionChunks.map((chunk, chunkIndex) => (
                  <div
                    key={chunkIndex}
                    className="print-avoid-break"
                    style={{ width: "100%", marginBottom: "8px" }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: isA5 ? "9px" : "11px",
                      }}
                    >
                      <tbody>
                        <tr style={{ background: "#f5f5f5" }}>
                          {chunk.map((q, idx) => (
                            <td
                              key={`q-${idx}`}
                              style={{
                                border: "1.5px solid #000",
                                padding: "4px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: `${100 / chunkSize}%`,
                              }}
                            >
                              Q.{chunkIndex * chunkSize + idx + 1}
                            </td>
                          ))}
                          {Array.from({ length: chunkSize - chunk.length }).map(
                            (_, idx) => (
                              <td
                                key={`e-${idx}`}
                                style={{ border: "1.5px solid #000", width: `${100 / chunkSize}%` }}
                              />
                            ),
                          )}
                        </tr>
                        <tr>
                          {chunk.map((q, idx) => (
                            <td
                              key={`a-${idx}`}
                              style={{
                                border: "1.5px solid #000",
                                padding: "4px",
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {getCorrectOption(q)}
                            </td>
                          ))}
                          {Array.from({ length: chunkSize - chunk.length }).map(
                            (_, idx) => (
                              <td
                                key={`ea-${idx}`}
                                style={{ border: "1.5px solid #000" }}
                              />
                            ),
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
