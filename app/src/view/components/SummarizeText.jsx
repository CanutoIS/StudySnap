import { Container, Form, Button } from "../library";
import { useHandleErrors, useAppContext } from "../hooks";
import { generateSummaryFromScratch } from "../../logic";
import { context } from "../../ui";

export default function SummarizeText({ setModal, setPostContent }) {
    const handleErrors = useHandleErrors()
    const { freeze, unfreeze } = useAppContext()

    const handleGenerateSummary = event => {
        event.preventDefault()

        const textToSummarize = event.target.textToSummarize.value

        handleErrors(async () => {
            freeze()

            const summary = await generateSummaryFromScratch(textToSummarize)

            context.summary = true

            setPostContent(summary)

            setModal('addPostModal')

            context.summary = false

            unfreeze()
        })
    }

    return <Container className='fixed top-0 md:left-60 right-0 p-4 mt-8 bg-white gap-8 md:w-full md:pr-60'>
        <h2 className="w-full text-4xl font-thin text-center">Summarize text</h2>
        <Form className='h-2/3 w-full rounded p-2 md:mr-4 md:px-10' onSubmit={handleGenerateSummary}>
            <textarea className="h-full w-full border border-slate-400 p-2 rounded md:text-lg" name='textToSummarize' placeholder='Text to summarize'/>
            <Button className='md:text-lg'>Generate summary</Button>
        </Form>
    </Container>
}