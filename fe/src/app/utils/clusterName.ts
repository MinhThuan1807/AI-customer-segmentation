/**
 * clusterNames.ts
 * ---------------
 * Assigns human-readable names and descriptions to clusters
 * based on their centroid values (income and spending score).
 *
 * Centroids format: [Age, AnnualIncome, SpendingScore, PurchaseFrequency]
 */

import type { CustomerData, ClusterInfo } from "../types";

/** One color per cluster (supports up to 10 clusters) */
export const CLUSTER_COLORS = [
  "#6366f1", // Indigo
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#84cc16", // Lime
];

/** Builds a ClusterInfo object for each cluster */
export function buildClusterInfos(
  data: CustomerData[],
  labels: number[],
  centroids: number[][],
  k: number
): ClusterInfo[] {
  const avgIncome = centroids.reduce((s, c) => s + c[1], 0) / k;
  const avgSpending = centroids.reduce((s, c) => s + c[2], 0) / k;

  // Sort clusters by composite score (income + spending) to assign names consistently
  const ranked = centroids.map((c, i) => ({ i, score: c[1] + c[2] }));
  ranked.sort((a, b) => b.score - a.score);

  const namePool: { name: string; description: string }[] = [
    {
      name: "Premium Shoppers",
      description: "High income and high spending — your most valuable customers. Focus on loyalty rewards.",
    },
    {
      name: "Impulsive Buyers",
      description: "Lower income but high spending tendency. Respond well to flash sales and promotions.",
    },
    {
      name: "Conservative Savers",
      description: "High income but low spending. Potential for upselling premium or exclusive products.",
    },
    {
      name: "Average Customers",
      description: "Balanced income and spending. A broad segment with diverse needs.",
    },
    {
      name: "Budget Shoppers",
      description: "Price-sensitive and infrequent buyers. Respond best to discounts and value bundles.",
    },
    {
      name: "High Engagement",
      description: "Frequent purchasers who stay active — great candidates for loyalty programs.",
    },
    {
      name: "Low Engagement",
      description: "Rarely purchase and low activity. Consider re-engagement campaigns.",
    },
    {
      name: "Bargain Hunters",
      description: "Seek the best deals. Highly responsive to coupons and limited-time offers.",
    },
    {
      name: "Luxury Seekers",
      description: "Prefer premium brands and products regardless of price.",
    },
    {
      name: "Price Sensitive",
      description: "Very sensitive to price changes — small discounts have outsized effect.",
    },
  ];

  // Build a mapping: original cluster index → display rank (0 = highest score)
  const rankMap: Record<number, number> = {};
  ranked.forEach(({ i }, rank) => { rankMap[i] = rank; });

  return Array.from({ length: k }, (_, id) => {
    const centroid = centroids[id];
    const rank = rankMap[id] ?? id;
    const meta = namePool[rank % namePool.length];

    // Customers in this cluster
    const clusterCustomers = data.filter((_, i) => labels[i] === id);
    const avg = (field: keyof CustomerData) =>
      clusterCustomers.length > 0
        ? clusterCustomers.reduce((s, c) => s + (c[field] as number), 0) / clusterCustomers.length
        : 0;

    return {
      id,
      name: meta.name,
      description: meta.description,
      color: CLUSTER_COLORS[id % CLUSTER_COLORS.length],
      count: clusterCustomers.length,
      avgIncome: Math.round(avg("AnnualIncome") * 10) / 10,
      avgSpending: Math.round(avg("SpendingScore") * 10) / 10,
      avgAge: Math.round(avg("Age") * 10) / 10,
    };
  });
}
