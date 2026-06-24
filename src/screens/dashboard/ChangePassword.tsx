import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useState } from "react";
import {
  handleToastSuccess,
  handleToastError,
} from "../../constants/handleToast";
import { auth } from "../../firebase.config";
import LoadingOverlay from "../../components/LoadingOverLay";

export default function ChangePasswordScreen() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isDisabled =
    !form.currentPassword.trim() ||
    !form.newPassword.trim() ||
    !form.confirmPassword.trim();

  const validateForm = () => {
    const errors: string[] = [];

    if (!form.currentPassword.trim()) {
      errors.push("Vui lòng nhập mật khẩu hiện tại.");
    }

    if (!form.newPassword.trim()) {
      errors.push("Vui lòng nhập mật khẩu mới.");
    }

    if (!form.confirmPassword.trim()) {
      errors.push("Vui lòng xác nhận mật khẩu mới.");
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        message: errors[0],
      };
    }

    if (form.currentPassword.length < 6) {
      return {
        isValid: false,
        message: "Mật khẩu hiện tại không hợp lệ.",
      };
    }

    if (form.newPassword.length < 8) {
      return {
        isValid: false,
        message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
      };
    }

    const hasLetter = /[A-Za-z]/.test(form.newPassword);
    const hasNumber = /\d/.test(form.newPassword);

    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        message: "Mật khẩu mới phải chứa cả chữ và số.",
      };
    }

    if (form.newPassword === form.currentPassword) {
      return {
        isValid: false,
        message: "Mật khẩu mới không được trùng mật khẩu hiện tại.",
      };
    }

    if (form.newPassword !== form.confirmPassword) {
      return {
        isValid: false,
        message: "Xác nhận mật khẩu không khớp.",
      };
    }

    return {
      isValid: true,
      message: "",
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();

    if (!validation.isValid) {
      handleToastError(validation.message);
      return;
    }

    // const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !user.email) {
      alert("Không tìm thấy người dùng");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tạo credential từ mật khẩu hiện tại
      const credential = EmailAuthProvider.credential(
        user.email,
        form.currentPassword,
      );

      // 2. Re-authenticate
      await reauthenticateWithCredential(user, credential);

      // 3. Update password
      await updatePassword(user, form.newPassword);

      handleToastSuccess("Đổi mật khẩu thành công!");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/wrong-password") {
        handleToastError("Mật khẩu hiện tại không đúng");
      } else if (error.code === "auth/weak-password") {
        handleToastError("Mật khẩu mới quá yếu");
      } else {
        handleToastError("Có lỗi xảy ra, thử lại sau");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <section className="page-head">
        <h1>Đổi mật khẩu</h1>
        <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
      </section>

      <section className="password-layout">
        <form className="password-card" onSubmit={handleSubmit}>
          <PasswordInput
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            label="Mật khẩu hiện tại"
            icon="bi-lock-fill"
            placeholder="Nhập mật khẩu hiện tại"
            show={showOld}
            onToggle={() => setShowOld(!showOld)}
          />

          <PasswordInput
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            label="Mật khẩu mới"
            icon="bi-shield-lock-fill"
            placeholder="Nhập mật khẩu mới"
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            hint="Ít nhất 8 ký tự, có chữ và số"
          />

          <PasswordInput
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            label="Xác nhận mật khẩu mới"
            icon="bi-check-circle-fill"
            placeholder="Nhập lại mật khẩu mới"
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          <div className="actions-change-password">
            <button type="button" className="cancel-btn">
              Hủy
            </button>

            <button type="submit" className="submit-btn" disabled={isDisabled}>
              <i className="bi bi-shield-check"></i>
              Cập nhật mật khẩu
            </button>
          </div>
        </form>

        <aside className="security-card">
          <div className="security-icon">
            <i className="bi bi-shield-lock-fill"></i>
          </div>

          <h3>Bảo mật tài khoản</h3>
          <p>
            Nên đổi mật khẩu định kỳ và không chia sẻ tài khoản cho người khác.
          </p>

          <ul>
            <li>Ít nhất 8 ký tự</li>
            <li>Có chữ và số</li>
            <li>Không dùng lại mật khẩu cũ</li>
          </ul>
        </aside>
      </section>

      
      <LoadingOverlay show={isLoading} />
    </>
  );
}

