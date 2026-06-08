import { Edit } from "lucide-react"

function EditOption() {
  return (
    <div className='flex cursor-pointer px-2 py-2 hover:bg-gray-100 rounded-lg flex-row items-center gap-3 text-gray-800'>
        <Edit size={14}/>
        <span className='self-center text-sm'>Update</span>
    </div>
  )
}

export default EditOption