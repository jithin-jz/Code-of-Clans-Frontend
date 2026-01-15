import React from 'react';
import Loader from '../common/Loader';
import { Users, RefreshCw, Gavel, Unlock } from 'lucide-react';

const UserTable = ({ userList, tableLoading, currentUser, handleBlockToggle, fetchUsers }) => {
    return (
        <div className="bg-[#1a1a1a]/90 backdrop-blur-md rounded-2xl border border-[#333] shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-[#333] flex items-center justify-between bg-linear-to-r from-[#202020] to-transparent">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Users className="text-[#ffd700]" size={24} /> 
                    <span>Realm Inhabitants</span>
                </h2>
                <button 
                    onClick={fetchUsers} 
                    className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-[#ffd700] text-sm font-bold rounded-lg border border-[#444] hover:border-[#ffd700] transition-all flex items-center gap-2 group"
                >
                    <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Refresh Intel</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-[#151515]">
                        <tr>
                            <th className="text-left text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Warrior</th>
                            <th className="text-left text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Rank</th>
                            <th className="text-left text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Status</th>
                            <th className="text-right text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-5">Command</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {tableLoading ? (
                            <tr><td colSpan="4" className="text-center py-12"><Loader isLoading={true}/></td></tr>
                        ) : userList.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-12 text-gray-500 font-medium">No inhabitants found in this realm.</td></tr>
                        ) : (
                            userList.map((usr, i) => (
                                <tr key={i} className="hover:bg-[#222] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#333] to-[#1a1a1a] p-0.5 border border-[#444] group-hover:border-[#ffd700]/50 transition-colors">
                                                <div className="w-full h-full rounded-[0.4rem] overflow-hidden flex items-center justify-center bg-[#111] text-[#ffd700] font-bold">
                                                    {usr.profile?.avatar_url ? <img src={usr.profile.avatar_url} className="w-full h-full object-cover"/> : usr.username[0].toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm group-hover:text-[#ffd700] transition-colors">{usr.username}</p>
                                                <p className="text-gray-600 text-xs font-mono">{usr.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex gap-2">
                                            {usr.is_superuser && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wide">Supreme Leader</span>}
                                            {usr.is_staff && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/20 uppercase tracking-wide">Elder</span>}
                                            {!usr.is_staff && !usr.is_superuser && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-gray-500/10 text-gray-500 border border-gray-500/20 uppercase tracking-wide">Member</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                            usr.is_active 
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                            {usr.is_active ? 'Active' : 'Banned'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button 
                                            onClick={() => handleBlockToggle(usr.username)}
                                            disabled={currentUser.username === usr.username} 
                                            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all border flex items-center gap-2 ml-auto ${
                                                currentUser.username === usr.username 
                                                    ? 'opacity-30 cursor-not-allowed bg-transparent border-gray-700 text-gray-500'
                                                    : usr.is_active 
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50' 
                                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                                            }`}
                                        >
                                            {usr.is_active ? <Gavel size={14}/> : <Unlock size={14}/>}
                                            <span>{usr.is_active ? 'Ban' : 'Unban'}</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
