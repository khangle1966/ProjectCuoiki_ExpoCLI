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
      case 'Delivering': return 'bicycle-outline';
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
            backgroundColor: Colors.light.tint,
          },
          headerTintColor: '#fff',
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
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    margin: 20,
  },
  statusBar: {
    backgroundColor: 'white',
    padding: 15,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    paddingVertical: 5,
    gap: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    gap: 8,
    elevation: 1,
  },
  statusText: {
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 10,
    padding: 15,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  orderInfoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  orderItemCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  orderList: {
    paddingBottom: 20,
  },
 });
 
 export default OrderDetailScreen;