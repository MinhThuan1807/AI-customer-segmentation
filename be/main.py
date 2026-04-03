from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml.preprocess import compute_rfm, read_csv_auto
from ml.clustering import find_optimal_k, run_kmeans

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...), k: int = 4):
    try:
        content = await file.read()

        # Tự động detect separator & encoding
        df = read_csv_auto(content)

        rfm, rfm_scaled = compute_rfm(df)

        # Đảm bảo k không vượt quá số khách hàng
        k = min(k, len(rfm))

        rfm_result, centers = run_kmeans(rfm, rfm_scaled, k)
        elbow = find_optimal_k(rfm_scaled)

        return {
            "clusters": rfm_result.to_dict(orient="records"),
            "elbow": elbow,
            "k": k,
            "total_customers": len(rfm_result),
        }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý: {str(e)}")