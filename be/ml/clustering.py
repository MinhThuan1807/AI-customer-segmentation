from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import numpy as np


def find_optimal_k(rfm_scaled, max_k=10):
    """
    Tìm số cụm K tối ưu bằng phương pháp Elbow (khuỷu tay).
    
    Ý tưởng: chạy K-Means với K từ 2 đến max_k, mỗi lần ghi lại giá trị
    inertia (tổng bình phương khoảng cách từ mỗi điểm đến tâm cụm của nó).
    K tối ưu thường là điểm mà inertia bắt đầu giảm chậm lại (hình khuỷu tay).
    
    Tham số:
      - rfm_scaled: mảng numpy đã được chuẩn hóa từ bước tiền xử lý
      - max_k: số cụm tối đa cần thử (mặc định 10)
    
    Trả về: danh sách inertia tương ứng với K = 2, 3, ..., safe_max_k
    """
    n_samples = len(rfm_scaled)
    if n_samples < 2:
        raise ValueError("Cần ít nhất 2 khách hàng để chạy K-Means.")

    # Giới hạn max_k không vượt quá số mẫu thực tế
    # (K-Means không thể tạo nhiều cụm hơn số điểm dữ liệu)
    safe_max_k = min(max_k, n_samples)

    inertias = []
    for k in range(2, safe_max_k + 1):
        # n_init=10: chạy K-Means 10 lần với centroid khởi tạo ngẫu nhiên khác nhau,
        # lấy kết quả tốt nhất để tránh hội tụ vào cực tiểu cục bộ
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(rfm_scaled)
        # Làm tròn 2 chữ số thập phân để dễ đọc khi trả về API
        inertias.append(round(float(km.inertia_), 2))

    return inertias


def run_kmeans(rfm, rfm_scaled, k=4):
    """
    Chạy thuật toán K-Means để phân cụm khách hàng, sau đó dùng PCA
    để chiếu dữ liệu xuống 2 chiều phục vụ việc vẽ scatter plot.
    
    Tham số:
      - rfm: DataFrame gốc đã làm sạch (chứa CustomerID, Age, AnnualIncome, ...)
      - rfm_scaled: mảng numpy đã chuẩn hóa tương ứng với rfm
      - k: số cụm mong muốn (mặc định 4)
    
    Trả về:
      - rfm: DataFrame với 3 cột bổ sung:
          + 'Cluster': nhãn cụm (0, 1, 2, ...)
          + 'x': tọa độ trục X sau khi chiếu PCA
          + 'y': tọa độ trục Y sau khi chiếu PCA
      - cluster_centers_: tọa độ tâm các cụm trong không gian đã chuẩn hóa
    """
    n_samples = len(rfm_scaled)
    if n_samples < 2:
        raise ValueError("Cần ít nhất 2 khách hàng để chạy K-Means.")

    # Đảm bảo k hợp lệ: tối thiểu 2, tối đa bằng số khách hàng
    k = max(2, min(k, n_samples))

    # Chạy K-Means với k cụm
    # random_state=42: cố định seed để kết quả tái lập được
    # n_init=10: thử 10 lần khởi tạo, lấy kết quả inertia thấp nhất
    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    rfm = rfm.copy()
    rfm['Cluster'] = model.fit_predict(rfm_scaled)  # Gán nhãn cụm cho từng khách hàng

    # --- Giảm chiều bằng PCA để vẽ scatter plot 2D ---
    # Dữ liệu gốc có 4 chiều (Age, AnnualIncome, SpendingScore, PurchaseFrequency),
    # không thể vẽ trực tiếp lên màn hình. PCA chiếu xuống 2 chiều giữ lại
    # nhiều nhất phương sai (thông tin) có thể.
    #
    # n_components được giới hạn bởi:
    #   - 2: số chiều mục tiêu (2D)
    #   - rfm_scaled.shape[1]: số features thực tế (phòng trường hợp < 2)
    #   - len(rfm_scaled): số mẫu (PCA không thể tạo nhiều component hơn số mẫu)
    n_components = min(2, rfm_scaled.shape[1], len(rfm_scaled))
    pca = PCA(n_components=n_components)
    coords = pca.fit_transform(rfm_scaled)

    rfm['x'] = coords[:, 0]  # Thành phần chính thứ nhất (PC1)
    # Nếu chỉ có 1 component (dữ liệu quá ít), gán y = 0 để tránh lỗi index
    rfm['y'] = coords[:, 1] if n_components > 1 else 0.0

    return rfm, model.cluster_centers_
