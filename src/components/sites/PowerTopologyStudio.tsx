import React, { useState, useRef, useEffect } from 'react';
import {
  Site,
  CoreDevice,
  SitePowerTopology,
  TopologyNode,
  TopologyEdge,
  TopologyNodeType,
  TopologyEdgeType
} from '../../types';
import {
  NODE_TYPE_META,
  generateDefaultSiteTopology,
  autoLayoutTopology,
  getNodeTelemetrySnapshot,
  NodeTelemetrySnapshot
} from './powerTopologyHelper';
import {
  Layers,
  Edit3,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap,
  Server,
  Activity,
  Cpu,
  ArrowRight,
  Shield,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Search,
  ExternalLink,
  Save,
  Network,
  Power,
  Gauge,
  Thermometer,
  TrendingUp,
  BatteryCharging,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface PowerTopologyStudioProps {
  site: Site;
  onUpdateTopology: (topology: SitePowerTopology) => void;
  onSelectDevice: (device: CoreDevice) => void;
  onNavigateTab?: (tabIdx: number) => void;
}

export const PowerTopologyStudio: React.FC<PowerTopologyStudioProps> = ({
  site,
  onUpdateTopology,
  onSelectDevice,
  onNavigateTab
}) => {
  // 1. 初始化拓扑数据 (若站点尚无已保存拓扑，自动根据核心设备单线图生成)
  const [topology, setTopology] = useState<SitePowerTopology>(() => {
    return site.powerTopology || generateDefaultSiteTopology(site);
  });

  // 当外部 site.powerTopology 或 site.id 改变时同步
  useEffect(() => {
    if (site.powerTopology) {
      setTopology(site.powerTopology);
    } else {
      setTopology(generateDefaultSiteTopology(site));
    }
  }, [site.id, site.powerTopology]);

  // 编辑态开关
  const [isEditMode, setIsEditMode] = useState(false);
  // 画布缩放比例 (0.6 ~ 1.5)
  const [zoom, setZoom] = useState(1);
  // 画布对齐网格开关
  const [snapToGrid, setSnapToGrid] = useState(true);
  // 选中的节点或边
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  // 节点属性检视器选项卡 ('telemetry' 实时遥测工况 | 'config' 铭牌与配置)
  const [inspectorTab, setInspectorTab] = useState<'telemetry' | 'config'>('telemetry');


  // 连线模式状态
  const [isWiringMode, setIsWiringMode] = useState(false);
  const [wireSourceNodeId, setWireSourceNodeId] = useState<string | null>(null);
  const [wireType, setWireType] = useState<TopologyEdgeType>('AC_POWER');

  // 拖拽移动节点状态
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 侧边栏搜索与选项卡
  const [paletteTab, setPaletteTab] = useState<'devices' | 'infra'>('devices');
  const [searchDeviceKey, setSearchDeviceKey] = useState('');

  // 保存成功的反馈提示
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // 新增连线弹窗
  const [showEdgeModal, setShowEdgeModal] = useState(false);
  const [pendingEdgeFrom, setPendingEdgeFrom] = useState<string>('');
  const [pendingEdgeTo, setPendingEdgeTo] = useState<string>('');
  const [pendingEdgeType, setPendingEdgeType] = useState<TopologyEdgeType>('AC_POWER');

  // 画布 DOM 引用
  const canvasRef = useRef<HTMLDivElement>(null);

  // 保存反馈自动消失
  useEffect(() => {
    if (saveSuccessMsg) {
      const timer = setTimeout(() => setSaveSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccessMsg]);

  // 统计指标
  const totalNodesCount = topology.nodes.length;
  const pcsNodes = topology.nodes.filter(n => n.type === 'PCS');
  const batteryNodes = topology.nodes.filter(n => n.type === 'BATTERY');
  const totalPcsRatedKw = pcsNodes.reduce((acc, n) => acc + (n.ratedPowerKw || 0), 0);
  const totalBatteryRatedKw = batteryNodes.reduce((acc, n) => acc + (n.ratedPowerKw || 0), 0);

  // 已放置在拓扑中的设备 ID 列表
  const placedDeviceIds = new Set(
    topology.nodes.map(n => n.deviceId).filter((id): id is string => Boolean(id))
  );

  // 孤岛节点检查 (未与任何母线或设备连接)
  const connectedNodeIds = new Set<string>();
  topology.edges.forEach(e => {
    connectedNodeIds.add(e.fromNodeId);
    connectedNodeIds.add(e.toNodeId);
  });
  const floatingNodes = topology.nodes.filter(n => !connectedNodeIds.has(n.id));

  // ====================== 拖拽与连线交互逻辑 ======================

  // 处理从侧边栏开始拖拽
  const handleDragStartFromPalette = (
    e: React.DragEvent,
    item: { type: 'CORE_DEVICE'; device: CoreDevice } | { type: 'INFRA'; nodeType: TopologyNodeType }
  ) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  // 处理在画布上放置拖入的新节点
  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current || !isEditMode) return;

    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const data = JSON.parse(rawData);

      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top) / zoom;

      const finalX = snapToGrid ? Math.round(rawX / 20) * 20 : Math.round(rawX);
      const finalY = snapToGrid ? Math.round(rawY / 20) * 20 : Math.round(rawY);

      if (data.type === 'CORE_DEVICE') {
        const dev: CoreDevice = data.device;
        let nodeType: TopologyNodeType = 'PCS';
        if (dev.deviceType === 'PCS_INVERTER') nodeType = 'PCS';
        else if (dev.deviceType === 'BMS_CLUSTER') nodeType = 'BATTERY';
        else if (dev.deviceType === 'EMS_HOST') nodeType = 'EMS';
        else if (dev.deviceType === 'TRANSFORMER') nodeType = 'TRANSFORMER';

        const newNode: TopologyNode = {
          id: `node-dev-${dev.id}-${Date.now().toString().slice(-4)}`,
          deviceId: dev.id,
          name: dev.deviceName,
          code: dev.deviceCode,
          type: nodeType,
          model: dev.model,
          ratedPowerKw: dev.ratedPowerKw || (nodeType === 'PCS' ? 1250 : 625),
          voltageLevel: nodeType === 'PCS' ? '690V AC / 1500V DC' : nodeType === 'BATTERY' ? '1500V DC' : '35kV',
          x: Math.max(20, finalX - 90),
          y: Math.max(20, finalY - 40),
          status: dev.status,
          isKeyDevice: true
        };

        setTopology(prev => ({
          ...prev,
          nodes: [...prev.nodes, newNode],
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        }));
        setSelectedNodeId(newNode.id);
      } else if (data.type === 'INFRA') {
        const infraType: TopologyNodeType = data.nodeType;
        const meta = NODE_TYPE_META[infraType];
        const count = topology.nodes.filter(n => n.type === infraType).length + 1;

        const newNode: TopologyNode = {
          id: `node-${infraType.toLowerCase()}-${Date.now().toString().slice(-4)}`,
          name: `${meta.label} #${count}`,
          code: `${infraType}-${count.toString().padStart(2, '0')}`,
          type: infraType,
          voltageLevel: meta.defaultVoltage || '35kV',
          ratedPowerKw: infraType === 'TRANSFORMER' ? 2500 : infraType === 'PCS' ? 1250 : undefined,
          x: Math.max(20, finalX - 90),
          y: Math.max(20, finalY - 40),
          status: 'NORMAL',
          isKeyDevice: infraType !== 'LOAD'
        };

        setTopology(prev => ({
          ...prev,
          nodes: [...prev.nodes, newNode],
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        }));
        setSelectedNodeId(newNode.id);
      }
    } catch (err) {
      console.error('Failed to parse drag drop data:', err);
    }
  };

  // 画布内拖拽移动已存在的节点
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();

    // 无论监视态还是编辑态，点击即激活该节点
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);

    // 如果处于连线模式
    if (isWiringMode) {
      if (!wireSourceNodeId) {
        setWireSourceNodeId(nodeId);
      } else if (wireSourceNodeId !== nodeId) {
        // 完成连线
        createEdge(wireSourceNodeId, nodeId, wireType);
        setWireSourceNodeId(null);
      }
      return;
    }

    if (!isEditMode) return;

    const node = topology.nodes.find(n => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cursorX = (e.clientX - rect.left) / zoom;
    const cursorY = (e.clientY - rect.top) / zoom;

    setDraggingNodeId(nodeId);
    setDragOffset({
      x: cursorX - node.x,
      y: cursorY - node.y
    });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !canvasRef.current || !isEditMode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const cursorX = (e.clientX - rect.left) / zoom;
    const cursorY = (e.clientY - rect.top) / zoom;

    let targetX = cursorX - dragOffset.x;
    let targetY = cursorY - dragOffset.y;

    if (snapToGrid) {
      targetX = Math.round(targetX / 20) * 20;
      targetY = Math.round(targetY / 20) * 20;
    }

    targetX = Math.max(10, Math.min(1800, targetX));
    targetY = Math.max(10, Math.min(1200, targetY));

    setTopology(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === draggingNodeId ? { ...n, x: targetX, y: targetY } : n
      )
    }));
  };

  const handleCanvasPointerUp = () => {
    setDraggingNodeId(null);
  };

  // 新增连线
  const createEdge = (fromId: string, toId: string, type: TopologyEdgeType) => {
    const existing = topology.edges.find(
      e => (e.fromNodeId === fromId && e.toNodeId === toId) ||
           (e.fromNodeId === toId && e.toNodeId === fromId)
    );
    if (existing) return;

    const newEdge: TopologyEdge = {
      id: `edge-${Date.now().toString().slice(-6)}`,
      fromNodeId: fromId,
      toNodeId: toId,
      edgeType: type,
      flowDirection: 'BIDIRECTIONAL',
      label: type === 'AC_POWER' ? 'AC并网主线' : type === 'DC_POWER' ? 'DC直流干线' : '通讯监控'
    };

    setTopology(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));
  };

  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    setTopology(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // 删除边
  const handleDeleteEdge = (edgeId: string) => {
    setTopology(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));
    if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
  };

  // 智能一键排版
  const handleAutoLayout = () => {
    const arrangedNodes = autoLayoutTopology(topology.nodes);
    setTopology(prev => ({
      ...prev,
      nodes: arrangedNodes,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));
  };

  // 重置为默认拓扑
  const handleResetToDefault = () => {
    if (confirm('确认将当前拓扑结构重置为标准单线电气拓扑吗？')) {
      const defaultTopo = generateDefaultSiteTopology(site);
      setTopology(defaultTopo);
      onUpdateTopology(defaultTopo);
      setSaveSuccessMsg('已重置为标准电气功率拓扑');
    }
  };

  // 保存拓扑
  const handleSaveTopology = () => {
    onUpdateTopology(topology);
    setSaveSuccessMsg('现场功率拓扑已保存至站点档案');
    setIsEditMode(false);
    setIsWiringMode(false);
  };

  // 快速添加未放置的核心设备到画布
  const handleQuickAddDevice = (dev: CoreDevice) => {
    let nodeType: TopologyNodeType = 'PCS';
    if (dev.deviceType === 'PCS_INVERTER') nodeType = 'PCS';
    else if (dev.deviceType === 'BMS_CLUSTER') nodeType = 'BATTERY';
    else if (dev.deviceType === 'EMS_HOST') nodeType = 'EMS';
    else if (dev.deviceType === 'TRANSFORMER') nodeType = 'TRANSFORMER';

    const count = topology.nodes.length;
    const newNode: TopologyNode = {
      id: `node-dev-${dev.id}-${Date.now().toString().slice(-4)}`,
      deviceId: dev.id,
      name: dev.deviceName,
      code: dev.deviceCode,
      type: nodeType,
      model: dev.model,
      ratedPowerKw: dev.ratedPowerKw || (nodeType === 'PCS' ? 1250 : 625),
      voltageLevel: nodeType === 'PCS' ? '690V AC / 1500V DC' : '1500V DC',
      x: 350 + (count % 3) * 150,
      y: 350 + Math.floor(count / 3) * 100,
      status: dev.status,
      isKeyDevice: true
    };

    setTopology(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));
    setSelectedNodeId(newNode.id);
  };

  // ====================== 连线路径计算 ======================
  const getNodeCenter = (nodeId: string) => {
    const node = topology.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    // 假设卡片宽度 180, 高度 76
    return {
      x: node.x + 90,
      y: node.y + 38
    };
  };

  const selectedNode = topology.nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = topology.edges.find(e => e.id === selectedEdgeId);

  // 待放置设备列表
  const unplacedDevices = site.coreDevices.filter(d => !placedDeviceIds.has(d.id));
  const placedDevices = site.coreDevices.filter(d => placedDeviceIds.has(d.id));

  return (
    <div className="space-y-4">
      {/* Top Banner: R2 Rule & Power Topology Context */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>现场核心设备功率拓扑构建与实时潮流监视</span>
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              单站功率拓扑 Studio
            </span>
            {isEditMode ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-300">
                ✏️ 手工编辑态
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                🟢 实时监视态
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            支持拖拽站点核心设备（PCS变流器、BMS高压堆、EMS主控）及母线、升压变自由构建现场功率拓扑。可用度停机按该拓扑进行等效中断计算（Rule R2）。
          </p>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {saveSuccessMsg && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {!isEditMode ? (
            <button
              id="btn-enter-topo-edit"
              onClick={() => setIsEditMode(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>进入手工拓扑编辑器</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleAutoLayout}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1.5 transition-colors"
                title="依据电气层级（电网-变压器-母线-PCS-电池）自动智能排版"
              >
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>一键电气智能排版</span>
              </button>

              <button
                onClick={handleResetToDefault}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 flex items-center gap-1.5 transition-colors"
                title="清空当前自定义修改，恢复为站点默认标准拓扑"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>重置拓扑</span>
              </button>

              <button
                id="btn-save-topo"
                onClick={handleSaveTopology}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存现场功率拓扑</span>
              </button>

              <button
                onClick={() => {
                  setIsEditMode(false);
                  setIsWiringMode(false);
                  setWireSourceNodeId(null);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors"
              >
                退出编辑
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metric Strip (Real-time Electrical Health & Capacity) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">并网点电压等级</div>
          <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
            {site.gridVoltageLevel || '35kV AC'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">主网受电端</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">站内总装机规模</div>
          <div className="text-base font-bold text-blue-600 font-mono mt-0.5">
            {site.capacityMw} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">铭牌额定总容量</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">PCS 储能变流总功率</div>
          <div className="text-base font-bold text-cyan-600 font-mono mt-0.5">
            {(totalPcsRatedKw / 1000).toFixed(2)} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">共 {pcsNodes.length} 台套在网</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">BMS 电池簇堆容量</div>
          <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">
            {(totalBatteryRatedKw / 1000).toFixed(2)} MW
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">共 {batteryNodes.length} 簇高压电池</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">拓扑节点 / 连线链路</div>
          <div className="text-base font-bold text-indigo-600 font-mono mt-0.5">
            {topology.nodes.length} 点 / {topology.edges.length} 线
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">单线潮流拓扑</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">拓扑电气连通性</div>
          <div className="text-base font-bold font-mono mt-0.5 flex items-center gap-1">
            {floatingNodes.length === 0 ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> 100% 闭环
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {floatingNodes.length} 处孤岛
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {floatingNodes.length === 0 ? '无悬空电气节点' : '存在未连线设备'}
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col lg:flex-row h-[750px]">
        {/* Left Side: Palette (Only in Edit Mode) */}
        {isEditMode && (
          <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/60 flex flex-col shrink-0">
            {/* Palette Header & Tabs */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span>现场核心设备与元件库</span>
                <span className="text-[10px] text-slate-400 font-normal">拖入右侧画布</span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-md">
                <button
                  onClick={() => setPaletteTab('devices')}
                  className={`py-1 text-xs font-semibold rounded text-center transition-colors ${
                    paletteTab === 'devices'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  站点核心设备 ({site.coreDevices.length})
                </button>
                <button
                  onClick={() => setPaletteTab('infra')}
                  className={`py-1 text-xs font-semibold rounded text-center transition-colors ${
                    paletteTab === 'infra'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  电气与母线库
                </button>
              </div>
            </div>

            {/* Palette Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {paletteTab === 'devices' ? (
                <>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="检索核心设备名称/型号..."
                      value={searchDeviceKey}
                      onChange={e => setSearchDeviceKey(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Unplaced Devices Section */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>待布线设备 ({unplacedDevices.length})</span>
                      <span className="text-[10px] text-blue-600 font-medium">支持拖拽或直接点击</span>
                    </div>

                    {unplacedDevices.length === 0 ? (
                      <div className="p-3 rounded border border-dashed border-slate-300 bg-white text-center text-slate-400 text-xs">
                        所有站点核心设备均已在画布拓扑中
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unplacedDevices
                          .filter(
                            d =>
                              d.deviceName.toLowerCase().includes(searchDeviceKey.toLowerCase()) ||
                              d.deviceCode.toLowerCase().includes(searchDeviceKey.toLowerCase()) ||
                              d.model.toLowerCase().includes(searchDeviceKey.toLowerCase())
                          )
                          .map(dev => (
                            <div
                              key={dev.id}
                              draggable
                              onDragStart={e => handleDragStartFromPalette(e, { type: 'CORE_DEVICE', device: dev })}
                              className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs cursor-grab active:cursor-grabbing transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 truncate max-w-[170px]">
                                  {dev.deviceName}
                                </span>
                                <button
                                  onClick={() => handleQuickAddDevice(dev)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="快速放置到画布中央"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                                <span className="font-mono text-blue-600">{dev.deviceCode}</span>
                                <span>{dev.ratedPowerKw ? `${dev.ratedPowerKw} kW` : dev.model}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Placed Devices Reference Section */}
                  {placedDevices.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                        已在拓扑中 ({placedDevices.length})
                      </div>
                      <div className="space-y-1.5">
                        {placedDevices.map(dev => (
                          <div
                            key={dev.id}
                            onClick={() => {
                              const found = topology.nodes.find(n => n.deviceId === dev.id);
                              if (found) setSelectedNodeId(found.id);
                            }}
                            className="p-2 bg-slate-100/70 hover:bg-slate-200/60 rounded border border-slate-200 cursor-pointer flex items-center justify-between text-slate-600 text-[11px]"
                          >
                            <span className="truncate max-w-[180px] font-medium">{dev.deviceName}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">已在位</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Infrastructure Library Tab */
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    选择标准电气节点，拖拽至画布建立母线与汇流系统：
                  </div>

                  {(
                    [
                      'GRID',
                      'TRANSFORMER',
                      'AC_BUS',
                      'PCS',
                      'DC_BUS',
                      'BATTERY',
                      'EMS',
                      'PV_STRING',
                      'LOAD'
                    ] as TopologyNodeType[]
                  ).map(nodeType => {
                    const meta = NODE_TYPE_META[nodeType];
                    return (
                      <div
                        key={nodeType}
                        draggable
                        onDragStart={e => handleDragStartFromPalette(e, { type: 'INFRA', nodeType })}
                        className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs cursor-grab active:cursor-grabbing transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${meta.iconBg}`}>
                            {nodeType === 'GRID' && <Radio className="w-4 h-4" />}
                            {nodeType === 'TRANSFORMER' && <Cpu className="w-4 h-4" />}
                            {nodeType === 'AC_BUS' && <Zap className="w-4 h-4" />}
                            {nodeType === 'PCS' && <Activity className="w-4 h-4" />}
                            {nodeType === 'DC_BUS' && <Network className="w-4 h-4" />}
                            {nodeType === 'BATTERY' && <Power className="w-4 h-4" />}
                            {nodeType === 'EMS' && <Server className="w-4 h-4" />}
                            {nodeType === 'PV_STRING' && <Zap className="w-4 h-4" />}
                            {nodeType === 'LOAD' && <Sliders className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{meta.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {meta.defaultVoltage || '35kV'}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          拖出 +
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center: Canvas Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#f8fafc]">
          {/* Canvas Floating Top Toolbar */}
          <div className="h-10 bg-white/95 border-b border-slate-200 px-4 flex items-center justify-between text-xs z-10 shadow-2xs backdrop-blur-xs">
            {/* Left: Interactive Helpers */}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-blue-600" />
                <span>功率潮流拓扑图</span>
              </span>

              {isEditMode && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                  <button
                    onClick={() => {
                      setIsWiringMode(!isWiringMode);
                      setWireSourceNodeId(null);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                      isWiringMode
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isWiringMode ? '连线模式开启 (点击两节点)' : '连线模式'}</span>
                  </button>

                  {isWiringMode && (
                    <select
                      value={wireType}
                      onChange={e => setWireType(e.target.value as TopologyEdgeType)}
                      className="bg-white border border-slate-300 text-[11px] rounded px-1 py-0.5 text-slate-800 focus:outline-none"
                    >
                      <option value="AC_POWER">交流主干线 (AC)</option>
                      <option value="DC_POWER">直流干线 (DC)</option>
                      <option value="COMMUNICATION">测控通信链路</option>
                    </select>
                  )}
                </div>
              )}

              {isWiringMode && wireSourceNodeId && (
                <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
                  请点击目标节点以完成连线...
                </span>
              )}
            </div>

            {/* Right: Zoom & Grid Snap Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                <button
                  onClick={() => setZoom(prev => Math.max(0.6, Number((prev - 0.1).toFixed(1))))}
                  className="p-1 hover:bg-white rounded text-slate-600"
                  title="缩小"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-semibold px-1 text-slate-700 min-w-[36px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(1.5, Number((prev + 0.1).toFixed(1))))}
                  className="p-1 hover:bg-white rounded text-slate-600"
                  title="放大"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="px-1.5 py-0.5 hover:bg-white rounded text-[10px] font-semibold text-slate-600"
                  title="恢复100%"
                >
                  100%
                </button>
              </div>

              {isEditMode && (
                <button
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border transition-colors ${
                    snapToGrid
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                  title="对齐到20px网格"
                >
                  网格对齐: {snapToGrid ? '开' : '关'}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Canvas Canvas Background */}
          <div
            ref={canvasRef}
            onDrop={handleDropOnCanvas}
            onDragOver={e => e.preventDefault()}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onClick={e => {
              // 只有点击画布纯背景或空svg区域时才取消选中，不影响节点卡片点击
              if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
                setSelectedNodeId(null);
                setSelectedEdgeId(null);
                if (isWiringMode) setWireSourceNodeId(null);
              }
            }}
            className="flex-1 w-full h-full relative overflow-auto cursor-default select-none"
            style={{
              backgroundImage:
                'radial-gradient(#cbd5e1 1.2px, transparent 1.2px), radial-gradient(#f1f5f9 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#f8fafc'
            }}
          >
            {/* Inner Scaled Container */}
            <div
              className="relative transition-transform duration-75 origin-top-left"
              style={{
                width: '1800px',
                height: '1100px',
                transform: `scale(${zoom})`
              }}
            >
              {/* SVG Electrical Wire Layers */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  {/* Arrows */}
                  <marker
                    id="arrow-ac"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563eb" />
                  </marker>
                  <marker
                    id="arrow-dc"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                  <marker
                    id="arrow-comm"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#9333ea" />
                  </marker>

                  {/* Flow animation filter */}
                  <filter id="glow-edge" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.6" />
                  </filter>
                </defs>

                {topology.edges.map(edge => {
                  const start = getNodeCenter(edge.fromNodeId);
                  const end = getNodeCenter(edge.toNodeId);
                  const isSelected = selectedEdgeId === edge.id;

                  // Smooth cubic bezier S-curve or step
                  const deltaY = end.y - start.y;
                  const c1x = start.x;
                  const c1y = start.y + deltaY * 0.5;
                  const c2x = end.x;
                  const c2y = end.y - deltaY * 0.5;
                  const pathD = `M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}`;

                  const strokeColor =
                    edge.edgeType === 'AC_POWER'
                      ? '#2563eb'
                      : edge.edgeType === 'DC_POWER'
                      ? '#d97706'
                      : '#9333ea';

                  const strokeWidth = isSelected ? 4 : edge.edgeType === 'COMMUNICATION' ? 2 : 2.5;

                  return (
                    <g
                      key={edge.id}
                      className="cursor-pointer pointer-events-auto group"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEdgeId(edge.id);
                        setSelectedNodeId(null);
                      }}
                    >
                      {/* Transparent wider hit area for click */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                      />

                      {/* Main Power Cable Wire */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={edge.edgeType === 'COMMUNICATION' ? '4 4' : undefined}
                        filter={isSelected ? 'url(#glow-edge)' : undefined}
                        markerEnd={
                          edge.edgeType === 'AC_POWER'
                            ? 'url(#arrow-ac)'
                            : edge.edgeType === 'DC_POWER'
                            ? 'url(#arrow-dc)'
                            : 'url(#arrow-comm)'
                        }
                      />

                      {/* Power Flow animated pulse (only in live view or non-comm) */}
                      {!isEditMode && edge.edgeType !== 'COMMUNICATION' && (
                        <circle r="3" fill="#ffffff" stroke={strokeColor} strokeWidth="1.5">
                          <animateMotion
                            path={pathD}
                            dur="2.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}

                      {/* Edge Label badge */}
                      {edge.label && (
                        <foreignObject
                          x={(start.x + end.x) / 2 - 40}
                          y={(start.y + end.y) / 2 - 10}
                          width="80"
                          height="20"
                          className="pointer-events-none"
                        >
                          <div className="text-[9px] font-mono bg-white/90 border border-slate-300 rounded px-1 text-slate-600 text-center truncate shadow-2xs font-semibold">
                            {edge.label}
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Node Cards on Canvas */}
              {topology.nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isWiringSource = wireSourceNodeId === node.id;
                const meta = NODE_TYPE_META[node.type];
                const isPcsOrBms = node.type === 'PCS' || node.type === 'BATTERY';

                // Status coloring
                const statusBorder =
                  node.status === 'FAULT'
                    ? 'border-red-500'
                    : node.status === 'WARNING'
                    ? 'border-amber-400'
                    : meta.borderColor;

                return (
                  <div
                    key={node.id}
                    id={`topo-node-${node.id}`}
                    onPointerDown={e => handleNodePointerDown(e, node.id)}
                    onClick={e => {
                      e.stopPropagation();
                      if (isWiringMode) {
                        if (!wireSourceNodeId) {
                          setWireSourceNodeId(node.id);
                        } else if (wireSourceNodeId !== node.id) {
                          createEdge(wireSourceNodeId, node.id, wireType);
                          setWireSourceNodeId(null);
                        }
                      } else {
                        setSelectedNodeId(node.id);
                        setSelectedEdgeId(null);
                      }
                    }}
                    onDoubleClick={e => {
                      e.stopPropagation();
                      if (node.deviceId) {
                        const dev = site.coreDevices.find(d => d.id === node.deviceId);
                        if (dev) onSelectDevice(dev);
                      }
                    }}
                    style={{
                      transform: `translate(${node.x}px, ${node.y}px)`,
                      width: '190px'
                    }}
                    className={`absolute rounded-lg border-2 bg-white shadow-xs transition-shadow duration-100 ${
                      isSelected
                        ? 'ring-2 ring-blue-500 ring-offset-2 shadow-md z-30'
                        : isWiringSource
                        ? 'ring-2 ring-amber-500 animate-pulse z-30'
                        : 'z-10 hover:shadow-md'
                    } ${statusBorder} ${isEditMode ? 'cursor-move' : 'cursor-pointer'}`}
                  >
                    {/* Header */}
                    <div className={`px-2.5 py-1.5 rounded-t-[6px] border-b border-slate-100 flex items-center justify-between ${meta.iconBg}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        {node.type === 'GRID' && <Radio className="w-3.5 h-3.5" />}
                        {node.type === 'TRANSFORMER' && <Cpu className="w-3.5 h-3.5" />}
                        {node.type === 'AC_BUS' && <Zap className="w-3.5 h-3.5" />}
                        {node.type === 'PCS' && <Activity className="w-3.5 h-3.5" />}
                        {node.type === 'DC_BUS' && <Network className="w-3.5 h-3.5" />}
                        {node.type === 'BATTERY' && <Power className="w-3.5 h-3.5" />}
                        {node.type === 'EMS' && <Server className="w-3.5 h-3.5" />}
                        {node.type === 'PV_STRING' && <Zap className="w-3.5 h-3.5" />}
                        {node.type === 'LOAD' && <Sliders className="w-3.5 h-3.5" />}
                        <span className="font-bold text-[11px] truncate">{meta.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            node.status === 'NORMAL'
                              ? 'bg-emerald-500'
                              : node.status === 'WARNING'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          title={`工况: ${node.status}`}
                        />
                        {isEditMode && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteNode(node.id);
                            }}
                            className="p-0.5 text-slate-400 hover:text-red-600 rounded"
                            title="从拓扑移除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-2 space-y-1">
                      <div className="font-bold text-xs text-slate-900 truncate" title={node.name}>
                        {node.name}
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-blue-600 truncate max-w-[90px]" title={node.code}>
                          {node.code}
                        </span>
                        <span className="font-bold text-slate-700 font-mono">
                          {node.ratedPowerKw ? `${node.ratedPowerKw} kW` : node.voltageLevel}
                        </span>
                      </div>

                      {/* Voltage tag */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] text-slate-500">
                        <span>{node.voltageLevel || '35kV'}</span>
                        {node.deviceId && (
                          <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                            台账设备 <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Port Anchors for Wiring (in Edit Mode) */}
                    {isEditMode && (
                      <>
                        <div
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 hover:bg-blue-700 border-2 border-white shadow-xs cursor-crosshair z-20"
                          title="连接此端口"
                          onClick={e => {
                            e.stopPropagation();
                            if (!wireSourceNodeId) setWireSourceNodeId(node.id);
                            else if (wireSourceNodeId !== node.id) {
                              createEdge(wireSourceNodeId, node.id, wireType);
                              setWireSourceNodeId(null);
                            }
                          }}
                        />
                        <div
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 hover:bg-blue-700 border-2 border-white shadow-xs cursor-crosshair z-20"
                          title="连接此端口"
                          onClick={e => {
                            e.stopPropagation();
                            if (!wireSourceNodeId) setWireSourceNodeId(node.id);
                            else if (wireSourceNodeId !== node.id) {
                              createEdge(wireSourceNodeId, node.id, wireType);
                              setWireSourceNodeId(null);
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Property Inspector Panel (When node or edge is selected) */}
        {(selectedNode || selectedEdge) && (
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white p-4 space-y-3 text-xs shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {selectedNode ? selectedNode.name : '电气链路属性'}
                </span>
                {selectedNode && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      selectedNode.status === 'NORMAL'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedNode.status === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {selectedNode.status === 'NORMAL' ? '正常' : selectedNode.status === 'WARNING' ? '预警' : '故障'}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100"
              >
                关闭
              </button>
            </div>

            {selectedNode && (
              <>
                {/* Mode Segmented Tab: Telemetry vs Config */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-md">
                  <button
                    onClick={() => setInspectorTab('telemetry')}
                    className={`py-1 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${
                      inspectorTab === 'telemetry'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>现场遥测工况</span>
                  </button>
                  <button
                    onClick={() => setInspectorTab('config')}
                    className={`py-1 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all ${
                      inspectorTab === 'config'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>铭牌与拓扑配置</span>
                  </button>
                </div>

                {/* Tab 1: Live Telemetry */}
                {inspectorTab === 'telemetry' ? (
                  <div className="space-y-3 pt-1">
                    {(() => {
                      const telemetry = getNodeTelemetrySnapshot(selectedNode, site);
                      const isBms = selectedNode.type === 'BATTERY';
                      const isPcs = selectedNode.type === 'PCS';
                      const isTransformer = selectedNode.type === 'TRANSFORMER';
                      const isEms = selectedNode.type === 'EMS';

                      return (
                        <>
                          {/* Live Operating Condition Status Bar */}
                          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 font-medium">调度工况模式:</span>
                              <span className="font-bold text-blue-900 font-mono">
                                {telemetry.operatingMode}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>开关/断路器:</span>
                              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {telemetry.breakerStatus === 'CLOSED' ? 'QF1 主断路器合闸' : 'QF1 主断路器分闸'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>测控通信链路:</span>
                              <span className="font-mono text-slate-700">IEC 61850 / 良好 (3.6ms)</span>
                            </div>
                          </div>

                          {/* 4-Metric Electrical Telemetry Grid */}
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span>电气运行模拟量 (实时遥测)</span>
                              <span className="text-[10px] text-emerald-600 font-semibold font-mono">1s 刷新</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                <div className="text-[10px] text-slate-500">实时有功功率 (P)</div>
                                <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                                  {telemetry.activePowerKw.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kW</span>
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  负载率 {telemetry.loadRatePct}%
                                </div>
                              </div>

                              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                <div className="text-[10px] text-slate-500">无功功率 (Q)</div>
                                <div className="text-sm font-bold font-mono text-indigo-700 mt-0.5">
                                  {telemetry.reactivePowerKvar.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kVar</span>
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  cosφ {telemetry.powerFactor}
                                </div>
                              </div>

                              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                <div className="text-[10px] text-slate-500">运行线电压 (U)</div>
                                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                                  {telemetry.voltageV.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">V</span>
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  频率 {telemetry.frequencyHz} Hz
                                </div>
                              </div>

                              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                <div className="text-[10px] text-slate-500">运行回路电流 (I)</div>
                                <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                                  {telemetry.currentA.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">A</span>
                                </div>
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  三相平衡
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BMS Specifics */}
                          {isBms && telemetry.socPct !== undefined && (
                            <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-2">
                              <div className="text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                                <span>BMS 电池储能专项遥测</span>
                                <span className="font-mono text-xs text-emerald-700 font-bold">
                                  SOC {telemetry.socPct}%
                                </span>
                              </div>
                              {/* SOC Progress Bar */}
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${telemetry.socPct}%` }}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                <div>
                                  <span className="text-slate-500">健康度 (SOH): </span>
                                  <strong className="text-emerald-800 font-mono">{telemetry.sohPct}%</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500">单体压差: </span>
                                  <strong className="text-emerald-800 font-mono">{telemetry.cellDeltaMv} mV</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500">最高单体电压: </span>
                                  <strong className="text-slate-700 font-mono">{telemetry.maxCellVoltMv} mV</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500">最低单体电压: </span>
                                  <strong className="text-slate-700 font-mono">{telemetry.minCellVoltMv} mV</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500">累计循环: </span>
                                  <strong className="text-slate-700 font-mono">{telemetry.cycleCount} 次</strong>
                                </div>
                                <div>
                                  <span className="text-slate-500">电芯最高温: </span>
                                  <strong className="text-slate-700 font-mono">{telemetry.maxCellTempC} ℃</strong>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Thermal & Insulation Environment */}
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-700">热力学与绝缘环境工况</div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-slate-500">核心结温: </span>
                                <strong className={`font-mono ${telemetry.temperatureC > 75 ? 'text-amber-600' : 'text-slate-800'}`}>
                                  {telemetry.temperatureC} ℃
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-500">机舱环境温: </span>
                                <strong className="font-mono text-slate-800">{telemetry.ambientTempC} ℃</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">绝缘对地阻抗: </span>
                                <strong className="font-mono text-emerald-700">{telemetry.insulationKohm} kΩ</strong>
                              </div>
                              <div>
                                <span className="text-slate-500">能效比: </span>
                                <strong className="font-mono text-blue-700">
                                  {telemetry.efficiencyPct ? `${telemetry.efficiencyPct}%` : '99.1%'}
                                </strong>
                              </div>
                            </div>
                            <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                              散热状态: <span className="text-slate-700 font-medium">{telemetry.coolingStatus}</span>
                            </div>
                          </div>

                          {/* Direct Drill-down Button */}
                          {selectedNode.deviceId && (
                            <button
                              onClick={() => {
                                const dev = site.coreDevices.find(d => d.id === selectedNode.deviceId);
                                if (dev) onSelectDevice(dev);
                              }}
                              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all text-xs"
                            >
                              <span>进入该设备高频遥测点表与时序工作台</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  /* Tab 2: Nameplate & Settings */
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        设备 / 节点名称
                      </label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={selectedNode.name}
                        onChange={e => {
                          const val = e.target.value;
                          setTopology(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n =>
                              n.id === selectedNode.id ? { ...n, name: val } : n
                            )
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        设备编码 (Device Code)
                      </label>
                      <input
                        type="text"
                        disabled={!isEditMode}
                        value={selectedNode.code}
                        onChange={e => {
                          const val = e.target.value;
                          setTopology(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n =>
                              n.id === selectedNode.id ? { ...n, code: val } : n
                            )
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          额定功率 (kW)
                        </label>
                        <input
                          type="number"
                          disabled={!isEditMode}
                          value={selectedNode.ratedPowerKw || ''}
                          onChange={e => {
                            const val = Number(e.target.value) || 0;
                            setTopology(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n =>
                                n.id === selectedNode.id ? { ...n, ratedPowerKw: val } : n
                              )
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          电压等级
                        </label>
                        <input
                          type="text"
                          disabled={!isEditMode}
                          value={selectedNode.voltageLevel || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setTopology(prev => ({
                              ...prev,
                              nodes: prev.nodes.map(n =>
                                n.id === selectedNode.id ? { ...n, voltageLevel: val } : n
                              )
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        当前运行工况状态
                      </label>
                      <select
                        disabled={!isEditMode}
                        value={selectedNode.status}
                        onChange={e => {
                          const val = e.target.value as any;
                          setTopology(prev => ({
                            ...prev,
                            nodes: prev.nodes.map(n =>
                              n.id === selectedNode.id ? { ...n, status: val } : n
                            )
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50 font-medium"
                      >
                        <option value="NORMAL">🟢 正常运行 (NORMAL)</option>
                        <option value="WARNING">🟡 预警/告警 (WARNING)</option>
                        <option value="FAULT">🔴 故障停运 (FAULT)</option>
                        <option value="MAINTENANCE">⚪ 计划检修 (MAINTENANCE)</option>
                      </select>
                    </div>

                    {isEditMode && (
                      <div className="pt-3 border-t border-slate-200">
                        <button
                          onClick={() => handleDeleteNode(selectedNode.id)}
                          className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded border border-red-200 flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>从拓扑图删除该节点</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Edge Inspector */}
            {selectedEdge && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    链路类型
                  </label>
                  <select
                    disabled={!isEditMode}
                    value={selectedEdge.edgeType}
                    onChange={e => {
                      const val = e.target.value as TopologyEdgeType;
                      setTopology(prev => ({
                        ...prev,
                        edges: prev.edges.map(ed =>
                          ed.id === selectedEdge.id ? { ...ed, edgeType: val } : ed
                        )
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
                  >
                    <option value="AC_POWER">交流主干功率线 (AC 35kV/0.69kV)</option>
                    <option value="DC_POWER">直流功率母线 (DC 1500V)</option>
                    <option value="COMMUNICATION">控制测控链路 (IEC 61850 / Modbus)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    链路标注名称
                  </label>
                  <input
                    type="text"
                    disabled={!isEditMode}
                    value={selectedEdge.label || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setTopology(prev => ({
                        ...prev,
                        edges: prev.edges.map(ed =>
                          ed.id === selectedEdge.id ? { ...ed, label: val } : ed
                        )
                      }));
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
                  />
                </div>

                {isEditMode && (
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleDeleteEdge(selectedEdge.id)}
                      className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded border border-red-200 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>删除此电气链路</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
