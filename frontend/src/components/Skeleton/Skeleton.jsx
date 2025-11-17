import React from "react";
import "./Skeleton.css";

export default function Skeleton({ lines = 3, isCard = true }) {
  return (
    <div className={`skeleton ${isCard ? "skeleton-card" : ""}`}>
      {[...Array(lines)].map((_, i) => (
        <div key={i} className={`skeleton-bar w-${60 - i * 10}`}></div>
      ))}
    </div>
  );
}
