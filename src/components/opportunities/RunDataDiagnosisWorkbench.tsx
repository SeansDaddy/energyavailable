import React, { useState, useMemo } from 'react';
import {
  Sun,
  BatteryCharging,
  Server,
  Calculator,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Download,
  Plus,
  Sliders,
  DollarSign,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  StorageCalculatorParams,
  StorageCalculatorResult,
  PvDiagnosticItem,
  PvWarrantyClaimItem,
  StorageRetrofitScanItem,
  DataCenterPueItem
} from '../../types/opportunityMining';
import {
  INITIAL_PV_DIAGNOSTICS,
  INITIAL_PV_WARRANTY_CLAIMS,
  INITIAL_STORAGE_SCANS,
  INITIAL_DATA_CENTER_PUES,
  calculateStorageEconomics
} from '../../mock/opportunityMiningData';

interface RunDataDiagnosisWorkbenchProps {
  onCreateCardFromTool: (newCardData: {
    title: string;
    domain: 'pv' | 'storage' | 'dc';
    targetObject: string;
    region: string;
    capacityScale: string;
    triggerType: 'diagnosis' | 'policy_price';
    triggerReason: string;
    irr: number;
    paybackYears: number;
    annualGainYuan: number;
    investmentYuan: number;
    suggestedAction: string;
  }) => void;
}

