// order.js
import api from "../plugins/api";

class OrderService {
  async createOrder(data) {
    try {
      const response = await api.post("/servico/", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar nova ordem de serviço:", error);
      throw error;
    }
  }

  async getAllOrders() {
    try {
      const { data } = await api.get("/servico/");
      return data.results;
    } catch (error) {
      throw error;
    }
  }

  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/servico/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error("Erro ao obter detalhes da ordem de serviço:", error);
      throw error;
    }
  }

  async updateOrder(orderId, updatedData) {
    try {
      const response = await api.patch(`/servico/${orderId}/`, updatedData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar ordem de serviço:", error);
      throw error;
    }
  }

  async toggleOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/servico/${orderId}/`, { status });
      return response.data;
    } catch (error) {
      console.error("Erro ao alterar status da ordem de serviço:", error);
      throw error;
    }
  }

  async editOrderLoginAndPassword(orderId, newLogin, newPassword) {
    try {
      const response = await api.patch(`/servico/${orderId}/`, {
        riot_login: newLogin,
        riot_password: newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao editar login e senha da ordem:", error);
      throw error;
    }
  }
}

export default new OrderService();
