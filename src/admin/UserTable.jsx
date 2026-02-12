import React from "react";
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
import {
  RefreshCw,
  Eye,
  Shield,
  Ban,
  CheckCircle,
  Loader2,
  Trash,
} from "lucide-react";
import { Link } from "react-router-dom";

const UserTable = ({
  userList,
  tableLoading,
  currentUser,
  handleBlockToggle,
  handleDeleteUser,
  fetchUsers,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={tableLoading}
          className="h-8 gap-2 bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors rounded-md"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${tableLoading ? "animate-spin" : ""}`}
          />
          <span className="text-xs font-medium uppercase tracking-wider">
            Refresh
          </span>
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
              <TableHead className="w-[80px] text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Avatar
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                User
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Role
              </TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Status
              </TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500 py-3">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
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
            ) : userList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-zinc-500 text-sm italic"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              userList.map((usr) => (
                <TableRow
                  key={usr.username}
                  className="border-zinc-800 hover:bg-zinc-900/40 transition-colors group"
                >
                  <TableCell className="py-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      {usr.profile?.avatar_url ? (
                        <img
                          src={usr.profile.avatar_url}
                          alt={usr.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-600">
                          {usr.username[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white tracking-tight">
                        {usr.username}
                        {currentUser.username === usr.username && (
                          <span className="ml-2 text-[10px] text-zinc-500 font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-zinc-500">
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
                        <div className="px-2 py-0.5 rounded-md bg-amber-500/5 text-amber-500 border border-amber-500/10 text-[10px] font-medium uppercase tracking-wider">
                          Staff
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-medium uppercase tracking-wider">
                          User
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-[11px] font-medium">
                    {usr.is_active ? (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
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
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md"
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
                        className={`h-8 px-2 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-colors ${
                          usr.is_active
                            ? "text-zinc-400 hover:text-red-500 hover:bg-red-500/5"
                            : "text-emerald-500 hover:bg-emerald-500/5"
                        }`}
                      >
                        {usr.is_active ? "Block" : "Unblock"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(usr.username)}
                        disabled={currentUser.username === usr.username}
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-md"
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
    </div>
  );
};

export default UserTable;
