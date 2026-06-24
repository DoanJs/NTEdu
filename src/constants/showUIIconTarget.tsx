export const showUIIconTarget = (title: string) => {
  let result: any;
  switch (title) {
    case "Nhận thức":
      result = "nt.png";
      break;
    case "Ngôn ngữ hiểu":
      result = "nnh.png";
      break;
    case "Ngôn ngữ diễn đạt":
      result = "nndd.png";
      break;
    case "Kỹ năng xã hội":
      result = "knxh.png";
      break;
    case "Tập trung chú ý":
      result = "ttcy.png";
      break;
    case "Vận động thô":
      result = "vdtho.png";
      break;
    case "Vận động tinh":
      result = "vdt.png";
      break;
    case "Kỹ năng chơi":
      result = "knc.png";
      break;
    case "Kỹ năng bắt chước":
      result = "knbc.png";
      break;

    default:
      result = "NTEdu-icon-192x192.png"; //Kỹ năng xã hội
      break;
  }
  return result;
};
