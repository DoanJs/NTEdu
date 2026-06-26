import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { handleTimeStampFirestore } from "../../constants/convertTimeStamp";
import { formatDateSearch, getTimeValue } from "../../constants/info";
import { ReportModel } from "../../models";
import {
  useReportStore,
  useSelectNavbarStore,
  useTeacherStore,
} from "../../zustand";

export default function ReportScreen() {
  const [keyword, setKeyword] = useState("");
  const { reports } = useReportStore();
  const [reportNews, setReportNews] = useState<ReportModel[]>([]);
  const { setSelectNavbar } = useSelectNavbarStore();
  const { teachers } = useTeacherStore();

  const teacherMap = useMemo(() => {
    const map: any = {};
    teachers.forEach((t) => {
      map[t.id] = t.fullName;
    });
    return map;
  }, [teachers]);

  useEffect(() => {
    if (reports) {
      const items = reports.filter((report) => report.status === "approved");
      setReportNews(items);
    }
  }, [reports]);

  const filteredReports = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return reportNews
      .filter((item: any) => {
        const teacherName = teacherMap[item.authorId] || "";

        const createdTime = formatDateSearch(item.createAt);
        const updatedTime = formatDateSearch(item.updateAt);

        const content = `
      ${item.title ?? ""}
      ${teacherName}
      ${createdTime}
      ${updatedTime}
    `.toLowerCase();

        return !search || content.includes(search);
      })
      .sort((a: any, b: any) => {
        return getTimeValue(b.createAt) - getTimeValue(a.createAt);
      });
  }, [reportNews, keyword, teacherMap]);

  // function ReportCard({ report }: any) {
  //   // return (
  //   //   <article className="plan-card report-card">
  //   //     <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
  //   //       <div className="d-flex gap-3 min-w-0">
  //   //         <div className={`approval-type-box report`}>
  //   //           <i className={`bi bi-file-earmark-text-fill`} />
  //   //         </div>
  //   //         <div className="min-w-0">
  //   //           <div className="d-flex flex-wrap gap-5 mb-2">
  //   //             <span className="plan-code">{report.id}</span>
  //   //             <span className="status-approved">
  //   //               <i className="bi bi-patch-check-fill me-1" />
  //   //               {report.status}
  //   //             </span>
  //   //           </div>
  //   //           <h3 className="plan-title">Báo cáo tháng {report.title}</h3>
  //   //         </div>
  //   //       </div>
  //   //     </div>

  //   //     <div className="row g-2 mb-3">
  //   //       <div className="col-6">
  //   //         <div className="mini-info">
  //   //           <i className="bi bi-person-check-fill icon-red" />
  //   //           <span>
  //   //             <b>Giáo viên thực hiện</b>
  //   //             {
  //   //               teachers.find((_: UserModel) => _.id === report.authorId)
  //   //                 ?.fullName
  //   //             }
  //   //           </span>
  //   //         </div>
  //   //       </div>
  //   //       <div className="col-6">
  //   //         <div className="mini-info">
  //   //           <i className="bi bi-send-check-fill icon-yellow" />
  //   //           <span>
  //   //             <b>Ngày gửi</b>
  //   //             {typeof report?.createAt === "number"
  //   //               ? moment(report?.createAt).format("HH:mm:ss DD/MM/YYYY")
  //   //               : moment(handleTimeStampFirestore(report?.createAt)).format(
  //   //                 "HH:mm:ss DD/MM/YYYY",
  //   //               )}
  //   //           </span>
  //   //         </div>
  //   //       </div>
  //   //       <div className="col-6">
  //   //         <div className="mini-info">
  //   //           <i className="bi bi-calendar-heart icon-red" />
  //   //           <span>
  //   //             <b>Ngày duyệt</b>
  //   //             {typeof report?.updateAt === "number"
  //   //               ? moment(report?.updateAt).format("HH:mm:ss DD/MM/YYYY")
  //   //               : moment(handleTimeStampFirestore(report?.updateAt)).format(
  //   //                 "HH:mm:ss DD/MM/YYYY",
  //   //               )}
  //   //           </span>
  //   //         </div>
  //   //       </div>
  //   //     </div>
  //   //     <div className="d-flex gap-2 mt-3 pt-3"> {/*border-top-soft*/}
  //   //       <Link
  //   //         to={"../reportdetail"}
  //   //         onClick={() => setSelectNavbar("")}
  //   //         state={{
  //   //           // title: plan.title,
  //   //           // planId: plan.id,
  //   //           report,
  //   //         }}
  //   //         className="btn action-btn-soft flex-fill"
  //   //       >
  //   //         <i className="bi bi-eye-fill me-2" />
  //   //         Xem báo cáo
  //   //       </Link>
  //   //     </div>
  //   //   </article>
  //   // );
  //   const teacherName =
  //     teachers.find((_: UserModel) => _.id === report.authorId)?.fullName || "";

  //   return (
  //     <article className="plan-card report-card">
  //       <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
  //         <div className="d-flex gap-3 min-w-0 w-100">
  //           <div className="approval-type-box report flex-shrink-0">
  //             <i className="bi bi-file-earmark-text-fill" />
  //           </div>

  //           <div className="min-w-0 w-100">
  //             <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-1">
  //               <h3 className="plan-title mb-0">BC {report.title}</h3>

  //               <span className="status-approved flex-shrink-0">
  //                 <i className="bi bi-patch-check-fill me-1" />
  //                 {report.status}
  //               </span>
  //             </div>

  //             <div className="plan-teacher">
  //               <i className="bi bi-person-check-fill me-1 icon-red" />
  //               <b>Giáo viên: </b>
  //               {teacherName}
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="row g-2 mb-3">
  //         <div className="col-6">
  //           <div className="mini-info">
  //             <i className="bi bi-send-check-fill icon-yellow" />
  //             <span>
  //               <b>Ngày gửi</b>
  //               {typeof report?.createAt === "number"
  //                 ? moment(report?.createAt).format("HH:mm:ss DD/MM/YYYY")
  //                 : moment(handleTimeStampFirestore(report?.createAt)).format(
  //                     "HH:mm:ss DD/MM/YYYY",
  //                   )}
  //             </span>
  //           </div>
  //         </div>

  //         <div className="col-6">
  //           <div className="mini-info">
  //             <i className="bi bi-calendar-heart icon-red" />
  //             <span>
  //               <b>Ngày duyệt</b>
  //               {typeof report?.updateAt === "number"
  //                 ? moment(report?.updateAt).format("HH:mm:ss DD/MM/YYYY")
  //                 : moment(handleTimeStampFirestore(report?.updateAt)).format(
  //                     "HH:mm:ss DD/MM/YYYY",
  //                   )}
  //             </span>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="d-flex gap-2 mt-3 pt-3">
  //         <Link
  //           to="../reportdetail"
  //           onClick={() => setSelectNavbar("")}
  //           state={{ report }}
  //           className="btn action-btn-soft flex-fill"
  //         >
  //           <i className="bi bi-eye-fill me-2" />
  //           Xem báo cáo
  //         </Link>
  //       </div>
  //     </article>
  //   );
  // }

  return (
    <>
      <style>{css}</style>
      <section className="page-head">
        <div>
          <h1>Báo cáo can thiệp</h1>
          <p>
            Danh sách báo cáo theo tuần của trẻ, theo dõi kết quả và trạng thái
            phê duyệt.
          </p>
        </div>

        <Link
          to={"../addreport"}
          onClick={() => setSelectNavbar("")}
          className="primary-btn text-decoration-none"
        >
          <i className="bi bi-plus-circle-fill"></i>
          Tạo báo cáo mới
        </Link>
      </section>

      <section className="filter-panel">
        <div className="search-box">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên BC, Gv thực hiện..."
          />
        </div>
        <div className="status-tabs">
          <button className={"active"}>
            <i className="bi bi-file-earmark-text-fill me-2"></i>
            {filteredReports.length} Báo cáo
          </button>
        </div>
      </section>

      <section className="report-layout">
        <div className="report-grid">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              setSelectNavbar={setSelectNavbar}
              teacherMap={teacherMap}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ReportCard({
  report,
  setSelectNavbar,
  teacherMap,
}: {
  report: any;
  setSelectNavbar: any;
  teacherMap: any;
}) {
  return (
    <article className="report-card">
      <div className="report-top">
        <div className="report-icon">
          <i className="bi bi-file-earmark-text-fill"></i>
        </div>

        <div>
          <div className="d-flex align-items-baseline">
            <h3 className="me-2">
              {report.type} {report.title}
            </h3>
          </div>
          <p>
            <i className="bi bi-person-fill"></i>
            Giáo viên: {teacherMap[report.authorId]}
          </p>
        </div>

        <StatusBadge status={report.status} />
      </div>

      <div className="report-meta">
        <div>
          <span>
            <i className="bi bi-send-fill"></i>
            Ngày gửi:
          </span>
          <strong>
            {typeof report?.createAt === "number"
              ? moment(report?.createAt).format("HH:mm:ss DD/MM/YYYY")
              : moment(handleTimeStampFirestore(report?.createAt)).format(
                  "HH:mm:ss DD/MM/YYYY",
                )}
          </strong>
        </div>

        <div>
          <span>
            <i className="bi bi-calendar-check"></i>
            Ngày duyệt:
          </span>
          <strong>
            {typeof report?.updateAt === "number"
              ? moment(report?.updateAt).format("HH:mm:ss DD/MM/YYYY")
              : moment(handleTimeStampFirestore(report?.updateAt)).format(
                  "HH:mm:ss DD/MM/YYYY",
                )}
          </strong>
        </div>
      </div>

      <div className="report-actions">
        <Link
          to="../reportdetail"
          onClick={() => setSelectNavbar("")}
          state={{ report }}
          className="view-btn text-decoration-none d-flex justify-content-center align-items-center"
        >
          <i className="bi bi-eye-fill me-2"></i>
          Xem báo cáo
        </Link>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const text =
    status === "approved"
      ? "Đã duyệt"
      : status === "pending"
        ? "Chờ duyệt"
        : status === "revision"
          ? "Cần sửa"
          : "Bản nháp";

  return (
    <span className={`status-badge ${status}`}>
      <i className="bi bi-check-circle-fill"></i>
      {text}
    </span>
  );
}

const css = `
:root {
  --green: #118c17;
  --green-dark: #056b10;
  --green-deep: #03490b;
  --green-soft: #e9f8eb;
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
  color: var(--text);
  background: #eef9f0;
}

/* PAGE HEAD */

.page-head {
  padding: 28px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.page-head h1 {
  margin: 0;
  color: var(--green-deep);
  font-size: 36px;
  font-weight: 950;
}

.page-head p {
  margin: 6px 0 0;
  color: var(--muted);
  font-weight: 650;
}

.primary-btn {
  height: 46px;
  border: 0;
  border-radius: 15px;
  padding: 0 18px;
  color: #fff;
  font-weight: 900;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

/* SUMMARY */

// .summary-grid {
//   display: grid;
//   grid-template-columns: repeat(4, 1fr);
//   gap: 16px;
//   margin-bottom: 22px;
// }

.summary-card {
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 14px 34px rgba(5, 107, 16, 0.07);
  display: flex;
  align-items: center;
  gap: 14px;
}

.summary-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--green-soft);
  color: var(--green);
  display: grid;
  place-items: center;
  font-size: 24px;
  flex-shrink: 0;
}

.summary-card.warning .summary-icon {
  background: #fff7d6;
  color: var(--yellow);
}

.summary-card.danger .summary-icon {
  background: #ffe1e1;
  color: var(--red);
}

.summary-card p {
  margin: 0;
  color: #5f8064;
  font-weight: 800;
}

.summary-card h3 {
  margin: 2px 0 0;
  color: var(--green-deep);
  font-size: 30px;
  font-weight: 950;
}

/* FILTER */

.filter-panel {
  padding: 18px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 14px 36px rgba(5, 107, 16, 0.07);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
  align-items: center;
}

.search-box {
  height: 50px;
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  background: #fff;
}

.search-box i {
  color: var(--green);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--text);
  font-weight: 600;
  background: transparent;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tabs button {
  height: 42px;
  border: 0;
  border-radius: 999px;
  padding: 0 16px;
  background: var(--green-soft);
  color: var(--green-deep);
  font-weight: 900;
}

.status-tabs button.active {
  // background: var(--green);
  color: var(--green);
}

/* REPORT LAYOUT */

.report-layout {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 22px;
  align-items: start;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

.report-card {
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(5, 107, 16, 0.08);
}

.report-card {
  padding: 20px;
  border-radius: 26px;
  transition: 0.22s ease;
}

.report-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 55px rgba(5, 107, 16, 0.15);
}

.report-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.report-icon {
  width: 66px;
  height: 66px;
  border-radius: 20px;
  background: #f5fff6;
  border: 2px solid #cdf8d5;
  color: var(--red);
  display: grid;
  place-items: center;
  font-size: 28px;
  flex-shrink: 0;
}

.report-top h3 {
  margin: 4px 0 6px;
  color: var(--green-deep);
  font-size: 20px;
  font-weight: 950;
}

.report-top p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.report-top p i {
  color: var(--red);
  margin-right: 4px;
}

.status-badge {
  margin-left: auto;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.status-badge.approved {
  background: #dff7e4;
  color: var(--green-deep);
}

.status-badge.pending {
  background: #fff3cd;
  color: #9a6700;
}

.status-badge.revision {
  background: #ffe1e1;
  color: #b91c1c;
}

.status-badge.draft {
  background: #e5e7eb;
  color: #374151;
}

.report-meta {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.report-meta div {
  padding: 12px;
  border-radius: 16px;
  background: #effbf1;
  border: 1px solid var(--border);
}

.report-meta span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
}

.report-meta span i {
  color: var(--yellow);
  margin-right: 5px;
}

.report-meta strong {
  color: var(--green-deep);
  font-size: 13px;
}

// .progress-box {
//   margin-top: 16px;
//   padding: 14px;
//   border-radius: 18px;
//   background: #f7fff8;
// }

// .progress-box strong {
//   color: var(--green-deep);
// }

// .progress-box span {
//   color: var(--green);
//   font-weight: 900;
// }

.report-progress {
  height: 10px;
  margin-top: 8px;
  border-radius: 999px;
  background: #def3e1;
  overflow: hidden;
}

.report-progress .progress-bar {
  background: linear-gradient(135deg, var(--green), var(--green-dark));
}

.report-kpi {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 10px;
}

.report-kpi b {
  display: block;
  color: var(--green-deep);
  font-weight: 950;
}

.report-kpi span {
  color: #5f8064;
  font-size: 12px;
  font-weight: 700;
}

.report-actions {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.view-btn,
.pdf-btn,
.more-btn {
  height: 46px;
  border-radius: 15px;
  font-weight: 900;
}

.view-btn {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--green-deep);
}

.pdf-btn {
  border: 0;
  background: #ffe1e1;
  color: var(--red);
}

.more-btn {
  border: 0;
  background: var(--green);
  color: #fff;
}

/* ACTIVITY */

// .activity-panel {
//   position: sticky;
//   top: 20px;
//   padding: 22px;
//   border-radius: 26px;
// }

// .activity-panel h3 {
//   margin: 0 0 18px;
//   color: var(--green-deep);
//   font-weight: 950;
// }

.timeline-item {
  position: relative;
  padding-left: 28px;
  padding-bottom: 20px;
  border-left: 2px dashed var(--border);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -8px;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--green);
  border: 3px solid #fff;
  box-shadow: 0 0 0 3px #dff7e4;
}

.timeline-item.success .timeline-dot {
  background: var(--green-dark);
}

.timeline-item.danger .timeline-dot {
  background: var(--red);
}

.timeline-item strong {
  color: var(--green-deep);
}

.timeline-item p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

/* RESPONSIVE */

@media (max-width: 1400px) {
  // .summary-grid {
  //   grid-template-columns: repeat(2, 1fr);
  // }

  .report-layout {
    grid-template-columns: 1fr;
  }

  // .activity-panel {
  //   position: static;
  // }
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
  }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .page-head h1 {
    font-size: 28px;
  }

  .primary-btn {
    width: 100%;
    justify-content: center;
  }

  // .summary-grid {
  //   grid-template-columns: 1fr;
  // }

  .report-top {
    flex-wrap: wrap;
  }

  .status-badge {
    margin-left: 0;
  }

  .report-meta,
  .report-kpi {
    grid-template-columns: 1fr;
  }

  .report-actions {
    grid-template-columns: 1fr;
  }
}
`;
