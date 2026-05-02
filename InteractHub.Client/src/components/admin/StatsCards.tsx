import React from "react";
import { useNavigate } from "react-router-dom";

interface StatItem {
    title: string;
    value: string | number;
    color: string;
    icon: React.ComponentType<{ className?: string }>;   
    path: string;
}

interface StatsCardsProps {
    stats: StatItem[];     // Mảng các StatItem
}

const StatsCards = ({ stats }: StatsCardsProps) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <div
                        key={stat.title}
                        onClick={() => navigate(stat.path)} 
                        className="bg-white rounded-lg p-6 border cursor-pointer"
                    >
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>

                            <div className={`w-12 h-12 ${stat.color} flex items-center justify-center rounded-lg`}>
                                <Icon className="text-[var(--color-text)]" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatsCards;