import api from "../plugins/api";

class LoginApi {
  async login(user) {
    try {
      const response = await api.post("/token/", user);
      return Promise.resolve(response);
    } catch (error) {
      return Promise.error(error);
    }
  }
}

export default new LoginApi();
