import React, { useState } from 'react';
import {
  X,
  Settings,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  Save
} from 'lucide-react';
import { CalculationRuleConfig, OpportunityDomain } from '../../types/opportunityMining';

interface CalculationRuleModalProps {
  rule?: CalculationRuleConfig | null;
  onClose: () => void;
  onSave: (rule: CalculationRuleConfig) => void;
}

export const CalculationRuleModal: React.FC<CalculationRuleModalProps> = ({
  rule,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(rule);

  const [ruleCode, setRuleCode] = useState(rule?.ruleCode || `RULE-CUSTOM-0${Math.floor(Math.random() * 90 + 10)}`);
  const [ruleName, setRuleName] = useState(rule?.ruleName || '');
  const [domain, setDomain] = useState<OpportunityDomain | 'all'>(rule?.domain || 'storage');
  const [category, setCategory] = useState<CalculationRuleConfig['category']>(rule?.category || 'STORAGE_ECONOMICS');
  const [targetMetric, setTargetMetric] = useState(rule?.targetMetric || '全投资内部收益率 IRR (%)');
  const [triggerCondition, setTriggerCondition] = useState(rule?.triggerCondition || 'IRR >= 10.0% 且 投资回收期 <= 5.0 年');
  const [thresholdValue, setThresholdValue] = useState<number>(rule?.thresholdValue ?? 10.0);
  const [thresholdUnit, setThresholdUnit] = useState(rule?.thresholdUnit || '%');
  const [benchmarkReference, setBenchmarkReference] = useState(rule?.benchmarkReference || '企业内部投资决策委员会技术经济基准');
  const [algorithmFormula, setAlgorithmFormula] = useState(rule?.algorithmFormula || 'NPV = -CapEx + Σ (年化净收益) / (1 + r)^t = 0');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3'>(rule?.priority || 'P1');
  const [cooldownDays, setCooldownDays] = useState<number>(rule?.cooldownDays ?? 14);
  const [autoTriggerCard, setAutoTriggerCard] = useState<boolean>(rule?.autoTriggerCard ?? true);

  const [parameters, setParameters] = useState<CalculationRuleConfig['parameters']>(
    rule?.parameters || [
      { name: '最低准入 IRR 门槛', key: 'min_irr_threshold', value: 10.0, unit: '%', description: '触发商机卡片的最底线收益率' },
      { name: '基准贴现率', key: 'discount_rate', value: 6.5, unit: '%', description: 'DCF 现值折现率标准' }
    ]
  );

  const handleAddParam = () => {
    setParameters([
      ...parameters,
      {
        name: '自定义参数项',
        key: `param_${Date.now().toString().slice(-4)}`,
        value: 1.0,
        unit: '系数',
        description: '用于数学公式参与计算的自定义权重参数'
      }
    ]);
  };

  const handleUpdateParam = (index: number, field: string, val: any) => {
    setParameters((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: val } : p))
    );
  };

  const handleRemoveParam = (index: number) => {
    if (parameters.length <= 1) return;
    setParameters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      alert('请填写规则名称！');
      return;
    }

    const domainLabel = domain === 'pv' ? '光伏电站' : domain === 'storage' ? '电化学储能' : domain === 'dc' ? '数据中心能源' : '全域通用';
    const categoryLabel =
      category === 'STORAGE_ECONOMICS'
        ? '储能收益测算'
        : category === 'PV_PR_GAP'
        ? '光伏健康诊断'
        : category === 'MODULE_WARRANTY'
        ? '组件衰减索赔'
        : category === 'STORAGE_CAPACITY_SCAN'
        ? '储能机会扫描'
        : '数据中心PUE';

    const savedRule: CalculationRuleConfig = {
      id: rule?.id || `rule-custom-${Date.now()}`,
      ruleCode,
      ruleName,
      domain,
      domainLabel,
      category,
      categoryLabel,
      targetMetric,
      triggerCondition,
      thresholdValue,
      thresholdUnit,
      benchmarkReference,
      algorithmFormula,
      parameters,
      cooldownDays,
      autoTriggerCard,
      priority,
      isEnabled: rule?.isEnabled ?? true,
      lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    onSave(savedRule);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? '编辑运行数据测算规则' : '新增自定义测算诊断规则'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                自定义业务判定门槛、数学公式与参数列表，实时驱动系统自动化诊断
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">规则唯一编码</label>
              <input
                type="text"
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">规则名称</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="例如：工商业储能两充两放高收益测算模型规则"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Domain, Category, Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">适用业务领域</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="storage">电化学储能</option>
                <option value="pv">光伏电站</option>
                <option value="dc">数据中心能源</option>
                <option value="all">全域通用</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">规则类别</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="STORAGE_ECONOMICS">储能收益测算模型</option>
                <option value="PV_PR_GAP">光伏 PR 落后健康诊断</option>
                <option value="MODULE_WARRANTY">组件衰减与质保索赔</option>
                <option value="STORAGE_CAPACITY_SCAN">储能机会寻优扫描</option>
                <option value="PUE_BENCHMARK">数据中心 PUE 能效对标</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">报警与推进优先级</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="P1">P1 - 高优立即触发</option>
                <option value="P2">P2 - 中优评估触发</option>
                <option value="P3">P3 - 常规低优归档</option>
              </select>
            </div>
          </div>

          {/* Row 3: Target Metric, Threshold Value & Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">核心测算指标</label>
              <input
                type="text"
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value)}
                placeholder="例如：全投资税后 IRR (%)"
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">触发阈值数值</label>
              <input
                type="number"
                step="0.01"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">阈值单位</label>
              <input
                type="text"
                value={thresholdUnit}
                onChange={(e) => setThresholdUnit(e.target.value)}
                placeholder="例如：% 或 年 或 元/kWh"
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Trigger Condition & Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">触发商机门槛判定逻辑</label>
              <input
                type="text"
                value={triggerCondition}
                onChange={(e) => setTriggerCondition(e.target.value)}
                placeholder="例如：IRR >= 10.0% 且 投资回收期 <= 5.0 年"
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">对标行业标杆或法规来源</label>
              <input
                type="text"
                value={benchmarkReference}
                onChange={(e) => setBenchmarkReference(e.target.value)}
                placeholder="例如：国资委央企投委会投资基准回报率 8.0%"
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Formula */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">测算数学模型与算法公式说明</label>
            <textarea
              value={algorithmFormula}
              onChange={(e) => setAlgorithmFormula(e.target.value)}
              rows={2}
              placeholder="输入数学逻辑，例如：年损失电量 (MWh) = 理论发电量 × (标杆PR - 实际PR); 年电费损失 = 损失电量 × 脱硫标杆上网电价"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Dynamic Parameters List */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>公式变量参数列表 ({parameters.length} 项)</span>
              </div>
              <button
                type="button"
                onClick={handleAddParam}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 font-medium text-xs shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加参数项</span>
              </button>
            </div>

            <div className="space-y-2">
              {parameters.map((param, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center shadow-2xs"
                >
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => handleUpdateParam(index, 'name', e.target.value)}
                      placeholder="参数名称"
                      className="w-full p-1.5 border border-slate-200 rounded text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => handleUpdateParam(index, 'key', e.target.value)}
                      placeholder="Key变量"
                      className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono text-slate-600 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={param.value}
                      onChange={(e) => handleUpdateParam(index, 'value', Number(e.target.value))}
                      placeholder="数值"
                      className="w-full p-1.5 border border-slate-200 rounded text-xs font-mono font-bold text-blue-700 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      value={param.unit}
                      onChange={(e) => handleUpdateParam(index, 'unit', e.target.value)}
                      placeholder="单位"
                      className="w-full p-1.5 border border-slate-200 rounded text-xs text-slate-600 focus:outline-hidden focus:border-blue-500 text-center"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={param.description}
                      onChange={(e) => handleUpdateParam(index, 'description', e.target.value)}
                      placeholder="说明描述"
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] text-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveParam(index)}
                      disabled={parameters.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400"
                      title="删除此参数"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cooldown & Auto trigger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">去抖冷却保护周期</span>
                <p className="text-[11px] text-slate-500">同一电站触发后避免重复提醒的天数</p>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={cooldownDays}
                  onChange={(e) => setCooldownDays(Number(e.target.value))}
                  className="w-16 p-1 border border-slate-300 rounded text-xs text-center font-mono font-bold text-slate-800"
                />
                <span className="text-slate-500">天</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">自动触发商机卡片</span>
                <p className="text-[11px] text-slate-500">达到门槛后是否直接推送至商机中心</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTriggerCard}
                  onChange={(e) => setAutoTriggerCard(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors shadow-2xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? '保存规则修改' : '保存并生效规则'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
