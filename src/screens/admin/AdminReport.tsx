import { serverTimestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import LoadingOverlay from "../../components/LoadingOverLay";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { updateDocData } from "../../constants/firebase/updateDocData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { functions } from "../../firebase.config";
import { useUserStore } from "../../zustand";

export default function AdminPlansDemo() {
  const { user } = useUserStore();

  const [reports, setReports] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [reportEdit, setReportEdit] = useState<any>();
  const [selectTeachers, setSelectTeachers] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title: "",
    status: "",
  });

  useEffect(() => {
    if (user) {
      getDocsData({ nameCollect: "reports", setData: setReports });
      getDocsData({ nameCollect: "children", setData: setChildren });
      getDocsData({ nameCollect: "users", setData: setTeachers });
      getDocsData({ nameCollect: "plans", setData: setPlans });
    }
  }, [user]);

  const childMap = useMemo(() => {
    const map: any = {};
    children.forEach((child: any) => {
      map[child.id] = child.fullName;
    });
    return map;
  }, [children]);

  const teacherMap = useMemo(() => {
    const map: any = {};
    teachers.forEach((teacher: any) => {
      map[teacher.id] = teacher.fullName;
    });
    return map;
  }, [teachers]);

  const planMap = useMemo(() => {
    const map: any = {};
    plans.forEach((plan: any) => {
      map[plan.id] = plan.title;
    });
    return map;
  }, [plans]);

  const filteredReports = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return reports.filter((item: any) => {
      const childName = childMap[item.childId] || "";
      const planTitle = planMap[item.planId] || "";

      const teacherNames = (item.teacherIds || [])
        .map((id: string) => teacherMap[id] || "")
        .join(" ");

      const content = `
        ${item.id ?? ""}
        ${item.title ?? ""}
        ${item.status ?? ""}
        ${item.planId ?? ""}
        ${planTitle}
        ${childName}
        ${teacherNames}
      `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [reports, keyword, childMap, teacherMap, planMap]);

  useEffect(() => {
    if (reportEdit) {
      setForm({
        title: reportEdit.title || "",
        status: reportEdit.status || "",
      });

      const selected = (reportEdit.teacherIds || [])
        .map((id: string) => teachers.find((t: any) => t.id === id))
        .filter(Boolean);

      setSelectTeachers(selected);
    }
  }, [reportEdit, teachers]);

  const handleCloseEdit = () => {
    setReportEdit(undefined);
    setForm({
      title: "",
      status: "",
    });
    setSelectTeachers([]);
  };

  const isDisabled =
    !form.title.trim() || !form.status || selectTeachers.length === 0;

  const handleUpdateReport = async () => {
    if (!reportEdit) return;

    const data = {
      title: form.title,
      status: form.status,
    };

    setIsLoading(true);

    updateDocData({
      nameCollect: "reports",
      id: reportEdit.id,
      valueUpdate: {
        ...data,
        updateAt: serverTimestamp(),
      },
      metaDoc: "reports",
    })
      .then(() => {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportEdit.id
              ? {
                  ...report,
                  ...data,
                  updateAt: new Date(),
                }
              : report,
          ),
        );

        handleToastSuccess(`Cập nhật báo cáo thành công! (${reportEdit.id})`);
        handleCloseEdit();
      })
      .catch(() => {
        handleToastError("Cập nhật báo cáo thất bại!");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteReport = async () => {
    if (!reportEdit) return;

    setShowDelete(false);
    setIsLoading(true);

    try {
      const deleteReportCF = httpsCallable<
        { reportId: string },
        {
          success: boolean;
          deleted: {
            reports: number;
            reportTasks: number;
          };
          deletedCount: number;
        }
      >(functions, "deleteReport");

      const res = await deleteReportCF({
        reportId: reportEdit.id,
      });

      setReports((prev) =>
        prev.filter((report) => report.id !== reportEdit.id),
      );

      handleCloseEdit();

      handleToastSuccess(
        `Xóa báo cáo thành công! Đã xóa ${res.data.deletedCount} mục liên quan.`,
      );

      console.log("Chi tiết đã xóa:", res.data.deleted);
    } catch (err: any) {
      console.error(err);

      if (err.code === "functions/permission-denied") {
        handleToastError("Bạn không có quyền xoá báo cáo");
      } else if (err.code === "functions/not-found") {
        handleToastError("Không tìm thấy báo cáo");
      } else if (err.code === "functions/failed-precondition") {
        handleToastError("Chỉ được xoá báo cáo đang pending");
      } else if (err.code === "functions/unauthenticated") {
        handleToastError("Bạn cần đăng nhập lại");
      } else {
        handleToastError("Xóa báo cáo thất bại");
      }
    } finally {
      setIsLoading(false);
    }
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

      <div className="reports-page">
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="reports-card">
              <div className="reports-search">
                <i className="bi bi-search" />

                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập báo cáo"
                />

                <span className="reports-count">
                  Có {filteredReports.length} báo cáo
                </span>
              </div>

              <div className="table-responsive">
                <table className="table reports-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Tên trẻ</th>
                      <th>Kế hoạch</th>
                      <th>Báo cáo</th>
                      <th>Trạng thái</th>
                      <th>Handle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((report) => {
                      return (
                        <tr key={report.id}>
                          <td>{childMap[report.childId] || "-"}</td>
                          <td>{planMap[report.planId] || "-"}</td>
                          <td>
                            {report.name} - <strong>{report.id}</strong>
                          </td>

                          <td>{report.status}</td>

                          <td>
                            <button
                              className="edit-btn"
                              type="button"
                              onClick={() => {
                                setReportEdit(report);
                                handleToastSuccess("Chế độ chỉnh sửa đã bật");
                                scrollToEditForm();
                              }}
                            >
                              <i className="bi bi-pencil-fill" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredReports.length === 0 && (
                  <div className="empty-state">
                    Không tìm thấy kế hoạch phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div
              ref={formRef} className="register-card">
              {reportEdit && (
                <>
                  <button
                    className="icon-btn icon-delete position-absolute"
                    style={{ top: 12, left: 12 }}
                    type="button"
                    onClick={() => setShowDelete(true)}
                  >
                    <i className="bi bi-trash-fill" />
                  </button>

                  <button
                    className="icon-btn icon-add position-absolute"
                    style={{ top: 12, right: 12 }}
                    type="button"
                    onClick={() => {
                      handleCloseEdit();
                      handleToastSuccess("Chế độ chỉnh sửa đã tắt");
                    }}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </>
              )}

              <h4 className="text-center fw-bold mb-3">Chỉnh sửa báo cáo</h4>

              <label className="form-label">Tên báo cáo:</label>
              <input
                className="form-control mb-2"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <label className="form-label">Trạng thái:</label>
              <select
                className="form-select mb-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="">Chọn trạng thái</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>

              <label className="form-label">Giáo viên phụ trách:</label>
              <Select
                className="mb-2"
                getOptionLabel={(option) => option.fullName}
                getOptionValue={(option) => option.id.toString()}
                isMulti
                options={teachers}
                value={selectTeachers}
                isDisabled // 👈 khóa lại
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />

              <button
                className="btn action-btn-primary w-100"
                disabled={isDisabled || isLoading}
                onClick={handleUpdateReport}
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />

      {showDelete && reportEdit && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5 className="fw-black text-danger mb-2">Xác nhận xoá báo cáo</h5>

            <p className="text-green-muted small">
              Hành động này sẽ xoá toàn bộ báo cáo và các nhiệm vụ báo cáo liên
              quan, không thể khôi phục.
            </p>

            <div className="plan-delete-box mt-2">
              <div className="small">
                <strong>Tên báo cáo:</strong> {reportEdit.title}
              </div>
              <div className="small">
                <strong>Mã báo cáo:</strong> {reportEdit.id}
              </div>
              <div className="small">
                <strong>Mã kế hoạch:</strong> {reportEdit.planId || "-"}
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
                onClick={handleDeleteReport}
              >
                <i className="bi bi-trash me-2" />
                Xoá báo cáo
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
  --border: #cbe8d0;
  --line: #d8e7db;
  --orange: #f97316;
  --red-dark: #dc2626;
  --text: #111827;
  --muted: #64748b;
  --radius-md: 14px;
  --radius-xl: 24px;
  --shadow: 0 12px 28px rgba(5, 107, 16, 0.08);
}

* {
  box-sizing: border-box;
}

.reports-page {
  padding: 24px 0;
}

.reports-card,
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

.reports-search {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid #e3eee5;
}

.reports-search i {
  color: var(--green);
  font-size: 18px;
}

.reports-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--green-deep);
  font-weight: 600;
}

.reports-count {
  white-space: nowrap;
  color: #58745d;
  font-weight: 700;
}

.reports-table thead th {
  padding: 14px 10px;
  font-size: 16px;
  font-weight: 900;
  color: var(--text);
  border-bottom: 2px solid #222;
}

.reports-table tbody td {
  padding: 12px 10px;
  vertical-align: middle;
  color: #000;
  border-bottom: 1px solid var(--line);
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

.register-card h2 {
  margin-bottom: 24px;
  text-align: center;
  color: var(--green-deep);
  font-weight: 900;
}

.register-card .form-label {
  color: var(--green-deep);
  font-weight: 500;
}

.register-card .form-control,
.register-card .form-select {
  height: 38px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.icon-btn {
  width: 32px;
  height: 32px;
  background: #fff;
  color: #000;
  border: 2px solid #111;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-delete {
  border: 1px solid #fee2e2;
  background: #fef2f2;
  color: var(--red-dark);
}

.icon-delete:hover {
  background: #fee2e2;
}

.icon-add {
  border: 1px solid #d1fae5;
  background: #ecfdf5;
  color: #059669;
}

.icon-add:hover {
  background: #d1fae5;
}

.action-btn-primary {
  height: 42px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  color: white;
  font-weight: 900;
}

.action-btn-primary:disabled {
  background: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

.empty-state {
  height: 160px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

@media (max-width: 768px) {
  .reports-page {
    padding: 14px 0;
  }

  .reports-search {
    height: auto;
    flex-wrap: wrap;
    padding: 14px;
  }

  .reports-count {
    width: 100%;
  }

  .reports-table {
    min-width: 760px;
  }

  .register-card {
    padding: 18px;
  }

  .register-card h2 {
    font-size: 24px;
  }
}
`;
