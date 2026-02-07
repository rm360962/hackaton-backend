import express from "express";
import { validarPermissao, validarToken } from "../../middleware/validacao.js";
import { validarBusca, validarCadastro, validarEdicao } from './conteudo.validation.js';
import { ConteudoController } from "../../controller/conteudo.controller.js";

const router = express.Router();
const controller = new ConteudoController();

router.get(
    '/conteudo',
	validarToken,
	validarPermissao('buscar_conteudo'),
	validarBusca(),
    controller.buscarConteudos
);

router.get(
    '/conteudo/:id',
	validarToken,
	validarPermissao('buscar_conteudo'), 
    controller.buscarConteudoPorId
);

router.post(
    '/conteudo',
	validarToken,
	validarPermissao('cadastrar_conteudo'),
    validarCadastro(), 
    controller.cadastrarConteudo
);

router.put(
    '/conteudo/:id',
	validarToken,
	validarPermissao('editar_conteudo'),
    validarEdicao(), 
    controller.editarConteudo
);

router.delete(
    '/conteudo/:id', 
	validarToken,
	validarPermissao('remover_conteudo'),
    controller.removerConteudo
);

export default router;