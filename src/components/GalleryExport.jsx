import React, { useRef } from "react";
import html2pdf from "html2pdf.js";

export default function GalleryExport({ children, filename = "gallery.pdf" }) {
  const ref = useRef();

  const handleExport = () => {
    const element = ref.current;
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save()
      .catch(console.error);
  };

  return (
    <div>
      <button onClick={handleExport}>Download Gallery as PDF</button>
      <div ref={ref}>{children}</div>
    </div>
  );
}
