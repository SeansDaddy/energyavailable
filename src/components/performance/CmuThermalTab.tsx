import React, { useState } from 'react';
import { CmuThermalRecord } from '../../types/performanceEvaluation';
import {
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Wind,
  Droplets,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Info,
  Wrench
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';

interface CmuThermalTabProps {
  cmuRecords: CmuThermalRecord[];
}

export const CmuThermalTab: React.FC<CmuThermalTabProps> = ({ cmuRecords }) => {
  const [selectedCmu, setSelectedCmu] = useState<CmuThermalRecord>(
    cmuRecords.find(c => c.thermalStatus === 'OVERHEATED') || cmuRecords[0]
  );

  const maxTempRecord = cmuRecords.reduce(
    (max, cur) => (cur.maxTemp > max.maxTemp ? cur : max),
    cmuRecords[0]
  );

  const maxDeltaT = Math.max(...cmuRecords.map(c => c.deltaT));

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-bold text-slate-900">运行温度记录与分析 (CMU)</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                热管理状态与一致性
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              记录各储能簇 CMU 电芯温度与仓内环境温度，评估液冷换热效率、温度极差一致性，精准定位局部积热与制冷短板。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-rose-600">电芯最高测点温</div>
              <div className="text-base font-black text-rose-700 font-mono mt-0.5">
                {maxTempRecord.maxTemp} ℃
              </div>
              <div className="text-[9px] text-rose-400 font-mono mt-0.5">{maxTempRecord.cmuCode}</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-amber-700">系统最大温差 ΔT</div>
              <div className="text-base font-black text-amber-700 font-mono mt-0.5">
                {maxDeltaT} ℃
              </div>
              <div className="text-[9px] text-amber-600 mt-0.5">超标 (标准 ≤3.0℃)</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-center min-w-[110px]">
              <div className="text-[11px] text-blue-700">温控模式</div>
              <div className="text-base font-bold text-blue-800 mt-0.5 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>智能液冷</span>
              </div>
              <div className="text-[9px] text-blue-500 mt-0.5">乙二醇水循环</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Temp Trend Curve */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              CMU 温度 vs 仓内环境温度 24小时逐时变化曲线
            </h3>
            <span className="text-[11px] text-slate-400">
              当前展示：<strong>{selectedCmu.cmuCode}</strong> ({selectedCmu.location})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">切换 CMU 测点:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {cmuRecords.map(c => (
                <button
                  key={c.cmuId}
                  onClick={() => setSelectedCmu(c)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                    selectedCmu.cmuId === c.cmuId
                      ? 'bg-white text-blue-600 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.cmuCode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={selectedCmu.hourlyTrends}
              margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis domain={[15, 45]} stroke="#94a3b8" tick={{ fontSize: 11 }} unit="℃" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl space-y-1">
                        <div className="font-bold text-blue-300 font-mono">{label} 实测工况</div>
                        <div>电芯最高温: <strong className="text-rose-400 font-mono">{payload[0]?.value} ℃</strong></div>
                        <div>仓内环境温: <strong className="text-amber-300 font-mono">{payload[1]?.value} ℃</strong></div>
                        <div>制冷功耗: <strong className="text-emerald-300 font-mono">{selectedCmu?.hourlyTrends?.find(t => t.time === label)?.coolingPowerKw || '--'} kW</strong></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceLine y={35} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '电芯温控警戒线 35℃', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '跳闸保护阈值 40℃', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
              <Line
                type="monotone"
                dataKey="cmuTemp"
                name="CMU 电芯测点温度 (℃)"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="ambientTemp"
                name="舱内环境温度 (℃)"
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CMU Sensor Nodes Status Cards & Thermal Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cmuRecords.map(cmu => {
          const isSelected = selectedCmu.cmuId === cmu.cmuId;
          return (
            <div
              key={cmu.cmuId}
              onClick={() => setSelectedCmu(cmu)}
              className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        cmu.thermalStatus === 'OVERHEATED'
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 font-mono text-sm">{cmu.cmuCode}</div>
                      <div className="text-[11px] text-slate-400">{cmu.cluster}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cmu.thermalStatus === 'OVERHEATED'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {cmu.thermalStatus === 'OVERHEATED' ? '局部积热超标' : '温控正常'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">当前温度</span>
                    <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                      {cmu.currentTemp} ℃
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">最高峰值</span>
                    <div className={`font-mono font-bold text-sm mt-0.5 ${cmu.maxTemp > 35 ? 'text-red-600' : 'text-slate-800'}`}>
                      {cmu.maxTemp} ℃
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400">测点极差 ΔT</span>
                    <div className={`font-mono font-bold text-sm mt-0.5 ${cmu.deltaT > 3.0 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {cmu.deltaT} ℃
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  <strong>测点物理位置:</strong> {cmu.location}
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Wrench className="w-3 h-3 text-blue-600" />
                    <span>热管理优化建议:</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{cmu.thermalAdvice}</p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-medium">
                <span>点击查看趋势</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
