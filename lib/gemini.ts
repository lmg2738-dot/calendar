import { GoogleGenAI, Type } from "@google/genai";
import { format } from "date-fns";

export const parseNaturalLanguage = async (input: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
  const today = format(new Date(), "yyyy-MM-dd (EEEE)");

  const prompt = `너는 대한민국 최고의 지능형 일정 관리 비서야. 사용자의 입력을 분석해서 [제목, 날짜(YYYY-MM-DD), 시간(HH:mm), 중요도(high/medium/low), 설명]을 JSON 배열로 반환해줘.

오늘 날짜는 ${today}야. 
- '내일', '이번주 토요일', '다음주 월요일' 같은 상대적인 날짜를 오늘 날짜인 ${today}를 기준으로 정확한 YYYY-MM-DD로 계산해.
- 시간이 명시되지 않았다면 문맥에 맞는 시간(예: 점심 약속은 12:00, 저녁 식사는 19:00)을 추측해.
- 중요도는 '마감', '긴급', '중요', '회의' 등은 high, '공부', '운동', '일반 약속' 등은 medium, 나머지는 low로 할당해.
- 하나 이상의 일정이 포함되어 있다면 각각 개별 객체로 분리해서 배열에 넣어줘.

사용자 입력: "${input}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING, description: "날짜 (YYYY-MM-DD 형식)" },
              time: { type: Type.STRING, description: "시간 (HH:mm 형식)" },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
              description: { type: Type.STRING }
            },
            required: ["title", "date", "time", "priority"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // AI 응답 정화 (마크다운 코드 블록 제거 및 유효성 검사)
    let jsonContent = text.trim();
    if (jsonContent.includes("```")) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) jsonContent = match[1];
    }
    
    const result = JSON.parse(jsonContent);
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return [];
  }
};
