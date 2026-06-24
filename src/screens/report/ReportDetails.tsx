import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Message } from "iconsax-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverLay";
import { colors } from "../../constants/colors";
import { convertTargetField } from "../../constants/convertTargetAndField";
import { handleTimeStampFirestore } from "../../constants/convertTimeStamp";
import { addDocData } from "../../constants/firebase/addDocData";
import { getDocData } from "../../constants/firebase/getDocData";
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
import { PlanTaskModel, ReportTaskModel } from "../../models";
import {
  useChildStore,
  useCommentStore,
  useFieldStore,
  useInterventionStore,
  useReportStore,
  useSelectNavbarStore,
  useTargetStore,
  useTeacherStore,
  useUserStore,
} from "../../zustand";
import ReportItem from "./ReportItem";

export default function ReportDetailScreen() {
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // const { report } = location.state || {};
  const reportFromState = location.state?.report;

  const savedReport = sessionStorage.getItem("currentReport");
  const report =
    reportFromState || (savedReport ? JSON.parse(savedReport) : null);

  const [reportTasks, setReportTasks] = useState<ReportTaskModel[]>([]);
  const [disable, setDisable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { targets } = useTargetStore();
  const { fields } = useFieldStore();
  const { child } = useChildStore();
  const { user } = useUserStore();
  const [disableComment, setDisableComment] = useState(true);
  const [isComment, setIsComment] = useState(false);
  const [text, setText] = useState("");
  const { reports, editReport } = useReportStore();
  const [planTasks, setPlanTasks] = useState<PlanTaskModel[]>([]);
  const { teachers } = useTeacherStore();
  const { setSelectNavbar } = useSelectNavbarStore();
  const isPending = report.status === "pending";
  const [showDelete, setShowDelete] = useState(false);
  const { removeReport } = useReportStore();
  const [historyComment, setHistoryComment] = useState(false);
  const { addComment, comments } = useCommentStore();
  const { interventions } = useInterventionStore();

  const myComments = useMemo(() => {
    return comments.filter((cmt) => cmt._id === report.id);
  }, [comments, report.id]);

  const teacherMap = useMemo(() => {
    const map: any = {};
    teachers.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [teachers]);
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

  // Lấy trực tiếp từ firebase
  useEffect(() => {
    if (!report?.id || !user?.id) return;

    getDocsData({
      nameCollect: "reportTasks",
      condition: [
        where("teacherIds", "array-contains", user?.id),
        where("reportId", "==", report.id),
      ],
      setData: setReportTasks,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id, user?.id]);

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
    if (reportFromState) {
      sessionStorage.setItem("currentReport", JSON.stringify(reportFromState));
    }
  }, [reportFromState]);

  useEffect(() => {
    if (reportTasks.length > 0) {
      getPlanTasks(reportTasks);
    }
  }, [reportTasks]);

  const getPlanTasks = async (reportTasks: ReportTaskModel[]) => {
    const promiseItems = reportTasks.map(async (reportTask) => {
      const docSnap = await getDoc(doc(db, "planTasks", reportTask.planTaskId));
      return {
        ...docSnap.data(),
        id: docSnap.id,
      };
    });
    const result = await Promise.all(promiseItems);

    setPlanTasks(result as PlanTaskModel[]);
  };

  const handleSaveReportTask = async () => {
    if (disable) return;

    setIsLoading(true);

    try {
      const res: any = await httpsCallable(
        functions,
        "updateReportTasks",
      )({
        reportId: report.id,
        reportTasks,
      });

      handleToastSuccess(
        `Đã cập nhật ${res.data.updatedCount} mục chi tiết báo cáo`,
      );

      setDisable(true);
    } catch (error: any) {
      console.log(error);

      if (error.code === "functions/failed-precondition") {
        handleToastError("Báo cáo đã duyệt, không thể chỉnh sửa");
      } else {
        handleToastError("Chỉnh sửa báo cáo thất bại !");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleExportWordBC = async () => {
    setIsLoading(true);
    const promiseItems = handleGroupReportWithField(reportTasks).map(
      async (reportTask: ReportTaskModel) => {
        let intervention1 = "";
        let intervention2 = "";
        let intervention3 = "";
        let intervention4 = "";

        if (report.subTitle === "1-2") {
          intervention1 = reportTask.intervention[0] || "";
          intervention2 = reportTask.intervention[1] || "";
        } else {
          intervention3 = reportTask.intervention[0] || "";
          intervention4 = reportTask.intervention[1] || "";
        }
        const docSnap = await getDoc(
          doc(db, "planTasks", reportTask.planTaskId),
        );
        if (docSnap.exists()) {
          return {
            field: convertTargetField(docSnap.data().targetId, targets, fields)
              .nameField,
            target: convertTargetField(docSnap.data().targetId, targets, fields)
              .nameTarget,
            content: docSnap.data().content,
            intervention1,
            intervention2,
            intervention3,
            intervention4,
            total: reportTask.content,
          };
        } else {
          console.log(`getDoc data error`);
        }
      },
    );
    const result = await Promise.all(promiseItems);

    exportWord(
      {
        rows: result,
        title: report.title.trim(),
        child: child?.fullName,
        birthChild: getChildAge(child?.birth),
        teacher: user?.fullName,
        rangeTime: `Từ ngày ${getMonthRange(report.title).firstDay} đến ngày ${getMonthRange(report.title).lastDay}`,
      },
      "/template_BC.docx",
    );
    setIsLoading(false);
  };
  const handleSaveComment = async () => {
    setShowFeedback(false);
    setIsLoading(true);
    const newComment = {
      _id: report.id,
      authorId: user?.id || "",
      childId: child?.id || "",
      content: text,
      createAt: Date.now(),
      id: "",
      teacherIds: report.teacherIds,
      type: "BC",
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
      nameCollect: "reports",
      id: report.id,
      metaDoc: "reports",
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
    const indexReport = reports.findIndex((r) => r.id === report.id);
    editReport(report.id, { ...reports[indexReport], status: "approved" });

    setIsLoading(true);
    updateDocData({
      nameCollect: "reports",
      id: report.id,
      valueUpdate: { status: "approved", updateById: user?.id },
      metaDoc: "reports",
    })
      .then(() => {
        setIsLoading(false);
        navigate("../pending");
        setSelectNavbar("pending");
        handleToastSuccess("Báo cáo được duyệt thành công !");
      })
      .catch((error) => {
        setIsLoading(false);
        handleToastError("Duyệt báo cáo thất bại !");
        console.log(error);
      });
  };
  const getPlanTask = (planTaskId: string, planTasks: PlanTaskModel[]) => {
    const index = planTasks.findIndex((pt) => pt.id === planTaskId);
    if (index !== -1) {
      return planTasks[index];
    }
  };
  const handleGroupReportWithField = (reportTasks: ReportTaskModel[]) => {
    return groupArrayWithField(
      reportTasks.map((rt) => {
        return {
          ...rt,
          fieldId: convertTargetField(
            getPlanTask(rt.planTaskId, planTasks)?.targetId as string,
            targets,
            fields,
          ).fieldId,
        };
      }),
      "fieldId",
    );
  };
  const handleDeleteReport = async () => {
    if (!report) return;

    setShowDelete(false);
    setIsLoading(true);

    try {
      const res: any = await httpsCallable(
        functions,
        "deleteReport",
      )({
        reportId: report.id,
      });

      removeReport(report.id);

      handleToastSuccess(
        `Xóa báo cáo thành công cùng ${res.data.deletedCount} mục chi tiết báo cáo.`,
      );

      navigate("../pending");
      setSelectNavbar("pending");
    } catch (err: any) {
      console.error(err);

      if (err.code === "functions/permission-denied") {
        handleToastError("Bạn không có quyền xoá báo cáo");
      } else if (err.code === "functions/failed-precondition") {
        handleToastError("Không được xoá báo cáo đã duyệt");
      } else {
        handleToastError("Không thể xoá báo cáo");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const groupedReportTasks = useMemo(() => {
    if (!reportTasks?.length) return [];

    return handleGroupReportWithField(reportTasks);
  }, [reportTasks, planTasks, targets, fields]);

  return (
    <>
      <style>{css}</style>
      <section className="page-head">
        <div>
          <div className="title-line align-items-center">
            <h1>
              {report.type} {report.title}
            </h1>
            <h6>
              <i>Tuần {report.subTitle}</i>
            </h6>

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
          <p>Đánh giá từng mục tiêu trong kế hoạch tháng của trẻ.</p>
        </div>

        {!isPending && (
          <button className="export-btn" onClick={handleExportWordBC}>
            <i className="bi bi-filetype-pdf"></i>
            Xuất báo cáo
          </button>
        )}
      </section>

      <section className="info-strip mb-3">
        <InfoTile
          icon="bi-person-check-fill"
          label="Giáo viên thực hiện"
          value={teacherMap[report.authorId]?.fullName}
          danger
        />
        <InfoTile
          icon="bi-calendar-plus"
          label="Ngày gửi"
          value={
            typeof report?.createAt === "number"
              ? moment(report?.createAt).format("HH:mm:ss DD/MM/YYYY")
              : moment(handleTimeStampFirestore(report?.createAt)).format(
                  "HH:mm:ss DD/MM/YYYY",
                )
          }
        />
        <InfoTile
          icon="bi-calendar-check"
          label="Ngày duyệt"
          value={
            (!isPending &&
              moment(handleTimeStampFirestore(report?.updateAt)).format(
                "HH:mm:ss DD/MM/YYYY",
              )) ||
            "Đang chờ..."
          }
          warning
        />
      </section>

      {isPending && isComment && (
        <div className="d-flex align-items-start justify-content-between comment-total text-danger">
          <div className="d-flex plan-hero feedback-box flex-grow-1 me-2 mb-2 rounded-4">
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
            className="btn action-btn-comment flex-shrink-0 mb-2"
            onClick={() => setHistoryComment(true)}
          >
            <i className="bi bi-send-check-fill me-2" />
            Lịch sử góp ý
          </button>
        </div>
      )}

      <section className="content-panel">
        <div className="content-head">
          <div>
            <h2>Bảng chi tiết báo cáo</h2>
            <p>Đánh giá từng mục tiêu trong kế hoạch tháng</p>
          </div>

          <span>
            <i className="bi bi-list-check"></i>
            {groupedReportTasks.length} mục tiêu
          </span>
        </div>

        <div className="desktop-table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Lĩnh vực</th>
                <th>Mục tiêu</th>
                <th>Nội dung</th>
                <th>Mức độ trẻ thực hiện</th>
                <th>Tổng kết</th>
              </tr>
            </thead>

            <tbody>
              {groupedReportTasks.map((item) => (
                <ReportItem
                  key={item.id}
                  reportTask={item}
                  setDisable={setDisable}
                  reportTasks={reportTasks}
                  onSetReportTasks={setReportTasks}
                  status={report.status}
                  interventions={interventions}
                  fieldMap={fieldMap}
                  targetMap={targetMap}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-card-list">
          {groupedReportTasks.map((item, index) => (
            <ReportMobileCard
              key={`mobile-card-${item.id}-${index}`}
              item={item}
              index={index + 1}
              reportTasks={reportTasks}
              setReportTasks={setReportTasks}
              setDisable={setDisable}
              status={report.status}
              interventions={interventions}
              fieldMap={fieldMap}
              targetMap={targetMap}
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
            <button
              style={{ background: !disable ? "green" : "gray" }}
              className="btn action-btn-primary"
              onClick={!disable ? handleSaveReportTask : undefined}
            >
              <i className="bi bi-save2-fill me-2" />
              Lưu chỉnh sửa
            </button>
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
                              {teacherMap[cmt.authorId]?.fullName}
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
            <h5 className="fw-black text-green-dark mb-2">Góp ý báo cáo</h5>
            <p className="text-green-muted small">
              Góp ý sẽ được gửi lại cho giáo viên chỉnh sửa trước khi duyệt báo
              cáo.
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
            <h5 className="fw-black text-danger mb-2">Xác nhận xoá báo cáo</h5>

            {/* Description */}
            <p className="text-green-muted small">
              Hành động này sẽ xoá toàn bộ nội dung báo cáo và không thể khôi
              phục.
            </p>

            {/* Plan info */}
            <div className="plan-delete-box mt-2">
              <div className="small">
                <strong>Tháng:</strong> {report.title}
              </div>
              <div className="small">
                <strong>Mã báo cáo:</strong> {report.id}
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
                onClick={handleDeleteReport}
              >
                <i className="bi bi-trash me-2" />
                Xoá báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay show={isLoading} />
    </>
  );
}

function ReportMobileCard({
  item,
  index,
  reportTasks,
  setReportTasks,
  setDisable,
  status,
  interventions,
  fieldMap,
  targetMap,
}: any) {
  // const [open, setOpen] = useState(index === 1);
  const [planTask, setPlanTask] = useState<any>();
  const [content, setContent] = useState("");
  const [contentSource, setContentSource] = useState("");
  const [intervention, setIntervention] = useState(["-1", "-1"]);

  useEffect(() => {
    if (item) {
      getDocData({
        id: item.planTaskId,
        nameCollect: "planTasks",
        setData: setPlanTask,
      });
      setContent(item.content);
      setContentSource(item.content);
      setIntervention(item.intervention);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    const index = reportTasks.findIndex((_: any) => _.id === item.id);
    if (content && content !== contentSource) {
      reportTasks[index].content = content;
      reportTasks[index].isEdit = true;
      setReportTasks(reportTasks);
    } else {
      reportTasks[index].isEdit = false;
    }

    const isEdit = reportTasks.some((reportTask: any) => reportTask.isEdit);
    setDisable(!isEdit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <article className="report-mobile-card">
      <div className="goal-tags">
        <span className="index-pill">{index}.</span>
        <span className="area-pill">{fieldMap[item.fieldId]?.name}</span>
        <span className="level-pill">
          Level: {targetMap[planTask?.targetId]?.level}
        </span>
      </div>

      <h3 style={{ textAlign: "justify" }}>
        {targetMap[planTask?.targetId]?.name}
      </h3>

      <div className="mobile-info-box">
        <strong>Mức độ trẻ thực hiện: </strong>
        <select
          disabled={status !== "pending"}
          className="support-select"
          value={(intervention && intervention[0]) || "-1"}
          onChange={(e) => {
            setIntervention((prev) => {
              const newIntervention = [...prev];
              newIntervention[0] = e.target.value; // cập nhật phần tử thứ 2
              return newIntervention;
            });
            const index = reportTasks.findIndex((_: any) => _.id === item.id);
            reportTasks[index].intervention[0] = e.target.value;
            setDisable(false);
          }}
        >
          <option value="-1">Tuần trước</option>
          {interventions.map((_: any) => (
            <option value={_.level} key={_.id}>
              {_.level} : {_.name}
            </option>
          ))}
        </select>
        <select
          disabled={status !== "pending"}
          className="support-select"
          value={(intervention && intervention[1]) || "-1"}
          onChange={(e) => {
            setIntervention((prev) => {
              const newIntervention = [...prev];
              newIntervention[1] = e.target.value; // cập nhật phần tử thứ 2
              return newIntervention;
            });
            const index = reportTasks.findIndex((_: any) => _.id === item.id);
            reportTasks[index].intervention[1] = e.target.value;
            setDisable(false);
          }}
        >
          <option value="-1">Tuần sau</option>
          {interventions.map((_: any) => (
            <option value={_.level} key={_.id}>
              {_.level} : {_.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mobile-info-box" style={{ textAlign: "justify" }}>
        <strong>Nội dung: </strong> {planTask?.content}
      </div>

      <div
        className="mobile-info-box result-box"
        style={{ textAlign: "justify" }}
      >
        <strong>Tổng kết: </strong>
        {status === "pending" ? (
          <textarea
            onChange={(e) => setContent(e.target.value)}
            className="form-control"
            placeholder="Nhập đánh giá"
            rows={6}
            cols={100}
            style={{ borderColor: colors.primary }}
            id="floatingTextarea2"
            value={content}
          ></textarea>
        ) : (
          content
        )}
      </div>

      {/* {open && (
        <div className="mobile-info-box result-box">
          <strong>Tổng kết: </strong>
          {status === "pending" ? (
            <textarea
              onChange={(e) => setContent(e.target.value)}
              className="form-control"
              placeholder="Nhập đánh giá"
              rows={6}
              cols={100}
              style={{ borderColor: colors.primary }}
              id="floatingTextarea2"
              value={content}
            ></textarea>
          ) : (
            content
          )}
        </div>
      )}

      <button className="expand-btn" onClick={() => setOpen(!open)}>
        <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
      </button> */}
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

/* Header */

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
  padding: 0 18px;
  border: 0;
  border-radius: 15px;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  color: #fff;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}


/* Info strip */

.info-strip {
  padding: 24px;
  border-radius: 26px;
  border: 1px solid var(--border);
  background:
    radial-gradient(circle at right, rgba(245, 180, 0, 0.18), transparent 36%),
    #fff;
  box-shadow: 0 16px 40px rgba(5, 107, 16, 0.08);
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
  font-size: 20px;
  flex-shrink: 0;
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

.info-tile span,
.info-tile strong {
  display: block;
}

.info-tile span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
}

.info-tile strong {
  color: var(--green-deep);
  font-size: 14px;
  overflow-wrap: anywhere;
}

.comment-total {
  flex-direction: row;
}
.page-panel,
.plan-detail-panel,
.goal-mobile-card,
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

.action-btn-comment {
  color: #fff;
  background: var(--yellow);
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
}

/* Content */

.content-panel {
  margin-top: 24px;
  padding: 24px;
  border-radius: 26px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(5, 107, 16, 0.08);
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

/* Desktop table */

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
  line-height: 1.6;
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
  // white-space: nowrap;
}

/* Pills */

.level-pill,
.index-pill,
.area-pill {
  width: fit-content;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 950;
}

.level-pill {
  // margin-top: 8px;
  padding: 6px 11px;
  background: #fff3cd;
  color: #9a6700;
}

.index-pill,
.area-pill {
  height: 30px;
  padding: 0 12px;
}

.index-pill {
  background: #fff3cd;
  color: #9a6700;
}

.area-pill {
  background: #dff7e4;
  color: var(--green-deep);
}

/* Mobile cards */

.mobile-card-list {
  display: none;
}

.report-mobile-card {
  position: relative;
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 12px 32px rgba(5, 107, 16, 0.08);
}

.goal-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.report-mobile-card h3 {
  margin: 0 0 16px;
  color: var(--green-deep);
  font-size: 17px;
  line-height: 1.45;
  font-weight: 950;
}

.mobile-info-box {
  margin-top: 12px;
  padding: 14px;
  border-radius: 16px;
  background: #f2fbf4;
  border: 1px solid var(--border);
  color: var(--muted);
  line-height: 1.6;
  font-weight: 700;
}

.mobile-info-box strong {
  color: var(--green-deep);
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

.result-box {
  background: #eef9f0;
}

.comment-total {
   flex-direction: row;
 }

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
  
.expand-btn {
  width: 46px;
  height: 46px;
  margin-top: 12px;
  margin-left: auto;
  border: 0;
  border-radius: 15px;
  background: var(--green);
  color: #fff;
  font-size: 20px;
  display: grid;
  place-items: center;
  cursor: pointer;
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
/* Responsive */

@media (max-width: 900px) {
  .page-head,
  .content-head {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
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

  // .director-comment-box {
  //   padding: 16px;
  //   border-radius: 20px;
  //   gap: 12px;
  // }

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
}
`;
