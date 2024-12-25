import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView
 } from "react-native";
 import React from "react";
 import { Stack, useLocalSearchParams } from "expo-router";
 import OrderList from "@/components/OrderList";
 import { FlatList } from "react-native";
 import OrderDetail from "@/components/OrderDetail";
 import { OrderStatusList } from "@/app/types";
 import { Colors } from "@/constants/Colors";
 import { useOrderDetails, useUpdateOrder } from "@/api/orders";
 import Icon from "react-native-vector-icons/Ionicons";
 import { useAdminOrdersSubscription } from "@/api/orders/subcriptions";
 
 const OrderDetailScreen = () => {
  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);
  const { data: order, isLoading, error } = useOrderDetails(id);
  const { mutate: updateOrder } = useUpdateOrder();
 
  const updateOrderStatus = (status: string) => {
    updateOrder({ id: id, updatedField: { status } });
  };
 
  useAdminOrdersSubscription(id);
 
  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />;
  }
 
  if (error || !order) {
    return <Text style={styles.errorText}>Failed to fetch order details</Text>;
  }
 
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'New': return 'star-outline';
      case 'Cooking': return 'flame-outline';
      case 'Delivered': return 'checkmark-circle-outline';
      default: return 'information-circle-outline';
    }
  };
 
  return (
    <View style={styles.container}>
     <Stack.Screen 
  options={{ 
    title: `Order #${id}`,
    headerStyle: {
      backgroundColor: '#6D4C41', // Màu nâu đậm
    },
    headerTintColor: '#FFF', // Màu chữ trắng
    headerTitleStyle: {
      fontWeight: 'bold', // Làm tiêu đề in đậm
      fontSize: 20, // Tăng kích thước tiêu đề
    },
  }} 
/>

 
      <View style={styles.statusBar}>
        <View style={styles.statusHeader}>
          <Icon name="time-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.statusTitle}>Order Status</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusContainer}
        >
          {OrderStatusList.map((status) => (
            <Pressable
              style={[
                styles.statusButton,
                {
                  backgroundColor: order.status === status 
                    ? Colors.light.tint 
                    : 'white',
                },
              ]}
              key={status}
              onPress={() => updateOrderStatus(status)}
            >
              <Icon 
                name={getStatusIcon(status)} 
                size={20} 
                color={order.status === status ? 'white' : Colors.light.tint}
              />
              <Text style={[
                styles.statusText,
                {color: order.status === status ? 'white' : Colors.light.tint}
              ]}>
                {status}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
 
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Items</Text>
          <Text style={styles.summaryValue}>{order.order_items.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Order Total</Text>
          <Text style={styles.summaryValue}>${order.total.toFixed(2)}</Text>
        </View>
      </View>
 
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <FlatList
          data={order.order_items}
          renderItem={({ item }) => (
            <View style={styles.orderItemCard}>
              <OrderDetail item={item} />
            </View>
          )}
          contentContainerStyle={styles.orderList}
          ListHeaderComponent={() => (
            <View style={styles.orderInfoCard}>
              <OrderList order={order} />
            </View>
          )}
        />
      </View>
    </View>
  );
 };
 const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E6', // Màu nền kem sáng
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#B22222', // Màu đỏ trầm
    fontSize: 16,
    fontWeight: '600',
    margin: 20,
  },
  statusBar: {
    backgroundColor: '#FFF',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D7CCC8',
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6D4C41', // Nâu đậm
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#A1887F', // Nâu nhạt
    backgroundColor: '#FFF8E1', // Nền nhạt hơn
    elevation: 3,
    shadowColor: '#8D6E63',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  activeStatusButton: {
    backgroundColor: '#6D4C41', // Nâu đậm
    borderColor: '#6D4C41',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#6D4C41',
  },
  activeStatusText: {
    color: '#FFF',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    marginTop: 15,
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#8D6E63',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#8D6E63', // Nâu nhẹ
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5D4037',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
    backgroundColor: '#FAF3E6',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 15,
  },
  orderInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#795548', // Bóng màu nâu
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  orderItemCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#795548',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  orderList: {
    paddingBottom: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  statLabel: {
    fontSize: 14,
    color: '#8D6E63',
  },
  statContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
});


 export default OrderDetailScreen;