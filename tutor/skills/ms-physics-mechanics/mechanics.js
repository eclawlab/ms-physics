// eClaw MS Physics Mechanics (Forces & Motion) Tutor (6-8).
// NGSS MS-PS2 (Motion and Stability: Forces and Interactions) aligned.

const { dataDir, loadProfile: _lp, saveProfile: _sp, listProfiles, calcMastery, masteryLabel, shuffle, pick, runCLI, srGrade, srUpdate, srEffectiveMastery, srDueToday, MASTERY_THRESHOLD, saveSessionState, loadSessionState, fsrsUpdateStability, fsrsUpdateDifficulty, fsrsNextReview, today } = require('../_lib/core');
const { buildDiffContext } = require('../_lib/differentiation');
const { DomainSkillBase, buildCommonCLIHandlers, generateExercise: _generateExercise, checkAnswer: _checkAnswer } = require('../_lib/exercise-factory');

const DATA_DIR = dataDir('ms-physics-mechanics');
const loadProfile = id => _lp(DATA_DIR, id);
const saveProfile = p => _sp(DATA_DIR, p);

const SKILLS = {
  'forces-basics': ['types-of-forces', 'net-force', 'balanced-unbalanced', 'force-diagrams'],
  'newtons-laws': ['first-law-inertia', 'second-law-fma', 'third-law-action-reaction', 'applying-newtons-laws'],
  'motion': ['speed-velocity', 'acceleration', 'distance-time-graphs', 'velocity-time-graphs'],
  'gravity': ['gravitational-force', 'free-fall', 'weight-vs-mass', 'projectile-motion'],
  'friction-drag': ['static-friction', 'kinetic-friction', 'air-resistance', 'friction-applications'],
  'momentum': ['momentum-basics', 'impulse', 'conservation-of-momentum', 'collision-types'],
};

// Prerequisites: topic -> [topics that must be mastered first].
const TOPIC_PREREQUISITES = {
  // forces-basics (foundational)
  'types-of-forces': [],
  'net-force': ['types-of-forces'],
  'balanced-unbalanced': ['net-force'],
  'force-diagrams': ['balanced-unbalanced'],
  // newtons-laws
  'first-law-inertia': ['balanced-unbalanced'],
  'second-law-fma': ['first-law-inertia', 'net-force'],
  'third-law-action-reaction': ['first-law-inertia'],
  'applying-newtons-laws': ['second-law-fma', 'third-law-action-reaction'],
  // motion
  'speed-velocity': ['types-of-forces'],
  'acceleration': ['speed-velocity'],
  'distance-time-graphs': ['speed-velocity'],
  'velocity-time-graphs': ['acceleration'],
  // gravity
  'gravitational-force': ['types-of-forces'],
  'free-fall': ['gravitational-force', 'acceleration'],
  'weight-vs-mass': ['gravitational-force'],
  'projectile-motion': ['free-fall', 'velocity-time-graphs'],
  // friction-drag
  'static-friction': ['types-of-forces'],
  'kinetic-friction': ['static-friction'],
  'air-resistance': ['kinetic-friction'],
  'friction-applications': ['kinetic-friction', 'second-law-fma'],
  // momentum
  'momentum-basics': ['speed-velocity', 'second-law-fma'],
  'impulse': ['momentum-basics'],
  'conservation-of-momentum': ['momentum-basics'],
  'collision-types': ['conservation-of-momentum'],
};

