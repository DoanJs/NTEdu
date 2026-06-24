import { serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingOverlay from "../../components/LoadingOverLay";
import { addDocData } from "../../constants/firebase/addDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { updateDocData } from "../../constants/firebase/updateDocData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { TargetModel } from "../../models";
import { useUserStore } from "../../zustand";

interface FieldModel {
  id: string;
  name: string;
}

export default function AdminGoalsDemo() {
  const { user } = useUserStore();
  const [targetEdit, setTargetEdit] = useState<TargetModel>();
  const [isLoading, setIsLoading] = useState(false);
  const [targets, setTargets] = useState<any[]>([]);
  const [fields, setFields] = useState<FieldModel[]>([]);
  const [keyword, setKeyword] = useState("");
  const [form, setForm] = useState({
    nameTarget: "",
    level: 0,
    fieldId: "",
    content: "",
  });
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "targets",
        setData: setTargets,
      });
      getDocsData({
        nameCollect: "fields",
        setData: setFields,
      });
    }
  }, [user]);

  const isDisabled =
    !form.fieldId.trim() || !form.nameTarget?.trim() || !form.level;

  useEffect(() => {
    if (targetEdit) {
      setForm({
        nameTarget: targetEdit.name,
        fieldId: targetEdit.fieldId,
        level: targetEdit.level,
        content: targetEdit.content || "",
      });
    }
  }, [targetEdit]);

  const fieldMap = useMemo(() => {
    const map: any = {};
    fields.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [fields]);

  const filteredTargets = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return targets.filter((item) => {
      // lấy tên field từ fieldId
      const fieldName = fieldMap[item.fieldId] || "";

      const content = `
      ${item.id ?? ""}
      ${item.name ?? ""}
      ${fieldName}
      level: ${item.level ?? ""}
    `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [targets, keyword, fieldMap]);

  const handleCreateNew = () => {
    setTargetEdit(undefined);
    setForm({ nameTarget: "", level: 0, fieldId: "", content: "" });
  };
  const handleTarget = async () => {
    const data = {
      name: form.nameTarget,
      level: form.level,
      fieldId: form.fieldId,
      content: form.content,
    };

    setIsLoading(true);
    if (targetEdit) {
      updateDocData({
        nameCollect: "targets",
        id: targetEdit.id,
        valueUpdate: {
          ...data,
          updateAt: serverTimestamp(),
        },
        metaDoc: "targets",
      })
        .then((result) => {
          // cập nhật UI ngay
          setTargets((prev) =>
            prev.map((target) =>
              target.id === targetEdit.id
                ? {
                    ...target,
                    ...data,
                    updateAt: new Date(),
                  }
                : target,
            ),
          );

          setIsLoading(false);
          setTargetEdit(undefined);
          handleToastSuccess(
            `Chỉnh sửa mục tiêu thành công ! (${targetEdit.id}) `,
          );
        })
        .catch((error) => {
          setIsLoading(false);
          handleToastError("Chỉnh sửa mục tiêu thất bại !");
        });
    } else {
      addDocData({
        nameCollect: "targets",
        value: {
          ...data,

          createAt: serverTimestamp(),
          updateAt: serverTimestamp(),
        },
        metaDoc: "targets",
      })
        .then((result) => {
          setTargets((prev) => [
            ...prev,
            {
              ...data,
              id: result.id,
              createAt: new Date(),
              updateAt: new Date(),
            },
          ]);

          setIsLoading(false);
          handleToastSuccess(`Thêm mục tiêu mới thành công ! (${result.id}) `);
        })
        .catch((eror) => {
          setIsLoading(false);
          handleToastError("Thêm mục tiêu mới thất bại !");
        });
    }

    setForm({ nameTarget: "", fieldId: "", level: 0, content: "" });
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

      <div className="fields-page">
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="fields-card">
              <div className="fields-search">
                <i className="bi bi-search" />

                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Nhập mục tiêu, lĩnh vực, level"
                />

                <span className="fields-count">
                  Có {filteredTargets.length} mục tiêu
                </span>
              </div>

              <div className="table-responsive">
                {filteredTargets.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-search empty-icon"></i>
                    <div className="empty-text">
                      Không tìm thấy mục tiêu phù hợp.
                    </div>
                  </div>
                ) : (
                  <table className="table fields-table goals-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tên mục tiêu</th>
                        <th style={{ width: 80 }}>Level</th>
                        <th style={{ width: 95 }}>Hành động</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTargets.map((goal) => (
                        <tr key={goal.id}>
                          <td>
                            <div className="goal-content">{goal.name}</div>

                            <div className="goal-sub-info">
                              <span>{fieldMap[goal.fieldId]}</span>
                              <strong>{goal.id}</strong>
                            </div>
                          </td>

                          <td>
                            <div className="goal-level">{goal.level}</div>
                          </td>

                          <td>
                            <button
                              className="edit-btn"
                              type="button"
                              onClick={() => {
                                setTargetEdit(goal);
                                handleToastSuccess("Chế độ chỉnh sửa đã bật");
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
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div
              ref={formRef} className="register-card">
              {targetEdit && (
                <button
                  className="icon-btn icon-add position-absolute"
                  style={{ top: 12, right: 12 }}
                  type="button"
                  onClick={() => {
                    handleCreateNew();
                    handleToastSuccess("Chế độ thêm mới đã bật");
                  }}
                >
                  <i className="bi bi-plus-lg" />
                </button>
              )}

              <h2>{targetEdit ? "Chỉnh sửa mục tiêu" : "Thêm mục tiêu mới"}</h2>

              <form
                onSubmit={handleTarget}
                className="d-flex flex-column gap-2"
              >
                <label className="goal-label">Lĩnh vực:</label>
                <select
                  className="form-select goal-select"
                  value={form.fieldId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      fieldId: e.target.value,
                    })
                  }
                >
                  <option defaultValue={""}>Chọn</option>
                  {fields.length > 0 &&
                    fields.map((_, index) => (
                      <option key={index} value={_.id}>
                        {_.name}
                      </option>
                    ))}
                </select>

                <label className="goal-label mt-2">Nội dung mục tiêu:</label>
                <textarea
                  className="form-control goal-textarea"
                  placeholder="Nhập nội dung mục tiêu"
                  value={form.nameTarget}
                  rows={6}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nameTarget: e.target.value,
                    })
                  }
                />

                <label className="goal-label mt-2">Level mục tiêu</label>
                <select
                  className="form-select goal-select"
                  value={form.level}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      level: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Chọn</option>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>

                <label className="goal-label mt-2">Gợi ý cho mục tiêu:</label>
                <textarea
                  className="form-control goal-textarea"
                  placeholder="Nhập nội dung gợi ý"
                  value={form.content}
                  rows={6}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content: e.target.value,
                    })
                  }
                />

                <button
                  className="btn action-btn-primary w-100 mt-2"
                  type="submit"
                  disabled={isDisabled}
                >
                  {targetEdit ? "Cập nhật" : "Đăng ký"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />
    </>
  );
}

