'use client'

import React from 'react'
import { ChartBarIcon, TrendingUpIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your application performance and usage metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Metric Cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Users</h3>
            <UsersIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,234</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+20.1% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Revenue</h3>
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$12,234</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+15.3% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Sessions</h3>
            <TrendingUpIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">573</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+2.5% from last hour</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Conversion Rate</h3>
            <ChartBarIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">12.5%</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">+3.2% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Usage Over Time</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Daily active users for the past 30 days</p>
          </div>
          <div className="p-6">
            <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Breakdown</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue by source for this month</p>
          </div>
          <div className="p-6">
            <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <CurrencyDollarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}