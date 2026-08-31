// ============================================
// AYUTH - Offline Knowledge Base
// Curated Q&A on IP & Regulatory Topics
// ============================================

const knowledgeBase = [
  {
    id: "novelty-test",
    category: "Patent Eligibility",
    question: "How is novelty assessed for an Ayurvedic formulation?",
    answer:
      "Under the Patents Act, 1970, novelty requires that the invention is not anticipated by any single prior publication, patent, or public use anywhere in the world. For Ayurvedic formulations, this means: (1) the specific combination of ingredients must be new, or (2) the process of preparation must be non-obvious and new, or (3) the technical effect must be unexpected. If your formulation uses only traditional ingredients in the same ratio as published in ancient texts (e.g., Charaka Samhita), it will fail novelty. However, if you modify the ratio, add a new ingredient, or employ a novel extraction/stabilization technique, novelty may be established. The TKDL (Traditional Knowledge Digital Library) is the primary resource for examining prior traditional knowledge.",
    citation: "Patents Act, 1970 — Section 2(l) (definition of novelty)",
    jurisdiction: ["india", "international"],
  },

  {
    id: "tkdl-overlap",
    category: "Traditional Knowledge",
    question: "What is TKDL and how does it affect my patent application?",
    answer:
      "The Traditional Knowledge Digital Library (TKDL) is maintained by the Council of Scientific & Industrial Research (CSIR) and contains documented traditional knowledge in Ayurveda, Siddha, Unani, and Yoga. During patent examination (particularly at the international level via WIPO), examiners may reference TKDL to assess whether your invention is truly novel. If your formulation or use is already documented in TKDL, the Indian Patent Office (IPO) will cite it as prior art and reject your patent claim. Strategy: Before filing, conduct a thorough TKDL search. If there is an overlap, you have three options: (1) demonstrate non-obviousness through unexpected technical results, (2) modify the formulation to make it clearly distinguishable, or (3) file for a Geographical Indication (GI) instead, which protects traditional knowledge and origin rather than novelty.",
    citation: "CSIR Traditional Knowledge Digital Library (TKDL); Patents Act, 1970 — Section 3(d)",
    jurisdiction: ["india", "international"],
  },

  {
    id: "biopiracy-risks",
    category: "Biological Resources",
    question: "What is biopiracy and how does it apply to Ayurvedic innovations?",
    answer:
      "Biopiracy is the unauthorized use of genetic resources or traditional knowledge for commercial benefit without benefit-sharing with indigenous or source communities. Under India's Biological Diversity Act, 1992, if your Ayurvedic innovation uses biological resources (e.g., medicinal plants) sourced from India, you must: (1) obtain prior intimation to the National Biodiversity Authority (NBA) before filing a patent, (2) share benefits equitably with local communities that provided the knowledge, and (3) provide evidence of legal origin of the biological resource. Violation can result in patent cancellation and penalties. Additionally, under the Nagoya Protocol (which India is signatory to), non-disclosure of biopiracy can lead to international legal consequences. If your invention uses Himalayan herbs or endemic species, biopiracy risk is high—seek prior NBA clearance before any IP filing.",
    citation: "Biological Diversity Act, 1992; Nagoya Protocol (CBD); Patents Act, 1970 — Section 3(j)",
    jurisdiction: ["india", "international"],
  },

  {
    id: "trademark-vs-patent",
    category: "Trademark Strategy",
    question: "When should I file a trademark instead of a patent for my Ayurvedic product?",
    answer:
      "Patents protect technical innovations and are time-limited (20 years from filing). Trademarks protect brand names, logos, and distinctive signs indefinitely (renewable every 10 years). For Ayurvedic products: (1) File a patent if you have a novel formulation, unique processing method, or new therapeutic indication backed by clinical data. (2) File a trademark if your product name, packaging design, or brand identity is distinctive and you intend to market under that brand long-term. (3) Consider both: protect the formulation as a trade secret or patent, and register the brand name as a trademark. Example: 'Chyawanprash' cannot be patented (it's traditional), but brands like 'Dabur Chyawanprash' can be trademarked. If your formulation fails novelty due to TKDL overlap, strong trademark and GI protection may still offer commercial advantage.",
    citation: "Trade Marks Act, 1999 — Sections 2(1)(zb), 3, 9; Patents Act, 1970",
    jurisdiction: ["india"],
  },

  {
    id: "geographical-indication",
    category: "Geographical Indications",
    question: "What is a Geographical Indication (GI) and is it useful for my Ayurvedic remedy?",
    answer:
      "A Geographical Indication (GI) is a sign used on products that have a specific geographical origin and qualities inherent to that origin. For Ayurvedic products, GI protection is powerful if your remedy is traditionally produced in a specific region (e.g., 'Darjeeling Ginseng from Darjeeling', 'Jaggery from Gur Belt'). GI registration: (1) Requires evidence of cultural/historical association with the region, (2) Protects the collective right (not an individual patent), (3) Is renewable indefinitely, and (4) Prevents others from using the GI even if the formulation is not novel. Unlike patents, GI allows multiple legitimate producers in that region to use the designation. If your invention is a traditional Ayurvedic remedy with strong geographical identity, GI is often more valuable than a patent. Example: 'Himachali Herbs' can be protected as a GI even if the formulation is not novel, as long as it has a genuine regional connection.",
    citation:
      "Trade Marks Act, 1999 — Part IX (Geographical Indications); GI Registry, India",
    jurisdiction: ["india"],
  },

  {
    id: "process-patent",
    category: "Patent Strategy",
    question: "Can I patent a process for preparing an Ayurvedic ingredient if the ingredient itself is traditional?",
    answer:
      "Yes. Under Patents Act, 1970, Section 2(j), a patent can be granted for a novel process even if the end-product itself is traditional. For Ayurveda: (1) If Ashwagandha root is traditional but your extraction/standardization process (e.g., 'ultra-sonication followed by chromatographic purification') is new and produces a consistent, measurable bioactive compound profile, you can patent the process. (2) The patent covers the method, not the plant itself. (3) You must demonstrate non-obviousness—the process must represent a technical advance over known methods. (4) Best practice: Include method claims (process steps) and product-by-process claims (the resulting extract with defined markers). This strategy allows protection of traditional ingredients through novel processing, avoiding direct TKDL conflict.",
    citation: "Patents Act, 1970 — Sections 2(j), 3(e); Manual of Patent Practice & Procedure, IPO",
    jurisdiction: ["india", "international"],
  },

  {
    id: "inventive-step",
    category: "Patent Eligibility",
    question: "What constitutes an 'inventive step' for Ayurvedic innovations?",
    answer:
      "An inventive step (also called non-obviousness) means the invention is not an obvious variation of existing knowledge to a person skilled in the art. For Ayurvedic innovations: (1) Merely adding a known ingredient to a known formulation is not inventive. (2) An unexpected beneficial effect (e.g., synergistic bioactivity, reduced side-effects) demonstrates inventive step. (3) Technical proof matters—in vitro studies, stability data, or bioavailability improvements are evidence. (4) Traditional use alone is not evidence of inventive step; you must show why your modification is non-obvious. Example: Turmeric (haldi) has been used for centuries, but if you invent a novel nano-curcumin formulation with 10x bioavailability and this result is scientifically unexpected, you have an inventive step. Conversely, merely grinding turmeric finer has no inventive step. For AYUSH products, clinical evidence of efficacy (not just traditional use) strengthens inventive step claims.",
    citation:
      "Patents Act, 1970 — Section 2(ja) (definition of inventive step); Monsanto vs. Nuziveedu Seeds (2018) — leading judgment",
    jurisdiction: ["india", "international"],
  },

  {
    id: "ayush-licensing",
    category: "Regulatory Compliance",
    question: "What licensing and regulatory approvals do I need to manufacture AYUSH products?",
    answer:
      "Ayurvedic, Siddha, Unani, and Homeopathy (AYUSH) medicines in India must comply with regulations under the Ministry of AYUSH. Key requirements: (1) Manufacturing License: Obtain a license from your state's Licensing Authority (e.g., Drug Controller General of India, DCGI, or state authorities) under Drugs and Cosmetics Act, 1940. (2) Product Registration: Register your formulation with AYUSH authorities if making therapeutic claims; ensure the formulation is mentioned in pharmacopeias (e.g., Indian Pharmacopoeia, Ayurvedic Pharmacopoeia). (3) Good Manufacturing Practice (GMP): Comply with AYUSH-GMP guidelines for facility, equipment, and documentation. (4) Clinical Trials: If making new claims (e.g., 'cures diabetes'), conduct clinical trials per AYUSH clinical trial guidelines and obtain DCGI approval. (5) Labeling & Advertising: Follow advertising rules—no claims beyond proven benefits. Export: If exporting, comply with destination country regulations (e.g., Europe requires Traditional Herbal Registration, USA requires FDA compliance). IP Strategy: Once regulatory approval is obtained, file patents for novel formulations/processes immediately to prevent competitors from copying.",
    citation:
      "Drugs and Cosmetics Act, 1940; Ministry of AYUSH Guidelines; Ayurvedic Pharmacopoeia of India",
    jurisdiction: ["india"],
  },

  {
    id: "trade-secret-vs-patent",
    category: "IP Strategy",
    question: "Should I keep my Ayurvedic formulation as a trade secret or file a patent?",
    answer:
      "Trade secret vs. patent is a critical strategic choice. Trade Secret: (1) No filing cost, no public disclosure, indefinite protection as long as secrecy is maintained. (2) Risk: if someone independently discovers or reverse-engineers it, you have no legal recourse. (3) Best for: processes known to your company (e.g., specific preparation method), recipes that are genuinely non-obvious (e.g., Coca-Cola formula). Patent: (1) Legal monopoly for 20 years, enforceable against anyone using the invention. (2) Cost: filing, prosecution, renewal fees (~Rs. 50,000–2,00,000 for a full patent). (3) Public disclosure: patent specification is published, competitors can design-around after expiry. For Ayurvedic formulations: (1) If novelty is strong and the formulation can be reverse-engineered (e.g., from the product itself), patent is better. (2) If novelty is weak but the process is proprietary (e.g., special fermentation conditions), trade secret may be safer. Hybrid approach: File a patent for the formulation; keep the process details as a trade secret. This gives dual protection.",
    citation:
      "Patents Act, 1970; Indian Contract Act, 1872 (trade secret principles); Supreme Court rulings on confidentiality",
    jurisdiction: ["india"],
  },

  {
    id: "international-filing",
    category: "International IP",
    question: "How do I file patents internationally for my Ayurvedic invention?",
    answer:
      "International patent filing is done via two main routes: (1) PCT Route (Patent Cooperation Treaty): File one international application with WIPO, designating multiple countries. Timeline: 12–18 months of international search/examination, then enter national phases in chosen countries (e.g., US, EU, Japan, China). Cost: ~$3,000–5,000 for initial PCT filing + ~$1,000–2,000 per country for national stage. Advantage: single filing, centralized examination. (2) Paris Convention Route: File directly in each country's patent office. Cheaper initially (~$500 per country) but requires managing each office separately. Filing Timeline: Priority date is earliest filing (India first, then international). Ensure you file international applications within 12 months of first filing to claim priority. Key consideration for AYUSH products: (1) US/EU offices are strict on novelty and inventive step—TKDL is less referenced, so traditional knowledge may not bar patenting (though ethical/regulatory issues may arise). (2) China and Japan prefer specific bioavailability data. (3) Australia has a geographic origin requirement for herbal products. Strategy: File in India first to establish priority; then decide international scope based on commercial targets (major markets: US, EU, China, Australia).",
    citation:
      "Patents Act, 1970; Patent Cooperation Treaty (PCT); WIPO guidelines; Paris Convention",
    jurisdiction: ["international"],
  },

  {
    id: "public-disclosure",
    category: "Patent Strategy",
    question: "What counts as 'public disclosure' and why does it matter for patentability?",
    answer:
      "Public disclosure destroys novelty. Under Patents Act, 1970, any disclosure before the patent application filing date can invalidate your patent. This includes: (1) Publications: research papers, websites, social media posts, trade show presentations. (2) Public use: selling the product, demonstrating it in public, even without explicit advertising. (3) Sale: offering for sale on e-commerce platforms or retail stores. (4) Confidential disclosures (arguably): if disclosed to non-confidential parties without an NDA, this may be considered public. Grace Period: India has a 12-month grace period—disclosures by you (the inventor) within 12 months before filing do not destroy novelty. But international filings (US, EU, many countries) do NOT have a grace period; any public disclosure anywhere before filing kills patentability there. Action items: (1) Before filing, ensure no public disclosures. (2) File an NDA before discussing with manufacturers, investors, or distributors. (3) If you've already presented or published, file your application within 12 months in India, but note this grace period doesn't apply internationally. (4) For Ayurvedic products, be especially careful—even discussions in traditional medicine forums or Ayurveda societies could be deemed public.",
    citation:
      "Patents Act, 1970 — Sections 11, 64; Patent (Amendment) Rules, 2015 (grace period); Supreme Court rulings on public disclosure",
    jurisdiction: ["india", "international"],
  },

  {
    id: "examination-process",
    category: "Patent Process",
    question: "What is the examination process at the Indian Patent Office, and how long does it take?",
    answer:
      "The patent examination process at the Indian Patent Office (IPO) has several stages: (1) Filing: Submit Form 1 with specification, drawings, and claims. Filing date is your priority date. (2) Publication: 18 months after priority date, your application is published. (3) Request for Examination (RFE): You must request examination (via Form 18) within 48 months. This is crucial—without RFE, your application is deemed abandoned. (4) First Examination Report (FER): Examiner issues a report citing prior art (patents, publications, TKDL, traditional use) and objections. (5) Response: You submit a counter-statement addressing each objection, amending claims or providing evidence (e.g., test data, affidavits on non-obviousness). (6) Hearing (optional): If not convinced by written response, the examiner may call you for hearing. (7) Final Decision: Grant or Final Rejection. Timeline in India: 3–7 years on average (can be faster with expedited processing). For Ayurvedic products, expect careful TKDL scrutiny and multiple back-and-forths. Tip: Work with a patent attorney; they can strategically amend claims to overcome TKDL objections.",
    citation:
      "Patents Act, 1970; Patent Rules, 2003 (Rules 24, 40, 48); IPO Manual of Patent Practice and Procedure",
    jurisdiction: ["india"],
  },

  {
    id: "trademark-registration",
    category: "Trademark Strategy",
    question: "How do I register a trademark for my Ayurvedic product brand?",
    answer:
      "Trademark registration in India is administered by the Intellectual Property Office (TMO) under the Trade Marks Act, 1999. Process: (1) Trademark Search: Conduct a search at the TMO database to ensure your mark is not already registered or similar to existing marks. (2) Application: File Form TM-A with the TMO, specifying the mark (word, logo, device), goods/services class (for AYUSH products, usually Class 5 for medicines, Class 42 for healthcare services), and specification of goods (e.g., 'Ayurvedic herbal preparations for immunity'). (3) Examination: TMO examines for absolute and relative grounds. Absolute grounds: is the mark distinctive (not generic)? Relative grounds: does it conflict with existing marks? (4) Publication: If no objections, the mark is published for opposition (3 months). (5) Registration: After opposition period (if no oppositions), the trademark is registered for 10 years, renewable indefinitely. Timeline: 18–24 months. Cost: ~Rs. 9,000–15,000 (filing + legal). Best practice for Ayurvedic brands: (1) Register both word mark (e.g., 'Ashwagandha Plus') and logo/device. (2) Use™ (unregistered) during examination; use® only after registration. (3) Do not make false claims on packaging—can lead to cancellation.",
    citation:
      "Trade Marks Act, 1999 — Sections 3, 9, 17, 18, 22; TMO Guidelines; IPO website",
    jurisdiction: ["india"],
  },

  {
    id: "enforcement-litigation",
    category: "IP Protection",
    question: "If someone copies my Ayurvedic formulation, what legal action can I take?",
    answer:
      "If your invention is patent-protected, you can file infringement litigation in the District Court (infringement suit under Patents Act, 1970, Section 104). Remedies: (1) Injunction (temporary/permanent): Court order to stop the infringer from making/selling the infringing product. (2) Damages: Monetary compensation for losses caused by infringement (typically 5–15% of infringing product's sales, but courts may award more if wilful infringement). (3) Costs: The losing party typically bears court and legal costs. If trademark is copied, file a suit under Trade Marks Act, 1999. If trade secret, invoke Indian Contract Act, 1872 and tort law for breach of confidence. Key points: (1) Burden of proof is on the patent holder—you must show the infringer's product falls within your patent claims. (2) The infringer can challenge the validity of your patent in court (counter-claim). (3) Timeline: 3–5 years for trial (can be lengthy). (4) Consider alternative dispute resolution (ADR) like mediation/arbitration—faster and cheaper. (5) Criminal action: If counterfeiting or fraud is proven, criminal prosecution is possible. Tip: Obtain patent insurance and maintain detailed records of prior art searches to strengthen your case if sued.",
    citation:
      "Patents Act, 1970 — Sections 104, 105, 107; Trade Marks Act, 1999 — Section 121; Indian Contract Act, 1872 — Section 27",
    jurisdiction: ["india"],
  },

  {
    id: "claims-drafting",
    category: "Patent Strategy",
    question: "How should I draft patent claims for an Ayurvedic formulation to maximize protection?",
    answer:
      "Patent claims define the legal scope of protection. For Ayurvedic formulations, draft claims strategically: (1) Independent Claims (broad scope): Claim the formulation itself, e.g., 'A composition comprising Ashwagandha extract (5–25% w/w), Ginger extract (10–30% w/w), and Honey stabilizer in a ratio of 2:1:0.5'. Include ranges to cover variations. (2) Dependent Claims (narrow scope): Claim specific embodiments, e.g., 'The composition of claim 1, wherein Ashwagandha is a root extract at 15% w/w', 'The composition of claim 1, when used for immunity enhancement'. (3) Process Claims: Claim the method of preparation, e.g., 'A method for preparing herbal immunity blend comprising: (i) extracting Ashwagandha root with cold ethanol, (ii) concentrating to 15% bioactives, (iii) stabilizing with honey'. (4) Use Claims: Claim specific uses, e.g., 'Use of the composition of claim 1 for treating respiratory inflammation'. Best practice: (1) Start with broadest claim (formulation itself); if rejected, fall back to narrower claims (process, use). (2) Avoid overly specific ratios if not necessary—TKDL may find similar traditional formulations. (3) Include unexpected technical effects in claim preamble to argue non-obviousness. (4) Use Markush claims for flexibility: 'A composition comprising a medicinal herb selected from the group consisting of [list 10+ herbs]'. This covers multiple embodiments. Work with a patent attorney—claim drafting is critical and can make the difference between grant and rejection.",
    citation:
      "Patents Act, 1970 — Sections 10, 12; Patent Rules, 2003 (Rules 13–25); IPO Guidelines on Claim Construction",
    jurisdiction: ["india", "international"],
  },

  {
    id: "benefit-sharing",
    category: "Biological Resources",
    question: "How do I comply with benefit-sharing obligations when using Indian biological resources?",
    answer:
      "Under India's Biological Diversity Act, 1992, if your Ayurvedic innovation uses biological resources (plants, microbes, etc.) sourced from India, you must comply with benefit-sharing rules: (1) Prior Intimation to National Biodiversity Authority (NBA): Before filing any IP application (patent, trademark, GI), notify the NBA. You must provide details of the biological resource, the research institution, and the foreign collaborators (if any). (2) Benefit-sharing Agreement: If commercializing the innovation, enter into a benefit-sharing agreement with: (a) The local community/Gram Panchayat where the resource was sourced (typically 1–5% of net profits go to community), (b) The state government (typically 1–5% goes to state Biodiversity Fund). (3) Penalties for non-compliance: Cancellation of IP rights (including patents), monetary penalties up to Rs. 1 crore, and criminal liability. (4) Documentation: Maintain all records of resource sourcing, community engagement, and benefit-sharing payments—audits are conducted. For Ayurvedic inventions, this is critical. Example: If you collect rare Himalayan herb from Himachal Pradesh, you must notify the NBA, identify the collector (usually local gatherer), and agree on benefit-sharing before filing any patent. Filing without NBA clearance risks patent invalidation post-grant. Action: Contact the NBA (biobase.nba.org.in) and engage a qualified consultant for compliance.",
    citation:
      "Biological Diversity Act, 1992 — Sections 4, 6, 21; Rules 2004; NBA Guidelines; Nagoya Protocol",
    jurisdiction: ["india"],
  },
];

