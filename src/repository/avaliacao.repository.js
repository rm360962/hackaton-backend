import { poolConexoes } from "../database/database.js";

export class AvaliacaoRepository {

    buscarAvaliacoes = async (filtros) => {
        const { id, nome, descricao, tipo, ativo } = filtros;
        let sql = `
        SELECT 
            A.ID AS "id",
            A.NOME AS "nome",
            A.DESCRICAO AS "descricao",
            json_build_object(
                'id', A.TIPO,
                'nome', CASE A.TIPO WHEN 0 THEN 'Atividade' WHEN 1 THEN 'Prova' ELSE 'Desconhecido' END
            ) as tipo,
            A.ATIVO AS "ativo",
            TO_CHAR(A.DATA_INCLUSAO, 'DD/MM/YYYY hh24:mi:ss') AS "dataInclusao",
            A.USUARIO_INCLUSAO AS "usuarioInclusao",
            TO_CHAR(A.DATA_ALTERACAO, 'DD/MM/YYYY hh24:mi:ss') AS "dataAlteracao",
            A.USUARIO_ALTERACAO AS "usuarioAlteracao",
            json_agg(
                json_build_object(
                    'id', P.ID,
                    'descricao', P.DESCRICAO,
                    'itens', P.ITENS,
                    'valor', P.PESO,
                    'tipo', json_build_object(
                        'id', P.TIPO,
                        'nome', CASE P.TIPO WHEN 0 THEN 'Multipla escolha' WHEN 1 THEN 'Descritiva' ELSE 'Desconhecido' END
                    ),
                    'respostaCorreta', P.RESPOSTA_CORRETA,
                    'ativo', P.ATIVO,
                    'dataInclusao', TO_CHAR(P.DATA_INCLUSAO, 'DD/MM/YYYY hh24:mi:ss'),
                    'usuarioInclusao', P.USUARIO_INCLUSAO,
                    'dataAlteracao', TO_CHAR(A.DATA_ALTERACAO, 'DD/MM/YYYY hh24:mi:ss'),
                    'usuarioAlteracao', TO_CHAR(A.DATA_ALTERACAO, 'DD/MM/YYYY hh24:mi:ss')
                )
            ) AS "perguntas"
        FROM AVALIACAO A
        INNER JOIN PERGUNTA P ON (A.ID = P.AVALIACAO_ID)
        WHERE 1=1
        `;

        let indiceParametro = 1;
        const valores = [];

        if (id) {
            sql += `AND A.ID = $${indiceParametro++} `;
            valores.push(id);
        } else {
            if (nome) {
                sql += `AND A.NOME LIKE $${indiceParametro++} `
                valores.push(`%${nome}%`);
            }

            if(descricao) {
                sql += `AND A.DESCRICAO LIKE $${indiceParametro++} `;
                valores.push(`%${descricao}%`);
            }

            if (tipo != null) {
                sql += `AND A.TIPO = $${indiceParametro++} `;
                valores.push(tipo);
            }
        }
        
        sql += `AND A.ATIVO = $${indiceParametro++} `;
        valores.push(true);

        sql += `AND P.ATIVO = $${indiceParametro++} `;
        valores.push(true);

        sql += 'GROUP BY A.ID, A.NOME, A.DESCRICAO ';
        sql += 'ORDER BY A.ID DESC';

        const { rows: resultado } = await poolConexoes.query(sql, valores);

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
            avaliacao.usuarioInclusao
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

    editarAvaliacao = async (avaliacao) => {

        const sql = `
        UPDATE AVALIACAO
        SET 
            NOME = COALESCE($3, NOME),
            DESCRICAO = COALESCE($4, DESCRICAO),
            TIPO = COALESCE($5, TIPO),
            ATIVO = COALESCE($6, ATIVO),
            DATA_ALTERACAO = CURRENT_DATE,
            USUARIO_ALTERACAO = $1
        WHERE ID = $2;
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            avaliacao.usuario,
            avaliacao.id,
            avaliacao.nome || null,
            avaliacao.descricao || null,
            avaliacao.tipo || null,
            avaliacao.ativo != null ? avaliacao.ativo : null
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
            TIPO,
            RESPOSTA_CORRETA, 
            DATA_INCLUSAO, 
            USUARIO_INCLUSAO
        ) VALUES (
            NEXTVAL('PERGUNTA_SEQ_ID'),
            $1, 
            $2, 
            $3, 
            $4,
            $5,
            $6,
            CURRENT_DATE, 
            $7
        ) RETURNING ID;
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            pergunta.avaliacaoId,
            pergunta.descricao,
            pergunta.valor,
            pergunta.itens ? JSON.stringify(pergunta.itens) : null,
            pergunta.tipo,
            pergunta.respostaCorreta || null,
            pergunta.usuarioInclusao
        ]);

        return resultado[0].id;
    };

    removerPergunta = async (id) => {
        const sql = `
        UPDATE PERGUNTA
        SET 
            ATIVO = false
        WHERE ID = $1
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            id
        ]);

        return rowCount > 0;
    };
}