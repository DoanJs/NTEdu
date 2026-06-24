import { onDisconnect, ref, remove, set } from "firebase/database";
import { useEffect } from "react";
import { auth, rtdb } from "../firebase.config";

type Props = {
  childId?: string;
  fullName?: string;
  avatar?: string;
  role?: string
};

export const useViewingChild = ({
  childId,
  fullName,
  avatar,
  role
}: Props) => {
  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (!uid || !childId) return;

    const viewingRef = ref(
      rtdb,
      `viewingChildren/${childId}/${uid}`
    );

    set(viewingRef, {
      fullName: fullName || "",
      avatar: avatar || "",
      role: role || "",
    });

    onDisconnect(viewingRef).remove();

    return () => {
      remove(viewingRef);
    };
  }, [childId, fullName, avatar, role]);
};