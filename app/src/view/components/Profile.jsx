import { updateUserPassword, updateUserAvatar, retrieveUser, retrieveUserPosts, updateUserLocation, updateUserOccupation, updateUserDescription, isCurrentUser, toggleFollowUser, checkFollowingUser, retrieveRequestedUser, retrieveRequestedUserPosts } from "../../logic"
import { Input, Button, Form } from "../library"
import { useAppContext, useHandleErrors } from "../hooks"
import { useEffect, useState } from "react"
import { PostModalWindow } from "."
import { RandomAvatar } from "react-random-avatars"
import { ContextualMenu } from '.'
import { context } from "../../ui"
import { Post } from "."

export default function Profile({ onUpdatedAvatar, handleLogout, page, setPage, setOpenedProfile, handleOpenDeletePost, handleOpenEditPost, handleToggleVisibility, handleLastPostsUpdate, lastPostsUpdate, profileModal, setProfileModal }) {
    const { alert, navigate } = useAppContext()
    const handleErrors = useHandleErrors()

    const [user, setUser] = useState()
    const [posts, setPosts] = useState()
    const [postModalWindow, setPostModalWindow] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [settingsMenu, setSettingsMenu] = useState(false)
    const [modal, setModal] = useState(null)

    useEffect(() => {
        handleRefreshUser()

        handleRetrievePosts()

        console.log('profile -> render')
    }, [])
    
    useEffect(() => {
        handleRefreshUser()

        handleRetrievePosts()
    }, [lastPostsUpdate, profileModal])

    const handleRefreshUser = () => {
        handleErrors(async () => {
            let _user
            
            if(profileModal === 'currentUser')
                _user = await retrieveUser()
            
            else if(profileModal === 'requestedUser')
                _user = await retrieveRequestedUser(context.requestedUserId)

            setUser(_user)
        })
    }

    const handleRetrievePosts = () => {
        handleErrors(async () => {
            let _posts

            if(profileModal === 'currentUser')
                _posts = await retrieveUserPosts()

            else if(profileModal === 'requestedUser') {
                _posts = await retrieveRequestedUserPosts(context.requestedUserId)
            }

            setPosts(_posts)
        })
    }

    const handleCloseProfile = () => {
        setPage(`${page}`)

        if (page === 'Home') navigate('/')
        else if(page === 'Suggestions' || page === 'OwnPostsSuggestions') navigate('suggestions')

        setOpenedProfile(false)
    }

    const handleChangeAvatar = (event) => {
        event.preventDefault()

        const avatarUrl = event.target.avatarUrl.value
        const password = event.target.password.value

        handleErrors(async () => {
            await updateUserAvatar(avatarUrl, password)

            alert({ message: 'Avatar changed successfully.' })

            handleRefreshUser()
            handleRetrievePosts()
            onUpdatedAvatar()

            setModal(null)
        })
    }

    const handleChangePassword = (event) => {
        event.preventDefault()

        const password = event.target.password.value
        const newPassword = event.target.newPassword.value
        const newPasswordConfirm = event.target.newPasswordConfirm.value

        handleErrors(async () => {
            await updateUserPassword(password, newPassword, newPasswordConfirm)

            alert({ message: 'Password changed successfully.' })

            handleRefreshUser()

            setModal(null)
        })
    }

    const handleUpdateLocation = event => {
        event.preventDefault()

        const location = event.target.location.value

        handleErrors(async () => {
            await updateUserLocation(location)

            handleRefreshUser()
        })
    }

    const handleUpdateOccupation = event => {
        event.preventDefault()

        const occupation = event.target.occupation.value

        handleErrors(async () => {
            await updateUserOccupation(occupation)

            handleRefreshUser()
        })
    }

    const handleUpdateDescription = event => {
        event.preventDefault()

        const description = event.target.description.value

        handleErrors(async () => {
            await updateUserDescription(description)

            handleRefreshUser()
        })
    }

    const handleTogglePostModalWindow = () => {
        setPostModalWindow(!postModalWindow)

        if(!postModalWindow) handleLastPostsUpdate()
    }

    const toggleEditMode = () => setEditMode(!editMode)

    const toggleSettingsMenu = () => setSettingsMenu(!settingsMenu)

    const handleOpenChangeAvatar = () => {
        toggleSettingsMenu()    
        setModal('changeAvatar')
    }

    const handleOpenChangePassword = () => {
        toggleSettingsMenu()
        setModal('changePassword')
    }

    const handleCloseModal = () => setModal(null)

    const handleToggleFollow = () => {
        handleErrors(async () => {
            await toggleFollowUser(user.id)

            handleRefreshUser()
        })
    }

    // Function to show other app user profile in followers/following modal
    const handleShowAppUserProfile = (userId) => {
        handleErrors(async () => {
            let _user
            
            if(isCurrentUser(userId)) {
                _user = await retrieveUser()
            } else {
                _user = await retrieveRequestedUser(userId)
            }

            context.requestedUserId = _user.id
            
            if(profileModal === 'currentUser') setProfileModal('requestedUser')
            else handleRetrievePosts()
            
            setUser(_user)

            handleCloseModal()
        })
    }

    return <section tag='section' className={`Profile fixed ${profileModal === 'currentUser' ? 'top-24' : 'top-0'} w-full h-screen left-0 z-20 bg-white items-start md:left-60 md:pr-60 overflow-auto md:pb-28`}>
        {user && <>
            <div className={`w-full shadow shadow-slate-400 flex items-center gap-1 px-4 ${profileModal === 'requestedUser' ? 'pt-8 h-44' : 'h-36'}`}>
                {profileModal === 'requestedUser' && <div className="absolute top-4 left-2" onClick={handleCloseProfile}><span className="material-symbols-outlined notranslate cursor-pointer">arrow_back</span></div>}
                {user.avatar
                    ?
                    <img src={user.avatar} alt="avatar" className="h-20 w-20 object-cover rounded-full"/>
                    :
                    <RandomAvatar key={user.name} name={user.name} size={60} />
                }
                <div className="w-full flex flex-col h-full justify-evenly px-4">
                    <div className="flex justify-between items-center">
                        <p className="text-xl md:text-xl notranslate">{user.username}</p>

                        {isCurrentUser(user.id)
                            ?
                            <span className="material-symbols-outlined notranslate cursor-pointer md:text-3xl" onClick={toggleSettingsMenu}>settings</span>
                            :
                            <Button onClick={handleToggleFollow}>{checkFollowingUser(user.followers) ? 'Unfollow' : 'Follow'}</Button>
                        }
                        
                        {settingsMenu && <ContextualMenu
                            classNameContainer='z-10'
                            classNameMenu='top-12'
                            toggleContextualMenu={toggleSettingsMenu}
                            options={[
                                {
                                    text: 'Change avatar',
                                    onClick: () => handleOpenChangeAvatar()
                                },
                                {
                                    text: 'Change password',
                                    onClick: () => handleOpenChangePassword()
                                },
                                {
                                    text: 'Log out',
                                    onClick: () => handleLogout()
                                },
                            ]}
                        />}
                    </div>
                    <div className="flex flex-col md:flex-row gap-1 md:gap-0 justify-between md:text-xl md:w-full md:justify-evenly mb-2 md:mb-0">
                        <p>{user.postsNumber} posts</p>
                        <p className="cursor-pointer" onClick={() => user.followers.length && setModal('followers')}>{user.followers.length} followers</p>
                        <p className="cursor-pointer" onClick={() => user.following.length && setModal('following')}>{user.following.length} following</p>
                    </div>
                </div>
            </div>
            
            <div className={`flex flex-col p-8 gap-2 shadow shadow-slate-400 ${editMode ? 'pt-14' : ''}`}>
                {isCurrentUser(user.id) && <Button className={`absolute right-8 text-sm mt-[-20px] ${editMode ? 'mt-[-44px]' : ''} md:right-72 md:text-lg`} onClick={toggleEditMode}>{!editMode ? 'Edit' : 'Close'}</Button>}

                <p className="font-bold md:text-lg notranslate">{user.name}</p>

                <div className="flex items-center md:text-lg"><u>Location</u>: {!editMode
                    ?
                    user.location && user.location
                    :
                    <form className='flex border border-slate-400 rounded-md ml-7 w-full' onSubmit={handleUpdateLocation}>
                        <input className="rounded-md px-2 w-full" name='location' placeholder='Location' defaultValue={user.location && user.location}></input>
                        <Button className='ml-1'><span className="material-symbols-outlined notranslate">send</span></Button>
                    </form>
                }</div>
                
                <div className="flex items-center md:text-lg"><u>Occupation</u>: {!editMode
                    ?
                    user.occupation && user.occupation
                    :
                    <form className='flex border border-slate-400 rounded-md ml-2 w-full' onSubmit={handleUpdateOccupation}>
                        <input className="rounded-md px-2 w-full" name='occupation' placeholder='Occupation' defaultValue={user.location && user.occupation}></input>
                        <Button className='ml-1'><span className="material-symbols-outlined notranslate">send</span></Button>
                    </form>
                }</div>
                
                <div className="flex items-center md:text-lg"><u>Description</u>: {!editMode
                    ?
                    user.description && user.description
                    :
                    <form className='flex border border-slate-400 rounded-md ml-2 w-full' onSubmit={handleUpdateDescription}>
                        <textarea className="rounded-md px-2 h-20 w-full" name='description' placeholder='Description' defaultValue={user.location && user.description}></textarea>
                        <Button className='ml-1'><span className="material-symbols-outlined notranslate">send</span></Button>
                    </form>
                }</div>
            </div>

            <div className="p-8">
                <p className="w-full flex justify-center text-2xl mb-4 md:text-3xl md:mb-10 md:underline">Posts</p>

                <div className='md:w-full md:flex md:flex-wrap md:justify-center md:gap-10'>
                    {posts && posts.map((post, index) => {
                        return <Post
                            key={index}
                            className='hidden md:block'
                            onClick={handleTogglePostModalWindow}
                            post={post}
                            handleTogglePostModal={handleTogglePostModalWindow}
                        />
                    })}
                </div>

                {posts && !posts.length && <p className="w-full flex justify-center p-4 text-xl rounded border border-slate-400">There is no posts available</p>}
            </div>

            {modal === 'changeAvatar' && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400 bg-opacity-20 z-10 modal-container" onClick={event => {
                if(event.target === document.querySelector('.modal-container'))
                    setModal(null)
            }}>
                <Form className='w-fit p-10 bg-white md:w-96 md:h-96' onSubmit={handleChangeAvatar}>
                    <h2 className="font-bold text-lg mb-6 md:text-2xl">Update avatar</h2>
                    <div className="flex flex-col gap-4 md:w-full md:h-2/3 md:justify-around">
                        <Input type="url" name="avatarUrl" placeholder="avatar url" />
                        <Input type="password" name="password" placeholder="password" />
                        <div className="flex justify-evenly">
                            <Button>Update</Button>
                            <button  className='bg-gray-50 text-black' type='button' onClick={handleCloseModal}>Close</button>
                        </div>
                    </div>
                </Form>
            </div>}

            {modal === 'changePassword' && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400 bg-opacity-20 z-10 modal-container" onClick={event => {
                if(event.target === document.querySelector('.modal-container'))
                    setModal(null)
            }}>
                <Form className='w-fit p-10 bg-white md:w-96 md:h-96' onSubmit={handleChangePassword}>
                    <h2 className="font-bold text-lg mb-6 md:text-2xl">Update avatar</h2>
                    <div className="flex flex-col gap-4 md:w-full md:h-2/3 md:justify-around">
                        <Input type="password" name="password" placeholder="password" />
                        <Input type="password" name="newPassword" placeholder="new password" />
                        <Input type="password" name="newPasswordConfirm" placeholder="new password confirmation" />
                        <div className="flex justify-evenly">
                            <Button>Update</Button>
                            <button className='bg-gray-50 text-black' type='button' onClick={handleCloseModal}>Close</button>
                        </div>
                    </div>
                </Form>
            </div>}

            {modal === 'followers' && <div className="FollowersWindow fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400 bg-opacity-20 z-10" onClick={event => {
                if(event.target === document.querySelector('.FollowersWindow')) handleCloseModal()
            }}>
                <div className='w-3/4 p-10 bg-white h-3/5 rounded md:w-96'>
                    <span className="material-symbols-outlined notranslate absolute mt-[-30px] ml-[-25px] cursor-pointer" onClick={handleCloseModal}>close</span>
                    <h2 className="font-bold text-xl mb-6 flex justify-center">Followers</h2>
                    {user.followers.map((follower, index) => {
                        return <div key={index} className='flex gap-1 px-1 py-2 w-full border-t border-gray-400 md:px-4 md:gap-2 cursor-pointer' onClick={() => handleShowAppUserProfile(follower.id)}>
                            <div className='flex flex-col'>
                                <p className='font-bold text-lg md:text-lg notranslate'>{follower.name}</p>
                                <p className="md:text-lg ml-4 notranslate">@{follower.username}</p>
                            </div>
                        </div>
                    })}
                </div>
            </div>}

            {modal === 'following' && <div className="FollowingWindow fixed top-0 left-0 w-full h-full flex justify-center items-center bg-slate-400 bg-opacity-20 z-10" onClick={event => {
                if(event.target === document.querySelector('.FollowingWindow')) handleCloseModal()
            }}>
                <div className='w-3/4 p-10 bg-white h-3/5 rounded md:w-96'>
                    <span className="material-symbols-outlined notranslate absolute mt-[-30px] ml-[-25px] cursor-pointer" onClick={handleCloseModal}>close</span>
                    <h2 className="font-bold text-xl mb-6 flex justify-center">Following</h2>
                    {user.following.map((following, index) => {
                        return <div key={index} className='flex gap-1 px-1 py-2 w-full border-t border-gray-400 md:px-4 md:gap-2 cursor-pointer' onClick={() => handleShowAppUserProfile(following.id)}>
                            <div className='flex flex-col'>
                                <p className='font-bold text-lg md:text-lg notranslate'>{following.name}</p>
                                <p className="md:text-lg ml-4 notranslate">@{following.username}</p>
                            </div>
                        </div>
                    })}
                </div>
            </div>}
        </>}

        {postModalWindow && <PostModalWindow
            handleTogglePostModal={handleTogglePostModalWindow}
            handleOpenDeletePost={handleOpenDeletePost}
            handleOpenEditPost={handleOpenEditPost}
            handleToggleVisibility={handleToggleVisibility}
            handleLastPostsUpdate={handleLastPostsUpdate}
            lastPostsUpdate={lastPostsUpdate}
            page={'profile'}
        />}
    </section>
}
