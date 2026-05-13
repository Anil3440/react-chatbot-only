import { useState,useEffect,useRef} from 'react'
import {Chatbot} from 'supersimpledev'
import './App.css'

//chatInput component declared, also adding text to the chatMessages state
function ChatInput({chatMessages,setChatMessages,isLoading,setIsLoading}){

    const [textInput,setTextInput] = useState('');
    function saveTextInput(event){
        setTextInput(event.target.value);
    } 

    //logic for adding textInput to state
    async function showTextInput(){

        if(isLoading || textInput === ""){
            return;
        }
        setIsLoading(true);

        //user textInput added
        const newChatMessages = [
            ...chatMessages,
            {
                message: textInput,
                sender: "user",
                id: crypto.randomUUID()
            }
        ]
        setChatMessages(newChatMessages);
        
        //loading textInput added
        setChatMessages([
            ...newChatMessages,
            {
                message: "loading",
                sender: "bot",
                id: crypto.randomUUID()
            }
        ]);

        //chatBot response added
        const response = await Chatbot.getResponseAsync(textInput);
        setChatMessages([
            ...newChatMessages,
            {
                message: response,
                sender: "bot",
                id: crypto.randomUUID()
            }
        ]);

        setTextInput('');
        setIsLoading(false);
    }

    //event handler logic for keyDown
    function updateTextInput(e){
        e.key == "Enter" && showTextInput();
        e.key == "Escape" && setTextInput('');
    }

    return(
        <>
            <div className='flex'>
                <input
                    type="text"
                    placeholder="Enter your message"
                    onChange={saveTextInput}
                    value={textInput}
                    onKeyDown={updateTextInput}
                    className='
                        border border-black
                        w-full py-2
                        rounded-lg
                        pl-2 
                    '
                />
                <button
                    onClick={showTextInput}
                    className="
                    border
                    border-black
                    bg-green-600
                    text-white
                    px-4 py-2 ml-4
                    rounded-lg
                    "
                >Send</button>
            </div>
        </>
    );
}

//basic structure for chatMessage component
function ChatMessage({message,sender}){
    // const {message,sender} = props;

    const isUser = sender==="user";
    return(
        <div className={`
            flex items-end gap-4 my-4
            ${isUser? 'justify-end': 'justify-start'}
        `}>
            {!isUser && (
                <img src="robot.png" width="40" />
            )}
            <div className={`
                    max-w-screen h-[40px] flex items-center px-2 rounded-md
                    ${isUser? 'bg-gray-200 font-bold' : 'bg-gray-300 '}
                `}>
                {message}
            </div>

            {isUser && (
                <img src="user.png" width="40" />
            )}
            
        </div>
    );
}

function SetInputBtn({isOnBottom,setOnBottom}){
    return(
        <div className='w-1/2 text-red-400 font-bold text-center mx-auto'>
            <button onClick={
                ()=>{
                    setOnBottom(!isOnBottom)
                }
            }>Set text input to {isOnBottom?'top':'bottom'}</button>
        </div>
    )
}

//chatMessages state display logic using chatMessage component declared above.
function ChatMessages({chatMessages}){
    
    
    return(
        <>
            {chatMessages.map((currMessage)=>{
                return(
                    <ChatMessage
                        message={currMessage.message}
                        sender={currMessage.sender}
                        key={currMessage.id}
                    />
                );
            })}
        </>
    );
}

function App(){

    //chatMessages react state scope made global by declaring in app component.
    const [chatMessages,setChatMessages] = useState(
        [{
            message: "Hey chatbot!",
            sender: "user",
            id: 'id1'
        },{
            message: "Hello how can i help you?",
            sender: "bot",
            id: 'id2'
        },{
            message: "What is today's date?",
            sender: "user",
            id: 'id3'
        },{
            message: "Today is 31st december 2025.",
            sender: "bot",
            id: 'id4'
        }]
    );

    const[isLoading,setIsLoading] = useState(false);
    const[isOnBottom,setOnBottom] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [chatMessages]);

    return(
        <div className='
            max-w-[1200px] mx-auto py-10 h-screen flex flex-col
        '>
            <div className='w-full h-full flex flex-col'>
                {
                    !isOnBottom && 
                    <ChatInput 
                        setChatMessages = {setChatMessages}
                        chatMessages={chatMessages}
                        isLoading = {isLoading}
                        setIsLoading = {setIsLoading}
                    />
                    
                                       
                }
                <div className='flex-1 overflow-y-auto  min-h-0'>
                    
                    <ChatMessages
                        chatMessages = {chatMessages}
                    />
                    <div ref={messagesEndRef}/>
                </div>
                {
                    isOnBottom && (
                        <div className='mt-auto'>
                            <ChatInput 
                                setChatMessages = {setChatMessages}
                                chatMessages={chatMessages}
                                isLoading = {isLoading}
                                setIsLoading = {setIsLoading}
                            />
                        </div>
                    )                   
                }
            </div>
            <div className='w-full shrink-0'>
                <SetInputBtn
                    isOnBottom = {isOnBottom}
                    setOnBottom = {setOnBottom}
                />
            </div>
               
        </div>
    );
}

export default App
