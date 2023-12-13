import { useState } from "react";
import { StyleSheet, View, ImageBackground } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import { useSetRecoilState } from "recoil";

import loginApi from "../services/login";
import { userState } from "../recoil/atoms/auth";

const imageBackground = require("../../assets/caitlyn.jpg");

export default function Login({ navigation }) {
  const [username, setUsername] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [errorMsg, setErrorMsg] = useState(null);

  const setUser = useSetRecoilState(userState);

  const login = async () => {
    try {
      const data = await loginApi.login({
        email: username,
        password: password,
      });
      setUser({
        loggedIn: true,
        access: data.access,
        refresh: data.refresh,
      });
      setUsername("");
      setPassword("");
      setErrorMsg(null);
      await SecureStore.setItemAsync("access", data.access);
      await SecureStore.setItemAsync("refresh", data.refresh);
      navigation.navigate("Home");
    } catch (error) {
      setUser({ loggedIn: false, access: null, refresh: null });
      setErrorMsg("Usuário ou senha inválidos!");
      await SecureStore.deleteItemAsync("access");
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={imageBackground} style={styles.imageBackground}>
        <View style={styles.form}>
          <Text style={styles.title}>Entre na sua conta</Text>
          <TextInput
            label="Usuário"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            textColor="black"
          />
          <TextInput
            label="Password"
            type="password"
            secureTextEntry={true}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            textColor="black"
          />
          <Button
            style={styles.button}
            mode="contained"
            onPress={() => login()}
          >
            Entrar
          </Button>
          <Text style={{ color: "yellow" }}>{errorMsg}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
  },
  form: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 40,
    gap: 10,
  },
  title: {
    fontSize: 30,
    color: "white",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  button: {
    width: "100%",
    backgroundColor: "rgb(105,65,160)",
    borderRadius: 0,
  },
});
