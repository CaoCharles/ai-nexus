export const summarizeArticle = async (text: string): Promise<string> => {
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

    if (!webhookUrl) {
        console.error("VITE_N8N_WEBHOOK_URL is missing in environment variables.");
        return "Error: AI Service not configured (Missing Webhook URL).";
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: text,
                // We can add more context here if needed, like article title or ID
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Assuming n8n returns { "summary": "..." } or just the text in a known field.
        // Adjust 'summary' based on your actual n8n 'Respond to Webhook' node configuration.
        // If n8n returns the text directly in the body (not JSON), use response.text().
        return data.summary || data.text || data.output || "No summary returned from AI.";

    } catch (error) {
        console.error("Error calling AI webhook:", error);
        return "Failed to generate summary. Please try again later.";
    }
};
