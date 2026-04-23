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
        <p className="text-gray-500 mb-1">
          Cụm <span className="text-gray-800">{d.cluster}</span>
        </p>
        <p className="text-gray-600">
          Thu nhập: <span className="text-gray-900">${d.income}k</span>
        </p>
        <p className="text-gray-600">
          Chi tiêu: <span className="text-gray-900">{d.spending}</span>
        </p>
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
        <p className="text-gray-600">
          K = <span className="text-gray-900">{label}</span>
        </p>
        <p className="text-gray-600">
          WCSS ={" "}
          <span className="text-indigo-600">{payload[0].value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ChartSection({ data, results }: ChartSectionProps) {
  const { labels, elbowData } = results;

  // ── Scatter Plot Data ──
  // Dùng PCA 2D coords nếu có (chính xác hơn), fallback về Income vs Spending
  const usePCA = !!(
    results.pcaCoords && results.pcaCoords.length === data.length
  );

  const k = Math.max(...labels) + 1;
  const scatterDataByCluster = Array.from({ length: k }, (_, clusterIdx) =>
    data
      .map((d, i) => ({
        x: usePCA ? results.pcaCoords![i][0] : d.AnnualIncome,
        y: usePCA ? results.pcaCoords![i][1] : d.SpendingScore,
        cluster: labels[i],
        // giữ lại để tooltip hiển thị
        income: d.AnnualIncome,
        spending: d.SpendingScore,
      }))
      .filter((d) => d.cluster === clusterIdx),
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
            <CardTitle className="text-base">Biểu đồ trực quan</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Khám phá sự phân tách cụm và K tối ưu
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="scatter">
          <TabsList className="rounded-xl bg-gray-100 mb-6">
            <TabsTrigger
              value="scatter"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
              Biểu đồ phân tán
            </TabsTrigger>
            <TabsTrigger
              value="elbow"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
              Phương pháp Elbow
            </TabsTrigger>
          </TabsList>

          {/* ── Scatter Plot Tab ── */}
          <TabsContent value="scatter">
            <div className="mb-3">
              <p className="text-sm text-gray-500">
                Mỗi chấm là một khách hàng. Màu sắc biểu thị cụm.{" "}
                {usePCA
                  ? "Trục hiển thị thành phần PCA — 4 đặc trưng (Tuổi, Thu nhập, Chi tiêu, Tần suất) được phản ánh chính xác."
                  : "Trục hiển thị Thu nhập hàng năm và Điểm chi tiêu."}
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart
                margin={{ top: 10, right: 30, bottom: 40, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={usePCA ? "PCA Component 1" : "Annual Income"}
                  label={{
                    value: usePCA
                      ? "Thành phần PCA 1"
                      : "Thu nhập hàng năm (k$)",
                    position: "insideBottom",
                    offset: -20,
                    fontSize: 12,
                    fill: "#9ca3af",
                  }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  domain={["auto", "auto"]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={usePCA ? "PCA Component 2" : "Spending Score"}
                  label={{
                    value: usePCA ? "Thành phần PCA 2" : "Điểm chi tiêu",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 12,
                    fill: "#9ca3af",
                  }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<ScatterTooltipContent />} />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 24 }}
                  formatter={(value) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
                {scatterDataByCluster.map((clusterData, i) => (
                  <Scatter
                    key={i}
                    name={`Cụm ${i}`}
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
                <span className="text-gray-700">Cách đọc biểu đồ:</span> Tìm
                điểm {"elbowK"} — nơi đường cong WCSS bắt đầu phẳng dần. Giá trị
                K đó cho bạn các cụm chặt chẽ mà không bị phân đoạn quá mức.
                Điểm elbow gợi ý là{" "}
                <span className="text-indigo-600">K = {elbowK}</span>.
              </p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart
                data={elbowData}
                margin={{ top: 30, right: 30, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="k"
                  label={{
                    value: "Số cụm (K)",
                    position: "insideBottom",
                    offset: -10,
                    fontSize: 12,
                    fill: "#9ca3af",
                  }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <YAxis
                  label={{
                    value: "WCSS",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 12,
                    fill: "#9ca3af",
                  }}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                />
                <Tooltip content={<ElbowTooltipContent />} />

                {/* Vertical reference line at suggested elbow K */}
                <ReferenceLine
                  x={elbowK}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{
                    value: `Elbow ≈ K${elbowK}`,
                    position: "insideTop",
                    fill: "#6366f1",
                    fontSize: 11,
                    offset: 10,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="wcss"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{
                    r: 5,
                    fill: "#6366f1",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 7, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>

            <p className="text-xs text-gray-400 text-center mt-2">
              WCSS = Tổng bình phương trong cụm — đo mức độ chặt chẽ/gọn gàng
              của các cụm
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
