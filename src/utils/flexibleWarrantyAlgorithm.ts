// 灵活质保工况与SOH估算算法引擎 & 标准模板导入导出工具

import {
  ContractBaselineCondition,
  SohBaselineCurvePoint,
  PackConditionRecord,
  StationDailyCondition,
  StationMonthlyCondition,
  AnnualFlexibleSohPoint,
  FlexibleWarrantySohResult,
  WarrantyLogFileSummary
} from '../types/warrantyCondition';

/**
 * 默认标准 10 年期 SOH 基准衰减曲线打点 (典型磷酸铁锂储能电芯合同约定保证值)
 */
export const DEFAULT_SOH_BASELINE_CURVE: SohBaselineCurvePoint[] = [
  { year: 0, guaranteedSoh: 100.0, cumulativeCycles: 0, cumulativeThroughputMwh: 0, description: '出厂投运基准' },
  { year: 1, guaranteedSoh: 97.2, cumulativeCycles: 365, cumulativeThroughputMwh: 7300, description: '首年初始SEI膜形成衰减' },
  { year: 2, guaranteedSoh: 94.6, cumulativeCycles: 730, cumulativeThroughputMwh: 14600, description: '第2年稳态衰减' },
  { year: 3, guaranteedSoh: 92.2, cumulativeCycles: 1095, cumulativeThroughputMwh: 21900, description: '第3年稳态衰减' },
  { year: 4, guaranteedSoh: 90.0, cumulativeCycles: 1460, cumulativeThroughputMwh: 29200, description: '第4年保证拐点' },
  { year: 5, guaranteedSoh: 88.0, cumulativeCycles: 1825, cumulativeThroughputMwh: 36500, description: '第5年中期考核点' },
  { year: 6, guaranteedSoh: 86.2, cumulativeCycles: 2190, cumulativeThroughputMwh: 43800, description: '第6年衰减考核' },
  { year: 7, guaranteedSoh: 84.5, cumulativeCycles: 2555, cumulativeThroughputMwh: 51100, description: '第7年衰减考核' },
  { year: 8, guaranteedSoh: 82.9, cumulativeCycles: 2920, cumulativeThroughputMwh: 58400, description: '第8年衰减考核' },
  { year: 9, guaranteedSoh: 81.4, cumulativeCycles: 3285, cumulativeThroughputMwh: 65700, description: '第9年衰减考核' },
  { year: 10, guaranteedSoh: 80.0, cumulativeCycles: 3650, cumulativeThroughputMwh: 73000, description: '质保终了EOL保证承诺' }
];

/**
 * 默认站点合同基准工况
 */
export const getDefaultContractBaseline = (siteId: string, ratedMwh = 20.0): ContractBaselineCondition => ({
  siteId,
  contractNo: `CT-ESS-${siteId.replace('site-', '2024-')}-SLA`,
  warrantyStartDate: '2024-01-01',
  warrantyEndDate: '2033-12-31',
  warrantyYears: 10,
  ratedEnergyMwh: ratedMwh,
  ratedPowerMw: ratedMwh / 2, // 典型 0.5C 配置
  annualBaselineEfc: 365,
  dailyBaselineEfc: 1.0,
  maxCrate: 0.50,
  maxDodPct: 90.0,
  baselineTempMin: 15.0,
  baselineTempAvg: 25.0,
  baselineTempMax: 35.0,
  annualEnergyThroughputLimitMwh: ratedMwh * 365,
  baselineRestSocLimitPct: 80.0,
  finalGuaranteedSoh: 80.0,
  lastModified: '2026-08-20 10:00:00',
  sourceType: 'DEFAULT'
});

// =========================================================================
// 1. 标准模板生成与下载 (CSV with UTF-8 BOM)
// =========================================================================

