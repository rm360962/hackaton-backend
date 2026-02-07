import { AvaliacaoRepository } from "../repository/avaliacao.repository.js";

export class AvaliacaoService {
    avaliacaoRepository = new AvaliacaoRepository();

    buscar = async (filtros) => {
        try {
            const { dados: avaliacoes } =
                await this.avaliacaoRepository.buscarAvaliacoes(filtros);

            return {
                status: 200,
                resposta: avaliacoes
            };
        } catch (erro) {
            console.log('[AVALIACAO SERVICE] Erro durante a busca das avaliacoes', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a busca das avaliacoes',
            };
        }
    };

    buscarPorId = async (id) => {
        try {
            const { possuiResultado: encontrouAvaliacao, dados: avaliacoes } =
                await this.avaliacaoRepository.buscarAvaliacoes({
                    id
                });

            let avaliacao = {};

            if (encontrouAvaliacao) {
                avaliacao = avaliacoes[0];
            }

            return {
                status: 200,
                resposta: avaliacao
            };
        } catch (erro) {
            console.log('[AVALIACAO SERVICE] Erro durante a busca das avaliacoes', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a busca das avaliacoes',
            };
        }
    };

    cadastrar = async (avaliacao) => {
        try {
            const idCadastrado = await this.avaliacaoRepository.cadastrarAvaliacao(avaliacao);

            for (const pergunta of avaliacao.perguntas) {
                await this.avaliacaoRepository.cadastrarPergunta({
                    avaliacaoId: idCadastrado,
                    ...pergunta
                });
            }
            return {
                status: 201,
                resposta: {
                    id: idCadastrado,
                    mensagem: 'Avaliação cadastrada com sucesso',
                },
            }
        } catch (erro) {
            console.log('[AVALIACAO SERVICE] Erro durante o cadastro da avaliacao', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a busca das avaliacoes',
            };
        }
    };

    editar = async (avaliacao) => {
        try {
            const { possuiResultado: avaliacaoEncontrada } = await this.avaliacaoRepository.buscarAvaliacoes({
                id: avaliacao.id
            });

            if (!avaliacaoEncontrada) {
                return {
                    status: 400,
                    mensagem: `Avaliação ${avaliacao.id} não foi encontrada`,
                }
            }

            const avaliacaoEditada = await this.avaliacaoRepository.editarAvaliacao(avaliacao);

            const perguntasCadastro = avaliacao.perguntas.filter((pergunta) => pergunta.id == null || pergunta.id.length === 0);

            for (const pergunta of perguntasCadastro) {
                await this.avaliacaoRepository.cadastrarPergunta({
                    avaliacaoId: avaliacao.id,
                    ...pergunta
                });
            }

            return {
                status: avaliacaoEditada ? 200 : 500,
                resposta: {
                    mensagem: avaliacaoEditada ? 'Avaliação editada com sucesso' : 'Erro ao editar a avaliação'
                },
            };
        } catch (erro) {
            console.log('[AVALIACAO SERVICE] Erro durante o edicao da avaliacao', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a edição da avaliação',
            };
        }

    };

    remover = async (id, usuario) => {
        try {
            const { possuiResultado: avaliacaoEncontrada, dados: avaliacoes } = await this.avaliacaoRepository.buscarAvaliacoes({
                id: id,
                ativo: true
            });

            if (!avaliacaoEncontrada) {
                return {
                    status: 400,
                    mensagem: `Avaliação ${id} não foi encontrada`,
                }
            }
            const avaliacao = avaliacoes[0];
            const avaliacaoRemovida = await this.avaliacaoRepository.editarAvaliacao({
                id,
                usuario,
                ativo: false,
            });

            
            if(avaliacaoRemovida && avaliacao.perguntas) {
                for(const pergunta of avaliacao.perguntas) {
                    await this.avaliacaoRepository.removerPergunta(pergunta.id);
                }
            }

            return {
                status: avaliacaoRemovida ? 200 : 500,
                resposta: {
                    mensagem: avaliacaoRemovida ? 'Avaliação removida com sucesso' : 'Erro ao remover a avaliação'
                },
            };
        } catch (erro) {
            console.log('[AVALIACAO SERVICE] Erro durante a remocao da avaliacao', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a remoção da avaliação',
            };
        }
    };

    removerPergunta = async (id) => {
         try {
            const perguntaRemovida = await this.avaliacaoRepository.removerPergunta(id);

            return {
                status: perguntaRemovida ? 200 : 500,
                resposta: {
                    mensagem: perguntaRemovida ? 'Pergunta removida com sucesso' : 'Erro ao remover pergunta'
                },
            };
        } catch (erro) {
            console.log('[AVALIACAO SERVICE] Erro durante a remocao da pergunta', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a remoção da pergunta',
            };
        }
    };
}