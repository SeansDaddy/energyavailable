import { jsPDF } from 'jspdf';
import { Site } from '../types';
import {
  ContractBaselineCondition,
  SohBaselineCurvePoint,
  StationMonthlyCondition,
  StationDailyCondition,
  FlexibleWarrantySohResult
} from '../types/warrantyCondition';

interface GeneratePdfReportOptions {
  site: Site;
  contractBaseline: ContractBaselineCondition;
  sohResult: FlexibleWarrantySohResult;
  monthlyConditions: StationMonthlyCondition[];
  dailyConditions?: StationDailyCondition[];
  sohBaselineCurve: SohBaselineCurvePoint[];
}

/**
 * 辅助绘制带圆角的矩形
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = false,
  stroke = true
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

/**
 * 绘制页面 1：报告封面、站点合同基准档案、关键性能指标与超工况对比
 */
function drawPage1(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: GeneratePdfReportOptions
) {
  const { site, contractBaseline, sohResult, monthlyConditions } = opts;

  // 背景底色
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 顶部装饰条
  ctx.fillStyle = '#0F172A'; // Slate-900
  ctx.fillRect(0, 0, width, 140);

  ctx.fillStyle = '#10B981'; // Emerald-500 accent stripe
  ctx.fillRect(0, 134, width, 6);

  // 顶部标识与系统名称
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#10B981';
  ctx.fillText('⚡ 储能电站数字化运维与性能工程平台', 60, 48);

  ctx.font = 'normal 13px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('ENERGY STORAGE PERFORMANCE & FLEXIBLE WARRANTY SYSTEM', 60, 70);

  // 报告标题
  ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('灵活质保工况与SOH衰减评估报告', 60, 114);

  // 顶部右侧元信息框
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  roundRect(ctx, width - 360, 25, 300, 90, 8, true, false);

  ctx.font = 'normal 12px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText(`报告编号: RPT-FW-${site.id.replace('site-', '0')}-${new Date().getFullYear()}`, width - 340, 50);
  ctx.fillText(`生成日期: ${new Date().toISOString().slice(0, 10)}`, width - 340, 72);
  ctx.fillText(`算法版本: ${sohResult.algorithmVersion.split('-')[0] || 'v3.4.2'}`, width - 340, 94);

  // 报告基本信息说明条
  let currentY = 175;
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  roundRect(ctx, 60, currentY, width - 120, 60, 8, true, true);

  ctx.font = 'normal 13px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    `本报告基于电站多物理量实测运行日志，结合算法团队 Arrhenius 温度加速应力与循环疲劳衰减模型，对当前站级工况进行`,
    80,
    currentY + 26
  );
  ctx.fillText(
    `基准对比、超工况定量提取与动态 SOH 衰减趋势外推评估，为质保考核、SLA服务结算及运维调优提供官方权威数据支撑。`,
    80,
    currentY + 46
  );

  // -------------------------------------------------------------
  // 第一板块：站点档案与合同基准参数 (Section 1)
  // -------------------------------------------------------------
  currentY = 265;

  // 标题
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('一、 站点档案与合同基准工况参数', 60, currentY);

  // 装饰小蓝块
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(60, currentY + 8, 40, 3);

  currentY += 24;

  // 档案卡片大框
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  roundRect(ctx, 60, currentY, width - 120, 140, 8, true, true);

  // 档案信息列表 (4列布局)
  const colW = (width - 160) / 4;
  const siteProps = [
    { label: '站点名称', val: site.siteName },
    { label: '站点编码', val: site.siteCode },
    { label: '客户单位', val: site.customer },
    { label: '所属区域', val: `${site.region} / ${site.representativeOffice}` },
    { label: '装机规模', val: `${site.capacityMw} MW / ${contractBaseline.ratedEnergyMwh} MWh` },
    { label: '合同编号', val: contractBaseline.contractNo },
    { label: '质保服务周期', val: `${contractBaseline.warrantyStartDate} ~ ${contractBaseline.warrantyEndDate}` },
    { label: '质保总期限', val: `${contractBaseline.warrantyYears} 年 (${contractBaseline.annualBaselineEfc * contractBaseline.warrantyYears} EFC)` }
  ];

  siteProps.forEach((item, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const itemX = 80 + col * colW;
    const itemY = currentY + 30 + row * 55;

    ctx.font = 'normal 12px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(item.label, itemX, itemY);

    ctx.font = 'bold 13px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#1E293B';
    // 限制文本超长
    const valText = item.val.length > 20 ? item.val.slice(0, 19) + '…' : item.val;
    ctx.fillText(valText, itemX, itemY + 20);
  });

  // 合同基准限值矩阵指标条
  currentY += 160;
  ctx.fillStyle = '#F0FDF4';
  ctx.strokeStyle = '#BBF7D0';
  ctx.lineWidth = 1;
  roundRect(ctx, 60, currentY, width - 120, 68, 8, true, true);

  const baselineLimits = [
    { label: '基准年循环', val: `${contractBaseline.annualBaselineEfc} EFC/年` },
    { label: '基准日循环', val: `${contractBaseline.dailyBaselineEfc} EFC/天` },
    { label: '最大充放倍率', val: `≤ ${contractBaseline.maxCrate} C` },
    { label: '放电深度红线', val: `≤ ${contractBaseline.maxDodPct}% DoD` },
    { label: '电芯温控上限', val: `≤ ${contractBaseline.baselineTempMax} ℃` },
    { label: '终了保证SOH', val: `≥ ${contractBaseline.finalGuaranteedSoh}%` }
  ];

  const limitColW = (width - 160) / 6;
  baselineLimits.forEach((item, idx) => {
    const itemX = 80 + idx * limitColW;
    ctx.font = 'normal 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(item.label, itemX, currentY + 26);

    ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#065F46';
    ctx.fillText(item.val, itemX, currentY + 48);
  });

  // -------------------------------------------------------------
  // 第二板块：关键性能指标 (KPI) 核算与超工况量化 (Section 2)
  // -------------------------------------------------------------
  currentY += 100;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('二、 关键性能指标核算与超工况量化结果', 60, currentY);

  ctx.fillStyle = '#0284C7';
  ctx.fillRect(60, currentY + 8, 40, 3);

  currentY += 24;

  // 4 个关键性能指标卡片 (KPI Cards)
  const cardW = (width - 120 - 45) / 4;
  const cardH = 115;

  const kpis = [
    {
      title: '当前灵活质保 SOH',
      mainVal: `${sohResult.currentFlexibleSoh}%`,
      subVal: `基准值: ${sohResult.currentBaselineSoh}%  (差值: ${sohResult.sohMargin >= 0 ? '+' : ''}${sohResult.sohMargin}%)`,
      bg: '#F8FAFC',
      border: '#CBD5E1',
      valColor: sohResult.sohMargin >= 0 ? '#059669' : '#D97706'
    },
    {
      title: '累计超工况循环 (EFC)',
      mainVal: `+${sohResult.overConditionSummary.totalExcessEfc} 次`,
      subVal: `折算超额吞吐: ${(sohResult.overConditionSummary.totalExcessEfc * 2 * contractBaseline.ratedEnergyMwh).toFixed(1)} MWh`,
      bg: '#FEF2F2',
      border: '#FECACA',
      valColor: '#DC2626'
    },
    {
      title: '累计超温度时',
      mainVal: `${sohResult.overConditionSummary.totalOverTempDegreeHours} ℃·h`,
      subVal: `环境超温累计应力积分红线: 35.0℃`,
      bg: '#FFFBEB',
      border: '#FDE68A',
      valColor: '#D97706'
    },
    {
      title: '综合老化加速因子 (AF)',
      mainVal: `${sohResult.overConditionSummary.overallAccelerationFactor}`,
      subVal: `理论基准因子: 1.000 (${sohResult.overConditionSummary.overallAccelerationFactor > 1 ? '加速老化' : '延寿运行'})`,
      bg: '#EFF6FF',
      border: '#BFDBFE',
      valColor: '#2563EB'
    }
  ];

  kpis.forEach((card, idx) => {
    const cardX = 60 + idx * (cardW + 15);
    ctx.fillStyle = card.bg;
    ctx.strokeStyle = card.border;
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, currentY, cardW, cardH, 8, true, true);

    ctx.font = 'normal 12px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(card.title, cardX + 16, currentY + 28);

    ctx.font = 'bold 24px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = card.valColor;
    ctx.fillText(card.mainVal, cardX + 16, currentY + 65);

    ctx.font = 'normal 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(card.subVal, cardX + 16, currentY + 95);
  });

  // -------------------------------------------------------------
  // 近6个月工况合规性月度对比简表
  // -------------------------------------------------------------
  currentY += cardH + 25;
  ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.fillText('近 6 个月站级工况合规性与超工况量化对比明细表', 60, currentY);

  currentY += 12;

  // 表格表头
  const tableW = width - 120;
  const headerH = 34;
  ctx.fillStyle = '#F1F5F9';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  roundRect(ctx, 60, currentY, tableW, headerH, 6, true, true);

  const tableCols = [
    { name: '月份', w: 90 },
    { name: '天数', w: 60 },
    { name: '基准EFC(次)', w: 100 },
    { name: '实际EFC(次)', w: 100 },
    { name: '超额EFC(次)', w: 100 },
    { name: '平均温度(℃)', w: 100 },
    { name: '最高温度(℃)', w: 100 },
    { name: '超温度时(℃·h)', w: 110 },
    { name: '最大倍率(C)', w: 95 },
    { name: '合规率(%)', w: 85 },
    { name: '状态评价', w: 80 }
  ];

  ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#334155';
  let curColX = 75;
  tableCols.forEach(c => {
    ctx.fillText(c.name, curColX, currentY + 22);
    curColX += c.w;
  });

  // 渲染最近 6 个月数据
  const recentMonths = monthlyConditions.slice(-6);
  currentY += headerH;

  recentMonths.forEach((m, rowIdx) => {
    const rowH = 32;
    ctx.fillStyle = rowIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(60, currentY, tableW, rowH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(60, currentY, tableW, rowH);

    curColX = 75;
    ctx.font = 'normal 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#1E293B';

    const rowVals = [
      m.month,
      `${m.daysCount}天`,
      `${m.baselineEfc}`,
      `${m.actualEfc}`,
      m.overEfc > 0 ? `+${m.overEfc}` : '0.0',
      `${m.avgTemp}℃`,
      `${m.maxTemp}℃`,
      `${m.overTempDegreeHours}`,
      `${m.maxCrate}C`,
      `${m.complianceRate}%`,
      m.complianceRate >= 90 ? '优秀' : m.complianceRate >= 75 ? '注意' : '严重超标'
    ];

    rowVals.forEach((val, cIdx) => {
      if (cIdx === 4 && m.overEfc > 0) {
        ctx.fillStyle = '#DC2626'; // 超额红色
      } else if (cIdx === 10) {
        ctx.fillStyle = m.complianceRate >= 90 ? '#059669' : m.complianceRate >= 75 ? '#D97706' : '#DC2626';
      } else {
        ctx.fillStyle = '#1E293B';
      }
      ctx.fillText(val, curColX, currentY + 20);
      curColX += tableCols[cIdx].w;
    });

    currentY += rowH;
  });

  // 页脚
  ctx.font = 'normal 10px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('第 1 页 / 共 2 页 · 储能电站灵活质保工况评估系统自动生成 · 包含官方机密算法核算内容', 60, height - 35);
  ctx.fillText('技术支持: 电池性能工程与算法研究团队', width - 280, height - 35);
}

