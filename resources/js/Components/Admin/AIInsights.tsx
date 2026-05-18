import React from 'react';
import { Sparkles, TrendingUp, ShoppingBag, AlertCircle, Users, Info } from 'lucide-react';

interface Insight {
    type: 'success' | 'info' | 'warning' | 'magic';
    title: string;
    text: string;
    icon: string;
}

interface AIInsightsProps {
    insights: Insight[];
}

const iconMap: { [key: string]: any } = {
    Sparkles,
    TrendingUp,
    ShoppingBag,
    AlertCircle,
    Users,
    Info
};

export default function AIInsights({ insights }: AIInsightsProps) {
    if (!insights || insights.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C48C]/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-[#00C48C]/20 transition-all duration-500"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00C48C]/20 rounded-xl flex items-center justify-center border border-[#00C48C]/30 animate-pulse">
                        <Sparkles className="text-[#00C48C]" size={20} />
                    </div>
                    <div>
                        <h3 className="font-poppins font-black text-lg tracking-tight">Spark AI Insights</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Analisa Pintar Real-time</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {insights.map((insight, index) => {
                    const Icon = iconMap[insight.icon] || Info;
                    
                    return (
                        <div 
                            key={index} 
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg ${
                                    insight.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                    insight.type === 'warning' ? 'bg-red-500/20 text-red-400' :
                                    insight.type === 'magic' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black mb-1 text-white/90">{insight.title}</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{insight.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
