import { useMemo, useState } from "react";
import { SpinnerComponent } from "../../components";
import { calculateAgeDetail, getCurrentMonth } from "../../constants/info";
import { UserModel } from "../../models";
import { useChildStore, useTeacherStore } from "../../zustand";
import "./childprofile.css";

const achievedGoals = [
  {
    title: "Chủ động yêu cầu bằng câu 3–4 từ",
    description: "Biết dùng lời nói để yêu cầu đồ vật hoặc hoạt động mong muốn",
    category: "Giao tiếp",
    date: "12/08/2026",
    evaluator: "GV can thiệp",
  },
  {
    title: "Thực hiện mệnh lệnh 2 bước",
    description: "Làm đúng chuỗi yêu cầu trong sinh hoạt hằng ngày",
    category: "Ngôn ngữ hiểu",
    date: "18/08/2026",
    evaluator: "Phụ huynh",
  },
  {
    title: "Luân phiên lượt chơi với người lớn",
    description: "Biết chờ lượt và duy trì tương tác trong trò chơi",
    category: "Tương tác xã hội",
    date: "22/08/2026",
    evaluator: "GV can thiệp",
  },
];

const profileStats = [
  {
    label: "Mục tiêu đang học",
    value: "12",
    unit: "mục tiêu",
    icon: "bi-bullseye",
    tone: "yellow",
  },
  {
    label: "Hoàn thành tháng",
    value: "72%",
    unit: "tiến độ",
    icon: "bi-graph-up-arrow",
    tone: "red",
  },
  {
    label: "Buổi can thiệp",
    value: "18",
    unit: "buổi",
    icon: "bi-calendar-check-fill",
    tone: "yellow",
  },
  {
    label: "Báo cáo chờ duyệt",
    value: "01",
    unit: "báo cáo",
    icon: "bi-hourglass-split",
    tone: "red",
  },
];

const goals = [
  {
    area: "Giao tiếp",
    title: "Chủ động yêu cầu bằng câu 3–4 từ",
    progress: 75,
    status: "Đang học",
  },
  {
    area: "Ngôn ngữ hiểu",
    title: "Thực hiện mệnh lệnh 2 bước trong sinh hoạt",
    progress: 65,
    status: "Đang học",
  },
  {
    area: "Tương tác xã hội",
    title: "Luân phiên lượt chơi với người lớn",
    progress: 58,
    status: "Cần hỗ trợ",
  },
  {
    area: "Nhận thức",
    title: "Phân loại đồ vật theo nhóm quen thuộc",
    progress: 82,
    status: "Ổn định",
  },
];

const reports = [
  {
    month: "05/2024",
    plan: "Đã lập",
    report: "Chờ duyệt",
    teacher: "Nguyễn Thị Mai Phương",
  },
  {
    month: "04/2024",
    plan: "Đã lập",
    report: "Đã duyệt",
    teacher: "Nguyễn Thị Mai Phương",
  },
  {
    month: "03/2024",
    plan: "Đã lập",
    report: "Đã duyệt",
    teacher: "Võ Lê Mai Thoại",
  },
];

const activities = [
  {
    icon: "bi-pencil-square",
    tone: "yellow",
    title: "Cập nhật mục tiêu giao tiếp",
    time: "Hôm nay, 09:20",
  },
  {
    icon: "bi-camera-fill",
    tone: "red",
    title: "Thêm 3 hình ảnh hoạt động",
    time: "Hôm qua, 16:45",
  },
  {
    icon: "bi-check-circle-fill",
    tone: "yellow",
    title: "Hoàn thành báo cáo tháng 04",
    time: "28/04/2024",
  },
  {
    icon: "bi-chat-heart-fill",
    tone: "red",
    title: "Ghi chú trao đổi với phụ huynh",
    time: "24/04/2024",
  },
];

function StatCard({ stat }: any) {
  return (
    <div className="card border-0 stat-card h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3">
          <div className={`stat-icon ${stat.tone}`}>
            <i className={`bi ${stat.icon}`} />
          </div>
          <div className="min-w-0">
            <div className="small fw-semibold text-green-muted">
              {stat.label}
            </div>
            <div className="d-flex align-items-end gap-2 mt-1">
              <div className="display-value fw-black text-green-dark lh-1">
                {stat.value}
              </div>
              <div className="small text-green-muted pb-1">{stat.unit}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, tone = "yellow" }: any) {
  return (
    <div className="info-item d-flex gap-3">
      <span className={`info-icon ${tone}`}>
        <i className={`bi ${icon}`} />
      </span>
      <span className="min-w-0">
        <span className="d-block small text-green-muted fw-semibold">
          {label}
        </span>
        <span className="d-block fw-bold text-green-dark text-truncate">
          {value}
        </span>
      </span>
    </div>
  );
}

