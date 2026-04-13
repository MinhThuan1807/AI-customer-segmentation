/**
 * exportCSV.ts
 * ------------
 * Exports customer data WITH cluster assignments as a downloadable CSV file.
 * Adds a "Cluster" column to the original data.
 */

import type { CustomerData } from "../types";

/**
 * Triggers a CSV file download in the browser.
 *
 * @param data   - Original customer data
 * @param labels - Cluster label for each customer (same order as data)
 * @param filename - Name of the downloaded file
 */
export function downloadCSV(
  data: CustomerData[],
  labels: number[],
  filename: string = "customer_segments.csv"
): void {
  // Build CSV header
  const headers = ["CustomerID", "Age", "AnnualIncome", "SpendingScore", "PurchaseFrequency", "Cluster"];

  // Build CSV rows
  const rows = data.map((customer, i) => [
    customer.CustomerID,
    customer.Age,
    customer.AnnualIncome,
    customer.SpendingScore,
    customer.PurchaseFrequency,
    labels[i] ?? "",
  ]);

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // clean up memory
}
