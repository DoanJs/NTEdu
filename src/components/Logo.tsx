import { Link } from "react-router-dom";
import { FIRST_NAME, LAST_NAME } from "../constants/info";

export default function Logo({ type }: { type: string }) {
  const authPage = ["login", "register", "forgotpassword"].includes(type);
  const whitePage = ["children"].includes(type);

  return (
    <Link
      to="/"
      className={`logo-wrapper text-decoration-none d-flex align-items-center ${authPage || whitePage ? "gap-3" : ""}`}
    >
      <div className="brand-logo overflow-hidden">
        <img
          src="/NSXEdu-icon-512x512.png"
          alt="Ngôi Sao Xanh"
          className="logo-img"
        />
      </div>

      <div className="">
        <h5
          className={`logo-name ${authPage ? "logo-name-auth" : whitePage ? "logo-name-white" : "logo-name-small"}`}
        >
          {FIRST_NAME}
        </h5>
        <h5
          className={`logo-name ${authPage ? "logo-name-auth" : whitePage ? "logo-name-white" : "logo-name-small"}`}
        >
          {LAST_NAME}
        </h5>
      </div>
    </Link>
  );
}
