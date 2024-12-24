import { Product } from "@/app/types";
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Tables } from "@/app/types";
import { Link, useSegments } from "expo-router";
import { defaultPizzaImage } from "@/app/(admin)/menu/create";
import RemoteImage from "./RemoteImage";
import { Colors } from "@/constants/Colors";
import Icon from 'react-native-vector-icons/Ionicons';
import AddToCartButton from './AddToCartButton';

type ProductListItemProps = {
  product: Tables<'products'>;
};

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 2 columns with 16px padding on each side and 16px gap

const ProductList = ({ product }: ProductListItemProps) => {
  const segments = useSegments();
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (event: any) => {
    event.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getPriceBySize = {
    S: product.price,
    M: product.price * 1.2,
    L: product.price * 1.5, 
    XL: product.price * 1.8
  };

  const handleAddToCart = () => {
    addItem({
      ...product,
      size: 'S',
      price: getPriceBySize['S']
    });
  };

  return (
    <View style={styles.container}>
      <Link href={`/${segments[0]}/menu/${product.id}`} asChild>
        <Pressable style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <RemoteImage
              path={product.image}
              fallback={defaultPizzaImage}
              style={styles.image}
              resizeMode="cover"
            />
            <Pressable
              style={styles.favoriteButton}
              onPress={toggleFavorite}
            >
              <Icon
                name={isFavorite ? "heart" : "heart-outline"}
                size={18}
                color={isFavorite ? "#FF4444" : "#8B4513"}
              />
            </Pressable>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{product.name}</Text>

            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                <Icon name="star" size={12} color="#FFD700" />
                <Icon name="star" size={12} color="#FFD700" />
                <Icon name="star" size={12} color="#FFD700" />
                <Icon name="star" size={12} color="#FFD700" />
                <Icon name="star-half" size={12} color="#FFD700" />
              </View>
              <Text style={styles.ratingText}>(4.5)</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <AddToCartButton product={product} />
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    marginBottom: 16,
  },
  contentContainer: {
    backgroundColor: "#FFF8DC",
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#8B4513",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: "100%",
    height: itemWidth,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 248, 220, 0.8)',
    padding: 8,
    borderRadius: 20,
    shadowColor: "#8B4513",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A0E0E",
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#8B4513',
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B4513",
  },
});

export default ProductList;

