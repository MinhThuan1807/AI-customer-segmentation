"use client";
import "./utils/suppressExtensionErrors";
import React, { useState } from "react";
import { UploadSection } from "@/components/UploadSection";
import { DataTable } from "@/components/DataTable";
import { ClusterConfig } from "@/components/ClusterConfig";
import { ChartSection } from "@/components/ChartSection";
import { ClusterResult } from "@/components/ClusterResult";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { runKMeans } from "./utils/kMeans";
import { downloadCSV } from "./utils/exportCSV";
import {
  Download,
  RotateCcw,
  BrainCircuit,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { CustomerData, ClusteringResult } from "./types";

type Step = "upload" | "preview" | "results";

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string; num: number }[] = [
    { id: "upload", label: "Tải dữ liệu", num: 1 },
    { id: "preview", label: "Cấu hình", num: 2 },
    { id: "results", label: "Kết quả", num: 3 },
  ];

  const stepOrder: Record<Step, number> = { upload: 0, preview: 1, results: 2 };
  const currentIdx = stepOrder[step];

  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <React.Fragment key={s.id}>
            {/* Step dot */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300
                  ${done ? "bg-indigo-600 text-white shadow-sm" : ""}
                  ${active ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100" : ""}
                  ${!done && !active ? "bg-gray-100 text-gray-400" : ""}
                `}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs mt-1.5 transition-colors ${
                  active
                    ? "text-indigo-600"
                    : done
                      ? "text-gray-400"
                      : "text-gray-300"
                }`}
              >
                {s.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-5 mx-2 transition-colors duration-300 ${
                  i < currentIdx ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-900 mt-0.5 truncate" title={value}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState<Step>("upload");
  const [data, setData] = useState<CustomerData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [kValue, setKValue] = useState<number>(3);
  const [clusterResults, setClusterResults] = useState<ClusteringResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterCluster, setFilterCluster] = useState<number | "all">("all");
  const [loadingMsg, setLoadingMsg] = useState<string>("");

  const handleDataLoaded = (newData: CustomerData[], name: string) => {
    setData(newData);
    setFileName(name);
    setClusterResults(null);
    setFilterCluster("all");
    setStep("preview");
  };

  const handleRunClustering = async () => {
    setIsLoading(true);
    setLoadingMsg("Đang khởi tạo tâm cụm...");

    await new Promise((res) => setTimeout(res, 600));
    setLoadingMsg("Đang chạy các vòng lặp K-Means...");
    await new Promise((res) => setTimeout(res, 700));
    setLoadingMsg("Đang tính toán phương pháp Elbow...");
    await new Promise((res) => setTimeout(res, 500));

    try {
      const response = await fetch("http://127.0.0.1:8000/api/cluster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, k: kValue }),
      });
      const results = await response.json();
      setClusterResults(results);
      setStep("results");
    } catch (err) {
      console.error("Clustering failed:", err);
    } finally {
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setData([]);
    setFileName("");
    setClusterResults(null);
    setFilterCluster("all");
    setKValue(3);
  };

  const handleDownload = () => {
    if (!clusterResults) return;
    downloadCSV(data, clusterResults.labels, `segments_k${kValue}_${fileName}`);
  };

  const numClusters = clusterResults
    ? Math.max(...clusterResults.labels) + 1
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 leading-tight">
                Customer Segmentation
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Phân tích phân cụm K-Means
              </p>
            </div>
          </div>

          {step === "results" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-xl border-gray-200 text-sm gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Phân tích mới
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Tải CSV
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <StepIndicator step={step} />

        {step === "upload" && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-8 max-w-xl">
              <h2 className="text-gray-800 mb-2">Tải lên dữ liệu khách hàng</h2>
              <p className="text-sm text-gray-400">
                Tải lên file CSV chứa dữ liệu khách hàng, hoặc dùng bộ dữ liệu
                mẫu 200 khách hàng để khám phá toàn bộ quy trình phân cụm
                K-Means ngay lập tức.
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <UploadSection onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-indigo-800 truncate">
                  <span className="text-indigo-600">Đã tải:</span> {fileName}
                </p>
                <p className="text-xs text-indigo-400">
                  {data.length} bản ghi khách hàng sẵn sàng phân cụm
                </p>
              </div>
              <Badge className="bg-indigo-600 text-white rounded-full px-3 shrink-0">
                {data.length} hàng
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DataTable data={data} maxRows={20} />
              </div>

              <div className="lg:col-span-1">
                <ClusterConfig
                  kValue={kValue}
                  setKValue={setKValue}
                  onRun={handleRunClustering}
                  onBack={handleReset}
                  isLoading={isLoading}
                  totalCustomers={data.length}
                />
              </div>
            </div>

            {isLoading && (
              <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-6 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-800">
                      Đang chạy K-Means (K = {kValue})
                    </p>
                    <p className="text-sm text-gray-400 mt-1">{loadingMsg}</p>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "results" && clusterResults && (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3">
              <StatCard
                label="Tổng khách hàng"
                value={data.length.toString()}
                sub="trong bộ dữ liệu"
              />
              <StatCard
                label="Số cụm tìm được"
                value={numClusters.toString()}
                sub={`K = ${kValue}`}
              />
              <StatCard
                label="Kích thước cụm TB"
                value={Math.round(data.length / numClusters).toString()}
                sub="khách hàng/cụm"
              />
              <StatCard label="File" value={fileName} sub="dữ liệu nguồn" />
            </div>

            <ChartSection data={data} results={clusterResults} />

            <ClusterResult data={data} results={clusterResults} />

            <DataTable
              data={data}
              labels={clusterResults.labels}
              filterCluster={filterCluster}
              setFilterCluster={setFilterCluster}
            />

            <div className="flex flex-col sm:flex-row gap-3 pb-8">
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl border-gray-200 py-5 gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Bắt đầu phân tích mới
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 sm:flex-initial rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-5 gap-2"
              >
                <Download className="w-4 h-4" />
                Tải kết quả dưới dạng CSV
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-gray-300">
          <span>Bảng điều khiển phân khúc khách hàng</span>
          <span>Phân cụm K-Means · Xây dựng với React + Recharts</span>
        </div>
      </footer>
    </div>
  );
}
