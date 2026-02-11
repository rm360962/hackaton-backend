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

    exemploConteudo = {
        titulo: 'Matematica básica',
        descricao: 'Matematica básica trabalhando com soma e subtração',
        texto: '# Matematica basica\n\nHoje veremos dois tipos de operação:\n\n* Adição\n* Subtração\n'
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

                if (pergunta.itens && pergunta.itens.length > 0) {
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

    gerarConteudo = async (dados) => {
        const { assunto } = dados;
        let prompt = `Objetivo: Gerar conteúdo de alta qualidade para estudantes. `;
        prompt += `Instruções de Conteúdo: `
        prompt += `* Proibido: Não inclua nenhuma imagem ou placeholder de imagem. `
        prompt += `* Links: Insira links de sites brasileiros (.com.br ou .edu.br) que sejam referências reais sobre o tema. `
        prompt += `* Formatação: Use Markdown para o corpo do texto. Use espaçamento simples entre parágrafos (evite grandes blocos de espaços em branco). `
        prompt += `* Estrutura: O texto deve ser direto e focado no aprendizado. Não é necessário incluir o título dentro da string de texto. `
        prompt += `Assunto: "${assunto}". `;
        prompt += `Regras de Saída (JSON): Retorne estritamente um objeto JSON, sem textos explicativos antes ou depois.`;
        prompt += `Estrutura da saída: `;
        prompt += `* titulo: Título do conteúdo. `
        prompt += `* descriçao: Uma breve descrição sobre o conteúdo com no máximo 255 caracteres. `
        prompt += `* texto: Texto em markdown contendo o conteúdo buscado. `
        prompt += `Caso de Erro: Se o assunto for incoerente ou impossível de buscar, retorne apenas: {"mensagem": "Erro"}.`;
        prompt += `Exemplo de Formatação Esperada: ${JSON.stringify(this.exemploConteudo)}`

        const respostaGemini = await this.geminiRepository.enviarPrompt(prompt);

        if (!respostaGemini) {
            return {
                status: 500,
                resposta: {
                    mensagem: 'Erro ao se comunicar com o gemini'
                },
            };
        }

        if (respostaGemini.mensagem) {
            return {
                status: 400,
                resposta: {
                    mensagem: 'Não foi possivel gerar conteúdo sobre esse assunto'
                },
            };
        }

        if(!respostaGemini.titulo || !respostaGemini.descricao || !respostaGemini.texto) {
            return {
                status: 400,
                resposta: {
                    mensagem: 'Não foi possivel gerar o conteúdo via assitente'
                },
            };
        }

        return {
            status: 200,
            resposta: respostaGemini
        };
    }
};