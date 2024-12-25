import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';
import RemoteImage from '@/components/RemoteImage';
import { defaultPizzaImage } from '@/app/(admin)/menu/create';

export default function OrderConfirmationScreen() {
  const { id } = useLocalSearchParams(); // Lấy ID từ URL params
  const [order, setOrder] = useState(null); // Lưu thông tin đơn hàng
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  // Hàm tính giá sản phẩm dựa trên kích thước
  const getPriceBySize = (basePrice, size) => {
    const sizeMultipliers = {
      S: 1,
      M: 1.2,
      L: 1.5,
      XL: 1.8,
    };
    return basePrice * sizeMultipliers[size];
  };

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const formattedDate = dateString.split('.')[0]; // Loại bỏ phần microsecond
    const date = new Date(formattedDate);
    if (isNaN(date)) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  // Hàm lấy thông tin đơn hàng từ Supabase
  const fetchOrderDetails = async () => {
    try {
      const user = supabase.auth.user(); // Lấy thông tin user từ Supabase
  
      if (!user) {
        console.error("Không tìm thấy thông tin người dùng.");
        setOrder(null);
        return;
      }
  
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total,
          seat_number,
          order_items (
            product_id,
            size,
            quantity,
            products (
              name,
              price,
              image
            )
          )
        `)
        .eq('id', id) // Lấy đơn hàng theo ID
        .eq('user_id', user.id) // Chỉ lấy đơn hàng của user hiện tại
        .single();
  
      if (error) {
        console.error('Error fetching order details:', error);
        setOrder(null);
        return;
      }
  
      // Xử lý dữ liệu sản phẩm trong đơn hàng
      const itemsWithProducts = data.order_items.map((item) => ({
        ...item,
        product: item.products,
      }));
  
      // Lưu thông tin đơn hàng vào state
      setOrder({
        ...data,
        items: itemsWithProducts,
      });
    } catch (err) {
      console.error('Unexpected error fetching order details:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  // Gọi API khi component được render lần đầu
  useEffect(() => {
    setLoading(true);
    fetchOrderDetails();
  }, [id]);

  // Hiển thị giao diện tải dữ liệu
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị nếu không tìm thấy đơn hàng
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Order Details', headerShown: false }} />
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>

        {/* Seat Number */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="seat-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Seat Number</Text>
          </View>
          <View style={styles.seatInfo}>
            <Text style={styles.seatText}>{order.seat_number || 'No seat selected'}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="fast-food-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Order Items</Text>
          </View>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <RemoteImage
                path={item.product.image}
                fallback={defaultPizzaImage}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <View style={styles.itemSpecs}>
                  <View style={styles.specBadge}>
                    <Text style={styles.specText}>Size {item.size}</Text>
                  </View>
                  <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>
                ${(getPriceBySize(item.product.price, item.size) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="receipt-outline" size={24} color={Colors.light.tint} />
            <Text style={styles.cardTitle}>Payment Summary</Text>
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.total.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#ff4444' },
  header: { marginBottom: 20 },
  orderInfo: { flex: 1 },
  orderId: { fontSize: 24, fontWeight: '700', color: '#333' },
  orderDate: { fontSize: 14, color: '#666', marginTop: 4 },
  statusBadge: { backgroundColor: Colors.light.tint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: 'white', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginLeft: 8 },
  seatInfo: { marginTop: 16, alignItems: 'center' },
  seatText: { fontSize: 20, fontWeight: '700', color: Colors.light.tint },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333' },
  itemSpecs: { flexDirection: 'row', alignItems: 'center' },
  specBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  specText: { fontSize: 12, color: '#666' },
  itemQuantity: { fontSize: 14, color: '#666' },
  itemPrice: { fontSize: 16, fontWeight: '600', color: Colors.light.tint },
  summaryContainer: { marginTop: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: '700', color: Colors.light.tint },
});
