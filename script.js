// Get references to DOM elements
const topicSelect = document.getElementById("topicSelect");
const responseDiv = document.getElementById("response");

// Function to convert citation links to clickable HTML links
function convertCitationLinks(text) {
  // Regular expression to match citation pattern: ([domain.com](url))
  const citationPattern = /\(\[([^\]]+)\]\(([^)]+)\)\)/g;

  // Replace citation patterns with clickable HTML links
  return text.replace(citationPattern, '<a href="$2" target="_blank">$1</a>');
}

// Add change event listener to the select
topicSelect.addEventListener("change", async () => {
  try {
    // Show loading state
    responseDiv.textContent = "Loading...";

    // Get the selected topic
    const topic = topicSelect.value;

    // Prepare the prompt
    const prompt = `Give me a recent story about ${topic}.`;

    // Make API request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-search-preview",
        web_search_options: {
          search_context_size: "medium",
        },

        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes recent stories about the provided topic from this week. Keep your answers brief, clear, and engaging for a general audience. Display only US-based stories, do not include any other information",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    // Parse the response
    const data = await response.json();

    // Format and update the UI with the response
    let text = data.choices[0].message.content;

    // Convert citation links to clickable links
    text = convertCitationLinks(text);

    const formattedText = text
      .split("\n\n") // Split into paragraphs
      .filter((para) => para.trim() !== "") // Remove empty paragraphs
      .map((para) => `<p>${para}</p>`) // Wrap in p tags
      .join("");

    responseDiv.innerHTML = formattedText;
  } catch (error) {
    // Handle any errors
    responseDiv.textContent =
      "Sorry, there was an error getting the update. Please try again.";
    console.error("Error:", error);
  }
});
