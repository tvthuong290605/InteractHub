import React from "react";

// ==================== Interface ====================
interface HashtagItem {
    Name: string;
    Count: number;
}

interface Props {
    hashtags: HashtagItem[];
}

const RecentHashtags: React.FC<Props> = ({ hashtags }) => {    

    return (
        <div  className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-3 text-base">
                Hashtag phổ biến 
            </h3>

            {/* Header */}
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 px-1">
                <span>Số bài</span>
                <span>Hashtag</span>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {hashtags.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center border-b py-2 px-1"
                    >
                        {/* Left */}
                        <span className="font-semibold text-blue-600 text-sm">
                            {item.Count}
                        </span>

                        {/* Right */}
                        <span className="text-gray-800 text-sm">
                            {item.Name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentHashtags;