# AI Customer Segmentation

Ứng dụng phân cụm khách hàng sử dụng thuật toán K-Means, gồm backend FastAPI (Python) và frontend Next.js.

---

## Yêu cầu hệ thống

- Python **3.10+**
- Node.js **18+** và **pnpm**
- Git

---

## Cài đặt & Chạy

### 1. Clone dự án

```bash
git clone <repository-url>
cd AI-customer-segmentation
```

---

### 2. Backend (FastAPI)

```bash
cd be
```

Tạo và kích hoạt virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

Cài dependencies:

```bash
pip install fastapi uvicorn pandas scikit-learn openpyxl numpy pydantic
```

Chạy server:

```bash
uvicorn main:app --reload --port 8000
```

Backend sẽ chạy tại `http://localhost:8000`.

---

### 3. Frontend (Next.js)

Mở terminal mới:

```bash
cd fe
```

Cài dependencies:

```bash
pnpm install
```

Chạy dev server:

```bash
pnpm dev
```

Frontend sẽ chạy tại `http://localhost:3000`.

---

## Sử dụng

1. Mở trình duyệt tại `http://localhost:3000`
2. Upload file CSV khách hàng hoặc dùng dữ liệu mẫu có sẵn
3. Chọn số cụm K và nhấn **Phân cụm**
4. Xem kết quả trực quan trên biểu đồ và bảng dữ liệu

### Định dạng file CSV

File CSV cần có các cột sau (tên cột không phân biệt hoa thường):

| Cột                 | Mô tả                 |
| ------------------- | --------------------- |
| `CustomerID`        | Mã khách hàng         |
| `Age`               | Tuổi                  |
| `AnnualIncome`      | Thu nhập hàng năm     |
| `SpendingScore`     | Điểm chi tiêu (0–100) |
| `PurchaseFrequency` | Tần suất mua hàng     |

File mẫu có sẵn trong thư mục `be/`: `customers_300_clustered.csv`, `customers_500_clustered.csv`, `customers_1000_clustered.csv`.

---

## Cấu trúc dự án

```
AI-customer-segmentation/
├── be/                     # Backend Python
│   ├── main.py             # FastAPI app, API endpoints
│   ├── seed.py             # Script tạo dữ liệu mẫu
│   ├── ml/
│   │   ├── clustering.py   # K-Means & Elbow method
│   │   └── preprocess.py   # Tiền xử lý & chuẩn hóa dữ liệu
│   └── data/
│       └── online_retail.xlsx
├── fe/                     # Frontend Next.js
│   └── src/
│       ├── app/            # Pages & utilities
│       └── components/     # UI components
└── README.md
```

---

## API

| Method | Endpoint       | Mô tả                         |
| ------ | -------------- | ----------------------------- |
| `POST` | `/api/cluster` | Phân cụm danh sách khách hàng |

**Request body:**

```json
{
  "data": [
    {
      "CustomerID": 1,
      "Age": 25,
      "AnnualIncome": 50000,
      "SpendingScore": 70,
      "PurchaseFrequency": 10
    }
  ],
  "k": 4
}
```

**Response:**

```json
{
  "labels": [0, 1, 2, ...],
  "centroids": [[...], ...],
  "elbowData": [{"k": 2, "wcss": 123.4}, ...]
}
```