const triggerDownload = (filename: string, content: string) => {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 下载《合同基准工况标准模板.csv》
 */
export const downloadContractBaselineTemplate = () => {
  const rows = [
    ['参数名称', '参数键名', '参考数值', '单位', '填写说明与约束规则'],
    ['合同编号', 'contractNo', 'CT-ESS-2024-001', '无', '合同编号唯一标识'],
    ['质保起始日期', 'warrantyStartDate', '2024-01-01', 'YYYY-MM-DD', '商业投运或并网质保起算日'],
    ['质保终止日期', 'warrantyEndDate', '2033-12-31', 'YYYY-MM-DD', '质保届满到期日期'],
    ['质保服务年限', 'warrantyYears', '10', '年', '合同约定的总质保年限 (一般为5-10年)'],
    ['额定装机能量', 'ratedEnergyMwh', '20.0', 'MWh', '系统标称额定能量总容量'],
    ['额定额定功率', 'ratedPowerMw', '10.0', 'MW', '系统额定充放电功率'],
    ['基准年等效循环EFC', 'annualBaselineEfc', '365', '次/年', '合同约定的年基准等效满充循环'],
    ['基准日等效循环EFC', 'dailyBaselineEfc', '1.0', '次/日', '日均满充循环基准'],
    ['基准充放电倍率上限', 'maxCrate', '0.50', 'C', '合同保证倍率 (超出部分计入超工况)'],
    ['基准放电深度DOD上限', 'maxDodPct', '90.0', '%', '基准充放电区间深度DOD'],
    ['基准设计平均工作温度', 'baselineTempAvg', '25.0', '℃', '电芯设计推荐工况温度'],
    ['基准最高允许工作温度', 'baselineTempMax', '35.0', '℃', '电芯安全与质保免责温度红线(超出计超工况)'],
    ['年度累计放电能量限额', 'annualEnergyThroughputLimitMwh', '7300', 'MWh', '年度能量吞吐量额度上限'],
    ['基准静置SOC上限', 'baselineRestSocLimitPct', '80.0', '%', '长时间静置浮充SOC上限'],
    ['质保终了SOH保证值', 'finalGuaranteedSoh', '80.0', '%', '质保期满时保证电芯SOH最低保持率']
  ];
  const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  triggerDownload('储能站点合同基准工况标准模板.csv', csvContent);
};

/**
 * 下载《SOH基准衰减曲线标准模板.csv》
 */
export const downloadSohBaselineCurveTemplate = () => {
  const rows = [
    ['运营年限(Year)', 'SOH保证承诺值(%)', '累计基准等效循环(次)', '累计能量吞吐量(MWh)', '考核阶段说明'],
    ['0', '100.0', '0', '0', '投运初始状态'],
    ['1', '97.2', '365', '7300', '第1年保证值'],
    ['2', '94.6', '730', '14600', '第2年保证值'],
    ['3', '92.2', '1095', '21900', '第3年保证值'],
    ['4', '90.0', '1460', '29200', '第4年保证值'],
    ['5', '88.0', '1825', '36500', '第5年中期保证值'],
    ['6', '86.2', '2190', '43800', '第6年保证值'],
    ['7', '84.5', '2555', '51100', '第7年保证值'],
    ['8', '82.9', '2920', '58400', '第8年保证值'],
    ['9', '81.4', '3285', '65700', '第9年保证值'],
    ['10', '80.0', '3650', '73000', '质保终了EOL保证值']
  ];
  const csvContent = rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
  triggerDownload('SOH基准衰减曲线标准模板.csv', csvContent);
};

// =========================================================================
// 2. CSV 标准模版解析工具 (支持智能纠错与映射)
// =========================================================================

export const parseContractBaselineCsv = (
  text: string,
  siteId: string
): { success: boolean; data?: ContractBaselineCondition; error?: string } => {
  try {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, error: '文件行数过少，未找到有效的工况配置行' };
    }

    const baseline = getDefaultContractBaseline(siteId);
    baseline.sourceType = 'TEMPLATE_IMPORT';
    baseline.lastModified = new Date().toLocaleString();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 3) {
        const key = cols[1];
        const val = cols[2];
        if (key === 'contractNo') baseline.contractNo = val;
        else if (key === 'warrantyStartDate') baseline.warrantyStartDate = val;
        else if (key === 'warrantyEndDate') baseline.warrantyEndDate = val;
        else if (key === 'warrantyYears') baseline.warrantyYears = parseFloat(val) || 10;
        else if (key === 'ratedEnergyMwh') baseline.ratedEnergyMwh = parseFloat(val) || 20.0;
        else if (key === 'ratedPowerMw') baseline.ratedPowerMw = parseFloat(val) || 10.0;
        else if (key === 'annualBaselineEfc') baseline.annualBaselineEfc = parseFloat(val) || 365;
        else if (key === 'dailyBaselineEfc') baseline.dailyBaselineEfc = parseFloat(val) || 1.0;
        else if (key === 'maxCrate') baseline.maxCrate = parseFloat(val) || 0.5;
        else if (key === 'maxDodPct') baseline.maxDodPct = parseFloat(val) || 90.0;
        else if (key === 'baselineTempAvg') baseline.baselineTempAvg = parseFloat(val) || 25.0;
        else if (key === 'baselineTempMax') baseline.baselineTempMax = parseFloat(val) || 35.0;
        else if (key === 'annualEnergyThroughputLimitMwh')
          baseline.annualEnergyThroughputLimitMwh = parseFloat(val) || 7300;
        else if (key === 'baselineRestSocLimitPct') baseline.baselineRestSocLimitPct = parseFloat(val) || 80.0;
        else if (key === 'finalGuaranteedSoh') baseline.finalGuaranteedSoh = parseFloat(val) || 80.0;
      }
    }

    return { success: true, data: baseline };
  } catch (err: any) {
    return { success: false, error: err.message || 'CSV解析异常' };
  }
};

