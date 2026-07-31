import React, { useState } from 'react';
import { Download, Copy, Check, Search, RefreshCw, AlertTriangle, CheckCircle2, Filter, FileSpreadsheet, Printer, Trash2, Edit3, ArrowUpDown } from 'lucide-react';
import { GenerationResult, SystemConfig } from '../types';
import { calcNeisBytes, getByteStatus, getByteBadgeStyle } from '../utils/byteCalculator';
import { exportToExcel } from '../utils/fileParser';

interface ResultsTabProps {
  results: GenerationResult[];
  setResults: React.Dispatch<React.SetStateAction<GenerationResult[]>>;
  config: SystemConfig;
  onRegenerateSingle: (studentId: string, name: string, activityData: string) => Promise<void>;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  results,
  setResults,
  config,
  onRegenerateSingle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'optimal' | 'under' | 'over'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Record<string, boolean>>({});

  // Real-time byte calculation and content edit
  const handleContentChange = (index: number, newText: string) => {
    const updated = [...results];
    updated[index] = {
      ...updated[index],
      content: newText,
      bytes: calcNeisBytes(newText)
    };
    setResults(updated);
  };

  const handleCopySingle = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    if (results.length === 0) return;
    const textAll = results
      .map(r => `[${r.studentId} ${r.name}]\n${r.content}\n(${r.bytes} Byte)`)
      .join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

