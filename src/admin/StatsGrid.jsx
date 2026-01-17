import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const StatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <Card key={i} className="bg-[#121212] border-white/10 rounded-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">
                            {stat.label}
                        </CardTitle>
                        <div className="text-gray-400">
                             {React.cloneElement(stat.icon, { size: 16 })}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <p className="text-xs text-muted-foreground hidden">
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default StatsGrid;
