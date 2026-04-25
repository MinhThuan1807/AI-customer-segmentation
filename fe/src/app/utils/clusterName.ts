import type { CustomerData, ClusterInfo } from "../types";

// Bảng màu cho từng cụm, dùng theo thứ tự id cụm
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

/**
 * Xác định tên và mô tả cho một cụm dựa trên đặc trưng của centroid.
 * So sánh thu nhập, chi tiêu và tuổi của cụm với giá trị trung bình toàn bộ các cụm
 * để phân loại thành 8 nhóm khách hàng khác nhau.
 */
function getClusterMeta(
  income: number,
  spending: number,
  age: number,
  avgIncome: number,
  avgSpending: number,
  avgAge: number,
): { name: string; description: string } {
  // Xác định cụm có thu nhập / chi tiêu cao hay thấp, và có trẻ hay không
  // avgAge tính từ dữ liệu thực nên ngưỡng "trẻ" phản ánh đúng phân phối
  const highIncome = income >= avgIncome;
  const highSpending = spending >= avgSpending;
  const young = age < avgAge;
  // Nhãn tuổi hiển thị trong description để tránh confuse
  const ageLabel = age < 35 ? "trẻ tuổi" : age < 45 ? "trung niên" : "lớn tuổi";

  if (highIncome && highSpending && young) {
    return {
      name: "Khách VIP năng động",
      description: `Thu nhập cao, chi tiêu nhiều, ${ageLabel}. Nhóm tiềm năng tăng trưởng dài hạn — ưu tiên trải nghiệm và thương hiệu.`,
    };
  }
  if (highIncome && highSpending && !young) {
    return {
      name: "Khách VIP",
      description: `Thu nhập cao, chi tiêu nhiều, ${ageLabel}. Nhóm khách hàng giá trị nhất — tập trung vào chương trình khách hàng thân thiết.`,
    };
  }
  if (highIncome && !highSpending && young) {
    return {
      name: "Người thu nhập cao tiết kiệm",
      description: `Thu nhập cao, chi tiêu ít, ${ageLabel}. Có tiềm năng chuyển đổi thành khách hàng cao cấp với chiến lược đúng.`,
    };
  }
  if (highIncome && !highSpending && !young) {
    return {
      name: "Người giàu thận trọng",
      description: `Thu nhập cao nhưng chi tiêu ít, ${ageLabel}. Tiềm năng bán thêm sản phẩm cao cấp hoặc độc quyền.`,
    };
  }
  if (!highIncome && highSpending && young) {
    return {
      name: "Người mua sắm nhiệt tình",
      description: `Thu nhập thấp nhưng chi tiêu cao, ${ageLabel}. Phản ứng rất tốt với giảm giá nhanh, xu hướng và khuyến mãi.`,
    };
  }
  if (!highIncome && highSpending && !young) {
    return {
      name: "Người mua sắm tích cực",
      description: `Thu nhập không cao nhưng vẫn chi tiêu nhiều, ${ageLabel}. Trung thành với thương hiệu yêu thích, phản ứng tốt với ưu đãi thành viên.`,
    };
  }
  if (!highIncome && !highSpending && young) {
    return {
      name: "Khách hàng tiềm năng",
      description: `Thu nhập và chi tiêu thấp, ${ageLabel}. Có thể phát triển thành nhóm giá trị cao theo thời gian.`,
    };
  }
  // Trường hợp còn lại: thu nhập thấp, chi tiêu thấp, tuổi cao
  return {
    name: "Người mua hàng tiết kiệm",
    description: `Thu nhập thấp, chi tiêu ít, ${ageLabel}. Nhạy cảm về giá, phản ứng tốt nhất với giảm giá và gói combo.`,
  };
}

/**
 * Xử lý trùng tên cụm khi k lớn (ví dụ k=7 có thể có nhiều cụm cùng loại).
 * Nếu có nhiều cụm trùng tên, thêm hậu tố La Mã (I, II, III...) để phân biệt.
 * Các cụm trùng tên được sắp xếp theo thu nhập giảm dần trước khi gán hậu tố.
 */
