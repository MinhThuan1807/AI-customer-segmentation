import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Play, ArrowLeft, Info } from "lucide-react";

interface ClusterConfigProps {
  kValue: number; // currently selected number of clusters
  setKValue: (k: number) => void; // update K
  onRun: () => void; // trigger clustering
  onBack: () => void; // go back to upload
  isLoading: boolean; // true while clustering is running
  totalCustomers: number; // shown in the UI for context
}

export function ClusterConfig({
  kValue,
  setKValue,
  onRun,
  onBack,
  isLoading,
  totalCustomers,
}: ClusterConfigProps) {
  return (
    <Card className="rounded-2xl shadow-sm border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Play className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base">Cấu hình phân cụm</CardTitle>
            <p className="text-xs text-gray-400 mt-0.5">
              Chọn số phân khúc cần tạo từ {totalCustomers} khách hàng
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* K slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Số cụm (K)</label>
            {/* Dynamic K display bubble */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">{kValue}</span>
              </div>
            </div>
          </div>

          {/* Slider: min=2, max=10 */}
          <Slider
            min={2}
            max={10}
            step={1}
            value={[kValue]}
            onValueChange={([val]) => setKValue(val)}
            className="w-full"
            disabled={isLoading}
          />

          {/* Tick labels below slider */}
          <div className="flex justify-between px-1">
            {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
              <span
                key={n}
                className={`text-xs transition-colors ${
                  n === kValue ? "text-indigo-600" : "text-gray-300"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Info tip */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <span className="text-amber-800">Gợi ý:</span> Chưa biết chọn K nào?
            Hãy thử biểu đồ{" "}
            <span className="text-amber-800">Phương pháp Elbow</span> trong kết
            quả để tìm số cụm tối ưu. Điểm khởi đầu tốt là K = 3–5.
          </p>
        </div>

        {/* Feature list */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Tuổi
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Thu nhập hàng năm
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Điểm chi tiêu
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Tần suất mua hàng
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="rounded-xl border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Button>

          <Button
            onClick={onRun}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-5 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang chạy K-Means...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Chạy phân tích (K = {kValue})
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
