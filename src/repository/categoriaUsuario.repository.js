import { poolConexoes } from "../database/database.js";

export class CategoriaUsuarioRepository {
	buscarCategoriasUsuario = async (filtros) => {
		console.log('[CATEGORIA REPOSITORY] Buscando categoria usuario:', JSON.stringify(filtros));
		let sql = `
            SELECT 
                id AS "id",
                nome AS "nome",
				permissoes as "permissoes",
                TO_CHAR(data_inclusao, 'DD/MM/YYYY hh24:mi:ss') AS "data_inclusao",
                usuario_inclusao AS "usuarioInclusao",
                TO_CHAR(data_alteracao, 'DD/MM/YYYY hh24:mi:ss') AS "data_alteracao",
                usuario_alteracao AS "usuarioAlteracao"
            FROM usuario_categoria
            WHERE 1=1
        `;

		let indeceParametro = 1;
		let valores = [];

		if (filtros.id) {
			sql += `AND id = $${indeceParametro++}`;
			valores.push(filtros.id);
		}

		if (filtros.nome) {
			sql += `AND LOWER(nome) LIKE $${indeceParametro++}`;
			valores.push(`%${filtros.nome.toLowerCase()}%`);
		}

		const { rows: resultado } = await poolConexoes.query(sql, valores);

		return {
			possuiResultado: resultado.length > 0,
			resultado: filtros.id && resultado.length ? resultado[0] : resultado
		};
	};

	cadastrarCategoriaUsuario = async (usuarioCategoria) => {
		console.log('[CATEGORIA REPOSITORY] Cadastrando categoria usuario:', JSON.stringify(usuarioCategoria));
		const sql = `
            INSERT INTO USUARIO_CATEGORIA (
                ID,
                NOME,
				PERMISSOES,
                DATA_INCLUSAO,
                USUARIO_INCLUSAO
            ) VALUES (
                NEXTVAL('USUARIO_CATEGORIA_SEQ_ID'),
                $1,
				$2,
                NOW(),
                $3
            ) RETURNING ID;
        `;

		const { rows: resultado } = await poolConexoes.query(sql, [
			usuarioCategoria.nome,
			JSON.stringify(usuarioCategoria.permissoes),
			usuarioCategoria.usuarioInclusao,
		]);

		return resultado[0].id;
	};

	editarCategoriaUsuario = async (categoriaUsuario) => {
		console.log('[CATEGORIA REPOSITORY] Editando a categoria usuario:', JSON.stringify(categoriaUsuario));
		const sql = `
            UPDATE USUARIO_CATEGORIA
            SET 
                nome = COALESCE($1, NOME),
				permissoes = COALESCE($2, permissoes),
                data_alteracao = NOW(),
                usuario_alteracao = $3
            WHERE ID = $4;
        `;

		const { rowCount } = await poolConexoes.query(sql, [
			categoriaUsuario.nome ?? null,
			categoriaUsuario.permissoes ? JSON.stringify(categoriaUsuario.permissoes) : null,
			categoriaUsuario.usuarioAlteracao,
			categoriaUsuario.id,
		]);

		return rowCount > 0;
	};

	removerCategoriaUsuario = async (id) => {
		console.log('[CATEGORIA REPOSITORY] Deletando categoria usuario com id:', id);
		const sql = `
            DELETE FROM USUARIO_CATEGORIA WHERE ID = $1
        `;

		const { rowCount } = await poolConexoes.query(sql, [id]);

		return rowCount > 0;
	};
}