function disambiguateName(
  baseName: string,
  centroid: number[],
  duplicates: { id: number; centroid: number[] }[],
): string {
  // Nếu không có trùng lặp thì giữ nguyên tên gốc
  if (duplicates.length <= 1) return baseName;

  // Sắp xếp các cụm trùng tên theo thu nhập (index 1) giảm dần để gán hậu tố nhất quán
  const sorted = [...duplicates].sort((a, b) => b.centroid[1] - a.centroid[1]);
  const rank = sorted.findIndex((d) => d.centroid === centroid);

  const suffixes = ["I", "II", "III", "IV", "V"];
  return `${baseName} ${suffixes[rank] ?? rank + 1}`;
}

/**
 * Hàm chính: xây dựng danh sách thông tin các cụm sau khi phân cụm K-Means.
 * - Tính giá trị trung bình toàn cục để làm ngưỡng phân loại
 * - Gán tên/mô tả cho từng cụm dựa trên centroid
 * - Xử lý trùng tên nếu có
 * - Tính các chỉ số thống kê (thu nhập TB, chi tiêu TB, tuổi TB) cho từng cụm
 */
export function buildClusterInfos(
  data: CustomerData[],
  labels: number[], // nhãn cụm của từng khách hàng (cùng thứ tự với data)
  centroids: number[][], // tọa độ centroid của từng cụm [age, income, spending]
  k: number, // số lượng cụm
): ClusterInfo[] {
  // Tính trung bình thu nhập, chi tiêu từ centroid; tuổi từ dữ liệu thực để ngưỡng chính xác hơn
  const avgIncome = centroids.reduce((s, c) => s + c[1], 0) / k;
  const avgSpending = centroids.reduce((s, c) => s + c[2], 0) / k;
  const avgAge =
    data.length > 0
      ? data.reduce((s, c) => s + c.Age, 0) / data.length
      : centroids.reduce((s, c) => s + c[0], 0) / k;

  // Bước 1: tính tên gốc cho từng cụm dựa trên centroid
  const metas = centroids.map((centroid, id) => ({
    id,
    centroid,
    meta: getClusterMeta(
      centroid[1],
      centroid[2],
      centroid[0],
      avgIncome,
      avgSpending,
      avgAge,
    ),
  }));

  // Bước 2: nhóm các cụm có cùng tên để phát hiện trùng lặp
  const nameGroups = new Map<string, { id: number; centroid: number[] }[]>();
  for (const { id, centroid, meta } of metas) {
    const group = nameGroups.get(meta.name) ?? [];
    group.push({ id, centroid });
    nameGroups.set(meta.name, group);
  }

  // Bước 3: tạo ClusterInfo cho từng cụm, thêm hậu tố nếu tên bị trùng
  return metas.map(({ id, centroid, meta }) => {
    const group = nameGroups.get(meta.name)!;
    const finalName = disambiguateName(meta.name, centroid, group);

    // Lọc danh sách khách hàng thuộc cụm này
    const clusterCustomers = data.filter((_, i) => labels[i] === id);

    // Hàm tính trung bình một trường số trong cụm
    const avg = (field: keyof CustomerData) =>
      clusterCustomers.length > 0
        ? clusterCustomers.reduce((s, c) => s + (c[field] as number), 0) /
          clusterCustomers.length
        : 0;

    return {
      id,
      name: finalName,
      description: meta.description,
      color: CLUSTER_COLORS[id % CLUSTER_COLORS.length],
      count: clusterCustomers.length,
      avgIncome: Math.round(avg("AnnualIncome") * 10) / 10,
      avgSpending: Math.round(avg("SpendingScore") * 10) / 10,
      avgAge: Math.round(avg("Age") * 10) / 10,
    };
  });
}
