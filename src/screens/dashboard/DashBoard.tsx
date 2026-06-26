import { signOut } from "firebase/auth";
import { onValue, ref, remove, set } from "firebase/database";
import { orderBy, where } from "firebase/firestore";
import { Message } from "iconsax-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { Logo } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import { getDocData } from "../../constants/firebase/getDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import {
  CENTER_NAME,
  getChildAge,
  getOnlineStatus,
  handleCommentTotal,
  indexedDBName,
} from "../../constants/info";
import { useFirestoreWithMetaCondition } from "../../constants/useFirestoreWithMetaCondition";
import { auth, rtdb } from "../../firebase.config";
import { useViewingChild } from "../../hooks/useViewingChild";
import {
  CommentModel,
  FieldModel,
  InterventionModel,
  PlanModel,
  ReportModel,
  ReportSavedModel,
  TargetModel,
} from "../../models";
import { CartModel } from "../../models/CartModel";
import {
  useCartStore,
  useChildStore,
  useCommentStore,
  useFieldStore,
  useInterventionStore,
  usePlanStore,
  useReportSavedStore,
  useReportStore,
  useSelectNavbarStore,
  useTargetStore,
  useTeacherStore,
  useTotalPlanTaskStore,
  useTotalReportTaskStore,
  useUserStore,
} from "../../zustand";
import {
  query_targets,
  query_interventions,
  query_fields,
} from "../../constants/firebase/query/Index";
import { useFirestoreWithMeta } from "../../constants/useFirestoreWithMeta";

const logoUrl = "/NTEdu-icon-512x512.png";

