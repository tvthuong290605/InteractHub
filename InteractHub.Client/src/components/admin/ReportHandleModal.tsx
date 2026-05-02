import React, { useState, useEffect } from 'react';
import { X, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import { postService } from "../../services/postService";

interface Props {
    report: any;
    mode: 'resolve' | 'reject';
    onClose: () => void;
    onSubmit: (data: {
        reportId: number;
        action: 'hide' | 'delete' | 'reject';
        message: string;
    }) => void;
}

const ReportHandleModal: React.FC<Props> = ({
    report,
    mode,
    onClose,
    onSubmit
}) => {
    const [message, setMessage] = useState('');

    // auto fill message theo mode
    useEffect(() => {
        if (!report) return;

        if (mode === 'resolve') {
            setMessage(`Đã giải quyết vi phạm: ${report.type || ''}`);
        }

        if (mode === 'reject') {
            setMessage(`Đã từ chối xử lý vi phạm: ${report.type || ''}`);
        }
    }, [report, mode]);

    //  chỉ có 1 action submit
    // const handleSubmit = async (action?: 'hide' | 'delete' | 'reject') => {
    //     try {

    //         let finalMessage = message;

    //         // ✅ thêm prefix theo action
    //         if (action === 'hide') {
    //             await postService.updateStatusPost(report.post.Id, 0); 
    //             finalMessage = ` ${message} thành công. Bài viết đã bị ẩn.`;
    //         }

    //         if (action === 'delete') {
    //             await postService.updateStatusPost(report.post.Id, -1); 
    //             finalMessage = `${message} thành công. Bài viết đã bị xóa.`;
    //         }
    //         await postService.updateStatusReport(report.id, {
    //             adminNote: finalMessage.trim() || report.type

    //         });


    //         onClose();

    //     } catch (err) {
    //         console.error("Update report error:", err);
    //     }
    // };
    const handleSubmit = async (action?: 'hide' | 'delete' | 'reject') => {
        try {
            let finalMessage = message;
            let status = 1; // mặc định: đã xử lý

            // 👉 xử lý bài viết
            if (action === 'hide') {
                await postService.updateStatusPost(report.post.Id, 0);
                finalMessage = `${message} Thành công. Bài viết đã bị ẩn.`;
            }

            if (action === 'delete') {
                await postService.updateStatusPost(report.post.Id, -1);
                finalMessage = `${message} Thành công. Bài viết đã bị xóa.`;
            }

            if (mode === 'reject') {
                status = -1;
                finalMessage = `${message} (Đã từ chối xử lý)`;
            }

            // 👉 GỬI API REPORT
            await postService.updateStatusReport(report.id, {
                adminNote: finalMessage.trim() || report.type,
                status: status,
                userNameAuthor: report.post?.AuthorName || ""
            });

            onSubmit({
                reportId: report.id,
                action: action || 'reject',
                message: finalMessage
            });
            onClose();

        } catch (err) {
            console.error("Update report error:", err);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        {mode === 'resolve' ? 'Giải quyết báo cáo' : 'Từ chối báo cáo'}
                    </h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* Input */}
                <textarea
                    placeholder="Nhập nội dung xử lý..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring"
                    rows={4}
                />

                {/* ACTIONS */}
                {mode === 'resolve' ? (
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => handleSubmit('hide')}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-yellow-700"
                        >
                            <EyeOff size={16} />
                            Ẩn bài
                        </button>

                        <button
                            onClick={() => handleSubmit('delete')}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-red-700"
                        >
                            <Trash2 size={16} />
                            Xóa bài
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleSubmit()}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-gray-800"
                        >
                            <CheckCircle size={16} />
                            Xác nhận từ chối
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportHandleModal;
