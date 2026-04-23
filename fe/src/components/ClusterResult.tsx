import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { buildClusterInfos } from "@/app/utils/clusterName";
import type { CustomerData, ClusteringResult } from "@/app/types";

interface ClusterResultProps {
  data: CustomerData[];
  results: ClusteringResult;
}

/** A single stat row inside the cluster card */
function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs text-gray-800">{value}</span>
    </div>
  );
}

export function ClusterResult({ data, results }: ClusterResultProps) {
  const { labels, centroids } = results;
  const k = Math.max(...labels) + 1;

  // Build rich metadata for each cluster
  const clusterInfos = buildClusterInfos(data, labels, centroids, k);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h2 className="text-gray-800">Phân khúc khách hàng</h2>
        <p className="text-sm text-gray-400">
          K-Means tìm thấy {k} nhóm khách hàng riêng biệt dựa trên thu nhập, chi
          tiêu, tuổi và tần suất mua hàng.
        </p>
      </div>

      {/* Grid of cluster cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {clusterInfos.map((cluster) => (
          <Card
            key={cluster.id}
            className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Colored top accent bar */}
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: cluster.color }}
            />

            <CardContent className="p-4 space-y-3">
              {/* Header row: name + badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm text-gray-800 leading-tight">
                    {cluster.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">
                    {cluster.description}
                  </p>
                </div>
                <Badge
                  style={{
                    backgroundColor: cluster.color + "18",
                    color: cluster.color,
                    borderColor: cluster.color + "40",
                  }}
                  variant="outline"
                  className="shrink-0 rounded-full border text-xs px-2.5 py-0.5"
                >
                  #{cluster.id}
                </Badge>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Stats */}
              <div className="space-y-0.5">
                <StatRow
                  icon={<Users className="w-3.5 h-3.5" />}
                  label="Khách hàng"
                  value={`${cluster.count} (${Math.round((cluster.count / data.length) * 100)}%)`}
                />
                <StatRow
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  label="Thu nhập TB"
                  value={`$${cluster.avgIncome}k`}
                />
                <StatRow
                  icon={<ShoppingCart className="w-3.5 h-3.5" />}
                  label="Chi tiêu TB"
                  value={`${cluster.avgSpending}/100`}
                />
                <StatRow
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Tuổi TB"
                  value={`${cluster.avgAge} tuổi`}
                />
              </div>

              {/* Spending bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">Mức chi tiêu</span>
                  <span className="text-xs" style={{ color: cluster.color }}>
                    {cluster.avgSpending}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cluster.avgSpending}%`,
                      backgroundColor: cluster.color,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
