import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from "react-native";
/* Import da lib ImagePicker */
import * as ImagePicker from "expo-image-picker";
/* Import da lib MapView/Marker */
import MapView, { Marker } from "react-native-maps";
/* Import da lib Location */
import * as Location from "expo-location";
/* Import do serverApi */
import serverApi from "./servidor-api";

export default function App() {
  /* State para a geolocalização */
  const [minhaLocalizacao, setMinhaLocalizacao] = useState(null);
  const [localizacao, setLocalizacao] = useState();

  /* Programação abaixo é dos recursos de mapa e localização, e da requisição de permissão de uso*/
  useEffect(() => {
    async function obterLocalizacao() {
      // Acessando o status da requisição de permissão de uso
      const { status } = Location.requestForegroundPermissionsAsync();
      // Acessando os dados de globalização
      let localizacaoAtual = await Location.getCurrentPositionAsync({});

      // Adicionando os dados ao state
      setMinhaLocalizacao(localizacaoAtual);
    }
    obterLocalizacao();
  }, []);

  console.log(minhaLocalizacao);

  const regiaoInicial = {
    latitude: -10,
    longitude: -55,
    latitudeDelta: 40,
    logintudeDelta: 40,
  };

  const marcarLocal = (event) => {
    setLocalizacao({
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      ...minhaLocalizacao.coords,
    });
    console.log(localizacao);
  };

  /* -----------------------------------------------------------------------  */

  /* Programação abaixo é dos recursos de câmera, tirar foto e da requisição de permissão de uso*/
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [foto, setFoto] = useState();
  const [titulo, setTitulo] = useState("");

  const capturarTitulo = (event) => {
    setTitulo(event.target.value);
  };

  useEffect(() => {
    async function verificaPermissoes() {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      requestPermission(cameraStatus === "granted");
    }
    verificaPermissoes();
  }, []);

  const acessarCamera = async () => {
    const imagem = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    setFoto(imagem.assets[0].uri);
  };

  const salvar = async () => {
    const teste1Objeto = { titulo, foto, localizacao };
    console.log(typeof teste1Objeto);

    const opcoes = {
      method: "POST",
      body: JSON.stringify({
        titulo: titulo,
        foto: foto,
        localizacao: localizacao,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    try {
      await fetch(`${serverApi}/dados`, opcoes);
      Alert.alert("Mensagem", "Dados enviados!");
    } catch (error) {
      console.log("Deu ruim:" + error.message);
    }
    // console.log(foto, titulo, localizacao);
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={estilos.scroll}>
        <View style={estilos.container}>
          <Text style={estilos.titulo}>App 1 - Fotos de lugares visitados</Text>
          <TextInput
            style={estilos.input}
            placeholder="Título da foto/local"
            onChangeText={(valor) => setTitulo(valor)}
          />

          <View style={estilos.viewFoto}>
            {foto && (
              <Image
                source={{ uri: foto }}
                style={{ width: 379, height: 250 }}
              />
            )}
          </View>

          <Pressable style={estilos.botao} onPress={acessarCamera}>
            <Text style={estilos.textoBotao}>Tirar Foto</Text>
          </Pressable>

          <View style={estilos.viewMapa}>
            <MapView
              style={estilos.map}
              mapType="standard"
              userInterfaceStyle="dark"
              maxZoomLevel={15}
              minZoomLevel={2}
              region={localizacao ?? regiaoInicial}
              onPress={(e) => {
                setLocalizacao({
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                  latitude: minhaLocalizacao.coords.latitude,
                  longitude: minhaLocalizacao.coords.longitude,
                });
                console.log(localizacao);
              }}
            >
              {localizacao && (
                <Marker
                  coordinate={localizacao}
                  title="Socorrooo!!" // O título do marcador
                  // pinColor="purple" -> Muda a cor do marcador
                  draggable // Adicionar isso permite que o marcador seja arrastável (reposicionado).
                  onPress={(event) => {
                    console.log(event.nativeEvent);
                  }} // Exibindo no console.log as coordenadas
                ></Marker>
              )}
            </MapView>
          </View>

          {minhaLocalizacao && (
            <Pressable style={estilos.botao} onPress={marcarLocal}>
              <Text style={estilos.textoBotao}>Descobrir localização</Text>
            </Pressable>
          )}

          <Pressable style={estilos.botao} onPress={salvar}>
            <Text style={estilos.textoBotao}>salvar dados </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f7f7f7",
  },
  titulo: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 8,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    marginVertical: 25,
  },
  viewBotao: {},
  botao: {
    padding: 12,
    borderRadius: 2,
    backgroundColor: "blue",
    width: "95%",
    marginLeft: 10,
    marginVertical: 16,
  },
  textoBotao: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    textTransform: "uppercase",
  },
  viewFoto: {
    borderWidth: 1,
    height: 250,
    width: 379,
    marginLeft: 10,
    marginVertical: 8,
  },
  viewMapa: {
    borderWidth: 1,
    height: 250,
    width: 379,
    marginLeft: 10,
    marginVertical: 8,
  },
  map: {
    width: 379,
    height: 250,
  },
});
