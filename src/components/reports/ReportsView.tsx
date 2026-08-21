import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Eye,
  X
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sites, contracts } = useApp();

  const [reportType, setReportType] = useState('monthly_network');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0].id);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [isGenerating, setIsGenerating] = useState(false);

  // Preview modal
  const [previewReport, setPreviewReport] = useState<any | null>(null);

  // Mock reports history
  const [reportsList, setReportsList] = useState([
    {
      id: 'rep-001',
      title: '2026年08月全网能源站点可用度与SLA履约月报',
      type: '月度全网报告',
      target: '全网 (4大区域 38,420 站)',
      format: 'PDF',
      createdTime: '2026-08-20 16:30',
      author: '系统自动任务',
      fileSize: '4.8 MB'
    },
    {
      id: 'rep-002',
      title: '华东区-宝武钢铁微电网储能站 8月可用度专项诊断报告',
      type: '单站点诊断报告',
      target: '宝武钢铁1号储能站 (SZ-ESS-0001)',
      format: 'PDF',
      createdTime: '2026-08-20 14:15',
      author: '张伟 (可用度管理员)',
      fileSize: '2.3 MB'
    },
    {
      id: 'rep-003',
      title: '华南区-国家电网集中式储能站 7月SLA履约结算报告',
      type: '合同履约报告',
      target: '国家电网有限公司 (HT-2026-CS-0089)',
      format: 'Excel',
      createdTime: '2026-08-01 09:00',
      author: '李敏 (销售支持)',
      fileSize: '1.6 MB'
    },
    {
      id: 'rep-004',
      title: '拟签约江苏常州金坛光储示范站 可用度签约前评估意见书',
      type: '签约前评估报告',
      target: '华能江苏清洁能源',
      format: 'PDF',
      createdTime: '2026-07-28 11:20',
      author: '王强 (资深方案架构师)',
      fileSize: '3.1 MB'
    }
  ]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newReport = {
        id: `rep-${Date.now()}`,
        title:
          reportType === 'monthly_network'
            ? `${selectedMonth} 全网能源站点可用度综合运营报告`
            : `${sites.find(s => s.id === selectedSiteId)?.siteName} 可用度诊断报告`,
        type: reportType === 'monthly_network' ? '月度全网报告' : '单站点诊断报告',
        target:
          reportType === 'monthly_network'
            ? '全网站点'
            : sites.find(s => s.id === selectedSiteId)?.siteName || '目标站点',
        format: 'PDF',
        createdTime: '刚刚',
        author: '张伟 (可用度管理员)',
        fileSize: '3.5 MB'
      };
      setReportsList([newReport, ...reportsList]);
      setPreviewReport(newReport);
    }, 600);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              可用度统计与诊断报告生成中心
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            一键自动聚合生成月度可用度运营报告、单站点故障诊断报告与销售签约前评估报告，口径统一标准规范。
          </p>
        </div>
      </div>

      {/* Generator Configuration Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          报告智能生成配置
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-medium mb-1">选择报告模板类型</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="monthly_network">全网可用度运营月报 (管理层/客户汇报)</option>
              <option value="site_diagnosis">单站点深度诊断分析报告 (含故障时间线)</option>
              <option value="pre_contract">销售签约前可用度参考评估报告 (风控决策)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">报告考核周期</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="2026-08">2026年08月 (当期)</option>
              <option value="2026-07">2026年07月</option>
              <option value="2026-06">2026年06月</option>
            </select>
          </div>

          {reportType === 'site_diagnosis' && (
            <div>
              <label className="block text-slate-700 font-medium mb-1">选择目标站点</label>
              <select
                value={selectedSiteId}
                onChange={e => setSelectedSiteId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.siteName} ({s.siteCode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm flex items-center gap-2 text-xs transition-colors"
          >
            {isGenerating ? (
              <span>正在汇聚数据并渲染排版...</span>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>一键聚合生成标准报告</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Historical Generated Reports Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            历史报告归档库 (共 {reportsList.length} 份)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">报告名称</th>
                <th className="py-3 px-3">类型</th>
                <th className="py-3 px-3">涉及对象</th>
                <th className="py-3 px-3">格式 / 大小</th>
                <th className="py-3 px-3">生成时间</th>
                <th className="py-3 px-3">生成人</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportsList.map(rep => (
                <tr key={rep.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{rep.title}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                      {rep.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{rep.target}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">{rep.format}</span> ({rep.fileSize})
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {rep.createdTime}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{rep.author}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setPreviewReport(rep)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                    >
                      <Eye className="w-3 h-3 inline mr-1 text-slate-500" />
                      预览
                    </button>
                    <button
                      onClick={() => alert(`已下载报告: ${rep.title}`)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200"
                    >
                      <Download className="w-3 h-3 inline mr-1 text-blue-600" />
                      下载
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Report Preview */}
      {previewReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{previewReport.title}</h3>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs space-y-4 p-5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-sans">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-base font-bold text-slate-900">{previewReport.title}</h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  生成时间: {previewReport.createdTime} · 编制单位: 能源云可用度管理技术委员会
                </p>
              </div>

              <div>
                <h4 className="font-bold text-blue-700 mb-1">一、 核心指标执行摘要</h4>
                <p>
                  本考核周期内全网纳管站点运行稳定，本月全网综合可用度达成 <strong>99.42%</strong>，超越 SLA 承诺基线 (99.20%) 0.22 个百分点。全网 SLA 达标率 97.8%，总等效 PCS 中断时长为 840.2 小时。
                </p>
              </div>

              <div>
                <h4 className="font-bold text-blue-700 mb-1">二、 异常与风险站点归因分析 (Rule R11)</h4>
                <p>
                  未达标站点主要集中于西北区域高寒高海拔微网站点，主要原因为变流器 IGBT 驱动模块单板过温及现场备件调拨耗时较长。已联动 PCare 系统触发加急响应机制，闭环修复 MTTR 已压降至 3.4 小时以内。
                </p>
              </div>

              <div>
                <h4 className="font-bold text-blue-700 mb-1">三、 改进与冗余组网升级建议</h4>
                <p>
                  建议针对重要工业园区客户推进【双机热备】与【光纤环网】改造，经签约前模型评估预测，组网升级后站点可靠性综合得分可提升 18.5 分，违约索赔风险将降低 70% 以上。
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium"
              >
                关闭预览
              </button>
              <button
                onClick={() => {
                  alert(`已成功下载: ${previewReport.title}`);
                  setPreviewReport(null);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>立即下载 PDF 文档</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
