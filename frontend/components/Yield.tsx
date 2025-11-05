import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts'

interface YieldProps {
  apiUrl: string
}

export default function Yield({ apiUrl }: YieldProps) {
  const [yieldData, setYieldData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/predict_yield`)
      const data = await response.json()
      setYieldData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching yield data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!yieldData) return null

  const excellentCount = yieldData.predictions.filter(
    (p: any) => p.performance_level === 'Excellent'
  ).length
  const goodCount = yieldData.predictions.filter(
    (p: any) => p.performance_level === 'Good'
  ).length
  const poorCount = yieldData.predictions.filter(
    (p: any) => p.performance_level === 'Poor'
  ).length

  // Custom tooltip for efficiency bars
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const p = payload[0]?.payload
    if (!p) return null
    return (
      <div className="rounded-lg border border-gray-700 bg-slate-800/90 backdrop-blur-md p-3 shadow-xl shadow-black/30 min-w-[180px]">
        <div className="text-sm font-semibold text-white mb-1">{p.machine_id}</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex justify-between"><span>Efficiency</span><span className="text-white">{Number(p.efficiency_percentage).toFixed(1)}%</span></div>
          <div className="flex justify-between"><span>Performance</span><span className="text-white">{p.performance_level}</span></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Average Efficiency"
          value={`${yieldData.average_efficiency.toFixed(1)}%`}
          icon={Target}
          color="blue"
        />
        <StatCard
          title="Excellent"
          value={excellentCount}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Good"
          value={goodCount}
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="Needs Improvement"
          value={poorCount}
          icon={TrendingDown}
          color="red"
        />
      </div>

      {/* Efficiency Chart */}
      <ChartCard title="Yield Efficiency by Machine">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yieldData.predictions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="machine_id" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#9CA3AF' }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#9CA3AF' }} />
            <Tooltip wrapperStyle={{ zIndex: 50 }} cursor={{ fill: 'rgba(255,255,255,0.06)' }} content={<CustomTooltip />} />
            <Bar dataKey="efficiency_percentage" radius={[8, 8, 0, 0]}>
              {yieldData.predictions.map((entry: any, index: number) => {
                const color = 
                  entry.performance_level === 'Excellent' 
                    ? '#10B981' 
                    : entry.performance_level === 'Good' 
                    ? '#F59E0B' 
                    : '#EF4444'
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Performance Breakdown */}
      <ChartCard title="Performance Optimization Opportunities">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yieldData.predictions
            .sort((a: any, b: any) => a.efficiency_percentage - b.efficiency_percentage)
            .map((machine: any, index: number) => (
              <YieldCard key={machine.machine_id} machine={machine} index={index} />
            ))}
        </div>
      </ChartCard>

      {/* Detailed Table */}
      <ChartCard title="Detailed Yield Analysis">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3 font-medium">Machine ID</th>
                <th className="pb-3 font-medium">Efficiency</th>
                <th className="pb-3 font-medium">Performance</th>
                <th className="pb-3 font-medium">Temperature</th>
                <th className="pb-3 font-medium">Pressure</th>
                <th className="pb-3 font-medium">Speed</th>
                <th className="pb-3 font-medium">Potential Gain</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {yieldData.predictions.map((machine: any, index: number) => {
                const potentialGain = (100 - machine.efficiency_percentage).toFixed(1)
                return (
                  <motion.tr
                    key={machine.machine_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="py-3 font-medium text-white">{machine.machine_id}</td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 w-20">
                          <div
                            className={`h-2 rounded-full ${
                              machine.efficiency_percentage >= 85
                                ? 'bg-green-500'
                                : machine.efficiency_percentage >= 70
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${machine.efficiency_percentage}%` }}
                          />
                        </div>
                        <span className="text-white">
                          {machine.efficiency_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          machine.performance_level === 'Excellent'
                            ? 'bg-green-500/20 text-green-400'
                            : machine.performance_level === 'Good'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {machine.performance_level}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">{machine.temperature.toFixed(1)}°C</td>
                    <td className="py-3 text-gray-300">{machine.pressure.toFixed(1)}</td>
                    <td className="py-3 text-gray-300">{machine.speed.toFixed(0)}</td>
                    <td className="py-3 text-gray-300">+{potentialGain}%</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

function YieldCard({ machine, index }: any) {
  const performanceConfig: any = {
    Excellent: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      text: 'text-green-400',
      badge: 'bg-green-500/20 text-green-400',
    },
    Good: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400',
    },
    Poor: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400',
    },
  }

  const config = performanceConfig[machine.performance_level]
  const optimizationPotential = (100 - machine.efficiency_percentage).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`${config.bg} border ${config.border} rounded-xl p-4 hover:shadow-lg transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold">{machine.machine_id}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${config.badge}`}>
          {machine.performance_level}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Efficiency</span>
          <span className={`font-bold ${config.text}`}>
            {machine.efficiency_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${config.text.replace('text-', 'bg-')}`}
            style={{ width: `${machine.efficiency_percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-1 mb-3 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Temperature</span>
          <span className="text-white">{machine.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Pressure</span>
          <span className="text-white">{machine.pressure.toFixed(1)} PSI</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Speed</span>
          <span className="text-white">{machine.speed.toFixed(0)} RPM</span>
        </div>
      </div>

      <div className="text-xs bg-slate-900/50 rounded p-2">
        <TrendingUp className="h-3 w-3 inline mr-1 text-blue-400" />
        <span className="text-gray-300">
          Optimization potential: <span className="text-blue-400 font-semibold">+{optimizationPotential}%</span>
        </span>
      </div>
    </motion.div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  )
}

function ChartCard({ title, children }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
    >
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}
