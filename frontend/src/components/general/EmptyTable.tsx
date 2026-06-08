import { FolderOpen } from 'lucide-react'
function EmptyTable() {
  return (
    <div className='w-full py-8 flex gap-3 flex-col justify-center items-center'>
        <FolderOpen
            className='text-gray-500 dark:text-gray-400'
            size={40}
        />
        <span className='text-gray-600 text-base dark:text-gray-300 '>Nothing to show!</span>
    </div>
  )
}

export default EmptyTable