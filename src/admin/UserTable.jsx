import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { RefreshCw, Eye, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminTableLoadingRow } from "./AdminSkeletons";

const UserTable = ({
  userList,
  tableLoading,
  currentUser,
  handleBlockToggle,
  handleDeleteUser,
  fetchUsers,
  userFilters,
  onUsersQueryChange,
}) => {
  const [searchValue, setSearchValue] = useState(userFilters?.search || "");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchValue(userFilters?.search || "");
  }, [userFilters?.search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if ((userFilters?.search || "") !== searchValue) {
        onUsersQueryChange?.({ search: searchValue });
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchValue, userFilters?.search, onUsersQueryChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [userFilters?.search, userFilters?.role, userFilters?.status]);

  const count = userList.length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return userList.slice(startIndex, startIndex + pageSize);
  }, [userList, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = count > 0 ? (page - 1) * pageSize + 1 : 0;
  const end = count > 0 ? Math.min(page * pageSize, count) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search username or email..."
            className="h-8 w-full min-w-0 sm:w-64 bg-white/[0.04] border-white/10 text-neutral-200 placeholder:text-neutral-500"
          />
          <select
            value={userFilters?.role || ""}
            onChange={(e) =>
              onUsersQueryChange?.({ role: e.target.value })
            }
            className="h-8 w-full sm:w-auto rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="staff">Staff</option>
            <option value="superuser">Superusers</option>
          </select>
          <select
            value={userFilters?.status || ""}
            onChange={(e) =>
              onUsersQueryChange?.({ status: e.target.value })
            }
            className="h-8 w-full sm:w-auto rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="h-8 w-full sm:w-auto rounded-md bg-white/[0.04] border border-white/10 text-neutral-300 text-xs px-2"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers(userFilters)}
          disabled={tableLoading}
          className="h-8 gap-2 bg-white/[0.04] border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors rounded-md"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="text-xs font-medium uppercase tracking-wider">
            {tableLoading ? "Refreshing..." : "Refresh"}
          </span>
        </Button>
      </div>

      <div className="rounded-lg border border-white/5 bg-[#0a0a0a] shadow-sm overflow-hidden">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent bg-white/[0.02]">
              <TableHead className="w-[80px] text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Avatar
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                User
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Role
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-neutral-400 py-3">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              [...Array(6)].map((_, i) => <AdminTableLoadingRow key={i} colSpan={5} />)
            ) : userList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-neutral-500 text-sm italic"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((usr) => (
                <TableRow
                  key={usr.username}
                  className="border-white/10 hover:bg-white/5 transition-colors group"
                >
                  <TableCell className="py-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-white/[0.04] border border-white/10 flex items-center justify-center">
                      {usr.profile?.avatar_url ? (
                        <img
                          src={usr.profile.avatar_url}
                          alt={usr.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-500">
                          {usr.username[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-neutral-100 tracking-tight">
                        {usr.username}
                        {currentUser.username === usr.username && (
                          <span className="ml-2 text-[10px] text-neutral-500 font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {usr.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      {usr.is_superuser ? (
                        <div className="px-2 py-0.5 rounded-md bg-red-500/5 text-red-500 border border-red-500/10 text-[10px] font-medium uppercase tracking-wider">
                          Admin
                        </div>
                      ) : usr.is_staff ? (
                        <div className="px-2 py-0.5 rounded-md bg-[#ffa116]/5 text-[#ffa116] border border-[#ffa116]/10 text-[10px] font-medium uppercase tracking-wider">
                          Staff
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-md bg-white/[0.04]/65 text-neutral-300 border border-white/10 text-[10px] font-medium uppercase tracking-wider">
                          User
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[11px] font-medium">
                    {usr.is_active ? (
                      <div className="flex items-center gap-1.5 text-[#00af9b]">
                        <div className="w-1 h-1 rounded-full bg-[#00af9b]" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <div className="w-1 h-1 rounded-full bg-neutral-600" />
                        Blocked
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Link to={`/profile/${usr.username}`} target="_blank">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlockToggle(usr.username)}
                        disabled={currentUser.username === usr.username}
                        className={`h-8 px-2 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-colors ${usr.is_active
                          ? "text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                          : "text-[#00af9b] hover:bg-[#00af9b]/5"
                          }`}
                      >
                        {usr.is_active ? "Block" : "Unblock"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(usr.username)}
                        disabled={currentUser.username === usr.username}
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-md"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
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
            className="h-7 px-2 border-white/10 bg-white/[0.04]/50 text-neutral-300 hover:text-white hover:bg-white/10"
            disabled={page <= 1 || tableLoading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </Button>
          <span className="text-neutral-400">
            Page {page} / {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 border-white/10 bg-white/[0.04]/50 text-neutral-300 hover:text-white hover:bg-white/10"
            disabled={page >= totalPages || tableLoading}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTable;
