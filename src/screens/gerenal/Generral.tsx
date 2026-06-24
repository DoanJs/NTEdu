import { useMemo, useState } from "react";

const CENTER_NAME = "TRUNG TÂM GIÁO DỤC HÒA NHẬP VÀ CAN THIỆP SỚM QUẢNG XƯƠNG";
const TEACHER_NAME = "Mai Thị Phương";

const stats = [
  {
    title: "Tổng số trẻ",
    value: "100",
    unit: "Trẻ",
    note: "+5 so với tháng trước",
    icon: "bi-people-fill",
    iconTone: "yellow",
  },
  {
    title: "Kế hoạch tháng",
    value: "98",
    unit: "Kế hoạch",
    note: "Đã hoàn thành 72%",
    icon: "bi-calendar-check-fill",
    iconTone: "red",
  },
  {
    title: "Báo cáo tháng",
    value: "95",
    unit: "Báo cáo",
    note: "Đã hoàn thành 65%",
    icon: "bi-file-earmark-bar-graph-fill",
    iconTone: "yellow",
  },
  {
    title: "Chờ duyệt",
    value: "12",
    unit: "Báo cáo",
    note: "Cần xử lý hôm nay",
    icon: "bi-hourglass-split",
    iconTone: "red",
  },
  {
    title: "Mục tiêu trong giỏ",
    value: "36",
    unit: "Mục tiêu",
    note: "Sẵn sàng sử dụng",
    icon: "bi-bullseye",
    iconTone: "yellow",
  },
];

