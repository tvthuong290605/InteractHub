import { useEffect, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { resolveUrl } from "../utils/urlUtils";

type Orientation = "portrait" | "landscape" | "square";

interface MediaGridProps {
    mediaUrls: string[];
}

const getOrientation = (url: string): Promise<Orientation> =>
    new Promise((resolve) => {
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            const video = document.createElement("video");
            video.onloadedmetadata = () => {
                if (video.videoHeight > video.videoWidth) resolve("portrait");
                else if (video.videoWidth > video.videoHeight) resolve("landscape");
                else resolve("square");
            };
            video.onerror = () => resolve("landscape");
            video.src = url;
            return;
        }
        const img = new Image();
        img.onload = () => {
            if (img.naturalHeight > img.naturalWidth) resolve("portrait");
            else if (img.naturalWidth > img.naturalHeight) resolve("landscape");
            else resolve("square");
        };
        img.onerror = () => resolve("landscape");
        img.src = url;
    });

const MediaGrid = ({ mediaUrls }: MediaGridProps) => {
    const [orientations, setOrientations] = useState<Orientation[] | null>(null);

    useEffect(() => {
        if (!mediaUrls?.length) return;
        Promise.all(
            mediaUrls.map((url) => getOrientation(resolveUrl(url) ?? ""))
        ).then(setOrientations);
    }, [mediaUrls]);

    if (!mediaUrls?.length) return null;
    if (!orientations)
        return <div className="w-full h-48 bg-bg rounded-xl animate-pulse" />;

    const total = mediaUrls.length;
    const firstIsPortrait = orientations[0] === "portrait";

    const renderMedia = (url: string, index: number) => {
        const resolved = resolveUrl(url) ?? "";
        const isVideo = url.match(/\.(mp4|webm|ogg)$/i);

        if (isVideo) {
            return (
                <video
                    src={resolved}
                    controls
                    className="w-full h-full object-contain max-h-[500px]"
                />
            );
        }

        return (
            <PhotoView src={resolved}>
                <img
                    src={resolved}
                    className="w-full h-full object-cover cursor-pointer"
                />
            </PhotoView>
        );
    };

    // ── 1 media ───────────────────────────────────────────────────
    if (total === 1) {
        return (
            <PhotoProvider>
                <div className="overflow-hidden rounded-2xl">
                    {renderMedia(mediaUrls[0], 0)}
                </div>
            </PhotoProvider>
        );
    }

    // ── 2 media ───────────────────────────────────────────────────
    if (total === 2) {
        const allPortrait = orientations.every((o) => o === "portrait");
        return (
            <PhotoProvider>
                <div className={allPortrait ? "grid grid-cols-2 gap-1" : "flex flex-col gap-1"}>
                    {mediaUrls.map((url, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl">
                            {renderMedia(url, i)}
                        </div>
                    ))}
                </div>
            </PhotoProvider>
        );
    }

    // ── 3 media ───────────────────────────────────────────────────
    if (total === 3) {
        return (
            <PhotoProvider>
                {firstIsPortrait ? (
                    <div className="flex gap-1">
                        <div className="w-[55%] overflow-hidden rounded-2xl">
                            {renderMedia(mediaUrls[0], 0)}
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            {mediaUrls.slice(1).map((url, i) => (
                                <div key={i + 1} className="flex-1 overflow-hidden rounded-2xl min-h-[150px]">
                                    {renderMedia(url, i + 1)}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="overflow-hidden rounded-2xl">
                            {renderMedia(mediaUrls[0], 0)}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {mediaUrls.slice(1).map((url, i) => (
                                <div key={i + 1} className="overflow-hidden rounded-2xl min-h-[150px]">
                                    {renderMedia(url, i + 1)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </PhotoProvider>
        );
    }

    // ── 4+ media ──────────────────────────────────────────────────
    const remaining = mediaUrls.slice(1, 4);
    const extra = total - 4;

    return (
        <PhotoProvider>
            {firstIsPortrait ? (
                <div className="flex gap-1 h-[500px]">
                    <div className="w-[55%] overflow-hidden rounded-2xl">
                        {renderMedia(mediaUrls[0], 0)}
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                        {remaining.map((url, i) => (
                            <div key={i + 1} className="relative flex-1 overflow-hidden rounded-2xl">
                                {renderMedia(url, i + 1)}
                                {i === 2 && extra > 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl pointer-events-none">
                                        <span className="text-white text-2xl font-bold">+{extra}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <div className="overflow-hidden rounded-2xl">
                        {renderMedia(mediaUrls[0], 0)}
                    </div>
                    <div className="grid grid-cols-3 gap-1 h-[180px]">
                        {remaining.map((url, i) => (
                            <div key={i + 1} className="relative overflow-hidden rounded-2xl">
                                {renderMedia(url, i + 1)}
                                {i === 2 && extra > 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl pointer-events-none">
                                        <span className="text-white text-2xl font-bold">+{extra}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ảnh ẩn từ index 4 trở đi — đăng ký vào lightbox để navigate đủ N/N ảnh */}
            {mediaUrls.slice(4).map((url, i) => (
                <PhotoView key={`hidden-${i}`} src={resolveUrl(url) ?? ""}>
                    <span style={{ display: "none" }} />
                </PhotoView>
            ))}
        </PhotoProvider>
    );
};

export default MediaGrid;