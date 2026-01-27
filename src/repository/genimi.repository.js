import { GoogleGenAI } from "@google/genai";

export class GeminiRepository {

    ia = new GoogleGenAI({});

    enviarPrompt = async (prompt) => {
        try {
            const resposta = await this.ia.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

            const candidato = resposta.candidates ? resposta.candidates[0] : resposta[0];

            const textoBruto = resposta.text ? resposta.text : candidato.content.parts[0].text;

            const textoLimpo = textoBruto.replace(/```json|```/g, '').trim();

            return JSON.parse(textoLimpo);
        } catch (erro) {
            console.log('[GEMINI REPOSITY] Erro ao requisitar no gemini', erro);

            return null;
        }
    };
};