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
import { useUserStore } from "../../zustand";

export default function AdminFieldsDemo() {
  const { user } = useUserStore();
  const [keyword, setKeyword] = useState("");
  const [fieldEdit, setFieldEdit] = useState<any>();
  const [fields, setFields] = useState<any[]>([]);
  const [fieldName, setFieldName] = useState("");
  const isDisabled = !fieldName.trim();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "fields",
        setData: setFields,
      });
    }
  }, [user]);

  useEffect(() => {
    if (fieldEdit) {
      setFieldName(fieldEdit.name);
    }
  }, [fieldEdit]);

  // 🔎 FILTER
  const filteredFields = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return fields.filter((item) => {
      const content = `
        ${item.id ?? ""}
        ${item.name ?? ""}
      `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [fields, keyword]);

  // create new
  const handleCreateNew = () => {
    setFieldEdit(undefined);
    setFieldName("");
  };

  // add/update
  const handleField = async () => {
    const data = { name: fieldName };
    setIsLoading(true);
    if (fieldEdit) {
      updateDocData({
        nameCollect: "fields",
        id: fieldEdit.id,
        valueUpdate: {
          ...data,
          updateAt: serverTimestamp(),
        },
        metaDoc: "fields",
      })
        .then((result) => {
          // cập nhật UI ngay
          setFields((prev) =>
            prev.map((field) =>
              field.id === fieldEdit.id
                ? {
                    ...field,
                    ...data,
                    updateAt: new Date(),
                  }
                : field,
            ),
          );

          setIsLoading(false);
          setFieldEdit(undefined);
          handleToastSuccess(
            `Chỉnh sửa lĩnh vực thành công ! (${fieldEdit.id}) `,
          );
        })
        .catch((error) => {
          setIsLoading(false);
          handleToastError("Chỉnh sửa lĩnh vực thất bại !");
        });
    } else {
      addDocData({
        nameCollect: "fields",
        value: {
          ...data,

          createAt: serverTimestamp(),
          updateAt: serverTimestamp(),
        },
        metaDoc: "fields",
      })
        .then((result) => {
          setFields((prev) => [
            ...prev,
            {
              ...data,
              id: result.id,
              createAt: new Date(),
              updateAt: new Date(),
            },
          ]);

          setIsLoading(false);
          setFieldEdit(undefined);
          handleToastSuccess(`Thêm lĩnh vực mới thành công ! (${result.id}) `);
        })
        .catch((eror) => {
          setIsLoading(false);
          handleToastError("Thêm lĩnh vực mới thất bại !");
        });
    }

    setFieldName("");
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
                  placeholder="Nhập tên lĩnh vực, mã lĩnh vực"
                />

                <span className="fields-count">
                  Có {filteredFields.length} lĩnh vực
                </span>
              </div>

              <div className="table-responsive">
                {filteredFields.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-search empty-icon"></i>
                    <div className="empty-text">
                      Không tìm thấy lĩnh vực phù hợp.
                    </div>
                  </div>
                ) : (
                  <table className="table fields-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Tên lĩnh vực</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFields.map((field) => (
                        <tr key={field.id}>
                          <td>
                            <div className="field-name">{field.name}</div>
                            <div className="field-id">{field.id}</div>
                          </td>

                          <td>
                            <button
                              className="edit-btn"
                              type="button"
                              onClick={() => {
                                setFieldEdit(field);
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
              {fieldEdit && (
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

              <h2>{fieldEdit ? "Chỉnh sửa lĩnh vực" : "Thêm lĩnh vực mới"}</h2>

              <form onSubmit={handleField} className="d-flex flex-column gap-2">
                <input
                  className="form-control"
                  placeholder="Tên lĩnh vực"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />

                <button
                  className="btn action-btn-primary w-100"
                  type="submit"
                  disabled={isDisabled}
                >
                  {fieldEdit ? "Cập nhật" : "Đăng ký"}
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

.field-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
}

.field-id {
  margin-top: 4px;
  font-size: 14px;
  color: #000;
  font-weight: 900;
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

.register-card .form-control {
  height: 38px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
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
    min-width: 650px;
  }

  .register-card {
    padding: 18px;
  }

  .register-card h2 {
    font-size: 24px;
  }
}
`;
