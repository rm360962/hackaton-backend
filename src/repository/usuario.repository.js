import { poolConexoes } from "../database/database.js";

export class UsuarioRepository {

    buscarUsuarios = async (filtros) => {
        console.log('[USUARIO REPOSITORY] Buscando usuario:', JSON.stringify(filtros));

        let sql = `
        SELECT 
            u.id AS "id",
            u.nome AS "nome",
            u.login as "login",
            u.email AS "email",
            u.ativo as "ativo",
			u.categoria_id AS "categoriaId",
			uc.nome AS "categoriaNome",
			uc.permissoes as "permissoes",
            TO_CHAR(u.data_inclusao, 'DD/MM/YYYY hh24:MM:ss') AS "dataInclusao",
            u.usuario_inclusao AS "usuarioInclusao",
            TO_CHAR(u.data_alteracao, 'DD/MM/YYYY hh24:mi:ss') AS "dataAlteracao",
            u.usuario_alteracao AS "usuarioAlteracao"
        FROM usuario u
        INNER JOIN usuario_categoria uc ON u.categoria_id = uc.id
        WHERE 1=1
        `;

        let indiceParametro = 1;
        const valores = [];

        if (filtros.id) {
            sql += `AND u.id = $${indiceParametro++} `;
            valores.push(filtros.id);
        } else {
            if (filtros.nome) {
                sql += `AND LOWER(u.nome) LIKE $${indiceParametro++} `;
                valores.push(`%${filtros.nome.toLowerCase()}%`);
            }

            if (filtros.email && !filtros.validarUnique) {
                sql += `AND LOWER(u.email) LIKE $${indiceParametro++} `;
                valores.push(`%${filtros.email.toLowerCase()}%`);
            }

            if(filtros.login && !filtros.validarUnique) {
                sql += `AND login = $${indiceParametro++} `;
                valores.push(filtros.login);
            }

            if (filtros.validarUnique) {
                sql += `AND LOWER(u.email) = $${indiceParametro++} OR LOWER(login) = $${indiceParametro++} `;
                valores.push(filtros.email);
                valores.push(filtros.login);
            }

            if (filtros.categoriaId) {
                sql += `AND u.categoria_id = $${indiceParametro++} `;
                valores.push(filtros.categoriaId);
            }

            if(filtros.ativo) {
                sql += `AND u.ativo = $${indiceParametro++} `;
                valores.push(filtros.ativo);
            }
        }

        const { rows: resultado } = await poolConexoes.query(sql, valores);

        const resultadoNormalizado = resultado.map((item) => {
            return {
                id: item.id,
                login: item.login,
                nome: item.nome,
                email: item.email,
                categoria: {
                    id: item.categoriaId,
                    nome: item.categoriaNome,
					permissoes: item.permissoes,
                },
                ativo: item.ativo,
                dataInclusao: item.dataInclusao,
                dataAlteracao: item.dataAlteracao,
                usuarioInclusao: item.usuarioInclusao,
                usuarioAlteracao: item.usuarioAlteracao
            };
        });

        return {
            possuiResultado: resultadoNormalizado.length > 0,
            resultado: (filtros.id || filtros.login) != null && resultadoNormalizado.length > 0 ? resultadoNormalizado[0] : resultadoNormalizado,
        };
    };

    buscarProfessoresIdNome = async () => {
        let sql = `
        SELECT 
            u.id AS "id",
            u.nome AS "nome"
        FROM usuario u
        WHERE 1=1
            AND u.categoria_id in (2,3)
            AND u.ativo = true
        `;

        const { rows: resultado } = await poolConexoes.query(sql);

        return {
            possuiResultado: resultado.length > 0,
            resultado: resultado
        };
    };

    cadastrarUsuario = async (usuario) => {
        console.log('[USUARIO REPOSITORY] Cadastrando usuario:', JSON.stringify(usuario));
        const sql = `
        INSERT INTO usuario (
            id,
            nome,
            login,
            email,
            senha,
            categoria_id,
            ativo,
            data_inclusao,
            usuario_inclusao
        ) VALUES (
            NEXTVAL('USUARIO_SEQ_ID'),
            $1,
            $2,
            $3,
            $4,
            $5,
            true,
            NOW(),
            $6
        ) RETURNING ID;
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [
            usuario.nome,
            usuario.login,
            usuario.email,
            usuario.senha,
            usuario.categoriaId,
            usuario.usuarioInclusao
        ]);

        return resultado[0].id;
    }

    editarUsuario = async (usuario) => {
        console.log('[USUARIO REPOSITORY] Editando usuario:', JSON.stringify(usuario));
        const sql = `
        UPDATE usuario
        SET
            nome = COALESCE($1, nome),
            login = COALESCE($2, login),
            email = COALESCE($3, email),
            senha = COALESCE($4, senha),
            categoria_id = COALESCE($5, categoria_id),
            ativo = COALESCE($6, ativo),
            data_alteracao = NOW(),
            usuario_alteracao = COALESCE($7, usuario_alteracao)
        WHERE id = $8;
        `;

        const { rowCount } = await poolConexoes.query(sql, [
            usuario.nome ?? null,
            usuario.login ?? null,
            usuario.email ?? null,
            usuario.senha ?? null,
            usuario.categoriaId ?? null,
            usuario.ativo ?? null,
            usuario.usuarioAlteracao,
            usuario.id,
        ]);

        return rowCount > 0;
    }

    buscarSenhaPorLogin = async (login) => {
        const sql = `
            SELECT 
                senha 
            FROM usuario
            WHERE 1=1
                AND login = $1
                AND ativo = true
            LIMIT 1
        `;

        const { rows: resultado } = await poolConexoes.query(sql, [login]);

        return {
            possuiResultado: resultado.length > 0,
            resultado: resultado.length > 0 ? resultado[0].senha : null,
        };
    }
}