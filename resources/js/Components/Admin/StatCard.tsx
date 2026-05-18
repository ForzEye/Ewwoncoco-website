import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: string;
    trendType?: 'up' | 'down';
}

export default function StatCard({ title, value, icon: Icon, color, trend, trendType }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-inter text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-poppins font-bold text-[#1A1A1A]">{value}</h3>
                    {trend && (
                        <p className={`text-xs mt-2 font-medium ${trendType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trendType === 'up' ? '↑' : '↓'} {trend} dari bulan lalu
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );
}
