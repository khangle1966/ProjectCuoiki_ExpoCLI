import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CartProvider from "@/context/CartProvider";
import AuthProvider from "@/context/AuthProvider";
import QueryProvider from "@/context/QueryProvider";
import { Provider } from "react-redux"; // Import Redux Provider
import { store } from "./redux/store"; // Import Redux store

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Provider store={store}> {/* Bọc toàn bộ ứng dụng với Redux Provider */}
        <AuthProvider>
          <QueryProvider>
            <CartProvider>
              <Stack>
                <Stack.Screen name="(user)" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="cart" options={{ presentation: "modal", headerShown: false }} />
              </Stack>
            </CartProvider>
          </QueryProvider>
        </AuthProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
