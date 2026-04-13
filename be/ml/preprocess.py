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


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Chuẩn hóa tên cột theo format CSV khách hàng."""
    aliases = {
        'customerid': 'CustomerID',
        'customer_id': 'CustomerID',
        'age': 'Age',
        'annualincome': 'AnnualIncome',
        'annual_income': 'AnnualIncome',
        'annual income': 'AnnualIncome',
        'income': 'AnnualIncome',
        'spendingscore': 'SpendingScore',
        'spending_score': 'SpendingScore',
        'spending score': 'SpendingScore',
        'score': 'SpendingScore',
        'purchasefrequency': 'PurchaseFrequency',
        'purchase_frequency': 'PurchaseFrequency',
        'purchase frequency': 'PurchaseFrequency',
        'frequency': 'PurchaseFrequency',
    }

    normalized = []
    for col in df.columns:
        key = str(col).strip().lower()
        normalized.append(aliases.get(key, str(col).strip()))

    df = df.copy()
    df.columns = normalized
    return df


def compute_rfm(df: pd.DataFrame):
    df = _normalize_columns(df)

    required_cols = ['CustomerID', 'Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(
            "Thiếu cột bắt buộc trong CSV: " + ", ".join(missing_cols)
        )

    # CustomerID: chuẩn hóa thành số nguyên dạng chuỗi
    df['CustomerID'] = (
        df['CustomerID']
        .astype(str)
        .str.strip()
        .str.replace(r'\.0$', '', regex=True)
    )
    df = df[df['CustomerID'].str.match(r'^\d+$', na=False)]

    # Chuẩn hóa các cột số theo định dạng EU/US
    for col in ['Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']:
        df[col] = _to_numeric_eu(df[col])

    # Bỏ dòng lỗi dữ liệu
    df = df.dropna(subset=required_cols)
    df = df[
        (df['Age'] > 0)
        & (df['AnnualIncome'] > 0)
        & (df['SpendingScore'] >= 0)
        & (df['SpendingScore'] <= 100)
        & (df['PurchaseFrequency'] > 0)
    ]

    if df.empty:
        raise ValueError("Không có dữ liệu hợp lệ sau khi lọc. Kiểm tra file CSV.")

    # Trường hợp có trùng CustomerID, gộp theo trung bình
    customer_df = (
        df.groupby('CustomerID', as_index=False)
        .agg(
            Age=('Age', 'mean'),
            AnnualIncome=('AnnualIncome', 'mean'),
            SpendingScore=('SpendingScore', 'mean'),
            PurchaseFrequency=('PurchaseFrequency', 'mean'),
        )
    )

    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(
        customer_df[['Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']]
    )

    return customer_df, rfm_scaled


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