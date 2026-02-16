import express from "express";
import { CategoriaUsuarioController } from "../../controller/categoriaUsuario.controller.js";
import { validarPermissao, validarToken } from "../../middleware/validacao.js";
import { validarBusca, validarCadastro, validarEdicao } from "./categoriaUsuario.validation.js";

const router = express.Router();
const controller = new CategoriaUsuarioController();

router.get(
	'/usuarios/categorias',
	validarToken,
	validarPermissao('buscar_categoria'),
	validarBusca(),
	controller.buscarCategoriasUsuario
);

router.post(
	'/usuarios/categorias',
	validarToken,
	validarPermissao('cadastrar_categoria'),
	validarCadastro(),
	controller.cadastrarCategoriasUsuario
);

router.put(
	'/usuarios/categorias/:id',
	validarToken,
	validarPermissao('editar_categoria'),
	validarEdicao(),
	controller.editarCategoriaUsuario
);

router.delete(
	'/usuarios/categorias/:id',
	validarToken,
	validarPermissao('remover_categoria'),
	controller.removerCategoriaUsuario
);

export default router;