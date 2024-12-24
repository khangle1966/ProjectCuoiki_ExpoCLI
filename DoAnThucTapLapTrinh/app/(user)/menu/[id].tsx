import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useCart } from "@/context/CartProvider";
import { PizzaSize } from "@/app/types";
import { useFetchProductById } from "@/api/products";
import { ActivityIndicator } from "react-native";
import RemoteImage from "@/components/RemoteImage";
import { defaultCafeImage } from "@/app/(admin)/menu/create";
import Icon from "react-native-vector-icons/Ionicons";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");
const sizes: PizzaSize[] = ["S", "M", "L"];

const getPriceBySize = (basePrice: number) => ({
  S: basePrice,
  M: basePrice * 1.2,
  L: basePrice * 1.5,
});

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const { data: product, error, isLoading } = useFetchProductById(parseInt(typeof id === "string" ? id : id[0]));
  const [sizeSelected, setSizeSelected] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  if (isLoading) {
    return <ActivityIndicator size="large" color="#8B4513" />;
  }

  if (!product) return <Text>Product not found</Text>;

  const priceBySize = getPriceBySize(product.price);
  const currentPrice = priceBySize[sizeSelected];

  const addToCart = () => {
    if (!product) return;
    addItem({
      ...product,
      price: currentPrice,
    }, sizeSelected);
    router.push("/cart");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.heroContainer}>
        <RemoteImage
          path={product.image}
          fallback={defaultCafeImage}
          style={styles.heroImage}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Icon name="chevron-back" size={28} color="#FFF8DC" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewCount}>(123 reviews)</Text>
            </View>
            <Text style={styles.price}>${currentPrice.toFixed(2)}</Text>
          </View>

          <Text style={styles.sectionTitle}>Choose Size</Text>
          <View style={styles.sizeContainer}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => setSizeSelected(size)}
                style={[
                  styles.sizeOption,
                  sizeSelected === size && styles.selectedSize,
                ]}
              >
                <Icon 
                  name="cafe" 
                  size={24} 
                  color={sizeSelected === size ? "#FFF8DC" : "#8B4513"} 
                />
                <Text style={[
                  styles.sizeText,
                  sizeSelected === size && styles.selectedSizeText
                ]}>
                  {size}
                </Text>
                <Text style={[
                  styles.sizePriceText,
                  sizeSelected === size && styles.selectedSizePriceText
                ]}>
                  ${priceBySize[size].toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.description || "A delightful blend of flavors, carefully crafted to perfection. Made with premium ingredients and brewed to order for the ultimate cafe experience."}
          </Text>

          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Icon name="remove" size={24} color="#8B4513" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Icon name="add" size={24} color="#8B4513" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>
            ${(currentPrice * quantity).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addToCart}>
          <Icon name="cart" size={24} color="#FFF8DC" />
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: width * 0.8,
    backgroundColor: '#8B4513',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    marginTop: width * 0.6,
  },
  contentContainer: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 20,
    paddingTop: 25,
    minHeight: Dimensions.get('window').height - (width * 0.6),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A0E0E',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
    color: '#4A0E0E',
  },
  reviewCount: {
    color: '#8B4513',
    marginLeft: 5,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A0E0E',
    marginBottom: 15,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  sizeOption: {
    width: 80,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#D2B48C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  selectedSize: {
    backgroundColor: '#8B4513',
  },
  sizeText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
    color: '#4A0E0E',
  },
  selectedSizeText: {
    color: '#FFF8DC',
  },
  sizePriceText: {
    marginTop: 4,
    fontSize: 14,
    color: '#4A0E0E',
    fontWeight: '500',
  },
  selectedSizePriceText: {
    color: '#FFF8DC',
  },
  description: {
    color: '#8B4513',
    lineHeight: 22,
    marginBottom: 25,
  },
  quantitySection: {
    marginBottom: 20,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D2B48C',
    borderRadius: 12,
    padding: 5,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    color: '#4A0E0E',
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#D2B48C',
    borderTopWidth: 1,
    borderTopColor: '#8B4513',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    color: '#4A0E0E',
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF8DC',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProductDetailScreen;

