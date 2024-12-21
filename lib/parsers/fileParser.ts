"use client";

/**
 * Extracts text from a PDF or TXT file.
 * @param file File object to extract text from.
 * @returns Extracted text as a string.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File parsing must run on the client side.");
  }

  const fileType = file.type;

  if (fileType === "application/pdf") {
    try {
      // Import PDF.js library
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const textContent: string[] = [];

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Process each text item on the page
        const pageText = content.items.reduce((text: string, item: any) => {
          // Handle different types of text items
          if (item.str) {
            // Add space if it doesn't end with one and next item doesn't start with one
            const needsSpace = !text.endsWith(" ") && !item.str.startsWith(" ");
            return text + (needsSpace ? " " : "") + item.str;
          }
          return text;
        }, "");

        textContent.push(pageText);
      }

      return textContent.join("\n").trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  if (fileType === "text/plain") {
    try {
      // For text files, read directly
      const text = await file.text();
      return text.trim();
    } catch (error) {
      console.error("Error extracting text from TXT:", error);
      throw new Error(`Failed to extract text from TXT: ${error.message}`);
    }
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

/**
 * Extracts text from multiple files and combines them into a single string.
 * @param files Array of File objects.
 * @returns Combined text from all files with metadata.
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File parsing must run on the client side.");
  }

  const textParts: string[] = [];

  for (const file of files) {
    try {
      // Add file metadata
      textParts.push(`File: ${file.name}`);
      textParts.push(`Type: ${file.type}`);
      textParts.push(`Size: ${(file.size / 1024).toFixed(2)} KB`);
      textParts.push("Content:");

      // Extract and add file content
      const fileText = await extractTextFromFile(file);
      textParts.push(fileText);
      textParts.push("\n---\n"); // Separator between files
    } catch (err) {
      console.error(`Failed to extract text from ${file.name}:`, err);
      textParts.push(`Error processing file: ${err.message}`);
      textParts.push("\n---\n");
    }
  }

  return textParts.join("\n");
}

/**
 * Validates file before processing
 * @param file File to validate
 * @returns Boolean indicating if file is valid
 */
export function isValidFile(file: File): boolean {
  const validTypes = ["application/pdf", "text/plain"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    console.error("Invalid file type:", file.type);
    return false;
  }

  if (file.size > maxSize) {
    console.error("File too large:", file.size);
    return false;
  }

  return true;
}
