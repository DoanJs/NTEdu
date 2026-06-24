export const showUIIconTarget = (title: string) => {
  let result: any;
  switch (title) {
    case "Tiền ngôn ngữ":
      result = "tngngu.png";
      break;
    case "Nhận thức":
      result = "nt.png";
      break;
    case "Ngôn ngữ hiểu":
      result = "nnh.png";
      break;
    case "Ngôn ngữ diễn đạt":
      result = "nndd.png";
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
    case "Chỉnh âm /Phát âm":
      result = "pa.png";
      break;
    case "Hành vi":
      result = "hv.png";
      break;
    case "Tiền học đường":
      result = "thdg.png";
      break;

    default:
      result = "NSXEdu-icon-192x192.png"; //Kỹ năng xã hội
      break;
  }
  return result;
};
