import { serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import LoadingOverlay from "../../components/LoadingOverLay";
import { addDocData } from "../../constants/firebase/addDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { updateDocData } from "../../constants/firebase/updateDocData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { useUserStore } from "../../zustand";

export default function AdminSuggest() {
  const { user } = useUserStore();

  const [suggestEdit, setSuggestEdit] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const [suggests, setSuggests] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");

  const [form, setForm] = useState({
    nameSuggest: "",
    fieldId: "",
  });

  // 🔥 load data
  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "suggests",
        setData: setSuggests,
      });

      getDocsData({
        nameCollect: "fields",
        setData: setFields,
      });
    }
  }, [user]);

  // map fieldId → name
  const fieldMap = useMemo(() => {
    const map: any = {};
    fields.forEach((f) => {
      map[f.id] = f.name;
    });
    return map;
  }, [fields]);

  // 🔎 filter
  const filteredSuggests = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return suggests.filter((item) => {
      const fieldName = fieldMap[item.fieldId] || "";

      const content = `
        ${item.id ?? ""}
        ${item.name ?? ""}
        ${fieldName}
      `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [suggests, keyword, fieldMap]);

  const isDisabled = !form.nameSuggest.trim() || !form.fieldId;

  // edit
  useEffect(() => {
    if (suggestEdit) {
      setForm({
        nameSuggest: suggestEdit.name,
        fieldId: suggestEdit.fieldId,
      });
    }
  }, [suggestEdit]);

  const handleCreateNew = () => {
    setSuggestEdit(undefined);
    setForm({ nameSuggest: "", fieldId: "" });
  };

  // add/update
  const handleSuggest = async () => {
    const data = {
      name: form.nameSuggest,
      fieldId: form.fieldId,
    };

    setIsLoading(true);

    if (suggestEdit) {
      updateDocData({
        nameCollect: "suggests",
        id: suggestEdit.id,
        valueUpdate: {
          ...data,
          updateAt: serverTimestamp(),
        },
        metaDoc: "suggests",
      })
        .then(() => {
          setSuggests((prev) =>
            prev.map((item) =>
              item.id === suggestEdit.id
                ? { ...item, ...data, updateAt: new Date() }
                : item,
            ),
          );

          handleToastSuccess(`Chỉnh sửa gợi ý thành công! (${suggestEdit.id})`);

          handleCreateNew();
        })
        .catch(() => {
          handleToastError("Chỉnh sửa gợi ý thất bại!");
        })
        .finally(() => setIsLoading(false));
    } else {
      addDocData({
        nameCollect: "suggests",
        value: {
          ...data,
          createAt: serverTimestamp(),
          updateAt: serverTimestamp(),
        },
        metaDoc: "suggests",
      })
        .then((res) => {
          setSuggests((prev) => [
            ...prev,
            {
              ...data,
              id: res.id,
              createAt: new Date(),
              updateAt: new Date(),
            },
          ]);

          handleToastSuccess(`Thêm gợi ý mới thành công! (${res.id})`);

          handleCreateNew();
        })
        .catch(() => {
          handleToastError("Thêm gợi ý thất bại!");
        })
        .finally(() => setIsLoading(false));
    }
  };

  // delete
  //   const handleDeleteSuggest = () => {
  //     if (!suggestEdit) return;

  //     deleteDocData({
  //       nameCollect: "suggests",
  //       id: suggestEdit.id,
  //       metaDoc: "suggests",
  //     })
  //       .then(() => {
  //         setSuggests((prev) =>
  //           prev.filter((item) => item.id !== suggestEdit.id)
  //         );

  //         handleToastSuccess("Xóa gợi ý thành công!");
  //         handleCreateNew();
  //       })
  //       .catch(() => {
  //         handleToastError("Xóa gợi ý thất bại!");
  //       });
  //   };

  return (
    <>
      <div className="admin-target-page">
        <div className="row g-3 g-xl-4 admin-content">
          {/* TABLE */}
          <div className="col-12 col-xl-8 admin-table-col">
            <div className="page-panel p-3 p-md-4 h-100 d-flex flex-column">
              {/* SEARCH */}
              <div className="search-box mb-3 d-flex align-items-center justify-content-between">
                <div className="search-left d-flex align-items-center">
                  <i className="bi bi-search me-2 text-muted" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="form-control search-input"
                    placeholder="Nhập gợi ý, lĩnh vực ..."
                  />
                </div>

                <div className="child-count">
                  Có {filteredSuggests.length} gợi ý
                </div>
              </div>

              {/* TABLE */}
              <div className="table-responsive">
                {filteredSuggests.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-search empty-icon"></i>
                    <div className="empty-text">
                      Không tìm thấy gợi ý phù hợp.
                    </div>
                  </div>
                ) : (
                  <table className="table plans-table align-middle">
                    <thead>
                      <tr>
                        <th>Gợi ý</th>
                        <th>Lĩnh vực</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSuggests.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}
                            <div><b>{item.id}</b></div>
                          </td>

                          <td>
                            <span className="teacher-badge">
                              {fieldMap[item.fieldId]}
                            </span>
                          </td>

                          <td>
                            <button
                              className="icon-btn icon-edit"
                              onClick={() => setSuggestEdit(item)}
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
          <div className="col-12 col-xl-4 admin-form-col">
            <div className="page-panel p-3 p-md-4 position-relative h-100">
              {/* DELETE */}
              {/* {suggestEdit && (
              <button
                className="icon-btn icon-delete position-absolute"
                style={{ top: 12, left: 12 }}
                onClick={handleDeleteSuggest}
              >
                <i className="bi bi-trash"></i>
              </button>
            )} */}

              {/* ADD */}
              {suggestEdit && (
                <button
                  className="icon-btn icon-add position-absolute"
                  style={{ top: 12, right: 12 }}
                  onClick={handleCreateNew}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              )}

              <h4 className="text-center fw-bold mb-3">
                {suggestEdit ? "Chỉnh sửa gợi ý" : "Thêm gợi ý mới"}
              </h4>

              <select
                className="form-select mb-2"
                value={form.fieldId}
                onChange={(e) => setForm({ ...form, fieldId: e.target.value })}
              >
                <option value="">Chọn lĩnh vực</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <textarea
                className="form-control mb-3"
                rows={5}
                placeholder="Nhập nội dung gợi ý"
                value={form.nameSuggest}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nameSuggest: e.target.value,
                  })
                }
              />

              <button
                className="btn action-btn-primary w-100"
                disabled={isDisabled}
                onClick={handleSuggest}
              >
                {suggestEdit ? "Cập nhật" : "Đăng ký"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />
    </>
  );
}
