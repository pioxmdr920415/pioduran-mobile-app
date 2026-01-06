from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import openai
import os
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: str

# Emergency-specific system prompt
EMERGENCY_SYSTEM_PROMPT = """
You are an AI Emergency Assistant for a disaster response application. Your primary role is to provide immediate, helpful guidance during emergencies while directing users to call appropriate emergency services.

Key guidelines:
1. Always prioritize user safety and direct to professional emergency services
2. Provide clear, concise information without causing panic
3. For medical emergencies: Direct to call 118 (ambulance)
4. For police/fire emergencies: Direct to call 117
5. For natural disasters: Provide general safety advice and direct to official sources
6. Be empathetic and supportive
7. If unsure about specific medical advice, always recommend professional help
8. Keep responses focused on emergency assistance and preparedness

Emergency numbers (Philippines context):
- Ambulance/Medical: 118
- Police/Fire: 117
- General Emergency: 117

Remember: You are not a replacement for professional emergency services. Always encourage calling the appropriate emergency number.
"""

def get_openai_client():
    """Get OpenAI client with API key from environment."""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key or api_key == 'your-openai-api-key-here':
        raise HTTPException(
            status_code=503,
            detail="AI chat service is not configured. Please set OPENAI_API_KEY in environment variables."
        )
    return openai.OpenAI(api_key=api_key)

@router.post("/ai-chat", response_model=ChatResponse)
async def ai_chat(chat_request: ChatMessage):
    """
    Process AI chat messages for emergency assistance.
    """
    try:
        client = get_openai_client()

        # Create conversation context
        messages = [
            {"role": "system", "content": EMERGENCY_SYSTEM_PROMPT},
            {"role": "user", "content": chat_request.message}
        ]

        # Generate conversation ID if not provided
        conversation_id = chat_request.conversation_id or f"conv_{datetime.now(timezone.utc).timestamp()}"

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using GPT-3.5-turbo for cost efficiency
            messages=messages,
            max_tokens=500,
            temperature=0.7,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )

        ai_response = response.choices[0].message.content.strip()

        logger.info(f"AI Chat response generated for conversation {conversation_id}")

        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    except openai.APIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=502, detail="AI service temporarily unavailable")
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def include_ai_chat_routes(app):
    """Include AI chat routes in the main app."""
    app.include_router(router, prefix="/api", tags=["ai-chat"])