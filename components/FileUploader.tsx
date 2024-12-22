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
  | "processing-text"
  | "complete";

type FileUploaderProps = {
  files: File[] | null | undefined;
  onChange: (value: string) => void;
};

const FileUploader = ({ files, onChange }: FileUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] =
    useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);

  const updateProgress = (stage: ProcessingStage) => {
    setProcessingStage(stage);
    switch (stage) {
      case "uploading":
        setProgress(33);
        break;
      case "analyzing":
        setProgress(66);
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
      case "processing-text":
        return "Processing text...";
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
          setError("Please upload valid files only (TXT or DOCX, max 5MB)");
          return;
        }

        setIsProcessing(true);
        setError(null);
        updateProgress("uploading");

        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress("analyzing");

        await new Promise((resolve) => setTimeout(resolve, 500));
        updateProgress("processing-text");

        const extractedText = await extractTextFromFiles(validFiles);
        console.log("Extracted text:", extractedText);

        onChange(extractedText);

        updateProgress("complete");

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
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
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
              {Array.isArray(files) &&
                files.map((file, index) => (
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
              <p className="text-sm text-gray-500">
                TXT or DOCX files (max 5MB)
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
