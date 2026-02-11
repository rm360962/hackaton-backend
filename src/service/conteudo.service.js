import { ConteudoRepository } from "../repository/conteudo.repository.js";
import { UsuarioRepository } from "../repository/usuario.repository.js";

export class ConteudoService {

	conteudoRepository = new ConteudoRepository();
	usuarioRepository = new UsuarioRepository();

	buscar = async (filtros) => {
        try {
			const { resultado: conteudos } = await this.conteudoRepository.buscarConteudos(filtros);

            return {
                status: 200,
                resposta: !Array.isArray(conteudos) ? [conteudos] : conteudos,
            };
        } catch (erro) {
            console.log('[CONTEUDO SERVICE] Erro ao buscar os conteudos', erro);

            return {
                status: 500,
                resposta: {
                    mensagem: "Erro durante a busca dos conteúdos",
                }
            };
        }
    };

    buscarPorId = async (id) => {
        try {
            const { possuiResultado: encontrouRegistro, resultado: conteudo } = 
                await this.conteudoRepository.buscarConteudos({ id });

            return {
                status: 200,
                resposta: encontrouRegistro ? conteudo : {},
            };
        } catch (erro) {
            console.log('[CONTEUDO SERVICE] Erro ao buscar o conteudo por id', erro);

            return {
                status: 500,
                resposta: {
                    mensagem: "Erro durante a busca dos conteúdos",
                }
            };
        }
    };

    cadastrar = async (conteudo) => {
        try {
            const idCadastrado = await this.conteudoRepository.cadastrarConteudo(conteudo);

            return {
                status: 201,
                resposta: {
                    id: idCadastrado,
                    mensagem: 'Conteúdo cadastrado com sucesso'
                },
            };
        } catch (erro) {
            console.log('[CONTEUDO SERVICE] Erro ao cadastrar o conteudo', erro);

            return {
                status: 500,
                resposta: {
                    mensagem: "Erro durante o cadastro do conteúdo",
                }
            };
        }
    };

    editar = async (conteudo) => {
        try {
			const { possuiResultado: conteudoEncontrado } = await this.conteudoRepository.buscarConteudos({
                id: conteudo.id
            });

			if (!conteudoEncontrado) {
				return {
					status: 400,
					resposta: {
						mensagem: `Conteúdo ${conteudo.id} não foi encontrada`,
					},
				};
			}

			if (conteudo.usuarioId) {
				const { possuiResultado: usuarioEncontrado } =
					await this.usuarioRepository.buscarUsuarios({
						id: conteudo.usuarioId,
					});
				
				if(!usuarioEncontrado) {
					return {
						status: 400,
						resposta: {
							mensagem: `Usuário ${conteudo.usuarioId} não foi encontrado`
						}
					}
				}
			}

            const conteudoEditado = await this.conteudoRepository.editarConteudo(conteudo);

            return {
                status: conteudoEditado ? 200 : 500,
                resposta: {
					mensagem: conteudoEditado ? 'Conteúdo editado com sucesso' : 'Erro ao editar o conteúdo'
				},
            };
        } catch (erro) {
            console.log('[CONTEUDO SERVICE] Erro ao editar o conteudo', erro);

            return {
                status: 500,
                resposta: {
                    mensagem: "Erro durante a edição do conteúdo",
                }
            };
        }
    };

    remover = async (id, usuario) => {
        try {
			const { possuiResultado: conteudoEncontrado } = await this.conteudoRepository.buscarConteudos({
                id: id
            });

			if (!conteudoEncontrado) {
				return {
					status: 400,
					resposta: {
						mensagem: `Conteúdo ${id} não foi encontrada`,
					},
				};
			}

            const conteudoRemovido = await this.conteudoRepository.editarConteudo({
                id,
                usuarioAlteracao: usuario,
                ativo: false,
            });

            return {
                status: conteudoRemovido ? 200 : 500,
                resposta: {
					mensagem: conteudoRemovido ? 'Conteúdo removido com sucesso' : 'Erro ao remover o conteúdo',
				},
            };
        } catch (erro) {
            console.log('[CONTEUDO SERVICE] Erro ao remover o conteudo', erro);

            return {
                status: 500,
                resposta: {
                    mensagem: "Erro durante a remoção do conteúdo",
                }
            };
        }
	};
}