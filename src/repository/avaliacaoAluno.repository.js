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
                AA.ATIVO                                                    AS "ativo",
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

        if (filtros.id) {
            sql += `AND AA.ID = $${indiceParametro++} `;
            parametros.push(filtros.id);
        } else {
            if (filtros.avaliacaoId) {
                sql += `AND A.ID = $${indiceParametro++} `;
                parametros.push(filtros.avaliacaoId);
            }

            if (filtros.usuarioId) {
                sql += `AND U.ID = $${indiceParametro++} `;
                parametros.push(filtros.usuarioId);
            }

            if (filtros.situacaoId != null) {
                sql += `AND AA.SITUACAO = $${indiceParametro++} `;
                parametros.push(filtros.situacaoId);
            }
        }

        sql += `AND AA.ATIVO = $${indiceParametro++}`;
        parametros.push(true);

        const { rows: resultado } = await poolConexoes.query(sql, parametros);

        return {
            possuiResultado: resultado.length > 0,
            dados: resultado,
        };
    };

    buscarDadosVisaoInicialAluno = async (usuarioId) => {
        const sql = `
        WITH pendentes AS (
            SELECT 
            aa.id,
            a.nome,
	        TO_CHAR(DATA_LIMITE, 'DD/MM/YYYY') as "dataLimite",
	        CASE aa.situacao
                WHEN 0 THEN 'Pendente'
                WHEN 1 THEN 'Em execução'
                WHEN 2 THEN 'Enviado para correção'
                WHEN 3 THEN 'Avaliado'
                WHEN 4 THEN 'Não respondido'
                WHEN 5 THEN 'Removido'
                WHEN 6 THEN 'Aplicação em sala de aula'
            END as situacao,
            aa.nota
            FROM avaliacao_aluno aa
            inner join avaliacao a on (aa.avaliacao_id  = a.id)
            WHERE situacao = 0 AND USUARIO_ID = $1 
            ORDER BY data_limite ASC LIMIT 3
        ),
        em_avaliacao AS (
            SELECT 
            aa.id,
            a.nome,
	        TO_CHAR(DATA_EXECUCAO, 'DD/MM/YYYY') as "dataExecucao",
	        CASE aa.situacao
                WHEN 0 THEN 'Pendente'
                WHEN 1 THEN 'Em execução'
                WHEN 2 THEN 'Enviado para correção'
                WHEN 3 THEN 'Avaliado'
                WHEN 4 THEN 'Não respondido'
                WHEN 5 THEN 'Removido'
                WHEN 6 THEN 'Aplicação em sala de aula'
            END as situacao,
            aa.nota
            FROM avaliacao_aluno aa
            inner join avaliacao a on (aa.avaliacao_id  = a.id)
            WHERE situacao = 2 AND USUARIO_ID = $1 
            ORDER BY data_limite ASC LIMIT 3
        ),
        avaliadas AS (
            SELECT 
            aa.id,
            a.nome,
	        TO_CHAR(DATA_EXECUCAO, 'DD/MM/YYYY') as "dataExecucao",
	        CASE aa.situacao
                WHEN 0 THEN 'Pendente'
                WHEN 1 THEN 'Em execução'
                WHEN 2 THEN 'Enviado para correção'
                WHEN 3 THEN 'Avaliado'
                WHEN 4 THEN 'Não respondido'
                WHEN 5 THEN 'Removido'
                WHEN 6 THEN 'Aplicação em sala de aula'
            END as situacao,
            aa.nota
            FROM avaliacao_aluno aa
            inner join avaliacao a on (aa.avaliacao_id  = a.id)
            WHERE situacao = 3 AND USUARIO_ID = $1 
            ORDER BY data_limite ASC LIMIT 3
        )   
    SELECT 
        (SELECT COALESCE(json_agg(p), '[]'::json) FROM pendentes p) AS "pendentes",
        (SELECT COALESCE(json_agg(e), '[]'::json) FROM em_avaliacao e) AS "emAvaliacao",
        (SELECT COALESCE(json_agg(a), '[]'::json) FROM avaliadas a) AS "avaliadas"
        `;
        
        const { rows: resultado } = await poolConexoes.query(sql, [usuarioId]);

        return {
            possuiResultado: resultado.length > 0,
            dados: resultado.length > 0 ? resultado[0] : {},
        };
    };

    buscarDadosIniciaisProfessor = async (usuarioInclusao) => {
        const sql = `
        SELECT 
            (SELECT count(id) FROM avaliacao_aluno WHERE 1=1 AND ativo = true AND situacao = 0 and usuario_inclusao = $1) AS "qtdPendentes",
            (SELECT count(id) FROM avaliacao_aluno WHERE 1=1 AND ativo = true AND situacao = 1 and usuario_inclusao = $1) AS "qtdEmExecucao",
            (SELECT count(id) FROM avaliacao_aluno WHERE 1=1 AND ativo = true AND situacao = 2 and usuario_inclusao = $1) AS "qtdEnviadoCorrecao",
            (SELECT count(id) FROM avaliacao_aluno WHERE 1=1 AND ativo = true AND situacao = 4 and usuario_inclusao = $1) AS "qtdNaoRespondido"
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [usuarioInclusao]);

        return {
            possuiResultado: resultado.length > 0,
            dados: resultado.length > 0 ? resultado[0] : {},
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