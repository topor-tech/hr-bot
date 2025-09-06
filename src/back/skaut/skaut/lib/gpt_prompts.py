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
