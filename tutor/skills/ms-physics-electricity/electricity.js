// eClaw MS Physics Electricity & Circuits Tutor.
// Middle School Physical Science (Electricity & Magnetism) aligned.

const { dataDir, loadProfile: _lp, saveProfile: _sp, listProfiles, calcMastery, masteryLabel, shuffle, pick, runCLI, srGrade, srUpdate, srEffectiveMastery, srDueToday, MASTERY_THRESHOLD, saveSessionState, loadSessionState, fsrsUpdateStability, fsrsUpdateDifficulty, fsrsNextReview, today } = require('../_lib/core');
const { buildDiffContext } = require('../_lib/differentiation');
const { DomainSkillBase, buildCommonCLIHandlers, generateExercise: _generateExercise, checkAnswer: _checkAnswer } = require('../_lib/exercise-factory');

const DATA_DIR = dataDir('ms-physics-electricity');
const loadProfile = id => _lp(DATA_DIR, id);
const saveProfile = p => _sp(DATA_DIR, p);

const SKILLS = {
  'electric-charge': ['static-electricity', 'charge-transfer', 'conductors-insulators', 'electric-fields'],
  'circuits': ['circuit-components', 'series-circuits', 'parallel-circuits', 'circuit-diagrams'],
  'ohms-law': ['voltage-current-resistance', 'ohms-law-calculations', 'resistors-in-series', 'resistors-in-parallel'],
  'electrical-power': ['power-equation', 'energy-consumption', 'electrical-safety', 'household-circuits'],
  'magnetism': ['magnetic-fields', 'electromagnets', 'motors-generators', 'electromagnetic-induction'],
};

// Prerequisites: topic -> [topics that must be mastered first].
const TOPIC_PREREQUISITES = {
  // electric-charge (foundational)
  'static-electricity': [],
  'charge-transfer': ['static-electricity'],
  'conductors-insulators': ['charge-transfer'],
  'electric-fields': ['charge-transfer'],
  // circuits
  'circuit-components': ['conductors-insulators'],
  'series-circuits': ['circuit-components'],
  'parallel-circuits': ['series-circuits'],
  'circuit-diagrams': ['series-circuits', 'parallel-circuits'],
  // ohms-law
  'voltage-current-resistance': ['circuit-components'],
  'ohms-law-calculations': ['voltage-current-resistance'],
  'resistors-in-series': ['ohms-law-calculations', 'series-circuits'],
  'resistors-in-parallel': ['ohms-law-calculations', 'parallel-circuits'],
  // electrical-power
  'power-equation': ['ohms-law-calculations'],
  'energy-consumption': ['power-equation'],
  'electrical-safety': ['energy-consumption'],
  'household-circuits': ['parallel-circuits', 'electrical-safety'],
  // magnetism
  'magnetic-fields': ['electric-fields'],
  'electromagnets': ['magnetic-fields', 'circuit-components'],
  'motors-generators': ['electromagnets'],
  'electromagnetic-induction': ['motors-generators'],
};

