import { InterventionModel } from "../../models";

interface Props {
  addReport: any;
  interventions: InterventionModel[];
  onOpenAiModal: (report: any) => void;
  onChangeTotal: (id: string, value: string) => void;
  onSelectIntervention: (id: string, value: string, position: number) => void;
  fieldMap: any;
  targetMap: any;
}

export default function AddReportItem(props: Props) {
  const {
    addReport,
    onOpenAiModal,
    onChangeTotal,
    onSelectIntervention,
    interventions,
    fieldMap,
    targetMap,
  } = props;

  return (
    <tr>
      <td>
        <span className="area-pill">{fieldMap[addReport.fieldId]?.name}</span>
      </td>
      <td style={{ textAlign: "justify" }}>
        <strong>{targetMap[addReport.targetId]?.name}</strong>
        <div className="level-pill">
          {" "}
          Level: {targetMap[addReport.targetId]?.level}
        </div>
      </td>
      <td>{addReport.content || "Chưa có nội dung"}</td>
      <td>
        <select
          className="support-select"
          value={(addReport.intervention && addReport.intervention[0]) || "-1"}
          onChange={(e) =>
            onSelectIntervention(addReport.id, e.target.value, 0)
          }
        >
          <option value="-1">Tuần trước</option>
          {interventions.map((_) => (
            <option value={_.level} key={_.id}>
             {_.level} : {_.name}
            </option>
          ))}
        </select>
        <select
          className="support-select"
          value={(addReport.intervention && addReport.intervention[1]) || "-1"}
          onChange={(e) =>
            onSelectIntervention(addReport.id, e.target.value, 1)
          }
        >
          <option value="-1">Tuần sau</option>
          {interventions.map((_) => (
            <option value={_.level} key={_.id}>
              {_.level} : {_.name}
            </option>
          ))}
        </select>
      </td>
      <td className="observe-cell">
        <div className="summary-ai-wrap">
          <textarea
            className="form-control report-textarea"
            rows={4}
            placeholder="Nhập đánh giá, nhận xét..."
            value={addReport.total || ""}
            onChange={(e) => onChangeTotal(addReport.id, e.target.value)}
          />

          <button
            type="button"
            className="btn-ai-summary"
            onClick={() => onOpenAiModal(addReport)}
          >
            <i className="bi bi-stars me-1" />
            Dùng AI
          </button>
        </div>
      </td>
    </tr>
  );
}
