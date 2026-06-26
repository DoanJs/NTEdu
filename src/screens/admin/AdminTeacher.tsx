import { onValue, ref } from "firebase/database";
import { serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingOverlay from "../../components/LoadingOverLay";
import { addDocData } from "../../constants/firebase/addDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { updateDocData } from "../../constants/firebase/updateDocData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { getOnlineStatus } from "../../constants/info";
import { uploadTeacherAvatar } from "../../constants/uploadAvatar";
import { functions, rtdb } from "../../firebase.config";
import { useUserStore } from "../../zustand";

export default function AdminTeacher() {
  const { user } = useUserStore();

  const [teacherEdit, setTeacherEdit] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    id: "",
    fullName: "",
    // avatar: "",
    email: "",
    position: "",
    role: "",
    telegramChatId: "",
  });

  const [teacherStatus, setTeacherStatus] = useState<any>({});

  useEffect(() => {
    const statusRef = ref(rtdb, "status");

    const unsubscribe = onValue(statusRef, (snapshot) => {
      setTeacherStatus(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "users",
        setData: setTeachers,
      });
    }
  }, [user]);

  const filteredTeachers = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return teachers.filter((item) => {
      const content = `
        ${item.id ?? ""}
        ${item.fullName ?? ""}
        ${item.position ?? ""}
        ${item.role ?? ""}
      `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [teachers, keyword]);

  const isDisabled =
    !form.fullName.trim() || !form.email.trim() || !form.position || !form.role;

  useEffect(() => {
    if (teacherEdit) {
      setForm({
        id: teacherEdit.id || "",
        fullName: teacherEdit.fullName || "",
        // avatar: teacherEdit.avatar || "",
        email: teacherEdit.email || "",
        position: teacherEdit.position || "",
        role: teacherEdit.role || "",
        telegramChatId: teacherEdit.telegramChatId || "",
      });

      setAvatarPreview(teacherEdit.avatar);
    }
  }, [teacherEdit]);

  const handleCreateNew = () => {
    setTeacherEdit(undefined);
    setForm({
      id: "",
      fullName: "",
      // avatar: "",
      email: "",
      position: "",
      role: "",
      telegramChatId: "",
    });
    setAvatarPreview('/NTEdu-icon-512x512.png')
  };

  const handleTeacher = async () => {
    const data = {
      fullName: form.fullName,
      avatar: avatarPreview || "/NTEdu-icon-512x512.png",
      email: form.email,
      position: form.position,
      role: form.role,
      telegramChatId: "",
      shortName: "",
      phone: "",
      birth: "",
      id: form.id,
    };

    setIsLoading(true);

    if (teacherEdit) {
      let avatar = data.avatar

      if (avatarFile) {
        const resultAvatar = await uploadTeacherAvatar(
          avatarFile,
          teacherEdit.id,
        );

        avatar = resultAvatar.avatar;
      }

      updateDocData({
        nameCollect: "users",
        id: teacherEdit.id,
        valueUpdate: {
          ...data,
          avatar,
          updateAt: serverTimestamp(),
        },
        metaDoc: "users",
      })
        .then(() => {
          setTeachers((prev) =>
            prev.map((teacher) =>
              teacher.id === teacherEdit.id
                ? {
                  ...teacher,
                  ...data,
                  updateAt: new Date(),
                }
                : teacher,
            ),
          );

          handleToastSuccess(
            `Chỉnh sửa giáo viên thành công! (${teacherEdit.fullName || teacherEdit.name})`,
          );

          handleCreateNew();
        })
        .catch(() => {
          handleToastError("Chỉnh sửa giáo viên thất bại!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      addDocData({
        nameCollect: "users",
        value: {
          ...data,
          telegramChatId: "",
          createAt: serverTimestamp(),
          updateAt: serverTimestamp(),
        },
        metaDoc: "users",
        customId: data.id,
      })
        .then((result) => {
          setTeachers((prev) => [
            ...prev,
            {
              ...data,
              id: form.id,
              telegramChatId: "",
              createAt: new Date(),
              updateAt: new Date(),
            },
          ]);

          handleToastSuccess(`Thêm giáo viên mới thành công! (${result.id})`);
          handleCreateNew();
        })
        .catch(() => {
          handleToastError("Thêm giáo viên mới thất bại!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  const handleDeleteTeacher = async () => {
    if (!teacherEdit) return;

    setShowDelete(false);
    setIsLoading(true);

    try {
      const deleteTeacherDeep = httpsCallable<
        { teacherId: string },
        {
          ok: boolean;
          deletedTeacherId: string;
          updatedCount: number;
          synced: {
            children?: { removedTeacherIds: number };
            carts?: { removedTeacherIds: number; clearedAuthorId: number };
            plans?: { removedTeacherIds: number; clearedAuthorId: number };
            planTasks?: { removedTeacherIds: number; clearedAuthorId: number };
            reports?: { removedTeacherIds: number; clearedAuthorId: number };
            reportTasks?: {
              removedTeacherIds: number;
              clearedAuthorId: number;
            };
            reportSaveds?: {
              removedTeacherIds: number;
              clearedAuthorId: number;
            };
          };
        }
      >(functions, "deleteTeacherDeep");

      const res = await deleteTeacherDeep({
        teacherId: teacherEdit.id,
      });

      setTeachers((prev) =>
        prev.filter((teacher) => teacher.id !== teacherEdit.id),
      );

      handleCreateNew();

      handleToastSuccess(
        `Xóa giáo viên thành công! Đã cập nhật ${res.data.updatedCount} mục liên quan.`,
      );

      console.log("Chi tiết dữ liệu đã cập nhật:", res.data.synced);
    } catch (err: any) {
      console.error(err);

      if (err.code === "functions/permission-denied") {
        handleToastError("Chỉ admin mới có quyền xóa giáo viên");
      } else if (err.code === "functions/not-found") {
        handleToastError("Không tìm thấy giáo viên");
      } else if (err.code === "functions/unauthenticated") {
        handleToastError("Bạn cần đăng nhập lại");
      } else {
        handleToastError("Xóa giáo viên thất bại");
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

      <div className="teachers-page">
        <div className="row g-4">
          {/* DANH SÁCH GIÁO VIÊN */}
          <div className="col-12 col-xl-8">
            <div className="teachers-card">
              <div className="teachers-search">
                <i className="bi bi-search" />

                <input
                  placeholder="Nhập tên giáo viên, quyền..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                <span className="teachers-count">
                  Có {filteredTeachers.length} giáo viên
                </span>
              </div>

              <div className="table-responsive">
                <table className="table teacher-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Tên giáo viên</th>
                      <th className="text-center">Quyền</th>
                      <th style={{ width: 120 }}>Handle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td>
                          <div className="teacher-name">{teacher.fullName}</div>
                          <p className="small text-muted mb-0">
                            {getOnlineStatus(teacherStatus?.[teacher.id])}
                            {/* {JSON.stringify(teacherStatus?.[teacher.id])} */}
                          </p>
                          <div className="teacher-id">{teacher.id}</div>
                        </td>

                        <td>
                          <span
                            className={`role-badge ${teacher.role === "admin" ? "admin" : "teacher"
                              }`}
                          >
                            {teacher.role}
                          </span>
                        </td>

                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setTeacherEdit(teacher);
                              handleToastSuccess(
                                "Chế độ chỉnh sửa thông tin đã bật",
                              );
                              scrollToEditForm();
                            }}
                          >
                            <i className="bi bi-pencil-fill" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="col-12 col-xl-4">
            <div ref={formRef} className="teacher-form-card position-relative">
              {teacherEdit && (
                <>
                  <button
                    className="icon-btn icon-delete position-absolute"
                    style={{ top: 14, left: 14 }}
                    onClick={() => setShowDelete(true)}
                  >
                    <i className="bi bi-trash-fill" />
                  </button>

                  <button
                    className="icon-btn icon-add position-absolute"
                    style={{ top: 14, right: 14 }}
                    onClick={() => {
                      handleCreateNew();
                      handleToastSuccess("Chế độ thêm mới đã bật");
                    }}
                  >
                    <i className="bi bi-plus-lg" />
                  </button>
                </>
              )}

              <h2>{teacherEdit ? "Cập nhật giáo viên" : "Thêm giáo viên"}</h2>

              <form className="d-flex flex-column gap-3">
                <input
                  disabled={true}
                  className="form-control mb-2"
                  placeholder="Liên hệ admin để lấy ID giáo viên"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                />
                <label className="form-label">Họ và tên:</label>
                <input
                  className="form-control mb-2"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  disabled={!teacherEdit}
                />

                {/* <label className="form-label">Avatar:</label>
                <input
                  className="form-control mb-2"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                /> */}
                <span>Ảnh đại diện:</span>
                <div className="d-flex justify-content-center align-items-center text-center mb-2">
                  <img
                    src={avatarPreview || "/NTEdu-icon-512x512.png"}
                    className="teacher-avatar me-3"
                    alt="avatar"
                  />

                  <input
                    type="file"
                    id="childAvatar"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={!teacherEdit}
                  />

                  <label htmlFor="childAvatar" className="btn btn-light mt-2">
                    <i className="bi bi-camera me-2"></i>
                    Đổi ảnh
                  </label>
                </div>

                <label className="form-label">Email:</label>
                <input
                  className="form-control mb-2"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={true}
                />

                <label className="form-label">Vị trí:</label>
                <select
                  className="form-select mb-2"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  disabled={!teacherEdit}
                >
                  <option value="">Chọn</option>
                  <option value="Giám đốc">Giám đốc</option>
                  <option value="Phó Giám đốc">Phó Giám đốc</option>
                  <option value="Chuyên viên Tâm lý">Chuyên viên Tâm lý</option>
                </select>

                <label className="form-label">Quyền:</label>
                <select
                  className="form-select mb-3"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  disabled={!teacherEdit}
                >
                  <option value="">Chọn</option>
                  <option value="teacher">teacher</option>
                  <option value="admin">admin</option>
                </select>

                <label className="form-label">TelegramChatId:</label>
                <input
                  className="form-control mb-2"
                  value={form.telegramChatId}
                  onChange={(e) =>
                    setForm({ ...form, telegramChatId: e.target.value })
                  }
                  disabled={!teacherEdit}
                />

                <button
                  className="btn action-btn-primary w-100"
                  disabled={isDisabled || isLoading || !teacherEdit}
                  onClick={handleTeacher}
                >
                  {teacherEdit ? "Cập nhật" : "Không được phép thêm mới ở đây"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />

      {showDelete && teacherEdit && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5 className="fw-black text-danger mb-2">
              Xác nhận xoá giáo viên
            </h5>

            <p className="text-green-muted small">
              Hành động này sẽ xoá toàn bộ nội dung liên quan đến giáo viên và
              không thể khôi phục.
            </p>

            <div className="plan-delete-box mt-2">
              <div className="small">
                <strong>Tên giáo viên:</strong> {teacherEdit.fullName}
              </div>
              <div className="small">
                <strong>Mã giáo viên:</strong> {teacherEdit.id}
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowDelete(false)}
              >
                Huỷ
              </button>

              <button
                className="btn action-btn-danger"
                onClick={handleDeleteTeacher}
              >
                <i className="bi bi-trash me-2" />
                Xoá giáo viên
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const css = `
:root{
  --green:#118c17;
  --green-dark:#056b10;
  --green-deep:#03490b;
  --green-soft:#e9f8eb;
  --border:#cbe8d0;
  --line:#dbe7dd;
  --red:#ef4444;
  --radius-xl: 24px;
}

/* PAGE */

.teachers-page{
  padding:24px 0;
}

/* CARD */

.teachers-card,
.teacher-form-card{
  background:rgba(255,255,255,.88);
  backdrop-filter:blur(10px);

  border:1px solid var(--border);
  border-radius:24px;

  box-shadow:0 12px 28px rgba(5,107,16,.08);
}

.teacher-form-card{
  padding:24px;
}

/* SEARCH */

.teachers-search{
  height:64px;

  display:flex;
  align-items:center;
  gap:12px;

  padding:0 18px;

  border-bottom:1px solid #e7ece8;
}

.teachers-search i{
  color:var(--green);
  font-size:18px;
}

.teachers-search input{
  flex:1;
  border:none;
  outline:none;
  background:transparent;

  font-weight:600;
}

.teachers-count{
  white-space:nowrap;

  color:#4b6a4f;
  font-weight:700;
}

/* TABLE */

.teacher-table{
  margin-bottom:0;
}

.teacher-table thead th{
  font-size:18px;
  font-weight:900;

  padding:16px;

  border-bottom:2px solid #dde8df;
}

.teacher-table td{
  padding:18px 16px;
}

.teacher-name{
  font-size:18px;
  font-weight:800;
}

.teacher-id{
  margin-top:4px;

  font-size:14px;
  color:#6b7280;
  font-weight:700;
}

/* ROLE */

.role-badge{
  padding:6px 14px;
  border-radius:999px;
  display: flex;
  justify-content: center;


  font-size:14px;
  font-weight:700;
}

.role-badge.admin{
  background:#fee2e2;
  color:#dc2626;
}

.role-badge.teacher{
  background:#dcfce7;
  color:#047857;
}

/* BUTTON */

.edit-btn{
  width:42px;
  height:42px;

  border:none;
  border-radius:14px;

  background:#fff7ed;
  color:#f97316;

  transition:.2s;
}

.edit-btn:hover{
  background:#fed7aa;
}

.icon-btn{
  width:38px;
  height:38px;

  border:none;
  border-radius:12px;

  display:flex;
  align-items:center;
  justify-content:center;
}

.icon-add{
  background:#ecfdf5;
  color:#059669;
}

.icon-delete{
  background:#fef2f2;
  color:#dc2626;
}

/* FORM */

.teacher-form-card h2{
  text-align:center;

  margin-bottom:24px;

  color:var(--green-deep);
  font-weight:900;
}

.teacher-form-card label{
  display:block;

  margin-bottom:6px;

  color:var(--green-deep);
  font-weight:700;
}

.teacher-form-card .form-control,
.teacher-form-card .form-select{
  height:48px;

  border-radius:12px;
  border:1px solid #d7e4d9;
}

.teacher-form-card .form-control:focus,
.teacher-form-card .form-select:focus{
  box-shadow:none;
  border-color:var(--green);
}

.teacher-submit-btn{
  height:50px;

  border-radius:12px;
  border:none;

  color:#fff;
  font-weight:800;

  background:linear-gradient(
    135deg,
    var(--green),
    var(--green-dark)
  );
}

.teacher-submit-btn:hover{
  opacity:.95;
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
.teacher-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e8f5e9;
}
/* MOBILE */

@media (max-width:1200px){

  .teacher-form-card{
    margin-top:0;
  }
}

@media (max-width:768px){

  .teachers-page{
    padding:14px 0;
  }

  .teachers-search{
    height:auto;
    padding:14px;

    flex-wrap:wrap;
  }

  .teachers-count{
    width:100%;
  }

  .teacher-table{
    min-width:650px;
  }

  .teacher-form-card{
    padding:18px;
  }

  .teacher-form-card h2{
    font-size:24px;
  }
}

@media (max-width:576px){

  .teacher-name{
    font-size:16px;
  }

  .teacher-table thead th{
    font-size:15px;
  }

  .role-badge{
    font-size:13px;
  }
}
`;
