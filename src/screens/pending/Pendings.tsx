import { Message } from "iconsax-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { handleTimeStampFirestore } from "../../constants/convertTimeStamp";
import { formatDateSearch, getTimeValue } from "../../constants/info";
import { PlanModel, ReportModel } from "../../models";
import {
  usePlanStore,
  useReportStore,
  useSelectNavbarStore,
  useTeacherStore,
} from "../../zustand";

export default function PendingScreen() {
  const [keyword, setKeyword] = useState("");
  const { plans } = usePlanStore();
  const { reports } = useReportStore();
  const [plansPending, setPlansPending] = useState<PlanModel[]>([]);
  const [reportsPending, setReportsPending] = useState<ReportModel[]>([]);
  const { teachers } = useTeacherStore();
  const { setSelectNavbar } = useSelectNavbarStore();

  const teacherMap = useMemo(() => {
    const map: any = {};
    teachers.forEach((t) => {
      map[t.id] = t.fullName;
    });
    return map;
  }, [teachers]);

  useEffect(() => {
    if (plans) {
      const items = plans.filter((plan) => plan.status === "pending");
      setPlansPending(items);
    }
  }, [plans]);

  useEffect(() => {
    if (reports) {
      const items = reports.filter((report) => report.status === "pending");
      setReportsPending(items);
    }
  }, [reports]);

  const filteredItems = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return plansPending
      .concat(reportsPending)
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
  }, [plansPending, reportsPending, keyword, teacherMap]);

  return (
    <>
      <style>{css}</style>
      <section className="page-head">
        <div>
          <h1>Chờ duyệt</h1>
          <p>
            Kế hoạch và báo cáo đang chờ admin kiểm tra, duyệt hoặc trả về chỉnh
            sửa
          </p>
        </div>
      </section>
      <section className="filter-panel">
        <div className="search-box">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên KH/BC, Gv, thời gian thực hiện"
          />
        </div>

        <div className="status-tabs">
          <button className={"active"}>
            {filteredItems.filter((item) => item.type === "KH").length} Kế hoạch
            và {filteredItems.filter((item) => item.type === "BC").length} Báo
            cáo
          </button>
        </div>
      </section>

      <section className="pending-layout">
        <div className="pending-grid">
          {filteredItems.map((item) => (
            <PendingCard
              key={item.id}
              item={item}
              setSelectNavbar={setSelectNavbar}
              teacherMap={teacherMap}
            />
          ))}
        </div>

        <aside className="review-panel">
          <h3>Quy trình duyệt</h3>

          <ReviewStep
            number="1"
            title="Giáo viên gửi"
            text="Kế hoạch hoặc báo cáo được gửi lên hệ thống."
          />
          <ReviewStep
            number="2"
            title="Giám đốc kiểm tra"
            text="Kiểm tra nội dung, mục tiêu, nhận xét chuyên môn."
          />
          <ReviewStep
            number="3"
            title="Duyệt / góp ý"
            text="Duyệt hồ sơ hoặc yêu cầu giáo viên chỉnh sửa theo góp ý."
          />
          <ReviewStep
            number="4"
            title="Lưu hồ sơ"
            text="Nội dung đã duyệt được lưu vào hồ sơ trẻ."
          />
        </aside>
      </section>
    </>
  );
}

