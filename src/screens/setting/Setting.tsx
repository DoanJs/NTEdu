import { useState } from "react";
import { SpinnerComponent } from "../../components";
import { useChildStore, useUserStore } from "../../zustand";
import { uploadTeacherAvatar } from "../../constants/uploadAvatar";
import LoadingOverlay from "../../components/LoadingOverLay";
import { handleToastError, handleToastSuccess } from "../../constants/handleToast";
import { updateDocData } from "../../constants/firebase/updateDocData";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, rtdb } from "../../firebase.config";
import { indexedDBName } from "../../constants/info";
import { ref, remove, set } from "firebase/database";

export default function UserSettingPage() {
  const { user, setUser } = useUserStore()
  const { child } = useChildStore();
  const [showUpdate, setShowUpdate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || "");


  const hasChanged =
    fullName.trim() !== (user?.fullName || "").trim() ||
    phone.trim() !== (user?.phone || "").trim() ||
    avatarFile !== null;


  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setPreviewUrl(previewUrl);
  };

  const handleUpdateInfo = async () => {
    if (!user) return;

    setShowUpdate(false);
    setIsLoading(true);

    try {
      setIsLoading(true);

      // Upload avatar nếu có ảnh mới
      if (avatarFile) {
        const result = await uploadTeacherAvatar(
          avatarFile,
          user.id
        );

        setUser((prev) =>
          prev
            ? {
              ...prev,
              avatar: result.avatar
            }
            : null
        );
      }

      // Chỉ update profile khi có thay đổi
      if (
        fullName !== user.fullName ||
        phone !== user.phone
      ) {

        await updateDocData({
          nameCollect: 'users',
          id: user.id,
          valueUpdate: { ...user, fullName, phone },
          metaDoc: 'users'
        })

        setUser((prev) =>
          prev
            ? {
              ...prev,
              fullName,
              phone
            }
            : null
        );
      }

      setAvatarFile(null);

      handleToastSuccess("Cập nhật thông tin thành công");
    } catch (error: any) {
      handleToastError('Cập nhật thông tin thất bại');
    } finally {
      setIsLoading(false);
    }
  }
 const clearIndexedDB = () => {
    return new Promise((resolve: any, reject) => {
      const request = indexedDB.deleteDatabase(indexedDBName);

      request.onsuccess = () => {
        console.log("IndexedDB deleted");
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error deleting IndexedDB", event);
        reject();
      };

      request.onblocked = () => {
        console.warn("Delete blocked (close other tabs)");
      };
    });
  };
  const handleLogout = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await set(ref(rtdb, `status/${uid}`), {
        online: false,
        lastSeen: Date.now(),
      });
      await remove(ref(rtdb, `viewingChildren/${child?.id}/${uid}`));
    }
    setIsLoading(true);

    try {
      await signOut(auth);

      // ✅ clear cache IndexedDB
      await clearIndexedDB();

      handleToastSuccess("Đăng xuất tài khoản thành công !");
      navigate("/login", { replace: true });
    } catch (error) {
      handleToastError("Đăng xuất tài khoản thất bại !");
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <SpinnerComponent />
  return (
    <>
      <style>{css}</style>

      <section className="setting-layout">
        <div className="profile-panel">
          <div className="avatar-box">
            <img src={previewUrl} alt="avatar" />

            <label className="upload-btn">
              Thay ảnh đại diện
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />
            </label>
          </div>

          <h2>{user.fullName}</h2>
          <p>{user.email}</p>

          <div className="role-badge">{user.position}</div>

          <div className="quick-info">
            <div>
              <span>Trạng thái</span>
              <strong>Đang hoạt động</strong>
            </div>
            <div>
              <span>Quyền tài khoản</span>
              <strong>{user.role}</strong>
            </div>
          </div>
        </div>

        <div className="form-panel">
          <div className="section-heading">
            <div>
              <h2>Thông tin người dùng</h2>
              <p>Cập nhật các thông tin hiển thị trên hệ thống.</p>
            </div>
            {/* <button className="save-top-btn">Lưu thay đổi</button> */}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Chức vụ</label>
              <input
                disabled={true}
                value={user.position}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                disabled={true}
                value={user.email}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* <div className="form-group">
              <label>Giới tính</label>
              <select
                value={`user.gender`}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div> */}

            {/* <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                value={user.birth}
                onChange={(e) => handleChange("birthday", e.target.value)}
              />
            </div> */}

            {/* <div className="form-group full">
              <label>Địa chỉ</label>
              <input
                value={`user.address`}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div> */}
          </div>

          <div className="account-box">
            <h3>Bảo mật tài khoản</h3>
            <p>
              Bạn có thể đổi mật khẩu hoặc kiểm tra trạng thái đăng nhập của tài
              khoản.
            </p>

            <div className="security-row">
              <Link className="outline-btn btn d-flex align-items-center justify-content-center"
                to="../changepassword"
              >Đổi mật khẩu</Link>
              <button onClick={handleLogout} className="danger-btn">Đăng xuất</button>
            </div>
          </div>

          <div className="action-row">
            <button className="cancel-btn">Hủy</button>
            <button disabled={!hasChanged} className="submit-btn" onClick={() => setShowUpdate(true)}>Cập nhật thông tin</button>
          </div>
        </div>
      </section>

      {showUpdate && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            {/* Title */}
            <h5 className="fw-black text-danger mb-2">Xác nhận cập nhật thông tin</h5>

            {/* Description */}
            <p className="text-green-muted small">
              Hành động này sẽ cập nhật lại những thay đổi về thông tin cá nhân của mình. Cô chắc chắn chứ ?
            </p>

            {/* Actions */}
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowUpdate(false)}
              >
                Huỷ
              </button>

              <button
                className="btn submit-btn"
                onClick={handleUpdateInfo}
              >
                <i className="bi bi-check2-all me-2" />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay show={isLoading} />
    </>
  );
}

