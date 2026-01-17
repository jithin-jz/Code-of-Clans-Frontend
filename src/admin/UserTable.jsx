import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { RefreshCw, Eye, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserTable = ({ userList, tableLoading, currentUser, handleBlockToggle, fetchUsers }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white tracking-tight">Users</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchUsers}
                    disabled={tableLoading}
                    className="h-8 gap-2 border-white/10 text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${tableLoading ? 'animate-spin' : ''}`} />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Refresh</span>
                </Button>
            </div>
            
            <div className="rounded-md border border-white/10 bg-[#0a0a0a]">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-[80px] text-gray-400">Avatar</TableHead>
                            <TableHead className="text-gray-400">Username</TableHead>
                            <TableHead className="text-gray-400">Role</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400"/>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : userList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            userList.map((usr) => (
                                <TableRow key={usr.username} className="border-white/10 hover:bg-[#1a1a1a]">
                                    <TableCell>
                                        <div className="h-9 w-9 rounded-sm overflow-hidden bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                                             {usr.profile?.avatar_url ? (
                                                <img src={usr.profile.avatar_url} alt={usr.username} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">{usr.username[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">
                                        <div className="flex flex-col">
                                            <span>{usr.username}</span>
                                            <span className="text-xs text-gray-500 font-normal">{usr.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {usr.is_superuser ? (
                                                <Badge variant="destructive" className="bg-red-900/20 text-red-400 hover:bg-red-900/30 border-red-900/50">Admin</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-white/5 text-gray-400 hover:bg-white/10 border-white/10">User</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                         <Badge 
                                            variant="outline" 
                                            className={`
                                                ${usr.is_active 
                                                    ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' 
                                                    : 'border-red-500/20 text-red-500 bg-red-500/10'}
                                            `}
                                        >
                                            {usr.is_active ? 'Active' : 'Blocked'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                            >
                                                <Link to={`/profile/${usr.username}`} target="_blank">
                                                    <span className="sr-only">View</span>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleBlockToggle(usr.username)}
                                                disabled={currentUser.username === usr.username}
                                                className={`h-8 px-2 text-xs ${
                                                    usr.is_active 
                                                        ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                                                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20'
                                                }`}
                                            >
                                                {usr.is_active ? 'Block' : 'Unblock'}
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
