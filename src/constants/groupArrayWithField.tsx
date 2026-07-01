import { fieldOrder } from "./info";

export const groupArrayWithField = (arr: any[], field: string) => {
  const grouped = arr.reduce((acc, item) => {
    if (!acc[item[field]]) acc[item[field]] = [];
    acc[item[field]].push(item);
    return acc;
  }, {});

  // Flatten ra thành 1 mảng, giữ thứ tự fieldId theo lúc xuất hiện đầu tiên
  const result = [];
  const seen = new Set();

  for (const item of arr) {
    if (!seen.has(item[field])) {
      result.push(...grouped[item[field]]);
      seen.add(item[field]);
    }
  }
  
  result.sort((a, b) => {
    const indexA = fieldOrder.indexOf(a.fieldId);
    const indexB = fieldOrder.indexOf(b.fieldId);

    return indexA - indexB;
  });

  return result;
};
