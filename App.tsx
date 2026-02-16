
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend, ComposedChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  LayoutDashboard, Table as TableIcon, BarChart3, Clock, BookOpen, Dumbbell, 
  Moon, ShieldCheck, Zap, Calendar, ChevronDown, Timer, ArrowUpRight, 
  Activity, Award, Coffee, MinusCircle, Target, CheckCircle2, AlertTriangle, Settings2
} from 'lucide-react';
import { DayRecord, HabitKey, MetricKey, MonthlyGoal } from './types';
import { generateInitialData, calculateStreak, getMonthName } from './utils/calculations';
import ProgressTracker from './components/ProgressTracker';
import DashboardCard from './components/DashboardCard';
import HabitToggle from './components/HabitToggle';

const App: React.FC = () => {
  const monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const [records, setRecords] = useState<DayRecord[]>(() => {
    const saved = localStorage.getItem('mastery_tracker_365_data_v2');
    return saved ? JSON.parse(saved) : generateInitialData();
  });

  const [goals, setGoals] = useState<Record<string, MonthlyGoal>>(() => {
    const saved = localStorage.getItem('mastery_tracker_goals');
    if (saved) return JSON.parse(saved);
    const initialGoals: Record<string, MonthlyGoal> = {};
    monthsList.forEach(m => {
      initialGoals[m] = { month: m, studyTarget: 150, wasteLimit: 30 };
    });
    return initialGoals;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'spreadsheet' | 'analytics'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [editingGoals, setEditingGoals] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('mastery_tracker_365_data_v2', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('mastery_tracker_goals', JSON.stringify(goals));
  }, [goals]);

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

  const monthlyData = useMemo(() => {
    return monthsList.map(m => {
      const stats = records.filter(r => getMonthName(r.date) === m).reduce((acc, r) => ({
        study: acc.study + r.metrics.studyHours,
        wasted: acc.wasted + r.metrics.timeWasted,
      }), { study: 0, wasted: 0 });
      
      const goal = goals[m];
      return {
        month: m,
        actualStudy: stats.study,
        goalStudy: goal.studyTarget,
        actualWaste: stats.wasted,
        limitWaste: goal.wasteLimit,
        achievement: stats.study >= goal.studyTarget ? 100 : Math.round((stats.study / goal.studyTarget) * 100),
        wasteCompliance: stats.wasted <= goal.wasteLimit ? 100 : Math.max(0, Math.round((1 - (stats.wasted - goal.wasteLimit) / goal.wasteLimit) * 100))
      };
    });
  }, [records, goals]);

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

  const updateGoal = (month: string, field: keyof MonthlyGoal, value: string) => {
    const num = parseFloat(value) || 0;
    setGoals(prev => ({
      ...prev,
      [month]: { ...prev[month], [field]: num }
    }));
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

  const dropdownMonths = ['All', ...monthsList];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
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
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance Volume</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Numerical analysis of study vs waste</p>
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
                    {dropdownMonths.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
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
                          <td className="p-8 text-center bg-slate-50/30 border-l border-slate-50">
                            <input 
                              type="number" step="0.5" min="0" max="24"
                              value={record.metrics.studyHours || ''}
                              placeholder="0.0"
                              onChange={(e) => handleMetricChange(record.id, 'studyHours', e.target.value)}
                              className="w-24 px-4 py-3 text-center bg-white border border-slate-100 rounded-2xl text-indigo-600 font-black focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-sm text-sm"
                            />
                          </td>
                          <td className="p-8 text-center bg-slate-50/30">
                            <input 
                              type="number" step="0.5" min="0" max="24"
                              value={record.metrics.timeWasted || ''}
                              placeholder="0.0"
                              onChange={(e) => handleMetricChange(record.id, 'timeWasted', e.target.value)}
                              className="w-24 px-4 py-3 text-center bg-white border border-slate-100 rounded-2xl text-rose-500 font-black focus:outline-none focus:ring-4 focus:ring-rose-100 shadow-sm text-sm"
                            />
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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Intelligence Suite</h2>
                <p className="text-slate-400 font-medium mt-3 text-lg">Cross-referencing targets with real-world performance.</p>
              </div>
              <button 
                onClick={() => setEditingGoals(!editingGoals)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs transition-all ${editingGoals ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900 border border-slate-100 shadow-sm'}`}
              >
                <Settings2 size={18} />
                {editingGoals ? 'SAVE TARGETS' : 'SET MONTHLY GOALS'}
              </button>
            </header>

            {/* Goal Matrix Editor */}
            {editingGoals && (
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-indigo-50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Target size={24} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">The Goal Matrix</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Configure your targets for 2025</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {monthsList.map(m => (
                    <div key={m} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="font-black text-slate-800 mb-4">{m}</p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Study Target (Hrs)</label>
                          <input 
                            type="number"
                            value={goals[m].studyTarget}
                            onChange={(e) => updateGoal(m, 'studyTarget', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Waste Limit (Hrs)</label>
                          <input 
                            type="number"
                            value={goals[m].wasteLimit}
                            onChange={(e) => updateGoal(m, 'wasteLimit', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target vs Actual Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Study Achievement Composed Chart */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
                    <h3 className="text-xl font-black text-slate-900">Study Compliance</h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Actual</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-[10px] font-bold text-slate-400 uppercase">Target</span></div>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{fontSize: 10, fontWeight: 800}} axisLine={false} stroke="#cbd5e1" />
                      <YAxis tick={{fontSize: 10, fontWeight: 800}} axisLine={false} stroke="#cbd5e1" />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                      <Bar name="Actual Study" dataKey="actualStudy" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={25} />
                      <Line name="Study Target" type="step" dataKey="goalStudy" stroke="#e2e8f0" strokeWidth={4} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Waste Ceiling Monitoring */}
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-50">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center"><AlertTriangle size={20} /></div>
                    <h3 className="text-xl font-black text-slate-900">Waste Monitoring</h3>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{fontSize: 10, fontWeight: 800}} axisLine={false} stroke="#cbd5e1" />
                      <YAxis tick={{fontSize: 10, fontWeight: 800}} axisLine={false} stroke="#cbd5e1" />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '24px', border: 'none' }} />
                      <Bar dataKey="actualWaste" name="Actual Waste">
                        {monthlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.actualWaste > entry.limitWaste ? '#fb7185' : '#cbd5e1'} />
                        ))}
                      </Bar>
                      <Line name="Waste Limit" type="monotone" dataKey="limitWaste" stroke="#f43f5e" strokeWidth={2} dot={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Achievement Matrix */}
            <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-slate-50">
              <h3 className="text-2xl font-black text-slate-900 mb-10 text-center">Achievement Radar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={monthlyData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="month" tick={{fontSize: 10, fontWeight: 700}} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                      <Radar name="Achievement %" dataKey="achievement" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                      <Radar name="Waste Compliance %" dataKey="wasteCompliance" stroke="#fb7185" fill="#fb7185" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-6">
                  <div className="p-8 bg-slate-900 rounded-[3rem] text-white">
                    <h4 className="text-lg font-black mb-4 flex items-center gap-3"><Award className="text-indigo-400" /> Strategic Summary</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Your current annual study volume stands at {totalStudyHours}h. Across the active months, you have met your study targets {monthlyData.filter(m => m.actualStudy >= m.goalStudy && m.actualStudy > 0).length} times. 
                      Waste compliance is at {Math.round(monthlyData.reduce((acc, m) => acc + m.wasteCompliance, 0) / 12)}% overall.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Top Month</p>
                      <p className="text-xl font-black text-slate-800">
                        {monthlyData.sort((a,b) => b.actualStudy - a.actualStudy)[0].month}
                      </p>
                    </div>
                    <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Focus Debt</p>
                      <p className="text-xl font-black text-slate-800">
                        {Math.max(0, Object.values(goals).reduce((acc, g) => acc + g.studyTarget, 0) - totalStudyHours)}h
                      </p>
                    </div>
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
