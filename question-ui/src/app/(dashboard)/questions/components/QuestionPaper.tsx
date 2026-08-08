import PageFooter from "./PageFooter";
import PageHeader from "./PageHeader";
import QuestionBlock from "./QuestionBlock";

interface SubjectGroup {
  subjectName: string;
  questions: any[];
  totalMarks: number;
}

interface QuestionPaperProps {
  config: {
    instituteName: string;
    examName: string;
    subject: string;
    examDate: string;
    examTime: string;
    pageSize: string;
  };
  subjectGroups: SubjectGroup[];
  selectedQuestions: Record<number, number>;
  chapterNumber?: string;
  standardLabel?: string;
  isGujarati: boolean;
  cleanMathML: (html: string) => string;
}

export default function QuestionPaper({
  config,
  subjectGroups,
  selectedQuestions,
  chapterNumber = "1",
  standardLabel = "",
  isGujarati,
  cleanMathML,
}: QuestionPaperProps) {
  const isA5 = config.pageSize === "A5";

  const getMarkSections = (subjectQuestions: any[]) => {
    const sections: Record<number, any[]> = {};
    subjectQuestions.forEach((q) => {
      const mark = selectedQuestions[q.questionId] ?? 0;
      if (!sections[mark]) sections[mark] = [];
      sections[mark].push(q);
    });
    return Object.entries(sections)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([mark, qs]) => ({ mark: Number(mark), questions: qs }));
  };

  let globalQuestionNumber = 0;

  return (
    <div>
      {subjectGroups.map((subjectGroup, sgIndex) => {
        const markSections = getMarkSections(subjectGroup.questions);

        return (
          <div
            key={subjectGroup.subjectName}
            className="qp-section"
            style={{ breakBefore: sgIndex > 0 ? "page" : "auto" }}
          >
            {sgIndex === 0 && (
              <div className="qp-first-header">
                <PageHeader
                  pageSize={config.pageSize}
                  isFirstPage={true}
                  title="Question Paper"
                  subtitle={config.subject || subjectGroup.subjectName}
                  instituteName={config.instituteName}
                  examName={config.examName}
                  examDate={config.examDate}
                  examTime={config.examTime}
                  subject={config.subject || subjectGroup.subjectName}
                  chapterNumber={chapterNumber}
                  totalMarks={subjectGroup.totalMarks}
                  standardLabel={standardLabel}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {markSections.map((section, sectionIndex) => {
                const sectionTotal = section.mark * section.questions.length;
                const partLetter = String.fromCharCode(65 + sectionIndex);

                return (
                  <div key={`${subjectGroup.subjectName}-${sectionIndex}`} style={{ marginBottom: "6px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        margin: "2px 0 4px 0",
                        position: "relative",
                        minHeight: "24px",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            border: "1.5px dashed #000",
                            padding: "2px 18px",
                            fontWeight: "bold",
                            fontSize: isA5 ? "9px" : "12px",
                            letterSpacing: "1px",
                          }}
                        >
                          PART {partLetter}
                        </span>
                      </div>
                      <div style={{ width: "60px" }} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        borderBottom: "1.5px solid #000",
                        padding: "4px 2px",
                        fontSize: isA5 ? "9px" : "12px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontSize: isA5 ? "10px" : "13px" }}>
                          ➤
                        </span>
                        <span style={{ fontWeight: "bold" }}>
                          {isGujarati
                            ? section.mark === 1
                              ? "નીચે આપેલા પ્રશ્નો માટે યોગ્ય વિકલ્પ પસંદ કરો."
                              : "નીચે આપેલા પ્રશ્નોના ઉત્તર આપો."
                            : section.mark === 1
                              ? "Choose the correct option for the following questions."
                              : "Answer the following questions."}
                        </span>
                      </span>
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: isA5 ? "10px" : "13px",
                        }}
                      >
                        [{sectionTotal}]
                      </span>
                    </div>

                    {section.questions.map((question) => {
                      globalQuestionNumber++;
                      return (
                        <QuestionBlock
                          key={question.questionId}
                          question={question}
                          questionNumber={globalQuestionNumber}
                          pageSize={config.pageSize}
                          isGujarati={isGujarati}
                          cleanMathML={cleanMathML}
                        />
                      );
                    })}
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
