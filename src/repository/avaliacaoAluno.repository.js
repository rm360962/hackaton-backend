import { poolConexoes } from "../database/database.js";
export class AvaliacaoAlunoRepository {

    buscarAvaliacoesAluno = async (filtros) => {
        let sql = `
            SELECT 
                AA.ID                                                       AS "id",
                TO_CHAR(AA.DATA_LIMITE, 'DD/MM/YYYY')                       AS "dataLimite",
                TO_CHAR(AA.DATA_EXECUCAO, 'DD/MM/YYYY')                     AS "dataExecucao",
                AA.CONTEUDOS_ID                                             AS "conteudosId",
                AA.RESPOSTAS                                                AS "respostas",
                AA.NOTA                                                     AS "nota",
                json_build_object(
                    'id', AA.SITUACAO,
                    'nome', 
                    CASE AA.SITUACAO
                        WHEN 0 THEN 'Pendente'
                        WHEN 1 THEN 'Em execução'
                        WHEN 2 THEN 'Enviado para correção'
                        WHEN 3 THEN 'Avaliado'
                        WHEN 4 THEN 'Não respondido'
                        WHEN 5 THEN 'Removido'
                        WHEN 6 THEN 'Aplicação em sala de aula'
                    END
                ) as "situacao",
                json_build_object('id', U.ID, 'nome', U.NOME)                 AS "usuario",
                json_build_object('id', A.ID, 'nome', A.NOME, 'tipo', CASE A.TIPO WHEN 0 THEN 'Atividade' WHEN 1 THEN 'Prova' ELSE 'Desconhecido' END) AS "avaliacao",
                TO_CHAR(AA.DATA_INCLUSAO, 'DD/MM/YYYY HH24:MI:SS')            AS "dataInclusao",
                AA.USUARIO_INCLUSAO                                           AS "usuarioInclusao",
                TO_CHAR(AA.DATA_ALTERACAO, 'DD/MM/YYYY HH24:MI:SS')           AS "dataAlteracao",
                AA.USUARIO_ALTERACAO                                          AS "usuarioAlteracao"
            FROM AVALIACAO_ALUNO AA
            INNER JOIN AVALIACAO A ON (A.ID = AA.AVALIACAO_ID) 
            INNER JOIN USUARIO U ON (U.ID = AA.USUARIO_ID)
            WHERE 1=1
        `;

        const parametros = [];
        let indiceParametro = 1;

        if(filtros.id) {
            sql += `AND AA.ID = $${indiceParametro++} `;
            parametros.push(filtros.id);
        } else {
            if(filtros.avaliacaoId) {
                sql += `AND A.ID = $${indiceParametro++} `;
                parametros.push(filtros.avaliacaoId);
            }

            if(filtros.usuarioId) {
                sql += `AND U.ID = $${indiceParametro++}`;
                parametros.push(filtros.usuarioId);
            }

            if(filtros.situacaoId) {
                sql += `AND AA.SITUACAO = $${indiceParametro++}`;
                parametros.push(filtros.situacaoId);
            }
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
            NOTA = COALESCE($2, NOTA),
            ATIVO = COALESCE($3, ATIVO),
            DATA_ALTERACAO = CURRENT_DATE,
            ${avaliacaoAluno.dataExecucao ? `DATA_EXECUCAO = NOW(),` : ''}
            USUARIO_ALTERACAO = $4,
            RESPOSTAS = COALESCE($5, RESPOSTAS)
        WHERE ID = $6
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            avaliacaoAluno.situacaoId || null,
            avaliacaoAluno.nota != null ? avaliacaoAluno.nota : null,
            avaliacaoAluno.ativo != null ? avaliacaoAluno.ativo : null,
            avaliacaoAluno.usuarioAlteracao,
            avaliacaoAluno.respostas,
            avaliacaoAluno.id
        ]);

        return rowCount > 0;
    };

};