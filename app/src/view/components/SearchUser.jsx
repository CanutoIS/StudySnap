import { ModalContainer, ModalWindow, Form, Input, Button } from "../library";
import { useAppContext, useHandleErrors } from "../hooks";
import { useEffect, useState } from "react";
import { isCurrentUser, retrieveAllUsers, searchUsers } from "../../logic";
import { RandomAvatar } from "react-random-avatars"
import { context } from "../../ui";

export default function SearchUser({ setModal, handleOpenProfile }) {
    const { navigate } = useAppContext()
    const handleErrors = useHandleErrors()

    const [users, setUsers] = useState(null)

    useEffect(() => {
        handleErrors(async () => {
            const _users = await retrieveAllUsers()

            setUsers(_users)
        })
    },[])
    
    const handleSearchUser = event => {
        event.preventDefault()

        const textToSearch = event.target.textToSearch.value

        handleErrors(async () => {
            const _users = await searchUsers(textToSearch)

            setUsers(_users)
        })
    }

    const handleOpenUserProfile = userId => {
        context.requestedUserId = userId

        setModal(null)
        handleOpenProfile('requestedUser')
    }

    return <ModalContainer className='fixed top-0 left-0 z-20 bg-black bg-opacity-20 searchUserModal' onClick={event => {
        if(event.target === document.querySelector('.searchUserModal'))
            setModal(null)
    }}>
        <ModalWindow className='w-11/12 bg-white px-4 rounded h-4/5 md:w-96 flex flex-col gap-2'>
            <h1 className='text-4xl mb-2'>Search user</h1>
            <Form className='border border-slate-300 w-full mb-4' onSubmit={handleSearchUser}>
                <div className="flex w-full">
                    <Input className='w-full' name='textToSearch'></Input>
                    <Button><span className="material-symbols-outlined notranslate">search</span></Button>
                </div>
            </Form>
            <div className='h-full w-full overflow-scroll'>
                {users && users.map((user, index) => {
                    if(!isCurrentUser(user.id))
                        return <div key={index} className="w-full h-[70px] flex flex-col justify-around cursor-pointer">
                            <div className='w-full border-t border-slate-300    '></div>
                            <div className="w-full flex gap-4" onClick={() => handleOpenUserProfile(user.id)}>
                                {user.avatar
                                    ?
                                    <img className="h-10 w-10 object-cover rounded-full cursor-pointer md:h-14 md:w-14" src={user.avatar} alt="avatar image" />
                                    :
                                    <div><p className='cursor-pointer'> <RandomAvatar name={user.name} size={40} /></p></div>
                                }
                                <div className='flex flex-col w-full'>
                                    <p className="font-bold text-lg notranslate">{user.name}</p>
                                    <p className="ml-3 mt-[-5px] notranslate">@{user.username}</p>
                                </div>
                            </div>
                        </div>
                })}
            </div>
        </ModalWindow>
    </ModalContainer>
}