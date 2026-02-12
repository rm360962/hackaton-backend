import express from "express";
import { validarPermissao, validarToken } from "../../middleware/validacao.js";
import { AssitenteController } from "../../controller/assistente.controller.js";

const router = express.Router();
const controller = new AssitenteController();

router.post(
    '/assitente/gerar-perguntas',
    validarToken,
    controller.gerarPerguntas
);

router.post(
    '/assitente/gerar-conteudo',
    validarToken,
    controller.gerarConteudo
);

export default router;