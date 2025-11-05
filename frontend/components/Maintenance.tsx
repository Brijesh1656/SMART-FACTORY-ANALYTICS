import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts'

interface MaintenanceProps {
  apiUrl: string
}

export default function Maintenance({ apiUrl }: MaintenanceProps) {
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/predict_failure`)
      const data = await response.json()
      setPredictions(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching predictions:', error)
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

  if (!predictions) return null

  const riskColors: any = {
    High: '#EF4444',
    Medium: '#F59E0B',
    Low: '#10B981',
  }

  // Custom tooltip for failure probability bars
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    const p = payload[0]?.payload
    if (!p) return null
    return (
      <div className="rounded-lg border border-gray-700 bg-slate-800/90 backdrop-blur-md p-3 shadow-xl shadow-black/30 min-w-[180px]">
        <div className="text-sm font-semibold text-white mb-1">{p.machine_id}</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex justify-between"><span>Failure probability</span><span className="text-white">{(p.failure_probability * 100).toFixed(1)}%</span></div>
          <div className="flex justify-between"><span>Risk level</span><span className={`text-white`}>{p.risk_level}</span></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="High Risk"
          value={predictions.high_risk}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Medium Risk"
          value={predictions.medium_risk}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Low Risk"
          value={predictions.low_risk}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Failure Probability Chart */}
      <ChartCard title="Failure Probability by Machine">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={predictions.predictions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="machine_id" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#9CA3AF' }} />
            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickLine={{ stroke: '#9CA3AF' }} />
            <Tooltip wrapperStyle={{ zIndex: 50 }} cursor={{ fill: 'rgba(255,255,255,0.06)' }} content={<CustomTooltip />} />
            <Bar dataKey="failure_probability" radius={[8, 8, 0, 0]}>
              {predictions.predictions.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={riskColors[entry.risk_level]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Detailed Maintenance Schedule */}
      <ChartCard title="Maintenance Schedule & Recommendations">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.predictions
            .sort((a: any, b: any) => b.failure_probability - a.failure_probability)
            .map((machine: any, index: number) => (
              <MachineCard key={machine.machine_id} machine={machine} index={index} />
            ))}
        </div>
      </ChartCard>
    </div>
  )
}

function MachineCard({ machine, index }: any) {
  const riskConfig: any = {
    High: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/50',
      text: 'text-red-400',
      badge: 'bg-red-500/20 text-red-400',
    },
    Medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400',
    },
    Low: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/50',
      text: 'text-green-400',
      badge: 'bg-green-500/20 text-green-400',
    },
  }

  const config = riskConfig[machine.risk_level]

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
          {machine.risk_level}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Failure Risk</span>
          <span className={`font-semibold ${config.text}`}>
            {(machine.failure_probability * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Temperature</span>
          <span className="text-white">{machine.temperature}°C</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Vibration</span>
          <span className="text-white">{machine.vibration}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Runtime</span>
          <span className="text-white">{machine.runtime_hours.toFixed(0)}h</span>
        </div>
      </div>

      <div className={`text-xs ${config.text} bg-slate-900/50 rounded p-2`}>
        <Wrench className="h-3 w-3 inline mr-1" />
        {machine.recommendation}
      </div>
    </motion.div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    green: 'bg-green-500/20 text-green-400',
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
