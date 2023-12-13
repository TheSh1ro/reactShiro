import * as React from "react";
import "react-native-gesture-handler";
import { View, StyleSheet } from "react-native";
import { PaperProvider, Text } from "react-native-paper";
import { StatusBar } from "react-native";
import { RecoilRoot, useSetRecoilState, useRecoilValue } from "recoil";
import RecoilNexus from "recoil-nexus";
// import { getRecoil, setRecoil } from "recoil-nexus";

import * as SecureStore from "expo-secure-store";

import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { userState } from "./src/recoil/atoms/auth";

import Home from "./src/views/Home";
import Login from "./src/views/Login";

const Drawer = createDrawerNavigator();

function Logout({ navigation }) {
  const setUser = useSetRecoilState(userState);

  const logout = async () => {
    setUser({ loggedIn: false, access: null, refresh: null });
    await SecureStore.deleteItemAsync("access");
    await SecureStore.deleteItemAsync("refresh");
  };

  React.useEffect(() => {
    logout();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Desconectando...</Text>
    </View>
  );
}

function MainDrawer() {
  const setUser = useSetRecoilState(userState);
  const currentUserState = useRecoilValue(userState);

  const checkPreviousLoggedUser = async () => {
    const access = (await SecureStore.getItemAsync("access")) || null;
    const refresh = (await SecureStore.getItemAsync("refresh")) || null;
    if (access && refresh) {
      setUser({ loggedIn: true, access, refresh });
    }
  };

  React.useEffect(() => {
    checkPreviousLoggedUser();
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar
          barStyle={"light-content"}
          backgroundColor={"rgb(45,45,60)"}
        />
        <Drawer.Navigator>
          <Drawer.Screen
            name="Home"
            component={Home}
            options={{
              title: "Serviços",
              headerStyle: {
                backgroundColor: "rgb(45,45,60)", // Cor de fundo do cabeçalho
              },
              headerTintColor: "white", // Cor do texto do cabeçalho
            }}
          />
          {!currentUserState.loggedIn && (
            <Drawer.Screen
              name="Login"
              component={Login}
              options={{
                title: "Fazer login",
                headerStyle: {
                  backgroundColor: "rgb(45,45,60)", // Cor de fundo do cabeçalho
                },
                headerTintColor: "white", // Cor do texto do cabeçalho
              }}
            />
          )}
          {currentUserState.loggedIn && (
            <Drawer.Screen name="Desconectar" component={Logout} />
          )}
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <RecoilRoot>
      <RecoilNexus />
      <MainDrawer />
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "top",
  },
});
