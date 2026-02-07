import express from "express";
import { UsuarioController } from '../../controller/usuario.controller.js';
import { validarPermissao, validarToken } from '../../middleware/validacao.js';
import { validarBusca, validarCadastro, validarEdicao } from './usuario.validation.js';
const router = express.Router();
const controller = new UsuarioController();

router.get(
    '/users', 
	validarToken,
	validarPermissao('buscar_usuario'),
    validarBusca(), 
    controller.buscarUsuarios
);

router.get(
    '/users/teachers',
    validarToken,
    controller.buscarProfessores,
);

router.get(
    '/users/login', 
    controller.logarUsuario
);

router.post(
    '/users', 
	validarToken,
	validarPermissao('cadastrar_usuario'),
    validarCadastro(), 
    controller.cadastrarUsuario
);

router.put(
    '/users/:id', 
	validarToken,
	validarPermissao('editar_usuario'),
    validarEdicao(), 
    controller.editarUsuario
);

router.delete('/users/:id', 
	validarToken,
	validarPermissao('remover_usuario'), 
    controller.removerUsuario
);

export default router;