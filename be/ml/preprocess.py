import pandas as pd
from sklearn.preprocessing import StandardScaler
import io


def _to_numeric_eu(series: pd.Series) -> pd.Series:
    """Chuyển cột số dạng EU (dấu , thập phân) hoặc thường sang float."""
    return (
        series.astype(str)
        .str.strip()
        .str.replace(',', '.', regex=False)
        .pipe(pd.to_numeric, errors='coerce')
    )


def compute_rfm(df: pd.DataFrame):
    # Chuẩn hóa tên cột
    df.columns = df.columns.str.strip()

    # Ép kiểu numeric TRƯỚC mọi phép so sánh
    df['Quantity']  = _to_numeric_eu(df['Quantity'])
    df['UnitPrice'] = _to_numeric_eu(df['UnitPrice'])

    # Parse ngày
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], dayfirst=True, errors='coerce')

    # CustomerID: bỏ NaN, chuẩn hóa thành string sạch
    df['CustomerID'] = df['CustomerID'].astype(str).str.strip().str.split('.').str[0]
    df = df[df['CustomerID'].str.match(r'^\d+$')]  # chỉ giữ ID là số

    # Bỏ các dòng thiếu dữ liệu quan trọng
    df = df.dropna(subset=['CustomerID', 'InvoiceDate', 'UnitPrice', 'Quantity'])

    # Chỉ giữ đơn hàng hợp lệ — so sánh an toàn vì đã là float
    df = df[df['Quantity'] > 0]
    df = df[df['UnitPrice'] > 0]

    if df.empty:
        raise ValueError("Không có dữ liệu hợp lệ sau khi lọc. Kiểm tra file CSV.")

    df['TotalPrice'] = df['Quantity'] * df['UnitPrice']

    snapshot_date = df['InvoiceDate'].max()

    rfm = df.groupby('CustomerID').agg(
        Recency=('InvoiceDate', lambda x: (snapshot_date - x.max()).days),
        Frequency=('InvoiceNo', 'nunique'),
        Monetary=('TotalPrice', 'sum'),
    ).reset_index()

    # Bỏ outlier cực đoan (top 1%)
    for col in ['Recency', 'Frequency', 'Monetary']:
        upper = rfm[col].quantile(0.99)
        rfm = rfm[rfm[col] <= upper]

    rfm = rfm[rfm['Monetary'] > 0]

    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm[['Recency', 'Frequency', 'Monetary']])

    return rfm, rfm_scaled


def read_csv_auto(content: bytes) -> pd.DataFrame:
    """Tự động detect separator: semicolon hoặc comma."""
    # Thử decode với nhiều encoding phổ biến
    for enc in ['utf-8', 'unicode_escape', 'latin-1', 'cp1252']:
        try:
            text = content.decode(enc)
            break
        except Exception:
            continue
    else:
        raise ValueError("Không đọc được encoding của file CSV.")

    # Detect separator
    first_line = text.split('\n')[0]
    sep = ';' if first_line.count(';') > first_line.count(',') else ','

    df = pd.read_csv(io.StringIO(text), sep=sep, low_memory=False)
    return df