// Render knowledge base
function renderKnowledgeBase(items = knowledgeBase) {
  const kbContent = document.getElementById("kbContent");
  kbContent.innerHTML = "";

  if (items.length === 0) {
    kbContent.innerHTML = '<div class="kb-empty-state"><p>No matching Q&A entries found. Try a different search term.</p></div>';
    return;
  }

  items.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "kb-item";
    itemDiv.innerHTML = `
      <div class="kb-item-header" onclick="toggleKBItem(this)">
        <div>
          <div class="kb-item-category">${item.category}</div>
          <h3 class="kb-item-question">${item.question}</h3>
        </div>
        <div class="kb-item-toggle">▼</div>
      </div>
      <div class="kb-item-answer" style="display: none;">
        <p>${item.answer}</p>
        <div class="kb-item-citation"><strong>Citation:</strong> ${item.citation}</div>
      </div>
    `;
    kbContent.appendChild(itemDiv);
  });
}

// Toggle KB item expansion
function toggleKBItem(header) {
  const item = header.closest(".kb-item");
  const answerDiv = item.querySelector(".kb-item-answer");

  if (answerDiv.style.display === "none") {
    answerDiv.style.display = "block";
    item.classList.add("expanded");
  } else {
    answerDiv.style.display = "none";
    item.classList.remove("expanded");
  }
}

// Filter KB by search term
function filterKnowledgeBase() {
  const searchTerm = document.getElementById("kbSearch").value.toLowerCase();
  const filteredItems = knowledgeBase.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.answer.toLowerCase().includes(searchTerm)
  );

  renderKnowledgeBase(filteredItems);
}

// Note: KB is rendered on-demand when the KB tab is clicked in app.js switchTab()
