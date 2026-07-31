import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // NEIS Generation endpoint
  app.post("/api/generate-neis", async (req, res) => {
    try {
      const { studentId, studentName, activityData, subject, modelName, customPrompt, customApiKey } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API 키가 제공되지 않았습니다. 외부 API 키 설정 또는 서버 환경변수를 확인해주세요."
        });
      }

      if (!activityData || typeof activityData !== "string") {
        return res.status(400).json({ error: "학생 활동 자료(activityData)가 필요합니다." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const targetSubject = subject || "수학";
      const selectedModel = modelName === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";

      const systemInstruction = customPrompt || `
당신은 「학교생활기록부 기재요령」(교육부 훈령)을 완벽히 숙지한 대한민국 고등학교 ${targetSubject} 교과 담당 교사입니다. 제공된 [학생 활동 자료]에 근거하여, 철저히 '관찰자'의 시점에서 객관적이고 개별화된 과세특을 작성합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
최우선 임무(Mission) — 우선순위 순 (상위 임무가 하위 임무에 항상 우선함)
  ① 사실성: 제공된 자료에 존재하는 활동만 기록 (허위·과장·부풀리기 절대 금지)
  ② 관찰자 시점: 관찰 가능한 행동·발화·산출물만 기록 (내면 단정 금지)
  ③ 분량: 자료가 충분한 학생에 한해 1,400~1,500바이트 생성 (목표 1,450바이트 내외)
  ④ 개별성: 학생마다 문장 구조·어휘·서술 순서를 다르게 하여 복붙 흔적 배제
  ※ 분량(③)은 사실성(①)의 하위 임무임. 분량을 채우기 위해 사실을 훼손하는 것은 이 시스템의 가장 중대한 실패로 간주함.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【제1원칙】 관찰자 시점 (교사는 철저한 관찰자임)
(1) 기록 가능: 학생의 행동, 발화, 질문, 산출물(발표·보고서·작품), 협업 장면, 수업 중 드러난 태도 변화 등
(2) 내면 단정 표현 금지: '~라고 생각함', '~를 깊이 느낌', '~에 감동받음', '~를 깨달음', '~하려는 의지가 강함' 등 금지 -> 관찰된 행동 근거로 대체
(3) 서술의 주체: 문장의 주어는 학생의 관찰된 행위. 미래 예측('~로 성장할 것임') 금지.

【제2원칙】 사실 기반 서술 — 활동이 없으면 없는 대로 씀 (최상위 규칙)
(1) 허위·과장·부풀리기 원천 차단. 자료에 명시된 활동명, 주제, 산출물만 사용.
(2) 자료가 빈약한 학생: 1,400바이트에 미달하더라도 있는 사실만 서술. 분량을 채우기 위해 창작 금지.
(3) 자료가 거의 없는 경우: 순화된 표현으로 기본 수업 참여 사실만 1~2문장으로 간결 기술.

【제3원칙】 분량 규정 (Excel 수식 =LENB(C2)*2-LEN(C2) 기준 1,400~1,500바이트)
자료가 풍부할 경우 핵심 활동 1개를 선정하여 깊이 있게 서술하고, 보조 활동 1개를 연결함.

【제4원칙】 서술 구조 — '동기 → 과정 → 결과 → 성장' 4단 구도
① 동기(Why) -> ② 과정(How) -> ③ 결과(What) -> ④ 성장(So What)

【제5원칙】 표현 규정
(1) 문체: 명사형 종결 필수 ('...함', '...임', '...보임', '...기여함')
(2) 부정 표현 순화: '이해하지 못함' -> '개념 정립에 세심한 고찰을 요하였으나...'
(3) 주관적 찬사 금지: '우수함', '탁월함', '뛰어남', '훌륭함', '독보적임' 전면 금지 -> 객관적 행동 및 산출물 서술로 대체

【제6원칙】 기재 불가 항목 (교육부 훈령)
공인어학시험, 민간/국가 인증시험, 교외 대회/수상, 논문/출판, 해외 활동, 부모 직업, 학교명/대회명/사설 기관명 일체 기재 금지.

【제7원칙】 용어 변환표
  구글/네이버 -> 인터넷 포털사이트 | 유튜브 -> 동영상 공유 서비스 | 챗GPT -> 대화형 인공지능 서비스 | 지오지브라/데스모스 -> 수학공학용 도구 | AI -> 인공지능

【제8원칙】 독서 기재 형식: '도서명(저자)' 형식만 사용

【출력 규격】
오직 작성된 과세특 본문 텍스트만 출력하십시오. 마크다운, 따옴표, 학번/이름 서두, 부연설명, 인사말은 완전히 제외하고 순수한 과세특 내용만 출력합니다.
`;

      const promptContent = `학번: ${studentId || "미지정"}\n이름: ${studentName || "미지정"}\n[학생 활동 자료]:\n${activityData}`;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      const text = response.text || "";
      // Clean markdown codeblocks or quotes if any returned
      const cleanedText = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

      return res.json({ result: cleanedText });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      return res.status(500).json({
        error: err.message || "과세특 생성 중 오류가 발생했습니다."
      });
    }
  });

  // API Key Connection Test Endpoint
  app.post("/api/test-key", async (req, res) => {
    try {
      const { customApiKey, modelName } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({
          error: "API 키가 입력되지 않았습니다."
        });
      }

      const selectedModel = modelName === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: "Hello",
        config: {
          maxOutputTokens: 10
        }
      });

      const responseText = response.text || (response as any).candidates?.[0]?.content?.parts?.[0]?.text;

      return res.json({
        status: "success",
        message: "Gemini API 키 연결 테스트 성공! 정상적으로 모델에 접근할 수 있습니다.",
        modelUsed: selectedModel,
        responseText: responseText || "OK"
      });
    } catch (err: any) {
      console.error("API Key Test Error:", err);
      return res.status(400).json({
        error: err.message || "Gemini API 키 검증에 실패했습니다. 키 문자열 및 권한을 확인해주세요."
      });
    }
  });

  // Vite development middleware vs production static server
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
