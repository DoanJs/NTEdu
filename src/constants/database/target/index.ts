import { serverTimestamp } from "firebase/firestore"

export { }
// // --------------
// const [dataTargets, setDataTargets] = useState([]);
// useEffect(() => {
//   getDocsData({
//     nameCollect: 'targets',
//     setData: setDataTargets
//   })
// }, [])

// const getTargets = async () => {
//   console.log(dataTargets)
//   // console.log(targetsNNDD)
// }

// const addDataToFirebase = async () => {

//     const dataCNXH = targetsCNXH.map((_) => {
//       return {
//         ..._,
//         fieldId: 'XV4FJbN7cv4UXpN2tOqR',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataKNBC = targetsKNBC.map((_) => {
//       return {
//         ..._,
//         fieldId: 'jOdWy1TwAzuEy1lRXT7i',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataKNC = targetsKNC.map((_) => {
//       return {
//         ..._,
//         fieldId: 'gxZsB2xYu0IiJel5Ni5z',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataKNXH= targetsKNXH.map((_) => {
//       return {
//         ..._,
//         fieldId: 'ZeOjbxP7naiU0pAAK6q2',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataNNDD = targetsNNDD.map((_) => {
//       return {
//         ..._,
//         fieldId: '0RptPhhmbwDhyXFstiet',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataNNH = targetsNNH.map((_) => {
//       return {
//         ..._,
//         fieldId: 'VwWwTwTaRGrvnjIgFq1y',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataNT = targetsNT.map((_) => {
//       return {
//         ..._,
//         fieldId: 'Jr5TN0Q2XH1zOGN9oT1f',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataTTCY = targetsTTCY.map((_) => {
//       return {
//         ..._,
//         fieldId: 'r34oZoUXxuOq8FBEQkf8',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataVDT = targetsVDT.map((_) => {
//       return {
//         ..._,
//         fieldId: '7GDprhycm7vmjdbuDiny',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })
//     const dataVDTho = targetsVDTho.map((_) => {
//       return {
//         ..._,
//         fieldId: 'EvH8IShW7sUs0ojOHrfo',
//         createAt: serverTimestamp(),
//         updateAt: serverTimestamp(),
//       }
//     })

//     const datas = [
//       ...dataCNXH,
//       ...dataKNBC,
//       ...dataKNC,
//       ...dataKNXH,
//       ...dataNNDD,
//       ...dataNNH,
//       ...dataNT,
//       ...dataTTCY,
//       ...dataVDT,
//       ...dataVDTho
//     ]
//     // const promiseItems = datas.map((_) => addDocData({
//     //   nameCollect: 'targets',
//     //   value: _,
//     //   metaDoc: 'targets'
//     // }))

//     // await Promise.all(promiseItems)
//     console.log('Completed')
//   };

// // ---------------

// <button onClick={handleCreateData}>Upload</button>
//           <SpaceComponent height={50} />
//           <button onClick={getTargets}>Get Targets</button>

