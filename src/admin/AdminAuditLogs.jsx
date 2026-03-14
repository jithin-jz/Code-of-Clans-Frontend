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
    new Date(a?.timestamp || 0).getTime() -
    new Date(b?.timestamp || 0).getTime();
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
            className="bg-white/[0.04] border-white/10 text-neutral-300 text-[9px] uppercase tracking-wider"
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
            className="bg-white/[0.04] border-white/10 text-neutral-300 text-[9px] uppercase tracking-wider"
          >
            Broadcast
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-white/[0.04] border-white/10 text-neutral-400 text-[9px] uppercase tracking-wider"
          >
            System
          </Badge>
        );
    }
  };

  const renderDetails = (details) => {
    if (!details) return "-";
    if (typeof details === "string") return details;

    if (details.before !== undefined || details.after !== undefined) {
      const beforeState = details.before?.is_active ?? details.before;
      const afterState = details.after?.is_active ?? details.after;
      if (beforeState !== undefined && afterState !== undefined) {
        return `Changed: ${JSON.stringify(beforeState)} -> ${JSON.stringify(afterState)}`;
      }
    }

    if (details.message) return details.message;
    if (details.reason) return details.reason;

    const entries = Object.entries(details);
    if (entries.length > 0) {
      return entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold text-neutral-100 tracking-tight">
            Audit Logs
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(query)}
            disabled={loading}
            className="h-8 gap-2 bg-white/[0.04] border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors rounded-md"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search action/admin/target/request id..."
            className="h-8 w-full sm:w-80 bg-white/[0.04] border-white/10 text-neutral-200 placeholder:text-neutral-500"
          />
          <select
            value={query.action || ""}
            onChange={(e) => fetchLogs({ action: e.target.value, page: 1 })}
            className="h-8 w-full sm:w-auto rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
          >
            <option value="">All Actions</option>
            <option value="TOGGLE_USER_BLOCK">Toggle User Block</option>
            <option value="DELETE_USER">Delete User</option>
            <option value="SEND_GLOBAL_NOTIFICATION">Broadcast</option>
          </select>
          <select
            value={query.ordering || "-timestamp"}
            onChange={(e) => fetchLogs({ ordering: e.target.value, page: 1 })}
            className="h-8 w-full sm:w-auto rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
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
            className="h-8 w-full sm:w-auto rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#0a0a0a] shadow-sm overflow-hidden">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.02]">
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3 px-6">
                Admin
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Action
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Subject
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3 w-1/3">
                Details
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3 px-6">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <AdminTableLoadingRow key={i} colSpan={5} />
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-neutral-500 text-xs italic"
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
                      <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                        {log.admin ? log.admin[0].toUpperCase() : "S"}
                      </div>
                      <span className="text-sm font-medium text-neutral-100 tracking-tight">
                        {log.admin || "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="py-3 text-neutral-300">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <UserIcon size={12} className="text-neutral-500" />
                      {log.target}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[10px] font-mono text-neutral-500 group-hover:text-neutral-300 transition-all">
                    <div
                      className="max-w-xs truncate"
                      title={JSON.stringify(log.details)}
                    >
                      {renderDetails(log.details)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-3 px-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-medium text-neutral-300">
                        {log.timestamp
                          ? formatDistanceToNow(new Date(log.timestamp), {
                              addSuffix: true,
                            })
                          : "Unknown"}
                      </span>
                      <span className="text-[9px] text-neutral-600 font-mono uppercase">
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-neutral-500">
        <span>
          Showing {start}-{end} of {count}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/10"
            disabled={page <= 1 || loading}
            onClick={() => fetchLogs({ page: page - 1 })}
          >
            Prev
          </Button>
          <span className="text-neutral-400">
            Page {page} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/10"
            disabled={page >= totalPages || loading}
            onClick={() => fetchLogs({ page: page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-1 rounded-full bg-[#00af9b]/30" />
        <p className="text-[9px] text-neutral-600 font-medium uppercase tracking-wider">
          Audit records are immutable.
        </p>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
