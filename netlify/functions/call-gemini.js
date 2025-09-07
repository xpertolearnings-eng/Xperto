// netlify/functions/call-gemini.js
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('API key is not set in Netlify environment variables.');
        }
        
        // Using a v1beta model that supports JSON mode
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                response_mime_type: "application/json",
            },
        };

        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error('Gemini API Error:', errorBody);
            return {
                statusCode: geminiResponse.status,
                body: JSON.stringify({ error: `Gemini API failed: ${errorBody}` }),
            };
        }

        const result = await geminiResponse.json();
        
        // **Modification**: Extract the clean JSON text from Gemini's nested response
        const cleanJsonText = result.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            // Return the clean JSON directly
            body: cleanJsonText, 
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
