import { ModalContainer, ModalWindow, Form, Input, Button } from "../library";
import { retrieveConversation } from "../../logic";
import { useEffect, useState } from "react";
import { useHandleErrors } from "../hooks";
import { createPost } from "../../logic";
import { context } from "../../ui";
import { useAppContext } from "../hooks";

export default function AddPostFromChatbot({ postContent, handleCloseModal, setView, setPage }) {
    const { navigate, freeze, unfreeze } = useAppContext()
    const handleErrors = useHandleErrors()

    const [conversation, setConversation] = useState(null)
    
    useEffect(() => {
        if(context.conversationId)
            handleErrors(async () => {
                const _conversation = await retrieveConversation(context.conversationId)

                setConversation(_conversation)
            })
    }, [])

    const handleCreatePost = event => {
        event.preventDefault()

        const title = event.target.title.value
        const content = event.target.content.value
        const subject = event.target.subject.value

        handleErrors(async () => {
            freeze()
            await createPost(title, content, subject)

            navigate('/')
            handleCloseModal()
            setView('posts')
            setPage('Home')

            unfreeze()
        })
    }

    return <ModalContainer className='AddPostContainer fixed z-30 bg-black bg-opacity-20 top-0 left-0' onClick={event => {
        if(event.target === document.querySelector('AddPostContainer'))
            handleCloseModal()
    }}>
        <ModalWindow className='w-11/12 h-5/6 md:w-2/3'>
        <h2 className="text-2xl">Create a new post</h2>
            <Form className='flex flex-col items-center gap-2 w-full h-5/6' onSubmit={handleCreatePost}>
                    <Input className='w-full' name='title' placeholder="Summary title" defaultValue={(conversation && context.conversationId) ? conversation.title : ''}></Input>

                    <textarea className="w-full h-2/3 rounded-lg border border-gray-400 p-2" name="content" placeholder="Summary content" cols="30" rows="10" defaultValue={postContent}></textarea>

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
                        <option value='Biology'>Chemistry</option>
                        <option value='Biology'>Philosophy</option>
                        <option value='Others'>Others</option>
                    </select>
                </div>
                <div className="flex justify-evenly w-full">
                    <Button className='bg-slate-100 w-16 md:w-20'>Create</Button>
                    <Button className='bg-slate-100' type='button' onClick={handleCloseModal}>Cancel</Button>
                </div>
            </Form>
        </ModalWindow>
    </ModalContainer>
}