import { serverTimestamp, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addDocData } from "../../constants/firebase/addDocData";
import { deleteDocData } from "../../constants/firebase/deleteDocData";
import { getDocsData } from "../../constants/firebase/getDocsData";
import { activeCategoryDefault, fieldOrder } from "../../constants/info";
import { showUIIconTarget } from "../../constants/showUIIconTarget";
import { PlanTaskModel, ReportTaskModel, TargetModel } from "../../models";
import { CartModel } from "../../models/CartModel";
import {
  useCartStore,
  useChildStore,
  useFieldStore,
  usePlanTaskStore,
  useSelectNavbarStore,
  useTargetStore,
  useTotalPlanTaskStore,
  useTotalReportTaskStore,
  useUserStore,
} from "../../zustand";
import LoadingOverlay from "../../components/LoadingOverLay";

type LevelMap = Record<number, any[]>; // 1 | 2 | 3 | 4
export default function BankScreen() {
  const { setSelectNavbar } = useSelectNavbarStore();
  const [activeCategory, setActiveCategory] = useState(activeCategoryDefault);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const { user } = useUserStore();
  const { fields } = useFieldStore();
  const { targets } = useTargetStore();
  const { totalPlanTasks } = useTotalPlanTaskStore();
  const { totalReportTasks } = useTotalReportTaskStore();
  const { carts, removeCart, addCart } = useCartStore();
  const { planTasks, setPlanTasks } = usePlanTaskStore();
  const { child } = useChildStore();

  const selectedIds = useMemo(() => {
    return new Set(carts.map((cart: CartModel) => cart.targetId));
  }, [carts]);

  useEffect(() => {
    if (id) {
      getDocsData({
        nameCollect: "planTasks",
        condition: [
          where("teacherIds", "array-contains", user?.id),
          where("childId", "==", id),
        ],
        setData: setPlanTasks,
      });
    }
  }, [id]);

  const activeCategoryInfo = useMemo(() => {
    if (!fields.length) return null;
    return fields.find((item) => item.id === activeCategory) || null;
  }, [fields, activeCategory]);

  const filteredGoals = useMemo(() => {
    if (!targets.length) return [];

    const search = keyword.trim().toLowerCase();

    return targets.filter((target) => {
      const matchCategory = target.fieldId === activeCategory;

      const matchSearch =
        !search ||
        `${target.name ?? ""} Level: ${String(target.level ?? "")}`
          .toLowerCase()
          .includes(search);

      return matchCategory && matchSearch;
    });
  }, [targets, activeCategory, keyword]);

  const toggleGoal = async (target: TargetModel) => {
    if (!user || !child || isLoading) return;

    const existingCart = carts.find(
      (cart: CartModel) => cart.targetId === target.id,
    );

    setIsLoading(true);

    try {
      // ❌ ĐÃ TỒN TẠI → XÓA
      if (existingCart) {
        await deleteDocData({
          nameCollect: "carts",
          id: existingCart.id,
          metaDoc: "carts",
        });

        removeCart(existingCart.id);
        return;
      }

      // ✅ CHƯA CÓ → THÊM
      const cartValue = {
        targetId: target.id,
        level: target.level,
        name: target.name,
        fieldId: target.fieldId,

        content: target.content || "",
        intervention: "",
        childId: child.id,
        teacherIds: child.teacherIds,
        authorId: user.id,

        createAt: serverTimestamp(),
        updateAt: serverTimestamp(),
      };

      const result = await addDocData({
        nameCollect: "carts",
        value: cartValue,
        metaDoc: "carts",
      });

      addCart({
        ...cartValue,
        id: result.id,
      });
    } catch (err) {
      console.error("toggleGoal error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <style>{css}</style>

      <section className="page-title">
        <h1>Ngân hàng mục tiêu</h1>
        <p>
          Giáo viên tích chọn mục tiêu phù hợp để đưa vào kế hoạch tháng cho
          trẻ.
        </p>
      </section>

      <section className="category-panel">
        <div className="panel-head">
          <div>
            <h3>Lĩnh vực mục tiêu</h3>
            <p>Chọn lĩnh vực để xem mục tiêu chi tiết</p>
          </div>

          <div className="viewing">
            Đang xem: <b>{activeCategoryInfo?.name}</b>
          </div>
        </div>

        <div className="category-scroll">
          {fields.length > 0 &&
            fields
              .sort((a, b) => {
                return fieldOrder.indexOf(a.id) - fieldOrder.indexOf(b.id);
              })
              .map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  targets={targets}
                  totalPlanTasks={totalPlanTasks}
                  totalReportTasks={totalReportTasks}
                  active={category.id === activeCategory}
                  selectedIds={selectedIds}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
        </div>
      </section>

      <section className="toolbar">
        <div className="search-box">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm mục tiêu, level (level: 3)"
          />
        </div>

        <div className="selected-pill">
          <i className="bi bi-cart-check"></i>
          Đã chọn {selectedIds.size} mục tiêu
        </div>
        {
          carts.length > 0 &&
          <Link
            to="../cart"
            className="plan-btn text-decoration-none"
            onClick={() => setSelectNavbar("cart")}
          >
            <i className="bi bi-calendar2-plus-fill me-2"></i>
            Tạo kế hoạch tháng
          </Link>
        }
      </section>

      <section className="goal-section">
        <div className="goal-title">
          <h3>Mục tiêu: {activeCategoryInfo?.name}</h3>
          <span>{filteredGoals.length} mục tiêu phù hợp bộ lọc</span>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="page-panel p-5 text-center text-green-muted">
            <i
              className="bi bi-search fs-1 d-block mb-3"
              style={{ color: "var(--yellow)" }}
            />
            Không tìm thấy mục tiêu phù hợp.
          </div>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mục tiêu</th>
                  <th>Mức độ</th>
                  <th>Chọn</th>
                </tr>
              </thead>

              <tbody>
                {filteredGoals
                  .sort((a, b) => a.level - b.level)
                  .map((goal, index) => {
                    const isSelectedTarget = planTasks.some(
                      (planTask: PlanTaskModel) =>
                        planTask.targetId === goal.id,
                    );
                    return (
                      <tr
                        key={`goal-${goal.id}-${index}`}
                        className={
                          selectedIds.has(goal.id) ? "table-success" : ""
                        }
                      >
                        <td> {index + 1}</td>
                        <td>
                          <label
                            htmlFor={`goal-${goal.id}`}
                            className={`goal-cursor-pointer mb-0 ${isSelectedTarget
                              ? "fst-italic text-green-dark"
                              : ""
                              }`}
                          >
                            {goal.name}
                          </label>
                        </td>
                        <td>
                          <span className="level">{goal.level}</span>
                        </td>
                        <td>
                          <input
                            id={`goal-${goal.id}`}
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedIds.has(goal.id)}
                            onChange={() => toggleGoal(goal)}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <LoadingOverlay show={isLoading} />
    </>
  );
}

function CategoryCard({
  category,
  active,
  onClick,
  targets,
  totalReportTasks,
  totalPlanTasks,
  selectedIds,
}: any) {
  function calculateProgressPercent(
    baseLevels: LevelMap, // A
    reportLevels: LevelMap, // B
  ): number {
    const getRatio = (level: number) => {
      const baseCount = baseLevels[level]?.length || 0;
      const reportCount = reportLevels[level]?.length || 0;

      if (baseCount === 0) return 0;
      return reportCount / baseCount;
    };

    if (reportLevels[4]?.length) {
      return 75 + getRatio(4) * 25;
    }

    if (reportLevels[3]?.length) {
      return 50 + getRatio(3) * 25;
    }

    if (reportLevels[2]?.length) {
      return 25 + getRatio(2) * 25;
    }

    if (reportLevels[1]?.length) {
      return getRatio(1) * 25;
    }

    return 0;
  }
  const getLevelMapFromTargets = (targetIds: string[], fieldId: string) => {
    const targetIdSet = new Set(targetIds);

    const levelMap: Record<number, TargetModel[]> = {};

    for (const target of targets) {
      // 1️⃣ chỉ lấy target có id nằm trong report
      if (!targetIdSet.has(target.id)) continue;

      // 2️⃣ đúng field
      if (target.fieldId !== fieldId) continue;

      // 3️⃣ gom theo level
      (levelMap[target.level] ||= []).push(target);
    }

    return levelMap;
  };
  const getTargetIdsFromReportTasks = (
    reportTasks: ReportTaskModel[],
    planTasks: PlanTaskModel[],
  ): string[] => {
    // Map tra nhanh planTaskId → targetId
    const planTaskTargetMap = new Map<string, string>(
      planTasks.map((pt) => [pt.id, pt.targetId]),
    );

    const targetIdSet = new Set<string>();

    for (const rt of reportTasks) {
      const targetId = planTaskTargetMap.get(rt.planTaskId);
      if (targetId) {
        targetIdSet.add(targetId);
      }
    }

    return Array.from(targetIdSet);
  };
  const selectedCountByField = useMemo(() => {
    const countMap: Record<string, number> = {};

    targets.forEach((target: TargetModel) => {
      if (selectedIds.has(target.id)) {
        const fieldId = target.fieldId;

        if (!countMap[fieldId]) {
          countMap[fieldId] = 0;
        }

        countMap[fieldId] += 1;
      }
    });

    return countMap;
  }, [targets, selectedIds]);
  const baseLevels = getLevelMapFromTargets(
    targets.map((_: any) => _.id),
    category.id,
  );
  const reportLevels = getLevelMapFromTargets(
    getTargetIdsFromReportTasks(totalReportTasks, totalPlanTasks),
    category.id,
  );
  return (
    <button
      key={category.id}
      className={`category-card ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <img
        src={`/icons/${showUIIconTarget(category.name)}`}
        alt={category.name}
        style={{ width: 100, height: 100, objectFit: "cover" }}
      />
      <h4>{category.name}</h4>

      <div className="cat-meta">
        <span>
          {targets.filter((_: any) => _.fieldId === category.id).length} mục
          tiêu
        </span>
        <b>{selectedCountByField[category.id] ?? 0} chọn</b>
      </div>

      <div className="cat-progress">
        <div
          style={{
            width: `${Number(calculateProgressPercent(baseLevels, reportLevels).toFixed(2))}%`,
          }}
        />
      </div>

      <strong className="percent">
        {Number(calculateProgressPercent(baseLevels, reportLevels).toFixed(2))}%
      </strong>
    </button>
  );
}

const css = `
:root {
  --green: #118c17;
  --green-dark: #056b10;
  --green-deep: #03490b;
  --green-soft: #e5f8e8;
  --border: #cbe8d0;
  --red: #ef4444;
  --yellow: #f5b400;
  --text: #073f0c;
  --muted: #527d57;
}

* {
  box-sizing: border-box;
}

.page-title {
  padding: 28px 0 18px;
}

.page-title h1 {
  margin: 0;
  color: var(--green-deep);
  font-size: 36px;
  font-weight: 950;
}

.page-title p {
  margin: 6px 0 0;
  color: var(--muted);
  font-weight: 650;
}

/* CATEGORY */

.category-panel,
.toolbar,
.table-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 14px 36px rgba(5, 107, 16, 0.07);
}

.category-panel {
  padding: 22px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.panel-head h3,
.goal-title h3 {
  margin: 0;
  color: var(--green-deep);
  font-size: 28px;
  font-weight: 950;
}

.panel-head p {
  margin: 4px 0 0;
  color: var(--muted);
  font-weight: 600;
}

.viewing {
  color: #315d36;
  font-weight: 800;
  white-space: nowrap;
}

.viewing i {
  margin-left: 8px;
}

.category-scroll {
  margin-top: 16px;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 14px;
}

.category-scroll::-webkit-scrollbar {
  height: 8px;
}

.category-scroll::-webkit-scrollbar-thumb {
  background: #93c59a;
  border-radius: 999px;
}

.category-card {
  min-width: 175px;
  height: 260px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--green-deep);
  padding: 18px 14px;
  text-align: center;
  transition: 0.2s ease;
  cursor: pointer;
}

.category-card:hover,
.category-card.active {
  border-color: var(--green);
  box-shadow: 0 14px 30px rgba(17, 140, 23, 0.15);
  transform: translateY(-2px);
}

.category-card i {
  font-size: 48px;
  color: var(--green-dark);
}

.category-card h4 {
  margin: 14px 0;
  font-size: 15px;
  font-weight: 950;
  padding: 0 12px;
}

.cat-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: var(--muted);
}

.cat-meta b {
  color: var(--red);
}

.cat-progress {
  height: 8px;
  margin-top: 10px;
  border-radius: 999px;
  background: #dff7e4;
  overflow: hidden;
}

.cat-progress div {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--green), var(--yellow));
}

.percent {
  display: block;
  margin-top: 8px;
  text-align: right;
  color: var(--green-deep);
}

/* TOOLBAR */

.toolbar {
  margin-top: 18px;
  padding: 18px;
  display: grid;
  grid-template-columns: 1fr 200px 200px 260px;
  gap: 14px;
}

.search-box {
  height: 48px;
  border-radius: 16px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
}

.search-box i {
  color: var(--green);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  color: var(--text);
  font-weight: 600;
}

.selected-pill,
.plan-btn {
  height: 48px;
  border: 0;
  border-radius: 16px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-pill {
  background: var(--green-soft);
  color: var(--green-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.plan-btn {
  color: #fff;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
}

/* TABLE */

.goal-section {
  margin-top: 24px;
}

.goal-title span {
  color: var(--muted);
  font-weight: 650;
}

.table-card {
  margin-top: 14px;
  overflow-x: auto;
}

// .table-card table {
//   width: 100%;
//   min-width: 900px;
//   border-collapse: collapse;
// }

.table-card {
  margin-top: 14px;
  overflow-x: hidden;
}

.table-card table {
  width: 100%;
  min-width: 0;
  table-layout: fixed;
  border-collapse: collapse;
}

.table-card th,
.table-card td {
  padding: 12px 10px;
  border-bottom: 1px solid #e2eee5;
  font-size: 15px;
  vertical-align: middle;
}

.table-card th:first-child,
.table-card td:first-child {
  width: 48px;
  text-align: center;
}

.table-card th:nth-child(3),
.table-card td:nth-child(3) {
  width: 100px;
  text-align: center;
}

.table-card th:nth-child(4),
.table-card td:nth-child(4) {
  width: 56px;
  text-align: center;
}

.table-card th:nth-child(2),
.table-card td:nth-child(2) {
  width: auto;
  white-space: normal;
  word-break: break-word;
}

.table-card thead {
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  color: #fff;
}

.table-card th,
.table-card td {
  padding: 14px 16px;
  border-bottom: 1px solid #e2eee5;
  font-size: 16px;
  vertical-align: middle;
}

.area,
.level {
  display: inline-block;
  padding: 6px 11px;
  border-radius: 999px;
  background: #dff7e4;
  color: var(--green-deep);
  font-size: 12px;
  font-weight: 900;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button,
.pagination-box button {
  border: 0;
  background: var(--green-soft);
  color: var(--green);
  font-weight: 900;
  cursor: pointer;
}

.actions button {
  width: 34px;
  height: 34px;
  border-radius: 12px;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--green);
}

.table-success {
  background: var(--green-soft);}

.text-green-dark { color: var(--red) !important; }

.goal-cursor-pointer {
  cursor: pointer !important;
}

.pagination-box {
  display: flex;
  gap: 6px;
}

.pagination-box button {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: var(--green-deep);
}

.pagination-box button.active {
  background: var(--green);
  color: #fff;
}

/* RESPONSIVE */

@media (max-width: 1200px) {
  .toolbar {
    grid-template-columns: 1fr 120px;
  }
}

@media (max-width: 900px) {
  .page-title h1 {
    font-size: 30px;
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .page-title {
    padding-top: 14px;
  }

  .page-title h1 {
    font-size: 28px;
  }

  .category-panel {
    padding: 16px;
  }

  .panel-head h3,
  .goal-title h3 {
    font-size: 24px;
  }

  .category-card {
    min-width: 160px;
    height: 260px;
  }

  .selected-pill,
  .plan-btn {
    width: 100%;
  }

  .table-card {
    overflow-x: auto;
  }

  .table-card th,
  .table-card td {
    padding: 10px 6px;
    font-size: 13px;
  }

  .table-card th:first-child,
  .table-card td:first-child {
    width: 38px;
  }

  .table-card th:nth-child(3),
  .table-card td:nth-child(3) {
    width: 60px;
  }

  .table-card th:nth-child(4),
  .table-card td:nth-child(4) {
    width: 48px;
  }

  .level {
    padding: 4px 8px;
    font-size: 11px;
  }
}
`;
