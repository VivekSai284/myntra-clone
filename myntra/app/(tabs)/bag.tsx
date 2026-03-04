import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import axios from "axios";

export default function Bag() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchproduct();
  }, [user]);

  const fetchproduct = async () => {
    if (user) {
      try {
        setIsLoading(true);
        const bagRes = await axios.get(
          `https://myntra-clone-j4a9.onrender.com/bag/${user._id}`,
        );

        setActiveItems(bagRes.data.activeItems);
        setSavedItems(bagRes.data.savedItems);
        setTotal(bagRes.data.total);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    try {
      await axios.put(
        `https://myntra-clone-j4a9.onrender.com/bag/update/${itemId}`,
        { quantity: newQty },
      );
      fetchproduct();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const moveToSaved = async (itemId: string) => {
    try {
      await axios.put(
        `https://myntra-clone-j4a9.onrender.com/bag/save/${itemId}`,
      );

      fetchproduct(); // refresh cart
    } catch (error: any) {
      alert("Error moving to saved");
    }
  };

  const moveToBag = async (itemId: string) => {
    try {
      await axios.put(
        `https://myntra-clone-j4a9.onrender.com/bag/move-to-bag/${itemId}`,
      );

      fetchproduct();
    } catch (error: any) {
      alert("Error moving to bag");
    }
  };

  const handledelete = async (itemid: any) => {
    try {
      await axios.delete(
        `https://myntra-clone-j4a9.onrender.com/bag/${itemid}`,
      );
      fetchproduct();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post(
        `https://myntra-clone-j4a9.onrender.com/bag/validate/${user._id}`,
      );
      // If validation passes
      router.push("/checkout");
    } catch (error: any) {
      const msg = error.response?.data?.message;

      if (msg === "Price changed") {
        alert(
          `Price updated from ₹${error.response.data.oldPrice} to ₹${error.response.data.newPrice}`,
        );
      } else if (msg === "Stock insufficient") {
        alert("Some items are out of stock.");
      } else if (msg === "Product discontinued") {
        alert("Some items are no longer available.");
      } else {
        alert("Cart validation failed.");
      }

      fetchproduct(); // refresh bag
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>Please login to view your bag</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Bag</Text>
      </View>

      <ScrollView style={styles.content}>
        {activeItems?.map((item: any) => (
          <View key={item._id} style={styles.bagItem}>
            <Image
              source={{ uri: item.productId.images[0] }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.brandName}>{item.productId.brand}</Text>
              <Text style={styles.itemName}>{item.productId.name}</Text>
              <Text style={styles.itemSize}>Size: {item.size}</Text>
              <Text style={styles.itemPrice}>₹{item.productId.price}</Text>

              <View style={styles.bottomRow}>
                {/* Quantity Controls */}
                <View style={styles.quantityWrapper}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() =>
                      item.quantity > 1 &&
                      updateQuantity(item._id, item.quantity - 1)
                    }
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => moveToSaved(item._id)}
                  >
                    <Ionicons
                      name="bookmark-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handledelete(item._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#E53935" />
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {savedItems.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginVertical: 10,
                color: theme.colors.text,
              }}
            >
              Saved For Later
            </Text>

            {savedItems.map((item: any) => (
              <View key={item._id} style={styles.bagItem}>
                <Image
                  source={{ uri: item.productId.images[0] }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.brandName}>{item.productId.brand}</Text>
                  <Text style={styles.itemName}>{item.productId.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.priceAtTime}</Text>

                  <TouchableOpacity
                    style={styles.moveToBagButton}
                    onPress={() => moveToBag(item._id)}
                  >
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                    <Text style={styles.moveToBagText}>Move to Bag</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>PLACE ORDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      padding: 15,
      paddingTop: 50,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: theme.colors.text },
    content: { flex: 1, padding: 15 },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyTitle: {
      fontSize: 18,
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 10,
    },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    bagItem: {
      flexDirection: "row",
      backgroundColor: theme.colors.card,
      borderRadius: 10,
      marginBottom: 15,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemImage: { width: 100, height: 120 },
    itemInfo: { flex: 1, padding: 15 },
    brandName: { fontSize: 14, color: theme.colors.subText, marginBottom: 5 },
    itemName: { fontSize: 16, color: theme.colors.text, marginBottom: 5 },
    itemSize: { fontSize: 14, color: theme.colors.subText, marginBottom: 5 },
    itemPrice: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 10,
    },
    quantityContainer: { flexDirection: "row", alignItems: "center" },
    quantityButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quantity: { marginHorizontal: 15, fontSize: 16 },
    removeButton: { marginLeft: "auto" },
    footer: {
      padding: 15,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    totalContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    totalLabel: { fontSize: 16, color: theme.colors.text },
    totalAmount: { fontSize: 18, fontWeight: "bold", color: theme.colors.text },
    checkoutButton: {
      backgroundColor: theme.colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    checkoutButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

    bottomRow: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    quantityWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    qtyButton: {
      padding: 6,
    },

    qtyText: {
      marginHorizontal: 10,
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },

    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
    },

    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      marginRight: 8,
    },

    saveText: {
      marginLeft: 4,
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },

    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: "#FDECEA",
    },

    deleteText: {
      marginLeft: 4,
      color: "#E53935",
      fontSize: 13,
      fontWeight: "600",
    },

    moveToBagButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 8,
    },

    moveToBagText: {
      color: "#fff",
      marginLeft: 5,
      fontWeight: "600",
      fontSize: 13,
    },
  });
