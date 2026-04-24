import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  AlertCircle,
  Database,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { parseCSV } from "@/app/utils/csvParser";
import { generateMockData } from "@/app/utils/mockData";
import type { CustomerData } from "@/app/types";

interface UploadSectionProps {
  onDataLoaded: (data: CustomerData[], filename: string) => void;
}

export function UploadSection({ onDataLoaded }: UploadSectionProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<CustomerData[] | null>(null);

  // Called when user drops or selects a file
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);
      setParsedData(null);
      setFileName(null);

      // Handle rejected files (wrong type)
      if (rejectedFiles && (rejectedFiles as File[]).length > 0) {
        setError("Loại file không hợp lệ. Vui lòng tải lên file .csv.");
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setFileName(file.name);

      // Read and parse the CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          setParsedData(data);
          setError(null);
        } catch (err) {
          setError((err as Error).message);
          setParsedData(null);
        }
      };
      reader.onerror = () => setError("Không thể đọc file. Vui lòng thử lại.");
      reader.readAsText(file);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noDragEventsBubbling: true,
  });

  // Load pre-generated demo data
  const handleDemoData = () => {
    const data = generateMockData(200);
    onDataLoaded(data, "demo_customers.csv");
  };

  // Proceed with uploaded file
  const handleAnalyze = () => {
    if (parsedData && fileName) {
      onDataLoaded(parsedData, fileName);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      {/* Main dropzone area */}
      <Card className="w-full rounded-2xl shadow-sm border border-dashed border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            onClick={open}
            className={`
              flex flex-col items-center justify-center gap-4 p-12 cursor-pointer
              transition-colors duration-200
              ${isDragActive ? "bg-indigo-50 border-indigo-400" : "bg-white hover:bg-gray-50"}
            `}
          >
            <input {...getInputProps()} />

            {/* Icon */}
            <div
              className={`
              w-16 h-16 rounded-2xl flex items-center justify-center
              ${isDragActive ? "bg-indigo-100" : "bg-gray-100"}
              transition-colors duration-200
            `}
            >
              <Upload
                className={`w-7 h-7 ${isDragActive ? "text-indigo-600" : "text-gray-500"}`}
              />
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-gray-800 mb-1">
                {isDragActive
                  ? "Thả file của bạn vào đây"
                  : "Kéo & thả file CSV vào đây"}
              </p>
              <p className="text-sm text-gray-400">
                hoặc nhấp để chọn — chỉ file .csv
              </p>
            </div>

            {/* Template hint */}
            <div className="bg-gray-50 rounded-xl px-4 py-2 text-sm text-gray-500 text-center">
              <span className="text-gray-700">Các cột bắt buộc: </span>
              CustomerID, Age, AnnualIncome, SpendingScore, PurchaseFrequency
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected file status */}
      {fileName && (
        <div
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${
            parsedData
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {parsedData ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 truncate flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              {fileName}
            </p>
            {parsedData && (
              <p className="text-xs text-emerald-600">
                Đã tải {parsedData.length} khách hàng ✓
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="w-full flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Analyze uploaded file */}
        <Button
          onClick={handleAnalyze}
          disabled={!parsedData}
          className="flex-1 rounded-xl py-5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40"
        >
          <Upload className="w-4 h-4 mr-2" />
          Phân tích dữ liệu
        </Button>

        {/* Or use demo data */}
        <Button
          onClick={handleDemoData}
          variant="outline"
          className="flex-1 rounded-xl py-5 border-gray-200 hover:bg-gray-50"
        >
          <Database className="w-4 h-4 mr-2" />
          Dùng dữ liệu mẫu (200 khách hàng)
        </Button>
      </div>

      {/* Info about demo data */}
      <p className="text-sm text-gray-400 text-center -mt-2">
        Dữ liệu mẫu gồm 5 nhóm khách hàng tự nhiên để bạn khám phá dashboard
        ngay lập tức.
      </p>
    </div>
  );
}
