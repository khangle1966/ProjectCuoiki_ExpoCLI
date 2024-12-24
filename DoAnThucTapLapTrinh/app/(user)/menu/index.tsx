import React, { useState } from "react";
import { Stack } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Pressable,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFetchProducts } from "@/api/products";
import ProductList from "@/components/ProductList";
import { Link } from "expo-router";
import { useCart } from "@/context/CartProvider";
import { LinearGradient } from "expo-linear-gradient";

function CartIcon() {
  const { items } = useCart();
  const itemCount = items.length;

  return (
    <Link href="/cart" asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={styles.cartContainer}>
            <View style={styles.cartIconBg}>
              <FontAwesome
                name="shopping-basket"
                size={20}
                color="#FFF8DC"
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            </View>
            {itemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Link>
  );
}

export default function Home() {
  const { data: products, error, isLoading } = useFetchProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [sortOrder, setSortOrder] = useState("none");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { id: 1, name: "Coffee", icon: require("@/assets/images/iconCafe.png") },
    { id: 2, name: "Tea", icon: require("@/assets/images/iconTea.png") },
    { id: 3, name: "Nuocep", icon: require("@/assets/images/iconJuice.jpg") },
  ];

  const filterAndSortProducts = (products) => {
    return products
      ?.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;
        const matchesPrice =
          selectedPriceRange === "All" ||
          (selectedPriceRange === "0-5" && product.price <= 5) ||
          (selectedPriceRange === "5-10" &&
            product.price > 5 &&
            product.price <= 10) ||
          (selectedPriceRange === "10+" && product.price > 10);
        return matchesSearch && matchesPrice && matchesCategory;
      })
      ?.sort((a, b) => {
        if (sortOrder === "asc") return a.price - b.price;
        if (sortOrder === "desc") return b.price - a.price;
        return 0;
      });
  };

  const categorizedProducts = {
    "Cà Phê": filterAndSortProducts(
      products?.filter((p) => p.category === "Coffee")
    ),
    "Trà": filterAndSortProducts(products?.filter((p) => p.category === "Tea")),
    "Nước ép": filterAndSortProducts(products?.filter((p) => p.category === "Nuocep")), // Thêm logic lọc Nước ép
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("@/assets/images/background1.jpg")}
        style={styles.headerBackground}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0)"]}
          style={styles.headerGradient}
        >
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.locationHeader}>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Quán Cà Phê Của Mình :3</Text>
              <View style={styles.locationRow}>
                <Icon
                  name="cafe"
                  size={20}
                  color="#FFF8DC"
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText}>Góc Cafe Ấm Cúng</Text>
                <Icon name="chevron-down" size={20} color="#FFF8DC" />
              </View>
            </View>
            <View style={styles.headerRightContainer}>
              <TouchableOpacity style={styles.notificationButton}>
                <View style={styles.iconBg}>
                  <Icon
                    name="notifications-outline"
                    size={20}
                    color="#FFF8DC"
                  />
                </View>
              </TouchableOpacity>
              <CartIcon />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView style={styles.container} stickyHeaderIndices={[1]}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Chào buổi sáng,</Text>
          <Text style={styles.welcomeName}>Người yêu cà phê</Text>
        </View>

        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search-outline" size={20} color="#8B4513" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm trong thực đơn..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#8B4513"
              />
            </View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="options-outline" size={20} color="#FFF8DC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  category.name === selectedCategory &&
                  styles.activeCategoryItem,
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <View style={styles.categoryImageContainer}>
                  <Image source={category.icon} style={styles.categoryImage} />
                  <View style={styles.categoryOverlay} />
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    category.name === selectedCategory &&
                    styles.activeCategoryName,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#8B4513"
            style={styles.loader}
          />
        ) : (
          <View style={styles.productsContainer}>
            {selectedCategory === "All" || selectedCategory === "Coffee" ? (
              <View style={styles.categorySection}>
                <Text style={styles.categoryTitle}>Cà Phê</Text>
                <FlatList
                  data={categorizedProducts["Cà Phê"]}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </View>
            ) : null}

            {selectedCategory === "All" || selectedCategory === "Tea" ? (
              <View style={styles.categorySection}>
                <Text style={styles.categoryTitle}>Trà</Text>
                <FlatList
                  data={categorizedProducts["Trà"]}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </View>
            ) : null}

            {selectedCategory === "All" || selectedCategory === "Nuocep" ? (
              <View style={styles.categorySection}>
                <Text style={styles.categoryTitle}>Nước ép</Text>
                <FlatList
                  data={categorizedProducts["Nước ép"]}
                  renderItem={({ item }) => <ProductList product={item} />}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  contentContainerStyle={styles.productGrid}
                  columnWrapperStyle={styles.productRow}
                  scrollEnabled={false}
                />
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc & Sắp Xếp</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#FFF8DC" />
              </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.filterSectionTitle}>Khoảng giá</Text>
              <View style={styles.chipContainer}>
                {["All", "0-5", "5-10", "10+"].map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.chip,
                      range === selectedPriceRange && styles.activeChip,
                    ]}
                    onPress={() => setSelectedPriceRange(range)}
                  >
                    <Text
                      style={
                        range === selectedPriceRange
                          ? styles.activeChipText
                          : styles.chipText
                      }
                    >
                      {range === "All" ? "Tất cả" : `$${range}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
              <View style={styles.chipContainer}>
                {["none", "asc", "desc"].map((order) => (
                  <TouchableOpacity
                    key={order}
                    style={[
                      styles.chip,
                      order === sortOrder && styles.activeChip,
                    ]}
                    onPress={() => setSortOrder(order)}
                  >
                    <Text
                      style={
                        order === sortOrder
                          ? styles.activeChipText
                          : styles.chipText
                      }
                    >
                      {order === "none"
                        ? "Mặc định"
                        : order === "asc"
                          ? "Giá: Thấp đến Cao"
                          : "Giá: Cao đến Thấp"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  headerBackground: {
    height: 200,
  },
  headerGradient: {
    height: '100%',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    marginTop: -80,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#FFF8DC",
    opacity: 0.8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF8DC",
    marginRight: 4,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    backgroundColor: 'rgba(139, 69, 19, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIconBg: {
    backgroundColor: '#8B4513',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#D2691E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF8DC',
  },
  badgeText: {
    color: '#FFF8DC',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#8B4513',
    opacity: 0.8,
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0E0E',
    marginTop: 4,
  },
  searchWrapper: {
    backgroundColor: '#FFF',
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAEBD7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#8B4513',
  },
  filterButton: {
    backgroundColor: '#8B4513',
    padding: 12,
    borderRadius: 12,
  },
  categoriesSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#4A0E0E',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryItem: {
    marginRight: 16,
    width: 100,
  },
  categoryImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    position: 'relative',
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: '#8B4513',
    textAlign: 'center',
  },
  activeCategoryName: {
    color: '#4A0E0E',
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: '#4A0E0E',
    marginBottom: 16,
  },
  productGrid: {
    gap: 16,
  },
  productRow: {
    gap: 16,
  },
  loader: {
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF8DC",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: '#4A0E0E',
  },
  closeButton: {
    backgroundColor: '#8B4513',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: '#8B4513',
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#FAEBD7',
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  activeChip: {
    backgroundColor: '#8B4513',
  },
  chipText: {
    fontSize: 16,
    color: '#8B4513',
  },
  activeChipText: {
    color: '#FFF8DC',
    fontWeight: "600",
  },
});

