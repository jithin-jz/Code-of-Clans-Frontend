import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";
import { AdminPageSkeleton } from "./AdminSkeletons";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Shield } from "lucide-react";

// Components
import AdminSidebar from "./AdminSidebar";
import UserTable from "./UserTable";
import AdminTasks from "./AdminTasks";
import Analytics from "./analytics";
import AdminBroadcast from "./AdminBroadcast";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminStore from "./AdminStore";
import AppBackdrop from "../components/AppBackdrop";

const normalizeText = (value) => String(value || "").toLowerCase();
const validAdminTabs = new Set([
  "users",
  "analytics",
  "tasks",
  "store",
  "broadcast",
  "audit",
]);

const userMatchesQuery = (user, query) => {
  const search = normalizeText(query?.search).trim();
  if (search) {
    const searchable = [
      user?.username,
      user?.email,
      user?.first_name,
      user?.last_name,
    ]
      .map(normalizeText)
      .join(" ");
    if (!searchable.includes(search)) {
      return false;
    }
  }

  const role = normalizeText(query?.role).trim();
  if (role === "superuser" && !user?.is_superuser) return false;
  if (role === "staff" && (!user?.is_staff || user?.is_superuser)) return false;
  if (role === "user" && (user?.is_staff || user?.is_superuser)) return false;

  const status = normalizeText(query?.status).trim();
  if (status === "active" && !user?.is_active) return false;
  if (status === "blocked" && user?.is_active) return false;

  return true;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("admin_active_tab");
    return validAdminTabs.has(savedTab) ? savedTab : "users";
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
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    status: "",
  });
  const [integrity, setIntegrity] = useState(null);
  const usersRequestRef = useRef(0);

  useEffect(() => {
    const verifyAdmin = async () => {
      await checkAuth();
      setLoading(false);
    };
    verifyAdmin();
  }, [checkAuth]);

  /* eslint-disable react-hooks/exhaustive-deps */
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
  }, [loading, isAuthenticated, user, navigate, activeTab]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchUsers = async (queryOverrides = {}) => {
    const query = { ...userFilters, ...queryOverrides };
    setUserFilters(query);
    setTableLoading(true);
    const requestId = ++usersRequestRef.current;
    try {
      const pageSize = 100;
      const response = await authAPI.getUsers({
        ...query,
        page: 1,
        page_size: pageSize,
      });
      if (requestId !== usersRequestRef.current) return;
      const payload = response.data;

      if (Array.isArray(payload)) {
        const filtered = payload.filter((row) => userMatchesQuery(row, query));
        setUserList(filtered);
      } else {
        let results = payload?.results || [];
        const totalPages = Number(payload?.total_pages || 1);

        if (totalPages > 1) {
          const pageRequests = [];
          for (
            let currentPage = 2;
            currentPage <= totalPages;
            currentPage += 1
          ) {
            pageRequests.push(
              authAPI.getUsers({
                ...query,
                page: currentPage,
                page_size: pageSize,
              }),
            );
          }
          const extraPages = await Promise.all(pageRequests);
          if (requestId !== usersRequestRef.current) return;
          for (const pageResponse of extraPages) {
            const pagePayload = pageResponse.data;
            if (Array.isArray(pagePayload)) {
              results = results.concat(pagePayload);
            } else {
              results = results.concat(pagePayload?.results || []);
            }
          }
        }

        const filteredResults = results.filter((row) =>
          userMatchesQuery(row, query),
        );
        setUserList(filteredResults);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      if (requestId === usersRequestRef.current) {
        setTableLoading(false);
      }
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
      description: `Are you sure you want to ${action} the user ${username}?`,
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

  const handleUsersQueryChange = (changes) => {
    fetchUsers(changes);
  };

  const handleLogout = async () => {
    localStorage.removeItem("admin_active_tab");
    await logout();
    navigate("/login");
  };

  if (loading) return <AdminPageSkeleton />;
  if (!user?.is_staff && !user?.is_superuser) return <AdminPageSkeleton />;

  return (
    <div className="relative h-screen overflow-hidden bg-background font-sans antialiased text-foreground">
      <AppBackdrop />
      <div className="relative z-10 flex h-full flex-col md:flex-row">
        <AdminSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />

        <main className="flex-1 min-h-0 h-full overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {activeTab === "users" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="app-panel flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-100">
                            System Overview
                          </h3>
                          <Badge
                            variant="outline"
                            className="h-5 border-cyan-300/25 bg-cyan-400/10 text-[9px] font-medium uppercase tracking-wider text-cyan-200"
                          >
                            Operational
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mt-6">
                          <div className="rounded-lg border border-border/70 bg-secondary/45 p-3 text-center">
                            <p className="mb-1 text-[9px] font-semibold uppercase text-slate-500">
                              Users
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-100">
                              {integrity?.users || 0}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border/70 bg-secondary/45 p-3 text-center">
                            <p className="mb-1 text-[9px] font-semibold uppercase text-slate-500">
                              Sessions
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-100">
                              {rawStats.active_sessions || 0}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border/70 bg-secondary/45 p-3 text-center">
                            <p className="mb-1 text-[9px] font-semibold uppercase text-slate-500">
                              Challenges
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-100">
                              {integrity?.challenges || 0}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border/70 bg-secondary/45 p-3 text-center">
                            <p className="mb-1 text-[9px] font-semibold uppercase text-slate-500">
                              Inventory
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-100">
                              {integrity?.store_items || 0}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border/70 bg-secondary/45 p-3 text-center">
                            <p className="mb-1 text-[9px] font-semibold uppercase text-slate-500">
                              Audit Logs
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-100">
                              {integrity?.audit_logs || 0}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border/70 bg-secondary/45 p-3 text-center">
                            <p className="mb-1 text-[9px] font-semibold uppercase text-slate-500">
                              XP Spent
                            </p>
                            <p className="text-xl font-bold tracking-tight text-slate-100">
                              {rawStats.total_gems || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="text-cyan-300" size={12} />
                          <span className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                            Real-time synchronization active
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("audit")}
                          className="h-7 rounded-md px-3 text-[9px] font-medium uppercase tracking-wider text-slate-400 hover:bg-slate-800/65 hover:text-white"
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
                  userFilters={userFilters}
                  onUsersQueryChange={handleUsersQueryChange}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <Analytics />
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
    </div>
  );
};

export default AdminDashboard;
