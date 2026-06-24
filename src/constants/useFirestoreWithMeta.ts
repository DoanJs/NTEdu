import { doc, getDoc, getDocs, Query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import localforage from "../localforage";

export function useFirestoreWithMeta<T>({
  key,
  query,
  metaDoc,
}: {
  key: string;
  query: Query;
  metaDoc: string; // ví dụ: "products" | "fields" | targets |...
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);

      // 1. Lấy meta từ Firestore

      const metaSnap = await getDoc(doc(db, "Meta", metaDoc));
      const lastUpdated = metaSnap.exists()
        ? metaSnap.data().lastUpdated?.toMillis() //chuyển sang minisecond để so sánh
        : null;

      // 2. Lấy cache
      const cache = await localforage.getItem<{
        data: T[];
        lastUpdated?: number;
      }>(key);

      // 3. Nếu cache còn mới → dùng luôn
      if (cache && lastUpdated && cache.lastUpdated === lastUpdated) {
        if (mounted) {
          setData(cache.data);
          setLoading(false);
        }
        return;
      }

      // 4. Nếu Meta thay đổi → fetch Firestore mới
      const snapshot = await getDocs(query);
      const freshData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      // 5. Lưu cache kèm lastUpdated
      await localforage.setItem(key, {
        data: freshData,
        lastUpdated,
      });

      if (mounted) {
        setData(freshData);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, metaDoc]);

  return { data, loading };
}
