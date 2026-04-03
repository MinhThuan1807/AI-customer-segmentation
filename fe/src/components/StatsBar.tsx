'use client'

interface StatsBarProps {
  clusters: Array<{
    CustomerID: number
    Cluster: number
    Recency: number
    Frequency: number
    Monetary: number
  }>
  k: number
}

export default function StatsBar({ clusters, k }: StatsBarProps) {
  const total = clusters.length
  const totalRevenue = clusters.reduce((s, p) => s + p.Monetary, 0)
  const avgFreq = clusters.reduce((s, p) => s + p.Frequency, 0) / total
  const avgRecency = clusters.reduce((s, p) => s + p.Recency, 0) / total

  const stats = [
    { label: 'Khách hàng',     value: total.toLocaleString(),                  unit: '' },
    { label: 'Số cụm',         value: k.toString(),                             unit: 'nhóm' },
    { label: 'Tổng doanh thu', value: `$${Math.round(totalRevenue).toLocaleString()}`, unit: '' },
    { label: 'Avg. Frequency', value: avgFreq.toFixed(1),                       unit: 'đơn/KH' },
    { label: 'Avg. Recency',   value: Math.round(avgRecency).toString(),        unit: 'ngày' },
  ]

  return (
    <div className="stats-bar">
      {stats.map((s, i) => (
        <div key={i} className="stat-card">
          <span className="stat-label">{s.label}</span>
          <div className="stat-row">
            <span className="stat-value">{s.value}</span>
            {s.unit && <span className="stat-unit">{s.unit}</span>}
          </div>
        </div>
      ))}

      <style jsx>{`
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        @media (max-width: 900px) {
          .stats-bar {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 600px) {
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .stat-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-label {
          color: #475569;
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .stat-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }

        .stat-value {
          color: #e2e8f0;
          font-family: 'DM Mono', monospace;
          font-size: 22px;
          font-weight: 700;
          line-height: 1;
        }

        .stat-unit {
          color: #475569;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
        }
      `}</style>
    </div>
  )
}