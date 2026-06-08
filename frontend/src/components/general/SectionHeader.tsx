interface props{
    label : string,
    subLabel?:string,
    total?: number,
    subTotal?: number
}
function SectionHeader({label, subLabel, total, subTotal}:props) {
  return (
    <div className="flex flex-col">
        <span className="font-bold text-2xl text-gray-800 dark:text-light">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-300">Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{subTotal ?? 0}</span> of <span className="font-semibold text-gray-600 dark:text-gray-300">{total ?? 0}</span> {subLabel ?? label.toLowerCase()}</span>
    </div>
)
}

export default SectionHeader