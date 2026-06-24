import { serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useMemo, useRef, useState } from "react";
import Select, { MultiValue } from "react-select";
import LoadingOverlay from "../../components/LoadingOverLay";
import { addDocData } from "../../constants/firebase/addDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { convertTimestampToDateInput } from "../../constants/info";
import { uploadChildAvatar } from "../../constants/uploadAvatar";
import { functions } from "../../firebase.config";
import { ChildrenModel, UserModel } from "../../models";
import { useUserStore } from "../../zustand";

interface OptionType {
  id: string;
  fullName: string;
}

export default function ChildrenScreen() {
  const { user } = useUserStore();
  const [teachers, setTeachers] = useState<UserModel[]>([]);
  const [children, setChildren] = useState<ChildrenModel[]>([]);
  const [newChildren, setNewChildren] = useState<any[]>([]);
  const [childEdit, setChildEdit] = useState<ChildrenModel>();
  const [isLoading, setIsLoading] = useState(false);
  const [disable, setDisable] = useState(true);
  const [selectTeachers, setSelectTeachers] = useState<OptionType[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    shortName: "",
    birth: "",
    gender: "",
    status: "studying", //studying || paused , còn xóa luôn thì k cần
  });
  const [keyword, setKeyword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "users",
        setData: setTeachers,
      });
      getDocsData({
        nameCollect: "children",
        setData: setChildren,
      });
    }
  }, [user]);
  useEffect(() => {
    if (childEdit) {
      setForm({
        fullName: childEdit.fullName,
        status: childEdit.status || "studying",
        shortName: childEdit.shortName,
        birth: convertTimestampToDateInput(childEdit.birth),
        gender: childEdit.gender,
      });
      setAvatarPreview(childEdit.avatar);
      setSelectTeachers(
        childEdit.teacherIds.map((_) => {
          const indexTeacher = teachers.findIndex(
            (teacher) => teacher.id === _,
          );
          return { id: _, fullName: teachers[indexTeacher].fullName };
        }),
      );
    }
  }, [childEdit]);
  useEffect(() => {
    if (form.fullName && selectTeachers.length > 0) {
      ///chổ này thời gian sau nếu trẻ đồng bộ được status thì fix lại
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [form, selectTeachers]);
  useEffect(() => {
    if (children.length > 0) {
      setNewChildren(children);
    }
  }, [children]);

  const teacherMap = useMemo(() => {
    const map: any = {};
    teachers.forEach((t) => {
      map[t.id] = t.fullName;
    });
    return map;
  }, [teachers]);

  const filteredChildren = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return newChildren.filter((child: ChildrenModel) => {
      const teacherNames = (child.teacherIds || [])
        .map((id: string) => teacherMap[id] || "")
        .join(" ");

      const content = `
      ${child.fullName ?? ""}
      ${child.id ?? ""}
      ${teacherNames}
    `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [newChildren, keyword, teacherMap]);

  const handleChild = async (e: any) => {
    e.preventDefault();
    const teacherIds = selectTeachers.map((item) => item.id);

    const data = {
      fullName: form.fullName,
      avatar: avatarPreview || "/NSXEdu-icon-512x512.png",
      status: form.status,
      shortName: form.shortName,
      birth: form.birth,
      gender: form.gender,
      teacherIds,
    };

    setIsLoading(true);

    try {
      // ✅ CẬP NHẬT TRẺ: dùng Cloud Function
      if (childEdit) {
        let avatar = data.avatar;

        if (avatarFile) {
          const resultAvatar = await uploadChildAvatar(
            avatarFile,
            childEdit.id,
          );

          avatar = resultAvatar.avatar;
        }

        const res = await httpsCallable<
          {
            childId: string;
            fullName: string;
            avatar: string;
            status: string;
            shortName: string;
            birth: string;
            gender: string;
            teacherIds: string[];
          },
          {
            ok: boolean;
            childId: string;
            teacherChanged: boolean;
            updatedCount: number;
          }
        >(
          functions,
          "updateChild",
        )({
          childId: childEdit.id,
          ...data,
          avatar,
        });

        setNewChildren((prev) =>
          prev.map((child) =>
            child.id === childEdit.id
              ? {
                  ...child,
                  ...data,
                  updateAt: new Date(),
                }
              : child,
          ),
        );

        handleToastSuccess(
          res.data.teacherChanged
            ? `Cập nhật trẻ thành công! Đã đồng bộ ${res.data.updatedCount} mục liên quan.`
            : `Cập nhật trẻ thành công!`,
        );
      }
      // ✅ TẠO MỚI TRẺ: vẫn dùng client
      else {
        const result = await addDocData({
          nameCollect: "children",
          value: {
            ...data,
            avatar: "",
            createAt: serverTimestamp(),
            updateAt: serverTimestamp(),
          },
          metaDoc: "children",
        });

        let avatar = "";

        if (avatarFile) {
          const resultAvatar = await uploadChildAvatar(avatarFile, result.id);
          avatar = resultAvatar?.avatar || "";
        }

        setNewChildren((prev) => [
          ...prev,
          {
            ...data,
            id: result.id,
            avatar,
            createAt: new Date(),
            updateAt: new Date(),
          },
        ]);

        handleToastSuccess("Thêm trẻ mới thành công!");
      }

      handleCreateNew()
      
    } catch (err: any) {
      console.error(err);

      if (err.code === "functions/permission-denied") {
        handleToastError("Chỉ admin mới có quyền cập nhật trẻ");
      } else if (err.code === "functions/not-found") {
        handleToastError("Không tìm thấy trẻ");
      } else {
        handleToastError(
          childEdit ? "Cập nhật trẻ thất bại" : "Thêm trẻ mới thất bại",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Reset form (TẠO MỚI)
  const handleCreateNew = () => {
    setForm({
      fullName: "",
      status: "",
      shortName: "",
      birth: "",
      gender: "",
    });
    setSelectTeachers([]);
    setChildEdit(undefined);
    setAvatarPreview("");
    setAvatarFile(null);
  };

  const handleDeleteChild = async () => {
    if (!childEdit) return;

    setShowDelete(false);
    setIsLoading(true);

    try {
      const deleteChildDeep = httpsCallable<
        { childId: string },
        {
          ok: boolean;
          deletedChildId: string;
          deleted: {
            carts: number;
            plans: number;
            planTasks: number;
            reports: number;
            reportTasks: number;
            reportSaveds: number;
          };
          deletedPlansCount: number;
          deletedReportsCount: number;
        }
      >(functions, "deleteChildDeep");

      const res = await deleteChildDeep({
        childId: childEdit.id,
      });

      setNewChildren((prev) =>
        prev.filter((child) => child.id !== childEdit.id),
      );

      setChildEdit(undefined);
      setForm({
        fullName: "",
        status: "",
        shortName: "",
        birth: "",
        gender: "",
      });
      setSelectTeachers([]);

      const deleted = res.data.deleted;

      handleToastSuccess(
        `Xóa trẻ thành công! Đã xóa 
        ${deleted.plans} kế hoạch, 
        ${deleted.planTasks} chi tiết kế hoạch, 
        ${deleted.reports} báo cáo, 
        ${deleted.reportTasks} chi tiết báo cáo, 
        ${deleted.carts} giỏ nháp, 
        ${deleted.reportSaveds} chi tiết báo cáo nháp`,
      );

      // console.log("Chi tiết dữ liệu đã xóa:", {
      //   carts: deleted.carts,
      //   plans: deleted.plans,
      //   planTasks: deleted.planTasks,
      //   reports: deleted.reports,
      //   reportTasks: deleted.reportTasks,
      //   reportSaveds: deleted.reportSaveds,
      // });
    } catch (err: any) {
      console.error(err);

      if (err.code === "functions/permission-denied") {
        handleToastError("Chỉ admin mới có quyền xóa trẻ");
      } else if (err.code === "functions/not-found") {
        handleToastError("Không tìm thấy trẻ");
      } else if (err.code === "functions/unauthenticated") {
        handleToastError("Bạn cần đăng nhập lại");
      } else {
        handleToastError("Xóa trẻ thất bại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
const scrollToEditForm = () => {
    if (window.innerWidth >= 1200) return;

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };
  return (
    <>
      <style>{css}</style>

      <div className="children-page">
        <div className="row g-4">
          {/* DANH SÁCH TRẺ */}
          <div className="col-12 col-xl-8">
            <div className="children-card">
              <div className="children-search">
                <i className="bi bi-search"></i>

                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập tên trẻ, giáo viên phụ trách..."
                />

                <span className="children-count">
                  Có {filteredChildren.length} trẻ
                </span>
              </div>

              <div className="table-responsive">
                {filteredChildren.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-search empty-icon"></i>
                    <div className="empty-text">
                      Không tìm thấy trẻ phù hợp.
                    </div>
                  </div>
                ) : (
                  <table className="table children-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tên trẻ</th>
                        <th>Giáo viên phụ trách</th>
                        <th style={{ width: "120px" }}>Hành động</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredChildren.map((child) => (
                        <tr key={child.id}>
                          <td>
                            <div className="child-name">{child.fullName}</div>

                            <div className="child-id">{child.id}</div>
                          </td>

                          <td>
                            <div className="teacher-tags">
                              {(child.teacherIds || [])
                                .map((id: string) => teacherMap[id])
                                .filter(Boolean)
                                .map((name: string, index: number) => (
                                  <span key={index} className="teacher-badge">
                                    {name}
                                  </span>
                                ))}
                            </div>
                          </td>

                          <td>
                            <button
                              className="edit-btn"
                              onClick={() => {
                                setChildEdit(child);
                                handleToastSuccess(
                                  "Chế độ chỉnh sửa thông tin đã bật",
                                );
                                scrollToEditForm();
                              }}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="col-12 col-xl-4">
            <div
              ref={formRef} className="register-card">
              {/* ICON XÓA */}
              {childEdit && (
                <button
                  className="icon-btn icon-delete position-absolute"
                  style={{ top: 12, left: 12 }}
                  onClick={() => setShowDelete(true)}
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              )}

              {/* ICON TẠO MỚI */}
              {childEdit && (
                <button
                  className="icon-btn icon-add position-absolute"
                  style={{ top: 12, right: 12 }}
                  onClick={() => {
                    handleCreateNew();
                    handleToastSuccess("Chế độ thêm mới đã bật");
                  }}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              )}

              <h2>{childEdit ? "Chỉnh sửa thông tin trẻ" : "Thêm trẻ mới"}</h2>

              <form className="d-flex flex-column gap-3">
                <input
                  className="form-control mb-2"
                  placeholder="Tên trẻ"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Bí danh"
                  value={form.shortName}
                  onChange={(e) =>
                    setForm({ ...form, shortName: e.target.value })
                  }
                />

                <input
                  type="date"
                  className="form-control mb-2"
                  placeholder="Ngày sinh"
                  value={form.birth}
                  onChange={(e) => setForm({ ...form, birth: e.target.value })}
                />

                <select
                  className="form-control mb-2"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>

                {/* <input
                  className="form-control mb-2"
                  placeholder="Avatar"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                /> */}

                <span>Ảnh đại diện:</span>
                <div className="text-center mb-2">
                  <img
                    src={avatarPreview || "/NSXEdu-icon-512x512.png"}
                    className="child-avatar me-3"
                    alt="avatar"
                  />

                  <input
                    type="file"
                    id="childAvatar"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />

                  <label htmlFor="childAvatar" className="btn btn-light mt-2">
                    <i className="bi bi-camera me-2"></i>
                    Đổi ảnh
                  </label>
                </div>

                <Select
                  className="mb-2"
                  getOptionLabel={(option) => option.fullName}
                  getOptionValue={(option) => option.id.toString()}
                  isMulti
                  options={teachers}
                  value={selectTeachers}
                  onChange={(value: MultiValue<OptionType>) => {
                    setSelectTeachers(value as OptionType[]);
                  }}
                />
                <select
                  className="form-select mb-3"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value={"studying"}>Đang học</option>
                  <option value={"paused"}>Tạm dừng</option>
                </select>

                <button
                  type="button"
                  className="btn action-btn-primary w-100 admin-children-primary"
                  onClick={disable ? undefined : handleChild}
                  disabled={disable}
                >
                  {childEdit ? "Cập nhật" : "Đăng ký"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />

      {showDelete && childEdit && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            {/* Title */}
            <h5 className="fw-black text-danger mb-2">Xác nhận xoá trẻ</h5>

            {/* Description */}
            <p className="text-green-muted small">
              Hành động này sẽ xoá toàn bộ nội dung liên quan đến trẻ và không
              thể khôi phục.
            </p>

            {/* Plan info */}
            <div className="plan-delete-box mt-2">
              <div className="small">
                <strong>Tên trẻ:</strong> {childEdit.fullName}
              </div>
              <div className="small">
                <strong>Mã trẻ:</strong> {childEdit.id}
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowDelete(false)}
              >
                Huỷ
              </button>

              <button
                className="btn action-btn-danger"
                onClick={handleDeleteChild}
              >
                <i className="bi bi-trash me-2" />
                Xoá trẻ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  --line: #d8e7db;

  --yellow: #f5b400;
  --orange: #f97316;

  --red: #ef4444;
  --red-dark: #dc2626;

  --text: #111827;
  --muted: #64748b;

  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 24px;

  --shadow:
    0 12px 28px rgba(5, 107, 16, 0.08);

  --shadow-modal:
    0 24px 60px rgba(6, 95, 70, 0.22);
}

* {
  box-sizing: border-box;
}

.children-page {
  padding: 24px 0;
}

/* =========================
   CARD
========================= */

.children-card,
.register-card {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);

  border: 1px solid var(--border);
  border-radius: var(--radius-xl);

  box-shadow: var(--shadow);
}

.register-card {
  position: relative;
  padding: 24px;
}

/* =========================
   SEARCH
========================= */

.children-search {
  height: 60px;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 0 18px;

  border-bottom: 1px solid #e3eee5;
}

.children-search i {
  color: var(--green);
  font-size: 18px;
}

.children-search input {
  flex: 1;

  border: none;
  outline: none;
  background: transparent;

  color: var(--green-deep);
  font-weight: 600;
}

.children-search input::placeholder {
  color: #94a3b8;
}

.children-count {
  white-space: nowrap;

  color: #58745d;
  font-weight: 700;
}

/* =========================
   TABLE
========================= */

.children-table {
  margin-bottom: 0;
}

.children-table thead th {
  padding: 16px;

  font-size: 17px;
  font-weight: 900;

  color: var(--text);

  border-bottom: 2px solid var(--line);
}

.children-table tbody td {
  padding: 18px 16px;
  vertical-align: middle;
}

.child-name {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
}

.child-id {
  margin-top: 4px;

  font-size: 13px;
  color: var(--muted);
}

.teacher-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.teacher-badge {
  width: fit-content;

  padding: 4px 10px;

  border-radius: 999px;

  background: #ecfdf5;
  color: #059669;

  font-size: 13px;
  font-weight: 700;
}

/* =========================
   ACTION BUTTON
========================= */

.edit-btn {
  width: 42px;
  height: 42px;

  border: none;
  border-radius: var(--radius-md);

  background: #fff7ed;
  color: var(--orange);

  transition: 0.2s ease;
}

.edit-btn:hover {
  background: #fed7aa;
}

.icon-btn {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: var(--radius-sm);

  transition: 0.2s ease;
}

.icon-add {
  border: 1px solid #d1fae5;
  background: #ecfdf5;
  color: #059669;
}

.icon-add:hover {
  background: #d1fae5;
}

.icon-delete {
  border: 1px solid #fee2e2;
  background: #fef2f2;
  color: var(--red-dark);
}

.icon-delete:hover {
  background: #fee2e2;
}

/* =========================
   EMPTY STATE
========================= */

.empty-state {
  height: 240px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: var(--muted);
}

.empty-icon {
  font-size: 42px;
  color: var(--yellow);

  margin-bottom: 10px;
}

.empty-text {
  font-size: 14px;
}

/* =========================
   FORM
========================= */

.register-card h2 {
  margin-bottom: 24px;

  text-align: center;

  color: var(--green-deep);
  font-weight: 900;
}

.register-card .form-control,
.register-card .form-select {
  height: 48px;

  border-radius: 12px;
  border: 1px solid var(--line);
}

.register-card .form-control:focus,
.register-card .form-select:focus {
  border-color: var(--green);
  box-shadow: none;
}

/* =========================
   MODAL
========================= */

.custom-modal-backdrop {
  position: fixed;
  inset: 0;

  z-index: 2000;

  display: grid;
  place-items: center;

  padding: 16px;

  background: rgba(6, 78, 59, 0.35);
}

.custom-modal {
  width: min(580px, 100%);
  max-height: 90vh;

  overflow-y: auto;

  padding: 24px;

  border-radius: var(--radius-xl);

  background: white;
  border: 1px solid var(--line);

  box-shadow: var(--shadow-modal);
}

.plan-delete-box {
  padding: 12px;

  border-radius: 12px;

  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

/* =========================
   BUTTONS
========================= */

.action-btn-danger {
  padding: 6px 16px;

  border: none;
  border-radius: 999px;

  background: #e55353;
  color: white;

  font-weight: 700;

  transition: 0.2s ease;
}

.action-btn-danger:hover {
  background: #d94343;
}

.action-btn-primary {
  height: 52px;

  border: none;
  border-radius: 16px;

  background: linear-gradient(
    135deg,
    var(--green),
    var(--green-dark)
  );

  color: white;

  font-weight: 900;
  letter-spacing: 0.2px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  transition: 0.25s ease;
}

.action-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow:
    0 12px 24px rgba(17, 140, 23, 0.25);
}

.action-btn-primary:disabled {
  background: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

.child-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e8f5e9;
}

/* =========================
   TABLET
========================= */

@media (max-width: 1200px) {
  .register-card {
    margin-top: 0;
  }
}

/* =========================
   MOBILE
========================= */

@media (max-width: 768px) {
  .children-page {
    padding: 14px 0;
  }

  .children-search {
    height: auto;

    flex-wrap: wrap;

    padding: 14px;
  }

  .children-count {
    width: 100%;
  }

  .children-table {
    min-width: 650px;
  }

  .register-card {
    padding: 18px;
  }

  .register-card h2 {
    font-size: 24px;
  }
}

@media (max-width: 576px) {
  .child-name {
    font-size: 15px;
  }

  .child-id {
    font-size: 12px;
  }

  .teacher-badge {
    font-size: 12px;
  }

  .children-table thead th {
    font-size: 14px;
  }

  .edit-btn {
    width: 36px;
    height: 36px;
  }

  .custom-modal {
    padding: 18px;
  }
}`;
