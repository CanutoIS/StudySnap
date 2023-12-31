import { ModalContainer } from "../library";
import { useState, useEffect } from "react";
import { useHandleErrors } from "../hooks";
import { deleteAllConversations, deleteConversation } from "../../logic";
import { context } from "../../ui";

export default function SideBarMenu({
    chatbotOptions,
    homeOptions,
    page,
    openedMenu,
    lastPostsUpdate,
    handleToggleMenu,
    handleLastPostsUpdate,
    openedProfile,
    setOpenedProfile,
    scrollToTop,
    isMobile
}) {
    const handleErrors = useHandleErrors()

    const [, setForceUpdate] = useState();
    const [conversationId, setconversationId] = useState()

    useEffect(() => {
        setForceUpdate();
        setconversationId(null)
    }, [lastPostsUpdate]);

    const handleConfirmDelete = (_conversationId) => setconversationId(_conversationId)

    const handleCancelDelete = () => setconversationId(null)

    const handleDeleteConversation = () => {
        handleErrors(async () => {
            await deleteConversation(conversationId)

            setconversationId(null)

            if (conversationId === context.conversationId) context.conversationId = null

            handleLastPostsUpdate()
        })
    }

    const handleDeleteAllConversations = () => {
        handleErrors(async () => {
            await deleteAllConversations()

            setconversationId(null)

            context.conversationId = null

            handleLastPostsUpdate()

            handleToggleMenu()
        })
    }

    return (
        <ModalContainer
            className="fixed top-0 left-0 z-20 md:w-60 md:z-0"
            onClick={(event) => {
                if (event.target === document.querySelector(".ModalContainer"))
                    handleToggleMenu();
            }}
        >
            <ul
                className={`w-44 h-full bg-white absolute top-24 bottom-0 z-20 border-t-2 border-white overflow-scroll ${isMobile ? openedMenu ? "opened-menu" : "closed-menu" : ''} md:left-0 md:w-60 md:scrollbar-thin md:border md:border-gray-200 `}
            >
                {page === "Chatbot" &&
                    chatbotOptions && <>
                        {chatbotOptions.map((option, index) => {
                            return (
                                <li
                                    key={index}
                                    className={`conversation-${index} ${index === chatbotOptions.length - 1 ? 'h-24 bg-white' : `${option.text.length > 38 ? 'h-fit' : 'h-20'} bg-gray-100`} w-full border-2 border-t-0 border-white flex justify-center items-center cursor-pointer`}
                                    onClick={event => {
                                        if (event.target.tagName.toLowerCase() !== 'span' && !event.target.classList.contains('deleteAllChatsText')) {
                                            option.onClick();

                                            handleToggleMenu();
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-between w-full h-fit">
                                        {option.id !== 'deleteAllChatsId' ?
                                            <p className="text-center w-full">{option.text}</p>
                                            :
                                            <p className="deleteAllChatsText flex items-center justify-center w-full gap-2 text-cenetr" onClick={() => handleConfirmDelete(option.id)}>{option.text}<span className="material-symbols-outlined notranslate">folder_delete</span></p>
                                        }
                                        {option.id !== undefined ?
                                            option.id && conversationId !== option.id ?
                                                option.id !== 'deleteAllChatsId' && <span className="material-symbols-outlined notranslate pr-1" onClick={() => handleConfirmDelete(option.id)}>more_vert</span>
                                                :
                                                <div className="flex flex-col gap-1 overflow-hidden pr-2">
                                                    <span className="material-symbols-outlined notranslate" onClick={option.id === 'deleteAllChatsId' ? handleDeleteAllConversations : handleDeleteConversation}>delete</span>
                                                    <span className="material-symbols-outlined notranslate" onClick={handleCancelDelete}>close</span>
                                                </div>
                                            :
                                                ''
                                        }
                                    </div>
                                </li>
                            );
                        })}
                    </>
                }
                {(page === "Home" || page === 'Suggestions' || page === 'OwnPostsSuggestions' || page === 'Search' || page === 'Summarize') &&
                    homeOptions &&
                    homeOptions.map((option, index) => {
                        return <li
                            key={index}
                            className={`w-full border-2 border-t-0 border-white flex justify-center items-center px-4 text-center ${index === homeOptions.length - 1 ? 'h-24 bg-white' : 'bg-slate-100 h-20'} md:px-10 cursor-pointer`}
                            onClick={() => {
                                option.onClick();

                                handleToggleMenu();

                                if (openedProfile) setOpenedProfile(false)

                                scrollToTop()
                            }}
                        >
                            {option.text === 'Chatbot' ?
                                <p className='w-full flex justify-left items-center gap-2 notranslate'><span className="material-symbols-outlined notranslate text-lg">smart_toy</span>{option.text}</p>
                                :
                                option.text === 'Home page' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">Home</span>{option.text}</p>
                                :
                                option.text === 'Own posts' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">copyright</span>{option.text}</p>
                                :
                                option.text === 'Saved posts' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">bookmark</span>{option.text}</p>
                                :
                                option.text === 'Seen lately' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">visibility</span>{option.text}</p>
                                :
                                option.text === 'My suggestions' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">emoji_objects</span>{option.text}</p>
                                :
                                option.text === 'Own posts suggestions' ? 
                                <div className='flex justify-left items-center'><span className="material-symbols-outlined notranslate text-lg">psychology</span><p className='ml-[-25px] w-44 p-4'>{option.text}</p></div>
                                :
                                option.text === 'Create a post' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">post</span>{option.text}</p>
                                :
                                option.text === 'Search posts by subject/topics' ? 
                                <div className='w-full flex justify-left items-center'><span className="material-symbols-outlined notranslate text-lg">search</span><p className="ml-[-15px]">{option.text}</p></div>
                                :
                                option.text === 'Search users' ? 
                                <div className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">search</span><p>{option.text}</p></div>
                                :
                                option.text === 'Summarize text' ? 
                                <p className='w-full flex justify-left items-center gap-2'><span className="material-symbols-outlined notranslate text-lg">book_4</span>{option.text}</p>
                                :
                                option.text === 'Empty box' ? 
                                <p className='w-full flex justify-left items-center gap-2'></p>
                                :
                                ''
                            }
                        </li>
                    })}
            </ul>
        </ModalContainer>
    );
}
