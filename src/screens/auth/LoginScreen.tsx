import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { Logo } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { validateEmail } from "../../constants/validateEmailPhone";
import { auth } from "../../firebase.config";
import "./auth.css";
import { Link } from "react-router-dom";

export default function LoginBootstrapGreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("teacher");
  const [remember, setRemember] = useState(true);
  const [disable, setDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (form.email && validateEmail(form.email) && form.password) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [form]);

  const handleLogin = async (e: any) => {
     e.preventDefault();
    setIsLoading(true);
    await signInWithEmailAndPassword(auth, form.email, form.password)
      .then(async (userCredential) => {
        // Signed in
        setIsLoading(false);
        // const user = userCredential.user;
        // if (remember) {
        //   await localforage.setItem("user", user.email as string);
        // }
        handleToastSuccess(
          `Xin chào cô ${userCredential.user.displayName} đã đăng nhập thành công !`,
        );
      })
      .catch(() => {
        handleToastError("Đăng nhập thất bại, tài khoản không chính xác !");
        setIsLoading(false);
      });
  };

  return (
    <>
      <main className="login-shell">
        <section className="login-panel">
          <div className="login-visual">
            <div className="visual-content">
              <div className="align-items-center gap-3 mb-5">
                <Logo type="login" />
                {/* <div> */}
                {/* <div className="fw-black fs-5">{CENTER_NAME}</div> */}
                <div className="small opacity-75 fw-semibold mt-2">
                  Hệ thống quản lý can thiệp cá nhân hóa
                  {/* </div> */}
                </div>
              </div>

              <h1 className="visual-title mb-3">
                Đồng hành cùng từng tiến bộ nhỏ của trẻ
              </h1>
              <p className="visual-subtitle mb-0">
                Quản lý hồ sơ, mục tiêu, kế hoạch tháng, báo cáo tiến độ và minh
                chứng hình ảnh/video trong một hệ thống thống nhất.
              </p>
            </div>

            <div className="visual-bottom">
              <div className="feature-row">
                <div className="feature-card d-flex flex-column">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="feature-icon me-2">
                      <i className="bi bi-person-vcard-fill" />
                    </div>
                    <div className="feature-title">Hồ sơ trẻ</div>
                  </div>
                  <div className="feature-text">
                    Theo dõi thông tin và tiến trình can thiệp.
                  </div>
                </div>

                <div className="feature-card d-flex flex-column">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="feature-icon  me-2">
                      <i className="bi bi-calendar2-week-fill" />
                    </div>
                    <div className="feature-title">Kế hoạch tháng</div>
                  </div>
                  <div className="feature-text">
                    Tạo, duyệt và thực hiện kế hoạch rõ ràng.
                  </div>
                </div>
                <div className="feature-card d-flex flex-column">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="feature-icon me-2">
                      <i className="bi bi-clipboard2-data-fill" />
                    </div>
                    <div className="feature-title">Báo cáo</div>
                  </div>
                  <div className="feature-text">
                    Đánh giá mục tiêu, lưu minh chứng tiến bộ.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="login-form-side">
            <div className="login-card">
              <div className="mobile-brand align-items-center gap-3 mb-4">
                <Logo type="login" />
              </div>

              <div className="mb-4">
                <div
                  className="badge rounded-pill px-3 py-2 mb-3"
                  style={{
                    background: "var(--green-100)",
                    color: "var(--green-800)",
                  }}
                >
                  <i className="bi bi-shield-check me-2" />
                  Đăng nhập bảo mật
                </div>
                <h2 className="login-title display-6 mb-2">
                  Chào mừng trở lại
                </h2>
                <p className="login-desc mb-0">
                  Vui lòng đăng nhập để tiếp tục quản lý hồ sơ và kế hoạch can
                  thiệp của trẻ.
                </p>
              </div>

              <div className="role-tabs mb-4">
                <button
                  type="button"
                  className={`role-btn ${role === "teacher" ? "active" : ""}`}
                  onClick={() => setRole("teacher")}
                >
                  <i className="bi bi-person-heart me-2" />
                  Giáo viên
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === "admin" ? "active" : ""}`}
                  onClick={() => setRole("admin")}
                >
                  <i className="bi bi-person-gear me-2" />
                  Quản lý
                </button>
              </div>

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="field-label">Tài khoản</label>
                  <div className="input-wrap">
                    <i className="bi bi-person-fill input-icon" />
                    <input
                      className="form-control login-input"
                      placeholder="Nhập email đăng nhập"
                      autoComplete="username"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="field-label">Mật khẩu</label>
                  <div className="input-wrap">
                    <i className="bi bi-lock-fill input-icon" />
                    <input
                      className="form-control login-input pe-5"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Ẩn hiện mật khẩu"
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}
                      />
                    </button>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <label className="d-flex align-items-center gap-2 small fw-bold text-green-muted mb-0">
                    <input
                      className="remember-check"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <Link to="/forgotpassword" className="link-green small text-decoration-none">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  disabled={disable}
                  type="submit"
                  className="btn login-btn w-100 mb-3"
                  onClick={(e) => handleLogin(e)}
                >
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Đăng nhập
                </button>

                {/* <button type="button" className="btn quick-login w-100 mb-4">
                  <i className="bi bi-google me-2" />
                  Đăng nhập nhanh bằng Google
                </button> */}
              </form>

              <div className="help-card d-flex gap-3 align-items-start">
                <div className="help-icon">
                  <i className="bi bi-headset" />
                </div>
                <div>
                  <div className="fw-black text-green-dark">
                    Cần hỗ trợ đăng nhập?
                  </div>
                  <div className="small text-green-muted fw-semibold">
                    Liên hệ quản trị công ty để được cấp lại tài khoản hoặc
                    đổi mật khẩu.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LoadingOverlay show={isLoading} />
    </>
  );
}
