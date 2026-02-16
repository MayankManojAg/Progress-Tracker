
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  accentColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  colorClass = "text-indigo-600",
  accentColor = "bg-indigo-50"
}) => {
  return (
    <div className="group relative bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 ${accentColor} opacity-20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700`}></div>
      
      <div className="relative flex flex-col gap-4">
        <div className={`w-12 h-12 rounded-2xl ${accentColor} ${colorClass} flex items-center justify-center shadow-inner`}>
          {icon}
        </div>
        <div>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em] mb-1">{title}</p>
          <h3 className={`text-3xl font-black tracking-tight ${colorClass}`}>{value}</h3>
          {subtitle && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-slate-300 text-xs font-medium">Historical best:</span>
              <span className={`text-xs font-bold ${colorClass} opacity-80`}>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
