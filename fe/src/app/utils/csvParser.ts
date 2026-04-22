
import type { CustomerData } from "../types";

const COLUMN_ALIASES: Record<string, keyof CustomerData> = {
  customerid: "CustomerID",
  id: "CustomerID",
  customer_id: "CustomerID",
  age: "Age",
  annualincome: "AnnualIncome",
  "annual income": "AnnualIncome",
  annual_income: "AnnualIncome",
  income: "AnnualIncome",
  spendingscore: "SpendingScore",
  "spending score": "SpendingScore",
  spending_score: "SpendingScore",
  score: "SpendingScore",
  purchasefrequency: "PurchaseFrequency",
  "purchase frequency": "PurchaseFrequency",
  purchase_frequency: "PurchaseFrequency",
  frequency: "PurchaseFrequency",
};

const REQUIRED_FIELDS: (keyof CustomerData)[] = [
  "Age",
  "AnnualIncome",
  "SpendingScore",
  "PurchaseFrequency",
];

export function parseCSV(text: string): CustomerData[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV file must have a header row and at least one data row.");
  }

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase());

  const fieldMap: Record<number, keyof CustomerData> = {};
  headers.forEach((header, index) => {
    const field = COLUMN_ALIASES[header];
    if (field) fieldMap[index] = field;
  });

  const presentFields = Object.values(fieldMap);
  const missing = REQUIRED_FIELDS.filter((f) => !presentFields.includes(f));
  if (missing.length > 0) {
    throw new Error(
      `Missing required columns: ${missing.join(", ")}.\n` +
        `Your CSV should include: CustomerID, Age, AnnualIncome (or "Annual Income"), ` +
        `SpendingScore (or "Spending Score"), PurchaseFrequency (or "Purchase Frequency").`
    );
  }

  const results: CustomerData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/"/g, ""));

    const row: Partial<CustomerData> = {
      CustomerID: i, 
    };

    Object.entries(fieldMap).forEach(([idxStr, field]) => {
      const idx = Number(idxStr);
      const raw = cols[idx] ?? "";
      if (field === "CustomerID") {
        row[field] = raw || i;
      } else {
        const num = parseFloat(raw);
        if (!isNaN(num)) (row as Record<string, unknown>)[field] = num;
      }
    });

    if (REQUIRED_FIELDS.every((f) => f === "CustomerID" || typeof (row as Record<string, unknown>)[f] === "number")) {
      results.push(row as CustomerData);
    }
  }

  if (results.length === 0) {
    throw new Error("No valid data rows found. Please check your CSV format.");
  }

  return results;
}
