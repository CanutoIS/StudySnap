import { useHandleErrors } from "../hooks"
import { createPost } from "../../logic"
import { ModalContainer, ModalWindow, Form, Input, Button } from "../library"

export default function AddPost({ onCloseModal, handleLastPostsUpdate, setPage }) {
    const handleErrors = useHandleErrors()

    const handleCreatePost = event => {
        event.preventDefault()
        
        const title = event.target.title.value
        const content = event.target.content.value
        const subject = event.target.subject.value

        handleErrors(async () => {
            await createPost(title, content, subject)

            onCloseModal()
            handleLastPostsUpdate()
            setPage('Home')
        })
    }

    return <ModalContainer className='AddPostContainer fixed bg-black bg-opacity-20 top-0 left-0 z-30' onClick={event => {
        if(event.target === document.querySelector('.AddPostContainer'))
            onCloseModal()
    }}>
        <ModalWindow className='w-11/12 h-5/6 md:w-2/3'>
            <h2 className="text-2xl">Create a new post</h2>
            <Form className='flex flex-col items-center gap-2 w-full h-5/6' onSubmit={handleCreatePost}>
                    <Input className='w-full' name='title' placeholder="Summary title" autoFocus></Input>
                    
                    <textarea className="w-full h-2/3 rounded-lg border border-gray-400 p-2" name="content" placeholder="Summary content" cols="30" rows="10"></textarea>
                    
                <div className='w-full h-20 flex items-start gap-1'>
                    <p>Select subject related:</p>
                    <select name="subject" className="p-2 border border-slate-300 rounded-lg">
                        <option value=''>--subject--</option>
                        <option value='Language and literature'>Language and literature</option>
                        <option value='Mathematics'>Mathematics</option>
                        <option value='Natural sciences'>Natural sciences</option>
                        <option value='Social sciences'>Social sciences</option>
                        <option value='Geography'>Geography</option>
                        <option value='History'>History</option>
                        <option value='Physics'>Physics</option>
                        <option value='Biology'>Biology</option>
                        <option value='Chemistry'>Chemistry</option>
                        <option value='Philosophy'>Philosophy</option>
                        <option value='Others'>Others</option>
                    </select>
                </div>
                <div className="flex justify-evenly w-full">
                    <Button className='bg-slate-100 w-16'>Create</Button>
                    <Button className='bg-slate-100' type='button' onClick={onCloseModal}>Cancel</Button>
                </div>
            </Form>
        </ModalWindow>
    </ModalContainer>
}