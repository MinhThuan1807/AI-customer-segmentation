/**
 * DataTable.tsx
 * -------------
 * Displays customer data in a scrollable table.
 *
 * Used in TWO modes:
 *  1. Preview mode (no labels): shows raw uploaded data
 *  2. Results mode (with labels): shows data with cluster column + filter dropdown
 */

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Filter, Users } from "lucide-react";
import { CLUSTER_COLORS } from "@/app/utils/clusterName";
import type { CustomerData } from "@/app/types";

interface DataTableProps {
  data: CustomerData[];
  labels?: number[];          // optional: cluster assignments (results mode only)
  filterCluster?: number | "all";
  setFilterCluster?: (v: number | "all") => void;
  maxRows?: number;            // limit displayed rows (default 20 in preview)
}

export function DataTable({
  data,
  labels,
  filterCluster = "all",
  setFilterCluster,
  maxRows = 20,
}: DataTableProps) {
  const isResultsMode = labels !== undefined && labels.length > 0;

  // Figure out how many unique clusters there are
  const uniqueClusters = useMemo(() => {
    if (!labels) return [];
    return [...new Set(labels)].sort((a, b) => a - b);
  }, [labels]);

  // Apply cluster filter
  const filteredData = useMemo(() => {
    if (!isResultsMode || filterCluster === "all") {
      return data.slice(0, isResultsMode ? undefined : maxRows);
    }
    return data.filter((_, i) => labels![i] === filterCluster);
  }, [data, labels, filterCluster, isResultsMode, maxRows]);

  // Show limited rows in preview mode, all rows in results mode
  const displayData = isResultsMode ? filteredData : filteredData.slice(0, maxRows);

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                {isResultsMode ? "Clustered Customer Data" : "Data Preview"}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {isResultsMode
                  ? `Showing ${displayData.length} of ${data.length} customers`
                  : `First ${Math.min(data.length, maxRows)} of ${data.length} rows`}
              </p>
            </div>
          </div>

          {/* Filter dropdown — only shown in results mode */}
          {isResultsMode && setFilterCluster && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={String(filterCluster)}
                onValueChange={(v) =>
                  setFilterCluster(v === "all" ? "all" : parseInt(v))
                }
              >
                <SelectTrigger className="w-40 rounded-xl border-gray-200 text-sm">
                  <SelectValue placeholder="Filter cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clusters</SelectItem>
                  {uniqueClusters.map((c) => (
                    <SelectItem key={c} value={String(c)}>
                      Cluster {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Scrollable table wrapper */}
        <div className="overflow-auto max-h-80 rounded-b-2xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-24 text-gray-600">Customer ID</TableHead>
                <TableHead className="text-gray-600">Age</TableHead>
                <TableHead className="text-gray-600">Annual Income (k$)</TableHead>
                <TableHead className="text-gray-600">Spending Score</TableHead>
                <TableHead className="text-gray-600">Purchase Freq.</TableHead>
                {isResultsMode && (
                  <TableHead className="text-gray-600">Cluster</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((customer, idx) => {
                // Find the original index to get the label
                const originalIndex = isResultsMode
                  ? data.indexOf(customer)
                  : idx;
                const clusterLabel = isResultsMode ? labels![originalIndex] : undefined;
                const clusterColor = clusterLabel !== undefined
                  ? CLUSTER_COLORS[clusterLabel % CLUSTER_COLORS.length]
                  : undefined;

                return (
                  <TableRow
                    key={`${customer.CustomerID}-${idx}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-gray-500 text-sm">{customer.CustomerID}</TableCell>
                    <TableCell>{customer.Age}</TableCell>
                    <TableCell>${customer.AnnualIncome}k</TableCell>
                    <TableCell>
                      {/* Visual spending score bar */}
                      <div className="flex items-center gap-2">
                        <span>{customer.SpendingScore}</span>
                        <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-400 transition-all"
                            style={{ width: `${customer.SpendingScore}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.PurchaseFrequency}x/yr</TableCell>
                    {isResultsMode && (
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: clusterColor + "20",
                            color: clusterColor,
                            borderColor: clusterColor + "40",
                          }}
                          variant="outline"
                          className="rounded-full border text-xs px-3 py-0.5"
                        >
                          Cluster {clusterLabel}
                        </Badge>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
