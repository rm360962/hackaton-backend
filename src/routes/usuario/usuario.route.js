import express from "express";
import { UsuarioController } from '../../controller/usuario.controller.js';
import { validarPermissao, validarToken } from '../../middleware/validacao.js';
import { validarBusca, validarCadastro, validarEdicao } from './usuario.validation.js';
const router = express.Router();
const controller = new UsuarioController();

router.get(
    '/usuarios', 
	validarToken,
	validarPermissao('buscar_usuario'),
    validarBusca(), 
    controller.buscarUsuarios
);

router.get(
    '/usuarios/professores',
    validarToken,
    controller.buscarProfessores,
);

router.get(
    '/usuarios/alunos',
    validarToken,
    controller.buscarAlunos,
);

router.get(
    '/usuarios/login', 
    controller.logarUsuario
);

router.post(
    '/usuarios', 
	validarToken,
	validarPermissao('cadastrar_usuario'),
    validarCadastro(), 
    controller.cadastrarUsuario
);

router.put(
    '/usuarios/:id', 
	validarToken,
	validarPermissao('editar_usuario'),
    validarEdicao(), 
    controller.editarUsuario
);

router.delete('/usuarios/:id', 
	validarToken,
	validarPermissao('remover_usuario'), 
    controller.removerUsuario
);

export default router;