/**
 * 绘制页面 2：SOH 双曲线衰减打点对比、算法核心计算逻辑说明、运维调优建议与签章
 */
function drawPage2(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: GeneratePdfReportOptions
) {
  const { contractBaseline, sohResult } = opts;

  // 背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 顶部条
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, width, 50);
  ctx.fillStyle = '#10B981';
  ctx.fillRect(0, 47, width, 3);

  ctx.font = 'bold 14px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('灵活质保工况评估报告 (续) · SOH衰减打点与算法计算逻辑说明', 60, 32);

  // -------------------------------------------------------------
  // 第三板块：SOH 双曲线衰减打点对比与终了质保评估 (Section 3)
  // -------------------------------------------------------------
  let currentY = 85;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('三、 SOH 基准工况衰减与灵活质保衰减打点对比', 60, currentY);

  ctx.fillStyle = '#0284C7';
  ctx.fillRect(60, currentY + 8, 40, 3);

  currentY += 24;

  // 11年 (Year 0 ~ 10) 打点对比精简表格
  const tableW = width - 120;
  const headerH = 30;
  ctx.fillStyle = '#F1F5F9';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  roundRect(ctx, 60, currentY, tableW, headerH, 6, true, true);

  const cols = [
    { name: '运营年份', w: 100 },
    { name: '核算基准日', w: 90 },
    { name: '合同基准SOH', w: 105 },
    { name: '灵活质保SOH', w: 105 },
    { name: 'SOH偏差ΔSOH', w: 105 },
    { name: '累计额定循环', w: 105 },
    { name: '超工况衰减惩罚', w: 110 },
    { name: '数据源性质', w: 95 },
    { name: '履约合规状态', w: 85 }
  ];

  ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#334155';
  let curColX = 75;
  cols.forEach(c => {
    ctx.fillText(c.name, curColX, currentY + 19);
    curColX += c.w;
  });

  currentY += headerH;

  // 循环渲染 11 年打点
  sohResult.annualPoints.forEach((p, idx) => {
    const rowH = 24;
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    ctx.fillRect(60, currentY, tableW, rowH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(60, currentY, tableW, rowH);

    curColX = 75;
    ctx.font = 'normal 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#1E293B';

    const vals = [
      p.yearLabel,
      p.date,
      `${p.baselineSoh}%`,
      `${p.flexibleWarrantySoh}%`,
      `${p.deltaSoh >= 0 ? '+' : ''}${p.deltaSoh}%`,
      `${p.cumulativeCycles} 次`,
      p.cumulativeOverPenaltyPct ? `-${p.cumulativeOverPenaltyPct}%` : '0.00%',
      p.isHistorical ? '实测标定' : '算法外推',
      p.status === 'SAFE' ? '合规安全' : p.status === 'WARNING' ? '边际预警' : '超限违约'
    ];

    vals.forEach((v, cIdx) => {
      if (cIdx === 4) {
        ctx.fillStyle = p.deltaSoh >= 0 ? '#059669' : p.deltaSoh >= -1.0 ? '#D97706' : '#DC2626';
      } else if (cIdx === 8) {
        ctx.fillStyle = p.status === 'SAFE' ? '#059669' : p.status === 'WARNING' ? '#D97706' : '#DC2626';
      } else {
        ctx.fillStyle = '#1E293B';
      }
      ctx.fillText(v, curColX, currentY + 16);
      curColX += cols[cIdx].w;
    });

    currentY += rowH;
  });

  // 终了质保评估结论条
  currentY += 15;
  const isHealthy = sohResult.warrantyHealthStatus === 'HEALTHY';
  ctx.fillStyle = isHealthy ? '#F0FDF4' : '#FEF3C7';
  ctx.strokeStyle = isHealthy ? '#86EFAC' : '#FCD34D';
  roundRect(ctx, 60, currentY, tableW, 50, 8, true, true);

  ctx.font = 'bold 12px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = isHealthy ? '#166534' : '#92400E';
  ctx.fillText(
    `质保终了(第10年)评估结论: 合同保证红线 ≥ ${sohResult.guaranteedEndLifeSoh}% · 算法预估到期SOH: ${sohResult.estimatedEndLifeSoh}% (终身安全裕度: ${(sohResult.estimatedEndLifeSoh - sohResult.guaranteedEndLifeSoh).toFixed(1)}%)`,
    80,
    currentY + 22
  );

  ctx.font = 'normal 11px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(
    `等效质保周期折算调整: ${sohResult.overConditionSummary.extendedOrReducedWarrantyDays >= 0 ? '建议延长' : '建议折减'} ${Math.abs(sohResult.overConditionSummary.extendedOrReducedWarrantyDays)} 天 (折算基准: 2.0% SOH 对应 365 日历天)。`,
    80,
    currentY + 39
  );

  // -------------------------------------------------------------
  // 第四板块：算法团队核心计算逻辑说明 (Section 4)
  // -------------------------------------------------------------
  currentY += 75;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('四、 算法团队核心计算逻辑与换算模型说明', 60, currentY);

  ctx.fillStyle = '#0284C7';
  ctx.fillRect(60, currentY + 8, 40, 3);

  currentY += 24;

  // 算法说明容器框
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  roundRect(ctx, 60, currentY, tableW, 205, 8, true, true);

  const logicItems = [
    {
      num: '1. PACK级到站级多维工况聚合换算逻辑',
      desc: '电站下辖数十至上百套电池PACK。算法首先将各PACK离散采样日志(单体电压、PACK温升、充放电流、DoD等)通过能量加权积分换算为站级日吞吐量与等效满充满放循环(EFC=总吞吐/(2×额定容量))。同时提取站级峰值最高温与最大簇间ΔSOC离群值，杜绝局部热失控漏判。'
    },
    {
      num: '2. 耦合老化加速因子 (Coupled Aging Acceleration Factor, AF) 模型',
      desc: '基于 Arrhenius 温度加速动力学方程与电化学能量疲劳模型：\nAF = 1.0 + α_temp · (超温时积分 / 600) + β_cycle · (超额EFC / 200) + γ_crate · (超倍率吞吐 / 1000)\n当电站温和低倍率运行且温控优良时，AF ≤ 1.0 (产生延寿正收益)；当连续高倍率顶峰且电芯超温运行(>35℃)时，AF 显著上升(>1.05)，加速电化学SEI膜增厚与活性锂损失。'
    },
    {
      num: '3. 灵活质保年度 SOH 打点估算与双曲线生成机理',
      desc: '年度灵活质保打点融合了两部分数据：① 历史年份 (Year 0~2)：取自站级实际运行日志超工况惩罚量，并与每年现场定期容量标定实测打点进行卡尔曼滤波平滑修正；② 未来年份 (Year 3~10)：以当前AF因子驱动阿伦尼乌斯老化外推模型，动态绘制预估衰减曲线并与合同保证基准曲线比对，精准判定质保红线裕度。'
    }
  ];

  let logicY = currentY + 22;
  logicItems.forEach(item => {
    ctx.font = 'bold 11.5px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#0369A1';
    ctx.fillText(item.num, 80, logicY);
    logicY += 16;

    ctx.font = 'normal 10.5px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#334155';

    // 简单分行处理
    const lines = item.desc.split('\n');
    lines.forEach(line => {
      // 若单行过长做换行
      const maxChar = 68;
      for (let i = 0; i < line.length; i += maxChar) {
        ctx.fillText(line.substring(i, i + maxChar), 80, logicY);
        logicY += 15;
      }
    });
    logicY += 5;
  });

  // -------------------------------------------------------------
  // 第五板块：综合评估结论与现场运维调优建议 (Section 5)
  // -------------------------------------------------------------
  currentY += 225;
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('五、 现场运维调优建议与质保协同签章', 60, currentY);

  currentY += 16;

  // 调优建议 3 条
  const suggestions = [
    '【温控优化】 针对夏季高温时段出现最高温达 38.6℃ 现象，建议将液冷系统启机阈值从 28℃ 下调至 26℃，控制峰值温差在 3℃ 以内，压降超温应力；',
    '【调峰策略】 建议EMS微调下行充放功率限制，避免在电池高SOC(>85%)区间进行 0.65C 以上高倍率快充，减缓高电位极化对正极晶格损伤；',
    '【均衡维护】 定期在低负荷时段执行全站慢速均充校准，消除簇间最大 4.8% 的 ΔSOC 离散度，提高全站可用容量释放效率。'
  ];

  suggestions.forEach((sug, i) => {
    ctx.font = 'normal 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`${i + 1}. ${sug}`, 75, currentY);
    currentY += 20;
  });

  // 签章栏 (3个盖章盒)
  currentY += 15;
  const stampW = (tableW - 40) / 3;
  const stampH = 72;

  const stamps = [
    { title: '评估分析工程师', sign: '李明远 (工号: ESS-8802)', date: new Date().toISOString().slice(0, 10) },
    { title: '算法研究团队负责人', sign: '张博 (算法架构专家)', date: new Date().toISOString().slice(0, 10) },
    { title: '电站客户确认代表', sign: `${opts.site.customer} 代表`, date: '待签章确认' }
  ];

  stamps.forEach((st, idx) => {
    const stX = 60 + idx * (stampW + 20);
    ctx.fillStyle = '#FAFAFA';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    roundRect(ctx, stX, currentY, stampW, stampH, 6, true, true);

    ctx.font = 'normal 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(st.title, stX + 14, currentY + 22);

    ctx.font = 'bold 12px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(`签字: ${st.sign}`, stX + 14, currentY + 44);

    ctx.font = 'normal 10px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`日期: ${st.date}`, stX + 14, currentY + 62);
  });

  // 页脚
  ctx.font = 'normal 10px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('第 2 页 / 共 2 页 · 储能电站灵活质保工况评估系统自动生成 · 包含官方机密算法核算内容', 60, height - 35);
  ctx.fillText('技术支持: 电池性能工程与算法研究团队', width - 280, height - 35);
}

