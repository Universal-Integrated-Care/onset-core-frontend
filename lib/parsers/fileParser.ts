"use client"; // Ensures this runs only on the client side

import mammoth from "mammoth";

/**
 * Extracts text from a PDF, DOCX, or TXT file.
 * @param file File object to extract text from.
 * @returns Extracted text as a string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File parsing must run on the client side.");
  }

  const fileType = file.type;

  if (fileType === "application/pdf") {
    // Dynamically import pdfjsLib for client-side execution
    const pdfjsLib = await import("pdfjs-dist/build/pdf");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    const textPromises = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      textPromises.push(pageText);
    }

    return (await Promise.all(textPromises)).join("\n");
  }

  if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // Extract text from DOCX
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  if (fileType === "text/plain") {
    // Extract text from TXT
    return await file.text();
  }

  throw new Error("Unsupported file type");
}

/**
 * Extracts text from multiple files and combines them into a single string.
 * @param files Array of File objects.
 * @returns Combined text from all files.
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File parsing must run on the client side.");
  }

  let combinedText = "";

  for (const file of files) {
    try {
      const fileText = await extractTextFromFile(file);
      combinedText += `${fileText}\n`;
    } catch (err) {
      console.error(`Failed to extract text from ${file.name}:`, err);
    }
  }

  return combinedText.trim();
}
