import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, AlertTriangle, TrendingUp, Settings,
  RefreshCw, Database, Zap, Clock, Bell, Menu, X, ChevronRight
} from 'lucide-react'
import Overview from '@/components/Overview'
import Maintenance from '@/components/Maintenance'
import Anomaly from '@/components/Anomaly'
import Yield from '@/components/Yield'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationList, setNotificationList] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    setLastUpdate(new Date())
  }, [])

  const tabs = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: Activity, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Factory-wide KPIs and health metrics' 
    },
    { 
      id: 'maintenance', 
      name: 'Maintenance', 
      icon: Settings, 
      color: 'from-purple-500 to-pink-500',
      description: 'Predictive failure analysis' 
    },
    { 
      id: 'anomaly', 
      name: 'Anomaly Detection', 
      icon: AlertTriangle, 
      color: 'from-orange-500 to-red-500',
      description: 'Cluster analysis and alerts' 
    },
    { 
      id: 'yield', 
      name: 'Yield Optimization', 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-500',
      description: 'Production efficiency insights' 
    },
  ]

  useEffect(() => {
    if (!mounted) return
    fetchStats()
      fetchNotifications()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [mounted])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/statistics`)
      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/machine_health`)
        const data = await response.json()
        const machines = Array.isArray(data) ? data : (data?.machines || [])

        // Create notifications from machine health data
        const alerts = machines
          .filter((machine: any) => machine.health_score < 85 || machine.failure_probability > 0.3)
          .map((machine: any) => ({
            id: machine.machine_id,
            type: machine.failure_probability > 0.5 ? 'critical' : machine.failure_probability > 0.3 ? 'warning' : 'info',
            title: machine.failure_probability > 0.5 
              ? `🚨 Critical: ${machine.machine_id}` 
              : machine.failure_probability > 0.3
              ? `⚠️ Warning: ${machine.machine_id}`
              : `ℹ️ Info: ${machine.machine_id}`,
            message: machine.failure_probability > 0.5
              ? `High failure risk (${(machine.failure_probability * 100).toFixed(1)}%). Immediate maintenance required!`
              : machine.failure_probability > 0.3
              ? `Elevated failure risk (${(machine.failure_probability * 100).toFixed(1)}%). Schedule maintenance soon.`
              : `Health score ${machine.health_score.toFixed(1)}. Monitor closely.`,
            timestamp: new Date().toISOString(),
            machine: machine.machine_id,
            severity: machine.failure_probability > 0.5 ? 3 : machine.failure_probability > 0.3 ? 2 : 1
          }))
      
        setNotificationList(alerts)
        setNotifications(alerts.length)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/refresh_data`, { method: 'POST' })
      if (response.ok) {
        await fetchStats()
          await fetchNotifications()
      }
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentTab = tabs.find(t => t.id === activeTab)

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      <Head>
        <title>Smart Factory Analytics - AI-Powered Predictive Maintenance</title>
        <meta name="description" content="AI-powered predictive maintenance and yield optimization for Industry 4.0" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header */}
        <header className="glass-dark border-b border-white/10 relative z-50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50"
                >
                  <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                  >
                    Smart Factory Analytics
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-sm mt-0.5 hidden sm:block font-medium"
                  >
                    AI-Powered Predictive Maintenance Platform
                  </motion.p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Stats - Desktop */}
                {stats && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-semibold text-sm">{stats.total_machines}</span>
                      <span className="text-gray-400 text-xs">Machines</span>
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400 text-xs">{lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}</span>
                    </div>
                  </motion.div>
                )}

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={loading}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-sm">Refresh</span>
                </motion.button>

                {/* Notifications */}
                  <div className="relative">
                    <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-white text-xs flex items-center justify-center font-bold shadow-lg"
                    >
                      {notifications}
                    </motion.span>
                  )}
                </motion.button>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {notificationOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] glass-dark rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden"
                        >
                          {/* Header */}
                          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-semibold">Notifications</h3>
                              <p className="text-gray-400 text-xs mt-0.5">{notifications} active alerts</p>
                            </div>
                            <button
                              onClick={() => setNotificationOpen(false)}
                              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>

                          {/* Notification List */}
                          <div className="max-h-96 overflow-y-auto">
                            {notificationList.length === 0 ? (
                              <div className="px-4 py-8 text-center">
                                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">No notifications</p>
                                <p className="text-gray-500 text-xs mt-1">All machines are running smoothly! ✓</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-white/5">
                                {notificationList.map((notif, index) => (
                                  <motion.div
                                    key={notif.id + index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => {
                                      setActiveTab('maintenance')
                                      setNotificationOpen(false)
                                    }}
                                  >
                                    <div className="flex items-start gap-3">
                                      {/* Icon */}
                                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                        notif.type === 'critical' ? 'bg-red-500' :
                                        notif.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                      }`}></div>
                                    
                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${
                                          notif.type === 'critical' ? 'text-red-400' :
                                          notif.type === 'warning' ? 'text-yellow-400' :
                                          'text-blue-400'
                                        }`}>
                                          {notif.title}
                                        </p>
                                        <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                                          {notif.message}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-2">
                                          Just now
                                        </p>
                                      </div>

                                      {/* Badge */}
                                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${
                                        notif.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                                        notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-blue-500/20 text-blue-400'
                                      }`}>
                                        {notif.machine}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          {notificationList.length > 0 && (
                            <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setNotificationList([])
                                  setNotifications(0)
                                }}
                                className="text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                Clear all
                              </button>
                              <button
                                onClick={() => {
                                  setActiveTab('maintenance')
                                  setNotificationOpen(false)
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                              >
                                View all alerts →
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                {/* Status Indicator - Desktop */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-green-400 font-bold text-sm">LIVE</span>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                </button>
              </div>
            </div>

            {/* Navigation Tabs - Desktop */}
            <nav className="hidden sm:flex space-x-1 pb-3 pt-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-2 px-5 py-3 text-sm font-semibold transition-all rounded-xl group ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBg"
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl shadow-lg`}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={`h-5 w-5 relative z-10 ${!isActive && 'group-hover:scale-110 transition-transform'}`} />
                    <span className="relative z-10">{tab.name}</span>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative z-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </nav>

            {/* Last Update Info - Desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center justify-between pb-3 text-xs"
            >
              <div className="text-gray-500">
                Auto-refresh every 30 seconds • Last updated: {lastUpdate ? lastUpdate.toLocaleString() : 'Loading...'}
              </div>
              {currentTab && (
                <div className="text-gray-400">
                  {currentTab.description}
                </div>
              )}
            </motion.div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="sm:hidden border-t border-white/10 bg-slate-900/50 backdrop-blur-xl"
              >
                <div className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-semibold">{tab.name}</div>
                            <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                              {tab.description}
                            </div>
                          </div>
                        </div>
                        {isActive && <ChevronRight className="w-5 h-5" />}
                      </motion.button>
                    )
                  })}
                  
                  {/* Mobile Refresh Button */}
                  <button
                    onClick={() => {
                      handleRefresh()
                      setMobileMenuOpen(false)
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {activeTab === 'overview' && <Overview apiUrl={API_URL} />}
              {activeTab === 'maintenance' && <Maintenance apiUrl={API_URL} />}
              {activeTab === 'anomaly' && <Anomaly apiUrl={API_URL} />}
              {activeTab === 'yield' && <Yield apiUrl={API_URL} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="glass-dark border-t border-white/10 mt-12 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-white font-semibold text-sm">Smart Factory Analytics Platform</p>
                <p className="text-gray-400 text-xs mt-1">v1.0.0 • Powered by Next.js, FastAPI & Machine Learning</p>
              </div>
              <div className="flex items-center gap-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-white transition-colors font-medium">Documentation</a>
                <span className="text-gray-600">•</span>
                <a href="#" className="hover:text-white transition-colors font-medium">API</a>
                <span className="text-gray-600">•</span>
                <a href="#" className="hover:text-white transition-colors font-medium">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}

