export default async function serverStatus() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/serverStatus`)

    if(!res || res?.status !== 200)
        return 'Server is down'

    return res.status
}