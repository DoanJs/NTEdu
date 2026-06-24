import localforage from "localforage";

localforage.config({
  name: "NSXEdu",
  storeName: "cacheStore",
});

export default localforage;
