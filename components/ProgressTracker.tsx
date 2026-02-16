
import React from 'react';

interface ProgressTrackerProps {
  completedDays: number;
  totalDays: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completedDays, totalDays }) => {
  const percentage = Math.min(100, Math.round((completedDays / totalDays) * 100));
  
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 w-full relative overflow-hidden group">
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h3 className="font-black text-slate-900 text-2xl tracking-tight mb-1">Strategic Progression</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Year to Date Compliance</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-4xl font-black text-indigo-600">{percentage}%</span>
          <p className="text-[10px] font-black text-slate-300 uppercase">{completedDays} / {totalDays} LOGS</p>
        </div>
      </div>
      
      <div className="relative h-4 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 group-hover:h-6 transition-all duration-500">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600 bg-[length:200%_100%] transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
        </div>
      </div>

      <div className="flex justify-between mt-6 text-[10px] font-black text-slate-300 tracking-widest uppercase">
        <div className="flex flex-col gap-1">
          <span>Phase 01</span>
          <div className="w-px h-2 bg-slate-200 mx-auto"></div>
        </div>
        <div className="flex flex-col gap-1 opacity-50">
          <span>Phase 02</span>
          <div className="w-px h-2 bg-slate-200 mx-auto"></div>
        </div>
        <div className="flex flex-col gap-1 opacity-50">
          <span>Phase 03</span>
          <div className="w-px h-2 bg-slate-200 mx-auto"></div>
        </div>
        <div className="flex flex-col gap-1">
          <span>Final Orbit</span>
          <div className="w-px h-2 bg-slate-200 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
