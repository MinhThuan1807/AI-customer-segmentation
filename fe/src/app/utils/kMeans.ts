/**
 * kMeans.ts
 * ----------
 * Implements the K-Means clustering algorithm in pure TypeScript.
 *
 * Algorithm overview:
 *  1. Pick K initial centroids using K-Means++ (smarter than random)
 *  2. Assign each point to its nearest centroid → this is the "label"
 *  3. Recalculate centroids as the mean of all assigned points
 *  4. Repeat steps 2-3 until assignments stop changing (convergence)
 *
 * We also compute the Elbow Method data by running K-Means for K = 2..10
 * and recording the WCSS (Within-Cluster Sum of Squares) for each K.
 */

import type { CustomerData, ClusteringResult, ElbowPoint } from "../types";

// ─────────────────────────────────────────────
// Math helpers
// ─────────────────────────────────────────────

/** Euclidean distance between two n-dimensional points */
function euclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

/** Normalize an array of feature vectors to [0, 1] range per dimension */
function normalizeData(data: number[][]): { normalized: number[][]; mins: number[]; ranges: number[] } {
  const dims = data[0].length;
  const mins = Array.from({ length: dims }, (_, j) => Math.min(...data.map((p) => p[j])));
  const maxs = Array.from({ length: dims }, (_, j) => Math.max(...data.map((p) => p[j])));
  const ranges = maxs.map((max, j) => max - mins[j] || 1); // avoid division by zero
  const normalized = data.map((p) => p.map((v, j) => (v - mins[j]) / ranges[j]));
  return { normalized, mins, ranges };
}

/** Denormalize centroids back to original feature space */
function denormalizeCentroids(centroids: number[][], mins: number[], ranges: number[]): number[][] {
  return centroids.map((c) => c.map((v, j) => v * ranges[j] + mins[j]));
}

// ─────────────────────────────────────────────
// K-Means++ initialization
// ─────────────────────────────────────────────

/**
 * K-Means++ picks the first centroid randomly, then picks each
 * subsequent centroid with probability proportional to its squared
 * distance from the nearest existing centroid. This leads to much
 * better initial centroids than pure random selection.
 */
function initCentroidsKMeansPlusPlus(data: number[][], k: number, rand: () => number): number[][] {
  const centroids: number[][] = [];

  // Step 1: Pick the first centroid randomly
  centroids.push([...data[Math.floor(rand() * data.length)]]);

  // Step 2: Pick remaining centroids
  for (let i = 1; i < k; i++) {
    // For each point, find distance to nearest existing centroid
    const distances = data.map((point) =>
      Math.min(...centroids.map((c) => euclidean(point, c))) ** 2
    );

    // Pick next centroid with probability proportional to distance²
    const total = distances.reduce((a, b) => a + b, 0);
    let rand_val = rand() * total;
    let idx = 0;
    for (; idx < distances.length - 1; idx++) {
      rand_val -= distances[idx];
      if (rand_val <= 0) break;
    }
    centroids.push([...data[idx]]);
  }

  return centroids;
}

// ─────────────────────────────────────────────
// Core K-Means algorithm
// ─────────────────────────────────────────────

/**
 * Runs K-Means on normalized data.
 * Returns labels (cluster assignments) and centroids.
 */
function runKMeansOnNormalized(
  normalized: number[][],
  k: number,
  maxIterations: number = 100
): { labels: number[]; centroids: number[][]; wcss: number } {
  // Simple deterministic random for reproducibility
  let seed = 123;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  let centroids = initCentroidsKMeansPlusPlus(normalized, k, rand);
  let labels = new Array(normalized.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    // ── Assignment step: assign each point to nearest centroid ──
    const newLabels = normalized.map((point) => {
      let minDist = Infinity;
      let bestLabel = 0;
      centroids.forEach((centroid, j) => {
        const dist = euclidean(point, centroid);
        if (dist < minDist) {
          minDist = dist;
          bestLabel = j;
        }
      });
      return bestLabel;
    });

    // ── Convergence check ──
    const converged = newLabels.every((lbl, i) => lbl === labels[i]);
    labels = newLabels;
    if (converged) break;

    // ── Update step: move each centroid to the mean of its cluster ──
    centroids = Array.from({ length: k }, (_, j) => {
      const clusterPoints = normalized.filter((_, i) => labels[i] === j);
      if (clusterPoints.length === 0) return centroids[j]; // keep centroid if cluster is empty
      const dims = normalized[0].length;
      return Array.from({ length: dims }, (_, dim) =>
        clusterPoints.reduce((sum, p) => sum + p[dim], 0) / clusterPoints.length
      );
    });
  }

  // ── Calculate WCSS (Within-Cluster Sum of Squares) ──
  const wcss = normalized.reduce((sum, point, i) => {
    return sum + euclidean(point, centroids[labels[i]]) ** 2;
  }, 0);

  return { labels, centroids, wcss };
}

// ─────────────────────────────────────────────
// Convert CustomerData → feature vectors
// ─────────────────────────────────────────────

/**
 * Extracts numeric features from customer data.
 * We use: [Age, AnnualIncome, SpendingScore, PurchaseFrequency]
 */
function toFeatureVectors(data: CustomerData[]): number[][] {
  return data.map((d) => [d.Age, d.AnnualIncome, d.SpendingScore, d.PurchaseFrequency]);
}

// ─────────────────────────────────────────────
// Main exported function
// ─────────────────────────────────────────────

/**
 * Main function: runs K-Means clustering on customer data.
 * Also computes elbow method data for K = 2..10.
 *
 * @param data - Array of customer records
 * @param k    - Number of clusters to form
 * @returns    - Labels, centroids, and elbow chart data
 */
export function runKMeans(data: CustomerData[], k: number): ClusteringResult {
  const features = toFeatureVectors(data);
  const { normalized, mins, ranges } = normalizeData(features);

  // Run clustering for chosen K
  const { labels, centroids: normCentroids } = runKMeansOnNormalized(normalized, k);
  const centroids = denormalizeCentroids(normCentroids, mins, ranges);

  // Compute elbow data: run K-Means for K = 2..10
  const elbowData: ElbowPoint[] = [];
  for (let ki = 2; ki <= 10; ki++) {
    const { wcss } = runKMeansOnNormalized(normalized, ki, 50);
    elbowData.push({ k: ki, wcss: Math.round(wcss * 100) / 100 });
  }

  return { labels, centroids, elbowData };
}
