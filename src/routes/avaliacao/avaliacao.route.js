import express from "express";
import { validarToken } from "../../middleware/validacao.js";
import { AvaliacaoController} from "../../controller/avaliacao.controller.js";

const router = express.Router();
const controller = new AvaliacaoController();

router.get(
    '/avaliacoes/aluno',
    validarToken,
    controller.buscarAvalicoesAluno,
);

router.get(
    '/avaliacoes/aluno/resumo/:id',
    validarToken,
    controller.buscarDadosPaginaInicialAluno
);

router.get(
    '/avaliacoes/professor/resumo',
    validarToken,
    controller.buscarDadosPaginaInicialProfessor
);

router.get(
    '/avaliacoes/aluno/:id',
     validarToken,
    controller.buscarAvalicaoAlunoPorId
);

router.post(
    '/avaliacoes/aluno',
    validarToken,
    controller.cadastrarAvaliacaoAluno,
);

router.put(
    '/avaliacoes/aluno/:id',
    validarToken,
    controller.editarAvaliacaoAluno
);

router.post(
    '/avaliacoes/aluno/enviar-resposta',
    validarToken,
    controller.finalizarAvaliacaoAluno
);

router.delete(
    '/avaliacoes/aluno/:id',
    validarToken,
    controller.removerAvaliacaoAluno
);

router.delete(
    '/avaliacoes/pergunta/:id',
    validarToken,
    controller.removerPergunta
);

router.get(
    '/avaliacoes',
    validarToken,
    controller.buscarAvaliacoes,
);

router.get(
    '/avaliacoes/:id',
     validarToken,
    controller.buscarAvaliacaoPorId
);

router.post(
    '/avaliacoes',
    validarToken,
    controller.cadastrarAvaliacao,
);

router.put(
    '/avaliacoes/:id',
    validarToken,
    controller.editarAvaliacao
);

router.delete(
    '/avaliacoes/:id',
    validarToken,
    controller.removerAvaliacao
);


export default router;