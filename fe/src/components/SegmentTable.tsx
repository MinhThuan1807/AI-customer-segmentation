'use client'
import { useMemo, useState } from 'react'

interface ClusterPoint {
  CustomerID: number
  Recency: number
  Frequency: number
  Monetary: number
  Cluster: number
}

interface SegmentTableProps {
  clusters: ClusterPoint[]
}

const CLUSTER_COLORS = ['#2dd4bf', '#f59e0b', '#818cf8', '#f87171', '#34d399', '#fb923c']

const SEGMENT_INFO: Record<string, { name: string; desc: string; strategy: string }> = {
  VIP:       { name: 'VIP',       desc: 'Mua gần, mua nhiều, chi nhiều',   strategy: 'Loyalty program, ưu đãi độc quyền' },
  'Tiềm năng': { name: 'Tiềm năng', desc: 'Mua nhiều nhưng chưa chi nhiều', strategy: 'Upsell, gợi ý sản phẩm cao cấp' },
  'Săn sale': { name: 'Săn sale',  desc: 'Mua khi có khuyến mãi',           strategy: 'Flash sale, voucher giới hạn' },
  'Ngủ đông': { name: 'Ngủ đông', desc: 'Lâu không mua, tương tác thấp',   strategy: 'Email win-back, mã giảm giá' },
  'Mới':      { name: 'Mới',       desc: 'Khách mới, ít giao dịch',         strategy: 'Onboarding, hướng dẫn sản phẩm' },
  'Trung bình': { name: 'Trung bình', desc: 'Chỉ số ở mức trung bình',     strategy: 'Tăng engagement, email định kỳ' },
}

function assignSegmentName(avgR: number, avgF: number, avgM: number, allAvgR: number, allAvgF: number, allAvgM: number): string {
  const isRecent    = avgR < allAvgR
  const isFrequent  = avgF > allAvgF
  const isHighValue = avgM > allAvgM

  if (isRecent && isFrequent && isHighValue) return 'VIP'
  if (isRecent && isFrequent && !isHighValue) return 'Săn sale'
  if (isRecent && !isFrequent && isHighValue) return 'Tiềm năng'
  if (!isRecent && isFrequent) return 'Trung bình'
  if (!isRecent && !isFrequent) return 'Ngủ đông'
  return 'Mới'
}

