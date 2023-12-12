// order.js
import api from "../plugins/api";

class OrderService {
  async createOrder(data) {
    try {
      const response = await api.post("/servico/", data);
      const orderData = response.data;
      return orderData;
    } catch (error) {
      console.error("Erro ao criar nova ordem de serviço:", error);
      throw error;
    }
  }

  async getAllOrders() {
    try {
      const response = await api.get("/servico/");
      const orderData = response.data;
      return orderData;
    } catch (error) {
      console.error("Erro ao receber as ordens serviço:", error);
      throw error;
    }
  }
}

export default new OrderService();
