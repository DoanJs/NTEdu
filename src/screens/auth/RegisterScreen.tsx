import { httpsCallable } from "firebase/functions";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { functions } from "../../firebase.config";
import "./register.css";

export default function RegisterBootstrapGreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("teacher");
  const [agree, setAgree] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isFormValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    agree;

  // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!isFormValid) return;

  //   setIsLoading(true);

  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(
  //       auth,
  //       form.email.trim(),
  //       form.password,
  //     );

  //     const user = userCredential.user;

  //     await updateProfile(user, {
  //       displayName: form.fullName.trim(),
  //     });

  //     await setDoc(doc(db, "users", user.uid), {
  //       id: user.uid,

  //       avatar: "",
  //       birth: serverTimestamp(),
  //       createAt: serverTimestamp(),
  //       updateAt: serverTimestamp(),

  //       email: form.email.trim(),
  //       fullName: form.fullName.trim(),
  //       phone: form.phone?.trim() || "",

  //       position: "Chuyên viên Tâm lý",
  //       role: role || "teacher",
  //       shortName: "",
  //       telegramChatId: "",
  //     });

  //     handleToastSuccess("Đăng ký thành công!");

  //     navigate("/login");
  //   } catch (error: any) {
  //     console.error(error);

  //     if (error.code === "auth/email-already-in-use") {
  //       handleToastError("Email này đã được sử dụng");
  //     } else if (error.code === "auth/invalid-email") {
  //       handleToastError("Email không hợp lệ");
  //     } else if (error.code === "auth/weak-password") {
  //       handleToastError("Mật khẩu quá yếu");
  //     } else {
  //       handleToastError("Đăng ký thất bại, vui lòng thử lại");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const createStaffAccount = httpsCallable(functions, "createStaffAccount");

      await createStaffAccount({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone?.trim() || "",
        role: role || "teacher",
        position: "Chuyên viên Tâm lý",
      });

      handleToastSuccess("Đăng ký tài khoản thành công!");

      navigate("/");
    } catch (error: any) {
      console.error(error);

      const code = error.code;

      if (code === "functions/already-exists") {
        handleToastError("Email này đã được sử dụng");
      } else if (code === "functions/invalid-argument") {
        handleToastError(error.message || "Thông tin không hợp lệ");
      } else if (code === "functions/permission-denied") {
        handleToastError("Bạn không có quyền tạo tài khoản");
      } else if (code === "functions/unauthenticated") {
        handleToastError("Bạn chưa đăng nhập");
      } else {
        handleToastError("Đăng ký thất bại, vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-visual">
            <div className="visual-content">
              <div className="align-items-center gap-3 mb-5">
                <Logo type="register" />
                {/* <div> */}
                {/* <div className="fw-black fs-5">{CENTER_NAME}</div> */}
                <div className="small opacity-75 fw-semibold mt-2">
                  Tạo tài khoản hệ thống can thiệp
                </div>
                {/* </div> */}
              </div>

              <h1 className="visual-title mb-3">
                Bắt đầu quản lý can thiệp một cách chuyên nghiệp
              </h1>
              <p className="visual-subtitle mb-0">
                Tạo tài khoản để quản lý hồ sơ trẻ, mục tiêu, kế hoạch tháng,
                báo cáo tiến độ và minh chứng can thiệp trong cùng một hệ thống.
              </p>
            </div>

            <div className="visual-bottom">
              <div className="feature-list">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check" />
                  </div>
                  <div>
                    <div className="feature-title">Phân quyền rõ ràng</div>
                    <div className="feature-text">
                      Tài khoản giáo viên và quản lý có quyền thao tác phù hợp.
                    </div>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-clipboard2-check-fill" />
                  </div>
                  <div>
                    <div className="feature-title">
                      Quy trình duyệt minh bạch
                    </div>
                    <div className="feature-text">
                      Kế hoạch và báo cáo được gửi duyệt trước khi hoàn tất.
                    </div>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-graph-up-arrow" />
                  </div>
                  <div>
                    <div className="feature-title">Theo dõi tiến bộ</div>
                    <div className="feature-text">
                      Dễ dàng xem lịch sử can thiệp và kết quả theo tháng.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-card">
              <div className="mobile-brand align-items-center gap-3 mb-4">
                <Logo type="register" />
              </div>

              <div className="mb-4">
                <div
                  className="badge rounded-pill px-3 py-2 mb-3"
                  style={{
                    background: "var(--green-100)",
                    color: "var(--green-800)",
                  }}
                >
                  <i className="bi bi-person-plus-fill me-2" />
                  Đăng ký tài khoản
                </div>
                <h2 className="auth-title display-6 mb-2">Tạo tài khoản mới</h2>
                <p className="auth-desc mb-0">
                  Điền thông tin bên dưới để đăng ký tài khoản sử dụng hệ thống
                  của Trung tâm.
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

              <form onSubmit={handleRegister}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="field-label">Họ và tên</label>
                    <div className="input-wrap">
                      <i className="bi bi-person-fill input-icon" />
                      <input
                        className="form-control auth-input"
                        placeholder="Nhập họ tên"
                        autoComplete="name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="field-label">Số điện thoại</label>
                    <div className="input-wrap">
                      <i className="bi bi-telephone-fill input-icon" />
                      <input
                        className="form-control auth-input"
                        placeholder="Nhập số điện thoại"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="field-label">Email</label>
                    <div className="input-wrap">
                      <i className="bi bi-envelope-fill input-icon" />
                      <input
                        className="form-control auth-input"
                        type="email"
                        placeholder="Nhập email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="field-label">Mật khẩu</label>
                    <div className="input-wrap">
                      <i className="bi bi-lock-fill input-icon" />
                      <input
                        className="form-control auth-input pe-5"
                        type={showPassword ? "text" : "password"}
                        placeholder="Tạo mật khẩu"
                        autoComplete="new-password"
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

                  <div className="col-12 col-md-6">
                    <label className="field-label">Nhập lại mật khẩu</label>
                    <div className="input-wrap">
                      <i className="bi bi-shield-lock-fill input-icon" />
                      <input
                        className="form-control auth-input pe-5"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label="Ẩn hiện mật khẩu nhập lại"
                      >
                        <i
                          className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <label className="d-flex align-items-start gap-2 small fw-bold text-green-muted mt-3 mb-4">
                  <input
                    className="agree-check mt-1"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    Tôi xác nhận thông tin đăng ký là chính xác và đồng ý sử
                    dụng tài khoản theo quy định của Trung tâm.
                  </span>
                </label>

                <button
                  onClick={handleRegister}
                  type="button"
                  className="btn submit-btn w-100 mb-3"
                  disabled={!isFormValid}
                >
                  <i className="bi bi-person-plus-fill me-2" />
                  Tạo tài khoản
                </button>

                {/* <button type="button" className="btn quick-login w-100 mb-4">
                  <i className="bi bi-google me-2" />Đăng ký nhanh bằng Google
                </button> */}
              </form>

              <div className="login-back-card d-flex gap-3 align-items-center justify-content-between flex-wrap">
                <div className="d-flex gap-3 align-items-center">
                  <div className="login-back-icon">
                    <i className="bi bi-box-arrow-in-right" />
                  </div>
                  <div>
                    <div className="fw-black text-green-dark">
                      Đã có tài khoản?
                    </div>
                    <div className="small text-green-muted fw-semibold">
                      Quay về đăng nhập để tiếp tục sử dụng hệ thống.
                    </div>
                  </div>
                </div>
                <Link to="/login" className="link-green text-decoration-none">
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LoadingOverlay show={isLoading} />
    </>
  );
}
