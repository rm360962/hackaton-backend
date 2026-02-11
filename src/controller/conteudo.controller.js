import { ConteudoService } from "../service/conteudo.service.js";
import { validationResult } from 'express-validator';
import { mascaraValidacao } from '../util/mascaraValidacao.js';

export class ConteudoController {

    conteudoService = new ConteudoService();

    buscarConteudos = async (req, res) => {
		const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }
		
		const filtros = req.query;
        const { status, resposta } = await this.conteudoService.buscar(filtros);
        return res.status(status).send(resposta);
    };

    buscarConteudoPorId = async (req, res) => {
        const id = parseInt(req.params.id, 10);
        const { status, resposta } = await this.conteudoService.buscarPorId(id);

        return res.status(status).send(resposta);
    };

    cadastrarConteudo = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const conteudo = req.body;
		conteudo.usuarioId = req.headers.usuarioEvento.id;
        conteudo.usuarioInclusao = req.headers.usuarioEvento.login;

        const { status, resposta } = await this.conteudoService.cadastrar(conteudo);
        return res.status(status).send(resposta);
    };

    editarConteudo = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const conteudo = req.body;
        conteudo.id = parseInt(req.params.id, 10);
        conteudo.usuarioAlteracao = req.headers.usuarioEvento.login;
        const { status, resposta } = await this.conteudoService.editar(conteudo);
        return res.status(status).send(resposta);
    };

    removerConteudo = async (req, res) => {
        const id = parseInt(req.params.id, 10);
        const usuario = req.headers.usuarioEvento.login;;
        const { status, resposta } = await this.conteudoService.remover(id, usuario);
        return res.status(status).send(resposta);
    };
};
