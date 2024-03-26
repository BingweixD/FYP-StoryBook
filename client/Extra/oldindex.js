
// const { Configuration, OpenAIApi } = require("openai");
// const configuration = new Configuration({
//     organization: "org-rJK0lhu1nDdDGilWDk2eCXUA",
//     apiKey: "",
// });

// const openai = new OpenAIApi(configuration);

// async function callApi(){
//     const response = await openai.createCompletion({
//     // const response = await openai.listEngines();
//     // curl https://api.openai.com/v1/completions \
//     //   -H "Content-Type: application/json" \
//     //   -H "Authorization: Bearer $OPENAI_API_KEY" \
//     //   -d '{
//         model: "text-davinci-003",
//         prompt: "Say this is a test",
//         max_tokens: 7,
//         temperature: 0
//     });
//         console.log(response,data.choice[0].text)
// }

// callApi()
//2nd code
// const express = require('express');
// const OpenAI = require("openai");
// const bodyParser = require ('body-parser')
// const cors = require ('cors')


// const openai = new OpenAI({
//   apiKey: ""
// });

// const app = express();
// app.use(bodyParser.json())
// app.use(cors())
// const PORT = 3080;

// const callApi = async (userMessage) => {
//     try {
//         const systemMessage = { role: 'system', content: 'You are a helpful assistant.' };
//         const assistantMessage = { role: 'assistant', content: 'How can I help you today?' };
//         const user = { role: 'user', content: userMessage };
//         const chatCompletion = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [systemMessage, assistantMessage, user],
//             max_tokens: 100
//         });
//         console.log("OpenAI API Response:", chatCompletion); // Log the entire response
//         if (
//             chatCompletion.data &&
//             chatCompletion.data.choices &&
//             chatCompletion.data.choices.length > 0 &&
//             chatCompletion.data.choices[0].message &&
//             chatCompletion.data.choices[0].message[0] &&
//             chatCompletion.data.choices[0].message[0].content
//         ) {
//             const content = chatCompletion.data.choices[0].message[0].content;
//             console.log('Content:', content);
//             return content;
//         } else {
//             console.error("Invalid response format from OpenAI API:", chatCompletion);
//             return 'An error occurred while fetching data.';
//         }
//     } catch (error) {
//         console.error("An error occurred while fetching data:", error);
//         return 'An error occurred while fetching data.';
//     }
// };

// app.post('/', async (req, res) => {
//     try {
//         const { userMessage } = req.body;
//         console.log('Received user message:', userMessage);
//         const response = await callApi(userMessage);
//         console.log('Final response to client:', response);
//         res.json({ message: response });
//     } catch (error) {
//         console.error("Error handling form submission:", error);
//         res.status(500).json({ error: error.message });
//     }
// });


// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


// LOOOLL
require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); 

// Initialize OpenAI with your API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

const DALLE_API_KEY = process.env.DALLE_API_KEY; // Make sure to set this in your .env file
const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = 3080;

function validateInputForState(state, input) {
    if (!input.trim()) {
        throw new Error('Your input was empty, please provide more details.');
    }
    // Additional validation logic can be added here for each state if necessary
    if (state === STATES.COLLECTING_PLOT && input.toLowerCase() === 'not sure') {
        throw new Error('It seems you are unsure about the plot. Could you try giving even a broad idea of what might happen?');
    }
    // ... More validations for other states as needed
}
const STATES = {
    INITIAL: 'initial',
    COLLECTING_THEME: 'collectingTheme',
    COLLECTING_CHARACTERS: 'collectingCharacters',
    COLLECTING_SETTING: 'collectingSetting',
    COLLECTING_AGE_GROUP: 'collectingAgeGroup',
    COLLECTING_PLOT: 'collectingPlot',
    GENERATING_STORY: 'generatingStory',
    COMPLETED: 'completed'
};

class StoryGenerationManager {
    constructor() {
        this.reset();
    }

    reset() {
        this.state = STATES.INITIAL;
        this.storyDetails = {
            theme: '',
            characters: '',
            setting: '',
            ageGroup: '',
            plot: ''
        };
    }

