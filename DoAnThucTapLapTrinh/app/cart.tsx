import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useCart } from "@/context/CartProvider";
import Icon from "react-native-vector-icons/Ionicons";

const CartScreen = () => {
  const { items, updateQuantity, total, checkout, seatNumber, updateSeatNumber } = useCart();
  const [selectedSeat, setSelectedSeat] = useState(seatNumber || null);

  const handleSeatSelection = (seat) => {
    setSelectedSeat(seat);
    updateSeatNumber(seat);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.product.name}</Text>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPrice}>${item.product.price.toFixed(2)}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, -1)}
            style={styles.quantityButton}
          >
            <Icon name="remove" size={20} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.id, 1)}
            style={styles.quantityButton}
          >
            <Icon name="add" size={20} color="#8B4513" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.removeText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Order</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.seatContainer}>
        <Text style={styles.seatLabel}>Select Your Seat:</Text>
        <View style={styles.seatButtonsContainer}>
          {Array.from({ length: 10 }, (_, index) => {
            const seatNumber = index + 1;
            const isSelected = selectedSeat === seatNumber;
            return (
              <TouchableOpacity
                key={seatNumber}
                style={[
                  styles.seatButton,
                  isSelected && styles.selectedSeatButton,
                ]}
                onPress={() => handleSeatSelection(seatNumber)}
              >
                <Text
                  style={[
                    styles.seatButtonText,
                    isSelected && styles.selectedSeatButtonText,
                  ]}
                >
                  {seatNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButton} onPress={checkout}>
          <Text style={styles.buyButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: "#FFF8DC",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 8,
  },
  removeText: {
    fontSize: 14,
    color: "#d9534f",
    fontWeight: "bold",
  },
  seatContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  seatLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  seatButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  seatButton: {
    width: 50,
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  seatButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  selectedSeatButton: {
    backgroundColor: "#8B4513",
  },
  selectedSeatButtonText: {
    color: "#fff",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  buyButton: {
    backgroundColor: "#FFF8DC",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  buyButtonText: {
    fontSize: 18,
    color: "#8B4513",
    fontWeight: "bold",
  },
});

export default CartScreen;
