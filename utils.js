const API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";
const HF_API_TOKEN = "";

const llmSummary = async (prompts, responses, feedback) => {
  const prompt = "中美关系为什么这么差？Answer in English, within 50 words.";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 100 },
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const summary = data[0].generated_text;
    console.log(summary);
    return summary;
  } catch (error) {
    console.error("Error querying Hugging Face API:", error.message);
  }
};

module.exports = {
  llmSummary,
}