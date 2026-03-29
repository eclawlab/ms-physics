// eClaw MS Physics Waves & Sound Tutor (6-8).
// NGSS MS-PS4 (Waves and Their Applications) aligned.

const { dataDir, loadProfile: _lp, saveProfile: _sp, listProfiles, calcMastery, masteryLabel, shuffle, pick, runCLI, srGrade, srUpdate, srEffectiveMastery, srDueToday, MASTERY_THRESHOLD, saveSessionState, loadSessionState, fsrsUpdateStability, fsrsUpdateDifficulty, fsrsNextReview, today } = require('../_lib/core');
const { buildDiffContext } = require('../_lib/differentiation');
const { DomainSkillBase, buildCommonCLIHandlers, generateExercise: _generateExercise, checkAnswer: _checkAnswer } = require('../_lib/exercise-factory');

const DATA_DIR = dataDir('ms-physics-waves');
const loadProfile = id => _lp(DATA_DIR, id);
const saveProfile = p => _sp(DATA_DIR, p);

const SKILLS = {
  'wave-properties': ['wave-types', 'wavelength-frequency', 'amplitude-energy', 'wave-speed'],
  'sound': ['sound-production', 'sound-medium', 'pitch-volume', 'doppler-effect'],
  'light': ['light-sources', 'reflection', 'refraction', 'color-spectrum'],
  'electromagnetic': ['em-spectrum', 'radio-waves', 'visible-light', 'uv-xray-gamma'],
};

// Prerequisites: topic -> [topics that must be mastered first].
const TOPIC_PREREQUISITES = {
  // wave-properties (foundational)
  'wave-types': [],
  'wavelength-frequency': ['wave-types'],
  'amplitude-energy': ['wave-types'],
  'wave-speed': ['wavelength-frequency'],
  // sound
  'sound-production': ['wave-types'],
  'sound-medium': ['sound-production'],
  'pitch-volume': ['sound-medium', 'wavelength-frequency', 'amplitude-energy'],
  'doppler-effect': ['pitch-volume', 'wave-speed'],
  // light
  'light-sources': ['wave-types'],
  'reflection': ['light-sources'],
  'refraction': ['reflection'],
  'color-spectrum': ['refraction'],
  // electromagnetic
  'em-spectrum': ['wave-speed', 'light-sources'],
  'radio-waves': ['em-spectrum'],
  'visible-light': ['em-spectrum', 'color-spectrum'],
  'uv-xray-gamma': ['em-spectrum'],
};

