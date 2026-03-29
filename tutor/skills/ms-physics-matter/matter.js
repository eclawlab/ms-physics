// eClaw MS Physics States of Matter Tutor.
// Middle School Physical Science (Matter & Thermal Properties) aligned.

const { dataDir, loadProfile: _lp, saveProfile: _sp, listProfiles, calcMastery, masteryLabel, shuffle, pick, runCLI, srGrade, srUpdate, srEffectiveMastery, srDueToday, MASTERY_THRESHOLD, saveSessionState, loadSessionState, fsrsUpdateStability, fsrsUpdateDifficulty, fsrsNextReview, today } = require('../_lib/core');
const { buildDiffContext } = require('../_lib/differentiation');
const { DomainSkillBase, buildCommonCLIHandlers, generateExercise: _generateExercise, checkAnswer: _checkAnswer } = require('../_lib/exercise-factory');

const DATA_DIR = dataDir('ms-physics-matter');
const loadProfile = id => _lp(DATA_DIR, id);
const saveProfile = p => _sp(DATA_DIR, p);

const SKILLS = {
  'particle-model': ['atoms-molecules', 'particle-motion', 'states-of-matter', 'phase-changes'],
  'density': ['density-concept', 'calculating-density', 'floating-sinking', 'density-applications'],
  'pressure': ['pressure-concept', 'atmospheric-pressure', 'liquid-pressure', 'gas-pressure'],
  'thermal-properties': ['expansion-contraction', 'specific-heat-capacity', 'latent-heat', 'heat-engines'],
};

// Prerequisites: topic -> [topics that must be mastered first].
const TOPIC_PREREQUISITES = {
  // particle-model (foundational)
  'atoms-molecules': [],
  'particle-motion': ['atoms-molecules'],
  'states-of-matter': ['particle-motion'],
  'phase-changes': ['states-of-matter'],
  // density
  'density-concept': ['atoms-molecules'],
  'calculating-density': ['density-concept'],
  'floating-sinking': ['calculating-density'],
  'density-applications': ['floating-sinking'],
  // pressure
  'pressure-concept': ['particle-motion'],
  'atmospheric-pressure': ['pressure-concept'],
  'liquid-pressure': ['atmospheric-pressure'],
  'gas-pressure': ['pressure-concept', 'particle-motion'],
  // thermal-properties
  'expansion-contraction': ['particle-motion'],
  'specific-heat-capacity': ['phase-changes'],
  'latent-heat': ['specific-heat-capacity'],
  'heat-engines': ['latent-heat', 'expansion-contraction'],
};

