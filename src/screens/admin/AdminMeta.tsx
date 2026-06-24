import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import LoadingOverlay from "../../components/LoadingOverLay";
import { handleTimeStampFirestore } from "../../constants/convertTimeStamp";
import { getDocsData } from "../../constants/firebase/getDocsData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { db } from "../../firebase.config";
import { useUserStore } from "../../zustand";

export default function AdminMeta() {
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastUpdated: "",
  });
  const [keyword, setKeyword] = useState("");
  const [meta, setMeta] = useState<any[]>([]);
  const [metaEdit, setMetaEdit] = useState<any>();

  useEffect(() => {
    if (metaEdit) {
      const ms =
        metaEdit.lastUpdated.seconds * 1000 +
        metaEdit.lastUpdated.nanoseconds / 1e6;

      const dateStr = new Date(ms).toISOString().slice(0, 10); // ✅ đúng format

      setForm({
        name: metaEdit.id,
        lastUpdated: dateStr, // ❗ phải là string
      });
    }
  }, [metaEdit]);

  useEffect(() => {
    if (user) {
      getDocsData({
        nameCollect: "Meta",
        setData: setMeta,
      });
    }
  }, [user]);

  const filteredMetas = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return meta.filter((item: any) => {
      const content = `
        ${item.id ?? ""}
        ${item.lastChangeType ?? ""}
        ${item.lastUpdated ?? ""}
      `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [meta, keyword]);

  const handleCloseEdit = () => {
    setMetaEdit(undefined);
    setForm({
      name: "",
      lastUpdated: "",
    });
  };

  const isDisabled = !form.name.trim() || !form.lastUpdated;

  const handleMeta = async () => {
    const data = {
      name: form.name.trim(),
      lastUpdated: Timestamp.fromDate(new Date(form.lastUpdated)), // ✅ đúng
    };

    if (!data.name) {
      handleToastError("Vui lòng nhập tên meta!");
      return;
    }

    setIsLoading(true);

    if (metaEdit) {
      updateDoc(doc(db, "Meta", metaEdit.id), {
        lastUpdated: data.lastUpdated,
      })
        .then(() => {
          setMeta((prev: any) =>
            prev.map((meta: any) =>
              meta.id === metaEdit.id
                ? {
                    ...meta,
                    lastUpdated: data.lastUpdated,
                  }
                : meta,
            ),
          );

          handleToastSuccess(`Cập nhật meta thành công! (${metaEdit.id})`);
          handleCloseEdit();
        })
        .catch(() => {
          handleToastError("Chỉnh sửa meta thất bại!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDoc(
        doc(db, "Meta", data.name),
        {
          lastUpdated: data.lastUpdated,
        },
        { merge: true },
      )
        .then(() => {
          setMeta((prev: any) => [
            ...prev,
            {
              id: data.name,
              lastUpdated: data.lastUpdated,
            },
          ]);

          handleToastSuccess(`Thêm meta mới thành công! (${data.name})`);

          handleCloseEdit();
        })
        .catch(() => {
          handleToastError("Thêm meta mới thất bại!");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <>
      <div className="admin-target-page">
        <div className="row g-3 g-xl-4 admin-content">
          <div
            className={
              metaEdit
                ? "col-12 col-xl-8 admin-table-col"
                : "col-12 col-xl-8 admin-table-col"
            }
          >
            <div className="page-panel p-3 p-md-4 h-100 d-flex flex-column">
              <div className="search-box mb-3 d-flex align-items-center justify-content-between">
                <div className="search-left">
                  <i className="bi bi-search me-2 text-muted" />
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="form-control search-input"
                    placeholder="Nhập tên meta"
                  />
                </div>

                <div className="child-count">
                  Có {filteredMetas.length} meta
                </div>
              </div>

              <div className="table-responsive">
                {filteredMetas.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-search empty-icon" />
                    <div className="empty-text">
                      Không tìm thấy meta phù hợp.
                    </div>
                  </div>
                ) : (
                  <table className="table plans-table align-middle">
                    <thead>
                      <tr>
                        <th>Tên Meta</th>
                        <th>Ngày gần nhất</th>
                        <th>Handle</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredMetas.map((meta: any) => (
                        <tr key={meta.id}>
                          <td>{meta.id}</td>

                          <td>
                            {moment(
                              handleTimeStampFirestore(meta.lastUpdated),
                            ).format("HH:mm:ss DD/MM/YYYY")}
                          </td>

                          <td className="text-center">
                            <button
                              className="icon-btn icon-edit"
                              onClick={() => setMetaEdit(meta)}
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

          <div className="col-12 col-xl-4 admin-form-col">
            <div className="page-panel qx-add-child-panel p-3 p-md-4 position-relative h-100">
              {metaEdit && (
                <button
                  className="icon-btn icon-add position-absolute"
                  style={{ top: 12, right: 12 }}
                  onClick={handleCloseEdit}
                  disabled={isLoading}
                >
                  <i className="bi bi-x-lg" />
                </button>
              )}

              <h4 className="text-center fw-bold mb-3">
                {metaEdit ? "Chỉnh sửa Meta" : "Thêm Meta"}
              </h4>

              <label className="form-label">Tên Meta:</label>
              <input
                className="form-control mb-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label className="form-label">Chọn ngày:</label>
              <input
                type="date"
                className="form-control mb-2"
                value={form.lastUpdated}
                onChange={
                  (e) => setForm({ ...form, lastUpdated: e.target.value }) // ❗ KHÔNG dùng Number
                }
              />

              <button
                className="btn action-btn-primary w-100"
                disabled={isDisabled}
                onClick={handleMeta}
              >
                {metaEdit ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />
    </>
  );
}
