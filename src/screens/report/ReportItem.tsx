import { useEffect, useState } from "react";
import { getDocData } from "../../constants/firebase/getDocData";
import { ReportTaskModel } from "../../models";

interface Props {
  reportTask: any;
  reportTasks: ReportTaskModel[];
  onSetReportTasks: any;
  setDisable: any;
  status: string;
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
    fieldMap,
    targetMap,
  } = props;
  const [planTask, setPlanTask] = useState<any>();
  const [content, setContent] = useState("");
  const [contentSource, setContentSource] = useState("");

  useEffect(() => {
    if (reportTask) {
      getDocData({
        id: reportTask.planTaskId,
        nameCollect: "planTasks",
        setData: setPlanTask,
      });
      setContent(reportTask.content);
      setContentSource(reportTask.content);
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
      <td style={{ width: "8%" }} className="area-cell">{fieldMap[reportTask.fieldId]?.name}</td>
      <td style={{ width: "20%", textAlign: "justify" }}>
        <strong className="me-2">{targetMap[planTask?.targetId]?.name}</strong>
        <div className="level-pill">
          Level: {targetMap[planTask?.targetId]?.level}
        </div>
      </td>
      <td style={{ width: "30%", textAlign: "justify" }}>{planTask?.content}</td>
      <td style={{ width: "10%" }}>
        {planTask?.intervention}
      </td>
      <td style={{ width: "32%" }}>
        {status === "pending" ? (
          <textarea
            style={{ textAlign: "justify" }}
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
