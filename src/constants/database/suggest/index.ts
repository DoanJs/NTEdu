export {}
// // 
// const [suggests, setSuggests] = useState([]);
// useEffect(() => {
//   getDocsData({ nameCollect: 'suggests', setData: setSuggests })
// }, [])

// const getSuggests = () => {
//   console.log(suggests)
// }

// const handleCreateData = async () => {
//   const dataNNDD = suggestNNDD.map((_) => {
//     return {
//       ..._,
//       fieldId: '3EUhuJoxzHauQpx1pPxq',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataCA = suggestCA.map((_) => {
//     return {
//       ..._,
//       fieldId: 'zfnX1X3wvP46rRF3k4gB',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataCNXH = suggestCNXH.map((_) => {
//     return {
//       ..._,
//       fieldId: 'qw6gesBxUmEgEDow153O',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataHV = suggestHV.map((_) => {
//     return {
//       ..._,
//       fieldId: '48UQhGWIQECsi8lAd7Sc',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataNNH = suggestNNH.map((_) => {
//     return {
//       ..._,
//       fieldId: 'gGNJ5mQZRSxkSW4qAu6F',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataNT = suggestNT.map((_) => {
//     return {
//       ..._,
//       fieldId: 'j6fFXTUD1D6rym4UmKkV',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataTTCY = suggestTTCY.map((_) => {
//     return {
//       ..._,
//       fieldId: 'Nji6cMUy0TcZ1Tw8B2iG',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })
//   const dataVDT = suggestVDT.map((_) => {
//     return {
//       ..._,
//       fieldId: 'cyg1PnZ4snHm583dFBzp',
//       createAt: serverTimestamp(),
//       updateAt: serverTimestamp(),
//     }
//   })

//   const datas = [
//     ...dataCA,
//     ...dataCNXH,
//     ...dataHV,
//     ...dataNNDD,
//     ...dataNNH,
//     ...dataNT,
//     ...dataTTCY,
//     ...dataVDT
//   ]
//   const promiseItems = datas.map((_) => addDocData({
//     nameCollect: 'suggests',
//     value: _,
//     metaDoc: 'suggests'
//   }))

//   await Promise.all(promiseItems)
//   console.log('Completed')
// }
// // 

//             <button onClick={handleCreateData}>Upload</button>
//             <SpaceComponent width={50} />
//             <button onClick={getSuggests}>Get Suggests</button>