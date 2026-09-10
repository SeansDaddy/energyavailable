import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiagnosisTask, LogSourceType, LogCategory } from '../../types/faultDiagnosis';
import {
  X,
  Sparkles,
  Building2,
  AlertTriangle,
  UploadCloud,
  FileArchive,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Clock,
  Radio,
  RefreshCw,
  Search
} from 'lucide-react';

interface NewDiagnosisWizardModalProps {
  initialSiteId?: string;
  initialEvent?: {
    eventId: string;
    eventTitle: string;
    eventType: 'alarm' | 'fault' | 'availability_alert' | 'manual';
    eventTime: string;
    severity?: string;
    description?: string;
  };
  onClose: () => void;
  onLaunchTask: (task: DiagnosisTask) => void;
}

export const NewDiagnosisWizardModal: React.FC<NewDiagnosisWizardModalProps> = ({
  initialSiteId,
  initialEvent,
  onClose,
  onLaunchTask
}) => {
  const { sites, batches, alerts, currentUser } = useApp();

  // Wizard step state (1 to 4)
  const [step, setStep] = useState<number>(initialEvent ? 3 : 1);

  // Step 1: Selected Site
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    initialSiteId || sites[0]?.id || 'site-001'
  );
  const [siteSearch, setSiteSearch] = useState('');

  // Step 2: Event Association
  const [associatedEvent, setAssociatedEvent] = useState<{
    eventId: string;
    eventTitle: string;
    eventType: 'alarm' | 'fault' | 'availability_alert' | 'manual';
    eventTime: string;
    severity?: string;
    description?: string;
  } | null>(initialEvent || null);
  const [manualDescription, setManualDescription] = useState('');

  // Step 3: Log Source & Category
  const [logSourceType, setLogSourceType] = useState<LogSourceType>('BATCH_REF');
  const [selectedBatchNo, setSelectedBatchNo] = useState<string>('');
  const [manualFileName, setManualFileName] = useState<string>('');
  const [logCategory, setLogCategory] = useState<LogCategory>('ALL');
  const [startDate, setStartDate] = useState('2026-08-12 00:00');
  const [endDate, setEndDate] = useState('2026-08-12 23:59');

  // Step 4: Executing simulation
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingStep, setExecutingStep] = useState(0);

  const currentSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Batches for this site
  const siteBatches = batches.filter(
    b => b.siteId === currentSite.id || b.siteName === currentSite.siteName
  );

  // Filtered sites for step 1
  const filteredSites = sites.filter(
    s =>
      s.siteName.toLowerCase().includes(siteSearch.toLowerCase()) ||
      s.siteCode.toLowerCase().includes(siteSearch.toLowerCase())
  );

  // Merged faults & active alerts for step 2
  const siteFaults = currentSite.mergedFaults || [];
  const siteAlerts = alerts.filter(a => a.siteId === currentSite.id && a.status === 'active');

  const handleStartDiagnosis = () => {
    setIsExecuting(true);
    setExecutingStep(1);

    setTimeout(() => setExecutingStep(2), 500);
    setTimeout(() => setExecutingStep(3), 1000);
    setTimeout(() => setExecutingStep(4), 1500);

    setTimeout(() => {
      setIsExecuting(false);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const newTask: DiagnosisTask = {
        id: `task-diag-${Date.now()}`,
        taskNo: `DIAG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
          now.getDate()
        ).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        siteId: currentSite.id,
        siteName: currentSite.siteName,
        siteCode: currentSite.siteCode,
        eventContext: associatedEvent || {
          eventId: `evt-${Date.now()}`,
          eventTitle: manualDescription || '现场人工上报故障现象',
          eventType: 'manual',
          eventTime: timeStr,
          severity: 'MAJOR',
          description: manualDescription
        },
        logSourceType,
        logBatchNo: logSourceType === 'BATCH_REF' ? (selectedBatchNo || siteBatches[0]?.batchNo || 'LOG-AUTO-01') : undefined,
        uploadedFileName: logSourceType === 'MANUAL_UPLOAD' ? (manualFileName || `${currentSite.siteCode}_DIAG_LOG.zip`) : undefined,
        uploadedFileSize: logSourceType === 'MANUAL_UPLOAD' ? '28.4 MB' : undefined,
        logCategory,
        timeRange: {
          start: startDate,
          end: endDate
        },
        status: 'COMPLETED',
        progress: 100,
        createdAt: timeStr,
        completedAt: timeStr,
        creator: `${currentUser.name} (${currentUser.roleTitle})`,
        result: {
          id: `res-${Date.now()}`,
          taskId: `task-diag-${Date.now()}`,
          rootCause: `经 AI 诊断引擎特征提取与多维分析，${currentSite.siteName} 本次工况异常主要是由于变流器/BMS 局部散热风道受阻，叠加充放电峰值电流扰动引发保护性动作。`,
          rootCauseDetail: '综合分析时序遥测数据，相关监测指标偏离正常分布，触发了安全阈值联锁停机。建议针对散热风道与电气接线端子执行消缺排查。',
          ruleOrModelPath: 'AI 专家诊断知识库 v4.2 -> [综合工况多维推理模型]',
          confidence: 'HIGH',
          confidencePercent: 93,
          affectedScope: [
            { deviceName: currentSite.coreDevices[0]?.deviceName || '1# 储能变流器柜', details: '逆变桥臂单元' },
            { deviceName: 'BMS 电池监控模块' }
          ],
          availabilityImpact: {
            estimatedInterruptionMins: 120,
            availabilityLossPercent: 0.28,
            slaImpactDescription: '等效 PCS 停运约 120 分钟，当期可用度潜在扣减 0.28%，需尽快执行 SOP 恢复并网。'
          },
          evidenceLogs: [
            {
              timestamp: `${timeStr.split(' ')[0]} 14:20:00`,
              level: 'WARN',
              component: 'SYSTEM_MONITOR',
              message: 'Transient current fluctuation detected: Phase jitter > 6.5%',
              highlight: false
            },
            {
              timestamp: `${timeStr.split(' ')[0]} 14:22:15`,
              level: 'ERROR',
              component: 'PROTECTION_UNIT',
              message: 'Temperature gradient slope 1.45 C/s exceeded safety limit',
              highlight: true
            }
          ],
          evidenceFeatures: [
            {
              name: '关键温升梯度',
              value: '1.45 ℃/s',
              baseline: '≤ 0.40 ℃/s',
              status: 'ANOMALOUS',
              significance: '导热阻抗偏大引发温控警报'
            },
            {
              name: '电流波动方差',
              value: '6.8 %',
              baseline: '< 2.0 %',
              status: 'WARNING',
              significance: '轻微扰动导致动态调节饱和'
            }
          ],
          reasoningChain: [
            '1. 读取日志文件关键帧并进行格式校验与清洗；',
            '2. 提取温度、电流、电压三大核心特征向量；',
            '3. 匹配故障因果图谱，排除电网侧严重短路；',
            '4. 定位为现场散热与局部接触热阻异常，匹配推荐 SOP。'
          ],
          recommendedSops: [],
          similarCases: []
        }
      };

      onLaunchTask(newTask);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">新建 AI 故障诊断任务</h3>
              <p className="text-xs text-slate-500">
                支持主动配置或关联已有事件上下文，智能调取日志驱动大模型诊断引擎
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between text-xs">
          {[
            { s: 1, title: '① 选择目标站点' },
            { s: 2, title: '② 关联故障/告警事件' },
            { s: 3, title: '③ 日志来源与类别' },
            { s: 4, title: '④ 确认并启动诊断' }
          ].map(item => (
            <div
              key={item.s}
              className={`flex items-center gap-1.5 font-bold ${
                step === item.s
                  ? 'text-blue-600'
                  : step > item.s
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                  step === item.s
                    ? 'bg-blue-600 text-white'
                    : step > item.s
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > item.s ? '✓' : item.s}
              </span>
              <span className="hidden sm:inline">{item.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {/* STEP 1: Select Site */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  搜索并选择需要诊断的储能站点:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={siteSearch}
                    onChange={e => setSiteSearch(e.target.value)}
                    placeholder="输入站点名称、站码或区域搜索..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                {filteredSites.map(s => {
                  const isSelected = s.id === selectedSiteId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSiteId(s.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{s.siteName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {s.siteCode} · {s.customer}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          {s.currentAvailability.toFixed(2)}%
                        </span>
                        <div className="text-[10px] text-slate-400">SLA {s.slaThreshold}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Event Association */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  关联该站点的故障因果链事件或当前预警 (可选):
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  选择具体事件将有助于 AI 诊断引擎针对性提取前后时间窗的波形数据与告警代码。
                </p>
              </div>

              {/* Merged Faults from this site */}
              {siteFaults.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>该站故障时间线记录 ({siteFaults.length} 项):</span>
                  </span>
                  <div className="space-y-1.5">
                    {siteFaults.map(f => {
                      const isChosen = associatedEvent?.eventId === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() =>
                            setAssociatedEvent(
                              isChosen
                                ? null
                                : {
                                    eventId: f.id,
                                    eventTitle: f.title,
                                    eventType: 'fault',
                                    eventTime: f.startTime,
                                    severity: 'CRITICAL',
                                    description: `等效 PCS 中断 ${f.equivalentInterruptionMinutes} 分钟，起止: ${f.startTime} ~ ${f.endTime}`
                                  }
                            )
                          }
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isChosen
                              ? 'border-blue-600 bg-blue-50/70'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">{f.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              起止: {f.startTime} ~ {f.endTime} · 归并原始事件 {f.mergedEventsCount} 项
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isChosen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isChosen ? '已关联' : '点击关联'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Alerts from this site */}
              {siteAlerts.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>该站待处理预警 ({siteAlerts.length} 项):</span>
                  </span>
                  <div className="space-y-1.5">
                    {siteAlerts.map(a => {
                      const isChosen = associatedEvent?.eventId === a.id;
                      return (
                        <div
                          key={a.id}
                          onClick={() =>
                            setAssociatedEvent(
                              isChosen
                                ? null
                                : {
                                    eventId: a.id,
                                    eventTitle: `${a.type === 'sla_breached' ? 'SLA 跌破告警' : '预测跌破预警'}`,
                                    eventType: 'availability_alert',
                                    eventTime: a.triggerTime,
                                    severity: 'MAJOR',
                                    description: `当前可用度: ${a.currentValue}% (低于阈值 ${a.slaThreshold}%)`
                                  }
                            )
                          }
                          className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                            isChosen
                              ? 'border-amber-500 bg-amber-50/70'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {a.type === 'sla_breached' ? '当前已跌破 SLA 红线' : '预测近期可能跌破预警'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              触发时间: {a.triggerTime} · 阈值 {a.slaThreshold}%
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isChosen ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isChosen ? '已关联' : '点击关联'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Or manual input description */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  或者手工输入故障/告警现场描述 (无现成事件时直接填写):
                </label>
                <textarea
                  value={manualDescription}
                  onChange={e => setManualDescription(e.target.value)}
                  placeholder="例如：2号变流器报桥臂过温 E-0422，循环水泵有异响，需排查是否为风道堵塞或冷却回路故障..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Log Source & Category */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-800 mb-2">选择日志数据来源:</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setLogSourceType('BATCH_REF')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      logSourceType === 'BATCH_REF'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">引用已导入批次 (免重复上传)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      复用离线日志导入模块已解析的站点历史日志批次，秒级调取。
                    </p>
                  </div>

                  <div
                    onClick={() => setLogSourceType('MANUAL_UPLOAD')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      logSourceType === 'MANUAL_UPLOAD'
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">手动上传新日志压缩包</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      支持现场调取抓取的临时应急日志（.zip / .tar.gz / 100MB 内）。
                    </p>
                  </div>
                </div>
              </div>

              {/* Batch Selector if BATCH_REF */}
              {logSourceType === 'BATCH_REF' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    选择关联的历史离线日志批次:
                  </label>
                  {siteBatches.length > 0 ? (
                    <select
                      value={selectedBatchNo}
                      onChange={e => setSelectedBatchNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {siteBatches.map(b => (
                        <option key={b.id} value={b.batchNo}>
                          {b.batchNo} · {b.fileName} ({b.fileSize}) · 周期: {b.periodStart} ~ {b.periodEnd}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                      该站点暂无已归档离线日志批次，系统将默认采用系统快照或请切换至“手动上传”。
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">上传站点日志压缩包:</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 transition">
                    <FileArchive className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
                    <span className="font-bold text-slate-700">点击上传或拖拽日志压缩包至此处</span>
                    <p className="text-[11px] text-slate-400 mt-1">支持 .zip, .tar.gz, .csv, .log 格式 (最大 100MB)</p>
                    {manualFileName && (
                      <div className="mt-2 text-blue-600 font-mono font-bold bg-blue-50 py-1 px-2 rounded inline-block">
                        已选择: {manualFileName}
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      id="log-upload-wizard"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setManualFileName(file.name);
                      }}
                    />
                    <label
                      htmlFor="log-upload-wizard"
                      className="mt-2.5 inline-block px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                    >
                      浏览本地文件
                    </label>
                  </div>
                </div>
              )}

              {/* Log Category & Time Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">目标子系统数据类别:</label>
                  <select
                    value={logCategory}
                    onChange={e => setLogCategory(e.target.value as LogCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">全系统综合运行日志 (All-in-One)</option>
                    <option value="PCS">PCS 储能变流器遥测日志</option>
                    <option value="BMS">BMS 电池簇与电芯采样日志</option>
                    <option value="HVAC">液冷温控机组与水泵日志</option>
                    <option value="EMS">EMS 能量管理与通信日志</option>
                    <option value="FIRE_ELECTRIC">电气保护与消防安全日志</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">分析时间窗跨度:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl p-2 text-[11px] font-mono"
                      placeholder="开始时间"
                    />
                    <span className="text-slate-400">~</span>
                    <input
                      type="text"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-1/2 bg-slate-50 border border-slate-300 rounded-xl p-2 text-[11px] font-mono"
                      placeholder="结束时间"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Confirm & Execution */}
          {step === 4 && (
            <div className="space-y-4">
              {isExecuting ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 animate-pulse">
                    <RefreshCw className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">AI 诊断引擎深度推理中...</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      正在调用储能专家诊断大模型分析多维时序特征与因果链
                    </p>
                  </div>

                  <div className="max-w-md mx-auto space-y-2 text-left pt-3">
                    {[
                      { idx: 1, label: '解压校验站点日志文件完整性' },
                      { idx: 2, label: '提取高频遥测波形、特征值与告警代码' },
                      { idx: 3, label: '调用大模型推理图谱匹配故障根因' },
                      { idx: 4, label: '检索匹配标准 SOP 与历史相似案例' }
                    ].map(st => (
                      <div
                        key={st.idx}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs transition ${
                          executingStep > st.idx
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : executingStep === st.idx
                            ? 'bg-blue-50 text-blue-700 font-bold animate-pulse'
                            : 'text-slate-400'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white border">
                          {executingStep > st.idx ? '✓' : st.idx}
                        </span>
                        <span>{st.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>诊断任务参数确认核对:</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">目标站点:</span>{' '}
                        <strong className="text-slate-800">{currentSite.siteName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">站点编号:</span>{' '}
                        <span className="text-slate-700 font-mono">{currentSite.siteCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">关联事件:</span>{' '}
                        <span className="text-slate-800">
                          {associatedEvent?.eventTitle || manualDescription || '全工况主动诊断'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">数据来源:</span>{' '}
                        <span className="text-blue-600 font-semibold">
                          {logSourceType === 'BATCH_REF' ? '引用已导入离线批次' : '手动上传压缩包'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">子系统分类:</span>{' '}
                        <span className="text-slate-800 font-semibold">{logCategory}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">分析周期:</span>{' '}
                        <span className="text-slate-700 font-mono">{startDate} ~ {endDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed">
                    点击“立即启动 AI 诊断”后，系统将自动调用公司统一大模型推理服务 (ADR-0005)，并在 2 秒内输出包含故障根因、影响评估、SOP 推荐与相似案例的完整诊断决策树。
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Buttons */}
        {!isExecuting && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>上一步</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                取消
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                >
                  <span>下一步</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartDiagnosis}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-500/25"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>立即启动 AI 诊断</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
