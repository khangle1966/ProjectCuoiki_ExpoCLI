import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Order, Tables } from "@/app/types";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import { Link, useSegments } from "expo-router";
import { Colors } from "@/constants/Colors";
import Icon from "react-native-vector-icons/Ionicons";
import { useAdminOrdersSubscription } from "@/api/orders/subcriptions";
dayjs.extend(relativeTime);

// Add console.log for debugging
const STATUS_CONFIG = {
  pending: {
    icon: "time-outline",
    color: "#8B4513",
    label: "Brewing"
  },
  cooking: {
    icon: "cafe-outline",
    color: "#D2691E",
    label: "Preparing"
  },
  delivering: {
    icon: "bicycle-outline",
    color: "#2F4F4F",
    label: "On the way"
  },
  delivered: {
    icon: "checkmark-circle-outline",
    color: "#006400",
    label: "Served"
  }
};

type OrderListItemProps = {
  order: Tables<"orders">;
};

const OrderList = ({ order }: OrderListItemProps) => {
  const segments = useSegments();
  
  // Add debug logging
  useEffect(() => {
    console.log('Order data received:', order);
  }, [order]);
  
  // Subscribe to order updates with debug logging
  useAdminOrdersSubscription(order.id, {
    onData: (data) => {
      console.log('Subscription data received:', data);
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  // Add null check and debug logging
  if (!order) {
    console.log('No order data available');
    return null;
  }

  const statusConfig = STATUS_CONFIG[order.status?.toLowerCase()] || STATUS_CONFIG.pending;

  return (
    <Link href={`/${segments[0]}/orders/${order.id}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon 
            name="cafe" 
            size={24} 
            color={Colors.light.tint} 
          />
        </View>

        <View style={styles.detailsContainer}>
        <Text style={styles.title}>Order #{order.id} - Seat {order.seat_number}</Text>
        <Text style={styles.time}>{dayjs(order.created_at).fromNow()}</Text>
          
          <View style={styles.itemsPreview}>
            {order.items && order.items.map((item, index) => {
              // Add debug logging for items
              console.log('Rendering item:', item);
              return (
                <Text key={index} numberOfLines={1} style={styles.itemText}>
                  • {item.quantity}x {item.product.name}
                </Text>
              );
            })}
          </View>
        </View>

        <View style={[styles.statusContainer, { backgroundColor: `${statusConfig.color}15` }]}>
          <Icon 
            name={statusConfig.icon} 
            size={20} 
            color={statusConfig.color} 
          />
          <Text style={[styles.status, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            ${order.total?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8DC", // Cornsilk
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D2B48C", // Tan
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: '#4A0E0E', // Dark brown
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: "#8B4513", // Saddle brown
    marginBottom: 6,
  },
  itemsPreview: {
    marginTop: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#A0522D', // Sienna
    marginBottom: 2,
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
  priceTag: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#8B4513', // Saddle brown
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: '#FFF8DC', // Cornsilk
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OrderList;
  
