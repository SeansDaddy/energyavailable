import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BaselineConditionInput,
  BaselineConditionEvaluationResult,
  BaselineEvaluationTaskRecord,
  OperatingScenario,
  ThermalCoolingType
} from '../../types/baselineConditionEvaluation';
import {
  SCENARIO_PRESETS,
  calculateBaselineConditionEvaluation
} from '../../utils/baselineConditionCalculationEngine';
import {
  FileCheck2,
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Info,
  Layers,
  CheckCircle2,
  Zap,
  Building,
  Radio,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertCircle,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Mountain,
  Sliders,
  Calendar,
  Lock,
  Link2,
  Clock,
  DollarSign,
  Coins,
  ChevronRight
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

interface BaselineConditionTaskEditorProps {
  initialTask?: BaselineEvaluationTaskRecord | null;
  onSaveTask: (task: BaselineEvaluationTaskRecord) => void;
  onCancel: () => void;
}

export const BaselineConditionTaskEditor: React.FC<BaselineConditionTaskEditorProps> = ({
  initialTask,
  onSaveTask,
  onCancel
}) => {
  const { sites, currentUser } = useApp();

  // Active form section tab
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'cycling' | 'thermal' | 'commercial'>('basic');

  // Task name and task number
  const [taskName, setTaskName] = useState<string>(
    initialTask?.taskName || '某集中式储能电站灵活质保基准工况推演与签约评估'
  );
  const [taskNo] = useState<string>(
    initialTask?.taskNo || `BC-EVAL-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`
  );

  // Form input state
  const [inputState, setInputState] = useState<BaselineConditionInput>(() => {
    if (initialTask) {
      return initialTask.input;
    }
    const defaultSite = sites[0] || {
      id: 'site-001',
      siteName: '深圳光明储能电站二期-04号站',
      region: '华南区',
      customer: '南方电网深圳供电局',
      capacityMw: 10.0
    };

    return {
      entryMode: 'site_select',
      selectedSiteId: defaultSite.id,
      siteName: defaultSite.siteName,
      region: defaultSite.region,
      customerName: defaultSite.customer,
      operatingScenario: 'PEAK_VALLEY_ARBITRAGE',
      operatingScenarioLabel: '工商业/电网侧常规峰谷套利',
      capacityMw: defaultSite.capacityMw || 10.0,
      capacityMwh: (defaultSite.capacityMw || 10.0) * 2.0,
      cellManufacturer: '宁德时代 LFP 3.2V 280Ah',
      batteryChemistry: '磷酸铁锂 (LFP)',
      commissioningDate: '2024-06-15',
      warrantyPeriodYears: 10,
      guaranteedEndSohPct: 70.0,
      nominalCrate: 0.5,
      dailyFullEquivalentCycles: 1.8,
      depthOfDischargeDodPct: 90.0,
      socOperatingLowerPct: 10.0,
      socOperatingUpperPct: 90.0,
      annualOperatingDays: 350,
      coolingType: 'LIQUID_COOLING',
      coolingTypeLabel: '高效变频液冷温控系统',
      baselineCellTempC: 25.5,
      allowedCellTempMinC: 15.0,
      allowedCellTempMaxC: 35.0,
      extremeHighTempDaysPerYear: 15,
      maxCellTempDifferenceC: 2.8,
      expectedAnnualThroughputMwh: (defaultSite.capacityMw || 10.0) * 2.0 * 1.8 * 350 * 0.9,
      auxPowerConsumptionRatioPct: 2.8,
      highPowerPulseRatioPct: 5.0,
      warrantyPricingPerWhPerYear: 0.045,
      warrantyRetentionDepositPct: 5.0,
      penaltyPerOnePctSohBreachYuan: 20.0
    };
  });

  // Handle in-system site selection
  const handleSelectExistingSite = (siteId: string) => {
    const s = sites.find((x) => x.id === siteId);
    if (!s) return;
    setInputState((prev) => ({
      ...prev,
      selectedSiteId: s.id,
      siteName: s.siteName,
      region: s.region,
      customerName: s.customer,
      capacityMw: s.capacityMw,
      capacityMwh: s.capacityMw * 2.0,
      expectedAnnualThroughputMwh: s.capacityMw * 2.0 * prev.dailyFullEquivalentCycles * prev.annualOperatingDays * 0.9
    }));
    setTaskName(`${s.siteName} 灵活质保基准工况评估`);
  };

  // Handle Scenario preset change
  const handleApplyScenarioPreset = (scenarioKey: OperatingScenario) => {
    const preset = SCENARIO_PRESETS[scenarioKey];
    if (!preset) return;

    setInputState((prev) => ({
      ...prev,
      operatingScenario: scenarioKey,
      operatingScenarioLabel: preset.name,
      nominalCrate: preset.nominalCrate,
      dailyFullEquivalentCycles: preset.dailyCycles,
      depthOfDischargeDodPct: preset.dodPct,
      socOperatingLowerPct: preset.socRange[0],
      socOperatingUpperPct: preset.socRange[1],
      coolingType: preset.cooling,
      coolingTypeLabel: preset.cooling === 'LIQUID_COOLING' ? '高效变频液冷温控系统' : '强制风冷风道循环系统',
      allowedCellTempMinC: preset.tempAllowed[0],
      allowedCellTempMaxC: preset.tempAllowed[1],
      highPowerPulseRatioPct: preset.pulseRatio,
      expectedAnnualThroughputMwh: prev.capacityMwh * preset.dailyCycles * prev.annualOperatingDays * 0.9
    }));
  };

  // Live real-time evaluation calculation
  const evaluationResult: BaselineConditionEvaluationResult = useMemo(() => {
    return calculateBaselineConditionEvaluation(inputState);
  }, [inputState]);

  // Handle Save
  const handleSave = () => {
    const newTask: BaselineEvaluationTaskRecord = {
      id: initialTask?.id || `bc-task-${Date.now()}`,
      taskNo,
      taskName,
      siteName: inputState.siteName,
      region: inputState.region,
      customerName: inputState.customerName,
      createdAt: initialTask?.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      creator: initialTask?.creator || `${currentUser.name} (${currentUser.roleTitle || '工程师'})`,
      status: 'COMPLETED',
      input: inputState,
      result: evaluationResult
    };

    onSaveTask(newTask);
  };

  return (
    <div className="space-y-4">
      {/* 顶部标题栏与面包屑 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="返回列表"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {taskNo}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {initialTask ? '编辑/调整基准工况评估任务' : '新建灵活质保基准工况评估'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              输入充放电策略、环境温控与负荷参数，实时推演全生命周期 SOH 衰减曲线与质保履约风控
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors cursor-pointer"
          >
            取消返回
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>保存并生成评估任务报告</span>
          </button>
        </div>
      </div>

      {/* 任务名称快速设置 */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 shrink-0">评估任务名称：</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium text-slate-800"
            placeholder="请输入评估任务名称..."
          />
        </div>
      </div>

      {/* 主工作区：左侧多维度工况输入 + 右侧实时推演看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧：工况输入参数卡片 (7 栏) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* 4 大维度选项卡导航 */}
            <div className="flex border-b border-slate-200/80 bg-slate-50/60 p-1.5 gap-1">
              <button
                onClick={() => setActiveFormTab('basic')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'basic'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>1. 场景与基础资产</span>
              </button>

              <button
                onClick={() => setActiveFormTab('cycling')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'cycling'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>2. 充放电循环负荷</span>
              </button>

              <button
                onClick={() => setActiveFormTab('thermal')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'thermal'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                <span>3. 热管理与温区</span>
              </button>

              <button
                onClick={() => setActiveFormTab('commercial')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeFormTab === 'commercial'
                    ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/70'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>4. 商务质保与对赌条款</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* TAB 1: 场景与基础资产 */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  {/* 数据录入模式选择 */}
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">录入模式：</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="entryMode"
                        checked={inputState.entryMode === 'site_select'}
                        onChange={() => setInputState({ ...inputState, entryMode: 'site_select' })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>从在册储能电站快速导入</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                      <input
                        type="radio"
                        name="entryMode"
                        checked={inputState.entryMode === 'manual'}
                        onChange={() => setInputState({ ...inputState, entryMode: 'manual' })}
                        className="text-blue-600 focus:ring-0"
                      />
                      <span>手动自定义录入新建站</span>
                    </label>
                  </div>

                  {/* 场景预设快捷套用 */}
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-blue-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        应用工况典型场景预设模板
                      </span>
                      <span className="text-[11px] text-slate-500">一键带入行业基准参数</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(SCENARIO_PRESETS) as OperatingScenario[]).map((scKey) => {
                        const isSelected = inputState.operatingScenario === scKey;
                        const p = SCENARIO_PRESETS[scKey];
                        return (
                          <button
                            key={scKey}
                            type="button"
                            onClick={() => handleApplyScenarioPreset(scKey)}
                            className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200/80 hover:border-blue-300'
                            }`}
                          >
                            <div className="font-bold text-xs truncate">{p.name}</div>
                            <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {p.nominalCrate}C · {p.dailyCycles}次/日 · {p.dodPct}% DOD
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {inputState.entryMode === 'site_select' && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">选择在册电站：</label>
                      <select
                        value={inputState.selectedSiteId}
                        onChange={(e) => handleSelectExistingSite(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        {sites.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.siteCode} - {s.siteName} ({s.capacityMw}MW / {s.region})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">电站名称</label>
                      <input
                        type="text"
                        value={inputState.siteName}
                        onChange={(e) => setInputState({ ...inputState, siteName: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">所属业主 / 客户</label>
                      <input
                        type="text"
                        value={inputState.customerName}
                        onChange={(e) => setInputState({ ...inputState, customerName: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">储能功率 (MW)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputState.capacityMw}
                        onChange={(e) => setInputState({ ...inputState, capacityMw: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">储能容量 (MWh)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={inputState.capacityMwh}
                        onChange={(e) => setInputState({ ...inputState, capacityMwh: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">承诺质保年限 (年)</label>
                      <select
                        value={inputState.warrantyPeriodYears}
                        onChange={(e) => setInputState({ ...inputState, warrantyPeriodYears: parseInt(e.target.value, 10) || 10 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                      >
                        <option value={5}>5 年标准期</option>
                        <option value={8}>8 年延长质保</option>
                        <option value={10}>10 年长效灵活质保</option>
                        <option value={12}>12 年全生命周期</option>
                        <option value={15}>15 年深度质保</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">保证终止 SOH (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputState.guaranteedEndSohPct}
                        onChange={(e) => setInputState({ ...inputState, guaranteedEndSohPct: parseFloat(e.target.value) || 70.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">电芯制造商与型号</label>
                      <input
                        type="text"
                        value={inputState.cellManufacturer}
                        onChange={(e) => setInputState({ ...inputState, cellManufacturer: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">商业投运起始日期 (COD)</label>
                      <input
                        type="date"
                        value={inputState.commissioningDate}
                        onChange={(e) => setInputState({ ...inputState, commissioningDate: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 充放电策略与循环强度 */}
              {activeFormTab === 'cycling' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                    <span className="font-semibold text-slate-800">工况负荷设定说明：</span>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      充放电倍率与每日等效完全循环次数 (FEC) 构成电池电化学机械疲劳应力的主要来源，超额循环将显著推高年化 SOH 衰减速率。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">基准标称充放倍率 (C)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={inputState.nominalCrate}
                        onChange={(e) => setInputState({ ...inputState, nominalCrate: parseFloat(e.target.value) || 0.5 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">常规两充两放为 0.5C</span>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">日等效循环次数 (FEC/日)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputState.dailyFullEquivalentCycles}
                        onChange={(e) => setInputState({ ...inputState, dailyFullEquivalentCycles: parseFloat(e.target.value) || 1.5 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">年等效 FEC: {Math.round(inputState.dailyFullEquivalentCycles * inputState.annualOperatingDays)} 次</span>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">标称放电深度 DOD (%)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={inputState.depthOfDischargeDodPct}
                        onChange={(e) => setInputState({ ...inputState, depthOfDischargeDodPct: parseFloat(e.target.value) || 90.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">建议 80%~90%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">常用 SOC 运行下限 (%)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={inputState.socOperatingLowerPct}
                        onChange={(e) => setInputState({ ...inputState, socOperatingLowerPct: parseFloat(e.target.value) || 10.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">常用 SOC 运行上限 (%)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={inputState.socOperatingUpperPct}
                        onChange={(e) => setInputState({ ...inputState, socOperatingUpperPct: parseFloat(e.target.value) || 90.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">年保证运行天数 (天)</label>
                      <input
                        type="number"
                        step="5"
                        value={inputState.annualOperatingDays}
                        onChange={(e) => setInputState({ ...inputState, annualOperatingDays: parseInt(e.target.value, 10) || 350 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">瞬时大倍率脉冲 (&gt;1.0C) 调频占比 (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={inputState.highPowerPulseRatioPct}
                      onChange={(e) => setInputState({ ...inputState, highPowerPulseRatioPct: parseInt(e.target.value, 10) || 0 })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>平稳套利 (0%)</span>
                      <span className="font-bold text-blue-600">{inputState.highPowerPulseRatioPct}% 脉冲负荷</span>
                      <span>高频调频 (50%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: 热管理与电芯温控 */}
              {activeFormTab === 'thermal' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">温控形式</label>
                      <select
                        value={inputState.coolingType}
                        onChange={(e) => setInputState({
                          ...inputState,
                          coolingType: e.target.value as ThermalCoolingType,
                          coolingTypeLabel: e.target.value === 'LIQUID_COOLING' ? '高效变频液冷温控系统' : '强制风冷风道循环系统'
                        })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                      >
                        <option value="LIQUID_COOLING">高效变频液冷系统 (温差小)</option>
                        <option value="AIR_COOLING">精密空调强制风冷系统</option>
                        <option value="HYBRID_COOLING">风冷+局部均温复合系统</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">基准电芯年平均工作温度 (℃)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={inputState.baselineCellTempC}
                        onChange={(e) => setInputState({ ...inputState, baselineCellTempC: parseFloat(e.target.value) || 25.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">基准理想温度为 25.0 ℃</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">允许最低电芯温度 (℃)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={inputState.allowedCellTempMinC}
                        onChange={(e) => setInputState({ ...inputState, allowedCellTempMinC: parseFloat(e.target.value) || 15.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">允许最高电芯温度 (℃)</label>
                      <input
                        type="number"
                        step="1.0"
                        value={inputState.allowedCellTempMaxC}
                        onChange={(e) => setInputState({ ...inputState, allowedCellTempMaxC: parseFloat(e.target.value) || 35.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">簇内最大允许温差 ΔT (℃)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputState.maxCellTempDifferenceC}
                        onChange={(e) => setInputState({ ...inputState, maxCellTempDifferenceC: parseFloat(e.target.value) || 2.5 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">预估夏季极端超温 (&gt;38℃) 天数/年</label>
                    <input
                      type="number"
                      step="1"
                      value={inputState.extremeHighTempDaysPerYear}
                      onChange={(e) => setInputState({ ...inputState, extremeHighTempDaysPerYear: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      连续高温天气将显著加速电芯负极 SEI 膜增厚，需在合同中增加免责与辅冷要求
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: 商务质保与对赌条款 */}
              {activeFormTab === 'commercial' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">预期年吞吐电量 (MWh)</label>
                      <input
                        type="number"
                        step="100"
                        value={Math.round(inputState.expectedAnnualThroughputMwh)}
                        onChange={(e) => setInputState({ ...inputState, expectedAnnualThroughputMwh: parseFloat(e.target.value) || 1000 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">辅助系统功耗占比 (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputState.auxPowerConsumptionRatioPct}
                        onChange={(e) => setInputState({ ...inputState, auxPowerConsumptionRatioPct: parseFloat(e.target.value) || 2.5 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">质保基础单价 (元/Wh·年)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={inputState.warrantyPricingPerWhPerYear}
                        onChange={(e) => setInputState({ ...inputState, warrantyPricingPerWhPerYear: parseFloat(e.target.value) || 0.04 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">行业参考 0.035~0.055</span>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">质保金扣留比例 (%)</label>
                      <input
                        type="number"
                        step="1"
                        value={inputState.warrantyRetentionDepositPct}
                        onChange={(e) => setInputState({ ...inputState, warrantyRetentionDepositPct: parseFloat(e.target.value) || 5.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">通常为 5%~10%</span>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">低于保底1%违约金 (万元)</label>
                      <input
                        type="number"
                        step="1"
                        value={inputState.penaltyPerOnePctSohBreachYuan}
                        onChange={(e) => setInputState({ ...inputState, penaltyPerOnePctSohBreachYuan: parseFloat(e.target.value) || 20.0 })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：实时推演看板与曲线 (5 栏) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Calculator className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">基准工况实时推演结论</h3>
                  <p className="text-[10px] text-slate-400">基于物理退化与 Arrhenius 应力模型动态计算</p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  evaluationResult.riskLevel === 'LOW'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : evaluationResult.riskLevel === 'HIGH'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {evaluationResult.riskLevel === 'LOW'
                  ? '达标 (低风险)'
                  : evaluationResult.riskLevel === 'HIGH'
                  ? '超工况预警 (高风险)'
                  : '临界关注 (中风险)'}
              </span>
            </div>

            {/* 核心指标 KPI 条 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500">期末预测 SOH (第{inputState.warrantyPeriodYears}年)</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {evaluationResult.endOfWarrantyProjectedSohPct}%
                </div>
                <div className="text-[10px] text-slate-400">
                  合同保证保底: {evaluationResult.contractGuaranteedEndSohPct}%
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-500">质保安全裕度</div>
                <div
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    evaluationResult.sohSafetyMarginPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {evaluationResult.sohSafetyMarginPct >= 0
                    ? `+${evaluationResult.sohSafetyMarginPct}%`
                    : `${evaluationResult.sohSafetyMarginPct}%`}
                </div>
                <div className="text-[10px] text-slate-500">
                  {evaluationResult.isCompliant ? '完全满足合同承诺' : '存在提前跌破风险'}
                </div>
              </div>
            </div>

            {/* SOH 多维衰减对比曲线图 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">SOH 全生命周期衰减趋势推演</span>
                <span className="text-[10px] text-slate-400">单位: %</span>
              </div>
              <div className="h-52 w-full bg-slate-50/50 rounded-lg p-1 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={evaluationResult.annualSohTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(v) => (v === 0 ? '投运' : `${v}年`)}
                    />
                    <YAxis domain={[55, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', fontSize: '11px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`${value}%`]}
                      labelFormatter={(label) => `第 ${label} 年`}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    {/* 理想基准 */}
                    <Line
                      type="monotone"
                      dataKey="idealLabSohPct"
                      name="实验室标称"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    {/* 合同保证保底线 */}
                    <Line
                      type="monotone"
                      dataKey="contractGuaranteedSohPct"
                      name="保证底线"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={false}
                    />
                    {/* 本次基准工况预测 */}
                    <Line
                      type="monotone"
                      dataKey="projectedBaselineSohPct"
                      name="工况预测"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                    />
                    {/* 恶劣超工况预测 */}
                    <Line
                      type="monotone"
                      dataKey="worstCaseStressSohPct"
                      name="极端超工况"
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 超工况应力权重卡片 */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-700 block">4 项关键超工况应力归因：</span>
              {evaluationResult.stressFactors.map((st) => (
                <div
                  key={st.factorKey}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100 text-[11px]"
                >
                  <div>
                    <span className="font-medium text-slate-800">{st.factorName}</span>
                    <span className="text-slate-400 ml-1.5">({st.projectedValue})</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-500">加权系数: {st.stressWeight}x</span>
                    <span
                      className={`font-semibold ${
                        st.severity === 'ALARM'
                          ? 'text-rose-600'
                          : st.severity === 'WARNING'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      -{st.impactSohReductionPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 结论概述卡片 */}
            <div
              className={`p-3 rounded-lg border text-xs leading-relaxed ${
                evaluationResult.isCompliant
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50/70 border-rose-200 text-rose-800'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {evaluationResult.isCompliant ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                )}
                <span>签约可行性结论：</span>
              </div>
              <p className="mt-1 text-[11px]">{evaluationResult.riskSummary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
