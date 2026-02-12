import { AssistenteService } from "../service/assistente.service.js";

export class AssitenteController  {

    assitenteService = new AssistenteService();

    gerarPerguntas = async (req, res) => {
        const dados = req.body;
        const { status, resposta } = await this.assitenteService.gerarPerguntas(dados);
        return res.status(status).send(resposta);
    };
    
    gerarConteudo = async (req, res) => {
        const dados = req.body;
        const { status, resposta } = await this.assitenteService.gerarConteudo(dados);
        return res.status(status).send(resposta);
    };
};