import { useMemo, useState } from "react";
import './media.css'

const selectedChild = {
  name: "Nguyễn Bá Nguyên",
  nickname: "Kin",
  group: "Nhóm Hoa Mai",
  avatar:
    "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=600&auto=format&fit=crop",
};

const mediaItems = [
  {
    id: "M001",
    type: "image",
    title: "Hoạt động yêu cầu đồ vật bằng lời",
    month: "06/2024",
    date: "05/06/2024",
    teacher: "Nguyễn Thị Mai Phương",
    category: "Giao tiếp",
    note: "Trẻ chủ động nói câu 3–4 từ để yêu cầu đồ chơi yêu thích.",
    url: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?q=80&w=700&auto=format&fit=crop",
    relatedGoal: "Chủ động yêu cầu đồ vật bằng câu 3–4 từ",
  },
  {
    id: "M002",
    type: "video",
    title: "Chơi luân phiên với cô",
    month: "06/2024",
    date: "04/06/2024",
    teacher: "Nguyễn Thị Mai Phương",
    category: "Tương tác xã hội",
    note: "Trẻ biết chờ lượt và tiếp tục lượt chơi sau khi được nhắc nhẹ.",
    url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=700&auto=format&fit=crop",
    relatedGoal: "Luân phiên lượt chơi với bạn hoặc người lớn",
    duration: "01:35",
  },
  {
    id: "M003",
    type: "image",
    title: "Hoạt động bàn - tô nét cong",
    month: "05/2024",
    date: "28/05/2024",
    teacher: "Võ Lê Mai Thoại",
    category: "Vận động tinh",
    note: "Trẻ hoàn thành bài tô nét cong với hỗ trợ giữ cổ tay.",
    url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=700&auto=format&fit=crop",
    relatedGoal: "Cầm bút tô theo đường thẳng và đường cong đơn giản",
  },
  {
    id: "M004",
    type: "video",
    title: "Thực hiện mệnh lệnh 2 bước",
    month: "05/2024",
    date: "23/05/2024",
    teacher: "Nguyễn Thị Mai Phương",
    category: "Ngôn ngữ hiểu",
    note: "Trẻ thực hiện đúng chuỗi lấy cốc và đưa cô trong tình huống sinh hoạt.",
    url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=700&auto=format&fit=crop",
    relatedGoal: "Thực hiện mệnh lệnh 2 bước trong sinh hoạt",
    duration: "02:10",
  },
  {
    id: "M005",
    type: "image",
    title: "Phân loại đồ vật theo nhóm",
    month: "05/2024",
    date: "20/05/2024",
    teacher: "Nguyễn Thị Mai Phương",
    category: "Nhận thức",
    note: "Trẻ phân loại đồ ăn và đồ chơi với 80% độ chính xác.",
    url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=700&auto=format&fit=crop",
    relatedGoal: "Phân loại đồ vật theo nhóm quen thuộc",
  },
  {
    id: "M006",
    type: "image",
    title: "Hoạt động nhóm nhỏ",
    month: "04/2024",
    date: "18/04/2024",
    teacher: "Võ Lê Mai Thoại",
    category: "Tập trung chú ý",
    note: "Trẻ duy trì chú ý trong hoạt động nhóm khoảng 6 phút.",
    url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=700&auto=format&fit=crop",
    relatedGoal: "Ngồi tham gia hoạt động bàn trong 7–10 phút",
  },
];


function MediaCard({ item }: any) {
  return (
    <article className="media-card">
      <div className="media-thumb-wrap">
        <img src={item.url} alt={item.title} className="media-thumb" />
        <span
          className={`media-type ${item.type === "video" ? "video" : "image"}`}
        >
          <i
            className={`bi ${item.type === "video" ? "bi-play-fill" : "bi-image-fill"}`}
          />
          {item.type === "video" ? "Video" : "Ảnh"}
        </span>
        {item.type === "video" && (
          <span className="media-duration">{item.duration}</span>
        )}
      </div>

      <div className="p-3">
        <div className="d-flex flex-wrap gap-2 mb-2">
          <span className="media-category">
            <i className="bi bi-flower2 me-1" />
            {item.category}
          </span>
          <span className="media-month">
            <i className="bi bi-calendar-heart me-1" />
            {item.month}
          </span>
        </div>
        <h3 className="media-title">{item.title}</h3>
        <div className="small text-green-muted fw-semibold mb-3">
          {item.date} · {item.teacher}
        </div>

        <div className="media-note mb-3">
          <i className="bi bi-chat-left-heart-fill icon-red me-2" />
          {item.note}
        </div>

        <div className="related-goal mb-3">
          <div className="small fw-black text-green-dark mb-1">
            <i className="bi bi-bullseye icon-yellow me-2" />
            Mục tiêu liên quan
          </div>
          <div className="small text-green-muted fw-semibold">
            {item.relatedGoal}
          </div>
        </div>

        <div className="d-flex gap-2 pt-3 border-top-soft">
          <button className="btn action-btn-soft flex-fill">
            <i className="bi bi-eye-fill me-2" />
            Xem
          </button>
          <button className="btn action-btn-primary flex-fill">
            <i className="bi bi-pencil-square me-2" />
            Sửa
          </button>
          <button className="btn remove-btn">
            <i className="bi bi-trash3-fill" />
          </button>
        </div>
      </div>
    </article>
  );
}

