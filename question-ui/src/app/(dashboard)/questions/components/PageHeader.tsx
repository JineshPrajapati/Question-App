interface PageHeaderProps {
  pageSize: string;
  isFirstPage: boolean;
  title: string;
  subtitle?: string;
  instituteName?: string;
  examName?: string;
  examDate?: string;
  examTime?: string;
  subject?: string;
  chapterNumber?: string;
  totalMarks?: number;
  standardLabel?: string;
}

export default function PageHeader({
  pageSize,
  isFirstPage,
  title,
  subtitle,
  instituteName,
  examName,
  examDate,
  examTime,
  subject,
  chapterNumber,
  totalMarks,
  standardLabel,
}: PageHeaderProps) {
  const isA5 = pageSize === "A5";

  if (!isFirstPage) {
    return (
      //   <div
      //     style={{
      //       padding: isA5 ? "4mm 8mm 3mm" : "5mm 12mm 4mm",
      //       borderBottom: "1.5px solid #000",
      //       backgroundColor: "#fff",
      //     }}
      //   >
      //     <div
      //       style={{
      //         fontSize: isA5 ? "9px" : "11px",
      //         fontWeight: "bold",
      //         textTransform: "uppercase",
      //         letterSpacing: "0.5px",
      //       }}
      //     >
      //       {title}
      //     </div>
      //     <div style={{ fontSize: isA5 ? "8px" : "10px", marginTop: "2px" }}>
      //       {subtitle || subject || examName}
      //     </div>
      //   </div>
      <div
        style={{
          height: isA5 ? "8mm" : "10mm",
          borderBottom: "1px solid #000",
        }}
      />
    );
  }

  return (
    <div style={{ padding: isA5 ? "6mm 4mm 2mm" : "8mm 6mm 3mm" }}>
      {instituteName && (
        <div
          style={{
            textAlign: "center",
            fontSize: isA5 ? "13px" : "18px",
            fontWeight: "bold",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {instituteName}
        </div>
      )}
      <div
        style={{
          width: "100%",
          border: isA5 ? "1.2px solid #000" : "1.5px solid #000",
          borderCollapse: "collapse",
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1fr",
          fontSize: isA5 ? "9px" : "12px",
        }}
      >
        <div
          style={{
            borderRight: isA5 ? "1.2px solid #000" : "1.5px solid #000",
            padding: isA5 ? "3px 6px" : "5px 10px",
            textAlign: "left",
          }}
        >
          <div>
            <b>Date :</b> {examDate}
          </div>
          {examTime && (
            <div style={{ marginTop: "4px" }}>
              <b>Time :</b> {examTime}
            </div>
          )}
        </div>
        <div
          style={{
            padding: isA5 ? "3px 6px" : "5px 10px",
            textAlign: "center",
            borderRight: isA5 ? "1.2px solid #000" : "1.5px solid #000",
          }}
        >
          <div style={{ fontSize: isA5 ? "13px" : "18px", fontWeight: "bold" }}>
            {examName}
          </div>
          <div
            style={{
              fontSize: isA5 ? "10px" : "13px",
              fontWeight: "bold",
              marginTop: "4px",
            }}
          >
            {standardLabel ? `${standardLabel} : ` : ""}
            {subject}
          </div>
        </div>
        <div
          style={{ padding: isA5 ? "3px 6px" : "5px 10px", textAlign: "left" }}
        >
          <div>
            <b>Chapter :</b> {chapterNumber || "1"}
          </div>
          <div style={{ marginTop: "4px" }}>
            <b>Total Marks :</b> {totalMarks}
          </div>
        </div>
      </div>
      {/* <div
        style={{
          width: "100%",
          height: "2px",
          backgroundColor: "#000",
          margin: "8px 0 4px 0",
        }}
      />
      <div
        style={{
          fontSize: isA5 ? "9px" : "12px",
          fontWeight: "bold",
          marginTop: "2px",
        }}
      >
        {title}
      </div> */}
    </div>
  );
}
