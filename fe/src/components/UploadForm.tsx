'use client'
import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface UploadFormProps {
  onAnalyze: (file: File, k: number) => void
  loading: boolean
}

export default function UploadForm({ onAnalyze, loading }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [k, setK] = useState(4)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.csv')) setFile(dropped)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleSubmit = () => {
    if (file) onAnalyze(file, k)
  }

  return (
    <div className="upload-card">
      {/* Drop zone */}
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {file ? (
          <div className="file-info">
            <span className="file-icon">▣</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="drop-prompt">
            <span className="drop-icon">⊕</span>
            <p className="drop-text">Kéo thả file CSV vào đây</p>
            <p className="drop-sub">hoặc click để chọn file</p>
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="controls-row">
        <div className="k-control">
          <label className="control-label">Số cụm K</label>
          <div className="k-buttons">
            {[2, 3, 4, 5, 6].map((val) => (
              <button
                key={val}
                className={`k-btn ${k === val ? 'active' : ''}`}
                onClick={() => setK(val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <button
          className={`analyze-btn ${!file || loading ? 'disabled' : ''}`}
          onClick={handleSubmit}
          disabled={!file || loading}
        >
          {loading ? (
            <span className="loading-text">
              <span className="spinner" />
              Đang phân tích...
            </span>
          ) : (
            'Phân tích →'
          )}
        </button>
      </div>

      <style jsx>{`
        .upload-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .drop-zone {
          border: 1.5px dashed #334155;
          border-radius: 12px;
          padding: 40px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 140px;
        }

        .drop-zone:hover,
        .drop-zone.dragging {
          border-color: #2dd4bf;
          background: rgba(45, 212, 191, 0.04);
        }

        .drop-zone.has-file {
          border-style: solid;
          border-color: #2dd4bf;
          background: rgba(45, 212, 191, 0.06);
        }

        .drop-prompt {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drop-icon {
          font-size: 28px;
          color: #475569;
          line-height: 1;
        }

        .drop-text {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
          font-family: 'DM Mono', monospace;
        }

        .drop-sub {
          color: #475569;
          font-size: 12px;
          margin: 0;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .file-icon {
          font-size: 20px;
          color: #2dd4bf;
        }

        .file-name {
          color: #e2e8f0;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
        }

        .file-size {
          color: #64748b;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
        }

        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .k-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-label {
          color: #64748b;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .k-buttons {
          display: flex;
          gap: 4px;
        }

        .k-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #1e293b;
          background: transparent;
          color: #64748b;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .k-btn:hover {
          border-color: #2dd4bf;
          color: #2dd4bf;
        }

        .k-btn.active {
          background: #2dd4bf;
          border-color: #2dd4bf;
          color: #0f172a;
          font-weight: 700;
        }

        .analyze-btn {
          padding: 10px 24px;
          background: #2dd4bf;
          color: #0f172a;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .analyze-btn:hover:not(.disabled) {
          background: #5eead4;
          transform: translateY(-1px);
        }

        .analyze-btn.disabled {
          background: #1e293b;
          color: #475569;
          cursor: not-allowed;
        }

        .loading-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid #475569;
          border-top-color: #2dd4bf;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}