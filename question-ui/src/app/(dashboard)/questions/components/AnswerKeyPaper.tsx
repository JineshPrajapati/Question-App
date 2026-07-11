import Page from "./Page";
import PageFooter from "./PageFooter";
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
  const pages: Array<{
    pageNumber: number;
    subjectName: string;
    questions: any[];
  }> = [];

  let pageNumber = 1;
  subjectGroups.forEach((group) => {
    const chunkSize = 10;
    const questionChunks: any[][] = [];
    for (let i = 0; i < group.questions.length; i += chunkSize) {
      questionChunks.push(group.questions.slice(i, i + chunkSize));
    }

    questionChunks.forEach((chunk) => {
      pages.push({
        pageNumber: pageNumber++,
        subjectName: group.subjectName,
        questions: chunk,
      });
    });
  });

  return (
    <div>
      {pages.map((page) => (
        <Page
          key={`answer-key-${page.pageNumber}`}
          pageSize={config.pageSize}
          pageNumber={page.pageNumber}
          header={
            <PageHeader
              pageSize={config.pageSize}
              isFirstPage={page.pageNumber === 1}
              title="Official Answer Key"
              subtitle={config.examName}
              instituteName={
                page.pageNumber === 1 ? config.instituteName : undefined
              }
              examName={page.pageNumber === 1 ? config.examName : undefined}
              examDate={page.pageNumber === 1 ? config.examDate : undefined}
              examTime={page.pageNumber === 1 ? config.examTime : undefined}
              subject={config.subject}
            />
          }
          footer={
            <PageFooter
              pageSize={config.pageSize}
              pageNumber={page.pageNumber}
            />
          }
        >
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                borderBottom: "1.5px solid #000",
                padding: "4px 0",
                marginTop: "6px",
                fontSize: isA5 ? "10px" : "12px",
              }}
            >
              {/* Subject: {page.subjectName} */}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: isA5 ? "9px" : "11px",
                  marginBottom: "8px",
                }}
              >
                <tbody>
                  <tr style={{ background: "#f5f5f5" }}>
                    {page.questions.map((q, idx) => (
                      <td
                        key={`q-${idx}`}
                        style={{
                          border: "1.5px solid #000",
                          padding: "4px",
                          textAlign: "center",
                          fontWeight: "bold",
                          width: "10%",
                        }}
                      >
                        Q.{idx + 1}
                      </td>
                    ))}
                    {Array.from({ length: 10 - page.questions.length }).map(
                      (_, idx) => (
                        <td
                          key={`e-${idx}`}
                          style={{ border: "1.5px solid #000", width: "10%" }}
                        />
                      ),
                    )}
                  </tr>
                  <tr>
                    {page.questions.map((q, idx) => (
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
                    {Array.from({ length: 10 - page.questions.length }).map(
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
          </div>
        </Page>
      ))}
    </div>
  );
}
