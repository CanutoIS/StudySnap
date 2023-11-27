import Post from "./Post";
import { useState, useEffect } from "react";
import { retrievePosts, retrieveSavedPosts, retrieveUserPosts, getUserId, retrieveSeenPosts } from "../../logic";
import { useAppContext, useHandleErrors } from "../hooks"

export default function Posts({ lastPostsUpdate, view, handleTogglePostModal }) {
    const { freeze, unfreeze } = useAppContext()
    const handleErrors = useHandleErrors()

    const [posts, setPosts] = useState(null)

    useEffect(() => handleRefreshPosts(), [])

    const handleRefreshPosts = () => {
        try {
            if (view === 'posts') {
                handleErrors(async () => {
                    freeze()

                    console.debug('Postsss -> render')

                    const _posts = await retrievePosts('Show all posts')

                    setPosts(_posts)

                    unfreeze()
                })
            }
            else if (view === 'savedPosts') {
                handleErrors(async () => {
                    freeze()

                    console.debug('Saved postsss -> render')

                    const _posts = await retrieveSavedPosts()

                    setPosts(_posts)

                    unfreeze()
                })
            }
            else if (view === 'userPosts') {
                handleErrors(async () => {
                    freeze()

                    console.debug('Own postsss -> render')

                    const _posts = await retrieveUserPosts()

                    setPosts(_posts)

                    unfreeze()
                })
            }
            else if (view === 'seenPosts') {
                handleErrors(async () => {
                    freeze()

                    console.debug('Seen postsss -> render')

                    const _posts = await retrieveSeenPosts()

                    setPosts(_posts)

                    unfreeze()
                })
            }
        } catch (error) {
            alert(error, 'error')
            console.debug(error)
        }
    }

    useEffect(() => {
        console.debug('Posts -> "ComponentWillRecieveProps" with hooks.');

        if (lastPostsUpdate) {
            console.log('Post -> last render');

            handleRefreshPosts()
        }
    }, [lastPostsUpdate])

    return <section className="pb-12 flex flex-col items-center absolute top-28 left-0 w-full md:pl-80">
        <h1 className="w-full text-center md:text-start text-5xl font-thin underline mb-4">{view === 'posts' ? 'Home page' : view === 'savedPosts' ? 'Saved posts' : view === 'userPosts' ? 'My posts' : view === 'seenPosts' ? 'Seen lately' : ''}</h1>
        
        <div className="flex flex-col items-center md:justify-evenly gap-10 md:flex-row md:w-full py-4 px-6  h-fit md:flex-wrap md:mr-28">
            {posts && posts.map(post => (post.author.id !== getUserId() && !post.visible) ? '' : <Post
                key={post.id.toString()}
                post={post}
                handleTogglePostModal={handleTogglePostModal}
            />)}
        </div>
        {(!posts || !posts.length) && <h2 className="text-2xl my-10 border border-gray-600 p-4 rounded-lg">There is no posts availabe!</h2>}
    </section>
}