interface Props {
  addReport: any;
  onOpenAiModal: (report: any) => void;
  onChangeTotal: (id: string, value: string) => void;
  fieldMap: any;
  targetMap: any;
}

export default function AddReportItem(props: Props) {
  const { addReport, onOpenAiModal, onChangeTotal, fieldMap, targetMap } =
    props;

  return (
    <tr>
      <td>
        <span className="area-pill">{fieldMap[addReport.fieldId]?.name}</span>
      </td>
      <td style={{ textAlign: "justify" }}>
        <strong>{targetMap[addReport.targetId]?.name}</strong>
        <div className="level-pill">
          Level: {targetMap[addReport.targetId]?.level}
        </div>
      </td>
      <td style={{ textAlign: "justify" }}>
        {addReport.content || "Chưa có nội dung"}
      </td>
      <td>{addReport.intervention || "Chưa có"}</td>
      <td className="observe-cell">
        <div className="summary-ai-wrap">
          <textarea
            className="form-control report-textarea"
            style={{textAlign: 'justify'}}
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
