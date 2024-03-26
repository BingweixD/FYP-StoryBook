// import logo from './logo.svg';
import './App.css';
import './normal.css';
import {useState} from 'react';

function App() {
  //add state fir input and chat log
  const [input, setInput] = useState("");
  const [chatLog, setChatlog] = useState([{
    role:"gpt",
    message: "Hello! I'm your writting assistance! What particular theme is in your mind?"
},
// {
//     role:"me",
//     message:"I want to use ChatGPT today"
// }
]);

async function handleSubmit(e) {
  e.preventDefault();
  const userMessage = input.trim();
  if (userMessage === "") return; // Prevent sending empty messages

  // Log the user message for debugging
  console.log("Sending message to backend:", userMessage);

  // Append user message to chat log
  setChatlog(prevChatLog => [...prevChatLog, { role: 'user', content: userMessage }]);
  
  // Clear the input after sending the message
  setInput("");

  try {
    const response = await fetch("http://localhost:3080/", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userMessage: userMessage, // You are sending the userMessage
        chatLog: chatLog // And the current chatLog (you might not need to send the whole chatLog)
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Log the response for debugging
    console.log('Received response from server:', data);

    // Append ChatGPT response to chat log
    setChatlog(prevChatLog => [...prevChatLog, { role: "gpt", message: data.message }]);
  } catch (error) {
    console.error("Error handling form submission:", error);
    // Append error message to chat log for user feedback
    setChatlog(prevChatLog => [...prevChatLog, { role: "gpt", message: "Sorry, I'm having trouble processing that request." }]);
  }
}
  
  return (
    <div className="App">
      <aside className ="sidemenu">
        <div className = "sidemenu-button">
          <span>+</span>
          New Chat
        </div>
      </aside>

      <section className="chatbox">
        <div className='chat-log'>
          {chatLog.map ((message, index)=>(<ChatMessage key={index} message ={message} />))}
        </div>
        <div className ="chat-input-holder">
          <form onSubmit = {handleSubmit}>
            <input 
              rows="1"
              value={input}
              onChange={(e)=> setInput(e.target.value)}
              className ="chat-input-textarea" 
              placeholder='Type your message here'>
            </input>
          </form>
          
        </div>


      </section>

     
    </div>
  );
}
const ChatMessage = ({message}) => {
  return(
    <div className={`chat-message ${message.role === "gpt" && "chatgpt"}`}>
            <div className='chat-message-center'>
              <div className={`avatar ${message.role === "gpt" && "chatgpt"}`}>
                {message.user === "gpt"} 
                {/* && <svg */}
              </div>
              <div className="message">{message.message || message.content}</div>
            </div>
          </div>
  )
}
export default App;



//Nwe start
import './App.css';
import './normal.css';
import { useState } from 'react';

function App() {
  // State for input, chat log, story questions, and story responses
  const [input, setInput] = useState("");
  const [chatLog, setChatlog] = useState([
    {
      role: "gpt",
      message: "Let's brainstorm your children's story together! Please provide some initial details about your story, such as the setting, characters, and the problem they need to solve. ChatGPT will then generate questions to help you develop the plot."
    }-
  ]);
  const [storyQuestions, setStoryQuestions] = useState([]);
  const [storyResponses, setStoryResponses] = useState({});

  // Fetch story questions from the backend
  const fetchStoryQuestions = async () => {
    try {
      const response = await fetch("http://localhost:3080/get-story-questions");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const questions = await response.json();
      setStoryQuestions(questions);
      const initialResponses = {};
      questions.forEach(q => {
        initialResponses[q.id] = "";
      });
      setStoryResponses(initialResponses);
    } catch (error) {
      console.error("Error fetching story questions:", error);
    }
  };

  // Handle change in story responses
  const handleStoryResponseChange = (questionId, response) => {
    setStoryResponses(prevResponses => ({
      ...prevResponses,
      [questionId]: response
    }));
  };

  // Submit custom story request
  const submitCustomStory = async () => {
    try {
      const response = await fetch("http://localhost:3080/generate-custom-story", {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.values(storyResponses))
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const { story } = await response.json();
      setChatlog(prevChatLog => [...prevChatLog, { role: 'gpt', message: story }]);
    } catch (error) {
      console.error("Error generating custom story:", error);
    }
  };

  // Handle chat form submission
  async function handleSubmit(e) {
    e.preventDefault();
    const userMessage = input.trim();
    if (userMessage === "") return;

    console.log("Sending message to backend:", userMessage);
    setChatlog(prevChatLog => [...prevChatLog, { role: 'user', content: userMessage }]);
    setInput("");

    try {
      const response = await fetch("http://localhost:3080/", {
        method: "post",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userMessage,
          chatLog
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response from server:', data);
      setChatlog(prevChatLog => [...prevChatLog, { role: "gpt", message: data.message }]);
    } catch (error) {
      console.error("Error handling form submission:", error);
      setChatlog(prevChatLog => [...prevChatLog, { role: "gpt", message: "Sorry, I'm having trouble processing that request." }]);
    }
  }

  return (
    <div className="App">
      <aside className="sidemenu">
        <div className="sidemenu-button" onClick={fetchStoryQuestions}>
          <span>?</span>
          Get Story Questions
        </div>
      </aside>

      <section className="chatbox">
        <div className='chat-log'>
          {chatLog.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>

        <div className="chat-input-holder">
          <form onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input-textarea"
              placeholder='Type your message here'>
            </input>
          </form>
        </div>

        <div className="story-questions">
          {storyQuestions.map(question => (
            <div key={question.id} className="story-question">
              <label htmlFor={`question-${question.id}`}>{question.question}</label>
              <input
                id={`question-${question.id}`}
                type="text"
                value={storyResponses[question.id]}
                onChange={(e) => handleStoryResponseChange(question.id, e.target.value)}
              />
            </div>
          ))}
          <button onClick={submitCustomStory}>Submit Story</button>
        </div>
      </section>
    </div>
  );
}

const ChatMessage = ({ message }) => {
  return (
    <div className={`chat-message ${message.role === "gpt" && "chatgpt"}`}>
      <div className='chat-message-center'>
        <div className={`avatar ${message.role === "gpt" && "chatgpt"}`}>
          {message.user === "gpt"}
        </div>
        <div className="message">{message.message || message.content}</div>
      </div>
    </div>
  )
}
export default App;
