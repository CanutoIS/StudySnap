import { useEffect, useState } from "react";
import { ModalContainer } from "../library";
import { useHandleErrors, useAppContext } from "../hooks";
import { retrievePost, retrieveUser, toggleLikePost, toggleSavePost, } from "../../logic";
import { context } from "../../ui";
import { ContextualMenu, Comments, SuggestionsModal } from "../components";
import { RandomAvatar } from "react-random-avatars"

export default function PostModalWindow({
    handleOpenEditPost,
    handleOpenDeletePost,
    handleToggleVisibility,
    handleLastPostsUpdate,
    handleTogglePostModal,
    lastPostsUpdate,
    page,
    handleOpenProfile
}) {
    const handleErrors = useHandleErrors();
    const { freeze, unfreeze } = useAppContext()

    const [post, setPost] = useState();
    const [user, setUser] = useState();
    const [contextualMenu, setContextualMenu] = useState("close");
    const [modal, setModal] = useState("post");

    useEffect(() => {
        console.log("PostModalWindow -> render");

        handleRefreshPost();
        handleRefreshUser();
    }, [lastPostsUpdate]);

    const handleRefreshUser = () => {
        handleErrors(async () => {
            freeze()

            const user = await retrieveUser();

            setUser(user)

            unfreeze()
        });
    };

    const handleRefreshPost = () => {
        handleErrors(async () => {
            freeze()

            const post = await retrievePost(context.postId);

            setPost(post);

            unfreeze()
        });
    };

    const handleToggleLike = () => {
        handleErrors(async () => {
            await toggleLikePost(post.id);

            handleRefreshPost();
        });
    };

    const handleToggleFav = () => {
        handleErrors(async () => {
            await toggleSavePost(post.id);

            handleRefreshPost();
            handleRefreshUser();
        });
    };

    const toggleContextualMenu = () => {
        context.postId = post.id;

        setContextualMenu(contextualMenu === "close" ? "open" : "close");
    };

    const handleReturn = () => {
        if (modal !== "post") setModal("post");
        else {
            handleTogglePostModal();
            handleLastPostsUpdate();
        }
    };

    const handleOpenSuggestions = () => setModal("suggestions");

    // Function to handle the visit of a user profile from a post
    const handleVisitProfile = () => {
        if(page !== 'profile') {
            context.requestedUserId = post.author.id
    
            handleOpenProfile('requestedUser')

            handleTogglePostModal()
        }
    }

    return (
        <ModalContainer
            className="bg-black h-screen bg-opacity-20 fixed z-20 top-0 left-0 post-modal-window"
            onClick={(event) => {
                if (event.target === document.querySelector(".post-modal-window")) {
                    handleTogglePostModal();
                    handleLastPostsUpdate();
                }
            }}
        >
            {contextualMenu === "open" && (
                <ContextualMenu
                    options={[
                        {
                            text: "Suggestions",
                            onClick: () => {
                                handleOpenSuggestions();
                                toggleContextualMenu();
                            },
                        },
                        {
                            text: "Edit post",
                            onClick: () => {
                                handleOpenEditPost();
                                toggleContextualMenu();
                            },
                        },
                        {
                            text: `Set post ${post && post.visible ? "private" : "public"}`,
                            onClick: () => {
                                handleToggleVisibility();
                                toggleContextualMenu();
                            },
                        },
                        {
                            text: "Delete post",
                            onClick: () => {
                                handleOpenDeletePost();
                                toggleContextualMenu();
                            },
                        },
                    ]}
                    toggleContextualMenu={toggleContextualMenu}
                />
            )}

            <section className="w-11/12 h-5/6 bg-white rounded-lg flex flex-col items-center gap-4 md:w-2/3 md:p-4">
                {post && (
                    <div className="w-full flex justify-between p-2">
                        <div className="flex items-center gap-2">
                            <span
                                className="material-symbols-outlined notranslate w-8 cursor-pointer"
                                onClick={handleReturn}
                            >
                                arrow_back
                            </span>
                            {post.author.avatar
                                ?
                                <img
                                    className="h-8 w-8 object-cover rounded-full cursor-pointer"
                                    src={post.author.avatar}
                                    alt="post-user-avatar"
                                    onClick={handleVisitProfile}
                                />
                                :
                                <RandomAvatar name={post.author.name} size={28} onClick={handleVisitProfile}/>
                            }
                            <p className="md:text-lg cursor-pointer notranslate" onClick={handleVisitProfile}>{post.author.name}</p>
                        </div>

                        {modal === "post" && (
                            <div className="flex items-center">
                                {user && post.author.id === user.id && (
                                    <>
                                        <p className="mx-1 md:text-lg">
                                            {post.visible ? "Public" : "Private"}
                                        </p>
                                        <span
                                            className="material-symbols-outlined notranslate hover:bg-gray-300 cursor-pointer font-black rounded-full"
                                            onClick={toggleContextualMenu}
                                        >
                                            more_vert
                                        </span>
                                    </>
                                )}
                                {user && post.author.id !== user.id && (
                                    <>
                                        <p className="px-1 rounded text-sm mr-1 border md:text-lg cursor-pointer" onClick={handleOpenSuggestions}>Suggestions</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {post && modal === "post" && (
                    <>
                        <div className='w-full flex flex-col items-center'>
                            <h1 className="px-2 text-xl text-center w-5/6 md:text-2xl">{post.title}</h1>
                            <p className="md:text-lg">{post.subject}</p>
                        </div>

                        <p className="px-2 h-2/3 overflow-scroll border border-gray-300 rounded py-1 mx-2">{post.text}</p>

                        <div className="px-2 w-full flex justify-between mb-2">
                            <div>
                                <div className="flex gap-2 items-center">
                                    <i onClick={handleToggleFav}>
                                        {user && post.fav ? (
                                            <span className="material-symbols-outlined notranslate cursor-pointer filled text-yellow-400">
                                                bookmark
                                            </span>
                                        ) : (
                                            <span className="material-symbols-outlined notranslate cursor-pointer">
                                                bookmark
                                            </span>
                                        )}
                                    </i>

                                    <i>
                                        <span
                                            className="material-symbols-outlined notranslate cursor-pointer"
                                            onClick={() => {
                                                context.postId = post.id;

                                                setModal("comments");
                                            }}
                                        >
                                            mode_comment
                                        </span>
                                    </i>

                                    <i onClick={handleToggleLike}>
                                        {user && post.liked ? (
                                            <span className="material-symbols-outlined notranslate cursor-pointer filled text-red-400">
                                                favorite
                                            </span>
                                        ) : (
                                            <span className="material-symbols-outlined notranslate cursor-pointer">
                                                favorite
                                            </span>
                                        )}
                                    </i>
                                </div>

                                <p className="mt-[-5px] ml-[-3px] md:text-lg md:ml-1 notranslate">
                                    {post.likes ? post.likes.length + " likes" : "0 likes"}
                                </p>
                            </div>
                            <p className="ml-2 md:text-lg">{post.date}</p>
                        </div>
                    </>
                )}

                {post && modal === "comments" && (
                    <Comments
                        handleRefreshPost={handleRefreshPost}
                        post={post}
                        user={user}
                    />
                )}

                {post && modal === "suggestions" && <SuggestionsModal
                    handleRefreshPost={handleRefreshPost}
                    post={post}
                    user={user}
                    handleLastPostsUpdate={handleLastPostsUpdate}
                    lastPostsUpdate={lastPostsUpdate}
                />}
            </section>
        </ModalContainer>
    )
}