const css = `
:root {
    --green-950: #043b14;
    --green-900: #065f1c;
    --green-800: #08751f;
    --green-700: #0a8f25;
    --green-600: #16a34a;
    --green-100: #dcfce7;
    --green-50: #f0fdf4;
    --line: rgba(22, 163, 74, 0.22);
    --shadow: 0 16px 40px rgba(6, 95, 28, 0.12);
  }

  .setting-layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 24px;
    width: 100%;
  }

  .profile-panel,
  .form-panel {
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid var(--line);
    border-radius: 28px;
    box-shadow: var(--shadow);
  }

  .profile-panel {
    padding: 30px;
    text-align: center;
    height: fit-content;
  }

  .avatar-box {
    width: 170px;
    margin: 0 auto 20px;
  }

  .avatar-box img {
    width: 170px;
    height: 170px;
    border-radius: 34px;
    object-fit: cover;
    border: 5px solid var(--green-100);
    box-shadow: 0 14px 30px rgba(6, 95, 28, 0.18);
  }

  .upload-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    padding: 0 16px;
    margin-top: 14px;
    border-radius: 999px;
    background: var(--green-700);
    color: #fff;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    border: none;
    box-shadow: 0 10px 22px rgba(10, 143, 37, 0.24);
    transition: 0.2s ease;
  }

  .upload-btn:hover {
    background: var(--green-800);
    transform: translateY(-1px);
  }

  .profile-panel h2 {
    margin: 10px 0 6px;
    color: var(--green-950);
    font-size: 24px;
    font-weight: 950;
  }

  .profile-panel p {
    margin: 0;
    color: #4f7b57;
    font-size: 15px;
    font-weight: 700;
    word-break: break-word;
  }

  .role-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 18px;
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--green-100);
    color: var(--green-900);
    font-weight: 900;
  }

  .quick-info {
    margin-top: 28px;
    display: grid;
    gap: 14px;
  }

  .quick-info div {
    padding: 16px;
    border-radius: 20px;
    border: 1px solid var(--line);
    background: #fbfffc;
    text-align: left;
  }

  .quick-info span {
    display: block;
    margin-bottom: 6px;
    color: #6b8f72;
    font-size: 13px;
    font-weight: 700;
  }

  .quick-info strong {
    color: var(--green-950);
    font-size: 16px;
    font-weight: 900;
  }

  .form-panel {
    padding: 28px;
  }

  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .section-heading h2 {
    margin: 0;
    color: var(--green-950);
    font-size: 28px;
    font-weight: 950;
  }

  .section-heading p {
    margin: 8px 0 0;
    color: #4f7b57;
    font-weight: 700;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group.full {
    grid-column: 1 / -1;
  }

  .form-group label {
    color: var(--green-950);
    font-size: 14px;
    font-weight: 900;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    height: 56px;
    padding: 0 18px;
    border-radius: 18px;
    border: 1px solid var(--line);
    outline: none;
    background: #fff;
    color: var(--green-950);
    font-size: 15px;
    font-weight: 700;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: var(--green-600);
    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.12);
  }

  .account-box {
    margin-top: 26px;
    padding: 22px;
    border-radius: 24px;
    border: 1px solid var(--line);
    background: linear-gradient(135deg, var(--green-50), #fff);
  }

  .account-box h3 {
    margin: 0;
    color: var(--green-950);
    font-size: 22px;
    font-weight: 950;
  }

  .account-box p {
    margin: 8px 0 18px;
    color: #4f7b57;
    font-weight: 700;
  }

  .security-row,
  .action-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .action-row {
    justify-content: flex-end;
    margin-top: 28px;
  }

  .save-top-btn,
  .submit-btn,
  .outline-btn,
  .cancel-btn,
  .danger-btn {
    min-height: 48px;
    padding: 0 22px;
    border-radius: 16px;
    font-weight: 900;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .save-top-btn,
  .submit-btn {
    border: none;
    background: var(--green-700);
    color: #fff;
    box-shadow: 0 12px 24px rgba(10, 143, 37, 0.22);
  }

  .save-top-btn:hover,
  .submit-btn:hover {
    background: var(--green-800);
    transform: translateY(-1px);
  }

  .outline-btn {
    border: 1px solid var(--green-600);
    background: #fff;
    color: var(--green-800);
  }

  .cancel-btn {
    border: 1px solid var(--line);
    background: #fff;
    color: #4f7b57;
  }

  .danger-btn {
    border: none;
    background: #fee2e2;
    color: #b91c1c;
  }

  @media (max-width: 1200px) {
    .setting-layout {
      grid-template-columns: 1fr;
    }

    .profile-panel {
      display: grid;
      grid-template-columns: 220px 1fr;
      align-items: center;
      gap: 20px;
      text-align: left;
    }

    .avatar-box {
      margin: 0;
    }

    .quick-info {
      grid-column: 1 / -1;
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .setting-layout {
      gap: 18px;
    }

    .profile-panel,
    .form-panel {
      border-radius: 22px;
    }

    .profile-panel {
      display: block;
      padding: 22px;
      text-align: center;
    }

    .avatar-box {
      width: 145px;
      margin: 0 auto 18px;
    }

    .avatar-box img {
      width: 145px;
      height: 145px;
      border-radius: 28px;
    }

    .quick-info {
      grid-template-columns: 1fr;
    }

    .form-panel {
      padding: 20px;
    }

    .section-heading {
      display: block;
    }

    .section-heading h2 {
      font-size: 24px;
    }

    .save-top-btn {
      width: 100%;
      margin-top: 16px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .security-row,
    .action-row {
      flex-direction: column;
    }

    .cancel-btn,
    .submit-btn,
    .outline-btn,
    .danger-btn {
      width: 100%;
    }

    .action-row {
      flex-direction: column-reverse;
    }
  }

  @media (max-width: 480px) {
    .profile-panel,
    .form-panel {
      border-radius: 20px;
    }

    .profile-panel,
    .form-panel,
    .account-box {
      padding: 16px;
    }

    .profile-panel h2 {
      font-size: 21px;
    }

    .section-heading h2 {
      font-size: 22px;
    }

    .form-group input,
    .form-group select {
      height: 52px;
      border-radius: 16px;
    }
  }
`;
