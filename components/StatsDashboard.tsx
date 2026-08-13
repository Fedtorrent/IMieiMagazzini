import React from 'react';
import { InventoryItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend, LabelList } from 'recharts';
import { AlertTriangle, PackageCheck, CalendarClock, CalendarX } from 'lucide-react';
import { getExpirationStatus } from '../services/api';

interface StatsDashboardProps {
  items: InventoryItem[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ items }) => {
  const totalQuantity = items.reduce((acc, curr) => acc + curr.Qta, 0);
  const totalProducts = items.length;
  const outOfStockCount = items.filter(i => i.Qta === 0).length;
  
  const expirationStats = items.reduce((acc, item) => {
    if (item.Qta > 0) {
      const { isExpired, isExpiring } = getExpirationStatus(item.DataScadenza);
      if (isExpired) acc.expired++;
      else if (isExpiring) acc.expiring++;
    }
    return acc;
  }, { expiring: 0, expired: 0 });

  // Category Data
  const categoryDataMap = items.reduce((acc, item) => {
    acc[item.Categoria] = (acc[item.Categoria] || 0) + item.Qta;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  })).sort((a, b) => b.value - a.value);

  // Location Data
  const locationDataMap = items.reduce((acc, item) => {
    acc[item.Posizione] = (acc[item.Posizione] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationData = Object.keys(locationDataMap).map(key => ({
    name: key,
    items: locationDataMap[key]
  })).sort((a, b) => b.items - a.items);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6 pb-24 px-1">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl mb-2">
                <PackageCheck size={20} />
            </div>
            <span className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{totalQuantity}</span>
            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pezzi Totali</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
             <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mb-2">
                <AlertTriangle size={20} />
            </div>
            <span className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{outOfStockCount}</span>
            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Esauriti</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
             <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl mb-2">
                <CalendarClock size={20} />
            </div>
            <span className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{expirationStats.expiring}</span>
            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">In Scadenza</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
             <div className="p-2 bg-red-950/10 text-red-800 dark:text-red-500 rounded-xl mb-2">
                <CalendarX size={20} />
            </div>
            <span className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1">{expirationStats.expired}</span>
            <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Scaduti</span>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 text-center">Quantità per Categoria</h3>
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                        content={(props) => {
                            const { payload } = props;
                            return (
                                <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                                    {payload?.map((entry: any, index: number) => (
                                        <li key={`item-${index}`} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-[12px] font-black uppercase text-gray-500 dark:text-gray-400">
                                                {entry.value}: <span className="text-gray-800 dark:text-gray-200">{categoryData[index].value}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            );
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 text-center">Prodotti per Posizione</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        tick={{fontSize: 12, fontWeight: 'bold', fill: '#9ca3af'}}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Bar dataKey="items" fill="#10b981" radius={[0, 10, 10, 0]} barSize={16}>
                        <LabelList
                            dataKey="items"
                            position="right"
                            style={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};