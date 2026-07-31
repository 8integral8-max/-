import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SystemConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  setConfig
}) => {
  if (!isOpen) return null;

  const [subject, setSubject] = useState(config.subject);
  const [modelName, setModelName] = useState(config.modelName);
  const [targetMin, setTargetMin] = useState(config.targetMinBytes);
  const [targetMax, setTargetMax] = useState(config.targetMaxBytes);
  const [customPrompt, setCustomPrompt] = useState(config.customPrompt || '');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setConfig({
      subject,
      modelName,
      targetMinBytes: Number(targetMin),
      targetMaxBytes: Number(targetMax),
      customPrompt: customPrompt.trim() || undefined
    });
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setSubject('수학');
    setModelName('gemini-3.6-flash');
    setTargetMin(1400);
    setTargetMax(1500);
    setCustomPrompt('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-[#1F497D] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-300" />
            <h3 className="text-lg font-bold">NEIS AI 생성 시스템 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Subject & Model Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                담당 교과목
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none"
              >
                <option value="수학">수학 (기본/공통/미적분/확통/기하)</option>
                <option value="국어">국어 (화법과작문/독서/언어와매체/문학)</option>
                <option value="영어">영어 (영어I/영어II/영어회화/영어독해)</option>
                <option value="한국사">한국사</option>
                <option value="사회">사회 (통합사회/세계지리/동아시아사/윤리와사상)</option>
                <option value="과학">과학 (물리학/화학/생명과학/지구과학)</option>
                <option value="정보">정보 / 인공지능 기초</option>
                <option value="기타">기타 교과</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                적용 AI 모델
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none"
              >
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (빠르고 표준적인 과세특 생성)</option>
                <option value="gemini-3.1-pro">Gemini 3.1 Pro (심층 추론 및 정교한 문장 구사)</option>
              </select>
            </div>
          </div>

          {/* Target Byte Range */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              목표 바이트 범위 (NEIS LENB 기준)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">최소 목표 (Byte)</span>
                <input
                  type="number"
                  value={targetMin}
                  onChange={(e) => setTargetMin(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none"
                />
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">최대 한도 (Byte)</span>
                <input
                  type="number"
                  value={targetMax}
                  onChange={(e) => setTargetMax(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              ※ 나이스(NEIS) 과목별 세부능력 및 특기사항 한도는 1,500 Byte입니다. (목표: 1,450 Byte 내외)
            </p>
          </div>

          {/* System Prompt View & Customize */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                시스템 프롬프트 (교사용 지침)
              </label>
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
              >
                <RotateCcw className="w-3 h-3" /> 기본값 복원
              </button>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="비워둘 경우 교육부 훈령 기재요령을 완벽 준수하는 표준 지침이 자동 적용됩니다."
              rows={8}
              className="w-full text-xs font-mono border border-slate-300 rounded-md p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1F497D] outline-none resize-y"
            />
          </div>

          {/* Guidelines Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              교육부 훈령 핵심 금지사항 체크리스트
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              <li>주관적 찬사(우수함, 탁월함, 뛰어남 등) 절대 사용하지 않음</li>
              <li>공인어학시험, 민간/국가 인증시험, 교외 대회/수상 내역 기재 금지</li>
              <li>학부모 직업, 사설 학원/기관명, 구체적 상표명(구글, 유튜브 등) 변환 사용</li>
              <li>학생 내면 단정('~라고 생각함', '~를 깨달음') 금지 ➔ 관찰된 행위 서술</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {savedMessage && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 설정이 저장되었습니다.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#1F497D] hover:bg-[#17375E] text-white rounded-md text-sm font-bold transition shadow-sm"
            >
              설정 저장
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
