import { getRecentlyViewedLocal, setRecentlyViewedLocal } from "@/utils/storage";

const MAX = 20;
const API = "https://myntra-clone-j4a9.onrender.com";;

export const syncRecentlyViewed = async (userId: string) => {
  try {
    const local = await getRecentlyViewedLocal();

    // fetch server
    const res = await fetch(`${API}/api/recently-viewed/${userId}`);
    const server = await res.json();

    // merge
    const map = new Map();

    [...local, ...server].forEach((item: any) => {
      const key = item.productId || item._id || item.id;
      const existing = map.get(key);

      if (!existing || existing.viewedAt < item.viewedAt) {
        map.set(key, item);
      }
    });

    const merged = Array.from(map.values())
      .sort((a: any, b: any) => b.viewedAt - a.viewedAt)
      .slice(0, MAX);

    // save locally 
    await setRecentlyViewedLocal(merged);

    // push to server
    for (const item of merged) {
      await fetch(`${API}/api/recently-viewed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: item.productId || item._id || item.id,
        }),
      });
    }

    return merged;
  } catch (err) {
    console.log("Sync error", err);
  }
};