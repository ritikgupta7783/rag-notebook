import os

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

llm = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ["OPENROUTER_API_KEY"],
)

CHAT_MODEL = os.environ["OPENROUTER_CHAT_MODEL"]