    navigator.clipboard.writeText(textAll);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadExcel = () => {
    if (results.length === 0) return;
    const exportData = results.map(r => ({
      studentId: r.studentId,
      content: r.content
    }));
    exportToExcel(exportData, `NEIS_${config.subject}_과세특_최종결과.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSingleRegenerate = async (res: GenerationResult) => {
    setRegeneratingIds(prev => ({ ...prev, [res.studentId]: true }));
    try {
      await onRegenerateSingle(res.studentId, res.name, res.activityData);
    } finally {
      setRegeneratingIds(prev => ({ ...prev, [res.studentId]: false }));
    }
  };

  const handleDelete = (studentId: string) => {
    setResults(prev => prev.filter(r => r.studentId !== studentId));
  };

  // Filtered list
  const filteredResults = results.filter(r => {
    const matchesSearch =
      r.studentId.includes(searchTerm) ||
      r.name.includes(searchTerm) ||
      r.content.includes(searchTerm);

    const status = getByteStatus(r.bytes, config.targetMinBytes, config.targetMaxBytes);
    if (filterStatus === 'optimal') return matchesSearch && status === 'optimal';
    if (filterStatus === 'under') return matchesSearch && status === 'under';
    if (filterStatus === 'over') return matchesSearch && status === 'over';

    return matchesSearch;
  });

  // Stats
  const totalCount = results.length;
  const optimalCount = results.filter(r => getByteStatus(r.bytes) === 'optimal').length;
  const underCount = results.filter(r => getByteStatus(r.bytes) === 'under').length;
  const overCount = results.filter(r => getByteStatus(r.bytes) === 'over').length;

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1F497D] p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">생성된 결과가 없습니다</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
          첫 번째 탭('📁 데이터 업로드 및 생성')에서 학생 활동 자료 업로드 후 과세특 일괄 생성을 진행해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 border-t-4 border-t-[#1F497D] shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">총 학생 수</span>
          <span className="text-2xl font-bold text-[#1F497D] mt-1 block">{totalCount}명</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 border-t-4 border-t-emerald-600 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">목표 달성 (1,400~1,500 B)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-700">{optimalCount}명</span>
            <span className="text-xs text-slate-400">
              ({totalCount > 0 ? Math.round((optimalCount / totalCount) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 border-t-4 border-t-amber-500 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">목표 미달 (&lt;1,400 B)</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{underCount}명</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 border-t-4 border-t-red-600 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">한도 초과 (&gt;1,500 B)</span>
          <span className="text-2xl font-bold text-red-600 mt-1 block">{overCount}명</span>
        </div>
      </div>

      {/* Control & Export Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="학번, 이름 또는 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-md bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#1F497D] outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#1F497D] outline-none"
          >
            <option value="all">전체 상태 ({totalCount})</option>
            <option value="optimal">적정 1,400~1,500B ({optimalCount})</option>
            <option value="under">미달 &lt;1,400B ({underCount})</option>
            <option value="over">초과 &gt;1,500B ({overCount})</option>
          </select>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleCopyAll}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-bold transition flex items-center gap-1.5"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? '전체 복사됨!' : '전체 복사'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>

          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-[#1F497D] hover:bg-[#17375E] text-white rounded-md text-xs font-bold transition shadow flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-amber-300" />
            📥 제출용 엑셀 다운로드 (.xlsx)
          </button>
        </div>
      </div>

      {/* Main Results Table & Live Editor */}
      <div className="space-y-4">
        {filteredResults.map((result, idx) => {
          const originalIndex = results.findIndex(r => r.studentId === result.studentId);
          const bytes = result.bytes;
          const status = getByteStatus(bytes, config.targetMinBytes, config.targetMaxBytes);
          const isRegenerating = regeneratingIds[result.studentId];

          return (
            <div
              key={result.studentId}
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 bg-slate-200/80 px-2.5 py-1 rounded text-xs">
                    {result.studentId}
                  </span>
                  <span className="font-bold text-[#1F497D] text-sm">
                    {result.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({config.subject}과세특)
                  </span>
                </div>

                {/* Realtime Byte Status Badge & Gauge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">
                        용량(Byte):
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {bytes} B
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getByteBadgeStyle(status)}`}
                      >
                        {status === 'optimal' && '적정 (1400~1500B)'}
                        {status === 'under' && '미달 (사실근거 유지)'}
                        {status === 'over' && '한도 초과 (>1500B)'}
                      </span>
                    </div>

                    {/* Byte Gauge Bar */}
                    <div className="w-40 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                      <div
                        className={`h-full transition-all duration-300 ${
                          status === 'optimal'
                            ? 'bg-emerald-500'
                            : status === 'over'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (bytes / 1500) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-2">
                    <button
                      disabled={isRegenerating}
                      onClick={() => handleSingleRegenerate(result)}
                      className="p-1.5 text-slate-600 hover:text-[#1F497D] hover:bg-sky-50 rounded transition text-xs font-semibold flex items-center gap-1"
                      title="AI 재작성"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      재생성
                    </button>

                    <button
                      onClick={() => handleCopySingle(result.content, originalIndex)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition text-xs font-semibold flex items-center gap-1"
                      title="클립보드 복사"
                    >
                      {copiedIndex === originalIndex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      복사
                    </button>

                    <button
                      onClick={() => handleDelete(result.studentId)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable Text Area & Activity Context Drawer */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> 과목별 세부능력 및 특기사항 (실시간 타이핑 수정 가능)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      글자수: {result.content.length}자 | 바이트: {bytes} / 1500 Byte
                    </span>
                  </div>

                  <textarea
                    value={result.content}
                    onChange={(e) => handleContentChange(originalIndex, e.target.value)}
                    rows={6}
                    className="w-full text-xs sm:text-sm font-sans leading-relaxed p-3 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none resize-y"
                  />
                </div>

                {/* Original Activity Source Context Collapsible */}
                <details className="text-xs border-t border-slate-100 pt-2">
                  <summary className="cursor-pointer text-slate-500 hover:text-slate-800 font-semibold select-none">
                    📌 참고 원본 활동 자료 보기
                  </summary>
                  <pre className="mt-2 p-2.5 bg-slate-100 rounded text-[11px] text-slate-700 whitespace-pre-wrap font-sans border border-slate-200">
                    {result.activityData}
                  </pre>
                </details>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