function StatCard({ stat }: any) {
  return (
    <div className="card border-0 stat-card h-100">
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 gap-md-4">
          <div className={`stat-icon ${stat.iconTone}`}>
            <i className={`bi ${stat.icon}`} />
          </div>
          <div className="min-w-0">
            <div className="small fw-semibold text-green-muted">
              {stat.title}
            </div>
            <div className="d-flex align-items-end gap-2 mt-1">
              <div className="display-value fw-black text-green-dark lh-1">
                {stat.value}
              </div>
              <div className="small text-green-muted pb-1">{stat.unit}</div>
            </div>
            <div className="small fw-bold mt-2 text-green">{stat.note}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
const childrenData = [
  {
    id: "HS001",
    name: "Nguyễn Bá Nguyên",
    nickname: "Kin",
    group: "Nhóm Hoa Mai",
    teacher: "Nguyễn Thị Mai Phương",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS002",
    name: "Ngô Trần Gia Khang",
    nickname: "Bồn",
    group: "Nhóm Hoa Mai",
    teacher: "Võ Lê Mai Thoại",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS003",
    name: "Phạm Ngọc Quỳnh Như",
    nickname: "Min",
    group: "Nhóm Hoa Hồng",
    teacher: "Nguyễn Thị Mai Phương",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS004",
    name: "Nguyễn Hoàng Vũ",
    nickname: "Gấu",
    group: "Nhóm Hoa Hồng",
    teacher: "Võ Lê Mai Thoại",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS005",
    name: "Đinh Như Quang Khải",
    nickname: "Bin",
    group: "Nhóm Hoa Hướng Dương",
    teacher: "Nguyễn Thị Mai Phương",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS006",
    name: "Huỳnh Hiếu Minh",
    nickname: "",
    group: "Nhóm Hoa Hướng Dương",
    teacher: "Võ Lê Mai Thoại",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1566004100631-35d015d6a491?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS007",
    name: "Lê Phan Khả Di",
    nickname: "Sữa",
    group: "Nhóm Hoa Mai",
    teacher: "Nguyễn Thị Mai Phương",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: "HS008",
    name: "Nguyễn Tú Linh",
    nickname: "",
    group: "Nhóm Hoa Mai",
    teacher: "Võ Lê Mai Thoại",
    status: "Đang can thiệp",
    avatar:
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?q=80&w=500&auto=format&fit=crop",
  },
];
function ChildCard({ child }: any) {
  return (
    <div className="card child-card border-0 h-100">
      <div className="card-body p-3 p-sm-4">
        <div className="d-flex gap-3 gap-sm-4">
          <img
            src={child.avatar}
            alt={child.name}
            className="child-avatar rounded-4 object-fit-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-grow-1">
            <div className="d-flex justify-content-between gap-2">
              <h3 className="child-name fw-black mb-0 text-green-dark">
                {child.name}{" "}
                {child.nickname && (
                  <span className="text-capitalize">({child.nickname})</span>
                )}
              </h3>
              <button className="btn btn-sm child-more" aria-label="Tùy chọn">
                <i className="bi bi-three-dots" />
              </button>
            </div>

            <div className="mt-3 vstack gap-2 small text-green-muted">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-flower2 icon-yellow" />
                <span>{child.group}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-person-check-fill icon-red" />
                <span>{child.teacher}</span>
              </div>
            </div>

            <span className="status-pill mt-3 d-inline-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill" />
              {child.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function GeneralBootstrapGreen() {
  const [keyword, setKeyword] = useState("");
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState("az");

  const groups = Array.from(new Set(childrenData.map((c) => c.group)));

  const filteredChildren = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    const result = childrenData.filter((child) => {
      const content =
        `${child.id} ${child.name} ${child.nickname} ${child.group} ${child.teacher}`.toLowerCase();
      const matchSearch = !search || content.includes(search);
      const matchGroup = group === "all" || child.group === group;
      return matchSearch && matchGroup;
    });

    return [...result].sort((a, b) => {
      const compare = a.name.localeCompare(b.name, "vi");
      return sort === "az" ? compare : -compare;
    });
  }, [keyword, group, sort]);

  return (
    <section className="container-fluid px-3 px-md-4 px-xl-5 py-4 py-xl-5">
      <div className="row align-items-start g-3 mb-4 mb-xl-5">
        <div className="col-12 col-md">
          <h2 className="page-title fw-black text-green-dark mb-2">
            Xin chào, {TEACHER_NAME} 👋
          </h2>
          <p className="fs-5 text-green-muted mb-0">
            Chúc bạn một ngày làm việc hiệu quả!
          </p>
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn date-chip d-flex align-items-center gap-2 fw-semibold">
            <i className="bi bi-calendar-heart icon-red" />
            Thứ sáu, 24/05/2024
          </button>
        </div>
      </div>

      <div className="row g-3 g-xl-4 mb-4 mb-xl-5">
        {stats.map((stat) => (
          <div className="col-12 col-sm-6 col-xl" key={stat.title}>
            <StatCard stat={stat} />
          </div>
        ))}
      </div>

      <div className="children-panel p-3 p-md-4">
        <div className="row g-3 align-items-center mb-4">
          <div className="col-12 col-lg">
            <h2 className="h4 fw-black text-green-dark mb-0">Danh sách trẻ</h2>
            <div className="small text-green-muted mt-1">
              Theo dõi hồ sơ, giáo viên phụ trách và trạng thái can thiệp
            </div>
          </div>

          <div className="col-12 col-md-6 col-xl-4">
            <div className="search-box">
              <i className="bi bi-search" />
              <input
                className="form-control search-input"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm tên trẻ, biệt danh, mã hồ sơ..."
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3 col-xl-2">
            <select
              className="form-select filter-select"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            >
              <option value="all">Tất cả nhóm</option>
              {groups.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3 col-xl-2">
            <select
              className="form-select filter-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="az">Sắp xếp: A - Z</option>
              <option value="za">Sắp xếp: Z - A</option>
            </select>
          </div>

          <div className="col-12 col-xl-auto">
            <div className="d-flex gap-2 justify-content-xl-end">
              <button className="btn view-btn active" aria-label="Dạng lưới">
                <i className="bi bi-grid-3x3-gap-fill" />
              </button>
              <button className="btn view-btn" aria-label="Dạng danh sách">
                <i className="bi bi-list-ul" />
              </button>
            </div>
          </div>
        </div>

        <div className="row g-3 g-xl-4">
          {filteredChildren.map((child) => (
            <div className="col-12 col-md-6 col-xxl-3" key={child.id}>
              <ChildCard child={child} />
            </div>
          ))}
        </div>

        {filteredChildren.length === 0 && (
          <div className="text-center py-5 text-green-muted">
            <i className="bi bi-search fs-1 d-block mb-3 icon-yellow" />
            Không tìm thấy trẻ phù hợp.
          </div>
        )}
      </div>
    </section>
  );
}
