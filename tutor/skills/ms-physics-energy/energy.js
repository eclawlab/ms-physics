// eClaw MS Physics Energy & Work Tutor (6-8).
// NGSS MS-PS3 (Energy) aligned.

const { dataDir, loadProfile: _lp, saveProfile: _sp, listProfiles, calcMastery, masteryLabel, shuffle, pick, runCLI, srGrade, srUpdate, srEffectiveMastery, srDueToday, MASTERY_THRESHOLD, saveSessionState, loadSessionState, fsrsUpdateStability, fsrsUpdateDifficulty, fsrsNextReview, today } = require('../_lib/core');
const { buildDiffContext } = require('../_lib/differentiation');
const { DomainSkillBase, buildCommonCLIHandlers, generateExercise: _generateExercise, checkAnswer: _checkAnswer } = require('../_lib/exercise-factory');

const DATA_DIR = dataDir('ms-physics-energy');
const loadProfile = id => _lp(DATA_DIR, id);
const saveProfile = p => _sp(DATA_DIR, p);

const SKILLS = {
  'energy-types': ['kinetic-energy', 'potential-energy', 'thermal-energy', 'energy-forms'],
  'work-power': ['work-definition', 'calculating-work', 'power-definition', 'calculating-power'],
  'energy-conservation': ['energy-transfer', 'energy-transformation', 'conservation-law', 'efficiency'],
  'heat-transfer': ['conduction', 'convection', 'radiation', 'specific-heat'],
  'simple-machines': ['lever', 'pulley', 'inclined-plane', 'mechanical-advantage'],
};

// Prerequisites: topic -> [topics that must be mastered first].
const TOPIC_PREREQUISITES = {
  // energy-types (foundational)
  'kinetic-energy': [],
  'potential-energy': ['kinetic-energy'],
  'thermal-energy': ['kinetic-energy'],
  'energy-forms': ['kinetic-energy', 'potential-energy', 'thermal-energy'],
  // work-power
  'work-definition': ['energy-forms'],
  'calculating-work': ['work-definition'],
  'power-definition': ['calculating-work'],
  'calculating-power': ['power-definition'],
  // energy-conservation
  'energy-transfer': ['energy-forms'],
  'energy-transformation': ['energy-transfer'],
  'conservation-law': ['energy-transformation'],
  'efficiency': ['conservation-law', 'calculating-work'],
  // heat-transfer
  'conduction': ['thermal-energy'],
  'convection': ['conduction'],
  'radiation': ['conduction'],
  'specific-heat': ['thermal-energy', 'calculating-work'],
  // simple-machines
  'lever': ['work-definition'],
  'pulley': ['lever'],
  'inclined-plane': ['lever'],
  'mechanical-advantage': ['lever', 'calculating-work'],
};

