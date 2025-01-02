// app/api-docs/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocs() {
  const [specs, setSpecs] = useState(null);

  useEffect(() => {
    fetch("/api/docs")
      .then((response) => response.json())
      .then((data) => setSpecs(data))
      .catch((error) => console.error("Error loading API specs:", error));
  }, []);

  if (!specs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading API Documentation...</div>
      </div>
    );
  }

  return (
    <div className="swagger-wrapper bg-white">
      <SwaggerUI spec={specs} />
      <style jsx global>{`
        .swagger-wrapper {
          margin: 0;
          padding: 20px;
          background-color: white;
        }
        .swagger-ui {
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
        }
        /* Header styling */
        .swagger-ui .info .title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #333;
        }
        /* Light theme overrides */
        .swagger-ui {
          background-color: white;
          color: #333;
        }
        /* Method badges */
        .swagger-ui .opblock-get .opblock-summary-method {
          background-color: #61affe;
        }
        .swagger-ui .opblock-post .opblock-summary-method {
          background-color: #49cc90;
        }
        .swagger-ui .opblock-delete .opblock-summary-method {
          background-color: #f93e3e;
        }
        .swagger-ui .opblock-put .opblock-summary-method {
          background-color: #fca130;
        }
        /* Operation blocks */
        .swagger-ui .opblock {
          border-radius: 4px;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e8e8e8;
          background: white;
        }
        /* Response section */
        .swagger-ui .responses-wrapper {
          background: #f8f9fa;
        }
        /* Schema sections */
        .swagger-ui .model-box {
          background: #f8f9fa;
        }
        /* Navigation */
        .swagger-ui .opblock-tag {
          border-bottom: 1px solid #e8e8e8;
          color: #3b4151;
        }
        /* Remove dark backgrounds */
        .swagger-ui textarea,
        .swagger-ui input[type="text"] {
          background: #fff;
          color: #3b4151;
        }
        /* Table styling */
        .swagger-ui table tbody tr td {
          background: #fff;
          color: #3b4151;
        }
        /* Code samples */
        .swagger-ui .highlight-code {
          background: #f8f9fa;
        }
        /* Response examples */
        .swagger-ui .example {
          background: #f8f9fa;
          color: #3b4151;
        }
        /* Description text */
        .swagger-ui .markdown p,
        .swagger-ui .markdown li {
          color: #3b4151;
        }
        /* Parameters */
        .swagger-ui .parameters-col_description {
          color: #3b4151;
        }
        .swagger-ui .parameter__name {
          color: #3b4151;
        }
        /* Make buttons more visible */
        .swagger-ui .btn {
          background: #fff;
          color: #3b4151;
          border: 1px solid #d9d9d9;
        }
        .swagger-ui .btn:hover {
          background: #f2f2f2;
        }
      `}</style>
    </div>
  );
}
