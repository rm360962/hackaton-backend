import { AvaliacaoService } from "../service/avaliacao.service.js";
import { validationResult } from 'express-validator';
import { mascaraValidacao } from '../util/mascaraValidacao.js';

export class AvaliacaoController {

    avaliacaoService = new AvaliacaoService();

    buscarAvaliacoes = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const filtros = req.query;
        const { status, resposta } = await this.avaliacaoService.buscar(filtros);
        return res.status(status).send(resposta);
    };

    buscarAvaliacaoPorId = async (req, res) => {
        const id = parseInt(req.params.id, 10);
        const { status, resposta } = await this.avaliacaoService.buscarPorId(id);

        return res.status(status).send(resposta);
    };

    cadastrarAvaliacao = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const avaliacao = req.body;
        avaliacao.usuarioId = req.headers.usuarioEvento.id;
        avaliacao.usuarioInclusao = req.headers.usuarioEvento.login;

        const { status, resposta } = await this.avaliacaoService.cadastrar(avaliacao);
        return res.status(status).send(resposta);
    };

    editarAvaliacao = async (req, res) => {
        const errosRequisicao = validationResult(req).formatWith(mascaraValidacao);

        if (!errosRequisicao.isEmpty()) {
            return res.status(422).send({
                erros: errosRequisicao.array({ onlyFirstError: true })
            });
        }

        const avaliacao = req.body;
        avaliacao.id = parseInt(req.params.id, 10);
        avaliacao.usuarioAlteracao = req.headers.usuarioEvento.login;
        const { status, resposta } = await this.avaliacaoService.editar(avaliacao);
        return res.status(status).send(resposta);
    };

    removerAvaliacao = async (req, res) => {
        const id = parseInt(req.params.id, 10);
        const usuario = req.headers.usuarioEvento.login;
        const { status, resposta } = await this.avaliacaoService.remover(id, usuario);
        return res.status(status).send(resposta);
    };

    removerPergunta = async (req, res) => {
        const id = parseInt(req.params.id, 10);
        const { status, resposta } = await this.avaliacaoService.removerPergunta(id);
        return res.status(status).send(resposta);
    };
}