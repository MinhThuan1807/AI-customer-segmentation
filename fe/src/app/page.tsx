/**
 * App.tsx
 * -------
 * Main entry point for the Customer Segmentation Dashboard.
 *
 * UI Flow (3 steps):
 *  Step 1 — "upload"   → Upload a CSV file or load demo data
 *  Step 2 — "preview"  → Preview the data table, configure K, run analysis
 *  Step 3 — "results"  → View scatter plot, elbow chart, cluster cards, and filtered table
 *
 * The K-Means algorithm runs entirely in the browser (no backend needed).
 * In a real production app, you'd POST to /api/cluster and get back labels + centroids.
 */

// ⚠️ Must be first — suppresses browser extension conflicts (window.ethereum redefinition)
'use client';
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
import { Download, RotateCcw, BrainCircuit, CheckCircle2, Loader2 } from "lucide-react";
import type { CustomerData, ClusteringResult } from "./types";

// ─────────────────────────────────────────────
// Step type
// ─────────────────────────────────────────────
type Step = "upload" | "preview" | "results";

// ─────────────────────────────────────────────
// Step indicator component (top progress bar)
// ─────────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string; num: number }[] = [
    { id: "upload", label: "Upload Data", num: 1 },
    { id: "preview", label: "Configure", num: 2 },
    { id: "results", label: "Results", num: 3 },
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
                  active ? "text-indigo-600" : done ? "text-gray-400" : "text-gray-300"
                }`}
              >
                {s.label}
              </span>
            </div>

            {/* Connector line between steps */}
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

// ─────────────────────────────────────────────
// Stat card for the results summary bar
// ─────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-900 mt-0.5 truncate" title={value}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────
export default function App() {
  // ── State ──
  const [step, setStep] = useState<Step>("upload");
  const [data, setData] = useState<CustomerData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [kValue, setKValue] = useState<number>(3);
  const [clusterResults, setClusterResults] = useState<ClusteringResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterCluster, setFilterCluster] = useState<number | "all">("all");
  const [loadingMsg, setLoadingMsg] = useState<string>("");

  // ── Step 1 → Step 2: Data loaded ──
  const handleDataLoaded = (newData: CustomerData[], name: string) => {
    setData(newData);
    setFileName(name);
    setClusterResults(null);
    setFilterCluster("all");
    setStep("preview");
  };

  // ── Step 2 → Step 3: Run K-Means ──
  // In a real app, this would POST to /api/cluster and await the response.
  // Here we run K-Means directly in the browser and simulate a loading delay.
  const handleRunClustering = async () => {
    setIsLoading(true);
    setLoadingMsg("Initializing centroids...");

    // Simulate API latency in stages (educational UX)
    await new Promise((res) => setTimeout(res, 600));
    setLoadingMsg("Running K-Means iterations...");
    await new Promise((res) => setTimeout(res, 700));
    setLoadingMsg("Computing elbow method...");
    await new Promise((res) => setTimeout(res, 500));

    try {
      /**
       * 🔌 BACKEND INTEGRATION POINT
       * ─────────────────────────────
       * Replace this block with a real API call:
       *
       *   const response = await fetch("/api/cluster", {
       *     method: "POST",
       *     headers: { "Content-Type": "application/json" },
       *     body: JSON.stringify({ data, k: kValue }),
       *   });
       *   const results = await response.json();
       *   // results = { labels: number[], centroids: number[][], elbowData: [...] }
       *
       * For now, we run K-Means in the browser:
       */
          const response = await fetch("http://127.0.0.1:8000/api/cluster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, k: kValue }),
          });
          const results = await response.json();
          // results = { labels: number[], centroids: number[][], elbowData: [...] }
       
      // const results = runKMeans(data, kValue);

      setClusterResults(results);
      setStep("results");
    } catch (err) {
      console.error("Clustering failed:", err);
    } finally {
      setIsLoading(false);
      setLoadingMsg("");
    }
  };

  // ── Reset to start ──
  const handleReset = () => {
    setStep("upload");
    setData([]);
    setFileName("");
    setClusterResults(null);
    setFilterCluster("all");
    setKValue(3);
  };

  // ── Download CSV with cluster labels ──
  const handleDownload = () => {
    if (!clusterResults) return;
    downloadCSV(data, clusterResults.labels, `segments_k${kValue}_${fileName}`);
  };

  // ── Derived values ──
  const numClusters = clusterResults ? Math.max(...clusterResults.labels) + 1 : 0;

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* ── Header ── */}
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
              <p className="text-xs text-gray-400 hidden sm:block">K-Means Clustering Analysis</p>
            </div>
          </div>

          {/* Action buttons in header (only in results step) */}
          {step === "results" && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-xl border-gray-200 text-sm gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Analysis
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* ── STEP 1: Upload ── */}
        {step === "upload" && (
          <div className="flex flex-col items-center">
            <div className="text-center mb-8 max-w-xl">
              <h2 className="text-gray-800 mb-2">Upload Your Customer Data</h2>
              <p className="text-sm text-gray-400">
                Upload a CSV file with customer records, or use our 200-customer demo dataset
                to explore the full K-Means clustering pipeline instantly.
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <UploadSection onDataLoaded={handleDataLoaded} />
            </div>
          </div>
        )}

        {/* ── STEP 2: Preview + Configure ── */}
        {step === "preview" && (
          <div className="space-y-6">
            {/* File info banner */}
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-indigo-800 truncate">
                  <span className="text-indigo-600">Loaded:</span> {fileName}
                </p>
                <p className="text-xs text-indigo-400">{data.length} customer records ready for clustering</p>
              </div>
              <Badge className="bg-indigo-600 text-white rounded-full px-3 shrink-0">
                {data.length} rows
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Data table — takes 2/3 width on large screens */}
              <div className="lg:col-span-2">
                <DataTable data={data} maxRows={20} />
              </div>

              {/* Cluster config — takes 1/3 width */}
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

            {/* Loading overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-6 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-800">Running K-Means (K = {kValue})</p>
                    <p className="text-sm text-gray-400 mt-1">{loadingMsg}</p>
                  </div>
                  {/* Progress dots */}
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

        {/* ── STEP 3: Results ── */}
        {step === "results" && clusterResults && (
          <div className="space-y-8">
            {/* Summary stats row */}
            <div className="flex flex-wrap gap-3">
              <StatCard label="Total Customers" value={data.length.toString()} sub="in dataset" />
              <StatCard label="Clusters Found" value={numClusters.toString()} sub={`K = ${kValue}`} />
              <StatCard
                label="Avg. Cluster Size"
                value={Math.round(data.length / numClusters).toString()}
                sub="customers/cluster"
              />
              <StatCard
                label="File"
                value={fileName}
                sub="source data"
              />
            </div>

            {/* Charts */}
            <ChartSection data={data} results={clusterResults} />

            {/* Cluster summary cards */}
            <ClusterResult data={data} results={clusterResults} />

            {/* Filtered data table */}
            <DataTable
              data={data}
              labels={clusterResults.labels}
              filterCluster={filterCluster}
              setFilterCluster={setFilterCluster}
            />

            {/* Bottom action bar */}
            <div className="flex flex-col sm:flex-row gap-3 pb-8">
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl border-gray-200 py-5 gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start New Analysis
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 sm:flex-initial rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-5 gap-2"
              >
                <Download className="w-4 h-4" />
                Download Results as CSV
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-gray-300">
          <span>Customer Segmentation Dashboard</span>
          <span>K-Means Clustering · Built with React + Recharts</span>
        </div>
      </footer>
    </div>
  );
}