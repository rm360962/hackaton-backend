import { validationResult } from 'express-validator';
import { CategoriaUsuarioService } from "../service/categoriaUsuario.service.js";
import { mascaraValidacao } from '../util/mascaraValidacao.js';

export class CategoriaUsuarioController {

	categoriaUsuarioService = new CategoriaUsuarioService();

	buscarCategoriasUsuario = async (req, res) => {
		const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

		if (!errosRequisicao.isEmpty()) {
			return res.status(422).send({
				erros: errosRequisicao.array({ onlyFirstError: true })
			});
		}

		const filtros = req.query;
		const { status, resposta } = await this.categoriaUsuarioService.buscar(filtros);
		return res.status(status).send(resposta);
	};

	cadastrarCategoriasUsuario = async (req, res) => {
		const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

		if (!errosRequisicao.isEmpty()) {
			return res.status(422).send({
				erros: errosRequisicao.array({ onlyFirstError: true })
			});
		}

		const categoriaUsuario = req.body;
		categoriaUsuario.usuarioInclusao = req.headers.usuarioEvento.login;

		const { status, resposta } = await this.categoriaUsuarioService.cadastrar(categoriaUsuario);

		return res.status(status).send(resposta);
	};

	editarCategoriaUsuario = async (req, res) => {
		const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

		if (!errosRequisicao.isEmpty()) {
			return res.status(422).send({
				erros: errosRequisicao.array({ onlyFirstError: true })
			});
		}

		const categoriaUsuario = req.body;
		categoriaUsuario.id = parseInt(req.params.id, 10);
		categoriaUsuario.usuarioAlteracao = req.headers.usuarioEvento.login;

		const { status, resposta } = await this.categoriaUsuarioService.editar(categoriaUsuario);

		return res.status(status).send(resposta);
	};

	removerCategoriaUsuario = async (req, res) => {
		const id = parseInt(req.params.id, 10);
		const { status, resposta } = await this.categoriaUsuarioService.remover(id);
		return res.status(status).send(resposta);
	};
}