// Helper: is a topic unlocked (all prereqs mastered)?
function _mechanicsTopicUnlocked(topic, profileSkills) {
  return (TOPIC_PREREQUISITES[topic] || []).every(r => (profileSkills[r]?.mastery || 0) >= MASTERY_THRESHOLD);
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BANKS — 6-8 questions per skill, NGSS MS-PS2 aligned
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_BANKS = {
  // ── forces-basics ──────────────────────────────────────────────────────────
  'types-of-forces': { questions: [
    { q: 'Name one contact force and one non-contact force.', a: ['friction and gravity', 'push and gravity', 'tension and magnetism', 'normal force and gravity'], type: 'multi', difficulty: 1, rule: 'Contact forces require physical touch (push, pull, friction, tension, normal force). Non-contact forces act at a distance (gravity, magnetism, electrostatic force).', hint: 'Contact means touching. Think about forces where objects must be in physical contact versus forces that work through empty space.' },
    { q: 'True or false: Gravity is a contact force.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Gravity is a non-contact force. It acts between objects without them touching. Earth pulls on the Moon through the vacuum of space.' },
    { q: 'Which type of force keeps a book resting on a table from falling through?', a: ['normal force', 'normal'], type: 'multi', difficulty: 1, rule: 'The normal force is a contact force that pushes perpendicular to a surface, preventing objects from passing through it.', hint: 'This force acts perpendicular (at right angles) to the surface the book sits on.' },
    { q: 'A magnet attracts a paperclip from a distance. Is this a contact or non-contact force?', a: ['non-contact', 'non contact', 'noncontact'], type: 'multi', difficulty: 1, rule: 'Magnetic force is a non-contact force because it can attract or repel objects without physical contact.' },
    { q: 'Which of these is NOT a force? (a) gravity (b) friction (c) energy (d) tension', a: ['c', 'energy'], type: 'multi', difficulty: 2, explanation: 'Energy is not a force. Energy is the ability to do work. Gravity, friction, and tension are all forces.', hint: 'A force is a push or pull that can change an object\'s motion. One of these options describes something different.' },
    { q: 'A stretched rubber band exerts what type of force?', a: ['elastic force', 'elastic', 'tension'], type: 'multi', difficulty: 2, rule: 'Elastic (or tension) force is a contact force exerted by stretched or compressed materials trying to return to their original shape.' },
    { q: 'What is the SI unit used to measure force?', a: ['newton', 'newtons', 'N'], type: 'multi', difficulty: 2, rule: 'Force is measured in newtons (N), named after Sir Isaac Newton. 1 N is roughly the weight of a small apple.' },
    { q: 'Explain why gravity is classified differently from friction, even though both are common forces.', a: 'Gravity acts at a distance without contact while friction requires surfaces to be touching.', type: 'open', difficulty: 3, hint: 'Think about whether the objects need to be touching for each force to act.' },
  ]},
  'net-force': { questions: [
    { q: 'Two people push a box in the same direction with forces of 10 N and 15 N. What is the net force?', a: '25 N', type: 'calculation', difficulty: 1, rule: 'When forces act in the same direction, add them to find the net force.', hint: 'Forces in the same direction add together.' },
    { q: 'A 20 N force pulls an object to the right and a 20 N force pulls it to the left. What is the net force?', a: ['0 N', '0', 'zero'], type: 'multi', difficulty: 1, rule: 'When equal forces act in opposite directions, the net force is zero.', hint: 'Opposite forces of equal size cancel each other out.' },
    { q: 'True or false: The net force is always equal to the largest individual force acting on an object.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Net force depends on the direction and magnitude of ALL forces. Opposing forces subtract, same-direction forces add.' },
    { q: 'A dog pulls a sled forward with 50 N while friction pushes back with 30 N. What is the net force?', a: ['20 N forward', '20 N', '20'], type: 'multi', difficulty: 2, rule: 'When forces act in opposite directions, subtract the smaller from the larger. The net force is in the direction of the larger force.', hint: 'Subtract the opposing force from the applied force.' },
    { q: 'Three forces act on an object: 8 N east, 3 N west, and 2 N west. What is the net force?', a: ['3 N east', '3 N'], type: 'multi', difficulty: 2, hint: 'First combine the westward forces (3 + 2 = 5 N west), then subtract from the eastward force.' },
    { q: 'A skydiver falls with 800 N of gravity pulling down and 800 N of air resistance pushing up. What is the net force and what happens to the skydiver\'s speed?', a: ['0 N', 'zero', '0'], type: 'multi', difficulty: 3, explanation: 'The net force is 0 N. The skydiver falls at a constant speed called terminal velocity.', hint: 'What happens when opposing forces are equal?' },
    { q: 'Why does the direction of forces matter when calculating net force?', a: 'Forces in opposite directions partially or fully cancel each other, so direction determines whether forces add or subtract.', type: 'open', difficulty: 3 },
  ]},
  'balanced-unbalanced': { questions: [
    { q: 'True or false: An object with balanced forces acting on it will stay at rest or keep moving at constant speed.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Balanced forces produce zero net force, so the object\'s motion does not change.' },
    { q: 'A book sits on a table without moving. Are the forces on the book balanced or unbalanced?', a: ['balanced'], type: 'multi', difficulty: 1, rule: 'When an object is at rest and stays at rest, the forces are balanced (net force = 0).', hint: 'The book is not accelerating in any direction.' },
    { q: 'A soccer ball that was sitting still suddenly starts rolling. Are the forces balanced or unbalanced?', a: ['unbalanced'], type: 'multi', difficulty: 1, rule: 'Unbalanced forces cause a change in motion: speeding up, slowing down, or changing direction.', hint: 'The ball changed from not moving to moving. What kind of forces cause a change in motion?' },
    { q: 'True or false: If an object is moving, the forces on it must be unbalanced.', a: 'false', type: 'tf', difficulty: 2, explanation: 'An object can move at constant speed in a straight line with balanced forces (zero net force). Only a CHANGE in motion requires unbalanced forces.', misconception: 'Many students think motion always requires a force. In fact, constant velocity requires zero net force.' },
    { q: 'A car drives at a constant 60 km/h on a straight highway. Are the forces balanced or unbalanced?', a: ['balanced'], type: 'multi', difficulty: 2, hint: 'Constant speed in a straight line means no acceleration. What does that tell you about the net force?' },
    { q: 'Two teams play tug-of-war. Team A pulls with 500 N and Team B pulls with 450 N. Are the forces balanced or unbalanced? Which team wins?', a: ['unbalanced', 'team A'], type: 'multi', difficulty: 2, explanation: 'The forces are unbalanced (net 50 N toward Team A), so Team A wins.' },
    { q: 'Explain the difference between balanced and unbalanced forces using an example of a parked car and a car that is speeding up.', a: 'A parked car has balanced forces (gravity down equals normal force up, net force is zero). A car speeding up has unbalanced forces (engine force forward is greater than friction and drag backward).', type: 'open', difficulty: 3 },
  ]},
  'force-diagrams': { questions: [
    { q: 'What is another name for a force diagram that uses arrows to show all forces on an object?', a: ['free body diagram', 'free-body diagram', 'FBD'], type: 'multi', difficulty: 1, rule: 'A free-body diagram (FBD) shows all forces acting on a single object using arrows. Arrow length represents force magnitude; arrow direction represents force direction.' },
    { q: 'In a force diagram, what does the length of an arrow represent?', a: ['magnitude', 'size', 'strength', 'size of the force', 'magnitude of the force'], type: 'multi', difficulty: 1, rule: 'Longer arrows represent larger forces; shorter arrows represent smaller forces.' },
    { q: 'True or false: In a free-body diagram, you draw arrows for forces the object exerts on other things.', a: 'false', type: 'tf', difficulty: 1, explanation: 'A free-body diagram only shows forces acting ON the object, not forces the object exerts on other things.' },
    { q: 'A box sits on a flat floor. Name the two forces you would draw in its free-body diagram.', a: ['gravity and normal force', 'weight and normal force', 'gravity down and normal force up'], type: 'multi', difficulty: 2, hint: 'One force pulls the box toward Earth. The other force is the floor pushing back up.' },
    { q: 'A ball is thrown straight up and is in the air (ignore air resistance). How many forces act on it?', a: ['1', 'one'], type: 'multi', difficulty: 2, explanation: 'Only gravity acts on the ball once it leaves your hand (ignoring air resistance). There is no upward force; the ball moves up because of its initial velocity.', misconception: 'Many students think there must be an upward force while the ball moves up. The ball\'s upward motion is due to inertia, not an upward force.' },
    { q: 'A box is pushed across a floor at constant speed. Draw the forces: 40 N push to the right. What must friction be?', a: ['40 N', '40 N to the left', '40'], type: 'multi', difficulty: 2, hint: 'Constant speed means balanced forces. If the push is 40 N right, what must friction be for net force to equal zero?' },
    { q: 'Why are free-body diagrams useful for solving physics problems?', a: 'They help you identify and organize all forces acting on an object so you can calculate the net force and predict the object\'s motion.', type: 'open', difficulty: 3 },
  ]},

  // ── newtons-laws ───────────────────────────────────────────────────────────
  'first-law-inertia': { questions: [
    { q: 'State Newton\'s First Law of Motion in your own words.', a: 'An object at rest stays at rest and an object in motion stays in motion at the same speed and direction unless acted on by an unbalanced force.', type: 'open', difficulty: 1, rule: 'Newton\'s First Law (Law of Inertia): An object will maintain its state of rest or uniform motion unless a net external force acts on it.' },
    { q: 'True or false: A hockey puck sliding on frictionless ice will eventually stop on its own.', a: 'false', type: 'tf', difficulty: 1, explanation: 'With no friction (no unbalanced force), Newton\'s First Law says the puck will continue moving at the same speed forever.' },
    { q: 'What is inertia?', a: ['the tendency of an object to resist changes in motion', 'resistance to change in motion', 'tendency to resist change in motion'], type: 'multi', difficulty: 1, rule: 'Inertia is the property of matter that resists changes in motion. More mass means more inertia.' },
    { q: 'Why do passengers lurch forward when a car brakes suddenly?', a: ['inertia', 'their bodies tend to keep moving forward due to inertia'], type: 'multi', difficulty: 2, hint: 'Think about what your body wants to keep doing when the car stops.' },
    { q: 'Which has more inertia: a bowling ball or a tennis ball? Why?', a: ['bowling ball', 'the bowling ball because it has more mass'], type: 'multi', difficulty: 2, rule: 'The more mass an object has, the more inertia it has and the harder it is to change its motion.' },
    { q: 'A tablecloth is pulled quickly from under dishes. The dishes barely move. Explain why using Newton\'s First Law.', a: 'The dishes have inertia and tend to stay at rest. The tablecloth is pulled so quickly that friction does not have enough time to transfer significant force to the dishes.', type: 'open', difficulty: 3 },
    { q: 'True or false: Newton\'s First Law only applies to objects that are not moving.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Newton\'s First Law applies to ALL objects. Objects at rest stay at rest, AND objects in motion stay in motion at constant velocity, unless acted on by an unbalanced force.' },
    { q: 'A ball rolls across the floor and eventually stops. Does this violate Newton\'s First Law? Explain.', a: 'No. An unbalanced force (friction) acts on the ball, causing it to slow down and stop. Without friction, it would keep rolling.', type: 'open', difficulty: 3 },
  ]},
  'second-law-fma': { questions: [
    { q: 'Write the equation for Newton\'s Second Law.', a: ['F = ma', 'F=ma', 'force equals mass times acceleration'], type: 'multi', difficulty: 1, rule: 'Newton\'s Second Law: F = ma. Net force (N) equals mass (kg) times acceleration (m/s^2).' },
    { q: 'A 5 kg object has a net force of 20 N applied to it. What is its acceleration?', a: ['4 m/s^2', '4 m/s2', '4', '4 m/s squared'], type: 'multi', difficulty: 1, hint: 'Use F = ma. Rearrange to a = F/m. Then a = 20/5.', rule: 'a = F/m. Divide the net force by the mass to find acceleration.' },
    { q: 'If mass doubles but force stays the same, what happens to acceleration?', a: ['halves', 'it halves', 'decreases by half', 'cut in half', 'half'], type: 'multi', difficulty: 2, rule: 'Since a = F/m, doubling mass (m) with the same force (F) means acceleration is cut in half.' },
    { q: 'True or false: A heavier object always accelerates more slowly than a lighter object.', a: 'false', type: 'tf', difficulty: 2, explanation: 'It depends on the force. A heavier object can accelerate faster if a much larger force is applied to it. Acceleration depends on BOTH force and mass.' },
    { q: 'What net force is needed to accelerate a 10 kg shopping cart at 3 m/s^2?', a: ['30 N', '30'], type: 'multi', difficulty: 2, hint: 'F = ma = 10 kg x 3 m/s^2.' },
    { q: 'A 1,000 kg car accelerates at 2 m/s^2. What is the net force on the car?', a: ['2000 N', '2,000 N', '2000'], type: 'multi', difficulty: 2, hint: 'F = ma = 1000 x 2.' },
    { q: 'Two boxes are pushed with the same force. Box A has a mass of 2 kg and Box B has a mass of 8 kg. How many times greater is the acceleration of Box A compared to Box B?', a: ['4 times', '4', 'four times'], type: 'multi', difficulty: 3, hint: 'Find the ratio of accelerations: a_A/a_B = (F/m_A) / (F/m_B) = m_B/m_A.' },
    { q: 'Explain in your own words why a fully loaded truck takes longer to stop than an empty truck traveling at the same speed.', a: 'The loaded truck has more mass, so by F = ma, the same braking force produces less deceleration (acceleration is smaller). It takes longer to slow down.', type: 'open', difficulty: 3 },
  ]},
  'third-law-action-reaction': { questions: [
    { q: 'State Newton\'s Third Law of Motion.', a: ['for every action there is an equal and opposite reaction', 'every action has an equal and opposite reaction'], type: 'multi', difficulty: 1, rule: 'Newton\'s Third Law: For every action force, there is an equal and opposite reaction force. The forces act on DIFFERENT objects.' },
    { q: 'True or false: When you push on a wall, the wall pushes back on you with an equal force.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The wall exerts a reaction force on your hand that is equal in magnitude and opposite in direction to your push.' },
    { q: 'A swimmer pushes water backward with her hands. What is the reaction force?', a: ['the water pushes the swimmer forward', 'water pushes swimmer forward', 'water pushes her forward'], type: 'multi', difficulty: 1, hint: 'The reaction force acts on the swimmer, not the water.' },
    { q: 'True or false: Action and reaction forces act on the same object.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Action and reaction forces ALWAYS act on DIFFERENT objects. If you push on a desk, you exert a force on the desk and the desk exerts a force on you.', misconception: 'A common mistake is thinking both forces act on one object. They always act on two different objects.' },
    { q: 'When you jump, you push down on the ground. What happens as a result?', a: ['the ground pushes you up', 'ground pushes you upward', 'the ground exerts an upward force on you'], type: 'multi', difficulty: 2, rule: 'Your downward push on the ground produces an equal upward reaction force from the ground, which launches you into the air.' },
    { q: 'If action and reaction forces are always equal, why don\'t they cancel out?', a: 'They act on different objects, so they cannot cancel. Forces only cancel when they act on the same object.', type: 'open', difficulty: 3, hint: 'Think about which object each force acts on.' },
    { q: 'A rocket launches by pushing hot gas downward. Explain how Newton\'s Third Law makes the rocket go up.', a: 'The rocket pushes exhaust gas downward (action). The gas pushes the rocket upward with an equal and opposite force (reaction). This reaction force accelerates the rocket upward.', type: 'open', difficulty: 3 },
  ]},
  'applying-newtons-laws': { questions: [
    { q: 'A 3 kg toy car is pushed with 12 N of force. Friction is 3 N. What is its acceleration?', a: ['3 m/s^2', '3 m/s2', '3'], type: 'multi', difficulty: 2, hint: 'Net force = 12 - 3 = 9 N. Then a = F_net / m = 9/3.', rule: 'First find net force by subtracting friction, then use F = ma.' },
    { q: 'An astronaut floats a tool toward a crewmate on the space station. Why does the tool keep moving at the same speed?', a: ['no friction or unbalanced force in space to slow it down', 'Newton\'s first law', 'no unbalanced force'], type: 'multi', difficulty: 2, hint: 'Think about Newton\'s First Law and the near-absence of friction in space.' },
    { q: 'A 50 kg skater pushes off a wall with 100 N. What is the skater\'s acceleration? What force does the wall exert on the skater?', a: ['2 m/s^2', '100 N', '2 m/s2 and 100 N back on the skater'], type: 'multi', difficulty: 2, hint: 'Use F = ma for acceleration. For the wall\'s force, use Newton\'s Third Law.' },
    { q: 'True or false: In a head-on collision between a truck and a small car, the truck exerts a greater force on the car than the car exerts on the truck.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Newton\'s Third Law says the forces are equal. However, the car has less mass, so it experiences greater acceleration (F = ma), which is why the car is damaged more.', misconception: 'Students often think the bigger object exerts more force. The forces are equal; the difference is in acceleration due to different masses.' },
    { q: 'A 70 kg person stands on a scale in an elevator accelerating upward at 2 m/s^2. What is the net force on the person?', a: ['140 N', '140 N upward', '140'], type: 'multi', difficulty: 3, hint: 'F_net = ma = 70 x 2 = 140 N upward.' },
    { q: 'Explain why wearing a seatbelt is important using Newton\'s Laws.', a: 'By Newton\'s First Law, your body continues moving forward when the car stops suddenly (inertia). The seatbelt provides an unbalanced force to decelerate your body with the car. By Newton\'s Second Law, the seatbelt spreads the stopping force over a larger area and longer time, reducing injury.', type: 'open', difficulty: 3 },
  ]},

  // ── motion ─────────────────────────────────────────────────────────────────
  'speed-velocity': { questions: [
    { q: 'A car travels 100 km in 2 hours. What is its average speed?', a: ['50 km/h', '50 km/hr', '50'], type: 'multi', difficulty: 1, rule: 'Average speed = total distance / total time. Speed = 100 km / 2 h = 50 km/h.', hint: 'Divide the total distance by the total time.' },
    { q: 'True or false: Speed and velocity are the same thing.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Speed is how fast an object moves (magnitude only). Velocity includes both speed AND direction. 50 km/h is a speed; 50 km/h north is a velocity.' },
    { q: 'What is the difference between speed and velocity?', a: 'Speed is the magnitude of how fast something moves. Velocity includes both speed and direction.', type: 'open', difficulty: 1, hint: 'One of them includes direction information.' },
    { q: 'A student walks 400 m north in 200 seconds. What is her velocity?', a: ['2 m/s north', '2 m/s N', '2 m/s'], type: 'multi', difficulty: 2, hint: 'Velocity = displacement / time, and include the direction.' },
    { q: 'An object moves in a circle at a constant speed of 10 m/s. Is its velocity constant?', a: ['no', 'false', 'no because direction changes'], type: 'multi', difficulty: 2, explanation: 'Even though speed is constant, the direction keeps changing, so velocity is NOT constant.', misconception: 'Students often confuse constant speed with constant velocity. If direction changes, velocity changes.' },
    { q: 'A runner completes a 400 m track in 50 seconds, returning to the start. What is the average speed? What is the average velocity?', a: ['speed is 8 m/s and velocity is 0 m/s', '8 m/s speed, 0 m/s velocity'], type: 'multi', difficulty: 3, hint: 'Average speed uses total distance. Average velocity uses displacement (change in position).' },
    { q: 'Convert 72 km/h to m/s.', a: ['20 m/s', '20'], type: 'multi', difficulty: 2, rule: 'To convert km/h to m/s, divide by 3.6. 72 / 3.6 = 20 m/s.', hint: 'Divide km/h by 3.6 to get m/s.' },
  ]},
  'acceleration': { questions: [
    { q: 'What is acceleration?', a: ['the rate of change of velocity', 'change in velocity over time', 'rate of change of velocity over time'], type: 'multi', difficulty: 1, rule: 'Acceleration = change in velocity / time. Units: m/s^2. Acceleration can mean speeding up, slowing down, or changing direction.' },
    { q: 'A car goes from 0 to 20 m/s in 5 seconds. What is its acceleration?', a: ['4 m/s^2', '4 m/s2', '4'], type: 'multi', difficulty: 1, rule: 'a = (v_f - v_i) / t = (20 - 0) / 5 = 4 m/s^2.', hint: 'Subtract initial velocity from final velocity, then divide by time.' },
    { q: 'True or false: An object that is slowing down has negative acceleration (deceleration).', a: 'true', type: 'tf', difficulty: 1, explanation: 'When an object slows down, its velocity decreases over time, resulting in negative acceleration (also called deceleration).' },
    { q: 'A bicycle goes from 12 m/s to 4 m/s in 4 seconds. What is its acceleration?', a: ['-2 m/s^2', '-2 m/s2', '-2'], type: 'multi', difficulty: 2, hint: 'a = (4 - 12) / 4 = -8/4.' },
    { q: 'A ball is dropped and its speed increases by 9.8 m/s every second. What is the acceleration?', a: ['9.8 m/s^2', '9.8 m/s2', '9.8', '10 m/s^2'], type: 'multi', difficulty: 2, rule: 'This describes gravitational acceleration near Earth\'s surface, approximately 9.8 m/s^2 downward.' },
    { q: 'Can an object have a constant speed but still be accelerating? Explain.', a: 'Yes, if the object changes direction. Acceleration is a change in velocity, and velocity includes direction. An object moving in a circle at constant speed is always accelerating.', type: 'open', difficulty: 3 },
    { q: 'A train accelerates from rest at 1.5 m/s^2 for 20 seconds. What is its final speed?', a: ['30 m/s', '30'], type: 'multi', difficulty: 2, hint: 'v_f = v_i + at = 0 + 1.5 x 20.' },
  ]},
  'distance-time-graphs': { questions: [
    { q: 'On a distance-time graph, what does a straight diagonal line going up mean?', a: ['constant speed', 'moving at constant speed', 'uniform speed'], type: 'multi', difficulty: 1, rule: 'A straight line with a positive slope on a distance-time graph represents constant (uniform) speed.' },
    { q: 'True or false: A horizontal line on a distance-time graph means the object is at rest.', a: 'true', type: 'tf', difficulty: 1, explanation: 'A horizontal line means distance is not changing over time, so the object is stationary.' },
    { q: 'On a distance-time graph, how do you calculate speed?', a: ['slope', 'rise over run', 'the slope of the line', 'change in distance divided by change in time'], type: 'multi', difficulty: 1, rule: 'Speed = slope = rise/run = change in distance / change in time.' },
    { q: 'A line on a distance-time graph has a steep slope compared to another line. Which object is moving faster?', a: ['the steeper line', 'steeper', 'the one with the steep slope'], type: 'multi', difficulty: 2, hint: 'A steeper slope means more distance covered in the same amount of time.' },
    { q: 'What does a curved line on a distance-time graph indicate?', a: ['changing speed', 'acceleration', 'the object is accelerating or decelerating'], type: 'multi', difficulty: 2, rule: 'A curve on a distance-time graph means the speed is changing. If the curve gets steeper, the object is speeding up.' },
    { q: 'An object travels 30 m in 10 s, then stays at 30 m for 5 s, then travels to 60 m in 10 s. What is the average speed for the entire trip?', a: ['2.4 m/s', '2.4'], type: 'multi', difficulty: 3, hint: 'Total distance = 60 m. Total time = 10 + 5 + 10 = 25 s. Average speed = 60/25.' },
    { q: 'Describe what the motion of an object looks like if its distance-time graph is a straight line that goes up, then becomes horizontal, then goes up steeply.', a: 'The object moves at constant speed, then stops for a while, then moves faster than before.', type: 'open', difficulty: 2 },
  ]},
  'velocity-time-graphs': { questions: [
    { q: 'On a velocity-time graph, what does the slope of the line represent?', a: ['acceleration'], type: 'multi', difficulty: 1, rule: 'The slope of a velocity-time graph represents acceleration. Positive slope = speeding up; negative slope = slowing down; zero slope = constant velocity.' },
    { q: 'True or false: On a velocity-time graph, the area under the line represents distance traveled.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The area under a velocity-time graph equals the displacement (or distance traveled if motion is in one direction).' },
    { q: 'A velocity-time graph shows a horizontal line at 10 m/s. What is the acceleration?', a: ['0', '0 m/s^2', 'zero'], type: 'multi', difficulty: 1, hint: 'Horizontal line means velocity is not changing.' },
    { q: 'An object\'s velocity-time graph shows a straight line from 0 m/s to 20 m/s over 4 seconds. What is the acceleration?', a: ['5 m/s^2', '5 m/s2', '5'], type: 'multi', difficulty: 2, hint: 'Slope = rise/run = (20-0)/4.' },
    { q: 'On a velocity-time graph, what does a line crossing from positive to negative velocity mean?', a: ['the object changed direction', 'it reversed direction', 'the object stopped and went the other way'], type: 'multi', difficulty: 2, rule: 'When velocity crosses zero and becomes negative, the object has stopped momentarily and reversed its direction of motion.' },
    { q: 'A car moves at 15 m/s for 10 seconds. Calculate the distance traveled using the velocity-time graph.', a: ['150 m', '150'], type: 'multi', difficulty: 2, hint: 'Area under the line = velocity x time = 15 x 10.' },
    { q: 'Explain how you can tell the difference between an object speeding up, slowing down, and moving at constant velocity on a velocity-time graph.', a: 'Speeding up: line slopes upward (positive slope). Slowing down: line slopes downward (negative slope). Constant velocity: horizontal line (zero slope).', type: 'open', difficulty: 3 },
  ]},

  // ── gravity ────────────────────────────────────────────────────────────────
  'gravitational-force': { questions: [
    { q: 'What two factors determine the strength of gravitational force between two objects?', a: ['mass and distance', 'their masses and the distance between them'], type: 'multi', difficulty: 1, rule: 'Gravitational force depends on (1) the masses of the two objects and (2) the distance between their centers. More mass = stronger gravity. More distance = weaker gravity.' },
    { q: 'True or false: Gravity only pulls things down toward the ground.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Gravity is an attractive force between ANY two objects with mass. The Earth pulls on you and you pull on the Earth. The Sun pulls on the planets. Every object with mass attracts every other object.', misconception: 'Students often think gravity is just "what makes things fall." It is a universal force between all masses.' },
    { q: 'What is the approximate acceleration due to gravity on Earth\'s surface?', a: ['9.8 m/s^2', '9.8 m/s2', '9.8', '10 m/s^2', '10'], type: 'multi', difficulty: 1, rule: 'On Earth, gravitational acceleration is approximately 9.8 m/s^2 (often rounded to 10 m/s^2 for calculations).' },
    { q: 'If you moved farther from Earth\'s center (like to the top of a very tall mountain), would gravity be stronger or weaker?', a: ['weaker'], type: 'multi', difficulty: 2, rule: 'Gravity decreases with distance. The farther you are from Earth\'s center, the weaker the gravitational pull.' },
    { q: 'True or false: The Moon has the same gravitational acceleration as Earth.', a: 'false', type: 'tf', difficulty: 2, explanation: 'The Moon has less mass than Earth, so its surface gravity is only about 1/6 of Earth\'s (approximately 1.6 m/s^2).' },
    { q: 'Two objects are attracted by gravity. If the mass of one object doubles, what happens to the gravitational force?', a: ['it doubles', 'doubles'], type: 'multi', difficulty: 2, hint: 'Gravitational force is directly proportional to mass.' },
    { q: 'Why do astronauts on the International Space Station appear to float even though they are only about 400 km above Earth?', a: 'They are in free fall, continuously falling around Earth. Gravity is still acting on them (it is only slightly weaker at that altitude). They appear weightless because they and the station are falling together.', type: 'open', difficulty: 3 },
  ]},
  'free-fall': { questions: [
    { q: 'What is free fall?', a: ['when an object falls under the influence of gravity alone', 'falling with only gravity acting on it', 'motion under gravity only'], type: 'multi', difficulty: 1, rule: 'Free fall is motion where the only force acting on an object is gravity (no air resistance).' },
    { q: 'True or false: In free fall (no air resistance), a heavy ball and a light ball dropped from the same height hit the ground at the same time.', a: 'true', type: 'tf', difficulty: 1, explanation: 'All objects in free fall accelerate at the same rate (9.8 m/s^2 on Earth), regardless of mass. Galileo demonstrated this centuries ago.', misconception: 'Many students believe heavier objects fall faster. In a vacuum, all objects fall at the same rate.' },
    { q: 'An object is dropped from rest. What is its speed after 3 seconds of free fall? (Use g = 10 m/s^2)', a: ['30 m/s', '30'], type: 'multi', difficulty: 2, hint: 'v = g x t = 10 x 3.', rule: 'In free fall from rest, speed = g x t.' },
    { q: 'How far does a dropped object fall in 2 seconds? (Use g = 10 m/s^2)', a: ['20 m', '20'], type: 'multi', difficulty: 2, hint: 'd = 1/2 x g x t^2 = 0.5 x 10 x 4.', rule: 'Distance in free fall: d = (1/2)gt^2.' },
    { q: 'A ball is thrown upward. At the very top of its path, what is its velocity? What is its acceleration?', a: ['velocity is 0 and acceleration is 9.8 m/s^2 downward', '0 velocity, 9.8 m/s^2 down'], type: 'multi', difficulty: 2, explanation: 'At the peak, velocity is momentarily zero, but acceleration is still 9.8 m/s^2 downward because gravity never stops.' },
    { q: 'Explain why a feather and a hammer fall at the same rate in a vacuum but not in air.', a: 'In a vacuum there is no air resistance, so only gravity acts and all objects accelerate equally. In air, the feather has a large surface area relative to its weight, so air resistance slows it significantly more than the hammer.', type: 'open', difficulty: 3 },
  ]},
  'weight-vs-mass': { questions: [
    { q: 'What is the difference between mass and weight?', a: 'Mass is the amount of matter in an object, measured in kilograms. Weight is the force of gravity on an object, measured in newtons.', type: 'open', difficulty: 1, rule: 'Mass (kg) is the amount of matter. Weight (N) is the gravitational force: W = mg.' },
    { q: 'What is the weight of a 10 kg object on Earth? (Use g = 10 m/s^2)', a: ['100 N', '100', '98 N'], type: 'multi', difficulty: 1, hint: 'Weight = mass x gravity = 10 x 10.', rule: 'W = mg.' },
    { q: 'True or false: Your mass changes when you go to the Moon.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Mass is the amount of matter in your body and does not change with location. Weight changes because the Moon has less gravity.' },
    { q: 'An astronaut has a mass of 80 kg. On the Moon (g = 1.6 m/s^2), what is their weight?', a: ['128 N', '128'], type: 'multi', difficulty: 2, hint: 'W = mg = 80 x 1.6.' },
    { q: 'True or false: A bathroom scale measures your mass.', a: 'false', type: 'tf', difficulty: 2, explanation: 'A bathroom scale actually measures force (weight). It is calibrated to display the equivalent mass value on Earth, but it would give a different reading on the Moon.', misconception: 'Students often think scales measure mass directly. Scales measure weight (force) and convert to mass using Earth\'s gravity.' },
    { q: 'An object weighs 60 N on Earth (g = 10 m/s^2). What is its mass?', a: ['6 kg', '6'], type: 'multi', difficulty: 2, hint: 'm = W/g = 60/10.' },
    { q: 'Explain why an astronaut on the International Space Station appears weightless but still has mass.', a: 'The astronaut still has the same mass (same amount of matter). They appear weightless because they are in free fall along with the station, so there is no contact force (no normal force) to feel. Gravity still acts on them.', type: 'open', difficulty: 3 },
  ]},
  'projectile-motion': { questions: [
    { q: 'What is projectile motion?', a: ['the curved path of an object launched into the air acted on only by gravity', 'motion of an object thrown or launched that follows a curved path under gravity'], type: 'multi', difficulty: 1, rule: 'Projectile motion is the curved path of an object that is launched, thrown, or dropped and is acted upon only by gravity (ignoring air resistance).' },
    { q: 'True or false: A ball thrown horizontally from a cliff takes longer to hit the ground than a ball simply dropped from the same height.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Both balls have the same vertical acceleration (gravity) and start with zero vertical velocity. They hit the ground at the same time. The thrown ball just travels farther horizontally.', misconception: 'Students often think the thrown ball stays in the air longer because it goes farther. Horizontal and vertical motions are independent.' },
    { q: 'In projectile motion, what direction does gravity accelerate the object?', a: ['downward', 'down', 'vertically downward'], type: 'multi', difficulty: 1, rule: 'Gravity always pulls downward (toward Earth\'s center). It affects only the vertical component of motion.' },
    { q: 'A football is kicked at an angle. At what point in its path is the speed the slowest?', a: ['at the top', 'at the highest point', 'the peak', 'at the peak'], type: 'multi', difficulty: 2, hint: 'Think about when the vertical component of velocity is zero.' },
    { q: 'True or false: In projectile motion (no air resistance), the horizontal speed of the object changes during flight.', a: 'false', type: 'tf', difficulty: 2, explanation: 'With no air resistance, there is no horizontal force, so horizontal speed stays constant. Only vertical speed changes (due to gravity).' },
    { q: 'A marble rolls off the edge of a 1.25 m high table. It takes 0.5 seconds to hit the floor. If its horizontal speed is 3 m/s, how far from the table base does it land?', a: ['1.5 m', '1.5'], type: 'multi', difficulty: 3, hint: 'Horizontal distance = horizontal speed x time = 3 x 0.5.' },
  ]},

  // ── friction-drag ──────────────────────────────────────────────────────────
  'static-friction': { questions: [
    { q: 'What is static friction?', a: ['the friction that prevents a stationary object from starting to move', 'friction that keeps an object at rest', 'friction before an object starts moving'], type: 'multi', difficulty: 1, rule: 'Static friction acts on objects that are not moving. It prevents motion from starting and matches the applied force up to a maximum value.' },
    { q: 'True or false: Static friction is always the same strength.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Static friction adjusts its magnitude to match the applied force, up to its maximum value. Push gently and static friction is small. Push harder and static friction increases.' },
    { q: 'You push a heavy box with 50 N but it does not move. What can you say about the static friction force?', a: ['it is 50 N', '50 N', 'equal to 50 N'], type: 'multi', difficulty: 2, hint: 'If the box is not moving, forces must be balanced.' },
    { q: 'True or false: Static friction is generally greater than kinetic friction for the same surfaces.', a: 'true', type: 'tf', difficulty: 2, explanation: 'It typically takes more force to START an object moving (overcome static friction) than to KEEP it moving (overcome kinetic friction).' },
    { q: 'Why is it harder to start pushing a heavy refrigerator than to keep it sliding once it starts moving?', a: 'Static friction (which resists starting motion) is usually greater than kinetic friction (which resists motion once sliding has begun).', type: 'open', difficulty: 2 },
    { q: 'Name two factors that affect the maximum static friction force.', a: ['the normal force and the types of surfaces in contact', 'weight and surface roughness', 'normal force and coefficient of friction'], type: 'multi', difficulty: 3, rule: 'Maximum static friction depends on (1) the normal force (heavier objects have more friction) and (2) the coefficient of static friction (depends on surface materials).' },
  ]},
  'kinetic-friction': { questions: [
    { q: 'What is kinetic friction?', a: ['friction that acts on objects that are already moving', 'friction between surfaces in relative motion', 'friction during sliding'], type: 'multi', difficulty: 1, rule: 'Kinetic friction acts on objects that are sliding or moving relative to a surface. It always opposes the direction of motion.' },
    { q: 'True or false: Kinetic friction acts in the same direction as motion.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Kinetic friction always acts OPPOSITE to the direction of motion, slowing the object down.' },
    { q: 'A box slides across the floor at constant speed when pushed with 25 N. What is the kinetic friction force?', a: ['25 N', '25'], type: 'multi', difficulty: 2, hint: 'Constant speed means balanced forces. The push forward equals friction backward.' },
    { q: 'Which has less friction: sliding a block on sandpaper or on ice?', a: ['ice', 'on ice', 'sliding on ice'], type: 'multi', difficulty: 1, hint: 'Think about which surface is smoother.' },
    { q: 'A 20 N force pushes a box across a table. Kinetic friction is 8 N. What is the net force and the resulting motion?', a: ['12 N', '12 N in the direction of the push', '12'], type: 'multi', difficulty: 2, hint: 'Net force = applied force - friction = 20 - 8.' },
    { q: 'Explain why lubricants (like oil) reduce kinetic friction.', a: 'Lubricants create a thin layer between two surfaces, reducing direct contact between the rough surface features. This means there is less resistance to sliding motion.', type: 'open', difficulty: 3 },
    { q: 'True or false: Doubling the speed of a sliding object doubles the kinetic friction force.', a: 'false', type: 'tf', difficulty: 3, explanation: 'For dry surfaces, kinetic friction is approximately constant regardless of speed. It depends on the normal force and surface materials, not speed.' },
  ]},
  'air-resistance': { questions: [
    { q: 'What is air resistance (drag)?', a: ['a friction-like force that opposes the motion of objects through air', 'force that slows objects moving through air', 'drag force from air'], type: 'multi', difficulty: 1, rule: 'Air resistance (drag) is a force that opposes the motion of objects moving through air. It depends on speed, surface area, and shape.' },
    { q: 'True or false: Air resistance increases as an object moves faster.', a: 'true', type: 'tf', difficulty: 1, explanation: 'The faster an object moves through air, the greater the air resistance force acting on it.' },
    { q: 'What is terminal velocity?', a: ['the maximum speed an object reaches when air resistance equals gravity', 'the constant speed when drag equals weight', 'maximum falling speed'], type: 'multi', difficulty: 2, rule: 'Terminal velocity is reached when air resistance equals the gravitational force. The net force becomes zero, so the object falls at a constant speed.' },
    { q: 'Why does a parachute slow down a skydiver?', a: ['it increases surface area which increases air resistance', 'larger surface area creates more drag'], type: 'multi', difficulty: 2, hint: 'Think about how surface area affects air resistance.' },
    { q: 'Two skydivers, one with a mass of 60 kg and one with 100 kg, open identical parachutes. Who has a higher terminal velocity?', a: ['the 100 kg skydiver', '100 kg', 'the heavier one'], type: 'multi', difficulty: 3, explanation: 'The heavier skydiver needs more air resistance to balance their greater weight, so they must fall faster to generate enough drag.' },
    { q: 'Explain why a crumpled piece of paper falls faster than a flat sheet of paper.', a: 'The flat sheet has a larger surface area facing the direction of motion, creating much more air resistance. The crumpled paper has less surface area and a more streamlined shape, so air resistance is smaller and it falls faster.', type: 'open', difficulty: 2 },
  ]},
  'friction-applications': { questions: [
    { q: 'Name two everyday situations where friction is helpful.', a: ['walking and braking', 'grip and traction', 'writing and walking'], type: 'multi', difficulty: 1, rule: 'Friction is helpful for walking (grip between shoes and ground), braking (stopping vehicles), writing (pencil on paper), and holding objects.' },
    { q: 'True or false: We always want to reduce friction.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Friction is sometimes helpful (walking, braking, gripping) and sometimes harmful (wears out machine parts, wastes energy as heat). We increase or decrease friction depending on the situation.' },
    { q: 'Why do car tires have treads?', a: ['to increase friction and grip on the road', 'for better traction', 'to channel water away and maintain grip'], type: 'multi', difficulty: 2, hint: 'Think about what happens on wet or slippery roads.' },
    { q: 'A 10 kg box is pushed across a floor with 50 N. Kinetic friction is 20 N. What is the acceleration?', a: ['3 m/s^2', '3 m/s2', '3'], type: 'multi', difficulty: 2, hint: 'Net force = 50 - 20 = 30 N. Then a = F/m = 30/10.' },
    { q: 'In winter, why do people spread sand or salt on icy roads?', a: ['to increase friction between tires and the road surface', 'to create more traction', 'to melt ice and increase friction'], type: 'multi', difficulty: 2 },
    { q: 'Engineers want to design a waterslide that is fast but safe. Explain how they balance friction in the design.', a: 'They use smooth, wet surfaces to reduce friction so riders go fast, but add rough sections or pools at the bottom to increase friction and slow riders down safely. The slide shape also uses curves to control speed.', type: 'open', difficulty: 3 },
  ]},

  // ── momentum ───────────────────────────────────────────────────────────────
  'momentum-basics': { questions: [
    { q: 'What is the formula for momentum?', a: ['p = mv', 'p=mv', 'momentum equals mass times velocity'], type: 'multi', difficulty: 1, rule: 'Momentum (p) = mass (m) x velocity (v). Units: kg*m/s. Momentum has direction (it is a vector).' },
    { q: 'A 2 kg ball moves at 3 m/s. What is its momentum?', a: ['6 kg*m/s', '6 kg m/s', '6'], type: 'multi', difficulty: 1, hint: 'p = mv = 2 x 3.' },
    { q: 'True or false: A parked car has momentum.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Momentum = mass x velocity. If velocity is zero, momentum is zero, regardless of mass.' },
    { q: 'Which has more momentum: a 1,000 kg car moving at 10 m/s or a 2,000 kg truck moving at 5 m/s?', a: ['they are equal', 'same', 'equal', 'both have 10000 kg*m/s'], type: 'multi', difficulty: 2, hint: 'Calculate p = mv for each. Car: 1000 x 10 = 10,000. Truck: 2000 x 5 = 10,000.' },
    { q: 'Why is it harder to stop a fast-moving truck than a slow-moving bicycle?', a: ['the truck has much more momentum due to its greater mass and potentially higher speed', 'more momentum means harder to stop'], type: 'multi', difficulty: 2, rule: 'Objects with more momentum require more force or more time to stop.' },
    { q: 'A 0.5 kg ball moving at 20 m/s has the same momentum as a 10 kg ball moving at what speed?', a: ['1 m/s', '1'], type: 'multi', difficulty: 3, hint: 'Set momenta equal: 0.5 x 20 = 10 x v. Solve for v.' },
    { q: 'Explain why a bullet (small mass) can be more dangerous than a thrown baseball (larger mass).', a: 'Although the bullet has less mass, its velocity is extremely high. Since momentum = mass x velocity, the bullet can have very high momentum. Also, it concentrates the force on a very small area, creating high pressure.', type: 'open', difficulty: 3 },
  ]},
  'impulse': { questions: [
    { q: 'What is impulse?', a: ['the product of force and the time it acts', 'force times time', 'change in momentum'], type: 'multi', difficulty: 1, rule: 'Impulse = Force x time (J = Ft). Impulse equals the change in momentum of an object.' },
    { q: 'A force of 100 N acts on a ball for 0.5 seconds. What is the impulse?', a: ['50 N*s', '50 Ns', '50 N s', '50'], type: 'multi', difficulty: 1, hint: 'Impulse = F x t = 100 x 0.5.' },
    { q: 'True or false: A small force acting for a long time can produce the same impulse as a large force acting for a short time.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Since impulse = force x time, you can get the same impulse by increasing one factor while decreasing the other. 10 N x 5 s = 50 N x 1 s.' },
    { q: 'Why do car airbags reduce injuries in a crash?', a: ['they increase the time of impact which reduces the force on the person', 'longer stopping time means less force'], type: 'multi', difficulty: 2, rule: 'Airbags increase the time over which the person decelerates. Since impulse (change in momentum) is the same, a longer time means less force: F = impulse / time.', hint: 'Think about how changing the time affects the force for the same change in momentum.' },
    { q: 'A 60 kg person goes from 10 m/s to 0 m/s. What is the impulse?', a: ['600 N*s', '600 Ns', '600 N s', '600', '-600 N*s'], type: 'multi', difficulty: 2, hint: 'Impulse = change in momentum = m(v_f - v_i) = 60(0 - 10).' },
    { q: 'Explain why bending your knees when landing from a jump reduces the impact force on your legs.', a: 'Bending your knees increases the time it takes to stop. Since the impulse (change in momentum) is the same regardless, a longer stopping time means the average force on your legs is smaller (F = impulse / time).', type: 'open', difficulty: 3 },
  ]},
  'conservation-of-momentum': { questions: [
    { q: 'State the law of conservation of momentum.', a: ['in a closed system the total momentum before a collision equals the total momentum after', 'total momentum is conserved in a closed system'], type: 'multi', difficulty: 1, rule: 'In a closed system (no external forces), the total momentum before an interaction equals the total momentum after. p_total before = p_total after.' },
    { q: 'True or false: In a collision between two objects, momentum can be created or destroyed.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Momentum is always conserved in a closed system. It can be transferred between objects but cannot be created or destroyed.' },
    { q: 'A 5 kg cart moving at 4 m/s collides with a stationary 5 kg cart and they stick together. What is their combined velocity?', a: ['2 m/s', '2'], type: 'multi', difficulty: 2, hint: 'p_before = 5 x 4 + 5 x 0 = 20. p_after = 10 x v. Solve: v = 20/10 = 2 m/s.' },
    { q: 'Two ice skaters push off each other from rest. Skater A (50 kg) moves left at 2 m/s. What is skater B\'s (60 kg) velocity?', a: ['1.67 m/s to the right', '1.67 m/s', '1.67', '5/3 m/s'], type: 'multi', difficulty: 3, hint: 'Total momentum before = 0. After: 50(-2) + 60(v) = 0. Solve for v.' },
    { q: 'True or false: If a moving ball hits a stationary ball and stops, the stationary ball must move with the same momentum the first ball had.', a: 'true', type: 'tf', difficulty: 2, explanation: 'By conservation of momentum, all the momentum from the first ball transfers to the second ball.' },
    { q: 'Explain how a rocket moves in space where there is nothing to push against, using conservation of momentum.', a: 'The rocket and its exhaust gas form a closed system. The rocket pushes exhaust gas backward, giving it momentum in one direction. By conservation of momentum, the rocket gains equal momentum in the opposite direction, propelling it forward.', type: 'open', difficulty: 3 },
  ]},
  'collision-types': { questions: [
    { q: 'What is the difference between an elastic and an inelastic collision?', a: 'In an elastic collision, both momentum and kinetic energy are conserved. In an inelastic collision, momentum is conserved but kinetic energy is not (some is converted to heat, sound, or deformation).', type: 'open', difficulty: 1, rule: 'Elastic: momentum AND kinetic energy conserved. Inelastic: only momentum conserved. Perfectly inelastic: objects stick together.' },
    { q: 'True or false: In all types of collisions, momentum is conserved.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Momentum is always conserved in a closed system, regardless of collision type. What differs is whether kinetic energy is also conserved.' },
    { q: 'Two clay balls collide and stick together. What type of collision is this?', a: ['perfectly inelastic', 'inelastic'], type: 'multi', difficulty: 1, rule: 'When objects stick together after a collision, it is called a perfectly inelastic collision.' },
    { q: 'Billiard balls colliding are close to what type of collision?', a: ['elastic'], type: 'multi', difficulty: 2, hint: 'Billiard balls bounce off each other and very little energy is lost to heat or sound.' },
    { q: 'In a perfectly inelastic collision, a 3 kg object moving at 6 m/s hits a stationary 3 kg object. They stick together. What is their velocity?', a: ['3 m/s', '3'], type: 'multi', difficulty: 2, hint: 'p = 3 x 6 = 18. Combined mass = 6 kg. v = 18/6 = 3 m/s.' },
    { q: 'A car crash is an inelastic collision. Where does the "lost" kinetic energy go?', a: ['it converts to heat, sound, and deformation of the vehicles', 'heat and sound and bending metal'], type: 'multi', difficulty: 2, rule: 'In inelastic collisions, kinetic energy is transformed into other forms: thermal energy (heat), sound energy, and deformation energy (crumpling metal).' },
    { q: 'Explain why perfectly elastic collisions are rare in everyday life.', a: 'In real collisions, some kinetic energy is always converted to heat, sound, or deformation. Perfectly elastic collisions (where zero kinetic energy is lost) really only occur at the atomic/molecular level. Everyday collisions like billiard balls are close but not perfectly elastic.', type: 'open', difficulty: 3 },
  ]},
};

// ═══════════════════════════════════════════════════════════════════════════════
// HINT BANKS — tiered hints per skill
// ═══════════════════════════════════════════════════════════════════════════════

const HINT_BANKS = {
  // forces-basics
  'types-of-forces': { tier1: 'Forces are pushes or pulls. Some require touching (contact forces) and some work at a distance (non-contact forces).', tier2: 'Contact forces: friction, tension, normal force, applied force. Non-contact forces: gravity, magnetism, electrostatic force.', tier3: 'Example: When you push a door, that is a contact force. When a magnet attracts a nail from across the table, that is a non-contact force (magnetism).' },
  'net-force': { tier1: 'Net force is the overall force on an object after combining all individual forces.', tier2: 'Same direction: add forces. Opposite direction: subtract forces. The net force direction is the direction of the larger force.', tier3: 'Example: 30 N right + 10 N left = 20 N right. The forces partially cancel and the net force is 20 N to the right.' },
  'balanced-unbalanced': { tier1: 'Balanced forces: net force = 0, no change in motion. Unbalanced forces: net force is not zero, motion changes.', tier2: 'An object at rest with balanced forces stays at rest. An object moving with balanced forces keeps the same speed and direction.', tier3: 'Example: A book on a table has balanced forces (gravity down = normal force up). A falling ball has unbalanced forces (gravity down > air resistance up).' },
  'force-diagrams': { tier1: 'A free-body diagram shows arrows for ALL forces acting ON one object.', tier2: 'Arrow direction shows force direction. Arrow length shows force size. Label each arrow with the force name and magnitude.', tier3: 'Example: For a box on a table: draw an arrow down for gravity (weight) and an arrow up for the normal force. If someone pushes it right, add a right arrow for applied force and a left arrow for friction.' },

  // newtons-laws
  'first-law-inertia': { tier1: 'Objects resist changes in motion. This resistance is called inertia.', tier2: 'No net force = no change in motion. An object at rest stays at rest. A moving object keeps moving at constant velocity.', tier3: 'Example: A ball on a flat, frictionless surface would roll forever at the same speed. In real life, friction is an unbalanced force that slows it down.' },
  'second-law-fma': { tier1: 'Newton\'s Second Law: F = ma. Force equals mass times acceleration.', tier2: 'More force = more acceleration. More mass = less acceleration (for the same force). Rearrange: a = F/m or m = F/a.', tier3: 'Example: A 10 kg wagon pushed with 30 N accelerates at 3 m/s^2 (a = 30/10 = 3). Double the mass to 20 kg with the same force: a = 30/20 = 1.5 m/s^2.' },
  'third-law-action-reaction': { tier1: 'Every action has an equal and opposite reaction.', tier2: 'The two forces always act on DIFFERENT objects. They are equal in size but opposite in direction.', tier3: 'Example: You push on a desk with 10 N. The desk pushes back on you with 10 N. Your force is on the desk; the desk\'s force is on you.' },
  'applying-newtons-laws': { tier1: 'Combine all three laws to solve real-world problems.', tier2: 'Step 1: Draw a free-body diagram. Step 2: Find net force. Step 3: Use F = ma to find acceleration.', tier3: 'Example: A 5 kg box is pushed with 40 N, friction is 15 N. Net force = 25 N. Acceleration = 25/5 = 5 m/s^2.' },

  // motion
  'speed-velocity': { tier1: 'Speed = distance / time. Velocity = displacement / time (with direction).', tier2: 'Speed tells how fast. Velocity tells how fast AND in what direction.', tier3: 'Example: Running 100 m in 10 s gives speed = 10 m/s. Running 100 m north in 10 s gives velocity = 10 m/s north.' },
  'acceleration': { tier1: 'Acceleration is how quickly velocity changes.', tier2: 'a = (final velocity - initial velocity) / time. Positive = speeding up, negative = slowing down.', tier3: 'Example: A car goes from 0 to 30 m/s in 10 s. Acceleration = (30 - 0) / 10 = 3 m/s^2.' },
  'distance-time-graphs': { tier1: 'On a d-t graph, the slope tells you the speed.', tier2: 'Steep slope = fast. Gentle slope = slow. Horizontal = stopped. Curved = changing speed.', tier3: 'Example: A straight line from (0, 0) to (10, 50) means the object travels 50 m in 10 s at a constant speed of 5 m/s.' },
  'velocity-time-graphs': { tier1: 'On a v-t graph, the slope tells you the acceleration and the area under the curve tells you the distance.', tier2: 'Positive slope = speeding up. Negative slope = slowing down. Horizontal = constant velocity. Area under line = distance.', tier3: 'Example: A horizontal line at 10 m/s for 5 seconds means constant velocity of 10 m/s and distance = area = 10 x 5 = 50 m.' },

  // gravity
  'gravitational-force': { tier1: 'Gravity is an attractive force between any two objects with mass.', tier2: 'Gravity depends on mass and distance. More mass = stronger gravity. More distance = weaker gravity.', tier3: 'Example: Earth\'s gravity pulls you down at 9.8 m/s^2. The Moon\'s weaker gravity pulls at about 1.6 m/s^2 because the Moon has less mass.' },
  'free-fall': { tier1: 'Free fall is falling with only gravity acting (no air resistance).', tier2: 'All objects in free fall accelerate at the same rate: 9.8 m/s^2 near Earth. Speed = g x t. Distance = 0.5 x g x t^2.', tier3: 'Example: After 2 s of free fall, speed = 9.8 x 2 = 19.6 m/s, distance = 0.5 x 9.8 x 4 = 19.6 m.' },
  'weight-vs-mass': { tier1: 'Mass = amount of matter (kg). Weight = gravitational force (N). W = mg.', tier2: 'Mass stays the same everywhere. Weight changes with gravity. On the Moon, you weigh about 1/6 of your Earth weight.', tier3: 'Example: A 60 kg person on Earth weighs 60 x 9.8 = 588 N. On the Moon (g = 1.6): weight = 60 x 1.6 = 96 N. Same mass, different weight.' },
  'projectile-motion': { tier1: 'Projectile motion has two independent parts: horizontal (constant speed) and vertical (accelerating due to gravity).', tier2: 'Horizontal: no acceleration, constant speed. Vertical: accelerated by gravity at 9.8 m/s^2 downward.', tier3: 'Example: A ball launched horizontally at 10 m/s from a cliff. Horizontally it travels 10 m every second. Vertically it falls 4.9 m in the first second, 19.6 m total in 2 seconds.' },

  // friction-drag
  'static-friction': { tier1: 'Static friction keeps objects from starting to move. It matches the applied force up to a limit.', tier2: 'If you push with 10 N and the object doesn\'t move, static friction is 10 N. The maximum static friction depends on the surfaces and the weight.', tier3: 'Example: You push a 50 kg crate with 100 N and it stays put. Static friction = 100 N. Push with 200 N and it starts to slide — you exceeded maximum static friction.' },
  'kinetic-friction': { tier1: 'Kinetic friction acts on sliding objects and opposes their motion.', tier2: 'Kinetic friction is usually less than maximum static friction for the same surfaces. It depends on surface materials and normal force.', tier3: 'Example: A box sliding on a floor with 15 N of kinetic friction. Push with 15 N and it moves at constant speed (balanced). Push with 25 N and it accelerates (unbalanced, net 10 N).' },
  'air-resistance': { tier1: 'Air resistance (drag) opposes motion through air. It increases with speed and surface area.', tier2: 'Terminal velocity occurs when air resistance equals weight. Parachutes increase surface area to increase drag.', tier3: 'Example: A skydiver accelerates until air resistance = weight (about 800 N). At that point, they reach terminal velocity (about 55 m/s) and fall at constant speed.' },
  'friction-applications': { tier1: 'Friction can be helpful (walking, braking) or harmful (wears parts, wastes energy as heat).', tier2: 'Increase friction: use rough surfaces, treads, more weight. Decrease friction: use lubricants, smooth surfaces, ball bearings.', tier3: 'Example: Tire treads increase friction on roads (helpful). Oil in an engine reduces friction between metal parts (reduces wear and heat).' },

  // momentum
  'momentum-basics': { tier1: 'Momentum = mass x velocity (p = mv). More mass or more speed = more momentum.', tier2: 'Momentum has direction. A 2 kg ball at 3 m/s east has momentum = 6 kg*m/s east.', tier3: 'Example: A 1,500 kg car at 20 m/s has momentum = 30,000 kg*m/s. A 0.01 kg bullet at 400 m/s has momentum = 4 kg*m/s. The car has much more momentum.' },
  'impulse': { tier1: 'Impulse = force x time = change in momentum.', tier2: 'Same impulse can come from big force x short time OR small force x long time. That is why airbags (more time) reduce force.', tier3: 'Example: Catching a ball (moving hands back) increases stopping time and reduces force on your hands. A wall stops the ball in less time = much more force.' },
  'conservation-of-momentum': { tier1: 'Total momentum before = total momentum after (in a closed system).', tier2: 'Add up all momenta before the collision. This total must equal the total after.', tier3: 'Example: 5 kg at 4 m/s hits 3 kg at rest. Before: 5(4) + 3(0) = 20. If they stick together: 8(v) = 20, so v = 2.5 m/s.' },
  'collision-types': { tier1: 'Elastic: objects bounce, kinetic energy is conserved. Inelastic: objects may stick, kinetic energy is not conserved.', tier2: 'All collisions conserve momentum. Only elastic collisions also conserve kinetic energy.', tier3: 'Example: Billiard balls (nearly elastic): they bounce and total KE is about the same. Car crash (inelastic): cars crumple and KE is lost to heat, sound, deformation.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISCONCEPTIONS — pattern-matched corrections per skill
// ═══════════════════════════════════════════════════════════════════════════════

const MISCONCEPTIONS = {
  'types-of-forces': [
    { patterns: [/gravity.*contact|contact.*gravity/i], correction: 'Gravity is a NON-CONTACT force. It acts between objects without them touching. Contact forces (like friction, tension, normal force) require physical contact between objects.' },
  ],
  'net-force': [
    { patterns: [/just.*add|always.*add|add.*all/i], correction: 'You cannot just add all forces — you must consider DIRECTION. Forces in opposite directions partially cancel. Only forces in the same direction simply add.' },
  ],
  'balanced-unbalanced': [
    { patterns: [/moving.*unbalanced|must.*be.*unbalanced.*if.*moving/i], correction: 'An object CAN be moving with balanced forces! Balanced forces mean constant velocity (constant speed in a straight line). Unbalanced forces cause CHANGES in motion (speeding up, slowing down, or changing direction).' },
  ],
  'first-law-inertia': [
    { patterns: [/need.*force.*to.*keep.*moving|force.*required.*for.*motion/i], correction: 'You do NOT need a force to keep an object moving. Newton\'s First Law says an object in motion stays in motion at constant velocity unless an unbalanced force acts on it. In daily life, friction is the unbalanced force that slows things down.' },
  ],
  'second-law-fma': [
    { patterns: [/heavier.*always.*slower|heavy.*can.t.*accelerate/i], correction: 'A heavier object does NOT always accelerate more slowly. If a greater force is applied, it can accelerate just as fast or faster. Acceleration depends on BOTH force and mass: a = F/m.' },
  ],
  'third-law-action-reaction': [
    { patterns: [/cancel|same.*object|act.*on.*same/i], correction: 'Action-reaction forces do NOT cancel each other because they act on DIFFERENT objects. Only forces acting on the SAME object can cancel.' },
  ],
  'speed-velocity': [
    { patterns: [/same.*thing|no.*difference|speed.*=.*velocity/i], correction: 'Speed and velocity are NOT the same. Speed is a scalar (magnitude only: how fast). Velocity is a vector (magnitude AND direction: how fast and which way).' },
  ],
  'free-fall': [
    { patterns: [/heavy.*fall.*faster|heavier.*first|more.*mass.*faster/i], correction: 'In free fall (no air resistance), ALL objects fall at the same rate regardless of mass. A bowling ball and a feather dropped in a vacuum hit the ground at the same time. In air, the feather falls slower due to air resistance, not because of its mass.' },
  ],
  'weight-vs-mass': [
    { patterns: [/weight.*same.*everywhere|weight.*doesn.*change/i], correction: 'Weight DOES change depending on gravity. Your weight on the Moon is about 1/6 of your Earth weight. MASS stays the same everywhere because it measures the amount of matter.' },
  ],
  'momentum-basics': [
    { patterns: [/same.*as.*force|momentum.*is.*force/i], correction: 'Momentum is NOT the same as force. Momentum = mass x velocity (p = mv). Force causes a CHANGE in momentum. A heavy truck at rest has zero momentum but plenty of mass.' },
  ],
  'conservation-of-momentum': [
    { patterns: [/momentum.*lost|momentum.*disappear|momentum.*created/i], correction: 'Momentum cannot be lost, created, or destroyed in a closed system. It can only be TRANSFERRED between objects. If one object loses momentum, another gains it.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENA — driving questions for phenomenon-based learning
// ═══════════════════════════════════════════════════════════════════════════════

const PHENOMENA = {
  'forces-basics': [
    { title: 'The Invisible Forces Around Us', focus: 'types of forces, contact vs non-contact', text: 'A compass needle always points north, even though nothing visible is pushing it. A ball always falls when you let go, even in an empty room. Meanwhile, you can slide a book across a table and it slows down and stops on its own.', drivingQuestion: 'What invisible forces are acting in each of these situations? How can forces act without touching? What would happen if these forces suddenly disappeared?' },
  ],
  'newtons-laws': [
    { title: 'The Seatbelt Problem', focus: 'inertia, Newton\'s first and second laws', text: 'A crash test dummy flies forward when a car hits a wall at 50 km/h, even though the car stops. With a seatbelt, the dummy stays in the seat. Without a seatbelt, the dummy crashes through the windshield.', drivingQuestion: 'Why does the dummy keep moving when the car stops? Why does the seatbelt help? If the car hit the wall at 100 km/h instead, how would the forces change?' },
    { title: 'Rocket Launch', focus: 'Newton\'s third law, forces', text: 'A rocket sits on the launch pad weighing millions of pounds. When the engines fire, hot gases shoot downward at incredible speeds, and the rocket lifts off the ground and accelerates into space.', drivingQuestion: 'How can shooting gas downward make something go up? What would happen if the rocket engines were pointed sideways? Could a rocket work in the vacuum of space where there is nothing to push against?' },
  ],
  'motion': [
    { title: 'Speed vs. Velocity in Sports', focus: 'speed, velocity, acceleration', text: 'A race car driver completes a 5 km oval track in 2 minutes, returning to the starting line. A sprinter runs 100 m in a straight line in 10 seconds.', drivingQuestion: 'Who has the greater average speed? Who has the greater average velocity? What is the race car\'s average velocity for one complete lap, and why is the answer surprising?' },
  ],
  'gravity': [
    { title: 'The Apollo 15 Hammer and Feather', focus: 'free fall, gravity, air resistance', text: 'In 1971, astronaut David Scott dropped a hammer and a feather on the Moon at the same time. On Earth, the hammer would hit the ground first. On the Moon, they hit the ground at exactly the same time.', drivingQuestion: 'Why do the hammer and feather hit at the same time on the Moon but not on Earth? What is different about the Moon\'s environment? Would a bowling ball and a marble also land at the same time on the Moon?' },
  ],
  'friction-drag': [
    { title: 'Designing the Fastest Slide', focus: 'friction, surfaces, motion', text: 'A playground has two slides of the same height. One is metal and one is covered in rough rubber. Kids go much faster on the metal slide. But when it rains, the metal slide becomes dangerously fast.', drivingQuestion: 'Why is the metal slide faster? What changes when water is added? If you wanted to design a slide that is fast but safe in all weather, what would you do?' },
  ],
  'momentum': [
    { title: 'The Newton\'s Cradle Puzzle', focus: 'momentum, conservation, collisions', text: 'In a Newton\'s Cradle, you pull back one ball and release it. It hits the row and one ball swings out the other side. Pull two back and two swing out. The balls in the middle barely move.', drivingQuestion: 'Why does the same number of balls always swing out as you pulled back? Why don\'t the middle balls move much? What would happen if all the balls had different masses?' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL LABS
// ═══════════════════════════════════════════════════════════════════════════════

const VIRTUAL_LABS = {
  'forces-and-motion': {
    title: 'Virtual Forces and Motion Lab',
    skills: ['types-of-forces', 'net-force', 'balanced-unbalanced'],
    objective: 'Explore how different forces affect the motion of objects',
    background: 'Forces are pushes and pulls that can change an object\'s motion. When multiple forces act on an object, the net force determines what happens.',
    hypothesis_prompt: 'Predict: If two equal forces push in opposite directions on a box, what will the box do?',
    variables: { independent: 'applied force (magnitude and direction)', dependent: 'motion of the object (speed, direction)', controlled: ['object mass', 'surface type'] },
    procedure: [
      { step: 1, action: 'Place a 2 kg box on a smooth surface. Apply a 10 N force to the right. Record the motion.' },
      { step: 2, action: 'Now apply 10 N to the right AND 10 N to the left simultaneously. Record the motion.' },
      { step: 3, action: 'Apply 15 N right and 5 N left. Calculate the net force and predict the motion before observing.' },
      { step: 4, action: 'Apply 20 N right and add 8 N of friction to the left. Calculate net force and acceleration (F = ma).' },
      { step: 5, action: 'Challenge: What force is needed to move the 2 kg box at constant velocity if friction is 6 N?' },
    ],
    observations: {
      'single-force': 'The box accelerates to the right. a = 10/2 = 5 m/s^2.',
      'equal-opposite': 'The box does not move. Net force = 0 N. Forces are balanced.',
      'unequal-opposite': 'Net force = 15 - 5 = 10 N right. Box accelerates right at 5 m/s^2.',
      'with-friction': 'Net force = 20 - 8 = 12 N right. Acceleration = 12/2 = 6 m/s^2.',
    },
    data_table: {
      columns: ['Trial', 'Force Right (N)', 'Force Left (N)', 'Net Force (N)', 'Acceleration (m/s^2)'],
      rows: [
        ['1', '10', '0', '10 right', '5.0'],
        ['2', '10', '10', '0', '0'],
        ['3', '15', '5', '10 right', '5.0'],
        ['4', '20', '8 (friction)', '12 right', '6.0'],
      ],
    },
    conclusion_questions: [
      'When is an object\'s motion unchanged (no acceleration)?',
      'How does friction change the net force?',
      'What force would you need to keep the box moving at constant velocity with 6 N of friction?',
      'What happens if you double the mass but keep the same net force?',
      'How would this experiment change on the Moon where gravity is weaker?',
    ],
  },
  'newtons-second-law-lab': {
    title: 'Virtual Newton\'s Second Law Lab',
    skills: ['second-law-fma', 'first-law-inertia'],
    objective: 'Investigate the relationship between force, mass, and acceleration',
    background: 'Newton\'s Second Law states F = ma. This lab explores how changing force and mass independently affects acceleration.',
    hypothesis_prompt: 'Predict: If you double the force on an object, what happens to its acceleration?',
    variables: { independent: 'applied force (N) and object mass (kg)', dependent: 'acceleration (m/s^2)', controlled: ['surface type (frictionless)', 'direction of force'] },
    procedure: [
      { step: 1, action: 'Apply 10 N to a 2 kg cart on a frictionless track. Measure acceleration.' },
      { step: 2, action: 'Keep mass at 2 kg. Apply 20 N. Measure acceleration. Then try 30 N.' },
      { step: 3, action: 'Reset force to 10 N. Try masses of 2 kg, 4 kg, and 8 kg. Measure acceleration.' },
      { step: 4, action: 'Plot force vs. acceleration (constant mass). What shape is the graph?' },
      { step: 5, action: 'Plot mass vs. acceleration (constant force). What shape is the graph?' },
    ],
    observations: {
      'constant-mass': 'Doubling force doubles acceleration. Tripling force triples acceleration. Direct relationship.',
      'constant-force': 'Doubling mass halves acceleration. Quadrupling mass quarters acceleration. Inverse relationship.',
      'force-graph': 'Force vs. acceleration (constant mass) is a straight line through the origin. Slope = mass.',
      'mass-graph': 'Mass vs. acceleration (constant force) is a curve that decreases. It is an inverse relationship.',
    },
    data_table: {
      columns: ['Force (N)', 'Mass (kg)', 'Acceleration (m/s^2)'],
      rows: [
        ['10', '2', '5.0'],
        ['20', '2', '10.0'],
        ['30', '2', '15.0'],
        ['10', '4', '2.5'],
        ['10', '8', '1.25'],
      ],
    },
    conclusion_questions: [
      'What is the mathematical relationship between force, mass, and acceleration?',
      'If you triple both force and mass, what happens to acceleration?',
      'Why is the mass vs. acceleration graph a curve instead of a straight line?',
      'How does this relate to why a loaded truck accelerates more slowly than an empty car with the same engine force?',
      'What would the data look like if there were friction on the track?',
    ],
  },
  'momentum-collision-lab': {
    title: 'Virtual Momentum and Collisions Lab',
    skills: ['momentum-basics', 'conservation-of-momentum', 'collision-types'],
    objective: 'Investigate conservation of momentum in elastic and inelastic collisions',
    background: 'Momentum (p = mv) is always conserved in collisions within a closed system. This lab explores what happens to momentum and kinetic energy in different types of collisions.',
    hypothesis_prompt: 'Predict: If a moving cart hits a stationary cart of equal mass and they stick together, what happens to the speed?',
    variables: { independent: 'cart masses and initial velocities', dependent: 'final velocities and kinetic energies', controlled: ['track surface (frictionless)', 'collision type'] },
    procedure: [
      { step: 1, action: 'Cart A (2 kg, 4 m/s) hits stationary Cart B (2 kg). They stick together (perfectly inelastic). Find final velocity.' },
      { step: 2, action: 'Same setup but elastic collision. Cart A stops, Cart B moves. Find Cart B\'s velocity.' },
      { step: 3, action: 'Cart A (4 kg, 3 m/s) hits Cart B (2 kg, stationary). They stick together. Find final velocity.' },
      { step: 4, action: 'Calculate kinetic energy before and after each collision. Which type conserves KE?' },
      { step: 5, action: 'Design a collision where both carts move toward each other.' },
    ],
    observations: {
      'inelastic-equal': 'p_before = 2(4) + 2(0) = 8. p_after = 4(v). v = 2 m/s. KE before = 16 J. KE after = 8 J. Half the KE is lost.',
      'elastic-equal': 'Cart A stops (0 m/s). Cart B moves at 4 m/s. All momentum and KE transferred.',
      'inelastic-unequal': 'p_before = 4(3) + 2(0) = 12. p_after = 6(v). v = 2 m/s.',
      'ke-comparison': 'Elastic: KE conserved. Inelastic: KE lost (converted to heat/deformation).',
    },
    data_table: {
      columns: ['Trial', 'Type', 'p Before (kg*m/s)', 'p After (kg*m/s)', 'KE Before (J)', 'KE After (J)'],
      rows: [
        ['1', 'Inelastic (equal)', '8', '8', '16', '8'],
        ['2', 'Elastic (equal)', '8', '8', '16', '16'],
        ['3', 'Inelastic (unequal)', '12', '12', '18', '12'],
      ],
    },
    conclusion_questions: [
      'Is momentum conserved in all trials? What does this confirm?',
      'In which collision type is kinetic energy also conserved?',
      'Where does the "lost" kinetic energy go in inelastic collisions?',
      'Why does a moving cart stop completely in an elastic collision with an equal-mass stationary cart?',
      'How would results change if the track had friction?',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAMS — ASCII diagrams for key concepts
// ═══════════════════════════════════════════════════════════════════════════════

const DIAGRAMS_LOCAL = {
  'free-body-diagram-box': {
    domain: 'ms-physics-mechanics',
    skill: 'force-diagrams',
    topic: 'Free Body Diagram - Box on a Surface',
    description: 'A free-body diagram showing forces on a box being pushed across a surface.',
    diagram: `
           [A] ___
            |     |
            v     |
  [D] <--- |  BOX | ---> [B]
            |_____|
            ^
            |
           [C]

  [A] = force pulling downward: ___
  [B] = force pushing the box to the right: ___
  [C] = force pushing upward from the surface: ___
  [D] = force opposing the motion: ___
`,
    labels: { A: 'gravity', B: 'applied force', C: 'normal force', D: 'friction' },
  },
  'velocity-time-graph': {
    domain: 'ms-physics-mechanics',
    skill: 'velocity-time-graphs',
    topic: 'Velocity-Time Graph Analysis',
    description: 'A velocity-time graph showing different phases of motion.',
    diagram: `
  v (m/s)
  20 |      ___________
     |     /           \\
  10 |    /             \\
     |   /               \\
   0 |__/                 \\___
     +----+----+----+----+----+-> t (s)
     0    2    4    6    8   10

  Phase [A] (0-2s): acceleration = ___
  Phase [B] (2-6s): acceleration = ___
  Phase [C] (6-10s): acceleration = ___
  Total distance traveled [D]: ___
`,
    labels: { A: '10 m/s^2', B: '0', C: '-5 m/s^2', D: '100 m' },
  },
  'newtons-third-law': {
    domain: 'ms-physics-mechanics',
    skill: 'third-law-action-reaction',
    topic: 'Newton\'s Third Law - Action-Reaction Pairs',
    description: 'Diagram showing action-reaction force pairs between a person and the ground.',
    diagram: `
     PERSON
    /      \\
   /  [A] N  \\    [A]: Person pushes ground with ___ N
  |    |      |
  |    v      |
  ============== GROUND
       ^
       |
      [B] N        [B]: Ground pushes person with ___ N

  Direction of [A]: ___
  Direction of [B]: ___
  Are [A] and [B] equal in magnitude? ___
`,
    labels: { A: 'weight', B: 'weight', 'Direction of A': 'downward', 'Direction of B': 'upward', 'Are A and B equal': 'yes' },
  },
  'momentum-collision': {
    domain: 'ms-physics-mechanics',
    skill: 'conservation-of-momentum',
    topic: 'Conservation of Momentum in a Collision',
    description: 'Before and after diagram of a collision between two carts.',
    diagram: `
  BEFORE:
  Cart A          Cart B
  [mass A] kg     [mass B] kg
  --> [v_A] m/s   (at rest)

  AFTER (they stick together):
  Cart A+B
  [mass A+B] kg
  --> [v_f] m/s

  mass A = 3 kg, v_A = 4 m/s, mass B = 1 kg

  Total momentum before [P1]: ___
  Total mass after [M]: ___
  Final velocity [v_f]: ___
`,
    labels: { P1: '12 kg*m/s', M: '4 kg', v_f: '3 m/s' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CER PHENOMENA — Claim-Evidence-Reasoning writing prompts
// ═══════════════════════════════════════════════════════════════════════════════

const CER_PHENOMENA_LOCAL = {
  'heavier-objects-fall-faster': {
    domain: 'ms-physics-mechanics',
    title: 'Do Heavier Objects Really Fall Faster?',
    phenomenon: 'Drop a heavy textbook and a single sheet of paper from the same height. The textbook hits the ground first. Now crumple the paper into a tight ball and drop both again. This time they hit at almost the same time!',
    scaffold: {
      claim: 'Make a claim about whether mass determines how fast an object falls.',
      evidence: 'Describe what happened in both drops. What changed about the paper? Use specific observations.',
      reasoning: 'Explain WHY crumpling the paper changed the result. What role does air resistance play? What would happen in a vacuum?',
    },
    keyTerms: ['air resistance', 'gravity', 'mass', 'surface area', 'free fall', 'vacuum', 'acceleration'],
    rubric: {
      claim: { excellent: 'States that mass does not determine fall rate; air resistance causes the difference', adequate: 'States both fell at the same rate when crumpled', developing: 'States heavier objects fall faster' },
      evidence: { excellent: 'Describes both trials with specific observations about the paper\'s shape and fall time', adequate: 'Describes one trial clearly', developing: 'Vague or missing observations' },
      reasoning: { excellent: 'Explains that crumpling reduces surface area and thus air resistance, allowing gravity to dominate equally for both objects', adequate: 'Mentions air resistance plays a role', developing: 'Does not connect surface area to air resistance' },
    },
  },
  'seatbelts-and-inertia': {
    domain: 'ms-physics-mechanics',
    title: 'Why Do Seatbelts Save Lives?',
    phenomenon: 'In a car crash at 50 km/h, an unbelted passenger continues moving at 50 km/h even after the car stops. They hit the dashboard or windshield with the same force as if they had fallen from a three-story building.',
    scaffold: {
      claim: 'Make a claim about why seatbelts are necessary using Newton\'s laws.',
      evidence: 'Describe what happens to a belted vs. unbelted passenger in a crash. Use the concept of inertia.',
      reasoning: 'Explain how the seatbelt changes the forces on the passenger using F = ma and impulse. Why does spreading the stopping force over more time reduce injuries?',
    },
    keyTerms: ['inertia', 'Newton\'s first law', 'force', 'acceleration', 'impulse', 'momentum', 'time', 'seatbelt'],
    rubric: {
      claim: { excellent: 'States that seatbelts provide the force needed to overcome inertia and increase stopping time to reduce peak force', adequate: 'States seatbelts keep passengers from flying forward', developing: 'Vague claim about safety' },
      evidence: { excellent: 'Compares belted and unbelted outcomes with reference to inertia and force calculations', adequate: 'Describes the crash scenario', developing: 'Limited evidence' },
      reasoning: { excellent: 'Uses Newton\'s first law (inertia), F=ma, and impulse to explain how seatbelts reduce force by increasing time', adequate: 'Mentions inertia and force', developing: 'Incomplete reasoning' },
    },
  },
  'action-reaction-confusion': {
    domain: 'ms-physics-mechanics',
    title: 'If Forces Are Equal and Opposite, Why Does Anything Move?',
    phenomenon: 'Newton\'s Third Law says every force has an equal and opposite reaction. When a horse pulls a cart, the cart pulls back on the horse with an equal force. If the forces are equal, how can the horse ever move the cart?',
    scaffold: {
      claim: 'Make a claim about why the horse-cart system can accelerate despite equal and opposite forces.',
      evidence: 'Identify ALL forces on the horse and ALL forces on the cart separately. Draw free-body diagrams for each.',
      reasoning: 'Explain why the action-reaction forces do not cancel. What determines whether the cart accelerates?',
    },
    keyTerms: ['action', 'reaction', 'different objects', 'net force', 'friction', 'free-body diagram', 'Newton\'s third law'],
    rubric: {
      claim: { excellent: 'States that action-reaction forces act on different objects and therefore do not cancel; the horse accelerates because the ground pushes it forward more than the cart pulls it back', adequate: 'States the forces are on different objects', developing: 'Cannot resolve the paradox' },
      evidence: { excellent: 'Draws separate FBDs for horse and cart showing all forces with correct directions', adequate: 'Lists some forces on each object', developing: 'Confuses which forces act on which object' },
      reasoning: { excellent: 'Explains that forces only cancel when on the same object; the horse moves because ground friction on its hooves exceeds the backward pull of the cart', adequate: 'Mentions different objects', developing: 'Incomplete reasoning' },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY — key terms per category
// ═══════════════════════════════════════════════════════════════════════════════

const VOCABULARY = {
  'forces-basics': [
    { term: 'force', definition: 'A push or pull that can change an object\'s motion. Measured in newtons (N).' },
    { term: 'contact force', definition: 'A force that requires physical contact between objects. Examples: friction, tension, normal force, applied force.' },
    { term: 'non-contact force', definition: 'A force that acts at a distance without physical contact. Examples: gravity, magnetism, electrostatic force.' },
    { term: 'net force', definition: 'The overall force on an object after all individual forces are combined. Also called resultant force.' },
    { term: 'balanced forces', definition: 'Forces that are equal in size and opposite in direction, producing a net force of zero. No change in motion occurs.' },
    { term: 'unbalanced forces', definition: 'Forces that do not cancel out, producing a non-zero net force. The object accelerates.' },
    { term: 'free-body diagram', definition: 'A diagram showing all forces acting on a single object, represented by arrows showing direction and relative magnitude.' },
    { term: 'normal force', definition: 'The support force exerted by a surface perpendicular to the object resting on it.' },
  ],
  'newtons-laws': [
    { term: 'Newton\'s First Law', definition: 'An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an unbalanced force. Also called the Law of Inertia.' },
    { term: 'inertia', definition: 'The tendency of an object to resist changes in its state of motion. More mass = more inertia.' },
    { term: 'Newton\'s Second Law', definition: 'The acceleration of an object is directly proportional to the net force and inversely proportional to the mass. F = ma.' },
    { term: 'Newton\'s Third Law', definition: 'For every action force, there is an equal and opposite reaction force acting on a different object.' },
    { term: 'action-reaction pair', definition: 'Two forces that are equal in magnitude, opposite in direction, and act on different objects.' },
    { term: 'newton (N)', definition: 'The SI unit of force. 1 N = 1 kg*m/s^2. Approximately the weight of a small apple.' },
  ],
  'motion': [
    { term: 'speed', definition: 'The rate at which an object covers distance. Speed = distance / time. A scalar quantity (no direction).' },
    { term: 'velocity', definition: 'The rate at which an object changes position, including direction. Velocity = displacement / time. A vector quantity.' },
    { term: 'acceleration', definition: 'The rate at which velocity changes. a = (v_f - v_i) / t. Units: m/s^2.' },
    { term: 'displacement', definition: 'The straight-line distance and direction from start to finish. Different from total distance traveled.' },
    { term: 'deceleration', definition: 'Negative acceleration; when an object slows down.' },
    { term: 'constant velocity', definition: 'Moving at the same speed in the same direction. Requires zero net force.' },
  ],
  'gravity': [
    { term: 'gravitational force', definition: 'An attractive force between any two objects with mass. Stronger with more mass, weaker with more distance.' },
    { term: 'weight', definition: 'The force of gravity on an object. W = mg. Measured in newtons. Changes with location.' },
    { term: 'mass', definition: 'The amount of matter in an object. Measured in kilograms. Does not change with location.' },
    { term: 'free fall', definition: 'Motion where the only force acting is gravity (no air resistance). All objects in free fall have the same acceleration.' },
    { term: 'terminal velocity', definition: 'The constant maximum velocity reached when air resistance equals gravitational force during a fall.' },
    { term: 'projectile motion', definition: 'The curved path of an object launched into the air, affected only by gravity.' },
  ],
  'friction-drag': [
    { term: 'friction', definition: 'A contact force that opposes the relative motion or tendency of motion between two surfaces.' },
    { term: 'static friction', definition: 'Friction that prevents a stationary object from starting to move. It adjusts to match the applied force up to a maximum.' },
    { term: 'kinetic friction', definition: 'Friction that acts on objects already in motion. Generally less than maximum static friction.' },
    { term: 'air resistance', definition: 'A drag force that opposes the motion of objects through air. Increases with speed and surface area.' },
    { term: 'drag', definition: 'A force that opposes motion through a fluid (liquid or gas). Air resistance is a type of drag.' },
    { term: 'lubricant', definition: 'A substance (like oil or grease) that reduces friction between surfaces.' },
  ],
  'momentum': [
    { term: 'momentum', definition: 'The product of an object\'s mass and velocity. p = mv. Units: kg*m/s. A vector quantity.' },
    { term: 'impulse', definition: 'The product of force and time. J = Ft. Equal to the change in momentum.' },
    { term: 'conservation of momentum', definition: 'In a closed system, total momentum before an event equals total momentum after.' },
    { term: 'elastic collision', definition: 'A collision in which both momentum and kinetic energy are conserved. Objects bounce apart.' },
    { term: 'inelastic collision', definition: 'A collision in which momentum is conserved but kinetic energy is not. Objects may stick together.' },
    { term: 'closed system', definition: 'A system with no external forces acting on it. Momentum is conserved within a closed system.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIOS — real-world application scenarios for lessons
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = [
  { title: 'Car Safety Engineering', focus: 'Newton\'s laws, impulse, force', text: 'Car manufacturers design crumple zones, airbags, and seatbelts to protect passengers. In a crash at 60 km/h, an 80 kg passenger must go from 60 km/h to 0. The crumple zone extends the stopping time from 0.05 s to 0.5 s. How does this affect the force on the passenger? Calculate the force with and without the crumple zone.' },
  { title: 'Skateboard Physics', focus: 'Newton\'s third law, friction, momentum', text: 'A 50 kg skateboarder stands on a 5 kg board and pushes off a wall with 200 N of force for 0.3 seconds. Calculate the impulse and the skateboarder\'s velocity. Why does the skateboarder move away from the wall? What role does friction between the wheels and ground play?' },
  { title: 'Amusement Park Ride Design', focus: 'acceleration, gravity, forces', text: 'A roller coaster drops 30 m from rest. At the bottom, riders feel much heavier than normal. Using energy concepts and F = ma, estimate the speed at the bottom of the drop and explain why riders feel heavier at the bottom of a loop.' },
  { title: 'Space Station Science', focus: 'free fall, Newton\'s laws, weightlessness', text: 'Astronauts on the ISS appear to float weightlessly, yet the ISS orbits only 400 km above Earth where gravity is about 90% as strong as on the surface. Explain the apparent weightlessness. How do astronauts exercise to prevent muscle loss if they cannot use body weight?' },
  { title: 'Football Physics', focus: 'momentum, collisions, impulse', text: 'A 100 kg linebacker running at 5 m/s tackles a 75 kg running back going the opposite direction at 6 m/s. Calculate each player\'s momentum. Using conservation of momentum, determine their combined velocity and direction after the tackle (assume they move together).' },
  { title: 'Parachute Design Challenge', focus: 'air resistance, terminal velocity, forces', text: 'Design a parachute for a 0.5 kg egg drop from 10 m. The egg breaks if it hits the ground faster than 2 m/s. What factors affect air resistance? How large should the parachute be? What material would you choose and why?' },
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

class MSPhysicsMechanics extends DomainSkillBase {
  constructor() {
    super('ms-physics-mechanics', 'ms-physics-mechanics', DATA_DIR, loadProfile, saveProfile, HINT_BANKS);
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
        if (m < MASTERY_THRESHOLD && _mechanicsTopicUnlocked(sk, p.skills)) {
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
        const isUnlocked = _mechanicsTopicUnlocked(sk, p.skills);
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
    if (!target) return { message: 'All mechanics skills are proficient!', congratulations: true };
    const skillMastery = p.skills[target.skill]?.mastery || 0;
    const exercise = generateExercise(target.skill, 5, skillMastery);
    const scenario = SCENARIOS.length > 0 ? pick(SCENARIOS, 1)[0] : null;
    const diff = buildDiffContext(p);
    return {
      studentId: id, targetSkill: target, exercise, scenario,
      lessonPlan: {
        review: 'Review previously learned concepts (2-3 min)',
        teach: `Introduce/reinforce: ${target.category} → ${target.skill}`,
        practice: `Complete ${exercise.count || 0} practice items`,
        apply: scenario ? `Analyze scenario: "${scenario.title}"` : 'Connect to real-world physics applications',
        extend: `Connect ${target.skill} to related mechanics concepts`,
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
    if (!name) return { labs: Object.keys(VIRTUAL_LABS), instructions: 'node mechanics.js lab <id> <lab-name> [obs-key]' };
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
      message: due.length === 0 ? 'No mechanics skills due for review today!' : `${due.length} skill(s) need review. Work through each exercise below.`,
    };
  }
}

module.exports = MSPhysicsMechanics;

// ═══════════════════════════════════════════════════════════════════════════════
// CLI: node mechanics.js <command> [args]
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const api = new MSPhysicsMechanics();
  const common = buildCommonCLIHandlers(api, DATA_DIR, 'ms-physics-mechanics', loadProfile, saveProfile);
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
        try { ans = JSON.parse(answersJson); } catch { throw new Error("answers-json must be valid JSON e.g. '{\"A\":\"gravity\"}'"); }
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
        skill: 'ms-physics-mechanics',
        gradeLevel: '6-8',
        standards: 'NGSS MS-PS2 (Motion and Stability: Forces and Interactions)',
        usage: 'node mechanics.js <command> [args]',
        commands: {
          'start <id>': 'Start a student session; includes last session state for resume prompt',
          'lesson <id>': 'Generate a lesson with concept explanation and exercises',
          'exercise <id> [skill]': 'Generate 5 practice items; optionally filter by skill',
          'check <id> <type> <expected> <answer> [skill]': 'Check an answer; returns misconception feedback if wrong',
          'record <id> <skill> <score> <total> [hints] [notes]': 'Save a scored assessment attempt',
          'progress <id>': 'Show mastery levels across all mechanics skills',
          'review <id>': 'List skills due for spaced repetition today',
          'hint <id> <skill>': 'Get next hint tier (3 tiers; reduces mastery credit)',
          'lab <id> [lab-name] [obs-key]': 'Start or explore a virtual lab; omit name to list available labs',
          'diagram <id> [topic]': 'Show ASCII diagram with blank labels to fill in',
          'diagram-check <id> <topic> <answers-json>': 'Check label answers for a diagram',
          'cer <id> [topic]': 'Present a CER phenomenon with scaffold prompts',
          'cer-check <id> <topic> <claim> <evidence> <reasoning>': 'Evaluate CER response against rubric',
          'vocab <id> [topic]': 'Pre-teach mechanics vocabulary',
          'phenomenon [category]': 'Get a driving-question phenomenon for phenomenon-based learning',
          'scenario': 'Get a real-world application scenario',
          'catalog': 'List all skill categories and topics',
          'students': 'List all student IDs with saved profiles',
        },
      }); break;
      default: out({
        usage: 'node mechanics.js <command> [args]',
        commands: ['start', 'lesson', 'exercise', 'check', 'record', 'progress', 'review', 'hint', 'lab', 'diagram', 'diagram-check', 'cer', 'cer-check', 'vocab', 'phenomenon', 'scenario', 'catalog', 'students', 'help'],
      });
    }
  });
}
