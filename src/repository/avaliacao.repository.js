import { poolConexoes } from "../database/database.js";

export class AvaliacaoRepository {

    buscarAvaliacoes = async (filtros) => {
        const sql = `
        SELECT 
            A.ID AS "id",
            A.NOME AS "nome",
            A.DESCRICAO AS "descricao",
            A.TIPO AS "tipo",
            P.ID AS "perguntaId",
            P.DESCRICAO AS "descricaoPergunta",
            P.ITENS as "itens"
        FROM AVALIACAO A
        INNER JOIN PERGUNTA P ON (A.ID = P.AVALIACAO_ID)
        WHERE 1=1
        `;

        const { rows: resultado } = await poolConexoes.query(sql);
        const resultadoAgrupado = new Map();
        for(const linha of resultado) {
            const chave = `${linha.id}|${linha.descricao}|${linha.tipo}`;

            if(!resultadoAgrupado.get(chave)) resultadoAgrupado.set(chave, []);

            resultadoAgrupado.get(chave).push({
                id: linha.perguntaId,
                descricao: linha.descricaoPergunta,
                itens: linha.itens
            });
        }

        const resultadoNormalizado = [];
        for(const [chave, valor] of resultadoAgrupado.entries()) {
            const [id, descricao, tipo] = chave.split('|');
            resultadoNormalizado.push({
                id: Number(id),
                descricao,
                id: Number(tipo),
                perguntas: valor
            });
        }

        return {
            possuiResultado: resultado.length > 0,
            dados: resultadoNormalizado,
        };
    };

    buscarAvaliacoesUsuario = async (filtros) => {
        const sql = `
        SELECT 
            *
        FROM AVALIACAO_USUARIO AU
        INNER JOIN AVALIACAO A ON (A.ID = AU.AVALIACAO_ID) 
        INNER JOIN USUARIO U ON (U.ID = AU.USUARIO_ID)
        WHERE 1=1
        `;

        const { rows: resultado } = await poolConexoes.query(sql);

        return {
            possuiResultado: resultado.length > 0,
            dados: resultado,
        };
    };

    cadastrarAvaliacao = async (avaliacao) => {
        console.log('[AVALIACAO REPOSITORY] Cadastrando avaliacao', JSON.stringify(avaliacao));
        const sql = `
        INSERT INTO AVALIACAO (
            ID, 
            NOME, 
            DESCRICAO, 
            TIPO,
            DATA_INCLUSAO, 
            USUARIO_INCLUSAO
        ) VALUES (
            NEXTVAL('AVALIACAO_SEQ_ID'),
            $1,
            $2,
            $3,
            CURRENT_DATE,
            $4
        ) RETURNING ID;
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            avaliacao.nome,
            avaliacao.descricao,
            avaliacao.tipo,
            avaliacao.usuario
        ]);

        return resultado[0].id;
    };

    cadastrarAvalicaoUsuario = async (avaliacaoUsuario) => {
        const sql = `
        INSERT INTO AVALIACAO_ALUNO (
            ID, 
            USUARIO_ID, 
            AVALIACAO_ID, 
            DATA_LIMITE, 
            DATA_INICIO, 
            DATA_FIM, 
            SITUACAO, 
            NOTA, 
            DATA_INCLUSAO, 
            USUARIO_INCLUSAO
        ) VALUES (
            NEXTVAL('AVALIACAO_ALUNO_SEQ_ID'), 
            $1, 
            $2, 
            $3,
            null, 
            null, 
            0,
            null, 
            CURRENT_DATE, 
            $4
        ) RETURNING ID;
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            avaliacaoUsuario.usuarioId,
            avaliacaoUsuario.avaliacaoId,
            avaliacaoUsuario.dataLimite,
            avaliacaoUsuario.usuario
        ]);

        return resultado[0].id;
    };

    editarAvaliacaoUsuario = async (avaliacaoUsuario) => {
        const sql = `
        UPDATE AVALIACAO_ALUNO
        SET 
            DATA_INICIO = COALESCE($3, DATA_INICIO),
            DATA_FIM = COALESCE($4, DATA_FIM),
            SITUACAO = COALESCE($5, SITUACAO),
            NOTA = COALESCE($6, NOTA),
            DATA_ALTERACAO = CURRENT_DATE,
            USUARIO_ALTERACAO = $1
        WHERE ID = $2
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            avaliacaoUsuario.usuario,
            avaliacaoUsuario.id,
            avaliacaoUsuario.dataInicio || null,
            avaliacaoUsuario.dataFim || null,
            avaliacaoUsuario.situacao || null
        ]);

        return rowCount > 0;
    };

    editarAvaliacao = async (avaliacao) => {
        const sql = `
        UPDATE AVALIACAO
        SET 
            NOME = COALESCE($3, NOME),
            DESCRICAO = COALESCE($4, DESCRICAO),
            TIPO = COALESCE($5, TIPO),
            DATA_ALTERACAO = CURRENT_DATE,
            USUARIO_ALTERACAO = $1
        WHERE ID = $2;
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            avaliacao.usuario,
            avaliacao.id,
            avaliacao.nome || null,
            avaliacao.descricao || null,
            avaliacao.tipo || null
        ]);

        return rowCount > 0;
    };


    cadastrarPergunta = async (pergunta) => {
        console.log('[AVALIACAO REPOSITORY] Cadastrando pergunta:', JSON.stringify(pergunta));
        const sql = `
        INSERT INTO PERGUNTA (
            ID, 
            AVALIACAO_ID, 
            DESCRICAO, 
            PESO, 
            ITENS, 
            DATA_INCLUSAO, 
            USUARIO_INCLUSAO
        ) VALUES (
            NEXTVAL('PERGUNTA_SEQ_ID'),
            $1, 
            $2, 
            $3, 
            $4,
            CURRENT_DATE, 
            $5
        ) RETURNING ID;
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            pergunta.avaliacaoId,
            pergunta.descricao,
            pergunta.peso,
            pergunta.itens || null,
            pergunta.usuario
        ]);

        return resultado[0].id;
    };

    editarPergunta = async (pergunta) => {
        const sql = `
        UPDATE PERGUNTA
        SET 
            DESCRICAO = COALESCE($3, DESCRICAO),
            PESO = COALESCE($4, PESO),
            ITENS = COALESCE($5, ITENS),
            DATA_ALTERACAO = CURRENT_DATE,
            USUARIO_ALTERACAO = $1
        WHERE ID = $2
        `;
        
        const { rowCount } = await poolConexoes.query(sql, [
            pergunta.usuario,
            pergunta.id,
            pergunta.descricao || null,
            pergunta.peso || null,
            pergunta.itens || null
        ]);

        return rowCount > 0;
    };
}