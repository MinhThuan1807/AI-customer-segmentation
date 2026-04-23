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
    CustomerID: int | str
    Age: float
    AnnualIncome: float
    SpendingScore: float
    PurchaseFrequency: float


class ClusterRequest(BaseModel):
    data: List[CustomerInput]
    k: int = 4


def _build_response(df: pd.DataFrame, k: int):
    customer_df, scaled = compute_rfm(df)
    k = min(k, len(customer_df))

    result_df, _ = run_kmeans(customer_df, scaled, k)
    inertias = find_optimal_k(scaled)

    labels = result_df['Cluster'].astype(int).tolist()
    centroids = (
        result_df
        .groupby('Cluster')[['Age', 'AnnualIncome', 'SpendingScore', 'PurchaseFrequency']]
        .mean()
        .sort_index()
        .round(4)
        .values
        .tolist()
    )
    elbow_data = [
        {'k': k_value, 'wcss': wcss}
        for k_value, wcss in zip(range(2, 2 + len(inertias)), inertias)
    ]
    pca_coords = result_df[['x', 'y']].round(4).values.tolist()

    return {
        'labels': labels,
        'centroids': centroids,
        'elbowData': elbow_data,
        'pcaCoords': pca_coords,
    }


@app.post("/api/cluster")
async def analyze(payload: ClusterRequest):
    try:
        if not payload.data:
            raise ValueError("Danh sách khách hàng rỗng.")

        df = pd.DataFrame([row.model_dump() for row in payload.data])
        return _build_response(df, payload.k)

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")