export const targetUpdate = [
  //Nhận thức
  {
    name: 'Con nhận biết chức năng, nhiệm vụ của 1 số loại phương tiện giao thông quen thuộc (VD: xe cứu hoả làm nhiệm vụ chữa cháy,....). Con đạt 6/10 cơ hội duy trì trong 3 ngày.',
    level: 3,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết nhiệm vụ của 1 số nghề nghiệp quen thuộc (VD: cô giáo dạy học,....).Con đạt 6/10 cơ hội duy trì trong 3 ngày.',
    level: 3,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con làm quen đánh vần với các từ đơn giản và kết hợp với các dấu. VD: bá,cồ,mẹ,.... Con đạt 6/10 cơ hội và duy trì liên tiếp trong 3 ngày',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con làm quen và thực hiện phép tính cộng (+) trong phạm vi 10, sử dụng que tính/ tay để thực hiện. Con đạt 6/10 cơ hội và duy trì liên tiếp trong 3 ngày',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con làm quen và thực hiện phép tính cộng (-) trong phạm vi 10, sử dụng que tính/ tay để thực hiện. Con đạt 6/10 cơ hội và duy trì liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết và chỉ tay về phía bản thân con/ cô khi được cô hỏi. Con đạt 6/10 cơ hội và duy trì liên tiếp trong 1 tuần.VD: Tên + đâu rồi? Cô đâu rồi?',
    level: 2,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết thời tiết và các hiện tượng tự nhiên: Trời nắng, mưa, cầu vòng, sấm sét...Con đạt 4/5 cơ hội, duy trì liên tiếp trong 5 ngày được tính là đạt',
    level: 3,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể liệt kê, tìm những từ có chứa các âm “a,b,c, e”. (VD: “a- ba”, “c- cô”…). Con đạt được 6/10 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết và có thể đếm tổng số lượng các hình học có trong một hình vẽ. Con đạt 6/10 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết và nêu được một số đặc điểm của các mùa trong năm. (VD: Mùa hè- trời nóng, đi biển, mang áo quần ngắn/ mùa đông- trời lạnh, mặc áo ấm, uống nước ấm…) Đạt 6/10 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết và gọi tên được một số món ăn/nước uống quen thuộc. (VD: Món trứng, thịt, bún, cơm, nước cam…). Con đạt 6/10 cơ hội, duy trì liên tục trong 3 ngày.',
    level: 2,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết và so sánh hai đối tượng về kích thước và nói được các từ “dài hơn-ngắn hơn/ cao hơn-thấp hơn/ bằng nhau/…giữa 2 đối tượng. Con đạt 6/10 cơ hội duy trì liên tiếp trong 3 ngày.',
    level: 3,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết, nói được 1 số đặc điểm nổi bật của ban ngày,ban đêm và hoạt động của con tương ứng với thời gian trên. Con đạt 6/10 cơ hội duy trì liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết về đơn vị đo độ dài -cm và sử dụng thước để thực hiện đo đồ vật/ hình ảnh…. Con thực hiện được 6.10 cơ hội, duy trì liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nhận biết và tìm/đánh vần các từ có chứa vần. Con đạt 6/10 cơ hội, duy trì liên tiếp trong 5 ngày',
    level: 4,
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },


  // Ngôn ngữ hiểu
  {
    name: 'Con thực hiện 1 số yêu cầu đưa đồ vật cho đối tượng nhất định ở 2 không gian phòng học khác nhau, yêu cầu con phải cầm đồ và di chuyển. Con đạt 6/10 cơ hội duy trì trong 3 ngày',
    level: 2,
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nghe hiểu và thực hiện được yêu cầu đi đến đúng đối tượng (Ở vị trí phòng khác) để xin được đồ chơi sau đó mang về đưa cho cô. Con đạt 6/10 cơ hội, duy trì liên tiếp trong 3 ngày',
    level: 3,
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con nghe hiểu và thực hiện làm theo hướng dẫn có 3-4 bước liên tiếp. VD: (Mở cặp- lấy sách- mở trang- đọc bài 1). Con đạt 3/5 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con hiểu và làm theo các yêu cầu có 1 mệnh lệnh gắn với 2 đồ vật. Vd: Lấy cho cô giấy và bút, vứt hộp sữa và vỏ bánh vào thùng rác…. Đạt 4/5 cơ hội, duy trì liên tiếp trong 5 ngày được tính là đạt.',
    level: 2,
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },

  // Vận động tinh
  {
    name: 'Con độc lập viết các số và chữ cái (hạn chế viết theo dấu chấm có sẵn). Con đạt 6/10 cơ hội và duy trì liên tiếp trong 3 ngày',
    level: 4,
    fieldId: 'cyg1PnZ4snHm583dFBzp',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con tập viết từ theo mẫu đúng kích thước vở ô li. Con đạt 6/10 cơ hội, duy trì liên tục trong 3 ngày',
    level: 4,
    fieldId: 'cyg1PnZ4snHm583dFBzp',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể tháo/cài được dây đai mũ bảo hiểm. Con thực hiện có sự hỗ trợ của cô. Con đạt 6/10 cơ hội liên tiếp trong 3 ngày.',
    level: 1,
    fieldId: 'cyg1PnZ4snHm583dFBzp',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },

  // Ngôn ngữ diễn đạt
  {
    name: 'Con có thể sử dụng từ đôi để trả lời về câu hỏi màu sắc “màu gì đây?” VD: màu-đỏ, màu-vàng,.... Con đạt 6/10 cơ hội và duy trì liên tiếp trong 3 ngày',
    level: 2,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể trả lời câu hỏi “Tên+ đang làm gì?” bằng cụm 4-5 từ trong những tình huống thực tế. Con đạt 3/5 cơ hội, duy trì liên tục trong 3 ngày. VD: Con đang làm gì vậy? Con chơi xe/chơi con vật…',
    level: 3,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con quan sát, nhận diện được các chi tiết chính có trong tranh và mô tả dựa vào câu hỏi (ai? làm gì? ở đâu?). (VD: Bạn Trai và bạn gái đang trồng cây ở trên sân trường). Con đạt 3/5 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con ghi nhớ kể lại chi tiết được 2-3 sự việc cụ thể đã diễn ra trong hoạt động vừa tham gia cùng bạn. (VD: Con vừa chơi làm sinh tố cùng bạn, con làm sinh tố dâu tây còn bạn làm sinh tố bơ, làm xong con mời cô P với cô Lài ăn.) Con đạt 3/5 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể bật âm “xin” khi muốn xin đồ chơi. Con đạt 4/5 cơ hội trong giờ can thiệp và duy trì liên tiếp trong 3 ngày được tính là đạt.',
    level: 2,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể bật âm “xin chào” khi đến lớp và “bai bai” khi đi học về với cô/ba mẹ. Con đạt 4/5 cơ hội trong giờ can thiệp và duy trì liên tiếp trong 3 ngày được tính là đạt. ',
    level: 3,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể diễn đạt câu dài để từ chối lời đề nghị/hành động của người khác trong những tình huống quen thuộc thay vì nói “không, không”. VD: Con không thích chơi cái này/con không thích ăn bánh này/con muốn tự xếp tranh. Con đạt 6/10 cơ hội liên tiếp trong 3 ngày.',
    level: 4,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con tập sử dụng kết hợp 2 loại đại từ xưng hô (con-cô/bạn, anh- em, chú- con…) trong câu ngắn khi giao tiếp. (VD: Anh bế em/ Chú cho con kẹo/chào bạn! Mình tên là A). Con đạt 6/10 cơ hội liên tiếp trong 3 ngày là đạt.',
    level: 4,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con biết xoè tay và bắt chước nói “ Ạ” để xin đồ chơi/ đồ ăn từ cô/ nhờ sự giúp đỡ. Con đạt 6/10 cơ hội, duy trì liên tục trong 3 ngày.',
    level: 1,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con có thể sử dụng từ đôi để trả lời tên 1 số con vật/ phương tiện giao thông/ quả/… khi được hỏi. Con đạt 6/10 cơ hội, duy trì liên tiếp trong 5 ngày.',
    level: 3,
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },

  // Cá nhân xã hội
  {
    name: 'Con biết đi tìm người lớn ở các vị trí khác nhau để kêu gọi sự chú ý/giúp đỡ bằng cách gọi “Chủ thể+ tên vật/sự việc/hành động” để muốn người khác hiểu rõ nhu cầu. VD: “Cô ơi!” nhìn nè, xe cứu hỏa chạy nhanh”, “Mẹ ơi! Lấy quả bóng... Con đạt 3/5 cơ hội, duy trì liên tục trong 3 ngày.',
    level: 3,
    fieldId: 'qw6gesBxUmEgEDow153O',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },



]
export const suggestUpdate = [
  
  // ngôn ngữ hiểu
  {
    name: 'Cô sử dụng đồ dùng/ đồ chơi có trong phòng học. Cô tạo tình huống, làm mẫu, sau đó hướng dẫn và hỗ trợ con thực hiện. Giảm dần hỗ trợ đến khi con thực hiện độc lập.',
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Các tình huống thực tế, tạo cơ hội và hướng dẫn để con đi xin/mượn đồ chơi, giảm dần hỗ trợ, con độc lập thực hiện ở các ngữ cảnh khác nhau.',
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Cô đưa ra yêu cầu và làm mẫu, chờ đợi, hỗ trợ khi con cần đến khi con độc lập thực hiện.',
    fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },

  // Ngôn ngữ diễn đạt
  {
    name: 'Các hoạt động vui chơi tương tác như: nấu ăn, làm sinh tố… cô làm mẫu, gọi tên + hành động và biểu cảm để tăng sự hứng thú, hỏi đáp, con độc lập trả lời.',
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con quan sát tranh, tạo cơ hội để con nói lên suy nghĩ, cô hỗ trợ khi cần, con nhắc lại.',
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con tham gia hoạt động, vui chơi tương tác với bạn, gợi ý, chờ đợi, con-  ghi nhớ và kể lại, củng cố.',
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Thông qua các tình huống thực tế, cô hướng dẫn làm mẫu, con phân biệt và gọi tên đại từ xưng hô, hỗ trợ khi con cần, con độc lập phân biệt gọi tên được các đại từ.',
    fieldId: '3EUhuJoxzHauQpx1pPxq',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  
  // Cá nhân xã hội
  {
    name: 'Các tình huống thực tế, chơi với các đồ chơi, hỗ trợ làm mẫu để con bắt chước gọi sự chú ý của người khác, sử dụng ngôn ngữ cơ thể để tạo hứng thú, bình luận ngắn gọn về đồ vật con khoe/chia sẻ, chờ đợi và giảm dần hỗ trợ đến khi con độc lập thực hiện.',
    fieldId: 'qw6gesBxUmEgEDow153O',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  
  // Nhận thức
  {
    name: 'Thông qua các hoạt động vui đố vui, cô làm mẫu hướng dẫn, hỗ trợ khi con cần, khen thưởng.',
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con tham gia các hoạt động như: xếp hình, tô màu, dùng thước nối các điểm tạo thành hình vuông, tam giác… ',
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Con tham gia hoạt động tìm chọn trang phục phù hợp với mùa, tô màu/bình luận hỏi đáp trong lúc chơi/con nhớ và trả lời.',
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Sử dụng tranh ảnh, một số món ăn/nước uống thật, tham gia hoạt động chơi nấu ăn, đi siêu thị mua đồ… Cô gọi tên con nghe và lặp lại, hỏi đáp, con độc lập trả lời.',
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Giới thiệu con đơn vị đo độ dài, hướng dẫn sử dụng thước để đo chính xác độ dài. Cô làm mẫu/ giảm dần hỗ trợ khi con thực hiện.',
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Sách tập đánh vần/cô hướng dẫn sau đó con đọc/ chơi tìm chữ.',
    fieldId: 'j6fFXTUD1D6rym4UmKkV',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  
  // Vận động tinh
  {
    name: 'Cô làm mẫu hướng dẫn, gọi tên đồ vật, cầm tay hỗ trợ con thực hiện, gọi tên các từ cốt lõi “cài/tháo”, con độc lập thực hiện.',
    fieldId: 'cyg1PnZ4snHm583dFBzp',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },
  {
    name: 'Cô viết chữ mẫu, hỗ trợ cầm tay, sau đó cho con độc lập viết chữ.',
    fieldId: 'cyg1PnZ4snHm583dFBzp',
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  },

]