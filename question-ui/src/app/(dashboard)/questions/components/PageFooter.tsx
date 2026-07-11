interface PageFooterProps {
  pageSize: string;
  pageNumber: number;
}

export default function PageFooter({ pageSize, pageNumber }: PageFooterProps) {
  const isA5 = pageSize === "A5";

  return (
    <div
      style={{
        borderTop: "1.5px solid #000",
        padding: isA5 ? "4px 8mm 6px" : "6px 12mm 8px",
        textAlign: "center",
        fontSize: isA5 ? "9px" : "11px",
        fontWeight: "bold",
        backgroundColor: "#fff",
      }}
    >
      Page No : {pageNumber}
    </div>
  );
}