function GoalRow({ goal }: any) {
  return (
    <div className="goal-row">
      <div className="d-flex justify-content-between gap-3 mb-2">
        <div className="min-w-0">
          <span className="area-badge">{goal.area}</span>
          <div className="fw-bold text-green-dark mt-2">{goal.title}</div>
        </div>
        <span
          className={`goal-status ${goal.status === "Cần hỗ trợ" ? "warn" : "ok"}`}
        >
          {goal.status}
        </span>
      </div>
      <div className="d-flex align-items-center gap-3">
        <div
          className="progress flex-grow-1 progress-soft"
          role="progressbar"
          aria-valuenow={goal.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-bar"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <div className="fw-black text-green-dark progress-number">
          {goal.progress}%
        </div>
      </div>
    </div>
  );
}

export default function ChildProfileBootstrapGreen() {
  const [activeTab, setActiveTab] = useState("overview");
  const { child } = useChildStore();
  const { teachers } = useTeacherStore();
  const half = Math.ceil(teachers.length / 2);
  const leftTeachers = teachers.slice(0, half);
  const rightTeachers = teachers.slice(half);

  const tabs = useMemo(
    () => [
      // { key: "overview", label: "Tổng quan", icon: "bi-grid-fill" },
      { key: "goals", label: "Mục tiêu đã đạt", icon: "bi-bullseye" },
      {
        key: "reports",
        label: "Kế hoạch / Báo cáo",
        icon: "bi-file-earmark-text",
      },
      { key: "media", label: "Hình ảnh / Video", icon: "bi-images" },
    ],
    [],
  );

  if (!child) return <SpinnerComponent />;

  return (
    <>
      <section className="container-fluid px-3 px-md-4 px-xl-5 py-4 py-xl-5">
        <div className="row align-items-start g-3 mb-4">
          <div className="col-12 col-md">
            <h2 className="page-title fw-black text-green-dark mb-2">
              Hồ sơ trẻ
            </h2>
            <p className="fs-5 text-green-muted mb-0">
              Theo dõi thông tin, kế hoạch tháng và tiến độ can thiệp.
            </p>
          </div>
          {/* <div className="col-12 col-md-auto d-flex gap-2 flex-wrap">
            <button className="btn action-btn-soft">
              <i className="bi bi-printer-fill icon-yellow me-2" />
              In hồ sơ
            </button>
            <button className="btn action-btn-primary">
              <i className="bi bi-pencil-square me-2" />
              Cập nhật hồ sơ
            </button>
          </div> */}
        </div>

        <div className="profile-card profile-hero p-3 p-md-4 mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-lg-auto text-center text-lg-start">
              <img
                className="profile-photo rounded-5"
                src={child.avatar}
                alt={child.fullName}
              />
            </div>
            <div className="col-12 col-lg">
              <div className="d-flex flex-column flex-xl-row justify-content-between gap-3">
                <div>
                  <span className="status-pill d-inline-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-check-circle-fill" />
                    {child.status === "studying" ? "Đang học" : ""}
                  </span>
                  <h3 className="fw-black text-green-dark mb-1">
                    {child.fullName}
                  </h3>
                  <div className="text-green-muted fw-semibold">
                    Mã hồ sơ: {child.id} · Bắt đầu can thiệp: {`child.birth`}
                  </div>
                </div>
                <div className="text-xl-end">
                  <div className="small text-green-muted fw-semibold">
                    Kỳ kế hoạch hiện tại
                  </div>
                  <div className="h5 fw-black text-green-dark mb-0">
                    {getCurrentMonth()}
                  </div>
                </div>
              </div>

              <div className="row g-3 mt-3">
                <div className="col-12 col-sm-6 col-xl-4">
                  <InfoItem
                    icon="bi-calendar-heart"
                    label="Ngày sinh"
                    value={`${child.birth} · ${calculateAgeDetail(String(child.birth)).years} tuổi ${calculateAgeDetail(String(child.birth)).months} tháng ${calculateAgeDetail(String(child.birth)).days} ngày`}
                    tone="yellow"
                  />
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <InfoItem
                    icon="bi-gender-ambiguous"
                    label="Giới tính"
                    value={child.gender}
                    tone="red"
                  />
                </div>
                <div className="col-12 col-sm-6 col-xl-4">
                  <div className="info-item d-flex gap-3">
                    <span className={`info-icon red`}>
                      <i className={`bi bi-person-check-fill`} />
                    </span>
                    <span className="min-w-0">
                      <span className="d-block small text-green-muted fw-semibold">
                        Giáo viên phụ trách
                      </span>
                      <span className="d-block fw-bold text-green-dark text-truncate">
                        <div className="d-flex flex-column flex-md-row align-items-start gap-2 gap-md-4">
                          {/* Cột trái */}
                          <div>
                            {leftTeachers.map(
                              (teacher: UserModel, index: number) => (
                                <div
                                  className="small text-green-muted"
                                  key={index}
                                >
                                  {index + 1}. {teacher.fullName}
                                </div>
                              ),
                            )}
                          </div>

                          {/* Cột phải */}
                          <div>
                            {rightTeachers.map(
                              (teacher: UserModel, index: number) => (
                                <div
                                  className="small text-green-muted"
                                  key={index}
                                >
                                  {index + 1 + leftTeachers.length}.{" "}
                                  {teacher.fullName}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 g-xl-4 mb-4">
          {profileStats.map((stat) => (
            <div className="col-12 col-sm-6 col-xl-3" key={stat.label}>
              <StatCard stat={stat} />
            </div>
          ))}
        </div>

        <div className="page-panel p-3 p-md-4 mb-4">
          <div className="tab-strip">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`btn profile-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`bi ${tab.icon} me-2`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

<div className="goal-panel p-3 p-md-4 mb-4">
  <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-column flex-md-row">
    <div>
      <h3 className="section-title h5 mb-1">Mục tiêu đã đạt được</h3>
      <div className="text-green-muted small fw-semibold">
        Danh sách các mục tiêu trẻ đã hoàn thành trong tháng
      </div>
    </div>

    <button className="btn action-btn-soft btn-sm">
      <i className="bi bi-plus-circle-fill icon-red me-2" />
      Thêm mục tiêu
    </button>
  </div>

  <div className="table-responsive">
    <table className="table achieved-goal-table align-middle mb-0">
      <thead>
        <tr>
          <th>Mục tiêu</th>
          <th>Lĩnh vực</th>
          <th>Ngày đạt</th>
          <th>Người đánh giá</th>
          <th>Trạng thái</th>
        </tr>
      </thead>

      <tbody>
        {achievedGoals.map((goal) => (
          <tr key={goal.title}>
            <td>
              <div className="fw-bold text-green-dark">{goal.title}</div>
              <div className="small text-green-muted">{goal.description}</div>
            </td>

            <td>
              <span className="goal-category-badge">{goal.category}</span>
            </td>

            <td className="fw-semibold text-green-dark">{goal.date}</td>

            <td className="text-green-muted fw-semibold">
              {goal.evaluator}
            </td>

            <td>
              <span className="goal-status-badge">
                <i className="bi bi-check-circle-fill me-1" />
                Đã đạt
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
        {/* <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="goal-panel p-3 p-md-4 mb-4">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h3 className="section-title h5 mb-1">
                    Mục tiêu can thiệp tháng này
                  </h3>
                  <div className="text-green-muted small fw-semibold">
                    Theo dõi tiến độ từng lĩnh vực
                  </div>
                </div>
                <button className="btn action-btn-soft btn-sm">
                  <i className="bi bi-plus-circle-fill icon-red me-2" />
                  Thêm mục tiêu
                </button>
              </div>
              {goals.map((goal) => (
                <GoalRow key={goal.title} goal={goal} />
              ))}
            </div>

            <div className="report-panel p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h3 className="section-title h5 mb-1">
                    Kế hoạch và báo cáo gần đây
                  </h3>
                  <div className="text-green-muted small fw-semibold">
                    Lưu lịch sử theo từng tháng
                  </div>
                </div>
                <button className="btn action-btn-primary btn-sm">
                  <i className="bi bi-file-earmark-plus me-2" />
                  Tạo báo cáo
                </button>
              </div>
              <div className="table-responsive">
                <table className="table report-table align-middle">
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th>Kế hoạch</th>
                      <th>Báo cáo</th>
                      <th>Giáo viên</th>
                      <th className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((item) => (
                      <tr key={item.month}>
                        <td>{item.month}</td>
                        <td>
                          <span className="report-badge good">{item.plan}</span>
                        </td>
                        <td>
                          <span
                            className={`report-badge ${item.report === "Chờ duyệt" ? "pending" : "good"}`}
                          >
                            {item.report}
                          </span>
                        </td>
                        <td>{item.teacher}</td>
                        <td className="text-end">
                          <button className="btn btn-sm action-btn-soft">
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="profile-card p-3 p-md-4 mb-4">
              <h3 className="section-title h5 mb-3">Thông tin phụ huynh</h3>
              <div className="vstack gap-3">
                <InfoItem
                  icon="bi-person-heart"
                  label="Phụ huynh"
                  value={`child.parentName`}
                  tone="red"
                />
                <InfoItem
                  icon="bi-telephone-fill"
                  label="Số điện thoại"
                  value={`child.parentPhone`}
                  tone="yellow"
                />
                <InfoItem
                  icon="bi-geo-alt-fill"
                  label="Địa chỉ"
                  value={`child.address`}
                  tone="red"
                />
              </div>
            </div>

            <div className="activity-panel p-3 p-md-4 mb-4">
              <h3 className="section-title h5 mb-3">Hoạt động gần đây</h3>
              {activities.map((item) => (
                <div className="timeline-item" key={item.title}>
                  <span className={`timeline-icon ${item.tone}`}>
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <div>
                    <div className="fw-bold text-green-dark">{item.title}</div>
                    <div className="small text-green-muted">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="note-panel p-3 p-md-4">
              <h3 className="section-title h5 mb-3">Ghi chú nhanh</h3>
              <div className="note-box text-green-muted">
                Trẻ hợp tác tốt trong hoạt động chơi luân phiên. Cần tăng cơ hội
                giao tiếp chủ động trong giờ ăn nhẹ và hoạt động nhóm.
              </div>
            </div>
          </div>
        </div> */}
      </section>
    </>
  );
}
