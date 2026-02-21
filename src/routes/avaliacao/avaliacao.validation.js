import { body } from 'express-validator';

export const validarEdicaoAvaliacao = () => {
    return [
        body('nome')
            .notEmpty().withMessage('O nome da avaliação é obrigatório.'),
        body('descricao')
            .notEmpty().withMessage('A descrição da avaliação é obrigatória.'),
        body('tipo')
            .notEmpty().withMessage('O tipo da avaliação é obrigatório.'),
        body('perguntas')
            .isArray({ min: 1 }).withMessage('A avaliação deve ter pelo menos uma pergunta.')
            .custom((perguntas) => {
                if (!Array.isArray(perguntas)) return true;

                const valorTotal = perguntas.reduce((soma, pergunta) => {
                    return soma + (Number(pergunta.valor) || 0);
                }, 0);

                if (valorTotal > 10) {
                    throw new Error(`O valor total das perguntas não pode passar de 10. Valor atual: ${valorTotal}`);
                }

                return true;
            }),

        body('perguntas.*').custom((pergunta, { path }) => {
            if (!pergunta.descricao) {
                throw new Error(`A descrição da pergunta é obrigatória. (${path})`);
            }
            if (pergunta.valor == null) {
                throw new Error(`O valor da pergunta é obrigatório. (${path})`);
            }
            if (pergunta.tipo === '0' || pergunta.tipo === 0) {

                if (!pergunta.itens || pergunta.itens.length == 0) {
                    throw new Error(`Os itens devem ser informados para perguntas de múltipla escolha. (${path})`);
                }

                if (pergunta.respostaCorreta == null) {
                    throw new Error(`A resposta correta deve ser informada para perguntas de múltipla escolha. (${path})`);
                }
            }

            return true;
        })
    ];
}