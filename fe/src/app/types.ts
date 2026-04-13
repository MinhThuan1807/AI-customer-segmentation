/**
 * types.ts
 * --------
 * Central place for all TypeScript type definitions.
 * Keeping types in one file makes it easy to understand the data shapes.
 */

/** Represents a single customer record */
export interface CustomerData {
  CustomerID: string | number;
  Age: number;
  AnnualIncome: number;       // in k$ (thousands of dollars)
  SpendingScore: number;       // 1–100 scale
  PurchaseFrequency: number;   // purchases per year
}

/** The result returned by the K-Means clustering algorithm */
export interface ClusteringResult {
  labels: number[];            // cluster assignment for each customer (e.g. [0, 2, 1, 0, ...])
  centroids: number[][];       // centroid coordinates in [Age, Income, Spending, Frequency] space
  elbowData: ElbowPoint[];     // WCSS values for K = 2..10 (used in elbow chart)
}

/** One point on the Elbow Method chart */
export interface ElbowPoint {
  k: number;    // number of clusters
  wcss: number; // Within-Cluster Sum of Squares (lower = tighter clusters)
}

/** Rich metadata for displaying a cluster card */
export interface ClusterInfo {
  id: number;
  name: string;
  description: string;
  color: string;
  count: number;
  avgIncome: number;
  avgSpending: number;
  avgAge: number;
}
