import { MathJax } from "better-react-mathjax";
import Page from "./Page";
import PageFooter from "./PageFooter";
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
  const maxHeight = isA5 ? 135 : 190;

  const pages: Array<{
    pageNumber: number;
    items: Array<{
      type: "subject" | "question";
      subjectName?: string;
      question?: any;
      questionNumber?: number;
    }>;
  }> = [];

  let pageNumber = 1;
  subjectGroups.forEach((subjectGroup) => {
    const items: Array<{
      type: "subject" | "question";
      subjectName?: string;
      question?: any;
      questionNumber?: number;
    }> = [];

    let questionNumber = 1;
    subjectGroup.questions.forEach((question) => {
      items.push({
        type: "question",
        question,
        questionNumber: questionNumber++,
      });
    });

    let currentItems: Array<{
      type: "subject" | "question";
      subjectName?: string;
      question?: any;
      questionNumber?: number;
    }> = [];
    let currentHeight = 0;
    const pushPage = () => {
      if (currentItems.length > 0) {
        pages.push({ pageNumber: pageNumber++, items: currentItems });
        currentItems = [];
        currentHeight = 0;
      }
    };

    items.forEach((item) => {
      //   const estimated = item.type === "subject" ? 12 : 24;
      let estimated = 12;

      if (item.type === "question") {
        estimated = 18;

        if (item.question?.solutionText) {
          estimated += Math.ceil(item.question.solutionText.length / 180) * 6;
        }

        if (item.question?.solutionImage) {
          estimated +=
            item.question.solutionImage.split("|").filter(Boolean).length * 18;
        }

        if (item.question?.questionImage) {
          estimated +=
            item.question.questionImage.split("|").filter(Boolean).length * 15;
        }
      }
      if (currentItems.length === 0) {
        currentItems = [item];
        currentHeight = estimated;
        return;
      }
      if (currentHeight + estimated > maxHeight) {
        pushPage();
        currentItems = [item];
        currentHeight = estimated;
      } else {
        currentItems.push(item);
        currentHeight += estimated;
      }
    });

    pushPage();
  });

  return (
    <div>
      {pages.map((page) => (
        <Page
          key={`solutions-${page.pageNumber}`}
          pageSize={config.pageSize}
          pageNumber={page.pageNumber}
          header={
            <PageHeader
              pageSize={config.pageSize}
              isFirstPage={page.pageNumber === 1}
              title="Detailed Solutions & Answers"
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {page.items.map((item, itemIndex) => {
              //   if (item.type === "subject") {
              //     return (
              //       <div
              //         key={`subject-${itemIndex}`}
              //         style={{
              //           fontWeight: "bold",
              //           textTransform: "uppercase",
              //           borderBottom: "1.5px solid #000",
              //           padding: "4px 0",
              //           fontSize: isA5 ? "10px" : "12px",
              //         }}
              //       >
              //         Subject: {item.subjectName}
              //       </div>
              //     );
              //   }

              const question = item.question;
              const correctOpt = getCorrectOption(question);
              return (
                <div
                  key={`sol-${question.questionId || itemIndex}`}
                  style={{
                    padding: "4px 0",
                  }}
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
                      {item.questionNumber}.
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
        </Page>
      ))}
    </div>
  );
}