const css = `
:root {
  --green: #118c17;
  --green-dark: #056b10;
  --green-deep: #03490b;
  --green-soft: #e9f8eb;
  --border: #cbe8d0;
  --line: #d8e7db;
  --orange: #f97316;
  --text: #111827;
  --muted: #64748b;
  --radius-md: 14px;
  --radius-xl: 24px;
  --shadow: 0 12px 28px rgba(5, 107, 16, 0.08);
}

* {
  box-sizing: border-box;
}

.fields-page {
  padding: 24px 0;
}

.fields-card,
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

.fields-search {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  border-bottom: 1px solid #e3eee5;
}

.fields-search i {
  color: var(--green);
  font-size: 18px;
}

.fields-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--green-deep);
  font-weight: 600;
}

.fields-count {
  white-space: nowrap;
  color: #58745d;
  font-weight: 700;
}

.fields-table thead th {
  padding: 16px;
  font-size: 17px;
  font-weight: 900;
  color: var(--text);
  border-bottom: 2px solid var(--line);
}

.fields-table tbody td {
  padding: 14px 16px;
  vertical-align: middle;
}

.goals-table thead th:nth-child(2),
.goals-table thead th:nth-child(3) {
  text-align: center;
}

.goals-table tbody td:nth-child(2),
.goals-table tbody td:nth-child(3) {
  text-align: center;
}

.goal-content {
  font-size: 15.5px;
  line-height: 1.55;
  color: #000;
  font-weight: 400;
}

.goal-sub-info {
  margin-top: 8px;
  padding-left: 14px;

  display: flex;
  align-items: center;
  gap: 18px;

  color: #000;
}

.goal-sub-info span {
  font-size: 15px;
  font-weight: 400;
}

.goal-sub-info strong {
  font-size: 15px;
  font-weight: 900;
}

.goal-level {
  font-size: 16px;
  color: #000;
}

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

.register-card h2 {
  margin-bottom: 18px;
  text-align: center;
  color: var(--green-deep);
  font-weight: 900;
}

.goal-label {
  color: var(--green-deep);
  font-weight: 500;
}

.register-card .form-control,
.register-card .form-select {
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.goal-select {
  height: 38px;
}

.goal-textarea {
  min-height: 158px;
  resize: vertical;
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
  box-shadow: 0 12px 24px rgba(17, 140, 23, 0.25);
}

.action-btn-primary:disabled {
  background: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #d1fae5;
  background: #ecfdf5;
  color: #059669;
}

.empty-state {
  height: 160px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

@media (max-width: 768px) {
  .fields-page {
    padding: 14px 0;
  }

  .fields-search {
    height: auto;
    flex-wrap: wrap;
    padding: 14px;
  }

  .fields-count {
    width: 100%;
  }

  .fields-table {
    min-width: 850px;
  }

  .register-card {
    padding: 18px;
  }

  .register-card h2 {
    font-size: 24px;
  }
}
`;
