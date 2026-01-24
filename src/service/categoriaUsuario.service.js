import { CategoriaUsuarioRepository } from "../repository/categoriaUsuario.repository.js";
import { UsuarioRepository } from "../repository/usuario.repository.js";

export class CategoriaUsuarioService {

	categoriaUsuarioRepository = new CategoriaUsuarioRepository();
	usuarioRepository = new UsuarioRepository();

	buscar = async (filtros) => {
		try {
			const { resultado: categoriasUsuario } =
				await this.categoriaUsuarioRepository.buscarCategoriasUsuario(filtros);

			return {
				status: 200,
				resposta: filtros.id ? [categoriasUsuario] : categoriasUsuario,
			};
		} catch (erro) {
			console.log('[CATEGORIA SERVICE] Erro ao buscar as categorias', erro);

			return {
				status: 500,
				resposta: {
					mensagem: 'Erro no servidor, tente novamente mais tarde',
				},
			};
		}
	};

	cadastrar = async (categoriaUsuario) => {
		try {
			const { possuiResultado: existeCategoria } =
				await this.categoriaUsuarioRepository.buscarCategoriasUsuario({
					nome: categoriaUsuario.nome,
				});

			if (existeCategoria) {
				return {
					status: 400,
					resposta: {
						mensagem: `Já existe uma categória cadastrada com o nome ${categoriaUsuario.nome}`,
					},
				};
			}

			const idCategoriaCadastrada = await this.categoriaUsuarioRepository.cadastrarCategoriaUsuario(categoriaUsuario);

			return {
				status: 201,
				resposta: {
					id: idCategoriaCadastrada,
					mensagem: 'Categoria usuário cadastrado com sucesso'
				}
			};
		} catch (erro) {
			console.log('[CATEGORIA SERVICE] Erro ao cadastrar uma nova categoria', erro);

			return {
				status: 500,
				resposta: {
					mensagem: 'Erro no servidor, tente novamente mais tarde',
				},
			};
		}
	};

	editar = async (categoriaUsuario) => {
		try {
			const { possuiResultado: categoriaUsuarioEncontrada } =
				await this.categoriaUsuarioRepository.buscarCategoriasUsuario({
					id: categoriaUsuario.id,
				});

			if (!categoriaUsuarioEncontrada) {
				return {
					status: 400,
					resposta: {
						mensagem: `Categoria usuário ${categoriaUsuario.id} não foi encontrada`,
					},
				};
			}

			const categoriaEditada = await this.categoriaUsuarioRepository.editarCategoriaUsuario(categoriaUsuario);

			return {
				status: categoriaEditada ? 200 : 500,
				resposta: {
					mensagem: categoriaEditada ? 'Categoria usuário editada com sucesso' : 'Erro ao editar a categoria usuário',
				},
			};
		} catch (erro) {
			console.log('[CATEGORIA SERVICE] Erro ao editar uma categoria', erro);

			return {
				status: 500,
				resposta: {
					mensagem: 'Erro no servidor, tente novamente mais tarde',
				},
			};
		}
	};

	remover = async (id) => {
		try {
			const { possuiResultado: categoriaUsuarioEncontrada } =
				await this.categoriaUsuarioRepository.buscarCategoriasUsuario({
					id: id,
				});

			if (!categoriaUsuarioEncontrada) {
				return {
					status: 400,
					retorno: {
						mensagem: `Categoria usuário ${id} não encontrada`
					},
				};
			}

			const { possuiResultado: existeUsuarioVinculado } =
				await this.usuarioRepository.buscarUsuarios({
					categoriaId: id,
				});

			if (existeUsuarioVinculado) {
				return {
					status: 400,
					resposta: {
						mensagem: `Não é possivel remover a categoria, pois existem usuários vinculados a ela. Atualize as categorias dos usuarios e tente novamente`,
					},
				};
			}

			const categoriaRemovida = await this.categoriaUsuarioRepository.removerCategoriaUsuario(id);

			return {
				status: categoriaRemovida ? 200 : 500,
				resposta: {
					mensagem: categoriaRemovida ? 'Categoria usuário removida com sucesso' : 'Erro ao remover a categoria usuário',
				},
			};
		} catch (erro) {
			console.log('[CATEGORIA SERVICE] Erro ao tenta remover uma categoria', erro);

			return {
				status: 500,
				resposta: {
					mensagem: 'Erro no servidor, tente novamente mais tarde',
				},
			};
		}
	};
}