import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFF5E1', 
        tabBarInactiveTintColor: '#A68A64', 
        tabBarStyle: {
          backgroundColor: '#8C6239', 
          borderTopWidth: 0, 
          elevation: 4, 
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cutlery" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />

      <Tabs.Screen
        name="revenue/index"
        options={{
          title: "Revenue", // Tiêu đề của tab
          headerShown: false, // Ẩn header trên màn hình
          tabBarIcon: ({ color }) => <TabBarIcon name="money" color={color} />, // Sử dụng biểu tượng từ FontAwesome
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />, // Vẫn hiển thị biểu tượng
        }}
      />

      <Tabs.Screen
        name="musicQueue/index"
        options={{
          title: "Music Queue",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="music" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
