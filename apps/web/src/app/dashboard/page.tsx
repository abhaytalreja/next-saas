'use client'

import React from 'react'
import { useAuth, useOrganization } from '@/packages/auth'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'

const stats = [
  { 
    name: 'Total Revenue', 
    value: '$12,345', 
    change: '+12%', 
    changeType: 'increase',
    icon: CurrencyDollarIcon,
  },
  { 
    name: 'Team Members', 
    value: '24', 
    change: '+4', 
    changeType: 'increase',
    icon: UserGroupIcon,
  },
  { 
    name: 'Active Projects', 
    value: '8', 
    change: '-1', 
    changeType: 'decrease',
    icon: DocumentIcon,
  },
  { 
    name: 'Performance', 
    value: '98.5%', 
    change: '+2.1%', 
    changeType: 'increase',
    icon: ChartBarIcon,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { currentOrganization } = useOrganization()

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Here's what's happening with your projects at {currentOrganization?.name || 'your organization'}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        )}
                        <span className="ml-1">{stat.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {[1, 2, 3, 4].map((item) => (
                  <li key={item} className="py-5">
                    <div className="relative focus-within:ring-2 focus-within:ring-primary-500">
                      <h3 className="text-sm font-semibold text-gray-800">
                        <a href="#" className="hover:underline focus:outline-none">
                          Project {item} updated
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis, et.
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        2 hours ago
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <a
                href="#"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all activity
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="relative group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                    <DocumentIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">New Project</h3>
                  <p className="mt-1 text-xs text-gray-500">Create a new project</p>
                </div>
              </button>

              <button className="relative group bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                    <UserGroupIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Invite Team</h3>
                  <p className="mt-1 text-xs text-gray-500">Add team members</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional sections can be added here */}
    </div>
  )
}