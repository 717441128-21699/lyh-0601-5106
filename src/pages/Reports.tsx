import React, { useState, useMemo } from 'react'
import * as XLSX from 'xlsx'
import { generateReportData, routes } from '../data/mock'
import { useBusStore } from '../stores/useBusStore'
import { useDispatchStore } from '../stores/useDispatchStore'
import {
  FileSpreadsheet,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Zap,
  Clock,
  ChevronLeft,
  ChevronRight,
  Bus,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { DailyReport } from '../types'

const fmt = (d: Date) => d.toISOString().slice(0, 10)
const today = () => fmt(new Date())
const addDays = (s: string, n: number) => {
  const d = new Date(s)
  d.setDate(d.getDate() + n)
  return fmt(d)
}
const routeColor = (id: string) => routes.find((r) => r.id === id)?.color || '#00f0ff'

export default function Reports() {
  useBusStore((s) => s.routes)
  const intervalBusTriggers = useDispatchStore((s) => s.intervalBusTriggers)
  const [selectedDate, setSelectedDate] = useState(today())

  const report: DailyReport = useMemo(
    () => generateReportData(selectedDate, intervalBusTriggers),
    [selectedDate, intervalBusTriggers]
  )

  const chartData = useMemo(
    () =>
      report.routeReports.map((rr) => ({
        routeName: rr.routeName,
        发车次数: rr.dispatchCount,
        平均满载率: Math.round(rr.avgLoadRate * 100),
      })),
    [report]
  )

  const handleExport = () => {
    const routeData = report.routeReports.map((rr) => ({
      线路名称: rr.routeName,
      发车次数: rr.dispatchCount,
      平均满载率: `${Math.round(rr.avgLoadRate * 100)}%`,
      充电次数: rr.chargingCount,
      准点率: `${Math.round(rr.onTimeRate * 100)}%`,
      区间车方案触发: rr.intervalBusTriggered ? '是' : '否',
    }))
    const summaryData = [
      { 指标: '发车次数', 数值: report.dispatchCount },
      { 指标: '平均满载率', 数值: `${Math.round(report.avgLoadRate * 100)}%` },
      { 指标: '充电次数', 数值: report.chargingCount },
      { 指标: '准点率', 数值: `${Math.round(report.onTimeRate * 100)}%` },
    ]
    const triggerData = report.intervalBusTriggers.map((t) => ({
      线路名称: t.routeName,
      状态: t.status === 'active' ? '已启用' : t.status === 'proposed' ? '建议中' : '已取消',
      触发时间: new Date(t.triggeredAt).toLocaleString('zh-CN'),
      起点站ID: t.fromStopId,
      终点站ID: t.toStopId,
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(routeData), '线路明细')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), '汇总')
    if (triggerData.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(triggerData), '区间车触发记录')
    }
    XLSX.writeFile(wb, `公交运营日报_${selectedDate}.xlsx`)
  }

  const stats = [
    { label: '发车次数', value: report.dispatchCount, unit: '次', icon: <TrendingUp size={24} />, accent: '#00f0ff', trend: 5.2 },
    { label: '平均满载率', value: Math.round(report.avgLoadRate * 100), unit: '%', icon: <Users size={24} />, accent: '#ff6b35', trend: 2.8 },
    { label: '充电次数', value: report.chargingCount, unit: '次', icon: <Zap size={24} />, accent: '#00ff88', trend: -1.5 },
    { label: '准点率', value: Math.round(report.onTimeRate * 100), unit: '%', icon: <Clock size={24} />, accent: '#3b82f6', trend: 0.9 },
  ]

  const quickDates = [
    { label: '今天', days: 0 },
    { label: '昨天', days: -1 },
    { label: '7天前', days: -7 },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 panel-card rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.15)' }}>
            <FileSpreadsheet size={22} style={{ color: '#00f0ff' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">运营日报</h3>
            <p className="text-xs text-gray-400">公交运营数据统计与分析</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedDate((d) => addDays(d, -1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ border: '1px solid rgba(0,240,255,0.2)' }}>
              <ChevronLeft size={16} style={{ color: '#9ca3af' }} />
            </button>
            <div className="relative">
              <Calendar size={16} style={{ color: '#00f0ff', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-9 pl-9 pr-3 rounded-lg text-sm bg-transparent text-white focus:outline-none" style={{ border: '1px solid rgba(0,240,255,0.2)' }} />
            </div>
            <button onClick={() => setSelectedDate((d) => addDays(d, 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ border: '1px solid rgba(0,240,255,0.2)' }}>
              <ChevronRight size={16} style={{ color: '#9ca3af' }} />
            </button>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {quickDates.map((item) => {
              const active = selectedDate === addDays(today(), item.days)
              return (
                <button
                  key={item.label}
                  onClick={() => setSelectedDate(addDays(today(), item.days))}
                  className="px-3 h-8 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    background: active ? 'rgba(0,240,255,0.15)' : 'transparent',
                    color: active ? '#00f0ff' : '#9ca3af',
                    border: `1px solid ${active ? 'rgba(0,240,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="col-span-2 grid grid-cols-4 gap-4">
        {stats.map((card) => (
          <div key={card.label} className="panel-card rounded-xl p-5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold" style={{ color: card.accent }}>{card.value}</span>
                  <span className="text-sm text-gray-400">{card.unit}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${card.accent}15` }}>
                <div style={{ color: card.accent }}>{card.icon}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <TrendingUp size={14} style={{ color: card.trend >= 0 ? '#00ff88' : '#ff2d55', transform: card.trend < 0 ? 'scaleY(-1)' : undefined }} />
              <span className="text-xs font-medium" style={{ color: card.trend >= 0 ? '#00ff88' : '#ff2d55' }}>{card.trend >= 0 ? '+' : ''}{card.trend}%</span>
              <span className="text-xs text-gray-500 ml-1">较前日</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10" style={{ background: card.accent }} />
          </div>
        ))}
      </div>

      <div className="col-span-2 panel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">线路运营明细</h3>
          <p className="text-xs text-gray-400">共 {report.routeReports.length} 条线路</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-400">线路名称</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-400">发车次数</th>
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-400">平均满载率</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-400">充电次数</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-400">准点率</th>
                <th className="text-center py-3 px-3 text-xs font-medium text-gray-400">区间车触发</th>
              </tr>
            </thead>
            <tbody>
              {report.routeReports.map((rr, idx) => {
                const color = routeColor(rr.routeId)
                const loadPct = Math.round(rr.avgLoadRate * 100)
                const onTimePct = Math.round(rr.onTimeRate * 100)
                return (
                  <tr key={rr.routeId} style={{ borderBottom: idx < report.routeReports.length - 1 ? '1px solid rgba(255,255,255,0.03)' : undefined }}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
                        <span className="text-white font-medium">{rr.routeName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-white">{rr.dispatchCount}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${loadPct}%`, background: color }} />
                        </div>
                        <span className="text-white text-xs w-10 text-right">{loadPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-white">{rr.chargingCount}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs px-2 py-1 rounded-md" style={{ background: onTimePct >= 90 ? 'rgba(0,255,136,0.1)' : onTimePct >= 80 ? 'rgba(255,107,53,0.1)' : 'rgba(255,45,85,0.1)', color: onTimePct >= 90 ? '#00ff88' : onTimePct >= 80 ? '#ff6b35' : '#ff2d55' }}>
                        {onTimePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {rr.intervalBusTriggered ? (
                        <span className="text-xs px-2 py-1 rounded-md inline-flex items-center gap-1" style={{ background: 'rgba(255,107,53,0.15)', color: '#ff6b35' }}>
                          <Bus size={12} />已触发
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="routeName" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Bar yAxisId="left" dataKey="发车次数" fill="#00f0ff" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="平均满载率" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-2 panel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.15)' }}>
              <Bus size={20} style={{ color: '#ff6b35' }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">区间车方案触发记录</h3>
              <p className="text-xs text-gray-400">客流超阈值时自动触发的区间车方案</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: report.intervalBusTriggers.length > 0 ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.05)', color: report.intervalBusTriggers.length > 0 ? '#ff6b35' : '#9ca3af' }}>
            共 {report.intervalBusTriggers.length} 条
          </span>
        </div>
        {report.intervalBusTriggers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bus size={48} className="mx-auto mb-3 opacity-20" />
            <p>当日无区间车方案触发记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-400">线路</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-400">起点站</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-400">终点站</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-400">触发时间</th>
                  <th className="text-center py-3 px-3 text-xs font-medium text-gray-400">状态</th>
                </tr>
              </thead>
              <tbody>
                {report.intervalBusTriggers.map((t, idx) => {
                  const color = routeColor(t.routeId)
                  const statusMap = {
                    proposed: { label: '建议中', bg: 'rgba(0,240,255,0.1)', fg: '#00f0ff' },
                    active: { label: '已启用', bg: 'rgba(0,255,136,0.1)', fg: '#00ff88' },
                    cancelled: { label: '已取消', bg: 'rgba(255,45,85,0.1)', fg: '#ff2d55' },
                  }
                  const st = statusMap[t.status] || statusMap.proposed
                  return (
                    <tr key={t.id} style={{ borderBottom: idx < report.intervalBusTriggers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : undefined }}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 8px ${color}80` }} />
                          <span className="text-white font-medium">{t.routeName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-300">{t.fromStopId}</td>
                      <td className="py-3 px-3 text-gray-300">{t.toStopId}</td>
                      <td className="py-3 px-3 text-gray-300 font-mono text-xs">{new Date(t.triggeredAt).toLocaleString('zh-CN')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs px-2 py-1 rounded-md" style={{ background: st.bg, color: st.fg }}>
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="col-span-2 panel-card rounded-xl p-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">导出Excel报表</h3>
          <p className="text-xs text-gray-400">导出包含完整运营数据的Excel报表，含发车次数、平均满载率、充电次数、准点率</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 h-10 rounded-lg text-sm font-semibold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #00f0ff 0%, #00c8e0 100%)', color: '#0a0e27' }}>
          <Download size={18} />
          导出Excel
        </button>
      </div>
    </div>
  )
}
