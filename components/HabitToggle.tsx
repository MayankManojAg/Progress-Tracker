
import React from 'react';
import { Check, X } from 'lucide-react';

interface HabitToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

const HabitToggle: React.FC<HabitToggleProps> = ({ value, onChange }) => {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all duration-300 transform active:scale-95 shadow-sm border ${
        value 
          ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-100' 
          : 'bg-rose-500 text-white border-rose-400 shadow-rose-100'
      }`}
    >
      <div className="flex items-center justify-center">
        {value ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
      </div>
      {value ? 'YES' : 'NO'}
    </button>
  );
};

export default HabitToggle;
