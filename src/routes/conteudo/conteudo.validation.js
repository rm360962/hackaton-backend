import { body, query } from "express-validator";

export const validarBusca = () => {
    return [
        query('id', 'O campo id deve ser númerico')
		.optional()
		.isInt({ min: 1 }),
        query('usuarioId', 'O campo usuarioId deve ser númerico')
		.optional()
		.isInt({ min: 1 }),
        query('dataInclusaoInicio', 'O campo dataInclusaoInicio deve estar no formato yyyy-MM-dd')
		.optional()
		.isString()
		.matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
        query('dataInclusaoFim', 'O campo dataInclusaoFim deve estar no formato yyyy-MM-dd')
		.optional()
		.isString()
		.matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/),
    ];
};

export const validarCadastro = () => {
    return [
        body('titulo')
            .notEmpty().withMessage('O campo titulo é obrigatório')
            .isString().withMessage('O campo titulo deve ser uma string')
            .isLength({ min: 1, max: 255 }).withMessage('O campo titulo deve ter no mínimo 1 máximo 255 caracteres'),
        body('descricao')
            .notEmpty().withMessage('O campo descricao é obrigatório')
            .isString().withMessage('O campo descricao deve ser uma string')
            .isLength({ min: 1}).withMessage('O campo descricao dever conter no mínimo 1 caractere'),
    ];
};

export const validarEdicao = () => {
    return [
        body('titulo')
            .optional()
            .isString().withMessage('O campo titulo deve ser uma string')
            .isLength({ min: 1, max: 255 }).withMessage('O campo titulo deve ter no mínimo 1 máximo 255 caracteres'),
        body('descricao')
            .optional()
            .isString().withMessage('O campo descricao deve ser uma string')
            .isLength({ min: 1}).withMessage('O campo descricao dever conter no mínimo 1 caractere'),
        body('usuarioId', 'O campo usuarioId deve ser numérico')
            .optional()
            .isInt({ min: 1 })
    ];
};