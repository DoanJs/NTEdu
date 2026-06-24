export const handleTimeStampFirestore = (timestamp: any) => {
  return timestamp?.seconds * 1000 + timestamp?.nanoseconds / 1e6;
};
