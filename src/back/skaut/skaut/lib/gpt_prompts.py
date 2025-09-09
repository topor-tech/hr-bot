"""
GPT prompts for HR bot functionality.

This module contains all the prompts used for various AI operations
in the HR bot system.
"""

from typing import Dict, Any


class GPTPrompts:
    """Collection of GPT prompts for HR bot operations."""
    
    # CV Processing Prompts
    CV_TEXT_EXTRACTION = (
        "You are a CV text extraction specialist. "
        "Extract all readable text content from the attached CV file "
        "(likely Russian). Preserve structure and headings. "
        "Return only the extracted text."
    )
    
    CV_STRUCTURED_EXTRACTION = (
        "You are an expert CV parser. Extract the following information from the CV "
        "and return it in a structured JSON format:\n"
        "- personal_info: name, email, phone, location\n"
        "- experience: list of work experiences with company, position, duration, description\n"
        "- education: list of educational background with institution, degree, year\n"
        "- skills: list of technical and soft skills\n"
        "- languages: list of languages with proficiency levels\n"
        "- certifications: list of professional certifications\n"
        "- summary: professional summary or objective\n\n"
        "Return only valid JSON without any additional text."
    )
    
    # Job Matching Prompts
    JOB_MATCHING = (
        "You are an expert recruiter. Compare the candidate's CV with the job requirements "
        "and provide a detailed matching analysis:\n"
        "- Match percentage (0-100%)\n"
        "- Required skills match\n"
        "- Experience level match\n"
        "- Education requirements match\n"
        "- Missing qualifications\n"
        "- Overqualified areas\n"
        "- Interview recommendations\n"
        "- Overall recommendation (Strong Match/Good Match/Weak Match/No Match)\n\n"
        "Be thorough and provide specific examples from the CV."
    )
    
    # Interview Preparation Prompts
    INTERVIEW_QUESTIONS_GENERATION = (
        "Based on the candidate's CV and job requirements, generate relevant interview questions:\n"
        "- 5 technical questions specific to their experience\n"
        "- 3 behavioral questions\n"
        "- 2 situational questions\n"
        "- 2 questions about their career goals\n"
        "- 1 question about their motivation for this role\n\n"
        "Make questions specific to their background and the position."
    )
    
    # Contact Information Extraction
    CONTACT_EXTRACTION = (
        "Extract contact information from the CV text. Return a JSON object with the following structure:\n"
        "{\n"
        '  "email": "email@example.com" or null,\n'
        '  "phone": "+1234567890" or null,\n'
        '  "telegram": "@username" or null\n'
        "}\n\n"
        "Rules:\n"
        "- For email: find any email address in the text\n"
        "- For phone: find any phone number (with or without country code)\n"
        "- For telegram: find telegram username (usually starts with @)\n"
        "- Return null if not found\n"
        "- Return only valid JSON without any additional text"
    )
    
    # Skills and Tags Extraction
    SKILLS_EXTRACTION = (
        "Analyze the CV text and extract relevant skills and tags. Return a JSON object with the following structure:\n"
        "{\n"
        '  "skills": ["skill1", "skill2", "skill3"]\n'
        "}\n\n"
        "Rules:\n"
        "- Extract technical skills, programming languages, frameworks, tools\n"
        "- Extract soft skills like communication, leadership, teamwork\n"
        "- Extract domain-specific skills (e.g., finance, marketing, design)\n"
        "- Include certifications and methodologies\n"
        "- Return 10-20 most relevant skills\n"
        "- Use English names for skills\n"
        "- Return only valid JSON without any additional text"
    )
    
    # Job Extraction
    JOB_EXTRACTION = (
        "Extract job tags and requirements from the vacancy text. Return a JSON object with the following structure:\n"
        "{\n"
        '  "skills": ["skill1", "skill2", "skill3"]\n'
        "}\n\n"
        "Rules:\n"
        "- Extract technical skills, programming languages, frameworks, tools\n"
        "- Extract soft skills like communication, leadership, teamwork\n"
        "- Extract domain-specific skills (e.g., finance, marketing, design)\n"
        "- Include certifications and methodologies\n"
        "- Return 10-20 most relevant skills\n"
        "- Use English names for skills\n"
        "- Return only valid JSON without any additional text"
    )
    
    # Interview Script Generation
    INTERVIEW_SCRIPT_GENERATION = (
        "You are an expert HR interviewer creating a comprehensive interview script for an LLM voice interview agent. "
        "Based on the job vacancy information provided, create a structured interview script that will guide the AI interviewer "
        "through a professional and thorough interview process.\n\n"
        "CRITICAL: You must return ONLY valid JSON. No additional text, explanations, or formatting outside the JSON structure.\n\n"
        "Return a JSON object with the following structure:\n"
        "{\n"
        '  "interview_metadata": {\n'
        '    "position_title": "string",\n'
        '    "estimated_duration": "string",\n'
        '    "interview_type": "string",\n'
        '    "difficulty_level": "string"\n'
        '  },\n'
        '  "opening": {\n'
        '    "greeting": "string",\n'
        '    "introduction": "string",\n'
        '    "agenda_overview": "string",\n'
        '    "next_steps": "string"\n'
        '  },\n'
        '  "sections": [\n'
        '    {\n'
        '      "section_name": "string",\n'
        '      "section_type": "string",\n'
        '      "duration_minutes": 0,\n'
        '      "instructions": "string",\n'
        '      "questions": [\n'
        '        {\n'
        '          "question_id": "string",\n'
        '          "question_text": "string",\n'
        '          "question_type": "string",\n'
        '          "expected_skills": ["string"],\n'
        '          "follow_up_questions": ["string"],\n'
        '          "evaluation_criteria": "string",\n'
        '          "time_limit": 0\n'
        '        }\n'
        '      ]\n'
        '    }\n'
        '  ],\n'
        '  "evaluation_rubric": {\n'
        '    "technical_skills": {\n'
        '      "weight": 0.0,\n'
        '      "criteria": ["string"]\n'
        '    },\n'
        '    "soft_skills": {\n'
        '      "weight": 0.0,\n'
        '      "criteria": ["string"]\n'
        '    },\n'
        '    "cultural_fit": {\n'
        '      "weight": 0.0,\n'
        '      "criteria": ["string"]\n'
        '    }\n'
        '  },\n'
        '  "closing": {\n'
        '    "candidate_questions": "string",\n'
        '    "next_steps": "string",\n'
        '    "thank_you": "string"\n'
        '  }\n'
        "}\n\n"
        "JSON FORMATTING RULES:\n"
        "- Escape all quotes in strings using backslash: \\\"\n"
        "- Use double quotes for all strings and keys\n"
        "- Use numbers (not strings) for numeric values\n"
        "- Ensure all strings are properly closed\n"
        "- No trailing commas\n"
        "- No comments or explanations outside the JSON\n"
        "- Start with { and end with }\n\n"
        "Content Guidelines:\n"
        "- Create 4-6 sections covering different aspects of the role\n"
        "- Include 3-5 questions per section\n"
        "- Make questions specific to the job requirements and skills\n"
        "- Include both technical and behavioral questions\n"
        "- Provide clear evaluation criteria for each question\n"
        "- Ensure the script flows naturally for a voice interview\n"
        "- Consider the seniority level and adjust complexity accordingly\n"
        "- Include follow-up questions to probe deeper when needed\n"
        "- Keep all text concise and professional\n"
        "- Avoid special characters that might break JSON parsing\n\n"
        "IMPORTANT: Return ONLY the JSON object. Do not include any text before or after the JSON."
    )


def get_cv_extraction_prompt() -> str:
    """Get the CV text extraction prompt."""
    return GPTPrompts.CV_TEXT_EXTRACTION


def get_job_matching_prompt() -> str:
    """Get the job matching prompt."""
    return GPTPrompts.JOB_MATCHING


def get_contact_extraction_prompt() -> str:
    """Get the contact information extraction prompt."""
    return GPTPrompts.CONTACT_EXTRACTION


def get_skills_extraction_prompt() -> str:
    """Get the skills extraction prompt."""
    return GPTPrompts.SKILLS_EXTRACTION

def get_job_extraction_prompt() -> str:
    """Get the job extraction prompt."""
    return GPTPrompts.JOB_EXTRACTION


def get_interview_script_generation_prompt() -> str:
    """Get the interview script generation prompt."""
    return GPTPrompts.INTERVIEW_SCRIPT_GENERATION