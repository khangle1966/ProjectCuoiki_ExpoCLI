import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useFetchProducts } from "@/api/products";
import Icon from "react-native-vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import RemoteImage from "@/components/RemoteImage";
import { defaultPizzaImage } from "./create";

const ListItem = ({ product, onPress }) => (
  <TouchableOpacity onPress={() => onPress(product)} style={styles.listItem}>
    <RemoteImage 
      path={product.image}
      fallback={defaultPizzaImage}
      style={styles.productImage}
    />
    <View style={styles.itemContent}>
      <Text style={styles.itemName}>{product.name}</Text>
      <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
    </View>
  </TouchableOpacity>
);

export default function AdminMenu() {
  const { data: products, error, isLoading, refetch } = useFetchProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handlePress = (product) => {
    router.push(`/menu/${product.id}`);
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator />
    </SafeAreaView>
  );
  
  if (error) return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text>Error loading products</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: "",
            headerShown: false,
          }} 
        />

        <View style={styles.topStats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              ${products?.reduce((sum, p) => sum + p.price, 0).toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <ListItem
              product={item}
              onPress={handlePress}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push("/menu/create")}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF3E0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF3E0',
  },
  topStats: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#D7BFAE',
    borderBottomWidth: 1,
    borderBottomColor: '#C8A27C',
    borderRadius: 10,
    margin: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F3E5D4',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8C5438',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B4C2A',
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9E8D5',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8A27C',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#6B4C2A',
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFF5E4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#E8D1C3',
  },
  itemContent: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4C2A',
  },
  itemPrice: {
    fontSize: 14,
    color: '#8C5438',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#8C5438',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