export default function SegmentTable({ clusters }: SegmentTableProps) {
  const [activeCluster, setActiveCluster] = useState<number | null>(null)

  const stats = useMemo(() => {
    const grouped: Record<number, ClusterPoint[]> = {}
    clusters.forEach((p) => {
      if (!grouped[p.Cluster]) grouped[p.Cluster] = []
      grouped[p.Cluster].push(p)
    })

    const totalCustomers = clusters.length
    const globalAvgR = clusters.reduce((s, p) => s + p.Recency, 0) / totalCustomers
    const globalAvgF = clusters.reduce((s, p) => s + p.Frequency, 0) / totalCustomers
    const globalAvgM = clusters.reduce((s, p) => s + p.Monetary, 0) / totalCustomers

    return Object.entries(grouped)
      .map(([cid, points]) => {
        const n = points.length
        const avgR = points.reduce((s, p) => s + p.Recency, 0) / n
        const avgF = points.reduce((s, p) => s + p.Frequency, 0) / n
        const avgM = points.reduce((s, p) => s + p.Monetary, 0) / n
        const totalM = points.reduce((s, p) => s + p.Monetary, 0)
        const segName = assignSegmentName(avgR, avgF, avgM, globalAvgR, globalAvgF, globalAvgM)

        return {
          cluster: Number(cid),
          count: n,
          pct: ((n / totalCustomers) * 100).toFixed(1),
          avgR: Math.round(avgR),
          avgF: Math.round(avgF),
          avgM: Math.round(avgM),
          totalM: Math.round(totalM),
          segName,
        }
      })
      .sort((a, b) => a.cluster - b.cluster)
  }, [clusters])

  const filteredClusters = activeCluster !== null
    ? clusters.filter((p) => p.Cluster === activeCluster)
    : clusters

  return (
    <div className="segment-wrapper">
      {/* Segment cards */}
      <div className="segment-header">
        <h2 className="section-title">Phân tích từng nhóm</h2>
        <p className="section-sub">Click vào nhóm để xem chi tiết khách hàng</p>
      </div>

      <div className="segment-cards">
        {stats.map((s) => {
          const info = SEGMENT_INFO[s.segName] ?? { name: s.segName, desc: '—', strategy: '—' }
          const color = CLUSTER_COLORS[s.cluster]
          const isActive = activeCluster === s.cluster
          return (
            <div
              key={s.cluster}
              className={`seg-card ${isActive ? 'active' : ''}`}
              style={{ '--accent': color } as React.CSSProperties}
              onClick={() => setActiveCluster(isActive ? null : s.cluster)}
            >
              <div className="seg-card-top">
                <span className="seg-dot" style={{ background: color }} />
                <span className="seg-name">{info.name}</span>
                <span className="seg-pct">{s.pct}%</span>
              </div>
              <div className="seg-count">{s.count.toLocaleString()} KH</div>
              <p className="seg-desc">{info.desc}</p>
              <div className="seg-metrics">
                <div className="metric">
                  <span className="metric-label">Recency</span>
                  <span className="metric-val">{s.avgR}d</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Freq</span>
                  <span className="metric-val">{s.avgF}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Monetary</span>
                  <span className="metric-val">${s.avgM.toLocaleString()}</span>
                </div>
              </div>
              <div className="seg-strategy">
                <span className="strategy-label">Chiến lược:</span> {info.strategy}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail table */}
      <div className="detail-section">
        <div className="detail-header">
          <h3 className="detail-title">
            {activeCluster !== null
              ? `Chi tiết — ${SEGMENT_INFO[stats.find(s => s.cluster === activeCluster)?.segName ?? '']?.name ?? `Nhóm ${activeCluster}`}`
              : 'Tất cả khách hàng'}
          </h3>
          <span className="detail-count">{filteredClusters.length.toLocaleString()} bản ghi</span>
          {activeCluster !== null && (
            <button className="clear-btn" onClick={() => setActiveCluster(null)}>✕ Bỏ lọc</button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Nhóm</th>
                <th>Recency (ngày)</th>
                <th>Frequency (đơn)</th>
                <th>Monetary ($)</th>
              </tr>
            </thead>
            <tbody>
              {filteredClusters.slice(0, 50).map((p) => {
                const sname = stats.find((s) => s.cluster === p.Cluster)?.segName ?? ''
                return (
                  <tr key={p.CustomerID}>
                    <td className="mono">{p.CustomerID}</td>
                    <td>
                      <span
                        className="cluster-badge"
                        style={{
                          background: `${CLUSTER_COLORS[p.Cluster]}18`,
                          color: CLUSTER_COLORS[p.Cluster],
                          border: `1px solid ${CLUSTER_COLORS[p.Cluster]}40`,
                        }}
                      >
                        {sname}
                      </span>
                    </td>
                    <td className="mono">{Math.round(p.Recency)}</td>
                    <td className="mono">{Math.round(p.Frequency)}</td>
                    <td className="mono">${Math.round(p.Monetary).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredClusters.length > 50 && (
            <p className="table-note">Hiển thị 50 / {filteredClusters.length} bản ghi</p>
          )}
        </div>
      </div>

      <style jsx>{`
        .segment-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 8px;
        }

        .segment-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }

        .section-title {
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .section-sub {
          color: #475569;
          font-size: 12px;
          margin: 0;
        }

        .segment-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .seg-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .seg-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }

        .seg-card.active {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 6%, #0f172a);
        }

        .seg-card-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .seg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .seg-name {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 600;
          flex: 1;
        }

        .seg-pct {
          color: #64748b;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
        }

        .seg-count {
          font-family: 'DM Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          color: var(--accent);
          line-height: 1;
        }

        .seg-desc {
          color: #64748b;
          font-size: 11px;
          margin: 0;
          line-height: 1.5;
        }

        .seg-metrics {
          display: flex;
          gap: 8px;
          padding-top: 8px;
          border-top: 1px solid #1e293b;
        }

        .metric {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-label {
          color: #475569;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .metric-val {
          color: #94a3b8;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 600;
        }

        .seg-strategy {
          font-size: 11px;
          color: #475569;
          line-height: 1.4;
        }

        .strategy-label {
          color: #64748b;
          font-weight: 600;
        }

        /* Detail table */
        .detail-section {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #1e293b;
        }

        .detail-title {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }

        .detail-count {
          color: #475569;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
        }

        .clear-btn {
          background: transparent;
          border: 1px solid #334155;
          color: #64748b;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .clear-btn:hover {
          border-color: #f87171;
          color: #f87171;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .data-table th {
          padding: 10px 20px;
          text-align: left;
          color: #475569;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-weight: 500;
          background: #0a1020;
          border-bottom: 1px solid #1e293b;
          white-space: nowrap;
        }

        .data-table td {
          padding: 10px 20px;
          color: #94a3b8;
          border-bottom: 1px solid #0d1a2e;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover td {
          background: #111827;
        }

        .mono {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
        }

        .cluster-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .table-note {
          text-align: center;
          color: #334155;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          padding: 12px;
          margin: 0;
          border-top: 1px solid #1e293b;
        }
      `}</style>
    </div>
  )
}