// Helper: is a topic unlocked (all prereqs mastered)?
function _electricityTopicUnlocked(topic, profileSkills) {
  return (TOPIC_PREREQUISITES[topic] || []).every(r => (profileSkills[r]?.mastery || 0) >= MASTERY_THRESHOLD);
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BANKS — 6-8 questions per skill, MS Physical Science aligned
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_BANKS = {
  // ── electric-charge ────────────────────────────────────────────────────────
  'static-electricity': { questions: [
    { q: 'What is static electricity?', a: ['buildup of electric charge', 'accumulation of charge on a surface'], type: 'multi', difficulty: 1, rule: 'Static electricity is the buildup of electric charge on the surface of an object.' },
    { q: 'When you rub a balloon on your hair, your hair sticks up. What causes this?', a: ['static electricity', 'transfer of electrons', 'charge buildup'], type: 'multi', difficulty: 1, hint: 'Rubbing transfers electrons from one surface to another.' },
    { q: 'True or false: Like charges attract each other.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Like charges repel. Opposite charges attract.' },
    { q: 'What are the two types of electric charge?', a: ['positive and negative', 'positive, negative'], type: 'multi', difficulty: 1, rule: 'There are two types: positive (+) and negative (-).' },
    { q: 'What particle carries a negative charge?', a: 'electron', type: 'short', difficulty: 2, hint: 'This subatomic particle orbits the nucleus.' },
    { q: 'Why does a charged balloon stick to a wall?', a: ['induces opposite charge', 'attracts opposite charges in wall', 'polarization'], type: 'multi', difficulty: 2, concept: 'A charged object can induce a charge on a neutral surface, creating attraction.' },
    { q: 'True or false: Lightning is an example of static discharge.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Lightning occurs when charge builds up in clouds and then rapidly discharges.' },
    { q: 'What happens when you touch a metal doorknob after walking across carpet and feel a shock?', a: ['static discharge', 'electrons transfer', 'charge flows to doorknob'], type: 'multi', difficulty: 3, concept: 'Electrons accumulated on your body jump to the grounded metal, causing a spark.' },
  ]},
  'charge-transfer': { questions: [
    { q: 'Name the three methods of charge transfer.', a: ['friction conduction induction', 'friction, conduction, induction', 'conduction, induction, friction'], type: 'multi', difficulty: 1, rule: 'Charge can be transferred by friction, conduction (direct contact), and induction (without contact).' },
    { q: 'What method of charge transfer occurs when you rub a balloon on your sweater?', a: 'friction', type: 'short', difficulty: 1, hint: 'Rubbing two surfaces together transfers electrons.' },
    { q: 'True or false: In conduction, charge transfers through direct contact.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Conduction requires objects to touch so charges can flow between them.' },
    { q: 'When you charge an object by induction, do the objects need to touch?', a: 'no', type: 'short', difficulty: 2, rule: 'Induction transfers charge without direct contact by rearranging charges at a distance.' },
    { q: 'If a negatively charged rod is brought near a neutral metal sphere, what happens to the electrons in the sphere?', a: ['they move away', 'repelled to far side', 'move to opposite side'], type: 'multi', difficulty: 2, hint: 'Like charges repel.' },
    { q: 'True or false: When electrons are transferred from object A to object B, object A becomes positively charged.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Losing electrons means losing negative charge, leaving a net positive charge.' },
    { q: 'A Van de Graaff generator makes your hair stand up. Which method of charge transfer is involved?', a: 'conduction', type: 'short', difficulty: 3, hint: 'You touch the generator, and charge flows to you through contact.' },
  ]},
  'conductors-insulators': { questions: [
    { q: 'What is a conductor?', a: ['material that allows charge to flow', 'material that lets electricity pass through'], type: 'multi', difficulty: 1, rule: 'A conductor is a material through which electric charge flows easily.' },
    { q: 'What is an insulator?', a: ['material that resists charge flow', 'material that does not let electricity pass'], type: 'multi', difficulty: 1, rule: 'An insulator is a material that does not allow electric charge to flow easily.' },
    { q: 'True or false: Copper is a good conductor of electricity.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Copper is one of the best electrical conductors and is widely used in wiring.' },
    { q: 'Which of these is an insulator: rubber, aluminum, or iron?', a: 'rubber', type: 'short', difficulty: 1, hint: 'Which material is used to coat electrical wires for safety?' },
    { q: 'Why are electrical wires coated in plastic or rubber?', a: ['to insulate', 'prevent shock', 'stop current from escaping'], type: 'multi', difficulty: 2, concept: 'The insulating coating prevents current from flowing where it should not, protecting people from shock.' },
    { q: 'True or false: Water is always a good conductor of electricity.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Pure water is actually a poor conductor. It is the dissolved ions in tap water or salt water that make it conductive.' },
    { q: 'What makes metals good conductors?', a: ['free electrons', 'loosely held electrons', 'electrons can move freely'], type: 'multi', difficulty: 3, hint: 'Think about what is special about the electrons in metal atoms.' },
    { q: 'Name a material that can act as both a conductor and an insulator depending on conditions.', a: ['silicon', 'semiconductor', 'germanium'], type: 'multi', difficulty: 3, concept: 'Semiconductors like silicon conduct under some conditions but insulate under others.' },
  ]},
  'electric-fields': { questions: [
    { q: 'What is an electric field?', a: ['region around a charge where force is exerted', 'area where charged objects experience force'], type: 'multi', difficulty: 1, rule: 'An electric field is the region around a charged object where another charged object experiences a force.' },
    { q: 'True or false: Electric field lines point away from positive charges.', a: 'true', type: 'tf', difficulty: 1, explanation: 'By convention, electric field lines point away from positive charges and toward negative charges.' },
    { q: 'What happens to the strength of an electric field as you move farther from the charge?', a: ['it decreases', 'gets weaker', 'weakens'], type: 'multi', difficulty: 2, hint: 'Think about how the field lines spread out with distance.' },
    { q: 'True or false: A positive test charge placed in an electric field will move in the direction of the field lines.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Field lines show the direction a positive charge would move.' },
    { q: 'Between two parallel plates with opposite charges, what does the electric field look like?', a: ['uniform', 'straight parallel lines', 'evenly spaced lines'], type: 'multi', difficulty: 2, concept: 'Between parallel plates, the electric field is approximately uniform with evenly spaced, straight field lines.' },
    { q: 'If field lines are close together, what does that indicate about the field strength?', a: ['strong field', 'greater strength', 'field is stronger'], type: 'multi', difficulty: 3, hint: 'The density of field lines represents the magnitude of the field.' },
    { q: 'What direction does the electric field point between a positive charge on the left and a negative charge on the right?', a: ['left to right', 'from positive to negative'], type: 'multi', difficulty: 3, concept: 'Field lines always go from positive to negative charges.' },
  ]},

  // ── circuits ───────────────────────────────────────────────────────────────
  'circuit-components': { questions: [
    { q: 'What are the four basic components needed for a simple electric circuit?', a: ['power source wire load switch', 'battery, wire, load, switch', 'energy source, conductor, resistor, switch'], type: 'multi', difficulty: 1, rule: 'A circuit needs a power source (battery), conducting wire, a load (like a bulb), and usually a switch.' },
    { q: 'What does a battery do in a circuit?', a: ['provides energy', 'provides voltage', 'pushes current', 'source of electrical energy'], type: 'multi', difficulty: 1, hint: 'A battery converts chemical energy to electrical energy.' },
    { q: 'True or false: A circuit must be a complete closed loop for current to flow.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Current can only flow through a closed (complete) circuit.' },
    { q: 'What happens when a switch is opened in a circuit?', a: ['current stops', 'circuit breaks', 'no current flows'], type: 'multi', difficulty: 1, rule: 'An open switch breaks the circuit, stopping the flow of current.' },
    { q: 'What is the purpose of a resistor in a circuit?', a: ['limits current', 'controls current flow', 'reduces current'], type: 'multi', difficulty: 2, hint: 'Resistors oppose the flow of electric current.' },
    { q: 'True or false: An ammeter measures voltage.', a: 'false', type: 'tf', difficulty: 2, explanation: 'An ammeter measures current (in amperes). A voltmeter measures voltage.' },
    { q: 'What instrument is used to measure the voltage across a component?', a: 'voltmeter', type: 'short', difficulty: 2, concept: 'A voltmeter is connected in parallel across a component to measure voltage difference.' },
    { q: 'What is the function of a fuse in a circuit?', a: ['protects from overcurrent', 'breaks circuit if current too high', 'safety device'], type: 'multi', difficulty: 3, hint: 'A fuse melts and breaks the circuit when too much current flows.' },
  ]},
  'series-circuits': { questions: [
    { q: 'In a series circuit, how are the components connected?', a: ['one after another', 'in a single path', 'end to end'], type: 'multi', difficulty: 1, rule: 'In a series circuit, components are connected in a single loop, one after another.' },
    { q: 'True or false: In a series circuit, the current is the same through every component.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Since there is only one path, the same current flows through all components.' },
    { q: 'What happens to the other bulbs in a series circuit if one bulb burns out?', a: ['all go out', 'all turn off', 'none work', 'circuit breaks'], type: 'multi', difficulty: 1, hint: 'Think about what happens when the single path is broken.' },
    { q: 'If a series circuit has a 6V battery and two identical bulbs, what is the voltage across each bulb?', a: '3', type: 'calculation', difficulty: 2, hint: 'In a series circuit, voltage is shared equally among identical components. 6V / 2 = ?' },
    { q: 'A series circuit has three resistors: 2 ohms, 3 ohms, and 5 ohms. What is the total resistance?', a: '10', type: 'calculation', difficulty: 2, rule: 'In series, total resistance = R1 + R2 + R3. So 2 + 3 + 5 = 10 ohms.' },
    { q: 'True or false: Adding more bulbs in series makes each bulb brighter.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Adding more bulbs increases resistance, which decreases current and makes each bulb dimmer.' },
    { q: 'A 12V battery is connected to resistors of 4 ohms and 8 ohms in series. What is the total current?', a: '1', type: 'calculation', difficulty: 3, hint: 'Total R = 4 + 8 = 12 ohms. Using V = IR: I = V/R = 12/12 = 1 A.' },
    { q: 'In the same circuit (12V, 4 ohms and 8 ohms in series), what is the voltage across the 8-ohm resistor?', a: '8', type: 'calculation', difficulty: 3, hint: 'V = IR. Current is 1 A, so V = 1 x 8 = 8 V.' },
  ]},
  'parallel-circuits': { questions: [
    { q: 'In a parallel circuit, how are the components connected?', a: ['on separate branches', 'side by side', 'each has its own path'], type: 'multi', difficulty: 1, rule: 'In a parallel circuit, components are connected on separate branches, each providing its own path for current.' },
    { q: 'True or false: In a parallel circuit, the voltage across each branch is the same.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Each branch connects directly to the battery, so the voltage is the same across all branches.' },
    { q: 'What happens to the other bulbs in a parallel circuit if one bulb burns out?', a: ['others stay on', 'rest keep working', 'other branches unaffected'], type: 'multi', difficulty: 1, hint: 'Each branch is independent.' },
    { q: 'True or false: Adding more branches in parallel increases the total resistance.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Adding branches in parallel provides more paths for current, which decreases total resistance.' },
    { q: 'Two 6-ohm resistors are connected in parallel. What is the total resistance?', a: '3', type: 'calculation', difficulty: 2, rule: 'For identical parallel resistors: total R = R/n. So 6/2 = 3 ohms.' },
    { q: 'A parallel circuit has a 12V battery. Branch A has a 4-ohm resistor. What is the current through branch A?', a: '3', type: 'calculation', difficulty: 2, hint: 'Each branch gets the full 12V. I = V/R = 12/4 = 3 A.' },
    { q: 'A parallel circuit has a 6-ohm and a 3-ohm resistor. What is the total resistance? Use 1/Rt = 1/R1 + 1/R2.', a: '2', type: 'calculation', difficulty: 3, hint: '1/Rt = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2. So Rt = 2 ohms.' },
    { q: 'In the previous circuit (6-ohm and 3-ohm in parallel with 12V), what is the total current from the battery?', a: '6', type: 'calculation', difficulty: 3, hint: 'I = V/Rt = 12/2 = 6 A. Or: I1 = 12/6 = 2 A, I2 = 12/3 = 4 A, total = 6 A.' },
  ]},
  'circuit-diagrams': { questions: [
    { q: 'What does a straight line represent in a circuit diagram?', a: ['wire', 'conductor', 'connecting wire'], type: 'multi', difficulty: 1, rule: 'Straight lines represent the conducting wires that connect components.' },
    { q: 'True or false: In a circuit diagram, a long and short parallel line represents a battery.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The battery symbol is two parallel lines (one long, one short), with the long line being the positive terminal.' },
    { q: 'What does an X inside a circle represent in a circuit diagram?', a: ['bulb', 'lamp', 'light'], type: 'multi', difficulty: 1, hint: 'This symbol represents a component that produces light.' },
    { q: 'How can you tell from a circuit diagram whether components are in series or parallel?', a: ['series has one path', 'parallel has branches', 'series single loop parallel multiple paths'], type: 'multi', difficulty: 2, concept: 'Series: one path with no branches. Parallel: the circuit splits into separate branches.' },
    { q: 'True or false: A voltmeter is drawn in parallel with the component it measures.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Voltmeters must be connected in parallel to measure the voltage difference across a component.' },
    { q: 'What does a zigzag line represent in a circuit diagram?', a: ['resistor', 'resistance'], type: 'multi', difficulty: 2, hint: 'This jagged symbol represents a component that opposes current flow.' },
    { q: 'How is a switch shown in its open (off) position in a circuit diagram?', a: ['gap in the line', 'break in circuit', 'line with gap'], type: 'multi', difficulty: 2, concept: 'An open switch is shown as a break or gap in the wire, indicating the circuit is not complete.' },
    { q: 'Draw a description: a circuit with a battery, a switch, and two bulbs in parallel.', a: ['battery connects to switch then splits into two branches each with a bulb then reconnects'], type: 'multi', difficulty: 3, hint: 'Start with the battery, add a switch on the main line, then show the wire splitting into two paths, each with a bulb.' },
  ]},

  // ── ohms-law ───────────────────────────────────────────────────────────────
  'voltage-current-resistance': { questions: [
    { q: 'What is voltage? What is its unit?', a: ['electrical pressure measured in volts', 'potential difference in volts', 'energy per charge in volts'], type: 'multi', difficulty: 1, rule: 'Voltage (V) is the electrical potential difference that pushes current through a circuit, measured in volts (V).' },
    { q: 'What is electric current? What is its unit?', a: ['flow of charge measured in amperes', 'flow of electrons in amps', 'charge per second in amperes'], type: 'multi', difficulty: 1, rule: 'Current (I) is the rate of flow of electric charge, measured in amperes (A).' },
    { q: 'What is resistance? What is its unit?', a: ['opposition to current measured in ohms', 'opposition to flow in ohms'], type: 'multi', difficulty: 1, rule: 'Resistance (R) is the opposition to the flow of current, measured in ohms (ohm).' },
    { q: 'True or false: Increasing the resistance in a circuit decreases the current, if voltage stays the same.', a: 'true', type: 'tf', difficulty: 2, explanation: 'From V = IR, if V is constant and R increases, then I = V/R decreases.' },
    { q: 'What happens to the current in a circuit if the voltage is doubled but resistance stays the same?', a: ['current doubles', 'doubles', 'it doubles'], type: 'multi', difficulty: 2, hint: 'I = V/R. If V doubles and R stays the same, what happens to I?' },
    { q: 'True or false: A thicker wire has more resistance than a thinner wire of the same material and length.', a: 'false', type: 'tf', difficulty: 2, explanation: 'A thicker wire has less resistance because there is more room for current to flow.' },
    { q: 'Which has more resistance: a short wire or a long wire of the same thickness and material?', a: ['long wire', 'the long wire', 'longer wire'], type: 'multi', difficulty: 3, concept: 'Longer wires have more resistance because electrons must travel farther through the material.' },
  ]},
  'ohms-law-calculations': { questions: [
    { q: 'State Ohm\'s Law as a formula.', a: ['V = IR', 'V=IR', 'voltage equals current times resistance'], type: 'multi', difficulty: 1, rule: 'Ohm\'s Law: V = I x R, where V is voltage, I is current, and R is resistance.' },
    { q: 'A circuit has a current of 2 A and a resistance of 5 ohms. What is the voltage?', a: '10', type: 'calculation', difficulty: 1, hint: 'V = IR = 2 x 5 = 10 V.' },
    { q: 'A 12V battery drives current through a 4-ohm resistor. What is the current?', a: '3', type: 'calculation', difficulty: 1, hint: 'I = V/R = 12/4 = 3 A.' },
    { q: 'A circuit has a voltage of 9V and a current of 3 A. What is the resistance?', a: '3', type: 'calculation', difficulty: 2, hint: 'R = V/I = 9/3 = 3 ohms.' },
    { q: 'True or false: If a 24V battery is connected to a 6-ohm resistor, the current is 4 A.', a: 'true', type: 'tf', difficulty: 2, explanation: 'I = V/R = 24/6 = 4 A.' },
    { q: 'A device draws 0.5 A from a 120V outlet. What is its resistance?', a: '240', type: 'calculation', difficulty: 2, hint: 'R = V/I = 120/0.5 = 240 ohms.' },
    { q: 'A resistor has a resistance of 10 ohms. If 2.5 A of current flows through it, what voltage is across it?', a: '25', type: 'calculation', difficulty: 3, hint: 'V = IR = 2.5 x 10 = 25 V.' },
    { q: 'A circuit has a 9V battery. You want 0.3 A of current. What resistance do you need?', a: '30', type: 'calculation', difficulty: 3, hint: 'R = V/I = 9/0.3 = 30 ohms.' },
  ]},
  'resistors-in-series': { questions: [
    { q: 'What is the formula for total resistance in a series circuit?', a: ['Rt = R1 + R2 + R3', 'R total = R1 + R2 + ...', 'add them up'], type: 'multi', difficulty: 1, rule: 'In series: Rt = R1 + R2 + R3 + ...' },
    { q: 'Two resistors of 10 ohms and 20 ohms are in series. What is the total resistance?', a: '30', type: 'calculation', difficulty: 1, hint: 'Rt = 10 + 20 = 30 ohms.' },
    { q: 'True or false: The total resistance in a series circuit is always greater than the largest individual resistor.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Since you add all resistances together, the total must be larger than any single one.' },
    { q: 'Three resistors of 5 ohms, 10 ohms, and 15 ohms are in series with a 30V battery. What is the total resistance?', a: '30', type: 'calculation', difficulty: 2, hint: 'Rt = 5 + 10 + 15 = 30 ohms.' },
    { q: 'In the previous circuit (30V, 30 ohms total), what is the current?', a: '1', type: 'calculation', difficulty: 2, hint: 'I = V/Rt = 30/30 = 1 A.' },
    { q: 'In a series circuit with 24V and resistors of 3 ohms, 5 ohms, and 4 ohms, what voltage drops across the 5-ohm resistor?', a: '10', type: 'calculation', difficulty: 3, hint: 'Rt = 12 ohms. I = 24/12 = 2 A. V across 5 ohm = IR = 2 x 5 = 10 V.' },
    { q: 'A series circuit has a 9V battery and two resistors. The voltage drop across the first resistor is 6V. What is the voltage across the second?', a: '3', type: 'calculation', difficulty: 3, rule: 'In series, voltages add up to the battery voltage: V2 = 9 - 6 = 3 V.' },
  ]},
  'resistors-in-parallel': { questions: [
    { q: 'What is the formula for total resistance of two resistors in parallel?', a: ['1/Rt = 1/R1 + 1/R2', 'Rt = R1*R2/(R1+R2)', 'reciprocal formula'], type: 'multi', difficulty: 1, rule: 'In parallel: 1/Rt = 1/R1 + 1/R2 + ...' },
    { q: 'True or false: The total resistance in a parallel circuit is always less than the smallest individual resistor.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Adding parallel paths always reduces total resistance below the smallest branch.' },
    { q: 'Two 10-ohm resistors are in parallel. What is the total resistance?', a: '5', type: 'calculation', difficulty: 2, hint: 'For identical resistors in parallel: Rt = R/n = 10/2 = 5 ohms.' },
    { q: 'A 4-ohm and a 12-ohm resistor are in parallel. What is the total resistance?', a: '3', type: 'calculation', difficulty: 2, hint: '1/Rt = 1/4 + 1/12 = 3/12 + 1/12 = 4/12. Rt = 12/4 = 3 ohms.' },
    { q: 'Three 12-ohm resistors are connected in parallel. What is the total resistance?', a: '4', type: 'calculation', difficulty: 2, hint: 'For identical resistors: Rt = R/n = 12/3 = 4 ohms.' },
    { q: 'A 6-ohm and a 3-ohm resistor are in parallel with a 12V battery. What is the total current?', a: '6', type: 'calculation', difficulty: 3, hint: 'Rt = (6x3)/(6+3) = 18/9 = 2 ohms. I = 12/2 = 6 A.' },
    { q: 'In the above circuit, what current flows through the 6-ohm resistor?', a: '2', type: 'calculation', difficulty: 3, hint: 'Each branch has 12V. I = V/R = 12/6 = 2 A.' },
    { q: 'A 10-ohm and a 15-ohm resistor are in parallel. What is the total resistance?', a: '6', type: 'calculation', difficulty: 3, hint: '1/Rt = 1/10 + 1/15 = 3/30 + 2/30 = 5/30. Rt = 30/5 = 6 ohms.' },
  ]},

  // ── electrical-power ───────────────────────────────────────────────────────
  'power-equation': { questions: [
    { q: 'What is the formula for electrical power?', a: ['P = IV', 'P=IV', 'power equals current times voltage'], type: 'multi', difficulty: 1, rule: 'Electrical power: P = I x V, where P is power in watts, I is current in amps, V is voltage in volts.' },
    { q: 'What is the unit of electrical power?', a: ['watt', 'watts', 'W'], type: 'multi', difficulty: 1, rule: 'Power is measured in watts (W).' },
    { q: 'A device draws 2 A from a 120V outlet. What is its power consumption?', a: '240', type: 'calculation', difficulty: 1, hint: 'P = IV = 2 x 120 = 240 W.' },
    { q: 'True or false: A 60W light bulb connected to a 120V supply draws 0.5 A of current.', a: 'true', type: 'tf', difficulty: 2, explanation: 'I = P/V = 60/120 = 0.5 A.' },
    { q: 'A 100W bulb runs on 20V. What current does it draw?', a: '5', type: 'calculation', difficulty: 2, hint: 'I = P/V = 100/20 = 5 A.' },
    { q: 'Using P = I^2 x R, what power is dissipated by a 10-ohm resistor carrying 3 A?', a: '90', type: 'calculation', difficulty: 3, hint: 'P = I^2 x R = 9 x 10 = 90 W.' },
    { q: 'A 500W microwave runs on a 250V supply. What is its resistance? (Use P = V^2/R)', a: '125', type: 'calculation', difficulty: 3, hint: 'R = V^2/P = 62500/500 = 125 ohms.' },
  ]},
  'energy-consumption': { questions: [
    { q: 'What is the formula for electrical energy consumed?', a: ['E = Pt', 'E=Pt', 'energy equals power times time'], type: 'multi', difficulty: 1, rule: 'Electrical energy: E = P x t, where E is energy, P is power, and t is time.' },
    { q: 'What unit is used on electricity bills to measure energy?', a: ['kilowatt-hour', 'kWh', 'kilowatt hour'], type: 'multi', difficulty: 1, rule: 'Electricity bills use kilowatt-hours (kWh): 1 kWh = 1000W running for 1 hour.' },
    { q: 'A 100W bulb runs for 10 hours. How much energy does it use in watt-hours?', a: '1000', type: 'calculation', difficulty: 1, hint: 'E = P x t = 100 x 10 = 1000 Wh = 1 kWh.' },
    { q: 'True or false: A 2000W heater running for 3 hours uses 6 kWh of energy.', a: 'true', type: 'tf', difficulty: 2, explanation: 'E = 2000W x 3h = 6000 Wh = 6 kWh.' },
    { q: 'Electricity costs $0.12 per kWh. How much does it cost to run a 500W appliance for 8 hours?', a: ['0.48', '$0.48'], type: 'multi', difficulty: 2, hint: 'E = 0.5 kW x 8 h = 4 kWh. Cost = 4 x $0.12 = $0.48.' },
    { q: 'A 1500W hair dryer is used for 15 minutes. How much energy does it use in kWh?', a: '0.375', type: 'calculation', difficulty: 3, hint: '15 min = 0.25 h. E = 1.5 kW x 0.25 h = 0.375 kWh.' },
    { q: 'Which uses more energy: a 60W bulb on for 24 hours, or a 1200W microwave on for 30 minutes?', a: ['60W bulb', 'bulb', 'the bulb'], type: 'multi', difficulty: 3, hint: 'Bulb: 60 x 24 = 1440 Wh. Microwave: 1200 x 0.5 = 600 Wh. The bulb uses more.' },
  ]},
  'electrical-safety': { questions: [
    { q: 'Why should you never touch an electrical appliance with wet hands?', a: ['water conducts electricity', 'increases shock risk', 'wet skin lowers resistance'], type: 'multi', difficulty: 1, rule: 'Water reduces the resistance of your skin, making it easier for dangerous current to flow through your body.' },
    { q: 'True or false: A fuse protects a circuit by breaking it when too much current flows.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The fuse wire melts when current exceeds its rating, breaking the circuit.' },
    { q: 'What does a ground wire do?', a: ['provides safe path for current', 'directs fault current to earth', 'prevents shock'], type: 'multi', difficulty: 2, hint: 'The ground wire provides a safe path for current to flow to the earth in case of a fault.' },
    { q: 'What is a circuit breaker?', a: ['automatic switch that opens on overcurrent', 'resettable fuse', 'safety device that breaks circuit'], type: 'multi', difficulty: 2, rule: 'A circuit breaker is an automatic switch that opens when current exceeds a safe level, protecting the circuit.' },
    { q: 'True or false: It is safe to use extension cords as permanent wiring.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Extension cords can overheat if used permanently or overloaded, creating fire hazards.' },
    { q: 'Why is it dangerous to overload a power strip with too many devices?', a: ['draws too much current', 'can overheat', 'fire hazard', 'exceeds current rating'], type: 'multi', difficulty: 2, concept: 'Too many devices draw excessive current through the strip, causing overheating and potential fire.' },
    { q: 'A 15 A circuit breaker protects a circuit. If devices drawing 8 A, 5 A, and 4 A are all turned on, what happens?', a: ['breaker trips', 'circuit breaks', 'breaker opens'], type: 'multi', difficulty: 3, hint: 'Total current = 8 + 5 + 4 = 17 A, which exceeds the 15 A rating.' },
  ]},
  'household-circuits': { questions: [
    { q: 'Are the outlets in your home wired in series or parallel?', a: 'parallel', type: 'short', difficulty: 1, rule: 'Household outlets are wired in parallel so each gets the full voltage and one can fail without affecting others.' },
    { q: 'What is the standard voltage for household outlets in the United States?', a: ['120', '120V', '120 volts'], type: 'multi', difficulty: 1, hint: 'Most US outlets provide this voltage for regular appliances.' },
    { q: 'True or false: If one light bulb burns out in your house, all other lights go out too.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Home circuits are parallel, so other devices are unaffected when one fails.' },
    { q: 'Why are household circuits wired in parallel instead of series?', a: ['each device gets full voltage', 'one can fail without affecting others', 'devices operate independently'], type: 'multi', difficulty: 2, concept: 'Parallel wiring ensures each device receives the full voltage and operates independently.' },
    { q: 'A household circuit is rated for 15 A at 120V. What is the maximum power it can deliver?', a: '1800', type: 'calculation', difficulty: 2, hint: 'P = IV = 15 x 120 = 1800 W.' },
    { q: 'True or false: A GFCI outlet is designed to protect against electric shock.', a: 'true', type: 'tf', difficulty: 2, explanation: 'GFCI (Ground Fault Circuit Interrupter) outlets detect imbalances in current and cut power to prevent shock.' },
    { q: 'You have a 1800W max circuit. You plug in a 1000W microwave and a 600W toaster. How much more power can you use?', a: '200', type: 'calculation', difficulty: 3, hint: 'Used: 1000 + 600 = 1600 W. Remaining: 1800 - 1600 = 200 W.' },
  ]},

  // ── magnetism ──────────────────────────────────────────────────────────────
  'magnetic-fields': { questions: [
    { q: 'What are the two poles of a magnet?', a: ['north and south', 'north, south', 'N and S'], type: 'multi', difficulty: 1, rule: 'Every magnet has a north pole and a south pole.' },
    { q: 'True or false: Like magnetic poles attract each other.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Like poles repel; opposite poles attract.' },
    { q: 'What is a magnetic field?', a: ['region around a magnet where force is exerted', 'invisible area of magnetic force'], type: 'multi', difficulty: 1, rule: 'A magnetic field is the region around a magnet where magnetic forces can be detected.' },
    { q: 'In which direction do magnetic field lines point outside a magnet?', a: ['from north to south', 'north to south'], type: 'multi', difficulty: 2, hint: 'Field lines exit the north pole and enter the south pole.' },
    { q: 'True or false: If you break a magnet in half, you get one north piece and one south piece.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Each piece becomes a complete magnet with its own north and south pole.' },
    { q: 'What happens when you sprinkle iron filings around a bar magnet?', a: ['they align with field lines', 'show the magnetic field pattern', 'form curves from pole to pole'], type: 'multi', difficulty: 2, concept: 'Iron filings align with the magnetic field lines, revealing the field pattern around the magnet.' },
    { q: 'Where is the magnetic field strongest around a bar magnet?', a: ['at the poles', 'near the poles', 'poles'], type: 'multi', difficulty: 3, hint: 'The field lines are most concentrated at these locations.' },
  ]},
  'electromagnets': { questions: [
    { q: 'What is an electromagnet?', a: ['magnet made with electric current', 'coil of wire with current', 'temporary magnet using electricity'], type: 'multi', difficulty: 1, rule: 'An electromagnet is a temporary magnet created by running electric current through a coil of wire, usually around an iron core.' },
    { q: 'True or false: An electromagnet can be turned on and off.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Since the magnetic field depends on current flow, turning off the current turns off the magnet.' },
    { q: 'What are three ways to make an electromagnet stronger?', a: ['more coils more current iron core', 'increase turns, increase current, add iron core'], type: 'multi', difficulty: 2, hint: 'Think about the coil, the current, and the core material.' },
    { q: 'Why is iron used as the core of an electromagnet instead of wood?', a: ['iron is magnetic', 'iron concentrates the field', 'iron is ferromagnetic'], type: 'multi', difficulty: 2, concept: 'Iron is a ferromagnetic material that greatly enhances the magnetic field.' },
    { q: 'True or false: Increasing the number of coils in an electromagnet increases its strength.', a: 'true', type: 'tf', difficulty: 2, explanation: 'More turns of wire create a stronger magnetic field.' },
    { q: 'Name two real-world uses of electromagnets.', a: ['scrapyard crane, MRI', 'doorbells, speakers', 'motors, hard drives'], type: 'multi', difficulty: 2, hint: 'Think about devices that need a magnet that can be switched on and off.' },
    { q: 'What happens to an electromagnet if you reverse the direction of current flow?', a: ['poles reverse', 'north and south switch', 'magnetic field reverses'], type: 'multi', difficulty: 3, concept: 'Reversing the current reverses the direction of the magnetic field, swapping the poles.' },
  ]},
  'motors-generators': { questions: [
    { q: 'What does an electric motor convert?', a: ['electrical energy to mechanical energy', 'electricity to motion', 'electrical to kinetic'], type: 'multi', difficulty: 1, rule: 'An electric motor converts electrical energy into mechanical (kinetic) energy.' },
    { q: 'What does an electric generator convert?', a: ['mechanical energy to electrical energy', 'motion to electricity', 'kinetic to electrical'], type: 'multi', difficulty: 1, rule: 'A generator converts mechanical energy into electrical energy.' },
    { q: 'True or false: A motor and a generator are essentially the same device used in reverse.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Both use the interaction between a magnetic field and a current-carrying coil, but in opposite directions.' },
    { q: 'What causes the coil in a motor to spin?', a: ['force on current in magnetic field', 'magnetic force on current', 'interaction of current and magnetic field'], type: 'multi', difficulty: 2, hint: 'A current-carrying wire in a magnetic field experiences a force.' },
    { q: 'What is the role of the commutator in a simple DC motor?', a: ['reverses current direction', 'switches current each half turn', 'keeps motor spinning'], type: 'multi', difficulty: 3, concept: 'The commutator reverses the current direction every half turn to keep the coil spinning in the same direction.' },
    { q: 'True or false: Wind turbines are examples of generators.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Wind turns the blades (mechanical energy), which turns a generator to produce electrical energy.' },
    { q: 'What must happen to the coil or the magnet in a generator to produce electricity?', a: ['they must move relative to each other', 'relative motion', 'coil must rotate', 'one must spin'], type: 'multi', difficulty: 3, hint: 'Electricity is generated only when there is relative motion between the coil and magnetic field.' },
  ]},
  'electromagnetic-induction': { questions: [
    { q: 'What is electromagnetic induction?', a: ['producing voltage by changing magnetic field', 'generating electricity by moving magnet near coil', 'creating current from changing field'], type: 'multi', difficulty: 1, rule: 'Electromagnetic induction is the production of voltage (and current) by changing the magnetic field through a coil of wire.' },
    { q: 'Who discovered electromagnetic induction?', a: ['faraday', 'michael faraday'], type: 'multi', difficulty: 1, hint: 'This English scientist discovered it in 1831.' },
    { q: 'True or false: Moving a magnet through a coil of wire produces an electric current.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The changing magnetic field through the coil induces a voltage that drives a current.' },
    { q: 'What are three ways to increase the induced voltage in a coil?', a: ['move faster more turns stronger magnet', 'faster motion, more coils, stronger magnet'], type: 'multi', difficulty: 2, hint: 'Think about the speed, the coil, and the magnet.' },
    { q: 'True or false: A stationary magnet inside a coil produces a continuous current.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Current is only induced when the magnetic field is changing. A stationary magnet produces no change.' },
    { q: 'What is Lenz\'s Law about?', a: ['induced current opposes the change', 'direction of induced current opposes cause', 'induced field opposes change in flux'], type: 'multi', difficulty: 3, rule: 'Lenz\'s Law states that the induced current flows in a direction that opposes the change that produced it.' },
    { q: 'Name a device that relies on electromagnetic induction.', a: ['transformer', 'generator', 'induction cooktop', 'wireless charger'], type: 'multi', difficulty: 2, hint: 'Many everyday devices use this principle to transfer or generate electrical energy.' },
    { q: 'In a transformer, how is energy transferred from the primary coil to the secondary coil?', a: ['through changing magnetic field', 'magnetic induction', 'electromagnetic induction via shared core'], type: 'multi', difficulty: 3, concept: 'AC current in the primary coil creates a changing magnetic field in the iron core, which induces a voltage in the secondary coil.' },
  ]},
};

// ═══════════════════════════════════════════════════════════════════════════════
// HINT BANKS — 3-tier progressive hints per skill
// ═══════════════════════════════════════════════════════════════════════════════

const HINT_BANKS = {
  // electric-charge
  'static-electricity': { tier1: 'Static electricity is caused by a buildup of charge on a surface.', tier2: 'Rubbing two objects together can transfer electrons from one to the other.', tier3: 'Example: Rubbing a balloon on your hair transfers electrons to the balloon, making it negatively charged.' },
  'charge-transfer': { tier1: 'Charge can be transferred by friction, conduction, or induction.', tier2: 'Friction: rubbing. Conduction: touching. Induction: bringing a charged object near without touching.', tier3: 'Example: Touching a charged rod to a metal sphere transfers charge by conduction.' },
  'conductors-insulators': { tier1: 'Conductors let charge flow; insulators do not.', tier2: 'Metals have free electrons that can move, making them good conductors. Plastics and rubber hold electrons tightly, making them insulators.', tier3: 'Example: Copper wire (conductor) coated in rubber (insulator) safely carries electricity.' },
  'electric-fields': { tier1: 'An electric field is the region around a charge where forces act on other charges.', tier2: 'Field lines point from positive to negative. Closer lines mean a stronger field.', tier3: 'Example: Between two parallel plates with opposite charges, the field is uniform (straight, evenly spaced lines).' },

  // circuits
  'circuit-components': { tier1: 'Every circuit needs a source, conductors, a load, and usually a switch.', tier2: 'The battery pushes current through wires to a load (like a bulb). The switch opens or closes the path.', tier3: 'Example: Battery -> wire -> switch -> bulb -> wire -> back to battery = complete circuit.' },
  'series-circuits': { tier1: 'Series means one single path for current to follow.', tier2: 'In series, all current goes through every component. If one breaks, they all stop working.', tier3: 'Example: Three bulbs in a row with one battery. Rt = R1 + R2 + R3.' },
  'parallel-circuits': { tier1: 'Parallel means multiple paths for current to follow.', tier2: 'Each branch gets the full voltage. The total current splits among the branches.', tier3: 'Example: Two bulbs on separate branches. 1/Rt = 1/R1 + 1/R2. Each gets full battery voltage.' },
  'circuit-diagrams': { tier1: 'Circuit diagrams use symbols to represent real components.', tier2: 'Common symbols: battery (long/short lines), resistor (zigzag), bulb (circle with X), switch (gap in line).', tier3: 'Example: A series circuit diagram shows all symbols in one loop. A parallel diagram shows branches splitting and rejoining.' },

  // ohms-law
  'voltage-current-resistance': { tier1: 'Voltage pushes, current flows, resistance opposes.', tier2: 'Higher voltage means more push. Higher resistance means less current for the same voltage.', tier3: 'Example: A 12V battery pushes more current than a 6V battery through the same resistance.' },
  'ohms-law-calculations': { tier1: 'Ohm\'s Law: V = IR. Rearrange to find any variable.', tier2: 'To find current: I = V/R. To find resistance: R = V/I. To find voltage: V = IR.', tier3: 'Example: 12V battery, 4-ohm resistor. I = 12/4 = 3 A.' },
  'resistors-in-series': { tier1: 'In series, just add all the resistances together.', tier2: 'Rt = R1 + R2 + R3. Then use V = IRt to find total current.', tier3: 'Example: 3 ohm + 5 ohm + 4 ohm = 12 ohm total. With 24V: I = 24/12 = 2 A.' },
  'resistors-in-parallel': { tier1: 'In parallel, use the reciprocal formula: 1/Rt = 1/R1 + 1/R2.', tier2: 'For two equal resistors: Rt = R/2. For n equal resistors: Rt = R/n.', tier3: 'Example: 6 ohm and 3 ohm in parallel: 1/Rt = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2. Rt = 2 ohms.' },

  // electrical-power
  'power-equation': { tier1: 'Power = Current x Voltage. P = IV.', tier2: 'Also: P = I^2 x R and P = V^2 / R.', tier3: 'Example: 2 A through 120V outlet: P = 2 x 120 = 240 W.' },
  'energy-consumption': { tier1: 'Energy = Power x Time. E = Pt.', tier2: 'Convert watts to kilowatts (divide by 1000) and time to hours for kWh.', tier3: 'Example: 100W bulb for 10 hours = 1000 Wh = 1 kWh.' },
  'electrical-safety': { tier1: 'Electricity is dangerous. Water, damaged wires, and overloaded circuits are common hazards.', tier2: 'Fuses and circuit breakers protect against overcurrent. Ground wires provide safe paths for fault currents.', tier3: 'Example: A 15 A circuit breaker trips if total current exceeds 15 A, preventing overheating and fire.' },
  'household-circuits': { tier1: 'Home outlets are wired in parallel at 120V (in the US).', tier2: 'Parallel wiring means each device gets full voltage and operates independently.', tier3: 'Example: A 15 A circuit at 120V can deliver up to 1800 W (P = IV = 15 x 120).' },

  // magnetism
  'magnetic-fields': { tier1: 'Every magnet has a north and south pole with an invisible field around it.', tier2: 'Field lines go from north to south outside the magnet. Like poles repel, opposite poles attract.', tier3: 'Example: Iron filings sprinkled around a magnet reveal curved field lines from pole to pole.' },
  'electromagnets': { tier1: 'An electromagnet is a coil of wire carrying current, often with an iron core.', tier2: 'Stronger current, more coils, and an iron core all increase the strength.', tier3: 'Example: A coil of 100 turns with an iron core carrying 2 A is stronger than 50 turns with 1 A and no core.' },
  'motors-generators': { tier1: 'Motors turn electricity into motion. Generators turn motion into electricity.', tier2: 'Both use coils and magnets. A motor has current flowing in a magnetic field. A generator moves a coil through a magnetic field.', tier3: 'Example: A wind turbine spins a generator. An electric fan uses a motor.' },
  'electromagnetic-induction': { tier1: 'A changing magnetic field near a coil induces a voltage and current.', tier2: 'Moving the magnet faster, using more turns, or a stronger magnet increases the induced voltage.', tier3: 'Example: Pushing a magnet into a coil of 100 turns produces more voltage than into a coil of 10 turns.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISCONCEPTIONS — pattern-matched corrections per skill
// ═══════════════════════════════════════════════════════════════════════════════

const MISCONCEPTIONS = {
  'static-electricity': [
    { patterns: [/create.*charge|make.*charge|new.*charge/i], correction: 'Electric charge is never created or destroyed. It is only transferred from one object to another. This is the law of conservation of charge.' },
  ],
  'charge-transfer': [
    { patterns: [/proton.*move|positive.*transfer/i], correction: 'In most static electricity situations, it is the ELECTRONS (negative charges) that move, not the protons. Protons are locked in the nucleus.' },
  ],
  'conductors-insulators': [
    { patterns: [/wood.*conduct|rubber.*conduct/i], correction: 'Wood and rubber are insulators, not conductors. They resist the flow of electric charge. Metals like copper and aluminum are good conductors.' },
  ],
  'series-circuits': [
    { patterns: [/first.*bulb.*bright|current.*used.*up/i], correction: 'Current is NOT used up as it flows through a series circuit. The same current flows through every component. Bulbs may be dimmer because voltage is shared, not because current is consumed.' },
  ],
  'parallel-circuits': [
    { patterns: [/same.*current.*each|current.*equal.*branch/i], correction: 'In a parallel circuit, the VOLTAGE is the same across each branch, but the CURRENT divides among the branches based on their resistance.' },
  ],
  'ohms-law-calculations': [
    { patterns: [/multiply.*V.*R|voltage.*times.*resistance/i], correction: 'To find current, DIVIDE voltage by resistance: I = V/R. Do not multiply V by R. V = IR means voltage equals current TIMES resistance.' },
  ],
  'power-equation': [
    { patterns: [/watts.*same.*volts|power.*same.*voltage/i], correction: 'Watts and volts are different. Watts measure POWER (rate of energy use). Volts measure VOLTAGE (electrical pressure). P = IV.' },
  ],
  'magnetic-fields': [
    { patterns: [/magnetic.*electric.*same|magnet.*electricity.*same/i], correction: 'Magnetic fields and electric fields are related but different. Electric fields are produced by charges; magnetic fields are produced by moving charges or magnets.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENA — driving questions for phenomenon-based learning
// ═══════════════════════════════════════════════════════════════════════════════

const PHENOMENA = {
  'electric-charge': [
    { title: 'The Sticky Balloon', focus: 'static electricity, charge transfer', text: 'When you rub a balloon on your hair and then hold it near the wall, it sticks. But if you wait long enough, it falls off.', drivingQuestion: 'Why does the balloon stick to the wall? Why does it eventually fall? What happens to the charges over time?' },
  ],
  'circuits': [
    { title: 'Holiday Light Mystery', focus: 'series vs parallel circuits', text: 'Some old holiday light strings go completely dark when one bulb burns out, but newer ones keep glowing even with a burned-out bulb.', drivingQuestion: 'What is different about the wiring in old vs. new light strings? Which type of circuit does each use? Why does one fail completely and the other does not?' },
    { title: 'Flashlight Design', focus: 'circuit components, series circuits', text: 'A flashlight has a battery, a switch, a bulb, and metal contacts. When you slide the switch, the light turns on.', drivingQuestion: 'Trace the path of current through the flashlight. What happens when the switch is off? What would happen if you added a second bulb in series?' },
  ],
  'ohms-law': [
    { title: 'The Dimmer Switch', focus: 'voltage, current, resistance', text: 'A dimmer switch lets you make a room light brighter or dimmer. Inside, it changes how much of the electrical energy reaches the bulb.', drivingQuestion: 'How does changing resistance affect the brightness of the bulb? If you increase resistance, what happens to current and power?' },
  ],
  'electrical-power': [
    { title: 'The Electricity Bill', focus: 'power, energy, cost', text: 'Your family electricity bill went up from $80 to $120 this month. You got a new space heater rated at 1500W.', drivingQuestion: 'If the heater runs 4 hours per day for 30 days and electricity costs $0.12/kWh, how much did it add to the bill? Could this explain the increase?' },
  ],
  'magnetism': [
    { title: 'The Junkyard Crane', focus: 'electromagnets, applications', text: 'A junkyard crane uses a huge electromagnet to pick up cars. The operator can turn the magnet on to grab a car and off to drop it.', drivingQuestion: 'Why does the crane use an electromagnet instead of a permanent magnet? What would happen if the current to the electromagnet was increased? Decreased?' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL LABS
// ═══════════════════════════════════════════════════════════════════════════════

const VIRTUAL_LABS = {
  'ohms-law-lab': {
    title: 'Virtual Ohm\'s Law Lab',
    skills: ['voltage-current-resistance', 'ohms-law-calculations'],
    objective: 'Investigate the relationship between voltage, current, and resistance',
    background: 'Ohm\'s Law states that voltage equals current times resistance (V = IR). By changing one variable and measuring the others, we can verify this relationship.',
    hypothesis_prompt: 'Predict: If you double the voltage across a resistor, what happens to the current?',
    variables: { independent: 'voltage (V) or resistance (R)', dependent: 'current (I)', controlled: ['wire material', 'temperature'] },
    procedure: [
      { step: 1, action: 'Set the resistor to 10 ohms. Apply 5V. Record the current.' },
      { step: 2, action: 'Keep the resistor at 10 ohms. Increase voltage to 10V. Record the current.' },
      { step: 3, action: 'Keep the resistor at 10 ohms. Increase voltage to 20V. Record the current.' },
      { step: 4, action: 'Now set voltage to 12V. Change resistance to 4 ohms, 6 ohms, and 12 ohms. Record the current each time.' },
      { step: 5, action: 'Plot voltage vs. current for the first three trials. What shape is the graph?' },
    ],
    observations: {
      'trial-1': 'V = 5V, R = 10 ohms, I = 0.5 A',
      'trial-2': 'V = 10V, R = 10 ohms, I = 1.0 A',
      'trial-3': 'V = 20V, R = 10 ohms, I = 2.0 A',
      'trial-4': 'V = 12V, R = 4 ohms, I = 3.0 A',
      'trial-5': 'V = 12V, R = 6 ohms, I = 2.0 A',
      'trial-6': 'V = 12V, R = 12 ohms, I = 1.0 A',
    },
    data_table: {
      columns: ['Trial', 'Voltage (V)', 'Resistance (ohms)', 'Current (A)', 'V/I'],
      rows: [
        ['1', '5', '10', '0.5', '10'],
        ['2', '10', '10', '1.0', '10'],
        ['3', '20', '10', '2.0', '10'],
        ['4', '12', '4', '3.0', '4'],
        ['5', '12', '6', '2.0', '6'],
        ['6', '12', '12', '1.0', '12'],
      ],
    },
    conclusion_questions: [
      'What pattern do you see between voltage and current when resistance is constant?',
      'What happens to current when you increase resistance but keep voltage the same?',
      'What does the ratio V/I equal in every trial?',
      'Is the voltage-current graph a straight line? What does that tell you?',
      'How could you use Ohm\'s Law to design a circuit with exactly 2 A of current?',
    ],
  },
  'series-parallel-lab': {
    title: 'Virtual Series vs. Parallel Circuit Lab',
    skills: ['series-circuits', 'parallel-circuits', 'resistors-in-series', 'resistors-in-parallel'],
    objective: 'Compare the behavior of series and parallel circuits',
    background: 'Series circuits have one path for current; parallel circuits have multiple paths. These two arrangements have very different properties.',
    hypothesis_prompt: 'Predict: Which circuit type will have brighter bulbs — series or parallel? Why?',
    variables: { independent: 'circuit type (series or parallel)', dependent: 'bulb brightness, current, voltage across each bulb', controlled: ['battery voltage (12V)', 'bulb resistance (6 ohms each)'] },
    procedure: [
      { step: 1, action: 'Build a series circuit with a 12V battery and two 6-ohm bulbs. Measure the current and voltage across each bulb.' },
      { step: 2, action: 'Build a parallel circuit with a 12V battery and two 6-ohm bulbs. Measure the current through each branch and the voltage across each bulb.' },
      { step: 3, action: 'Remove one bulb from the series circuit. What happens to the other bulb?' },
      { step: 4, action: 'Remove one bulb from the parallel circuit. What happens to the other bulb?' },
      { step: 5, action: 'Compare total current drawn from the battery in each circuit.' },
    ],
    observations: {
      'series': 'Total R = 12 ohms. I = 1 A through both bulbs. V = 6V across each bulb. Bulbs are dim.',
      'parallel': 'Each branch: I = 12/6 = 2 A. V = 12V across each bulb. Total I = 4 A. Bulbs are bright.',
      'series-remove': 'Removing one bulb breaks the circuit. The other bulb goes out.',
      'parallel-remove': 'Removing one bulb does not affect the other. It stays lit at full brightness.',
    },
    data_table: {
      columns: ['Circuit Type', 'Total R (ohms)', 'Total I (A)', 'V per Bulb (V)', 'Brightness'],
      rows: [
        ['Series (2 bulbs)', '12', '1', '6', 'Dim'],
        ['Parallel (2 bulbs)', '3', '4', '12', 'Bright'],
      ],
    },
    conclusion_questions: [
      'Why are the bulbs dimmer in the series circuit?',
      'Why does removing one bulb in series turn off the other?',
      'Why does each bulb in parallel get the full battery voltage?',
      'Which circuit type draws more total current from the battery? Why?',
      'Which type of circuit is used in your home? Why is that a better choice?',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAMS — ASCII diagrams for key concepts
// ═══════════════════════════════════════════════════════════════════════════════

const DIAGRAMS_LOCAL = {
  'series-circuit': {
    domain: 'ms-physics-electricity',
    skill: 'series-circuits',
    topic: 'Series Circuit',
    description: 'A simple series circuit with a battery, switch, and two resistors.',
    diagram: `
    +---[Battery 12V]---[Switch]---+
    |                              |
    +---[R1 = 4 ohms]---[R2 = 8 ohms]---+
    |                                     |
    +-------------------------------------+

  [A] Total resistance: ___
  [B] Current through circuit: ___
  [C] Voltage across R2: ___
`,
    labels: { 'Total resistance': '12 ohms', 'Current through circuit': '1 A', 'Voltage across R2': '8 V' },
  },
  'parallel-circuit': {
    domain: 'ms-physics-electricity',
    skill: 'parallel-circuits',
    topic: 'Parallel Circuit',
    description: 'A parallel circuit with a 12V battery and two branches.',
    diagram: `
        +---[Battery 12V]---+
        |                   |
        +---[R1 = 6 ohms]--+
        |                   |
        +---[R2 = 3 ohms]--+
        |                   |
        +-------------------+

  [A] Voltage across R1: ___
  [B] Current through R1: ___
  [C] Current through R2: ___
  [D] Total current: ___
`,
    labels: { 'Voltage across R1': '12 V', 'Current through R1': '2 A', 'Current through R2': '4 A', 'Total current': '6 A' },
  },
  'ohms-law-triangle': {
    domain: 'ms-physics-electricity',
    skill: 'ohms-law-calculations',
    topic: 'Ohm\'s Law Triangle',
    description: 'The Ohm\'s Law triangle for remembering V = IR.',
    diagram: `
         /\\
        / V \\
       /-----\\
      / I | R \\
     /----+----\\

  Cover the variable you want to find:
  Cover V -> I x R  (multiply I and R)
  Cover I -> V / R  (divide V by R)
  Cover R -> V / I  (divide V by I)

  Practice: V = 24V, R = 8 ohms. I = ___
`,
    labels: { 'I': '3 A' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CER PHENOMENA — Claim-Evidence-Reasoning prompts
// ═══════════════════════════════════════════════════════════════════════════════

const CER_PHENOMENA_LOCAL = {
  'series-vs-parallel': {
    domain: 'ms-physics-electricity',
    title: 'Why Do Homes Use Parallel Circuits?',
    phenomenon: 'In your home, each outlet works independently. You can turn off a lamp without affecting the TV. But some cheap holiday lights go all dark if one bulb fails.',
    scaffold: {
      claim: 'Make a claim about which type of circuit (series or parallel) is better for wiring a home, and why.',
      evidence: 'Compare what happens in a series circuit vs. a parallel circuit when one device fails. What about voltage to each device?',
      reasoning: 'Explain using the properties of series and parallel circuits why one type is safer and more practical for homes.',
    },
    keyTerms: ['parallel', 'series', 'independent', 'voltage', 'current', 'branch', 'fail', 'safety'],
    rubric: {
      claim: { excellent: 'Clearly states parallel is better and gives a reason', adequate: 'States parallel is used', developing: 'Unclear or incorrect claim' },
      evidence: { excellent: 'Compares both circuit types with specific examples of what happens when a device fails', adequate: 'Mentions one difference', developing: 'No specific evidence' },
      reasoning: { excellent: 'Explains that parallel gives each device full voltage, devices are independent, and one failure does not affect others', adequate: 'Mentions independence', developing: 'Incomplete reasoning' },
    },
  },
  'electromagnet-strength': {
    domain: 'ms-physics-electricity',
    title: 'What Makes an Electromagnet Stronger?',
    phenomenon: 'A student wraps 20 turns of wire around a nail and connects it to a battery. It picks up 5 paper clips. When they wrap 40 turns and use two batteries, it picks up 18 paper clips.',
    scaffold: {
      claim: 'Make a claim about what factors affect the strength of an electromagnet.',
      evidence: 'Describe what changed between the two setups and how the results differed.',
      reasoning: 'Explain WHY more turns and more batteries produce a stronger electromagnet. What is happening to the magnetic field?',
    },
    keyTerms: ['turns', 'coils', 'current', 'voltage', 'magnetic field', 'stronger', 'electromagnet', 'iron'],
    rubric: {
      claim: { excellent: 'States that more turns and more current increase electromagnet strength', adequate: 'Mentions one factor', developing: 'Unclear claim' },
      evidence: { excellent: 'Notes both changes (turns doubled, batteries doubled) and quantifies the result difference', adequate: 'Notes one change', developing: 'Vague evidence' },
      reasoning: { excellent: 'Explains that more turns concentrate the field and more current (from more voltage) creates a stronger field in each turn', adequate: 'Says more turns or current helps', developing: 'Incomplete reasoning' },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY — key terms per category
// ═══════════════════════════════════════════════════════════════════════════════

const VOCABULARY = {
  'electric-charge': [
    { term: 'electric charge', definition: 'A fundamental property of matter. Objects can have positive (+), negative (-), or neutral charge.' },
    { term: 'electron', definition: 'A subatomic particle with a negative charge. Electrons can be transferred between objects.' },
    { term: 'proton', definition: 'A subatomic particle with a positive charge, found in the nucleus of an atom.' },
    { term: 'static electricity', definition: 'The buildup of electric charge on the surface of an object, often caused by friction.' },
    { term: 'conductor', definition: 'A material that allows electric charge to flow through it easily. Most metals are conductors.' },
    { term: 'insulator', definition: 'A material that does not allow electric charge to flow easily. Rubber and plastic are insulators.' },
  ],
  'circuits': [
    { term: 'circuit', definition: 'A closed loop through which electric current flows, including a source, conductors, and a load.' },
    { term: 'current', definition: 'The flow of electric charge through a conductor, measured in amperes (A).' },
    { term: 'voltage', definition: 'The electrical potential difference that pushes current through a circuit, measured in volts (V).' },
    { term: 'series circuit', definition: 'A circuit where components are connected in a single path, one after another.' },
    { term: 'parallel circuit', definition: 'A circuit where components are connected on separate branches, each with its own path.' },
    { term: 'switch', definition: 'A device that opens or closes a circuit, controlling the flow of current.' },
  ],
  'ohms-law': [
    { term: 'resistance', definition: 'The opposition to the flow of electric current, measured in ohms.' },
    { term: 'Ohm\'s Law', definition: 'V = IR. Voltage equals current times resistance.' },
    { term: 'ohm', definition: 'The unit of electrical resistance. Symbol: ohm.' },
    { term: 'ammeter', definition: 'An instrument that measures electric current in amperes. Connected in series.' },
    { term: 'voltmeter', definition: 'An instrument that measures voltage difference. Connected in parallel.' },
  ],
  'electrical-power': [
    { term: 'power', definition: 'The rate at which electrical energy is used, measured in watts (W). P = IV.' },
    { term: 'watt', definition: 'The unit of power. One watt equals one joule of energy per second.' },
    { term: 'kilowatt-hour', definition: 'A unit of energy equal to 1000 watts used for 1 hour. Used on electricity bills.' },
    { term: 'fuse', definition: 'A safety device that melts and breaks the circuit if too much current flows.' },
    { term: 'circuit breaker', definition: 'An automatic switch that opens when current exceeds a safe level. Can be reset.' },
  ],
  'magnetism': [
    { term: 'magnet', definition: 'An object that produces a magnetic field and attracts certain metals like iron.' },
    { term: 'magnetic field', definition: 'The region around a magnet where magnetic forces can be detected.' },
    { term: 'electromagnet', definition: 'A temporary magnet made by passing electric current through a coil of wire.' },
    { term: 'electromagnetic induction', definition: 'The production of voltage by changing the magnetic field through a coil of wire.' },
    { term: 'generator', definition: 'A device that converts mechanical energy into electrical energy using electromagnetic induction.' },
    { term: 'motor', definition: 'A device that converts electrical energy into mechanical (kinetic) energy.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIOS — real-world application scenarios for lessons
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = [
  { title: 'Designing a Flashlight', focus: 'circuits, batteries, switches', text: 'You need to design a simple flashlight using a 3V battery, a switch, wires, and a small LED bulb rated for 3V at 0.02 A. Draw the circuit diagram. What is the resistance of the LED? What happens if you use a 6V battery without adding a resistor?' },
  { title: 'Wiring a Model House', focus: 'parallel circuits, safety', text: 'You are wiring a model house with three rooms. Each room has a light and an outlet. The house has a 12V power supply and a 5 A main fuse. Design the circuit so each room works independently. What is the maximum power the house can use?' },
  { title: 'Investigating a Power Outage', focus: 'circuits, troubleshooting', text: 'The lights in the kitchen went out, but the living room lights still work. The microwave and toaster were both running when it happened. The kitchen circuit has a 15 A breaker. The microwave draws 10 A and the toaster draws 8 A. What happened?' },
  { title: 'Building an Electromagnet Crane', focus: 'electromagnets, current, coils', text: 'Your team is building a model crane that uses an electromagnet to pick up metal objects. You have a 6V battery, copper wire, an iron nail, and various loads. How would you make the strongest electromagnet? What are the tradeoffs of using more coils vs. more current?' },
  { title: 'Solar Panel Challenge', focus: 'voltage, current, power', text: 'A small solar panel produces 6V and 0.5 A in direct sunlight. You want to charge a phone that needs 5V and 1 A. What is the panel power output? Is it enough? How could you modify the setup to meet the phone requirements?' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Exercise generation helper
// ═══════════════════════════════════════════════════════════════════════════════

function generateExercise(skill, count = 5, mastery = null, seenQ = null) {
  return _generateExercise({ bank: QUESTION_BANKS[skill], skill, count, mastery, seenQ, type: 'exercise', instruction: 'Answer each question.' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASS — extends DomainSkillBase
// ═══════════════════════════════════════════════════════════════════════════════

class MSPhysicsElectricity extends DomainSkillBase {
  constructor() {
    super('ms-physics-electricity', 'ms-physics-electricity', DATA_DIR, loadProfile, saveProfile, HINT_BANKS);
  }

  getProfile(id) {
    const p = loadProfile(id);
    return { studentId: p.studentId, createdAt: p.createdAt, totalAssessments: p.assessments.length };
  }

  recordAssessment(id, skill, score, total, notes = '', hintsUsed = 0) {
    if (!QUESTION_BANKS[skill]) throw new Error(`Unknown skill: ${skill}`);
    if (typeof total !== 'number' || total <= 0) throw new Error('total must be positive');
    if (typeof score !== 'number' || score < 0 || score > total) throw new Error(`score must be 0-${total}`);
    const p = loadProfile(id);
    const hintsClamp = Math.max(0, Math.min(3, Number(hintsUsed) || 0));
    const hintMultiplier = [1.0, 0.75, 0.50, 0.25][hintsClamp];
    const entry = { date: new Date().toISOString(), skill, score, total, notes, hintsUsed: hintsClamp, hintMultiplier };
    p.assessments.push(entry);
    if (!p.skills[skill]) p.skills[skill] = { attempts: [] };
    p.skills[skill].attempts.push({ date: entry.date, score, total, hintsUsed: hintsClamp, hintMultiplier });
    p.skills[skill].mastery = calcMastery(p.skills[skill].attempts);
    p.skills[skill].label = masteryLabel(p.skills[skill].mastery);
    p.skills[skill].sr = srUpdate(p.skills[skill].sr || null, score, total);
    // FSRS scheduling
    const _fg = score / total >= 0.9 ? 4 : score / total >= 0.7 ? 3 : score / total >= 0.5 ? 2 : 1;
    const _pf = p.skills[skill].fsrs || { stability: 2.5, difficulty: 5 };
    const _ns = fsrsUpdateStability(_pf.stability, _pf.difficulty, _fg);
    const _nd = fsrsUpdateDifficulty(_pf.difficulty, _fg);
    const _di = fsrsNextReview(_ns);
    const _dd = new Date();
    _dd.setDate(_dd.getDate() + _di);
    p.skills[skill].fsrs = { stability: _ns, difficulty: _nd, due: _dd.toISOString().slice(0, 10), lastReviewed: today() };
    saveProfile(p);
    return { studentId: id, skill, score: `${score}/${total}`, mastery: p.skills[skill].mastery, label: p.skills[skill].label };
  }

  getProgress(id) {
    const p = loadProfile(id);
    const results = {};
    let mastered = 0, total = 0;
    for (const [cat, skills] of Object.entries(SKILLS)) {
      results[cat] = {};
      for (const sk of skills) {
        total++;
        const d = p.skills[sk];
        const hu = p.hintUsage?.[sk];
        results[cat][sk] = d
          ? { mastery: d.mastery, label: d.label, ...(hu && hu.totalHints > 0 ? { hintsUsed: hu.totalHints } : {}) }
          : { mastery: 0, label: 'not-started' };
        if (d && d.mastery >= MASTERY_THRESHOLD) mastered++;
      }
    }
    const totalHints = Object.values(p.hintUsage || {}).reduce((s, h) => s + (h.totalHints || 0), 0);
    return { studentId: id, mastered, total, overallPct: total > 0 ? Math.round(mastered / total * 100) : 0, totalHintsUsed: totalHints, skills: results };
  }

  getNextSkills(id, count = 5) {
    const p = loadProfile(id);
    const candidates = [];
    for (const [cat, skills] of Object.entries(SKILLS)) {
      for (const sk of skills) {
        const d = p.skills[sk];
        const m = d ? d.mastery : 0;
        if (m < MASTERY_THRESHOLD && _electricityTopicUnlocked(sk, p.skills)) {
          candidates.push({ category: cat, skill: sk, mastery: m, label: d ? d.label : 'not-started', fsrs: d ? d.fsrs || null : null });
        }
      }
    }
    const order = { developing: 0, emerging: 1, 'not-started': 2 };
    const _td = today();
    candidates.sort((a, b) => {
      const aDue = (a.fsrs && a.fsrs.due <= _td && a.mastery > 0) ? 1 : 0;
      const bDue = (b.fsrs && b.fsrs.due <= _td && b.mastery > 0) ? 1 : 0;
      if (aDue !== bDue) return bDue - aDue;
      return (order[a.label] ?? 3) - (order[b.label] ?? 3) || b.mastery - a.mastery;
    });
    return { studentId: id, next: candidates.slice(0, count) };
  }

  getProgressionMap(id) {
    const p = loadProfile(id);
    const topics = [];
    let unlocked = 0, gated = 0, mastered = 0;
    for (const [cat, skills] of Object.entries(SKILLS)) {
      for (const sk of skills) {
        const d = p.skills[sk];
        const m = d ? d.mastery : 0;
        const prereqs = TOPIC_PREREQUISITES[sk] || [];
        const isUnlocked = _electricityTopicUnlocked(sk, p.skills);
        const blockedBy = prereqs.filter(r => (p.skills[r]?.mastery || 0) < MASTERY_THRESHOLD);
        if (m >= MASTERY_THRESHOLD) mastered++;
        else if (isUnlocked) unlocked++;
        else gated++;
        topics.push({ topic: sk, category: cat, mastery: m, label: d ? d.label : 'not-started', unlocked: isUnlocked, prerequisites: prereqs, blockedBy: isUnlocked ? [] : blockedBy, neededMastery: isUnlocked ? null : MASTERY_THRESHOLD });
      }
    }
    return { studentId: id, summary: { total: topics.length, mastered, unlocked, gated }, topics };
  }

  getReport(id) {
    const p = loadProfile(id);
    const hintStats = {};
    for (const [sk, hu] of Object.entries(p.hintUsage || {})) {
      if (hu.totalHints > 0) hintStats[sk] = { totalHints: hu.totalHints };
    }
    return { studentId: id, progress: this.getProgress(id), hintStats, recentAssessments: p.assessments.slice(-20).reverse() };
  }

  listStudents() {
    const students = listProfiles(DATA_DIR);
    return { count: students.length, students };
  }

  getSkillCatalog() {
    const catalog = {};
    let total = 0;
    for (const [cat, skills] of Object.entries(SKILLS)) {
      total += skills.length;
      catalog[cat] = [...skills];
    }
    return { skills: catalog, totalSkills: total };
  }

  generateExercise(skill, count = 5, mastery = null, seenQ = null) {
    return generateExercise(skill, count, mastery, seenQ);
  }

  generateLesson(id) {
    const p = loadProfile(id);
    const target = this.getNextSkills(id, 3).next[0];
    if (!target) return { message: 'All electricity & circuits skills are proficient!', congratulations: true };
    const skillMastery = p.skills[target.skill]?.mastery || 0;
    const exercise = generateExercise(target.skill, 5, skillMastery);
    const scenario = SCENARIOS.length > 0 ? pick(SCENARIOS, 1)[0] : null;
    const diff = buildDiffContext(p);
    return {
      studentId: id, targetSkill: target, exercise, scenario,
      lessonPlan: {
        review: 'Review previously learned concepts (2-3 min)',
        teach: `Introduce/reinforce: ${target.category} -> ${target.skill}`,
        practice: `Complete ${exercise.count || 0} practice items`,
        apply: scenario ? `Analyze scenario: "${scenario.title}"` : 'Connect to real-world electricity applications',
        extend: `Connect ${target.skill} to related electricity concepts`,
      },
      ...(diff ? { differentiation: diff } : {}),
    };
  }

  checkAnswer(type, expected, answer, skill) {
    let exp = expected;
    try { exp = JSON.parse(expected); } catch {}
    const correct = _checkAnswer(exp, answer);
    const result = { correct, expected: exp, studentAnswer: answer };
    if (!correct && skill) {
      const mcs = MISCONCEPTIONS[skill];
      if (mcs) {
        for (const mc of mcs) {
          if (mc.patterns.some(p => p.test(answer))) {
            result.misconception = true;
            result.correction = mc.correction;
            break;
          }
        }
      }
    }
    return result;
  }

  getLab(name) {
    if (!name) return { labs: Object.keys(VIRTUAL_LABS), instructions: 'node electricity.js lab <id> <lab-name> [obs-key]' };
    const lab = VIRTUAL_LABS[name];
    if (!lab) return { error: `Unknown lab: ${name}. Available: ${Object.keys(VIRTUAL_LABS).join(', ')}` };
    return { lab: name, ...lab };
  }

  getLabObservation(name, obsKey) {
    const lab = VIRTUAL_LABS[name];
    if (!lab) return { error: `Unknown lab: ${name}` };
    if (!obsKey) return { available: Object.keys(lab.observations) };
    const obs = lab.observations[obsKey];
    if (!obs) return { error: `Unknown observation key: ${obsKey}. Available: ${Object.keys(lab.observations).join(', ')}` };
    return { lab: name, key: obsKey, observation: obs };
  }

  getDiagramData(id, topic) {
    if (!topic) {
      return { availableDiagrams: Object.keys(DIAGRAMS_LOCAL).map(k => ({ key: k, topic: DIAGRAMS_LOCAL[k].topic, skill: DIAGRAMS_LOCAL[k].skill })) };
    }
    const d = DIAGRAMS_LOCAL[topic];
    if (!d) return { error: `Unknown diagram: ${topic}. Available: ${Object.keys(DIAGRAMS_LOCAL).join(', ')}` };
    return { diagramKey: topic, domain: d.domain, skill: d.skill, topic: d.topic, description: d.description, diagram: d.diagram, labelCount: Object.keys(d.labels).length };
  }

  checkDiagramAnswers(id, topic, answers) {
    const d = DIAGRAMS_LOCAL[topic];
    if (!d) return { error: `Unknown diagram: ${topic}` };
    let correct = 0;
    const total = Object.keys(d.labels).length;
    const results = {};
    for (const [key, expected] of Object.entries(d.labels)) {
      const student = (answers[key] || '').trim().toLowerCase();
      const exp = expected.toLowerCase();
      const match = student === exp || exp.includes(student) || student.includes(exp);
      if (match) correct++;
      results[key] = { expected, studentAnswer: answers[key] || '', correct: match };
    }
    return { studentId: id, topic, correct, total, score: `${correct}/${total}`, results };
  }

  getCER(id, topic) {
    if (!topic) {
      return { studentId: id, availableTopics: Object.keys(CER_PHENOMENA_LOCAL).map(k => ({ key: k, title: CER_PHENOMENA_LOCAL[k].title })) };
    }
    const c = CER_PHENOMENA_LOCAL[topic];
    if (!c) return { error: `Unknown CER topic: ${topic}. Available: ${Object.keys(CER_PHENOMENA_LOCAL).join(', ')}` };
    return {
      studentId: id,
      phenomenon: c,
      scaffold: c.scaffold,
      instructions: 'Present the phenomenon to the student. Ask them to write: (1) Claim, (2) Evidence, (3) Reasoning. Then call cer-check with their responses.',
    };
  }

  checkCER(id, topic, claim, evidence, reasoning) {
    const c = CER_PHENOMENA_LOCAL[topic];
    if (!c) return { error: `Unknown CER topic: ${topic}` };
    const scoreText = (text, kws) => {
      if (!kws || !kws.length) return { score: 2, feedback: 'Reviewed' };
      const t = text.toLowerCase();
      const hits = kws.filter(k => t.includes(k.toLowerCase()));
      const pct = hits.length / kws.length;
      return { score: pct >= 0.6 ? 3 : pct >= 0.3 ? 2 : 1, hits, feedback: pct >= 0.6 ? 'Strong' : pct >= 0.3 ? 'Developing' : 'Needs work' };
    };
    const kw = c.keyTerms || [];
    const scores = { claim: scoreText(claim, kw), evidence: scoreText(evidence, kw), reasoning: scoreText(reasoning, kw) };
    const total = scores.claim.score + scores.evidence.score + scores.reasoning.score;
    return { studentId: id, topic, scores, total, maxScore: 9 };
  }

  getDiagramLocal(topic) {
    if (!topic) {
      return { availableDiagrams: Object.keys(DIAGRAMS_LOCAL).map(k => ({ key: k, topic: DIAGRAMS_LOCAL[k].topic, skill: DIAGRAMS_LOCAL[k].skill })) };
    }
    const d = DIAGRAMS_LOCAL[topic];
    if (!d) return { error: `Unknown diagram: ${topic}. Available: ${Object.keys(DIAGRAMS_LOCAL).join(', ')}` };
    return { diagramKey: topic, ...d, labelCount: Object.keys(d.labels).length };
  }

  getCERLocal(topic) {
    if (!topic) {
      return { availableTopics: Object.keys(CER_PHENOMENA_LOCAL).map(k => ({ key: k, title: CER_PHENOMENA_LOCAL[k].title })) };
    }
    const c = CER_PHENOMENA_LOCAL[topic];
    if (!c) return { error: `Unknown CER topic: ${topic}. Available: ${Object.keys(CER_PHENOMENA_LOCAL).join(', ')}` };
    return { topic, ...c };
  }

  getPhenomenon(category) {
    if (!category) {
      const all = {};
      for (const [cat, arr] of Object.entries(PHENOMENA)) {
        all[cat] = arr.map(p => p.title);
      }
      return { categories: all };
    }
    const phens = PHENOMENA[category];
    if (!phens) return { error: `Unknown category: ${category}. Available: ${Object.keys(PHENOMENA).join(', ')}` };
    return pick(phens, 1)[0];
  }

  getScenario() {
    if (!SCENARIOS.length) return { error: 'No scenarios available.' };
    return pick(SCENARIOS, 1)[0];
  }

  review(id) {
    const p = loadProfile(id);
    const due = [];
    for (const [skill, data] of Object.entries(p.skills)) {
      if (data.mastery > 0 && (data.fsrs ? data.fsrs.due <= new Date().toISOString().slice(0, 10) : srDueToday(data.sr))) {
        const effMastery = srEffectiveMastery(data.mastery || 0, data.sr);
        due.push({
          skill,
          effectiveMastery: effMastery,
          label: masteryLabel(effMastery),
          nextReview: data.sr?.nextReview || null,
          exercise: generateExercise(skill, 3, data.mastery || 0),
        });
      }
    }
    due.sort((a, b) => a.effectiveMastery - b.effectiveMastery);
    return {
      studentId: id, today: new Date().toISOString().slice(0, 10), dueCount: due.length, reviewSessions: due,
      message: due.length === 0 ? 'No electricity skills due for review today!' : `${due.length} skill(s) need review. Work through each exercise below.`,
    };
  }
}

module.exports = MSPhysicsElectricity;

// ═══════════════════════════════════════════════════════════════════════════════
// CLI: node electricity.js <command> [args]
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const api = new MSPhysicsElectricity();
  const common = buildCommonCLIHandlers(api, DATA_DIR, 'ms-physics-electricity', loadProfile, saveProfile);
  runCLI((cmd, args, out) => {
    if (cmd !== 'lab' && common(cmd, args, out)) return;
    switch (cmd) {
      case 'start': {
        const [, id] = args;
        if (!id) throw new Error('Usage: start <id>');
        const ss = loadSessionState(DATA_DIR, id);
        out({ action: 'start', profile: api.getProfile(id), nextSkills: api.getNextSkills(id), sessionState: ss || null });
        break;
      }
      case 'exercise': {
        const [, id, skill] = args;
        if (!id) throw new Error('Usage: exercise <id> [skill]');
        const _pp = loadProfile(id);
        const _getM = sk => _pp.skills[sk]?.mastery || 0;
        const _getSeenQ = sk => _pp.correctQ?.[sk] || [];
        if (skill) {
          const r = api.generateExercise(skill, 5, _getM(skill), _getSeenQ(skill));
          saveSessionState(DATA_DIR, id, { command: 'exercise', skill, questionIndex: 0 });
          out(r);
        } else {
          const n = api.getNextSkills(id, 1).next;
          if (n.length) {
            const r = api.generateExercise(n[0].skill, 5, _getM(n[0].skill), _getSeenQ(n[0].skill));
            saveSessionState(DATA_DIR, id, { command: 'exercise', skill: n[0].skill, questionIndex: 0 });
            out(r);
          } else {
            out({ message: 'All skills proficient!' });
          }
        }
        break;
      }
      case 'check': {
        const [, id, type, expected, answer, skill] = args;
        if (!id || !type || !expected || !answer) throw new Error('Usage: check <id> <type> <expected> <answer> [skill]');
        out(api.checkAnswer(type, expected, answer, skill || null));
        break;
      }
      case 'record': {
        const [, id, skill, sc, tot, hints, ...notes] = args;
        if (!id || !skill || !sc || !tot) throw new Error('Usage: record <id> <skill> <score> <total> [hints] [notes]');
        const r = api.recordAssessment(id, skill, Number(sc), Number(tot), notes.join(' '), Number(hints) || 0);
        saveSessionState(DATA_DIR, id, { command: 'record', skill });
        out(r);
        break;
      }
      case 'progress': {
        const [, id] = args;
        if (!id) throw new Error('Usage: progress <id>');
        out(api.getProgress(id));
        break;
      }
      case 'review': {
        const [, id] = args;
        if (!id) throw new Error('Usage: review <id>');
        out(api.review(id));
        break;
      }
      case 'hint': {
        const [, id, skill] = args;
        if (!id || !skill) throw new Error('Usage: hint <id> <skill>');
        out(api.getHint(id, skill));
        break;
      }
      case 'lesson': {
        const [, id] = args;
        if (!id) throw new Error('Usage: lesson <id>');
        out(api.generateLesson(id));
        break;
      }
      case 'lab': {
        const [, id, name, obsKey] = args;
        if (!id) throw new Error('Usage: lab <id> [lab-name] [obs-key]');
        if (!name) {
          out(api.getLab());
        } else if (!obsKey) {
          out(api.getLab(name));
        } else {
          out(api.getLabObservation(name, obsKey));
        }
        break;
      }
      case 'cer': {
        const [, id, topic] = args;
        if (!id) throw new Error('Usage: cer <id> [topic]');
        out(api.getCERLocal(topic || null));
        break;
      }
      case 'cer-check': {
        const [, id, topic, claim, evidence, reasoning] = args;
        if (!id || !topic || !claim || !evidence || !reasoning) throw new Error('Usage: cer-check <id> <topic> <claim> <evidence> <reasoning>');
        const c = CER_PHENOMENA_LOCAL[topic];
        if (!c) { out({ error: `Unknown CER topic: ${topic}` }); break; }
        const rubric = c.rubric;
        const scores = {};
        for (const component of ['claim', 'evidence', 'reasoning']) {
          const text = { claim, evidence, reasoning }[component].toLowerCase();
          const keywords = c.keyTerms.filter(t => text.includes(t.toLowerCase()));
          if (keywords.length >= 3) scores[component] = { score: 3, level: 'excellent', keywordsFound: keywords };
          else if (keywords.length >= 1) scores[component] = { score: 2, level: 'adequate', keywordsFound: keywords };
          else scores[component] = { score: 1, level: 'developing', keywordsFound: keywords };
        }
        const total = scores.claim.score + scores.evidence.score + scores.reasoning.score;
        out({ studentId: id, topic, scores, total, maxTotal: 9, rubric });
        break;
      }
      case 'diagram': {
        const [, id, topic] = args;
        if (!id) throw new Error('Usage: diagram <id> [topic]');
        out(api.getDiagramLocal(topic || null));
        break;
      }
      case 'diagram-check': {
        const [, id, topic, answersJson] = args;
        if (!id || !topic || !answersJson) throw new Error("Usage: diagram-check <id> <topic> <answers-json>");
        let ans;
        try { ans = JSON.parse(answersJson); } catch { throw new Error("answers-json must be valid JSON e.g. '{\"A\":\"12 ohms\"}'"); }
        const d = DIAGRAMS_LOCAL[topic];
        if (!d) { out({ error: `Unknown diagram: ${topic}` }); break; }
        let correct = 0;
        const dtotal = Object.keys(d.labels).length;
        const results = {};
        for (const [key, expected] of Object.entries(d.labels)) {
          const student = (ans[key] || '').trim().toLowerCase();
          const exp = expected.toLowerCase();
          const match = student === exp || exp.includes(student) || student.includes(exp);
          if (match) correct++;
          results[key] = { expected, studentAnswer: ans[key] || '', correct: match };
        }
        out({ studentId: id, topic, correct, total: dtotal, score: `${correct}/${dtotal}`, results });
        break;
      }
      default:
        out({ error: `Unknown command: ${cmd}`, commands: ['start','exercise','check','record','progress','review','hint','lesson','lab','cer','cer-check','diagram','diagram-check'] });
    }
  });
}
