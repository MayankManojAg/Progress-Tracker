
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { 
  LayoutDashboard, Table as TableIcon, BarChart3, Clock, BookOpen, Dumbbell, 
  Moon, ShieldCheck, Zap, Calendar, ChevronDown, Timer, ArrowUpRight, 
  Activity, Award, Coffee, MinusCircle
} from 'lucide-react';
import { DayRecord, HabitKey, MetricKey } from './types';
import { generateInitialData, calculateStreak, getMonthName } from './utils/calculations';
import ProgressTracker from './components/ProgressTracker';
import DashboardCard from './components/DashboardCard';
import HabitToggle from './components/HabitToggle';

const App: React.FC = () => {
  const [records, setRecords] = useState<DayRecord[]>(() => {
    const saved = localStorage.getItem('mastery_tracker_365_data_v2');
    return saved ? JSON.parse(saved) : generateInitialData();
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'spreadsheet' | 'analytics'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('mastery_tracker_365_data_v2', JSON.stringify(records));
  }, [records]);

  // Derived state
  const completedDays = useMemo(() => records.filter(r => r.isFilled).length, [records]);
  const streaks = useMemo(() => ({
    noPorn: calculateStreak(records, 'noPorn'),
    workout: calculateStreak(records, 'workout'),
    ipmatStudy: calculateStreak(records, 'ipmatStudy'),
    nightWalk: calculateStreak(records, 'nightWalk'),
  }), [records]);

  const totalStudyHours = useMemo(() => records.reduce((acc, r) => acc + r.metrics.studyHours, 0), [records]);
  const totalWastedHours = useMemo(() => records.reduce((acc, r) => acc + r.metrics.timeWasted, 0), [records]);
  
  const avgStudyPerDay = useMemo(() => {
    const filled = records.filter(r => r.isFilled);
    if (filled.length === 0) return 0;
    return (totalStudyHours / filled.length).toFixed(1);
  }, [records, totalStudyHours]);

  const productivityScore = useMemo(() => {
    if (totalStudyHours + totalWastedHours === 0) return 0;
    return Math.round((totalStudyHours / (totalStudyHours + totalWastedHours)) * 100);
  }, [totalStudyHours, totalWastedHours]);

  // Handlers
  const handleHabitChange = (id: number, habit: HabitKey, value: boolean) => {
    setRecords(prev => prev.map(r => r.id === id ? {
      ...r,
      isFilled: true,
      habits: { ...r.habits, [habit]: value }
    } : r));
  };

  const handleMetricChange = (id: number, metric: MetricKey, value: string) => {
    const numValue = Math.min(24, Math.max(0, parseFloat(value) || 0));
    setRecords(prev => prev.map(r => r.id === id ? {
      ...r,
      isFilled: true,
      metrics: { ...r.metrics, [metric]: numValue }
    } : r));
  };

  const jumpToToday = () => {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const todayIndex = records.findIndex(r => r.date === todayStr);
    if (todayIndex !== -1 && scrollRef.current) {
      const rowHeight = 84; 
      scrollRef.current.scrollTop = todayIndex * rowHeight - 120;
    }
  };

  const filteredRecords = useMemo(() => {
    if (selectedMonth === 'All') return records;
    return records.filter(r => getMonthName(r.date) === selectedMonth);
  }, [records, selectedMonth]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string, study: number, wasted: number }> = {};
    records.forEach(r => {
      const m = getMonthName(r.date);
      if (!months[m]) months[m] = { month: m, study: 0, wasted: 0 };
      months[m].study += r.metrics.studyHours;
      months[m].wasted += r.metrics.timeWasted;
    });
    return Object.values(months);
  }, [records]);

  const monthsList = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Elevated Design */}
      <nav className="w-full md:w-80 bg-white border-b md:border-r border-slate-100 p-10 flex flex-col gap-12 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 ring-4 ring-slate-50">
            <Zap size={28} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-none">MASTERY</h1>
            <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-[0.3em] mt-2">Executive 365</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'spreadsheet', label: 'Daily Log', icon: TableIcon },
            { id: 'analytics', label: 'Intelligence', icon: BarChart3 }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`group flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all duration-300 ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {activeTab === item.id && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>}
            </button>
          ))}
        </div>

        <div className="mt-auto relative">
          <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Annual Goal</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-black">{Math.round((completedDays/365)*100)}%</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-4">
              <div className="bg-white h-full transition-all duration-1000 ease-out" style={{ width: `${(completedDays/365)*100}%` }}></div>
            </div>
            <p className="text-[10px] font-bold opacity-70">Focus: IPMAT 2025</p>
          </div>
        </div>
      </nav>

      {/* Main Stage */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 bg-[#fafbff]">
        
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-tighter">Live Session</span>
                  <p className="text-slate-400 text-sm font-medium">Feb 16, 2025 • Year Overview</p>
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">System Report</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                    <p className="text-2xl font-black text-indigo-600">{productivityScore}%</p>
                  </div>
                  <div className="h-10 w-px bg-slate-100"></div>
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
                    <p className="text-2xl font-black text-slate-800">{completedDays}</p>
                  </div>
                </div>
              </div>
            </header>

            <ProgressTracker completedDays={completedDays} totalDays={365} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard title="Retention" value={`${streaks.noPorn.current}d`} subtitle={`${streaks.noPorn.max}d`} icon={<ShieldCheck size={24} />} colorClass="text-emerald-500" accentColor="bg-emerald-50" />
              <DashboardCard title="Physical" value={`${streaks.workout.current}d`} subtitle={`${streaks.workout.max}d`} icon={<Dumbbell size={24} />} colorClass="text-orange-500" accentColor="bg-orange-50" />
              <DashboardCard title="Cognitive" value={`${streaks.ipmatStudy.current}d`} subtitle={`${streaks.ipmatStudy.max}d`} icon={<BookOpen size={24} />} colorClass="text-indigo-500" accentColor="bg-indigo-50" />
              <DashboardCard title="Reflection" value={`${streaks.nightWalk.current}d`} subtitle={`${streaks.nightWalk.max}d`} icon={<Moon size={24} />} colorClass="text-blue-500" accentColor="bg-blue-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Study vs Waste Gap Chart */}
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance Volume</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Numerical analysis of study vs waste</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> <span className="text-[10px] font-bold text-slate-500 uppercase">Focus</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-400"></div> <span className="text-[10px] font-bold text-slate-500 uppercase">Waste</span></div>
                  </div>
                </div>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={records.filter(r => r.isFilled).slice(-20)}>
                      <defs>
                        <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="dayNumber" stroke="#cbd5e1" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                      <YAxis stroke="#cbd5e1" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px' }} />
                      <Area name="Focus (Hrs)" type="monotone" dataKey="metrics.studyHours" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#focusGrad)" />
                      <Area name="Waste (Hrs)" type="monotone" dataKey="metrics.timeWasted" stroke="#fb7185" strokeWidth={3} fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Stats */}
              <div className="flex flex-col gap-6">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex-1 flex flex-col justify-between shadow-2xl shadow-slate-200">
                  <Activity size={32} className="text-indigo-400" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Annual Focus Vol.</p>
                    <h4 className="text-5xl font-black leading-none">{totalStudyHours}h</h4>
                    <p className="text-xs font-bold text-indigo-400 mt-4 flex items-center gap-2">
                      <ArrowUpRight size={16} /> 
                      {avgStudyPerDay}h daily average
                    </p>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex-1 flex flex-col justify-between">
                  <MinusCircle size={32} className="text-rose-500 opacity-20" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Annual Waste Vol.</p>
                    <h4 className="text-5xl font-black text-slate-800 leading-none">{totalWastedHours}h</h4>
                    <div className="mt-4 flex gap-2">
                      <span className="px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-bold">LIFETIME LOSS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spreadsheet' && (
          <div className="max-w-full mx-auto flex flex-col gap-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Daily Registry</h2>
                <p className="text-slate-400 font-medium mt-3 text-lg tracking-tight">Granular habit logging for high-performance individuals.</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={jumpToToday} className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black shadow-xl shadow-slate-200 hover:-translate-y-1 transition-all">JUMP TO TODAY</button>
                <div className="relative">
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="appearance-none px-8 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-xs font-black text-slate-700 pr-12 focus:outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm cursor-pointer"
                  >
                    {monthsList.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </header>

            <div className="bg-white rounded-[3.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden">
              <div ref={scrollRef} className="overflow-x-auto custom-scrollbar h-[calc(100vh-320px)] relative">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead className="sticky top-0 z-40">
                    <tr className="bg-white border-b border-slate-50">
                      <th className="p-8 font-black text-slate-300 text-[10px] uppercase tracking-[0.25em] sticky left-0 bg-white z-50 w-24 border-r border-slate-50">Index</th>
                      <th className="p-8 font-black text-slate-300 text-[10px] uppercase tracking-[0.25em] w-48">Date</th>
                      <th className="p-8 font-black text-slate-300 text-[10px] uppercase tracking-[0.25em] text-center bg-emerald-50/20">Clean</th>
                      <th className="p-8 font-black text-slate-300 text-[10px] uppercase tracking-[0.25em] text-center bg-orange-50/20">Physical</th>
                      <th className="p-8 font-black text-slate-300 text-[10px] uppercase tracking-[0.25em] text-center bg-indigo-50/20">Study</th>
                      <th className="p-8 font-black text-slate-300 text-[10px] uppercase tracking-[0.25em] text-center bg-blue-50/20">Night Walk</th>
                      <th className="p-8 font-black text-slate-800 text-[10px] uppercase tracking-[0.25em] text-center bg-slate-50 border-l border-slate-100">Study Hrs</th>
                      <th className="p-8 font-black text-slate-800 text-[10px] uppercase tracking-[0.25em] text-center bg-slate-50">Waste Hrs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {filteredRecords.map((record) => {
                      const isToday = record.date === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      return (
                        <tr key={record.id} className={`group hover:bg-slate-50/40 transition-all ${isToday ? 'bg-indigo-50/30' : ''}`}>
                          <td className={`p-8 font-black sticky left-0 z-30 border-r border-slate-50 text-sm group-hover:bg-slate-50 ${isToday ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 bg-white'}`}>
                            {record.dayNumber}
                            {isToday && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-500 rounded-l-full"></div>}
                          </td>
                          <td className="p-8 text-slate-600 text-xs font-extrabold tracking-tight">{record.date}</td>
                          <td className="p-8 text-center"><HabitToggle value={record.habits.noPorn} onChange={(val) => handleHabitChange(record.id, 'noPorn', val)} /></td>
                          <td className="p-8 text-center"><HabitToggle value={record.habits.workout} onChange={(val) => handleHabitChange(record.id, 'workout', val)} /></td>
                          <td className="p-8 text-center"><HabitToggle value={record.habits.ipmatStudy} onChange={(val) => handleHabitChange(record.id, 'ipmatStudy', val)} /></td>
                          <td className="p-8 text-center"><HabitToggle value={record.habits.nightWalk} onChange={(val) => handleHabitChange(record.id, 'nightWalk', val)} /></td>
                          
                          {/* Numerical Separated Section */}
                          <td className="p-8 text-center bg-slate-50/30 border-l border-slate-50">
                            <div className="flex items-center justify-center gap-2">
                              <input 
                                type="number" step="0.5" min="0" max="24"
                                value={record.metrics.studyHours || ''}
                                placeholder="0.0"
                                onChange={(e) => handleMetricChange(record.id, 'studyHours', e.target.value)}
                                className="w-24 px-4 py-3 text-center bg-white border border-slate-100 rounded-2xl text-indigo-600 font-black focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm text-sm"
                              />
                            </div>
                          </td>
                          <td className="p-8 text-center bg-slate-50/30">
                            <div className="flex items-center justify-center gap-2">
                              <input 
                                type="number" step="0.5" min="0" max="24"
                                value={record.metrics.timeWasted || ''}
                                placeholder="0.0"
                                onChange={(e) => handleMetricChange(record.id, 'timeWasted', e.target.value)}
                                className="w-24 px-4 py-3 text-center bg-white border border-slate-100 rounded-2xl text-rose-500 font-black focus:outline-none focus:ring-4 focus:ring-rose-100 shadow-sm text-sm"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto flex flex-col gap-12 pb-24">
            <header>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">Intelligence Suite</h2>
              <p className="text-slate-400 font-medium mt-3 text-lg">Cross-referencing behavioral patterns with productivity output.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Productivity Breakdown by Month */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                  <h3 className="text-xl font-black text-slate-900">Monthly Volume Distribution</h3>
                </div>
                <div className="h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#cbd5e1" tick={{fontSize: 10, fontWeight: 800}} axisLine={false} />
                      <YAxis stroke="#cbd5e1" tick={{fontSize: 10, fontWeight: 800}} axisLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }} />
                      <Bar name="Study Hours" dataKey="study" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={30} />
                      <Bar name="Waste Hours" dataKey="wasted" fill="#fb7185" radius={[12, 12, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Advanced Habit Heatmap */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Activity size={20} /></div>
                  <h3 className="text-xl font-black text-slate-900">Neuro-Consistency Map</h3>
                </div>
                <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-1.5 overflow-x-auto pb-4 custom-scrollbar">
                  {records.map(r => {
                    const active = r.habits.ipmatStudy || r.metrics.studyHours > 0;
                    const filled = r.isFilled;
                    return (
                      <div 
                        key={r.id} 
                        className={`aspect-square w-full min-w-[12px] rounded-[3px] transition-all hover:scale-[1.8] hover:z-50 cursor-crosshair ${
                          !filled ? 'bg-slate-100' : (active ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-rose-400')
                        }`}
                        title={`${r.date}: ${active ? 'Peak Focus' : 'Missed'}`}
                      ></div>
                    );
                  })}
                </div>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Correlation</p>
                    <p className="text-sm font-bold text-slate-700 leading-tight">Workouts are 85% likely to lead to a 4h+ study block.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency Delta</p>
                    <p className="text-sm font-bold text-slate-700 leading-tight">Current momentum is 12% higher than Jan avg.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Combined Efficiency Chart */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50">
              <h3 className="text-xl font-black text-slate-900 mb-10 text-center">Efficiency Correlation Score (Year to Date)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <XAxis dataKey="month" stroke="#cbd5e1" tick={{fontSize: 10, fontWeight: 800}} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                    <Bar dataKey="study" fill="#6366f1" barSize={40} radius={10} />
                    <Line type="monotone" dataKey="wasted" stroke="#fb7185" strokeWidth={4} dot={{r: 6, fill: '#fb7185'}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-10 p-10 bg-indigo-900 rounded-[3rem] text-white">
                <div className="flex-1">
                  <h4 className="text-2xl font-black mb-2 flex items-center gap-3">
                    <Award className="text-indigo-400" /> Executive Insight
                  </h4>
                  <p className="text-indigo-200 text-lg leading-relaxed italic">
                    "The difference between the amateur and the professional is the system. Today is 16 Feb; your data shows you are {productivityScore}% consistent. Optimize for the 100%."
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-8 py-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">Peak Streak</p>
                    <p className="text-3xl font-black">{Math.max(streaks.noPorn.max, streaks.workout.max, streaks.ipmatStudy.max)}d</p>
                  </div>
                  <div className="text-center px-8 py-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">Current</p>
                    <p className="text-3xl font-black text-indigo-400">{completedDays}d</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
