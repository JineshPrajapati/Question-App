import Page from "./Page";
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
  const maxContentHeight = isA5 ? 145 : 205;

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

  const pages: Array<{
    pageNumber: number;
    subjectName: string;
    blocks: Array<{
      type: "subject" | "section" | "question";
      section?: { mark: number; questions: any[] };
      sectionIndex?: number;
      sectionTotal?: number;
      partLetter?: string;
      question?: any;
      questionNumber?: number;
      height: number;
    }>;
  }> = [];

  let pageNumber = 1;
  subjectGroups.forEach((subjectGroup) => {
    const markSections = getMarkSections(subjectGroup.questions);
    const blocks: Array<{
      type: "subject" | "section" | "question";
      section?: { mark: number; questions: any[] };
      sectionIndex?: number;
      sectionTotal?: number;
      partLetter?: string;
      question?: any;
      questionNumber?: number;
      height: number;
    }> = [
      //   {
      //     type: "subject",
      //     height: 10,
      //   },
    ];

    let globalQuestionNumber = 1;
    markSections.forEach((section, sectionIndex) => {
      const sectionTotal = section.mark * section.questions.length;
      const partLetter = String.fromCharCode(65 + sectionIndex);
      blocks.push({
        type: "section",
        section,
        sectionIndex,
        sectionTotal,
        partLetter,
        height: 28,
      });

      section.questions.forEach((question) => {
        blocks.push({
          type: "question",
          question,
          questionNumber: globalQuestionNumber++,
          height: 24,
        });
      });
    });

    let currentPageBlocks: Array<{
      type: "subject" | "section" | "question";
      section?: { mark: number; questions: any[] };
      sectionIndex?: number;
      sectionTotal?: number;
      partLetter?: string;
      question?: any;
      questionNumber?: number;
      height: number;
    }> = [];
    let currentHeight = 0;

    const pushPage = () => {
      if (currentPageBlocks.length > 0) {
        pages.push({
          pageNumber: pageNumber++,
          subjectName: subjectGroup.subjectName,
          blocks: currentPageBlocks,
        });
        currentPageBlocks = [];
        currentHeight = 0;
      }
    };

    blocks.forEach((block) => {
      if (currentPageBlocks.length === 0) {
        currentPageBlocks = [block];
        currentHeight = block.height;
        return;
      }

      if (currentHeight + block.height > maxContentHeight) {
        pushPage();
        currentPageBlocks = [block];
        currentHeight = block.height;
      } else {
        currentPageBlocks.push(block);
        currentHeight += block.height;
      }
    });

    pushPage();
  });

  return (
    <div>
      {pages.map((page) => (
        <Page
          key={`${page.subjectName}-${page.pageNumber}`}
          pageSize={config.pageSize}
          pageNumber={page.pageNumber}
          header={
            <PageHeader
              pageSize={config.pageSize}
              isFirstPage={page.pageNumber === 1}
              title="Question Paper"
              subtitle={config.subject || page.subjectName}
              instituteName={
                page.pageNumber === 1 ? config.instituteName : undefined
              }
              examName={page.pageNumber === 1 ? config.examName : undefined}
              examDate={page.pageNumber === 1 ? config.examDate : undefined}
              examTime={page.pageNumber === 1 ? config.examTime : undefined}
              subject={config.subject || page.subjectName}
              chapterNumber={chapterNumber}
              totalMarks={
                subjectGroups.find(
                  (group) => group.subjectName === page.subjectName,
                )?.totalMarks ?? 0
              }
              standardLabel={standardLabel}
            />
          }
          footer={
            <PageFooter
              pageSize={config.pageSize}
              pageNumber={page.pageNumber}
            />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {page.blocks.map((block, blockIndex) => {
              if (block.type === "section") {
                return (
                  <div
                    key={`${page.pageNumber}-${blockIndex}`}
                    style={{ marginBottom: "6px" }}
                  >
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
                          PART {block.partLetter}
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
                            ? block.section?.mark === 1
                              ? "નીચે આપેલા પ્રશ્નો માટે યોગ્ય વિકલ્પ પસંદ કરો."
                              : "નીચે આપેલા પ્રશ્નોના ઉત્તર આપો."
                            : block.section?.mark === 1
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
                        [{block.sectionTotal}]
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <QuestionBlock
                  key={`${page.pageNumber}-${blockIndex}`}
                  question={block.question}
                  questionNumber={block.questionNumber ?? 1}
                  pageSize={config.pageSize}
                  isGujarati={isGujarati}
                  cleanMathML={cleanMathML}
                />
              );
            })}
          </div>
        </Page>
      ))}
    </div>
  );
}
