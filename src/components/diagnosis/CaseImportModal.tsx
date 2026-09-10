import React, { useState } from 'react';
import { SimilarCase } from '../../types/faultDiagnosis';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface CaseImportModalProps {
  onClose: () => void;
  onImportSuccess: (cases: SimilarCase[]) => void;
}

export const CaseImportModal: React.FC<CaseImportModalProps> = ({
  onClose,
  onImportSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewCases, setPreviewCases] = useState<Partial<SimilarCase>[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsParsing(true);
      setTimeout(() => {
        setIsParsing(false);
        setPreviewCases([
          {
            title: '华东某微电网 3# 变流器滤波电容容量衰减引发谐波超标跳脱',
            siteName: '华东某微电网示范站',
            deviceModel: 'PCS-500k-LV',
            faultCategory: '硬件老化',
            rootCause: '滤波薄膜电容连续高温运行容量衰减 18%，总谐波失真 THDu 达到 6.8% 触发防孤岛保护',
            symptomDescription: '并网交流电压畸变率报越限，变流器频繁离线',
            resolutionSteps: '更换滤波电容器组并加装导流散热隔板',
            outcome: 'THDu 降至 1.4%，连续运行正常',
            mttrMinutes: 90
          },
          {
            title: '新疆达坂城储能站低温启动电池加热膜断路致充电机不工作',
            siteName: '新疆达坂城储能电站',
            deviceModel: 'BMS-HV-800V',
            faultCategory: '温控失效',
            rootCause: 'PTC 辅助加热回路继电器接点积炭接触不良，电池包温度低于 -10℃ 触发低温充放电封锁',
            symptomDescription: '清晨调度功率下发失败，BMS 报“电芯温度过低禁止充电”',
            resolutionSteps: '更换密封继电器并执行整簇预热自检',
            outcome: '模组平稳预热至 15℃，恢复充放电',
            mttrMinutes: 60
          }
        ]);
      }, 600);
    }
  };

  const handleConfirmImport = () => {
    const imported: SimilarCase[] = previewCases.map((c, i) => ({
      id: `case-imported-${Date.now()}-${i}`,
      caseNo: `CASE-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-0${Math.floor(20 + Math.random() * 80)}`,
      title: c.title || '批量导入故障案例',
      siteName: c.siteName || '历史储能站点',
      deviceModel: c.deviceModel || '标准储能设备',
      faultCategory: c.faultCategory || '一般工况故障',
      rootCause: c.rootCause || '待补充现场根因',
      symptomDescription: c.symptomDescription || '历史告警记录',
      resolutionSteps: c.resolutionSteps || '按照标准作业规范处理',
      outcome: c.outcome || '消缺验证正常',
      mttrMinutes: c.mttrMinutes || 60,
      similarityScore: 85,
      matchDimensions: ['历史工况重合', '同类型部件'],
      source: 'HISTORICAL_IMPORT',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      createdBy: '批量导入引擎'
    }));

    onImportSuccess(imported);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">线下历史故障案例批量导入</h3>
              <div className="text-[11px] text-slate-400">支持 Excel (.xlsx) 与 CSV 数据集模板</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 transition">
            <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <span className="font-bold text-slate-700">点击选择或将案例台账 Excel 文件拖拽到此处</span>
            <p className="text-[11px] text-slate-400 mt-1">包含站点名、设备型号、故障现象、根因、处理方案、耗时等字段</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              id="case-file-input"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="case-file-input"
              className="mt-3 inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-indigo-700"
            >
              浏览文件
            </label>
          </div>

          {selectedFile && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-indigo-900 font-mono">
                已选中: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 校验通过
              </span>
            </div>
          )}

          {previewCases.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">数据解析预览 ({previewCases.length} 条有效案例):</span>
              <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
                {previewCases.map((c, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] space-y-0.5">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-slate-500 font-mono">站点: {c.siteName} · 部件: {c.deviceModel}</div>
                    <div className="text-slate-600 line-clamp-1">根因: {c.rootCause}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            取消
          </button>
          <button
            disabled={previewCases.length === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
          >
            确认并导入案例库
          </button>
        </div>
      </div>
    </div>
  );
};
