export function FloatingField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  value,
  onChange,
}) {
  return (
    <div className="relative pt-1">
      <label
        htmlFor={id}
        className="absolute left-3 top-0 z-10 -translate-y-1/2 bg-white px-1 text-xs font-medium text-gray-600"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 pb-2.5 pt-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>
  )
}
