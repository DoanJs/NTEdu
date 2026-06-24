import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { validateEmail } from "../../constants/validateEmailPhone";
import { auth } from "../../firebase.config";
import "./forgotpassword.css";

export default function ForgotPasswordBootstrapGreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendReset = () => {
    if (!email.trim()) return;
    setLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setSent(true);
        handleToastSuccess("Đã gửi email khôi phục mật khẩu!");
      })
      .catch((error) => {
        console.error(error);

        if (error.code === "auth/user-not-found") {
          handleToastError("Email chưa đăng ký");
        } else if (error.code === "auth/invalid-email") {
          handleToastError("Email không hợp lệ");
        } else {
          handleToastError("Có lỗi xảy ra, thử lại sau");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="auth-visual">
            <div className="visual-content">
              <div className="align-items-center gap-3 mb-5">
                <Logo type="forgotpassword" />
                {/* <div> */}
                <div className="small opacity-75 fw-semibold mt-2">
                  Khôi phục tài khoản
                </div>
                {/* </div> */}
              </div>

              <h1 className="visual-title mb-3">
                Khôi phục mật khẩu nhanh chóng
              </h1>
              <p className="visual-subtitle mb-0">
                Nhập email đã đăng ký, hệ thống sẽ gửi liên kết đặt lại mật khẩu
                để bạn tiếp tục sử dụng.
              </p>
            </div>

            <div className="visual-bottom">
              <div className="feature-list">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-shield-lock-fill" />
                  </div>
                  <div>
                    <div className="feature-title">Bảo mật cao</div>
                    <div className="feature-text">
                      Link reset chỉ gửi tới email đã đăng ký trong hệ thống.
                    </div>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-envelope-check-fill" />
                  </div>
                  <div>
                    <div className="feature-title">Xác nhận qua email</div>
                    <div className="feature-text">
                      Hướng dẫn đặt lại mật khẩu được gửi trực tiếp đến hộp thư.
                    </div>
                  </div>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="bi bi-clock-history" />
                  </div>
                  <div>
                    <div className="feature-title">Thao tác nhanh</div>
                    <div className="feature-text">
                      Quá trình gửi yêu cầu reset chỉ mất vài giây.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-card">
              <div className="mobile-brand align-items-center gap-3 mb-4">
                <Logo type="forgotpassword" />
                {/* <div className="fw-black text-green-dark lh-sm">
                  {CENTER_NAME}
                </div> */}
              </div>

              <div className="mb-4">
                <div
                  className="badge rounded-pill px-3 py-2 mb-3"
                  style={{
                    background: "var(--green-100)",
                    color: "var(--green-800)",
                  }}
                >
                  <i className="bi bi-key-fill me-2" />
                  Quên mật khẩu
                </div>
                <h2 className="auth-title display-6 mb-2">
                  Khôi phục mật khẩu
                </h2>
                <p className="auth-desc mb-0">
                  Nhập email đã đăng ký tài khoản. Ngôi Sao Xanh sẽ gửi liên kết
                  đặt lại mật khẩu qua email.
                </p>
              </div>

              {!sent ? (
                <>
                  <div className="mb-4">
                    <label className="field-label">Email</label>
                    <div className="input-wrap">
                      <i className="bi bi-envelope-fill input-icon" />
                      <input
                        type="email"
                        className="form-control auth-input"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn submit-btn w-100 mb-4"
                    disabled={!validateEmail(email) || loading}
                    onClick={handleSendReset}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Đang gửi liên kết...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2" />
                        Gửi link đặt lại mật khẩu
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="success-card mb-4">
                  <div className="success-icon">
                    <i className="bi bi-check-circle-fill" />
                  </div>
                  <h5 className="fw-black text-green-dark mb-2">
                    Đã gửi email
                  </h5>
                  <div className="text-green-muted fw-semibold small">
                    Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để
                    đặt lại mật khẩu.
                  </div>
                  <button
                    type="button"
                    className="btn submit-btn w-100 mt-3"
                    onClick={() => setSent(false)}
                  >
                    <i className="bi bi-arrow-repeat me-2" />
                    Gửi lại email
                  </button>
                </div>
              )}

              <div className="login-back-card d-flex gap-3 align-items-center justify-content-between flex-wrap">
                <div className="d-flex gap-3 align-items-center">
                  <div className="login-back-icon">
                    <i className="bi bi-box-arrow-in-right" />
                  </div>
                  <div>
                    <div className="fw-black text-green-dark">
                      Đã nhớ mật khẩu?
                    </div>
                    <div className="small text-green-muted fw-semibold">
                      Quay lại đăng nhập để tiếp tục sử dụng hệ thống.
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

      <LoadingOverlay show={loading} />
    </>
  );
}

// import React, { useState } from "react";
// import { getAuth, sendPasswordResetEmail } from "firebase/auth";
// import "./forgotpassword.css";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sent, setSent] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setSent(false);

//     if (!email.trim()) {
//       setError("Vui lòng nhập email đã đăng ký.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const auth = getAuth();

//       await sendPasswordResetEmail(auth, email.trim(), {
//         url: `${window.location.origin}/login`,
//         handleCodeInApp: false,
//       });

//       setSent(true);
//     } catch (err: any) {
//       if (err.code === "auth/user-not-found") {
//         setError("Email này chưa được đăng ký trong hệ thống.");
//       } else if (err.code === "auth/invalid-email") {
//         setError("Email không hợp lệ.");
//       } else {
//         setError("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="forgot-page">
//       <section className="forgot-card row g-0">
//         {/* LEFT */}
//         <div className="col-12 col-lg-6 forgot-left">
//           <div className="brand-box d-flex align-items-center gap-3 mb-5">
//             <div className="brand-logo">
//               <i className="bi bi-shield-lock-fill"></i>
//             </div>

//             <div>
//               <h5 className="text-white fw-bold mb-1">
//                 TRUNG TÂM GIÁO DỤC HÒA NHẬP
//                 <br />
//                 VÀ CAN THIỆP SỚM QUẢNG XƯƠNG
//               </h5>
//               <p className="text-white-50 mb-0">
//                 Khôi phục quyền truy cập tài khoản
//               </p>
//             </div>
//           </div>

//           <h1 className="forgot-hero-title">
//             Lấy lại mật khẩu
//             <br />
//             một cách an toàn
//           </h1>

//           <p className="forgot-hero-desc">
//             Nhập email đã đăng ký, hệ thống sẽ gửi liên kết đặt lại mật khẩu
//             đến hộp thư của bạn.
//           </p>

//           <div className="forgot-info-box">
//             <div className="info-icon">
//               <i className="bi bi-envelope-check"></i>
//             </div>
//             <div>
//               <h6 className="fw-bold text-white mb-1">Kiểm tra email</h6>
//               <p className="mb-0 text-white-75">
//                 Liên kết đặt lại mật khẩu chỉ có hiệu lực trong thời gian giới hạn.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="col-12 col-lg-6 forgot-right">
//           <div className="forgot-badge">
//             <i className="bi bi-key-fill me-2"></i>
//             Quên mật khẩu
//           </div>

//           <h2 className="forgot-title">Đặt lại mật khẩu</h2>

//           <p className="forgot-subtitle">
//             Vui lòng nhập email đã đăng ký để nhận link đặt lại mật khẩu.
//           </p>

//           <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//               <label className="form-label fw-bold text-green-dark">
//                 Email
//               </label>

//               <div className="input-group forgot-input">
//                 <span className="input-group-text">
//                   <i className="bi bi-envelope-fill"></i>
//                 </span>

//                 <input
//                   type="email"
//                   className="form-control"
//                   placeholder="Nhập email đã đăng ký"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {error && (
//               <div className="alert alert-danger py-2 small fw-semibold">
//                 {error}
//               </div>
//             )}

//             {sent && (
//               <div className="alert alert-success py-2 small fw-semibold">
//                 Đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra email của bạn.
//               </div>
//             )}

//             <button
//               type="submit"
//               className="btn forgot-submit w-100"
//               disabled={loading}
//             >
//               <i className="bi bi-send-fill me-2"></i>
//               {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
//             </button>
//           </form>

//           <div className="forgot-footer">
//             <div>
//               <strong>Nhớ mật khẩu?</strong>
//               <p className="mb-0">Quay lại đăng nhập để tiếp tục sử dụng.</p>
//             </div>

//             <a href="/login" className="forgot-login-link">
//               Đăng nhập
//             </a>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
