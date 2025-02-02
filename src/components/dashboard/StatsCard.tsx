import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    trend?: {
        value: number;
        label: string;
    };
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
    return (
        <div className="p-4 bg-black/20 backdrop-blur-sm rounded">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-medium opacity-75">{title}</h3>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                {icon && (
                    <div className="text-xl opacity-75">
                        {icon}
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-2 text-sm">
                    <span className={trend.value >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </span>
                    <span className="opacity-75 ml-1">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
