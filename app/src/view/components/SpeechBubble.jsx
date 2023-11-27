import { useState } from "react"

export default function SpeechBubble({ role, content, setModal, setPostContent, className }) {
    const [showCreatePostButton, setShowCreatePostButton] = useState(false)

    const handleToggleButton = () => setShowCreatePostButton(!showCreatePostButton)

    const handleCreatePost = () => {
        setModal('addPostModal')
        setPostContent(content)
    }

    return <div className={`w-full flex ${role === 'assistant' ? 'justify-start md:pr-8' : role === 'user' ? 'justify-end md:pl-8' : 'justify-center'}`}>
        <div className={`speechBubble p-4 mx-4 my-2 rounded-lg ${className ? className : ''} ${role === 'assistant' ? 'bg-green-300 rounded-tl-none' : role === 'user' ? 'bg-blue-300 rounded-tr-none' : 'bg-red-300'}`}>
            <p>{content}</p>
            {role === 'assistant' && typeof content === 'string' && content.length > 500 &&
            <div className={`${showCreatePostButton ? 'bg-white' : ''} flex gap-2 w-fit pr-4 pl-1 mt-2 rounded-lg`}>
                {showCreatePostButton && <button className='px-1 py-0' onClick={handleCreatePost}>Create post</button>}
                <div className={`mx-[-10px] mt-1 h-fit rounded-full w-6 flex items-center cursor-pointer`} onClick={handleToggleButton}>
                    <span className="material-symbols-outlined notranslate">more_vert</span>
                </div>
            </div>}
        </div>
    </div>
}