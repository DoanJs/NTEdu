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

  // theo thứ tự: Ngôn ngữ hiểu, Ngôn ngữ diễn đạt, Nhận thức, Vận động tinh, Vận động thô, Cá nhân xã hội, Tập trung chú ý, Kỹ năng xã hội, Kỹ năng chơi, Kỹ năng bắt chước

  // const fieldOrder = [
  //   "VwWwTwTaRGrvnjIgFq1y", // Ngôn ngữ hiểu
  //   "0RptPhhmbwDhyXFstiet", // Ngôn ngữ diễn đạt
  //   "Jr5TN0Q2XH1zOGN9oT1f", // Nhận thức
  //   "7GDprhycm7vmjdbuDiny", // Vận động tinh
  //   "EvH8IShW7sUs0ojOHrfo", // Vận động thô
  //   "XV4FJbN7cv4UXpN2tOqR", // Cá nhân xã hội
  //   "r34oZoUXxuOq8FBEQkf8", // Tập trung chú ý
  //   "ZeOjbxP7naiU0pAAK6q2", // Kỹ năng xã hội
  //   "gxZsB2xYu0IiJel5Ni5z", // Kỹ năng chơi
  //   "jOdWy1TwAzuEy1lRXT7i", // Kỹ năng bắt chước
  // ];
  // theo thứ tự: Ngôn ngữ hiểu, Ngôn ngữ diễn đạt, Chỉnh âm, Nhận thức, Vận động tinh, Cá nhân xã hội, Tập trung chú ý, Hành vi
  const fieldOrder = [
    'Nji6cMUy0TcZ1Tw8B2iG', //tngng
    'j6fFXTUD1D6rym4UmKkV', //nt
    'gGNJ5mQZRSxkSW4qAu6F', //nnh
    '3EUhuJoxzHauQpx1pPxq', //nndt
    'kzkiAv3X9TZaKRlhfa1X', //vdtho
    'cyg1PnZ4snHm583dFBzp', //vdt
    'v10pqAVWk2wp6HEgaVKk', //knc
    'zfnX1X3wvP46rRF3k4gB', //pa
    '48UQhGWIQECsi8lAd7Sc', //hv
    'qw6gesBxUmEgEDow153O', //thdg
  ]
  result.sort((a, b) => {
    const indexA = fieldOrder.indexOf(a.fieldId);
    const indexB = fieldOrder.indexOf(b.fieldId);

    return indexA - indexB;
  });

  return result;
};
