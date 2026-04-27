import { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { useIssuesStore } from "@/store/useIssuesStore";
import { parseCSV, validateCSV } from "@/lib/parser";
import { cn } from "@/lib/utils";
import { LoadingState } from "./ui/LoadingState";

interface UploadDropzoneProps {
  className?: string;
}

export function UploadDropzone({ className }: UploadDropzoneProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setIssues } = useIssuesStore();

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateCSV(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const issues = await parseCSV(file);
        if (issues.length === 0) {
          setError("No issues found in the CSV file");
          setIsLoading(false);
          return;
        }

        await setIssues(issues, {
          name: file.name,
          uploadedAt: new Date(),
          recordCount: issues.length,
        });

        navigate({ to: "/dashboard" });
      } catch (e) {
        setError("Failed to parse CSV file. Please check the format.");
        setIsLoading(false);
      }
    },
    [navigate, setIssues]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  if (isLoading) {
    return <LoadingState message="Processing your CSV..." />;
  }

  return (
    <div className={cn("w-full max-w-xl mx-auto", className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all",
          "hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
            : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="sr-only"
        />

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            "bg-gray-100 dark:bg-gray-800"
          )}
        >
          <FileSpreadsheet className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>

        <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Upload your Linear CSV
        </h3>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Supports .csv files exported from Linear
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}