import { useState } from "react";
import "./admin.css";
import AdminBackupData from "./AdminBackupData";
import AdminChildren from "./AdminChildren";
import AdminField from "./AdminField";
import AdminMeta from "./AdminMeta";
import AdminPlan from "./AdminPlan";
import AdminReport from "./AdminReport";
import AdminSuggest from "./AdminSuggest";
import AdminTarget from "./AdminTarget";
import AdminTeacher from "./AdminTeacher";

export default function AdminAllInOne() {
  const [tab, setTab] = useState("adminchildren");

  return (
    <>
      <style>{css}</style>

      <section className="container-fluid px-3 px-md-4 px-xl-4 py-4 py-xl-4">
        {/* ===== TAB HEADER ===== */}
        {/* <div className="qx-tabs mb-3">
          {[
            { key: "adminchildren", label: "TRẺ" },
            { key: "adminteacher", label: "GIÁO VIÊN" },
            { key: "adminfield", label: "LĨNH VỰC" },
            { key: "admintarget", label: "MỤC TIÊU" },
            // { key: "adminsuggest", label: "GỢI Ý" },
            { key: "adminplan", label: "KẾ HOẠCH" },
            { key: "adminreport", label: "BÁO CÁO" },
            // { key: "adminmeta", label: "META" },
            { key: "adminbackupdata", label: "BACKUP_DATA" },
          ].map((item) => (
            <button
              key={item.key}
              className={`qx-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div> */}

        <div className="qx-tabs mb-4">
          {[
            { key: "adminchildren", label: "TRẺ" },
            { key: "adminteacher", label: "GIÁO VIÊN" },
            { key: "adminfield", label: "LĨNH VỰC" },
            { key: "admintarget", label: "MỤC TIÊU" },
            { key: "adminplan", label: "KẾ HOẠCH" },
            { key: "adminreport", label: "BÁO CÁO" },
            { key: "adminbackupdata", label: "BACKUP DATA" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              className={`qx-tab ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ===== CONTENT ===== */}
        {tab === "adminchildren" && <AdminChildren />}
        {tab === "adminfield" && <AdminField />}
        {tab === "admintarget" && <AdminTarget />}
        {tab === "adminsuggest" && <AdminSuggest />}
        {tab === "adminplan" && <AdminPlan />}
        {tab === "adminreport" && <AdminReport />}
        {tab === "adminteacher" && <AdminTeacher />}
        {tab === "adminmeta" && <AdminMeta />}
        {tab === "adminbackupdata" && <AdminBackupData />}
      </section>
    </>
  );
}

const css = `
  .qx-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.qx-tab {
  min-width: 120px;
  height: 46px;

  padding: 0 18px;

  border: 1px solid transparent;
  border-radius: 14px;

  background: #edf7ee;

  color: var(--green-deep);

  font-size: 15px;
  font-weight: 800;

  transition: all .25s ease;
}

.qx-tab:hover {
  background: var(--green-soft);

  color: var(--green);

  transform: translateY(-1px);
}

.qx-tab.active {
  background: linear-gradient(
    135deg,
    var(--green),
    var(--green-dark)
  );

  color: white;

  box-shadow:
    0 8px 20px rgba(17, 140, 23, .22);
}

.qx-tab.active:hover {
  background: linear-gradient(
    135deg,
    var(--green-dark),
    var(--green-deep)
  );
}

@media (max-width: 768px) {
  .qx-tabs {
    gap: 8px;
  }

  .qx-tab {
    flex: 1 1 calc(50% - 8px);
    min-width: unset;
    height: 42px;
    font-size: 14px;
  }
}

@media (max-width: 576px) {
  .qx-tab {
    flex: 1 1 100%;
  }
}
`;