function UploadPanel() {
  return (
    <aside className="upload-panel">
      <h3 className="h5 fw-black text-green-dark mb-3">
        Thêm hình ảnh / video
      </h3>

      <div className="child-mini mb-3">
        <img src={selectedChild.avatar} alt={selectedChild.name} />
        <div>
          <div className="fw-black text-green-dark">
            {selectedChild.name} ({selectedChild.nickname})
          </div>
          <div className="small text-green-muted">{selectedChild.group}</div>
        </div>
      </div>

      <div className="upload-drop mb-3">
        <i className="bi bi-cloud-arrow-up-fill" />
        <div className="fw-black text-green-dark mt-2">Tải tệp lên</div>
        <div className="small text-green-muted">
          Ảnh, video ngắn hoặc minh chứng hoạt động
        </div>
        <button className="btn action-btn-soft mt-3">
          <i className="bi bi-folder2-open me-2 icon-yellow" />
          Chọn tệp
        </button>
      </div>

      <div className="mb-3">
        <div className="field-label">Tiêu đề</div>
        <input
          className="form-control filter-select"
          placeholder="Ví dụ: Hoạt động yêu cầu bằng lời"
        />
      </div>

      <div className="mb-3">
        <div className="field-label">Lĩnh vực</div>
        <select className="form-select filter-select">
          <option>Giao tiếp</option>
          <option>Ngôn ngữ hiểu</option>
          <option>Tương tác xã hội</option>
          <option>Vận động tinh</option>
          <option>Nhận thức</option>
        </select>
      </div>

      <div className="mb-3">
        <div className="field-label">Ghi chú</div>
        <textarea
          className="form-control filter-select"
          rows={4}
          placeholder="Nhập nhận xét ngắn về hoạt động..."
        />
      </div>

      <button className="btn action-btn-primary w-100 mb-2">
        <i className="bi bi-send-check-fill me-2" />
        Lưu minh chứng
      </button>
      <button className="btn action-btn-soft w-100">
        <i className="bi bi-save2-fill me-2 icon-yellow" />
        Lưu nháp
      </button>
    </aside>
  );
}

export default function MediaLibraryBootstrapGreen() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("all");
  const [month, setMonth] = useState("all");
  const [category, setCategory] = useState("all");

  const months = useMemo(
    () => Array.from(new Set(mediaItems.map((item) => item.month))),
    [],
  );
  const categories = useMemo(
    () => Array.from(new Set(mediaItems.map((item) => item.category))),
    [],
  );

  const filteredMedia = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return mediaItems.filter((item) => {
      const content =
        `${item.title} ${item.note} ${item.category} ${item.teacher} ${item.relatedGoal}`.toLowerCase();
      return (
        (!search || content.includes(search)) &&
        (type === "all" || item.type === type) &&
        (month === "all" || item.month === month) &&
        (category === "all" || item.category === category)
      );
    });
  }, [keyword, type, month, category]);


  return (
    <>
      <section className="container-fluid px-3 px-md-4 px-xl-5 py-4 py-xl-5">
        <div className="row align-items-start g-3 mb-4">
          <div className="col-12 col-lg">
            <h2 className="page-title fw-black text-green-dark mb-2">
              Hình ảnh / Video
            </h2>
            <p className="fs-5 text-green-muted mb-0">
              Quản lý minh chứng hình ảnh, video theo mục tiêu và theo tháng của{" "}
              {selectedChild.name} ({selectedChild.nickname}).
            </p>
          </div>
          <div className="col-12 col-lg-auto d-flex gap-2 flex-wrap">
            <button className="btn action-btn-soft">
              <i className="bi bi-folder2-open me-2 icon-yellow" />
              Thư viện
            </button>
            <button className="btn action-btn-primary">
              <i className="bi bi-cloud-arrow-up-fill me-2" />
              Tải lên
            </button>
          </div>
        </div>

        {/* <div className="row g-3 g-xl-4 mb-4">
          {stats.map((stat) => (
            <div className="col-12 col-sm-6 col-xl-3" key={stat.title}>
              <StatCard stat={stat} />
            </div>
          ))}
        </div> */}

        <div className="page-panel p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-4">
              <div className="search-box">
                <i className="bi bi-search" />
                <input
                  className="form-control search-input"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm tiêu đề, ghi chú, mục tiêu..."
                />
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-2">
              <select
                className="form-select filter-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                <option value="image">Hình ảnh</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <select
                className="form-select filter-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">Tất cả lĩnh vực</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-lg-3">
              <select
                className="form-select filter-select"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="all">Tất cả tháng</option>
                {months.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-8">
            {filteredMedia.length > 0 ? (
              <div className="row g-3 g-xl-4">
                {filteredMedia.map((item) => (
                  <div className="col-12 col-md-6" key={item.id}>
                    <MediaCard item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-media">
                <i className="bi bi-images fs-1 d-block mb-3 icon-yellow" />
                Không tìm thấy hình ảnh/video phù hợp.
              </div>
            )}
          </div>

          <div className="col-12 col-xl-4">
            <UploadPanel />
          </div>
        </div>
      </section>
    </>
  );
}
