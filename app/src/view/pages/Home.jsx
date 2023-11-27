import { useEffect, useState } from "react";
import { useAppContext, useHandleErrors } from "../hooks";
import { Container } from "../library";
import { Profile, Posts, SideBarMenu, Header, VisibilityPost, EditPost, DeletePost, PostModalWindow, Chatbot, SuggestionsPage, AddPost, AddPostFromChatbot, SearchPage, SummarizeText, SearchUser } from "../components";
import { logoutUser, retrieveUser, retrieveConversations } from "../../logic";
import { Routes, Route, Navigate } from "react-router-dom";
import { isUserLoggedIn } from "../../logic";
import { context } from "../../ui";

export default function Home() {
    const handleErrors = useHandleErrors();
    const { navigate, freeze, unfreeze } = useAppContext();

    const [modal, setModal] = useState();
    const [menu, setMenu] = useState(false);
    const [openedMenu, setOpenedMenu] = useState(false);
    const [lastPostsUpdate, setLastPostsUpdate] = useState(null);
    const [page, setPage] = useState("Home");
    const [view, setView] = useState("posts");
    const [conversationsOptions, setConversationsOptions] = useState();
    const [postModal, setPostModal] = useState(false)
    const [user, setUser] = useState()
    const [openedProfile, setOpenedProfile] = useState(false)
    const [writingText, setWritingText] = useState(false)
    const [profileModal, setProfileModal] = useState(false)
    const [postContent, setPostContent] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        console.log("Home -> render");

        renderConversations();

        if (!lastPostsUpdate) handleRefreshUser()
    }, [lastPostsUpdate]);

    useEffect(() => {
        console.log("Home -> render");

        renderConversations();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const handleRefreshUser = () => {
        handleErrors(async () => {
            freeze()

            const user = await retrieveUser();

            setUser(user);

            unfreeze()
        });
    }

    const renderConversations = () => {
        handleErrors(async () => {
            const conversations = await retrieveConversations();

            const newConversationsOptions = conversations.map((conv) => {
                return {
                    id: conv.id,
                    text: conv.title,
                    onClick: () => {
                        setPage("Chatbot");

                        context.conversationId = conv.id;

                        setLastPostsUpdate(Date.now());
                    },
                };
            });

            setConversationsOptions(newConversationsOptions);
        });
    };

    const handleLastPostsUpdate = () => {
        document.body.classList.remove("fixed-scroll");
        setLastPostsUpdate(Date.now());

        setModal(null);
    };

    const handleCloseModal = () => {
        setModal(null)
        
        setLastPostsUpdate(Date.now());
        document.body.classList.remove("fixed-scroll");
    };

    const handleOpenEditPost = () => setModal("editPost")

    const handleOpenDeletePost = () => setModal("deletePost")

    const handleOpenToggleVisibility = () => setModal("toggleVisibility")

    const handleOpenProfile = (modal) => {
        navigate('/profile')
        setProfileModal(modal)

        if(page === 'Chatbot') setPage('Home')

        if (menu) handleToggleMenu()

        setOpenedProfile(true)

        document.body.classList.remove('fixed-scroll')
    };

    const handleLogout = () => {
        logoutUser();

        navigate("/login");

        context.postId = null
        context.conversationId = null
        context.suggestionId = null
    };

    const handleToggleMenu = () => {
        if (modal !== 'profile' && !writingText)
            if (!menu) {
                setMenu(!menu);
                setOpenedMenu(!openedMenu);
            } else {
                setTimeout(() => {
                    setMenu(!menu);
                }, 400);
                setOpenedMenu(!openedMenu);
            }
    };

    const handleTogglePostModal = () => {
        document.body.classList.toggle("fixed-scroll");

        setPostModal(!postModal);
    };

    const scrollToTop = () => {
        const homeContainer = document.querySelector('.home-container')

        homeContainer.scrollTop = 0
    }

    return (
        <Container className="home-container bg-[url(/images/chatbot-3.1.jpg)] bg-fixed bg-center bg-cover fixed top-0 left-0 overflow-scroll">
            <Header
                handleOpenProfile={handleOpenProfile}
                handleLogout={handleLogout}
                handleToggleMenu={handleToggleMenu}
                setPage={setPage}
                handleCloseModal={handleCloseModal}
                lastPostsUpdate={lastPostsUpdate}
                openedProfile={openedProfile}
                setOpenedProfile={setOpenedProfile}
                setView={setView}
                user={user}
            />

            <main>
                {(page === 'Home' && !openedProfile) && <Posts
                    lastPostsUpdate={lastPostsUpdate}
                    view={view}
                    handleTogglePostModal={handleTogglePostModal}
                />}

                {modal === "addPost" && (
                    <AddPost
                        onCloseModal={handleCloseModal}
                        handleLastPostsUpdate={handleLastPostsUpdate}
                        setPage={setPage}
                    />
                )}

                {modal === "editPost" && (
                    <EditPost
                        onUpdatedPost={handleCloseModal}
                        onCancel={handleCloseModal}
                    />
                )}

                {modal === "toggleVisibility" && (
                    <VisibilityPost
                        onChangedVisibility={handleLastPostsUpdate}
                        onCancel={handleCloseModal}
                    />
                )}

                {modal === "deletePost" && (
                    <DeletePost
                        onDeletedPost={handleLastPostsUpdate}
                        onCancel={handleCloseModal}
                        handleTogglePostModal={handleTogglePostModal}
                    />
                )}

                {postModal && (
                    <PostModalWindow
                        handleOpenDeletePost={handleOpenDeletePost}
                        handleOpenEditPost={handleOpenEditPost}
                        handleOpenToggleVisibility={handleOpenToggleVisibility}
                        handleLastPostsUpdate={handleLastPostsUpdate}
                        handleTogglePostModal={handleTogglePostModal}
                        lastPostsUpdate={lastPostsUpdate}
                        handleOpenProfile={handleOpenProfile}
                    />
                )}

                {(menu || !isMobile) && conversationsOptions && (
                    <SideBarMenu
                        isMobile={isMobile}
                        homeOptions={[
                            {
                                text: 'Chatbot',
                                onClick: () => {
                                    setPage("Chatbot");

                                    if (context.conversationId) context.conversationId = null

                                    navigate("/chatbot");
                                },
                            },
                            {
                                text: "Search posts by subject/topics",
                                onClick: () => {
                                    navigate('/search')

                                    setPage('Search')
                                },
                            },
                            {
                                text: "Search users",
                                onClick: () => {
                                    setModal('searchUser')

                                    navigate('/')
                                },
                            },
                            {
                                text: "Summarize text",
                                onClick: () => {
                                    navigate('/summarize')

                                    context.conversationId = null

                                    setPage('Summarize')
                                }
                            },
                            {
                                text: "Home page",
                                onClick: () => {
                                    setLastPostsUpdate(Date.now());

                                    setPage('Home')
                                    setView("posts");

                                    navigate("/");
                                },
                            },
                            {
                                text: "Own posts",
                                onClick: () => {
                                    setLastPostsUpdate(Date.now());

                                    setPage('Home')
                                    setView("userPosts");

                                    navigate("/");
                                },
                            },
                            {
                                text: "Saved posts",
                                onClick: () => {
                                    setLastPostsUpdate(Date.now());

                                    setPage('Home')
                                    setView("savedPosts");

                                    navigate("/");
                                },
                            },
                            {
                                text: "Seen lately",
                                onClick: () => {
                                    setLastPostsUpdate(Date.now());

                                    setPage('Home')
                                    setView("seenPosts");

                                    navigate("/");
                                },
                            },
                            {
                                text: "My suggestions",
                                onClick: () => {
                                    setPage('Suggestions')

                                    navigate("/suggestions");
                                },
                            },
                            {
                                text: "Own posts suggestions",
                                onClick: () => {
                                    setPage('OwnPostsSuggestions')

                                    navigate("/suggestions");
                                },
                            },
                            {
                                text: "Create a post",
                                onClick: () => setModal('addPost')
                            },
                            {
                                text: "Empty box",
                                onClick: () => {},
                            },
                        ]}
                        chatbotOptions={[
                            {
                                text: "<- Return to home page",
                                onClick: () => {
                                    setPage("Home");

                                    navigate("/");
                                },
                            },
                            {
                                text: "+ New chat",
                                onClick: () => {
                                    context.conversationId = null;

                                    setLastPostsUpdate(Date.now());
                                },
                            },
                            {
                                id: 'deleteAllChatsId',
                                text: `Delete all chats`,
                                onClick: () => {
                                    context.conversationId = null;

                                    setLastPostsUpdate(Date.now());
                                },
                            },
                            ...conversationsOptions,
                            { onClick: () => { }, text: '' }
                        ]}
                        openedMenu={openedMenu}
                        page={page}
                        lastPostsUpdate={lastPostsUpdate}
                        handleToggleMenu={handleToggleMenu}
                        handleLastPostsUpdate={handleLastPostsUpdate}
                        openedProfile={openedProfile}
                        setOpenedProfile={setOpenedProfile}
                        scrollToTop={scrollToTop}
                    />
                )}

                {modal === 'addPostModal' && <AddPostFromChatbot
                    postContent={postContent}
                    setView={setView}
                    handleCloseModal={handleCloseModal}
                    setPage={setPage}
                />}

                {modal === 'searchUser' && <SearchUser
                    setModal={setModal}
                    handleOpenProfile={handleOpenProfile}
                />}

                <Routes>
                    <Route
                        path="chatbot"
                        element={
                            isUserLoggedIn() ? (
                                <Chatbot
                                    lastPostsUpdate={lastPostsUpdate}
                                    setPage={setPage}
                                    setWritingText={setWritingText}
                                    writingText={writingText}
                                    setView={setView}
                                    setPostContent={setPostContent}
                                    setModal={setModal}
                                    handleLastPostsUpdate={handleLastPostsUpdate}
                                />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="suggestions"
                        element={
                            isUserLoggedIn() && (page === 'Suggestions' || page === 'OwnPostsSuggestions') ? <SuggestionsPage
                                user={user}
                                setPage={setPage}
                                handleLastPostsUpdate={handleLastPostsUpdate}
                                lastPostsUpdate={lastPostsUpdate}
                                page={page}
                                handleOpenEditPost={handleOpenEditPost}
                                handleOpenDeletePost={handleOpenDeletePost}
                                handleOpenProfile={handleOpenProfile}
                        /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="profile"
                        element={
                            isUserLoggedIn() ? <Profile
                                onUpdatedAvatar={handleRefreshUser}
                                handleLogout={handleLogout}
                                page={page}
                                setPage={setPage}
                                setOpenedProfile={setOpenedProfile}
                                handleOpenDeletePost={handleOpenDeletePost}
                                handleOpenEditPost={handleOpenEditPost}
                                handleOpenToggleVisibility={handleOpenToggleVisibility}
                                handleLastPostsUpdate={handleLastPostsUpdate}
                                handleTogglePostModal={handleTogglePostModal}
                                lastPostsUpdate={lastPostsUpdate}
                                profileModal={profileModal}
                                setProfileModal={setProfileModal}
                            /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="search"
                        element={
                            isUserLoggedIn() ? <SearchPage
                                handleOpenDeletePost={handleOpenDeletePost}
                                handleOpenEditPost={handleOpenEditPost}
                                handleOpenToggleVisibility={handleOpenToggleVisibility}
                                handleLastPostsUpdate={handleLastPostsUpdate}
                                lastPostsUpdate={lastPostsUpdate}
                                handleOpenProfile={handleOpenProfile}
                            /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="summarize"
                        element={
                            isUserLoggedIn() ? <SummarizeText
                                setModal={setModal}
                                setPostContent={setPostContent}
                            /> : <Navigate to="/login" />
                        }
                    />
                </Routes>
            </main>
        </Container>
    );
}