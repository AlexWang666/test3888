import React from "react";
import { Progress, Typography } from "antd";
import "../../Main.css";
import "./ProjectDashboardWidgets.css";

const { Title, Paragraph } = Typography;

export default function BudgetBar({ budgetInfo, goToData }) {
  // budgetInfo: The budget information
  // - totalFunds: The total funds in the budget
  // - exhausted: The amount of budget used already

  // goToData: Goes to the budget page.

  return (
    <div className="budget-bar-widget" onClick={goToData}>
      <div
        className="upper-elements"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        {/* <p className="default-heading-3">Budget</p> */}
        <Title level={4}>Budget</Title>
        {/* <p className="default-heading-4" id="align-right">
          Total: <b>${budgetInfo.total_budgeted}</b>
        </p> */}
        <Paragraph>
          Total: <b>${budgetInfo.total_budgeted}</b>
        </Paragraph>
      </div>

      {/* <progress className="default-progress-bar"
                  id="budget-progress-bar"
                  value={budgetInfo.total_spent}
                  max={budgetInfo.total_budgeted}
      /> */}
      <Progress
        type="circle"
        percent={(budgetInfo.total_spent / budgetInfo.total_budgeted) * 100}
      />
      {/* <p className="default-paragraph">
        Exhaused ${budgetInfo.total_spent} / ${budgetInfo.total_budgeted}
      </p> */}
      <Paragraph>
        {" "}
        Exhaused ${budgetInfo.total_spent} / ${budgetInfo.total_budgeted}{" "}
      </Paragraph>
    </div>
  );
}
