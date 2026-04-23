import type { CustomerData, ClusterInfo } from "../types";

export const CLUSTER_COLORS = [
  "#6366f1", // Indigo
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#84cc16", // Lime
];

export function buildClusterInfos(
  data: CustomerData[],
  labels: number[],
  centroids: number[][],
  k: number,
): ClusterInfo[] {
  const avgIncome = centroids.reduce((s, c) => s + c[1], 0) / k;
  const avgSpending = centroids.reduce((s, c) => s + c[2], 0) / k;

  const ranked = centroids.map((c, i) => ({ i, score: c[1] + c[2] }));
  ranked.sort((a, b) => b.score - a.score);

  const namePool: { name: string; description: string }[] = [
    {
      name: "Khách hàng cao cấp",
      description:
        "Thu nhập cao và chi tiêu nhiều — nhóm khách hàng giá trị nhất. Tập trung vào chương trình khách hàng thân thiết.",
    },
    {
      name: "Người mua bốc đồng",
      description:
        "Thu nhập thấp hơn nhưng có xu hướng chi tiêu cao. Phản ứng tốt với flash sale và khuyến mãi.",
    },
    {
      name: "Người tiết kiệm thận trọng",
      description:
        "Thu nhập cao nhưng chi tiêu ít. Tiềm năng upsell sản phẩm cao cấp hoặc độc quyền.",
    },
    {
      name: "Khách hàng trung bình",
      description:
        "Thu nhập và chi tiêu cân bằng. Phân khúc rộng với nhu cầu đa dạng.",
    },
    {
      name: "Người mua tiết kiệm",
      description:
        "Nhạy cảm về giá và mua hàng không thường xuyên. Phản ứng tốt nhất với giảm giá và gói combo.",
    },
    {
      name: "Mức độ tương tác cao",
      description:
        "Mua hàng thường xuyên và luôn hoạt động — ứng viên tuyệt vời cho chương trình khách hàng thân thiết.",
    },
    {
      name: "Mức độ tương tác thấp",
      description:
        "Hiếm khi mua hàng và ít hoạt động. Cân nhắc chiến dịch tái kết nối.",
    },
    {
      name: "Người săn hàng giảm giá",
      description:
        "Tìm kiếm ưu đãi tốt nhất. Phản ứng mạnh với phiếu giảm giá và ưu đãi có thời hạn.",
    },
    {
      name: "Người tìm kiếm hàng xa xỉ",
      description: "Ưa thích thương hiệu và sản phẩm cao cấp bất kể giá cả.",
    },
    {
      name: "Nhạy cảm về giá",
      description:
        "Rất nhạy cảm với thay đổi giá — giảm giá nhỏ có tác động lớn.",
    },
  ];

  const rankMap: Record<number, number> = {};
  ranked.forEach(({ i }, rank) => {
    rankMap[i] = rank;
  });

  return Array.from({ length: k }, (_, id) => {
    const centroid = centroids[id];
    const rank = rankMap[id] ?? id;
    const meta = namePool[rank % namePool.length];

    const clusterCustomers = data.filter((_, i) => labels[i] === id);
    const avg = (field: keyof CustomerData) =>
      clusterCustomers.length > 0
        ? clusterCustomers.reduce((s, c) => s + (c[field] as number), 0) /
          clusterCustomers.length
        : 0;

    return {
      id,
      name: meta.name,
      description: meta.description,
      color: CLUSTER_COLORS[id % CLUSTER_COLORS.length],
      count: clusterCustomers.length,
      avgIncome: Math.round(avg("AnnualIncome") * 10) / 10,
      avgSpending: Math.round(avg("SpendingScore") * 10) / 10,
      avgAge: Math.round(avg("Age") * 10) / 10,
    };
  });
}
