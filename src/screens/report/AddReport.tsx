import { where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerComponent } from "../../components";
import LoadingOverlay from "../../components/LoadingOverLay";
import { convertTargetField } from "../../constants/convertTargetAndField";
import { handleTimeStampFirestore } from "../../constants/convertTimeStamp";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { groupArrayWithField } from "../../constants/groupArrayWithField";
import {
  handleToastError,
  handleToastSuccess,
  handleToastWarn,
} from "../../constants/handleToast";
import { functions } from "../../firebase.config";
import {
  PlanModel,
  PlanTaskModel,
  ReportSavedModel,
  UserModel,
} from "../../models";
import {
  useChildStore,
  useFieldStore,
  useInterventionStore,
  usePlanStore,
  useReportSavedStore,
  useReportStore,
  useSelectNavbarStore,
  useTargetStore,
  useTeacherStore,
  useUserStore,
} from "../../zustand";
import AddReportItem from "./AddReportItem";

export default function AddReportScreen() {
  const navigate = useNavigate();
  const { plans } = usePlanStore();
  const { teachers } = useTeacherStore();
  const { targets } = useTargetStore();
  const { fields } = useFieldStore();
  const { user } = useUserStore();
  const { child } = useChildStore();
  const [planTasks, setPlanTasks] = useState<PlanTaskModel[]>([]);
  const [addReports, setAddReports] = useState<any[]>([]);
  const [disable, setDisable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<PlanModel>();
  const { addReport } = useReportStore();
  const [planApprovals, setPlanApprovals] = useState<PlanModel[]>([]);
  const { setSelectNavbar } = useSelectNavbarStore();
  const { reportSaveds, removeReportSaved, addReportSaved } =
    useReportSavedStore();
  const [isReportSaved, setIsReportSaved] = useState(false);
  const [planSelected, setPlanSelected] = useState(""); //nó chỉ là planId mà thôi
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiKeywordText, setAiKeywordText] = useState("");
  const [aiSelectedReport, setAiSelectedReport] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const groupedReports = useMemo(() => {
    if (!addReports?.length) return [];

    return groupArrayWithField(
      addReports.map((item) => ({
        ...item,
        fieldId: convertTargetField(item.targetId, targets, fields).fieldId,
      })),
      "fieldId",
    );
  }, [addReports, targets, fields]);

  const fieldMap = useMemo(() => {
    const map: any = {};
    fields.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [fields]);
  const targetMap = useMemo(() => {
    const map: any = {};
    targets.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [targets]);

  useEffect(() => {
    if (plans) {
      const items = plans.filter((plan) => plan.status === "approved");
      setPlanApprovals(items);
    }
  }, [plans]);

  useEffect(() => {
    if (addReports.length > 0) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [addReports]);

  useEffect(() => {
    if (planTasks) {
      setAddReports(planTasks.map((item: any) => ({ ...item })));
    }
  }, [planTasks]);

  const handleSelectPlan = (planId: string) => {
    setPlanSelected(planId);
    if (planId !== "") {
      const index = planApprovals.findIndex((_) => _.id === planId);
      setPlan(planApprovals[index]);

      const items = reportSaveds
        .filter(
          (reportSaved: ReportSavedModel) => reportSaved.planId === planId,
        )
        .map((item: any) => ({ ...item }));
      if (items.length > 0) {
        setIsReportSaved(true);
        setPlanTasks(items);
      } else {
        setIsReportSaved(false);
        getDocsData({
          nameCollect: "planTasks",
          condition: [
            where("teacherIds", "array-contains", user?.id),
            where("planId", "==", planId),
          ],
          setData: setPlanTasks,
        });
      }
    } else {
      setPlanTasks([]);
      setDisable(true);
    }
  };

  const handleAddReport = async () => {
    if (!user || !child || !plan ) {
      handleToastWarn(
        "Thiếu dữ liệu cần thiết. Vui lòng kiểm tra lại",
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await httpsCallable<
        {
          childId: string;
          planId: string;
          addReports: any[];
          isReportSaved: boolean;
        },
        {
          success: boolean;
          reportId: string;
          created: {
            reports: number;
            reportTasks: number;
          };
          deleted: {
            reportSaveds: number;
          };
        }
      >(
        functions,
        "createReportFromPlan",
      )({
        childId: child.id,
        planId: plan.id,
        addReports,
        isReportSaved,
      });

      addReport({
        id: res.data.reportId,
        type: "BC",
        title: plan.title as string,
        childId: child.id,
        teacherIds: child.teacherIds,
        authorId: user.id,
        planId: plan.id,
        status: "pending",
        comment: "",
        updateById: user.id,
        createAt: Date.now(),
        updateAt: Date.now(),
      });

      if (isReportSaved) {
        addReports.forEach((item) => {
          if (item.id) {
            removeReportSaved(item.id);
          }
        });
      }

      setIsReportSaved(false);

      handleToastSuccess(
        `Thêm mới báo cáo thành công! Đã tạo ${res.data.created.reportTasks} mục báo cáo.`,
      );

      navigate("../pending");
      setSelectNavbar("pending");
    } catch (error: any) {
      console.error(error);

      if (error.code === "functions/permission-denied") {
        handleToastError("Bạn không có quyền tạo báo cáo");
      } else if (error.code === "functions/failed-precondition") {
        handleToastError(
          error.message || "Không thể tạo báo cáo từ kế hoạch này",
        );
      } else if (error.code === "functions/not-found") {
        handleToastError("Không tìm thấy trẻ hoặc kế hoạch");
      } else {
        handleToastError("Thêm mới báo cáo thất bại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReportSaved = async () => {
    if (!child || !plan) return;

    setIsLoading(true);

    try {
      const res = await httpsCallable<
        {
          childId: string;
          planId: string;
          addReports: any[];
          isReportSaved: boolean;
        },
        {
          success: boolean;
          saved: {
            reportSaveds: number;
          };
          deleted: {
            reportSaveds: number;
          };
          items: any[];
        }
      >(
        functions,
        "saveReportSaveds",
      )({
        childId: child.id,
        planId: plan.id,
        addReports,
        isReportSaved,
      });

      // Nếu đang lưu lại bản nháp cũ thì xoá UI cũ
      if (isReportSaved) {
        addReports.forEach((item) => {
          if (item.id) {
            removeReportSaved(item.id);
          }
        });
      }

      // Thêm UI bản nháp mới từ CF trả về
      res.data.items.forEach((item) => {
        addReportSaved({
          ...item,
          createAt: Date.now(),
          updateAt: Date.now(),
        });
      });

      setIsReportSaved(true);
      setPlan(undefined);
      setPlanSelected("");
      setPlanTasks([]);
      setDisable(true);

      handleToastSuccess(
        `Lưu nháp báo cáo thành công! Đã lưu ${res.data.saved.reportSaveds} mục.`,
      );
    } catch (error: any) {
      console.error(error);

      if (error.code === "functions/permission-denied") {
        handleToastError("Bạn không có quyền lưu nháp báo cáo");
      } else if (error.code === "functions/not-found") {
        handleToastError("Không tìm thấy trẻ hoặc kế hoạch");
      } else {
        handleToastError("Lưu nháp báo cáo thất bại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAiModal = (report: any) => {
    setAiSelectedReport(report);
    setAiKeywordText("");
    setShowAiModal(true);
  };

  const handleCloseAiModal = () => {
    setShowAiModal(false);
    setAiSelectedReport(null);
    setAiKeywordText("");
  };

  const handleGenerateAiSummary = async () => {
    if (!user) {
      handleToastError("Bạn cần đăng nhập để dùng AI");
      return;
    }

    if (!aiSelectedReport) {
      handleToastError("Chưa chọn mục tiêu để tạo tổng kết");
      return;
    }

    const teacherBullets = aiKeywordText
      .split(/\n|,|;/)
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean);

    if (teacherBullets.length === 0) {
      handleToastError("Vui lòng nhập ít nhất một ý chính để AI tạo tổng kết");
      return;
    }

    const domain =
      convertTargetField(aiSelectedReport.targetId, targets, fields)
        .nameField || "";

    const supportText = aiSelectedReport.intervention || "";
    const teachingContent = aiSelectedReport.content || "";

    if (!domain) {
      handleToastError("Thiếu lĩnh vực của mục tiêu");
      return;
    }

    if (!supportText) {
      handleToastError("Thiếu mức độ hỗ trợ");
      return;
    }

    if (!teachingContent) {
      handleToastError("Thiếu nội dung can thiệp");
      return;
    }

    // setShowAiModal(false);
    setAiLoading(true);
    setIsLoading(true);

    try {
      const res = await httpsCallable<
        {
          goal: {
            domain: string;
            supportText: string;
            teachingContent: string;
            teacherBullets: string[];
          };
        },
        {
          ok: boolean;
          summary: string;
        }
      >(
        functions,
        "generateGoalSummaryAI",
      )({
        goal: {
          domain,
          supportText,
          teachingContent,
          teacherBullets,
        },
      });

      if (!res.data?.ok || !res.data?.summary?.trim()) {
        handleToastError("AI chưa tạo được nội dung tổng kết");
        return;
      }

      setAddReports((prev: any[]) =>
        prev.map((item) =>
          item.id === aiSelectedReport.id
            ? {
                ...item,
                total: res.data.summary.trim(),
              }
            : item,
        ),
      );

      handleToastSuccess("Đã tạo tổng kết bằng AI");
      setShowAiModal(false);

      setAiSelectedReport(null);
      setAiKeywordText("");
    } catch (error: any) {
      console.error("Generate AI summary error:", error);

      if (error.code === "functions/unauthenticated") {
        handleToastError("Bạn cần đăng nhập để dùng AI");
      } else if (error.code === "functions/invalid-argument") {
        handleToastError(error.message || "Thiếu dữ liệu để tạo tổng kết");
      } else if (error.code === "functions/resource-exhausted") {
        handleToastError("AI đang quá tải, vui lòng thử lại sau");
      } else {
        handleToastError("Không thể tạo tổng kết bằng AI");
      }
    } finally {
      setAiLoading(false);
      setIsLoading(false);
    }
  };

  const handleChangeTotal = (id: string, value: string) => {
    setAddReports((prev: any[]) =>
      prev.map((item) => (item.id === id ? { ...item, total: value } : item)),
    );
  };

  if (!plans) return <SpinnerComponent />;
  return (
    <>
      <style>{css}</style>

      <section className="page-head">
        <div>
          <h1>Tạo báo cáo can thiệp tháng</h1>
          <p>Tạo báo cáo dựa vào kế hoạch can thiệp đã được duyệt.</p>
        </div>
      </section>

      <section className="select-panel">
        <div className="select-box">
          <label>Chọn kế hoạch đã duyệt</label>
          <select
            value={planSelected}
            onChange={(e) => handleSelectPlan(e.target.value)}
          >
            <option value="">Chọn kế hoạch</option>
            {planApprovals &&
              planApprovals.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.type} {plan.title}
                </option>
              ))}
          </select>
        </div>

        {plan && (
          <div className="plan-info-grid">
            <InfoTile
              icon="bi-person-check-fill"
              label="Giáo viên thực hiện"
              value={
                teachers.find((_: UserModel) => _.id === plan.authorId)
                  ?.fullName
              }
              danger
            />
            <InfoTile
              icon="bi-calendar-plus"
              label="Ngày gửi"
              value={
                typeof plan?.createAt === "number"
                  ? moment(plan?.createAt).format("HH:mm:ss DD/MM/YYYY")
                  : moment(handleTimeStampFirestore(plan?.createAt)).format(
                      "HH:mm:ss DD/MM/YYYY",
                    )
              }
              warning
            />
            <InfoTile
              icon="bi-calendar-check"
              label="Ngày duyệt"
              value={
                typeof plan?.updateAt === "number"
                  ? moment(plan?.updateAt).format("HH:mm:ss DD/MM/YYYY")
                  : moment(handleTimeStampFirestore(plan?.updateAt)).format(
                      "HH:mm:ss DD/MM/YYYY",
                    )
              }
              warning
            />
            <InfoTile
              icon="bi-bullseye"
              label="Tổng mục tiêu"
              value={`${addReports.length} mục tiêu`}
              danger
            />
          </div>
        )}
      </section>

      {!plan ? (
        <section className="empty-panel">
          <i className="bi bi-clipboard-check"></i>
          <strong>
            Vui lòng chọn một kế hoạch đã duyệt để bắt đầu tạo báo cáo.
          </strong>
        </section>
      ) : (
        <section className="report-panel">
          <div className="panel-head">
            <div className="flex-grow-1">
              <div className="d-flex flex-column flex-md-row align-items-md-center">
                <h2 className="me-md-2 mb-2 mb-md-0">Nội dung báo cáo tuần</h2>
              </div>
              <p>Nhập tổng kết, đánh giá hoặc dùng AI để gợi ý nhận xét.</p>
            </div>

            <span>
              <i className="bi bi-list-check"></i>
              {addReports.length} mục tiêu
            </span>
          </div>

          <div className="desktop-table">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    Lĩnh vực
                  </th>
                  <th style={{ width: "20%", textAlign: "center" }}>
                    Mục tiêu
                  </th>
                  <th style={{ width: "30%", textAlign: "center" }}>
                    Nội dung
                  </th>
                  <th style={{ width: "10%", textAlign: "center" }}>
                    Mức độ hỗ trợ
                  </th>
                  <th style={{ width: "30%", textAlign: "center" }}>
                    Tổng kết
                  </th>
                </tr>
              </thead>

              <tbody>
                {groupedReports.map((item) => (
                  <AddReportItem
                    key={`${item.fieldId}-${item.id}`}
                    addReport={item}
                    onChangeTotal={handleChangeTotal}
                    onOpenAiModal={handleOpenAiModal}
                    fieldMap={fieldMap}
                    targetMap={targetMap}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-card-list">
            {groupedReports.map((item, index) => (
              <MobileGoalCard
                key={item.id}
                item={item}
                index={index + 1}
                onOpenAiModal={handleOpenAiModal}
                onChangeTotal={handleChangeTotal}
                fieldMap={fieldMap}
                targetMap={targetMap}
              />
            ))}
          </div>

          {!disable && (
            <div className="bottom-actions">
              <button
                className="save-btn"
                onClick={disable ? undefined : handleSaveReportSaved}
              >
                <i className="bi bi-save-fill"></i>
                Lưu bản nháp
              </button>

              <button
                className="submit-btn"
                onClick={disable ? undefined : handleAddReport}
              >
                <i className="bi bi-send-fill"></i>
                Tạo báo cáo
              </button>
            </div>
          )}

          {showAiModal && (
            <div className="custom-modal-backdrop">
              <div className="custom-modal">
                <h5 className="fw-black text-green-dark mb-2">
                  Tạo tổng kết bằng AI
                </h5>

                <p className="text-green-muted small">
                  Nhập các ý chính giáo viên muốn đưa vào phần tổng kết. Mỗi ý
                  nên xuống dòng riêng.
                </p>

                <textarea
                  className="form-control"
                  rows={6}
                  placeholder={`Ví dụ:
- trẻ thực hiện tốt hơn khi có mẫu
- cần nhắc bằng lời
- đạt 7/10 cơ hội
- duy trì 3 ngày`}
                  value={aiKeywordText}
                  onChange={(e) => setAiKeywordText(e.target.value)}
                />

                <div className="d-flex gap-2 justify-content-end mt-3">
                  <button
                    className="btn action-btn-soft btn-cancel-ai"
                    onClick={handleCloseAiModal}
                    disabled={aiLoading}
                  >
                    Huỷ
                  </button>

                  <button
                    className="btn action-btn-primary btn-submit-ai"
                    onClick={handleGenerateAiSummary}
                    disabled={aiLoading}
                  >
                    <i className="bi bi-stars me-2" />
                    {aiLoading ? "Đang tạo..." : "Tạo tổng kết"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <LoadingOverlay show={isLoading} />
        </section>
      )}
    </>
  );
}

function MobileGoalCard({
  item,
  index,
  onOpenAiModal,
  onChangeTotal,
  fieldMap,
  targetMap,
}: any) {
  return (
    <article className="mobile-goal-card">
      <div className="goal-tags">
        <span className="index-pill">{index}.</span>
        <span className="area-pill">{fieldMap[item.fieldId]?.name}</span>
        <span className="level-pill">
          Level: {targetMap[item.targetId]?.level}
        </span>
      </div>

      <h3 style={{ textAlign: "justify" }}>{targetMap[item.targetId]?.name}</h3>
      <InfoBlock icon="bi-card-text" title="Nội dung" text={item.content} />

      <div className="mobile-info-box">
        <strong>
          <i className={`bi bi-life-preserver`}></i>
          Mức độ hỗ trợ
        </strong>
        <div className="add-mobile-content">
          {item.intervention || "Chưa có"}
        </div>
      </div>

      <div className="summary-box">
        <div className="summary-head">
          <strong>
            <i className="bi bi-chat-square-text-fill"></i>
            Tổng kết
          </strong>

          <button className="ai-btn" onClick={() => onOpenAiModal(item)}>
            <i className="bi bi-stars"></i>
            Dùng AI
          </button>
        </div>

        <textarea
          className="form-control report-textarea mt-2"
          rows={5}
          placeholder="Nhập đánh giá, nhận xét..."
          value={item.total || ""}
          onChange={(e) => onChangeTotal(item.id, e.target.value)}
        />
      </div>
    </article>
  );
}

function InfoBlock({ icon, title, text }: any) {
  return (
    <div className="mobile-info-box">
      <strong>
        <i className={`bi ${icon}`}></i>
        {title}
      </strong>
      <p>{text}</p>
    </div>
  );
}

function InfoTile({ icon, label, value, danger, warning }: any) {
  return (
    <div className="info-tile">
      <i
        className={`bi ${icon} ${danger ? "danger" : ""} ${warning ? "warning" : ""}`}
      ></i>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

const css = `
:root {
  --green: #118c17;
  --green-dark: #056b10;
  --green-deep: #03490b;
  --green-soft: #e9f8eb;
  --green-light: #f7fff8;

  --border: #cbe8d0;
  --line: #d8e7db;

  --yellow: #f5b400;
  --yellow-soft: #fff3cd;

  --red: #ef4444;
  --red-soft: #ffe1e1;

  --text: #073f0c;
  --muted: #527d57;

  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --radius-xl: 26px;

  --shadow: 0 12px 28px rgba(5, 107, 16, 0.08);
  --shadow-lg: 0 16px 40px rgba(5, 107, 16, 0.08);
}

* {
  box-sizing: border-box;
}

/* PAGE HEAD */

.page-head {
  padding: 28px 0 20px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.page-head h1 {
  margin: 0;

  color: var(--green-deep);

  font-size: 36px;
  font-weight: 950;
  line-height: 1.2;
}

.page-head p {
  margin: 8px 0 0;

  color: var(--muted);

  font-weight: 650;
}

/* BUTTONS */

.primary-btn,
.submit-btn,
.save-btn,
.ai-btn {
  border: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-weight: 900;

  transition: 0.25s ease;
}

.primary-btn,
.submit-btn {
  height: 48px;
  padding: 0 20px;

  border-radius: 15px;

  color: white;

  background: linear-gradient(
    135deg,
    var(--green),
    var(--green-dark)
  );
}

.primary-btn:hover,
.submit-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 24px rgba(17, 140, 23, 0.22);
}

.save-btn {
  height: 48px;
  padding: 0 20px;

  border: 1px solid var(--border);
  border-radius: 15px;

  background: white;
  color: var(--green-deep);
}

.save-btn:hover {
  background: var(--green-soft);
}

.ai-btn {
  height: 34px;
  padding: 0 14px;

  border-radius: 999px;

  background: var(--yellow-soft);
  color: #9a6700;

  font-size: 13px;
}

.ai-btn:hover {
  background: #ffe8a3;
}

/* SELECT PANEL */

.select-panel,
.report-panel {
  padding: 24px;

  border: 1px solid var(--border);
  border-radius: var(--radius-xl);

  background: rgba(255, 255, 255, 0.92);

  box-shadow: var(--shadow-lg);
}

.select-box {
  max-width: 360px;
}

.select-box label {
  display: block;

  margin-bottom: 8px;

  color: var(--green-deep);

  font-weight: 950;
}

.select-box select {
  width: 100%;
  height: 52px;

  padding: 0 14px;

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  background: white;

  color: var(--green-deep);

  font-weight: 900;
  outline: none;
}

.select-box select:focus {
  border-color: var(--green);

  box-shadow:
    0 0 0 4px rgba(17, 140, 23, 0.1);
}
.sub-title-box {
  // width: 30%;
  height: 46px;
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
}

.sub-title-box i {
  color: var(--green);
}

.sub-title-box input {
  width: 100%;
  border: 0;
  outline: 0;
  font-weight: 600;
}

/* PLAN INFO */

.plan-info-grid {
  margin-top: 18px;

  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.info-tile {
  min-height: 64px;

  padding: 14px;

  display: flex;
  align-items: center;
  gap: 12px;

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  background: var(--green-light);
}

.info-tile > i {
  flex-shrink: 0;

  color: var(--green);

  font-size: 22px;
}

.info-tile > i.danger {
  color: var(--red);
}

.info-tile > i.warning {
  color: var(--yellow);
}

.info-tile span {
  display: block;

  color: var(--muted);

  font-size: 12px;
  font-weight: 850;
}

.info-tile strong {
  display: block;

  color: var(--green-deep);

  font-size: 14px;
  font-weight: 950;
}

/* EMPTY */

.empty-panel {
  margin-top: 24px;

  min-height: 210px;

  display: grid;
  place-items: center;

  padding: 24px;

  text-align: center;

  border: 1px dashed #9bd8a5;
  border-radius: var(--radius-xl);

  background: white;

  color: var(--muted);

  font-weight: 900;
}

.empty-panel i {
  display: block;

  margin-bottom: 16px;

  color: var(--yellow);

  font-size: 42px;
}

/* REPORT PANEL */

.report-panel {
  margin-top: 24px;
}

.panel-head {
  margin-bottom: 18px;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-head h2 {
  margin: 0;

  color: var(--green-deep);

  font-size: 24px;
  font-weight: 950;
}

.panel-head p {
  margin: 4px 0 0;

  color: var(--muted);

  font-weight: 650;
}

.panel-head > span {
  height: 34px;

  padding: 0 14px;

  display: inline-flex;
  align-items: center;
  gap: 7px;

  border-radius: 999px;

  background: #dff7e4;
  color: var(--green-deep);

  font-size: 13px;
  font-weight: 950;

  white-space: nowrap;
}
.custom-modal-backdrop {
  h5 {
    font-weight: 800
  }
}
.btn-submit-ai {
  background: linear-gradient(135deg, var(--green), var(--green-dark)););
  color: var(--yellow)
}

.btn-cancel-ai {
  background: #b4b3b3
}

.subtitle-select,
.support-select,
.plan-panel select {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  outline: 0;
  padding: 0 14px;
  color: var(--green-deep);
  background: #fff;
  font-weight: 800;
}
.subtitle-select {
  width: 30%
}

/* DESKTOP TABLE */

.desktop-table {
  max-height: 600px;

  overflow-x: auto;
  overflow-y: auto;

  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.desktop-table table {
  width: 100%;
  // min-width: 1200px;

  border-collapse: collapse;

  background: white;
}

.desktop-table thead {
  background: var(--green-soft);
  color: var(--green-deep);

  border-bottom: 3px solid var(--green-deep);
}

.desktop-table th,
.desktop-table td {
  padding: 18px 16px;

  border-bottom: 1px solid var(--line);

  vertical-align: top;

  color: var(--text);

  font-size: 15px;
}

.desktop-table th {
  font-weight: 950;
}

.desktop-table td strong {
  color: var(--green-deep);
}

.desktop-table textarea,
.summary-box textarea {
  width: 100%;
  min-height: 112px;

  padding: 12px;

  border: 1px solid var(--border);
  border-radius: 14px;

  outline: none;
  resize: vertical;

  color: var(--text);

  font-weight: 650;
}

.desktop-table textarea:focus,
.summary-box textarea:focus {
  border-color: var(--green);

  box-shadow:
    0 0 0 4px rgba(17, 140, 23, 0.1);
}

.desktop-table textarea::placeholder,
.summary-box textarea::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

/* PILLS */

.area-pill,
.index-pill,
.level-pill {
  width: fit-content;

  padding: 7px 12px;

  display: inline-flex;
  align-items: center;

  border-radius: 999px;

  font-size: 12px;
  font-weight: 950;

  white-space: nowrap;
}

.area-pill {
  background: #dff7e4;
  color: var(--green-deep);
}

.index-pill,
.level-pill {
  background: var(--yellow-soft);
  color: #9a6700;
}

/* MOBILE CARD */

.mobile-card-list {
  display: none;
}

.mobile-goal-card {
  padding: 20px;

  border: 1px solid var(--border);
  border-radius: var(--radius-xl);

  background: white;

  box-shadow: var(--shadow);
}

.goal-tags {
  margin-bottom: 14px;

  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mobile-goal-card h3 {
  margin: 0 0 16px;

  color: var(--green-deep);

  font-size: 17px;
  font-weight: 950;
  line-height: 1.45;
}

.mobile-info-box,
.summary-box {
  margin-top: 12px;
  padding: 14px;

  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  background: #f2fbf4;

  color: var(--muted);

  line-height: 1.6;
  font-weight: 700;
}

.mobile-info-box strong,
.summary-head strong {
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--green-deep);
}

.mobile-info-box p {
  margin: 8px 0 0;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-box textarea {
  margin-top: 12px;
  min-height: 110px;
}

/* BOTTOM ACTIONS */

.bottom-actions {
  margin-top: 22px;

  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ===== AI BUTTON ===== */

.btn-ai-summary {
  position: absolute;
  right: 10px;
  bottom: 10px;
  border: 1px solid #b7efd4;
  background: #e7fff3;
  color: #006b4f;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
}

.summary-ai-wrap {
  position: relative;
}

.summary-ai-wrap textarea {
  min-height: 110px;
  padding-bottom: 42px;
}
  /* ===== AI CELL LAYOUT ===== */
.summary-ai-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.btn-ai-summary:hover {
  background: #d8fbe9;
}
  
.btn-ai-summary {
  align-self: flex-start;
  border-radius: 12px;
  padding: 6px 12px;
  font-weight: 700;
  background: var(--yellow-soft);
  color: #9a6700;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.btn-ai-summary:hover {
  filter: brightness(0.95);
}

.btn-ai-summary-mobile {
  border: 1px solid #b7efd4;
  background: #e7fff3;
  color: #006b4f;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

/* RESPONSIVE */

@media (max-width: 1200px) {
  .plan-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
  }

  .primary-btn {
    width: 100%;
  }

  .select-box {
    max-width: 100%;
  }

  .plan-info-grid {
    grid-template-columns: 1fr;
  }

  .panel-head {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .page-head {
    padding: 22px 0 16px;
  }

  .page-head h1 {
    font-size: 28px;
  }

  .select-panel,
  .report-panel {
    padding: 18px;
    border-radius: var(--radius-xl);
  }

  .desktop-table {
    display: none;
  }

  .mobile-card-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .summary-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .ai-btn {
    width: 100%;
  }

  .bottom-actions {
    flex-direction: column;
  }

  .save-btn,
  .submit-btn,
  .subtitle-select {
    width: 100%;
  }
}
`;
