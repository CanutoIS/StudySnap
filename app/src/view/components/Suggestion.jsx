import { context } from "../../ui";
import { useState } from "react";
import { useHandleErrors } from "../hooks";
import { savePostAsSeen, toggleCheckSuggestion, hideSuggestion } from '../../logic'
import { RandomAvatar } from "react-random-avatars"

export default function Suggestion({ suggestion, openDeleteSuggestionModal, openEditSuggestionModal, user, handleLastPostsUpdate, handleShowPost, setSuggestion, modal }) {
    const handleErrors = useHandleErrors()
    
    const [checked, setChecked] = useState(suggestion.checked)
    const [hidden, setHidden] = useState(false)

    const handleOpenDeleteSuggestion = () => {
        context.suggestionId = suggestion.id

        openDeleteSuggestionModal()

        handleLastPostsUpdate()

        setSuggestion(suggestion)
    }

    const handleOpenEditSuggestion = () => {
        context.suggestionId = suggestion.id

        openEditSuggestionModal()

        handleLastPostsUpdate()

        setSuggestion(suggestion)
    }

    const handleToggleCheckSuggestion = () => {
        handleErrors(async () => {
            await toggleCheckSuggestion(suggestion.id)

            setChecked(!checked)

            handleLastPostsUpdate()
        })
    }

    const handleHideSuggestion = () => {
        handleErrors(async () => {
            await hideSuggestion(suggestion.id)

            setHidden(!hidden)

            handleLastPostsUpdate()
        })
    }

    const handleShowPostModal = postId => {
        handleErrors(async () => {
            await savePostAsSeen(postId)
        })

        document.body.classList.add('fixed-scroll')

        context.postId = postId

        handleShowPost()

        handleLastPostsUpdate()
    }

    return <>
        <div className=" mx-2 flex flex-col justify-between border p-2 rounded min-h-40 bg-white shadow-md shadow-slate-400">
            <div className="overflow-hidden flex justify-between px-1">
                <div className="flex gap-1 items-center">
                {suggestion.author.avatar
                    ?
                    <img
                        className="h-8 w-8 object-cover rounded-full"
                        src={suggestion.author.avatar}
                        alt="post-user-avatar"
                        onClick={handleVisitProfile}
                    />
                    :
                    <RandomAvatar name={suggestion.author.name} size={20} />
                }
                    <p className="notranslate">{suggestion.author.name}</p>
                </div>
                <div className="flex gap-3 w-48 flex-wrap justify-end">
                    {suggestion.postAuthor === user.id && checked && !hidden && <p className="flex items-center gap-1"><span className="material-symbols-outlined notranslate text-lg cursor-pointer" onClick={handleHideSuggestion}>visibility_off</span>Hide</p>}

                    {suggestion.postAuthor === user.id && <p className="overflow-hidden flex items-center cursor-pointer"><span className={`material-symbols-outlined notranslate ${checked && 'bg-green-300 rounded-full'} mr-1`} onClick={handleToggleCheckSuggestion}>check</span>{checked ? 'Checked' : 'Check'}</p>}

                    {modal === 'suggestionModal' && <p className="rounded-full border border-gray-400 px-1 flex itmes-center cursor-pointer" onClick={() => handleShowPostModal(suggestion.post)}>Go to post<span className="material-symbols-outlined notranslate text-base">arrow_forward_ios</span></p>}
                    
                    {suggestion.author.id === user.id && <>
                        {!checked && <span className="material-symbols-outlined notranslate cursor-pointer" onClick={handleOpenEditSuggestion}>edit_note</span>}
                        <span className="material-symbols-outlined notranslate cursor-pointer" onClick={handleOpenDeleteSuggestion}>delete</span>
                        {checked && <p className="overflow-hidden flex items-center cursor-pointer"><span className='material-symbols-outlined notranslate bg-green-300 rounded-full mr-1'>check</span>Checked</p>}
                    </>}
                </div>
            </div>
            <div className="w-full flex justify-center">
                <h1 className="text-xl text-center mt-4 mb-3 md:text-xl">{suggestion.title}</h1>
            </div>
            <p className="mb-2">{suggestion.content}</p>
        </div>
    </>
}