import { AvaliacaoRepository } from "../repository/avaliacao.repository.js";
import { GeminiRepository } from "../repository/genimi.repository.js";

export class AssistenteService {

    exemplo = {
        perguntas: [
            {
                descricao: 'Quando é 1+1?',
                itens: ['2', '3', '4', '5', '6'],
                respostaCorreta: '2'
            }
        ]
    };

    exemploErro = {
        mensagem: 'Erro ao gerar avaliacao'
    };

    geminiRepository = new GeminiRepository();
    avaliacaoRepository = new AvaliacaoRepository();

    gerarPerguntas = async (dados) => {
        try {
            const { assunto, qtdDescritiva, qtdMuliplaEscolha } = dados;
            let prompt = `Objetivo: Gerar um conjunto de questões de alta qualidade para estudantes. Instruções de Conteúdo: `;
            prompt += `1. Assunto: ${assunto}, `;
            prompt += `2. Quantidade: Exatamente ${qtdDescritiva} perguntas descritivas e ${qtdMuliplaEscolha} perguntas de múltipla escolha, `
            prompt += `3. Qualidade: As perguntas de múltipla escolha devem ter 5 alternativas, sendo apenas uma correta e 4 "distratores" (respostas erradas, mas plausíveis) em posições aleatorias, `;
            prompt += `4. Complexidade: Nível variado (fácil, médio e difícil).`;
            prompt += `Regras de Saída (JSON): Retorne estritamente um objeto JSON, sem textos explicativos antes ou depois, `;
            prompt += `Estrutura da saída:descricao: O enunciado da pergunta, `
            prompt += `itens: array de strings. (Se for descritiva, retornar array vazio []),`,
                prompt += `respostaCorreta: A alternativa correta (caso seja descritiva retornar vazio). `;
            prompt += `Caso de Erro: Se o assunto for incoerente ou impossível de gerar, retorne apenas: {"mensagem": "Erro"}. `;
            prompt += `Exemplo de Formatação Esperada: ${JSON.stringify(this.exemplo)}`;

            const respostaGemini = await this.geminiRepository.enviarPrompt(prompt);

            if (!respostaGemini) {
                return {
                    status: 500,
                    resposta: {
                        mensagem: 'Erro ao se comunicar com o gemini'
                    },
                };
            }

            if (!respostaGemini.perguntas) {
                return {
                    status: 400,
                    resposta: {
                        mensagem: 'Não foi possível gerar as perguntas para esse assunto'
                    },
                };
            };

            const quantidadePerguntas = qtdDescritiva + qtdMuliplaEscolha;
            const valor = 10 / quantidadePerguntas;
            const perguntas = respostaGemini.perguntas.map((pergunta) => {
                let respostaCorreta = null;
                let alternativas = null;
                let tipo = 1;

                if(pergunta.itens && pergunta.itens.length > 0) {
                    tipo = 0
                    respostaCorreta = pergunta.itens.findIndex(alternativa => alternativa === pergunta.respostaCorreta);
                    alternativas = pergunta.itens.join(',');
                }

                return {
                    descricao: pergunta.descricao,
                    valor: valor,
                    tipo: tipo,
                    alternativas: alternativas,
                    itens: pergunta.itens,
                    respostaCorreta: respostaCorreta,
                    respostaCorretaLabel: pergunta.respostaCorreta
                };
            });
            
            return {
                status: 200,
                resposta: {
                    perguntas
                }
            };
        } catch (erro) {
            console.log('[ASSITENTE SERVICE] Erro ao gerar as pergunta', erro);

            return {
                status: 500,
                resposta: {
                    mensagem: 'Erro ao gerar as perguntas',
                }
            };
        }
    };
};