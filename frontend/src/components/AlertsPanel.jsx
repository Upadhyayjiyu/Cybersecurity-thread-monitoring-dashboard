import React from 'react';
import { Bell, AlertTriangle, ShieldAlert, AlertOctagon, X } from 'lucide-react';

const getSeverityStyles = (severity) => {
  switch (severity) {
    case 'Critical': return 'bg-rose-500/10 border-rose-500/50 text-rose-400';
    case 'High': return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
    case 'Medium': return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
    default: return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'Critical': return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />;
    case 'High': return <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0" />;
    case 'Medium': return <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />;
    default: return <Bell className="w-5 h-5 text-blue-400 shrink-0" />;
  }
};

const AlertsPanel = ({ alerts }) => {
  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-73px)]">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" />
          Live Alerts
        </h2>
        {alerts.length > 0 && (
          <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            {alerts.length} New
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 text-sm">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-20" />
            No active alerts.<br/>System is secure.
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div 
              key={alert._id || idx} 
              className={`p-3 rounded-lg border flex gap-3 shadow-lg transition-all animate-in slide-in-from-right-4 ${getSeverityStyles(alert.severity)}`}
            >
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm">{alert.type}</h4>
                  <span className="text-[10px] opacity-70">
                    {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">{alert.message}</p>
                {alert.ipAddress && (
                  <div className="mt-2 text-[10px] font-mono bg-black/20 px-1.5 py-0.5 rounded inline-block">
                    IP: {alert.ipAddress}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
