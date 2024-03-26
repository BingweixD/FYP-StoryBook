require('dotenv').config();
const express = require('express');
const OpenAI = require("openai");
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

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
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview", // Updated to GPT-4
            messages: [
                {"role": "system", "content": "You are an AI trained to summarize stories. Please summarize the following story."},
                {"role": "user", "content": storyText},
            ],
        });

        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
            return chatCompletion.choices[0].message.content.trim();
        } else {
            console.error("No summary in response:", chatCompletion);
            return '';
        }
    } catch (error) {
        console.error("An error occurred while summarizing the story:", error);
        return '';
    }
};


const generateImage = async (summary) => {
    try {
        const response = await axios.post('http://localhost:3080', {
                prompt: summary,
                n: 1,
                size: "512x512",
            },
            {
                headers: {
                    'Authorization': `Bearer ${openai}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Assuming the API returns an array of images and taking the first one
        if (response.status === 200 && response.data && response.data.length > 0) {
            // Assuming 'url' is the correct field; adjust based on the actual API response
            const imageUrl = response.data[0].url;
            return imageUrl; // Return the image URL
        } else {
            console.log("The response did not contain any images.");
            return ''; // Handle case where response is successful but no images are returned
        }
    } catch (error) {
        console.error("An error occurred:", error);
        return ''; // Return a default/fallback value or handle the error accordingly
    }
};



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



// Assuming all necessary imports and initialization as before

// A simple in-memory structure to hold conversation. For production, consider a more persistent solution.
let conversations = {};

// app.post('/', async (req, res) => {
//     const { userId, message } = req.body;

//     // Initialize conversation if not exists
//     if (!conversations[userId]) {
//         conversations[userId] = [];
//     }

//     try {
//         // Push the new user message into the conversation array
//         conversations[userId].push({ role: "user", content: message });

//         // Generate a response from OpenAI
//         const chatResponse = await openai.chat.completions.create({
//             model: "gpt-4-turbo-preview",
//             messages: conversations[userId],
//         });

//         let replyText = "";
//         let imageUrl = "";

//         if (chatResponse && chatResponse.data && chatResponse.data.choices && chatResponse.data.choices.length > 0) {
//             replyText = chatResponse.data.choices[0].message.content.trim();
//             // Save bot's reply into the conversation
//             conversations[userId].push({ role: "assistant", content: replyText });

//             // Concatenate all conversation texts to check the length
//             const conversationText = conversations[userId].map(m => m.content).join(" ");

//             // If conversation length exceeds a certain limit, summarize
//             if (conversationText.split(' ').length > 400) {
//                 const summary = await summarizeStory(conversationText);
//                 imageUrl = await generateImage(summary); // Generate an image based on the summary
//             } else {
//                 // Optionally, generate an image directly from the latest bot's response or skip
//                 // imageUrl = await generateImage(replyText);
//             }

//             console.log('Generated Image URL:', imageUrl);
//             res.json({ reply: replyText, imageUrl });
//         } else {
//             console.error("No reply from AI:", chatResponse);
//             res.status(500).json({ error: "Failed to generate a reply." });
//         }
//     } catch (error) {
//         console.error("Error handling chat request:", error);
//         res.status(500).json({ error: error.message });
//     }
// });
// app.post('/', async (req, res) => {
//     try {
//         const { userMessage, chatLog } = req.body;
//         console.log('Received user message:', userMessage);
//         console.log('Received chat log:', chatLog);

//         // Process the user's message to generate a response
//         const response = await callApi(userMessage, chatLog);
//         if (!response || response.startsWith('Invalid')) {
//             console.error("Failed to generate response:", response);
//             return res.status(400).json({ error: response });
//         }

//         // Summarize the generated response
//         const summary = await summarizeStory(response);
//         if (!summary) {
//             console.error("Failed to summarize the story.");
//             return res.status(500).json({ error: 'Failed to summarize the story.' });
//         }

//         // Generate an image based on the summary
//         const imageUrl = await generateImage(summary);
//         if (!imageUrl) {
//             console.error("Failed to generate an image.");
//             return res.status(500).json({ error: 'Failed to generate an image.' });
//         }

//         // Return the original response, summary, and image URL to the client
//         res.json({ message: response, summary, imageUrl });
//     } catch (error) {
//         console.error("Error handling request:", error);
//         res.status(500).json({ error: error.message });
//     }
// });
app.post('/', async (req, res) => {
    try {
        const { userMessage, chatLog } = req.body;
        console.log('Received user message:', userMessage, chatLog);

        // Step 1: Call the API to get the story or conversation
        const response = await callApi(userMessage, chatLog);
        if (!response || response.startsWith('Invalid')) {
            console.error("Failed to generate story:", response);
            return res.status(400).json({ error: 'Failed to generate story.' });
        }

        // // Step 2: Summarize the story/conversation
        // const summary = await summarizeStory(response);
        // if (!summary || summary.startsWith('Invalid')) {
        //     console.error("Failed to summarize the story:", summary);
        //     return res.status(400).json({ error: 'Failed to summarize the story.' });
        // }

        // Step 3: generate an image based on the summary
        const imageUrl = await generateImage(response);
        if (!imageUrl) {
            console.error("Failed to generate an image.");
            return res.status(400).json({ error: 'Failed to generate an image.' });
        }

        // Include the image URL if you're using image generation
        res.json({ message: response, imageUrl: imageUrl });
    } catch (error) {
        console.error("Error handling request:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
