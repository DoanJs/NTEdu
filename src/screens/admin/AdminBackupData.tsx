import { useState } from "react";
import LoadingOverlay from "../../components/LoadingOverLay";
import { downloadJS, fetchCollection } from "../../constants/exportFirestore";
import "./adminbackupdata.css";

export default function AdminBackupData() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleExport = async () => {
    setShowAlert(false)
    try {
      // 🔹 Danh sách collection bạn muốn export
      const collections = [
        "Meta",
        "carts",
        "children",
        "fields",
        "interventions",
        "planTasks",
        "plans",
        "reportTasks",
        "reports",
        "suggests",
        "targets",
        "users",
        "reportSaveds",
        'comments'
      ];

      let allData: any = {};

      setIsLoading(true);
      for (let name of collections) {
        const data = await fetchCollection(name);
        allData[name] = data;
      }

      // 👉 Xuất ra file .js chứa tất cả collections
      downloadJS(allData, "firestoreAllCollections.js");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Lỗi export Firestore:", error);
    }
  };

  return (
    <>
      <div className="admin-target-page">
        <div className="page-panel p-3 p-md-4 h-100">
          <button
            className="btn btn-danger"
            onClick={() => setShowAlert(true)}
            disabled={isLoading}
          >
            Backup tất cả data Can thiệp sớm Nha Trang
          </button>
        </div>
      </div>

      <LoadingOverlay show={isLoading} />

      {showAlert && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            {/* Title */}
            <h5 className="fw-black text-danger mb-2">Xác nhận backup data</h5>

            {/* Description */}
            <p className="text-green-muted small">
              Hành động này sẽ sao lưu toàn bộ dữ liệu của hệ thống, xuất ra
              file Js trong mục Download.
            </p>

            {/* Plan info */}
            <div className="plan-delete-box mt-2">
              <div className="small">
                <strong>Tên data:</strong> firestoreAllCollections
              </div>
              <div className="small">
                <strong>Nơi lưu:</strong> /Downloads
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowAlert(false)}
              >
                Huỷ
              </button>

              <button
                className="btn action-btn-primary-green"
                onClick={handleExport}
              >
                <i className="bi bi-download me-2" />
                Backup Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
