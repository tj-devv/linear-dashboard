import React from "react";
import { parseCSV } from "@/lib/parser";
import { useIssuesStore } from "@/store/useIssuesStore";
import { useNavigate } from "@tanstack/react-router";

export default function UploadZone() {
  const setIssues = useIssuesStore((s) => s.setIssues);
  const navigate = useNavigate();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const data = await parseCSV(file);
    setIssues(data, {
      name: file.name,
      uploadedAt: new Date(),
      recordCount: data.length,
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <input type="file" accept=".csv" onChange={handleUpload} />
  );
}