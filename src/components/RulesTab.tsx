import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, FileText, Sparkles, HelpCircle } from 'lucide-react';

export const RulesTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-lg border border-slate-200 border-t-4 border-t-[#1F497D] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-sky-100 text-[#1F497D] rounded-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              교육부 훈령 「학교생활기록부 기재요령」 완벽 안내
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              본 AI 시스템은 대한민국 교육부 훈령 기재 기준 및 과목별 세부능력 및 특기사항 작성 원칙을 철저히 반영하여 설계되었습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 8 Golden Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Rule 1 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F497D]">
            <span className="w-6 h-6 rounded-full bg-[#1F497D] text-white flex items-center justify-center text-xs">
              1
            </span>
            철저한 관찰자 시점 서술 (내면 단정 금지)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            교사는 관찰 가능한 행동, 발화, 질문, 발표, 보고서, 협업 태도만 기록합니다. '~라고 생각함', '~를 깊이 깨달음', '~에 흥미를 느낌'과 같은 내면 추측은 엄격히 금지됩니다.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F497D]">
            <span className="w-6 h-6 rounded-full bg-[#1F497D] text-white flex items-center justify-center text-xs">
              2
            </span>
            사실 근거 기반 서술 (허위·과장 절대 차단)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            제공된 자료에 존재하는 활동만 기록합니다. 분량을 채우기 위해 없는 사실을 허위로 창작하는 것은 가장 중대한 왜곡으로 간주됩니다.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F497D]">
            <span className="w-6 h-6 rounded-full bg-[#1F497D] text-white flex items-center justify-center text-xs">
              3
            </span>
            주관적 찬사 표현 전면 금지
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            '우수함', '탁월함', '뛰어남', '훌륭함', '독보적임' 등의 감정적 평가 단어는 기재하지 않으며, 구체적 산출물과 수학적 증명 과정 등의 행동으로 대체합니다.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F497D]">
            <span className="w-6 h-6 rounded-full bg-[#1F497D] text-white flex items-center justify-center text-xs">
              4
            </span>
            용어 변환 규정 (사설 상표명/기관명 은어화)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            구글/네이버 ➔ '인터넷 포털사이트', 유튜브 ➔ '동영상 공유 서비스', 챗GPT ➔ '대화형 인공지능 서비스', 지오지브라/데스모스 ➔ '수학공학용 도구'로 변환합니다.
          </p>
        </div>

        {/* Rule 5 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F497D]">
            <span className="w-6 h-6 rounded-full bg-[#1F497D] text-white flex items-center justify-center text-xs">
              5
            </span>
            문체 및 종결어미 규정
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            모든 문장은 명사형 종결어미('...함', '...임', '...보임', '...기여함')로 마쳐야 합니다. 다정체(~했습니다)나 경어체는 사용할 수 없습니다.
          </p>
        </div>

        {/* Rule 6 */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1F497D]">
            <span className="w-6 h-6 rounded-full bg-[#1F497D] text-white flex items-center justify-center text-xs">
              6
            </span>
            기재 불가 항목 (감점 및 불이익 제재 대상)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            공인어학시험, 민간/국가 자격증, 교외 대회 수상, 논문/출판물, 해외 봉사활동, 부모 직업, 사설 학원 및 대학 연계 프로그램명 등은 일체 기재 금지됩니다.
          </p>
        </div>

      </div>

      {/* NEIS Byte Calculation Table */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1F497D]" />
          나이스(NEIS) 바이트(Byte) 환산 표준 안내
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-slate-200 divide-y divide-slate-200">
            <thead className="bg-slate-100 text-slate-700 uppercase">
              <tr>
                <th className="px-4 py-2 border-r">구분</th>
                <th className="px-4 py-2 border-r">NEIS 바이트 환산</th>
                <th className="px-4 py-2">예시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-2 font-bold bg-slate-50 border-r">한글 / 완성형 특수문자</td>
                <td className="px-4 py-2 border-r text-emerald-700 font-bold">글자당 3 Byte</td>
                <td className="px-4 py-2">한글 1글자 = 3 Byte (예: '수학' = 6 Byte)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold bg-slate-50 border-r">영문 / 숫자 / 반각공백</td>
                <td className="px-4 py-2 border-r text-sky-700 font-bold">글자당 1 Byte</td>
                <td className="px-4 py-2">ASCII문자, 숫자, 띄어쓰기 1자 = 1 Byte</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-bold bg-slate-50 border-r">줄바꿈 (Enter / CRLF)</td>
                <td className="px-4 py-2 border-r text-amber-700 font-bold">줄당 2 Byte</td>
                <td className="px-4 py-2">CRLF 개행문자 = 2 Byte</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
