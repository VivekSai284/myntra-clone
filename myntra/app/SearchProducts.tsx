import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import axios from "axios";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setSubmittedQuery(query);
    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://myntra-clone-j4a9.onrender.com/product/search?q=${query}`,
      );
      setResults(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 10 }}
      >
        {/* Search Input */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.subText}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={{ color: "white", fontWeight: "bold" }}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Results Header */}
        {submittedQuery ? (
          <Text style={styles.resultsText}>Results for "{submittedQuery}"</Text>
        ) : null}

        {/* Loader */}
        {isLoading && (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        )}

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {results.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.productCard}
              onPress={() => handleProductPress(item._id)}
            >
              <Image
                source={{
                  uri:
                    item.images && item.images[0]
                      ? item.images[0]
                      : "https://via.placeholder.com/150",
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.brandName}>{item.brand}</Text>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productPrice}>₹{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
      paddingTop: 10,
      backgroundColor: theme.colors.background,
    },
    searchBar: {
      flexDirection: "row",
      marginBottom: 10,
    },
    searchInput: {
      color: theme.colors.text,
      flex: 1,
      backgroundColor: theme.colors.card,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchButton: {
      marginLeft: 10,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 15,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    resultsText: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.colors.text,
    },
    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    productCard: {
      width: "48%", // 2 per row
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    productImage: {
      width: "100%",
      height: 150,
      resizeMode: "cover",
    },
    productInfo: {
      padding: 10,
    },
    brandName: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.colors.subText,
    },
    productName: {
      fontSize: 14,
      color: theme.colors.text,
      marginVertical: 2,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
