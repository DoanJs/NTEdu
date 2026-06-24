import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

// 👉 Hàm lấy dữ liệu của 1 collection
export const fetchCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 👉 Hàm export ra file .js
export const downloadJS = (data: any, filename = "firestoreData.js") => {
  const jsContent = `export const firestoreData = ${JSON.stringify(
    data,
    null,
    2
  )};`;
  const blob = new Blob([jsContent], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

// 👉 Component chính
// export default function ExportMultipleCollections() {
//   const handleExport = async () => {
//     try {
//       // 🔹 Danh sách collection bạn muốn export
//       const collections = ["users", "posts", "comments"];

//       let allData = {};

//       for (let name of collections) {
//         const data = await fetchCollection(name);
//         allData[name] = data;
//       }

//       // 👉 Xuất ra file .js chứa tất cả collections
//       downloadJS(allData, "firestoreAllCollections.js");
//     } catch (error) {
//       console.error("Lỗi export Firestore:", error);
//     }
//   };

//   return (
//     <button onClick={handleExport}>
//       Export Nhiều Collection
//     </button>
//   );
// }
