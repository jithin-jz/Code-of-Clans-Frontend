import React, { useState, useEffect } from "react";
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
import { Loader2, History, User as UserIcon, Settings } from "lucide-react";
import { authAPI } from "../services/api";
import { notify } from "../services/notification";
import { formatDistanceToNow } from "date-fns";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getAuditLogs();
      setLogs(response.data);
    } catch {
      notify.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "TOGGLE_USER_BLOCK":
        return (
          <Badge
            variant="outline"
            className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[9px] uppercase tracking-wider"
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
            className="bg-zinc-900 border-zinc-800 text-zinc-400 text-[9px] uppercase tracking-wider"
          >
            Broadcast
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-zinc-800 border-zinc-700 text-zinc-400 text-[9px] uppercase tracking-wider"
          >
            System
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Audit Logs
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          className="h-8 gap-2 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-md"
        >
          <Loader2 className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="text-xs font-medium">Refresh</span>
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3 px-6">
                Admin
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Action
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Subject
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3 w-1/3">
                Details
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3 px-6">
                Timestamp
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-700" />
                    <span className="text-xs font-medium text-zinc-600 uppercase tracking-widest">
                      Loading...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-600 text-xs italic"
                >
                  No logs recorded.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow
                  key={idx}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors group"
                >
                  <TableCell className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                        {log.admin[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white tracking-tight">
                        {log.admin}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="py-3 text-zinc-300">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <UserIcon size={12} className="text-zinc-600" />
                      {log.target}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 Transition-all truncate max-w-xs">
                    {JSON.stringify(log.details)}
                  </TableCell>
                  <TableCell className="text-right py-3 px-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-medium text-zinc-300">
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-mono uppercase">
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
      <div className="flex items-center gap-2 px-1">
        <div className="w-1 h-1 rounded-full bg-[#00af9b]/30" />
        <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-wider">
          Audit records are immutable.
        </p>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
