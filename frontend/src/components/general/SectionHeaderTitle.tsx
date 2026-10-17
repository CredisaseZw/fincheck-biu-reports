interface props {
    title: string
}
function SectionHeaderTitle({ title }: props) {
  return (
    <div className="py-4 rounded border text-center bg-primary text-white font-bold tracking-wider dark:bg-primary/15 dark:border-primary dark:text-gray-300">
        {title.toUpperCase()}
    </div>
  )
}

export default SectionHeaderTitle