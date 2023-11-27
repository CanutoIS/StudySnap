import { useAppContext } from "../hooks"
import { RandomAvatar } from "react-random-avatars"

export default function Header({ handleToggleMenu, handleOpenProfile, setPage, handleCloseModal, openedProfile, setOpenedProfile, setView, user }) {
    const { navigate } = useAppContext()

    const handleReturnToHome = () => {
        setPage('Home')
        setView('posts')

        handleCloseModal()

        navigate('/')

        if (openedProfile) setOpenedProfile(false)
    }

    return <header className={`fixed h-24 top-0 w-full z-20 bg-slate-100`}>
        <div className="h-full flex justify-between items-center px-4 md:px-10">
            <span className="material-symbols-outlined notranslate mx-2 md:hidden notraslate" onClick={handleToggleMenu}>menu</span>
            <p className="hidden md:flex text-4xl w-60 m-[-40px] h-full bg-slate-300 justify-center items-center font-serif">Menu</p>
            <img className="cursor-pointer h-14 rounded-lg md:h-16" onClick={handleReturnToHome} src="/images/logo-home.jpg" />
            {(user && user.avatar)
            ?
            <img className="h-10 w-10 object-cover rounded-full cursor-pointer md:h-14 md:w-14" src={user.avatar} alt="avatar image" onClick={() => handleOpenProfile('currentUser')} />
            :
            user && <div onClick={() => handleOpenProfile('currentUser')}><p className='cursor-pointer'> <RandomAvatar name={user.name} size={40} /></p></div>}
        </div>
    </header>
}