// Helper: is a topic unlocked (all prereqs mastered)?
function _wavesTopicUnlocked(topic, profileSkills) {
  return (TOPIC_PREREQUISITES[topic] || []).every(r => (profileSkills[r]?.mastery || 0) >= MASTERY_THRESHOLD);
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION BANKS — 6-8 questions per skill, NGSS MS-PS4 aligned
// ═══════════════════════════════════════════════════════════════════════════════

const QUESTION_BANKS = {
  // ── wave-properties ───────────────────────────────────────────────────────
  'wave-types': { questions: [
    { q: 'What is a wave?', a: 'a disturbance that transfers energy from one place to another', type: 'short', difficulty: 1, rule: 'Waves transfer energy without transferring matter.' },
    { q: 'What are the two main types of waves?', a: ['transverse and longitudinal', 'transverse, longitudinal'], type: 'multi', difficulty: 1, rule: 'Transverse waves vibrate perpendicular to the direction of travel; longitudinal waves vibrate parallel.' },
    { q: 'True or false: Waves transfer matter from one place to another.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Waves transfer energy, not matter. The particles vibrate in place.' },
    { q: 'In a transverse wave, in which direction do particles move relative to the wave direction?', a: ['perpendicular', 'up and down', 'at right angles'], type: 'multi', difficulty: 2, hint: 'Think of a wave on a rope — the rope moves up and down while the wave moves sideways.' },
    { q: 'In a longitudinal wave, in which direction do particles move relative to the wave direction?', a: ['parallel', 'same direction', 'back and forth'], type: 'multi', difficulty: 2 },
    { q: 'Give an example of a transverse wave.', a: ['light', 'water wave', 'wave on a rope', 'electromagnetic wave'], type: 'multi', difficulty: 1 },
    { q: 'Give an example of a longitudinal wave.', a: ['sound', 'sound wave', 'compression wave', 'slinky wave'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Sound is a transverse wave.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Sound is a longitudinal wave. Air particles compress and expand in the direction the sound travels.' },
  ]},
  'wavelength-frequency': { questions: [
    { q: 'What is wavelength?', a: 'the distance between two consecutive identical points on a wave', type: 'short', difficulty: 1, rule: 'Wavelength (lambda) is the distance from one crest to the next crest, or one trough to the next trough.' },
    { q: 'What is frequency?', a: 'the number of waves that pass a point per second', type: 'short', difficulty: 1, rule: 'Frequency is measured in hertz (Hz). 1 Hz = 1 wave per second.' },
    { q: 'What are the SI units for frequency?', a: ['hertz', 'Hz'], type: 'multi', difficulty: 1 },
    { q: 'True or false: If frequency increases, wavelength decreases (at constant speed).', a: 'true', type: 'tf', difficulty: 2, explanation: 'Since v = f × lambda, if speed is constant and f goes up, lambda must go down.' },
    { q: 'A wave has a frequency of 5 Hz. How many complete waves pass a point in 1 second?', a: '5', type: 'short', difficulty: 1, hint: 'Frequency in Hz tells you the number of waves per second.' },
    { q: 'What is the relationship between wavelength and frequency?', a: ['they are inversely related', 'inversely proportional', 'as one increases the other decreases'], type: 'multi', difficulty: 2, rule: 'At constant speed, wavelength and frequency are inversely proportional.' },
    { q: 'What is the period of a wave?', a: 'the time for one complete wave cycle', type: 'short', difficulty: 2, rule: 'Period (T) = 1 / frequency. It is measured in seconds.' },
    { q: 'A wave has a frequency of 10 Hz. What is its period?', a: ['0.1 s', '0.1', '0.1 seconds'], type: 'multi', difficulty: 2, hint: 'T = 1/f = 1/10 = 0.1 s.' },
  ]},
  'amplitude-energy': { questions: [
    { q: 'What is amplitude?', a: 'the maximum displacement of a wave from its rest position', type: 'short', difficulty: 1, rule: 'Amplitude is the height of a crest or depth of a trough measured from the rest position.' },
    { q: 'True or false: A wave with greater amplitude carries more energy.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Amplitude is directly related to the energy of a wave. Greater amplitude = more energy.' },
    { q: 'What happens to the loudness of a sound if the amplitude increases?', a: ['it gets louder', 'louder', 'increases'], type: 'multi', difficulty: 1, hint: 'For sound waves, amplitude determines loudness.' },
    { q: 'What happens to the brightness of light if the amplitude increases?', a: ['it gets brighter', 'brighter', 'increases'], type: 'multi', difficulty: 2, rule: 'For light waves, greater amplitude means brighter light.' },
    { q: 'Two waves have the same frequency but different amplitudes. Which carries more energy?', a: ['the wave with greater amplitude', 'the one with larger amplitude', 'higher amplitude'], type: 'multi', difficulty: 2 },
    { q: 'True or false: Amplitude affects the speed of a wave.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Wave speed depends on the medium, not amplitude. Amplitude affects energy, not speed.' },
    { q: 'On a wave diagram, amplitude is measured from the rest line to the ___.', a: ['crest', 'crest or trough', 'peak'], type: 'multi', difficulty: 1 },
    { q: 'An earthquake with a larger amplitude on a seismograph indicates what?', a: ['a stronger earthquake', 'more energy', 'a more powerful quake'], type: 'multi', difficulty: 2, concept: 'Seismograph amplitude relates to earthquake energy.' },
  ]},
  'wave-speed': { questions: [
    { q: 'What is the formula for wave speed?', a: ['v = f x lambda', 'v = f times wavelength', 'speed = frequency x wavelength', 'v = f × λ'], type: 'multi', difficulty: 1, rule: 'Wave speed (v) = frequency (f) × wavelength (lambda).' },
    { q: 'A wave has a frequency of 4 Hz and a wavelength of 3 m. What is its speed?', a: '12', type: 'calculation', difficulty: 1, hint: 'v = f × lambda = 4 × 3 = 12 m/s.' },
    { q: 'A wave travels at 20 m/s with a frequency of 5 Hz. What is its wavelength?', a: '4', type: 'calculation', difficulty: 2, hint: 'lambda = v / f = 20 / 5 = 4 m.' },
    { q: 'True or false: All electromagnetic waves travel at the same speed in a vacuum.', a: 'true', type: 'tf', difficulty: 2, explanation: 'All EM waves travel at the speed of light: about 300,000,000 m/s (3 × 10⁸ m/s) in a vacuum.' },
    { q: 'A wave has a speed of 340 m/s and a wavelength of 0.5 m. What is its frequency?', a: '680', type: 'calculation', difficulty: 2, hint: 'f = v / lambda = 340 / 0.5 = 680 Hz.' },
    { q: 'What is the approximate speed of sound in air?', a: ['340 m/s', '340', '343 m/s'], type: 'multi', difficulty: 1, rule: 'Sound travels at about 340 m/s in air at room temperature.' },
    { q: 'A wave has a frequency of 100 Hz and a speed of 500 m/s. What is its wavelength?', a: '5', type: 'calculation', difficulty: 2, hint: 'lambda = v / f = 500 / 100 = 5 m.' },
    { q: 'Does sound travel faster in air, water, or steel?', a: ['steel', 'steel is fastest'], type: 'multi', difficulty: 2, rule: 'Sound travels fastest through solids (densely packed particles), then liquids, then gases.' },
  ]},

  // ── sound ─────────────────────────────────────────────────────────────────
  'sound-production': { questions: [
    { q: 'How is sound produced?', a: ['by vibrations', 'vibrating objects', 'vibrations of matter'], type: 'multi', difficulty: 1, rule: 'Sound is produced when an object vibrates, creating compressions and rarefactions in the surrounding medium.' },
    { q: 'True or false: Sound can travel through a vacuum.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Sound needs a medium (solid, liquid, or gas) to travel. There is no sound in a vacuum.' },
    { q: 'What are compressions and rarefactions?', a: ['areas of high and low pressure in a sound wave', 'compressed and spread-out regions'], type: 'multi', difficulty: 2, rule: 'Compressions are areas where particles are pushed together; rarefactions are areas where particles are spread apart.' },
    { q: 'When you pluck a guitar string, what happens to create sound?', a: ['the string vibrates, pushing air molecules back and forth', 'the string vibrates and creates sound waves in the air'], type: 'multi', difficulty: 1 },
    { q: 'True or false: You can see sound waves.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Sound waves are invisible. You can feel them (vibrations) and hear them, but not see them.' },
    { q: 'What part of your ear vibrates when sound reaches it?', a: ['eardrum', 'the eardrum', 'tympanic membrane'], type: 'multi', difficulty: 2 },
    { q: 'A tuning fork is struck and placed in water. What happens?', a: ['the water splashes because the fork vibrates', 'water splashes from the vibrations', 'you can see ripples from the vibrating fork'], type: 'multi', difficulty: 2, concept: 'This demonstrates that sound is produced by vibrations.' },
    { q: 'What type of wave is a sound wave?', a: ['longitudinal', 'longitudinal wave'], type: 'multi', difficulty: 1 },
  ]},
  'sound-medium': { questions: [
    { q: 'What is a medium in physics?', a: 'the material through which a wave travels', type: 'short', difficulty: 1, rule: 'A medium can be a solid, liquid, or gas.' },
    { q: 'Through which state of matter does sound travel fastest?', a: ['solids', 'solid'], type: 'multi', difficulty: 1, rule: 'Sound travels fastest in solids because particles are closest together.' },
    { q: 'True or false: Sound can travel through water.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Sound travels through all states of matter: solids, liquids, and gases.' },
    { q: 'Why can you hear a train coming by pressing your ear to the railroad track?', a: ['sound travels faster through the solid metal than through air', 'solids conduct sound faster'], type: 'multi', difficulty: 2 },
    { q: 'Rank these from fastest to slowest for sound: air, steel, water.', a: ['steel, water, air', 'steel water air'], type: 'multi', difficulty: 2, hint: 'Sound: solids > liquids > gases.' },
    { q: 'In space, no one can hear you scream. Why?', a: ['space is a vacuum with no medium for sound', 'there is no air or medium in space', 'sound needs a medium'], type: 'multi', difficulty: 1, concept: 'Sound requires a medium; space is a vacuum.' },
    { q: 'True or false: Sound travels faster in warm air than in cold air.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Warmer air particles move faster and transmit vibrations more quickly.' },
    { q: 'Approximately how fast does sound travel in water?', a: ['1500 m/s', '1500', 'about 1500 m/s'], type: 'multi', difficulty: 2, rule: 'Sound travels about 1,500 m/s in water, roughly 4.4 times faster than in air.' },
  ]},
  'pitch-volume': { questions: [
    { q: 'What determines the pitch of a sound?', a: ['frequency', 'the frequency of the wave'], type: 'multi', difficulty: 1, rule: 'Higher frequency = higher pitch. Lower frequency = lower pitch.' },
    { q: 'What determines the volume (loudness) of a sound?', a: ['amplitude', 'the amplitude of the wave'], type: 'multi', difficulty: 1, rule: 'Greater amplitude = louder sound. Smaller amplitude = softer sound.' },
    { q: 'True or false: A bass guitar produces lower-pitched sounds than a violin.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Bass guitar strings vibrate at lower frequencies, producing lower pitches.' },
    { q: 'The human ear can hear frequencies from about ___ Hz to ___ Hz.', a: ['20 to 20000', '20 to 20,000', '20 Hz to 20000 Hz', '20 Hz to 20,000 Hz'], type: 'multi', difficulty: 2, rule: 'The human hearing range is approximately 20 Hz to 20,000 Hz.' },
    { q: 'What is ultrasound?', a: ['sound above 20,000 Hz', 'sound with frequency above human hearing', 'sound above 20000 Hz'], type: 'multi', difficulty: 2 },
    { q: 'If you tighten a guitar string, what happens to the pitch?', a: ['it increases', 'the pitch goes up', 'higher pitch'], type: 'multi', difficulty: 2, hint: 'Tighter strings vibrate faster (higher frequency), producing higher pitch.' },
    { q: 'What unit is used to measure loudness?', a: ['decibels', 'dB'], type: 'multi', difficulty: 2, rule: 'Loudness is measured in decibels (dB).' },
    { q: 'True or false: Whispering has a larger amplitude than shouting.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Shouting has a larger amplitude, which makes it louder.' },
  ]},
  'doppler-effect': { questions: [
    { q: 'What is the Doppler effect?', a: 'the change in frequency of a wave when the source or observer is moving', type: 'short', difficulty: 1, rule: 'The Doppler effect causes pitch to change as a sound source approaches or moves away.' },
    { q: 'When an ambulance drives toward you, what happens to the pitch of its siren?', a: ['it sounds higher', 'the pitch increases', 'higher pitch'], type: 'multi', difficulty: 1, hint: 'As the ambulance approaches, sound waves are compressed, increasing frequency and pitch.' },
    { q: 'When an ambulance drives away from you, what happens to the pitch?', a: ['it sounds lower', 'the pitch decreases', 'lower pitch'], type: 'multi', difficulty: 1 },
    { q: 'True or false: The Doppler effect only works with sound waves.', a: 'false', type: 'tf', difficulty: 2, explanation: 'The Doppler effect works with all waves, including light. Redshift and blueshift of stars are Doppler effects for light.' },
    { q: 'Why does the pitch change in the Doppler effect?', a: ['because the motion compresses or stretches the sound waves, changing the frequency', 'the wavelength changes due to motion'], type: 'multi', difficulty: 2, rule: 'Approaching sources compress waves (shorter wavelength, higher frequency). Receding sources stretch waves (longer wavelength, lower frequency).' },
    { q: 'What is redshift?', a: ['when light from a moving-away object shifts to longer (redder) wavelengths', 'light from a receding object is shifted to red'], type: 'multi', difficulty: 3, concept: 'Redshift is the Doppler effect for light — evidence that galaxies are moving away from us.' },
    { q: 'A car honks its horn as it passes you. Describe what you hear.', a: ['the pitch drops as the car passes from approaching to moving away', 'higher pitch approaching then lower pitch moving away'], type: 'multi', difficulty: 2 },
    { q: 'True or false: The actual frequency of the siren changes during the Doppler effect.', a: 'false', type: 'tf', difficulty: 2, explanation: 'The source frequency stays the same. The OBSERVED frequency changes because of relative motion.' },
  ]},

  // ── light ─────────────────────────────────────────────────────────────────
  'light-sources': { questions: [
    { q: 'What is a luminous object?', a: 'an object that produces its own light', type: 'short', difficulty: 1, rule: 'Luminous objects emit light (Sun, light bulb, candle). Non-luminous objects reflect light (Moon, book).' },
    { q: 'True or false: The Moon is a luminous object.', a: 'false', type: 'tf', difficulty: 1, explanation: 'The Moon reflects sunlight. It does not produce its own light.' },
    { q: 'How fast does light travel in a vacuum?', a: ['300000000 m/s', '3 x 10^8 m/s', '300,000,000 m/s', '3 × 10⁸ m/s'], type: 'multi', difficulty: 2, rule: 'Light speed in a vacuum: about 300,000,000 m/s (3 × 10⁸ m/s).' },
    { q: 'Name two luminous objects.', a: ['the Sun and a light bulb', 'Sun, candle', 'stars, fire', 'light bulb, flame'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Light travels in straight lines.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Light travels in straight lines called rays until it hits a surface or changes medium.' },
    { q: 'What is a shadow formed by?', a: ['an opaque object blocking light', 'light being blocked by an object'], type: 'multi', difficulty: 1, rule: 'Shadows form when an opaque object blocks light from passing through.' },
    { q: 'What is the difference between transparent, translucent, and opaque materials?', a: ['transparent lets all light through, translucent lets some light through, opaque blocks all light'], type: 'multi', difficulty: 2 },
    { q: 'Is light a transverse or longitudinal wave?', a: ['transverse', 'transverse wave'], type: 'multi', difficulty: 2, rule: 'Light is a transverse electromagnetic wave.' },
  ]},
  'reflection': { questions: [
    { q: 'What is reflection?', a: 'the bouncing of a wave off a surface', type: 'short', difficulty: 1, rule: 'When light hits a smooth surface, it bounces off at the same angle it arrived.' },
    { q: 'State the law of reflection.', a: ['the angle of incidence equals the angle of reflection', 'angle of incidence = angle of reflection'], type: 'multi', difficulty: 1, rule: 'The angle at which light hits a surface equals the angle at which it reflects.' },
    { q: 'True or false: A mirror produces regular (specular) reflection.', a: 'true', type: 'tf', difficulty: 1, explanation: 'A smooth mirror reflects light rays in a uniform direction, creating a clear image.' },
    { q: 'What is the difference between specular and diffuse reflection?', a: ['specular reflection is from smooth surfaces giving clear images; diffuse is from rough surfaces scattering light'], type: 'multi', difficulty: 2 },
    { q: 'The angle of incidence is 30°. What is the angle of reflection?', a: ['30', '30°', '30 degrees'], type: 'multi', difficulty: 1, hint: 'By the law of reflection, angle of incidence = angle of reflection.' },
    { q: 'Why can you see yourself in a still lake but not in a choppy one?', a: ['still water has a smooth surface for specular reflection; choppy water causes diffuse reflection', 'smooth surface reflects clearly'], type: 'multi', difficulty: 2 },
    { q: 'True or false: All objects that you can see are reflecting light into your eyes.', a: 'true', type: 'tf', difficulty: 2, explanation: 'You see non-luminous objects because they reflect light into your eyes.' },
    { q: 'A periscope uses what to redirect light?', a: ['mirrors', 'two mirrors', 'reflection from mirrors'], type: 'multi', difficulty: 2 },
  ]},
  'refraction': { questions: [
    { q: 'What is refraction?', a: 'the bending of a wave as it passes from one medium to another', type: 'short', difficulty: 1, rule: 'Refraction occurs because waves change speed when they enter a different medium.' },
    { q: 'Why does a straw in water look bent?', a: ['refraction bends the light as it passes from water to air', 'light changes speed and direction between water and air'], type: 'multi', difficulty: 1, hint: 'Light bends when it moves between air and water because it changes speed.' },
    { q: 'True or false: Light slows down when it enters glass from air.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Light travels slower in denser materials like glass and water compared to air.' },
    { q: 'When light enters a denser medium, it bends ___ the normal line.', a: ['toward', 'towards'], type: 'multi', difficulty: 2, rule: 'Light bends toward the normal when entering a denser medium (slows down) and away from normal when entering a less dense medium (speeds up).' },
    { q: 'What optical device uses refraction to focus light?', a: ['a lens', 'lens', 'convex lens'], type: 'multi', difficulty: 1 },
    { q: 'True or false: A prism separates white light into colors using refraction.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Different wavelengths of light refract by different amounts, spreading white light into a rainbow.' },
    { q: 'What causes a rainbow?', a: ['sunlight is refracted and reflected inside water droplets, separating into colors', 'refraction and reflection in raindrops'], type: 'multi', difficulty: 2 },
    { q: 'Light travels from air into water. Does it speed up or slow down?', a: ['slows down', 'it slows down'], type: 'multi', difficulty: 1, hint: 'Water is denser than air, so light travels more slowly in water.' },
  ]},
  'color-spectrum': { questions: [
    { q: 'What is white light made of?', a: ['all colors of the visible spectrum', 'all colors combined', 'a mixture of all visible wavelengths'], type: 'multi', difficulty: 1, rule: 'White light is a combination of all colors of the visible spectrum.' },
    { q: 'List the colors of the visible spectrum in order (ROY G BIV).', a: ['red, orange, yellow, green, blue, indigo, violet', 'red orange yellow green blue indigo violet'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Red light has a longer wavelength than blue light.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Red has the longest wavelength (~700 nm) and blue/violet has the shortest (~400 nm) in visible light.' },
    { q: 'Why does a red apple look red?', a: ['it reflects red light and absorbs other colors', 'it reflects red wavelengths'], type: 'multi', difficulty: 2, rule: 'Objects appear a certain color because they reflect that color and absorb the rest.' },
    { q: 'What color does a white shirt reflect?', a: ['all colors', 'all wavelengths of visible light'], type: 'multi', difficulty: 1, hint: 'White objects reflect all colors of light.' },
    { q: 'What color does a black object reflect?', a: ['none', 'no colors', 'it absorbs all colors'], type: 'multi', difficulty: 1, rule: 'Black objects absorb all colors of light and reflect none.' },
    { q: 'True or false: Different colors of light have different wavelengths.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Each color corresponds to a different wavelength: red is longest, violet is shortest.' },
    { q: 'If you shine red light on a blue shirt, what color does it appear?', a: ['black', 'dark', 'very dark'], type: 'multi', difficulty: 3, hint: 'The blue shirt absorbs red light and there is no blue light to reflect, so it looks black.' },
  ]},

  // ── electromagnetic ───────────────────────────────────────────────────────
  'em-spectrum': { questions: [
    { q: 'What is the electromagnetic spectrum?', a: 'the full range of electromagnetic waves organized by wavelength and frequency', type: 'short', difficulty: 1, rule: 'The EM spectrum includes radio waves, microwaves, infrared, visible light, UV, X-rays, and gamma rays.' },
    { q: 'List the EM spectrum from longest wavelength to shortest.', a: ['radio, microwave, infrared, visible, ultraviolet, x-ray, gamma', 'radio microwave infrared visible ultraviolet x-ray gamma'], type: 'multi', difficulty: 2 },
    { q: 'True or false: All electromagnetic waves travel at the speed of light in a vacuum.', a: 'true', type: 'tf', difficulty: 1, explanation: 'All EM waves travel at about 3 × 10⁸ m/s in a vacuum, regardless of their frequency.' },
    { q: 'What is the only part of the EM spectrum humans can see?', a: ['visible light'], type: 'multi', difficulty: 1 },
    { q: 'Which has more energy: radio waves or gamma rays?', a: ['gamma rays'], type: 'multi', difficulty: 1, rule: 'Higher frequency = more energy. Gamma rays have the highest frequency and energy.' },
    { q: 'True or false: Electromagnetic waves need a medium to travel.', a: 'false', type: 'tf', difficulty: 1, explanation: 'EM waves can travel through a vacuum — that is how sunlight reaches Earth through space.' },
    { q: 'What type of EM wave does a microwave oven use?', a: ['microwaves'], type: 'multi', difficulty: 1 },
    { q: 'As wavelength decreases along the EM spectrum, what happens to frequency and energy?', a: ['both increase', 'frequency and energy increase'], type: 'multi', difficulty: 2, rule: 'Shorter wavelength = higher frequency = more energy.' },
  ]},
  'radio-waves': { questions: [
    { q: 'What are radio waves used for?', a: ['communication like radio, TV, cell phones, and Wi-Fi', 'broadcasting and communication'], type: 'multi', difficulty: 1, rule: 'Radio waves have the longest wavelengths and lowest frequencies in the EM spectrum.' },
    { q: 'True or false: Radio waves have more energy than visible light.', a: 'false', type: 'tf', difficulty: 1, explanation: 'Radio waves have lower frequency and less energy than visible light.' },
    { q: 'What is the wavelength range of radio waves?', a: ['from about 1 mm to 100 km', 'millimeters to kilometers', 'very long wavelengths'], type: 'multi', difficulty: 2 },
    { q: 'Name three devices that use radio waves.', a: ['radio, TV, cell phone', 'radio, Wi-Fi, Bluetooth', 'television, walkie-talkie, radio'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Microwaves are a type of radio wave.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Microwaves are the shortest radio waves (highest frequency radio waves).' },
    { q: 'Can radio waves pass through walls?', a: ['yes', 'yes, most radio waves can pass through walls'], type: 'multi', difficulty: 2, hint: 'This is why you can receive Wi-Fi and cell phone signals indoors.' },
    { q: 'What does an antenna do?', a: ['it sends or receives radio waves', 'transmits and receives radio signals'], type: 'multi', difficulty: 2 },
    { q: 'True or false: Radio waves are harmful to humans at normal exposure levels.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Radio waves are low-energy and generally not harmful at normal levels.' },
  ]},
  'visible-light': { questions: [
    { q: 'What is the approximate wavelength range of visible light?', a: ['400 to 700 nm', '400-700 nm', '400 nm to 700 nm'], type: 'multi', difficulty: 2, rule: 'Visible light ranges from about 400 nm (violet) to 700 nm (red).' },
    { q: 'Which color of visible light has the highest energy?', a: ['violet', 'violet light'], type: 'multi', difficulty: 1, hint: 'Higher frequency = more energy. Violet has the highest frequency in visible light.' },
    { q: 'Which color of visible light has the lowest energy?', a: ['red', 'red light'], type: 'multi', difficulty: 1 },
    { q: 'True or false: Visible light is a small portion of the entire EM spectrum.', a: 'true', type: 'tf', difficulty: 1, explanation: 'Visible light is a tiny band in the middle of the vast electromagnetic spectrum.' },
    { q: 'What happens when all colors of visible light are combined?', a: ['white light', 'you see white'], type: 'multi', difficulty: 1 },
    { q: 'What tool separates white light into its component colors?', a: ['a prism', 'prism'], type: 'multi', difficulty: 1 },
    { q: 'Approximately what wavelength does green light have?', a: ['500 nm', 'about 500 nm', '500-565 nm', '520 nm'], type: 'multi', difficulty: 2 },
    { q: 'True or false: Plants appear green because they absorb green light.', a: 'false', type: 'tf', difficulty: 2, explanation: 'Plants appear green because they REFLECT green light. They absorb red and blue light for photosynthesis.' },
  ]},
  'uv-xray-gamma': { questions: [
    { q: 'What does UV stand for?', a: ['ultraviolet'], type: 'multi', difficulty: 1 },
    { q: 'True or false: UV rays from the Sun can cause sunburn.', a: 'true', type: 'tf', difficulty: 1, explanation: 'UV radiation has enough energy to damage skin cells, causing sunburn.' },
    { q: 'What are X-rays commonly used for?', a: ['medical imaging to see inside the body', 'seeing bones', 'medical X-ray images'], type: 'multi', difficulty: 1 },
    { q: 'Which has more energy: X-rays or UV rays?', a: ['X-rays', 'x-rays'], type: 'multi', difficulty: 1, rule: 'X-rays have higher frequency and more energy than UV rays.' },
    { q: 'What are gamma rays?', a: ['the highest-energy electromagnetic waves', 'EM waves with the shortest wavelength and highest frequency'], type: 'multi', difficulty: 2, rule: 'Gamma rays are emitted by radioactive atoms and cosmic events.' },
    { q: 'True or false: Gamma rays are used in cancer treatment.', a: 'true', type: 'tf', difficulty: 2, explanation: 'Gamma rays can destroy cancer cells in radiation therapy.' },
    { q: 'Why is too much exposure to UV, X-rays, or gamma rays dangerous?', a: ['they have enough energy to damage cells and DNA', 'they are high energy and can cause cell damage', 'they can damage DNA'], type: 'multi', difficulty: 2, rule: 'High-energy EM radiation can ionize atoms and damage biological molecules.' },
    { q: 'Arrange from least to most energy: UV, gamma, X-ray.', a: ['UV, X-ray, gamma', 'UV X-ray gamma'], type: 'multi', difficulty: 2, hint: 'Follow the EM spectrum order: UV → X-ray → Gamma (increasing energy).' },
  ]},
};

// ═══════════════════════════════════════════════════════════════════════════════
// HINT BANKS — 3-tier progressive hints per skill
// ═══════════════════════════════════════════════════════════════════════════════

const HINT_BANKS = {
  // wave-properties
  'wave-types': { tier1: 'There are two main types: transverse (up-down) and longitudinal (back-and-forth).', tier2: 'In transverse waves, particles move perpendicular to the wave direction. In longitudinal, they move parallel.', tier3: 'Example: A wave on a rope is transverse. Sound in air is longitudinal (compressions and rarefactions).' },
  'wavelength-frequency': { tier1: 'Wavelength is the distance between identical points on consecutive waves. Frequency is how many waves pass per second.', tier2: 'At constant speed: more frequency = shorter wavelength. They are inversely related.', tier3: 'Example: A 10 Hz wave with 2 m wavelength: speed = 10 × 2 = 20 m/s. Period = 1/10 = 0.1 s.' },
  'amplitude-energy': { tier1: 'Amplitude is the height of the wave from the rest position. More amplitude = more energy.', tier2: 'For sound: amplitude = loudness. For light: amplitude = brightness.', tier3: 'Example: A shout has a larger amplitude wave than a whisper. A bright lamp emits higher amplitude light waves.' },
  'wave-speed': { tier1: 'Wave speed = frequency × wavelength (v = f × lambda).', tier2: 'Rearrange: f = v / lambda, or lambda = v / f. Sound in air is about 340 m/s.', tier3: 'Example: A 680 Hz sound wave in air: lambda = 340 / 680 = 0.5 m.' },

  // sound
  'sound-production': { tier1: 'Sound is made by vibrations. No vibration = no sound.', tier2: 'Vibrating objects create compressions (high pressure) and rarefactions (low pressure) in the medium.', tier3: 'Example: A drum skin vibrates when hit, pushing air molecules together and apart, creating a sound wave.' },
  'sound-medium': { tier1: 'Sound needs a medium: solid, liquid, or gas. No sound in a vacuum.', tier2: 'Sound is fastest in solids (particles close together), then liquids, then gases.', tier3: 'Example: Sound in steel ≈ 5,000 m/s, in water ≈ 1,500 m/s, in air ≈ 340 m/s.' },
  'pitch-volume': { tier1: 'Pitch = frequency (higher frequency → higher pitch). Volume = amplitude (more amplitude → louder).', tier2: 'Humans hear 20 Hz – 20,000 Hz. Below 20 Hz is infrasound; above 20,000 Hz is ultrasound.', tier3: 'Example: A flute plays high-frequency notes (high pitch). A drum makes low-frequency sounds (low pitch). Volume is measured in decibels (dB).' },
  'doppler-effect': { tier1: 'The Doppler effect: pitch changes when the source or listener is moving.', tier2: 'Approaching = higher pitch (compressed waves). Receding = lower pitch (stretched waves).', tier3: 'Example: An ambulance siren sounds higher as it approaches and lower as it drives away. The same effect with light causes redshift/blueshift.' },

  // light
  'light-sources': { tier1: 'Luminous objects make their own light (Sun, bulb). Non-luminous objects reflect light (Moon, book).', tier2: 'Light travels in straight lines at 3 × 10⁸ m/s in a vacuum. Materials are transparent, translucent, or opaque.', tier3: 'Example: Shadows form because light travels in straight lines and cannot bend around opaque objects.' },
  'reflection': { tier1: 'Reflection is light bouncing off a surface. Angle in = angle out.', tier2: 'Specular reflection (smooth surface) = clear image. Diffuse reflection (rough surface) = scattered light.', tier3: 'Example: A mirror gives specular reflection. A white wall gives diffuse reflection — light bounces in many directions.' },
  'refraction': { tier1: 'Refraction is the bending of light when it changes speed between media.', tier2: 'Light slows in denser media (glass, water) and bends toward the normal. It speeds up in less dense media and bends away.', tier3: 'Example: A straw looks bent in water because light refracts at the water-air boundary.' },
  'color-spectrum': { tier1: 'White light splits into ROY G BIV through a prism. Red has the longest wavelength; violet the shortest.', tier2: 'Objects look a certain color because they reflect that color and absorb others.', tier3: 'Example: A red apple reflects red and absorbs all other colors. A white object reflects all; a black object absorbs all.' },

  // electromagnetic
  'em-spectrum': { tier1: 'The EM spectrum: radio, microwave, infrared, visible, UV, X-ray, gamma (long to short wavelength).', tier2: 'All EM waves travel at 3 × 10⁸ m/s in a vacuum. Higher frequency = shorter wavelength = more energy.', tier3: 'Example: Radio waves (long, low energy) vs gamma rays (short, high energy). Visible light is in the middle.' },
  'radio-waves': { tier1: 'Radio waves have the longest wavelengths and lowest frequencies. Used for communication.', tier2: 'Radio, TV, cell phones, Wi-Fi, and Bluetooth all use radio waves.', tier3: 'Example: AM radio uses longer wavelengths (~hundreds of meters), FM uses shorter wavelengths (~3 m).' },
  'visible-light': { tier1: 'Visible light is the only EM radiation we can see. Range: 400 nm (violet) to 700 nm (red).', tier2: 'Violet has the most energy in visible light; red has the least.', tier3: 'Example: A prism separates white light because each color has a different wavelength and refracts at a different angle.' },
  'uv-xray-gamma': { tier1: 'UV, X-rays, and gamma rays have high energy. They can damage cells.', tier2: 'UV causes sunburn. X-rays image bones. Gamma rays treat cancer but are very dangerous in high doses.', tier3: 'Example: Sunscreen blocks UV. Lead shields block X-rays. Gamma rays need thick concrete or lead shielding.' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISCONCEPTIONS — pattern-matched corrections per skill
// ═══════════════════════════════════════════════════════════════════════════════

const MISCONCEPTIONS = {
  'wave-types': [
    { patterns: [/wave.*move.*matter|wave.*carry.*stuff/i], correction: 'Waves transfer ENERGY, not matter. The particles vibrate in place but do not travel with the wave. Think of a stadium wave — people stand and sit but do not move sideways.' },
  ],
  'wavelength-frequency': [
    { patterns: [/frequency.*wavelength.*same|same.*direction/i], correction: 'Frequency and wavelength are INVERSELY related at constant speed. When frequency goes up, wavelength goes down (and vice versa).' },
  ],
  'wave-speed': [
    { patterns: [/amplitude.*speed|louder.*faster/i], correction: 'Wave speed depends on the medium, NOT on amplitude. A louder sound does not travel faster — it just has more energy (larger amplitude).' },
  ],
  'sound-medium': [
    { patterns: [/sound.*vacuum|sound.*space/i], correction: 'Sound CANNOT travel through a vacuum. It needs a medium (solid, liquid, or gas) because it is a mechanical wave that requires particles to vibrate.' },
  ],
  'pitch-volume': [
    { patterns: [/pitch.*amplitude|loud.*high.*pitch/i], correction: 'Pitch is determined by FREQUENCY, not amplitude. Volume (loudness) is determined by AMPLITUDE. A loud sound can be low-pitched, and a quiet sound can be high-pitched.' },
  ],
  'reflection': [
    { patterns: [/light.*absorbed.*mirror|mirror.*absorb/i], correction: 'A mirror REFLECTS light, it does not absorb it. That is why you see an image. Absorbed light would make the mirror warm, not produce an image.' },
  ],
  'refraction': [
    { patterns: [/light.*same.*speed|light.*never.*slow/i], correction: 'Light changes speed when it enters a different medium. It travels fastest in a vacuum and slows down in denser materials like water and glass. This speed change causes bending (refraction).' },
  ],
  'color-spectrum': [
    { patterns: [/object.*create.*color|red.*apple.*makes.*red/i], correction: 'Objects do not create color. They REFLECT certain wavelengths and ABSORB others. A red apple reflects red light and absorbs all other colors.' },
  ],
  'em-spectrum': [
    { patterns: [/radio.*dangerous|all.*em.*harmful/i], correction: 'Not all EM waves are dangerous. Radio waves and visible light are low-energy and generally safe. Only high-energy waves like UV, X-rays, and gamma rays can damage cells.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHENOMENA — driving questions for phenomenon-based learning
// ═══════════════════════════════════════════════════════════════════════════════

const PHENOMENA = {
  'wave-properties': [
    { title: 'The Stadium Wave', focus: 'wave types, energy transfer', text: 'At a football game, fans stand up and sit down in sequence, creating a wave that travels around the stadium. But no fan actually moves from their seat to another seat.', drivingQuestion: 'How does the wave move around the stadium if the people stay in place? What does this tell us about how all waves transfer energy?' },
  ],
  'sound': [
    { title: 'The Thunder and Lightning Gap', focus: 'sound speed, wave properties', text: 'During a thunderstorm, you see lightning and then hear thunder several seconds later. The lightning and thunder happen at the same time and place, but you experience them differently.', drivingQuestion: 'Why do you see lightning before you hear thunder? If the storm is 3 km away, how long after the flash will you hear the thunder? (Use: sound ≈ 340 m/s, light ≈ instant)' },
  ],
  'light': [
    { title: 'The Bent Pencil', focus: 'refraction, light speed', text: 'When you put a pencil in a glass of water, it looks bent or broken at the water surface. But when you pull it out, it is perfectly straight.', drivingQuestion: 'Why does the pencil appear to bend in water? What is happening to the light as it moves from water to air? Could you predict the direction of the bend?' },
  ],
  'electromagnetic': [
    { title: 'Invisible Light All Around Us', focus: 'EM spectrum, applications', text: 'Right now, radio waves, Wi-Fi signals, infrared from warm objects, and cosmic gamma rays are all passing through your body — but you cannot see, hear, or feel any of them.', drivingQuestion: 'How can we detect these invisible waves? Why can we only see visible light but not the others? What determines if an EM wave is safe or dangerous?' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL LABS
// ═══════════════════════════════════════════════════════════════════════════════

const VIRTUAL_LABS = {
  'wave-on-a-rope': {
    title: 'Virtual Wave on a Rope Lab',
    skills: ['wave-types', 'wavelength-frequency', 'amplitude-energy', 'wave-speed'],
    objective: 'Explore how changing frequency and amplitude affects a transverse wave on a rope',
    background: 'A wave on a rope is a transverse wave. You can change the frequency (how fast you shake) and amplitude (how far you shake).',
    hypothesis_prompt: 'Predict: If you shake the rope faster, what happens to the wavelength? If you shake harder, what happens to the speed?',
    variables: { independent: 'frequency, amplitude', dependent: 'wavelength, wave speed, energy', controlled: ['rope material', 'rope tension', 'rope length'] },
    procedure: [
      { step: 1, action: 'Shake the rope slowly (f = 1 Hz). Measure the wavelength. Observe the amplitude.' },
      { step: 2, action: 'Shake faster (f = 2 Hz) with the same amplitude. Measure the new wavelength.' },
      { step: 3, action: 'Shake at f = 3 Hz. Measure the wavelength.' },
      { step: 4, action: 'Return to f = 2 Hz but increase the amplitude (shake harder). Does the speed change?' },
      { step: 5, action: 'Calculate wave speed for each trial: v = f × lambda.' },
    ],
    observations: {
      '1Hz': 'f = 1 Hz, wavelength = 4 m, v = 1 × 4 = 4 m/s.',
      '2Hz': 'f = 2 Hz, wavelength = 2 m, v = 2 × 2 = 4 m/s.',
      '3Hz': 'f = 3 Hz, wavelength = 1.33 m, v = 3 × 1.33 = 4 m/s.',
      'amplitude': 'Increasing amplitude made the wave taller but did NOT change the speed (still 4 m/s).',
    },
    data_table: {
      columns: ['Frequency (Hz)', 'Wavelength (m)', 'Speed (m/s)', 'Amplitude', 'Energy'],
      rows: [
        ['1', '4.0', '4', 'Small', 'Low'],
        ['2', '2.0', '4', 'Small', 'Low'],
        ['3', '1.33', '4', 'Small', 'Low'],
        ['2', '2.0', '4', 'Large', 'High'],
      ],
    },
    conclusion_questions: [
      'What happened to wavelength when frequency increased?',
      'Did wave speed change when frequency changed? Why or why not?',
      'Did wave speed change when amplitude changed?',
      'What determines wave speed if not frequency or amplitude?',
      'Write the equation that relates speed, frequency, and wavelength.',
    ],
  },
  'sound-in-different-media': {
    title: 'Virtual Sound Speed in Different Media Lab',
    skills: ['sound-medium', 'wave-speed'],
    objective: 'Compare the speed of sound in solids, liquids, and gases',
    background: 'Sound travels at different speeds depending on the medium. Particles in solids are closest together, so sound travels fastest in solids.',
    hypothesis_prompt: 'Predict: In which medium will sound travel fastest — air, water, or steel? Rank them.',
    variables: { independent: 'medium (air, water, steel)', dependent: 'speed of sound', controlled: ['temperature (20°C)', 'distance measured', 'sound source'] },
    procedure: [
      { step: 1, action: 'Measure the speed of sound in air: set off a sound and time it over 340 m. Speed ≈ 340 m/s.' },
      { step: 2, action: 'Measure the speed of sound in water using hydrophones. Speed ≈ 1,500 m/s.' },
      { step: 3, action: 'Measure the speed of sound in steel by tapping a rail and timing the arrival. Speed ≈ 5,000 m/s.' },
      { step: 4, action: 'Attempt to transmit sound through a vacuum jar. Result: no sound detected.' },
      { step: 5, action: 'Calculate how long it takes sound to travel 1 km in each medium.' },
    ],
    observations: {
      'air': 'Sound in air: 340 m/s. Time for 1 km: 1000/340 ≈ 2.94 s.',
      'water': 'Sound in water: 1,500 m/s. Time for 1 km: 1000/1500 ≈ 0.67 s.',
      'steel': 'Sound in steel: 5,000 m/s. Time for 1 km: 1000/5000 = 0.20 s.',
      'vacuum': 'No sound in a vacuum. Sound needs a medium!',
    },
    data_table: {
      columns: ['Medium', 'Speed (m/s)', 'Time for 1 km (s)', 'State of Matter'],
      rows: [
        ['Air', '340', '2.94', 'Gas'],
        ['Water', '1,500', '0.67', 'Liquid'],
        ['Steel', '5,000', '0.20', 'Solid'],
        ['Vacuum', '0', 'N/A', 'None'],
      ],
    },
    conclusion_questions: [
      'In which medium did sound travel fastest? Why?',
      'Why does sound not travel in a vacuum?',
      'How does particle spacing affect the speed of sound?',
      'A whale sings underwater. How long does the sound take to travel 15 km?',
      'Why can you hear a train coming by putting your ear to the track?',
    ],
  },
  'light-refraction-lab': {
    title: 'Virtual Light Refraction Lab',
    skills: ['refraction', 'color-spectrum', 'wave-speed'],
    objective: 'Investigate how light bends when passing between air, water, and glass',
    background: 'Light changes speed when it enters a new medium. This change in speed causes it to bend (refract). A prism separates white light because each color refracts by a different amount.',
    hypothesis_prompt: 'Predict: When light goes from air into glass, does it bend toward or away from the normal line?',
    variables: { independent: 'angle of incidence, medium', dependent: 'angle of refraction, color separation', controlled: ['light source', 'surface smoothness'] },
    procedure: [
      { step: 1, action: 'Shine a laser beam straight (0°) into a glass block. Observe: no bending.' },
      { step: 2, action: 'Shine a laser at 30° to the normal into the glass block. Measure the refraction angle (about 19°).' },
      { step: 3, action: 'Shine at 45°. Refraction angle ≈ 28°. The beam bends toward the normal entering glass.' },
      { step: 4, action: 'Shine white light through a prism. Observe the rainbow (spectrum) on the other side.' },
      { step: 5, action: 'Note which color bends the most (violet) and least (red).' },
    ],
    observations: {
      'straight': 'At 0° (straight in): no bending. Light passes straight through.',
      '30-degrees': 'At 30° in air → about 19° in glass. Light bends toward the normal.',
      '45-degrees': 'At 45° in air → about 28° in glass. Greater angle in = greater bend.',
      'prism': 'White light splits into ROY G BIV. Violet bends most, red bends least.',
    },
    data_table: {
      columns: ['Angle in Air (°)', 'Angle in Glass (°)', 'Direction of Bend'],
      rows: [
        ['0', '0', 'No bending'],
        ['30', '19', 'Toward normal'],
        ['45', '28', 'Toward normal'],
        ['60', '35', 'Toward normal'],
      ],
    },
    conclusion_questions: [
      'Does light bend toward or away from the normal when entering a denser medium?',
      'Why does light bend when it enters glass?',
      'Why does violet light bend more than red light?',
      'What would happen to the light ray when it exits the glass back into air?',
      'How does refraction explain why a pool looks shallower than it really is?',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DIAGRAMS — ASCII diagrams for key concepts
// ═══════════════════════════════════════════════════════════════════════════════

const DIAGRAMS_LOCAL = {
  'transverse-wave': {
    domain: 'ms-physics-waves',
    skill: 'wavelength-frequency',
    topic: 'Transverse Wave Anatomy',
    description: 'A transverse wave showing crest, trough, amplitude, and wavelength.',
    diagram: `
        [A]
         ╱╲              ╱╲
        ╱  ╲            ╱  ╲
  ─────╱────╲──────────╱────╲────── rest position
             ╲        ╱      ╲
              ╲      ╱        ╲╱
               ╲    ╱
                ╲╱
               [B]

  ←──── [C] ────→
  (one complete wave)

  [A] is called the: ___
  [B] is called the: ___
  [C] is called the: ___
  The height from rest to [A] is the: [D]
`,
    labels: { A: 'crest', B: 'trough', C: 'wavelength', D: 'amplitude' },
  },
  'em-spectrum-diagram': {
    domain: 'ms-physics-waves',
    skill: 'em-spectrum',
    topic: 'Electromagnetic Spectrum',
    description: 'The EM spectrum from radio waves to gamma rays.',
    diagram: `
  Long wavelength ←───────────────────────────→ Short wavelength
  Low frequency   ←───────────────────────────→ High frequency
  Low energy      ←───────────────────────────→ High energy

  ┌────────┬──────┬──────┬────────┬────┬──────┬───────┐
  |  [A]   | [B]  | [C]  |  [D]   | [E]| [F]  |  [G]  |
  | Radio  |Micro-| Infra|Visible | UV | X-ray| Gamma |
  |        | wave | red  |        |    |      |       |
  └────────┴──────┴──────┴────────┴────┴──────┴───────┘

  Longest wavelength type: [A] = ___
  Only type we can see: [D] = ___
  Highest energy type: [G] = ___
  Type used for medical imaging: [F] = ___
`,
    labels: { A: 'radio', D: 'visible light', G: 'gamma', F: 'x-ray' },
  },
  'reflection-diagram': {
    domain: 'ms-physics-waves',
    skill: 'reflection',
    topic: 'Law of Reflection',
    description: 'Diagram showing angle of incidence and angle of reflection.',
    diagram: `
          Normal
            |
   Incoming |  Reflected
     ray ╲  |  ╱ ray
          ╲ | ╱
      [A]° ╲|╱ [B]°
  ════════════════════
          Mirror

  Angle of incidence [A] = 45°
  Angle of reflection [B] = ___°
  The law states: angle of [C] = angle of [D]
`,
    labels: { A: '45', B: '45', C: 'incidence', D: 'reflection' },
  },
  'sound-wave-diagram': {
    domain: 'ms-physics-waves',
    skill: 'sound-production',
    topic: 'Longitudinal Sound Wave',
    description: 'A longitudinal wave showing compressions and rarefactions.',
    diagram: `
  Speaker vibrates →

  ||||  |  |  ||||  |  |  ||||  |  |
  ||||  |  |  ||||  |  |  ||||  |  |
  [A]      [B]  [A]      [B]  [A]

  Direction of wave →
  Direction of particle vibration ← →

  [A] = area where particles are squeezed together: ___
  [B] = area where particles are spread apart: ___
  Sound is a [C] wave (transverse or longitudinal): ___
`,
    labels: { A: 'compression', B: 'rarefaction', C: 'longitudinal' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// CER PHENOMENA — Claim-Evidence-Reasoning writing prompts
// ═══════════════════════════════════════════════════════════════════════════════

const CER_PHENOMENA_LOCAL = {
  'thunder-lightning': {
    domain: 'ms-physics-waves',
    title: 'Why Do We See Lightning Before Hearing Thunder?',
    phenomenon: 'During a thunderstorm, lightning and thunder occur at the same moment and same place. But you always see the lightning flash before you hear the thunder.',
    scaffold: {
      claim: 'Make a claim about why lightning is seen before thunder is heard.',
      evidence: 'Research: Light speed ≈ 300,000,000 m/s. Sound speed ≈ 340 m/s. If a storm is 1,700 m away, calculate how long it takes light and sound to reach you.',
      reasoning: 'Explain how the difference in speed between light and sound causes the delay. How can you use the delay to estimate how far away the storm is?',
    },
    keyTerms: ['speed', 'light', 'sound', 'faster', 'slower', 'distance', 'wave', 'medium'],
    rubric: {
      claim: { excellent: 'States that light travels much faster than sound so it arrives first', adequate: 'Says light is faster', developing: 'Incorrect or vague' },
      evidence: { excellent: 'Calculates: light takes ~0.000006 s, sound takes ~5 s for 1,700 m', adequate: 'Cites speed values', developing: 'No calculations' },
      reasoning: { excellent: 'Explains speed difference and derives the 5-second rule (count seconds, divide by 5 for km)', adequate: 'Explains speed causes delay', developing: 'Incomplete reasoning' },
    },
  },
  'red-sunset': {
    domain: 'ms-physics-waves',
    title: 'Why Is the Sky Blue but Sunsets Are Red?',
    phenomenon: 'During the day, the sky appears blue. But at sunrise and sunset, the sky turns orange and red. The Sun itself has not changed color — it is always emitting white light.',
    scaffold: {
      claim: 'Make a claim about why the sky changes color at different times of day.',
      evidence: 'Research: Blue light has a shorter wavelength (~475 nm) and scatters more than red light (~700 nm). At sunset, light travels through more atmosphere. Draw a diagram.',
      reasoning: 'Explain how the scattering of different wavelengths by the atmosphere causes blue skies and red sunsets.',
    },
    keyTerms: ['wavelength', 'scatter', 'atmosphere', 'blue', 'red', 'light', 'spectrum', 'refraction'],
    rubric: {
      claim: { excellent: 'States that blue light scatters more (Rayleigh scattering) making the sky blue; at sunset, more scattering removes blue, leaving red/orange', adequate: 'Says light scatters differently', developing: 'Does not mention scattering' },
      evidence: { excellent: 'References wavelengths, draws diagram showing light path through atmosphere at noon vs sunset', adequate: 'Mentions wavelength difference', developing: 'Limited evidence' },
      reasoning: { excellent: 'Explains Rayleigh scattering: shorter wavelengths scatter more, and at sunset the longer path scatters away blue, leaving red', adequate: 'Connects path length to color change', developing: 'Incomplete reasoning' },
    },
  },
  'broken-pencil': {
    domain: 'ms-physics-waves',
    title: 'Why Does a Pencil Look Broken in Water?',
    phenomenon: 'Place a pencil in a glass of water at an angle. It appears to bend or break at the water surface. Pull it out — it is perfectly straight.',
    scaffold: {
      claim: 'Make a claim about why the pencil appears to bend at the water surface.',
      evidence: 'Investigate: Light speed in air ≈ 300,000,000 m/s. Light speed in water ≈ 225,000,000 m/s. When light slows down entering a denser medium, it bends toward the normal.',
      reasoning: 'Explain how refraction causes the image of the pencil below water to appear shifted, making the pencil look broken.',
    },
    keyTerms: ['refraction', 'light', 'speed', 'medium', 'water', 'bend', 'angle', 'normal'],
    rubric: {
      claim: { excellent: 'States that refraction bends light at the water-air boundary, shifting the apparent position of the submerged part', adequate: 'Says light bends in water', developing: 'Does not mention refraction' },
      evidence: { excellent: 'Cites speed of light in both media and direction of bending relative to normal', adequate: 'Mentions speed change', developing: 'No specific evidence' },
      reasoning: { excellent: 'Explains that light from the submerged pencil bends away from normal when exiting water to air, so your brain traces the light in a straight line back to a shifted position', adequate: 'Connects bending to appearance', developing: 'Incomplete reasoning' },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// VOCABULARY — key terms per category
// ═══════════════════════════════════════════════════════════════════════════════

const VOCABULARY = {
  'wave-properties': [
    { term: 'wave', definition: 'A disturbance that transfers energy from one place to another without transferring matter.' },
    { term: 'transverse wave', definition: 'A wave where particles move perpendicular to the direction of wave travel (e.g., light, water waves).' },
    { term: 'longitudinal wave', definition: 'A wave where particles move parallel to the direction of wave travel (e.g., sound).' },
    { term: 'wavelength', definition: 'The distance between two consecutive identical points on a wave (crest to crest). Symbol: lambda.' },
    { term: 'frequency', definition: 'The number of complete waves passing a point per second. Measured in hertz (Hz).' },
    { term: 'amplitude', definition: 'The maximum displacement from the rest position. Related to energy.' },
    { term: 'wave speed', definition: 'How fast a wave travels. v = frequency × wavelength.' },
  ],
  'sound': [
    { term: 'sound wave', definition: 'A longitudinal mechanical wave caused by vibrations; travels through solids, liquids, and gases.' },
    { term: 'compression', definition: 'A region in a longitudinal wave where particles are pushed close together (high pressure).' },
    { term: 'rarefaction', definition: 'A region in a longitudinal wave where particles are spread apart (low pressure).' },
    { term: 'pitch', definition: 'How high or low a sound is. Determined by frequency.' },
    { term: 'volume', definition: 'How loud or soft a sound is. Determined by amplitude. Measured in decibels (dB).' },
    { term: 'Doppler effect', definition: 'The change in observed frequency and pitch when a sound source and observer are in relative motion.' },
    { term: 'ultrasound', definition: 'Sound with a frequency above 20,000 Hz, above the human hearing range.' },
  ],
  'light': [
    { term: 'luminous', definition: 'An object that produces its own light (e.g., Sun, light bulb, candle).' },
    { term: 'reflection', definition: 'The bouncing of light off a surface. Angle of incidence = angle of reflection.' },
    { term: 'refraction', definition: 'The bending of light when it passes from one medium to another due to a change in speed.' },
    { term: 'spectrum', definition: 'The band of colors that make up white light: red, orange, yellow, green, blue, indigo, violet.' },
    { term: 'normal', definition: 'An imaginary line perpendicular to a surface at the point where a light ray hits.' },
    { term: 'opaque', definition: 'A material that blocks all light (e.g., wood, metal).' },
  ],
  'electromagnetic': [
    { term: 'electromagnetic wave', definition: 'A wave of oscillating electric and magnetic fields that can travel through a vacuum.' },
    { term: 'electromagnetic spectrum', definition: 'The full range of EM waves: radio, microwave, infrared, visible, UV, X-ray, gamma.' },
    { term: 'radio waves', definition: 'EM waves with the longest wavelengths. Used for communication.' },
    { term: 'ultraviolet (UV)', definition: 'EM waves just beyond violet light. Can cause sunburn and damage DNA.' },
    { term: 'X-rays', definition: 'High-energy EM waves used in medical imaging to see through soft tissue.' },
    { term: 'gamma rays', definition: 'The highest-energy EM waves. Emitted by radioactive materials and cosmic events.' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIOS — real-world application scenarios for lessons
// ═══════════════════════════════════════════════════════════════════════════════

const SCENARIOS = [
  { title: 'Designing a Concert Hall', focus: 'sound, reflection, absorption', text: 'You are helping design a concert hall. Sound must reach every seat clearly without too much echo. The walls, ceiling, and floor materials all affect how sound reflects and absorbs. How would you choose materials and shapes to create the best listening experience?' },
  { title: 'Submarine Sonar', focus: 'sound speed, wave speed, reflection', text: 'A submarine uses sonar to detect objects underwater. It sends out a sound pulse and waits for the echo. If the echo returns in 4 seconds and sound travels at 1,500 m/s in water, how far away is the object? (Remember: the sound travels there AND back.)' },
  { title: 'Fiber Optic Communication', focus: 'refraction, total internal reflection, light', text: 'Fiber optic cables carry internet signals as pulses of light. The light bounces along inside a thin glass fiber using total internal reflection. Why does the light stay inside the fiber? How is this faster than sending electrical signals through copper wire?' },
  { title: 'Earthquake Waves', focus: 'wave types, wave speed, medium', text: 'Earthquakes produce two types of waves: P-waves (longitudinal, fast) and S-waves (transverse, slower). P-waves travel through solids and liquids; S-waves only through solids. Scientists noticed that S-waves cannot pass through Earth\'s outer core. What does this tell us about the core?' },
  { title: 'Radio Station Signal', focus: 'radio waves, EM spectrum, frequency', text: 'Your favorite radio station broadcasts at 101.5 MHz (101,500,000 Hz). Radio waves travel at 3 × 10⁸ m/s. What is the wavelength of this signal? Why can AM radio stations be heard farther away than FM stations?' },
  { title: 'Sunscreen Science', focus: 'UV, EM spectrum, absorption', text: 'Sunscreen protects skin by absorbing or reflecting UV radiation. SPF 30 blocks about 97% of UV-B rays. If you are outside for 2 hours, how much UV-B reaches your skin with SPF 30 vs no sunscreen? Why do you need to reapply sunscreen?' },
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

class MSPhysicsWaves extends DomainSkillBase {
  constructor() {
    super('ms-physics-waves', 'ms-physics-waves', DATA_DIR, loadProfile, saveProfile, HINT_BANKS);
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
        if (m < MASTERY_THRESHOLD && _wavesTopicUnlocked(sk, p.skills)) {
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
        const isUnlocked = _wavesTopicUnlocked(sk, p.skills);
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
    if (!target) return { message: 'All waves & sound skills are proficient!', congratulations: true };
    const skillMastery = p.skills[target.skill]?.mastery || 0;
    const exercise = generateExercise(target.skill, 5, skillMastery);
    const scenario = SCENARIOS.length > 0 ? pick(SCENARIOS, 1)[0] : null;
    const diff = buildDiffContext(p);
    return {
      studentId: id, targetSkill: target, exercise, scenario,
      lessonPlan: {
        review: 'Review previously learned wave concepts (2-3 min)',
        teach: `Introduce/reinforce: ${target.category} → ${target.skill}`,
        practice: `Complete ${exercise.count || 0} practice items`,
        apply: scenario ? `Analyze scenario: "${scenario.title}"` : 'Connect to real-world wave applications',
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
    if (!name) return { labs: Object.keys(VIRTUAL_LABS), instructions: 'node waves.js lab <id> <lab-name> [obs-key]' };
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
      message: due.length === 0 ? 'No waves skills due for review today!' : `${due.length} skill(s) need review. Work through each exercise below.`,
    };
  }
}

module.exports = MSPhysicsWaves;

// ═══════════════════════════════════════════════════════════════════════════════
// CLI: node waves.js <command> [args]
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const api = new MSPhysicsWaves();
  const common = buildCommonCLIHandlers(api, DATA_DIR, 'ms-physics-waves', loadProfile, saveProfile);
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
        try { ans = JSON.parse(answersJson); } catch { throw new Error("answers-json must be valid JSON e.g. '{\"A\":\"crest\"}'"); }
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
        skill: 'ms-physics-waves',
        gradeLevel: '6-8',
        standards: 'NGSS MS-PS4 (Waves and Their Applications)',
        usage: 'node waves.js <command> [args]',
        commands: {
          'start <id>': 'Start a student session; includes last session state for resume prompt',
          'lesson <id>': 'Generate a lesson with concept explanation and exercises',
          'exercise <id> [skill]': 'Generate 5 practice items; optionally filter by skill',
          'check <id> <type> <expected> <answer> [skill]': 'Check an answer; returns misconception feedback if wrong',
          'record <id> <skill> <score> <total> [hints] [notes]': 'Save a scored assessment attempt',
          'progress <id>': 'Show mastery levels across all waves skills',
          'review <id>': 'List skills due for spaced repetition today',
          'hint <id> <skill>': 'Get next hint tier (3 tiers; reduces mastery credit)',
          'lab <id> [lab-name] [obs-key]': 'Start or explore a virtual lab; omit name to list available labs',
          'diagram <id> [topic]': 'Show ASCII diagram with blank labels to fill in',
          'diagram-check <id> <topic> <answers-json>': 'Check label answers for a diagram',
          'cer <id> [topic]': 'Present a CER phenomenon with scaffold prompts',
          'cer-check <id> <topic> <claim> <evidence> <reasoning>': 'Evaluate CER response against rubric',
          'vocab <id> [topic]': 'Pre-teach waves vocabulary',
          'phenomenon [category]': 'Get a driving-question phenomenon for phenomenon-based learning',
          'scenario': 'Get a real-world application scenario',
          'catalog': 'List all skill categories and topics',
          'students': 'List all student IDs with saved profiles',
        },
      }); break;
      default: out({
        usage: 'node waves.js <command> [args]',
        commands: ['start', 'lesson', 'exercise', 'check', 'record', 'progress', 'review', 'hint', 'lab', 'diagram', 'diagram-check', 'cer', 'cer-check', 'vocab', 'phenomenon', 'scenario', 'catalog', 'students', 'help'],
      });
    }
  });
}
