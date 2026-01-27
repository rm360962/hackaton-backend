export const mascaraValidacao = ({ msg, param, location, value }) => {
  return {
    campo: param,
    mensagem: msg,
    local: location,
    valorRecebido: value
  };
};