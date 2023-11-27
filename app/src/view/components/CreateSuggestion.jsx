import { ModalContainer, ModalWindow, Input, Form, Button } from "../library";

export default function CreateSuggestion({ handleCreateSuggestion, handleCloseModal }) {
    return (
        <ModalContainer
            className="SuggestionModal absolute top-0 bg-black bg-opacity-20"
            onClick={(event) => {
                if (event.target === document.querySelector(".SuggestionModal"))
                    handleCloseModal();
            }}
        >
            <ModalWindow className='w-11/12 md:w-2/3'>
                <Form
                    className="h-96 w-full md:text-lg"
                    onSubmit={handleCreateSuggestion}
                >
                    <h2 className="text-lg">New suggestion</h2>
                    <Input
                        className="w-full"
                        name="title"
                        placeholder='Reason of the suggestion'
                        autoFocus
                    ></Input>
                    <textarea
                        className="border border-gray-400 rounded-md p-2 h-60 w-full"
                        cols="30"
                        rows="10"
                        name="content"
                        placeholder='Content of the suggestion'
                    ></textarea>
                    <div className="w-full flex justify-evenly">
                        <Button className="bg-slate-100 w-14">Add</Button>
                        <Button
                            className="bg-slate-100"
                            type="button"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            </ModalWindow>
        </ModalContainer>
    );
}
