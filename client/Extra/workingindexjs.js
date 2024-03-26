require('dotenv').config();
const express = require('express');
const OpenAI = require("openai");
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 3080;
// Function to summarize the story
const summarizeStory = async (storyText) => {
    try {
        const summaryCompletion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Summarize the following story:\n\n${storyText}`,
            max_tokens: 150
        });

        if (summaryCompletion && summaryCompletion.choices && summaryCompletion.choices.length > 0) {
            const summary = summaryCompletion.choices[0].text.trim();
            console.log('Story Summary:', summary);
            return summary;
        } else {
            console.error("No summary in response:", summaryCompletion);
            return '';
        }
    } catch (error) {
        console.error("An error occurred while summarizing the story:", error);
        return '';
    }
};

// Function to generate an image using DALL-E
const generateImage = async (summaryText) => {
    try {
        // Note: Replace this with the actual code to call the DALL-E API
        // For demonstration, this is a placeholder
        const imageUrl = `URL_of_the_generated_image_based_on_${summaryText}`;
        console.log('Generated Image URL:', imageUrl);
        return imageUrl;
    } catch (error) {
        console.error("An error occurred while generating an image:", error);
        return '';
    }
};



// Function to call OpenAI API
const callApi = async (userMessage, chatLog) => {
    try {
        const startTime = Date.now();

        // Validate userMessage
        if (!userMessage || typeof userMessage !== 'string') {
            console.error("Invalid user message:", userMessage);
            return 'Invalid user message.';
        }

        // Validate chatLog
        if (!Array.isArray(chatLog)) {
            console.error("Invalid chat log:", chatLog);
            return 'Invalid chat log.';
        }

        // Map roles in chatLog ('me' to 'user' and 'gpt' to 'assistant')
        const formattedMessages = chatLog.map(msg => ({
            role: msg.role === 'me' ? 'user' : (msg.role === 'gpt' ? 'assistant' : msg.role),
            content: msg.message || msg.content || ''
        }));

        // Validate formattedMessages
        const isValid = formattedMessages.every(msg => typeof msg.content === 'string');
        if (!isValid) {
            console.error("Invalid formatted message:", formattedMessages);
            return 'Invalid input data.';
        }

        // Add the latest user message to the formattedMessages array
        formattedMessages.push({ role: 'user', content: userMessage });

        // Debug log
        console.log('Formatted Messages:', formattedMessages);

        const chatCompletion = await openai.chat.completions.create({
            model: "ft:gpt-3.5-turbo-1106:personal::8hke3Plj",
            messages: formattedMessages,
            max_tokens: 1000
        });
        const endTime = Date.now(); // Record end time
        const duration = endTime - startTime; // Calculate duration

        console.log("OpenAI API Response:", JSON.stringify(chatCompletion, null, 2));
        console.log(`API call duration: ${duration}ms`); // Log the duration

        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
            const choice = chatCompletion.choices[0];
            if (choice && choice.message && choice.message.content) {
                const content = choice.message.content;
                console.log('Content:', content);
                return content;
            } else {
                console.error("No content in response:", chatCompletion);
                return 'An error occurred while fetching data.';
            }
        } else {
            console.error("Invalid or incomplete response from OpenAI API:", chatCompletion);
            return 'An error occurred while fetching data.';
        }
    } catch (error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        return 'An error occurred while fetching data.';
    }
};


// Endpoint to handle chat messages
app.post('/', async (req, res) => {
    try {
        const { userMessage, chatLog } = req.body;
        console.log('Received user message:', userMessage, chatLog);
        const response = await callApi(userMessage, chatLog);
        console.log('Final response to client:', response);
        res.json({ message: response });
    } catch (error) {
        console.error("Error handling form submission:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to receive user responses and generate story
// app.post('/generate-custom-story', async (req, res) => {
//     try {
//         const userResponses = req.body; // Assuming this is an array of responses
//         // Use userResponses to tailor the story generation
//         // For example, build a prompt based on the responses
//         let prompt = "Create a story with the following details: ";
//         userResponses.forEach(response => {
//             prompt += `\n- ${response}`;
//         });

//         // Generate the story using the customized prompt
//         const story = await callApi(prompt, [{ role: 'system', content: 'You are a creative storyteller.' }]);
//         console.log('Generated Custom Story:', story);

//         res.json({ story });
//     } catch (error) {
//         console.error("Error in custom story generation:", error);
//         res.status(500).json({ error: error.message });
//     }
// });


// app.post('/generate-story', async (req, res) => {
//     try {
//         const { userMessage, chatLog } = req.body;
//         console.log('Received user message for story generation:', userMessage);

//         // Step 1: Generate the story
//         const story = await callApi(userMessage, chatLog);
//         console.log('Generated Story:', story);

//         // Step 2: Summarize the story
//         const summary = await summarizeStory(story);
//         console.log('Story Summary:', summary);

//         // Step 3: Generate an image based on the summary
//         // This is a placeholder. You need to implement the actual call to DALL-E's API.
//         const imageUrl = await generateImage(summary);
//         console.log('Generated Image URL:', imageUrl);

//         res.json({ story, summary, imageUrl });
//     } catch (error) {
//         console.error("Error in story generation workflow:", error);
//         res.status(500).json({ error: error.message });
//     }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



//working with 3 images generated per story
// import logo from './logo.svg';
import './App.css';
import './normal.css';
import React, { useState, useEffect } from 'react';


function App() {
  //add state fir input and chat log
  const [input, setInput] = useState("");
  const [chatLog, setChatlog] = useState([{
    role:"gpt", 
      message: "Lets craft and create a children's story step by step! Share some key details to get started: 1. Setting: Describe the story's location and time.2. Characters: Introduce the main characters, their traits, and any special abilities.\n3.Plot: Outline the main events and challenges.\n4.Theme: What's the story's moral or message?\n5.Visual Elements: Highlight any scenes or elements for illustrations.\n\nAdd any extra details for your story. After planning, choose an art style for the illustrations. Consider styles or artists that inspire you for the artwork (e.g., watercolor, digital). 6. Generate the full cohesive story with title based on the discussion."
    },
]);

const [stories, setStories] = useState([]);

// useEffect(() => {
//     const fetchStories = async () => {
//         const response = await fetch('http://localhost:3080/stories');
//         if (response.ok) {
//             const data = await response.json();
//             setStories(data);
//         } else {
//             console.error('Failed to fetch stories');
//         }
//     };

//     fetchStories();
// }, []);

const [requestedPages, setRequestedPages] = useState(1); // Add this line
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
        <div className='chat-log'>
          {chatLog.map ((message, index)=>(<ChatMessage key={index} message ={message} />))}
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
  const isImage = message.message.startsWith('Image URL: ');
  const imageUrl = isImage ? message.message.replace('Image URL: ', '') : '';
  
  return (
    <div className={`chat-message ${message.role === "gpt" ? "chatgpt" : "chatuser"}`}>
      <div className='chat-message-center'>
        <div className={`avatar ${message.role === "gpt" ? "chatgpt" : "chatuser"}`}>
          {/* Avatar logic here, if any */}
        </div>
        <div className="message">
          {isImage ? <img src={imageUrl} alt="Generated" /> : message.message}
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