// Helper: is a topic unlocked (all prereqs mastered)?
function _matterTopicUnlocked(topic, profileSkills) {
  return (TOPIC_PREREQUISITES[topic] || []).every(r => (profileSkills[r]?.mastery || 0) >= MASTERY_THRESHOLD);
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BANKS — 6-8 questions per skill, MS Physical Science aligned
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_BANKS = {
  // ── particle-model ─────────────────────────────────────────────────────────
  'atoms-molecules': { questions: [
    { q: 'What is an atom?', a: ['smallest unit of an element', 'basic building block of matter', 'smallest particle of an element'], type: 'multi', difficulty: 1, rule: 'An atom is the smallest unit of an element that retains the properties of that element.' },
    { q: 'What is a molecule?', a: ['two or more atoms bonded together', 'group of atoms joined together', 'atoms bonded chemically'], type: 'multi', difficulty: 1, rule: 'A molecule is two or more atoms chemically bonded together.' },
    { q: 'True or false: All matter is made up of tiny particles called atoms.', a: 'true', type: 'tf', difficulty: 1, explanation: 'All matter, whether solid, liquid, or gas, is composed of atoms.' },
    { q: 'What is the chemical formula for a water molecule?', a: ['H2O', 'h2o'], type: 'multi', difficulty: 1, hint: 'Water is made of hydrogen and oxygen atoms.' },
    { q: 'How many atoms are in one molecule of carbon dioxide (CO2)?', a: '3', type: 'short', difficulty: 2, hint: '1 carbon atom + 2 oxygen atoms = 3 atoms total.' },
    { q: 'True or false: Atoms can be seen with the naked eye.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Atoms are far too small to see without extremely powerful instruments like electron microscopes.' },
    { q: 'What are the three main subatomic particles in an atom?', a: ['protons neutrons electrons', 'proton, neutron, electron', 'protons, neutrons, electrons'], type: 'multi', difficulty: 2, hint: 'Two are in the nucleus, one orbits outside.' },
    { q: 'What makes one element different from another?', a: ['number of protons', 'different number of protons', 'atomic number'], type: 'multi', difficulty: 3, concept: 'The number of protons (atomic number) determines which element an atom is.' },
  ]},
  'particle-motion': { questions: [
    { q: 'True or false: Particles in matter are always moving.', a: 'true', type: 'tf', difficulty: 1, explanation: 'All particles have kinetic energy and are in constant motion, even in solids.' },
    { q: 'In which state of matter do particles move the fastest?', a: ['gas', 'gases'], type: 'multi', difficulty: 1, rule: 'Gas particles have the most kinetic energy and move the fastest.' },
    { q: 'In which state of matter do particles vibrate in fixed positions?', a: ['solid', 'solids'], type: 'multi', difficulty: 1, hint: 'These particles are held tightly together and can only vibrate.' },
    { q: 'What happens to particle motion when temperature increases?', a: ['particles move faster', 'speed increases', 'kinetic energy increases'], type: 'multi', difficulty: 2, rule: 'Higher temperature means more kinetic energy, so particles move faster.' },
    { q: 'True or false: Particles in a liquid can slide past each other.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Liquid particles are close together but can move around and slide past each other.' },
    { q: 'What is the relationship between temperature and kinetic energy of particles?', a: ['directly proportional', 'higher temperature means more kinetic energy', 'temperature increases kinetic energy increases'], type: 'multi', difficulty: 2, concept: 'Temperature is a measure of the average kinetic energy of particles.' },
    { q: 'Why does food coloring spread faster in hot water than cold water?', a: ['particles move faster in hot water', 'more kinetic energy', 'faster diffusion'], type: 'multi', difficulty: 3, hint: 'Think about how temperature affects particle speed and therefore mixing.' },
    { q: 'At what theoretical temperature would all particle motion stop?', a: ['absolute zero', '0 kelvin', '-273 celsius'], type: 'multi', difficulty: 3, concept: 'Absolute zero (0 K or -273.15 C) is the theoretical point where particles have minimum kinetic energy.' },
  ]},
  'states-of-matter': { questions: [
    { q: 'What are the three common states of matter?', a: ['solid liquid gas', 'solid, liquid, gas', 'solids, liquids, gases'], type: 'multi', difficulty: 1, rule: 'The three common states of matter are solid, liquid, and gas.' },
    { q: 'Which state of matter has a definite shape and definite volume?', a: ['solid', 'solids'], type: 'multi', difficulty: 1, hint: 'This state holds its shape on its own.' },
    { q: 'True or false: A liquid has a definite volume but takes the shape of its container.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Liquids keep the same volume but flow to fill the shape of their container.' },
    { q: 'Which state of matter has no definite shape and no definite volume?', a: ['gas', 'gases'], type: 'multi', difficulty: 1, rule: 'Gases expand to fill any container, so they have no fixed shape or volume.' },
    { q: 'How are the particles arranged in a solid compared to a gas?', a: ['solid tightly packed gas spread out', 'closer together in solid', 'solid particles are close and orderly gas particles are far apart'], type: 'multi', difficulty: 2, hint: 'Think about the spacing and arrangement of particles in each state.' },
    { q: 'True or false: Gases can be compressed easily, but liquids and solids cannot.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Gas particles are far apart with lots of space between them, so gases are easily compressed.' },
    { q: 'What is plasma?', a: ['ionized gas', 'fourth state of matter', 'superheated gas with free electrons'], type: 'multi', difficulty: 3, concept: 'Plasma is the fourth state of matter, formed when gas particles are energized enough to strip electrons from atoms.' },
    { q: 'Name an example of plasma.', a: ['sun', 'lightning', 'neon sign', 'stars', 'fire'], type: 'multi', difficulty: 3, hint: 'Think about very hot or energized substances.' },
  ]},
  'phase-changes': { questions: [
    { q: 'What is the phase change from solid to liquid called?', a: ['melting', 'fusion'], type: 'multi', difficulty: 1, rule: 'Melting is the change from solid to liquid.' },
    { q: 'What is the phase change from liquid to gas called?', a: ['evaporation', 'vaporization', 'boiling'], type: 'multi', difficulty: 1, rule: 'Vaporization (evaporation or boiling) is the change from liquid to gas.' },
    { q: 'What is the phase change from gas to liquid called?', a: ['condensation'], type: 'multi', difficulty: 1, hint: 'Think about water droplets forming on a cold glass.' },
    { q: 'True or false: During a phase change, the temperature of a substance stays constant.', a: 'true', type: 'tf', difficulty: 2, explanation: 'During a phase change, energy goes into breaking or forming bonds between particles, not increasing temperature.' },
    { q: 'What is sublimation?', a: ['solid directly to gas', 'change from solid to gas without becoming liquid'], type: 'multi', difficulty: 2, rule: 'Sublimation is the change from solid directly to gas, skipping the liquid phase.' },
    { q: 'Give an example of sublimation.', a: ['dry ice', 'frost disappearing', 'snow sublimating'], type: 'multi', difficulty: 2, hint: 'Dry ice (solid CO2) is a common example.' },
    { q: 'What is the phase change from liquid to solid called?', a: ['freezing', 'solidification'], type: 'multi', difficulty: 1, rule: 'Freezing is the change from liquid to solid.' },
    { q: 'True or false: Melting requires energy to be added to a substance.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Melting is endothermic - energy must be added to break the bonds holding particles in a solid structure.' },
  ]},

  // ── density ────────────────────────────────────────────────────────────────
  'density-concept': { questions: [
    { q: 'What is density?', a: ['mass per unit volume', 'how much mass in a given volume', 'mass divided by volume'], type: 'multi', difficulty: 1, rule: 'Density is the amount of mass per unit volume of a substance.' },
    { q: 'What is the formula for density?', a: ['d = m/v', 'density = mass / volume', 'rho = m/v'], type: 'multi', difficulty: 1, rule: 'Density = mass / volume, or d = m/V.' },
    { q: 'What are common units for density?', a: ['g/cm3', 'kg/m3', 'grams per cubic centimeter', 'g/mL'], type: 'multi', difficulty: 1, hint: 'Mass units divided by volume units.' },
    { q: 'True or false: A bowling ball is denser than a beach ball of the same size.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The bowling ball has much more mass in the same volume, so it is denser.' },
    { q: 'If two objects have the same volume but different masses, which is denser?', a: ['the heavier one', 'the one with more mass', 'greater mass'], type: 'multi', difficulty: 2, hint: 'Density = mass/volume. Same volume, so more mass means higher density.' },
    { q: 'True or false: Density is an intensive property, meaning it does not depend on the amount of substance.', a: 'true', type: 'tf', difficulty: 2, explanation: 'A small piece of iron and a large piece have the same density (7.87 g/cm3).' },
    { q: 'The density of water is 1 g/cm3. What does this mean?', a: ['1 cm3 of water has a mass of 1 gram', 'each cubic centimeter of water weighs 1 gram'], type: 'multi', difficulty: 2, concept: 'It means every cubic centimeter (or milliliter) of water has a mass of exactly 1 gram.' },
    { q: 'Why does oil float on water?', a: ['oil is less dense', 'oil has lower density than water', 'density of oil is less than 1'], type: 'multi', difficulty: 3, hint: 'Less dense substances float on more dense substances.' },
  ]},
  'calculating-density': { questions: [
    { q: 'An object has a mass of 20 g and a volume of 5 cm3. What is its density?', a: '4', type: 'calculation', difficulty: 1, hint: 'd = m/V = 20/5 = 4 g/cm3.' },
    { q: 'A block has a mass of 150 g and a volume of 50 cm3. What is its density?', a: '3', type: 'calculation', difficulty: 1, hint: 'd = m/V = 150/50 = 3 g/cm3.' },
    { q: 'A liquid has a density of 0.8 g/mL. What is the mass of 100 mL of this liquid?', a: '80', type: 'calculation', difficulty: 2, hint: 'm = d x V = 0.8 x 100 = 80 g.' },
    { q: 'True or false: A substance with a density of 2.7 g/cm3, a mass of 54 g, has a volume of 20 cm3.', a: 'true', type: 'tf', difficulty: 2, explanation: 'V = m/d = 54/2.7 = 20 cm3.' },
    { q: 'A metal cube has sides of 2 cm and a mass of 64 g. What is its density?', a: '8', type: 'calculation', difficulty: 2, hint: 'Volume = 2 x 2 x 2 = 8 cm3. Density = 64/8 = 8 g/cm3.' },
    { q: 'An irregular rock displaces 25 mL of water and has a mass of 75 g. What is its density?', a: '3', type: 'calculation', difficulty: 2, hint: 'The displaced water volume equals the rock volume. d = 75/25 = 3 g/cm3.' },
    { q: 'A container holds 500 cm3 of a substance with density 1.5 g/cm3. What is its mass?', a: '750', type: 'calculation', difficulty: 3, hint: 'm = d x V = 1.5 x 500 = 750 g.' },
    { q: 'A gold bar has a mass of 1930 g and a density of 19.3 g/cm3. What is its volume?', a: '100', type: 'calculation', difficulty: 3, hint: 'V = m/d = 1930/19.3 = 100 cm3.' },
  ]},
  'floating-sinking': { questions: [
    { q: 'True or false: An object floats if it is less dense than the liquid it is placed in.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Objects less dense than the surrounding liquid float; denser objects sink.' },
    { q: 'The density of water is 1 g/cm3. Will an object with density 0.7 g/cm3 float or sink?', a: ['float', 'it floats'], type: 'multi', difficulty: 1, rule: '0.7 < 1.0, so the object is less dense than water and will float.' },
    { q: 'An object has a density of 2.5 g/cm3. Will it float or sink in water?', a: ['sink', 'it sinks'], type: 'multi', difficulty: 1, hint: 'Compare its density to water (1 g/cm3).' },
    { q: 'Why does a steel ship float even though steel is denser than water?', a: ['hollow shape', 'overall density is less', 'contains air', 'displaces enough water'], type: 'multi', difficulty: 2, concept: 'The ship is hollow and contains air, so its overall density (including the air inside) is less than water.' },
    { q: 'True or false: A heavy object always sinks in water.', a: 'false', type: 'tf', difficulty: 2, explanation: 'It depends on density, not just weight. A large ship is heavy but floats because its overall density is less than water.' },
    { q: 'If you dissolve salt in water, making its density 1.1 g/cm3, will an object with density 1.05 g/cm3 float or sink?', a: ['float', 'it floats'], type: 'multi', difficulty: 3, hint: '1.05 < 1.1, so the object is less dense than the salt water.' },
    { q: 'Why is it easier to float in the Dead Sea than in a swimming pool?', a: ['dead sea has higher density', 'very salty water is denser', 'more dissolved salt increases density'], type: 'multi', difficulty: 3, concept: 'The Dead Sea has extremely high salt content, making the water much denser than fresh water.' },
  ]},
  'density-applications': { questions: [
    { q: 'How can you identify an unknown metal by measuring its density?', a: ['compare to known densities', 'calculate density and match to a table', 'look up the density in a reference'], type: 'multi', difficulty: 1, hint: 'Every material has a characteristic density that can be compared to known values.' },
    { q: 'True or false: Hot air rises because it is less dense than cold air.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Heating air makes particles move faster and spread out, decreasing the density.' },
    { q: 'A hot air balloon rises because the air inside is heated. How does this relate to density?', a: ['hot air is less dense', 'heated air expands and becomes less dense', 'lower density air rises'], type: 'multi', difficulty: 2, concept: 'Heating the air inside the balloon makes it less dense than the surrounding cooler air, creating lift.' },
    { q: 'Why does ice float on liquid water?', a: ['ice is less dense than water', 'water expands when it freezes', 'ice density is 0.92'], type: 'multi', difficulty: 2, rule: 'Water is unusual: it expands when it freezes, making ice (0.92 g/cm3) less dense than liquid water (1.0 g/cm3).' },
    { q: 'True or false: Oil, water, and honey layered in a glass separate by density, with honey on the bottom.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Honey is densest (bottom), water in the middle, oil least dense (top).' },
    { q: 'A submarine controls its depth by changing its density. How does it do this?', a: ['fills or empties ballast tanks', 'takes in or releases water', 'changes amount of water in tanks'], type: 'multi', difficulty: 3, hint: 'Think about how adding or removing water changes the overall density.' },
    { q: 'An object has a mass of 300 g and a volume of 250 cm3. Will it float in water? What about in mercury (density 13.6 g/cm3)?', a: ['floats in mercury sinks in water', 'sinks in water floats in mercury'], type: 'multi', difficulty: 3, hint: 'Density = 300/250 = 1.2 g/cm3. Compare to water (1.0) and mercury (13.6).' },
  ]},

  // ── pressure ───────────────────────────────────────────────────────────────
  'pressure-concept': { questions: [
    { q: 'What is pressure?', a: ['force per unit area', 'force divided by area', 'amount of force on a surface area'], type: 'multi', difficulty: 1, rule: 'Pressure is the force applied per unit area: P = F/A.' },
    { q: 'What is the formula for pressure?', a: ['P = F/A', 'pressure = force / area', 'p=f/a'], type: 'multi', difficulty: 1, rule: 'P = F/A, where P is pressure, F is force, and A is area.' },
    { q: 'What is the SI unit of pressure?', a: ['pascal', 'Pa', 'pascals'], type: 'multi', difficulty: 1, hint: 'Named after Blaise Pascal, 1 Pa = 1 N/m2.' },
    { q: 'A force of 100 N is applied to an area of 2 m2. What is the pressure?', a: '50', type: 'calculation', difficulty: 1, hint: 'P = F/A = 100/2 = 50 Pa.' },
    { q: 'True or false: Wearing snowshoes reduces the pressure on snow because the area is larger.', a: 'true', type: 'tf', difficulty: 2, explanation: 'A larger area means the same force is spread over more surface, reducing pressure (P = F/A).' },
    { q: 'A box weighing 200 N sits on a table. Its base is 0.5 m2. What pressure does it exert?', a: '400', type: 'calculation', difficulty: 2, hint: 'P = F/A = 200/0.5 = 400 Pa.' },
    { q: 'Why do sharp knives cut better than dull ones?', a: ['smaller area more pressure', 'force concentrated on smaller area', 'sharp edge has less area'], type: 'multi', difficulty: 2, concept: 'A sharp blade has a very small contact area, so the same force produces much higher pressure.' },
    { q: 'A 600 N person stands on one foot (area 0.02 m2). What pressure do they exert? Then on two feet (area 0.04 m2)?', a: ['30000 and 15000', '30000 Pa and 15000 Pa'], type: 'multi', difficulty: 3, hint: 'One foot: 600/0.02 = 30000 Pa. Two feet: 600/0.04 = 15000 Pa.' },
  ]},
  'atmospheric-pressure': { questions: [
    { q: 'What causes atmospheric pressure?', a: ['weight of air above', 'air pushing down', 'column of air above us'], type: 'multi', difficulty: 1, rule: 'Atmospheric pressure is caused by the weight of the air in the atmosphere pressing down on the surface.' },
    { q: 'What is standard atmospheric pressure at sea level?', a: ['101325 Pa', '101.325 kPa', '1 atm', '14.7 psi'], type: 'multi', difficulty: 1, hint: 'About 101,325 Pascals or 1 atmosphere.' },
    { q: 'True or false: Atmospheric pressure decreases as you go higher in altitude.', a: 'true', type: 'tf', difficulty: 1, explanation: 'At higher altitudes, there is less air above you, so the pressure is lower.' },
    { q: 'What instrument measures atmospheric pressure?', a: ['barometer'], type: 'multi', difficulty: 2, hint: 'Named from the Greek word "baros" meaning weight.' },
    { q: 'Why do your ears pop on an airplane?', a: ['pressure changes', 'air pressure decreases at altitude', 'pressure difference inside and outside ear'], type: 'multi', difficulty: 2, concept: 'As altitude increases, outside air pressure drops, creating a difference with the pressure inside your ear.' },
    { q: 'True or false: You can crush a can by heating it, turning it upside down in cold water because the steam condenses and reduces internal pressure.', a: 'true', type: 'tf', difficulty: 3, explanation: 'When steam condenses, the pressure inside drops below atmospheric pressure, and the outside air pressure crushes the can.' },
    { q: 'On a mountaintop, water boils at a lower temperature than at sea level. Why?', a: ['lower atmospheric pressure', 'less air pressure pushes on water surface', 'reduced pressure lowers boiling point'], type: 'multi', difficulty: 3, concept: 'Lower atmospheric pressure means less force keeping water molecules in the liquid, so they escape (boil) at a lower temperature.' },
  ]},
  'liquid-pressure': { questions: [
    { q: 'True or false: Pressure in a liquid increases with depth.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The deeper you go, the more liquid is above you, exerting more weight and thus more pressure.' },
    { q: 'What three factors affect liquid pressure?', a: ['depth density gravity', 'depth, density, and gravity', 'height, density, gravitational field strength'], type: 'multi', difficulty: 1, rule: 'Liquid pressure depends on depth, the density of the liquid, and gravitational acceleration: P = rho x g x h.' },
    { q: 'What is the formula for liquid pressure?', a: ['P = rho g h', 'P = dgh', 'pressure = density x gravity x height'], type: 'multi', difficulty: 2, rule: 'P = rho x g x h, where rho is density, g is gravity (9.8 m/s2), and h is depth.' },
    { q: 'Calculate the pressure at a depth of 10 m in water (density 1000 kg/m3, g = 10 m/s2).', a: '100000', type: 'calculation', difficulty: 2, hint: 'P = rho x g x h = 1000 x 10 x 10 = 100,000 Pa.' },
    { q: 'True or false: Liquid pressure acts equally in all directions at a given depth.', a: 'true', type: 'tf', difficulty: 2, explanation: 'At any point in a liquid, pressure pushes equally in all directions (up, down, and sideways).' },
    { q: 'Why are dam walls thicker at the bottom than at the top?', a: ['more pressure at bottom', 'water pressure increases with depth', 'greater force at bottom'], type: 'multi', difficulty: 2, concept: 'Water pressure increases with depth, so the bottom of the dam faces much more force and needs to be stronger.' },
    { q: 'What is the pressure at 5 m depth in saltwater (density 1025 kg/m3, g = 10 m/s2)?', a: '51250', type: 'calculation', difficulty: 3, hint: 'P = 1025 x 10 x 5 = 51,250 Pa.' },
    { q: 'A diver is at 20 m depth in water. What is the total pressure on them including atmospheric pressure? (Use rho = 1000, g = 10, atm = 100000 Pa)', a: '300000', type: 'calculation', difficulty: 3, hint: 'Liquid P = 1000 x 10 x 20 = 200,000 Pa. Total = 200,000 + 100,000 = 300,000 Pa.' },
  ]},
  'gas-pressure': { questions: [
    { q: 'What causes gas pressure?', a: ['particles hitting container walls', 'gas molecules colliding with surfaces', 'particle collisions with walls'], type: 'multi', difficulty: 1, rule: 'Gas pressure is caused by gas particles colliding with the walls of their container.' },
    { q: 'True or false: If you heat a gas in a sealed container, the pressure increases.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Heating gives particles more kinetic energy, so they hit the walls harder and more often, increasing pressure.' },
    { q: 'What happens to gas pressure if you decrease the volume of the container (at constant temperature)?', a: ['pressure increases', 'goes up', 'increases'], type: 'multi', difficulty: 2, rule: 'Decreasing volume means particles are closer together and hit the walls more often, increasing pressure (Boyle\'s Law).' },
    { q: 'True or false: Boyle\'s Law states that pressure and volume are inversely proportional at constant temperature.', a: 'true', type: 'tf', difficulty: 2, explanation: 'P x V = constant. If volume halves, pressure doubles (at constant temperature).' },
    { q: 'A gas has a volume of 4 L at a pressure of 100 kPa. If the volume is compressed to 2 L, what is the new pressure (constant temperature)?', a: '200', type: 'calculation', difficulty: 2, hint: 'P1V1 = P2V2. 100 x 4 = P2 x 2. P2 = 200 kPa.' },
    { q: 'Why does a balloon expand when you take it from a cold room to a hot room?', a: ['gas particles move faster', 'temperature increases so pressure increases and balloon expands', 'hot air particles push harder'], type: 'multi', difficulty: 2, concept: 'Higher temperature gives gas particles more energy, they push harder on the balloon walls, causing it to expand.' },
    { q: 'A sealed syringe holds 60 mL of gas at 150 kPa. If you push the plunger to reduce the volume to 30 mL, what is the new pressure?', a: '300', type: 'calculation', difficulty: 3, hint: 'P1V1 = P2V2. 150 x 60 = P2 x 30. P2 = 300 kPa.' },
    { q: 'A tire is inflated to 200 kPa at 20 degrees C. After driving, the temperature rises to 50 degrees C. Will the pressure increase, decrease, or stay the same?', a: ['increase', 'pressure increases', 'goes up'], type: 'multi', difficulty: 3, hint: 'Higher temperature in a fixed volume means higher pressure (Gay-Lussac\'s Law).' },
  ]},

  // ── thermal-properties ─────────────────────────────────────────────────────
  'expansion-contraction': { questions: [
    { q: 'What happens to most materials when they are heated?', a: ['they expand', 'expand', 'get bigger'], type: 'multi', difficulty: 1, rule: 'Most materials expand when heated because particles move faster and take up more space.' },
    { q: 'What happens to most materials when they are cooled?', a: ['they contract', 'contract', 'get smaller', 'shrink'], type: 'multi', difficulty: 1, rule: 'Most materials contract when cooled because particles slow down and move closer together.' },
    { q: 'True or false: Gaps are left between sections of railroad tracks to allow for thermal expansion.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Without gaps, expanding metal in hot weather could buckle the tracks.' },
    { q: 'Why do power lines sag more in summer than in winter?', a: ['metal expands in heat', 'thermal expansion makes wires longer', 'wires expand and get longer'], type: 'multi', difficulty: 2, hint: 'The metal wires expand in the summer heat.' },
    { q: 'True or false: Water is unusual because it expands when it freezes.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Water expands as it freezes into ice, which is why ice floats and pipes can burst in winter.' },
    { q: 'A bimetallic strip bends when heated because the two metals expand at different rates. What is this used for?', a: ['thermometer', 'thermostat', 'temperature sensor'], type: 'multi', difficulty: 3, concept: 'Different expansion rates cause the strip to bend, which can open or close a switch in a thermostat.' },
    { q: 'Why might a glass jar lid be easier to open after running hot water over it?', a: ['metal lid expands', 'lid expands more than glass', 'thermal expansion loosens lid'], type: 'multi', difficulty: 2, hint: 'Metal expands more than glass when heated.' },
  ]},
  'specific-heat-capacity': { questions: [
    { q: 'What is specific heat capacity?', a: ['energy to raise 1 kg by 1 degree', 'energy needed to heat 1 kg by 1 C', 'heat per unit mass per degree'], type: 'multi', difficulty: 1, rule: 'Specific heat capacity is the amount of energy needed to raise the temperature of 1 kg of a substance by 1 degree Celsius.' },
    { q: 'What is the specific heat capacity of water?', a: ['4200', '4200 J/kg C', '4.2 kJ/kg C'], type: 'multi', difficulty: 1, hint: 'Water has a very high specific heat capacity of 4200 J/(kg*C).' },
    { q: 'What is the formula for calculating heat energy?', a: ['Q = mc delta T', 'Q=mcT', 'energy = mass x specific heat x temperature change'], type: 'multi', difficulty: 1, rule: 'Q = m x c x delta T, where Q is heat energy, m is mass, c is specific heat capacity, and delta T is temperature change.' },
    { q: 'How much energy is needed to heat 2 kg of water by 10 degrees C? (c = 4200 J/kg C)', a: '84000', type: 'calculation', difficulty: 2, hint: 'Q = mc(delta T) = 2 x 4200 x 10 = 84,000 J.' },
    { q: 'True or false: A substance with a high specific heat capacity heats up slowly.', a: 'true', type: 'tf', difficulty: 2, explanation: 'High specific heat means more energy is needed for the same temperature change, so it heats up and cools down slowly.' },
    { q: 'Why do coastal areas have milder climates than inland areas?', a: ['water has high specific heat', 'ocean heats and cools slowly', 'water moderates temperature'], type: 'multi', difficulty: 2, concept: 'Water\'s high specific heat means oceans absorb and release heat slowly, moderating nearby temperatures.' },
    { q: 'How much energy is needed to heat 0.5 kg of aluminum (c = 900 J/kg C) from 20 C to 70 C?', a: '22500', type: 'calculation', difficulty: 3, hint: 'Q = 0.5 x 900 x (70-20) = 0.5 x 900 x 50 = 22,500 J.' },
    { q: 'A 3 kg block of copper (c = 385 J/kg C) absorbs 11,550 J of heat. What is its temperature change?', a: '10', type: 'calculation', difficulty: 3, hint: 'delta T = Q/(mc) = 11550/(3 x 385) = 11550/1155 = 10 C.' },
  ]},
  'latent-heat': { questions: [
    { q: 'What is latent heat?', a: ['energy for phase change without temperature change', 'heat absorbed or released during phase change', 'hidden heat'], type: 'multi', difficulty: 1, rule: 'Latent heat is the energy absorbed or released during a phase change, without any change in temperature.' },
    { q: 'True or false: During melting, the temperature of the substance stays constant even though heat is being added.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The energy goes into breaking bonds between particles rather than increasing their kinetic energy.' },
    { q: 'What is latent heat of fusion?', a: ['energy to change solid to liquid', 'heat to melt a substance', 'energy for melting'], type: 'multi', difficulty: 2, rule: 'Latent heat of fusion is the energy needed to change a substance from solid to liquid at its melting point.' },
    { q: 'What is latent heat of vaporization?', a: ['energy to change liquid to gas', 'heat to boil a substance', 'energy for vaporization'], type: 'multi', difficulty: 2, rule: 'Latent heat of vaporization is the energy needed to change a substance from liquid to gas at its boiling point.' },
    { q: 'The latent heat of fusion of water is 334,000 J/kg. How much energy is needed to melt 2 kg of ice?', a: '668000', type: 'calculation', difficulty: 2, hint: 'Q = mL = 2 x 334,000 = 668,000 J.' },
    { q: 'True or false: The latent heat of vaporization is typically much larger than the latent heat of fusion for the same substance.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Vaporization requires breaking all intermolecular bonds (to go from liquid to gas), which takes much more energy than melting.' },
    { q: 'Why does steam at 100 C cause worse burns than water at 100 C?', a: ['steam releases latent heat', 'condensation releases extra energy', 'steam has more energy'], type: 'multi', difficulty: 3, concept: 'When steam condenses on skin, it releases its latent heat of vaporization (2,260,000 J/kg), delivering much more energy than liquid water at the same temperature.' },
    { q: 'How much energy is needed to vaporize 0.5 kg of water? (Lv = 2,260,000 J/kg)', a: '1130000', type: 'calculation', difficulty: 3, hint: 'Q = mL = 0.5 x 2,260,000 = 1,130,000 J.' },
  ]},
  'heat-engines': { questions: [
    { q: 'What is a heat engine?', a: ['device that converts heat to work', 'machine that turns thermal energy into mechanical energy', 'engine using heat to do work'], type: 'multi', difficulty: 1, rule: 'A heat engine is a device that converts thermal energy (heat) into mechanical work.' },
    { q: 'Name two examples of heat engines.', a: ['car engine and steam engine', 'internal combustion engine, steam turbine', 'gasoline engine, jet engine'], type: 'multi', difficulty: 1, hint: 'Think about engines that burn fuel to produce motion.' },
    { q: 'True or false: A heat engine can convert all of its input heat energy into useful work.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Some energy is always lost as waste heat. No heat engine can be 100% efficient (Second Law of Thermodynamics).' },
    { q: 'What is thermal efficiency?', a: ['ratio of useful work to heat input', 'work output divided by heat input', 'percentage of heat converted to work'], type: 'multi', difficulty: 2, rule: 'Efficiency = useful work output / total heat input x 100%.' },
    { q: 'A heat engine takes in 1000 J of heat and does 400 J of work. What is its efficiency?', a: ['40', '40%'], type: 'multi', difficulty: 2, hint: 'Efficiency = 400/1000 x 100% = 40%.' },
    { q: 'In the above engine, how much energy is lost as waste heat?', a: '600', type: 'calculation', difficulty: 2, hint: 'Waste heat = input - work = 1000 - 400 = 600 J.' },
    { q: 'True or false: A refrigerator is a heat engine running in reverse — it moves heat from cold to hot.', a: 'true', type: 'tf', difficulty: 3, explanation: 'A refrigerator uses work (electricity) to move heat from the cold interior to the warm exterior, the reverse of a heat engine.' },
    { q: 'A car engine has an efficiency of 25%. If it produces 5000 J of useful work, how much heat did the fuel provide?', a: '20000', type: 'calculation', difficulty: 3, hint: 'Heat input = work / efficiency = 5000 / 0.25 = 20,000 J.' },
  ]},
};

// ═══════════════════════════════════════════════════════════════════════════════
// HINT BANKS — 3-tier progressive hints per skill
// ═══════════════════════════════════════════════════════════════════════════════

const HINT_BANKS = {
  // particle-model
  'atoms-molecules': { tier1: 'All matter is made of tiny particles called atoms.', tier2: 'Atoms combine to form molecules. The number of protons determines the element.', tier3: 'Example: Water (H2O) is a molecule made of 2 hydrogen atoms and 1 oxygen atom.' },
  'particle-motion': { tier1: 'Particles are always moving. Temperature is a measure of their average kinetic energy.', tier2: 'Solid particles vibrate in place. Liquid particles slide around. Gas particles fly freely.', tier3: 'Example: Heating water makes its molecules move faster, which is why hot water steams.' },
  'states-of-matter': { tier1: 'Solids have fixed shape and volume. Liquids have fixed volume but take the shape of their container. Gases fill any container.', tier2: 'The differences come from how tightly particles are packed and how much they move.', tier3: 'Example: Ice (solid, fixed shape) -> water (liquid, fills bottom of glass) -> steam (gas, fills room).' },
  'phase-changes': { tier1: 'Phase changes happen when enough energy is added or removed to change how particles are arranged.', tier2: 'Melting, freezing, evaporation, condensation, sublimation, and deposition are the six phase changes.', tier3: 'Example: Ice melts at 0 C (solid to liquid). Water boils at 100 C (liquid to gas). Temperature stays constant during phase changes.' },

  // density
  'density-concept': { tier1: 'Density tells you how much mass is packed into a given volume.', tier2: 'Formula: density = mass / volume. Units: g/cm3 or kg/m3.', tier3: 'Example: Water has a density of 1 g/cm3. Lead is 11.3 g/cm3 — much denser.' },
  'calculating-density': { tier1: 'd = m/V. Rearrange to find mass (m = dV) or volume (V = m/d).', tier2: 'Make sure mass and volume are in matching units. g and cm3, or kg and m3.', tier3: 'Example: Mass = 200 g, Volume = 50 cm3. d = 200/50 = 4 g/cm3.' },
  'floating-sinking': { tier1: 'Less dense objects float. More dense objects sink.', tier2: 'Compare the object density to the liquid density. If object < liquid, it floats.', tier3: 'Example: Wood (0.6 g/cm3) floats in water (1.0 g/cm3). Iron (7.9 g/cm3) sinks.' },
  'density-applications': { tier1: 'Density helps identify materials, explains floating, and drives convection.', tier2: 'Hot air rises because it is less dense. Ice floats because solid water is less dense than liquid water.', tier3: 'Example: A hot air balloon rises because the heated air inside is less dense than the surrounding cooler air.' },

  // pressure
  'pressure-concept': { tier1: 'Pressure = Force / Area. More force or less area means more pressure.', tier2: 'Units: Pascals (Pa) = N/m2. Spreading force over a larger area reduces pressure.', tier3: 'Example: A nail has a tiny point (small area) so even a small force creates huge pressure.' },
  'atmospheric-pressure': { tier1: 'The atmosphere exerts pressure because air has weight.', tier2: 'Standard atmospheric pressure at sea level is about 101,325 Pa (1 atm).', tier3: 'Example: At high altitude, there is less air above you, so atmospheric pressure is lower. This is why water boils at a lower temperature on mountains.' },
  'liquid-pressure': { tier1: 'Liquid pressure increases with depth.', tier2: 'P = rho x g x h. Deeper = more pressure. Denser liquid = more pressure.', tier3: 'Example: At 10 m depth in water: P = 1000 x 10 x 10 = 100,000 Pa.' },
  'gas-pressure': { tier1: 'Gas pressure comes from particles hitting the container walls.', tier2: 'Heating a gas (more speed) or compressing it (less volume) increases pressure.', tier3: 'Example: Boyle\'s Law: P1V1 = P2V2. If you halve the volume, pressure doubles.' },

  // thermal-properties
  'expansion-contraction': { tier1: 'Most materials expand when heated and contract when cooled.', tier2: 'Particles move faster and take up more space when heated.', tier3: 'Example: Railroad tracks have gaps to allow for thermal expansion in hot weather.' },
  'specific-heat-capacity': { tier1: 'Specific heat capacity tells you how much energy it takes to heat something.', tier2: 'Q = mc(delta T). Water has a very high c (4200 J/kg C), so it heats slowly.', tier3: 'Example: To heat 2 kg of water by 10 C: Q = 2 x 4200 x 10 = 84,000 J.' },
  'latent-heat': { tier1: 'Latent heat is the energy needed for a phase change without a temperature change.', tier2: 'Q = mL, where L is the latent heat. Latent heat of vaporization is much larger than latent heat of fusion.', tier3: 'Example: Melting 1 kg of ice: Q = 1 x 334,000 = 334,000 J.' },
  'heat-engines': { tier1: 'A heat engine converts heat into work.', tier2: 'Efficiency = work output / heat input. No engine is 100% efficient.', tier3: 'Example: If an engine takes in 1000 J and does 250 J of work, efficiency = 25%.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISCONCEPTIONS — pattern-matched corrections per skill
// ═══════════════════════════════════════════════════════════════════════════════

const MISCONCEPTIONS = {
  'atoms-molecules': [
    { patterns: [/atom.*see|visible.*atom/i], correction: 'Atoms are far too small to see with the naked eye or even with a regular microscope. They can only be imaged with special instruments like scanning tunneling microscopes.' },
  ],
  'particle-motion': [
    { patterns: [/solid.*don.*move|still.*solid/i], correction: 'Particles in a solid DO move — they vibrate in fixed positions. They do not stop moving entirely until absolute zero (which is theoretical and never actually reached).' },
  ],
  'states-of-matter': [
    { patterns: [/gas.*heav|heavy.*gas/i], correction: 'Gases DO have mass and weight, they are just much less dense than solids and liquids. A room full of air weighs many kilograms!' },
  ],
  'phase-changes': [
    { patterns: [/temperature.*rises.*during.*melt|hotter.*while.*melting/i], correction: 'Temperature does NOT rise during a phase change. The energy goes into breaking bonds between particles, not increasing their kinetic energy. The temperature stays constant until the phase change is complete.' },
  ],
  'calculating-density': [
    { patterns: [/multiply.*mass.*volume|mass.*times.*volume/i], correction: 'Density is mass DIVIDED by volume (d = m/V), not mass times volume. Multiplying would give you an incorrect and meaningless result.' },
  ],
  'floating-sinking': [
    { patterns: [/heavy.*sink|heavier.*always.*sink/i], correction: 'Heavy objects do NOT always sink. What matters is DENSITY, not weight alone. A huge ship is very heavy but floats because its overall density (including air inside) is less than water.' },
  ],
  'pressure-concept': [
    { patterns: [/more.*force.*more.*pressure.*always/i], correction: 'More force does not ALWAYS mean more pressure. Pressure depends on BOTH force and area (P = F/A). If the area also increases, the pressure might stay the same or decrease.' },
  ],
  'gas-pressure': [
    { patterns: [/air.*no.*pressure|gas.*no.*weight/i], correction: 'Air absolutely does exert pressure! Atmospheric pressure is about 101,325 Pa at sea level. We do not feel it because we are adapted to it, but it is always there.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENA — driving questions for phenomenon-based learning
// ═══════════════════════════════════════════════════════════════════════════════

const PHENOMENA = {
  'particle-model': [
    { title: 'The Disappearing Puddle', focus: 'evaporation, particle motion', text: 'After a rainstorm, puddles form on the sidewalk. On a warm sunny day, the puddles disappear within an hour. On a cool cloudy day, they last much longer.', drivingQuestion: 'Where does the water go? Why do puddles disappear faster on warm days? What happens to the water particles?' },
  ],
  'density': [
    { title: 'The Layered Drink', focus: 'density, floating, sinking', text: 'At a science fair, a student creates a "density column" with honey on the bottom, then water, then vegetable oil, then rubbing alcohol on top. They drop in a grape, a cork, and a plastic bead.', drivingQuestion: 'Why do the liquids stay in layers? What determines where each object ends up? Could you predict where a new object would float based on its density?' },
  ],
  'pressure': [
    { title: 'The Crushed Can', focus: 'atmospheric pressure, gas behavior', text: 'A teacher heats a small amount of water in an aluminum can until it steams. Then they quickly flip the can upside down into cold water. The can instantly crushes with a loud pop.', drivingQuestion: 'Why did the can crush? What happened to the steam inside? What force crushed the can? Would this work on a thicker can?' },
    { title: 'Deep Sea Exploration', focus: 'liquid pressure, depth', text: 'Submarines and deep-sea vehicles need incredibly strong hulls. At the bottom of the Mariana Trench (11,000 m deep), the pressure is over 1,000 times atmospheric pressure.', drivingQuestion: 'Calculate the water pressure at 11,000 m depth. Why does pressure increase with depth? How must submarines be designed to withstand this?' },
  ],
  'thermal-properties': [
    { title: 'Why Is the Sand Hot but the Water Cold?', focus: 'specific heat capacity', text: 'At the beach on a sunny day, the sand is burning hot under your feet, but the ocean water is still cold.', drivingQuestion: 'Both the sand and water receive the same amount of sunlight. Why is the sand so much hotter? What property of water explains this? How does this affect coastal weather?' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL LABS
// ═══════════════════════════════════════════════════════════════════════════════

const VIRTUAL_LABS = {
  'density-lab': {
    title: 'Virtual Density Measurement Lab',
    skills: ['density-concept', 'calculating-density', 'floating-sinking'],
    objective: 'Measure the density of various objects and predict whether they float or sink',
    background: 'Density is the ratio of mass to volume (d = m/V). Objects with density less than 1 g/cm3 float in water.',
    hypothesis_prompt: 'Predict: Will an object with a mass of 50 g and volume of 60 cm3 float or sink in water?',
    variables: { independent: 'object material', dependent: 'density, floating/sinking', controlled: ['liquid (water, density 1.0 g/cm3)', 'temperature (room temp)'] },
    procedure: [
      { step: 1, action: 'Measure the mass of a wooden block on a balance: 30 g. Measure its volume by length x width x height: 5 cm x 3 cm x 4 cm.' },
      { step: 2, action: 'Calculate the density of the wooden block.' },
      { step: 3, action: 'Measure an aluminum cube: mass = 27 g, side = 1 cm x 1 cm x 10 cm.' },
      { step: 4, action: 'Calculate the density of the aluminum.' },
      { step: 5, action: 'An irregular rock has mass 150 g. Place it in water and it displaces 50 mL. Calculate density.' },
      { step: 6, action: 'Predict which objects float and which sink. Test your predictions.' },
    ],
    observations: {
      'wooden-block': 'Mass: 30 g. Volume: 5 x 3 x 4 = 60 cm3. Density: 30/60 = 0.5 g/cm3. FLOATS.',
      'aluminum': 'Mass: 27 g. Volume: 1 x 1 x 10 = 10 cm3. Density: 27/10 = 2.7 g/cm3. SINKS.',
      'rock': 'Mass: 150 g. Volume: 50 cm3 (displaced water). Density: 150/50 = 3.0 g/cm3. SINKS.',
    },
    data_table: {
      columns: ['Object', 'Mass (g)', 'Volume (cm3)', 'Density (g/cm3)', 'Float/Sink'],
      rows: [
        ['Wooden block', '30', '60', '0.5', 'Float'],
        ['Aluminum', '27', '10', '2.7', 'Sink'],
        ['Rock', '150', '50', '3.0', 'Sink'],
      ],
    },
    conclusion_questions: [
      'Which object had the highest density? Which had the lowest?',
      'What density value separates objects that float from those that sink in water?',
      'Why did we use water displacement to measure the rock volume?',
      'If you cut the wooden block in half, would its density change? Why or why not?',
      'Could you make the aluminum float? How? (Hint: think about shape.)',
    ],
  },
  'pressure-lab': {
    title: 'Virtual Pressure Investigation Lab',
    skills: ['pressure-concept', 'liquid-pressure'],
    objective: 'Investigate how force, area, and depth affect pressure',
    background: 'Pressure equals force divided by area (P = F/A). In liquids, pressure increases with depth (P = rho x g x h).',
    hypothesis_prompt: 'Predict: If you push on a table with the same force using your palm vs. your fingertip, which creates more pressure?',
    variables: { independent: 'area (Part 1), depth (Part 2)', dependent: 'pressure', controlled: ['force (Part 1)', 'liquid density (Part 2)'] },
    procedure: [
      { step: 1, action: 'Part 1: Apply 100 N of force to an area of 1 m2. Calculate the pressure.' },
      { step: 2, action: 'Apply the same 100 N to an area of 0.1 m2. Calculate the pressure.' },
      { step: 3, action: 'Apply 100 N to an area of 0.01 m2. Calculate the pressure.' },
      { step: 4, action: 'Part 2: Calculate liquid pressure at depths of 1 m, 5 m, and 10 m in water (density 1000 kg/m3, g = 10 m/s2).' },
      { step: 5, action: 'Plot depth vs. pressure. What does the graph look like?' },
    ],
    observations: {
      'force-1m2': 'P = 100/1 = 100 Pa. Gentle pressure, like resting your hand on a desk.',
      'force-0.1m2': 'P = 100/0.1 = 1000 Pa. 10x more pressure with 10x less area.',
      'force-0.01m2': 'P = 100/0.01 = 10,000 Pa. 100x more pressure — like pressing with a fingertip.',
      'depth-1m': 'P = 1000 x 10 x 1 = 10,000 Pa.',
      'depth-5m': 'P = 1000 x 10 x 5 = 50,000 Pa.',
      'depth-10m': 'P = 1000 x 10 x 10 = 100,000 Pa (about 1 atm of water pressure).',
    },
    data_table: {
      columns: ['Trial', 'Force (N) / Depth (m)', 'Area (m2) / Density', 'Pressure (Pa)'],
      rows: [
        ['1', 'F = 100 N', 'A = 1 m2', '100'],
        ['2', 'F = 100 N', 'A = 0.1 m2', '1,000'],
        ['3', 'F = 100 N', 'A = 0.01 m2', '10,000'],
        ['4', 'h = 1 m', 'rho = 1000 kg/m3', '10,000'],
        ['5', 'h = 5 m', 'rho = 1000 kg/m3', '50,000'],
        ['6', 'h = 10 m', 'rho = 1000 kg/m3', '100,000'],
      ],
    },
    conclusion_questions: [
      'What happens to pressure when you decrease the area but keep force the same?',
      'Why is the relationship between area and pressure called inversely proportional?',
      'Is the relationship between depth and liquid pressure linear? How do you know?',
      'At what depth in water does the liquid pressure equal atmospheric pressure?',
      'How does this explain why deep-sea creatures have special adaptations?',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAMS — ASCII diagrams for key concepts
// ═══════════════════════════════════════════════════════════════════════════════

const DIAGRAMS_LOCAL = {
  'particle-states': {
    domain: 'ms-physics-matter',
    skill: 'states-of-matter',
    topic: 'Particle Arrangement in States of Matter',
    description: 'Diagram showing particle arrangement in solid, liquid, and gas states.',
    diagram: `
    SOLID              LIQUID             GAS
  +----------+     +----------+     +----------+
  | o o o o  |     |  o o  o  |     |  o       |
  | o o o o  |     | o  o o   |     |      o   |
  | o o o o  |     |  o  o  o |     |   o      |
  | o o o o  |     | o o  o   |     |        o |
  +----------+     +----------+     +----------+
   Particles:       Particles:       Particles:
   [A] ___          [B] ___          [C] ___

  [A] Describe solid particle arrangement: ___
  [B] Describe liquid particle arrangement: ___
  [C] Describe gas particle arrangement: ___
`,
    labels: { 'Solid arrangement': 'tightly packed in fixed positions', 'Liquid arrangement': 'close together but can slide past each other', 'Gas arrangement': 'far apart and move freely' },
  },
  'density-triangle': {
    domain: 'ms-physics-matter',
    skill: 'calculating-density',
    topic: 'Density Formula Triangle',
    description: 'The density triangle for remembering d = m/V.',
    diagram: `
         /\\
        / m \\
       /-----\\
      / d | V \\
     /----+----\\

  Cover the variable you want to find:
  Cover m -> d x V  (multiply density and volume)
  Cover d -> m / V  (divide mass by volume)
  Cover V -> m / d  (divide mass by density)

  Practice: m = 240 g, V = 80 cm3. d = ___
`,
    labels: { 'd': '3 g/cm3' },
  },
  'pressure-formula': {
    domain: 'ms-physics-matter',
    skill: 'pressure-concept',
    topic: 'Pressure Formula',
    description: 'The pressure formula triangle and a diagram showing pressure depends on area.',
    diagram: `
         /\\
        / F \\
       /-----\\
      / P | A \\
     /----+----\\

  P = F / A     F = P x A     A = F / P

  Same force, different areas:
  +-------+      +--+
  |       |  vs  |  |
  |  F=50N|      |F=50N
  | A=10m2|      |A=1m2
  +-------+      +--+
   P = [A]       P = [B]
`,
    labels: { 'A': '5 Pa', 'B': '50 Pa' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CER PHENOMENA — Claim-Evidence-Reasoning prompts
// ═══════════════════════════════════════════════════════════════════════════════

const CER_PHENOMENA_LOCAL = {
  'ice-floats': {
    domain: 'ms-physics-matter',
    title: 'Why Does Ice Float?',
    phenomenon: 'Most substances are denser as solids than as liquids. But ice floats on water! This unusual property has huge consequences for life on Earth.',
    scaffold: {
      claim: 'Make a claim about why ice floats on liquid water.',
      evidence: 'Compare the density of ice (0.92 g/cm3) to liquid water (1.0 g/cm3). What happens to water molecules when they freeze?',
      reasoning: 'Explain why this property is important for aquatic life in winter. What would happen if ice sank instead?',
    },
    keyTerms: ['density', 'ice', 'float', 'less dense', 'expand', 'freeze', 'water', 'molecules', 'insulate'],
    rubric: {
      claim: { excellent: 'Clearly states ice is less dense than water due to molecular structure expanding upon freezing', adequate: 'States ice is less dense', developing: 'Unclear claim' },
      evidence: { excellent: 'Cites specific densities and describes how water expands as it freezes into a crystal structure', adequate: 'Mentions density difference', developing: 'No specific evidence' },
      reasoning: { excellent: 'Explains that floating ice insulates water below, keeping it liquid for aquatic life, and that sinking ice would freeze lakes from bottom up', adequate: 'Mentions it helps fish', developing: 'Incomplete reasoning' },
    },
  },
  'beach-temperature': {
    domain: 'ms-physics-matter',
    title: 'Hot Sand, Cold Water',
    phenomenon: 'At the beach on a sunny summer afternoon, the sand is too hot to walk on barefoot, but the ocean water feels cool and refreshing. Both have been in the same sun all day.',
    scaffold: {
      claim: 'Make a claim about why sand and water heat up at different rates.',
      evidence: 'The specific heat capacity of sand is about 830 J/(kg C) and water is about 4200 J/(kg C). What do these numbers mean?',
      reasoning: 'Explain how specific heat capacity determines how much a substance heats up for the same amount of energy input.',
    },
    keyTerms: ['specific heat', 'capacity', 'energy', 'temperature', 'sand', 'water', 'heat', 'absorb'],
    rubric: {
      claim: { excellent: 'States water has a much higher specific heat capacity, so it heats up more slowly', adequate: 'Says water heats slower', developing: 'Unclear claim' },
      evidence: { excellent: 'Compares the two specific heat values and calculates or explains the ~5x difference', adequate: 'Cites one value', developing: 'No specific values' },
      reasoning: { excellent: 'Explains that higher specific heat means more energy is needed per degree of temperature rise, so water absorbs more energy without getting as hot', adequate: 'Mentions more energy needed', developing: 'Incomplete reasoning' },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY — key terms per category
// ═══════════════════════════════════════════════════════════════════════════════

const VOCABULARY = {
  'particle-model': [
    { term: 'atom', definition: 'The smallest unit of an element that retains its chemical properties.' },
    { term: 'molecule', definition: 'Two or more atoms chemically bonded together.' },
    { term: 'kinetic energy', definition: 'Energy of motion. All particles have kinetic energy.' },
    { term: 'state of matter', definition: 'The physical form of a substance: solid, liquid, gas, or plasma.' },
    { term: 'phase change', definition: 'A change from one state of matter to another, such as melting or boiling.' },
    { term: 'sublimation', definition: 'The change from solid directly to gas without passing through the liquid state.' },
  ],
  'density': [
    { term: 'density', definition: 'The mass per unit volume of a substance: d = m/V. Units: g/cm3 or kg/m3.' },
    { term: 'mass', definition: 'The amount of matter in an object, measured in grams or kilograms.' },
    { term: 'volume', definition: 'The amount of space an object takes up, measured in cm3, mL, or m3.' },
    { term: 'buoyancy', definition: 'The upward force exerted by a fluid on a submerged or floating object.' },
    { term: 'displacement', definition: 'The volume of fluid pushed aside by an object, used to measure irregular volumes.' },
  ],
  'pressure': [
    { term: 'pressure', definition: 'Force applied per unit area: P = F/A. Measured in Pascals (Pa).' },
    { term: 'pascal', definition: 'The SI unit of pressure. 1 Pa = 1 N/m2.' },
    { term: 'atmospheric pressure', definition: 'The pressure exerted by the weight of air in the atmosphere. About 101,325 Pa at sea level.' },
    { term: 'barometer', definition: 'An instrument used to measure atmospheric pressure.' },
    { term: 'Boyle\'s Law', definition: 'At constant temperature, the pressure and volume of a gas are inversely proportional: P1V1 = P2V2.' },
  ],
  'thermal-properties': [
    { term: 'thermal expansion', definition: 'The tendency of matter to increase in volume when heated.' },
    { term: 'specific heat capacity', definition: 'The energy needed to raise the temperature of 1 kg of a substance by 1 degree C.' },
    { term: 'latent heat', definition: 'The energy absorbed or released during a phase change without temperature change.' },
    { term: 'heat engine', definition: 'A device that converts thermal energy into mechanical work.' },
    { term: 'efficiency', definition: 'The ratio of useful work output to total energy input, expressed as a percentage.' },
    { term: 'conduction', definition: 'The transfer of heat through direct contact between particles.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIOS — real-world application scenarios for lessons
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = [
  { title: 'The Sinking Ice Cube Mystery', focus: 'density, states of matter', text: 'You put an ice cube in a glass of water and it floats. Then you put an ice cube in a glass of rubbing alcohol (density 0.79 g/cm3) and it sinks to the bottom. Ice has a density of 0.92 g/cm3. Why does the ice cube float in one liquid but sink in the other?' },
  { title: 'Cooking at High Altitude', focus: 'pressure, boiling point, phase changes', text: 'A recipe says to boil pasta for 10 minutes. You are camping at 3000 m elevation where atmospheric pressure is lower. The water boils at 90 C instead of 100 C. Will the pasta cook in the same time? What adjustments should you make?' },
  { title: 'Designing a Thermos', focus: 'specific heat, insulation, energy transfer', text: 'You want to keep a drink hot for 6 hours. You have 500 mL of coffee at 80 C. Water has a specific heat capacity of 4200 J/kg C. How much energy would the coffee lose if it cooled to 40 C? What features of a thermos help prevent this heat loss?' },
  { title: 'The Egg Drop Challenge', focus: 'pressure, force, area', text: 'You must drop an egg from 3 m height without it breaking. The shell breaks when pressure exceeds 2 MPa. The egg weighs 0.6 N. Design a landing pad and calculate what area is needed to keep the pressure below the breaking point during impact.' },
  { title: 'Weather Balloon Investigation', focus: 'gas pressure, Boyle\'s Law, atmosphere', text: 'A weather balloon is launched with a volume of 1.5 m3 at ground level (100 kPa). At 10,000 m altitude, the pressure drops to 25 kPa. Assuming constant temperature, what will the balloon volume be? At what point might the balloon pop?' },
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

class MSPhysicsMatter extends DomainSkillBase {
  constructor() {
    super('ms-physics-matter', 'ms-physics-matter', DATA_DIR, loadProfile, saveProfile, HINT_BANKS);
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
        if (m < MASTERY_THRESHOLD && _matterTopicUnlocked(sk, p.skills)) {
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
        const isUnlocked = _matterTopicUnlocked(sk, p.skills);
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
    if (!target) return { message: 'All states of matter skills are proficient!', congratulations: true };
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
        apply: scenario ? `Analyze scenario: "${scenario.title}"` : 'Connect to real-world matter and energy applications',
        extend: `Connect ${target.skill} to related matter concepts`,
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
    if (!name) return { labs: Object.keys(VIRTUAL_LABS), instructions: 'node matter.js lab <id> <lab-name> [obs-key]' };
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
      message: due.length === 0 ? 'No matter skills due for review today!' : `${due.length} skill(s) need review. Work through each exercise below.`,
    };
  }
}

module.exports = MSPhysicsMatter;

// ═══════════════════════════════════════════════════════════════════════════════
// CLI: node matter.js <command> [args]
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const api = new MSPhysicsMatter();
  const common = buildCommonCLIHandlers(api, DATA_DIR, 'ms-physics-matter', loadProfile, saveProfile);
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
        try { ans = JSON.parse(answersJson); } catch { throw new Error("answers-json must be valid JSON e.g. '{\"d\":\"3 g/cm3\"}'"); }
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
