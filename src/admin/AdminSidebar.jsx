import {
  LayoutDashboard,
  BarChart,
  Users,
  LogOut,
  Shield,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../components/ui/button";

const AdminSidebar = ({ user, activeTab, setActiveTab, handleLogout }) => {
  const sidebarItems = [
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart size={18} /> },
    { id: "tasks", label: "Challenges", icon: <Layers size={18} /> },
    { id: "store", label: "Store", icon: <ShoppingBag size={18} /> },
    { id: "broadcast", label: "Announcements", icon: <Shield size={18} /> },
    { id: "audit", label: "Audit Logs", icon: <Layers size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col shrink-0 sticky top-0">
      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Shield className="text-white" size={20} />
          <span className="font-semibold text-sm tracking-tight text-white">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Main Menu
          </p>
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
              activeTab === item.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span
              className={`${activeTab === item.id ? "text-white" : "text-zinc-500"}`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-zinc-700">
            {user?.profile?.avatar_url ? (
              <img
                src={user.profile.avatar_url}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-[10px] font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-white truncate">
              {user?.username}
            </span>
            <span className="text-[10px] text-zinc-500">Administrator</span>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-2.5 h-9 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs px-2"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
