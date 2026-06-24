import { onAuthStateChanged } from "firebase/auth";
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import { useEffect } from "react";
import { auth, rtdb } from "../firebase.config";

export const usePresence = () => {
  useEffect(() => {
    let unsubscribeConnected: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeConnected) {
        unsubscribeConnected();
        unsubscribeConnected = undefined;
      }

      if (!user) return;

      const statusRef = ref(rtdb, `status/${user.uid}`);
      const connectedRef = ref(rtdb, ".info/connected");

      unsubscribeConnected = onValue(connectedRef, (snapshot) => {
        if (snapshot.val() !== true) return;

        onDisconnect(statusRef)
          .set({
            online: false,
            lastSeen: serverTimestamp(),
          })
          .then(() => {
            set(statusRef, {
              online: true,
              lastSeen: serverTimestamp(),
            });
          });
      });
    });

    return () => {
      if (unsubscribeConnected) unsubscribeConnected();
      unsubscribeAuth();
    };
  }, []);
};