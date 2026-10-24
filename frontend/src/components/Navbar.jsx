import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md z-10">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          CyberThreat SOC
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm">
          <span className="text-slate-400">Logged in as: </span>
          <span className="font-semibold text-slate-200">{user?.username}</span>
          <span className="ml-2 px-2 py-0.5 rounded text-xs bg-slate-800 text-cyan-400 border border-slate-700">
            {user?.role}
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
