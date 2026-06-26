import { httpsCallable } from "firebase/functions";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverLay";
import { deleteDocData } from "../../constants/firebase/deleteDocData";
import { getDocData } from "../../constants/firebase/getDocData";
import { updateDocData } from "../../constants/firebase/updateDocData";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { getCurrentMonth, getNextMonth, getPreviousMonth } from "../../constants/info";
import { functions } from "../../firebase.config";
import { PlanModel } from "../../models";
import {
  useCartEditStore,
  useCartStore,
  useChildStore,
  useFieldStore,
  useInterventionStore,
  usePlanStore,
  useSelectNavbarStore,
  useUserStore,
} from "../../zustand";

export default function CartScreen() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const { setSelectNavbar } = useSelectNavbarStore();
  const { carts, setCarts } = useCartStore();
  const { addPlan, editPlan, plans } = usePlanStore();
  const { child } = useChildStore();
  const { user } = useUserStore();
  const { cartEdit, setCartEdit } = useCartEditStore(); // thực tế nó chỉ là planId thôi
  const [title, setTitle] = useState(getCurrentMonth());
  const [isLoading, setIsLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const [plan, setPlan] = useState<PlanModel>();
  const { fields } = useFieldStore();
  const { interventions } = useInterventionStore();

  const fieldMap = useMemo(() => {
    const map: any = {};

    fields.forEach((field) => {
      map[field.id] = field.name;
    });

    return map;
  }, [fields]);

  useEffect(() => {
    if (carts.length > 0) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [carts]);

  useEffect(() => {
    if (cartEdit) {
      getDocData({ id: cartEdit, nameCollect: "plans", setData: setPlan });
    }
  }, [cartEdit]);

  useEffect(() => {
    if (plan) {
      setTitle(plan.title);
    }
  }, [plan]);

  const handleSaveCart = () => {
    setIsLoading(true);
    const promiseItems = carts.map((cart) =>
      updateDocData({
        nameCollect: "carts",
        id: cart.id,
        valueUpdate: cart,
        metaDoc: "carts",
      }),
    );

    Promise.all(promiseItems)
      .then(() => {
        handleToastSuccess("Lưu nháp giỏ mục tiêu thành công !");
      })
      .catch((error) => {
        handleToastError("Lưu nháp giỏ mục tiêu thất bại !");
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleAddEditPlan = async () => {
    if (!user || !child) return;

    setIsLoading(true);

    try {
      if (!cartEdit) {
        const res: any = await httpsCallable(
          functions,
          "createPlanFromCarts",
        )({
          title,
          childId: child.id,
          carts,
        });

        addPlan({
          id: res.data.planId,
          type: "KH",
          title,
          childId: child.id,
          teacherIds: child.teacherIds,
          authorId: user.id,
          status: "pending",
          comment: "",
          updateById: user.id,
          createAt: Date.now(),
          updateAt: Date.now(),
        });

        handleToastSuccess("Thêm mới kế hoạch thành công !");
      } else {
        await httpsCallable(
          functions,
          "updatePlanFromCarts",
        )({
          planId: cartEdit,
          childId: child.id,
          carts,
          title
        });

        const index = plans.findIndex((item) => item.id === cartEdit);

        if (index !== -1) {
          editPlan(cartEdit, {
            ...plans[index],
            title,
            updateById: user.id,
            updateAt: Date.now(),
          });
        }

        handleToastSuccess("Chỉnh sửa kế hoạch thành công !");
      }

      setCarts([]);
      setTitle("");
      setCartEdit(null);

      navigate("../pending");
      setSelectNavbar("pending");
    } catch (error) {
      console.log(error);
      handleToastError(
        cartEdit
          ? "Chỉnh sửa kế hoạch thất bại !"
          : "Thêm mới kế hoạch thất bại !",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGoals = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return carts.filter((cart: any) => {
      const fieldName = fieldMap[cart.fieldId] || "";

      const content = `
      ${fieldName}
      ${cart.level ?? ""}
      ${cart.name ?? ""}
      ${cart.content ?? ""}
    `.toLowerCase();

      return !search || content.includes(search);
    });
  }, [carts, keyword, fieldMap]);

  return (
    <>
      <style>{css}</style>
      <section className="page-head">
        <div>
          <h1>Giỏ mục tiêu</h1>
          <p>Kiểm tra, chỉnh sửa và tạo kế hoạch can thiệp tháng cho trẻ.</p>
        </div>

        <Link
          to="../bank"
          onClick={() => setSelectNavbar("bank")}
          className="bank-btn text-decoration-none"
        >
          <i className="bi bi-bank2"></i>
          Thêm mục tiêu từ ngân hàng
        </Link>
      </section>

      <section className="filter-panel">
        <div className="search-box">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm mục tiêu trong giỏ..."
          />
        </div>

        <div className="status-tabs">
          <button className={"active"}>{filteredGoals.length} mục tiêu</button>
        </div>
      </section>

      <section className="cart-layout">
        <div className="goal-list">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              fieldMap={fieldMap}
              interventions={interventions}
            />
          ))}

          {filteredGoals.length === 0 && (
            <div className="empty-box">
              <i className="bi bi-cart-x"></i>
              <h3>Không có mục tiêu phù hợp</h3>
              <p>
                Hãy thêm mục tiêu từ ngân hàng hoặc thay đổi từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </div>

        <aside className="plan-panel">
          <h3>Tạo kế hoạch tháng</h3>

          <label>Tháng kế hoạch</label>
          {/* <select>
            <option
              defaultValue={`${cartEdit ? plan?.title : getCurrentMonth()}`}
            >
              {cartEdit ? plan?.title : getCurrentMonth()}
            </option>
          </select> */}

          <select
            className="form-select filter-select"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          >
            <option value={getPreviousMonth()}>{getPreviousMonth()}</option>
            <option value={getCurrentMonth()}>{getCurrentMonth()}</option>
            <option value={getNextMonth()}>{getNextMonth()}</option>
          </select>

          <div className="total-row">
            <span>Tổng mục tiêu</span>
            <strong>{carts.length}</strong>
          </div>

          {!cartEdit && (
            <button
              className="save-btn"
              onClick={disable ? undefined : handleSaveCart}
              disabled={disable}
            >
              <i className="bi bi-save-fill"></i>
              Lưu nháp
            </button>
          )}

          <button
            className="submit-btn"
            onClick={disable ? undefined : handleAddEditPlan}
            disabled={disable}
          >
            {cartEdit ? (
              <>
                <i className="bi bi-floppy-fill me-2" />
                Lưu kế hoạch
              </>
            ) : (
              <>
                <i className="bi bi-send-fill"></i>
                Gửi chờ duyệt
              </>
            )}
          </button>
        </aside>
      </section>

      <LoadingOverlay show={isLoading} />
    </>
  );
}

function GoalCard({
  goal,
  fieldMap,
  interventions
}: {
  goal: any;
  fieldMap: any;
  interventions: any[]
}) {
  const { removeCart, editCart } = useCartStore();
  const handleSelectIntervention = (val: string) => {
    editCart(goal.id, { ...goal, intervention: val });
  };

  return (
    <article className="goal-card">
      <button
        className="remove-btn"
        onClick={() => {
          removeCart(goal.id);
          deleteDocData({
            nameCollect: "carts",
            id: goal.id,
            metaDoc: "carts",
          });
        }}
      >
        <i className="bi bi-trash3-fill"></i>
      </button>

      <div className="goal-tags">
        <span className="area-tag">
          <i className="bi bi-flower1"></i>
          {fieldMap[goal.fieldId]}
        </span>
        <span className="level-tag">Level {goal.level}</span>
      </div>

      <h6>{goal.name}</h6>

      <div className="desc-box">
        <span>
          <i className="bi bi-card-text"></i>
          Mô tả
        </span>
        <p>{goal.content || "Chưa có mô tả cho mục tiêu này. Liên hệ Admin"}</p>
      </div>

      <select className="support-select" value={goal.intervention}
        onChange={(val) => handleSelectIntervention(val.target.value)}>
        <option value="">Chọn mức độ hỗ trợ</option>
        {interventions.map((_) => (
          <option value={_.name} key={_.id}>
            {_.name}
          </option>
        ))}
      </select>
    </article>
  );
}

const css = `
:root {
  --green: #118c17;
  --green-dark: #056b10;
  --green-deep: #03490b;
  --green-soft: #e9f8eb;
  --border: #cbe8d0;
  --red: #ef4444;
  --yellow: #f5b400;
  --text: #073f0c;
  --muted: #527d57;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  color: var(--text);
  background: #eef9f0;
}

/* PAGE HEAD */

.page-head {
  padding: 28px 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.page-head h1 {
  margin: 0;
  color: var(--green-deep);
  font-size: 36px;
  font-weight: 950;
}

.page-head p {
  margin: 6px 0 0;
  color: var(--muted);
  font-weight: 650;
}

.bank-btn {
  height: 46px;
  border: 0;
  border-radius: 15px;
  padding: 0 18px;
  color: #fff;
  font-weight: 900;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

/* SUMMARY */

// .summary-grid {
//   display: grid;
//   grid-template-columns: repeat(4, 1fr);
//   gap: 16px;
//   margin-bottom: 22px;
// }

.summary-card {
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 14px 34px rgba(5, 107, 16, 0.07);
  display: flex;
  align-items: center;
  gap: 14px;
}

.summary-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--green-soft);
  color: var(--green);
  display: grid;
  place-items: center;
  font-size: 24px;
  flex-shrink: 0;
}

.summary-card.warning .summary-icon {
  background: #fff7d6;
  color: var(--yellow);
}

.summary-card p {
  margin: 0;
  color: var(--muted);
  font-weight: 800;
}

.summary-card h3 {
  margin: 2px 0 0;
  color: var(--green-deep);
  font-size: 30px;
  font-weight: 950;
}

/* FILTER */

.filter-panel {
  padding: 18px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 14px 36px rgba(5, 107, 16, 0.07);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
  align-items: center;
}

.search-box {
  height: 50px;
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
  background: transparent;
  font-weight: 600;
}


.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tabs button {
  height: 42px;
  border: 0;
  border-radius: 999px;
  padding: 0 16px;
  background: var(--green-soft);
  color: var(--green-deep);
  font-weight: 900;
  cursor: pointer;
}

.status-tabs button.active {
  background: var(--green-soft);
  color: var(--green);
}

// .clear-btn {
//   height: 46px;
//   border: 0;
//   border-radius: 15px;
//   padding: 0 18px;
//   background: #ffe1e1;
//   color: var(--red);
//   font-weight: 900;
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   white-space: nowrap;
// }

/* LAYOUT */

.cart-layout {
  margin-top: 22px;
  display: grid;
  grid-template-columns: 1fr 330px;
  gap: 22px;
  align-items: start;
}

.goal-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
}

/* GOAL CARD */

.goal-card {
  position: relative;
  padding: 20px;
  border-radius: 26px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(5, 107, 16, 0.08);
  transition: 0.22s ease;
}

.goal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 55px rgba(5, 107, 16, 0.15);
}

.remove-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 13px;
  background: #ffe1e1;
  color: var(--red);
  font-size: 15px;
}

.goal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-right: 46px;
}

.area-tag,
.level-tag {
  min-height: 32px;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.area-tag {
  background: #dff7e4;
  color: var(--green-deep);
}

.level-tag {
  background: #fff7d6;
  color: #9a6700;
}

.goal-card h6 {
  margin: 16px 0;
  color: var(--green-deep);
  font-size: 16px;
  font-weight: 950;
  line-height: 1.35;
  text-align: justify;
}

.desc-box {
  padding: 14px;
  border-radius: 18px;
  background: #f7fff8;
  border: 1px solid var(--border);
}

.desc-box span {
  color: var(--green);
  font-size: 13px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
}

.desc-box p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
  font-weight: 650;
  line-height: 1.55;
  text-align: justify;
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

/* EMPTY */

.empty-box {
  grid-column: 1 / -1;
  padding: 42px 20px;
  border-radius: 26px;
  background: #fff;
  border: 1px dashed var(--border);
  text-align: center;
  color: var(--muted);
}

.empty-box i {
  font-size: 52px;
  color: var(--green);
}

.empty-box h3 {
  margin: 14px 0 6px;
  color: var(--green-deep);
  font-weight: 950;
}

.empty-box p {
  margin: 0;
  font-weight: 650;
}

/* PLAN PANEL */

.plan-panel {
  position: sticky;
  top: 20px;
  padding: 22px;
  border-radius: 26px;
  background: #fff;
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(5, 107, 16, 0.08);
}

.plan-panel h3 {
  margin: 0 0 18px;
  color: var(--green-deep);
  font-size: 24px;
  font-weight: 950;
}

.plan-panel label {
  display: block;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 900;
}

.total-row {
  margin-top: 18px;
  padding: 14px;
  border-radius: 18px;
  background: #f7fff8;
  border: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-row span {
  color: var(--muted);
  font-weight: 800;
}

.total-row strong {
  color: var(--green-deep);
  font-size: 26px;
  font-weight: 950;
}

// .plan-summary {
//   margin-top: 14px;
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   gap: 10px;
// }

// .plan-summary div {
//   padding: 12px 8px;
//   border-radius: 16px;
//   background: var(--green-soft);
//   text-align: center;
// }

// .plan-summary b {
//   display: block;
//   color: var(--green-deep);
//   font-size: 22px;
//   font-weight: 950;
// }

// .plan-summary span {
//   color: var(--muted);
//   font-size: 12px;
//   font-weight: 800;
// }

.save-btn,
.submit-btn {
  width: 100%;
  height: 48px;
  margin-top: 12px;
  border-radius: 16px;
  font-weight: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-btn {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--green-deep);
}

.submit-btn {
  border: 0;
  background: linear-gradient(135deg, var(--green), var(--green-dark));
  color: #fff;
}

/* RESPONSIVE */

@media (max-width: 1400px) {
  // .summary-grid {
  //   grid-template-columns: repeat(2, 1fr);
  // }

  .cart-layout {
    grid-template-columns: 1fr;
  }

  .plan-panel {
    position: static;
  }
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
  }

  .bank-btn {
    width: 100%;
    justify-content: center;
  }

  .filter-panel {
    grid-template-columns: 1fr;
  }

  // .clear-btn {
  //   width: 100%;
  //   justify-content: center;
  // }

  .goal-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .page-head h1 {
    font-size: 28px;
  }

  // .summary-grid {
  //   grid-template-columns: 1fr;
  // }

  .goal-card {
    padding: 18px;
  }

  .goal-tags {
    padding-right: 0;
  }

  .remove-btn {
    position: static;
    margin-left: auto;
    margin-bottom: 12px;
    display: block;
  }

  // .plan-summary {
  //   grid-template-columns: 1fr;
  // }
}
`;
