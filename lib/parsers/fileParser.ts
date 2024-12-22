"use client";

import mammoth from "mammoth";

interface FileContent {
  text: string;
}

/**
 * Processes a Word document
 */
async function processWord(file: File): Promise<FileContent> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const text = result.value
      .replace(/<p>/g, "\n")
      .replace(/<\/p>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]*>/g, "")
      .trim();

    return { text };
  } catch (error) {
    console.error("Word document processing error:", error);
    throw new Error(`Failed to process Word document: ${error.message}`);
  }
}

/**
 * Main function to extract text from files
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File parsing must run on the client side.");
  }

  try {
    console.log(`Starting to process file: ${file.name}`);
    let result: FileContent;

    switch (file.type) {
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        result = await processWord(file);
        break;

      case "text/plain":
        result = {
          text: await file.text(),
        };
        break;

      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }

    return `[File processed successfully]\n\n${result.text}`.trim();
  } catch (error) {
    console.error("Error processing file:", error);
    throw new Error(`Failed to process ${file.name}: ${error.message}`);
  }
}

/**
 * Processes multiple files
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("File parsing must run on the client side.");
  }

  const textParts: string[] = [];

  for (const file of files) {
    try {
      console.log(`Processing file: ${file.name}`);
      // Add file metadata
      textParts.push(`File: ${file.name}`);
      textParts.push(`Type: ${getFileTypeDescription(file.type)}`);
      textParts.push(`Size: ${(file.size / 1024).toFixed(2)} KB`);
      textParts.push("Content:");

      const fileContent = await extractTextFromFile(file);
      textParts.push(fileContent);
      textParts.push("\n---\n");
    } catch (err) {
      console.error(`Failed to process ${file.name}:`, err);
      textParts.push(`Error processing file: ${err.message}`);
      textParts.push("\n---\n");
    }
  }

  return textParts.join("\n");
}

/**
 * Validates files before processing
 */
export function isValidFile(file: File): boolean {
  const validTypes = [
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
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

/**
 * Gets a human-readable file type description
 */
export function getFileTypeDescription(fileType: string): string {
  const typeMap: { [key: string]: string } = {
    "text/plain": "Text File",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word Document",
  };
  return typeMap[fileType] || "Unknown File Type";
}
