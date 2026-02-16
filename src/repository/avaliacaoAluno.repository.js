import { poolConexoes } from "../database/database.js";
export class AvaliacaoAlunoRepository {

    buscarAvaliacoesAluno = async (filtros) => {
        let sql = `
            SELECT 
                AA.ID                                               AS "id",
                TO_CHAR(AA.DATA_LIMITE, 'DD/MM/YYYY')               AS "dataLimite",
                TO_CHAR(AA.DATA_EXECUCAO, 'DD/MM/YYYY')             AS "dataExecucao",
                json_build_object(
                    'id', AA.SITUACAO,
                    'nome', 
                    CASE AA.SITUACAO
                        WHEN 0 THEN 'Pendente'
                        WHEN 1 THEN 'Enviado para correção'
                        WHEN 2 THEN 'Avaliado'
                        WHEN 3 THEN 'Não respondido'
                        WHEN 4 THEN 'Removido'
                        WHEN 5 THEN 'Aplicação em sala de aula'
                    END
                ) as "situacao",
                json_build_object('id', U.ID, 'nome', U.NOME)       AS "usuario",
                json_build_object('id', A.ID, 'nome', A.NOME)       AS "avaliacao",
                TO_CHAR(AA.DATA_INCLUSAO, 'DD/MM/YYYY HH24:MI:SS')  AS "dataInclusao",
                AA.USUARIO_INCLUSAO                                 AS "usuarioInclusao",
                TO_CHAR(AA.DATA_ALTERACAO, 'DD/MM/YYYY HH24:MI:SS') AS "dataAlteracao",
                AA.USUARIO_ALTERACAO                                AS "usuarioAlteracao"
            FROM AVALIACAO_ALUNO AA
            INNER JOIN AVALIACAO A ON (A.ID = AA.AVALIACAO_ID) 
            INNER JOIN USUARIO U ON (U.ID = AA.USUARIO_ID)
            WHERE 1=1
        `;

        const parametros = [];
        let indiceParametro = 1;

        if(filtros.id) {
            sql += `AND AA.ID = $${indiceParametro++}`;
            parametros.push(filtros.id);
        }

        const { rows: resultado } = await poolConexoes.query(sql, parametros);

        return {
            possuiResultado: resultado.length > 0,
            dados: resultado,
        };
    };

    cadastrarAvalicaoAluno = async (avaliacaoUsuario) => {
        const sql = `
            INSERT INTO AVALIACAO_ALUNO (
                ID, 
                USUARIO_ID, 
                AVALIACAO_ID, 
                CONTEUDOS_ID,
                DATA_LIMITE, 
                SITUACAO, 
                DATA_INCLUSAO, 
                USUARIO_INCLUSAO
            ) VALUES (
                NEXTVAL('AVALIACAO_ALUNO_SEQ_ID'), 
                $1, 
                $2, 
                $3,
                TO_DATE($4, 'YYYY-MM-DD'),
                0,
                CURRENT_DATE, 
                $5
            ) RETURNING ID;
            `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            avaliacaoUsuario.usuarioId,
            avaliacaoUsuario.avaliacaoId,
            JSON.stringify(avaliacaoUsuario.conteudosId),
            avaliacaoUsuario.dataLimite,
            avaliacaoUsuario.usuario
        ]);

        return resultado[0].id;
    };

    editarAvaliacaoAluno = async (avaliacaoAluno) => {
        const sql = `
        UPDATE AVALIACAO_ALUNO
        SET
            SITUACAO = COALESCE($1, SITUACAO),
            DATA_EXECUCAO = COALESCE($2, DATA_EXECUCAO),
            NOTA = COALESCE($3, NOTA),
            ATIVO = COALESCE($4, ATIVO),
            DATA_ALTERACAO = CURRENT_DATE,
            USUARIO_ALTERACAO = $5
        WHERE ID = $6
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            avaliacaoAluno.situacaoId || null,
            avaliacaoAluno.dataExecucao || null,
            avaliacaoAluno.nota || null,
            avaliacaoAluno.ativo != null ? avaliacaoAluno.ativo : null,
            avaliacaoAluno.usuarioAlteracao,
            avaliacaoAluno.id
        ]);

        return rowCount > 0;
    };

};