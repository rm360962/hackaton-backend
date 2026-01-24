import jwt from 'jsonwebtoken';

export const validarToken = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        console.log(`[VALIDA TOKEN] Token nao informado na requisicao: ${req.path}, body: ${req.body != null ? JSON.stringify(req.body) : ''}, metodo: ${req.method}`);
        return res.status(401).send({
            mensagem: 'Acesso negado',
        });
    }

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);

        if (!usuario || !usuario.categoria) {
            console.log(`[VALIDA TOKEN] Usuario nao encontrado no token ${token}, requisicao: ${req.path} com body: ${req.body != null ? JSON.stringify(req.body) : ''}`);
            return res.status(401).send({
                mensagem: 'Acesso negado',
            });
        }
        
        req.headers.usuarioEvento = usuario;

        next();
	} catch (erro) {
        console.log(`[VALIDA TOKEN] Token invalido na requisicao: ${req.path}, body: ${req.body != null ? JSON.stringify(req.body) : ''}, metodo: ${req.method}`);
        return res.status(401).send({
            mensagem: 'Acesso negado',
        });
    }
};

export const validarPermissao = (permissao) => {
	return async (req, res, next) => {
		const usuarioEvento = req.headers.usuarioEvento;

		if (!usuarioEvento.categoria.permissoes.includes(permissao)) {
			console.log(`[VALIDA PERMISSAO] Usuario ${usuarioEvento.id} sem permissao de acesso ao recurso ${req.path}, metodo: ${req.method}`);
			return res.status(401).send({
				mensagem: 'Acesso negado',
			});
		}

		next();
	};
};