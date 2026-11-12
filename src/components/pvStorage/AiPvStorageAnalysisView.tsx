import React, { useState } from 'react';
import {
  Sun,
  BatteryCharging,
  Zap,
  Activity,
  Sparkles,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Cpu,
  Clock,
  Car
} from 'lucide-react';

interface DispatchPolicy {
  id: string;
  name: string;
  type: 'ARBITRAGE' | 'PEAK_SHAVING' | 'GREEN_MAX';
  typeLabel: string;
  expectedProfit: string;
  description: string;
  triggerCondition: string;
  status: 'ACTIVE' | 'STANDBY' | 'PENDING';
  statusLabel: string;
}

const POLICIES: DispatchPolicy[] = [
  {
    id: 'pol-1',
    name: '午间光伏大发预储 + 晚尖峰深度放电双循环套利',
    type: 'ARBITRAGE',
    typeLabel: '分时套利',
    expectedProfit: '+¥4,680 / 日',
    description: '监测到明日 11:30~13:30 屋顶光伏预计出力达 780kW 大于园区基础负载，提前调度 500kW 储能进入 0.8C 满额吸收充电，在 18:00~21:00 晚尖峰电价(1.38元/度)期间全功率放电。',
    triggerCondition: '光伏出力 > 园区负荷 200kW 持续 30 分钟',
    status: 'ACTIVE',
    statusLabel: '运行中'
  },
  {
    id: 'pol-2',
    name: '变压器容量动态越限防护与超快充桩群自适应降额',
    type: 'PEAK_SHAVING',
    typeLabel: '需量控制',
    expectedProfit: '节省需量电费 ¥1.8万/月',
    description: '当 8 座 120kW 充电桩群同时出现多台重卡/乘用车充电峰值（负荷 > 1450kVA），AI 触发桩群毫秒级动态功率均衡，并启动储能 250kW 瞬时顶峰，确保 1600kVA 主变安全裕度 > 15%。',
    triggerCondition: '变压器负荷率 > 85% 预警阈值',
    status: 'ACTIVE',
    statusLabel: '智能联锁中'
  },
  {
    id: 'pol-3',
    name: '园区光伏绿电优先直充电动汽车消纳最大化',
    type: 'GREEN_MAX',
    typeLabel: '绿电自用',
    expectedProfit: '碳减排 14.8吨/月',
    description: '通过桩端车机通信动态识别充电需求，引导园区通勤车辆与物流货车在中午平段与光伏大发时段有序充电，实现绿电就地消纳率超 95%，规避反向送网损耗。',
    triggerCondition: '晴好天气且日均绿电充能占比预测 < 70%',
    status: 'STANDBY',
    statusLabel: '就绪备用'
  }
];

