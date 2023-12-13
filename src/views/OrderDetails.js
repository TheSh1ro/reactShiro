import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  TextInput,
} from "react-native";
import { useRecoilValue } from "recoil";
import orderApi from "../services/order";
import { userState } from "../recoil/atoms/auth";

// Certifique-se de importar as imagens que você está usando
const backgroundImage = require("../../assets/caitlyn.jpg");

export default function OrderDetails({ route, navigation }) {
  const [editMode, setEditMode] = useState(false);
  const [newLogin, setNewLogin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const currentUserState = useRecoilValue(userState);
  const { orderId } = route.params;

  const [order, setOrder] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      const orderDetails = await orderApi.getOrderDetails(orderId);
      setOrder(orderDetails);
    } catch (error) {
      console.error("Erro ao buscar detalhes da ordem de serviço:", error);
    }
  };

  useEffect(() => {
    if (currentUserState.loggedIn) {
      fetchOrderDetails();
    }
  }, [currentUserState, orderId]);

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const calculateDeadlineDate = (startDate, daysToAdd) => {
    const startDateObject = new Date(startDate);
    const deadlineDate = new Date(
      startDateObject.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );
    return deadlineDate.toISOString().split("T")[0];
  };

  const calculateRemainingDays = (deadlineDate) => {
    const currentDate = new Date();
    const deadline = new Date(deadlineDate);
    const timeDifference = deadline.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDifference / (24 * 60 * 60 * 1000));
    return remainingDays > 0 ? remainingDays : 0;
  };

  const editOrderLoginAndPassword = async () => {
    if (!editMode) {
      // Entrando no modo de edição
      setEditMode(true);
    } else if (order.newLogin.length < 6 || newPassword.length < 6) {
      setEditMode(false);
    } else {
      try {
        // Lógica de edição aqui
        const updatedOrder = {
          riot_login: newLogin || order.riot_login,
          riot_password: newPassword || order.riot_password,
        };

        // Atualizando o estado local
        setOrder((prevOrder) => ({ ...prevOrder, ...updatedOrder }));

        // Atualizando os dados no servidor
        await orderApi.updateOrder(orderId, updatedOrder);

        // Resetando o estado local e saindo do modo de edição
        setEditMode(false);
        setNewLogin("");
        setNewPassword("");
      } catch (error) {
        console.error("Erro ao editar login e senha:", error);
      }
    }
  };

  const toggleOrderStatus = async () => {
    try {
      const newStatus = order.status === 1 ? 2 : 1;
      await orderApi.toggleOrderStatus(orderId, newStatus);
      setOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));

      `Order ${orderId} status toggled to ${
        newStatus === 1 ? "Em andamento" : "Concluído"
      }`;
    } catch (error) {
      console.error("Erro ao alterar status da ordem de serviço:", error);
    }
  };

  if (!order) {
    return (
      <View style={styles.loadingView}>
        <Text style={styles.heading}>Carregando detalhes da ordem...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.imageBackground}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text
              style={styles.title}
            >{`${order.current_elo} ao ${order.target_elo}`}</Text>
            <TouchableOpacity onPress={toggleOrderStatus}>
              <Text style={styles.status}>
                {order.status === 1 ? "Em andamento" : "Concluído"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.body}>
            {/* Informações sobre a conta */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conta</Text>
              <Text
                style={styles.text}
              >{`Comprador: User ID ${order.user}`}</Text>
              <Text
                style={styles.text}
              >{`Nick da conta: ${order.riot_id}${order.riot_tag}`}</Text>
              <Text style={styles.text}>{`Login: ${order.riot_login}`}</Text>
              <Text style={styles.text}>{`Senha: ${order.riot_password}`}</Text>
            </View>

            {/* Informações sobre o pagamento */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pagamento</Text>
              <Text style={styles.text}>{`Preço: ${Number(
                order.price
              ).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}`}</Text>
              <Text style={styles.text}>{`Cupom: ${order.refer_code}`}</Text>
              <Text
                style={styles.text}
              >{`Método: ${order.payment_method}`}</Text>
            </View>

            {/* Informações sobre o serviço contratado */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Serviço Contratado</Text>
              <Text style={styles.text}>{`Fila: ${
                order.queue === 1 ? "Ranqueada Solo/Duo" : "Ranqueada Flexível"
              }`}</Text>
              <Text style={styles.text}>{`Tipo: ${
                order.service === 1 ? "EloJob" : "DuoJob"
              }`}</Text>
              <Text
                style={styles.text}
              >{`Prazo restante: ${calculateRemainingDays(
                calculateDeadlineDate(order.purchase_date, order.time)
              )} dias`}</Text>
              <Text style={styles.text}>{`Data inicial: ${formatDate(
                order.purchase_date
              )}`}</Text>
              <Text style={styles.text}>{`Data final: ${formatDate(
                calculateDeadlineDate(order.purchase_date, order.time)
              )}`}</Text>
              <Text style={styles.text}>
                {`Descrição: ${order.description}` || "Sem descrição"}
              </Text>
            </View>

            {/* Editar Login/Senha (se estiver no modo de edição) */}
            {editMode && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Editar Login/Senha</Text>
                <View style={styles.editInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Novo login"
                    placeholderTextColor={"white"}
                    value={newLogin}
                    onChangeText={(text) => setNewLogin(text)}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nova senha"
                    placeholderTextColor={"white"}
                    value={newPassword}
                    onChangeText={(text) => setNewPassword(text)}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity onPress={editOrderLoginAndPassword}>
              <Text style={styles.editButton}>
                {editMode ? "Salvar Alterações" : "Editar Login/Senha"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Estilos
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "orange",
    marginBottom: 8,
  },
  imageBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  card: {
    flex: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "orange",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgb(25, 25, 40)",
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "orange",
  },
  status: {
    color: "white",
    fontSize: 15,
  },
  body: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 16,
  },
  important: {
    flex: 1,
    flexDirection: "row",
    borderRightWidth: 1,
    borderRightColor: "orange",
    padding: 16,
    justifyContent: "space-between",
  },
  text: {
    color: "white",
    fontSize: 18,
  },
  editButton: {
    color: "black",
    backgroundColor: "orange",
    fontSize: 15,
    textAlign: "center",
    padding: 16,
    borderRadius: 8,
    fontWeight: "bold",
  },
  loadingView: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "white",
  },
  editInput: {
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    color: "white",
    marginBottom: 10,
    padding: 10,
  },
});
