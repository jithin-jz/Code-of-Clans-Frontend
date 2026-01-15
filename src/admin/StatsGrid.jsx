import React from 'react';

const StatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
                <div key={i} className="bg-[#1a1a1a]/80 backdrop-blur-md rounded-2xl p-6 border border-[#333] hover:border-[#ffd700]/30 transition-all duration-300 group shadow-lg hover:shadow-[#ffd700]/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white group-hover:text-[#ffd700] transition-colors">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-linear-to-br from-[#2a2a2a] to-[#151515] border border-[#333] flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;
