import { Container, Form, Input, Button } from "../library"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useHandleErrors, useAppContext } from "../hooks"
import { sendRestorePasswordEmail, generateNewPasswordWithCode } from "../../logic"

export default function NewPassword() {
    const { navigate } = useAppContext()
    const handleErrors = useHandleErrors()

    const [modal, setModal] = useState('email')
    const [email, setEmail] = useState(null)

    const handleSendEmail = event => {
        event.preventDefault()

        const email = event.target.email.value

        handleErrors(async () => {
            sendRestorePasswordEmail(email)

            setModal('password')
            setEmail(email)
        })
    }

    const handleRetrievePassword = event => {
        event.preventDefault()

        const code = event.target.verificationCode.value
        const newPassword = event.target.newPassword.value
        const newPasswordConfirm = event.target.newPasswordConfirm.value

        handleErrors(async () => {
            generateNewPasswordWithCode(email, code, newPassword, newPasswordConfirm)

            setModal('email')
            setEmail(null)
            navigate('/login')
        })
    }

    return <Container className="w-screen h-screen flex flex-col items-center justify-center bg-[url(/images/wallpaper.jpg)] bg-cover bg-center">
    <div className={`flex justify-center items-center w-11/12 pt-8 ${modal === 'password' ? 'mt-10' : ''}`}>
        <div className="w-4/5 h-fit py-10 bg-white rounded-[10px] border border-black flex flex-col items-center justify-center md:w-96">
            <img className="max-w-[140px] h-[140px] mt-[-140px] rounded-full" src="/images/logo-login-register.jpg" />
            {modal === 'email' && <Form className="flex flex-col gap-4 w-80 items-center my-5" onSubmit={handleSendEmail}>
                <p className="h-[54px] text-black text-3xl font-normal text-center mb-4">Restore password</p>
                <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="email" name="email" placeholder="Email" />
                <Button className="w-2/3 text-xl bg-blue-200 md:w-5/6">Send mail</Button>
            </Form>}
            {modal === 'password' && <Form className="flex flex-col gap-4 w-80 items-center my-5" onSubmit={handleRetrievePassword}>
                <p className="text-black text-4xl font-normal text-center mb-4">Restore password</p>
                <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="nubmer" name="verificationCode" placeholder="Verification code" />
                <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="password" name="newPassword" placeholder="New password" />
                <Input className="w-2/3 h-12 border-black border-2 rounded-lg p-4 md:w-5/6" type="password" name="newPasswordConfirm" placeholder="New password confirm" />
                <Button className="w-2/3 text-xl bg-blue-200 md:w-5/6">Set new password</Button>
            </Form>}
            <div className="flex flex-col gap-1 mt-6 items-center">
                <div className="text-center"><span className="text-black text-base font-normal">Return to </span><Link to="/login" className="text-sky-500 text-base font-bold">Login</Link></div>
            </div>
        </div>
    </div>
</Container>
}