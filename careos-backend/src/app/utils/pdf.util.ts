import { createRequire } from "node:module";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

const require = createRequire(import.meta.url);

function resolvePdfPrinter(): new (fonts: object) => any {
  const candidates = [
    () => require("pdfmake/src/printer"),
    () => require("pdfmake"),
  ];

  for (const load of candidates) {
    let mod: any;
    try {
      mod = load();
    } catch {
      continue;
    }

    for (const candidate of [mod, mod?.default, mod?.Printer, mod?.PdfPrinter]) {
      if (typeof candidate === "function") {
        return candidate;
      }
    }
  }

  throw new Error(
    "Could not resolve PdfPrinter constructor. Run the diagnostic commands and check node_modules/pdfmake manually."
  );
}

const PdfPrinter = resolvePdfPrinter();

const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
};

const printer = new PdfPrinter(fonts);


if (!printer.urlResolver || typeof printer.urlResolver.resolve !== "function" || typeof printer.urlResolver.resolved !== "function") {
  printer.urlResolver = {
    resolve: (url: string) => url,
    resolved: () => Promise.resolve(), 
  };
}

export const generatePDFBuffer = (docDefinition: TDocumentDefinitions): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const pdfDoc = await printer.createPdfKitDocument(docDefinition);
      
      const chunks: Buffer[] = [];
      pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      
      pdfDoc.on("error", (err: any) => {
        console.error("PDF Generation Stream Error:", err);
        reject(err);
      });
      
      pdfDoc.end();
    } catch (error) {
      console.error("PDF Generation Sync Error:", error);
      reject(error);
    }
  });
};