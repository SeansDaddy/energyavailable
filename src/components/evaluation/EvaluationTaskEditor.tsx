import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  EntryMode,
  MeteorologicalSource,
  CorrosionGrade,
  RedundancyTopology,
  DeviceItem,
  MeteorologicalData,
  ElectricityPricingData,
  PreSalesInputState,
  PreSalesEvaluationResult,
  EvaluationTaskRecord
} from '../../types/preSalesEvaluation';
import {
  REGIONAL_WEATHER_PROFILES,
  REGIONAL_ELECTRICITY_PRESETS,
  DEFAULT_ELECTRICITY_PRICING,
  calculatePreSalesEvaluation
} from '../../utils/preSalesCalculationEngine';
import { PreSalesEvaluationReportModal } from './PreSalesEvaluationReportModal';
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
  UploadCloud,
  FileSpreadsheet,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';

interface EvaluationTaskEditorProps {
  onSaveTask: (newTask: EvaluationTaskRecord) => void;
  onAutoSave?: (newTask: EvaluationTaskRecord) => void;
  onCancel: () => void;
  initialTask?: EvaluationTaskRecord | null;
}

export const EvaluationTaskEditor: React.FC<EvaluationTaskEditorProps> = ({
  onSaveTask,
  onAutoSave,
  onCancel,
  initialTask
}) => {
  const { sites } = useApp();

  // Mode Selection: ① 站点信息选择 | ② 离线站点数据导入 | ③ 人工录入
  const [entryMode, setEntryMode] = useState<EntryMode>(initialTask?.inputSnapshot.entryMode || 'site_select');
  const [pendingModeSwitch, setPendingModeSwitch] = useState<EntryMode | null>(null);
  const [showSwitchConfirmModal, setShowSwitchConfirmModal] = useState(false);

  // Auto-Save Tracking
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(initialTask?.id || null);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(initialTask?.evaluatedAt ? initialTask.evaluatedAt.split(' ')[1] : null);

  // Task Basic Metadata
  const [taskName, setTaskName] = useState<string>(initialTask?.taskName || '新建储能电站可用度售前签约评估');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialTask?.inputSnapshot.selectedSiteId || 'SITE-001');
  const [siteName, setSiteName] = useState<string>(initialTask?.siteName || '宁德时代一期储能电站');
  const [region, setRegion] = useState<string>(initialTask?.region || '华东区');
  const [representativeOffice, setRepresentativeOffice] = useState<string>(initialTask?.representativeOffice || '江苏代表处');
  const [customerName, setCustomerName] = useState<string>(initialTask?.customerName || '宁德时代新能源科技有限公司');
  const [industryScenario, setIndustryScenario] = useState<string>(initialTask?.inputSnapshot.industryScenario || '工商业高负荷储能');
  const [capacityMw, setCapacityMw] = useState<number>(initialTask?.capacityMw || 25);
  const [capacityMwh, setCapacityMwh] = useState<number>(initialTask?.capacityMwh || 50);
  const [proposedSla, setProposedSla] = useState<number>(initialTask?.proposedSla || 99.50);

  // Devices Table State
  const [devices, setDevices] = useState<DeviceItem[]>(
    initialTask?.inputSnapshot.devices || [
      {
        id: 'DEV-01',
        type: 'PCS_INVERTER',
        typeName: 'PCS 变流器',
        model: 'PCS-1250K-HV (高压变流)',
        quantity: 20,
        ratedPowerKw: 1250,
        isKeyDevice: true,
        mtbfHours: 85000,
        mttrHours: 2.5
      },
      {
        id: 'DEV-02',
        type: 'BMS_CLUSTER',
        typeName: 'BMS 电池簇',
        model: 'LFP-280Ah-Rack (磷酸铁锂)',
        quantity: 40,
        ratedPowerKw: 1250,
        isKeyDevice: true,
        mtbfHours: 120000,
        mttrHours: 1.8
      },
      {
        id: 'DEV-03',
        type: 'EMS_HOST',
        typeName: 'EMS 主控系统',
        model: 'EMS-Core-V3 (双机冗余站)',
        quantity: 2,
        ratedPowerKw: 50,
        isKeyDevice: true,
        mtbfHours: 150000,
        mttrHours: 1.0
      },
      {
        id: 'DEV-04',
        type: 'TRANSFORMER',
        typeName: '主变压器',
        model: 'SCB14-2500/35 (干式变压器)',
        quantity: 10,
        ratedPowerKw: 2500,
        isKeyDevice: true,
        mtbfHours: 200000,
        mttrHours: 4.5
      },
      {
        id: 'DEV-05',
        type: 'HVAC_COOLING',
        typeName: '暖通温控 HVAC',
        model: 'LiquidCool-40KW (闭式液冷机组)',
        quantity: 20,
        ratedPowerKw: 40,
        isKeyDevice: false,
        mtbfHours: 60000,
        mttrHours: 3.0
      }
    ]
  );

  // Topology State
  const [redundancy, setRedundancy] = useState<RedundancyTopology>(
    initialTask?.inputSnapshot.redundancy || 'DUAL_HOT_BACKUP'
  );
  const [topologyStructure, setTopologyStructure] = useState<string>(
    initialTask?.inputSnapshot.topologyStructure || '双环网环切拓扑 (Dual Fiber Ring)'
  );
  const [linkDescription, setLinkDescription] = useState<string>(
    initialTask?.inputSnapshot.linkDescription || '双路光纤千兆工业以太网，支持自愈环网协议切换，时延 < 20ms'
  );

  // Samples State
  const [sampleSourceType, setSampleSourceType] = useState<'regional_pool' | 'custom_pool'>(
    initialTask?.inputSnapshot.sampleSourceType || 'regional_pool'
  );
  const [sampleCount, setSampleCount] = useState<number>(initialTask?.inputSnapshot.sampleCount || 38);

  // Meteorological State
  const [meteorological, setMeteorological] = useState<MeteorologicalData>(
    initialTask?.inputSnapshot.meteorological || {
      source: 'auto_regional',
      avgTempC: 17.5,
      maxTempC: 41.2,
      minTempC: -5.0,
      relativeHumidityPct: 78,
      altitudeMeters: 45,
      rainfallMm: 1250,
      corrosionGrade: 'C3',
      stormFrequency: 18,
      solarRadiationKwhM2: 1350,
      notes: '东部沿海湿热气候，夏季极端高温持续时间长，需强化闭式液冷温控防护'
    }
  );

  // Electricity Pricing State (★ Explicitly requested by user)
  const [electricityPricing, setElectricityPricing] = useState<ElectricityPricingData>(
    initialTask?.inputSnapshot.electricityPricing || REGIONAL_ELECTRICITY_PRESETS[region] || DEFAULT_ELECTRICITY_PRICING
  );

  // Offline Import State (Zone 1 Mode 2)
  const [offlineFileName, setOfflineFileName] = useState<string | null>(null);
  const [offlineParseLogs, setOfflineParseLogs] = useState<string[]>([]);
  const [offlineParseStatus, setOfflineParseStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');

  // Calculation & Progress State (Zone 3)
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationProgress, setCalculationProgress] = useState<number>(0);
  const [calculationPhaseText, setCalculationPhaseText] = useState<string>('准备就绪');
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<PreSalesEvaluationResult | null>(
    initialTask?.resultSnapshot || null
  );

  // Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Section reference for auto-scrolling
  const resultsRef = useRef<HTMLDivElement>(null);

  // When Region changes and meteorological source is auto_regional, auto-fill weather params & electricity presets
  useEffect(() => {
    if (meteorological.source === 'auto_regional') {
      const weatherProfile = REGIONAL_WEATHER_PROFILES[region] || REGIONAL_WEATHER_PROFILES['华东区'];
      setMeteorological(prev => ({
        ...prev,
        ...weatherProfile
      }));
    }
  }, [region, meteorological.source]);

  // Helper: map a site to realistic devices and topology structure
  const getSiteDevicesAndTopology = (s: any) => {
    let red: RedundancyTopology = 'DUAL_HOT_BACKUP';
    let topoName = '双环网热切拓扑 (Dual Fiber Ring)';
    let linkDesc = '双路光纤千兆工业以太网，支持自愈环网协议切换，时延 < 20ms';

    if (s.redundancy === 'RING_TOPOLOGY') {
      red = 'FIBER_RING';
      topoName = '自愈光纤双环网架构 (Fiber Dual Ring)';
      linkDesc = '环网冗余工业光纤，支持 IEC 61850 快速自愈，倒换时延 < 15ms';
    } else if (s.redundancy === 'N_PLUS_1') {
      red = 'N_PLUS_ONE';
      topoName = 'N+1 单元冗余分布式架构 (N+1 Modular)';
      linkDesc = '标准工业以太网冗余总线，单机离线自动旁路，不影响母线并网';
    } else if (s.redundancy === 'MULTI_ACTIVE') {
      red = 'MULTI_ACTIVE';
      topoName = '多活分布式集群高可用架构 (Multi-Active Cluster)';
      linkDesc = '全互联高速光纤专网，多节点动态负载均衡与故障实时转移';
    } else if (s.redundancy === 'NONE') {
      red = 'SINGLE';
      topoName = '单机集中式串联拓扑 (Single Structure)';
      linkDesc = '单路由标准以太网通信，无冗余备用链路';
    }

    const mw = s.capacityMw || 20;
    const pcsQty = Math.max(4, Math.round(mw / 1.25));
    const bmsQty = Math.max(8, Math.round(mw * 2));
    const trafoQty = Math.max(2, Math.round(mw / 5));
    const hvacQty = Math.max(4, Math.round(mw / 2));

    const devList: DeviceItem[] = [
      {
        id: `DEV-${s.id}-01`,
        type: 'PCS_INVERTER',
        typeName: 'PCS 变流器',
        model: mw >= 30 ? 'PCS-2500K-集中式变流器' : 'PCS-1250K-HV (高压变流)',
        quantity: pcsQty,
        ratedPowerKw: mw >= 30 ? 2500 : 1250,
        isKeyDevice: true,
        mtbfHours: 85000,
        mttrHours: 2.5
      },
      {
        id: `DEV-${s.id}-02`,
        type: 'BMS_CLUSTER',
        typeName: 'BMS 电池簇',
        model: 'LFP-280Ah-Rack (标准磷酸铁锂电池簇)',
        quantity: bmsQty,
        ratedPowerKw: 1250,
        isKeyDevice: true,
        mtbfHours: 120000,
        mttrHours: 1.8
      },
      {
        id: `DEV-${s.id}-03`,
        type: 'EMS_HOST',
        typeName: 'EMS 主控系统',
        model: red === 'DUAL_HOT_BACKUP' ? 'EMS-Core-V3 (主备双机站级工作站)' : 'EMS-Standard-Station (站级主控机)',
        quantity: 2,
        ratedPowerKw: 50,
        isKeyDevice: true,
        mtbfHours: 150000,
        mttrHours: 1.0
      },
      {
        id: `DEV-${s.id}-04`,
        type: 'TRANSFORMER',
        typeName: '主升压变压器',
        model: 'SCB14-2500/35 (干式变压器)',
        quantity: trafoQty,
        ratedPowerKw: 2500,
        isKeyDevice: true,
        mtbfHours: 200000,
        mttrHours: 4.5
      },
      {
        id: `DEV-${s.id}-05`,
        type: 'HVAC_COOLING',
        typeName: '暖通温控 HVAC',
        model: 'LiquidCool-40KW (闭式工业液冷机组)',
        quantity: hvacQty,
        ratedPowerKw: 40,
        isKeyDevice: false,
        mtbfHours: 60000,
        mttrHours: 3.0
      }
    ];

    return { red, topoName, linkDesc, devList };
  };

  // Handle switching existing site in Mode 1
  const handleSelectExistingSite = (siteId: string) => {
    const s = sites.find(item => item.id === siteId);
    if (!s) return;
    setSelectedSiteId(s.id);
    setSiteName(s.siteName);
    setTaskName(`${s.siteName}售前可用度签约评估`);
    setRegion(s.region || '华东区');
    setRepresentativeOffice(s.representativeOffice || '所属代表处');
    setCustomerName(s.customer || '意向重点客户');
    setCapacityMw(s.capacityMw || 20);
    setCapacityMwh((s.capacityMw || 20) * 2);
    setProposedSla(s.slaThreshold || 99.50);

    // Link devices and topology automatically
    const topoData = getSiteDevicesAndTopology(s);
    setRedundancy(topoData.red);
    setTopologyStructure(topoData.topoName);
    setLinkDescription(topoData.linkDesc);
    setDevices(topoData.devList);

    setSampleCount(s.region === '西北区' ? 14 : s.region === '华南区' ? 22 : 38);
    setElectricityPricing(REGIONAL_ELECTRICITY_PRESETS[s.region || '华东区'] || DEFAULT_ELECTRICITY_PRICING);
  };

  // Initial load sync for site_select mode
  useEffect(() => {
    if (!initialTask && entryMode === 'site_select') {
      const s = sites.find(item => item.id === selectedSiteId) || sites[0];
      if (s) {
        handleSelectExistingSite(s.id);
      }
    }
  }, []);

  // Switch mode with confirmation
  const handleRequestModeSwitch = (targetMode: EntryMode) => {
    if (targetMode === entryMode) return;
    setPendingModeSwitch(targetMode);
    setShowSwitchConfirmModal(true);
  };

  const handleConfirmModeSwitch = () => {
    if (!pendingModeSwitch) return;
    setEntryMode(pendingModeSwitch);
    setShowSwitchConfirmModal(false);

    if (pendingModeSwitch === 'site_select') {
      handleSelectExistingSite(selectedSiteId || 'SITE-001');
    } else if (pendingModeSwitch === 'manual') {
      setTaskName('新建工商业储能电站售前签约评估');
      setSiteName('华南新建 10MW/20MWh 工商业储能站');
      setRegion('华南区');
      setRepresentativeOffice('广东代表处');
      setCustomerName('某国际装备制造园区');
      setIndustryScenario('工商业削峰填谷');
      setCapacityMw(10);
      setCapacityMwh(20);
      setProposedSla(99.40);
      setRedundancy('N_PLUS_ONE');
      setTopologyStructure('N+1 单元冗余分布式拓扑 (N+1 Modular)');
      setLinkDescription('标准工业以太网冗余总线，单机离线自动旁路，不影响母线并网');
      setSampleCount(18);
      setElectricityPricing(REGIONAL_ELECTRICITY_PRESETS['华南区']);
      // Provide customizable default devices for manual mode
      setDevices([
        {
          id: 'DEV-MANUAL-01',
          type: 'PCS_INVERTER',
          typeName: 'PCS 变流器',
          model: 'PCS-1250K-HV (自主选配)',
          quantity: 8,
          ratedPowerKw: 1250,
          isKeyDevice: true,
          mtbfHours: 85000,
          mttrHours: 2.5
        },
        {
          id: 'DEV-MANUAL-02',
          type: 'BMS_CLUSTER',
          typeName: 'BMS 电池簇',
          model: 'LFP-280Ah-Rack (标准磷酸铁锂)',
          quantity: 16,
          ratedPowerKw: 1250,
          isKeyDevice: true,
          mtbfHours: 120000,
          mttrHours: 1.8
        },
        {
          id: 'DEV-MANUAL-03',
          type: 'EMS_HOST',
          typeName: 'EMS 主控系统',
          model: 'EMS-Core-V3 (主控工作站)',
          quantity: 2,
          ratedPowerKw: 50,
          isKeyDevice: true,
          mtbfHours: 150000,
          mttrHours: 1.0
        },
        {
          id: 'DEV-MANUAL-04',
          type: 'TRANSFORMER',
          typeName: '主升压变压器',
          model: 'SCB14-2500/35 (干变)',
          quantity: 2,
          ratedPowerKw: 2500,
          isKeyDevice: true,
          mtbfHours: 200000,
          mttrHours: 4.5
        },
        {
          id: 'DEV-MANUAL-05',
          type: 'HVAC_COOLING',
          typeName: '暖通温控 HVAC',
          model: 'LiquidCool-40KW (闭式液冷)',
          quantity: 8,
          ratedPowerKw: 40,
          isKeyDevice: false,
          mtbfHours: 60000,
          mttrHours: 3.0
        }
      ]);
    } else if (pendingModeSwitch === 'offline_import') {
      setOfflineFileName(null);
      setOfflineParseLogs([]);
      setOfflineParseStatus('idle');
      setDevices([]);
    }
    setPendingModeSwitch(null);
  };

  // Apply electricity preset
  const applyElectricityPreset = (presetName: string) => {
    if (REGIONAL_ELECTRICITY_PRESETS[presetName]) {
      setElectricityPricing(REGIONAL_ELECTRICITY_PRESETS[presetName]);
    }
  };

  // Trigger Offline File Simulation
  const handleSimulateFileUpload = (file: File) => {
    setOfflineFileName(file.name);
    setOfflineParseStatus('parsing');
    setOfflineParseLogs([
      '正在读取离线数据包与拓扑清单 (支持 .xlsx, .json, .csv)...',
      '检测到站点拓扑文件: ' + file.name
    ]);

    setTimeout(() => {
      setOfflineParseLogs(prev => [...prev, '已解析站点信息: 离线示范项目 (30MW/60MWh), 包含 5 类 74 套核心设备']);
    }, 400);

    setTimeout(() => {
      const parsedRedundancy: RedundancyTopology = 'FIBER_RING';
      const parsedTopology = '自愈光纤双环网架构 (Fiber Dual Ring)';
      const parsedLink = '双路工业光纤千兆以太网，支持 IEC 61850 快速自愈，环网倒换时延 < 15ms';
      const parsedDevices: DeviceItem[] = [
        {
          id: 'DEV-OFFLINE-01',
          type: 'PCS_INVERTER',
          typeName: 'PCS 变流器',
          model: 'PCS-1500K-String (组串式逆变器)',
          quantity: 20,
          ratedPowerKw: 1500,
          isKeyDevice: true,
          mtbfHours: 92000,
          mttrHours: 2.0
        },
        {
          id: 'DEV-OFFLINE-02',
          type: 'BMS_CLUSTER',
          typeName: 'BMS 电池簇',
          model: 'LFP-300Ah-HighDensity (高能量密度磷酸铁锂)',
          quantity: 40,
          ratedPowerKw: 1500,
          isKeyDevice: true,
          mtbfHours: 135000,
          mttrHours: 1.5
        },
        {
          id: 'DEV-OFFLINE-03',
          type: 'EMS_HOST',
          typeName: 'EMS 站控系统',
          model: 'Dual-Redundant-EMS-Pro (双机热备站)',
          quantity: 2,
          ratedPowerKw: 60,
          isKeyDevice: true,
          mtbfHours: 160000,
          mttrHours: 0.8
        },
        {
          id: 'DEV-OFFLINE-04',
          type: 'TRANSFORMER',
          typeName: '油浸式主变压器',
          model: 'S13-M-31500/110 (高压并网变)',
          quantity: 2,
          ratedPowerKw: 31500,
          isKeyDevice: true,
          mtbfHours: 220000,
          mttrHours: 6.0
        },
        {
          id: 'DEV-OFFLINE-05',
          type: 'HVAC_COOLING',
          typeName: '智能液冷循环空调',
          model: 'SmartChiller-60KW (双循环闭环温控)',
          quantity: 20,
          ratedPowerKw: 60,
          isKeyDevice: false,
          mtbfHours: 72000,
          mttrHours: 2.2
        }
      ];

      setRedundancy(parsedRedundancy);
      setTopologyStructure(parsedTopology);
      setLinkDescription(parsedLink);
      setDevices(parsedDevices);

      setOfflineParseLogs(prev => [
        ...prev,
        '自动识别并联动组网架构: 光纤双自愈环网 (FIBER_RING), 通信时延 15ms',
        '校验设备清单 MTBF 与 MTTR 属性完整，已自动联动填充设备清单与组网拓扑。'
      ]);
      setOfflineParseStatus('success');

      setTaskName(`离线导入_${file.name.replace(/\.[^/.]+$/, '')}售前可用度评估`);
      setSiteName(`离线示范储能站 (${file.name.replace(/\.[^/.]+$/, '')})`);
      setCapacityMw(30);
      setCapacityMwh(60);
    }, 900);
  };

  // Current Input State Object
  const currentInputState: PreSalesInputState = useMemo(() => ({
    entryMode,
    selectedSiteId,
    siteName,
    region,
    representativeOffice,
    customerName,
    industryScenario,
    capacityMw,
    capacityMwh,
    proposedSla,
    devices,
    redundancy,
    topologyStructure,
    linkDescription,
    sampleSourceType,
    sampleCount,
    meteorological,
    electricityPricing
  }), [
    entryMode,
    selectedSiteId,
    siteName,
    region,
    representativeOffice,
    customerName,
    industryScenario,
    capacityMw,
    capacityMwh,
    proposedSla,
    devices,
    redundancy,
    topologyStructure,
    linkDescription,
    sampleSourceType,
    sampleCount,
    meteorological,
    electricityPricing
  ]);

  // Start Calculation Engine with 5-phase simulation
  const handleStartEvaluation = () => {
    if (isCalculating) return;
    setCalculationError(null);
    setIsCalculating(true);
    setCalculationProgress(0);
    setCalculationPhaseText('正在初始化测算环境与基础参数校验...');

    const phases = [
      { progress: 20, text: '解析设备清单与组网拓扑单点故障 (SPOF)...' },
      { progress: 45, text: '结合同区域同类站点历史样本库加权校准 (Bayesian)...' },
      { progress: 70, text: '加载气象因子敏感度矩阵与极端环境降额折减...' },
      { progress: 90, text: '结合电价模型计算峰谷套利损失与 SLA 违约金敞口...' },
      { progress: 100, text: '测算完成！正在生成可用度决策报告与建议清单...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < phases.length) {
        setCalculationProgress(phases[currentStep].progress);
        setCalculationPhaseText(phases[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        try {
          const result = calculatePreSalesEvaluation(currentInputState);
          setEvaluationResult(result);
          setIsCalculating(false);

          // 默认运行结束后自动保存到评估列表
          const now = new Date();
          const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const assignedId = currentTaskId || initialTask?.id || `EVAL-${dateStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
          if (!currentTaskId) {
            setCurrentTaskId(assignedId);
          }

          const record: EvaluationTaskRecord = {
            id: assignedId,
            taskName: taskName.trim() || `${siteName}售前可用度签约评估`,
            siteName: siteName.trim() || '意向储能电站',
            region,
            representativeOffice,
            customerName: customerName.trim() || '重点合作客户',
            capacityMw,
            capacityMwh,
            proposedSla,
            status: 'completed',
            createdAt: initialTask?.createdAt || `${dateStr} ${timeStr}`,
            evaluatedAt: `${dateStr} ${timeStr}`,
            creatorName: initialTask?.creatorName || '陈兴虎 (Tech Lead)',
            creatorEmail: 'xinghuchen@gmail.com',
            inputSnapshot: currentInputState,
            resultSnapshot: result
          };

          if (onAutoSave) {
            onAutoSave(record);
          } else {
            onSaveTask(record);
          }
          setAutoSavedTime(timeStr);

          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        } catch (err: any) {
          setIsCalculating(false);
          setCalculationError(err.message || '计算引擎运行时异常，请检查输入参数');
        }
      }
    }, 280);
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb Navigation */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="返回评估列表"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <span className="hover:text-blue-600 cursor-pointer" onClick={onCancel}>售前可用度评估</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">创建可用度评估任务</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              配置站点、气象、电价参数并启动可用度推演
            </h1>
          </div>
        </div>
      </div>

      {/* Task Identity Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
              0
            </div>
            <h2 className="text-sm font-bold text-slate-900">评估任务基本信息</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">创建人: 陈兴虎 (xinghuchen@gmail.com)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">评估任务名称 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="输入任务名称，如 宁德时代一期储能电站签约评估"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">意向客户全称 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="客户名称"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">所属代表处 / 大区</label>
            <input
              type="text"
              value={representativeOffice}
              onChange={e => setRepresentativeOffice(e.target.value)}
              placeholder="如 江苏代表处"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* ZONE 1: 站点数据录入区 (三种方式切换) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
              1
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">站点数据录入区 (提供设备与组网拓扑)</h2>
              <p className="text-[11px] text-slate-400">支持三种录入模式快速导入或自定义配置</p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleRequestModeSwitch('site_select')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                entryMode === 'site_select'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>① 站点信息选择</span>
            </button>

            <button
              type="button"
              onClick={() => handleRequestModeSwitch('offline_import')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                entryMode === 'offline_import'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>② 离线数据导入</span>
            </button>

            <button
              type="button"
              onClick={() => handleRequestModeSwitch('manual')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                entryMode === 'manual'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>③ 人工自定义录入</span>
            </button>
          </div>
        </div>

        {/* Mode 1: 站点选择 */}
        {entryMode === 'site_select' && (
          <div className="space-y-4">
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-medium">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>已联动当前系统站点库，选择既有站点后将自动带出历史资产、拓扑结构与设备清单。</span>
              </div>
              <span className="text-[11px] text-blue-600 font-bold shrink-0">系统站点库 ({sites.length}个)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">选择对应参考站点</label>
                <select
                  value={selectedSiteId}
                  onChange={e => handleSelectExistingSite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.siteName} ({s.region} · {s.capacityMw}MW)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">站点显示名称</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={e => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">地理区域</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="华东区">华东区 (沿海温湿)</option>
                  <option value="华北区">华北区 (干燥温带)</option>
                  <option value="西北区">西北区 (荒漠大温差高海拔)</option>
                  <option value="华南区">华南区 (高温湿热强盐雾)</option>
                  <option value="西南区">西南区 (高海拔多雷暴)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">意向装机规模 (MW / MWh)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={capacityMw}
                    onChange={e => {
                      const mw = Number(e.target.value);
                      setCapacityMw(mw);
                      setCapacityMwh(mw * 2);
                    }}
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                    placeholder="MW"
                  />
                  <span className="text-slate-400">/</span>
                  <input
                    type="number"
                    value={capacityMwh}
                    onChange={e => setCapacityMwh(Number(e.target.value))}
                    className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                    placeholder="MWh"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: 离线导入 */}
        {entryMode === 'offline_import' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/60 transition-colors">
              <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 mb-1">拖拽或点击上传离线站点数据包</div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto mb-3">
                支持导入含有设备型号、BOM台账、组网接线图及环境检测记录的 .xlsx / .json / .csv 压缩包
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                <span>选择本地文件导入</span>
                <input
                  type="file"
                  accept=".xlsx,.json,.csv,.zip"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleSimulateFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {offlineParseStatus !== 'idle' && (
              <div className="bg-slate-900 text-white p-4 rounded-xl text-xs font-mono space-y-1.5">
                <div className="text-slate-400 border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>文件解析管道监控 [{offlineFileName}]</span>
                  <span className={offlineParseStatus === 'success' ? 'text-emerald-400 font-bold' : 'text-blue-400'}>
                    {offlineParseStatus === 'success' ? '✔ 解析完成' : '解析推演中...'}
                  </span>
                </div>
                {offlineParseLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300">
                    <span className="text-blue-400 mr-2">&gt;</span>
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mode 3: 人工录入 */}
        {entryMode === 'manual' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">拟建站点名称</label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">地理区域</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="华东区">华东区</option>
                <option value="华北区">华北区</option>
                <option value="西北区">西北区</option>
                <option value="华南区">华南区</option>
                <option value="西南区">西南区</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">应用场景分类</label>
              <input
                type="text"
                value={industryScenario}
                onChange={e => setIndustryScenario(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">装机容量 (MW / MWh)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={capacityMw}
                  onChange={e => setCapacityMw(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  value={capacityMwh}
                  onChange={e => setCapacityMwh(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Equipment & Topology Grid */}
        <div className="pt-3 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                {entryMode === 'site_select' && (
                  <span>站点档案联动设备清单与组网拓扑 ({devices.length} 项)</span>
                )}
                {entryMode === 'offline_import' && (
                  <span>离线数据包解析设备清单与组网拓扑 ({devices.length} 项)</span>
                )}
                {entryMode === 'manual' && (
                  <span>人工自定义核心设备清单与组网链路 ({devices.length} 项)</span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {entryMode === 'site_select' && '已联动当前所选站点的资产台账与通信组网架构（只读联动锁定）'}
                {entryMode === 'offline_import' && (
                  offlineParseStatus === 'success'
                    ? `已从离线文件【${offlineFileName}】自动解析并联动展示设备与组网架构（只读联动锁定）`
                    : '请先在上方上传离线数据包，解析成功后将在此联动展示设备清单与组网'
                )}
                {entryMode === 'manual' && '支持自由添加/删除设备、切换关键设备，并自主选配组网冗余拓扑与通信链路'}
              </p>
            </div>

            {/* In manual mode ONLY: show "+ 添加设备项" button */}
            {entryMode === 'manual' ? (
              <button
                type="button"
                onClick={() => {
                  const newId = `DEV-CUSTOM-${Date.now().toString().slice(-4)}`;
                  setDevices([
                    ...devices,
                    {
                      id: newId,
                      type: 'PCS_INVERTER',
                      typeName: '自定义设备',
                      model: 'Custom-Device-Model',
                      quantity: 4,
                      ratedPowerKw: 1000,
                      isKeyDevice: true,
                      mtbfHours: 80000,
                      mttrHours: 2.0
                    }
                  ]);
                }}
                className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 添加设备项</span>
              </button>
            ) : entryMode === 'site_select' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>站点档案自动联动 (只读)</span>
              </span>
            ) : offlineParseStatus === 'success' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>离线数据包解析提取 (只读)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>等待文件解析</span>
              </span>
            )}
          </div>

          {/* Conditional rendering for offline_import when not yet uploaded */}
          {entryMode === 'offline_import' && offlineParseStatus !== 'success' ? (
            <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-700">等待离线数据包导入与解析</div>
              <p className="max-w-md mx-auto text-slate-500">
                请先在上方上传离线站点数据包（.xlsx / .json / .csv），系统解析后将自动联动提取并在此展示站点设备清单与组网架构。
              </p>
            </div>
          ) : (
            <>
              {/* Devices Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">设备类别</th>
                      <th className="py-2.5 px-3">规格型号</th>
                      <th className="py-2.5 px-3 text-center">数量 (台/套)</th>
                      <th className="py-2.5 px-3 text-right">单台功率 (kW)</th>
                      <th className="py-2.5 px-3 text-center">核心关键设备</th>
                      <th className="py-2.5 px-3 text-right">MTBF (小时)</th>
                      <th className="py-2.5 px-3 text-right">MTTR (小时)</th>
                      {entryMode === 'manual' && <th className="py-2.5 px-2 text-center">操作</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {devices.map(dev => (
                      <tr key={dev.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {entryMode === 'manual' ? (
                            <input
                              type="text"
                              value={dev.typeName}
                              onChange={e => setDevices(devices.map(d => d.id === dev.id ? { ...d, typeName: e.target.value } : d))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded w-28 text-xs font-medium"
                            />
                          ) : (
                            dev.typeName
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {entryMode === 'manual' ? (
                            <input
                              type="text"
                              value={dev.model}
                              onChange={e => setDevices(devices.map(d => d.id === dev.id ? { ...d, model: e.target.value } : d))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded w-full text-xs"
                            />
                          ) : (
                            dev.model
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-800">
                          {entryMode === 'manual' ? (
                            <input
                              type="number"
                              value={dev.quantity}
                              onChange={e => setDevices(devices.map(d => d.id === dev.id ? { ...d, quantity: Math.max(1, Number(e.target.value)) } : d))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded w-16 text-xs text-center font-bold"
                            />
                          ) : (
                            dev.quantity
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">
                          {entryMode === 'manual' ? (
                            <input
                              type="number"
                              value={dev.ratedPowerKw}
                              onChange={e => setDevices(devices.map(d => d.id === dev.id ? { ...d, ratedPowerKw: Number(e.target.value) } : d))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded w-20 text-xs text-right font-mono"
                            />
                          ) : (
                            dev.ratedPowerKw.toLocaleString()
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {entryMode === 'manual' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setDevices(devices.map(d => d.id === dev.id ? { ...d, isKeyDevice: !d.isKeyDevice } : d));
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                dev.isKeyDevice
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {dev.isKeyDevice ? '关键计量' : '常规设备'}
                            </button>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dev.isKeyDevice
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {dev.isKeyDevice ? '关键计量' : '常规设备'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {entryMode === 'manual' ? (
                            <input
                              type="number"
                              value={dev.mtbfHours}
                              onChange={e => setDevices(devices.map(d => d.id === dev.id ? { ...d, mtbfHours: Number(e.target.value) } : d))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded w-24 text-xs text-right font-mono"
                            />
                          ) : (
                            dev.mtbfHours.toLocaleString()
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {entryMode === 'manual' ? (
                            <input
                              type="number"
                              step="0.1"
                              value={dev.mttrHours}
                              onChange={e => setDevices(devices.map(d => d.id === dev.id ? { ...d, mttrHours: Number(e.target.value) } : d))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded w-16 text-xs text-right font-mono"
                            />
                          ) : (
                            dev.mttrHours
                          )}
                        </td>
                        {entryMode === 'manual' && (
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setDevices(devices.filter(d => d.id !== dev.id))}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="删除设备项"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Topology & Redundancy settings */}
              {entryMode === 'manual' ? (
                /* Manual Mode: select redundancy and edit link description */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      组网拓扑与冗余级别 <span className="text-blue-600 font-normal">(自主选配)</span>
                    </label>
                    <select
                      value={redundancy}
                      onChange={e => {
                        const val = e.target.value as RedundancyTopology;
                        setRedundancy(val);
                        if (val === 'DUAL_HOT_BACKUP') setTopologyStructure('双机主备热切拓扑 (Dual Hot Standby)');
                        else if (val === 'N_PLUS_ONE') setTopologyStructure('N+1 单元冗余分布式拓扑 (N+1 Modular)');
                        else if (val === 'FIBER_RING') setTopologyStructure('自愈光纤双环网架构 (Fiber Dual Ring)');
                        else if (val === 'MULTI_ACTIVE') setTopologyStructure('多活分布式集群高可用架构 (Multi-Active Cluster)');
                        else setTopologyStructure('单机集中式串联拓扑 (Single Point Structure)');
                      }}
                      className="w-full px-3 py-2 bg-white border border-blue-300 ring-2 ring-blue-500/10 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="SINGLE">单机架构 (Single · 无冗余瓶颈)</option>
                      <option value="N_PLUS_ONE">N+1 冗余架构 (部分容错备份)</option>
                      <option value="DUAL_HOT_BACKUP">双机热备 (Dual Hot Backup · 毫秒级自愈)</option>
                      <option value="FIBER_RING">光纤自愈环网 (Fiber Self-Healing Ring)</option>
                      <option value="MULTI_ACTIVE">多活分布式高可用 (Multi-Active Distributed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      通信链路描述 <span className="text-blue-600 font-normal">(自主编辑)</span>
                    </label>
                    <input
                      type="text"
                      value={linkDescription}
                      onChange={e => setLinkDescription(e.target.value)}
                      placeholder="输入通信专网链路、自愈倒换协议与网络时延参数"
                      className="w-full px-3 py-2 bg-white border border-blue-300 ring-2 ring-blue-500/10 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>
              ) : (
                /* Site Select & Offline Import: read-only linked topology display */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600">组网拓扑与冗余级别</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> 联动锁定 (只读)
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {redundancy === 'DUAL_HOT_BACKUP' ? '双机热备 (Dual Hot Backup · 毫秒级自愈)'
                        : redundancy === 'N_PLUS_ONE' ? 'N+1 冗余架构 (部分容错备份)'
                        : redundancy === 'FIBER_RING' ? '光纤自愈环网 (Fiber Self-Healing Ring)'
                        : redundancy === 'MULTI_ACTIVE' ? '多活分布式高可用 (Multi-Active Distributed)'
                        : '单机架构 (Single · 无冗余瓶颈)'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">{topologyStructure}</div>
                  </div>

                  <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-600">通信专网链路描述</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        <Lock className="w-3 h-3" /> 联动锁定 (只读)
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-700 leading-relaxed mt-1">
                      {linkDescription}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1.5">
                      ℹ 该组网架构由{entryMode === 'site_select' ? '所选站点档案库' : '离线数据包'}自动联动带出。如需自定义拓扑与链路，请切换至「③ 人工自定义录入」。
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ZONE 2: 站点气象与环境参数补充区 */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200">
              2
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">站点气象与环境参数补充区</h2>
              <p className="text-[11px] text-slate-400">基于气象基线自动微调或导入当地极端气候因子</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">数据源:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setMeteorological({ ...meteorological, source: 'auto_regional' })}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  meteorological.source === 'auto_regional'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                区域基线带出
              </button>
              <button
                type="button"
                onClick={() => setMeteorological({ ...meteorological, source: 'manual' })}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  meteorological.source === 'manual'
                    ? 'bg-white text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                在线微调录入
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">极端最高气温 (℃)</label>
            <input
              type="number"
              value={meteorological.maxTempC}
              onChange={e => setMeteorological({ ...meteorological, maxTempC: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">极端最低气温 (℃)</label>
            <input
              type="number"
              value={meteorological.minTempC}
              onChange={e => setMeteorological({ ...meteorological, minTempC: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">相对湿度 (%)</label>
            <input
              type="number"
              value={meteorological.relativeHumidityPct}
              onChange={e => setMeteorological({ ...meteorological, relativeHumidityPct: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">站点海拔高度 (米)</label>
            <input
              type="number"
              value={meteorological.altitudeMeters}
              onChange={e => setMeteorological({ ...meteorological, altitudeMeters: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">腐蚀与沙尘等级</label>
            <select
              value={meteorological.corrosionGrade}
              onChange={e => setMeteorological({ ...meteorological, corrosionGrade: e.target.value as CorrosionGrade })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            >
              <option value="C1_C2">C1-C2 (干燥洁净内陆)</option>
              <option value="C3">C3 (中度城市/普通工业)</option>
              <option value="C4">C4 (重工业区/沿海湿热)</option>
              <option value="C5">C5 (海洋严苛盐雾/重度污染)</option>
              <option value="SAND_STORM">SAND_STORM (戈壁大风沙侵蚀)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">年均雷暴/台风频次 (次)</label>
            <input
              type="number"
              value={meteorological.stormFrequency}
              onChange={e => setMeteorological({ ...meteorological, stormFrequency: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">年降雨量 (mm)</label>
            <input
              type="number"
              value={meteorological.rainfallMm}
              onChange={e => setMeteorological({ ...meteorological, rainfallMm: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">年均太阳辐射 (kWh/m²)</label>
            <input
              type="number"
              value={meteorological.solarRadiationKwhM2}
              onChange={e => setMeteorological({ ...meteorological, solarRadiationKwhM2: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>
        </div>
      </div>

      {/* ZONE 2 (续): 电价模型与违约经济参数配置 (★ Explicitly requested by user) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200">
              $
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>电价套利模型与违约经济参数配置</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">重要</span>
              </h2>
              <p className="text-[11px] text-slate-400">配置分时峰平谷电价、充放电循环与 SLA 考核违约金率，推演因不可用停机造成的年化财务敞口</p>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">快捷预设:</span>
            <button
              type="button"
              onClick={() => applyElectricityPreset('华东区')}
              className="px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              江苏两充两放
            </button>
            <button
              type="button"
              onClick={() => applyElectricityPreset('华南区')}
              className="px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              广东高价差
            </button>
            <button
              type="button"
              onClick={() => applyElectricityPreset('西北区')}
              className="px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 rounded text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              西北独立储能
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">尖峰/高峰电价 (元/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={electricityPricing.peakPrice}
              onChange={e => setElectricityPricing({ ...electricityPricing, peakPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">平段电价 (元/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={electricityPricing.flatPrice}
              onChange={e => setElectricityPricing({ ...electricityPricing, flatPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">低谷电价 (元/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={electricityPricing.valleyPrice}
              onChange={e => setElectricityPricing({ ...electricityPricing, valleyPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">度电放电补贴 (元/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={electricityPricing.subsidyPerKwh}
              onChange={e => setElectricityPricing({ ...electricityPricing, subsidyPerKwh: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-700 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">日均充放电循环次数 (次/天)</label>
            <input
              type="number"
              step="0.1"
              value={electricityPricing.dailyCycles}
              onChange={e => setElectricityPricing({ ...electricityPricing, dailyCycles: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">放电深度 DOD (%)</label>
            <input
              type="number"
              value={electricityPricing.dischargeDepthDOD}
              onChange={e => setElectricityPricing({ ...electricityPricing, dischargeDepthDOD: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">年运行天数 (天/年)</label>
            <input
              type="number"
              value={electricityPricing.annualOperatingDays}
              onChange={e => setElectricityPricing({ ...electricityPricing, annualOperatingDays: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1 text-rose-700 font-bold">
              每低于 SLA 0.1% 违约金 (万元/年)
            </label>
            <input
              type="number"
              step="0.5"
              value={electricityPricing.slaPenaltyPerTenthPercent}
              onChange={e => setElectricityPricing({ ...electricityPricing, slaPenaltyPerTenthPercent: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-bold"
            />
          </div>
        </div>

        {/* Live spread readout */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>
              当前峰谷综合套利价差: <strong>{(electricityPricing.peakPrice - electricityPricing.valleyPrice + electricityPricing.subsidyPerKwh).toFixed(3)} 元/kWh</strong>
              （峰段 {electricityPricing.peakPrice} - 谷段 {electricityPricing.valleyPrice} + 补贴 {electricityPricing.subsidyPerKwh}）
            </span>
          </div>
          <span className="font-semibold text-[11px] text-amber-800">
            预计单循环放电额: {((capacityMwh * 1000) * (electricityPricing.dischargeDepthDOD / 100)).toLocaleString()} kWh
          </span>
        </div>
      </div>

      {/* SLA Intention Input & Calculate Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-400/30">
                3
              </div>
              <h3 className="text-sm font-bold text-white">销售拟签约 SLA 意向承诺值</h3>
            </div>
            <p className="text-xs text-slate-300">
              请设定销售合同意向承诺的年化可用度指标，测算引擎将结合同区域样本库进行置信度与违约概率推演。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="95.0"
                max="99.99"
                value={proposedSla}
                onChange={e => setProposedSla(Number(e.target.value))}
                className="w-32 px-3 py-2 text-right bg-slate-800 border border-slate-600 rounded-lg font-mono font-bold text-white text-base focus:ring-2 focus:ring-blue-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
            </div>

            <button
              type="button"
              onClick={handleStartEvaluation}
              disabled={isCalculating}
              id="btn-trigger-calculation"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isCalculating ? '可用度推演中...' : '启动可用度评估'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Animation */}
        {isCalculating && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300 font-medium flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {calculationPhaseText}
              </span>
              <span className="font-mono text-blue-400 font-bold">{calculationProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${calculationProgress}%` }}
              />
            </div>
          </div>
        )}

        {calculationError && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{calculationError}</span>
          </div>
        )}
      </div>

      {/* ZONE 4: 评估结果与决策报告区 */}
      {evaluationResult && (
        <div ref={resultsRef} className="bg-white rounded-xl p-6 border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                4
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>评估结果与售前决策支持报告</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold">
                    {evaluationResult.reportSnapshotVersion}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">依据设备冗余、气象修正及历史加权模型生成完整结论</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>已自动保存至评估列表{autoSavedTime ? ` (${autoSavedTime})` : ''}</span>
              </span>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>预览与导出报告 (PDF/Excel)</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="返回可用度评估列表"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>返回评估列表</span>
              </button>
            </div>
          </div>

          {/* Key Conclusion Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-center">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
              <div className="text-xs text-blue-800 font-semibold">预期系统可用度</div>
              <div className="text-3xl font-black text-blue-900 mt-1">{evaluationResult.expectedAvailability}%</div>
              <div className="text-[10px] text-blue-600 mt-1">模型置信度: {evaluationResult.confidenceLevel}%</div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
              <div className="text-xs text-emerald-800 font-semibold">推荐签约 SLA 区间</div>
              <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                [{evaluationResult.recommendedSlaMin}%, {evaluationResult.recommendedSlaMax}%]
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">兼顾销售竞争力与零违约</div>
            </div>

            <div className={`rounded-xl p-4 border ${
              evaluationResult.riskLevel === 'HIGH'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : evaluationResult.riskLevel === 'MEDIUM'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-teal-50/70 border-teal-200 text-teal-900'
            }`}>
              <div className="text-xs font-semibold">拟承诺 SLA / 违约概率</div>
              <div className="text-2xl font-black mt-1">
                {proposedSla}% / {evaluationResult.breachProbability}%
              </div>
              <div className="text-[10px] mt-1 font-bold">
                风险判定: {evaluationResult.riskLevel === 'HIGH' ? '🔴 极高风险' : evaluationResult.riskLevel === 'MEDIUM' ? '🟡 中风险' : '🟢 风险可控'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-600 font-semibold">年等效非豁免中断</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {evaluationResult.annualEquivalentInterruptionHours}h
              </div>
              <div className="text-[10px] text-slate-500 mt-1">平均 MTTR: {evaluationResult.expectedMttrHours}h</div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 col-span-2 md:col-span-1">
              <div className="text-xs text-amber-800 font-semibold">综合经济年化敞口</div>
              <div className="text-2xl font-black text-amber-950 mt-1">
                ¥{evaluationResult.financialRisk?.totalAnnualFinancialExposure || 0}万
              </div>
              <div className="text-[10px] text-amber-700 mt-1">停机套利损 + 违约赔偿</div>
            </div>
          </div>

          {/* Risk Reason Banner */}
          <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
            evaluationResult.riskLevel === 'HIGH'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : evaluationResult.riskLevel === 'MEDIUM'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="shrink-0 mt-0.5">
              {evaluationResult.riskLevel === 'HIGH' || evaluationResult.riskLevel === 'MEDIUM' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="font-bold mb-0.5">综合评估裁决与风险提示:</div>
              <p>{evaluationResult.riskReason}</p>
            </div>
          </div>

          {/* Quantile Benchmark & Financial Analysis Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quantile Bar Chart */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">同区域历史分位数行业对标</h3>
                <span className="text-[11px] text-slate-400">同类样本 {evaluationResult.sampleCount}个</span>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evaluationResult.quantileBenchmarks} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis domain={[98.5, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                    <Tooltip formatter={(v: any) => [`${v}%`, '可用度']} />
                    <ReferenceLine y={proposedSla} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `拟约: ${proposedSla}%`, fill: '#e11d48', fontSize: 10 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {evaluationResult.quantileBenchmarks.map((entry, index) => {
                        let fill = '#94a3b8';
                        if (entry.isProposed) fill = '#f43f5e';
                        else if (entry.isRecommended) fill = '#10b981';
                        else if (entry.name.includes('均值')) fill = '#3b82f6';
                        return <Cell key={`cell-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Risk Details */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800">电价套利折损与违约金明细</h3>
                <span className="text-[11px] text-slate-400">装机 {capacityMwh}MWh</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">理论年放电套利</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">
                    ¥{evaluationResult.financialRisk?.annualTheoreticalRevenue || 0} 万元/年
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[11px] text-rose-600 font-medium">停机放电折损</div>
                  <div className="text-base font-bold text-rose-700 mt-0.5">
                    ¥{evaluationResult.financialRisk?.annualOutageArbitrageLoss || 0} 万元/年
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <div className="text-[11px] text-amber-600 font-medium">预期违约赔付额</div>
                  <div className="text-base font-bold text-amber-700 mt-0.5">
                    ¥{evaluationResult.financialRisk?.annualPotentialBreachPenalty || 0} 万元/年
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900 text-white rounded-lg">
                  <div className="text-[11px] text-slate-400">综合经济年敞口</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">
                    ¥{evaluationResult.financialRisk?.totalAnnualFinancialExposure || 0} 万元/年
                  </div>
                </div>
              </div>

              {/* Weather factor deduction breakdown */}
              <div className="pt-1">
                <div className="text-[11px] font-bold text-slate-700 mb-1">气象敏感性折减矩阵:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {evaluationResult.weatherSensitivity.map((w, i) => (
                    <div key={i} className="p-1.5 bg-white rounded border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 truncate mr-1">{w.factor}</span>
                      <span className="font-bold text-rose-600 font-mono">{w.impactPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              SLA 签约防御条款与技术优化清单
            </h3>
            <div className="space-y-2">
              {evaluationResult.recommendations.map(rec => (
                <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                    rec.priority === 'P0' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {rec.priority}
                  </span>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{rec.title}</span>
                      <span className="text-emerald-700 font-semibold">{rec.potentialGain}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{rec.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode Switch Confirmation Modal */}
      {showSwitchConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-full bg-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">确认切换站点数据录入方式？</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              切换录入模式将重新初始化当前表单中的拓扑与设备配置，未保存的微调内容可能会丢失。确认切换吗？
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSwitchConfirmModal(false);
                  setPendingModeSwitch(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmModeSwitch}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                确认切换
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {evaluationResult && (
        <PreSalesEvaluationReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          result={evaluationResult}
          inputState={currentInputState}
        />
      )}
    </div>
  );
};
