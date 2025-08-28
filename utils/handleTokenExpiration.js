import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import  {navigationRef}  from "../navigation/navigationRef";

const handleTokenExpiration = async () => {
  await AsyncStorage.removeItem("token");

  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: "Auth", state: { routes: [{ name: "UserType" }] } },
        ],
      })
    );
  }
};

export default handleTokenExpiration;
