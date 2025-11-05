import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertOctagon, CheckCircle2, TrendingUp, Activity, Thermometer } from 'lucide-react'
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ZAxis, Cell, ReferenceLine 
} from 'recharts'

interface AnomalyProps {
  apiUrl: string
}

export default function Anomaly({ apiUrl }: AnomalyProps) {
  const [anomalyData, setAnomalyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/detect_anomaly`)
      const data = await response.json()
      setAnomalyData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching anomaly data:', error)
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

  if (!anomalyData) return null

  // Themes by cluster semantics
  const clusterTheme: Record<string, { color: string; icon: any }> = {
    Normal: { color: '#10B981', icon: CheckCircle2 },
    Vibration: { color: '#3B82F6', icon: Activity },
    Temperature: { color: '#F59E0B', icon: Thermometer },
    Critical: { color: '#EF4444', icon: AlertOctagon },
  }

  const getClusterTheme = (label: string) => {
    if (!label) return { color: '#10B981', icon: CheckCircle2 }
    const key = Object.keys(clusterTheme).find(k => label.toLowerCase().includes(k.toLowerCase()))
    return key ? clusterTheme[key] : { color: '#10B981', icon: CheckCircle2 }
  }

  // Custom tooltip for scatter points with theme-aligned styles and units
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null
    const p = payload[0]?.payload
    if (!p) return null
    return (
      <div className="rounded-lg border border-gray-700 bg-slate-800/90 backdrop-blur-md p-3 shadow-xl shadow-black/30 min-w-[180px]">
        <div className="text-sm font-semibold text-white mb-1">{p.machine_id || 'Machine'}</div>
        <div className="text-xs text-gray-300 space-y-1">
          <div className="flex justify-between"><span>Temperature</span><span className="text-white">{Number(p.temperature).toFixed(2)}°C</span></div>
          <div className="flex justify-between"><span>Vibration</span><span className="text-white">{Number(p.vibration).toFixed(3)}</span></div>
          {p.pressure !== undefined && (
            <div className="flex justify-between"><span>Pressure</span><span className="text-white">{Number(p.pressure).toFixed(2)}</span></div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Normal Machines"
          value={anomalyData.total_machines - anomalyData.anomalous_machines}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Anomalous Machines"
          value={anomalyData.anomalous_machines}
          icon={AlertOctagon}
          color="red"
        />
      </div>

      {/* Cluster Distribution */}
      <ChartCard title="Cluster Distribution">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(anomalyData.cluster_distribution).map(([cluster, count]: any) => {
            const theme = getClusterTheme(cluster)
            const Icon = theme.icon
            return (
              <div
                key={cluster}
                className="bg-slate-900/50 rounded-lg p-4 border border-gray-700"
              >
                <div
                  className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center"
                  style={{ backgroundColor: theme.color + '40' }}
                >
                  <Icon className="h-6 w-6 text-white/90" />
                </div>
                <h4 className="text-white font-semibold mb-1">{cluster}</h4>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-gray-400 mt-1">machines</p>
              </div>
            )
          })}
        </div>
      </ChartCard>

      {/* Anomaly Scatter Plot */}
      <ChartCard title="Temperature vs Vibration Analysis">
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              dataKey="temperature" 
              name="Temperature" 
              unit="°C"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <YAxis 
              type="number" 
              dataKey="vibration" 
              name="Vibration"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <ZAxis type="number" dataKey="pressure" range={[50, 400]} />
            <ReferenceLine x={75} stroke="#9CA3AF" strokeDasharray="4 4" />
            <ReferenceLine y={1.25} stroke="#9CA3AF" strokeDasharray="4 4" />
            <Tooltip 
              wrapperStyle={{ zIndex: 50 }}
              cursor={{ strokeDasharray: '3 3' }}
              content={<CustomTooltip />}
              offset={12}
            />
            <Scatter 
              name="Machines" 
              data={anomalyData.results} 
              fill="#8884d8"
              shape="circle"
              isAnimationActive={false}
            >
              {anomalyData.results.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getClusterTheme(entry.cluster_name || String(entry.cluster)).color} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Machine Details */}
      <ChartCard title="Anomaly Details">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3 font-medium">Machine ID</th>
                <th className="pb-3 font-medium">Cluster</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Temperature</th>
                <th className="pb-3 font-medium">Vibration</th>
                <th className="pb-3 font-medium">Pressure</th>
                <th className="pb-3 font-medium">Speed</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {anomalyData.results
                .sort((a: any, b: any) => b.is_anomalous - a.is_anomalous)
                .map((machine: any, index: number) => (
                  <motion.tr
                    key={machine.machine_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="py-3 font-medium text-white">{machine.machine_id}</td>
                    <td className="py-3">
                      <div
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getClusterTheme(machine.cluster_name || String(machine.cluster)).color }}
                      />
                      <span className="text-gray-300">{machine.cluster_name}</span>
                    </td>
                    <td className="py-3">
                      {machine.is_anomalous ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                          Anomalous
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-gray-300">{machine.temperature}°C</td>
                    <td className="py-3 text-gray-300">{machine.vibration}</td>
                    <td className="py-3 text-gray-300">{machine.pressure}</td>
                    <td className="py-3 text-gray-300">{machine.speed.toFixed(0)}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    green: 'bg-green-500/20 text-green-400',
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
