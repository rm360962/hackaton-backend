import { body, query } from "express-validator";

const permissoesValidas = [
	'buscar_postagem', 'cadastrar_postagem', 'editar_postagem', 'remover_postagem',
	'buscar_usuario', 'cadastrar_usuario', 'editar_usuario', 'remover_usuario',
	'buscar_categoria', 'cadastrar_categoria', 'editar_categoria', 'remover_categoria'
];

export const validarBusca = () => {
	return [
		query('id', 'O campo id deve ser númerico').optional().isInt({ min: 1 }),
	];
}

export const validarCadastro = () => {
	return [
		body('nome')
			.exists().withMessage('O campo nome é obrigatório')
			.isString().withMessage('O campo nome deve ser uma string')
			.isLength({ min: 1, max: 255 }).withMessage('O campo nome deve ter no mínimo 1 no máximo 255 caracteres'),
		body('permissoes')
			.isArray({ min: 1 }).withMessage(`O campo permissoes deve ser um array com pelo menos um item contendo algumas das seguintes permissões: ${permissoesValidas.join(', ')}`)
			.custom((permissoes) => {
				const permissoesInvalidas = permissoes.filter(p => !permissoesValidas.includes(p));
				if (permissoesInvalidas.length > 0) {
					throw new Error(`Permissão(s) ${permissoesInvalidas.join(', ')} não foram encontradas`);
				}
				return true;
			}),
	]
};

export const validarEdicao = () => {
	return [
		body('nome')
			.optional().isString().withMessage('O campo nome deve ser uma string')
			.optional().isLength({ min: 1, max: 255 }).withMessage('O campo nome deve ter no mínimo 1 no máximo 255 caracteres'),
		body('permissoes')
			.optional()
			.isArray({ min: 1 }).withMessage(`O campo permissoes deve ser um array com pelo menos um item contendo algumas das seguintes permissões: ${permissoesValidas.join(', ')}`)
			.custom((permissoes) => {
				const permissoesInvalidas = permissoes.filter(p => !permissoesValidas.includes(p));
				if (permissoesInvalidas.length > 0) {
					throw new Error(`Permissão(s) ${permissoesInvalidas.join(', ')} não foram encontradas`);
				}
				return true;
			}),
	]
};