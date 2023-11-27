import { useEffect, useState } from "react"
import { Container, Button, SpeechBubble, LoaderResponse } from "../library"
import { useAppContext, useHandleErrors } from "../hooks"
import { askForResponse, retrieveConversation, storeInputInDB, createConversation, generateSummaryFromChatbot } from "../../logic"
import { context } from "../../ui"

export default function Chatbot({ lastPostsUpdate, setPage, setWritingText, writingText, setView, setPostContent, setModal, handleLastPostsUpdate }) {
    const handleErrors = useHandleErrors()
    const { freeze, unfreeze } = useAppContext()

    const [messages, setMessages] = useState([])
    const [valueToRender, setValueToRender] = useState(null)
    const [summary, setSummary] = useState(null)
    const [firstInput, setFirstInput] = useState()

    useEffect(() => {
        if(context.conversationId) {
            handleErrors(async () => {
                freeze()
                
                const conversation = await retrieveConversation(context.conversationId)

                setMessages([...conversation.messages])
                
                unfreeze()
            })
        }
        else setMessages([])

        setPage('Chatbot')

        console.log('Chatbot -> render')
    }, [lastPostsUpdate])

    useEffect(() => {
        setSummary(null)

        if(!context.conversationId) setFirstInput(true)
    }, [context.conversationId])

    useEffect(() => {
        setScrollToBottom()
    },[messages.length, summary])
    const handleSubmit = event => {
        event.preventDefault()

        setWritingText(true)

        handleErrors(async () => {
            const userInput = typeof event.target.userInput !== 'undefined' ? event.target.userInput.value : event.target.value

            if (!userInput) return
            
            if (!context.conversationId) context.conversationId = await createConversation(userInput)

            const newUserInput = {
                role: 'user',
                content: userInput
            }
            
            const loaderInput = {
                role: 'assistant',
                content: <LoaderResponse/>
            }

            const currentMessages = [...messages]

            currentMessages.push(newUserInput, loaderInput)
            
            setMessages(currentMessages)
            
            await storeInputInDB(context.conversationId, newUserInput)

            const messagesToAsk = [...currentMessages]

            messagesToAsk.pop()
            
            const response = await askForResponse(context.conversationId, messagesToAsk)
            
            setValueToRender(response.content)

            const voidMessage = { role: 'assistant', content: ''}

            setMessages([...messagesToAsk, voidMessage])
        })

        typeof event.target.userInput !== 'undefined' ? event.target.userInput.value = '' : event.target.value = ''
    }

    // Function to render the AI repsonse as a typewriter
    const renderTypeWriterText = () => {
        const text = valueToRender
        const conversationContainer = document.querySelector('.conversation-container')

        const speechBubbles = document.querySelectorAll('.speechBubble')
        const lastSpeechBubbleContainer = speechBubbles[speechBubbles.length - 1]
        const lastSpeechBubble = lastSpeechBubbleContainer.firstElementChild
        lastSpeechBubble.classList.add('blinking-cursor')

        let i = 0

        const interval = setInterval(() => {
            lastSpeechBubble.textContent += text.slice(i - 1, i)

            if (text.length === i) {
                clearInterval(interval)

                lastSpeechBubble.classList.remove('blinking-cursor')

                setValueToRender(null)

                setWritingText(false)

                if(firstInput) {
                    handleLastPostsUpdate()
                    
                    setFirstInput(false)
                }
            }

            i++
            conversationContainer.scrollTop = conversationContainer.scrollHeight
        }, 5)
    }

    if(valueToRender) renderTypeWriterText(valueToRender)

    const handleGenerateSummary = () => {
        if(context.conversationId) {
            handleErrors(async () => {
                context.summary = true
            
                freeze()

                const summary = await generateSummaryFromChatbot(context.conversationId)
            
                setSummary(summary)

                unfreeze()

                context.summary = false
                
                setView('posts')
            })
        }
    }

    const handleKeyDown = event => {
        if(event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }

    const handleDeleteSummary = () => {
        setSummary(null)
    }

    const handleShowAddPostModal = content => {
        const _postContent = typeof content === 'string' ? content : summary

        setModal('addPostModal')
        setPostContent(_postContent)
    }

    const setScrollToBottom = () => {
        const conversationContainer = document.querySelector('.conversation-container')
        conversationContainer.scrollTop = conversationContainer.scrollHeight
    }

    return <Container className={`chatbot-container fixed top-0 left-0 bg-[url(/images/chatbot-3.1.jpg)] bg-fixed bg-center bg-cover overflow-scroll md:w-full md:left-60 md:pr-60`}>
        <button className="fixed right-2 top-24 z-10 mt-2 bg-yellow-100 leading-tight border border-black flex justify-center md:right-16 md:w-24" onClick={() => {
            if(!valueToRender) handleGenerateSummary()
        }}>Generate summary</button>
        
        <section className={`conversation-container absolute top-24 pt-14 w-full md:w-2/3 md:px-10 md:border-x-2 md:border-slate-300 ${!summary ? 'bottom-32 md:bottom-40' : 'bottom-0'} overflow-scroll`}>
            <div className='w-full flex justify-start'>
                <p className="p-4 mx-4 my-2 rounded-lg bg-green-300 rounded-tl-none">Hello! How can I help you?</p>
            </div>
            {messages && messages.map((message, index) => 
                <SpeechBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                    setModal={setModal}
                    setPostContent={setPostContent}
                />
            )}

            {!summary && <div className="w-full flex justify-center fixed bottom-4 md:w-2/3 md:pr-20">
                    <form className="border-black w-11/12 border-2 flex p-2 gap-2 md:w-full md:mx-5 md:bg-white md:h-32" onSubmit={handleSubmit}>
                    {/* <textarea className="w-72 p-4 focus:outline-none" name='userInput' placeholder='Send a message' /> */}
                    <textarea className="w-72 p-4 focus:outline-none md:w-full md:h-full md:p-3 md:text-lg" name='userInput' placeholder='Send a message' autoFocus onKeyDown={event => !writingText && handleKeyDown(event)}/>
                    {writingText
                        ?
                        <Button type='button'><span className="material-symbols-outlined notranslate">send</span></Button>
                        :
                        <Button><span className="material-symbols-outlined notranslate">send</span></Button>
                    }
                </form>
            </div>}

            {summary && <div className="flex flex-col items-center gap-2 bg-red-300 rounded-lg pt-4 mx-4 pb-2 mb-4">
                <h1>Summary</h1>
                <SpeechBubble className='py-0 px-0'
                    role={'sumamry'}
                    content={summary}
                />
                <div className="flex justify-around p-2 gap-2">
                    <Button className="border border-black leading-tight" onClick={handleShowAddPostModal}>Create post whit summary</Button>
                    <Button className="border border-black leading-tight" onClick={handleGenerateSummary}>Generate another summary</Button>
                    <Button className="border border-black leading-tight" onClick={handleDeleteSummary}>Continue with conversation</Button>
                </div>
            </div>
            }
        </section>
    </Container>
}