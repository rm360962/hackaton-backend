import { AvaliacaoRepository } from "../repository/avaliacao.repository.js";
import { GeminiRepository } from "../repository/genimi.repository.js";

export class AssistenteService {

    exemplo = {
        perguntas: [
            {
                descricao: 'Nos séculos 17 e 18, ocorreram revoltas lideradas pela burguesia que se opunha ao absolutismo e ao mercantilismo. Assinale a alternativa que indica as revoluções burguesas dos séculos 17 e 18.',
                itens: ['Revolução Gloriosa e Revolução Bolchevique', 'Revolução Francesa e Revolução Russa', 'Golpe do 18 do Brumário e Revolução Chinesa', 'Revolução Chinesa e Revolução Russa ', 'Revolução Gloriosa e Revolução Francesa'],
            }
        ]
    };
    
    exemploErro = {
        mensagem: 'Erro ao gerar avaliacao'
    };

    geminiRepository = new GeminiRepository();
    avaliacaoRepository = new AvaliacaoRepository();
    
    gerarAvaliacao = async (dados) => {
        const { assuntos, usuario } = dados;
        for (const assunto of assuntos) {
            let prompt = 'Meu usuário solicita a criação de uma avaliação com o seguinte assunto "'
            prompt += assunto;
            prompt += '". A avaliacao deve conter 10 perguntas e cada pergunta deve conter 4 opções para seleção onde somente uma é verdadeira '
            prompt += 'e você deve retornar um json seguindo o seguinte exemplo: '
            prompt += JSON.stringify(this.exemplo);
            prompt += ', caso não seja possível gerar o assunto pedido retorne o seguinte json '
            prompt += JSON.stringify(this.exemploErro);

            const respostaGemini = await this.geminiRepository.enviarPrompt(prompt);

            if(!respostaGemini) {
                return {
                    erro: true,
                    mensagem: 'Erro ao se comunicar com o gemini'
                };
            }

            if(!respostaGemini.perguntas) {
                console.log('[ASSISTENTE SERVICE] Assunto para a avaliacao nao foi encontrado');
                return {
                    erro: true,
                    mensagem: `Não foi possivel gerar a avaliação para o assunto`,
                };
            }

            const avaliacaoId = await this.avaliacaoRepository.cadastrarAvaliacao({
                nome: assunto,
                descricao: 'Atividade',
                tipo: 0,
                usuario: usuario
            });

            for(const pergunta of respostaGemini.perguntas) {
                await this.avaliacaoRepository.cadastrarPergunta({
                    descricao: pergunta.descricao,
                    avaliacaoId: avaliacaoId,
                    itens: JSON.stringify(pergunta.itens),
                    peso: 100,
                });
            }

            return {
                erro: false,
                mensagem: 'Avaliacao e perguntas cadastradas com sucesso',
            };
        }
    };
};