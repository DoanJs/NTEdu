import localforage from "localforage";

localforage.config({
  name: "NTEdu",
  storeName: "cacheStore",
});

export default localforage;
