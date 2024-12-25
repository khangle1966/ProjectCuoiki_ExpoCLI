import { Text, FlatList, ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import OrderList from '@/components/OrderList';
import { useAdminOrderList } from '@/api/orders';
import { useInsertOrderSubcription } from '@/api/orders/subcriptions';
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "@/constants/Colors";
import { useState } from 'react';
import { isToday, parseISO } from 'date-fns';
import { useAdminOrdersSubscription } from '@/api/orders/subcriptions';

export default function OrdersScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'new', 'processing'
  const {
    data: orders,
    isLoading,
    error,
  } = useAdminOrderList({ archived: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
  }


  useInsertOrderSubcription();
  useAdminOrdersSubscription();

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={40} color="#FF4444" />
        <Text style={styles.errorText}>
          Failed to fetch orders: {error.message || 'Unknown error'}
        </Text>
      </View>
    );
  }


  const filteredOrders = orders?.filter(order => {
    if (selectedFilter === 'all') return true;
  
    // Log để debug
    if (selectedFilter === 'new') {
      const orderDate = parseISO(order.created_at);
      const isOrderToday = isToday(orderDate);
      console.log('Order:', {
        id: order.id,
        created_at: order.created_at,
        parsed_date: orderDate,
        is_today: isOrderToday,
        seatNumber: order.seat_number, // Thay status bằng seat_number
      });
  
      // Chỉ check ngày tạo, không check seat_number
      return isToday(orderDate);
    }
  
    if (selectedFilter === 'processing') {
      // Thay thế điều kiện lọc với seat_number
      return ['1', '2', '3'].includes(order.seat_number); // Điều kiện này tùy thuộc vào logic của bạn
    }
  
    return true;
  });

  const getOrderStats = () => {
    const newOrders = orders?.filter(o => o.seat_number === '1' && isToday(parseISO(o.created_at))).length || 0;
    const processingOrders = orders?.filter(o => ['2', '3'].includes(o.seat_number)).length || 0;
    const totalValue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
    return { newOrders, processingOrders, totalValue };
  };
  

  const stats = getOrderStats();

  return (
    <View style={styles.container}>
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="document-text-outline" size={24} color={Colors.light.tint} />
          <Text style={styles.statNumber}>{orders?.length || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="time-outline" size={24} color="#FFB347" />
          <Text style={styles.statNumber}>{stats.processingOrders}</Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="cash-outline" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>${stats.totalValue.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {[
          { id: 'all', label: 'All Orders', icon: 'list' },
          { id: 'new', label: 'New Today', icon: 'star' },
          { id: 'processing', label: 'Processing', icon: 'time' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              selectedFilter === filter.id && styles.activeFilter
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <Icon
              name={`${filter.icon}-outline`}
              size={20}
              color={selectedFilter === filter.id ? 'white' : Colors.light.tint}
            />
            <Text style={[
              styles.filterText,
              selectedFilter === filter.id && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <OrderList order={item} />
          </View>
        )}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3E3', // Tone nâu nhẹ
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: '#D9534F', // Tone đỏ nâu
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
    backgroundColor: '#F4E1D2', // Tone nâu nhẹ hơn
    borderBottomWidth: 1,
    borderBottomColor: '#E2C9B0',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#8B5E34', // Màu bóng tone nâu
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B5E34',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#7A4E29',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    backgroundColor: '#E8D3C1',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5E34',
  },
  activeFilter: {
    backgroundColor: '#8B5E34',
  },
  filterText: {
    color: '#8B5E34',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  ordersList: {
    padding: 15,
    gap: 15,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#8B5E34',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#D1A77D', // Đường viền nhấn bên trái
  },
});


