'use client'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'

interface ClusterPoint {
  CustomerID: number
  Recency: number
  Frequency: number
  Monetary: number
  Cluster: number
  x: number
  y: number
}

interface ClusterChartProps {
  clusters: ClusterPoint[]
  elbow: number[]
  k: number
}

const CLUSTER_COLORS = ['#2dd4bf', '#f59e0b', '#818cf8', '#f87171', '#34d399', '#fb923c']

const CLUSTER_NAMES: Record<number, string> = {
  0: 'VIP',
  1: 'Tiềm năng',
  2: 'Săn sale',
  3: 'Ngủ đông',
  4: 'Mới',
  5: 'Trung bình',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '10px 14px',
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
      }}>
        <p style={{ color: '#2dd4bf', margin: '0 0 6px', fontWeight: 700 }}>
          {CLUSTER_NAMES[d.Cluster] ?? `Nhóm ${d.Cluster}`}
        </p>
        <p style={{ color: '#94a3b8', margin: '2px 0' }}>ID: {d.CustomerID}</p>
        <p style={{ color: '#94a3b8', margin: '2px 0' }}>Recency: {d.Recency?.toFixed(0)} ngày</p>
        <p style={{ color: '#94a3b8', margin: '2px 0' }}>Frequency: {d.Frequency?.toFixed(0)} đơn</p>
        <p style={{ color: '#94a3b8', margin: '2px 0' }}>Monetary: ${d.Monetary?.toFixed(0)}</p>
      </div>
    )
  }
  return null
}

export default function ClusterChart({ clusters, elbow, k }: ClusterChartProps) {
  // Nhóm data theo cluster
  const grouped: Record<number, ClusterPoint[]> = {}
  clusters.forEach((p) => {
    if (!grouped[p.Cluster]) grouped[p.Cluster] = []
    grouped[p.Cluster].push(p)
  })

  // Elbow chart data
  const elbowData = elbow.map((val, i) => ({
    k: i + 1,
    inertia: Math.round(val),
  }))

  return (
    <div className="charts-wrapper">
      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">Biểu đồ phân cụm</h2>
        <div className="cluster-legend">
          {Object.keys(grouped).map((cid) => (
            <span key={cid} className="legend-item">
              <span
                className="legend-dot"
                style={{ background: CLUSTER_COLORS[Number(cid)] }}
              />
              {CLUSTER_NAMES[Number(cid)] ?? `Nhóm ${cid}`}
              <span className="legend-count">({grouped[Number(cid)].length})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Two charts side by side */}
      <div className="charts-grid">
        {/* PCA Scatter */}
        <div className="chart-card">
          <p className="chart-label">Phân bố khách hàng (PCA 2D)</p>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Mono' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                label={{ value: 'PC1', position: 'insideBottom', offset: -4, fill: '#475569', fontSize: 11 }}
              />
              <YAxis
                dataKey="y"
                type="number"
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Mono' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                label={{ value: 'PC2', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(grouped).map((cid) => (
                <Scatter
                  key={cid}
                  name={CLUSTER_NAMES[Number(cid)] ?? `Nhóm ${cid}`}
                  data={grouped[Number(cid)]}
                  fill={CLUSTER_COLORS[Number(cid)]}
                  fillOpacity={0.75}
                  r={3}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Elbow curve */}
        <div className="chart-card">
          <p className="chart-label">Elbow Method — chọn K tối ưu</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={elbowData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="k"
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Mono' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                label={{ value: 'Số cụm K', position: 'insideBottom', offset: -4, fill: '#475569', fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Mono' }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  fontFamily: 'DM Mono',
                  fontSize: 12,
                  color: '#94a3b8',
                }}
                formatter={(val: number) => [val.toLocaleString(), 'Inertia']}
              />
              <Line
                type="monotone"
                dataKey="inertia"
                stroke="#2dd4bf"
                strokeWidth={2}
                dot={(props) => {
                  const isOptimal = props.payload.k === k
                  return (
                    <circle
                      key={props.key}
                      cx={props.cx}
                      cy={props.cy}
                      r={isOptimal ? 6 : 4}
                      fill={isOptimal ? '#2dd4bf' : '#0f172a'}
                      stroke="#2dd4bf"
                      strokeWidth={2}
                    />
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="elbow-note">
            ● Điểm K={k} đang được chọn
          </p>
        </div>
      </div>

      <style jsx>{`
        .charts-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 8px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-title {
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .cluster-legend {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94a3b8;
          font-family: 'DM Mono', monospace;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-count {
          color: #475569;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 20px;
        }

        .chart-label {
          color: #64748b;
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin: 0 0 16px;
          font-family: 'DM Mono', monospace;
        }

        .elbow-note {
          color: #2dd4bf;
          font-size: 11px;
          font-family: 'DM Mono', monospace;
          margin: 12px 0 0;
          text-align: center;
        }
      `}</style>
    </div>
  )
}