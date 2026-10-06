"use client";
export default function DeleteButton() {
  return (
    <button
      name="operation"
      value="delete"
      formNoValidate
      className="button"
      onClick={(event) => {
        if (
          !window.confirm(
            "Permanently delete this record? This cannot be undone.",
          )
        )
          event.preventDefault();
      }}
    >
      Delete permanently
    </button>
  );
}
