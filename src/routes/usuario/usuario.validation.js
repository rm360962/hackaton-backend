import { body, query } from 'express-validator';

export const validarBusca = () => {
    return [
        query('id', 'O campo id deve ser númerico').optional().isInt({ min: 1}),
        query('nome', 'O campo nome deve ser uma string').optional().isString(),
        query('email', 'O campo email deve ser uma string').optional().isString(),
        query('categoriaId', 'O campo categoriaId deve ser númerico').optional().isInt({ min: 1}),
    ];
}

export const validarCadastro = () => {
    return [
        body('nome', 'O campo nome é obrigatório').exists(),
        body('nome', 'O campo nome deve ser uma string com no mínimo 1 no máximo 100 caracteres')
        .exists()
        .isString()
        .isLength({ min: 1, max: 100}),
        body('login', 'O campo login é obrigatório').exists(),
		body('login', 'O campo login não pode conter espaços em branco').exists().trim().matches(/^\S+$/),
        body('login', 'O campo login deve ser uma string com no mínimo 5 no máximo 25 caracteres')
        .exists()
        .isString()
        .isLength({ min: 5, max: 25}),
        body('senha', 'O campo senha é obrigatório').exists(),
        body('senha', 'O campo senha deve ser uma string e não pode estar vazia')
        .exists()
        .isString()
        .isLength({ min: 1 }),
        body('email', 'O campo email é obrigatório').exists(),
        body('email', 'O campo email deve ser uma string com no mínimo 1 no máximo 255 caracteres')
        .exists()
        .isString()
        .isLength({ min: 1, max: 255}),
		body('email', 'O formato do campo email está inválido')
		.exists()
		.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        body('categoriaId', 'O campo categoriaId é obrigatório').exists(),
        body('categoriaId', 'O campo categoriaId deve ser númerico').exists().isInt({ min: 1}),
    ];
};

export const validarEdicao = () => {
    return [
		body('login', 'O campo login deve ser uma string com no mínimo 5 no máximo 25 caracteres')
        .optional()
        .isString()
        .isLength({ min: 5, max: 25}),
		body('login', 'O campo login não pode conter espaços em branco').optional().trim().matches(/^\S+$/),
        body('nome', 'O campo nome deve ser uma string com no mínimo 1 no máximo 100 caracteres')
		.optional()
		.isString()
		.isLength({ min: 1, max: 100}),
        body('email', 'O campo email deve ser uma string com no mínimo 1 no máximo 255 caracteres')
		.optional()
		.isString()
		.isLength({ min: 1, max: 255}),
		body('email', 'O formato do campo email está inválido')
		.optional()
		.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        body('senha', 'O campo senha deve ser uma string e não pode estar vazia')
		.optional()
		.isString()
		.isLength({ min: 1 }),
        body('categoriaId', 'O campo categoriaId deve ser númerico')
		.optional()
		.isInt({ min: 1}),
    ];
};