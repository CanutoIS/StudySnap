import { isUserLoggedIn } from './logic'
import AppContext from './AppContext'
import { Login, Register, Home, NewPassword } from './view/pages'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Alert } from './view/components'
import { LoaderContent } from './view/library'
import serverStatus from './logic/helpers/serverStatus'

const { Provider } = AppContext

function App() {
    const [feedback, setFeedback] = useState(null)
    const [loader, setLoader] = useState(false)
    const [serverStatusResponse, setServerStatusResponse] = useState(null)
    const navigate = useNavigate()

    const checkServer = async () => {
        try {
            const res = await serverStatus()

            if(res === 200) {
                setServerStatusResponse(true)
                unfreeze()
            }
            else {
                setServerStatusResponse(false)
                unfreeze()
                throw new Error('Connection error')
            }
            
        } catch (error) {
            alert(error, 'error')
        }
    }

    useEffect( () => {
        const fetchData = async () => {
            try {
                freeze();
                await checkServer();
                
            } catch (error) {
                alert(error, 'error');
            }
        };
    
        fetchData();
    }, [])

    const alert = (error, level = 'info') => setFeedback({ error, level })

    const handleOnAcceptAlert = () => setFeedback(null)

    const freeze = () => setLoader(true)
    const unfreeze = () => setLoader(false)

    return <Provider value={{ alert, navigate, freeze, unfreeze }}>
        <Routes>
            {(() => console.log('Routes -> render'))()}
            <Route path='/login' element={isUserLoggedIn() ? <Navigate to='/' /> : <Login />} />
            <Route path='/newPassword' element={isUserLoggedIn() ? <Navigate to='/' /> : <NewPassword />} />
            <Route path='/register' element={isUserLoggedIn() ? <Navigate to='/' /> : <Register />} />
            <Route path='/*' element={isUserLoggedIn() ? <Home /> : <Navigate to='/login' />} />
        </Routes>

        {loader && <LoaderContent />}
        {feedback && <Alert error={feedback.error} level={feedback.level} onAccept={handleOnAcceptAlert} />}
    </Provider>
}

export default App
