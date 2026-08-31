/**
 * Rule-based & Statutory Legal Classifier for Ayurvedic Innovations
 * Evaluates Indian Patents Act (3p, 3e, 3d) & Biological Diversity Act 2002 (NBA)
 */
export function classifyAyurvedicInvention(profile = {}) {
  const {
    q1_components = '',
    q2_process = '',
    q3_evidence = '',
    q4_source = '',
    q5_intent = '',
  } = profile;

  const text = `${q1_components} ${q2_process} ${q3_evidence} ${q4_source} ${q5_intent}`.toLowerCase();

  const analysis = {
    section3pRisk: 'LOW',
    section3eRisk: 'LOW',
    section3dRisk: 'LOW',
    nbaApprovalRequired: false,
    commercialStrategy: [],
    recommendedActions: [],
    statutoryCitations: [],
  };

  // Section 3(p) Traditional Knowledge Assessment
  const traditionalKeywords = [
    'charaka', 'sushruta', 'ashtanga', 'bhavaprakasha', 'classical', 'traditional',
    'ayurvedic text', 'ancient', 'shastra', 'rasashastra', 'taila', 'arishta', 'asava', 'kwatha', 'churna'
  ];
  const isTraditionalSource = q4_source === 'classical' || traditionalKeywords.some((k) => text.includes(k));

  if (isTraditionalSource) {
    if (!text.includes('novel') && !text.includes('modified') && !text.includes('extract') && !text.includes('nanoparticle')) {
      analysis.section3pRisk = 'HIGH';
      analysis.recommendedActions.push(
        'High Section 3(p) rejection risk: The formulation closely resembles traditional prior art in TKDL. Consider patenting a novel extraction method or proprietary delivery system rather than the crude herbal mixture.'
      );
    } else {
      analysis.section3pRisk = 'MEDIUM';
      analysis.recommendedActions.push(
        'Moderate Section 3(p) risk: Novel modifications exist over traditional texts. Ensure comparative characterization against classical preparation methods is detailed in the specification.'
      );
    }
    analysis.statutoryCitations.push('Patents Act, 1970 — Section 3(p)');
  }

  // Section 3(e) Admixture / Synergy Assessment
  const isPolyherbal = q1_components.includes(',') || text.includes('combination') || text.includes('polyherbal') || text.includes('blend');
  const hasSynergyProof = text.includes('synerg') || text.includes('combination index') || text.includes('isobologram') || text.includes('statistically significant');

  if (isPolyherbal) {
    if (!hasSynergyProof) {
      analysis.section3eRisk = 'HIGH';
      analysis.recommendedActions.push(
        'Section 3(e) Admixture objection likely: You must provide experimental comparative synergy assays showing Combination (A+B) exceeds the sum of individual bioactivities (A alone + B alone).'
      );
    } else {
      analysis.section3eRisk = 'LOW';
      analysis.recommendedActions.push(
        'Synergy data indicated: Quantify synergistic ratio with Combination Index (CI < 1) in your complete patent specification to overcome Section 3(e).'
      );
    }
    analysis.statutoryCitations.push('Patents Act, 1970 — Section 3(e)');
  }

  // Biological Diversity Act (NBA) Assessment
  const usesIndianBioResource = q4_source === 'cultivated' || q4_source === 'wild' || q4_source === 'classical' || text.includes('plant') || text.includes('herb') || text.includes('species') || text.includes('india');

  if (usesIndianBioResource) {
    analysis.nbaApprovalRequired = true;
    analysis.recommendedActions.push(
      'MANDATORY NBA CLEARANCE: Sourcing biological resources from India triggers Section 6 of the Biological Diversity Act, 2002. File Form III with the National Biodiversity Authority (NBA) prior to patent grant.'
    );
    analysis.statutoryCitations.push('Biological Diversity Act, 2002 — Section 3 & Section 6; Form III');
  }

  // Commercial Strategy Formulation
  if (analysis.section3pRisk === 'HIGH' && !hasSynergyProof) {
    analysis.commercialStrategy.push('Trademark Registration (Class 5 & Class 3) for brand name protection');
    analysis.commercialStrategy.push('Trade Secret protection for proprietary processing parameters and temperature controls');
    if (text.includes('region') || text.includes('geographic') || text.includes('origin')) {
      analysis.commercialStrategy.push('Geographical Indication (GI) registration for regional heritage reputation');
    }
  } else {
    analysis.commercialStrategy.push('File Indian Provisional Patent Application (Form 1 & Form 2) to secure Priority Date');
    analysis.commercialStrategy.push('File Form III with National Biodiversity Authority (NBA)');
    analysis.commercialStrategy.push('Complete in vivo synergy & pharmacokinetic studies within 12 months before filing Complete Specification');
    analysis.commercialStrategy.push('PCT International Filing within 12 months for global market expansion');
  }

  return {
    profileSubmitted: profile,
    analysis,
    timestamp: new Date().toISOString(),
  };
}
