import express from "express";

const router = express.Router();

router.get('', (req, res) => {
    res.status(200).send({
        mensagem: "Bem vindo a api"
    });
});

export default router;