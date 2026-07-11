import { MathJax } from "better-react-mathjax";

interface QuestionBlockProps {
  question: any;
  questionNumber: number;
  pageSize: string;
  isGujarati: boolean;
  cleanMathML: (html: string) => string;
}

export default function QuestionBlock({
  question,
  questionNumber,
  pageSize,
  isGujarati,
  cleanMathML,
}: QuestionBlockProps) {
  const isA5 = pageSize === "A5";

  let parsedOptions: any[] = [];
  try {
    if (question.options) {
      parsedOptions = JSON.parse(question.options);
    }
  } catch {
    parsedOptions = [];
  }

  let columnsCount = 1;
  if (
    parsedOptions.length === 4 &&
    parsedOptions.every((o) => !o.OptionImage)
  ) {
    const maxLen = Math.max(
      ...parsedOptions.map((o) => (o.OptionText || "").length),
    );
    if (maxLen < 18) columnsCount = 4;
    else if (maxLen < 48) columnsCount = 2;
  }

  const gridClass =
    columnsCount === 4
      ? "qp-opts-4"
      : columnsCount === 2
        ? "qp-opts-2"
        : "qp-opts-1";

  return (
    <div className="print-avoid-break" style={{}}>
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
          {question.questionImage && (
            <div
              style={{
                marginTop: "3px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              {question.questionImage
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
                    }}
                  />
                ))}
            </div>
          )}
          {parsedOptions.length > 0 && (
            <div
              className={gridClass}
              style={{
                display: "grid",
                gap: "2px 16px",
                marginTop: "3px",
                marginLeft: "8px",
              }}
            >
              {parsedOptions.map((opt: any) => (
                <div
                  key={opt.QuestionOptionId}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "3px",
                    fontSize: isA5 ? "9px" : "11.5px",
                  }}
                >
                  <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                    ({opt.Option})
                  </span>
                  <span style={{ flex: 1 }}>
                    {opt.OptionText && (
                      <MathJax dynamic>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: cleanMathML(opt.OptionText),
                          }}
                        />
                      </MathJax>
                    )}
                    {opt.OptionImage && (
                      <img
                        src={`http://localhost:5000/${opt.OptionImage.replace("C:\\Teacher\\FTP\\dev\\", "").replace(/\\/g, "/")}`}
                        alt=""
                        style={{
                          maxHeight: isA5 ? "30px" : "50px",
                          objectFit: "contain",
                          marginTop: "1px",
                        }}
                      />
                    )}
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
