// 灵活质保工况与SOH估算算法引擎 & 标准模板导入导出工具

import {
  ContractBaselineCondition,
  SohBaselineCurvePoint,
  PackConditionRecord,
  StationDailyCondition,
  StationMonthlyCondition,
  AnnualFlexibleSohPoint,
  FlexibleWarrantySohResult,
  WarrantyLogFileSummary,
  ContractYearOverConditionSummary,
  InterimYearEndSohAssessment,
  NextYearConditionPlan
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
  plannedAvgSocPct: 50.0,
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

      // 设备核心工况指标计算
      const avgDod = +(86.0 + Math.random() * 6).toFixed(1);
      const dailyCrate = +(maxCrate * 0.88).toFixed(2);
      const dailyChargeCrate = +(maxCrate * 0.82).toFixed(2);
      const dailyDischargeCrate = +(maxCrate * 0.95).toFixed(2);
      const dailyPackAvgSoc = +(50.5 + Math.sin(day * 0.45) * 5.8 + Math.random() * 2.4).toFixed(1);
      const dailyOperatingHours = +(15.8 + Math.min(6.5, actualEfc * 3.6) + (Math.random() * 1.0 - 0.5)).toFixed(1);
      const dailyCycles = actualEfc;
      const dailyDod = avgDod;
      const dischargeEnergyMwh = actualThroughputMwh;
      const chargeEnergyMwh = +(actualThroughputMwh * 1.14).toFixed(2); // 综合考虑充放电能效 RTE
      const totalEnergyMwh = +(dischargeEnergyMwh + chargeEnergyMwh).toFixed(2);

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
        avgDod,
        baselineDod: baseline.maxDodPct,
        deltaSoc: +(3.2 + Math.random() * 3.0).toFixed(1),
        overConditionIndex: Math.min(100, overIndex),
        isOverCondition: isOver,
        complianceStatus: status,
        equivalentSohLossPct,

        // 6 项核心设备工况数据
        dailyCrate,
        dailyChargeCrate,
        dailyDischargeCrate,
        dailyPackAvgSoc,
        dailyOperatingHours,
        dailyCycles,
        dailyDod,
        chargeEnergyMwh,
        dischargeEnergyMwh,
        totalEnergyMwh
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

    // 6 项设备工况月度平均与汇总
    const avgDailyCrate = +(monthDaily.reduce((a, b) => a + b.dailyCrate, 0) / daysInMonth).toFixed(2);
    const avgDailyPackSoc = +(monthDaily.reduce((a, b) => a + b.dailyPackAvgSoc, 0) / daysInMonth).toFixed(1);
    const avgDailyOperatingHours = +(monthDaily.reduce((a, b) => a + b.dailyOperatingHours, 0) / daysInMonth).toFixed(1);
    const totalCycles = +monthDaily.reduce((a, b) => a + b.dailyCycles, 0).toFixed(1);
    const avgDailyDod = +(monthDaily.reduce((a, b) => a + b.dailyDod, 0) / daysInMonth).toFixed(1);
    const totalChargeEnergyMwh = +monthDaily.reduce((a, b) => a + b.chargeEnergyMwh, 0).toFixed(1);
    const totalDischargeEnergyMwh = +monthDaily.reduce((a, b) => a + b.dischargeEnergyMwh, 0).toFixed(1);
    const totalEnergyMwh = +(totalChargeEnergyMwh + totalDischargeEnergyMwh).toFixed(1);

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
      
      avgDailyCrate,
      avgDailyPackSoc,
      avgDailyOperatingHours,
      totalCycles,
      avgDailyDod,
      totalChargeEnergyMwh,
      totalDischargeEnergyMwh,
      totalEnergyMwh,
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
    '日充放电倍率(C)',
    '日电池PACK平均SOC(%)',
    '日系统运行时间(h)',
    '日循环次数(次)',
    '日DOD(%)',
    '日充电电量(MWh)',
    '日放电电量(MWh)',
    '充放电电量合计(MWh)',
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
    '簇间最大ΔSOC(%)',
    '综合超工况指数(0-100)',
    '是否超工况',
    '质保履约状态',
    '当日等效SOH额外损耗(%)'
  ];

  const rows = dailyList.map(d => [
    d.date,
    d.siteId,
    d.dailyCrate,
    d.dailyPackAvgSoc,
    d.dailyOperatingHours,
    d.dailyCycles,
    d.dailyDod,
    d.chargeEnergyMwh,
    d.dischargeEnergyMwh,
    d.totalEnergyMwh,
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

// =========================================================================
// 8. 当前合同年超工况统计计算引擎
// =========================================================================

/**
 * 计算当前合同年的超工况综合统计指标及标红报警状态
 * 规则: 如果超限次数大于0，或者平均SOC大于合同规划SOC，则标红展示 (isRedAlert: true)
 */
export const calculateContractYearOverCondition = (
  siteId: string,
  baseline: ContractBaselineCondition,
  dailyList: StationDailyCondition[],
  monthlyList: StationMonthlyCondition[]
): ContractYearOverConditionSummary => {
  // 1. 确定当前合同年信息
  const startYear = parseInt(baseline.warrantyStartDate.slice(0, 4), 10) || 2024;
  const currentSimYear = 2026;
  const contractYear = currentSimYear - startYear + 1; // e.g. 2026 - 2024 + 1 = 3
  const contractYearLabel = `第${contractYear}合同年 (${currentSimYear}年度)`;
  const startDate = `${currentSimYear}-01-01`;
  const endDate = `${currentSimYear}-12-31`;

  // 筛选属于当前合同年的日数据与月数据
  const yearDaily = dailyList.filter(d => d.date.startsWith(String(currentSimYear)));
  const yearMonthly = monthlyList.filter(m => m.month.startsWith(String(currentSimYear)));

  const elapsedDays = yearDaily.length || 243;
  const totalDays = 365;
  const progressPct = +((elapsedDays / totalDays) * 100).toFixed(1);

  // 2. 合同规划SOC与实际平均SOC
  const contractPlannedSoc = baseline.plannedAvgSocPct ?? 50.0;
  const actualAvgSoc = yearDaily.length > 0
    ? +(yearDaily.reduce((acc, d) => acc + d.dailyPackAvgSoc, 0) / yearDaily.length).toFixed(1)
    : 52.8;
  const isSocExceeded = actualAvgSoc > contractPlannedSoc;
  const socDiff = +(actualAvgSoc - contractPlannedSoc).toFixed(1);

  // 3. 各细分维度超限天数与次数统计
  const tempOverLimitDays = yearDaily.filter(d => d.maxTemp > baseline.baselineTempMax).length;
  const tempMaxRecorded = yearDaily.length > 0 ? +Math.max(...yearDaily.map(d => d.maxTemp)).toFixed(1) : 38.6;
  const totalOverTempDegreeHours = +yearDaily.reduce((acc, d) => acc + d.overTempDegreeHours, 0).toFixed(1);
  const totalOverTempHours = +yearDaily.reduce((acc, d) => acc + d.overTempHours, 0).toFixed(1);

  const crateOverLimitDays = yearDaily.filter(d => d.maxCrate > baseline.maxCrate).length;
  const crateMaxRecorded = yearDaily.length > 0 ? +Math.max(...yearDaily.map(d => d.maxCrate)).toFixed(2) : 0.68;
  const crateOverMwh = +yearDaily.reduce((acc, d) => acc + d.overCrateMwh, 0).toFixed(1);

  const dodOverLimitDays = yearDaily.filter(d => (d.dailyDod || d.avgDod) > baseline.maxDodPct).length;
  const dodMaxRecorded = yearDaily.length > 0 ? +Math.max(...yearDaily.map(d => d.dailyDod || d.avgDod)).toFixed(1) : 94.2;

  const cyclesOverLimitDays = yearDaily.filter(d => d.actualEfc > baseline.dailyBaselineEfc).length;
  const cumulativeActualCycles = +yearDaily.reduce((acc, d) => acc + d.actualEfc, 0).toFixed(1);
  const plannedAnnualCycles = baseline.annualBaselineEfc;

  const throughputActualMwh = +yearDaily.reduce((acc, d) => acc + d.actualThroughputMwh, 0).toFixed(1);
  const throughputLimitMwh = baseline.annualEnergyThroughputLimitMwh;

  const socOverLimitDays = yearDaily.filter(d => d.dailyPackAvgSoc > contractPlannedSoc).length;

  // 超限总次数 (包括超温、超倍率、超DOD深度、超循环、平均SOC超规划)
  const totalOverLimitCount = tempOverLimitDays + crateOverLimitDays + dodOverLimitDays + (cyclesOverLimitDays > 0 ? Math.min(cyclesOverLimitDays, 12) : 0);
  const isOverLimitExceeded = totalOverLimitCount > 0;

  // 4. 标红规则触发判定: 超限次数 > 0 或者 平均SOC > 合同规划SOC
  const isRedAlert = isOverLimitExceeded || isSocExceeded;

  let alertMessage = '';
  if (isRedAlert) {
    const reasons: string[] = [];
    if (isOverLimitExceeded) {
      reasons.push(`累计超限次数达 ${totalOverLimitCount} 次 (包含超温${tempOverLimitDays}天/超倍率${crateOverLimitDays}天/超深DOD${dodOverLimitDays}天)`);
    }
    if (isSocExceeded) {
      reasons.push(`实际平均SOC (${actualAvgSoc}%) 高于合同规划SOC (${contractPlannedSoc}%) +${socDiff}%`);
    }
    alertMessage = `当前合同年已触发超工况标红预警：${reasons.join('；')}。已超出合同基准质保边界，需启动工况校准与质保折损评估。`;
  }

  // 5. 6 项设备核心工况指标年度均值与累计
  const annualAvgDailyCrate = yearDaily.length > 0
    ? +(yearDaily.reduce((acc, d) => acc + d.dailyCrate, 0) / yearDaily.length).toFixed(2)
    : 0.42;
  const annualAvgPackSoc = actualAvgSoc;
  const annualAvgOperatingHours = yearDaily.length > 0
    ? +(yearDaily.reduce((acc, d) => acc + d.dailyOperatingHours, 0) / yearDaily.length).toFixed(1)
    : 18.6;
  const annualTotalCycles = yearDaily.length > 0
    ? +yearDaily.reduce((acc, d) => acc + d.dailyCycles, 0).toFixed(1)
    : cumulativeActualCycles;
  const annualAvgDod = yearDaily.length > 0
    ? +(yearDaily.reduce((acc, d) => acc + d.dailyDod, 0) / yearDaily.length).toFixed(1)
    : 88.5;
  const annualTotalChargeMwh = yearDaily.length > 0
    ? +yearDaily.reduce((acc, d) => acc + d.chargeEnergyMwh, 0).toFixed(1)
    : +(throughputActualMwh * 1.12).toFixed(1);
  const annualTotalDischargeMwh = throughputActualMwh;
  const annualTotalEnergyMwh = +(annualTotalChargeMwh + annualTotalDischargeMwh).toFixed(1);

  // 6. 月度拆解
  const monthlyBreakdown = yearMonthly.map(m => {
    const mDaily = yearDaily.filter(d => d.date.startsWith(m.month));
    const mOverCount = mDaily.filter(d => d.isOverCondition).length;
    const mAvgSoc = m.avgDailyPackSoc;
    const mSocExceeded = mAvgSoc > contractPlannedSoc;
    const mIsOver = mOverCount > 0;
    const mIsRed = mIsOver || mSocExceeded;

    return {
      month: m.month,
      daysCount: m.daysCount,
      overLimitCount: mOverCount,
      avgSoc: mAvgSoc,
      isSocExceeded: mSocExceeded,
      isOverLimit: mIsOver,
      isRed: mIsRed,
      maxTemp: m.maxTemp,
      maxCrate: m.maxCrate,
      actualCycles: m.actualEfc,
      plannedCycles: +(baseline.dailyBaselineEfc * m.daysCount).toFixed(1),
      throughputMwh: m.actualThroughputMwh
    };
  });

  // 7. 生成超限历史事件明细
  const overLimitEvents: ContractYearOverConditionSummary['overLimitEvents'] = [];
  let eventIdx = 1;

  yearDaily
    .filter(d => d.isOverCondition || d.dailyPackAvgSoc > contractPlannedSoc)
    .slice(-15) // 最近 15 条典型超限记录
    .reverse()
    .forEach(d => {
      if (d.maxTemp > baseline.baselineTempMax) {
        overLimitEvents.push({
          id: `EVT-${eventIdx++}`,
          date: d.date,
          type: 'TEMP',
          typeName: '电芯工作温度超限',
          recordedValue: `${d.maxTemp} ℃`,
          contractLimit: `≤ ${baseline.baselineTempMax} ℃`,
          deviation: `+${(d.maxTemp - baseline.baselineTempMax).toFixed(1)} ℃`,
          impactDescription: `超温时长 ${d.overTempHours}h，超温度时 ${d.overTempDegreeHours}℃·h，增加高温析锂与正极溶解风险`,
          severity: d.maxTemp > baseline.baselineTempMax + 2.0 ? 'CRITICAL' : 'WARNING'
        });
      }
      if (d.maxCrate > baseline.maxCrate) {
        overLimitEvents.push({
          id: `EVT-${eventIdx++}`,
          date: d.date,
          type: 'CRATE',
          typeName: '充放电倍率超限',
          recordedValue: `${d.maxCrate} C`,
          contractLimit: `≤ ${baseline.maxCrate} C`,
          deviation: `+${(d.maxCrate - baseline.maxCrate).toFixed(2)} C`,
          impactDescription: `超倍率吞吐 ${d.overCrateMwh} MWh，局部极化应力加速SEI膜破裂增厚`,
          severity: d.maxCrate > baseline.maxCrate + 0.1 ? 'CRITICAL' : 'WARNING'
        });
      }
      if (d.dailyPackAvgSoc > contractPlannedSoc) {
        overLimitEvents.push({
          id: `EVT-${eventIdx++}`,
          date: d.date,
          type: 'SOC',
          typeName: '日平均SOC超合同规划',
          recordedValue: `${d.dailyPackAvgSoc} %`,
          contractLimit: `规划值 ${contractPlannedSoc} %`,
          deviation: `+${(d.dailyPackAvgSoc - contractPlannedSoc).toFixed(1)} %`,
          impactDescription: `电芯长期处于高荷电态高开路电压应力环境，加速日历自放电与活性锂损耗`,
          severity: d.dailyPackAvgSoc > contractPlannedSoc + 5 ? 'CRITICAL' : 'WARNING'
        });
      }
      if (d.dailyDod > baseline.maxDodPct) {
        overLimitEvents.push({
          id: `EVT-${eventIdx++}`,
          date: d.date,
          type: 'DOD',
          typeName: '放电深度DOD超限',
          recordedValue: `${d.dailyDod} %`,
          contractLimit: `≤ ${baseline.maxDodPct} %`,
          deviation: `+${(d.dailyDod - baseline.maxDodPct).toFixed(1)} %`,
          impactDescription: `深度过放导致相变机械应力增加，影响后期容量保持率`,
          severity: 'WARNING'
        });
      }
    });

  return {
    siteId,
    contractNo: baseline.contractNo,
    contractYear,
    contractYearLabel,
    startDate,
    endDate,
    elapsedDays,
    totalDays,
    progressPct,

    contractPlannedSoc,
    actualAvgSoc,
    isSocExceeded,
    socDiff,

    totalOverLimitCount,
    isOverLimitExceeded,

    isRedAlert,
    alertMessage,

    tempOverLimitCount: tempOverLimitDays,
    tempMaxRecorded,
    tempThreshold: baseline.baselineTempMax,
    totalOverTempDegreeHours,
    totalOverTempHours,

    crateOverLimitCount: crateOverLimitDays,
    crateMaxRecorded,
    crateThreshold: baseline.maxCrate,
    crateOverMwh,

    dodOverLimitCount: dodOverLimitDays,
    dodMaxRecorded,
    dodThreshold: baseline.maxDodPct,

    cyclesOverLimitDays,
    cumulativeActualCycles,
    plannedAnnualCycles,

    throughputActualMwh,
    throughputLimitMwh,

    socOverLimitDays,

    annualAvgDailyCrate,
    annualAvgPackSoc,
    annualAvgOperatingHours,
    annualTotalCycles,
    annualAvgDod,
    annualTotalChargeMwh,
    annualTotalDischargeMwh,
    annualTotalEnergyMwh,

    monthlyBreakdown,
    overLimitEvents
  };
};

// =========================================================================
// 9. 年底灵活质保 SOH 临时手动评估算法引擎
// =========================================================================

/**
 * 临时手动评估年底灵活质保 SOH
 * 逻辑: 基于按合同工况的年底预期SOH保证值，结合合同年开始日期(2026-01-01)至今日(2026-08-20)的实际超工况运行情况，
 * 调用多应力Arrhenius与疲劳模型进行SOH扣减，得出评估值，并给出提前加强质保服务的处置建议。
 */
export const performInterimYearEndSohAssessment = (
  siteId: string,
  baseline: ContractBaselineCondition,
  sohBaselineCurve: SohBaselineCurvePoint[],
  dailyList: StationDailyCondition[],
  monthlyList: StationMonthlyCondition[],
  interventionMode: 'CURRENT_INERTIA' | 'CONSERVATIVE_PROTECT' | 'AGGRESSIVE_UTILIZATION' = 'CURRENT_INERTIA'
): InterimYearEndSohAssessment => {
  const currentSimYear = 2026;
  const startYear = parseInt(baseline.warrantyStartDate.slice(0, 4), 10) || 2024;
  const contractYear = currentSimYear - startYear + 1; // 3
  const contractYearLabel = `第${contractYear}合同年 (${currentSimYear}年度)`;
  const startDate = `${currentSimYear}-01-01`;
  const todayDate = `${currentSimYear}-08-20`;
  const yearEndDate = `${currentSimYear}-12-31`;

  // 筛选合同年开始至今的数据
  const yearDaily = dailyList.filter(d => d.date.startsWith(String(currentSimYear)));
  const elapsedDays = yearDaily.length || 243;
  const totalDays = 365;
  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const progressPct = +((elapsedDays / totalDays) * 100).toFixed(1);

  // 1. 合同工况基准年底预期 SOH (Year 3 基准保证值)
  const baselineCurvePoint = sohBaselineCurve.find(p => p.year === contractYear) || sohBaselineCurve[3] || {
    guaranteedSoh: 92.20
  };
  const contractBaselineExpectedYearEndSoh = baselineCurvePoint.guaranteedSoh;

  // 2. 合同年开始至今日实际超工况累计运行情况
  const tempOverLimitDays = yearDaily.filter(d => d.maxTemp > baseline.baselineTempMax).length;
  const accumulatedTempDegreeHours = +yearDaily.reduce((acc, d) => acc + d.overTempDegreeHours, 0).toFixed(1);

  const crateOverLimitDays = yearDaily.filter(d => d.maxCrate > baseline.maxCrate).length;
  const accumulatedOverCrateMwh = +yearDaily.reduce((acc, d) => acc + d.overCrateMwh, 0).toFixed(1);

  const excessCycles = +yearDaily.reduce((acc, d) => acc + d.overEfc, 0).toFixed(1);
  const dodOverLimitDays = yearDaily.filter(d => (d.dailyDod || d.avgDod) > baseline.maxDodPct).length;

  const contractPlannedSoc = baseline.plannedAvgSocPct ?? 50.0;
  const actualAvgSoc = yearDaily.length > 0
    ? +(yearDaily.reduce((acc, d) => acc + d.dailyPackAvgSoc, 0) / yearDaily.length).toFixed(1)
    : 52.8;
  const socDiff = +(actualAvgSoc - contractPlannedSoc).toFixed(1);
  const totalOverLimitCount = tempOverLimitDays + crateOverLimitDays + dodOverLimitDays + (excessCycles > 0 ? 5 : 0);

  // 3. 算法多应力 SOH 扣减模型 (基于 Arrhenius 热激活能、极化应力、高SOC日历老化、循环疲劳)
  // 超温扣减 (温度超出35℃基准线的积分效应)
  const tempStressDeductionPct = +(Math.min(0.45, (accumulatedTempDegreeHours / 400) * 0.26)).toFixed(3);
  // 超倍率极化损伤扣减
  const cratePolarizationDeductionPct = +(Math.min(0.35, (accumulatedOverCrateMwh / 600) * 0.18)).toFixed(3);
  // 高SOC日历析锂老化扣减 (实际平均SOC每高出1%，日历损耗加速)
  const highSocCalendarDeductionPct = +(Math.max(0, socDiff * 0.085)).toFixed(3);
  // 超额循环疲劳扣减
  const excessCyclesFatigueDeductionPct = +(Math.min(0.40, (excessCycles / 40) * 0.16)).toFixed(3);

  // 剩余天数 (122天) 按照运维干预模式推算预期折损
  let remainingDaysProjectedDeductionPct = 0.20;
  if (interventionMode === 'CONSERVATIVE_PROTECT') {
    remainingDaysProjectedDeductionPct = 0.08; // 降额保全、增强散热
  } else if (interventionMode === 'AGGRESSIVE_UTILIZATION') {
    remainingDaysProjectedDeductionPct = 0.42; // 继续高频现货套利
  } else {
    // 惯性延续当前趋势
    remainingDaysProjectedDeductionPct = +((remainingDays / elapsedDays) * (tempStressDeductionPct + cratePolarizationDeductionPct + excessCyclesFatigueDeductionPct)).toFixed(3);
  }

  // 综合总扣减折损 %
  const totalDeductionPct = +(
    tempStressDeductionPct +
    cratePolarizationDeductionPct +
    highSocCalendarDeductionPct +
    excessCyclesFatigueDeductionPct +
    remainingDaysProjectedDeductionPct
  ).toFixed(2);

  // 4. 临时评估得出的年底灵活质保 SOH
  const interimEvaluatedYearEndSoh = +(contractBaselineExpectedYearEndSoh - totalDeductionPct).toFixed(2);
  const sohMarginVsBaseline = +(interimEvaluatedYearEndSoh - contractBaselineExpectedYearEndSoh).toFixed(2);

  // 健康状态
  let warrantyHealthStatus: 'HEALTHY' | 'MARGINAL_RISK' | 'CRITICAL_RISK' = 'HEALTHY';
  let warrantyHealthLabel = '健康受控 (年底SOH满足合同预期)';
  if (sohMarginVsBaseline < -1.0) {
    warrantyHealthStatus = 'CRITICAL_RISK';
    warrantyHealthLabel = '严重透支预警 (需紧急介入运维保全与责任界定)';
  } else if (sohMarginVsBaseline < 0) {
    warrantyHealthStatus = 'MARGINAL_RISK';
    warrantyHealthLabel = '轻度透支边缘 (需提前加强运维调优)';
  }

  // 5. 提前加强质保服务的具体处置建议
  const proactiveServiceRecommendations: string[] = [
    `【提前预判】距第${contractYear}合同年结束尚有 ${remainingDays} 天，按合同工况年底预期SOH保证值为 ${contractBaselineExpectedYearEndSoh}%。结合年初至今实际超工况运行，累计算法扣减折损为 -${totalDeductionPct}%，临时手动评估年底灵活质保SOH为 ${interimEvaluatedYearEndSoh}% (质保裕度: ${sohMarginVsBaseline}%)。`,
    `【热管理加强】年初至今累计超温时长 ${tempOverLimitDays} 天 (超温度时 ${accumulatedTempDegreeHours} ℃·h，最高温 ${Math.max(...yearDaily.map(d => d.maxTemp), 38.6)}℃)。建议服务工程师提前对该站点液冷管路执行除垢清洗、更换冷媒滤芯，并将夏季制冷启动温差设定下调 2.0℃，消除局部热点。`,
    `【SOC与浮充控制】当前日电池PACK平均SOC为 ${actualAvgSoc}%，高于合同规划值 ${contractPlannedSoc}% (+${socDiff}%)。电芯长期处于高开路电压状态将加速正极过渡金属溶出；建议优化BMS均衡调度，非充放电待机阶段将静置SOC调降至 45%~50% 浮充窗口。`,
    `【充放电调度约束】当前超倍率吞吐已达 ${accumulatedOverCrateMwh} MWh，超额循环 ${excessCycles} EFC。建议协调调度中心在秋季负荷高峰期限制单次连续大倍率放电时长，单日等效循环控制在 1.05 EFC 以下。`,
    `【商务与服务协同】提前组织电站业主召开《第${contractYear}合同年年底质保评估碰头会》，出具本临时手动评估单，就剩余月份充放策略或超工况阶梯保障补充协议达成共识，避免年底结算发生质保违约争议。`
  ];

  return {
    assessmentId: `EVA-${siteId}-${currentSimYear}-${Date.now().toString().slice(-4)}`,
    siteId,
    contractNo: baseline.contractNo,
    contractYear,
    contractYearLabel,
    startDate,
    todayDate,
    yearEndDate,
    elapsedDays,
    remainingDays,
    progressPct,

    contractBaselineExpectedYearEndSoh,

    actualOverConditionSummary: {
      totalOverLimitCount,
      tempOverLimitDays,
      accumulatedTempDegreeHours,
      crateOverLimitDays,
      accumulatedOverCrateMwh,
      excessCycles,
      dodOverLimitDays,
      actualAvgSoc,
      contractPlannedSoc,
      socDiff
    },

    deductionBreakdown: {
      tempStressDeductionPct,
      cratePolarizationDeductionPct,
      highSocCalendarDeductionPct,
      excessCyclesFatigueDeductionPct,
      remainingDaysProjectedDeductionPct,
      totalDeductionPct
    },

    interimEvaluatedYearEndSoh,
    sohMarginVsBaseline,
    warrantyHealthStatus,
    warrantyHealthLabel,

    serviceInterventionMode: interventionMode,
    proactiveServiceRecommendations,

    evaluatedAt: new Date().toLocaleString(),
    evaluator: '质量技术部灵活质保专项组'
  };
};

// =========================================================================
// 10. 下一年工况计划模拟与灵活质保服务报价测算引擎
// =========================================================================

/**
 * 模拟评估下一年计划工况对应的年底灵活质保 SOH，并联动生成灵活质保服务报价
 */
export const simulateNextYearConditionPlan = (
  baseline: ContractBaselineCondition,
  sohBaselineCurve: SohBaselineCurvePoint[],
  planType: 'CONSERVATIVE' | 'BASELINE' | 'AGGRESSIVE' | 'CUSTOM' = 'BASELINE',
  customOverrides?: Partial<{
    plannedAnnualCycles: number;
    plannedMaxCrate: number;
    plannedMaxTemp: number;
    plannedMaxDod: number;
    plannedAvgSoc: number;
  }>
): NextYearConditionPlan => {
  const targetContractYear = 4; // 下一年: 第4合同年 (2027年度)
  const targetYearLabel = `第${targetContractYear}合同年 (2027年度)`;
  const ratedMwh = baseline.ratedEnergyMwh;

  // 第4年基准SOH保证值 (例如 90.00%)
  const baselineYearEndSoh = sohBaselineCurve.find(p => p.year === targetContractYear)?.guaranteedSoh ?? 90.00;

  let planName = '标准基准平衡型 (Baseline)';
  let plannedAnnualCycles = 365;
  let plannedMaxCrate = 0.50;
  let plannedMaxTemp = 35.0;
  let plannedAvgTemp = 25.0;
  let plannedMaxDod = 90.0;
  let plannedAvgSoc = 50.0;

  if (planType === 'CONSERVATIVE') {
    planName = '温和寿命保全型 (Conservative)';
    plannedAnnualCycles = 320;
    plannedMaxCrate = 0.40;
    plannedMaxTemp = 33.0;
    plannedAvgTemp = 23.5;
    plannedMaxDod = 85.0;
    plannedAvgSoc = 48.0;
  } else if (planType === 'AGGRESSIVE') {
    planName = '高收益电力现货调频型 (Aggressive Revenue)';
    plannedAnnualCycles = 480; // 调频双充双放
    plannedMaxCrate = 0.65;
    plannedMaxTemp = 37.5;
    plannedAvgTemp = 28.0;
    plannedMaxDod = 93.0;
    plannedAvgSoc = 54.0;
  } else if (planType === 'CUSTOM' && customOverrides) {
    planName = '定制化综合计划工况 (Customized Plan)';
    if (customOverrides.plannedAnnualCycles !== undefined) plannedAnnualCycles = customOverrides.plannedAnnualCycles;
    if (customOverrides.plannedMaxCrate !== undefined) plannedMaxCrate = customOverrides.plannedMaxCrate;
    if (customOverrides.plannedMaxTemp !== undefined) plannedMaxTemp = customOverrides.plannedMaxTemp;
    if (customOverrides.plannedMaxDod !== undefined) plannedMaxDod = customOverrides.plannedMaxDod;
    if (customOverrides.plannedAvgSoc !== undefined) plannedAvgSoc = customOverrides.plannedAvgSoc;
  }

  const plannedDailyCycles = +(plannedAnnualCycles / 365).toFixed(2);
  const plannedThroughputMwh = +(plannedAnnualCycles * 2 * ratedMwh).toFixed(1);

  // 算法估算下一年年底灵活质保 SOH
  // 加速老化因子计算
  const cycleFactor = plannedAnnualCycles / 365; // e.g. 1.0 or 1.315
  const tempFactor = plannedMaxTemp > 35 ? 1 + ((plannedMaxTemp - 35) / 10) * 0.45 : 1.0;
  const crateFactor = plannedMaxCrate > 0.5 ? 1 + ((plannedMaxCrate - 0.5) / 0.5) * 0.35 : 1.0;
  const socFactor = plannedAvgSoc > 50 ? 1 + ((plannedAvgSoc - 50) / 50) * 0.25 : 1.0;
  const accelerationFactor = +(cycleFactor * tempFactor * crateFactor * socFactor).toFixed(2);

  // 标称第4年自然衰减量 = SOH(Year 3: 92.2) - SOH(Year 4: 90.0) = 2.2%
  const yearNaturalLoss = 2.20;
  const projectedLoss = +(yearNaturalLoss * accelerationFactor).toFixed(2);
  const previousYearEndSoh = sohBaselineCurve.find(p => p.year === 3)?.guaranteedSoh ?? 92.20;
  const projectedYearEndFlexibleSoh = +(previousYearEndSoh - projectedLoss).toFixed(2);
  const projectedSohDelta = +(projectedYearEndFlexibleSoh - baselineYearEndSoh).toFixed(2);

  // 综合灵活质保服务报价测算模型 (万元/年)
  // 1. 基础智能运维与质保服务费: 与装机容量挂钩
  const baseServiceFeeWan = +(ratedMwh * 1.3).toFixed(1); // 20MWh -> 26.0 万元/年
  // 2. 超工况风险保障附加费: 若计划工况超过基准(倍率>0.5C或循环>365或温度>35℃)，按阶梯加收风险兜底费
  const excessCycleRatio = Math.max(0, (plannedAnnualCycles - 365) / 365);
  const excessCrateRatio = Math.max(0, (plannedMaxCrate - 0.5) / 0.5);
  const excessTempRatio = Math.max(0, (plannedMaxTemp - 35) / 35);
  const excessStressSurchargeWan = +(
    baseServiceFeeWan * (excessCycleRatio * 0.65 + excessCrateRatio * 0.45 + excessTempRatio * 0.3)
  ).toFixed(1);

  // 3. 衰减容量维护及备件调优储备金 (当预估SOH低于基准时计提)
  const extendedCapacityReserveWan = projectedSohDelta < 0
    ? +(Math.abs(projectedSohDelta) * ratedMwh * 0.18).toFixed(1)
    : 0;

  const totalAnnualServiceFeeWan = +(
    baseServiceFeeWan + excessStressSurchargeWan + extendedCapacityReserveWan
  ).toFixed(1);

  // 客户预期电力现货/峰谷套利收益测算 (假设平均峰谷价差 0.70 元/kWh)
  const arbitrageSpreadYuanPerKwh = 0.68;
  const customerExpectedRevenueWan = +(
    (plannedThroughputMwh * 1000 * arbitrageSpreadYuanPerKwh * 0.88) / 10000
  ).toFixed(1);

  const customerNetGainWan = +(customerExpectedRevenueWan - totalAnnualServiceFeeWan).toFixed(1);
  const costBenefitRatio = +(customerExpectedRevenueWan / totalAnnualServiceFeeWan).toFixed(2);

  return {
    planId: `PLAN-Y4-${planType.toLowerCase()}`,
    planName,
    planType,
    targetContractYear,
    targetYearLabel,

    plannedAnnualCycles,
    plannedDailyCycles,
    plannedMaxCrate,
    plannedMaxTemp,
    plannedAvgTemp,
    plannedMaxDod,
    plannedAvgSoc,
    plannedThroughputMwh,

    baselineYearEndSoh,
    projectedYearEndFlexibleSoh,
    projectedSohDelta,
    accelerationFactor,

    servicePricing: {
      baseServiceFeeWan,
      excessStressSurchargeWan,
      extendedCapacityReserveWan,
      totalAnnualServiceFeeWan,
      customerExpectedRevenueWan,
      customerNetGainWan,
      costBenefitRatio
    },

    isConfirmedAsOfficialPlan: planType === 'BASELINE'
  };
};