/**
 * 主导出函数：生成高质量 PDF 报告并触发浏览器下载
 */
export async function exportFlexibleWarrantyPdfReport(opts: GeneratePdfReportOptions): Promise<void> {
  const { site } = opts;

  // A4 标准物理比例: 宽 210mm x 高 297mm (以 1240 x 1754 像素高清渲染)
  const canvasWidth = 1240;
  const canvasHeight = 1754;

  const canvas1 = document.createElement('canvas');
  canvas1.width = canvasWidth;
  canvas1.height = canvasHeight;
  const ctx1 = canvas1.getContext('2d');
  if (!ctx1) throw new Error('无法创建Canvas 2D绘制上下文');

  drawPage1(ctx1, canvasWidth, canvasHeight, opts);

  const canvas2 = document.createElement('canvas');
  canvas2.width = canvasWidth;
  canvas2.height = canvasHeight;
  const ctx2 = canvas2.getContext('2d');
  if (!ctx2) throw new Error('无法创建Canvas 2D绘制上下文');

  drawPage2(ctx2, canvasWidth, canvasHeight, opts);

  // 转成 JPEG 图片格式
  const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
  const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);

  // 使用 jsPDF 构建 A4 PDF 档案
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // 第 1 页
  pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297);

  // 第 2 页
  pdf.addPage();
  pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297);

  // 格式化输出文件名
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const cleanSiteName = site.siteName.replace(/[\/\\:*?"<>|]/g, '_');
  const fileName = `${cleanSiteName}_灵活质保工况评估报告_${dateStr}.pdf`;

  pdf.save(fileName);
}
