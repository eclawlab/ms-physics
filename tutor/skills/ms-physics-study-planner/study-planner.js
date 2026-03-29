// eClaw MS Physics Study Planner — cross-module mastery aggregation & study planning.
// Reads mastery data from all 5 middle school physics content modules and provides
// diagnostic, planning, and recommendation capabilities.

const path = require('path');
const { dataDir, loadProfile: _lp, saveProfile: _sp, listProfiles, calcMastery, masteryLabel, runCLI, MASTERY_THRESHOLD } = require('../_lib/core');

// ═══════════════════════════════════════════════════════════════════════════════
// DATA DIRECTORIES
// ═══════════════════════════════════════════════════════════════════════════════

const DATA_DIR = dataDir('ms-physics-study-planner');
const loadProfile = id => _lp(DATA_DIR, id);
const saveProfile = p => _sp(DATA_DIR, p);

// Content module names and their data directories.
const CONTENT_MODULES = [
  'ms-physics-mechanics',
  'ms-physics-energy',
  'ms-physics-waves',
  'ms-physics-electricity',
  'ms-physics-matter',
];

const MODULE_DATA_DIRS = {};
for (const mod of CONTENT_MODULES) {
  MODULE_DATA_DIRS[mod] = dataDir(mod);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE CATALOG — skills per module, organized by grade (6-8)
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_CATALOG = {
  'ms-physics-mechanics': {
    label: '力与运动',
    grades: {
      6: ['types-of-forces', 'net-force', 'speed-velocity', 'gravitational-force', 'static-friction'],
      7: ['balanced-unbalanced', 'first-law-inertia', 'acceleration', 'free-fall', 'kinetic-friction'],
      8: ['second-law-fma', 'third-law-action-reaction', 'force-diagrams', 'projectile-motion', 'momentum-basics', 'conservation-of-momentum'],
    },
  },
  'ms-physics-energy': {
    label: '能量与功',
    grades: {
      6: ['kinetic-energy', 'potential-energy', 'thermal-energy', 'energy-forms'],
      7: ['work-definition', 'calculating-work', 'energy-transfer', 'conduction', 'lever'],
      8: ['power-definition', 'conservation-law', 'efficiency', 'specific-heat', 'mechanical-advantage'],
    },
  },
  'ms-physics-waves': {
    label: '波与声',
    grades: {
      6: ['wave-types', 'sound-production', 'light-sources'],
      7: ['wavelength-frequency', 'amplitude-energy', 'sound-medium', 'pitch-volume', 'reflection'],
      8: ['wave-speed', 'doppler-effect', 'refraction', 'em-spectrum', 'color-spectrum'],
    },
  },
  'ms-physics-electricity': {
    label: '电学与电路',
    grades: {
      6: ['static-electricity', 'charge-transfer', 'conductors-insulators', 'magnetic-fields'],
      7: ['circuit-components', 'series-circuits', 'voltage-current-resistance', 'ohms-law-calculations', 'electromagnets'],
      8: ['parallel-circuits', 'resistors-in-series', 'resistors-in-parallel', 'power-equation', 'motors-generators'],
    },
  },
  'ms-physics-matter': {
    label: '物质状态',
    grades: {
      6: ['atoms-molecules', 'particle-motion', 'states-of-matter', 'density-concept'],
      7: ['phase-changes', 'calculating-density', 'pressure-concept', 'atmospheric-pressure'],
      8: ['floating-sinking', 'liquid-pressure', 'gas-pressure', 'specific-heat-capacity', 'latent-heat'],
    },
  },
};

// Recommended module ordering (foundational to advanced).
const MODULE_ORDER = [
  'ms-physics-matter',
  'ms-physics-mechanics',
  'ms-physics-energy',
  'ms-physics-waves',
  'ms-physics-electricity',
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load a content-module profile for a student (returns blank profile if none).
 */
function loadModuleProfile(moduleName, studentId) {
  const dir = MODULE_DATA_DIRS[moduleName];
  if (!dir) return null;
  return _lp(dir, studentId);
}

/**
 * Collect mastery data across all content modules for a student.
 * Returns { moduleName: { skill: { mastery, label, attempts } } }.
 */
function aggregateMastery(studentId) {
  const result = {};
  for (const mod of CONTENT_MODULES) {
    const profile = loadModuleProfile(mod, studentId);
    const skills = profile.skills || {};
    result[mod] = {};
    // Pull mastery from the profile's skills map.
    const catalogSkills = getAllSkillsForModule(mod);
    for (const skill of catalogSkills) {
      const skillData = skills[skill];
      const mastery = skillData ? (skillData.mastery != null ? skillData.mastery : calcMastery(skillData.attempts || [])) : 0;
      result[mod][skill] = {
        mastery,
        label: masteryLabel(mastery),
        attempts: skillData ? (skillData.attempts || []).length : 0,
      };
    }
  }
  return result;
}

/**
 * Get all skills for a module across all grades.
 */
function getAllSkillsForModule(moduleName, grade) {
  const cat = MODULE_CATALOG[moduleName];
  if (!cat) return [];
  if (grade != null) {
    return cat.grades[String(grade)] || [];
  }
  const all = [];
  for (const g of Object.keys(cat.grades)) {
    all.push(...cat.grades[g]);
  }
  return all;
}

/**
 * Compute summary stats for a module.
 */
function moduleSummary(moduleData) {
  const skills = Object.keys(moduleData);
  if (!skills.length) return { total: 0, mastered: 0, proficient: 0, developing: 0, emerging: 0, notStarted: 0, avgMastery: 0 };
  let mastered = 0, proficient = 0, developing = 0, emerging = 0, notStarted = 0, totalMastery = 0;
  for (const s of skills) {
    const m = moduleData[s].mastery;
    totalMastery += m;
    if (m >= 0.9) mastered++;
    else if (m >= MASTERY_THRESHOLD) proficient++;
    else if (m >= 0.6) developing++;
    else if (m > 0) emerging++;
    else notStarted++;
  }
  return {
    total: skills.length,
    mastered,
    proficient,
    developing,
    emerging,
    notStarted,
    avgMastery: Math.round(totalMastery / skills.length * 100) / 100,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * start <studentId> <grade> — initialize a student planner profile.
 */
function handleStart(args) {
  const studentId = args[1];
  const grade = args[2];
  if (!studentId || grade == null) {
    return { error: 'Usage: start <studentId> <grade>' };
  }
  const validGrades = ['6', '7', '8'];
  const gradeStr = String(grade);
  if (!validGrades.includes(gradeStr)) {
    return { error: `Invalid grade "${grade}". Must be one of: ${validGrades.join(', ')}` };
  }
  let profile = loadProfile(studentId);
  profile.studentId = studentId;
  profile.grade = gradeStr;
  profile.level = gradeStr;
  profile.startedAt = profile.startedAt || new Date().toISOString();
  profile.updatedAt = new Date().toISOString();
  saveProfile(profile);
  return {
    status: 'ok',
    studentId,
    grade: gradeStr,
    message: `Student profile initialized for grade ${gradeStr}.`,
    modules: CONTENT_MODULES.map(mod => ({
      module: mod,
      label: MODULE_CATALOG[mod].label,
      skills: getAllSkillsForModule(mod, gradeStr),
    })),
  };
}

/**
 * diagnostic <studentId> — return mastery levels across all modules.
 */
function handleDiagnostic(args) {
  const studentId = args[1];
  if (!studentId) return { error: 'Usage: diagnostic <studentId>' };
  const profile = loadProfile(studentId);
  const grade = profile.grade || null;
  const mastery = aggregateMastery(studentId);
  const modules = {};
  for (const mod of CONTENT_MODULES) {
    const data = mastery[mod];
    modules[mod] = {
      label: MODULE_CATALOG[mod].label,
      summary: moduleSummary(data),
      skills: data,
    };
  }
  // Overall summary.
  let totalSkills = 0, totalMastery = 0, totalMastered = 0;
  for (const mod of CONTENT_MODULES) {
    const summary = modules[mod].summary;
    totalSkills += summary.total;
    totalMastery += summary.avgMastery * summary.total;
    totalMastered += summary.mastered;
  }
  return {
    studentId,
    grade,
    overall: {
      totalSkills,
      masteredSkills: totalMastered,
      avgMastery: totalSkills > 0 ? Math.round(totalMastery / totalSkills * 100) / 100 : 0,
      overallLabel: masteryLabel(totalSkills > 0 ? totalMastery / totalSkills : 0),
    },
    modules,
  };
}

/**
 * plan <studentId> — return a prioritized study plan.
 */
function handlePlan(args) {
  const studentId = args[1];
  if (!studentId) return { error: 'Usage: plan <studentId>' };
  const profile = loadProfile(studentId);
  const grade = profile.grade || null;
  const mastery = aggregateMastery(studentId);

  // Build prioritized list: weakest skills first, grouped by module order.
  const plan = [];
  for (const mod of MODULE_ORDER) {
    const data = mastery[mod];
    const gradeSkills = grade ? getAllSkillsForModule(mod, grade) : getAllSkillsForModule(mod);
    const weak = [];
    for (const skill of gradeSkills) {
      const info = data[skill];
      if (!info || info.mastery < MASTERY_THRESHOLD) {
        weak.push({
          module: mod,
          moduleLabel: MODULE_CATALOG[mod].label,
          skill,
          mastery: info ? info.mastery : 0,
          label: info ? info.label : 'not-started',
          priority: info ? (info.mastery === 0 ? 'start' : info.mastery < 0.6 ? 'high' : 'medium') : 'start',
        });
      }
    }
    // Sort within module: lowest mastery first.
    weak.sort((a, b) => a.mastery - b.mastery);
    plan.push(...weak);
  }

  return {
    studentId,
    grade,
    totalItems: plan.length,
    plan,
  };
}

/**
 * recommend <studentId> — return next recommended module/skill.
 */
function handleRecommend(args) {
  const studentId = args[1];
  if (!studentId) return { error: 'Usage: recommend <studentId>' };
  const profile = loadProfile(studentId);
  const grade = profile.grade || null;
  const mastery = aggregateMastery(studentId);

  // Walk modules in order; find first skill below threshold.
  for (const mod of MODULE_ORDER) {
    const data = mastery[mod];
    const gradeSkills = grade ? getAllSkillsForModule(mod, grade) : getAllSkillsForModule(mod);
    for (const skill of gradeSkills) {
      const info = data[skill];
      if (!info || info.mastery < MASTERY_THRESHOLD) {
        return {
          studentId,
          grade,
          recommendation: {
            module: mod,
            moduleLabel: MODULE_CATALOG[mod].label,
            skill,
            currentMastery: info ? info.mastery : 0,
            currentLabel: info ? info.label : 'not-started',
            reason: info && info.mastery > 0
              ? `Skill "${skill}" is at ${Math.round((info.mastery) * 100)}% mastery — needs more practice.`
              : `Skill "${skill}" has not been started yet.`,
          },
        };
      }
    }
  }

  // All skills mastered.
  return {
    studentId,
    grade,
    recommendation: null,
    message: 'All skills at or above proficiency. Consider advancing to the next grade level.',
  };
}

/**
 * progress <studentId> — return overall progress.
 */
function handleProgress(args) {
  const studentId = args[1];
  if (!studentId) return { error: 'Usage: progress <studentId>' };
  const profile = loadProfile(studentId);
  const grade = profile.grade || null;
  const mastery = aggregateMastery(studentId);

  const moduleProgress = [];
  let overallTotal = 0, overallMastered = 0, overallProficient = 0, overallMasterySum = 0;

  for (const mod of CONTENT_MODULES) {
    const data = mastery[mod];
    const summary = moduleSummary(data);
    moduleProgress.push({
      module: mod,
      label: MODULE_CATALOG[mod].label,
      ...summary,
      percentComplete: summary.total > 0 ? Math.round((summary.mastered + summary.proficient) / summary.total * 100) : 0,
    });
    overallTotal += summary.total;
    overallMastered += summary.mastered;
    overallProficient += summary.proficient;
    overallMasterySum += summary.avgMastery * summary.total;
  }

  return {
    studentId,
    grade,
    overall: {
      totalSkills: overallTotal,
      mastered: overallMastered,
      proficient: overallProficient,
      remaining: overallTotal - overallMastered - overallProficient,
      avgMastery: overallTotal > 0 ? Math.round(overallMasterySum / overallTotal * 100) / 100 : 0,
      percentComplete: overallTotal > 0 ? Math.round((overallMastered + overallProficient) / overallTotal * 100) : 0,
      overallLabel: masteryLabel(overallTotal > 0 ? overallMasterySum / overallTotal : 0),
    },
    modules: moduleProgress,
  };
}

/**
 * catalog [grade] — return available modules and skills.
 */
function handleCatalog(args) {
  const grade = args[1] || null;
  const modules = [];

  for (const mod of CONTENT_MODULES) {
    const cat = MODULE_CATALOG[mod];
    if (grade != null) {
      const gradeStr = String(grade);
      const skills = cat.grades[gradeStr] || [];
      if (skills.length) {
        modules.push({
          module: mod,
          label: cat.label,
          grade: gradeStr,
          skills,
          skillCount: skills.length,
        });
      }
    } else {
      const allGrades = {};
      let totalSkills = 0;
      for (const g of Object.keys(cat.grades)) {
        allGrades[g] = cat.grades[g];
        totalSkills += cat.grades[g].length;
      }
      modules.push({
        module: mod,
        label: cat.label,
        grades: allGrades,
        totalSkills,
      });
    }
  }

  return {
    grade: grade ? String(grade) : 'all',
    totalModules: modules.length,
    modules,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  runCLI((cmd, args, out) => {
    switch (cmd) {
      case 'start':       return out(handleStart(args));
      case 'diagnostic':  return out(handleDiagnostic(args));
      case 'plan':        return out(handlePlan(args));
      case 'recommend':   return out(handleRecommend(args));
      case 'progress':    return out(handleProgress(args));
      case 'catalog':     return out(handleCatalog(args));
      default:
        return out({
          error: `Unknown command "${cmd}".`,
          usage: 'Commands: start <studentId> <grade> | diagnostic <studentId> | plan <studentId> | recommend <studentId> | progress <studentId> | catalog [grade]',
        });
    }
  });
}

module.exports = {
  DATA_DIR,
  CONTENT_MODULES,
  MODULE_CATALOG,
  MODULE_ORDER,
  handleStart,
  handleDiagnostic,
  handlePlan,
  handleRecommend,
  handleProgress,
  handleCatalog,
  aggregateMastery,
  loadProfile,
  saveProfile,
};
