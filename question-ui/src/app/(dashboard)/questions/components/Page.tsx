import type { ReactNode } from "react";

interface PageProps {
  pageSize: string;
  pageNumber: number;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function Page({
  pageSize,
  pageNumber,
  header,
  footer,
  children,
}: PageProps) {
  const isA5 = pageSize === "A5";
  const width = isA5 ? "132mm" : "190mm";
  const height = isA5 ? "191mm" : "277mm";

  return (
    <div
      className="qp-page"
      style={{
        width,
        minHeight: height,
        margin: isA5 ? "8mm auto" : "10mm auto",
        backgroundColor: "#fff",
        color: "#000",
        border: isA5 ? "1.5px solid #000" : "2px solid #000",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        pageBreakAfter: "always",
        breakAfter: "page",
      }}
      data-page-number={pageNumber}
    >
      {header}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          minHeight: 0,
          padding: isA5 ? "2mm 4mm 2mm 4mm" : "3mm 4mm 3mm 4mm",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
