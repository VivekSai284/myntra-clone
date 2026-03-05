import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useTheme } from "@/hooks/useTheme";

import axios from "axios";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { user } = useAuth();
  const [product, setproduct] = useState<any>(null);
  const [iswishlist, setiswishlist] = useState(false);
  const { addRecentlyViewed } = useRecentlyViewed();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // ✅ FETCH PRODUCT
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `https://myntra-clone-j4a9.onrender.com/product/${id}`,
        );
        setproduct(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchproduct();
  }, [id]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [product, currentImageIndex]);

  useEffect(() => {
    if (!product?._id) return;
    addRecentlyViewed(product);
  }, [product?._id]);

  const startAutoScroll = () => {
    if (!product?.images?.length) return;

    autoScrollTimer.current = setInterval(() => {
      if (scrollViewRef.current) {
        const nextIndex = (currentImageIndex + 1) % product.images.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        setCurrentImageIndex(nextIndex);
      }
    }, 3000);
  };

  // ✅ LOADING UI
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ✅ PRODUCT NOT FOUND
  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.colors.text }}>Product not found</Text>
      </View>
    );
  }

  // ✅ WISHLIST
  const handleAddwishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      await axios.post(`https://myntra-clone-j4a9.onrender.com/wishlist`, {
        userId: user._id,
        productId: id,
      });
      setiswishlist(true);
      router.push("/wishlist");
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ ADD TO BAG 
  const handleAddToBag = async () => { 
    if (!user) { 
      router.push("/login"); 
      return; 
    } 
    if (!selectedSize) { 
      alert("Please select a size");
       return; 
      } 
      
      try { 
        setLoading(true);
         await axios.post("https://myntra-clone-j4a9.onrender.com/bag", 
          { 
          userId: user._id,
           productId: id, 
           size: selectedSize, 
           quantity: 1, 
          }); 
          router.push("/bag"); 
        } catch (error) { 
          console.log(error); 
        } finally { 
          setLoading(false);
         } 
        };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / width);
    setCurrentImageIndex(imageIndex);

    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      startAutoScroll();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((image: any, index: any) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.productImage, { width }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {product.images.map((_: any, index: any) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentImageIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.name}>{product.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleAddwishlist}
            >
              <Ionicons
                name={iswishlist ? "heart" : "heart-outline"}
                size={24}
                color={iswishlist ? theme.colors.primary : theme.colors.subText}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.discount}>{product.discount}</Text>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.sizeSection}>
            <Text style={styles.sizeTitle}>Select Size</Text>
            <View style={styles.sizeGrid}>
              {product.sizes.map((size: any) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.selectedSize,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size && styles.selectedSizeText,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToBagButton}
          onPress={handleAddToBag}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="bag-outline" size={20} color="#fff" />
              <Text style={styles.addToBagText}>ADD TO BAG</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    carouselContainer: {
      position: "relative",
    },
    productImage: {
      height: 400,
    },
    pagination: {
      position: "absolute",
      bottom: 16,
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      marginHorizontal: 4,
    },
    paginationDotActive: {
      backgroundColor: "#fff",
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    brand: {
      fontSize: 16,
      color: theme.colors.subText,
      marginBottom: 5,
    },
    name: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 10,
    },
    wishlistButton: {
      padding: 10,
    },
    priceContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    price: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginRight: 10,
    },
    discount: {
      fontSize: 16,
      color: theme.colors.primary,
    },
    description: {
      fontSize: 16,
      color: theme.colors.subText,
      lineHeight: 24,
      marginBottom: 20,
    },
    sizeSection: {
      marginBottom: 20,
    },
    sizeTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 10,
    },
    sizeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    sizeButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    selectedSize: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.card,
    },
    sizeText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    selectedSizeText: {
      color: theme.colors.primary,
      fontWeight: "bold",
    },
    footer: {
      padding: 15,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    addToBagButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 15,
      borderRadius: 10,
      gap: 10,
    },
    addToBagText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
