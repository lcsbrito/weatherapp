import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  XStack,
  YStack,
  Button,
  Input,
  Card,
  Header,
  Text,
  Image,
  H1,
  H2,
  ScrollView,
} from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";

import * as Location from "expo-location";
import { FlatList } from "react-native";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function IndexScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [input, setInput] = useState<string | null>(null);
  const apiKey = process.env.WEATHER_API_KEY;

  console.log("apiKey = ", apiKey);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log("location = ", location);

      await fetch(
        "http://api.weatherapi.com/v1/forecast.json" +
          `?key=${apiKey}&q=${location.coords.latitude},${location.coords.longitude}&days=7`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("data = ", data);
          setWeather(data);
        })
        .catch((error) => {
          console.error("Error while getting weather info = ", error);
        });
    })();
  }, []);

  const handleSearch = async () => {
    await fetch(
      "http://api.weatherapi.com/v1/forecast.json" +
        `?key=${apiKey}&q=${input}&days=7`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("data = ", data);
        setWeather(data);
      })
      .catch((error) => {
        console.error("Error while getting weather info = ", error);
        setErrorMsg("Error while getting weather info");
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor={"$background"} gap={"$2"} px={"$4"}>
        <Input
          size="$4"
          placeholder="Rechercher..."
          onChangeText={(text) => setInput(text)}
          onSubmitEditing={async () => {
            await handleSearch();
          }}
        />

        {!apiKey && <Text>API key is missing</Text>}

        {/* in case the user didnt accept to allow localization */}
        {errorMsg && <Text>{errorMsg}</Text>}

        {/* if weather is set */}
        {weather && (
          <>
            <Card
              animation="bouncy"
              size="$4"
              h="25%"
              pressStyle={{ scale: 0.95 }}
              enterStyle={{ opacity: 0 }}
            >
              <Card.Header>
                <H1>{weather.location.name}</H1>
                <Text>{weather.location.country}</Text>
                <Image
                  source={{ uri: "https:" + weather.current.condition.icon }}
                  h="64"
                  w="64"
                />
              </Card.Header>
              <Card.Footer
                flex={1}
                justifyContent="flex-end"
                alignItems="flex-end"
                pb="$2"
                pr="$4"
              >
                <H1>{weather.current.feelslike_c}°C</H1>
              </Card.Footer>
              <Card.Background backgroundColor="$accentBackground">
                <LinearGradient
                  colors={["#FFF", "#A0DDFF"]}
                  w="100%"
                  h="100%"
                ></LinearGradient>
              </Card.Background>
            </Card>
            <SafeAreaView>
              <FlatList
                numColumns={2}
                data={weather.forecast.forecastday}
                style={{ width: "100%" }}
                renderItem={({ item }) => (
                  <Card backgroundColor="$blue10" width="50%">
                    <Card.Header>
                      <Text>{days[new Date(item.date).getDay()]}</Text>
                    </Card.Header>
                    <Card.Footer>
                      <Text>{item.day.avgtemp_c}°C</Text>
                    </Card.Footer>
                  </Card>
                )}
              />
            </SafeAreaView>
          </>
        )}
      </YStack>
    </SafeAreaView>
  );
}