export const RunDataDiagnosisWorkbench: React.FC<RunDataDiagnosisWorkbenchProps> = ({
  onCreateCardFromTool
}) => {
  // Sub-tabs: F4 (Calculator), F1 (PV Diagnosis), F2 (Warranty Claims), F3 (Storage Scanner), F5 (Data Center PUE)
  const [subTab, setSubTab] = useState<'f4_calc' | 'f1_pv' | 'f2_claim' | 'f3_scan' | 'f5_pue'>('f4_calc');

  // F4 Interactive Calculator parameters state
  const [calcParams, setCalcParams] = useState<StorageCalculatorParams>({
    storagePowerMw: 20,
    storageCapacityMwh: 40,
    unitCostYuanPerWh: 0.70, // 0.70元/Wh
    peakValleySpreadYuan: 0.87, // 0.87元/kWh (如江苏新政)
    dailyCycles: 2, // 2充2放
    annualOperatingDays: 330,
    efficiencyPct: 88, // 88% RTE
    capacityRentalPriceYuanPerKwYear: 160, // 160元/kW·年
    ancillaryServiceGainYuan: 800000,
    discountRatePct: 6.5,
    projectLifespanYears: 10
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Live calculation results
  const calcResult: StorageCalculatorResult = useMemo(() => {
    return calculateStorageEconomics(calcParams);
  }, [calcParams]);

  // F1 State
  const [pvDiagnostics, setPvDiagnostics] = useState<PvDiagnosticItem[]>(INITIAL_PV_DIAGNOSTICS);

  // F2 State
  const [warrantyClaims, setWarrantyClaims] = useState<PvWarrantyClaimItem[]>(INITIAL_PV_WARRANTY_CLAIMS);

  // F3 State
  const [storageScans] = useState<StorageRetrofitScanItem[]>(INITIAL_STORAGE_SCANS);

  // F5 State
  const [dcPues] = useState<DataCenterPueItem[]>(INITIAL_DATA_CENTER_PUES);

  // Handle Generate Card from Calculator
  const handleGenerateCardFromCalc = () => {
    onCreateCardFromTool({
      title: `自定义测算：${calcParams.storagePowerMw}MW/${calcParams.storageCapacityMwh}MWh 储能配置商机方案`,
      domain: 'storage',
      targetObject: '高潜目标大工业客户 / 存量新能源电站',
      region: '华东区域 · 分时价差扩大省份',
      capacityScale: `${calcParams.storagePowerMw} MW / ${calcParams.storageCapacityMwh} MWh`,
      triggerType: 'policy_price',
      triggerReason: `基于峰谷电价差 ${calcParams.peakValleySpreadYuan} 元/kWh 与日均 ${calcParams.dailyCycles} 充放循环测算，达到全投资 IRR ${calcResult.irrPct}% 最优投资门槛。`,
      irr: calcResult.irrPct,
      paybackYears: calcResult.paybackYears,
      annualGainYuan: calcResult.annualTotalRevenueYuan,
      investmentYuan: calcResult.totalCapExYuan,
      suggestedAction: `携带《${calcParams.storagePowerMw}MW/${calcParams.storageCapacityMwh}MWh 储能立项投资回报表》预约客户能源总监，洽商合同能源管理或融资租赁方案。`
    });
    showToast('已根据当前测算参数一键生成商机卡片，并自动同步至商机中心！');
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-tab Navigation (Light Theme) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'f4_calc', label: 'F4 储能收益交互测算器', icon: Calculator, badge: '核心工具' },
            { id: 'f1_pv', label: 'F1 光伏健康诊断报告', icon: Sun, badge: 'PR对标' },
            { id: 'f2_claim', label: 'F2 组件衰减索赔助手', icon: ShieldAlert, badge: '证据包' },
            { id: 'f3_scan', label: 'F3 储能机会扫描器', icon: BatteryCharging, badge: 'IRR寻优' },
            { id: 'f5_pue', label: 'F5 数据中心PUE对标', icon: Server, badge: '政策红线' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 pr-2 hidden md:block">
          PRD V1.0 梯队一 · 从电站与工况运行数据中挖掘销售商机
        </div>
      </div>

      {/* F4: 储能收益交互测算器 */}
      {subTab === 'f4_calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Interactive Sliders (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">储能经济性敏捷测算参数调节</h3>
                  <p className="text-[11px] text-slate-500">实时调整系统容量、造价与电价差，右侧毫秒级重算收益模型</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setCalcParams({
                    storagePowerMw: 20,
                    storageCapacityMwh: 40,
                    unitCostYuanPerWh: 0.70,
                    peakValleySpreadYuan: 0.87,
                    dailyCycles: 2,
                    annualOperatingDays: 330,
                    efficiencyPct: 88,
                    capacityRentalPriceYuanPerKwYear: 160,
                    ancillaryServiceGainYuan: 800000,
                    discountRatePct: 6.5,
                    projectLifespanYears: 10
                  })
                }
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                title="恢复默认标杆参数"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Slider 1: 额定功率 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">储能额定功率 (MW)</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">{calcParams.storagePowerMw} MW</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={calcParams.storagePowerMw}
                  onChange={(e) => setCalcParams({ ...calcParams, storagePowerMw: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 MW</span>
                  <span>50 MW</span>
                  <span>100 MW</span>
                </div>
              </div>

              {/* Slider 2: 额定容量 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">储能额定容量 (MWh)</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">{calcParams.storageCapacityMwh} MWh</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={200}
                  step={2}
                  value={calcParams.storageCapacityMwh}
                  onChange={(e) => setCalcParams({ ...calcParams, storageCapacityMwh: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2 MWh</span>
                  <span>100 MWh</span>
                  <span>200 MWh</span>
                </div>
              </div>

              {/* Slider 3: 系统造价 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">系统单位造价 (元/Wh)</span>
                  <span className="font-bold text-amber-700 font-mono text-sm">¥ {calcParams.unitCostYuanPerWh.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.55}
                  max={1.30}
                  step={0.05}
                  value={calcParams.unitCostYuanPerWh}
                  onChange={(e) => setCalcParams({ ...calcParams, unitCostYuanPerWh: Number(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>¥0.55/Wh (底价)</span>
                  <span>¥1.30/Wh</span>
                </div>
              </div>

              {/* Slider 4: 峰谷价差 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">峰谷平均电价差 (元/kWh)</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">¥ {calcParams.peakValleySpreadYuan.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.40}
                  max={1.40}
                  step={0.02}
                  value={calcParams.peakValleySpreadYuan}
                  onChange={(e) => setCalcParams({ ...calcParams, peakValleySpreadYuan: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>¥0.40/kWh (平价省)</span>
                  <span>¥0.87 (苏/浙新政)</span>
                  <span>¥1.40 (粤尖峰)</span>
                </div>
              </div>

              {/* Slider 5: 日充放循环次数 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">日充放循环次数</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{calcParams.dailyCycles} 次/日</span>
                </div>
                <div className="flex gap-2">
                  {[1, 1.5, 2, 2.5].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCalcParams({ ...calcParams, dailyCycles: c })}
                      className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                        calcParams.dailyCycles === c
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c} 充 {c} 放
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 6: 容量租赁单价 */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">容量租赁单价 (元/kW·年)</span>
                  <span className="font-bold text-purple-700 font-mono text-sm">¥ {calcParams.capacityRentalPriceYuanPerKwYear}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300}
                  step={10}
                  value={calcParams.capacityRentalPriceYuanPerKwYear}
                  onChange={(e) => setCalcParams({ ...calcParams, capacityRentalPriceYuanPerKwYear: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 (不租赁)</span>
                  <span>¥160/kW (主流)</span>
                  <span>¥300/kW</span>
                </div>
              </div>
            </div>

            {/* Additional parameters bar */}
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
              <div>系统 RTE 充放效率：<strong className="text-slate-800">{calcParams.efficiencyPct}%</strong></div>
              <div>年有效运行天数：<strong className="text-slate-800">{calcParams.annualOperatingDays} 天</strong></div>
              <div>年辅助服务保底：<strong className="text-slate-800">{(calcParams.ancillaryServiceGainYuan / 10000).toFixed(0)} 万元</strong></div>
              <div>贴现率：<strong className="text-slate-800">{calcParams.discountRatePct}%</strong></div>
            </div>
          </div>

          {/* Right Column: Output Metrics & 10-Year Cash Flow (5 cols) in Light Theme */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">收益量化测算成果</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  动态精确仿真
                </span>
              </div>

              {/* Core 4 Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-center">
                  <div className="text-[11px] text-emerald-800 font-medium">全投资内部收益率 (IRR)</div>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5 font-mono">
                    {calcResult.irrPct}%
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    {calcResult.irrPct >= 12 ? '极佳收益，建议推进' : '达标，可做优化'}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">静态投资回收期</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                    {calcResult.paybackYears} <span className="text-xs font-normal text-slate-500">年</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">含衰减与运维成本</div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 text-center">
                  <div className="text-[11px] text-amber-800 font-medium">年综合总收益</div>
                  <div className="text-xl font-extrabold text-amber-700 mt-0.5 font-mono">
                    {(calcResult.annualTotalRevenueYuan / 10000).toFixed(0)} <span className="text-xs font-normal text-slate-500">万/年</span>
                  </div>
                  <div className="text-[10px] text-amber-700/80 mt-0.5">
                    套利 {(calcResult.annualArbitrageYuan / 10000).toFixed(0)}万 + 租赁 {(calcResult.annualRentalYuan / 10000).toFixed(0)}万
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] text-slate-500 font-medium">初始投资总额 (CapEx)</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-0.5 font-mono">
                    {(calcResult.totalCapExYuan / 10000).toFixed(0)} <span className="text-xs font-normal text-slate-500">万元</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">设备与安装集成</div>
                </div>
              </div>

              {/* 10-Year Cumulative Cash Flow Preview */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">10 年累计净现金流推演</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    + {(calcResult.tenYearCashFlow[9].cumulativeCash / 10000).toFixed(0)} 万元
                  </span>
                </div>
                <div className="h-16 flex items-end gap-1.5 pt-2">
                  {calcResult.tenYearCashFlow.map((cf) => {
                    const isPositive = cf.cumulativeCash >= 0;
                    const maxVal = calcResult.tenYearCashFlow[9].cumulativeCash;
                    const heightPct = Math.min(100, Math.max(15, Math.abs(cf.cumulativeCash) / (maxVal || 1) * 100));

                    return (
                      <div key={cf.year} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t transition-all ${
                            isPositive ? 'bg-emerald-500' : 'bg-rose-400'
                          }`}
                          title={`第 ${cf.year} 年累计现金: ${(cf.cumulativeCash / 10000).toFixed(0)} 万`}
                        />
                        <span className="text-[9px] text-slate-500">Y{cf.year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action: Generate Opportunity Card */}
            <div className="pt-2">
              <button
                onClick={handleGenerateCardFromCalc}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>基于此测算生成商机卡片 (F6)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F1: 光伏健康诊断报告 */}
      {subTab === 'f1_pv' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600" />
                <span>F1 光伏健康诊断报告生成器 (PR 落后差距与技改收益)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                实时对比全网电站性能比 (PR) 与区域标杆差距，量化损失电量并自动折算技改挽回收益
              </p>
            </div>
            <span className="text-xs text-slate-500">
              已纳管诊断站点：<strong className="text-slate-900">{pvDiagnostics.length}</strong> 座
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">电站名称 / 业主</th>
                  <th className="py-3 px-2 text-right">装机规模</th>
                  <th className="py-3 px-2 text-right">实测 PR</th>
                  <th className="py-3 px-2 text-right">标杆 PR</th>
                  <th className="py-3 px-2 text-right text-rose-600">PR 差距</th>
                  <th className="py-3 px-2 text-right text-amber-700">年损失电费</th>
                  <th className="py-3 px-3">核心缺陷归因</th>
                  <th className="py-3 px-3">推荐改造方案</th>
                  <th className="py-3 px-2 text-right text-emerald-600">技改 IRR</th>
                  <th className="py-3 px-3 text-center">商机卡片状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {pvDiagnostics.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{item.stationName}</div>
                      <div className="text-[11px] text-slate-500">{item.ownerGroup}</div>
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700">{item.installedCapacityMw} MW</td>
                    <td className="py-3 px-2 text-right font-mono">{item.actualPrPct}%</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-500">{item.benchmarkPrPct}%</td>
                    <td className="py-3 px-2 text-right font-bold text-rose-600 font-mono">-{item.prGapPct}%</td>
                    <td className="py-3 px-2 text-right font-bold text-amber-600 font-mono">
                      ¥ {(item.annualRevenueLossYuan / 10000).toFixed(0)} 万/年
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                        {item.defectLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs">{item.retrofitSolution}</td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-600 font-mono">{item.retrofitIrrPct}%</td>
                    <td className="py-3 px-3 text-center">
                      {item.cardGenerated ? (
                        <span className="text-[11px] text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                          已转商机卡片
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onCreateCardFromTool({
                              title: `${item.stationName} PR落后${item.prGapPct}% 综合整改技改商机`,
                              domain: 'pv',
                              targetObject: `${item.ownerGroup} · ${item.stationName}`,
                              region: '华北/华东光伏重点省份',
                              capacityScale: `${item.installedCapacityMw} MWp`,
                              triggerType: 'diagnosis',
                              triggerReason: `实测 PR 为 ${item.actualPrPct}%，落后标杆 ${item.prGapPct}%，年损失电量 ${item.annualGenerationLossMwh} MWh，年损失电费 ${item.annualRevenueLossYuan / 10000} 万元。`,
                              irr: item.retrofitIrrPct,
                              paybackYears: Number((item.estimatedRetrofitCostYuan / item.annualRevenueLossYuan).toFixed(1)),
                              annualGainYuan: item.annualRevenueLossYuan,
                              investmentYuan: item.estimatedRetrofitCostYuan,
                              suggestedAction: `携带《光伏健康诊断报告》向业主运维长讲解缺陷成因，主推 ${item.retrofitSolution}。`
                            });
                            setPvDiagnostics((prev) =>
                              prev.map((p) => (p.id === item.id ? { ...p, cardGenerated: true } : p))
                            );
                            showToast(`已成功将 ${item.stationName} 诊断结果转为商机卡片！`);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs"
                        >
                          一键转商机
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* F2: 组件衰减质保索赔助手 */}
      {subTab === 'f2_claim' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>F2 组件衰减与质保违约索赔助手 (质保保证线拟合与证据链)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                对标组件出厂合同质保衰减曲线，实测超标即刻生成第三方索赔证据包，辅助客户挽回经济损失
              </p>
            </div>
            <button
              onClick={() => showToast('已批量导出 3 份电站第三方组件衰减实测证据链压缩包 (ZIP)')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>批量导出证据包</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warrantyClaims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{claim.stationName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      claim.claimStatus === 'SETTLED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      claim.claimStatus === 'READY_TO_CLAIM' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {claim.claimStatus === 'SETTLED' ? '索赔已达成' : claim.claimStatus === 'READY_TO_CLAIM' ? '待出具索赔函' : '索赔协商中'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-3">
                    {claim.moduleManufacturer} · 投运 {claim.operatingYears} 年 · {claim.totalModulesCount.toLocaleString()} 片
                  </div>

                  {/* Degradation Compare */}
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">质保约定允许衰减上限</span>
                      <span className="font-mono text-slate-800">{claim.contractMaxDegradationPct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">实测实际累计衰减</span>
                      <span className="font-mono text-rose-600 font-bold">{claim.actualMeasuredDegradationPct}%</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-1 border-t border-slate-100">
                      <span className="text-rose-700">超标违约衰减差值</span>
                      <span className="text-rose-600 font-mono">+{claim.excessDegradationPct}% (违约)</span>
                    </div>
                  </div>

                  {/* Claim Amount */}
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                    <span className="text-amber-900 font-medium">建议索赔主张金额</span>
                    <span className="font-extrabold text-amber-700 text-sm font-mono">
                      ¥ {(claim.claimAmountYuan / 10000).toFixed(0)} 万元
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 truncate max-w-[180px]" title={claim.legalClauseRef}>
                    {claim.legalClauseRef}
                  </span>
                  <button
                    onClick={() => showToast(`已下载 ${claim.stationName} 索赔证据链 PDF`)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>证据包</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F3: 加装储能机会扫描器 */}
      {subTab === 'f3_scan' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>F3 加装储能机会扫描器 (按全投资 IRR 智能寻优排序)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                全网光伏及工商业用电负荷扫描，基于弃电率与峰谷电价差自动推荐配储容量与寻优回报率
              </p>
            </div>
            <span className="text-xs text-slate-500">
              已扫描最优配储站点：<strong className="text-slate-900">{storageScans.length}</strong> 个
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storageScans.map((scan) => (
              <div key={scan.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                        #{scan.priorityRank}
                      </span>
                      {scan.stationName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      {scan.type === 'PV_COLOCATED' ? '光伏配储' : '工商业用户侧'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500">推荐容量</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">{scan.recommendedStorageMw}MW/{scan.recommendedStorageMwh}MWh</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500">测算 IRR</div>
                      <div className="font-extrabold text-emerald-600 text-sm mt-0.5 font-mono">{scan.projectedIrrPct}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="text-[10px] text-slate-500">回收周期</div>
                      <div className="font-bold text-slate-900 text-xs mt-0.5">{scan.projectedPaybackYears} 年</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">建议总投资额：</span>
                      <span className="font-semibold text-slate-900">¥ {(scan.estimatedCapExYuan / 10000).toFixed(0)} 万元</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">年化综合收益：</span>
                      <span className="font-bold text-amber-700">¥ {(scan.annualGainYuan / 10000).toFixed(0)} 万元/年</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => {
                      onCreateCardFromTool({
                        title: `${scan.stationName} 加装 ${scan.recommendedStorageMw}MW/${scan.recommendedStorageMwh}MWh 储能项目商机`,
                        domain: 'storage',
                        targetObject: scan.stationName,
                        region: '华东/西北区域重点项目',
                        capacityScale: `${scan.recommendedStorageMw}MW / ${scan.recommendedStorageMwh}MWh`,
                        triggerType: 'policy_price',
                        triggerReason: `扫描器算法寻优结果排名前列，全投资 IRR 达到 ${scan.projectedIrrPct}%，回本期 ${scan.projectedPaybackYears} 年。`,
                        irr: scan.projectedIrrPct,
                        paybackYears: scan.projectedPaybackYears,
                        annualGainYuan: scan.annualGainYuan,
                        investmentYuan: scan.estimatedCapExYuan,
                        suggestedAction: `携带容量配置寻优方案拜访投资人，提供 EPC 或合同能源管理投资分成报价。`
                      });
                      showToast(`已将 ${scan.stationName} 扫描成果一键转为商机卡片！`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                  >
                    生成商机卡片
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F5: 数据中心 PUE 对标诊断 */}
      {subTab === 'f5_pue' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-600" />
                <span>F5 数据中心 PUE 对标诊断与节能改造商机</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                对标国家发改委及各省工信厅 1.25 / 1.30 准入红线，量化超标电量与阶梯加价罚款风险
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dcPues.map((dc) => (
              <div key={dc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{dc.facilityName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dc.complianceRiskLevel === 'HIGH_PENALTY' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      dc.complianceRiskLevel === 'MEDIUM_WARNING' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {dc.complianceRiskLevel === 'HIGH_PENALTY' ? '高危阶梯加价' : dc.complianceRiskLevel === 'MEDIUM_WARNING' ? '黄色限期整改' : '合规准入'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    {dc.operator} · {dc.cabinetCount} 机柜 (IT负荷 {dc.itLoadMw}MW)
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5 mb-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">当前实测年度 PUE</span>
                      <span className="font-extrabold text-rose-600 text-sm font-mono">{dc.currentAnnualPue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">当地政策红线标准</span>
                      <span className="text-slate-700 font-mono">≤ {dc.policyBenchmarkPue}</span>
                    </div>
                    <div className="flex justify-between text-amber-800 font-medium pt-1 border-t border-slate-100">
                      <span>年超标浪费电费</span>
                      <span className="font-bold text-amber-700 font-mono">¥ {(dc.wastedElectricityBillYuan / 10000).toFixed(0)} 万元</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="text-[11px] text-slate-500">推荐方案：{dc.coolingRetrofitScheme}</div>
                    <div className="flex justify-between text-[11px]">
                      <span>技改预算：¥ {(dc.retrofitCostYuan / 10000).toFixed(0)} 万</span>
                      <span className="text-emerald-600 font-bold font-mono">技改 IRR：{dc.retrofitIrrPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => {
                      onCreateCardFromTool({
                        title: `${dc.facilityName} PUE由${dc.currentAnnualPue}降至${dc.policyBenchmarkPue}节能技改商机`,
                        domain: 'dc',
                        targetObject: `${dc.operator} · ${dc.facilityName}`,
                        region: '重点算力集群省份',
                        capacityScale: `${dc.cabinetCount} 机柜`,
                        triggerType: 'diagnosis',
                        triggerReason: `实测年均运行 PUE 为 ${dc.currentAnnualPue}，超出当地红线 ${dc.policyBenchmarkPue}；年浪费电量 ${dc.wastedPowerKwh} 度，电费超支 ${dc.wastedElectricityBillYuan / 10000} 万元。`,
                        irr: dc.retrofitIrrPct,
                        paybackYears: Number((dc.retrofitCostYuan / dc.wastedElectricityBillYuan).toFixed(1)),
                        annualGainYuan: dc.wastedElectricityBillYuan,
                        investmentYuan: dc.retrofitCostYuan,
                        suggestedAction: `携带《数据中心PUE对标与能耗审计方案》约见机电总监，提供 ${dc.coolingRetrofitScheme} 并承诺合同节能量对赌。`
                      });
                      showToast(`已为 ${dc.facilityName} 生成数据中心节能商机卡片！`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                  >
                    生成商机卡片
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
