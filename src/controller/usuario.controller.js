import { UsuarioService } from '../service/usuario.service.js';
import { validationResult } from 'express-validator';
import { mascaraValidacao } from '../util/mascaraValidacao.js';

export class UsuarioController {

    constructor(usuarioService) {
		this.usuarioService = usuarioService ?? new UsuarioService();
	}

    buscarUsuarios = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const filtros = req.query;
        const { status, resposta } = await this.usuarioService.buscar(filtros);
        return res.status(status).send(resposta);
    };

    buscarProfessores = async (req, res) => {
        const { status, resposta } = await this.usuarioService.buscarIdNomeProfessores();
        return res.status(status).send(resposta);
    };

    cadastrarUsuario = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const usuario = req.body;
        usuario.usuarioInclusao = req.headers.usuarioEvento.login;
		
        const { status, resposta } = await this.usuarioService.cadastrar(usuario);
        return res.status(status).send(resposta);
    };

    editarUsuario = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const usuario = req.body;
        usuario.id = parseInt(req.params.id, 10);
        usuario.usuarioAlteracao = req.headers.usuarioEvento.login;

        const { status, resposta } = await this.usuarioService.editar(usuario);
        return res.status(status).send(resposta);
    };

    removerUsuario = async (req, res) => {
        const usuarioRemocao = {
            id: parseInt(req.params.id, 10),
            usuarioAlteracao: req.headers.usuarioEvento.login,
            ativo: false,
        };

        const { status, resposta } = await this.usuarioService.remover(usuarioRemocao);
        return res.status(status).send(resposta);
    };

    logarUsuario = async (req, res) => {
        const autenticacaoBase64 = req.headers.authorization;
        const { status, resposta } = await this.usuarioService.logarUsuario(autenticacaoBase64);
        return res.status(status).send(resposta);
    };
}