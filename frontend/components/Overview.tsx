import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Activity, AlertCircle, 
  CheckCircle, XCircle, Cpu 
} from 'lucide-react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'

interface OverviewProps {
  apiUrl: string
}

export default function Overview({ apiUrl }: OverviewProps) {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Align with global auto-refresh cadence to reduce churn
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/machine_health`)
      const data = await response.json()
      setHealthData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching health data:', error)
      setLoading(false)
    }
  }

  // Derive summary safely even before data loads to keep hook order stable
  const goodHealth = (healthData?.good_health as number) || 0
  const fairHealth = (healthData?.fair_health as number) || 0
  const criticalHealth = (healthData?.critical_health as number) || 0
  const totalMachines = (healthData?.total_machines as number) || 0

  const pieData = [
    { name: 'Good', value: goodHealth, color: '#10B981' },
    { name: 'Fair', value: fairHealth, color: '#F59E0B' },
    { name: 'Critical', value: criticalHealth, color: '#EF4444' },
  ]

  // Filter out zero-value slices to avoid overlapping labels and odd single-line rendering
  const pieDataFiltered = pieData.filter(d => d.value > 0)

  const totalForPie = pieDataFiltered.reduce((acc, d) => acc + d.value, 0)

  // Custom label: hide labels for tiny slices and format nicely
  const renderPieLabel = ({ name, percent }: any) => {
    if (!percent || percent < 0.01) return null
    return `${name}: ${(percent * 100).toFixed(0)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!healthData) return null

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Machines"
          value={totalMachines}
          icon={Cpu}
          color="blue"
          trend="+100%"
        />
        <StatsCard
          title="Good Health"
          value={goodHealth}
          icon={CheckCircle}
          color="green"
          trend={`${((goodHealth / totalMachines) * 100).toFixed(0)}%`}
        />
        <StatsCard
          title="Fair Health"
          value={fairHealth}
          icon={AlertCircle}
          color="yellow"
          trend={`${((fairHealth / totalMachines) * 100).toFixed(0)}%`}
        />
        <StatsCard
          title="Critical"
          value={criticalHealth}
          icon={XCircle}
          color="red"
          trend={`${((criticalHealth / totalMachines) * 100).toFixed(0)}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <ChartCard title="Health Distribution">
          <div className="relative h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieDataFiltered.length ? pieDataFiltered : [{ name: 'Good', value: 1, color: '#10B981' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={pieDataFiltered.length > 1 ? 2 : 0}
                  labelLine={false}
                  label={renderPieLabel}
                  isAnimationActive={false}
                  dataKey="value"
                >
                  {(pieDataFiltered.length ? pieDataFiltered : [{ name: 'Good', value: 1, color: '#10B981' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {totalForPie > 0 ? Math.round((goodHealth / (goodHealth + fairHealth + criticalHealth || 1)) * 100) : 100}%
                </div>
                <div className="text-xs text-gray-400">Good</div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Average Health Score */}
        <ChartCard title="Machine Health Scores">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData.machines?.slice(0, 10) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="machine_id" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="health_score" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Machine Health Table */}
      <ChartCard title="Machine Health Overview">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3 font-medium">Machine ID</th>
                <th className="pb-3 font-medium">Health Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Failure Risk</th>
                <th className="pb-3 font-medium">Yield Efficiency</th>
                <th className="pb-3 font-medium">Temperature</th>
                <th className="pb-3 font-medium">Vibration</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {healthData.machines?.map((machine: any, index: number) => (
                <motion.tr
                  key={machine.machine_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="border-b border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="py-3 font-medium text-white">{machine.machine_id}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 w-20">
                        <div
                          className={`h-2 rounded-full ${
                            machine.health_score >= 75
                              ? 'bg-green-500'
                              : machine.health_score >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${machine.health_score}%` }}
                        />
                      </div>
                      <span className="text-white">{machine.health_score.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        machine.health_status === 'Good'
                          ? 'bg-green-500/20 text-green-400'
                          : machine.health_status === 'Fair'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {machine.health_status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300">
                    {(machine.failure_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 text-gray-300">
                    {machine.yield_efficiency.toFixed(1)}%
                  </td>
                  <td className="py-3 text-gray-300">{machine.temperature.toFixed(1)}°C</td>
                  <td className="py-3 text-gray-300">{machine.vibration.toFixed(3)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, color, trend }: any) {
  const colorClasses = {
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
          <p className="text-sm text-gray-500 mt-1">{trend}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
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