// Helper: is a topic unlocked (all prereqs mastered)?
function _energyTopicUnlocked(topic, profileSkills) {
  return (TOPIC_PREREQUISITES[topic] || []).every(r => (profileSkills[r]?.mastery || 0) >= MASTERY_THRESHOLD);
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BANKS — 6-8 questions per skill, NGSS MS-PS3 aligned
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_BANKS = {
  // ── energy-types ──────────────────────────────────────────────────────────
  'kinetic-energy': { questions: [
    { q: 'What is kinetic energy?', a: 'the energy of motion', type: 'short', difficulty: 1, rule: 'Kinetic energy is the energy an object has because it is moving.' },
    { q: 'A 2 kg ball is rolling at 3 m/s. What is its kinetic energy? (KE = ½mv²)', a: '9', type: 'calculation', difficulty: 2, hint: 'KE = ½ × 2 × 3² = ½ × 2 × 9 = 9 J.' },
    { q: 'True or false: A parked car has kinetic energy.', a: 'false', type: 'tf', difficulty: 1, explanation: 'A parked car is not moving, so it has zero kinetic energy.' },
    { q: 'Which has more kinetic energy: a 1 kg ball moving at 4 m/s or a 2 kg ball moving at 2 m/s?', a: '1 kg ball at 4 m/s', type: 'short', difficulty: 2, hint: 'KE₁ = ½(1)(16) = 8 J; KE₂ = ½(2)(4) = 4 J. Speed matters more because it is squared.' },
    { q: 'A 5 kg object moves at 6 m/s. Calculate its kinetic energy. (KE = ½mv²)', a: '90', type: 'calculation', difficulty: 2, hint: 'KE = ½ × 5 × 36 = 90 J.' },
    { q: 'If you double the speed of an object, what happens to its kinetic energy?', a: ['it quadruples', 'quadruples', 'increases by 4 times', 'multiplied by 4'], type: 'multi', difficulty: 3, rule: 'Since KE = ½mv², doubling v means KE increases by 2² = 4 times.' },
    { q: 'What are the SI units for kinetic energy?', a: ['joules', 'J'], type: 'multi', difficulty: 1, rule: 'Energy is measured in joules (J).' },
    { q: 'A 0.5 kg baseball is thrown at 10 m/s. What is its kinetic energy?', a: '25', type: 'calculation', difficulty: 2, hint: 'KE = ½ × 0.5 × 100 = 25 J.' },
  ]},
  'potential-energy': { questions: [
    { q: 'What is gravitational potential energy?', a: 'stored energy due to height above the ground', type: 'short', difficulty: 1, rule: 'Gravitational PE depends on mass, gravity, and height: PE = mgh.' },
    { q: 'A 3 kg book is on a shelf 2 m high. What is its gravitational PE? (PE = mgh, g = 10 m/s²)', a: '60', type: 'calculation', difficulty: 2, hint: 'PE = 3 × 10 × 2 = 60 J.' },
    { q: 'True or false: A stretched rubber band has potential energy.', a: 'true', type: 'tf', difficulty: 1, explanation: 'A stretched rubber band stores elastic potential energy.' },
    { q: 'A 10 kg rock sits at the top of a 5 m cliff. What is its PE? (g = 10 m/s²)', a: '500', type: 'calculation', difficulty: 2, hint: 'PE = 10 × 10 × 5 = 500 J.' },
    { q: 'What happens to gravitational PE as an object is lifted higher?', a: ['it increases', 'increases'], type: 'multi', difficulty: 1, rule: 'The higher the object, the greater its gravitational potential energy.' },
    { q: 'Name two types of potential energy.', a: ['gravitational and elastic', 'gravitational, elastic'], type: 'multi', difficulty: 2, hint: 'Think about energy stored due to position or shape.' },
    { q: 'A 4 kg cat jumps to a ledge 1.5 m high. What PE does it gain? (g = 10 m/s²)', a: '60', type: 'calculation', difficulty: 2, hint: 'PE = 4 × 10 × 1.5 = 60 J.' },
    { q: 'At what point does a roller coaster car have the MOST gravitational PE?', a: ['at the top', 'the highest point', 'top of the hill'], type: 'multi', difficulty: 1, concept: 'Maximum height means maximum gravitational PE.' },
  ]},
  'thermal-energy': { questions: [
    { q: 'What is thermal energy?', a: 'the total kinetic energy of particles in a substance', type: 'short', difficulty: 1, rule: 'Thermal energy is the total energy of all the moving particles in a material.' },
    { q: 'True or false: Temperature and thermal energy are the same thing.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Temperature is the average kinetic energy of particles; thermal energy is the total KE of all particles.' },
    { q: 'If you heat a pot of water, what happens to the motion of the water molecules?', a: ['they move faster', 'move faster', 'speed up'], type: 'multi', difficulty: 1, rule: 'Adding thermal energy increases the speed of particles.' },
    { q: 'Which has more thermal energy: a cup of hot water at 80°C or a bathtub of warm water at 40°C?', a: ['the bathtub', 'bathtub'], type: 'multi', difficulty: 2, hint: 'The bathtub has many more particles, so its total thermal energy is greater even though each particle has less KE.' },
    { q: 'What happens to thermal energy when ice melts?', a: ['it increases', 'increases', 'thermal energy is absorbed'], type: 'multi', difficulty: 2, rule: 'Ice absorbs thermal energy from the surroundings to melt.' },
    { q: 'True or false: Even cold objects have thermal energy.', a: 'true', type: 'tf', difficulty: 2, explanation: 'All matter above absolute zero has particles in motion, so all objects have some thermal energy.' },
    { q: 'When you rub your hands together, what energy transformation produces warmth?', a: ['kinetic to thermal', 'mechanical to thermal'], type: 'multi', difficulty: 2, concept: 'Friction converts kinetic (mechanical) energy into thermal energy.' },
    { q: 'What instrument measures temperature?', a: ['thermometer'], type: 'multi', difficulty: 1 },
  ]},
  'energy-forms': { questions: [
    { q: 'Name four forms of energy.', a: ['kinetic, potential, thermal, chemical', 'kinetic potential thermal chemical'], type: 'multi', difficulty: 1, hint: 'Think about motion, position, heat, and food/fuel.' },
    { q: 'What form of energy is stored in food and batteries?', a: ['chemical energy', 'chemical'], type: 'multi', difficulty: 1, rule: 'Chemical energy is stored in the bonds between atoms.' },
    { q: 'True or false: Light is a form of energy.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Light (radiant energy) is electromagnetic energy that can travel through space.' },
    { q: 'What form of energy does a moving car have?', a: ['kinetic energy', 'kinetic'], type: 'multi', difficulty: 1 },
    { q: 'A guitar string vibrates and produces sound. What type of energy is sound?', a: ['mechanical energy', 'sound energy', 'mechanical'], type: 'multi', difficulty: 2, rule: 'Sound is mechanical energy carried by vibrations through a medium.' },
    { q: 'What form of energy is stored in a compressed spring?', a: ['elastic potential energy', 'elastic PE', 'potential energy'], type: 'multi', difficulty: 2 },
    { q: 'Which form of energy does the Sun mainly send to Earth?', a: ['radiant energy', 'light energy', 'electromagnetic energy', 'radiant'], type: 'multi', difficulty: 2, rule: 'The Sun radiates electromagnetic energy (light and heat) across space.' },
    { q: 'A flashlight converts chemical energy from batteries into what two forms?', a: ['light and thermal', 'light and heat'], type: 'multi', difficulty: 2, hint: 'The bulb glows (light) and gets warm (heat).' },
  ]},

  // ── work-power ────────────────────────────────────────────────────────────
  'work-definition': { questions: [
    { q: 'In physics, what is work?', a: 'using a force to move an object a distance', type: 'short', difficulty: 1, rule: 'Work is done when a force causes an object to move in the direction of the force.' },
    { q: 'True or false: Holding a heavy box without moving it is doing work in physics.', a: 'false', type: 'tf', difficulty: 1, explanation: 'No work is done if the object does not move, even if a force is applied.' },
    { q: 'What are the two requirements for work to be done?', a: ['force and movement in the direction of the force', 'force and distance'], type: 'multi', difficulty: 1, rule: 'Work requires (1) a force and (2) movement in the direction of the force.' },
    { q: 'A student pushes a desk 3 m across the floor. Is work done?', a: 'yes', type: 'short', difficulty: 1, hint: 'A force was applied and the desk moved in the direction of the force.' },
    { q: 'True or false: A waiter carrying a tray horizontally across a room does work on the tray.', a: 'false', type: 'tf', difficulty: 2, explanation: 'The force (upward) is perpendicular to the motion (horizontal), so no work is done on the tray in physics.' },
    { q: 'What is the formula for work?', a: ['W = F x d', 'W = Fd', 'work = force times distance'], type: 'multi', difficulty: 1, rule: 'Work (W) = Force (F) x Distance (d).' },
    { q: 'What are the SI units for work?', a: ['joules', 'J'], type: 'multi', difficulty: 1, rule: 'Work is measured in joules (J). 1 J = 1 N × 1 m.' },
    { q: 'If you push a wall as hard as you can but it does not move, how much work have you done?', a: ['0', 'zero', '0 J', 'zero joules'], type: 'multi', difficulty: 2, concept: 'No displacement means no work, regardless of force.' },
  ]},
  'calculating-work': { questions: [
    { q: 'A force of 10 N pushes a box 5 m. How much work is done? (W = F × d)', a: '50', type: 'calculation', difficulty: 1, hint: 'W = 10 × 5 = 50 J.' },
    { q: 'You lift a 20 N book 1.5 m. How much work do you do?', a: '30', type: 'calculation', difficulty: 1, hint: 'W = 20 × 1.5 = 30 J.' },
    { q: 'A mover pushes a crate with 50 N of force for 8 m. Calculate the work done.', a: '400', type: 'calculation', difficulty: 2, hint: 'W = 50 × 8 = 400 J.' },
    { q: 'True or false: If you apply 100 N of force and do 500 J of work, you moved the object 5 m.', a: 'true', type: 'tf', difficulty: 2, explanation: 'W = F × d → 500 = 100 × d → d = 5 m.' },
    { q: 'A crane lifts a 200 N load 15 m. How much work does the crane do?', a: '3000', type: 'calculation', difficulty: 2, hint: 'W = 200 × 15 = 3,000 J.' },
    { q: 'How much force is needed to do 120 J of work over 6 m?', a: '20', type: 'calculation', difficulty: 2, hint: 'F = W / d = 120 / 6 = 20 N.' },
    { q: 'You push a lawnmower with 40 N of force across a 25 m yard. How much work is done?', a: '1000', type: 'calculation', difficulty: 3, hint: 'W = 40 × 25 = 1,000 J.' },
    { q: 'A weightlifter lifts 800 N a distance of 2 m. What work is done?', a: '1600', type: 'calculation', difficulty: 2, hint: 'W = 800 × 2 = 1,600 J.' },
  ]},
  'power-definition': { questions: [
    { q: 'What is power in physics?', a: 'the rate at which work is done', type: 'short', difficulty: 1, rule: 'Power measures how quickly work is done or energy is transferred.' },
    { q: 'What is the formula for power?', a: ['P = W / t', 'P = W/t', 'power = work / time'], type: 'multi', difficulty: 1, rule: 'Power (P) = Work (W) / Time (t).' },
    { q: 'What are the SI units for power?', a: ['watts', 'W', 'watt'], type: 'multi', difficulty: 1, rule: 'Power is measured in watts (W). 1 watt = 1 joule per second.' },
    { q: 'True or false: A person who does the same work in less time uses more power.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Power = Work / Time. Less time with the same work means more power.' },
    { q: 'What is 1 watt equal to?', a: ['1 joule per second', '1 J/s'], type: 'multi', difficulty: 2, rule: '1 W = 1 J/s.' },
    { q: 'Two students carry identical boxes up the stairs. Student A takes 10 s and Student B takes 20 s. Who has more power?', a: ['Student A', 'A'], type: 'multi', difficulty: 2, hint: 'Same work but Student A did it in less time, so more power.' },
    { q: 'True or false: A 100 W light bulb uses more energy per second than a 60 W light bulb.', a: 'true', type: 'tf', difficulty: 2, explanation: '100 W means 100 joules per second vs. 60 joules per second.' },
    { q: 'What is the common unit of power used for car engines?', a: ['horsepower', 'hp'], type: 'multi', difficulty: 2, concept: '1 horsepower is about 746 watts.' },
  ]},
  'calculating-power': { questions: [
    { q: 'A machine does 600 J of work in 30 seconds. What is its power? (P = W/t)', a: '20', type: 'calculation', difficulty: 1, hint: 'P = 600 / 30 = 20 W.' },
    { q: 'You do 200 J of work in 10 seconds. What is your power output?', a: '20', type: 'calculation', difficulty: 1, hint: 'P = 200 / 10 = 20 W.' },
    { q: 'A motor does 5000 J of work in 25 seconds. Calculate its power.', a: '200', type: 'calculation', difficulty: 2, hint: 'P = 5000 / 25 = 200 W.' },
    { q: 'True or false: A motor with 500 W of power does 1500 J of work in 3 seconds.', a: 'true', type: 'tf', difficulty: 2, explanation: 'P = W/t → 500 = 1500/3. This checks out.' },
    { q: 'An elevator does 10,000 J of work in 20 seconds. What is its power?', a: '500', type: 'calculation', difficulty: 2, hint: 'P = 10,000 / 20 = 500 W.' },
    { q: 'A 100 W motor runs for 60 seconds. How much work does it do?', a: '6000', type: 'calculation', difficulty: 2, hint: 'W = P × t = 100 × 60 = 6,000 J.' },
    { q: 'How long does it take a 250 W engine to do 5000 J of work?', a: '20', type: 'calculation', difficulty: 3, hint: 't = W / P = 5000 / 250 = 20 s.' },
    { q: 'A student does 450 J of work climbing stairs in 15 seconds. What is their power?', a: '30', type: 'calculation', difficulty: 2, hint: 'P = 450 / 15 = 30 W.' },
  ]},

  // ── energy-conservation ───────────────────────────────────────────────────
  'energy-transfer': { questions: [
    { q: 'What is energy transfer?', a: 'the movement of energy from one object or place to another', type: 'short', difficulty: 1, rule: 'Energy transfer is when energy moves between objects without changing form.' },
    { q: 'When a hot cup of cocoa warms your hands, what kind of energy is transferred?', a: ['thermal energy', 'heat', 'thermal'], type: 'multi', difficulty: 1, hint: 'Thermal energy moves from the hot cup to your cooler hands.' },
    { q: 'True or false: When a moving billiard ball hits a stationary one, kinetic energy is transferred.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The moving ball transfers some of its kinetic energy to the stationary ball.' },
    { q: 'In which direction does thermal energy naturally flow?', a: ['from hot to cold', 'hot to cold', 'from warmer to cooler'], type: 'multi', difficulty: 1, rule: 'Thermal energy always flows from warmer objects to cooler objects.' },
    { q: 'A drummer hits a drum. What energy transfer occurs?', a: ['kinetic energy from the stick transfers to the drum', 'kinetic to sound'], type: 'multi', difficulty: 2 },
    { q: 'True or false: Sound energy can transfer through empty space (a vacuum).', a: 'false', type: 'tf', difficulty: 2, explanation: 'Sound needs a medium (solid, liquid, or gas) to transfer energy. It cannot travel through a vacuum.' },
    { q: 'When you plug in a toaster, what energy is transferred to the bread?', a: ['thermal energy', 'heat', 'thermal'], type: 'multi', difficulty: 2 },
    { q: 'How does the Sun transfer energy to Earth?', a: ['radiation', 'electromagnetic radiation', 'radiant energy'], type: 'multi', difficulty: 2, rule: 'The Sun transfers energy across space through electromagnetic radiation.' },
  ]},
  'energy-transformation': { questions: [
    { q: 'What is an energy transformation?', a: 'a change from one form of energy to another', type: 'short', difficulty: 1, rule: 'Energy transformation is when energy changes from one form to another.' },
    { q: 'What energy transformation happens in a solar panel?', a: ['light to electrical', 'radiant to electrical', 'solar to electrical'], type: 'multi', difficulty: 1, hint: 'Solar panels convert sunlight (radiant energy) into electrical energy.' },
    { q: 'True or false: A car engine transforms chemical energy into kinetic energy.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Burning fuel (chemical energy) produces motion (kinetic energy) and heat.' },
    { q: 'What energy transformation happens when you turn on a lamp?', a: ['electrical to light and thermal', 'electrical to radiant and thermal'], type: 'multi', difficulty: 2, hint: 'The bulb converts electrical energy into light and heat.' },
    { q: 'When a ball is dropped, what energy transformation occurs as it falls?', a: ['potential to kinetic', 'PE to KE', 'gravitational PE to kinetic'], type: 'multi', difficulty: 1, rule: 'As an object falls, gravitational PE converts to KE.' },
    { q: 'What energy transformation happens in your body when you eat food and run?', a: ['chemical to kinetic and thermal', 'chemical to mechanical and thermal'], type: 'multi', difficulty: 2 },
    { q: 'A wind turbine converts what form of energy into electrical energy?', a: ['kinetic energy', 'kinetic', 'wind energy'], type: 'multi', difficulty: 2 },
    { q: 'In a flashlight, list the chain of energy transformations.', a: ['chemical to electrical to light and thermal', 'chemical to electrical to radiant and thermal'], type: 'multi', difficulty: 3, hint: 'Battery (chemical) → circuit (electrical) → bulb (light + heat).' },
  ]},
  'conservation-law': { questions: [
    { q: 'State the law of conservation of energy.', a: 'energy cannot be created or destroyed, only transformed or transferred', type: 'short', difficulty: 1, rule: 'The total energy in a closed system remains constant.' },
    { q: 'True or false: Energy can be destroyed.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Energy cannot be created or destroyed according to the law of conservation of energy.' },
    { q: 'A ball is dropped from 10 m. If its PE at the top is 100 J, what is its KE just before hitting the ground? (ignore air resistance)', a: '100', type: 'calculation', difficulty: 2, hint: 'All PE converts to KE: KE = 100 J.' },
    { q: 'A pendulum swings back and forth. At the highest point it has 50 J of PE and 0 J of KE. What is its KE at the lowest point?', a: '50', type: 'calculation', difficulty: 2, hint: 'By conservation of energy, all 50 J of PE converts to KE at the bottom.' },
    { q: 'If energy is conserved, why does a bouncing ball eventually stop?', a: ['energy is converted to thermal energy and sound', 'kinetic energy is transformed into heat and sound'], type: 'multi', difficulty: 2, rule: 'The ball loses KE to thermal energy (heat from deformation) and sound with each bounce.' },
    { q: 'A roller coaster has 800 J of PE at the top and 200 J of KE. What is its total mechanical energy?', a: '1000', type: 'calculation', difficulty: 2, hint: 'Total = PE + KE = 800 + 200 = 1,000 J.' },
    { q: 'True or false: When you "use up" energy (like burning gasoline), the energy disappears.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Energy changes form (to heat, motion, etc.) but the total amount stays the same.' },
    { q: 'At the midpoint of a 20 m fall (10 m), an object has half PE and half KE. If total energy is 200 J, what is the KE at 10 m?', a: '100', type: 'calculation', difficulty: 3, hint: 'At the midpoint, PE = KE = 100 J each.' },
  ]},
  'efficiency': { questions: [
    { q: 'What is efficiency?', a: 'the ratio of useful output energy to total input energy', type: 'short', difficulty: 1, rule: 'Efficiency = (useful output / total input) × 100%.' },
    { q: 'A machine uses 500 J of energy and produces 400 J of useful work. What is its efficiency?', a: ['80%', '80'], type: 'multi', difficulty: 2, hint: 'Efficiency = (400/500) × 100% = 80%.' },
    { q: 'True or false: A machine can be 100% efficient.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Some energy is always lost to friction and heat, so no real machine reaches 100% efficiency.' },
    { q: 'A light bulb uses 100 J of electrical energy. Only 10 J becomes light; the rest becomes heat. What is its efficiency?', a: ['10%', '10'], type: 'multi', difficulty: 2, hint: 'Efficiency = (10/100) × 100% = 10%.' },
    { q: 'Where does the "lost" energy go in most machines?', a: ['thermal energy from friction', 'heat', 'thermal energy', 'friction'], type: 'multi', difficulty: 1, rule: 'Most wasted energy is converted to thermal energy through friction.' },
    { q: 'Motor A has 90% efficiency. Motor B has 60% efficiency. Which wastes more energy?', a: ['Motor B', 'B'], type: 'multi', difficulty: 2 },
    { q: 'A motor uses 1000 J and does 750 J of useful work. Calculate the efficiency.', a: ['75%', '75'], type: 'multi', difficulty: 2, hint: 'Efficiency = (750/1000) × 100% = 75%.' },
    { q: 'An engine has an efficiency of 25%. If it produces 500 J of useful work, how much total energy did it use?', a: '2000', type: 'calculation', difficulty: 3, hint: '0.25 = 500 / total → total = 500 / 0.25 = 2,000 J.' },
  ]},

  // ── heat-transfer ─────────────────────────────────────────────────────────
  'conduction': { questions: [
    { q: 'What is conduction?', a: 'heat transfer through direct contact between materials', type: 'short', difficulty: 1, rule: 'Conduction is the transfer of thermal energy through direct contact of particles.' },
    { q: 'Give an example of conduction.', a: ['a metal spoon getting hot in soup', 'touching a hot pan', 'heat moving through a metal rod'], type: 'multi', difficulty: 1, hint: 'Think about what happens when you touch something hot.' },
    { q: 'True or false: Metals are good conductors of heat.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Metals have free electrons that transfer kinetic energy quickly.' },
    { q: 'Why do pot handles sometimes have plastic or wood grips?', a: ['plastic and wood are insulators that do not conduct heat well', 'they are insulators', 'to prevent heat conduction to your hand'], type: 'multi', difficulty: 2, rule: 'Insulators slow down conduction, protecting your hand from heat.' },
    { q: 'In conduction, do the particles move from one place to another?', a: 'no', type: 'short', difficulty: 2, rule: 'In conduction, particles vibrate in place and pass energy to neighbors. The particles themselves do not flow.' },
    { q: 'True or false: Conduction works best in solids.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Solid particles are closely packed, so they transfer vibrations efficiently.' },
    { q: 'What is an insulator?', a: 'a material that does not conduct heat well', type: 'short', difficulty: 1 },
    { q: 'Which transfers heat by conduction faster: a copper rod or a wooden rod?', a: ['copper rod', 'copper'], type: 'multi', difficulty: 2, hint: 'Copper is a metal and an excellent conductor.' },
  ]},
  'convection': { questions: [
    { q: 'What is convection?', a: 'heat transfer through the movement of fluids', type: 'short', difficulty: 1, rule: 'Convection transfers thermal energy through the bulk movement of liquids or gases.' },
    { q: 'True or false: Convection can happen in solids.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Convection requires fluid movement, so it only occurs in liquids and gases.' },
    { q: 'In a pot of boiling water, why does hot water rise?', a: ['hot water is less dense than cold water', 'it becomes less dense', 'hot water expands and becomes lighter'], type: 'multi', difficulty: 2, rule: 'Heated fluid expands, becomes less dense, and rises; cooler fluid sinks.' },
    { q: 'What is a convection current?', a: 'a circular flow pattern caused by hot fluid rising and cool fluid sinking', type: 'short', difficulty: 2 },
    { q: 'Give an example of convection.', a: ['boiling water', 'sea breeze', 'warm air rising from a heater', 'hot air balloon'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Wind is an example of convection.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Wind is caused by the uneven heating of air, creating convection currents.' },
    { q: 'In a room with a heater, why is the air near the ceiling warmer?', a: ['warm air rises because it is less dense', 'hot air rises', 'convection carries warm air upward'], type: 'multi', difficulty: 2 },
    { q: 'What drives convection currents in Earth\'s mantle?', a: ['heat from the core', 'radioactive decay heating the mantle', 'temperature differences in the mantle'], type: 'multi', difficulty: 3 },
  ]},
  'radiation': { questions: [
    { q: 'What is radiation (in heat transfer)?', a: 'heat transfer through electromagnetic waves without needing a medium', type: 'short', difficulty: 1, rule: 'Radiation transfers energy through electromagnetic waves and can travel through a vacuum.' },
    { q: 'True or false: Radiation is the only type of heat transfer that can occur through empty space.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Conduction and convection need matter; radiation can travel through a vacuum.' },
    { q: 'How does the Sun warm the Earth?', a: ['radiation', 'electromagnetic radiation'], type: 'multi', difficulty: 1, hint: 'There is no matter between the Sun and Earth, so it cannot be conduction or convection.' },
    { q: 'What color absorbs the most radiant energy?', a: ['black', 'dark colors'], type: 'multi', difficulty: 2, rule: 'Dark colors absorb more radiation; light colors reflect more.' },
    { q: 'Give an example of radiation in daily life.', a: ['feeling heat from a campfire', 'warmth from the Sun', 'a heat lamp', 'a microwave oven'], type: 'multi', difficulty: 1 },
    { q: 'True or false: You can feel radiation from a fire even without touching it.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Infrared radiation from the fire travels through air and warms your skin.' },
    { q: 'Why do people wear light-colored clothing in summer?', a: ['light colors reflect more radiation and absorb less heat', 'to reflect sunlight', 'to stay cooler'], type: 'multi', difficulty: 2 },
    { q: 'Compare conduction, convection, and radiation: which does NOT require matter?', a: ['radiation'], type: 'multi', difficulty: 2 },
  ]},
  'specific-heat': { questions: [
    { q: 'What is specific heat?', a: 'the amount of energy needed to raise the temperature of 1 kg of a substance by 1 degree Celsius', type: 'short', difficulty: 1, rule: 'Specific heat (c) measures how much energy a substance needs to change temperature.' },
    { q: 'Water has a high specific heat. What does this mean?', a: ['water takes a lot of energy to heat up or cool down', 'it heats and cools slowly', 'it resists temperature change'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Sand heats up faster than water in sunlight.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Sand has a lower specific heat than water, so it heats up faster.' },
    { q: 'The formula for heat energy is Q = mcΔT. What does each variable stand for?', a: ['Q = heat, m = mass, c = specific heat, delta T = temperature change'], type: 'multi', difficulty: 2, rule: 'Q is thermal energy (J), m is mass (kg), c is specific heat (J/kg°C), ΔT is temperature change (°C).' },
    { q: 'How much heat is needed to raise 2 kg of water by 5°C? (c = 4,200 J/kg°C)', a: '42000', type: 'calculation', difficulty: 2, hint: 'Q = mcΔT = 2 × 4200 × 5 = 42,000 J.' },
    { q: 'Why do coastal areas have milder temperatures than inland areas?', a: ['water has a high specific heat so oceans moderate temperature', 'the ocean heats and cools slowly'], type: 'multi', difficulty: 3, concept: 'Water\'s high specific heat buffers coastal temperatures.' },
    { q: 'How much heat is needed to raise 3 kg of a metal (c = 500 J/kg°C) by 10°C?', a: '15000', type: 'calculation', difficulty: 2, hint: 'Q = 3 × 500 × 10 = 15,000 J.' },
    { q: 'If 8,400 J heats 1 kg of water by 2°C, what is the specific heat of water?', a: ['4200', '4,200'], type: 'multi', difficulty: 3, hint: 'c = Q / (mΔT) = 8400 / (1 × 2) = 4,200 J/kg°C.' },
  ]},

  // ── simple-machines ───────────────────────────────────────────────────────
  'lever': { questions: [
    { q: 'What is a lever?', a: 'a rigid bar that rotates around a fixed point called a fulcrum', type: 'short', difficulty: 1, rule: 'A lever is a simple machine with a bar and a fulcrum.' },
    { q: 'What is the fixed point of a lever called?', a: ['fulcrum'], type: 'multi', difficulty: 1 },
    { q: 'True or false: A seesaw is an example of a lever.', a: 'true', type: 'tf', difficulty: 1, explanation: 'A seesaw has a bar (plank) and a fulcrum (center support).' },
    { q: 'Name the three classes of levers based on the position of the fulcrum.', a: ['first class, second class, third class'], type: 'multi', difficulty: 2, hint: 'First class: fulcrum between effort and load. Second class: load between fulcrum and effort. Third class: effort between fulcrum and load.' },
    { q: 'A wheelbarrow is what class of lever?', a: ['second class', '2nd class', 'class 2'], type: 'multi', difficulty: 2, hint: 'The load is between the fulcrum (wheel) and the effort (handles).' },
    { q: 'Give two examples of first-class levers.', a: ['seesaw and scissors', 'seesaw, crowbar', 'scissors, pliers'], type: 'multi', difficulty: 2 },
    { q: 'True or false: A lever can multiply force but not energy.', a: 'true', type: 'tf', difficulty: 2, explanation: 'A lever trades force for distance; the work (energy) input equals work output (minus friction).' },
    { q: 'A fishing rod is what class of lever?', a: ['third class', '3rd class', 'class 3'], type: 'multi', difficulty: 2, hint: 'The effort (your hand) is between the fulcrum (base) and the load (fish).' },
  ]},
  'pulley': { questions: [
    { q: 'What is a pulley?', a: 'a wheel with a rope or cable used to lift or move a load', type: 'short', difficulty: 1, rule: 'A pulley is a simple machine that changes the direction of force.' },
    { q: 'True or false: A single fixed pulley reduces the amount of force needed.', a: 'false', type: 'tf', difficulty: 1, explanation: 'A single fixed pulley changes the direction of force but does not reduce the force needed.' },
    { q: 'What advantage does a single fixed pulley give you?', a: ['it changes the direction of the force', 'you can pull down instead of lifting up'], type: 'multi', difficulty: 1 },
    { q: 'What does a movable pulley do?', a: ['it reduces the force needed by half', 'reduces force', 'multiplies force'], type: 'multi', difficulty: 2, rule: 'A movable pulley halves the force needed but doubles the distance pulled.' },
    { q: 'A block-and-tackle system has 4 supporting ropes. What is its mechanical advantage?', a: '4', type: 'short', difficulty: 2, hint: 'MA = number of supporting rope sections = 4.' },
    { q: 'True or false: With a pulley system, you trade less force for more distance.', a: 'true', type: 'tf', difficulty: 2, explanation: 'You pull with less force but over a greater distance. The total work stays the same.' },
    { q: 'Give a real-world example of a pulley.', a: ['a flag pole', 'a crane', 'an elevator', 'blinds', 'a well bucket'], type: 'multi', difficulty: 1 },
    { q: 'A pulley system requires 50 N to lift a 200 N load. What is the mechanical advantage?', a: '4', type: 'calculation', difficulty: 2, hint: 'MA = load / effort = 200 / 50 = 4.' },
  ]},
  'inclined-plane': { questions: [
    { q: 'What is an inclined plane?', a: 'a flat surface tilted at an angle, used as a ramp', type: 'short', difficulty: 1, rule: 'An inclined plane is a simple machine that spreads work over a longer distance to reduce force.' },
    { q: 'True or false: A ramp is an example of an inclined plane.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Ramps, slides, and wedges are all inclined planes.' },
    { q: 'How does an inclined plane make work easier?', a: ['it reduces the force needed by increasing the distance', 'less force over more distance', 'spreads the work over a longer distance'], type: 'multi', difficulty: 2, rule: 'The longer the ramp, the less force is needed, but you push over a greater distance.' },
    { q: 'A ramp is 5 m long and 1 m high. What is its mechanical advantage?', a: '5', type: 'calculation', difficulty: 2, hint: 'MA = length / height = 5 / 1 = 5.' },
    { q: 'Name two examples of inclined planes.', a: ['ramp and stairs', 'ramp, wedge', 'slide, ramp', 'wheelchair ramp and knife'], type: 'multi', difficulty: 1 },
    { q: 'A ramp is 10 m long and 2 m high. What is its mechanical advantage?', a: '5', type: 'calculation', difficulty: 2, hint: 'MA = 10 / 2 = 5.' },
    { q: 'True or false: A screw is a type of inclined plane wrapped around a cylinder.', a: 'true', type: 'tf', difficulty: 2, explanation: 'The threads of a screw form a spiral inclined plane.' },
    { q: 'Would a steeper or gentler ramp require less force to push a box?', a: ['gentler', 'a gentler ramp', 'the less steep ramp'], type: 'multi', difficulty: 2, hint: 'A longer, gentler slope means less force needed.' },
  ]},
  'mechanical-advantage': { questions: [
    { q: 'What is mechanical advantage?', a: 'the ratio of output force to input force in a machine', type: 'short', difficulty: 1, rule: 'MA = output force / input force, or MA = input distance / output distance.' },
    { q: 'A machine requires 20 N of effort to lift a 100 N load. What is the mechanical advantage?', a: '5', type: 'calculation', difficulty: 1, hint: 'MA = 100 / 20 = 5.' },
    { q: 'True or false: A mechanical advantage greater than 1 means the machine multiplies force.', a: 'true', type: 'tf', difficulty: 1, explanation: 'MA > 1 means the output force is greater than the input force.' },
    { q: 'A lever has an effort arm of 3 m and a resistance arm of 1 m. What is the MA?', a: '3', type: 'calculation', difficulty: 2, hint: 'MA = effort arm / resistance arm = 3 / 1 = 3.' },
    { q: 'A machine with MA = 4 receives 25 N of effort. What load can it lift?', a: '100', type: 'calculation', difficulty: 2, hint: 'Load = MA × effort = 4 × 25 = 100 N.' },
    { q: 'True or false: A machine with MA = 1 does not multiply force.', a: 'true', type: 'tf', difficulty: 2, explanation: 'MA = 1 means output force equals input force. The machine may change direction but not force.' },
    { q: 'What is the ideal mechanical advantage of a ramp that is 8 m long and 2 m high?', a: '4', type: 'calculation', difficulty: 2, hint: 'IMA = length / height = 8 / 2 = 4.' },
    { q: 'Why is the actual MA of a machine always less than the ideal MA?', a: ['because of friction', 'friction reduces the output', 'energy is lost to friction'], type: 'multi', difficulty: 3, rule: 'Friction wastes some input energy as heat, so real machines output less force than ideal.' },
  ]},
};

// ═══════════════════════════════════════════════════════════════════════════════
// HINT BANKS — 3-tier progressive hints per skill
// ═══════════════════════════════════════════════════════════════════════════════

const HINT_BANKS = {
  // energy-types
  'kinetic-energy': { tier1: 'Kinetic energy is the energy of motion. If it moves, it has KE.', tier2: 'KE depends on mass and speed. The formula is KE = ½mv².', tier3: 'Example: A 4 kg ball at 3 m/s has KE = ½ × 4 × 9 = 18 J. Speed is squared, so doubling speed quadruples KE.' },
  'potential-energy': { tier1: 'Potential energy is stored energy due to position or shape.', tier2: 'Gravitational PE = mgh. Elastic PE comes from stretching or compressing.', tier3: 'Example: A 5 kg book 2 m high has PE = 5 × 10 × 2 = 100 J. The higher the object, the more PE it has.' },
  'thermal-energy': { tier1: 'Thermal energy is the total kinetic energy of all the particles in a substance.', tier2: 'Temperature is the average KE of particles; thermal energy is the total. A large cold lake has more thermal energy than a small hot cup.', tier3: 'Example: Heating water makes particles move faster. When ice melts, it absorbs thermal energy without changing temperature.' },
  'energy-forms': { tier1: 'Energy comes in many forms: kinetic, potential, thermal, chemical, radiant, electrical, sound, nuclear.', tier2: 'Chemical energy is stored in bonds (food, fuel). Radiant energy is light. Electrical energy flows through circuits.', tier3: 'Example: A flashlight: chemical (battery) → electrical (circuit) → radiant + thermal (bulb).' },

  // work-power
  'work-definition': { tier1: 'Work in physics requires a force AND movement in the direction of the force.', tier2: 'If you push a box and it moves, that is work. If you hold a box still, no work is done.', tier3: 'Example: Pushing with 10 N for 3 m: W = 10 × 3 = 30 J. Holding a book still: W = 0 J (no distance).' },
  'calculating-work': { tier1: 'Work = Force × Distance (W = F × d).', tier2: 'Force is in newtons (N), distance in meters (m), work in joules (J).', tier3: 'Example: A 50 N force pushes a crate 4 m: W = 50 × 4 = 200 J.' },
  'power-definition': { tier1: 'Power is how fast work is done: Power = Work / Time.', tier2: 'Same work in less time = more power. Power is measured in watts (W).', tier3: 'Example: 300 J in 10 s = 30 W. 300 J in 5 s = 60 W. Faster = more powerful.' },
  'calculating-power': { tier1: 'P = W / t. Work in joules, time in seconds, power in watts.', tier2: 'Rearrange: W = P × t or t = W / P depending on what you need to find.', tier3: 'Example: A 200 W motor running for 30 s does W = 200 × 30 = 6,000 J of work.' },

  // energy-conservation
  'energy-transfer': { tier1: 'Energy transfer moves energy from one object to another without changing form.', tier2: 'Heat flows from hot to cold. A moving ball transfers KE when it hits another ball.', tier3: 'Example: A hot cup warms your hands by transferring thermal energy through conduction.' },
  'energy-transformation': { tier1: 'Energy transformation changes energy from one form to another.', tier2: 'Many devices transform energy: motors (electrical → kinetic), lamps (electrical → light + heat).', tier3: 'Example: A falling ball: gravitational PE → kinetic energy. Food → chemical → kinetic + thermal in your body.' },
  'conservation-law': { tier1: 'Energy cannot be created or destroyed — only changed in form.', tier2: 'In any system, total energy stays constant. PE lost = KE gained (ignoring friction).', tier3: 'Example: A ball at 10 m has 100 J PE. At the ground, it has 100 J KE. Total energy: 100 J always.' },
  'efficiency': { tier1: 'Efficiency = (useful output / total input) × 100%.', tier2: 'No real machine is 100% efficient. Energy is always lost to friction/heat.', tier3: 'Example: A motor uses 500 J and does 400 J useful work. Efficiency = 400/500 × 100 = 80%.' },

  // heat-transfer
  'conduction': { tier1: 'Conduction is heat transfer by direct contact. Particles vibrate and pass energy to neighbors.', tier2: 'Metals conduct heat well (conductors). Wood and plastic do not (insulators).', tier3: 'Example: A metal spoon in hot soup gets hot by conduction. The handle warms as vibrations pass through.' },
  'convection': { tier1: 'Convection is heat transfer through moving fluids (liquids and gases).', tier2: 'Hot fluid rises (less dense), cool fluid sinks (more dense), creating a circular current.', tier3: 'Example: In a pot of water, hot water rises from the bottom, cool water sinks, creating a loop.' },
  'radiation': { tier1: 'Radiation is heat transfer through electromagnetic waves. No medium needed.', tier2: 'All warm objects emit radiation. Dark colors absorb more; light colors reflect more.', tier3: 'Example: You feel warmth from a campfire across open air — that is radiation (infrared waves).' },
  'specific-heat': { tier1: 'Specific heat tells how much energy is needed to change a substance\'s temperature.', tier2: 'Q = mcΔT. Water has a high specific heat (4,200 J/kg°C), so it heats and cools slowly.', tier3: 'Example: To heat 2 kg of water by 5°C: Q = 2 × 4200 × 5 = 42,000 J.' },

  // simple-machines
  'lever': { tier1: 'A lever has a bar, a fulcrum, an effort, and a load.', tier2: 'Three classes based on fulcrum position. MA = effort arm / resistance arm.', tier3: 'Example: A seesaw (1st class) — fulcrum in the middle. A wheelbarrow (2nd class) — load in the middle.' },
  'pulley': { tier1: 'A pulley uses a wheel and rope to redirect or multiply force.', tier2: 'Fixed pulley: changes direction. Movable pulley: halves force. Compound: both benefits.', tier3: 'Example: A block-and-tackle with 4 ropes supporting the load has MA = 4. You pull with ¼ the force over 4× the distance.' },
  'inclined-plane': { tier1: 'An inclined plane (ramp) spreads work over a longer distance to reduce force.', tier2: 'MA = length of ramp / height. Longer ramp = less force needed.', tier3: 'Example: A 6 m ramp up to a 2 m platform has MA = 3. You push with ⅓ the force over 3× the distance.' },
  'mechanical-advantage': { tier1: 'MA = output force / input force. It tells you how much a machine multiplies force.', tier2: 'IMA (ideal) ignores friction. AMA (actual) accounts for friction and is always less than IMA.', tier3: 'Example: Effort = 20 N lifts 80 N. MA = 80/20 = 4. The machine multiplies your force by 4.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISCONCEPTIONS — pattern-matched corrections per skill
// ═══════════════════════════════════════════════════════════════════════════════

const MISCONCEPTIONS = {
  'kinetic-energy': [
    { patterns: [/heav.*more.*KE|mass.*more.*important/i], correction: 'Speed matters more than mass for kinetic energy. KE = ½mv², so speed is squared. Doubling speed quadruples KE, but doubling mass only doubles KE.' },
  ],
  'potential-energy': [
    { patterns: [/weight.*same.*PE|heavy.*always.*more/i], correction: 'PE = mgh depends on mass, gravity, AND height. A lighter object at a greater height can have more PE than a heavier object at a lower height.' },
  ],
  'thermal-energy': [
    { patterns: [/hotter.*more.*thermal|temperature.*same.*thermal/i], correction: 'Temperature and thermal energy are different. A bathtub of warm water has more total thermal energy than a cup of boiling water because it has far more particles.' },
  ],
  'work-definition': [
    { patterns: [/hold.*work|still.*work|tired.*means.*work/i], correction: 'In physics, work requires both force AND movement. Holding a heavy object still feels tiring, but no physics work is done because there is no displacement.' },
  ],
  'calculating-work': [
    { patterns: [/add.*force.*distance|plus/i], correction: 'Work = Force × Distance, not Force + Distance. Make sure to multiply, not add.' },
  ],
  'conservation-law': [
    { patterns: [/energy.*disappear|energy.*used.*up|energy.*gone/i], correction: 'Energy never disappears. When a ball stops bouncing, its kinetic energy has been transformed into thermal energy and sound — it has not vanished.' },
  ],
  'efficiency': [
    { patterns: [/100.*percent.*possible|perfect.*machine/i], correction: 'No real machine can be 100% efficient. Friction always converts some useful energy into waste heat.' },
  ],
  'conduction': [
    { patterns: [/heat.*rises.*conduction|conduction.*through.*air/i], correction: 'Conduction is heat transfer through direct contact, not through fluid movement. Heat rising in air is convection, not conduction.' },
  ],
  'mechanical-advantage': [
    { patterns: [/more.*force.*more.*work|machine.*create.*energy/i], correction: 'Machines multiply force but not energy. If a machine multiplies your force by 4, you must push 4 times the distance. Total work stays the same (minus friction).' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENA — driving questions for phenomenon-based learning
// ═══════════════════════════════════════════════════════════════════════════════

const PHENOMENA = {
  'energy-types': [
    { title: 'The Roller Coaster Ride', focus: 'kinetic energy, potential energy, energy forms', text: 'A roller coaster car is hauled to the top of the first hill — the tallest hill on the track. Then it is released with no engine. It races down, speeds through loops, and climbs smaller hills, all without any motor.', drivingQuestion: 'How can the roller coaster keep moving without an engine? Where does the energy come from and where does it go at each point on the track?' },
  ],
  'work-power': [
    { title: 'Two Students, One Flight of Stairs', focus: 'work, power, time', text: 'Student A and Student B both weigh the same and both climb the same flight of stairs. Student A runs up in 5 seconds. Student B walks up in 15 seconds.', drivingQuestion: 'Do both students do the same amount of work? Who has more power? How can two people do the same work but have different power outputs?' },
  ],
  'energy-conservation': [
    { title: 'The Bouncing Ball Mystery', focus: 'conservation of energy, energy transformation', text: 'You drop a ball from 2 meters. It bounces back up, but only reaches 1.5 meters. Each bounce, it goes a little lower until it stops completely.', drivingQuestion: 'If energy cannot be created or destroyed, where does the "missing" energy go with each bounce? Why does the ball eventually stop?' },
  ],
  'heat-transfer': [
    { title: 'Why is the Beach Sand Hot but the Ocean Cool?', focus: 'specific heat, conduction, radiation', text: 'On a sunny summer day, the sand at the beach burns your feet, but the ocean water feels cool. Both have been in the sun all day receiving the same amount of sunlight.', drivingQuestion: 'Why do sand and water respond differently to the same amount of solar energy? How do specific heat and heat transfer explain this?' },
  ],
  'simple-machines': [
    { title: 'Moving Day', focus: 'inclined plane, levers, mechanical advantage', text: 'A moving crew needs to load a 500 kg piano onto a truck that is 1.2 m off the ground. They have a long ramp and a lever (dolly). Without any tools, they would need to lift the full weight straight up.', drivingQuestion: 'How do the ramp and lever reduce the effort needed? Does using simple machines mean you do less work? What is the trade-off?' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL LABS
// ═══════════════════════════════════════════════════════════════════════════════

const VIRTUAL_LABS = {
  'pe-ke-conversion': {
    title: 'Virtual Potential-Kinetic Energy Conversion Lab',
    skills: ['kinetic-energy', 'potential-energy', 'conservation-law'],
    objective: 'Investigate how potential and kinetic energy convert during a falling object',
    background: 'When an object falls, gravitational PE converts to KE. At any point, PE + KE = Total Energy (ignoring air resistance).',
    hypothesis_prompt: 'Predict: As a ball falls from 10 m, at what height will it have equal PE and KE?',
    variables: { independent: 'height of ball', dependent: 'PE, KE, speed', controlled: ['mass of ball', 'gravitational acceleration (10 m/s²)', 'no air resistance'] },
    procedure: [
      { step: 1, action: 'Drop a 2 kg ball from 10 m. Calculate PE at the top: PE = mgh = 2 × 10 × 10 = 200 J. KE = 0 J.' },
      { step: 2, action: 'At 7.5 m: PE = 2 × 10 × 7.5 = 150 J. KE = 200 - 150 = 50 J.' },
      { step: 3, action: 'At 5 m: PE = 100 J. KE = 100 J. (halfway = equal split)' },
      { step: 4, action: 'At 2.5 m: PE = 50 J. KE = 150 J.' },
      { step: 5, action: 'At 0 m (ground): PE = 0 J. KE = 200 J. Record all values in a data table.' },
    ],
    observations: {
      'top': 'At 10 m: PE = 200 J, KE = 0 J, Total = 200 J.',
      'midpoint': 'At 5 m: PE = 100 J, KE = 100 J, Total = 200 J.',
      'ground': 'At 0 m: PE = 0 J, KE = 200 J, Total = 200 J.',
      'pattern': 'PE + KE = 200 J at every height. Energy is conserved!',
    },
    data_table: {
      columns: ['Height (m)', 'PE (J)', 'KE (J)', 'Total Energy (J)'],
      rows: [
        ['10', '200', '0', '200'],
        ['7.5', '150', '50', '200'],
        ['5', '100', '100', '200'],
        ['2.5', '50', '150', '200'],
        ['0', '0', '200', '200'],
      ],
    },
    conclusion_questions: [
      'At what height did PE equal KE?',
      'What happened to the total energy at each height?',
      'What is the speed of the ball at the ground? (Hint: KE = ½mv², solve for v)',
      'What would happen if there were air resistance?',
      'How would the results change with a 4 kg ball instead of 2 kg?',
    ],
  },
  'heat-transfer-methods': {
    title: 'Virtual Heat Transfer Methods Lab',
    skills: ['conduction', 'convection', 'radiation'],
    objective: 'Compare conduction, convection, and radiation by observing how heat moves in different setups',
    background: 'Heat can transfer by conduction (contact), convection (fluid flow), and radiation (electromagnetic waves).',
    hypothesis_prompt: 'Predict: Which method will heat a thermometer fastest — a metal rod touching a flame, warm air rising, or an infrared lamp?',
    variables: { independent: 'heat transfer method', dependent: 'temperature change of thermometer', controlled: ['starting temperature', 'distance from heat source', 'time'] },
    procedure: [
      { step: 1, action: 'Conduction: Place a metal rod with one end in hot water. Measure temperature at the other end every 30 seconds.' },
      { step: 2, action: 'Convection: Place a thermometer above a beaker of hot water. Measure temperature every 30 seconds.' },
      { step: 3, action: 'Radiation: Place a thermometer 20 cm from an infrared lamp. Measure temperature every 30 seconds.' },
      { step: 4, action: 'Record all temperatures in a data table and graph the results.' },
      { step: 5, action: 'Compare the rate of heating for each method.' },
    ],
    observations: {
      'conduction': 'Metal rod heats steadily from the hot end to the cool end. Temperature rises gradually.',
      'convection': 'Warm air rises and heats the thermometer above the beaker. Slower than conduction in metal.',
      'radiation': 'Infrared lamp heats the thermometer almost immediately, even through air.',
    },
    data_table: {
      columns: ['Time (s)', 'Conduction (°C)', 'Convection (°C)', 'Radiation (°C)'],
      rows: [
        ['0', '22', '22', '22'],
        ['30', '28', '24', '30'],
        ['60', '34', '27', '37'],
        ['90', '39', '30', '42'],
        ['120', '43', '33', '46'],
      ],
    },
    conclusion_questions: [
      'Which method transferred heat the fastest?',
      'Which method requires direct contact between materials?',
      'Which method could work in a vacuum (no air)?',
      'Why does convection only work in fluids?',
      'Give a real-world example of each method of heat transfer.',
    ],
  },
  'simple-machines-lab': {
    title: 'Virtual Simple Machines and Mechanical Advantage Lab',
    skills: ['lever', 'inclined-plane', 'mechanical-advantage'],
    objective: 'Measure force and distance to calculate mechanical advantage for different simple machines',
    background: 'Simple machines trade force for distance. Mechanical advantage (MA) = output force / input force.',
    hypothesis_prompt: 'Predict: If a ramp is twice as long, will it take half the force to push a box up it?',
    variables: { independent: 'type of simple machine, ramp length', dependent: 'force required, MA', controlled: ['load weight (100 N)', 'height (1 m)'] },
    procedure: [
      { step: 1, action: 'Lift a 100 N box straight up 1 m. Record the force needed (100 N) and distance (1 m). Work = 100 J.' },
      { step: 2, action: 'Use a 2 m ramp to raise the box 1 m. Measure force needed (50 N). Calculate MA = 100/50 = 2.' },
      { step: 3, action: 'Use a 4 m ramp to raise the box 1 m. Measure force needed (25 N). Calculate MA = 100/25 = 4.' },
      { step: 4, action: 'Use a lever with effort arm 2 m and resistance arm 0.5 m. Calculate MA = 2/0.5 = 4.' },
      { step: 5, action: 'Compare work done in each case: Force × Distance should equal approximately 100 J each time.' },
    ],
    observations: {
      'direct-lift': 'Lifting straight up: 100 N × 1 m = 100 J. No mechanical advantage.',
      '2m-ramp': '50 N × 2 m = 100 J. MA = 2. Half the force, double the distance.',
      '4m-ramp': '25 N × 4 m = 100 J. MA = 4. Quarter the force, four times the distance.',
      'lever': 'Effort arm 2 m, resistance arm 0.5 m: MA = 4. Same trade-off of force and distance.',
    },
    data_table: {
      columns: ['Method', 'Force (N)', 'Distance (m)', 'Work (J)', 'MA'],
      rows: [
        ['Direct lift', '100', '1', '100', '1'],
        ['2 m ramp', '50', '2', '100', '2'],
        ['4 m ramp', '25', '4', '100', '4'],
        ['Lever (2:0.5)', '25', '4', '100', '4'],
      ],
    },
    conclusion_questions: [
      'Did the work change when using different machines?',
      'What is the relationship between force and distance in simple machines?',
      'Why is the actual MA always less than the ideal MA?',
      'Design a ramp that gives MA = 10. What are its dimensions?',
      'A machine cannot create energy. Explain this in terms of work input and output.',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAMS — ASCII diagrams for key concepts
// ═══════════════════════════════════════════════════════════════════════════════

const DIAGRAMS_LOCAL = {
  'energy-bar-chart': {
    domain: 'ms-physics-energy',
    skill: 'conservation-law',
    topic: 'Energy Bar Chart — Falling Ball',
    description: 'Bar chart showing PE and KE at different heights during a fall.',
    diagram: `
  Height: 10 m        5 m          0 m (ground)
  ┌────────┐   ┌────────┐    ┌────────┐
  |████████|   |████    |    |        |  PE
  |████████|   |████    |    |        |
  |        |   |    ████|    |████████|  KE
  |        |   |    ████|    |████████|
  └────────┘   └────────┘    └────────┘

  At 10 m: PE = [A] J, KE = [B] J
  At  5 m: PE = [C] J, KE = [D] J
  At  0 m: PE = [E] J, KE = [F] J
  (Total energy = 200 J, mass = 2 kg, g = 10 m/s²)
`,
    labels: { A: '200', B: '0', C: '100', D: '100', E: '0', F: '200' },
  },
  'lever-diagram': {
    domain: 'ms-physics-energy',
    skill: 'lever',
    topic: 'First-Class Lever',
    description: 'A lever showing effort, load, and fulcrum positions.',
    diagram: `
         Effort [A]                    Load [B]
            ↓                            ↓
  ══════════╤══════════════════════════════
            △
         Fulcrum

  Effort arm length: 3 m
  Resistance arm length: 1 m
  MA = effort arm / resistance arm = [C]
  If the load is 90 N, effort needed = [D] N
`,
    labels: { A: 'effort', B: 'load', C: '3', D: '30' },
  },
  'inclined-plane-diagram': {
    domain: 'ms-physics-energy',
    skill: 'inclined-plane',
    topic: 'Inclined Plane (Ramp)',
    description: 'A ramp diagram showing height, length, and mechanical advantage.',
    diagram: `
                          ╱|
                        ╱  |
                      ╱    |  Height = [B] m
                    ╱      |
                  ╱        |
                ╱__________|

  Length of ramp [A] = 6 m
  Height [B] = 2 m
  MA = length / height = [C]
  If the load weighs 120 N, the effort needed = [D] N
`,
    labels: { A: '6', B: '2', C: '3', D: '40' },
  },
  'work-power-diagram': {
    domain: 'ms-physics-energy',
    skill: 'calculating-power',
    topic: 'Work and Power Comparison',
    description: 'Two workers doing the same work but at different rates.',
    diagram: `
  Worker A: Lifts 200 N box up 3 m in 10 s
  Worker B: Lifts 200 N box up 3 m in 5 s

  Work by A: W = F × d = 200 × 3 = [A] J
  Work by B: W = F × d = 200 × 3 = [B] J

  Power of A: P = W / t = [A] / 10 = [C] W
  Power of B: P = W / t = [B] / 5 = [D] W

  Who did more work? [E]
  Who had more power? [F]
`,
    labels: { A: '600', B: '600', C: '60', D: '120', E: 'same', F: 'Worker B' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CER PHENOMENA — Claim-Evidence-Reasoning writing prompts
// ═══════════════════════════════════════════════════════════════════════════════

const CER_PHENOMENA_LOCAL = {
  'bouncing-ball-energy': {
    domain: 'ms-physics-energy',
    title: 'Where Does the Energy Go When a Ball Stops Bouncing?',
    phenomenon: 'You drop a ball from 2 meters. It bounces back up to 1.5 m, then 1.1 m, then 0.8 m, and eventually stops. But the law of conservation of energy says energy cannot be destroyed.',
    scaffold: {
      claim: 'Make a claim about what happens to the kinetic energy the ball loses with each bounce.',
      evidence: 'Observe: The ball gets less high each time. Touch the ball after bouncing — is it warmer? Listen — do you hear a sound each bounce? What does this tell you?',
      reasoning: 'Use the law of conservation of energy to explain why the ball reaches a lower height each time. What forms of energy account for the "missing" kinetic energy?',
    },
    keyTerms: ['kinetic energy', 'thermal energy', 'sound', 'conservation', 'transformation', 'friction', 'heat', 'deformation'],
    rubric: {
      claim: { excellent: 'States that KE is transformed into thermal energy and sound', adequate: 'Says energy changes form', developing: 'Says energy is lost or disappears' },
      evidence: { excellent: 'Notes decreasing height, warmth of ball, and sound as evidence of energy transformation', adequate: 'Mentions one or two observations', developing: 'No specific evidence' },
      reasoning: { excellent: 'Explains conservation of energy: total energy constant, KE → thermal + sound via friction and deformation', adequate: 'Mentions conservation but incomplete explanation', developing: 'Does not connect to conservation law' },
    },
  },
  'sand-vs-water': {
    domain: 'ms-physics-energy',
    title: 'Why Is Beach Sand Hot but Ocean Water Cool?',
    phenomenon: 'On a sunny day at the beach, the sand burns your feet, but the ocean water feels cool. Both the sand and water have been absorbing sunlight all day.',
    scaffold: {
      claim: 'Make a claim about why sand and water reach different temperatures in the same sunlight.',
      evidence: 'Research: Water has a specific heat of 4,200 J/kg°C. Sand has a specific heat of about 840 J/kg°C. Calculate how much 1 kg of each heats up when 4,200 J is added.',
      reasoning: 'Explain how specific heat determines the temperature change. Connect this to why coastal climates are milder than inland climates.',
    },
    keyTerms: ['specific heat', 'thermal energy', 'temperature', 'radiation', 'absorption', 'water', 'sand', 'climate'],
    rubric: {
      claim: { excellent: 'States that sand heats faster because it has lower specific heat than water', adequate: 'Says sand heats up more easily', developing: 'Does not mention specific heat' },
      evidence: { excellent: 'Calculates temperature change for both: sand rises 5°C, water rises 1°C for same energy input', adequate: 'References specific heat values', developing: 'No calculations or comparisons' },
      reasoning: { excellent: 'Explains Q = mcΔT and connects to coastal vs inland temperature moderation', adequate: 'Connects specific heat to temperature difference', developing: 'Incomplete reasoning' },
    },
  },
  'machine-efficiency': {
    domain: 'ms-physics-energy',
    title: 'Can Any Machine Be 100% Efficient?',
    phenomenon: 'Engineers spend billions trying to make engines more efficient. A car engine is about 25% efficient, a power plant about 40%, and an LED bulb about 50%. No machine has ever reached 100% efficiency.',
    scaffold: {
      claim: 'Make a claim about whether it is possible to build a 100% efficient machine.',
      evidence: 'Investigate: A motor uses 1000 J and produces 750 J of useful work. Where did the other 250 J go? Touch the motor after running — what do you notice?',
      reasoning: 'Explain why friction and other forces make 100% efficiency impossible. Use the law of conservation of energy.',
    },
    keyTerms: ['efficiency', 'friction', 'thermal energy', 'waste heat', 'conservation', 'input', 'output', 'impossible'],
    rubric: {
      claim: { excellent: 'States that 100% efficiency is impossible because friction always converts some energy to waste heat', adequate: 'States it is not possible', developing: 'Says it might be possible with better technology' },
      evidence: { excellent: 'Calculates missing energy and identifies it as thermal energy from friction; notes motor warmth', adequate: 'Mentions heat as waste', developing: 'Limited evidence' },
      reasoning: { excellent: 'Connects conservation of energy, friction, and thermodynamics to explain why waste heat is unavoidable', adequate: 'Mentions friction as the cause', developing: 'Incomplete reasoning' },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY — key terms per category
// ═══════════════════════════════════════════════════════════════════════════════

const VOCABULARY = {
  'energy-types': [
    { term: 'kinetic energy', definition: 'The energy of motion. KE = ½mv². Depends on mass and speed.' },
    { term: 'potential energy', definition: 'Stored energy due to position or shape. Gravitational PE = mgh.' },
    { term: 'thermal energy', definition: 'The total kinetic energy of all the particles in a substance.' },
    { term: 'chemical energy', definition: 'Energy stored in chemical bonds (food, fuel, batteries).' },
    { term: 'radiant energy', definition: 'Energy carried by electromagnetic waves (light, infrared, UV).' },
    { term: 'joule', definition: 'The SI unit of energy. 1 J = 1 N × 1 m.' },
  ],
  'work-power': [
    { term: 'work', definition: 'Using a force to move an object. W = F × d. Measured in joules.' },
    { term: 'force', definition: 'A push or pull measured in newtons (N).' },
    { term: 'power', definition: 'The rate of doing work. P = W / t. Measured in watts (W).' },
    { term: 'watt', definition: 'The SI unit of power. 1 W = 1 J/s.' },
    { term: 'newton', definition: 'The SI unit of force. 1 N accelerates 1 kg at 1 m/s².' },
  ],
  'energy-conservation': [
    { term: 'energy transfer', definition: 'The movement of energy from one object to another.' },
    { term: 'energy transformation', definition: 'The change of energy from one form to another.' },
    { term: 'conservation of energy', definition: 'Energy cannot be created or destroyed, only transferred or transformed.' },
    { term: 'efficiency', definition: 'The ratio of useful output energy to total input energy, expressed as a percentage.' },
    { term: 'friction', definition: 'A force that opposes motion and converts kinetic energy into thermal energy.' },
  ],
  'heat-transfer': [
    { term: 'conduction', definition: 'Heat transfer through direct contact between materials.' },
    { term: 'convection', definition: 'Heat transfer through the movement of fluids (liquids and gases).' },
    { term: 'radiation', definition: 'Heat transfer through electromagnetic waves; does not require a medium.' },
    { term: 'specific heat', definition: 'The amount of energy needed to raise the temperature of 1 kg of a substance by 1°C.' },
    { term: 'insulator', definition: 'A material that does not conduct heat well (wood, plastic, rubber).' },
    { term: 'conductor', definition: 'A material that transfers heat easily (metals like copper, aluminum).' },
  ],
  'simple-machines': [
    { term: 'simple machine', definition: 'A device that makes work easier by changing the size or direction of a force.' },
    { term: 'lever', definition: 'A bar that pivots on a fulcrum to lift or move a load.' },
    { term: 'fulcrum', definition: 'The fixed pivot point of a lever.' },
    { term: 'pulley', definition: 'A wheel with a rope that changes the direction or amount of force.' },
    { term: 'inclined plane', definition: 'A flat sloped surface (ramp) that reduces the force needed to raise an object.' },
    { term: 'mechanical advantage', definition: 'The ratio of output force to input force. MA = output force / input force.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIOS — real-world application scenarios for lessons
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = [
  { title: 'Designing a Roller Coaster', focus: 'PE, KE, conservation of energy', text: 'You are designing a roller coaster. The first hill is 30 m tall and the car (plus riders) has a mass of 500 kg. The second hill is 20 m tall. Will the car make it over the second hill? What speed will it have at the bottom between the two hills?' },
  { title: 'Home Energy Audit', focus: 'efficiency, heat transfer, conduction', text: 'Your family wants to reduce heating costs. The house loses heat through windows (conduction), drafty doors (convection), and the roof (radiation and convection). Which improvements would save the most energy: double-pane windows, weather stripping, or attic insulation?' },
  { title: 'Building a Ramp for Access', focus: 'inclined plane, mechanical advantage, work', text: 'A community center needs a wheelchair ramp to reach a door that is 0.8 m above the ground. Building codes require a ramp no steeper than 1:12 (1 m rise per 12 m length). What is the minimum ramp length? What is the mechanical advantage?' },
  { title: 'Solar Water Heater', focus: 'radiation, specific heat, energy transformation', text: 'You want to heat 50 kg of water from 20°C to 60°C using sunlight. The specific heat of water is 4,200 J/kg°C. How much energy do you need? If your solar collector captures 500 W, how long will it take?' },
  { title: 'Bike vs. Car Power', focus: 'power, work, efficiency', text: 'A cyclist produces about 75 W of power. A car engine produces about 75,000 W. Both travel 10 km. Compare the energy each uses. Why is the cyclist so much more efficient per kilogram of body weight?' },
  { title: 'Rube Goldberg Machine', focus: 'energy transformation chain, simple machines', text: 'Design a Rube Goldberg machine that turns off a light switch. It must include at least 3 energy transformations and 2 simple machines. Trace the energy from start to finish and identify where energy is "lost" to friction and heat at each step.' },
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

class MSPhysicsEnergy extends DomainSkillBase {
  constructor() {
    super('ms-physics-energy', 'ms-physics-energy', DATA_DIR, loadProfile, saveProfile, HINT_BANKS);
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
        if (m < MASTERY_THRESHOLD && _energyTopicUnlocked(sk, p.skills)) {
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
        const isUnlocked = _energyTopicUnlocked(sk, p.skills);
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
    if (!target) return { message: 'All energy & work skills are proficient!', congratulations: true };
    const skillMastery = p.skills[target.skill]?.mastery || 0;
    const exercise = generateExercise(target.skill, 5, skillMastery);
    const scenario = SCENARIOS.length > 0 ? pick(SCENARIOS, 1)[0] : null;
    const diff = buildDiffContext(p);
    return {
      studentId: id, targetSkill: target, exercise, scenario,
      lessonPlan: {
        review: 'Review previously learned energy concepts (2-3 min)',
        teach: `Introduce/reinforce: ${target.category} → ${target.skill}`,
        practice: `Complete ${exercise.count || 0} practice items`,
        apply: scenario ? `Analyze scenario: "${scenario.title}"` : 'Connect to real-world energy applications',
        extend: `Connect ${target.skill} to related physics concepts`,
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
    if (!name) return { labs: Object.keys(VIRTUAL_LABS), instructions: 'node energy.js lab <id> <lab-name> [obs-key]' };
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

  // Override base class to use local ms-physics diagrams
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
      message: due.length === 0 ? 'No energy skills due for review today!' : `${due.length} skill(s) need review. Work through each exercise below.`,
    };
  }
}

module.exports = MSPhysicsEnergy;

// ═══════════════════════════════════════════════════════════════════════════════
// CLI: node energy.js <command> [args]
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const api = new MSPhysicsEnergy();
  const common = buildCommonCLIHandlers(api, DATA_DIR, 'ms-physics-energy', loadProfile, saveProfile);
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
        try { ans = JSON.parse(answersJson); } catch { throw new Error("answers-json must be valid JSON e.g. '{\"A\":\"200\"}'"); }
        const d = DIAGRAMS_LOCAL[topic];
        if (!d) { out({ error: `Unknown diagram: ${topic}` }); break; }
        let correct = 0;
        const total = Object.keys(d.labels).length;
        const results = {};
        for (const [key, expected] of Object.entries(d.labels)) {
          const studentAns = ans[key] || '';
          const isCorrect = studentAns.toLowerCase().trim().includes(expected.toLowerCase().trim()) || expected.toLowerCase().trim().includes(studentAns.toLowerCase().trim());
          if (isCorrect) correct++;
          results[key] = { expected, studentAnswer: studentAns, correct: isCorrect };
        }
        out({ studentId: id, topic, correct, total, score: `${correct}/${total}`, results });
        break;
      }
      case 'vocab': {
        const [, id, topic] = args;
        if (!id) throw new Error('Usage: vocab <id> [topic]');
        if (topic) {
          const v = VOCABULARY[topic];
          if (!v) { out({ error: `Unknown topic: ${topic}. Available: ${Object.keys(VOCABULARY).join(', ')}` }); break; }
          out({ studentId: id, topic, terms: v });
        } else {
          const all = {};
          for (const [t, terms] of Object.entries(VOCABULARY)) all[t] = terms.map(v => v.term);
          out({ studentId: id, topics: all });
        }
        break;
      }
      case 'phenomenon': {
        const [, category] = args;
        out(api.getPhenomenon(category || null));
        break;
      }
      case 'scenario': {
        out(api.getScenario());
        break;
      }
      case 'catalog': {
        out(api.getSkillCatalog());
        break;
      }
      case 'students': {
        out(api.listStudents());
        break;
      }
      case 'help': out({
        skill: 'ms-physics-energy',
        gradeLevel: '6-8',
        standards: 'NGSS MS-PS3 (Energy)',
        usage: 'node energy.js <command> [args]',
        commands: {
          'start <id>': 'Start a student session; includes last session state for resume prompt',
          'lesson <id>': 'Generate a lesson with concept explanation and exercises',
          'exercise <id> [skill]': 'Generate 5 practice items; optionally filter by skill',
          'check <id> <type> <expected> <answer> [skill]': 'Check an answer; returns misconception feedback if wrong',
          'record <id> <skill> <score> <total> [hints] [notes]': 'Save a scored assessment attempt',
          'progress <id>': 'Show mastery levels across all energy skills',
          'review <id>': 'List skills due for spaced repetition today',
          'hint <id> <skill>': 'Get next hint tier (3 tiers; reduces mastery credit)',
          'lab <id> [lab-name] [obs-key]': 'Start or explore a virtual lab; omit name to list available labs',
          'diagram <id> [topic]': 'Show ASCII diagram with blank labels to fill in',
          'diagram-check <id> <topic> <answers-json>': 'Check label answers for a diagram',
          'cer <id> [topic]': 'Present a CER phenomenon with scaffold prompts',
          'cer-check <id> <topic> <claim> <evidence> <reasoning>': 'Evaluate CER response against rubric',
          'vocab <id> [topic]': 'Pre-teach energy vocabulary',
          'phenomenon [category]': 'Get a driving-question phenomenon for phenomenon-based learning',
          'scenario': 'Get a real-world application scenario',
          'catalog': 'List all skill categories and topics',
          'students': 'List all student IDs with saved profiles',
        },
      }); break;
      default: out({
        usage: 'node energy.js <command> [args]',
        commands: ['start', 'lesson', 'exercise', 'check', 'record', 'progress', 'review', 'hint', 'lab', 'diagram', 'diagram-check', 'cer', 'cer-check', 'vocab', 'phenomenon', 'scenario', 'catalog', 'students', 'help'],
      });
    }
  });
}
