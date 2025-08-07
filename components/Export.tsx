import { StoredLibrary } from "@/lib/store";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = (data: StoredLibrary[]) => {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Title", "URL"],
    ...data.map((item) => [item.title, item.url]) // plain value for now
  ]);

  // Now apply hyperlinks manually
  data.forEach((item, index) => {
    const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: 1 }); // row offset +1 (headers), column 1 = URL col
    if (!ws[cellRef]) ws[cellRef] = { t: "s", v: item.url }; // fallback
    ws[cellRef].l = { Target: item.url, Tooltip: "Open link" }; // hyperlink
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Library");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, "Library.xlsx");
};

export default exportToExcel;
