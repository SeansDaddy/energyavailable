import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder } from '../../types';
import { MOCK_PCARE_NEW_ORDERS_PACK } from '../../mock/initialData';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  X,
  FileText,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface ImportPcareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (stats: { addedCount: number; updatedCount: number; batchNo: string }) => void;
}

export const ImportPcareModal: React.FC<ImportPcareModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { sites, workOrders, importWorkOrders } = useApp();

  const [activeMode, setActiveMode] = useState<'FILE' | 'PASTE' | 'PRESET'>('PRESET');
  const [selectedFileName, setSelectedFileName] = useState<string>('PCare_Export_Batch_20260910.xlsx');
  const [fileSizeStr, setFileSizeStr] = useState<string>('1.34 MB');
  const [remarks, setRemarks] = useState<string>('9月中旬全网消缺工单台账定期导入');
  
  // 粘贴模式的文本
  const [pasteContent, setPasteContent] = useState<string>('');

  // 解析出的工单候选列表
  const [parsedOrders, setParsedOrders] = useState<WorkOrder[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 辅助：根据部分对象组装标准 WorkOrder
  const formatAsWorkOrder = (partial: Partial<WorkOrder>, idx: number): WorkOrder => {
    const defaultSite = sites[idx % sites.length];
    const orderNo = partial.orderNo || `WO-20260910-${Math.floor(1000 + Math.random() * 9000)}`;
    const status = partial.status || (partial.solutionTime ? 'SOLUTION_READY' : 'PROCESSING');
    
    // 匹配站点
    const matchedSite = sites.find(
      s =>
        (partial.siteId && s.id === partial.siteId) ||
        (partial.siteName && s.siteName === partial.siteName) ||
        (partial.siteName && s.siteName.includes(partial.siteName.slice(0, 4)))
    ) || defaultSite;

    return {
      id: `wo-imp-${Date.now()}-${idx}`,
      orderNo,
      title: partial.title || `${matchedSite.siteName} 设备消缺处理`,
      siteId: matchedSite.id,
      siteName: matchedSite.siteName,
      customer: matchedSite.customer || partial.customer || '电网调度单位',
      contractNo: matchedSite.contractNo || partial.contractNo || 'CT-SLA-DEFAULT',
      status: status,
      priority: partial.priority || 'HIGH',
      faultCategory: partial.faultCategory || '电气与控制系统故障',
      createTime: partial.createTime || '2026-09-10 09:00',
      solutionTime: partial.solutionTime || (status === 'SOLUTION_READY' ? '2026-09-10 12:00' : undefined),
      closeTime: partial.closeTime,
      assignee: partial.assignee || '现场消缺工程师',
      description: partial.description || '现场巡检发现异常，通过 PCare 派发消缺工单',
      solutionSummary: partial.solutionSummary || (status === 'SOLUTION_READY' ? '已完成方案输出并备件预留，满足闭环标准。' : undefined),
      source: 'PCARE_IMPORT',
      rawPcareStatus: status === 'SOLUTION_READY' ? '已输出解决方案(待执行)' : status === 'CLOSED' ? '已归档' : '现场处理中'
    };
  };

  // 1. 载入预设示例数据包
  const handleLoadPreset = () => {
    setIsParsing(true);
    setParseError(null);
    setTimeout(() => {
      const generated = MOCK_PCARE_NEW_ORDERS_PACK.map((p, idx) => formatAsWorkOrder(p, idx));
      setParsedOrders(generated);
      setSelectedFileName('PCare_Standard_Export_20260910.xlsx');
      setFileSizeStr('1.45 MB');
      setIsParsing(false);
    }, 250);
  };

  // 2. 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setFileSizeStr(`${(file.size / 1024).toFixed(1)} KB`);
    setIsParsing(true);
    setParseError(null);

    // 模拟从文件解析数据
    setTimeout(() => {
      const sample = MOCK_PCARE_NEW_ORDERS_PACK.slice(0, 3).map((p, idx) => {
        return formatAsWorkOrder(
          {
            ...p,
            orderNo: `WO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${4000 + idx}`,
            title: `[导入文件] ${p.title}`
          },
          idx
        );
      });
      setParsedOrders(sample);
      setIsParsing(false);
    }, 350);
  };

  // 3. 处理文本/表格粘贴解析
  const handleParsePaste = () => {
    if (!pasteContent.trim()) {
      setParseError('请先粘贴从 PCare 导出的文本内容或表格行');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const lines = pasteContent.trim().split('\n').filter(l => l.trim().length > 0);
      const orders: WorkOrder[] = [];

      lines.forEach((line, idx) => {
        // 允许制表符或逗号分隔: 工单号, 标题, 站点, 故障分类, 状态(处理中/方案就绪/闭环), 处理人
        const parts = line.split(/[\t,;|]/).map(s => s.trim());
        if (parts.length < 2) return;

        const orderNo = parts[0].startsWith('WO-') ? parts[0] : `WO-IMP-${parts[0]}`;
        const title = parts[1] || '现场消缺工单';
        const siteNameHint = parts[2] || '';
        const category = parts[3] || '变流器电气系统';
        const rawStatus = parts[4] || '方案就绪';
        const assignee = parts[5] || '运维责任人';

        let status: 'PROCESSING' | 'SOLUTION_READY' | 'CLOSED' = 'PROCESSING';
        if (rawStatus.includes('就绪') || rawStatus.includes('方案') || rawStatus.includes('R4') || rawStatus.includes('SOLUTION')) {
          status = 'SOLUTION_READY';
        } else if (rawStatus.includes('归档') || rawStatus.includes('完结') || rawStatus.includes('CLOSE')) {
          status = 'CLOSED';
        }

        const wo = formatAsWorkOrder(
          {
            orderNo,
            title,
            siteName: siteNameHint,
            faultCategory: category,
            status,
            assignee,
            solutionTime: status === 'SOLUTION_READY' ? '2026-09-10 14:00' : undefined
          },
          idx
        );
        orders.push(wo);
      });

      if (orders.length === 0) {
        setParseError('未能识别有效字段，请检查是否包含【工单号】与【标题】列。');
      } else {
        setParsedOrders(orders);
      }
    } catch {
      setParseError('解析粘贴数据格式失败，请检查格式或使用标准模板。');
    } finally {
      setIsParsing(false);
    }
  };

  // 4. 下载标准 PCare 导入模板
  const handleDownloadTemplate = () => {
    const headers = [
      '工单编号(必填)',
      '工单标题(必填)',
      '所属站点名称(支持模糊匹配)',
      '关联合同号(选填)',
      '故障分类',
      '优先级(URGENT/HIGH/MEDIUM/LOW)',
      'PCare当前状态(现场处理中/方案已就绪/已完结)',
      '指派运维人',
      '派单创建时间(YYYY-MM-DD HH:mm)',
      '方案输出时刻(R4闭环时间)',
      '故障描述',
      '处置方案摘要(R4依据)'
    ];

    const sampleRow = [
      'WO-20260910-9102',
      '深圳光明04站 变流器IGBT驱动保护动作排查',
      '深圳光明储能电站二期-04号站',
      'CSG-SZ-2025-SLA-081',
      '变流器电气与散热故障',
      'URGENT',
      '方案已就绪(已闭环)',
      '张维保',
      '2026-09-10 09:20',
      '2026-09-10 13:45',
      'PCS过温告警，现场风道积灰伴随驱动板采样失真',
      '已清洗风道滤网并更换备用采样板，自检测试通过'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'PCare_WorkOrders_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 5. 确认入库
  const handleConfirmImport = () => {
    if (parsedOrders.length === 0) return;

    const batchNo = `PCare-Batch-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(10 + Math.random() * 90))}`;
    const result = importWorkOrders(parsedOrders, {
      batchNo,
      fileName: selectedFileName,
      fileSize: fileSizeStr,
      remarks: remarks || 'PCare 离线报表批量导入'
    });

    if (onSuccess) {
      onSuccess({
        addedCount: result.addedCount,
        updatedCount: result.updatedCount,
        batchNo
      });
    }

    onClose();
  };

  // 统计信息
  const solutionReadyCount = parsedOrders.filter(
    o => o.status === 'SOLUTION_READY' || o.status === 'CLOSED'
  ).length;

  const existingOrderNos = new Set(workOrders.map(w => w.orderNo));
  const willUpdateCount = parsedOrders.filter(o => existingOrderNos.has(o.orderNo)).length;
  const willAddCount = parsedOrders.length - willUpdateCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  导入 PCare 离线消缺工单台账
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-medium">
                  电力安全网段隔离 · 离线台账驱动
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                因电力工控网段安全隔离限制，PCare 系统不进行 API 直连。请在此导入 PCare 导出的报表以驱动 SLA 损耗扣减与 Rule R4 闭环统计。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security / Non-Direct-Connection Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-950">非直连合规架构说明：</strong>
            本平台遵循《电力监控系统安全防护规定》，与外部 PCare 运维平台实施单向物理/网闸逻辑隔离。
            系统通过定期<strong>导入 PCare 标准工单报表</strong>（Excel / CSV / 文本格式），自动对齐电站及合同号 (R9)，并严格按<strong>“方案就绪时刻即为闭环” (Rule R4)</strong>核算 MTTR 与当期可用度损失。
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Mode Selector Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('PRESET');
                  if (parsedOrders.length === 0) handleLoadPreset();
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMode === 'PRESET'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                快速载入标准数据包 (推荐体验)
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('FILE')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMode === 'FILE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                本地报表文件导入 (.xlsx / .csv)
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('PASTE')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeMode === 'PASTE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                文本/表格快速粘贴
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="下载标准字段格式 CSV 模板"
            >
              <Download className="w-3.5 h-3.5" />
              下载 PCare 导入模板
            </button>
          </div>

          {/* Mode 1: Preset Data */}
          {activeMode === 'PRESET' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    PCare 9月中旬最新消缺台账离线导出包 (包含海口微电网、舟山港等 4 笔工单)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    已预先规整为标准结构，包含 3 笔方案已就绪 (Rule R4 闭环) 及 1 笔处理中现场工单。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadPreset}
                  className="px-3 py-1.5 rounded bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-xs font-medium text-slate-700 shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新载入预设包
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: File Upload */}
          {activeMode === 'FILE' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  点击选择文件 或 将 PCare 导出的报表拖拽至此处
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  支持 .xlsx、.xls、.csv 格式，单文件上限 50MB
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-mono">
                  <span>当前选择: {selectedFileName}</span>
                  <span className="text-slate-400">({fileSizeStr})</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Paste Content */}
          {activeMode === 'PASTE' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  粘贴 PCare 导出的多行制表符或逗号分隔数据 (每行一单)：
                </span>
                <span className="text-[11px] text-slate-400">
                  格式: 工单号, 工单标题, 站点名称, 故障分类, 状态, 运维人
                </span>
              </div>
              <textarea
                value={pasteContent}
                onChange={e => setPasteContent(e.target.value)}
                rows={4}
                placeholder="例如:&#10;WO-20260910-1001, 深圳光明04站变流器温度探头校验, 深圳光明储能电站二期-04号站, 变流器电气与散热故障, 方案就绪, 张维保&#10;WO-20260910-1002, 广州南沙港从控通讯闪断恢复, 广州南沙自贸区综合能源港储能站, 通信链路故障, 处理中, 黄工"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePaste}
                  className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors"
                >
                  解析粘贴内容
                </button>
              </div>
            </div>
          )}

          {/* Batch Meta Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-medium text-slate-700 mb-1">导入批次备注说明</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="例如: 2026年9月中旬第2批次离线工单台账入库"
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">模拟导入文件名称</label>
              <input
                type="text"
                value={selectedFileName}
                onChange={e => setSelectedFileName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Parsing Status or Error */}
          {isParsing && (
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 flex items-center justify-center gap-2 text-xs text-blue-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              正在解析 PCare 工单数据并匹配站点与合同...
            </div>
          )}

          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedOrders.length > 0 && !isParsing && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    解析结果预览 ({parsedOrders.length} 笔)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                    🟢 {solutionReadyCount} 笔已输出方案 (符合 R4 闭环口径)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                    新增 {willAddCount} 笔 / 覆盖更新 {willUpdateCount} 笔
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  确认无误后点击下方按钮导入系统
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-2.5 px-3">工单编号</th>
                      <th className="py-2.5 px-3">工单标题</th>
                      <th className="py-2.5 px-3">匹配挂接电站 (R9)</th>
                      <th className="py-2.5 px-3">故障分类</th>
                      <th className="py-2.5 px-3">导入判定状态</th>
                      <th className="py-2.5 px-3">方案闭环时刻 (R4)</th>
                      <th className="py-2.5 px-3">运维责任人</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedOrders.map((order, idx) => {
                      const isExisting = existingOrderNos.has(order.orderNo);
                      return (
                        <tr key={order.orderNo || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-blue-600 font-medium">
                            {order.orderNo}
                            {isExisting && (
                              <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                                覆盖
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900 max-w-xs truncate">
                            {order.title}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <span className="font-semibold text-slate-800">{order.siteName}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              {order.contractNo}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">{order.faultCategory}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-block ${
                                order.status === 'SOLUTION_READY'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : order.status === 'CLOSED'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.status === 'SOLUTION_READY'
                                ? '🟢 方案就绪 (R4闭环)'
                                : order.status === 'CLOSED'
                                ? '已完结归档'
                                : '🟡 现场处理中'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-emerald-600 font-semibold">
                            {order.solutionTime || '-'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">{order.assignee}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>导入后将自动触发当期全网可用度计算模型，重算等效中断时长与 SLA 扣减。</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={parsedOrders.length === 0 || isParsing}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md hover:shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              确认入库导入 ({parsedOrders.length} 笔工单)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
