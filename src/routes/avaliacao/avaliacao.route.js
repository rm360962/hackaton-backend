import express from "express";
import { validarPermissao, validarToken } from "../../middleware/validacao.js";
import { AvaliacaoController} from "../../controller/avaliacao.controller.js";

const router = express.Router();
const controller = new AvaliacaoController();

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

router.delete(
    '/avaliacoes/pergunta/:id',
    validarToken,
    controller.removerPergunta
);

export default router;