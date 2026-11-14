import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_company_with_gemini(lead) -> dict:
    prompt = f"""
    Analyze the following sales lead and return structured B2B sales intelligence:
    - Company Name: {lead.company_name}
    - Industry: {lead.industry}
    - Website: {lead.website}
    - Location: {lead.location}
    - Description: {lead.description}
    - Technology Stack: {lead.technology}

    Return ONLY valid JSON with these exact keys:
{{
    "company_overview": "Brief summary of the company and market position",
    "business_needs": "Key pain points or operational challenges",
    "opportunities": "Specific sales and product opportunities",
    "industry_analysis": "Current industry trends, competitive landscape, and growth outlook",
    "qualification_score": 85,
    "recommended_action": "Concrete next step for the sales team"
}}
    """

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        ),
    )

    return json.loads(response.text)
    