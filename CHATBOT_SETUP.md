# Health Assistant Chatbot Setup

This guide explains how to set up the MedAlpaca-7B health assistant chatbot in your MediCare application.

## Required Environment Variables

Add the following variables to your `.env.local` file:

```env
# Hugging Face API Key (Required)
HUGGINGFACE_API_KEY="your_huggingface_api_key_here"

# Optional: Custom MedAlpaca API URL
# If you want to use a different endpoint, uncomment and set this:
# MEDALPACA_API_URL="https://your-custom-endpoint.com/models/medalpaca/medalpaca-7b"
```

## Getting Your Hugging Face API Key

1. Go to [Hugging Face](https://huggingface.co/)
2. Create an account or sign in
3. Go to your profile settings
4. Navigate to "Access Tokens"
5. Create a new token with "read" permissions
6. Copy the token and add it to your `.env.local` file

## Features

- **Health-focused AI**: Uses MedAlpaca-7B model specifically trained for medical conversations
- **Safety disclaimers**: Built-in medical disclaimers and safety warnings
- **Conversation history**: Maintains context throughout the conversation
- **Quick questions**: Pre-defined health-related questions for easy start
- **Responsive design**: Works on both desktop and mobile devices
- **Authentication required**: Only authenticated users can access the chatbot

## Usage

1. Users must be signed in to access the chatbot
2. Click the "Health Assistant" button in the header
3. Ask health-related questions
4. The AI will provide helpful information with appropriate medical disclaimers

## Important Notes

- The chatbot is NOT a substitute for professional medical advice
- Always recommend consulting healthcare providers for serious symptoms
- The AI cannot diagnose medical conditions
- For emergencies, users should call emergency services

## Model Information

- **Model**: MedAlpaca-7B
- **Provider**: Hugging Face
- **Specialization**: Medical conversations and health information
- **Safety**: Includes medical disclaimers and safety warnings

## Troubleshooting

If you encounter issues:

1. Verify your Hugging Face API key is correct
2. Check that you have sufficient API credits/quota
3. Ensure the model endpoint is accessible
4. Check the browser console for any error messages

## Security Considerations

- API keys should never be exposed in client-side code
- All requests are made server-side for security
- User authentication is required before accessing the chatbot
- Conversation data is not permanently stored (can be implemented later if needed) 