function PasswordInput({
  label,
  icon,
  placeholder,
  show,
  onToggle,
  hint,
  name,
  value,
  onChange,
}: any) {
  return (
    <div className="field">
      <label>{label}</label>

      <div className="input-box">
        <i className={`bi ${icon}`}></i>
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={show ? "text" : "password"}
          placeholder={placeholder}
        />

        <button type="button" onClick={onToggle}>
          <i className={`bi ${show ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
        </button>
      </div>

      {hint && <small>{hint}</small>}
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
  --line: #d8e7db;
  --text: #073f0c;
  --muted: #527d57;
  --radius-md: 14px;
  --radius-xl: 24px;
  --shadow: 0 12px 28px rgba(5, 107, 16, 0.08);
}

* {
  box-sizing: border-box;
}

.page-head {
  padding: 28px 0 18px;
}

.page-head h1 {
  margin: 0;
  color: var(--green-deep);
  font-size: 36px;
  font-weight: 950;
}

.page-head p {
  margin: 8px 0 0;
  color: var(--muted);
  font-weight: 650;
}

.password-layout {
  display: grid;
  grid-template-columns: minmax(420px, 640px) 340px;
  gap: 24px;
  align-items: start;
}

.password-card,
.security-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
}

.password-card {
  padding: 26px;
}

.security-card {
  padding: 24px;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin-bottom: 9px;
  color: var(--green-deep);
  font-weight: 900;
}

.input-box {
  height: 50px;
  padding: 0 14px;

  display: flex;
  align-items: center;
  gap: 12px;

  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.input-box:focus-within {
  border-color: var(--green);
  box-shadow: 0 0 0 4px rgba(17, 140, 23, 0.11);
}

.input-box > i {
  color: var(--green);
}

.input-box input {
  flex: 1;
  min-width: 0;

  border: none;
  outline: none;
  background: transparent;

  color: var(--text);
  font-weight: 700;
}

.input-box input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.input-box button {
  width: 38px;
  height: 38px;

  border: none;
  border-radius: 12px;

  background: var(--green-soft);
  color: var(--green);

  display: grid;
  place-items: center;
}

.input-box button:hover {
  background: #dff7e4;
}

.field small {
  display: block;
  margin-top: 7px;
  color: var(--muted);
  font-weight: 650;
}

.actions-change-password {
  margin-top: 12px;

  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;

  width: 100%;
}

.cancel-btn,
.submit-btn {
  height: 46px;

  border-radius: 14px;
  padding: 0 20px;

  font-size: 15px;
  font-weight: 900;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  white-space: nowrap;
  flex-shrink: 0;

  transition: 0.25s ease;
}

.cancel-btn {
  min-width: 96px;

  background: var(--green-soft);
  color: var(--green);
  border: 1px solid var(--border);
}

.cancel-btn:hover {
  background: var(--green-soft);
}

.submit-btn {
  min-width: 190px;

  border: none;
  color: white;

  background: linear-gradient(
    135deg,
    var(--green),
    var(--green-dark)
  );
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(17, 140, 23, 0.22);
}

.submit-btn:disabled {
  background: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

.security-icon {
  width: 64px;
  height: 64px;

  display: grid;
  place-items: center;

  border-radius: 20px;

  background: #dff7e4;
  color: var(--green);

  font-size: 28px;
}

.security-card h3 {
  margin: 18px 0 8px;
  color: var(--green-deep);
  font-weight: 900;
}

.security-card p,
.security-card li {
  color: var(--muted);
  font-weight: 650;
}

.security-card ul {
  margin-bottom: 0;
  padding-left: 18px;
}

/* RESPONSIVE */

@media (max-width: 992px) {
  .password-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .page-head {
    padding: 20px 0 14px;
  }

  .page-head h1 {
    font-size: 30px;
  }

  .password-card,
  .security-card {
    padding: 20px;
    border-radius: 22px;
  }

   .actions-change-password {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    min-width: 0;
  }
}
`;
