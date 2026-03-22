import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "recentlyViewed";
const API_URL = "https://myntra-clone-j4a9.onrender.com/recently-viewed"; 
// 🔥 change this to your Render backend URL

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const { user } = useAuth();

  // 🔹 Load from local storage
  const loadLocal = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.log("Error loading local recently viewed", err);
      return [];
    }
  };

  const saveLocal = async (items: any[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setRecentlyViewed(items);
  };

  // 🔥 Load whenever screen focuses
  useFocusEffect(
    useCallback(() => {
      loadLocal().then(setRecentlyViewed);
    }, [])
  );

  // 🔥 Sync with server (cross-device + merge)
  const syncWithServer = async () => {
    if (!user?._id) return;

    try {
      const localItems = await loadLocal();

      const res = await axios.post(`${API_URL}/sync`, {
        userId: user?._id,
        localItems,
      });

      await saveLocal(res.data);
    } catch (err) {
      console.log("Sync error", err);
    }
  };

  const addRecentlyViewed = async (product: any) => {
    try {
      const localItems = await loadLocal();

      let items = localItems.filter(
        (item: any) => item._id !== product._id
      );

      items.unshift({
        _id: product._id,
        name: product.name,
        images: product.images,
        viewedAt: Date.now(),
      });

      items = items.slice(0, 20);

      await saveLocal(items);

      // 🔥 background sync if logged in
      if (user?._id) {
        syncWithServer();
      }

    } catch (err) {
      console.log("Error adding recently viewed", err);
    }
  };

  return {
    recentlyViewed,
    addRecentlyViewed,
    syncWithServer,
  };
};