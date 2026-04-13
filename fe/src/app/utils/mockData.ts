/**
 * mockData.ts
 * -----------
 * Generates realistic synthetic customer data with 5 natural clusters.
 * This is used as demo data so users can explore the dashboard without uploading a file.
 *
 * The 5 natural clusters are:
 *  1. Young low-income but high spenders (impulsive buyers)
 *  2. High-income high-spending premium customers
 *  3. High-income but frugal customers
 *  4. Low-income low-spending budget shoppers
 *  5. Middle-of-the-road average customers
 */

import type { CustomerData } from "../types";

/** Simple seeded random number generator for reproducible data */
function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return ((s >>> 0) / 0xffffffff);
  };
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

/**
 * Generates a normally-distributed random number using the Box-Muller transform.
 * mu = mean, sigma = standard deviation
 */
function normalRandom(rand: () => number, mu: number, sigma: number): number {
  const u1 = rand();
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

/**
 * Main function: generates `n` customer records with natural clustering.
 */
export function generateMockData(n: number = 200): CustomerData[] {
  const rand = seededRandom(42); // fixed seed for reproducibility

  // Define the 5 cluster prototypes
  // Each cluster: { age, income, spending, frequency } with mean and spread
  const clusterProfiles = [
    // Cluster A: Young, low income, HIGH spending (impulsive buyers)
    { age: [24, 4], income: [22, 5], spending: [78, 8], freq: [35, 8], weight: 0.20 },
    // Cluster B: Middle-aged, HIGH income, HIGH spending (premium customers)
    { age: [38, 7], income: [88, 10], spending: [82, 7], freq: [28, 6], weight: 0.20 },
    // Cluster C: Older, HIGH income, LOW spending (conservative savers)
    { age: [46, 8], income: [85, 10], spending: [18, 7], freq: [10, 4], weight: 0.20 },
    // Cluster D: Young-ish, LOW income, LOW spending (budget shoppers)
    { age: [30, 6], income: [20, 5], spending: [15, 6], freq: [8, 3],  weight: 0.20 },
    // Cluster E: Middle range on all metrics (average customers)
    { age: [35, 8], income: [55, 12], spending: [50, 10], freq: [22, 7], weight: 0.20 },
  ];

  const data: CustomerData[] = [];
  let id = 1001;

  for (const profile of clusterProfiles) {
    const count = Math.round(n * profile.weight);
    for (let i = 0; i < count; i++) {
      data.push({
        CustomerID: id++,
        Age: clamp(normalRandom(rand, profile.age[0], profile.age[1]), 18, 70),
        AnnualIncome: clamp(normalRandom(rand, profile.income[0], profile.income[1]), 10, 130),
        SpendingScore: clamp(normalRandom(rand, profile.spending[0], profile.spending[1]), 1, 100),
        PurchaseFrequency: clamp(normalRandom(rand, profile.freq[0], profile.freq[1]), 1, 60),
      });
    }
  }

  // Shuffle to mix clusters
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }

  return data;
}