export const AiPvStorageAnalysisView: React.FC = () => {
  const [policies, setPolicies] = useState<DispatchPolicy[]>(POLICIES);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [aiMode, setAiMode] = useState<'AUTOPILOT' | 'SUPERVISED' | 'MANUAL'>('AUTOPILOT');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyPolicy = (policyId: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === policyId ? { ...p, status: 'ACTIVE', statusLabel: '已下发执行' } : p))
    );
    showToast(`已向现场 EMS 调度系统下发优化策略指令！`);
  };

  return (
    <div className="space-y-5 p-5 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sun className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              AI 光储充协同运营分析
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold font-mono">
              MICROGRID AI OPTIMIZER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            面向工商业分布式光伏、储能与超级充电桩群的多能协同控制中心。依托高精度气象出力预测与负荷预测算法，毫秒级自适应调控充放电时序，最大化绿电自发自用与分时价差套利。
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAiMode('AUTOPILOT')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                aiMode === 'AUTOPILOT'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI 自主托管
            </button>
            <button
              type="button"
              onClick={() => setAiMode('SUPERVISED')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                aiMode === 'SUPERVISED'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              人机协同核验
            </button>
          </div>

          <button
            type="button"
            onClick={() => showToast('已成功向现场微网控制器下发全局协同策略与分时参数！')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>全站策略一键下发</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>今日光伏自发自用率</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            94.6% <span className="text-xs font-normal text-slate-500 font-sans">(+12.8%)</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">防逆流零弃光受控运行</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>峰谷价差套利净收益</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ¥18,920 <span className="text-xs font-normal text-slate-500">/ 日</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">本月累计套利 ¥43.6 万元</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>主变容量动态削峰</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            0 次越限 <span className="text-xs font-normal text-slate-500 font-sans">(削峰 385kW)</span>
          </div>
          <div className="text-[10px] text-blue-700 font-medium mt-0.5">保护 1600kVA 主变不超温</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>快充桩群绿电充能占比</span>
            <Car className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-600 mt-1">
            72.4% <span className="text-xs font-normal text-slate-500 font-sans">(14,200 kWh)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">日减碳排放 11.4 吨</div>
        </div>
      </div>

      {/* Energy Flow & Microgrid Topology Diagram */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              微电网能量流向实时拓扑与功率分布
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            微网总装机: 光伏 850kWp · 储能 500kW/1000kWh · 充电 8×120kW · 变压器 1600kVA
          </span>
        </div>

        {/* Visual Topological Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          {/* Node 1: PV Array */}
          <div className="p-3 rounded-lg bg-white border border-amber-300 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>分布式光伏</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">发电中</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">682 kW</div>
              <div className="text-[10px] text-slate-500 font-mono">装机: 850 kWp · 辐照良好</div>
            </div>
            <div className="text-[10px] text-emerald-700 font-medium">95.2% 直接进入园区与储能</div>
          </div>

          {/* Node 2: BESS */}
          <div className="p-3 rounded-lg bg-white border border-emerald-300 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <BatteryCharging className="w-4 h-4 text-emerald-500" />
                <span>分布式储能</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">恒功率充电</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-emerald-600">+380 kW</div>
              <div className="text-[10px] text-slate-500 font-mono">SOC: 68.4% · 0.76C</div>
            </div>
            <div className="text-[10px] text-slate-500">午间消纳光伏大发电量</div>
          </div>

          {/* Node 3: EV Fast Chargers */}
          <div className="p-3 rounded-lg bg-white border border-teal-300 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <Car className="w-4 h-4 text-teal-600" />
                <span>超快充桩群</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-100 text-teal-800 font-bold">8/8 在线</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">420 kW</div>
              <div className="text-[10px] text-slate-500 font-mono">6 台车正在充电 · 功率受控</div>
            </div>
            <div className="text-[10px] text-teal-700 font-medium">绿电直供占比 74%</div>
          </div>

          {/* Node 4: Factory Load */}
          <div className="p-3 rounded-lg bg-white border border-slate-300 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>园区生产负载</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 font-bold">平峰用电</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">540 kW</div>
              <div className="text-[10px] text-slate-500 font-mono">生产车间 A/B 正常运转</div>
            </div>
            <div className="text-[10px] text-slate-500">无高阶冲击负荷</div>
          </div>

          {/* Node 5: 10kV Utility Grid */}
          <div className="p-3 rounded-lg bg-white border border-indigo-300 shadow-2xs flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>10kV 电网并网点</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800 font-bold">防逆流合规</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-slate-900">658 kW</div>
              <div className="text-[10px] text-slate-500 font-mono">变压器负荷率 41.1%</div>
            </div>
            <div className="text-[10px] text-indigo-700 font-medium">防逆流安全裕量充足</div>
          </div>
        </div>
      </div>

      {/* 24-Hour AI Dispatch Simulation Curve Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>今日 24 小时 AI 出力预测与充放电优化时序</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              横坐标为时间(00:00~24:00)，虚线为电网分时电价时段，彩色曲线为 AI 优化调控出的储能与负荷出力响应。
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-1 bg-amber-500 rounded-full"></span>
              <span>光伏出力预测</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-1 bg-blue-500 rounded-full"></span>
              <span>园区常规负荷</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-1 bg-emerald-500 rounded-full"></span>
              <span>储能充放功率</span>
            </span>
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2.5 h-1 bg-teal-500 rounded-full"></span>
              <span>快充桩群用电</span>
            </span>
          </div>
        </div>

        {/* Visual Simulated SVG Chart */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 overflow-x-auto">
          <div className="min-w-[650px] space-y-2">
            <div className="h-44 relative flex items-end justify-between px-2 pt-6">
              {/* Background Tariffs Bands */}
              <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-40">
                <div className="bg-blue-100 border-r border-blue-200 flex items-start justify-center pt-2 text-[10px] font-mono text-blue-700">
                  深谷电价 0.28元
                </div>
                <div className="bg-amber-100 border-r border-amber-200 flex items-start justify-center pt-2 text-[10px] font-mono text-amber-800">
                  早高峰 1.08元
                </div>
                <div className="bg-emerald-100 border-r border-emerald-200 flex items-start justify-center pt-2 text-[10px] font-mono text-emerald-800">
                  平段电价 0.65元
                </div>
                <div className="bg-rose-100 flex items-start justify-center pt-2 text-[10px] font-mono text-rose-800 font-bold">
                  尖峰电价 1.38元
                </div>
              </div>

              {/* Sample simulated bars representing dispatch blocks */}
              {[
                { time: '02:00', pv: 0, load: 320, bess: 400, bessAct: '谷充' },
                { time: '05:00', pv: 0, load: 350, bess: 400, bessAct: '谷充' },
                { time: '08:00', pv: 180, load: 780, bess: -350, bessAct: '早峰放' },
                { time: '10:00', pv: 520, load: 840, bess: -300, bessAct: '早峰放' },
                { time: '12:00', pv: 810, load: 620, bess: 450, bessAct: '午间吸光' },
                { time: '14:00', pv: 680, load: 600, bess: 300, bessAct: '午间吸光' },
                { time: '16:00', pv: 320, load: 750, bess: 0, bessAct: '待机' },
                { time: '18:00', pv: 40, load: 920, bess: -480, bessAct: '尖峰放' },
                { time: '20:00', pv: 0, load: 860, bess: -480, bessAct: '尖峰放' },
                { time: '22:00', pv: 0, load: 450, bess: 0, bessAct: '待机' }
              ].map((pt, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10 text-[10px] font-mono">
                  <span
                    className={`px-1 rounded text-[9px] font-bold ${
                      pt.bess > 0
                        ? 'bg-emerald-600 text-white'
                        : pt.bess < 0
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {pt.bessAct}
                  </span>
                  <div className="w-8 bg-slate-200 rounded-t h-28 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-amber-400 rounded-t transition-all"
                      style={{ height: `${(pt.pv / 850) * 100}%` }}
                      title={`光伏出力: ${pt.pv}kW`}
                    />
                  </div>
                  <span className="text-slate-500">{pt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Policies & Dispatch Recommendation List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI 智能优化策略与调度工单清单</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              AI 引擎根据明日气象模型、负荷预测与电价时段，动态生成的现场执行策略。
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            当前纳管策略: {policies.length} 项
          </span>
        </div>

        <div className="space-y-3">
          {policies.map(policy => (
            <div
              key={policy.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white transition-all shadow-2xs space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      policy.type === 'ARBITRAGE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : policy.type === 'PEAK_SHAVING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {policy.typeLabel}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {policy.name}
                  </span>
                  <span className="font-mono text-emerald-600 font-bold text-xs">
                    预期效益: {policy.expectedProfit}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {policy.statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyPolicy(policy.id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Play className="w-3 h-3" />
                    <span>采纳下发</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {policy.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>触发条件: {policy.triggerCondition}</span>
                <span className="text-emerald-700 font-sans font-medium">下发对象: 现场 EMS 调度中枢</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
