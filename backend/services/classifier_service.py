"""
Statutory rule evaluation for Ayurvedic IP
"""

def evaluate_invention_profile(profile: dict) -> dict:
    flags = []
    recommendations = []
    
    bio_tk = str(profile.get("bioResources", "")).lower()
    disclosure = str(profile.get("disclosure", "")).lower()
    description = str(profile.get("description", "")).lower()
    problem = str(profile.get("problem", "")).lower()
    novelty = str(profile.get("novelty", "")).lower()

    # Rule 1: Section 3(p) & Traditional Knowledge
    if "traditional" in bio_tk or "vedic" in bio_tk or "ayurved" in description or "ayurved" in novelty:
        flags.append({
            "code": "SECTION_3P_TK",
            "title": "Section 3(p) - Traditional Knowledge Bar",
            "severity": "HIGH",
            "message": "Inventions based on traditional knowledge face strict non-patentability objections under Section 3(p). You must establish novel non-obvious technical modifications or distinct synergistic mechanisms beyond classical texts."
        })
        recommendations.append("Conduct a TKDL prior art search before filing to verify classical formulation references.")

    # Rule 2: NBA Form III Clearance (Biological Diversity Act 2002)
    if "biological" in bio_tk or "plant" in bio_tk or "herb" in bio_tk or "extract" in bio_tk:
        flags.append({
            "code": "NBA_SECTION_6",
            "title": "Biological Diversity Act (Section 6 Form III)",
            "severity": "HIGH",
            "message": "Inventions utilizing Indian biological resources mandate prior approval from the National Biodiversity Authority (NBA) under Form III before patent grant."
        })
        recommendations.append("File NBA Form III with the National Biodiversity Authority (NBA Chennai) to prevent Section 64 revocation.")

    # Rule 3: Prior Public Disclosure
    if "yes_public" in disclosure or "public" in disclosure:
        flags.append({
            "code": "NOVELTY_PUBLIC_DISCLOSURE",
            "title": "Novelty Destruction via Prior Disclosure",
            "severity": "CRITICAL",
            "message": "Public disclosure prior to filing priority application in India destroys universal novelty."
        })
        recommendations.append("File priority application immediately or rely on trade secret / trademark protections.")

    # Rule 4: Section 3(e) Synergism
    if "combination" in description or "ratio" in novelty or "admixture" in description:
        flags.append({
            "code": "SECTION_3E_ADMIXTURE",
            "title": "Section 3(e) - Synergism Requirement",
            "severity": "MEDIUM",
            "message": "Polyherbal combinations must demonstrate statistically validated synergistic efficacy (Combination Index < 0.8) to overcome Section 3(e) mere admixture rejection."
        })
        recommendations.append("Prepare comparative pharmacological synergy data showing enhanced bio-efficacy over sum of individual components.")

    return {
        "status": "evaluated",
        "flags": flags,
        "recommendations": recommendations,
        "totalHurdles": len(flags),
    }
