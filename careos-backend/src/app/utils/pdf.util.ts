import { createRequire } from "node:module";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

const require = createRequire(import.meta.url);
const PdfPrinter = require("pdfmake/src/printer");

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);

export function generatePDFBuffer(
  docDefinition: TDocumentDefinitions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", reject);

      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
}