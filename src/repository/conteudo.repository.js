import { poolConexoes } from "../database/database.js";

export class ConteudoRepository {

    buscarConteudos = async (filtros) => {
        let sql = `
        SELECT 
            c.id AS "id",
            c.titulo AS "titulo",
            c.descricao AS "descricao",
            c.usuario_id AS "usuarioId",
			u.nome as "nomeUsuario",
            TO_CHAR(c.data_inclusao, 'DD/MM/YYYY hh24:mi:ss') AS "dataInclusao",
            c.usuario_inclusao AS "usuarioInclusao",
            TO_CHAR(c.data_alteracao, 'DD/MM/YYYY hh24:mi:ss') AS "dataAlteracao",
            c.usuario_alteracao AS "usuarioAlteracao"
        FROM conteudo c
        INNER JOIN usuario u ON u.id = c.usuario_id
        WHERE 1=1
        `;

        let indiceParametro = 1;
        const valores = [];

        if (filtros.id) {
            sql += `AND c.id = $${indiceParametro++}`;
            valores.push(filtros.id);
        } else {
            if (filtros.titulo) {
                sql += ` AND c.titulo ILIKE $${indiceParametro++}`;
                valores.push(`%${filtros.titulo}%`);
            }

            if (filtros.descricao) {
                sql += ` AND c.descricao ILIKE $${indiceParametro++}`;
                valores.push(`%${filtros.descricao}%`);
            }

            if (filtros.usuarioId) {
                sql += ` AND u.id = $${indiceParametro++}`;
                valores.push(filtros.usuarioId);
            }

            if (filtros.dataInclusaoInicio && !filtros.dataInclusaoFim) {
                sql += ` AND date(c.data_inclusao) >= $${indiceParametro}`;
                valores.push(filtros.dataInclusaoInicio);
            } else if (!filtros.dataInclusaoInicio && filtros.dataInclusaoFim) {
                sql += ` AND date(c.data_inclusao) <= $${indiceParametro}`;
                valores.push(filtros.dataInclusaoFim);
            } else if(filtros.dataInclusaoInicio && filtros.dataInclusaoFim) {
                sql += ` AND date(c.data_inclusao) BETWEEN $${indiceParametro} AND $${indiceParametro + 1}`;
                valores.push(filtros.dataInclusaoInicio);
                valores.push(filtros.dataInclusaoFim);
            }
        }

        const { rows: resultado } = await poolConexoes.query(sql, valores);

		const resultadoNormalizado = resultado.map((item) => {
			return {
				id: item.id,
				titulo: item.titulo,
				descricao: item.descricao,
				usuario: {
					id: item.usuarioId,
					nome: item.nomeUsuario,
				},
				dataInclusao: item.dataInclusao,
				dataAlteracao: item.dataAlteracao,
				usuarioInclusao: item.usuarioInclusao,
				usuarioAlteracao: item.usuarioAlteracao,
			};
		});
		return {
			possuiResultado: resultadoNormalizado.length > 0,
			resultado: filtros.id && resultadoNormalizado.length > 0 ? resultadoNormalizado[0] : resultadoNormalizado,
        };
    };

    cadastrarConteudo = async (conteudo) => {
        const sql = `
        INSERT INTO CONTEUDO (
            ID,
            TITULO,
            DESCRICAO,
            USUARIO_ID,
            USUARIO_INCLUSAO
        ) VALUES (
            NEXTVAL('CONTEUDO_SEQ_ID'),
            $1, 
            $2,
            $3, 
            $4  
        ) RETURNING ID;
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            conteudo.titulo,
            conteudo.descricao,
            conteudo.usuarioId,
            conteudo.usuarioInclusao,
        ]);

        return resultado[0].id;
    };

    editarConteudo = async (conteudo) => {
        const sql = `
        UPDATE CONTEUDO
        SET 
            TITULO = COALESCE($1, TITULO),
            DESCRICAO = COALESCE($2, DESCRICAO),
            USUARIO_ID = COALESCE($3, USUARIO_ID),
            DATA_ALTERACAO = NOW(),
            USUARIO_ALTERACAO = $4
        WHERE ID = $5;
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            conteudo.titulo ?? null,
            conteudo.descricao ?? null,
            conteudo.usuarioId ?? null,
			conteudo.usuarioAlteracao,
            conteudo.id
        ]);

        return rowCount > 0;
    };

    removerConteudo = async (id) => {
        const sql = `
            DELETE FROM CONTEUDO WHERE ID = $1
        `;

        const { rowCount } = await poolConexoes.query(sql, [id]);

        return rowCount > 0;
    };
}
