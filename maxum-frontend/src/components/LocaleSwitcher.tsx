"use client";

export default function LocaleSwitcher() {
  const changeLocale = (e: React.ChangeEvent<HTMLSelectElement>) => {
    localStorage.setItem("locale", e.target.value);
    location.reload(); // reinitialize app with selected locale
  };

  const current = localStorage.getItem("locale") || "en";

  return (
    <select
      value={current}
      onChange={changeLocale}
      className="text-sm px-2 py-1 border border-gray-300 rounded"
    >
      <option value="en">EN</option>
      <option value="hi">हिन्दी</option>
    </select>
  );
}
