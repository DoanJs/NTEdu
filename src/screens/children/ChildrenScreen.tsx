import { signOut } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { serverTimestamp, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo, SpinnerComponent } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import { getDocsData } from "../../constants/firebase/getDocsData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { getChildAge, indexedDBName } from "../../constants/info";
import { useFirestoreWithMetaCondition } from "../../constants/useFirestoreWithMetaCondition";
import { auth, rtdb } from "../../firebase.config";
import { ChildrenModel } from "../../models";
import { useChildrenStore, useTeacherStore, useUserStore } from "../../zustand";
import "./children.css";
import { targetData } from "../../constants/database/targetData";
import { addDocData } from "../../constants/firebase/addDocData";

export default function HomeStudentsBootstrapGreen() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { children, setChildren } = useChildrenStore();
  const { teachers, setTeachers } = useTeacherStore();
  const [showNotificationOnly, setShowNotificationOnly] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [viewingChildren, setViewingChildren] = useState<any>({});

  useEffect(() => {
    const viewingRef = ref(rtdb, "viewingChildren");

    const unsubscribe = onValue(viewingRef, (snapshot) => {
      setViewingChildren(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, []);

  const { data: data_children, loading: loading_children } =
    useFirestoreWithMetaCondition({
      key: `${user?.id}_childrenCache`,
      id: user?.id,
      metaDoc: "children",
      nameCollect: "children",
      condition: [where("teacherIds", "array-contains", user?.id)],
    });
  const { data: data_reportPendings } = useFirestoreWithMetaCondition({
    key: "reportPendingsCache",
    metaDoc: "reports",
    id: user?.id,
    nameCollect: "reports",
    condition: [
      where("teacherIds", "array-contains", user?.id),
      where("status", "==", "pending"),
    ],
  });
  const { data: data_planPendings } = useFirestoreWithMetaCondition({
    key: "planPendingsCache",
    metaDoc: "plans",
    id: user?.id,
    nameCollect: "plans",
    condition: [
      where("teacherIds", "array-contains", user?.id),
      where("status", "==", "pending"),
    ],
  });

  useEffect(() => {
    if (!loading_children) {
      setChildren(data_children as ChildrenModel[]);
    }
  }, [data_children, loading_children]);
  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "users",
        setData: setTeachers,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, children]);

  const pendingChildIds = useMemo(() => {
    return new Set(
      data_planPendings
        .concat(data_reportPendings)
        .map((item: any) => item.childId),
    );
  }, [data_planPendings, data_reportPendings]);

  const filteredStudents = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return children.filter((student) => {
      const content = `${student.fullName}`.toLowerCase();
      const matchKeyword = !search || content.includes(search);

      if (showNotificationOnly) {
        return matchKeyword && pendingChildIds.has(student.id);
      }

      return matchKeyword;
    });
  }, [keyword, children, pendingChildIds, showNotificationOnly]);

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
  // -----------------test add data-----------------
  // const addDataToFirebase = async () => {

  //   const promiseItems = targetData.map((_) =>
  //     addDocData({
  //       nameCollect: "targets",
  //       value: {
  //         ..._,
  //         createAt: serverTimestamp(),
  //         updateAt: serverTimestamp(),
  //       },
  //       metaDoc: "targets",
  //     }),
  //   );

  //   await Promise.all(promiseItems);
  //   console.log("Completed");

  //   // const promiseItems = dataMatching.map((item) =>
  //   //   setDoc(doc(db, "targets", item.id), {
  //   //     ...item,
  //   //     createAt: serverTimestamp(),
  //   //     updateAt: serverTimestamp(),
  //   //   }),
  //   // );

  //   // await Promise.all(promiseItems);
  //   // console.log('completed')
  //   // console.log(targetData)
  // };

  // ------------------test add data-----------------
  if (loading_children) return <SpinnerComponent />;

  return (
    <>
      <div className="nsx-page">
        <div className="nsx-shell">
          <header className="nsx-header">
            <div className="nsx-brand">
              <Logo type="children" />
            </div>

            <button
              className="logout-btn"
              onClick={() => setShowLogout(true)}
              title="Đăng xuất"
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </header>

          <section className="nsx-hero">
            <img
              src={user?.avatar || "/NSXEdu-icon-512x512.png"}
              alt="Logo"
              className="hero-logo"
            />

            <h1>
              Cô {user?.fullName || "Người dùng"} - {user?.position}
            </h1>
            <p>Chọn trẻ để xem hồ sơ, kế hoạch và báo cáo can thiệp</p>
          </section>
          {/* <button onClick={addDataToFirebase}>Add data</button> */}

          <main className="nsx-content">
            <div className="content-head">
              <div>
                <h2>Danh sách trẻ</h2>
                <p>
                  Tổng quan nhanh danh sách trẻ đang can thiệp tại trung tâm.
                </p>
              </div>

              <div className="stats">
                <div className="stat-pill">
                  <i className="bi bi-people-fill"></i>
                  <span>{filteredStudents.length} trẻ</span>
                </div>

                <div
                  className="stat-pill danger"
                  onClick={() => setShowNotificationOnly((prev) => !prev)}
                >
                  <i className="bi bi-bell-fill"></i>
                  <span>
                    {data_planPendings.concat(data_reportPendings).length}
                    {showNotificationOnly && <span> Tất cả trẻ</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="search-card">
              <i className="bi bi-search"></i>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập tên trẻ, giáo viên phụ trách..."
              />
            </div>

            {filteredStudents.length > 0 ? (
              <div className="children-grid">
                {filteredStudents.map((child) => {
                  const viewers = Object.values(
                    viewingChildren?.[child.id] || {},
                  ) as any[];
                  return (
                    <ChildCard
                      key={child.id}
                      child={child}
                      teachers={teachers}
                      isNotification={pendingChildIds.has(child.id)}
                      viewers={viewers}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <i
                  className="bi bi-search fs-1 d-block mb-3"
                  style={{ color: "var(--yellow)" }}
                />
                Không tìm thấy trẻ phù hợp.
              </div>
            )}
          </main>
        </div>
      </div>

      {showLogout && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            {/* Title */}
            <h5 className="fw-black text-danger mb-2">Xác nhận đăng xuất</h5>

            {/* Description */}
            <p className="text-green-muted small">
              Cô chắc chắn muốn đăng xuất khỏi thiết bị này ?
            </p>

            {/* Actions */}
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowLogout(false)}
              >
                Huỷ
              </button>

              <button className="btn action-btn-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2" />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay show={isLoading} />
    </>
  );
}

function ChildCard({
  child,
  isNotification,
  teachers,
  viewers,
}: {
  child: any;
  isNotification: boolean;
  teachers: any[];
  viewers: any[];
}) {
  return (
    <Link
      to={child.status === "paused" ? "#" : `home/${child.id}`}
      className="text-decoration-none position-relative"
    >
      {isNotification && (
        <span className="child-bell">
          <i className="bi bi-bell-fill" />
        </span>
      )}
      <article className="child-card">
        <div className="child-image-wrap">
          <img
            src={child.avatar || "/NTEdu-icon-512x512.png"}
            alt={child.fullName}
            className="child-image"
          />

          {child.status === "paused" && (
            <div className="child-overlay">
              <div className="child-overlay-icon">🔒</div>
              <span>Tạm dừng</span>
            </div>
          )}
        </div>

        <div className="child-body">
          <h3>{child.fullName}</h3>

          <div className="child-age">
            {getChildAge(child.birth) || <i>Chưa xác định</i>}
          </div>
          <div className="teacher">
            <i className="bi bi-person-badge"></i>
            {teachers
              .filter((teacher) => child.teacherIds?.includes(teacher.id))
              .map((teacher) => (
                <span key={teacher.id} className="teacher-badge">
                  {teacher.shortName}
                </span>
              ))}
          </div>

          {viewers.filter((v) => v.role !== "admin").length > 0 && (
            <div className="viewing-row">
              <span className="viewing-label">Đang xem</span>

              <div className="viewing-avatars">
                {viewers
                  .filter((v) => v.role !== "admin")
                  .slice(0, 4)
                  .map((viewer: any, index: number) => (
                    <img
                      key={`${viewer.uid}-${index}`}
                      src={viewer.avatar || "/NSXEdu-icon-512x512.png"}
                      className="viewing-avatar"
                      title={`${viewer.fullName} đang xem`}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
