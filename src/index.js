import app from "./app.js";

const porta = 3030;

app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});