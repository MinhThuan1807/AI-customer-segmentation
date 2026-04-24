import pandas as pd
from sklearn.preprocessing import StandardScaler
import io


def _to_numeric_eu(series: pd.Series) -> pd.Series:
    """
    Chuyển đổi một cột dữ liệu dạng chuỗi sang kiểu số thực (float).
    Hỗ trợ cả định dạng số châu Âu (dùng dấu phẩy ',' làm dấu thập phân)
    lẫn định dạng thông thường (dùng dấu chấm '.').
    Ví dụ: '1.234,56' hoặc '1234.56' đều được xử lý đúng.
    Các giá trị không hợp lệ sẽ được chuyển thành NaN (errors='coerce').
    """
    return (
        series.astype(str)
        .str.strip()                            # Xóa khoảng trắng đầu/cuối
        .str.replace(',', '.', regex=False)     # Thay dấu phẩy thập phân thành dấu chấm
        .pipe(pd.to_numeric, errors='coerce')   # Chuyển sang số, lỗi thì thành NaN
    )


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Chuẩn hóa tên cột của DataFrame về đúng tên chuẩn mà hệ thống yêu cầu.
    Mục đích: người dùng có thể upload CSV với tên cột khác nhau
    (ví dụ: 'customer_id', 'CustomerID', 'annual income'...) nhưng hệ thống
    vẫn nhận diện và xử lý được nhờ bảng ánh xạ (aliases) bên dưới.
    Tên cột được so sánh theo dạng chữ thường để tránh lỗi hoa/thường.
    """
    # Bảng ánh xạ: tên cột viết thường -> tên chuẩn của hệ thống
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
        key = str(col).strip().lower()  # Chuyển tên cột về chữ thường để tra bảng
        normalized.append(aliases.get(key, str(col).strip()))  # Nếu không có trong bảng thì giữ nguyên

    df = df.copy()
    df.columns = normalized
    return df


def compute_rfm(df: pd.DataFrame):
    """
    Hàm chính để tiền xử lý dữ liệu khách hàng trước khi đưa vào thuật toán clustering.
    Các bước thực hiện:
      1. Chuẩn hóa tên cột
      2. Kiểm tra các cột bắt buộc
      3. Làm sạch và validate dữ liệu
      4. Gộp các khách hàng trùng CustomerID
      5. Chuẩn hóa (scale) dữ liệu bằng StandardScaler
    Trả về: (customer_df, rfm_scaled)
      - customer_df: DataFrame đã làm sạch, mỗi hàng là một khách hàng
      - rfm_scaled: mảng numpy đã được chuẩn hóa, dùng để đưa vào K-Means
    """
    # Bước 1: Chuẩn hóa tên cột về tên chuẩn
    df = _normalize_columns(df)

    # Bước 2: Kiểm tra xem có đủ các cột bắt buộc không
    required_cols = ['CustomerID', 'Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(
            "Thiếu cột bắt buộc trong CSV: " + ", ".join(missing_cols)
        )

    # Bước 3a: Chuẩn hóa CustomerID thành chuỗi số nguyên (bỏ phần '.0' nếu có)
    # Ví dụ: '12345.0' -> '12345'
    df['CustomerID'] = (
        df['CustomerID']
        .astype(str)
        .str.strip()
        .str.replace(r'\.0$', '', regex=True)
    )
    # Chỉ giữ lại các hàng có CustomerID là số nguyên hợp lệ
    df = df[df['CustomerID'].str.match(r'^\d+$', na=False)]

    # Bước 3b: Chuyển các cột số sang kiểu float, hỗ trợ định dạng EU
    for col in ['Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']:
        df[col] = _to_numeric_eu(df[col])

    # Bước 3c: Xóa các hàng có giá trị NaN ở bất kỳ cột bắt buộc nào
    df = df.dropna(subset=required_cols)

    # Bước 3d: Lọc các hàng có giá trị nằm trong khoảng hợp lệ về mặt nghiệp vụ
    df = df[
        (df['Age'] > 0)                         # Tuổi phải dương
        & (df['AnnualIncome'] > 0)              # Thu nhập phải dương
        & (df['SpendingScore'] >= 0)            # Điểm chi tiêu từ 0 đến 100
        & (df['SpendingScore'] <= 100)
        & (df['PurchaseFrequency'] > 0)         # Tần suất mua hàng phải dương
    ]

    # Nếu sau khi lọc không còn dữ liệu nào thì báo lỗi
    if df.empty:
        raise ValueError("Không có dữ liệu hợp lệ sau khi lọc. Kiểm tra file CSV.")

    # Bước 4: Gộp các hàng có cùng CustomerID bằng cách lấy giá trị trung bình
    # Trường hợp này xảy ra khi một khách hàng có nhiều giao dịch trong file
    customer_df = (
        df.groupby('CustomerID', as_index=False)
        .agg(
            Age=('Age', 'mean'),
            AnnualIncome=('AnnualIncome', 'mean'),
            SpendingScore=('SpendingScore', 'mean'),
            PurchaseFrequency=('PurchaseFrequency', 'mean'),
        )
    )

    # Bước 5: Chuẩn hóa dữ liệu về phân phối chuẩn (mean=0, std=1)
    # StandardScaler giúp K-Means không bị ảnh hưởng bởi sự chênh lệch đơn vị
    # (ví dụ: AnnualIncome có giá trị hàng nghìn, còn Age chỉ vài chục)
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(
        customer_df[['Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']]
    )

    return customer_df, rfm_scaled


def read_csv_auto(content: bytes) -> pd.DataFrame:
    """
    Đọc file CSV từ dữ liệu bytes, tự động xử lý encoding và ký tự phân cách.

    - Encoding: thử lần lượt utf-8, unicode_escape, latin-1, cp1252
      (các encoding phổ biến khi export CSV từ Excel hoặc các hệ thống khác nhau)
    - Separator: tự động phát hiện dựa trên dòng đầu tiên của file:
        + Nếu có nhiều dấu ';' hơn ',' -> dùng ';' (phổ biến ở CSV châu Âu)
        + Ngược lại -> dùng ',' (CSV chuẩn quốc tế)
    """
    # Thử decode bytes sang chuỗi với nhiều encoding khác nhau
    for enc in ['utf-8', 'unicode_escape', 'latin-1', 'cp1252']:
        try:
            text = content.decode(enc)
            break
        except Exception:
            continue
    else:
        # Nếu tất cả encoding đều thất bại thì báo lỗi
        raise ValueError("Không đọc được encoding của file CSV.")

    # Phát hiện ký tự phân cách dựa trên tần suất xuất hiện trong dòng tiêu đề
    first_line = text.split('\n')[0]
    sep = ';' if first_line.count(';') > first_line.count(',') else ','

    # Đọc CSV với separator đã phát hiện, low_memory=False để tránh cảnh báo kiểu dữ liệu
    df = pd.read_csv(io.StringIO(text), sep=sep, low_memory=False)
    return df
