import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Sparkles } from "lucide-react";

const ContributionGraph = ({ data, loading }) => {
  // Generate last 12 months of dates (simplified for heatmap)
  // In a real app, we'd want 365 days. Here we'll do a 52x7 grid.

  const contributionMap = React.useMemo(() => {
    const map = {};
    data.forEach((item) => {
      map[item.date] = item.count;
    });
    return map;
  }, [data]);

  // Simple Level logic (0 to 4)
  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  // Calculate grid data for last 52 weeks (364 days)
  const gridData = React.useMemo(() => {
    const weeks = [];
    const today = new Date();
    // Start from 52 weeks ago (Sunday of that week)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    // Align to Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    let currentDate = new Date(startDate);

    for (let w = 0; w < 53; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = contributionMap[dateStr] || 0;
        days.push({
          date: dateStr,
          count: count,
          level: getLevel(count),
        });
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate > today) break;
      }
      weeks.push(days);
      if (currentDate > today) break;
    }
    return weeks;
  }, [contributionMap]);

  const colors = [
    "bg-zinc-800/50", // Level 0
    "bg-blue-900/40", // Level 1
    "bg-blue-700/60", // Level 2
    "bg-blue-500/80", // Level 3
    "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]", // Level 4
  ];

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-white/5 animate-pulse">
        <div className="h-40 w-full" />
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
      <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500" /> Clash Activity
        </CardTitle>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
          Last 12 Months
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Heatmap Grid */}
          <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
            {gridData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 shrink-0">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    title={`${day.date}: ${day.count} contributions`}
                    className={`w-2.5 h-2.5 rounded-[1px] transition-all duration-500 ${colors[day.level]}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
            <div className="flex items-center gap-6">
              <span>
                Total Contributions:{" "}
                <span className="text-white">
                  {data.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
              </span>
              <span>
                Longest Streak: <span className="text-white">12 Days</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span>Less</span>
              {colors.map((c, i) => (
                <div key={i} className={`w-2 h-2 rounded-[1px] ${c}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContributionGraph;
