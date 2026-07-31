import React from 'react';
import { School, BookOpen, CheckCircle2, ShieldCheck, Sparkles, Key, Lock, Check } from 'lucide-react';

interface HeaderProps {
  activeTab: 'upload' | 'results' | 'rules';
  setActiveTab: (tab: 'upload' | 'results' | 'rules') => void;
  resultCount: number;
  configOpen: boolean;
  setConfigOpen: (open: boolean) => void;
  setApiKeyModalOpen: (open: boolean) => void;
  hasCustomApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  resultCount,
  setConfigOpen,
  setApiKeyModalOpen,
  hasCustomApiKey
}) => {
  return (
    <header className="bg-[#1F497D] text-white shadow-md border-b-4 border-[#17375E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Organization Info */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <School className="w-7 h-7 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-500/30 text-sky-100 text-xs px-2 py-0.5 rounded font-medium border border-sky-300/30">
                  NEIS 전용
                </span>
                <span className="bg-emerald-500/30 text-emerald-200 text-xs px-2 py-0.5 rounded font-medium border border-emerald-300/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 교육부 훈령 기재요령 준수
                </span>
                <span className="bg-amber-500/30 text-amber-100 text-xs px-2 py-0.5 rounded font-medium border border-amber-300/30">
                  고등학교 수학과 특화
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                나이스(NEIS) 과목별 세부능력 및 특기사항 생성 시스템
              </h1>
              <p className="text-xs text-sky-100/90 mt-0.5">
                사실 기반 관찰 기록 · Excel 수식(=LENB*2-LEN) 바이트 측정 · 1,400~1,500 Byte 표준
              </p>
            </div>
          </div>

          {/* Action Buttons & Config Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition border ${
                hasCustomApiKey
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-100 border-amber-400/40 hover:bg-amber-500/30'
              }`}
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span>외장 API 키 설정</span>
              {hasCustomApiKey ? (
                <span className="bg-emerald-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  로컬 암호화 적용됨
                </span>
              ) : (
                <span className="bg-amber-400/30 text-amber-200 text-[10px] px-1.5 py-0.2 rounded">
                  서버 연동 / 등록 가능
                </span>
              )}
            </button>

            <button
              onClick={() => setConfigOpen(true)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              시스템 설정 및 프롬프트
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-5 border-t border-white/15 pt-3">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-white text-[#1F497D] shadow-sm'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. 데이터 업로드 및 생성
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 relative ${
              activeTab === 'results'
                ? 'bg-white text-[#1F497D] shadow-sm'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            2. 최종 결과 확인 및 편집
            {resultCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-400 text-slate-900 font-bold">
                {resultCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-white text-[#1F497D] shadow-sm'
                : 'text-sky-100 hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            NEIS 기재규정 가이드
          </button>
        </div>
      </div>
    </header>
  );
};
