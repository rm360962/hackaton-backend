import { AvaliacaoRepository } from "../repository/avaliacao.repository.js";
import { AvaliacaoAlunoRepository } from "../repository/avaliacaoAluno.repository.js";

export class AvaliacaoAlunoService {
    avaliacaoAlunoRepository = new AvaliacaoAlunoRepository();
    avaliacaoRepository = new AvaliacaoRepository();

    buscar = async (filtros) => {
        try {
            const { dados: avaliacoesAluno } = await this.avaliacaoAlunoRepository.buscarAvaliacoesAluno(filtros);

            return {
                status: 200,
                resposta: avaliacoesAluno
            };
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE] Erro durante a busca das avaliacoes aluno', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a busca das avaliações aluno',
            };
        }
    };

    buscarPorId = async (id) => {
        try {
            const { possuiResultado: encontrouRegistros, dados: avaliacoesAluno } =
                await this.avaliacaoAlunoRepository.buscarAvaliacoesAluno({
                    id
                });

            let avaliacaoAluno = {};

            if (encontrouRegistros) {
                avaliacaoAluno = avaliacoesAluno[0];
            }

            return {
                status: 200,
                resposta: avaliacaoAluno
            };
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE]  Erro durante a busca das avaliacoes aluno', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a busca das avaliações aluno',
            };
        }
    };

    cadastrar = async (avaliacaoAluno) => {
        try {
            const erros = [];
            for (const usuarioId of avaliacaoAluno.usuariosId) {
                const { possuiResultado: jaCadastrada } = await this.avaliacaoAlunoRepository.buscarAvaliacoesAluno({
                    avaliacaoId: avaliacaoAluno.avaliacaoId,
                    usuarioId: usuarioId,
                    situacaoId: 0
                });

                if (jaCadastrada) {
                    erros.push({
                        mensagem: `O aluno ${usuarioId} já possui a avaliação em estado 'Pendente'`,
                    });
                }
            }

            if (erros.length > 0) {
                return {
                    status: 400,
                    resposta: {
                        erros,
                    },
                };
            }

            const idsCadastrados = [];
            for (const usuarioId of avaliacaoAluno.usuariosId) {
                const id = await this.avaliacaoAlunoRepository.cadastrarAvalicaoAluno({
                    usuarioId,
                    avaliacaoId: avaliacaoAluno.avaliacaoId,
                    conteudosId: avaliacaoAluno.conteudosId,
                    dataLimite: avaliacaoAluno.dataLimite,
                    usuario: avaliacaoAluno.usuarioInclusao,
                });
                idsCadastrados.push(id);
            }

            return {
                status: 201,
                resposta: {
                    id: idsCadastrados,
                    mensagem: 'Avaliação cadastrada para os alunos',
                },
            }
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE] Erro durante o cadastro da avaliacao usuario', erro);

            return {
                status: 500,
                mensagem: 'Erro durante o cadastro da avaliação para o usuário',
            };
        }
    };

    editar = async (avaliacaoUsuario) => {
        try {
            const { possuiResultado: encontrouRegistro } = await this.avaliacaoAlunoRepository.buscarAvaliacoesAluno({
                id: avaliacaoUsuario.id,
                ativo: true
            });;

            if (!encontrouRegistro) {
                return {
                    status: 400,
                    resposta: {
                        erros: [
                            { mensagem: `Avaliação aluno ${avaliacaoUsuario.id} não foi encontrada` }
                        ]
                    },
                }
            }

            const avaliacaoUsuarioEditada = await this.avaliacaoAlunoRepository.editarAvaliacaoAluno(avaliacaoUsuario);

            return {
                status: avaliacaoUsuarioEditada ? 200 : 500,
                resposta: {
                    mensagem: avaliacaoUsuarioEditada ? 'Avaliação do aluno foi editada com sucesso' : 'Erro ao editar a avaliação do aluno'
                },
            };
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE] Erro durante o edicao da avaliacao do aluno', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a edição da avaliação do aluno',
            };
        }

    };

    remover = async (id, usuario) => {
        try {
            const { possuiResultado: encontrouRegistro } = await this.avaliacaoAlunoRepository.buscarAvaliacoesAluno({
                id: id,
                ativo: true
            });

            if (!encontrouRegistro) {
                return {
                    status: 400,
                    mensagem: `Avaliação aluno ${avaliacaoUsuario.id} não foi encontrada`,
                }
            }

            const avaliacaoAlunoRemovida = await this.avaliacaoAlunoRepository.editarAvaliacaoAluno({
                id,
                usuario,
                ativo: false,
                situacaoId: 4
            });

            return {
                status: avaliacaoAlunoRemovida ? 200 : 500,
                resposta: {
                    mensagem: avaliacaoAlunoRemovida ? 'Avaliação do aluno foi removido com sucesso' : 'Erro ao remover a avaliação do aluno'
                },
            };
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE] Erro durante a remocao da avaliacao do aluno', erro);

            return {
                status: 500,
                mensagem: 'Erro durante a remoção da avaliação do aluno',
            };
        }
    };

    finalizar = async (avaliacaoAluno) => {
        const { possuiResultado: encontrouRegistro } = await this.avaliacaoAlunoRepository.buscarAvaliacoesAluno({
            id: avaliacaoAluno.id
        });

        if(!encontrouRegistro) {
            return {
                status: 400,
                resposta: {
                    mensagem: `Avaliação aluno ${avaliacaoAluno.id} não foi encontrada`,
                }
            }
        }

        const { dados: avaliacoes } = await this.avaliacaoRepository.buscarAvaliacoes({
            id: avaliacaoAluno.avaliacaoId,
        });
        
        const avaliacao = avaliacoes[0];
        let notaFinal = 0;
        let perguntasCorrigidas = 0;
        
        for(const pergunta of avaliacao.perguntas) {
            const resposta = avaliacaoAluno.respostas.find(resposta => resposta.perguntaId === pergunta.id);

            if(pergunta.tipo.id === 0) {
                notaFinal += pergunta.respostaCorreta === resposta.valor ? pergunta.valor : 0;
                perguntasCorrigidas++;
                continue;
            }  

            if(pergunta.tipo.id === 1 && resposta.correta) {
                notaFinal += pergunta.valor;
            }

            if(resposta.correta != null) {
                perguntasCorrigidas++;
            }
        }

        const podeFinalizar = 
            avaliacao.perguntas.filter(pergunta => pergunta.tipo.id === 1).length === 0 ||
            perguntasCorrigidas === avaliacao.perguntas.length
            ;

        const atualizacao = {
            id: avaliacao.id,
            usuario: avaliacaoAluno.usuarioAlteracao,
            dataExecucao: true,
        };

        if(podeFinalizar) {
            atualizacao.situacaoId = 3;
            atualizacao.nota = notaFinal;
        } else {
            atualizacao.situacaoId = 2;
            atualizacao.respostas = JSON.stringify(avaliacaoAluno.respostas);
        }

        await this.avaliacaoAlunoRepository.editarAvaliacaoAluno(atualizacao);

        return {
            status: 200,
            mensagem: 'Avaliação finalizada com sucesso'
        }
    };

    buscarDadosIniciaisAluno = async(usuarioId) => {
        try {
            const { dados: dadosPaginaInicial } = await this.avaliacaoAlunoRepository.buscarDadosVisaoInicialAluno(usuarioId);

            return {
                status: 200,
                resposta: dadosPaginaInicial
            };
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE] Erro durante busca da visao inicial aluno', erro);

            return {
                status: 500,
                mensagem: 'Erro ao carregar os dados da página inicial',
            };
        }
    };

    buscarDadosIniciasProfessor = async (usuarioInclusao) => {
         try {
            const { dados: dadosPaginaInicial } = await this.avaliacaoAlunoRepository.buscarDadosIniciaisProfessor(usuarioInclusao);

            return {
                status: 200,
                resposta: dadosPaginaInicial
            };
        } catch (erro) {
            console.log('[AVALIACAO ALUNO SERVICE] Erro durante busca da visao inicial professor', erro);

            return {
                status: 500,
                mensagem: 'Erro ao carregar os dados da página inicial',
            };
        }
    }
}