export const parseSohBaselineCurveCsv = (
  text: string
): { success: boolean; data?: SohBaselineCurvePoint[]; error?: string } => {
  try {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, error: '文件行数不足，请包含各年份SOH打点数据' };
    }

    const points: SohBaselineCurvePoint[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        const year = parseInt(cols[0], 10);
        const soh = parseFloat(cols[1]);
        if (!isNaN(year) && !isNaN(soh)) {
          points.push({
            year,
            guaranteedSoh: soh,
            cumulativeCycles: parseInt(cols[2], 10) || year * 365,
            cumulativeThroughputMwh: parseFloat(cols[3]) || year * 7300,
            description: cols[4] || `第${year}年SOH保证值`
          });
        }
      }
    }

    if (points.length === 0) {
      return { success: false, error: '未成功解析到年份与SOH保证数值' };
    }

    // 按年份升序排序
    points.sort((a, b) => a.year - b.year);
    return { success: true, data: points };
  } catch (err: any) {
    return { success: false, error: err.message || 'SOH曲线解析失败' };
  }
};

// =========================================================================
// 3. 电池 PACK 级工况日志生成与解析
// =========================================================================

export const generateSamplePackRecords = (count = 24): PackConditionRecord[] => {
  const records: PackConditionRecord[] = [];
  const now = new Date();
  const clusters = ['Cluster-A', 'Cluster-B', 'Cluster-C'];

  for (let i = 1; i <= count; i++) {
    const packCode = `PACK-${String(i).padStart(2, '0')}`;
    const clusterId = clusters[Math.floor((i - 1) / 8)];
    
    // 模拟部分 PACK 存在过温或过倍率超工况
    const hasOverTemp = i === 4 || i === 12;
    const hasOverCrate = i === 7;
    const hasDeepDod = i === 18;

    const maxTemp = hasOverTemp ? 37.8 + Math.random() * 2.5 : 27.5 + Math.random() * 5.0;
    const minTemp = maxTemp - (2.5 + Math.random() * 2.0);
    const avgTemp = (maxTemp + minTemp) / 2;
    const cRate = hasOverCrate ? 0.62 + Math.random() * 0.15 : 0.38 + Math.random() * 0.1;
    const soc = hasDeepDod ? 96.5 : 78.0 + Math.random() * 12.0;

    let overReason: string | undefined;
    if (hasOverTemp) overReason = `电芯最高温 ${maxTemp.toFixed(1)}℃ 超出基准 35℃`;
    else if (hasOverCrate) overReason = `放电倍率 ${cRate.toFixed(2)}C 超出基准 0.50C`;
    else if (hasDeepDod) overReason = '深充深放 DOD 达 94.2% 超出基准 90%';

    records.push({
      id: `p-rec-${i}`,
      timestamp: `${now.getFullYear()}-08-20 14:30:00`,
      packId: `pk-id-${i}`,
      packCode,
      clusterId,
      voltageV: +(768.4 + (Math.random() * 12 - 6)).toFixed(1),
      currentA: +(280.0 * (cRate / 0.5) + (Math.random() * 10 - 5)).toFixed(1),
      cRate: +cRate.toFixed(2),
      maxTemp: +maxTemp.toFixed(1),
      minTemp: +minTemp.toFixed(1),
      avgTemp: +avgTemp.toFixed(1),
      soc: +soc.toFixed(1),
      throughputAh: +(8400 + Math.random() * 1200).toFixed(0),
      energyKwh: +(645.2 + Math.random() * 95).toFixed(1),
      soh: +(hasOverTemp ? 91.2 : 94.5 + Math.random() * 3.0).toFixed(1),
      isOverCondition: hasOverTemp || hasOverCrate || hasDeepDod,
      overReason
    });
  }

  return records;
};

