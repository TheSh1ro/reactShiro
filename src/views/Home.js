import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import orderApi from "../services/order";
import { userState } from "../recoil/atoms/auth";
import { useRecoilValue } from "recoil";

const backgroundImage = require("../../assets/caitlyn.jpg");

export default function Home({ navigation }) {
  const currentUserState = useRecoilValue(userState);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const allOrders = await orderApi.getAllOrders();
      setOrders(allOrders);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar ordens de serviço:", error);
      setLoading(true);
    }
  };

  useEffect(() => {
    if (currentUserState.loggedIn) {
      fetchOrders();
    }
  }, [currentUserState]);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
    >
      <View style={styles.header}>
        <Text
          style={styles.title}
        >{`${item.current_elo} ao ${item.target_elo}`}</Text>
        <Text style={styles.status}>
          {item.status == 1 ? "Em andamento" : "Concluído"}
        </Text>
      </View>
      <View style={styles.body}>
        <View style={styles.important}>
          <View>
            <Text style={styles.text}>Prazo restante:</Text>
            <Text style={styles.text}>Nick da conta:</Text>
            <Text style={styles.text}>Comprador:</Text>
            <Text style={styles.text}>Data inicial:</Text>
            <Text style={styles.text}>Data final:</Text>
          </View>
          <View>
            <Text style={styles.text}>{`${calculateRemainingDays(
              calculateDeadlineDate(item.purchase_date, item.time)
            )} dias`}</Text>
            <Text style={styles.text}>{`${item.riot_id}${item.riot_tag}`}</Text>
            <Text style={styles.text}>{`User ID: ${item.user}`}</Text>
            <Text style={styles.text}>{`${formatDate(
              item.purchase_date
            )}`}</Text>
            <Text style={styles.text}>{`${formatDate(
              calculateDeadlineDate(item.purchase_date, item.time)
            )}`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.imageBackground}>
      <View style={styles.container}>
        {currentUserState.loggedIn ? (
          loading ? (
            <View style={styles.loadingView}>
              <Text style={styles.heading}>Carregando...</Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          )
        ) : (
          <View style={styles.noOrdersView}>
            <Text style={styles.noOrdersText}>
              Você não está logado. Faça login para ver as ordens de serviço.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.retryButton}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    display: "flex",
    flexDirection: "column",

    justifyContent: "center",
    padding: 16,
  },

  imageBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "white",
  },
  card: {
    borderWidth: 1,
    borderColor: "orange",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
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
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.75)",
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
    fontSize: 15,
  },
  noOrdersView: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  noOrdersText: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
    marginHorizontal: 20,
  },
  retryButton: {
    fontSize: 16,
    color: "white",
    backgroundColor: "rgb(35,35,60)",
    borderColor: "white",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 8,
    padding: 13,
    marginTop: 16,
    width: "60%",
    alignSelf: "center",
    textAlign: "center",
  },
});
