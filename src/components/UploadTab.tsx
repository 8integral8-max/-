import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Plus, Trash2, Sparkles, AlertCircle, RefreshCw, Square, CheckCircle, FileText, UserPlus } from 'lucide-react';
import { StudentRecord, GenerationResult, SystemConfig } from '../types';
import { parseUploadedFiles } from '../utils/fileParser';
import { SAMPLE_STUDENTS } from '../data/sampleStudents';

interface UploadTabProps {
  students: StudentRecord[];
  setStudents: React.Dispatch<React.SetStateAction<StudentRecord[]>>;
  config: SystemConfig;
  onStartGeneration: () => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  progressCurrent: number;
  progressTotal: number;
  currentStudentInfo: string;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  students,
  setStudents,
  config,
  onStartGeneration,
  isGenerating,
  onStopGeneration,
  progressCurrent,
  progressTotal,
  currentStudentInfo
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual entry modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualActivity, setManualActivity] = useState('');

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsParsing(true);
    try {
      const parsed = await parseUploadedFiles(Array.from(files));
      if (parsed.length > 0) {
        setStudents(prev => {
          // Merge by studentId + name
          const existingMap = new Map<string, StudentRecord>();
          prev.forEach(s => existingMap.set(`${s.studentId}_${s.name}`, s));

          parsed.forEach(p => {
            const key = `${p.studentId}_${p.name}`;
            if (existingMap.has(key)) {
              const existing = existingMap.get(key)!;
              existingMap.set(key, {
                ...existing,
                activityData: existing.activityData + '\n' + p.activityData
              });
            } else {
              existingMap.set(key, p);
            }
          });

          return Array.from(existingMap.values());
        });
      }
    } catch (err) {
      console.error('File parsing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleLoadSample = () => {
    setStudents(SAMPLE_STUDENTS);
  };

  const handleClearStudents = () => {
    if (window.confirm('등록된 학생 목록을 모두 삭제하시겠습니까?')) {
      setStudents([]);
    }
  };

  const handleAddManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualActivity.trim()) return;

    const newStudent: StudentRecord = {
      id: `manual-${Date.now()}`,
      studentId: manualId.trim() || '미지정',
      name: manualName.trim() || '미지정',
      activityData: manualActivity.trim()
    };

    setStudents(prev => [...prev, newStudent]);
    setManualId('');
    setManualName('');
    setManualActivity('');
    setShowManualModal(false);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateActivity = (id: string, text: string) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, activityData: text } : s))
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Step 1: File Upload Box */}
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1F497D] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#1F497D]" />
              1. 학생 활동 자료 파일 업로드
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Excel (.xlsx, .xls), CSV, TXT 파일 지원 (다중 파일 업로드 가능 / 동일 학생 자동 병합)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#1F497D] border border-sky-200 rounded-md text-xs font-bold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              샘플 데이터 불러오기 (5명)
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-xs font-bold transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              학생 직접 추가
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragging
              ? 'border-[#1F497D] bg-sky-50/80 scale-[1.005]'
              : 'border-slate-300 hover:border-[#1F497D] bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.txt"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 bg-sky-100 text-[#1F497D] rounded-full flex items-center justify-center mx-auto mb-3">
              {isParsing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <p className="text-sm font-bold text-slate-700">
              {isParsing
                ? '파일을 해석 중입니다...'
                : '클릭하여 파일 선택 또는 파일들을 이곳으로 드래그 앤 드롭'}
            </p>
            <p className="text-xs text-slate-500">
              필수 컬럼: <span className="font-semibold text-slate-700">학번</span>, <span className="font-semibold text-slate-700">이름</span>, <span className="font-semibold text-slate-700">활동자료</span> (자동 컬럼 인식)
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Consolidated Student Data Preview */}
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1F497D] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              2. 학번/이름 기준 통합 데이터 확인
            </h2>
            <span className="bg-sky-100 text-[#1F497D] text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200">
              총 {students.length}명
            </span>
          </div>

          {students.length > 0 && (
            <button
              onClick={handleClearStudents}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> 전체 목록 초기화
            </button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            등록된 학생 데이터가 없습니다. 상단에 파일을 업로드하거나 '샘플 데이터 불러오기'를 눌러주세요.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs text-left text-slate-700 border-collapse">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">번호</th>
                  <th className="px-4 py-3 w-24">학번</th>
                  <th className="px-4 py-3 w-28">이름</th>
                  <th className="px-4 py-3">학생 활동 자료 (수업 관찰 / 발표 / 산출물 / 독서 등)</th>
                  <th className="px-4 py-3 w-16 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#1F497D] whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-4 py-3">
                      <textarea
                        value={student.activityData}
                        onChange={(e) => handleUpdateActivity(student.id, e.target.value)}
                        rows={2}
                        className="w-full text-xs p-1.5 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#1F497D] outline-none resize-y"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition rounded"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Generation Trigger & Stop Controls */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            적용 교과: <span className="font-bold text-slate-800">{config.subject}</span> | 적용 모델:{' '}
            <span className="font-bold text-[#1F497D]">
              {config.modelName === 'gemini-3.1-pro' ? 'Gemini 3.1 Pro' : 'Gemini 3.6 Flash'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-sm transition shadow flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" />
                생성 중단 (Stop)
              </button>
            ) : (
              <button
                disabled={students.length === 0}
                onClick={onStartGeneration}
                className={`w-full sm:w-auto px-8 py-3 rounded-md font-bold text-sm text-white shadow transition flex items-center justify-center gap-2 ${
                  students.length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-[#1F497D] hover:bg-[#17375E] active:scale-[0.99]'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                🚀 과세특 일괄 생성 ({students.length}명)
              </button>
            )}
          </div>
        </div>

        {/* Generation Progress Bar & Status Monitor */}
        {isGenerating && (
          <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F497D]">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                {currentStudentInfo || '과세특 AI 생성 진행 중...'}
              </span>
              <span>
                {progressCurrent} / {progressTotal} 명 ({Math.round((progressCurrent / progressTotal) * 100)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-sky-200 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#1F497D] h-full transition-all duration-300 ease-out"
                style={{ width: `${(progressCurrent / progressTotal) * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500">
              ※ 교육부 훈령(1,400~1,500 Byte)에 맞춰 관찰 사실 중심으로 신중히 생성 중입니다.
            </p>
          </div>
        )}

      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#1F497D] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> 학생 직접 등록
              </h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualStudent} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    학번 (예: 10101)
                  </label>
                  <input
                    type="text"
                    required
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="10101"
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    이름 (예: 홍길동)
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학생 활동 자료 (수업 관찰 / 발표 / 보고서 / 특기사항)
                </label>
                <textarea
                  required
                  rows={4}
                  value={manualActivity}
                  onChange={(e) => setManualActivity(e.target.value)}
                  placeholder="예: 미적분 최적화 문제 탐구 보고서 작성 및 발표. GeoGebra 활용 곡선 시각화..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1F497D] text-white text-xs font-bold rounded hover:bg-[#17375E]"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
