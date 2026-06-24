import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase.config";

export const addDocData = async ({
  nameCollect,
  value,
  metaDoc,
  customId,
}: {
  nameCollect: string;
  value: any;
  metaDoc: string;
  customId?: string;
}) => {
  let result;

  if (customId) {
    // 👉 dùng custom ID
    const docRef = doc(db, nameCollect, customId);
    await setDoc(docRef, value);
    result = { id: customId };
  } else {
    // 👉 auto ID như cũ
    const res = await addDoc(collection(db, nameCollect), value);
    result = res;
  }

  // update meta
  await updateDoc(doc(db, "Meta", metaDoc), {
    lastUpdated: serverTimestamp(),
  });

  return result;
};