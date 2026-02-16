import { AvaliacaoAlunoRepository } from "../repository/avaliacaoAluno.repository.js";

export class AvaliacaoAlunoService {
    avaliacaoAlunoRepository = new AvaliacaoAlunoRepository();

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
                    situacao: 0
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
                id: avaliacaoUsuario.id,
                ativo: true
            });;

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
}