    updateState(userMessage) {
        console.log(`Updating state from ${this.state} with user message: ${userMessage}`);
        switch (this.state) {
            case STATES.INITIAL:
                this.state = STATES.COLLECTING_THEME;
                return "What theme would you like for your story? (e.g., adventure, friendship)";

            case STATES.COLLECTING_THEME:
                this.storyDetails.theme = userMessage;
                this.state = STATES.COLLECTING_CHARACTERS;
                return "Who are the main characters in your story?";

            case STATES.COLLECTING_CHARACTERS:
                this.storyDetails.characters = userMessage;
                this.state = STATES.COLLECTING_SETTING;
                return "Where is your story set?";

            case STATES.COLLECTING_SETTING:
                this.storyDetails.setting = userMessage;
                this.state = STATES.COLLECTING_AGE_GROUP;
                return "What age group is your story for?";

            case STATES.COLLECTING_AGE_GROUP:
                this.storyDetails.ageGroup = userMessage;
                this.state = STATES.COLLECTING_PLOT;
                return "What are some key events that happen in your story?";

            case STATES.COLLECTING_PLOT:
                this.storyDetails.plot = userMessage;
                this.state = STATES.GENERATING_STORY;
                console.log(`Updated state to ${this.state}, Plot: ${this.storyDetails.plot}`);
                return "Thank you. Now, let me craft your story...";

            case STATES.GENERATING_STORY:
                // The story should be generated in the callApi function, so we don't handle it here
                return "Generating your story...";

            case STATES.COMPLETED:
                this.reset();
                return "Would you like to create another story? If so, just type 'yes'.";

            default:
                console.log(`Invalid state: ${this.state}. Asking user to provide more details or start over.`);
                return "I'm not sure what to do next. Can you provide more details or start over?";
        }
    }
}


// Initialize StoryGenerationManager
const storyManager = new StoryGenerationManager();

// const callApi = async (userMessage, chatLog) => {
//     try {
//         console.log("callApi called with userMessage:", userMessage);
//         console.log("Current chatLog:", JSON.stringify(chatLog, null, 2));

//         // Prepare messages for the API call
//         const formattedMessages = chatLog.map(msg => {
//             const role = msg.role === 'user' ? 'user' : 'assistant'; // Default to 'assistant' if not 'user'
//             const content = msg.message || msg.content || 'No response'; // Provide a fallback if undefined
//             return { role, content };
//         });

//         const prompt = formattedMessages.map(m => `${m.role}: ${m.content}`).join("\n");

//         console.log("Constructed prompt:", prompt);

//         if (storyManager.state === STATES.INITIAL || storyManager.state === STATES.COMPLETED) {
//             console.log("Handling normal chat or completed story state");
//             formattedMessages.push({ role: 'user', content: userMessage });

//             const completion = await openai.completions.create({
//                 model: "ft:gpt-3.5-turbo-1106:personal::8hke3Plj",
//                 prompt: prompt,
//                 max_tokens: 1000,
//             });

//             console.log("OpenAI response for normal chat:", completion.choices[0].text);
//             return completion.choices[0].text.trim();
//         } else {
//             console.log("Handling story creation process, current state:", storyManager.state);
//             const promptResponse = storyManager.updateState(userMessage);

//             console.log("Prompt response:", promptResponse);

//             if (storyManager.state !== STATES.GENERATING_STORY) {
//                 return promptResponse;
//             }

//             const storyPrompt = `Create a story with the following details:\nTheme: ${storyManager.storyDetails.theme}\nCharacters: ${storyManager.storyDetails.characters}\nSetting: ${storyManager.storyDetails.setting}\nAge Group: ${storyManager.storyDetails.ageGroup}\nPlot: ${storyManager.storyDetails.plot}`;

//             console.log("Constructed story prompt:", storyPrompt);

//             const storyCompletion = await openai.completions.create({
//                 model: "ft:gpt-3.5-turbo-1106:personal::8hke3Plj",
//                 prompt: storyPrompt,
//                 max_tokens: 1000
//             });

