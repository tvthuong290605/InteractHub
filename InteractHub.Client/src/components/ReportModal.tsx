import React, { useState } from "react";
import { AxiosError } from "axios";
import { postService } from "../services/postService";
import { toast } from "react-toastify";

interface ReportModalProps {
  postId: number;
  onClose: () => void;
}

const REPORT_REASONS = [
  { id: "spam", label: "Spam", icon: "🚫" },
  { id: "harassment", label: "Quấy rối", icon: "😤" },
  { id: "hate_speech", label: "Ngôn từ gây thù ghét", icon: "🗣️" },
  { id: "nude", label: "Ảnh khỏa thân", icon: "🔞" },
  { id: "violence", label: "Bạo lực", icon: "👊" },
  { id: "other", label: "Vấn đề khác", icon: "📝" },
];

const ReportModal: React.FC<ReportModalProps> = ({ postId, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Đưa ra component level để dùng được trong JSX
  const finalReason =
    selectedReason === "other"
      ? otherReason.trim()
      : otherReason.trim()
        ? `${selectedReason}: ${otherReason.trim()}`
        : selectedReason;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await postService.reportPost({
        postId,
        reason: finalReason,
      });

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
        onClose();
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.Message ?? "Gửi báo cáo thất bại.");
      } else {
        toast.error("Gửi báo cáo thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-bg)] w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={step === 2 ? () => setStep(1) : onClose}
            className="p-2 hover:bg-bg rounded-full text-gray-400"
          >
            {step === 2 ? "⬅️" : "✕"}
          </button>
          <h3 className="text-lg font-bold text-[var(--color-text)]">Báo cáo bài viết</h3>
          <div className="w-10" />
        </div>

        {/* Body */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {step === 1 ? (
            <>
              <p className="px-3 py-2 text-[#b0b3b8] text-sm font-medium">
                Vui lòng chọn vấn đề để tiếp tục
              </p>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => {
                    setSelectedReason(reason.label);
                    setStep(2);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-bg rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{reason.icon}</span>
                    <span className="text-[var(--color-text)] font-medium">{reason.label}</span>
                  </div>
                  <span className="text-gray-500 group-hover:text-[var(--color-text)]">➡️</span>
                </button>
              ))}
            </>
          ) : (
            <div className="p-3">
              <p className="text-[var(--color-text)] mb-2">
                Bạn đang báo cáo vì lý do:{" "}
                <span className="font-bold text-[#1877f2]">{selectedReason}</span>
              </p>
              <textarea
                autoFocus
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Nhập chi tiết thêm (không bắt buộc)..."
                className="w-full bg-bg border border-border rounded-xl p-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-border h-24"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div className="p-4 border-t border-border flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 bg-bg hover:bg-bg text-[var(--color-text)] font-bold rounded-lg"
            >
              Quay lại
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || finalReason.length === 0} // ✅ đã trim() rồi nên không cần gọi lại
              className="flex-1 py-2 bg-bg hover:bg-bg text-[var(--color-text)] font-bold rounded-lg disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;