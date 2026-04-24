from typing import List  

import pandas as pd 
from fastapi import FastAPI, HTTPException  
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel  

from ml.preprocess import compute_rfm        
from ml.clustering import find_optimal_k, run_kmeans  

app = FastAPI()  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_methods=["*"],                      
    allow_headers=["*"],                   
)


class CustomerInput(BaseModel):
    """Schema cho 1 khách hàng — FastAPI tự động validate kiểu dữ liệu"""
    CustomerID: int | str      
    Age: float                 
    AnnualIncome: float        
    SpendingScore: float        
    PurchaseFrequency: float   


class ClusterRequest(BaseModel):
    """Schema cho toàn bộ request gửi lên API"""
    data: List[CustomerInput]   # Danh sách khách hàng
    k: int = 4                  # Số cụm muốn chia, mặc định là 4 nếu không truyền


def _build_response(df: pd.DataFrame, k: int):
    """
    Nhận DataFrame thô và số cụm k,
    trả về dict chứa kết quả clustering để gửi về frontend.
    """

    # Bước 1: Tiền xử lý — làm sạch dữ liệu và chuẩn hóa (StandardScaler)
    customer_df, scaled = compute_rfm(df)

    # Bước 2: Đảm bảo k không vượt quá số khách hàng thực tế
    # (vd: chỉ có 2 khách hàng thì không thể chia 4 cụm)
    k = min(k, len(customer_df))

    # Bước 3: Chạy K-Means với k cụm trên dữ liệu đã chuẩn hóa
    result_df, _ = run_kmeans(customer_df, scaled, k)

    # Bước 4: Tính inertia cho K từ 2→10 để vẽ Elbow Chart
    inertias = find_optimal_k(scaled)

    # Bước 5: Lấy nhãn cụm của từng khách hàng dưới dạng list số nguyên
    # vd: [0, 2, 1, 0, 3, ...]
    labels = result_df['Cluster'].astype(int).tolist()

    # Bước 6: Tính tâm cụm (centroid) — trung bình các chiều theo từng cụm
    # groupby('Cluster') → nhóm theo cụm
    # .mean() → tính trung bình Age, Income, SpendingScore, Frequency
    # .sort_index() → sắp xếp theo thứ tự cụm 0, 1, 2...
    # .round(4) → làm tròn 4 chữ số thập phân
    # .values.tolist() → chuyển thành list Python
    centroids = (
        result_df
        .groupby('Cluster')[['Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']]
        .mean()
        .sort_index()
        .round(4)
        .values
        .tolist()
    )

    # Bước 7: Tạo dữ liệu Elbow Chart dạng [{'k': 2, 'wcss': 123.4}, ...]
    # zip ghép range(2,3,4...) với list inertia tương ứng
    elbow_data = [
        {'k': k_value, 'wcss': wcss}
        for k_value, wcss in zip(range(2, 2 + len(inertias)), inertias)
    ]

    # Bước 8: Lấy tọa độ 2D (sau PCA) để vẽ Scatter Plot
    # Mỗi khách hàng có 1 điểm (x, y) trên biểu đồ
    pca_coords = result_df[['x', 'y']].round(4).values.tolist()

    # Trả về dict — FastAPI tự chuyển thành JSON response
    return {
        'labels': labels,       # Nhãn cụm từng khách hàng
        'centroids': centroids, # Tâm của từng cụm
        'elbowData': elbow_data,# Dữ liệu vẽ Elbow Chart
        'pcaCoords': pca_coords,# Tọa độ 2D để vẽ Scatter Plot
    }


@app.post("/api/cluster") 
async def analyze(payload: ClusterRequest):
    """
    Endpoint chính: nhận dữ liệu khách hàng + số cụm k,
    trả về kết quả phân cụm.
    """
    try:
        # Kiểm tra danh sách không rỗng
        if not payload.data:
            raise ValueError("Danh sách khách hàng rỗng.")

        # Chuyển list Pydantic objects → DataFrame để xử lý với pandas
        # model_dump() chuyển object thành dict Python
        df = pd.DataFrame([row.model_dump() for row in payload.data])

        # Gọi hàm xử lý chính và trả kết quả
        return _build_response(df, payload.k)

    except ValueError as e:
        # Lỗi do dữ liệu không hợp lệ → trả HTTP 422 Unprocessable Entity
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        # Lỗi không mong đợi → trả HTTP 500 Internal Server Error
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")