function PendingCard({
  item,
  setSelectNavbar,
  teacherMap,
}: {
  item: any;
  setSelectNavbar: (value: string) => void;
  teacherMap: any;
}) {
  const isPlan = item.type === "KH";
  const isReport = item.type === "BC";

  return (
    <article className="pending-card">
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
        <div className="pending-top">
          <div className={`pending-icon ${isPlan ? "plan" : "report"}`}>
            <i
              className={`bi ${isPlan ? "bi-calendar2-week-fill" : "bi-file-earmark-text-fill"}`}
            ></i>
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-baseline">
              <h3 className="me-2">
                {item.type} {item.title}
              </h3>
              <h6>
                <i>
                  {isReport && "Tuần"} {item.subTitle}
                </i>
              </h6>
            </div>
            <p>
              <i className="bi bi-person-fill"></i>
              Giáo viên: {teacherMap[item.authorId]}
            </p>
          </div>

          {item.comment && <Message color="red" size={26} variant="Bold" />}
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="pending-info">
        <div>
          <span>
            <i className="bi bi-send-fill"></i>
            Ngày gửi
          </span>
          <strong>
            {typeof item?.createAt === "number"
              ? moment(item?.createAt).format("HH:mm:ss DD/MM/YYYY")
              : moment(handleTimeStampFirestore(item?.createAt)).format(
                  "HH:mm:ss DD/MM/YYYY",
                )}
          </strong>
        </div>
      </div>

      <div className="note-box">
        <i className="bi bi-chat-left-text-fill"></i>
        <span>
          {isPlan
            ? "Kế hoạch tháng đang chờ Giám đốc kiểm tra"
            : "Báo cáo tuần đang chờ Giám đốc kiểm tra"}
        </span>
      </div>

      <div className="pending-actions">
        <Link
          to={isReport ? "../reportdetail" : "../plandetail"}
          onClick={() => setSelectNavbar("")}
          state={isReport ? { report: item } : { plan: item }}
          className="view-btn"
        >
          <i className="bi bi-eye-fill me-2"></i>
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const text = status === "revision" ? "Cần sửa" : "Chờ duyệt";

  return (
    <span className={`status-badge ${status}`}>
      <i
        className={
          status === "revision"
            ? "bi bi-pencil-square"
            : "bi bi-hourglass-split"
        }
      ></i>
      {text}
    </span>
  );
}

function ReviewStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="review-step">
      <div>{number}</div>
      <section>
        <strong>{title}</strong>
        <p>{text}</p>
      </section>
    </div>
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

// .head-actions {
//   display: flex;
//   gap: 10px;
//   flex-shrink: 0;
// }

.primary-btn,
.outline-btn {
  height: 46px;
  border-radius: 15px;
  padding: 0 18px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.primary-btn {
  border: 0;
  color: #fff;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
}

.outline-btn {
  border: 1px solid var(--border);
  color: var(--green-deep);
  background: #fff;
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
  color: var(--muted);
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
  background: transparent;
  font-weight: 600;
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
  cursor: pointer;
}

.status-tabs button.active {
  background: var(--green-soft);
  color: var(--green);
}

/* LAYOUT */

.pending-layout {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 22px;
  align-items: start;
}

.pending-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

/* PENDING CARD */

.pending-card,
.review-panel {
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(5, 107, 16, 0.08);
}

.pending-card {
  padding: 20px;
  border-radius: 26px;
  transition: 0.22s ease;
}

.pending-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 55px rgba(5, 107, 16, 0.15);
}

.pending-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.pending-icon {
  width: 66px;
  height: 66px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  font-size: 28px;
  flex-shrink: 0;
}

.pending-icon.plan {
  background: #f5fff6;
  border: 2px solid #cdf8d5;
  color: var(--green);
}

.pending-icon.report {
  background: #fff7d6;
  border: 2px solid #ffe7a3;
  color: #b7791f;
}

.pending-top h3 {
  margin: 4px 0 6px;
  color: var(--green-deep);
  font-size: 20px;
  font-weight: 950;
}

.pending-top p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
}

.pending-top p i {
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

.status-badge.pending {
  background: #fff3cd;
  color: #9a6700;
}

.status-badge.revision {
  background: #ffe1e1;
  color: #b91c1c;
}

/* INFO */

.pending-info {
  margin-top: 18px;
}

.pending-info div {
  padding: 12px;
  border-radius: 16px;
  background: #effbf1;
  border: 1px solid var(--border);
}

.pending-info span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
}

.pending-info span i {
  color: var(--yellow);
  margin-right: 5px;
}

.pending-info strong {
  color: var(--green-deep);
  font-size: 13px;
}

.note-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: #f7fff8;
  color: var(--muted);
  font-size: 13px;
  font-weight: 650;
  display: flex;
  gap: 10px;
}

.note-box i {
  color: var(--green);
}

/* ACTIONS */

.pending-actions {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.pending-actions .view-btn {
  height: 46px;
  border-radius: 15px;
  font-weight: 900;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.view-btn {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--green-deep);
}

// .approve-btn {
//   border: 0;
//   background: var(--green);
//   color: #fff;
// }

// .reject-btn {
//   border: 0;
//   background: #ffe1e1;
//   color: var(--red);
// }

/* REVIEW PANEL */

.review-panel {
  position: sticky;
  top: 20px;
  padding: 22px;
  border-radius: 26px;
}

.review-panel h3 {
  margin: 0 0 18px;
  color: var(--green-deep);
  font-weight: 950;
}

.review-step {
  display: flex;
  gap: 14px;
  padding-bottom: 18px;
}

.review-step:last-child {
  padding-bottom: 0;
}

.review-step > div {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 950;
  flex-shrink: 0;
}

.review-step strong {
  color: var(--green-deep);
}

.review-step p {
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

  .pending-layout {
    grid-template-columns: 1fr;
  }

  .review-panel {
    position: static;
  }
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
  }

  // .head-actions {
  //   width: 100%;
  //   flex-wrap: wrap;
  // }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  .pending-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .page-head h1 {
    font-size: 28px;
  }

  .primary-btn,
  .outline-btn {
    width: 100%;
    justify-content: center;
  }

  // .summary-grid {
  //   grid-template-columns: 1fr;
  // }

  .pending-top {
    flex-wrap: wrap;
  }

  .status-badge {
    margin-left: 0;
  }

  .pending-actions {
    grid-template-columns: 1fr;
  }
}
`;