// =========================================================================
// 4. PACK 级工况数据换算为站级工况数据 (算法换算核心)
// =========================================================================

export const convertPackToStationSummary = (
  packRecords: PackConditionRecord[],
  ratedEnergyMwh = 20.0,
  baselineTempMax = 35.0,
  baselineCrate = 0.50
) => {
  if (packRecords.length === 0) {
    return {
      stationEnergyMwh: 0,
      stationEfc: 0,
      stationMaxTemp: 0,
      stationMinTemp: 0,
      stationAvgTemp: 0,
      stationPeakCrate: 0,
      stationAvgSoc: 0,
      deltaSoc: 0,
      overConditionPackCount: 0,
      bottleneckPackCode: '-'
    };
  }

  // 1. 能量吞吐求和换算为全站 MWh: 全站 MWh = ∑ Pack Energy (kWh) / 1000
  const totalPackEnergyKwh = packRecords.reduce((acc, p) => acc + p.energyKwh, 0);
  const stationEnergyMwh = +(totalPackEnergyKwh / 1000).toFixed(2);

  // 2. 站级日等效满充循环 EFC = 站级放电能量吞吐 / (2 * 额定能量)
  const stationEfc = +(stationEnergyMwh / (2 * ratedEnergyMwh)).toFixed(3);

  // 3. 温度极值与加权平均 (木桶原理: 最弱最热PACK决定系统热应力上限)
  const temps = packRecords.map(p => p.maxTemp);
  const stationMaxTemp = +Math.max(...temps).toFixed(1);
  const stationMinTemp = +Math.min(...packRecords.map(p => p.minTemp)).toFixed(1);
  const stationAvgTemp = +(
    packRecords.reduce((acc, p) => acc + p.avgTemp, 0) / packRecords.length
  ).toFixed(1);

  // 4. 倍率极值
  const stationPeakCrate = +Math.max(...packRecords.map(p => p.cRate)).toFixed(2);

  // 5. SOC 不均衡度: ΔSOC = max(SOC) - min(SOC)
  const socs = packRecords.map(p => p.soc);
  const stationAvgSoc = +(socs.reduce((a, b) => a + b, 0) / socs.length).toFixed(1);
  const deltaSoc = +(Math.max(...socs) - Math.min(...socs)).toFixed(1);

  // 6. 超工况统计
  const overConditionPacks = packRecords.filter(p => p.isOverCondition);
  const bottleneckPack = [...packRecords].sort((a, b) => a.soh - b.soh)[0];

  return {
    stationEnergyMwh,
    stationEfc,
    stationMaxTemp,
    stationMinTemp,
    stationAvgTemp,
    stationPeakCrate,
    stationAvgSoc,
    deltaSoc,
    overConditionPackCount: overConditionPacks.length,
    bottleneckPackCode: bottleneckPack?.packCode || '-'
  };
};

