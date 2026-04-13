from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import numpy as np


def find_optimal_k(rfm_scaled, max_k=10):
    n_samples = len(rfm_scaled)
    if n_samples < 2:
        raise ValueError("Cần ít nhất 2 khách hàng để chạy K-Means.")

    # Không thể thử K lớn hơn số mẫu
    safe_max_k = min(max_k, n_samples)
    inertias = []
    for k in range(2, safe_max_k + 1):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(rfm_scaled)
        inertias.append(round(float(km.inertia_), 2))
    return inertias


def run_kmeans(rfm, rfm_scaled, k=4):
    n_samples = len(rfm_scaled)
    if n_samples < 2:
        raise ValueError("Cần ít nhất 2 khách hàng để chạy K-Means.")

    # Đảm bảo k không vượt số khách hàng
    k = max(2, min(k, n_samples))

    model = KMeans(n_clusters=k, random_state=42, n_init=10)
    rfm = rfm.copy()
    rfm['Cluster'] = model.fit_predict(rfm_scaled)

    # PCA giảm xuống 2D để vẽ scatter plot
    n_components = min(2, rfm_scaled.shape[1], len(rfm_scaled))
    pca = PCA(n_components=n_components)
    coords = pca.fit_transform(rfm_scaled)

    rfm['x'] = coords[:, 0]
    rfm['y'] = coords[:, 1] if n_components > 1 else 0.0

    return rfm, model.cluster_centers_