// src/components/Pagination/Pagination.jsx
import React from "react";
import "./Pagination.css";

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="paginacao fade-in">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span className="page-info">
        {page} / {totalPages}
      </span>
      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </button>
    </div>
  );
}
