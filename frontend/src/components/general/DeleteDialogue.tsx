
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import useDelete from '@/hooks/common-hooks/useDelete'
import type { Delete } from '@/types/common-types/common-types'
import { Trash } from 'lucide-react'
import { Button } from '../ui/button'
import LoadingIndicator from './LoadingIndicator'

function DeleteDialogue({link, keyStore, value, trigger, successCallBack }: Delete) {
  const {
    loading,
    open,
    setOpen, 
    onHandleDelete
  } = useDelete({link, keyStore, value, successCallBack })
  return (
    <Dialog open = {open} onOpenChange={setOpen}>
        <DialogTrigger>
            {
                trigger 
                ? trigger
                : <div className='flex px-2 cursor-pointer py-2 hover:bg-gray-100 rounded-lg flex-row items-center gap-3 text-red-600'>
                    <Trash size={14}/>
                    <span className='self-center text-sm'>Delete</span>
                </div>
            }
        </DialogTrigger>
        <DialogContent className="sm:max-w-112.5" onInteractOutside={(e)=> e.preventDefault()}>
            <DialogHeader>
                <DialogTitle className='text-lg font-semibold'>Delete {value}</DialogTitle>
                <DialogDescription className='text-sm text-muted-foreground'>
                    Are you sure you want to delete this {value}? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <div className='flex flex-row justify-end gap-3 mt-4'>
                <DialogClose>
                    <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button variant={"destructive"} className='text-white' disabled = {loading} onClick={()=> onHandleDelete()}>
                    {
                        loading 
                        ? <LoadingIndicator variant='button'/>
                        : "Delete"
                    }
                </Button>
            </div>
        </DialogContent>  
    </Dialog>
  )
}

export default DeleteDialogue