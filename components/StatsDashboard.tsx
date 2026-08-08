import React from 'react';
import { InventoryItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertTriangle, TrendingDown, PackageCheck } from 'lucide-react';

interface StatsDashboardProps {
  items: InventoryItem[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ items }) => {
  const totalItems = items.reduce((acc, curr) => acc + curr.Qta, 0);
  const lowStockCount = items.filter(i => i.Qta === 0).length;
  
  // Category Data
  const categoryDataMap = items.reduce((acc, item) => {
    acc[item.Categoria] = (acc[item.Categoria] || 0) + item.Qta;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.keys(categoryDataMap).map(key => ({
    name: key,
    value: categoryDataMap[key]
  }));

  // Location Data
  const locationDataMap = items.reduce((acc, item) => {
    acc[item.Posizione] = (acc[item.Posizione] || 0) + 1; // Count unique items per location
    return acc;
  }, {} as Record<string, number>);

  const locationData = Object.keys(locationDataMap).map(key => ({
    name: key,
    items: locationDataMap[key]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transition-colors">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-2">
                <PackageCheck size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{totalItems}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pezzi Totali</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center transition-colors">
             <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full mb-2">
                <AlertTriangle size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">{lowStockCount}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Esauriti</span>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Per Categoria</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Oggetti per Posizione</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="items" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};