//             console.log("Generated story:", storyCompletion.choices[0].text);
//             storyManager.state = STATES.COMPLETED;
//             return storyCompletion.choices[0].text.trim();
//         }
//     } catch (error) {
//         console.error("Error in callApi function:", error);
//         throw new Error('An error occurred while processing your request.');
//     }
// };

const callApi = async (userMessage, chatLog) => {
    try {
        console.log("callApi called with userMessage:", userMessage);

        // Append the new user message to the chat log
        chatLog.push({ role: 'user', content: userMessage });

        // Construct a prompt from the chat log
        const prompt = chatLog.map(msg => `${msg.role}: ${msg.content}`).join("\n");

        console.log("Constructed prompt:", prompt);

        // Call OpenAI's completion API with the prompt
        const completion = await openai.completions.create({
            model: "ft:gpt-3.5-turbo-1106:personal::8hke3Plj",
            prompt: prompt,
            max_tokens: 150,  // Adjust max_tokens as needed
            stop: ["\n"]      // Use stop tokens as necessary
        });

        // Extract the response text
        const responseText = completion.choices[0].text.trim();
        console.log("OpenAI response:", responseText);

        // Append the response to the chat log
        chatLog.push({ role: 'assistant', content: responseText });

        return responseText;
    } catch (error) {
        console.error("Error in callApi function:", error);
        throw new Error('An error occurred while processing your request.');
    }
};


// const isStoryGenerationRequest = (message) => {
//     const keywords = ['generate a story', 'tell me a story', 'create a story', 'story about'];
//     const wordCount = message.split(/\s+/).length; // Split the message by whitespace and count the words

//     // Check if the message contains any of the keywords and has more than 400 words
//     return wordCount > 400 || keywords.some(keyword => message.toLowerCase().includes(keyword));
// };
  // Existing endpoint to handle normal chat and story generation
 app.post('/create-story', async (req, res) => {
    try {
        // Reset the story manager and set the initial state
        storyManager.reset();
        storyManager.state = STATES.COLLECTING_THEME;

        // Get the first prompt for the story creation
        const prompt = storyManager.updateState('');
        res.json({ message: prompt });
    } catch (error) {
        console.error("Error in /create-story:", error);
        res.status(500).json({
            error: 'An unexpected error occurred while starting a new story. Please try again later.'
        });
    }
});
const generateSummary = (text) => {
    // Implement your logic to create a summary here
    // This is a placeholder implementation
    const sentences = text.split('. ');
    if (sentences.length <= 2) {
        return text; // Return original text if it's short
    }
    return sentences[0] + '. ... ' + sentences[sentences.length - 1] + '.';
};
const generateImageWithDalle = async (summary) => {
    try {
        const response = await axios.post('https://api.example.com/v1/images/generate', {
            // The body content should match the API's expected schema.
            prompt: summary,
            // Add other parameters as required by the DALL-E API
        }, {
            headers: {
                'Authorization': `Bearer ${DALLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Adjust the following line to match the actual response structure.
        const imageUrl = response.data.result.image_url; // For example

        if (imageUrl) {
            return imageUrl;
        } else {
            throw new Error('No image URL received from DALL-E.');
        }
    } catch (error) {
        console.error('Error generating image with DALL-E:', error);
        throw new Error('Failed to generate image with DALL-E.');
    }
};

// Existing endpoint to handle normal chat and continuation of the story creation
app.post('/', async (req, res) => {
    try {
        const { userMessage, chatLog } = req.body;
        const response = await callApi(userMessage, chatLog);

        // Check if the story generation process has just been completed
        if (storyManager.state === STATES.COMPLETED) {
            // Generate a summary of the story
            const summary = generateSummary(response);

            // Generate an image based on the summary
            const imageUrl = await generateImageWithDalle(summary);

            // Reset the story manager for future story generations
            storyManager.reset();

            // Send the story, summary, and image URL to the client
            res.json({ message: response, summary, imageUrl });
        } else {
            // If not in completed state, just send the response
            res.json({ message: response });
        }
    } catch (error) {
        console.error("Error in POST /:", error);
        res.status(500).json({ error: error.message });
    }
});
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  