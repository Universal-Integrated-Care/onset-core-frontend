import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  Loader2,
  FileText,
  AlertCircle,
  File,
} from "lucide-react";
import { extractTextFromFiles, isValidFile } from "@/lib/parsers/fileParser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type ProcessingStage =
  | "idle"
  | "uploading"
  | "analyzing"
  | "performing-ocr"
  | "processing-text"
  | "complete";

type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
  onProcessingComplete?: (text: string) => void;
};

const FileUploader = ({
  files,
  onChange,
  onProcessingComplete,
}: FileUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] =
    useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);

  const updateProgress = (stage: ProcessingStage) => {
    setProcessingStage(stage);
    switch (stage) {
      case "uploading":
        setProgress(25);
        break;
      case "analyzing":
        setProgress(50);
        break;
      case "performing-ocr":
        setProgress(75);
        break;
      case "processing-text":
        setProgress(90);
        break;
      case "complete":
        setProgress(100);
        break;
      default:
        setProgress(0);
    }
  };

  const getProcessingMessage = (stage: ProcessingStage) => {
    switch (stage) {
      case "uploading":
        return "Uploading files...";
      case "analyzing":
        return "Analyzing document structure...";
      case "performing-ocr":
        return "Performing OCR on scanned content...";
      case "processing-text":
        return "Processing extracted text...";
      case "complete":
        return "Processing complete!";
      default:
        return "";
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const validFiles = acceptedFiles.filter(isValidFile);

        if (validFiles.length === 0) {
          setError(
            "Please upload valid files only (PDF, DOCX, or TXT, max 5MB)",
          );
          return;
        }

        setIsProcessing(true);
        setError(null);
        updateProgress("uploading");

        // Simulate file analysis delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateProgress("analyzing");

        // Start processing files
        const promises = validFiles.map(async (file) => {
          if (file.type === "application/pdf") {
            updateProgress("performing-ocr");
            // Add delay to show OCR progress
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        });

        await Promise.all(promises);
        updateProgress("processing-text");

        // Process files through the parser with OCR
        const extractedText = await extractTextFromFiles(validFiles);

        // Update form with processed files
        onChange(validFiles);

        // Pass extracted text back to parent component if callback exists
        if (onProcessingComplete) {
          onProcessingComplete(extractedText);
        }

        updateProgress("complete");

        // Reset progress after completion
        setTimeout(() => {
          setProcessingStage("idle");
          setProgress(0);
        }, 2000);
      } catch (err) {
        console.error("File processing error:", err);
        setError("Error processing files. Please try again.");
        setProcessingStage("idle");
      } finally {
        setIsProcessing(false);
      }
    },
    [onChange, onProcessingComplete],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
          ${isDragActive ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-500"}
          ${error ? "border-red-300" : ""}`}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4 w-full">
            <Loader2 className="h-10 w-10 text-green-500 animate-spin" />
            <div className="text-center w-full space-y-2">
              <p className="text-base font-medium text-gray-900">
                {getProcessingMessage(processingStage)}
              </p>
              {processingStage === "performing-ocr" && (
                <p className="text-sm text-gray-500">
                  This might take a moment for complex documents
                </p>
              )}
              <div className="w-full max-w-xs mx-auto">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        ) : files && files.length > 0 ? (
          <div className="flex flex-col items-center space-y-3">
            <FileText className="h-10 w-10 text-green-500" />
            <div className="text-center">
              <p className="text-base font-medium text-green-500">
                Files uploaded successfully!
              </p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-gray-500"
                >
                  <File className="h-4 w-4" />
                  <span>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <div className="text-center">
              <p className="text-base">
                <span className="text-green-500 font-medium">
                  Click to upload
                </span>
                {" or drag and drop"}
              </p>
              <p className="text-sm text-gray-500">TXT files (max 5MB)</p>
              <p className="text-sm text-gray-500">
                OCR available for scanned documents
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {processingStage === "complete" && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>All files processed successfully!</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUploader;
