// ==========================================================
// AYUTH - Canonical Knowledge Source for RAG Vector Index
// Curated dataset covering Indian Patent Law, TKDL, NBA, GI
// ==========================================================

export const knowledgeBase = [
  {
    id: "novelty-test",
    category: "Patent Eligibility",
    question: "How is novelty assessed for an Ayurvedic formulation?",
    answer:
      "Under the Patents Act, 1970, novelty requires that the invention is not anticipated by any single prior publication, patent, or public use anywhere in the world. For Ayurvedic formulations, this means: (1) the specific combination of ingredients must be new, or (2) the process of preparation must be non-obvious and new, or (3) the technical effect must be unexpected. If your formulation uses only traditional ingredients in the same ratio as published in ancient texts (e.g., Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya), it will fail novelty under Section 2(1)(j) and Section 3(p). However, if you modify the ratio, introduce a novel synergist, or employ an advanced extraction/stabilization technique, novelty may be established. The Traditional Knowledge Digital Library (TKDL) is the primary reference examined by patent offices worldwide.",
    citation: "Patents Act, 1970 — Section 2(1)(j), Section 2(1)(l), Section 3(p)",
    jurisdiction: ["india", "international"],
  },
  {
    id: "tkdl-overlap",
    category: "Traditional Knowledge",
    question: "What is TKDL and how does it affect my patent application?",
    answer:
      "The Traditional Knowledge Digital Library (TKDL) is maintained by CSIR and the Ministry of AYUSH, containing documented traditional formulations across Ayurveda, Siddha, Unani, and Yoga in patent-examiner-readable formats (IPC classified). Patent examiners in India (IPO), USPTO, EPO, and WIPO cross-check applications against TKDL. If an overlap is identified, the IPO issues Section 3(p) objections. Strategies to overcome objections: (1) Demonstrate non-obvious synergy and unexpected technical efficacy via empirical data, (2) Claim a novel, non-obvious standardized extract or delivery mechanism rather than the crude herb combination, (3) Protect distinctive branding via Trademark or register under Geographical Indication (GI) if regionally tied.",
    citation: "CSIR-TKDL Guidelines; Patents Act, 1970 — Section 3(p), Section 3(d)",
    jurisdiction: ["india", "international"],
  },
  {
    id: "section-3p-analysis",
    category: "Section 3(p) Exclusions",
    question: "What is Section 3(p) of the Indian Patents Act and how does it apply to Ayurvedic herbs?",
    answer:
      "Section 3(p) explicitly states that an invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known components is NOT patentable. To overcome Section 3(p): (1) The formulation cannot simply be a known herb used for its traditionally recorded indication (e.g., Curcuma longa for inflammation). (2) The applicant must prove a new, unexpected technical problem-solution, such as a novel drug-delivery carrier (e.g., phytosome, liposome, solid lipid nanoparticle) that produces bio-enhancement far beyond traditional preparations.",
    citation: "Indian Patents Act, 1970 — Section 3(p); Manual of Patent Practice and Procedure (MPPP)",
    jurisdiction: ["india"],
  },
  {
    id: "section-3e-admixture",
    category: "Section 3(e) Synergism",
    question: "How do I overcome a Section 3(e) objection for an Ayurvedic herbal combination?",
    answer:
      "Section 3(e) prohibits patenting of 'a substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance.' For polyherbal or herb-mineral formulations: You MUST demonstrate true technical SYNERGISM. Providing comparative experimental data showing that Combination (A + B) produces a statistically significant higher therapeutic or pharmacokinetic effect than the sum of individual effects (A alone + B alone) is mandatory. Without comparative bioactivity data, polyherbal formulations will be rejected under Section 3(e).",
    citation: "Indian Patents Act, 1970 — Section 3(e); High Court of Delhi Patent Jurisprudence",
    jurisdiction: ["india"],
  },
  {
    id: "section-3d-efficacy",
    category: "Section 3(d) Enhanced Efficacy",
    question: "What is the requirement of Section 3(d) for modified Ayurvedic active compounds?",
    answer:
      "Section 3(d) bars patenting the mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance. For modified Ayurvedic extracts, isolated fractions, or chemical derivatives: The applicant must demonstrate significant enhancement in therapeutic efficacy compared to the known active molecule. In vitro binding affinity alone is often insufficient; in vivo pharmacokinetic or therapeutic enhancement data is typically required to satisfy Section 3(d) under Indian law.",
    citation: "Indian Patents Act, 1970 — Section 3(d); Novartis AG v. Union of India (2013) Supreme Court",
    jurisdiction: ["india"],
  },
  {
    id: "biopiracy-risks",
    category: "Biological Resources",
    question: "What is biopiracy and what are the NBA approval requirements for Indian biological resources?",
    answer:
      "Under India's Biological Diversity Act, 2002, using biological resources (plants, microbes, animals) or associated knowledge sourced from India for research, commercial utilization, or patent application triggers statutory approvals: (1) Form III Application to the National Biodiversity Authority (NBA) is MANDATORY prior to grant of patent under Section 6 of the Biological Diversity Act. (2) Benefit sharing agreements must be established. (3) Foreign entities or Indian entities with foreign equity must obtain Form I permission prior to accessing the biological resource. Failure to comply can void patent applications and incur criminal liability.",
    citation: "Biological Diversity Act, 2002 — Section 3, Section 6; Nagoya Protocol on ABS",
    jurisdiction: ["india", "international"],
  },
  {
    id: "trademark-vs-patent",
    category: "Trademark Strategy",
    question: "When should I file a trademark instead of a patent for my Ayurvedic product?",
    answer:
      "Patents protect novel technical inventions for a maximum term of 20 years. Trademarks protect brand names, distinctive wordmarks, logos, and packaging trade dress indefinitely (renewable every 10 years). For Ayurvedic products: (1) If a formulation is derived from classic texts and fails Section 3(p) novelty, strong Trademark registration in Class 5 (Pharmaceuticals/Ayurvedic preparations) and Class 3 (Herbal cosmetics) is the primary commercial moat. (2) Protect the specific brand name (e.g., Dabur Chyawanprash, Zandu Kesari Jivan) rather than generic traditional terms. (3) Hybrid approach: Combine Trade Secret protection for specialized manufacturing know-how with aggressive Trademark enforcement.",
    citation: "Trade Marks Act, 1999 — Sections 2(1)(zb), 9, 11, Class 5 & Class 3 Nice Classification",
    jurisdiction: ["india", "international"],
  },
  {
    id: "geographical-indication",
    category: "Geographical Indications",
    question: "What is a Geographical Indication (GI) and is it useful for regional Ayurvedic remedies?",
    answer:
      "A Geographical Indication (GI) identifies goods as originating in a specific geographical territory where a given quality, reputation, or other characteristic is essentially attributable to its geographical origin. For Ayurvedic and herbal products (e.g., Navara Rice, Malabar Pepper, Darjeeling tea, Kangra tea, Erode Turmeric): (1) GI provides collective community protection that prevents unfair exploitation. (2) GI does not confer individual monopoly but protects all authorized regional producers. (3) GI is valid for 10 years and renewable indefinitely, making it ideal for regional heritage remedies where individual patents are unviable due to traditional prior art.",
    citation: "Geographical Indications of Goods (Registration and Protection) Act, 1999",
    jurisdiction: ["india", "international"],
  },
  {
    id: "process-patent",
    category: "Patent Strategy",
    question: "Can I patent a process for preparing an Ayurvedic ingredient if the ingredient itself is traditional?",
    answer:
      "Yes. Under Section 2(1)(j) of the Patents Act, 1970, an inventive and industrially applicable process is patentable even if the end-product is known. For Ayurveda: (1) If the herb (e.g., Withania somnifera / Ashwagandha) is traditional, but you develop a novel green-extraction process, selective chromatographic fractionation, or ultrasonic-assisted enzymatic extraction yielding standardized withanolides without toxic solvents, the method steps can be patented. (2) File method claims (step-by-step reaction conditions) and product-by-process claims where the process imparts novel structural/purity characteristics.",
    citation: "Patents Act, 1970 — Sections 2(1)(j), 3(e), 5; IPO Guidelines for Examination of Patent Applications in the Field of Pharmaceuticals",
    jurisdiction: ["india", "international"],
  },
  {
    id: "inventive-step",
    category: "Patent Eligibility",
    question: "What constitutes an 'inventive step' for Ayurvedic innovations?",
    answer:
      "An inventive step (Section 2(1)(ja)) means a feature of an invention that involves technical advance as compared to existing knowledge or having economic significance or both and that makes the invention not obvious to a person skilled in the art. In Ayurvedic patent prosecution: (1) Mere optimization of grinding or standardized cooking (Paka) described in classical Shastras is considered obvious. (2) Proving non-obviousness requires measurable technical parameters: bioavailability enhancement, stability shelf-life extension from 6 months to 3 years without synthetic preservatives, or targeting a cellular receptor pathway previously unrecognized in Ayurvedic literature.",
    citation: "Patents Act, 1970 — Section 2(1)(ja); Bishwanath Prasad Radhey Shyam v. Hindustan Metal Industries (1979) SC",
    jurisdiction: ["india", "international"],
  },
  {
    id: "ayush-licensing",
    category: "Regulatory Compliance",
    question: "What licensing and regulatory approvals do I need to manufacture and commercialize AYUSH products in India?",
    answer:
      "Manufacturing Ayurvedic medicines requires adherence to the Drugs and Cosmetics Act, 1940 and Drugs and Cosmetics Rules, 1945: (1) License Application: Apply to State Licensing Authority (SLA) via Form 24-D (Ayurvedic/Siddha manufacturing license). (2) Good Manufacturing Practices (GMP): Mandatory compliance with Schedule T of Drugs and Cosmetics Rules (hygiene, equipment validation, batch records). (3) Classical vs. Proprietary: Classical formulations must strictly follow listed classical texts in the First Schedule. Proprietary/Patent Ayurvedic Medicines (under Section 3(a)) require safety and efficacy proof/literature or clinical studies. (4) AYUSH Premium / Standard Mark certification by Quality Council of India (QCI) enables export recognition.",
    citation: "Drugs and Cosmetics Act, 1940 — Section 33-EEC, Section 33-N; Schedule T (GMP for ASU Drugs)",
    jurisdiction: ["india"],
  },
  {
    id: "trade-secret-vs-patent",
    category: "IP Strategy",
    question: "Should I keep my Ayurvedic formulation as a trade secret or file a patent?",
    answer:
      "Trade secrets protect confidential commercial formulas without registration or expiration, governed under common law of breach of confidence and Indian Contract Act, 1872 (Section 27). Patent vs. Trade Secret decision matrix for Ayurveda: (1) If the formulation can be reverse-engineered via LC-MS / HPLC metabolomics profiling, a patent or trademark protection is preferable. (2) If the innovation lies in an un-reverse-engineerable process (e.g., exact microbial strain for fermenting Asava/Arishta or precise temperature profile), a trade secret offers perpetual protection without disclosing details to TKDL. (3) Maintain strict NDAs, compartmentalized access, and digital cryptographic timestamp lockers (like AYUTH IP Locker) for prior possession documentation.",
    citation: "Indian Contract Act, 1872 — Section 27; Commercial Secrets & Common Law Breach of Confidence",
    jurisdiction: ["india", "international"],
  },
  {
    id: "international-pct-filing",
    category: "International IP",
    question: "How do I protect my Ayurvedic invention internationally using the PCT system?",
    answer:
      "To protect an Ayurvedic invention globally: (1) File an initial Indian patent application (priority application). If filing foreign application directly, obtain written permission under Section 39 of Indian Patents Act. (2) Within 12 months, file a PCT (Patent Cooperation Treaty) International Application through WIPO or IPO as receiving office. (3) National Phase Entry: Enter target countries (e.g., US, Europe, Japan) within 30/31 months from priority date. (4) Foreign examiners will examine TKDL databases; ensure the specification includes explicit comparative synergy data and clear non-obvious novelty arguments adhering to regional standards (e.g., 35 U.S.C. 102/103 in USA, EPC Article 52/56 in Europe).",
    citation: "WIPO PCT Articles 1-11; Patents Act, 1970 — Section 39 (Foreign Filing Permission), Section 135",
    jurisdiction: ["international"],
  },
  {
    id: "provisional-vs-complete",
    category: "Patent Strategy",
    question: "When should I file a Provisional vs. Complete Patent Specification for an Ayurvedic invention?",
    answer:
      "Filing a Provisional Specification (Form 2) establishes an early Priority Date while research is ongoing: (1) File a provisional as soon as the core concept and preliminary formulation are conceived, before any public disclosure or trade expo. (2) You have a strict 12-month statutory deadline to complete stability studies, clinical synergy assays, and file the Complete Specification. (3) If the complete specification is not filed within 12 months, the application is deemed abandoned. (4) Ensure the provisional contains sufficient enabling disclosure; newly added inventive matter in the complete specification may not enjoy the earlier priority date.",
    citation: "Patents Act, 1970 — Section 9, Section 10; Patent Rules, 2003 — Rule 13",
    jurisdiction: ["india", "international"],
  },
];
