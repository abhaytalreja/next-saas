'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { TimeSeriesData } from '../../types'

interface AnalyticsChartProps {
  data: TimeSeriesData[]
  type: 'line' | 'area' | 'bar' | 'pie'
  dataKey: string
  xAxisKey?: string
  height?: number
  color?: string
  loading?: boolean
  formatValue?: (value: number) => string
  title?: string
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export function AnalyticsChart({
  data,
  type,
  dataKey,
  xAxisKey = 'date',
  height = 300,
  color = '#3b82f6',
  loading = false,
  formatValue,
  title
}: AnalyticsChartProps) {
  const formatXAxisValue = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTooltipValue = (value: number) => {
    if (formatValue) {
      return formatValue(value)
    }
    return value.toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500" style={{ height }}>
        <div className="text-center">
          <div className="text-sm">No data available</div>
          {title && <div className="text-xs text-gray-400 mt-1">{title}</div>}
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxisValue}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              formatter={(value, name) => [formatTooltipValue(value as number), name]}
              labelFormatter={(value) => `Date: ${formatXAxisValue(value)}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxisValue}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              formatter={(value, name) => [formatTooltipValue(value as number), name]}
              labelFormatter={(value) => `Date: ${formatXAxisValue(value)}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        )
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xAxisKey} 
              tickFormatter={formatXAxisValue}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              formatter={(value, name) => [formatTooltipValue(value as number), name]}
              labelFormatter={(value) => `Date: ${formatXAxisValue(value)}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [formatTooltipValue(value as number), name]} />
          </PieChart>
        )
      
      default:
        return <div></div>
    }
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  )
}