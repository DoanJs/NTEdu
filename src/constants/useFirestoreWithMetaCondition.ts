import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  QueryConstraint,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase.config";
import localforage from "../localforage";

export function useFirestoreWithMetaCondition<T>({
  key,
  metaDoc,
  id,
  nameCollect,
  condition,
}: {
  key: string;
  metaDoc: string; // ví dụ: "products" | "fields" | targets |...
  id: string | undefined;
  nameCollect: string;
  condition: QueryConstraint[];
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setData([])
      setLoading(false)
      return;
    }

    let mounted = true;

    async function loadData() {
      const valiConditions = condition.filter(Boolean)
      setLoading(true);

      // 1. Lấy meta từ Firestore
      const metaSnap = await getDoc(doc(db, "Meta", metaDoc));
      const lastUpdated = metaSnap.exists()
        ? metaSnap.data().lastUpdated
          ? metaSnap.data().lastUpdated.toMillis() //chuyển sang minisecond để so sánh
          : metaSnap.data()[key]?.toMillis() //chuyển sang minisecond để so sánh
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
      const snapshot = await getDocs(
        query(collection(db, nameCollect), ...valiConditions)
      );
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
  }, [key, metaDoc, id]);

  return { data, loading };
}
