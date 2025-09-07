// Use the official Google AI package
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY is not set in environment variables.' }) };
        }
        
        // Initialize the Generative AI client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        const generationConfig = {
            responseMimeType: "application/json",
        };

        const result = await model.generateContent(prompt, generationConfig);
        const response = result.response;
        const jsonText = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: jsonText,
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
