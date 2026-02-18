import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { RefreshCw, User as UserIcon } from "lucide-react";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";
import { formatDistanceToNow } from "date-fns";
import { AdminTableLoadingRow } from "./AdminSkeletons";

const sortLogs = (rows, ordering) => {
  const items = [...rows];
  const byTimestamp = (a, b) =>
    new Date(a?.timestamp || 0).getTime() - new Date(b?.timestamp || 0).getTime();
  const byAction = (a, b) =>
    String(a?.action || "").localeCompare(String(b?.action || ""));

  if (ordering === "timestamp") {
    items.sort((a, b) => byTimestamp(a, b) || byAction(a, b));
  } else if (ordering === "-timestamp") {
    items.sort((a, b) => byTimestamp(b, a) || byAction(a, b));
  } else if (ordering === "action") {
    items.sort((a, b) => byAction(a, b) || byTimestamp(b, a));
  } else if (ordering === "-action") {
    items.sort((a, b) => byAction(b, a) || byTimestamp(b, a));
  }
  return items;
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({
    page: 1,
    page_size: 25,
    search: "",
    action: "",
    ordering: "-timestamp",
  });
  const [searchValue, setSearchValue] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    page_size: 25,
    total_pages: 1,
  });
  const requestRef = useRef(0);
  const queryRef = useRef(query);

  const fetchLogs = useCallback(async (overrides = {}) => {
    const nextQuery = { ...queryRef.current, ...overrides };
    queryRef.current = nextQuery;
    setQuery(nextQuery);
    setLoading(true);
    const requestId = ++requestRef.current;
    try {
      const response = await authAPI.getAuditLogs(nextQuery);
      if (requestId !== requestRef.current) return;
      const payload = response.data;
      if (Array.isArray(payload)) {
        setLogs(sortLogs(payload, nextQuery.ordering));
        setPagination({
          count: payload.length,
          page: 1,
          page_size: payload.length || nextQuery.page_size,
          total_pages: 1,
        });
      } else {
        const results = payload?.results || [];
        setLogs(sortLogs(results, nextQuery.ordering));
        setPagination({
          count: payload?.count ?? results.length,
          page: payload?.page ?? nextQuery.page,
          page_size: payload?.page_size ?? nextQuery.page_size,
          total_pages: payload?.total_pages ?? 1,
        });
      }
    } catch {
      notify.error("Failed to fetch audit logs");
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== query.search) {
        fetchLogs({ search: searchValue, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchValue, query.search, fetchLogs]);

  const getActionBadge = (action) => {
    switch (action) {
      case "TOGGLE_USER_BLOCK":
        return (
          <Badge
            variant="outline"
            className="bg-[#162338]/60 border-white/10 text-slate-300 text-[9px] uppercase tracking-wider"
          >
            Moderation
          </Badge>
        );
      case "DELETE_USER":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 border-red-500/20 text-red-400 text-[9px] uppercase tracking-wider"
          >
            Deletion
          </Badge>
        );
      case "SEND_GLOBAL_NOTIFICATION":
        return (
          <Badge
            variant="outline"
            className="bg-[#162338]/60 border-white/10 text-slate-300 text-[9px] uppercase tracking-wider"
          >
            Broadcast
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-[#162338]/60 border-white/10 text-slate-400 text-[9px] uppercase tracking-wider"
          >
            System
          </Badge>
        );
    }
  };

  const renderDetails = (details) => {
    if (!details) return "-";
    if (typeof details === "string") return details;

    if (details.before || details.after) {
      const beforeState = details.before?.is_active;
      const afterState = details.after?.is_active;
      if (typeof beforeState === "boolean" && typeof afterState === "boolean") {
        return `is_active: ${beforeState} -> ${afterState}`;
      }
    }

    return JSON.stringify(details);
  };

  const page = pagination.page || 1;
  const pageSize = pagination.page_size || 25;
  const totalPages = pagination.total_pages || 1;
  const count = pagination.count || 0;
  const start = count > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = count > 0 ? Math.min(page * pageSize, count) : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
            Audit Logs
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(query)}
            disabled={loading}
            className="h-8 gap-2 bg-[#162338]/50 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors rounded-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search action/admin/target/request id..."
            className="h-8 w-full sm:w-80 bg-[#162338]/50 border-white/10 text-slate-200 placeholder:text-slate-500"
          />
          <select
            value={query.action || ""}
            onChange={(e) => fetchLogs({ action: e.target.value, page: 1 })}
            className="h-8 rounded-md bg-[#162338]/50 border border-white/10 text-slate-300 text-xs px-2"
          >
            <option value="">All Actions</option>
            <option value="TOGGLE_USER_BLOCK">Toggle User Block</option>
            <option value="DELETE_USER">Delete User</option>
            <option value="SEND_GLOBAL_NOTIFICATION">Broadcast</option>
          </select>
          <select
            value={query.ordering || "-timestamp"}
            onChange={(e) => fetchLogs({ ordering: e.target.value, page: 1 })}
            className="h-8 rounded-md bg-[#162338]/50 border border-white/10 text-slate-300 text-xs px-2"
          >
            <option value="-timestamp">Newest</option>
            <option value="timestamp">Oldest</option>
            <option value="action">Action A-Z</option>
            <option value="-action">Action Z-A</option>
          </select>
          <select
            value={String(query.page_size || 25)}
            onChange={(e) =>
              fetchLogs({ page_size: Number(e.target.value), page: 1 })
            }
            className="h-8 rounded-md bg-[#162338]/50 border border-white/10 text-slate-300 text-xs px-2"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-[#7ea3d9]/20 bg-[#0f1b2e]/70 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent bg-[#111d30]/85">
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-slate-400 py-3 px-6">
                Admin
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-slate-400 py-3">
                Action
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-slate-400 py-3">
                Subject
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-slate-400 py-3 w-1/3">
                Details
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-slate-400 py-3 px-6">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <AdminTableLoadingRow colSpan={5} rows={8} />
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500 text-xs italic"
                >
                  No logs recorded.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow
                  key={
                    log.request_id ||
                    `${log.timestamp}-${log.admin}-${log.action}-${log.target}-${idx}`
                  }
                  className="border-white/10 hover:bg-white/5 transition-colors group"
                >
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#162338] border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {log.admin[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-100 tracking-tight">
                        {log.admin}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="py-3 text-slate-300">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <UserIcon size={12} className="text-slate-500" />
                      {log.target}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-all truncate max-w-xs">
                    {renderDetails(log.details)}
                  </TableCell>
                  <TableCell className="text-right py-3 px-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-medium text-slate-300">
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono uppercase">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {start}-{end} of {count}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 border-white/10 bg-[#162338]/50 text-slate-300 hover:text-white hover:bg-white/10"
            disabled={page <= 1 || loading}
            onClick={() => fetchLogs({ page: page - 1 })}
          >
            Prev
          </Button>
          <span className="text-slate-400">
            Page {page} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 border-white/10 bg-[#162338]/50 text-slate-300 hover:text-white hover:bg-white/10"
            disabled={page >= totalPages || loading}
            onClick={() => fetchLogs({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-1 rounded-full bg-[#00af9b]/30" />
        <p className="text-[9px] text-slate-600 font-medium uppercase tracking-wider">
          Audit records are immutable.
        </p>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
