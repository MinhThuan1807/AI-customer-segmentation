'use client'
import { useState } from 'react'
import UploadForm from '@/components/UploadForm'
import ClusterChart from '@/components/ClusterChart'
import SegmentTable from '@/components/SegmentTable'
import StatsBar from '@/components/StatsBar'

interface AnalysisResult {
  clusters: Array<{
    CustomerID: number
    Cluster: number
    Recency: number
    Frequency: number
    Monetary: number
    x: number
    y: number
  }>
  elbow: number[]
  k: number
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (file: File, k: number) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch(`http://localhost:8000/api/analyze?k=${k}`, {
        method: 'POST',
        body: form,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail ?? 'Lỗi từ server')
      }

      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message ?? 'Không kết nối được backend. Hãy chắc chắn FastAPI đang chạy ở port 8000.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">▣</span>
            <span className="logo-text">SegmentAI</span>
          </div>
          <div className="header-meta">
            <span className="badge">K-Means Clustering</span>
            <span className="badge">Unsupervised ML</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Hero */}
        <div className="hero">
          <h1 className="hero-title">
            Phân cụm khách hàng
            <span className="hero-accent"> thương mại điện tử</span>
          </h1>
          <p className="hero-sub">
            Upload file CSV → Tính RFM → Chạy K-Means → Khám phá các nhóm khách hàng
          </p>
        </div>

        {/* Upload */}
        <UploadForm onAnalyze={handleAnalyze} loading={loading} />

        {/* Error */}
        {error && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="results-section">
            {/* Divider */}
            <div className="divider">
              <span className="divider-text">Kết quả phân tích</span>
            </div>

            {/* Stats */}
            <StatsBar clusters={result.clusters} k={result.k} />

            {/* Charts */}
            <ClusterChart
              clusters={result.clusters}
              elbow={result.elbow}
              k={result.k}
            />

            {/* Table */}
            <SegmentTable clusters={result.clusters} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <span>Customer Segmentation · AI Assignment · K-Means Clustering</span>
      </footer>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          background: #060d1a;
          color: #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* Subtle grid background */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(45,212,191,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45,212,191,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          border-bottom: 1px solid #0f1f35;
          padding: 0 24px;
        }

        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-mark {
          font-size: 18px;
          color: #2dd4bf;
        }

        .logo-text {
          font-family: 'DM Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: -0.02em;
        }

        .header-meta {
          display: flex;
          gap: 8px;
        }

        .badge {
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          color: #2dd4bf;
          background: rgba(45,212,191,0.08);
          border: 1px solid rgba(45,212,191,0.2);
          border-radius: 4px;
          padding: 3px 8px;
        }

        .main {
          flex: 1;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 48px 24px 80px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .hero {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hero-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 600;
          color: #f1f5f9;
          letter-spacing: -0.03em;
          line-height: 1.15;
        }

        .hero-accent {
          color: #2dd4bf;
        }

        .hero-sub {
          color: #475569;
          font-size: 14px;
          font-family: 'DM Mono', monospace;
        }

        .error-box {
          background: rgba(248, 113, 113, 0.07);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 10px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fca5a5;
          font-size: 13px;
        }

        .error-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .results-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeUp 0.4s ease;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #1e293b;
        }

        .divider-text {
          color: #334155;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
          white-space: nowrap;
        }

        .footer {
          text-align: center;
          padding: 20px;
          color: #1e293b;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          border-top: 1px solid #0f1a2e;
        }
      `}</style>
    </div>
  )
}