/**
 * ChartSection.tsx
 * ----------------
 * Visualizes clustering results with two charts:
 *
 *  1. Scatter Plot — Annual Income vs Spending Score, colored by cluster
 *     → Helps you SEE how clusters are separated in 2D space
 *
 *  2. Elbow Method Chart — WCSS vs K (line chart)
 *     → Helps you find the OPTIMAL number of clusters
 *     → Look for the "elbow" — where WCSS stops dropping sharply
 */

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingDown } from "lucide-react";
import { CLUSTER_COLORS } from "@/app/utils/clusterName";
import type { CustomerData, ClusteringResult } from "@/app/types";

interface ChartSectionProps {
  data: CustomerData[];
  results: ClusteringResult;
}

// Custom tooltip for scatter plot
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScatterTooltipContent = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm">
        <p className="text-gray-500 mb-1">Cluster <span className="text-gray-800">{d.cluster}</span></p>
        <p className="text-gray-600">Income: <span className="text-gray-900">${d.x}k</span></p>
        <p className="text-gray-600">Spending: <span className="text-gray-900">{d.y}</span></p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for elbow chart
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ElbowTooltipContent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-3 text-sm">
        <p className="text-gray-600">K = <span className="text-gray-900">{label}</span></p>
        <p className="text-gray-600">WCSS = <span className="text-indigo-600">{payload[0].value.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

export function ChartSection({ data, results }: ChartSectionProps) {
  const { labels, elbowData } = results;

  // ── Scatter Plot Data ──
  // Group data points by cluster for separate <Scatter> components
  const k = Math.max(...labels) + 1;
  const scatterDataByCluster = Array.from({ length: k }, (_, clusterIdx) =>
    data
      .map((d, i) => ({ x: d.AnnualIncome, y: d.SpendingScore, cluster: labels[i] }))
      .filter((d) => d.cluster === clusterIdx)
  );

  // Find optimal K (biggest drop in WCSS) for annotation
  let biggestDrop = 0;
  let elbowK = 3;
  for (let i = 1; i < elbowData.length; i++) {
    const drop = elbowData[i - 1].wcss - elbowData[i].wcss;
    if (drop > biggestDrop) {
      biggestDrop = drop;
      elbowK = elbowData[i].k; // K after the biggest drop
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base">Visualizations</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">Explore cluster separation and optimal K</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="scatter">
          <TabsList className="rounded-xl bg-gray-100 mb-6">
            <TabsTrigger value="scatter" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
              Scatter Plot
            </TabsTrigger>
            <TabsTrigger value="elbow" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
              Elbow Method
            </TabsTrigger>
          </TabsList>

          {/* ── Scatter Plot Tab ── */}
          <TabsContent value="scatter">
            <div className="mb-3">
              <p className="text-sm text-gray-500">
                Each dot is a customer. Color indicates cluster. Notice how customers
                with similar income and spending are grouped together.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Annual Income"
                  label={{ value: "Annual Income (k$)", position: "insideBottom", offset: -10, fontSize: 12, fill: "#9ca3af" }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Spending Score"
                  label={{ value: "Spending Score", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: "#9ca3af" }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  domain={[0, 105]}
                />
                <Tooltip content={<ScatterTooltipContent />} />
                <Legend
                  formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                />
                {scatterDataByCluster.map((clusterData, i) => (
                  <Scatter
                    key={i}
                    name={`Cluster ${i}`}
                    data={clusterData}
                    fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]}
                    fillOpacity={0.75}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* ── Elbow Method Tab ── */}
          <TabsContent value="elbow">
            <div className="mb-3">
              <p className="text-sm text-gray-500">
                <span className="text-gray-700">How to read this:</span> Find the {"elbowK"} — where
                the WCSS curve starts flattening. That K value gives you tight clusters
                without over-segmenting. The suggested elbow is at{" "}
                <span className="text-indigo-600">K = {elbowK}</span>.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={elbowData} margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="k"
                  label={{ value: "Number of Clusters (K)", position: "insideBottom", offset: -10, fontSize: 12, fill: "#9ca3af" }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  label={{ value: "WCSS", angle: -90, position: "insideLeft", offset: 10, fontSize: 12, fill: "#9ca3af" }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <Tooltip content={<ElbowTooltipContent />} />

                {/* Vertical reference line at suggested elbow K */}
                <ReferenceLine
                  x={elbowK}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{ value: `Elbow ≈ K${elbowK}`, position: "top", fill: "#6366f1", fontSize: 11 }}
                />

                <Line
                  type="monotone"
                  dataKey="wcss"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-gray-400 text-center mt-2">
              WCSS = Within-Cluster Sum of Squares — measures how tight/compact your clusters are
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}