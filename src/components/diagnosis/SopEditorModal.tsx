import React, { useState } from 'react';
import { SopItem, SopStep } from '../../types/faultDiagnosis';
import { X, Plus, Trash2, ShieldAlert, CheckCircle2, BookOpen } from 'lucide-react';

interface SopEditorModalProps {
  initialSop?: SopItem | null;
  onClose: () => void;
  onSave: (sop: SopItem) => void;
}

export const SopEditorModal: React.FC<SopEditorModalProps> = ({
  initialSop,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(initialSop?.title || '');
  const [sopCode, setSopCode] = useState(initialSop?.sopCode || `SOP-NEW-${Math.floor(100 + Math.random() * 900)}`);
  const [equipmentCategory, setEquipmentCategory] = useState(initialSop?.equipmentCategory || 'PCS 变流器');
  const [faultCategory, setFaultCategory] = useState(initialSop?.faultCategory || '过温过热');
  const [version, setVersion] = useState(initialSop?.version || 'v1.0');
  const [estimatedDuration, setEstimatedDuration] = useState(initialSop?.estimatedDuration || '45 分钟');
  const [toolsStr, setToolsStr] = useState(initialSop?.requiredTools.join('、') || '绝缘工具套装、数字万用表');
  const [partsStr, setPartsStr] = useState(initialSop?.requiredParts.join('、') || '备用接触器、导热硅脂');
  const [riskStr, setRiskStr] = useState(initialSop?.riskWarnings.join('\n') || '接触高压部件前必须完成断电、放电与验电');
  const [changeLog, setChangeLog] = useState(initialSop?.changeLog || '初始版本建立');

  const [steps, setSteps] = useState<SopStep[]>(
    initialSop?.steps || [
      {
        stepNumber: 1,
        title: '现场安全隔离与停电挂牌',
        description: '断开交直流回路隔离开关，悬挂作业警示标牌，验明零电压。',
        keyParams: '母线残压 < 36V DC'
      },
      {
        stepNumber: 2,
        title: '故障部位针对性排查与元器件更换',
        description: '使用专用检测仪器测量阻抗或温升，更换不良备件并恢复接线。'
      }
    ]
  );

  const handleAddStep = () => {
    const newStepNum = steps.length + 1;
    setSteps(prev => [
      ...prev,
      {
        stepNumber: newStepNum,
        title: `实施步骤 ${newStepNum}`,
        description: '请详细描述具体作业内容、测量指标与规范。'
      }
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps(prev =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const handleUpdateStep = (idx: number, field: keyof SopStep, val: any) => {
    setSteps(prev =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedSop: SopItem = {
      id: initialSop?.id || `sop-${Date.now()}`,
      sopCode,
      title,
      equipmentCategory,
      faultCategory,
      version,
      status: 'ACTIVE',
      matchScore: initialSop?.matchScore || 90,
      recommendReason: initialSop?.recommendReason || '由专业服务团队维护的标准作业方案',
      estimatedDuration,
      requiredTools: toolsStr.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
      requiredParts: partsStr.split(/[、,，]/).map(s => s.trim()).filter(Boolean),
      riskWarnings: riskStr.split('\n').map(s => s.trim()).filter(Boolean),
      steps,
      author: initialSop?.author || '储能技术支持团队',
      updatedAt: new Date().toISOString().slice(0, 10),
      changeLog
    };

    onSave(updatedSop);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {initialSop ? `编辑 SOP 规程 (${initialSop.sopCode})` : '新建标准处置方案 (SOP)'}
              </h3>
              <div className="text-[11px] text-slate-400">支持版本管理与标准安全步骤编排</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">方案编码 (SOP Code):</label>
              <input
                type="text"
                value={sopCode}
                onChange={e => setSopCode(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">当前发布版本 (Version):</label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                required
                placeholder="v1.0"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">SOP 方案标题:</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="例如：PCS 变流器 IGBT 桥臂过温停机排查与冷却循环疏通..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">设备类别:</label>
              <select
                value={equipmentCategory}
                onChange={e => setEquipmentCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              >
                <option value="PCS 变流器">PCS 变流器</option>
                <option value="BMS 电池簇">BMS 电池簇</option>
                <option value="液冷温控系统">液冷温控系统</option>
                <option value="EMS 通信系统">EMS 通信系统</option>
                <option value="高低压电气">高低压电气配电</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">故障分类:</label>
              <input
                type="text"
                value={faultCategory}
                onChange={e => setFaultCategory(e.target.value)}
                placeholder="过温过热/通信中断..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">预计工时耗时:</label>
              <input
                type="text"
                value={estimatedDuration}
                onChange={e => setEstimatedDuration(e.target.value)}
                placeholder="45 分钟"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">所需工器具 (以顿号分隔):</label>
            <input
              type="text"
              value={toolsStr}
              onChange={e => setToolsStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">所需备品备件 (以顿号分隔):</label>
            <input
              type="text"
              value={partsStr}
              onChange={e => setPartsStr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">安全风险警示 (每行一条):</label>
            <textarea
              value={riskStr}
              onChange={e => setRiskStr(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs resize-none"
            />
          </div>

          {/* Steps */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">标准作业步骤清单 ({steps.length} 步):</label>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加步骤</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {steps.map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        {s.stepNumber}
                      </span>
                      <span>步骤 {s.stepNumber} 标题:</span>
                    </span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={s.title}
                    onChange={e => handleUpdateStep(idx, 'title', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-semibold"
                  />
                  <textarea
                    value={s.description}
                    onChange={e => handleUpdateStep(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="步骤操作说明..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs resize-none"
                  />
                  <input
                    type="text"
                    value={s.keyParams || ''}
                    onChange={e => handleUpdateStep(idx, 'keyParams', e.target.value)}
                    placeholder="关键控制参数 (如: 进出水压差 > 0.1MPa)..."
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono text-emerald-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">版本变更说明 (留痕):</label>
            <input
              type="text"
              value={changeLog}
              onChange={e => setChangeLog(e.target.value)}
              placeholder="记录本次版本修订的内容要点..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
            >
              保存 SOP 方案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
