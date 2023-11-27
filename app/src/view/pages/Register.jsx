import { Link } from 'react-router-dom'
import { useAppContext } from "../hooks"
import { useHandleErrors } from '../hooks'
import { Container, Form, Input, Button } from '../library'
import { registerUser, sendRegisterSuccessMessage } from '../../logic'

export default function Register() {
    const { navigate, freeze, unfreeze } = useAppContext()
    const handleErrors = useHandleErrors()

    const handleRegisterIn = (event) => {
        event.preventDefault()

        freeze()

        const name = event.target.name.value
        const username = event.target.username.value
        const email = event.target.email.value
        const password = event.target.password.value

        handleErrors(async () => {
            await registerUser(name, username, email, password)
            await sendRegisterSuccessMessage(email)

            navigate('/login')

            unfreeze()
        })
    }

    return <Container className="w-screen h-screen bg-white flex flex-col items-center justify-center bg-[url(/images/wallpaper.jpg)] bg-cover bg-center">
        <div className='flex justify-center items-center w-11/12 mt-8'>
            <div className="w-4/5 h-[500px] bg-white rounded-[10px] border border-black flex flex-col items-center justify-center md:w-96">
                <Form className="flex flex-col gap-3 w-80 items-center mt-2 mb-4" onSubmit={handleRegisterIn}>
                    <img className="max-w-[140px] h-[140px] rounded-full mt-[-100px]" src="/images/logo-login-register.jpg" />
                    <p className="h-[54px] text-black text-4xl font-normal poppins">Register</p>
                    <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" name='name' placeholder="Name" />
                    <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" name='username' placeholder="Userame" />
                    <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="email" name='email' placeholder="Email" />
                    <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="password" name='password' placeholder="Password" />
                    <Button className="w-2/3 text-xl bg-blue-200">Register</Button>
                </Form>
                <div className="flex gap-6 mb-8">
                    <div className="text-center"><span className="text-black text-base font-normal">Already have an account?<br />Go to </span><Link to="/login" className="text-sky-500 text-base font-bold">Login</Link></div>
                </div>
            </div>
        </div>
    </Container>
}