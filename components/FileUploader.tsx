"use client";

import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { convertFileToUrl } from "@/lib/utils";

type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
};

const FileUploader = ({ files, onChange }: FileUploaderProps) => {
  const [isUploaded, setIsUploaded] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange(acceptedFiles);
      setIsUploaded(true);
    },
    [onChange],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()} className="file-upload">
      <input {...getInputProps()} />
      {files && files?.length > 0 ? (
        <div className="flex flex-col items-center">
          <UploadCloud className="h-10 w-10 text-green-500" />
          <div className="file-upload_label">
            <p className="text-14-regular">
              <span className="text-green-500">
                File uploaded successfully!
              </span>
            </p>
            <p className="text-12-regular text-dark-600">
              {files[0].name} ({(files[0].size / 1024).toFixed(1)} KB)
            </p>
          </div>
        </div>
      ) : (
        <>
          <Image
            src="/assets/icons/upload.svg"
            width={40}
            height={40}
            alt="upload"
          />
          <div className="file-upload_label">
            <p className="text-14-regular">
              <span className="text-green-500">Click to upload </span>
              or drag and drop
            </p>
            <p className="text-12-regular">TXT or PDF files only, max 5MB</p>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUploader;
