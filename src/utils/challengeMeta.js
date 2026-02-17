export const getDifficultyMeta = (order = 1) => {
  if (order <= 18) {
    return {
      label: "Easy",
      pill: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
    };
  }
  if (order <= 38) {
    return {
      label: "Medium",
      pill: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
    };
  }
  return {
    label: "Hard",
    pill: "bg-rose-500/10 text-rose-300 border border-rose-500/30",
  };
};

export const getTrackMeta = (order = 1) => {
  if (order <= 10) return { key: "basics", label: "Python Basics" };
  if (order <= 20) return { key: "ds", label: "Data Structures" };
  if (order <= 30) return { key: "flow", label: "Control Flow" };
  if (order <= 40) return { key: "functions", label: "Functions & Patterns" };
  if (order <= 45) return { key: "stdlib", label: "Standard Library" };
  if (order <= 53) return { key: "oop", label: "OOP Mastery" };
  return { key: "special", label: "Special" };
};

