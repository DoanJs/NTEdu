import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.config";

export const setDocData = async ({
  nameCollect,
  id,
  valueUpdate,
  metaDoc,
}: {
  nameCollect: string;
  id: string;
  valueUpdate: any;
  metaDoc?: string;
}) => {
  await setDoc(doc(db, nameCollect, id), valueUpdate, { merge: true });
  if (metaDoc) {
    await updateDoc(doc(db, "Meta", metaDoc), {
      lastUpdated: serverTimestamp(),
    });
  }
};
