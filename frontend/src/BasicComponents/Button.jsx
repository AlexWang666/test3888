import React from "react";
import "./Button.css";

const COLORS = ["primary", "success", "danger", "light", "dark"];
const FILL = ["solid", "outline"];
const SIZES = ["small", "medium", "large"];
const TYPES = ["button", "submit"];

export default function Button({
  text,
  type,
  onClickFunction,
  color,
  fill,
  size,
}) {
  const checkStyle = (styleConstant, style) =>
    styleConstant.includes(style) ? style : styleConstant[0];

  return (
    <button
      className={`btn
                ${checkStyle(COLORS, color)}-${checkStyle(FILL, fill)}
                ${checkStyle(SIZES, size)}`}
      onClick={onClickFunction}
      type={checkStyle(TYPES, type)}
    >
      {text}
    </button>
  );
}
