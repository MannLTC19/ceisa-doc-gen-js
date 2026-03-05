// Put your ACTUAL API key right here inside the quotes
const API_KEY = "AIzaSyC_vs3YNJSSjNQKZmKFKkmX7viXVRnm94w"; 

async function listMyModels() {
    console.log("Fetching available models for your API key...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        
        // If Google sends an error, print it exactly as it is!
        if (!response.ok || data.error) {
            console.log("\n❌ GOOGLE API ERROR:");
            console.log(data.error.message || data);
            return;
        }
        
        console.log("\n✅ YOU CAN USE THESE MODELS:");
        data.models.forEach(model => {
            if (model.supportedGenerationMethods.includes("generateContent")) {
                 console.log(`- ${model.name.replace('models/', '')}`);
            }
        });
    } catch (error) {
        console.error("❌ Failed to fetch models:", error);
    }
}

listMyModels();