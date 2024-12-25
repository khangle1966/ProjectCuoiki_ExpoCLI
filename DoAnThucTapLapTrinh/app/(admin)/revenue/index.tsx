import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const RevenueScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [selectedMonth, selectedDate]);

  const fetchRevenue = async () => {
    try {
      setIsLoading(true);

      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .eq('status', 'Delivered');

      if (monthlyError) throw monthlyError;

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: dailyData, error: dailyError } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .eq('status', 'Delivered');

      if (dailyError) throw dailyError;

      const monthlyTotal = monthlyData.reduce((sum, order) => sum + (order.total || 0), 0);
      const dailyTotal = dailyData.reduce((sum, order) => sum + (order.total || 0), 0);

      setMonthlyRevenue(monthlyTotal);
      setDailyRevenue(dailyTotal);
      setOrderCount(dailyData.length);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const StatCard = ({ label, value, icon, color }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: opacity,
          transform: [{ translateY }],
          backgroundColor: color,
        },
      ]}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </BlurView>
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backgroundCircle} />
      <View style={styles.backgroundCircle2} />

      <View style={styles.header}>
        <Animated.Text style={[styles.headerTitle, { opacity, transform: [{ translateY }] }]}>Revenue Analytics</Animated.Text>
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowMonthPicker(!showMonthPicker)}
        >
          <Icon name="calendar-outline" size={22} color="#333" />
          <Text style={styles.dateText}>
            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Icon name="today-outline" size={22} color="#333" />
          <Text style={styles.dateText}>{selectedDate.toLocaleDateString('en-US')}</Text>
        </TouchableOpacity>
      </View>

      {showMonthPicker && (
        <DateTimePicker
          value={selectedMonth}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            if (event.type === 'set') {
              if (date) setSelectedMonth(date);
            }
            setShowMonthPicker(false);
          }}
          textColor="#000000"
          themeVariant="light"
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(event, date) => {
            if (event.type === 'set') {
              if (date) setSelectedDate(date);
            }
            setShowDatePicker(false);
          }}
          textColor="#000000"
          themeVariant="light"
        />
      )}

<View style={styles.statsContainer}>
  <StatCard
    label="Monthly Revenue"
    value={formatCurrency(monthlyRevenue)}
    icon="bar-chart"
    color="#D4A373" // Nâu ánh vàng
  />
  <StatCard
    label="Daily Revenue"
    value={formatCurrency(dailyRevenue)}
    icon="trending-up"
    color="#C68B59" // Nâu caramel
  />
  <StatCard
    label="Today's Orders"
    value={orderCount.toString()}
    icon="document-text"
    color="#8C5E58" // Nâu đỏ gụ
  />
</View>


      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#333" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: '#D9C3B6',
    borderRadius: 150,
    top: -50,
    left: -50,
    opacity: 0.4,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#B8A091',
    borderRadius: 125,
    top: 400,
    right: -70,
    opacity: 0.4,
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A3F35',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9DFD3',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A3F35',
    marginLeft: 10,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    marginBottom: 20,
    borderRadius: 15,
    elevation: 6,
    overflow: 'hidden',
    shadowColor: '#4A3F35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    padding: 15,
    backgroundColor: '#FFFFFF', // Bị thay bởi màu động
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 15,
  },
  blurContainer: {
    padding: 15,
    borderRadius: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Nền nhạt cho biểu tượng
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Chữ màu trắng
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Chữ màu trắng
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



export default RevenueScreen;
