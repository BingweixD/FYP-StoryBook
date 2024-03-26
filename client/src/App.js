// import logo from './logo.svg';
import './App.css';
import './normal.css';
import React, { useState, useEffect, useRef } from 'react';


function App() {
  
  //add state fir input and chat log
  const [input, setInput] = useState("");
  const [chatLog, setChatlog] = useState([{
    role:"gpt", 
      message: "Lets craft and create a children's story step by step! Share some key details to get started:\n 1. Setting: Describe the story's location and time.\n2. Characters: Introduce the main characters, their traits, and any special abilities.\n3.Plot: Outline the main events and challenges.\n4.Theme: What's the story's moral or message?\n5.Visual Elements: Highlight any scenes or elements for illustrations.\n\nAdd any extra details for your story. After planning, choose an art style for the illustrations. Consider styles or artists that inspire you for the artwork (e.g., watercolor, digital). \n6. Generate the full cohesive story with title based on the discussion."
    }, 
]);
  const [stories, setStories] = useState([]);
  const [requestedPages, setRequestedPages] = useState(1);
  const chatLogRef = useRef(null);  

  useEffect(() => {
  if (chatLogRef.current) {
    const chatContainer = chatLogRef.current;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}, [chatLog]);


async function handleGenerateImage() {
  const lastMessage = chatLog[chatLog.length - 1].message;
  if (!lastMessage) {
    console.error("No last message available for image generation.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3080/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: lastMessage })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Change from imageUrl to imageUrls to reflect that it's now an array
    const imageUrls = data.imageUrls;
    if (imageUrls && imageUrls.length > 0) {
      // Iterate over each URL and add it to the chat log
      const imageMessages = imageUrls.map(url => ({ role: "gpt", message: `Image URL: ${url}` }));
      setChatlog(prevChatLog => [...prevChatLog, ...imageMessages]);
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
}


const downloadPDF = async (storyId) => {
  const response = await fetch(`http://localhost:3080/download-pdf/${storyId}`);
  if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `story-${storyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } else {
      console.error('Failed to download PDF');
  }
};


async function generatePDFWithPages() {
  const lastEntry = chatLog[chatLog.length - 1];
  const imageUrl = lastEntry.role === 'gpt' ? lastEntry.message.replace('Image URL: ', '') : null;

  // Include requestedPages in the request body
  const response = await fetch('http://localhost:3080/generate-pdf', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ chatLog, imageUrl, requestedPages }) // Include requestedPages here
  });

  if (response.ok) {
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'storybook.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } else {
      console.error('Failed to generate PDF');
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  const userMessage = input.trim();
  if (userMessage === "") return; // Prevent sending empty messages

  // Append user message to chat log
  setChatlog(prevChatLog => [...prevChatLog, { role: 'user', message: userMessage }]);
  setInput(""); // Clear the input after sending the message

  try {
    const response = await fetch("http://localhost:3080/", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userMessage, chatLog })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const { message, imageUrl } = data; // Destructuring to extract message and imageUrl
    const newMessages = [
      { role: "gpt", message }, // ChatGPT's response
    ];

    if (imageUrl) {
      newMessages.push({ role: "gpt", message: `Image URL: ${imageUrl}` });
    }


    setChatlog(prevChatLog => [...prevChatLog, ...newMessages]);
  } catch (error) {
    console.error("Error handling form submission:", error);
    setChatlog(prevChatLog => [...prevChatLog, { role: "gpt", message: "Sorry, I'm having trouble processing that request." }]);
  }
  
}

  return (
    <div className="App">
      <aside className ="sidemenu">
      {stories.map((story) => (
        <div key={story.id} className="sidemenu-item" onClick={() => downloadPDF(story.id)}>
            {story.title}
        </div>
          ))}
        <div className = "sidemenu-button">
          <span>+</span>
          New Chat
        </div>
      </aside>

      <section className="chatbox">
        <div className='chat-log' ref={chatLogRef}>
        {chatLog.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        </div>
        <div className ="chat-input-holder">
        <button onClick={handleGenerateImage}>Generate Image</button>
        
        {/* <button onClick={generatePDF}>Create PDF</button> */}
        <input 
          type="number"
          value={requestedPages}
          onChange={(e) => setRequestedPages(e.target.value)}
          placeholder="Number of Pages"
          className="page-input" />
          <button onClick={generatePDFWithPages}>Generate PDF with Pages</button>
        
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

const ChatMessage = ({ message }) => {
  const textMessage = message.message || message;
  const isImage = typeof textMessage === 'string' && textMessage.startsWith('Image URL: ');
  const imageUrl = isImage ? textMessage.replace('Image URL: ', '') : null;
  

  // Updated function to format bold
  const formatMessage = (text) => {
    return text.split('\n').map((item, index) => {
      const parts = item.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        // Check if the part is meant to be bold
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>; // Slice to remove the asterisks
        }
        return part; // Return unformatted text
      });

      return <p key={index}>{parts}<br /></p>;
    });
  };
  const content = isImage ? (
    <img src={imageUrl} alt="Generated" />
  ) : (
    <div>{formatMessage(textMessage)}</div>
  );
  
  return (
    <div className={`chat-message ${message.role === "gpt" ? "chatgpt" : "chatuser"}`}>
      <div className='chat-message-center'>
        <div className={`avatar ${message.role === "gpt" ? "chatgpt" : "chatuser"}`}>
        </div>
        <div className="message">
        {content}
        </div>
      </div>
    </div>
  );
}



export default App;


// WE can go for this approach to scroll down
// document.addEventListener('submit', (e) => {
//   e.preventDefault()
//   const userInput = document.getElementById('user-input')
//   const newSpeechBubble = document.createElement('div')
//   newSpeechBubble.classList.add('speech', 'speech-human')
//   chatbotConversation.appendChild(newSpeechBubble)
//   newSpeechBubble.textContent = userInput.value
//   userInput.value = ''
//   chatbotConversation.scrollTop = chatbotConversation.scrollHeight
// })

//render type wrotomg effect
// function renderTypewriterText(text) {
//   const newSpeechBubble = document.createElement('div')
//   newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
//   chatbotConversation.appendChild(newSpeechBubble)
//   let i = 0
//   const interval = setInterval(() => {
//       newSpeechBubble.textContent += text.slice(i-1, i)
//       if (text.length === i) {
//           clearInterval(interval)
//           newSpeechBubble.classList.remove('blinking-cursor')
//       }
//       i++
//       chatbotConversation.scrollTop = chatbotConversation.scrollHeight
//   }, 50)
// }