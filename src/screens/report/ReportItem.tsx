import { useEffect, useState } from "react";
import { getDocData } from "../../constants/firebase/getDocData";
import { InterventionModel, ReportTaskModel } from "../../models";

interface Props {
  reportTask: any;
  reportTasks: ReportTaskModel[];
  onSetReportTasks: any;
  setDisable: any;
  status: string;
  interventions: InterventionModel[];
  fieldMap: any;
  targetMap: any;
}

export default function ReportItem(props: Props) {
  const {
    reportTask,
    reportTasks,
    onSetReportTasks,
    setDisable,
    status,
    interventions,
    fieldMap,
    targetMap,
  } = props;
  const [planTask, setPlanTask] = useState<any>();
  const [content, setContent] = useState("");
  const [contentSource, setContentSource] = useState("");
  const [intervention, setIntervention] = useState(["-1", "-1"]);

  useEffect(() => {
    if (reportTask) {
      getDocData({
        id: reportTask.planTaskId,
        nameCollect: "planTasks",
        setData: setPlanTask,
      });
      setContent(reportTask.content);
      setContentSource(reportTask.content);
      setIntervention(reportTask.intervention);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportTask]);

  useEffect(() => {
    const index = reportTasks.findIndex((_) => _.id === reportTask.id);
    if (content && content !== contentSource) {
      reportTasks[index].content = content;
      reportTasks[index].isEdit = true;
      onSetReportTasks(reportTasks);
    } else {
      reportTasks[index].isEdit = false;
    }

    const isEdit = reportTasks.some((reportTask) => reportTask.isEdit);
    setDisable(!isEdit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <tr>
      <td className="area-cell">{fieldMap[reportTask.fieldId]?.name}</td>
      <td style={{ width: "25%", textAlign: "justify" }}>
        <strong className="me-2">{targetMap[planTask?.targetId]?.name}</strong>
        <div className="level-pill">
          Level: {targetMap[planTask?.targetId]?.level}
        </div>
      </td>
      <td style={{ width: "20%" }}>{planTask?.content}</td>
      <td style={{ width: "20%" }}>
        <select
          disabled={status !== "pending"}
          className="support-select"
          value={(intervention && intervention[0]) || "-1"}
          onChange={(e) => {
            // setIntervention(e.target.value)
            setIntervention((prev) => {
              const newIntervention = [...prev];
              newIntervention[0] = e.target.value; // cập nhật phần tử đầu tiên
              return newIntervention;
            });
            const index = reportTasks.findIndex((_) => _.id === reportTask.id);
            reportTasks[index].intervention[0] = e.target.value;
            setDisable(false);
          }}
        >
          <option value="-1">Tuần trước</option>
          {interventions.map((_) => (
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
            const index = reportTasks.findIndex((_) => _.id === reportTask.id);
            reportTasks[index].intervention[1] = e.target.value;
            setDisable(false);
          }}
        >
          <option value="-1">Tuần sau</option>
          {interventions.map((_) => (
            <option value={_.level} key={_.id}>
              {_.level} : {_.name}
            </option>
          ))}
        </select>
      </td>
      <td style={{ width: "25%" }}>
        {status === "pending" ? (
          <textarea
            onChange={(e) => setContent(e.target.value)}
            className="form-control report-textarea"
            placeholder="Nhập đánh giá"
            rows={5}
            value={content}
          />
        ) : (
          <div className="report-content-text">{content}</div>
        )}
      </td>
    </tr>
  );
}
