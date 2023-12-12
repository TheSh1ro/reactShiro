import api from "../plugins/api";

class LoginApi {
  async login(user) {
    try {
      const { data } = await api.post("/token/", user);
      console.log(data);
      return data; // Retorna diretamente os dados da resposta
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  }
}

export default new LoginApi();
