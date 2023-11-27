import { Link } from 'react-router-dom'
import { loginUser } from '../../logic'
import { useAppContext } from "../hooks"
import { useHandleErrors } from '../hooks'
import { Container, Form, Input, Button } from '../library'

export default function Login() {
    const { navigate, freeze, unfreeze } = useAppContext()
    const handleErrors = useHandleErrors()

    const handleLogin = (event) => {
        event.preventDefault()

        freeze()

        const email = event.target.email.value
        const password = event.target.password.value

        handleErrors(async () => {
            await loginUser(email, password)

            navigate('/')

            unfreeze()
        })
    }

    console.log('login -> render');

    return <Container className="w-screen h-screen flex flex-col items-center justify-center bg-[url(/images/wallpaper.jpg)] bg-cover bg-center">
        <div className='flex flex-col justify-center items-center w-full pt-8'>
            <img className="max-w-[140px] h-[140px] mt-[-520px] lg:mt-[-430px] ml-0 lg:ml-[-730px] rounded-full absolute" src="/images/logo-login-register.jpg" />
            <div className="w-fit h-[450px] bg-white rounded-[10px] border border-black flex items-center justify-center gap-6 p-6">
                <div className='hidden lg:flex flex-col gap-4 w-96 text-center'>
                    <h1 className='text-4xl font-bold'>Welcome to StudySnap!</h1>
                    <p className='text-lg'>Chat with intelligent ChatBots, create summaries of your conversations, and discover insightful resumens shared by others. Let's learn and connect like never before. Join StudySnap today!</p>
                </div>
                <div className='flex flex-col items-center'>
                    <Form className="flex flex-col gap-4 w-80 items-center mb-5" onSubmit={handleLogin}>
                        <p className="text-black text-4xl font-normal poppins">Log in</p>
                        <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="email" name="email" placeholder="Email" />
                        <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="password" name="password" placeholder="Password" />
                        <Button className="w-2/3 text-xl bg-blue-200 md:w-5/6">Login</Button>
                    </Form>
                    <div className="flex flex-col gap-2 items-center px-6">
                        <div className="text-center px-1 flex flex-col">
                            <span className="text-black text-base font-normal">Don’t have an account? Go to </span>
                            <Link to="/register" className="text-sky-500 text-base font-bold">Register</Link>
                        </div>
                        <div className='h-full w-full border-t border-black mx-10'></div>
                        <div className="text-center px-1 flex flex-col">
                            <span className="text-black text-base font-normal">Forgot your password? </span>
                            <Link to="/newPassword" className="text-sky-500 text-base font-bold">Restore password</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Container>
}