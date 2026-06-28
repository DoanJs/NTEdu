import { doc, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Message } from "iconsax-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverLay";
import { convertTargetField } from "../../constants/convertTargetAndField";
import { handleTimeStampFirestore } from "../../constants/convertTimeStamp";
import { addDocData } from "../../constants/firebase/addDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { updateDocData } from "../../constants/firebase/updateDocData";
import { groupArrayWithField } from "../../constants/groupArrayWithField";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { getChildAge, getMonthRange } from "../../constants/info";
import { exportWord } from "../../exportFile/WordExport";
import { db, functions } from "../../firebase.config";
import { PlanTaskModel } from "../../models";
import {
  useCartEditStore,
  useCartStore,
  useChildStore,
  useCommentStore,
  useFieldStore,
  usePlanStore,
  useSelectNavbarStore,
  useTargetStore,
  useTeacherStore,
  useUserStore,
} from "../../zustand";

export default function PlanDetailScreen() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [text, setText] = useState("");
  const [disableComment, setDisableComment] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isComment, setIsComment] = useState(false);

  const location = useLocation();
  const planFromState = location.state?.plan;

  const savedPlan = sessionStorage.getItem("currentPlan");
  const plan = planFromState || (savedPlan ? JSON.parse(savedPlan) : null);
  // const { plan } = location.state || {};

  const { targets } = useTargetStore();
  const { fields } = useFieldStore();
  const { child } = useChildStore();
  const { user } = useUserStore();
  const [planTasks, setPlanTasks] = useState<PlanTaskModel[]>([]);
  const { teachers } = useTeacherStore();
  const { plans, editPlan } = usePlanStore();
  const navigate = useNavigate();
  const { setSelectNavbar } = useSelectNavbarStore();
  const isPending = plan.status === "pending";
  const { setCarts } = useCartStore();
  const { setCartEdit } = useCartEditStore();
  const [showDelete, setShowDelete] = useState(false);
  const { removePlan } = usePlanStore();
  const [historyComment, setHistoryComment] = useState(false);
  const { addComment, comments } = useCommentStore();

  const myComments = useMemo(() => {
    return comments.filter((cmt) => cmt._id === plan.id);
  }, [comments, plan.id]);

  const teacherMap = useMemo(() => {
    const map: any = {};
    teachers.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teachers]);

  const targetMap = useMemo(() => {
    const map: any = {};
    targets.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [targets]);
  const fieldMap = useMemo(() => {
    const map: any = {};
    fields.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [fields]);

  // Lấy trực tiếp từ firebase
  useEffect(() => {
    if (!plan?.id || !user?.id) return;

    getDocsData({
      nameCollect: "planTasks",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("planId", "==", plan.id),
      ],
      setData: setPlanTasks,
    });
    // eslint-disable-next-line
  }, [plan?.id, user?.id]);
  useEffect(() => {
    setIsComment(myComments.length > 0);
  }, [myComments]);
  useEffect(() => {
    if (text !== myComments[0]?.content) {
      setDisableComment(false);
    } else {
      setDisableComment(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (planFromState) {
      sessionStorage.setItem("currentPlan", JSON.stringify(planFromState));
    }
  }, [planFromState]);

  const handleEditPlan = () => {
    const convertPlanTasksToCarts = planTasks.map((_) => {
      const { targetId, planId, ...newPlanTask } = _;
      return {
        ...newPlanTask,
        targetId: _.targetId,
        fieldId: convertTargetField(_.targetId, targets, fields).fieldId,
        name: convertTargetField(_.targetId, targets, fields).nameTarget,
        level: convertTargetField(_.targetId, targets, fields).levelTarget,
      };
    });
    setCarts(convertPlanTasksToCarts);
    setCartEdit(plan.id);
    setSelectNavbar("cart");
  };

  const handleExportWordKH = () => {
    const items = hanldeGroupPlanWithField(planTasks).map(
      (planTask: PlanTaskModel) => {
        return {
          field: convertTargetField(planTask.targetId, targets, fields)
            .nameField,
          target: convertTargetField(planTask.targetId, targets, fields)
            .nameTarget,
          intervention: planTask.intervention,
          content: planTask.content,
        };
      },
    );

    exportWord(
      {
        rows: items,
        title: plan.title.trim(),
        child: child?.fullName || "",
        birthChild: getChildAge(child?.birth),
        teacher: user?.fullName || "",
        rangeTime: `Từ ngày ${getMonthRange(plan.title).firstDay} đến ngày ${getMonthRange(plan.title).lastDay}`,
      },
      "/template_KH.docx",
    );
  };
  const hanldeGroupPlanWithField = (planTasks: PlanTaskModel[]) => {
    return groupArrayWithField(
      planTasks.map((_) => {
        return {
          ..._,
          fieldId: convertTargetField(_.targetId, targets, fields).fieldId,
        };
      }),
      "fieldId",
    );
  };

  const handleSaveComment = async () => {
    setShowFeedback(false);
    setIsLoading(true);
    const newComment = {
      _id: plan.id,
      authorId: user?.id || "",
      childId: child?.id || "",
      content: text,
      createAt: Date.now(),
      id: "",
      teacherIds: plan.teacherIds,
      type: "KH",
      updateAt: Date.now(),
    };

    addComment(newComment);

    await addDocData({
      nameCollect: "comments",
      value: {
        ...newComment,
        createAt: serverTimestamp(),
        updateAt: serverTimestamp(),
      },
      metaDoc: "comments",
    });

    await updateDoc(doc(db, "Meta", "comments"), {
      lastUpdated: serverTimestamp(),
    });
    await updateDocData({
      nameCollect: "plans",
      id: plan.id,
      metaDoc: "plans",
      valueUpdate: {
        comment: text,
        updateById: user?.id,
      },
    });

    setText("");
    setIsComment(true);
    setIsLoading(false);
    setDisableComment(true);
  };
  const handleApproved = () => {
    const indexPlan = plans.findIndex((p) => p.id === plan.id);
    editPlan(plan.id, { ...plans[indexPlan], status: "approved" });
    setIsLoading(true);
    updateDocData({
      nameCollect: "plans",
      id: plan.id,
      valueUpdate: { status: "approved", updateById: user?.id },
      metaDoc: "plans",
    })
      .then(() => {
        setIsLoading(false);
        navigate("../pending");
        setSelectNavbar("pending");
        handleToastSuccess("Kế hoạch được duyệt thành công !");
      })
      .catch((error) => {
        setIsLoading(false);
        handleToastError("Duyệt kế hoạch thất bại !");
        console.log(error);
      });
  };
  const handleDeletePlan = async () => {
    if (!plan) return;

    setShowDelete(false);
    setIsLoading(true);

    try {
      const res: any = await httpsCallable(
        functions,
        "deletePlan",
      )({
        planId: plan.id,
        mode: "hard",
      });

      const deleted = res.data.deleted;

      removePlan(plan.id);

      handleToastSuccess(
        `Đã xoá kế hoạch thành công cùng ${deleted.planTasks} chi tiết kế hoạch, ${deleted.reports} báo cáo, ${deleted.reportTasks} chi tiết báo cáo, ${deleted.reportSaveds} bản lưu báo cáo`,
      );

      navigate("../pending");
      setSelectNavbar("pending");
    } catch (err: any) {
      console.error(err);

      if (err.code === "functions/permission-denied") {
        handleToastError("Bạn không có quyền xoá kế hoạch");
      } else {
        handleToastError("Không thể xoá kế hoạch");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <section className="page-head">
        <div>
          <div className="title-line">
            <h1>
              {plan.type} {plan.title}
            </h1>
            {isPending ? (
              <span className="pending-badge">
                <i className="bi bi-hourglass-split me-1" />
                Chờ duyệt
              </span>
            ) : (
              <span className="approved-badge">
                <i className="bi bi-check-circle-fill"></i>
                Đã duyệt
              </span>
            )}
          </div>
          <p>Chi tiết mục tiêu, mức độ hỗ trợ và nội dung can thiệp cho trẻ.</p>
        </div>

        {!isPending && (
          <button onClick={handleExportWordKH} className="export-btn">
            <i className="bi bi-cloud-arrow-down-fill"></i>
            Xuất kế hoạch
          </button>
        )}
      </section>

      <section className="info-strip mb-3">
        <InfoTile
          icon="bi-person-check-fill"
          label="Giáo viên thực hiện"
          value={teacherMap[plan.authorId]?.fullName || ""}
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
        />
        <InfoTile
          icon="bi-calendar-check"
          label="Ngày duyệt"
          value={
            (!isPending &&
              (typeof plan?.updateAt === "number"
                ? moment(plan?.updateAt).format("HH:mm:ss DD/MM/YYYY")
                : moment(handleTimeStampFirestore(plan?.updateAt)).format(
                    "HH:mm:ss DD/MM/YYYY",
                  ))) ||
            "Đang chờ..."
          }
          warning
        />
      </section>
      {isPending && isComment && (
        <div className="d-flex align-items-start justify-content-between comment-total text-danger">
          <div className="d-flex plan-hero feedback-box flex-grow-1 comment-content me-2 rounded-4 mb-2">
            <Message color="#ef4444" size={26} variant="Bold" />

            <div className="ms-2">
              <span className="text-danger-custom">
                Góp ý từ cô{" "}
                <b>
                  {teacherMap[myComments[0]?.authorId]?.fullName ||
                    user?.fullName}
                </b>{" "}
                vào lúc{" "}
                {typeof myComments[0]?.createAt === "number"
                  ? moment(myComments[0]?.createAt).format(
                      "HH:mm:ss DD/MM/YYYY",
                    )
                  : moment(
                      handleTimeStampFirestore(myComments[0]?.createAt),
                    ).format("HH:mm:ss DD/MM/YYYY")}
                :
              </span>

              <div className="mt-1 feedback-content">
                {myComments[0]?.content}
              </div>
            </div>
          </div>

          <button
            className="btn action-btn-comment flex-shrink-0 mb-3"
            onClick={() => setHistoryComment(true)}
          >
            <i className="bi bi-send-check-fill me-2 " />
            Lịch sử góp ý
          </button>
        </div>
      )}

      <section className="content-panel">
        <div className="content-head">
          <div>
            <h2>Bảng nội dung kế hoạch</h2>
            <p>Nội dung cụ thể của kế hoạch can thiệp trong tháng</p>
          </div>

          <span>
            <i className="bi bi-list-check"></i>
            {planTasks.length} mục tiêu hiển thị
          </span>
        </div>

        <div className="desktop-table">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Lĩnh vực</th>
                <th style={{ textAlign: "center" }}>Mục tiêu</th>
                <th style={{ textAlign: "center" }}>Mức độ hỗ trợ</th>
                <th style={{ textAlign: "center" }}>Nội dung</th>
              </tr>
            </thead>

            <tbody>
              {planTasks.length > 0 &&
                hanldeGroupPlanWithField(planTasks).map((item, index) => {
                  const data = convertTargetField(
                    item.targetId,
                    targets,
                    fields,
                  );

                  return (
                    <tr key={`desktop-table-${item.id}-${index}`}>
                      <td className="area-cell">{data.nameField}</td>
                      <td style={{ textAlign: "justify" }}>
                        <strong>{data.nameTarget}</strong>
                        <div className="level-pill">
                          Level {data.levelTarget}
                        </div>
                      </td>
                      <td>{item.intervention}</td>
                      <td style={{ textAlign: "justify" }}>{item.content}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list">
          {hanldeGroupPlanWithField(planTasks).map((item, index) => (
            <GoalMobileCard
              key={`mobile-${item.id}-${index}`}
              item={item}
              index={index + 1}
              targetMap={targetMap}
              fieldMap={fieldMap}
            />
          ))}
        </div>
      </section>

      {isPending && (
        <div className="pending-actions mt-3 border-top-soft">
          {["Phó Giám đốc", "Giám đốc"].includes(user?.position as string) && (
            <button
              className="btn action-btn-soft cmt-user"
              onClick={() => setShowFeedback(true)}
            >
              <i className="bi bi-chat-left-dots-fill me-2 icon-yellow" />
              Góp ý
            </button>
          )}
          {user?.role === "admin" && (
            <button className="btn approve-btn" onClick={handleApproved}>
              <i className="bi bi-check-circle-fill me-2" />
              Duyệt
            </button>
          )}
          {/* <div className="ms-auto d-flex gap-2"> */}
          <div className="edit-delete-actions">
            <Link
              to={"../cart"}
              className="btn action-btn-primary"
              onClick={handleEditPlan}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Chỉnh sửa
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="btn reject-btn"
            >
              <i className="bi bi-trash3-fill me-2" />
              Xóa
            </button>
          </div>
        </div>
      )}

      {isPending && historyComment && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal-history-comment">
            <h5 className="fw-black text-green-dark mb-2">Lịch sử góp ý</h5>
            <p className="text-green-muted small">
              Góp ý sẽ được lưu lại phục vụ đánh giá năng lực của Quản lý chuyên
              môn.
            </p>
            <div className="table-responsive comment-table-wrap">
              <table className="table comment-table align-middle mb-0">
                <thead>
                  <tr>
                    <th className="area-cell">Thời gian</th>
                    <th className="goal-cell">Giáo viên</th>
                    <th className="content-cell">Nội dung</th>
                  </tr>
                </thead>

                <tbody>
                  {myComments.length > 0 &&
                    [...myComments].reverse().map((cmt, index) => {
                      return (
                        <tr key={`cmt-${cmt.id}-${index}`}>
                          <td>
                            {typeof cmt?.createAt === "number"
                              ? moment(cmt?.createAt).format(
                                  "HH:mm:ss DD/MM/YYYY",
                                )
                              : moment(
                                  handleTimeStampFirestore(cmt?.createAt),
                                ).format("HH:mm:ss DD/MM/YYYY")}
                          </td>

                          <td className="d-flex align-items-center">
                            <img
                              alt="avatar"
                              src={teacherMap[cmt.authorId]?.avatar}
                              className="comment-avatar"
                            />
                            <div className="fw-semibold text-green-dark">
                              {teacherMap[cmt.authorId]?.fullName || ""}
                            </div>
                          </td>

                          <td>{cmt.content}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setHistoryComment(false)}
              >
                Hủy
              </button>
              {["Phó Giám đốc", "Giám đốc"].includes(
                user?.position as string,
              ) && (
                <button
                  className="btn action-btn-soft cmt-user"
                  onClick={() => {
                    setHistoryComment(false);
                    setShowFeedback(true);
                  }}
                >
                  <i className="bi bi-chat-left-dots-fill me-2 icon-yellow" />
                  Góp ý
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isPending && showFeedback && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h5 className="fw-black text-green-dark mb-2">Góp ý kế hoạch</h5>
            <p className="text-green-muted small">
              Góp ý sẽ được gửi lại cho giáo viên chỉnh sửa trước khi duyệt kế
              hoạch.
            </p>
            <textarea
              className="form-control filter-select"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập nội dung góp ý..."
            />
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowFeedback(false)}
              >
                Hủy
              </button>
              <button
                className="btn action-btn-primary"
                onClick={disableComment ? undefined : handleSaveComment}
                disabled={!text.trim()}
              >
                <i className="bi bi-send-check-fill me-2" />
                Gửi góp ý
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            {/* Title */}
            <h5 className="fw-black text-danger mb-2">Xác nhận xoá kế hoạch</h5>

            {/* Description */}
            <p className="text-green-muted small">
              Hành động này sẽ xoá toàn bộ nội dung kế hoạch và không thể khôi
              phục.
            </p>

            {/* Plan info */}
            <div className="plan-delete-box mt-2">
              <div className="small">
                <strong>Tháng:</strong> {plan.title}
              </div>
              <div className="small">
                <strong>Mã kế hoạch:</strong> {plan.id}
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button
                className="btn action-btn-soft"
                onClick={() => setShowDelete(false)}
              >
                Huỷ
              </button>

              <button
                className="btn action-btn-danger"
                onClick={handleDeletePlan}
              >
                <i className="bi bi-trash me-2" />
                Xoá kế hoạch
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay show={isLoading} />
    </>
  );
}

function GoalMobileCard({
  item,
  index,
  targetMap,
  fieldMap,
}: {
  item: any;
  index: number;
  targetMap: any;
  fieldMap: any;
}) {
  return (
    <article className="goal-mobile-card">
      <div className="goal-tags">
        <span className="index-pill">{index}.</span>
        <span className="area-pill">{fieldMap[item.fieldId]?.name}</span>
        <span className="level-pill">
          Level {targetMap[item.targetId]?.level}
        </span>
      </div>

      <h3 style={{ textAlign: "justify" }}>
        {" "}
        {targetMap[item.targetId]?.name}
      </h3>

      <div className="mobile-info-box">
        <strong>Mức độ hỗ trợ:</strong> {item.intervention}
      </div>

      <div className="mobile-info-box">
        <strong>Nội dung:</strong> {targetMap[item.targetId]?.content}
      </div>
    </article>
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
  --green-pale: #f7fff8;
  --border: #cbe8d0;
  --red: #ef4444;
  --yellow: #f5b400;
  --text: #073f0c;
  --muted: #527d57;
  /* Radius */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-pill: 999px;
}

body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  color: var(--text);
  background: linear-gradient(135deg, #f7fff8, #e8f8eb);
}

/* HEADER */

.page-head {
  padding: 28px 0 20px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.title-line {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.page-head h1 {
  margin: 0;
  color: var(--green-deep);
  font-size: 38px;
  font-weight: 950;
}

.page-head p {
  margin: 10px 0 0;
  color: var(--muted);
  font-weight: 650;
}

.pending-badge {
    background: var(--yellow-soft);
    color: #9a6700;
  padding: 7px 12px;
  border-radius: 999px;
  // background: #dff7e4;
  // color: var(--green-deep);
  font-size: 13px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.approved-badge {
  padding: 7px 12px;
  border-radius: 999px;
  background: #dff7e4;
  color: var(--green-deep);
  font-size: 13px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.export-btn {
  height: 46px;
  border: 0;
  border-radius: 15px;
  padding: 0 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* INFO */

.info-strip {
  padding: 24px;
  border-radius: 26px;
  border: 1px solid var(--border);
  background:
    radial-gradient(circle at right, rgba(245, 180, 0, .18), transparent 36%),
    #fff;
  box-shadow: 0 16px 40px rgba(5, 107, 16, .08);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.info-tile {
  min-height: 64px;
  padding: 14px;
  border-radius: 16px;
  background: var(--green-pale);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.info-tile > i {
  color: var(--green);
  flex-shrink: 0;
  font-size: 20px;
}

.info-tile > i.danger {
  color: var(--red);
}

.info-tile > i.warning {
  color: var(--yellow);
}

.info-tile div {
  min-width: 0;
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
  overflow-wrap: anywhere;
}

.comment-total {
  flex-direction: row;
}


/* ==================================================
   MODAL
================================================== */

.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;

  display: grid;
  place-items: center;

  padding: 16px;
  background: rgba(6, 78, 59, 0.35);
}

.custom-modal,
.custom-modal-history-comment {
  width: min(580px, 100%);
  max-height: 90vh;

  overflow: auto;

  padding: 24px;

  background: #fff;
  border-radius: var(--radius-xl);
  border: 1px solid var(--line);

  box-shadow: var(--shadow-xl);
}

.custom-modal-lg, 
.custom-modal-history-comment-lg {
  width: min(1100px, 100%);
}

.custom-modal-history-comment {
  width: min(900px, 100%);
}

.comment-total {
  flex-direction: row;
}
.comment-avatar {
  width: 50px;
  height: 50px;

  margin-right: 10px;

  border-radius: 50%;

  object-fit: cover;

  border: 2px solid rgba(255,255,255,.5);

  box-shadow:
    0 2px 8px rgba(0,0,0,.15);
}
.mobile-goal-title, .mobile-section {
  text-align: justify;
}q

.director-comment-box {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(239, 68, 68, 0.12), transparent 260px),
    linear-gradient(135deg, #ffffff, #fff7f7);
  border: 1px solid #fecaca;
  border-left: 6px solid #ef4444;
  box-shadow: 0 16px 34px rgba(239, 68, 68, 0.08);
}

.director-comment-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #fee2e2;
  color: #ef4444;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.director-comment-body {
  flex: 1;
  min-width: 0;
}

.director-comment-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.director-comment-label {
  color: #ef4444;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.director-comment-name {
  margin-top: 2px;
  color: #064e3b;
  font-size: 17px;
  font-weight: 900;
}

.director-comment-status {
  padding: 6px 12px;
  border-radius: 999px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.director-comment-content {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(239, 68, 68, 0.16);
  color: #374151;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.7;
  white-space: pre-line;
}
.action-btn-comment {
  color: #fff;
  background: var(--yellow);
}

/* CONTENT */

.content-panel {
  margin-top: 24px;
  padding: 24px;
  border-radius: 26px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(5, 107, 16, .08);
}

.content-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.content-head h2 {
  margin: 0;
  color: var(--green-deep);
  font-size: 24px;
  font-weight: 950;
}

.content-head p {
  margin: 4px 0 0;
  color: var(--muted);
  font-weight: 650;
}

.content-head > span {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: #dff7e4;
  color: var(--green-deep);
  font-size: 13px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

/* TABLE */

.desktop-table {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 22px;
}

.desktop-table table {
  width: 100%;
  // min-width: 1050px;
  border-collapse: collapse;
}

.desktop-table thead {
  background: var(--green-soft);
  color: var(--green-deep);
}

.desktop-table th,
.desktop-table td {
  padding: 18px 16px;
  border-bottom: 1px solid #dfeee2;
  vertical-align: top;
  font-size: 15px;
}

.desktop-table th {
  text-align: left;
  font-weight: 950;
}

.desktop-table tbody tr:last-child td {
  border-bottom: 0;
}

.desktop-table td strong {
  color: var(--green-deep);
}

.area-cell {
  color: var(--green-deep);
  font-weight: 950;
  white-space: nowrap;
}

.level-pill {
  width: fit-content;
  // margin-top: 8px;
  padding: 6px 11px;
  border-radius: 999px;
  color: #9a6700;
  background: #fff3cd;
  font-size: 12px;
  font-weight: 950;
}

/* MOBILE CARD */

.mobile-card-list {
  display: none;
}

.goal-mobile-card {
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 12px 32px rgba(5, 107, 16, .08);
}

.goal-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.index-pill,
.area-pill {
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 950;
}

.index-pill {
  background: #fff3cd;
  color: #9a6700;
}

.area-pill {
  background: #dff7e4;
  color: var(--green-deep);
}

.goal-mobile-card h3 {
  margin: 0 0 16px;
  color: var(--green-deep);
  font-size: 17px;
  line-height: 1.45;
  font-weight: 950;
}

.mobile-info-box {
  padding: 14px;
  border-radius: 16px;
  background: #f2fbf4;
  border: 1px solid var(--border);
  color: var(--muted);
  line-height: 1.6;
  font-weight: 700;
  margin-top: 12px;
}

.mobile-info-box strong {
  color: var(--green-deep);
}


.plan-hero {
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.96) !important;
  border: 1px solid var(--line) !important;
  box-shadow: var(--shadow-lg) !important;
}

.plan-hero {
  padding: 24px;
  background:
    radial-gradient(
      circle at top right,
      rgba(245, 183, 0, 0.18),
      transparent 300px
    ),
    linear-gradient(
      135deg,
      #fff,
      #f0fdf4
    ) !important;
}



.pending-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
}
.cmt-user {
  background: var(--yellow);
  color: #fff;
  font-weight: 800;
  line-height: 2
}
.approve-btn,
.reject-btn {
  padding: 11px 16px;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  transition: all 0.2s ease;
}

.approve-btn {
  background: var(--green-deep);
  color: #fff;
}

.approve-btn:hover {
  background: var(--green-800);
}

.reject-btn {
  background: var(--red-soft);
  color: var(--red);
}

.reject-btn:hover {
  background: var(--red);
  color: #fff;
}

.action-btn-primary {
  padding: 11px 16px;
  border: none;
  border-radius: 16px;

  background: var(--green);
  color: #fff;

  font-weight: 800;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn-primary:hover {
  background: var(--green-800);
  color: #fff;
}

.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;

  display: grid;
  place-items: center;

  padding: 16px;
  background: rgba(6, 78, 59, 0.35);
}

.custom-modal {
  width: min(580px, 100%);
  max-height: 90vh;
  overflow: auto;

  padding: 24px;
  border-radius: 24px;
  border: 1px solid var(--line);

  background: #fff;
  box-shadow: 0 24px 60px rgba(6, 95, 70, 0.22);
}

.custom-modal-lg {
  width: min(1100px, 100%);
}

.edit-goal-card {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--line);

  background: #f8fffb;
}

.edit-goal-title {
  font-weight: 900;
  color: var(--green-900);
}

.modal-actions {
  position: sticky;
  bottom: -24px;

  padding-top: 14px;

  background: #fff;
  border-top: 1px solid var(--line);
}

.app-footer {
  background: rgba(255, 255, 255, 0.82);
  border-top: 1px solid var(--line);
  color: #4f7b68;
}

/* Delete box */

.plan-delete-box {
  padding: 12px;
  border-radius: 12px;

  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

/* Danger button */

.action-btn-danger {
  padding: 6px 16px;
  border: none;
  border-radius: 999px;

  background: #e55353;
  color: #fff;

  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn-danger:hover {
  background: #d94343;
}

.edit-delete-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.comment-table-wrap {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.comment-table {
  min-width: 850px;
}

.comment-table th,
.comment-table td {
  white-space: nowrap;
}

.comment-table td:last-child {
  white-space: normal;
  min-width: 320px;
}

.custom-modal-history-comment {
  width: min(900px, 95vw);
  max-width: 95vw;
}
/* RESPONSIVE */

@media (max-width: 900px) {
  .page-head,
  .content-head {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }

  .info-strip {
    grid-template-columns: 1fr;
  }
    .comment-total {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .page-head h1 {
    font-size: 30px;
  }

  .info-strip,
  .content-panel {
    padding: 16px;
    border-radius: 22px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-card-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .director-comment-box {
    padding: 16px;
    border-radius: 20px;
    gap: 12px;
  }

  .director-comment-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .director-comment-header {
    flex-direction: column;
  }

  .director-comment-status {
    width: fit-content;
  }
  .comment-total {
    flex-direction: column;
  }

 .pending-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pending-actions > button,
  .pending-actions > a,
  .pending-actions .edit-delete-actions,
  .pending-actions .edit-delete-actions > * {
    width: 100%;
  }

  .edit-delete-actions {
    margin-left: 0;
    flex-direction: column;
  }
`;
