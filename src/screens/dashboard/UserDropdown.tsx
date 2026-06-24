import { signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SpinnerComponent } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { indexedDBName } from "../../constants/info";
import { auth, rtdb } from "../../firebase.config";
import { useChildStore, useUserStore } from "../../zustand";
import "./userdropdown.css";
import { set, ref, remove } from "firebase/database";

export default function UserDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const refHTML = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();
  const { child } = useChildStore();

  // click outside để đóng
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (refHTML.current && !refHTML.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearIndexedDB = () => {
    return new Promise((resolve: any, reject) => {
      const request = indexedDB.deleteDatabase(indexedDBName);

      request.onsuccess = () => {
        console.log("IndexedDB deleted");
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting IndexedDB", event);
        reject();
      };

      request.onblocked = () => {
        console.warn("Delete blocked (close other tabs)");
      };
    });
  };

  const handleLogout = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await set(ref(rtdb, `status/${uid}`), {
        online: false,
        lastSeen: Date.now(),
      });
      await remove(ref(rtdb, `viewingChildren/${child?.id}/${uid}`));
    }
    setIsLoading(true);

    try {
      await signOut(auth);

      // ✅ clear cache IndexedDB
      await clearIndexedDB();

      handleToastSuccess("Đăng xuất tài khoản thành công !");
      navigate("/login", { replace: true });
    } catch (error) {
      handleToastError("Đăng xuất tài khoản thất bại !");
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <SpinnerComponent />;

  return (
    <>
      <div className="user-dropdown-wrapper" ref={refHTML}>
        {/* Trigger */}
        <div className="user-trigger" onClick={() => setOpen(!open)}>
          <img src={user?.avatar} alt="avatar" className="user-avatar" />

          <div className="user-info">
            <div className="user-name">{user.fullName}</div>
            <div className="user-role">{user.position}</div>
          </div>

          <i className={`bi bi-chevron-down ms-2 ${open ? "rotate" : ""}`} />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="user-dropdown">
            {user.role === "admin" && (
              <Link
                to={"./admin"}
                className="dropdown-item-custom text-decoration-none"
              >
                <i className="bi bi-speedometer2 me-2" />
                Trang quản trị
              </Link>
            )}

            <Link
              to={"./changepassword"}
              className="dropdown-item-custom text-decoration-none"
            >
              <i className="bi bi-key me-2" />
              Đổi mật khẩu
            </Link>

            <Link
              to={"../register"}
              className="dropdown-item-custom text-decoration-none"
            >
              <i className="bi bi-person-plus me-2" />
              Đăng ký tài khoản
            </Link>

            <Link
              to={"../setting"}
              className="dropdown-item-custom text-decoration-none"
            >
              <i className="bi bi-person-plus me-2" />
              Cài đặt
            </Link>

            <div className="dropdown-divider-custom" />

            <button
              onClick={handleLogout}
              className="dropdown-item-custom danger"
            >
              <i className="bi bi-box-arrow-right me-2" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      <LoadingOverlay show={isLoading} />
    </>
  );
}