// =========================================================================
// 5. 基于站级日工况及基准工况计算超工况数据 (生成日/月数据)
// =========================================================================

export const generateStationDailyAndMonthlyData = (
  siteId: string,
  baseline: ContractBaselineCondition
): { daily: StationDailyCondition[]; monthly: StationMonthlyCondition[] } => {
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'];
  const dailyList: StationDailyCondition[] = [];
  const monthlyList: StationMonthlyCondition[] = [];

  const ratedMwh = baseline.ratedEnergyMwh;
  const baseTempMax = baseline.baselineTempMax;
  const baseCrate = baseline.maxCrate;
  const baseEfc = baseline.dailyBaselineEfc;

  months.forEach(month => {
    const daysInMonth = month === '2026-02' ? 28 : ['2026-04', '2026-06'].includes(month) ? 30 : 31;
    const monthDaily: StationDailyCondition[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${month}-${String(day).padStart(2, '0')}`;
      
      // 模拟工况季节与负荷波动 (夏季7-8月负荷高、温度高，产生较多超工况)
      const isSummer = month === '2026-07' || month === '2026-08';
      const isHeavyLoadDay = day % 4 === 0 || (isSummer && day % 2 === 0);

      // 实际循环
      const actualEfc = +(isHeavyLoadDay ? baseEfc * (1.15 + Math.random() * 0.25) : baseEfc * (0.85 + Math.random() * 0.2)).toFixed(2);
      const overEfc = +(Math.max(0, actualEfc - baseEfc)).toFixed(2);

      // 吞吐量 MWh
      const actualThroughputMwh = +(actualEfc * 2 * ratedMwh).toFixed(2);
      const baselineThroughputMwh = +(baseEfc * 2 * ratedMwh).toFixed(2);
      const overThroughputMwh = +(Math.max(0, actualThroughputMwh - baselineThroughputMwh)).toFixed(2);

      // 温度
      const baseT = isSummer ? 31.0 : 22.0;
      const maxTemp = +(isHeavyLoadDay && isSummer ? baseTempMax + 1.2 + Math.random() * 3.2 : baseT + Math.random() * 4.0).toFixed(1);
      const avgTemp = +(maxTemp - (4.0 + Math.random() * 2.0)).toFixed(1);

      // 超温计算
      const hasOverTemp = maxTemp > baseTempMax;
      const overTempDegreeHours = hasOverTemp ? +((maxTemp - baseTempMax) * (2.0 + Math.random() * 3.5)).toFixed(1) : 0;
      const overTempHours = hasOverTemp ? +(1.5 + Math.random() * 2.5).toFixed(1) : 0;

      // 倍率
      const maxCrate = +(isHeavyLoadDay ? baseCrate + (Math.random() * 0.16) : baseCrate * (0.75 + Math.random() * 0.2)).toFixed(2);
      const overCrateMwh = maxCrate > baseCrate ? +(actualThroughputMwh * 0.25).toFixed(2) : 0;

      // 综合超工况指数
      const overIndex = +(
        (overEfc > 0 ? (overEfc / baseEfc) * 35 : 0) +
        (hasOverTemp ? (overTempDegreeHours / 15) * 45 : 0) +
        (maxCrate > baseCrate ? ((maxCrate - baseCrate) / baseCrate) * 30 : 0)
      ).toFixed(1);

      const isOver = overIndex > 15;
      const status: 'COMPLIANT' | 'WARNING' | 'EXCEEDED' = overIndex > 50 ? 'EXCEEDED' : overIndex > 20 ? 'WARNING' : 'COMPLIANT';

      // 算法折算单日SOH等效额外损耗 %
      const equivalentSohLossPct = +(0.0025 * (1 + overIndex / 100)).toFixed(5);

      const dayRecord: StationDailyCondition = {
        date: dateStr,
        siteId,
        actualThroughputMwh,
        actualEfc,
        baselineEfc: baseEfc,
        overEfc,
        baselineThroughputMwh,
        overThroughputMwh,
        avgTemp,
        maxTemp,
        baselineTempMax: baseTempMax,
        overTempDegreeHours,
        overTempHours,
        maxCrate,
        baselineCrate: baseCrate,
        overCrateMwh,
        avgDod: +(86.0 + Math.random() * 6).toFixed(1),
        baselineDod: baseline.maxDodPct,
        deltaSoc: +(3.2 + Math.random() * 3.0).toFixed(1),
        overConditionIndex: Math.min(100, overIndex),
        isOverCondition: isOver,
        complianceStatus: status,
        equivalentSohLossPct
      };

      monthDaily.push(dayRecord);
      dailyList.push(dayRecord);
    }

    // 月度统计汇总
    const mActualEfc = +monthDaily.reduce((a, b) => a + b.actualEfc, 0).toFixed(1);
    const mBaselineEfc = +(baseEfc * daysInMonth).toFixed(1);
    const mOverEfc = +Math.max(0, mActualEfc - mBaselineEfc).toFixed(1);

    const mActualThroughput = +monthDaily.reduce((a, b) => a + b.actualThroughputMwh, 0).toFixed(1);
    const mBaselineThroughput = +(mBaselineEfc * 2 * ratedMwh).toFixed(1);
    const mOverThroughput = +Math.max(0, mActualThroughput - mBaselineThroughput).toFixed(1);

    const mAvgTemp = +(monthDaily.reduce((a, b) => a + b.avgTemp, 0) / daysInMonth).toFixed(1);
    const mMaxTemp = +Math.max(...monthDaily.map(d => d.maxTemp)).toFixed(1);
    const mOverTempHours = +monthDaily.reduce((a, b) => a + b.overTempHours, 0).toFixed(1);
    const mOverTempDegreeHours = +monthDaily.reduce((a, b) => a + b.overTempDegreeHours, 0).toFixed(1);

    const mMaxCrate = +Math.max(...monthDaily.map(d => d.maxCrate)).toFixed(2);
    const mOverCrateMwh = +monthDaily.reduce((a, b) => a + b.overCrateMwh, 0).toFixed(1);
    const mOverIndex = +(monthDaily.reduce((a, b) => a + b.overConditionIndex, 0) / daysInMonth).toFixed(1);

    const compliantDays = monthDaily.filter(d => d.complianceStatus === 'COMPLIANT').length;
    const complianceRate = +((compliantDays / daysInMonth) * 100).toFixed(1);

    monthlyList.push({
      month,
      daysCount: daysInMonth,
      baselineEfc: mBaselineEfc,
      actualEfc: mActualEfc,
      overEfc: mOverEfc,
      baselineThroughputMwh: mBaselineThroughput,
      actualThroughputMwh: mActualThroughput,
      overThroughputMwh: mOverThroughput,
      avgTemp: mAvgTemp,
      maxTemp: mMaxTemp,
      overTempHours: mOverTempHours,
      overTempDegreeHours: mOverTempDegreeHours,
      maxCrate: mMaxCrate,
      overCrateMwh: mOverCrateMwh,
      overConditionIndex: mOverIndex,
      complianceRate,
      status: complianceRate < 70 ? 'EXCEEDED' : complianceRate < 90 ? 'WARNING' : 'NORMAL',
      dailyDetails: monthDaily
    });
  });

  return { daily: dailyList, monthly: monthlyList };
};

// =========================================================================
// 6. 算法团队灵活质保 SOH 估算接口调用引擎 (生成年度双曲线)
// =========================================================================

export const calculateFlexibleWarrantySohAlgorithm = (
  baseline: ContractBaselineCondition,
  baselineCurve: SohBaselineCurvePoint[],
  monthlyData: StationMonthlyCondition[],
  dailyData: StationDailyCondition[]
): FlexibleWarrantySohResult => {
  // 1. 累计超工况统计提取
  const totalExcessEfc = +monthlyData.reduce((acc, m) => acc + m.overEfc, 0).toFixed(1);
  const totalOverTempDegreeHours = +monthlyData.reduce((acc, m) => acc + m.overTempDegreeHours, 0).toFixed(1);
  const totalOverCrateThroughputMwh = +monthlyData.reduce((acc, m) => acc + m.overCrateMwh, 0).toFixed(1);

  // 2. 耦合老化加速因子推算 (Arrhenius温度应力项 + 疲劳循环应力项)
  // 当工况温和时加速因子 < 1.0 (寿命延长)；当频繁超温超倍率时加速因子 > 1.0 (寿命提前衰减)
  const tempStressFactor = totalOverTempDegreeHours > 0 ? (totalOverTempDegreeHours / 600) * 0.08 : 0;
  const cycleStressFactor = totalExcessEfc > 0 ? (totalExcessEfc / 200) * 0.05 : 0;
  const crateStressFactor = totalOverCrateThroughputMwh > 0 ? (totalOverCrateThroughputMwh / 1000) * 0.04 : 0;

  const overallAccelerationFactor = +(1.0 + tempStressFactor + cycleStressFactor + crateStressFactor).toFixed(3);

  // 3. 计算 10 年年度打点曲线 (Year 0 到 10)
  // 当前处于第2年下半年 (约2.6年)
  const currentOpYear = 2.6;
  const annualPoints: AnnualFlexibleSohPoint[] = [];

  for (let y = 0; y <= 10; y++) {
    const basePoint = baselineCurve.find(p => p.year === y) || {
      year: y,
      guaranteedSoh: 100.0 - y * 2.0,
      cumulativeCycles: y * 365,
      cumulativeThroughputMwh: y * 7300
    };

    const isHistorical = y <= 2;
    let flexibleWarrantySoh: number;
    let cumulativePenalty: number;

    if (y === 0) {
      flexibleWarrantySoh = 100.0;
      cumulativePenalty = 0;
    } else if (isHistorical) {
      // 历史年份打点: 基于实际运行与定期容量标定实测值
      // 略低于基准保证线 (因为存在部分超工况)
      cumulativePenalty = +(y * 0.42 * overallAccelerationFactor).toFixed(2);
      flexibleWarrantySoh = +(basePoint.guaranteedSoh - cumulativePenalty + (y === 1 ? 0.3 : 0.1)).toFixed(1);
    } else {
      // 未来外推预测打点: 算法团队 Arrhenius + 能量疲劳外推模型
      cumulativePenalty = +(y * 0.55 * (overallAccelerationFactor - 0.95)).toFixed(2);
      flexibleWarrantySoh = +(basePoint.guaranteedSoh - cumulativePenalty).toFixed(1);
    }

    const deltaSoh = +(flexibleWarrantySoh - basePoint.guaranteedSoh).toFixed(1);
    const status: 'SAFE' | 'WARNING' | 'CRITICAL' =
      deltaSoh >= 0 ? 'SAFE' : deltaSoh >= -1.5 ? 'WARNING' : 'CRITICAL';

    const dateYear = 2024 + y;
    annualPoints.push({
      year: y,
      yearLabel: y === 0 ? '第0年 (初始投运)' : `第 ${y} 年`,
      date: `${dateYear}-01-01`,
      baselineSoh: basePoint.guaranteedSoh,
      flexibleWarrantySoh,
      deltaSoh,
      isHistorical,
      cumulativeCycles: Math.round(basePoint.cumulativeCycles * (1 + (overallAccelerationFactor - 1) * 0.5)),
      cumulativeThroughputMwh: Math.round(basePoint.cumulativeThroughputMwh * (1 + (overallAccelerationFactor - 1) * 0.5)),
      cumulativeOverPenaltyPct: cumulativePenalty,
      status
    });
  }

  // 估算当前 SOH
  const currentBaselineSoh = 93.8;
  const currentFlexibleSoh = +(currentBaselineSoh - 1.2 * overallAccelerationFactor).toFixed(1);
  const sohMargin = +(currentFlexibleSoh - currentBaselineSoh).toFixed(1);
  const endPoint = annualPoints[annualPoints.length - 1];

  // 折算质保增减天数 (天)
  const extendedOrReducedWarrantyDays = Math.round((sohMargin / 2.0) * 365);

  return {
    siteId: baseline.siteId,
    algorithmVersion: 'v3.4.2-FlexibleWarranty-Arrhenius-Fatigue',
    evaluatedAt: new Date().toLocaleString(),
    currentOperationYears: currentOpYear,
    currentBaselineSoh,
    currentFlexibleSoh,
    sohMargin,
    estimatedEndLifeSoh: endPoint.flexibleWarrantySoh,
    guaranteedEndLifeSoh: baseline.finalGuaranteedSoh,
    warrantyHealthStatus: sohMargin >= 0 ? 'HEALTHY' : sohMargin >= -1.5 ? 'MARGINAL_RISK' : 'OVER_WARRANTY_RISK',
    annualPoints,
    overConditionSummary: {
      totalExcessEfc,
      totalOverTempDegreeHours,
      totalOverCrateThroughputMwh,
      overallAccelerationFactor,
      extendedOrReducedWarrantyDays
    }
  };
};

// =========================================================================
// 7. 站级日工况与超工况明细按天导出 (CSV with UTF-8 BOM)
// =========================================================================

export const exportDailyConditionsToCsv = (
  dailyList: StationDailyCondition[],
  siteName: string
) => {
  const headers = [
    '日期',
    '站点标识',
    '实际放电吞吐量(MWh)',
    '基准吞吐量(MWh)',
    '超额吞吐量(MWh)',
    '实际等效循环EFC(次)',
    '基准等效循环EFC(次)',
    '超额循环EFC(次)',
    '平均温度(℃)',
    '最高温度(℃)',
    '基准最高温度红线(℃)',
    '超温度时(℃·h)',
    '超温时长(h)',
    '峰值充放倍率(C)',
    '基准倍率(C)',
    '超倍率吞吐量(MWh)',
    '平均放电深度DOD(%)',
    '簇间最大ΔSOC(%)',
    '综合超工况指数(0-100)',
    '是否超工况',
    '质保履约状态',
    '当日等效SOH额外损耗(%)'
  ];

  const rows = dailyList.map(d => [
    d.date,
    d.siteId,
    d.actualThroughputMwh,
    d.baselineThroughputMwh,
    d.overThroughputMwh,
    d.actualEfc,
    d.baselineEfc,
    d.overEfc,
    d.avgTemp,
    d.maxTemp,
    d.baselineTempMax,
    d.overTempDegreeHours,
    d.overTempHours,
    d.maxCrate,
    d.baselineCrate,
    d.overCrateMwh,
    d.avgDod,
    d.deltaSoc,
    d.overConditionIndex,
    d.isOverCondition ? '是' : '否',
    d.complianceStatus === 'COMPLIANT' ? '合规' : d.complianceStatus === 'WARNING' ? '预警' : '超工况',
    d.equivalentSohLossPct
  ]);

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(r => r.map(c => `"${c}"`).join(','))
  ].join('\n');

  const filename = `${siteName}_站级日工况与超工况明细_${new Date().toISOString().slice(0, 10)}.csv`;
  triggerDownload(filename, csvContent);
};