export default function DashBoard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserStore();

  useViewingChild({
    childId: id,
    fullName: user?.fullName,
    avatar: user?.avatar,
    role: user?.role,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { selectNavbar, setSelectNavbar } = useSelectNavbarStore();
  const { child, setChild } = useChildStore();
  const { teachers, setTeachers } = useTeacherStore(); //teachers này là của riêng đứa trẻ đó # với teachers của toàn hệ thống
  const { plans, setPlans } = usePlanStore();
  const { reports, setReports } = useReportStore();
  const { setReportSaveds } = useReportSavedStore();
  const { setTotalPlanTasks } = useTotalPlanTaskStore();
  const { setTotalReportTasks } = useTotalReportTaskStore();
  const { setFields } = useFieldStore();
  const { setTargets } = useTargetStore();
  const { setInterventions } = useInterventionStore();
  const { carts, setCarts } = useCartStore();
  const { setComments } = useCommentStore();
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuLeftRef = useRef<HTMLDivElement>(null);

  const [teacherStatus, setTeacherStatus] = useState<any>({});

  useEffect(() => {
    const statusRef = ref(rtdb, "status");

    const unsubscribe = onValue(statusRef, (snapshot) => {
      setTeacherStatus(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: data_targets, loading: loading_targets } = useFirestoreWithMeta(
    {
      key: "targetsCache",
      query: query_targets,
      metaDoc: "targets",
    },
  );
  const { data: data_interventions, loading: loading_interventions } =
    useFirestoreWithMeta({
      key: "interventions",
      query: query_interventions,
      metaDoc: "interventions",
    });
  const { data: data_fields, loading: loading_fields } = useFirestoreWithMeta({
    key: "fieldsCache",
    query: query_fields,
    metaDoc: "fields",
  });
  const { data: data_plans, loading: loading_plans } =
    useFirestoreWithMetaCondition({
      key: `plansCache_${user?.id}_${id}`,
      metaDoc: "plans",
      id: user?.id,
      nameCollect: "plans",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("childId", "==", id),
      ],
    });
  const { data: data_reports, loading: loading_reports } =
    useFirestoreWithMetaCondition({
      key: `reportsCache_${user?.id}_${id}`,
      metaDoc: "reports",
      id: user?.id,
      nameCollect: "reports",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("childId", "==", id),
      ],
    });
  const { data: data_carts, loading: loading_carts } =
    useFirestoreWithMetaCondition({
      key: `cartsCache_${user?.id}_${id}`,
      metaDoc: "carts",
      id: user?.id,
      nameCollect: "carts",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("childId", "==", id),
      ],
    });
  const { data: data_reportSaveds, loading: loading_reportSaveds } =
    useFirestoreWithMetaCondition({
      key: `reportSavedsCache_${user?.id}_${id}`,
      metaDoc: "reportSaveds",
      id: user?.id,
      nameCollect: "reportSaveds",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("childId", "==", id),
      ],
    });
  const { data: data_comments, loading: loading_comments } =
    useFirestoreWithMetaCondition({
      key: `commentsCache_${user?.id}_${id}`,
      metaDoc: "comments",
      id: user?.id,
      nameCollect: "comments",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("childId", "==", id),
        orderBy("createAt", "desc"),
      ],
    });

  useEffect(() => {
    if (!loading_targets) {
      setTargets(data_targets as TargetModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_targets, loading_targets]);
  useEffect(() => {
    if (!loading_interventions) {
      setInterventions(data_interventions as InterventionModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_interventions, loading_interventions]);
  useEffect(() => {
    if (!loading_fields) {
      setFields(data_fields as FieldModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_fields, loading_fields]);
  useEffect(() => {
    if (!loading_plans) {
      setPlans(data_plans as PlanModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_plans, loading_plans]);
  useEffect(() => {
    if (!loading_reports) {
      setReports(data_reports as ReportModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_reports, loading_reports]);
  useEffect(() => {
    if (!loading_carts) {
      setCarts(data_carts as CartModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_carts, loading_carts]);
  useEffect(() => {
    if (!loading_reportSaveds) {
      setReportSaveds(data_reportSaveds as ReportSavedModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_reportSaveds, loading_reportSaveds]);
  useEffect(() => {
    if (!loading_comments) {
      setComments(data_comments as CommentModel[]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data_comments, loading_comments]);

  useEffect(() => {
    if (id) {
      getDocData({
        id,
        nameCollect: "children",
        setData: setChild,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    if (child) {
      getDocsData({
        nameCollect: "users",
        condition: [where("id", "in", child.teacherIds)],
        setData: setTeachers,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child]);
  useEffect(() => {
    if (child) {
      getDocsData({
        nameCollect: "planTasks",
        setData: setTotalPlanTasks,
        condition: [
          where("childId", "==", child.id),
          where("teacherIds", "array-contains", user?.id),
        ],
      });
      getDocsData({
        nameCollect: "reportTasks",
        setData: setTotalReportTasks,
        condition: [
          where("childId", "==", child.id),
          where("teacherIds", "array-contains", user?.id),
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child, user]);

  const handleQuantityPending = () => {
    const items = plans
      .concat(reports)
      .filter((_: any) => _.status === "pending");
    return items;
  };

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

  return (
    <>
      <style>{css}</style>

      <div className="dashboard-page">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={`dashboard-sidebar ${sidebarOpen ? "show" : ""}`}>
          <Logo type="dashboard" />

          <nav className="menu">
            {/* <MenuItem
              icon="bi-speedometer2"
              label="Dashboard"
              navigate="dashboard"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
            /> */}
            <MenuItem
              icon="bi-bank2"
              label="Ngân hàng mục tiêu"
              active
              navigate="bank"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
              setSidebarOpen={setSidebarOpen}
            />
            <MenuItem
              icon="bi-calendar2-check"
              label="Kế hoạch can thiệp"
              navigate="plan"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
              setSidebarOpen={setSidebarOpen}
            />
            <MenuItem
              icon="bi-file-earmark-text"
              label="Báo cáo can thiệp"
              navigate="report"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
              setSidebarOpen={setSidebarOpen}
            />
            <MenuItem
              icon="bi-shield-check"
              label="Chờ duyệt"
              badge={handleQuantityPending().length}
              navigate="pending"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
              setSidebarOpen={setSidebarOpen}
              isComment={handleCommentTotal(plans.concat(reports))}
            />
            <MenuItem
              icon="bi-cart-check"
              label="Giỏ mục tiêu"
              badge={carts.length}
              navigate="cart"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
              setSidebarOpen={setSidebarOpen}
            />
            {/* <MenuItem
              icon="bi-folder2-open"
              label="Thư viện tài liệu"
              navigate="library"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
            />
            <MenuItem
              icon="bi-gear"
              label="Cài đặt"
              navigate="settings"
              selectNavbar={selectNavbar}
              setSelectNavbar={setSelectNavbar}
            /> */}
          </nav>

          {/* Dropdown phia ben navbar */}
          <div className="user-left-dropdown-wrapper mt-3" ref={menuLeftRef}>
            <div
              className="user-trigger"
              onClick={() => setOpenLeft(!openLeft)}
            >
              <InfoBox
                image={user?.avatar || logoUrl}
                title={user?.fullName || "Cô giáo"}
                subtitle={user?.position || "Chuyên viên Tâm lý"}
                user
              />

              <i
                className={`bi ${
                  openLeft ? "bi-chevron-up" : "bi-chevron-down"
                } user-arrow`}
              />
            </div>

            {openLeft && (
              <div className="user-dropdown-menu">
                {user?.role === "admin" && (
                  <Link
                    onClick={() => {
                      setOpenLeft(false);
                      setSidebarOpen(false);
                    }}
                    to="./admin"
                    className="dropdown-item-custom text-decoration-none"
                  >
                    <i className="bi bi-speedometer2" />
                    Trang quản trị
                  </Link>
                )}

                <Link
                  onClick={() => {
                    setOpenLeft(false);
                    setSidebarOpen(false);
                  }}
                  to="./changepassword"
                  className="dropdown-item-custom text-decoration-none"
                >
                  <i className="bi bi-key" />
                  Đổi mật khẩu
                </Link>

                {user?.role === "admin" && (
                  <Link
                    onClick={() => {
                      setOpenLeft(false);
                      setSidebarOpen(false);
                    }}
                    to="../register"
                    className="dropdown-item-custom text-decoration-none"
                  >
                    <i className="bi bi-person-plus" />
                    Đăng ký tài khoản
                  </Link>
                )}

                <Link
                  onClick={() => {
                    setOpenLeft(false);
                    setSidebarOpen(false);
                  }}
                  to="./setting"
                  className="dropdown-item-custom text-decoration-none"
                >
                  <i className="bi bi-gear" />
                  Cài đặt
                </Link>

                <div className="dropdown-divider-custom" />

                <button
                  className="dropdown-item-custom danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <div className="menu-background">
              <img alt="dashboad-menu" src="/menu-background.png" />
            </div>

            <strong className="slogan">Mỗi bước nhỏ</strong>
            <div className="heart">
              <i className="bi bi-heart-pulse-fill"></i>
              {/* <i className="bi bi-stars" style={{ color: "#118c17" }}></i> */}
            </div>
            <strong className="slogan">Một kỳ tích lớn</strong>
          </div>
        </aside>

        <main className="dashboard-main">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <i className="bi bi-list"></i>
            </button>

            <InfoBox
              className="user-info-box"
              image={child?.avatar || logoUrl}
              title={child?.fullName || "Child Name"}
              subtitle={getChildAge(child?.birth) || "Chưa xác định"}
            />

            <div className="teacher-box">
              <div className="teacher-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <strong>Giáo viên phụ trách </strong>
                <span>
                  {/* {teachers.length > 0 &&
                    teachers
                      .filter((teacher) =>
                        child?.teacherIds?.includes(teacher.id),
                      )
                      .map((teacher, index) => (
                        <React.Fragment key={teacher.id}>
                          {index > 0 && <>&nbsp;&nbsp;&nbsp;&nbsp;</>}
                          {index + 1}. {teacher.fullName}
                        </React.Fragment>
                      ))} */}

                  {teachers.length > 0 &&
                    teachers
                      .filter((teacher) =>
                        child?.teacherIds?.includes(teacher.id),
                      )
                      .map((teacher, index) => {
                        const isOnline =
                          teacherStatus?.[teacher.id]?.online === true;

                        return (
                          <React.Fragment key={teacher.id}>
                            {index > 0 && <>&nbsp;&nbsp;&nbsp;&nbsp;</>}
                            {index + 1}. {teacher.fullName}
                            {teacher.role !== "admin" && (
                              <span
                                className={`teacher-status-dot ${
                                  isOnline ? "online" : "offline"
                                }`}
                                title={getOnlineStatus(
                                  teacherStatus?.[teacher.id],
                                )}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                </span>
              </div>
            </div>

            <div className="user-dropdown-wrapper" ref={menuRef}>
              <div className="user-trigger" onClick={() => setOpen(!open)}>
                <InfoBox
                  image={user?.avatar || logoUrl}
                  title={user?.fullName || "Cô giáo"}
                  subtitle={user?.position || "Chuyên viên Tâm lý"}
                  user
                />

                <i
                  className={`bi ${
                    open ? "bi-chevron-up" : "bi-chevron-down"
                  } user-arrow`}
                />
              </div>

              {open && (
                <div className="user-dropdown-menu">
                  {user?.role === "admin" && (
                    <Link
                      onClick={() => setOpen(false)}
                      to="./admin"
                      className="dropdown-item-custom text-decoration-none"
                    >
                      <i className="bi bi-speedometer2" />
                      Trang quản trị
                    </Link>
                  )}

                  <Link
                    onClick={() => setOpen(false)}
                    to="./changepassword"
                    className="dropdown-item-custom text-decoration-none"
                  >
                    <i className="bi bi-key" />
                    Đổi mật khẩu
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      onClick={() => setOpen(false)}
                      to="../register"
                      className="dropdown-item-custom text-decoration-none"
                    >
                      <i className="bi bi-person-plus" />
                      Đăng ký tài khoản
                    </Link>
                  )}

                  <Link
                    onClick={() => setOpen(false)}
                    to="./setting"
                    className="dropdown-item-custom text-decoration-none"
                  >
                    <i className="bi bi-gear" />
                    Cài đặt
                  </Link>

                  <div className="dropdown-divider-custom" />

                  <button
                    className="dropdown-item-custom danger"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </header>

          <Outlet />

          <footer className="footer">
            <span>© 2026 © {CENTER_NAME}</span>
            <span>Phiên bản 1.0.0</span>
          </footer>
        </main>
      </div>

      <LoadingOverlay show={isLoading} />
    </>
  );
}

function InfoBox({ image, title, subtitle, user }: any) {
  return (
    <div className={`info-box ${user ? "user-box" : ""}`}>
      <img src={image} alt={title} />
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      {/* {user && <i className="bi bi-chevron-down ms-auto"></i>} */}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  badge,
  navigate,
  selectNavbar,
  setSelectNavbar,
  setSidebarOpen,
  isComment,
}: any) {
  return (
    <Link
      to={navigate}
      className={`text-decoration-none menu-item ${selectNavbar === navigate ? "active" : ""}`}
      onClick={() => {
        setSelectNavbar(navigate);
        setSidebarOpen(false);
      }}
    >
      <span>
        <i className={`bi ${icon}`}></i>
      </span>
      <b>{label}</b>
      {isComment && <Message color={"red"} size={26} variant="Bold" />}
      {badge && <em>{badge}</em>}
    </Link>
  );
}

const css = `
:root {
  --green: #118c17;
  --green-dark: #056b10;
  --green-deep: #03490b;
  --green-soft: #e9f8eb;
  --green-light: #f4fff6;
  --border: #cbe8d0;
  --red: #ef4444;
  --yellow: #f5b400;
  --text: #073f0c;
  --muted: #527d57;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #eef9f0;
  color: var(--text);
}

.dashboard-page {
  min-height: 100vh;
  display: flex;
  background: white;
  // background:
  //   radial-gradient(circle at top left, rgba(17, 140, 23, .13), transparent 30%),
  //   linear-gradient(135deg, #f7fff8, #e8f8eb);
}

/* SIDEBAR */

.dashboard-sidebar {
  width: 300px;
  min-height: 100vh;
  padding: 22px 18px;
  background: rgba(255, 255, 255, .96);
  border-right: 1px solid var(--border);
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 1200;

  // min-height: 100vh;
  // position: relative;

  // background-image: url("/page-container.png");
  // background-size: cover;
  // background-position: center;
  // background-repeat: no-repeat;
  // background-attachment: fixed;
}

.close-sidebar,
.sidebar-overlay {
  display: none;
}

/* LOGO */

.brand-logo {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--green-soft);
  box-shadow: 0 8px 22px rgba(5, 107, 16, .12);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.logo-title,
.brand-title {
  color: var(--green-deep);
  font-size: 18px;
  font-weight: 950;
  line-height: 1.2;
  letter-spacing: .2px;
  text-transform: uppercase;
}

/* MENU */

.menu {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  position: relative;
  height: 58px;
  border: 0;
  border-radius: 20px;
  background: transparent;
  color: #315d36;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  transition: .2s ease;
}

.menu-item:hover,
.menu-item.active {
  background: linear-gradient(135deg, #e5f8e8, #f7fff8);
  color: var(--green-deep);
}

.menu-item.active {
  box-shadow: inset 5px 0 0 var(--green);
}

.menu-item span {
  width: 36px;
  height: 36px;
  border-radius: 13px;
  background: #fff7d6;
  color: #b7791f;
  display: grid;
  place-items: center;
  font-size: 17px;
}

.menu-item.active span {
  color: var(--green);
  background: #dff7e4;
}

.menu-item b {
  font-size: 15px;
}

.menu-item em {
  margin-left: auto;
  min-width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffe1e1;
  color: var(--red);
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 12px;
  font-weight: 900;
}

/* SIDEBAR FOOTER */

.sidebar-footer {
  margin-top: auto;
  padding: 28px 18px;
  border-radius: 24px;
  text-align: center;
  // background:
  //   radial-gradient(circle at top, #fff, transparent 42%),
  //   linear-gradient(135deg, #f8fff9, #dff7e4);
  border: 1px solid var(--border);
  img {
    height: 120px;
    width: auto;
  }
}

.heart {
  width: 64px;
  height: 64px;
  margin: auto;
  border-radius: 50%;
  background: #fff;
  color: var(--red);
  display: grid;
  place-items: center;
  font-size: 26px;
}

.sidebar-footer p {
  margin: 18px 0 2px;
  // color: var(--muted);
  color: red;
  font-weight: 700;
}

.sidebar-footer strong {
  // color: var(--green-deep);
  color: red;
}

.slogan {
  font-family: "Alex Brush", cursive;
  font-size: 1.5rem;
  font-weight: 200;


  // background: linear-gradient(
  //   to bottom,
  //   #ff5f5f 0%,
  //   #e53935 45%,
  //   #b71c1c 100%
  // );

  // -webkit-background-clip: text;
  // -webkit-text-fill-color: transparent;

  // -webkit-text-stroke: 1px #ffffff;

  text-shadow:
    1px 1px 0 #ffffff,
    2px 2px 4px rgba(0, 0, 0, 0.15);

  text-align: center;
  line-height: 1.2;
}

.teacher-status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 6px;
  border-radius: 50%;
  vertical-align: middle;
  cursor: pointer;
}

.teacher-status-dot.online {
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.teacher-status-dot.offline {
  background: #9ca3af;
}
  
@media (max-width: 768px) {
  .slogan {
    font-size: 1rem;
  }
}
/* MAIN */

.dashboard-main {
  flex: 1;
  min-width: 0;
  padding: 0 26px 32px;

  // min-height: 100vh;
  // position: relative;

  // background-image: url("/page-container.png");
  // background-size: cover;
  // background-position: center;
  // background-repeat: no-repeat;
  // background-attachment: fixed;
}

.topbar {
  height: 78px;
  display: grid;
  grid-template-columns: 54px 300px minmax(360px, 1fr) 290px;
  gap: 18px;
  align-items: center;
}

.menu-btn {
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 15px;
  background: #e5f8e8;
  color: var(--green);
  font-size: 22px;
}

.info-box,
.teacher-box {
  height: 62px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 10px 28px rgba(5, 107, 16, .06);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}

.info-box img {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  object-fit: cover;
}

.info-box strong,
.teacher-box strong {
  display: block;
  color: var(--green-deep);
  font-weight: 950;
}

.info-box span,
.teacher-box span {
  color: #5f8064;
  font-size: 13px;
  font-weight: 600;
}

.teacher-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: #ffe1e1;
  color: var(--red);
  display: grid;
  place-items: center;
  font-size: 22px;
}

/* TITLE */

.page-title {
  padding: 28px 0 18px;
}

.page-title h1 {
  margin: 0;
  color: var(--green-deep);
  font-size: 36px;
  font-weight: 950;
}

.page-title p {
  margin: 6px 0 0;
  color: var(--muted);
  font-weight: 650;
}

/* CARDS */

.category-panel,
.toolbar,
.table-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 14px 36px rgba(5, 107, 16, .07);
}

/* CATEGORY */

.category-panel {
  padding: 22px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.panel-head h3,
.goal-title h3 {
  margin: 0;
  color: var(--green-deep);
  font-size: 28px;
  font-weight: 950;
}

.panel-head p {
  margin: 4px 0 0;
  color: #5f8064;
  font-weight: 600;
}

.viewing {
  color: #315d36;
  font-weight: 800;
  white-space: nowrap;
}

.category-scroll {
  margin-top: 16px;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 14px;
}

.category-scroll::-webkit-scrollbar {
  height: 8px;
}

.category-scroll::-webkit-scrollbar-thumb {
  background: #93c59a;
  border-radius: 999px;
}

.category-card {
  min-width: 175px;
  height: 210px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--green-deep);
  padding: 18px 14px;
  text-align: center;
  transition: .2s ease;
}

.category-card:hover,
.category-card.active {
  border-color: var(--green);
  box-shadow: 0 14px 30px rgba(17, 140, 23, .15);
}

.category-card i {
  font-size: 48px;
  color: var(--green-dark);
}

.category-card h4 {
  margin: 14px 0;
  font-size: 15px;
  font-weight: 950;
}

.cat-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #5f8064;
}

.cat-meta b {
  color: var(--red);
}

.cat-progress {
  height: 8px;
  margin-top: 10px;
  border-radius: 999px;
  background: #dff7e4;
  overflow: hidden;
}

.cat-progress div {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--green), var(--yellow));
}

.percent {
  display: block;
  margin-top: 8px;
  text-align: right;
  color: var(--green-deep);
}

/* TOOLBAR */

.toolbar {
  margin-top: 18px;
  padding: 18px;
  display: grid;
  grid-template-columns: 1fr 110px 190px 260px;
  gap: 14px;
}

.search-box {
  height: 48px;
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
}

.search-box i {
  color: var(--green);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  font-weight: 600;
}

.filter-btn,
.selected-pill,
.plan-btn {
  height: 48px;
  border: 0;
  border-radius: 16px;
  font-weight: 900;
}

.filter-btn,
.selected-pill {
  background: #e5f8e8;
  color: var(--green-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.plan-btn {
  color: #fff;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
}

/* TABLE */

.goal-section {
  margin-top: 24px;
}

.goal-title span {
  color: var(--muted);
  font-weight: 650;
}

.table-card {
  margin-top: 14px;
  overflow-x: auto;
}

.table-card table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

.table-card thead {
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  color: #fff;
}

.table-card th,
.table-card td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2eee5;
  font-size: 14px;
  vertical-align: middle;
}

.level,
.area {
  padding: 6px 11px;
  border-radius: 999px;
  background: #dff7e4;
  color: var(--green-deep);
  font-size: 12px;
  font-weight: 900;
}

.code {
  color: var(--green-deep);
  font-weight: 900;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button,
.pagination-box button {
  border: 0;
  color: var(--green);
  background: #e5f8e8;
  font-weight: 900;
}

.actions button {
  width: 34px;
  height: 34px;
  border-radius: 12px;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--green);
}

.table-footer {
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--muted);
  font-weight: 700;
}

.pagination-box {
  display: flex;
  gap: 6px;
}

.pagination-box button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--green-deep);
}

.pagination-box button.active {
  background: var(--green);
  color: #fff;
}

/* FOOTER */

.footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 600;
}

.user-dropdown-wrapper,
.user-left-dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

.user-left-dropdown-wrapper {
  display: none;
}

.user-trigger {
  position: relative;
  cursor: pointer;
}

.user-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--green-deep);
  font-size: 14px;
  transition: 0.2s;
  pointer-events: none;
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;

  width: 260px;

  padding: 10px;

  background: #fff;
  border-radius: 24px;
  border: 1px solid var(--border);

  box-shadow: 0 20px 40px rgba(5, 107, 16, 0.15);

  z-index: 9999;

  animation: dropdownShow 0.2s ease;
}

.dropdown-item-custom {
  width: 100%;

  padding: 14px 16px;

  border: none;
  background: transparent;

  display: flex;
  align-items: center;
  gap: 12px;

  border-radius: 16px;

  font-size: 16px;
  font-weight: 800;

  color: var(--green-deep);

  transition: 0.2s;
}

.dropdown-item-custom:hover {
  background: var(--green-soft);
  color: var(--green-dark);
}

.dropdown-item-custom i {
  font-size: 18px;
}

.dropdown-divider-custom {
  height: 1px;
  margin: 8px 0;
  background: #dfeee2;
}

.dropdown-item-custom.danger {
  color: #ef4444;
}

.dropdown-item-custom.danger:hover {
  background: #fff1f1;
}

@keyframes dropdownShow {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RESPONSIVE */

@media (max-width: 1300px) {
  .dashboard-sidebar {
    position: fixed;
    left: -320px;
    top: 0;
    height: 100vh;
    transition: .28s ease;
    box-shadow: 20px 0 60px rgba(3, 73, 11, .18);
  }

  .dashboard-sidebar.show {
    left: 0;
  }

  .close-sidebar {
    display: grid;
    place-items: center;
    position: absolute;
    right: -52px;
    top: 18px;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 14px;
    background: #fff;
    color: var(--green);
    box-shadow: 0 10px 30px rgba(0, 0, 0, .15);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1100;
    background: rgba(3, 73, 11, .35);
  }

  .topbar {
    grid-template-columns: 54px 1fr 1fr;
  }

  .user-box {
    // display: none;
    display: flex;
  }

  .toolbar {
    grid-template-columns: 1fr 120px;
  }
}

@media (max-width: 900px) {
  .dashboard-main {
    padding: 0 14px 24px;
  }

  .topbar {
    height: auto;
    padding: 14px 0;
    grid-template-columns: 54px 1fr;
  }

  .teacher-box {
    display: none;
  }

  // .teacher-box {
  //   grid-column: 1 / -1;
  // }

  .teacher-box,
  .user-dropdown-wrapper,
  .user-left-dropdown-wrapper,
  .user-info-box {
    grid-column: 1 / -1;
  }

  .page-title h1 {
    font-size: 30px;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .table-footer,
  .footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 576px) {
  .topbar {
    grid-template-columns: 44px 1fr;
    gap: 10px;
  }

  .menu-btn {
    width: 42px;
    height: 42px;
  }

  .info-box,
  .teacher-box {
    height: auto;
    min-height: 58px;
    padding: 10px 12px;
  }

  .teacher-box {
    display: none;
  }

  // .teacher-box {
  //   display: flex;
  //   grid-column: 1 / -1;
  // }

  .user-dropdown-wrapper {
    display: none;
  }

  .user-left-dropdown-wrapper {
    display: block;
    grid-column: 1 / -1;
    width: 100%;
  }

  .page-title {
    padding-top: 14px;
  }

  .page-title h1 {
    font-size: 28px;
  }

  .category-panel {
    padding: 16px;
  }

  .panel-head h3,
  .goal-title h3 {
    font-size: 24px;
  }

  .category-card {
    min-width: 160px;
    height: 200px;
  }

  .plan-btn,
  .filter-btn,
  .selected-pill {
    width: 100%;
  }
}
`;
