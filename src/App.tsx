import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "./components";
import { handleToastWarn } from "./constants/handleToast";
import { ADMINID } from "./constants/info";
import { auth, db } from "./firebase.config";
import AdminScreen from "./screens/admin/AdminScreen";
import ForgotPasswordBootstrapGreen from "./screens/auth/ForgotPasswordScreen";
import LoginBootstrapGreen from "./screens/auth/LoginScreen";
import RegisterBootstrapGreen from "./screens/auth/RegisterScreen";
import GoalBankBootstrapGreen from "./screens/bank/Bank";
import GoalCartBootstrapGreen from "./screens/cart/Cart";
import HomeStudentsBootstrapGreen from "./screens/children/ChildrenScreen";
import ChangePassword from "./screens/dashboard/ChangePassword";
import DashboardBootstrapGreen from "./screens/dashboard/DashBoard";
import PendingApprovalBootstrapGreen from "./screens/pending/Pendings";
import PlanDetailBootstrapGreen from "./screens/plan/PlanDetails";
import ApprovedPlansBootstrapGreen from "./screens/plan/Plans";
import AddReportBootstrapGreen from "./screens/report/AddReport";
import ReportDetailBootstrapGreen from "./screens/report/ReportDetails";
import ApprovedReportBootstrapGreen from "./screens/report/Reports";
import ScrollButtons from "./screens/scroll/ScrollButtons";
import SplashScreen from "./screens/splash/SplashScreen";
import { useUserStore } from "./zustand";
import UserSettingPage from "./screens/setting/Setting";
import { usePresence } from "./hooks/usePresence";

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

export default function App() {
  usePresence();
  
  // const { setUser } = useUserStore();
  // const [authState, setAuthState] = useState<AuthState>({
  //   user: null,
  //   isLoading: true,
  // });

  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, (currentUser) => {
  //     setAuthState({ user: currentUser, isLoading: false });

  //     if (currentUser) {
  //       // chỉ fetch khi có user
  //       try {
  //         getDoc(doc(db, "users", currentUser.uid as string))
  //           .then(async (result) => {
  //             setUser({ ...result.data(), id: currentUser.uid } as UserModel);
  //           })
  //           .catch(async () => {
  //             await signOut(auth);
  //             handleToastWarn(
  //               "Tài khoản chưa được cấp quyền, vui lòng liên hệ admin !",
  //             );
  //           });
  //       } catch (error) {
  //         console.log("error: ", error);
  //       }
  //     } else {
  //       // clear user khi logout
  //       setUser(null);
  //     }
  //   });
  //   return () => unsub();
  // }, [setUser]);

  // if (authState.isLoading) {
  //   return <SpinnerComponent />;
  // }

  const { setUser } = useUserStore();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  const [progress, setProgress] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  // Progress 0 -> 90% trong 3 giây
  useEffect(() => {
    if (authReady) return;

    const duration = 1200;
    const maxProgress = 99;
    const intervalTime = 16;

    const step = maxProgress / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= maxProgress) return maxProgress;
        return Math.min(prev + step, maxProgress);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [authReady]);

  // Check auth + load user profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);

          const result = await getDoc(userRef);

          if (!result.exists()) {
            await signOut(auth);

            handleToastWarn(
              "Tài khoản chưa được cấp quyền, vui lòng liên hệ admin!",
            );

            setUser(null);

            setAuthState({
              user: null,
              isLoading: false,
            });

            return;
          }

          setUser({
            ...result.data(),
            id: currentUser.uid,
          } as any);

          setAuthState({
            user: currentUser,
            isLoading: false,
          });
        } else {
          setUser(null);

          setAuthState({
            user: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Auth error:", error);

        setUser(null);

        setAuthState({
          user: null,
          isLoading: false,
        });
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsub();
  }, [setUser]);

  // Khi auth xong => lên 100% rồi vào app
  useEffect(() => {
    if (!authReady) return;

    setProgress(100);

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [authReady]);

  if (showSplash || authState.isLoading) {
    return <SplashScreen progress={Math.round(progress)} centerName="" />;
  }

  return (
    <div>
      <ScrollButtons />

      <Routes>
        <Route
          path="/login"
          element={
            authState.user ? (
              <Navigate to="/" replace />
            ) : (
              <LoginBootstrapGreen />
            )
          }
        />
        <Route
          path="/"
          element={
            authState.user ? (
              <HomeStudentsBootstrapGreen />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="home/:id" element={<DashboardBootstrapGreen />}>
          {/* <Route path="general" element={<GeneralBootstrapGreen />} />
          <Route
            path="child-profile"
            element={<ChildProfileBootstrapGreen />}
          /> */}
          <Route path="bank" element={<GoalBankBootstrapGreen />} />
          <Route path="plan" element={<ApprovedPlansBootstrapGreen />} />
          <Route path="plandetail" element={<PlanDetailBootstrapGreen />} />
          <Route path="report" element={<ApprovedReportBootstrapGreen />} />
          <Route path="reportdetail" element={<ReportDetailBootstrapGreen />} />
          <Route path="addreport" element={<AddReportBootstrapGreen />} />
          <Route path="pending" element={<PendingApprovalBootstrapGreen />} />
          {/* <Route path="media" element={<MediaLibraryBootstrapGreen />} /> */}
          <Route path="cart" element={<GoalCartBootstrapGreen />} />
          {/* <Route path="setting" element={<Setting />} /> */}
          <Route path="changepassword" element={<ChangePassword />} />
          <Route path="setting" element={<UserSettingPage />} />
          <Route
            path="admin"
            element={
              authState.user && [ADMINID].includes(authState.user.uid) ? (
                <AdminScreen />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Route>
        <Route
          path="register"
          element={
            authState.user && [ADMINID].includes(authState.user.uid) ? (
              <RegisterBootstrapGreen />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="forgotPassword"
          element={<ForgotPasswordBootstrapGreen />}
        />

        <Route path="*" element={<>404</>} />
      </Routes>

      <ToastContainer />
    </div>
  );
}
