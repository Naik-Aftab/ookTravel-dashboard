import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CommissionTrendChart({ data = [] }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Commission Trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="total_commission" name="Total"   fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="paid"             name="Paid"    fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending"          name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
