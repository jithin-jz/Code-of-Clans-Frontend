import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";
import Loader from "../common/Loader";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

import {
  Users,
  Zap,
  Lock,
  Gem,
  AlertTriangle,
  Shield,
  Database,
  Activity,
  Terminal,
} from "lucide-react";

// Components
import AdminSidebar from "./AdminSidebar";
import UserTable from "./UserTable";
import AdminTasks from "./AdminTasks";
import ChallengeAnalytics from "./ChallengeAnalytics";
import StoreAnalytics from "./StoreAnalytics";
import AdminBroadcast from "./AdminBroadcast";
import AdminAuditLogs from "./AdminAuditLogs";

import AdminStore from "./AdminStore";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("admin_active_tab") || "users";
  });

  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  const [rawStats, setRawStats] = useState({
    total_users: 0,
    active_sessions: 0,
    oauth_logins: 0,
    total_gems: 0,
  });

  const [userList, setUserList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [integrity, setIntegrity] = useState(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      await checkAuth();
      setLoading(false);
    };
    verifyAdmin();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!user?.is_staff && !user?.is_superuser) {
        navigate("/home");
      } else {
        fetchUsers();
        fetchStats();
        fetchIntegrity();
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    setTableLoading(true);
    try {
      const response = await authAPI.getUsers();
      setUserList(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await authAPI.getAdminStats();
      setRawStats(response.data);
    } catch (error) {
      console.error("Failed to fetch admin stats", error);
    }
  };

  const fetchIntegrity = async () => {
    try {
      const response = await authAPI.getSystemIntegrity();
      setIntegrity(response.data);
    } catch (error) {
      console.error("Failed to fetch system integrity", error);
    }
  };

  const handleBlockToggle = (username) => {
    const currentUserData = userList.find((u) => u.username === username);
    const action = currentUserData?.is_active ? "ban" : "unban";

    notify.warning("Confirm Action", {
      description: `Are you sure you want to ${action} the inhabitant ${username}?`,
      action: {
        label: "Confirm",
        onClick: () => confirmBlockToggle(username),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const confirmBlockToggle = async (username) => {
    try {
      await authAPI.toggleBlockUser(username);
      notify.success(`User status updated for ${username}`);
      fetchUsers();
    } catch (error) {
      notify.error(
        error.response?.data?.error || "Failed to toggle block status",
      );
    }
  };

  const handleDeleteUser = (username) => {
    notify.warning("Delete User", {
      description: `Permanently delete user ${username}? This cannot be undone.`,
      action: {
        label: "Delete",
        onClick: () => confirmDeleteUser(username),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const confirmDeleteUser = async (username) => {
    try {
      await authAPI.deleteUser(username);
      notify.success(`User ${username} deleted successfully`);
      fetchUsers();
    } catch (error) {
      notify.error(error.response?.data?.error || "Failed to delete user");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("admin_active_tab");
    await logout();
    navigate("/login");
  };

  if (loading) return <Loader isLoading={true} />;
  if (!user?.is_staff && !user?.is_superuser) return null;

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans antialiased text-zinc-200">
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {activeTab === "users" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm flex flex-col justify-between group/card">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white">
                          System Health
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-[#00af9b]/5 text-[#00af9b] border-[#00af9b]/10 text-[9px] font-medium uppercase tracking-wider h-5"
                        >
                          Operational
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mt-6">
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                          <p className="text-[9px] uppercase font-semibold text-zinc-500 mb-1">
                            Users
                          </p>
                          <p className="text-xl font-bold text-white tracking-tight">
                            {integrity?.users || 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                          <p className="text-[9px] uppercase font-semibold text-zinc-500 mb-1">
                            Sessions
                          </p>
                          <p className="text-xl font-bold text-white tracking-tight">
                            {rawStats.active_sessions || 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                          <p className="text-[9px] uppercase font-semibold text-zinc-500 mb-1">
                            Challenges
                          </p>
                          <p className="text-xl font-bold text-white tracking-tight">
                            {integrity?.challenges || 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                          <p className="text-[9px] uppercase font-semibold text-zinc-500 mb-1">
                            Inventory
                          </p>
                          <p className="text-xl font-bold text-white tracking-tight">
                            {integrity?.store_items || 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                          <p className="text-[9px] uppercase font-semibold text-zinc-500 mb-1">
                            Audit Logs
                          </p>
                          <p className="text-xl font-bold text-white tracking-tight">
                            {integrity?.audit_logs || 0}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                          <p className="text-[9px] uppercase font-semibold text-zinc-500 mb-1">
                            XP Spent
                          </p>
                          <p className="text-xl font-bold text-white tracking-tight">
                            {rawStats.total_gems || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Shield className="text-[#00af9b]" size={12} />
                        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                          Real-time synchronization active
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("audit")}
                        className="text-zinc-500 hover:text-white text-[9px] h-7 px-3 font-medium uppercase tracking-wider rounded-md hover:bg-zinc-800"
                      >
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <UserTable
                userList={userList}
                tableLoading={tableLoading}
                currentUser={user}
                handleBlockToggle={handleBlockToggle}
                handleDeleteUser={handleDeleteUser}
                fetchUsers={fetchUsers}
              />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <ChallengeAnalytics />
              <StoreAnalytics />
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <AdminTasks />
            </div>
          )}

          {activeTab === "store" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <AdminStore />
            </div>
          )}

          {activeTab === "broadcast" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <AdminBroadcast />
            </div>
          )}

          {activeTab === "audit" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <AdminAuditLogs />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
