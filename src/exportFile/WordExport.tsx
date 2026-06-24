import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import PizZip from "pizzip";

export async function exportWord(data: any, typeFile: string) {
  try {
    // Lấy file mẫu từ thư mục public
    const response = await fetch(typeFile);
    const content = await response.arrayBuffer();

    // Nạp file mẫu vào PizZip
    const zip = new PizZip(content);

    // Khởi tạo Docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Truyền dữ liệu thay thế
    // doc.render({
    //   name: "Nguyễn Văn A",
    //   age: 10,
    //   class: "3A",
    //   date: new Date().toLocaleDateString("vi-VN"),
    // });
    // -------------------------------------------
    // doc.render({
    //   students: [
    //     { name: "An", age: 10 },
    //     { name: "Bình", age: 11 },
    //     { name: "Chi", age: 9 },
    //   ],
    // });
    doc.render(data);
    // ------------------------------------------
    // Xuất ra file .docx
    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(
      out,
      `${typeFile === "/template_KH.docx" ? "Kế hoạch" : "Báo cáo"}.${
        data?.title
      }.${data?.child}.docx`
    );
  } catch (error) {
    console.error("Lỗi xuất file Word:", error);
  }
}
