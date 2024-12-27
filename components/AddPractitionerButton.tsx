"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";

interface AddPractitionerButtonProps {
  isLoading: boolean;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit"; // ✅ Allow setting the button type
  onClick?: () => void;
}

const AddPractitionerButton = ({
  isLoading,
  className,
  children,
  type = "submit", // ✅ Default to 'submit' for form compatibility
  onClick,
}: AddPractitionerButtonProps) => {
  return (
    <Button
      type={type}
      disabled={isLoading}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-white font-medium transition-colors duration-200 ${
        isLoading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      } ${className ?? ""}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <PlusCircle className="h-5 w-5" />
          {children}
        </>
      )}
    </Button>
  );
};

export default AddPractitionerButton;
