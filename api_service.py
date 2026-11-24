import json
import os
from typing import Any, Dict, Optional
from google import genai
from google.genai import types
from pydantic import BaseModel, Field


class OutreachPlanGeneration(BaseModel):
    recipient: Optional[str] = None
    subject: str
    email_body: str
    tone: str = "professional"
    channel: str = "Email"
    follow_up_timing: str = "In 3 days"
    strategy: str
    next_action: str
    company_growth: int = Field(default=12, ge=0, le=20)
    industry_match: int = Field(default=12, ge=0, le=20)
    technology_alignment: int = Field(default=12, ge=0, le=20)
    business_needs: int = Field(default=12, ge=0, le=20)
    engagement_level: int = Field(default=10, ge=0, le=20)
    priority: str = "Medium"
    conversion_probability: Optional[float] = Field(default=55.0, ge=0.0, le=100.0)


def _fallback_outreach_data(
    lead_data: Dict[str, Any],
    service_offered: str,
    tone: str,
    additional_context: Optional[str],
) -> Dict[str, Any]:
    company = lead_data.get("company_name") or "your team"
    contact_name = lead_data.get("contact_person")
    recipient = lead_data.get("email") or contact_name
    industry = lead_data.get("industry") or "your industry"

    scores = {
        "company_growth": 14,
        "industry_match": 14,
        "technology_alignment": 13,
        "business_needs": 14,
        "engagement_level": 11,
    }
    total_score = sum(scores.values())
    priority = "High" if total_score >= 75 else ("Medium" if total_score >= 50 else "Low")
    conversion_probability = round(float(min(95.0, max(10.0, total_score * 0.85))), 1)

    extra_note = f" {additional_context}" if additional_context else ""

    return {
        "recipient": recipient,
        "subject": f"Exploring {service_offered} for {company}",
        "email_body": (
            f"Hi {contact_name or 'there'},\n\n"
            f"I came across {company} in the {industry} space and wanted to share how "
            f"{service_offered} can support your team's upcoming priorities.{extra_note}\n\n"
            f"Would you be open to a quick 15-minute conversation this week?\n\n"
            f"Best regards,\nSales Team"
        ),
        "tone": tone,
        "channel": "Email + LinkedIn",
        "follow_up_timing": "3 business days",
        "strategy": (
            f"Position {service_offered} around {company}'s {industry} operations and "
            f"follow up in 3 business days if there is no initial reply."
        ),
        "next_action": "Send personalized email and schedule a discovery call.",
        **scores,
        "total_score": total_score,
        "priority": priority,
        "conversion_probability": conversion_probability,
    }


def generate_outreach_plan(
    lead_data: Dict[str, Any],
    analysis_data: Optional[Dict[str, Any]] = None,
    service_offered: str = "AI & Cloud Solutions",
    tone: str = "professional",
    additional_context: Optional[str] = None,
) -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _fallback_outreach_data(lead_data, service_offered, tone, additional_context)

    model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    prompt = (
        "You are a B2B sales strategist. Generate an outreach plan and lead score "
        "matching the requested schema.\n"
        "Each of the 5 score fields (company_growth, industry_match, "
        "technology_alignment, business_needs, engagement_level) must be an integer from 0 to 20.\n"
        f"Service offered: {service_offered}\n"
        f"Tone: {tone}\n"
        f"Additional context: {additional_context or 'None'}\n"
        f"Lead details: {json.dumps(lead_data, default=str)}\n"
        f"Company analysis: {json.dumps(analysis_data or {}, default=str)}"
    )

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=OutreachPlanGeneration,
            ),
        )
        parsed = OutreachPlanGeneration.model_validate_json(response.text)
        result = parsed.model_dump()
        result["tone"] = result.get("tone") or tone
        result["total_score"] = (
            result["company_growth"]
            + result["industry_match"]
            + result["technology_alignment"]
            + result["business_needs"]
            + result["engagement_level"]
        )
        return result
    except Exception as exc:
        print(f"Gemini generation failed ({exc}); falling back to deterministic plan.")
        return _fallback_outreach_data(lead_data, service_offered, tone, additional_context)

    client = genai.Client(api_key=api_key)
    prompt = (
        "You are a B2B sales strategist. Generate an outreach plan and lead score "
        "matching the requested schema.\n"
        "Each of the 5 score fields (company_growth, industry_match, "
        "technology_alignment, business_needs, engagement_level) must be an integer from 0 to 20.\n"
        f"Service offered: {service_offered}\n"
        f"Tone: {tone}\n"
        f"Additional context: {additional_context or 'None'}\n"
        f"Lead details: {json.dumps(lead_data, default=str)}\n"
        f"Company analysis: {json.dumps(analysis_data or {}, default=str)}"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=OutreachPlanGeneration,
        ),
    )

    parsed = OutreachPlanGeneration.model_validate_json(response.text)
    result = parsed.model_dump()
    result["tone"] = result.get("tone") or tone
    result["total_score"] = (
        result["company_growth"]
        + result["industry_match"]
        + result["technology_alignment"]
        + result["business_needs"]
        + result["engagement_level"]
    )
    return result