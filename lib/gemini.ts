import { GoogleGenAI, Type } from "@google/genai";
import { format } from "date-fns";

export const parseNaturalLanguage = async (input: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
  const today = format(new Date(), "yyyy-MM-dd (EEEE)");

  const prompt = `너는 지능형 일정 관리 비서야. 사용자의 입력을 분석해서 [제목, 날짜(YYYY-MM-DD), 시간(HH:mm), 중요도(high/medium/low), 설명]을 JSON 배열로 반환해줘.
오늘 날짜는 ${today}야. 
시간이 명시되지 않았다면 대략적인 시간(예: 오전 09:00, 오후 14:00, 저녁 19:00)을 추측해봐.
중요도는 문맥을 파악해 (예: '마감', '긴급', '중요', '회의' 등은 high, '공부', '운동' 등은 medium, 나머지는 low) 할당해.
다중 일정이 포함되어 있다면 각각 개별 객체로 분리해서 배열에 넣어줘.

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
              date: { type: Type.STRING, description: "YYYY-MM-DD formato" },
              time: { type: Type.STRING, description: "HH:mm format" },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
              description: { type: Type.STRING }
            },
            required: ["title", "date", "time", "priority"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return [];
  }
};
