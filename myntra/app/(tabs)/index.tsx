import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/hooks/useTheme";

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>(null);
  const [categories, setcategories] = useState<any>(null);
  const { user } = useAuth();

  const handleProductPress = (productId: number) => {
    user ? router.push(`/product/${productId}`) : router.push("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          axios.get("https://myntra-clone-j4a9.onrender.com/category"),
          axios.get("https://myntra-clone-j4a9.onrender.com/product"),
        ]);
        setcategories(catRes.data);
        setproduct(prodRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MYNTRA</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push("/SearchProducts")}
        >
          <Ionicons name="search-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
        }}
        style={styles.banner}
      />

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SHOP BY CATEGORY</Text>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => router.push("/categories")}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            categories?.map((category: any) => (
              <TouchableOpacity key={category._id} style={styles.categoryCard}>
                <Image
                  source={{ uri: category.image }}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Trending Products Grid */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TRENDING NOW</Text>
        </View>
        <View style={styles.productsGrid}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            product?.map((item: any) => (
              <TouchableOpacity
                key={item._id}
                style={styles.productCard}
                onPress={() => handleProductPress(item._id)}
              >
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.brandName}>{item.brand}</Text>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <Text style={styles.discount}>{item.discount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      paddingTop: 50,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    logo: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      letterSpacing: 2,
    },
    searchButton: { padding: 8 },
    banner: { width: "100%", height: 220, resizeMode: "cover" },
    section: { padding: 15 },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
      letterSpacing: 1,
    },
    viewAll: { flexDirection: "row", alignItems: "center" },
    viewAllText: {
      color: theme.colors.primary,
      marginRight: 5,
      fontWeight: "600",
    },
    categoriesScroll: { marginHorizontal: -15, paddingLeft: 15 },
    categoryCard: { width: 85, marginRight: 15, alignItems: "center" },
    categoryImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.colors.card,
    },
    categoryName: {
      textAlign: "center",
      marginTop: 8,
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: "500",
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    productCard: {
      width: "48%",
      marginBottom: 15,
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    productImage: { width: "100%", height: 200 },
    productInfo: { padding: 10 },
    brandName: {
      fontSize: 13,
      color: theme.colors.subText,
      fontWeight: "bold",
    },
    productName: { fontSize: 14, color: theme.colors.text, marginVertical: 2 },
    priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    productPrice: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.text,
      marginRight: 6,
    },
    discount: { fontSize: 12, color: theme.colors.primary, fontWeight: "600" },
    loader: { marginVertical: 20, alignSelf: "center" },
  });
