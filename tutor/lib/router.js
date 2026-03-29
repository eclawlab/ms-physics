// Intent Router — classifies student input to the correct middle school physics module.
// Keyword trigger matching. No LLM call needed.

const TRIGGERS = {
  'mechanics': ['force', 'motion', 'velocity', 'speed', 'acceleration', 'newton', 'friction', 'gravity', 'mass', 'weight', 'inertia', 'momentum', 'projectile', 'free fall', 'trajectory', 'push', 'pull', '力', '运动', '速度', '加速度', '牛顿', '摩擦', '重力', '质量', '重量', '惯性', '动量', '抛体', '推', '拉'],
  'energy': ['energy', 'work', 'power', 'kinetic', 'potential', 'thermal', 'heat', 'temperature', 'conservation', 'transfer', 'joule', 'watt', '能量', '功', '功率', '动能', '势能', '热', '温度', '守恒', '转换', '焦耳', '瓦特'],
  'waves': ['wave', 'sound', 'frequency', 'wavelength', 'amplitude', 'vibration', 'echo', 'resonance', 'light', 'reflect', 'refract', '波', '声音', '频率', '波长', '振幅', '振动', '回声', '共振', '光', '反射', '折射'],
  'electricity': ['electric', 'circuit', 'current', 'voltage', 'resistance', 'battery', 'wire', 'conductor', 'insulator', 'charge', 'magnet', 'magnetic', '电', '电路', '电流', '电压', '电阻', '电池', '导线', '导体', '绝缘', '电荷', '磁', '磁铁'],
  'matter': ['matter', 'state', 'solid', 'liquid', 'gas', 'density', 'pressure', 'atom', 'molecule', 'particle', 'boil', 'freeze', 'melt', 'temperature', '物质', '状态', '固体', '液体', '气体', '密度', '压强', '原子', '分子', '粒子', '沸腾', '凝固', '熔化'],
  'study-planner': ['plan', 'schedule', 'progress', 'what should i study', "what's next", 'what next', 'goals', 'diagnostic', 'review all', '计划', '安排', '进度', '学什么', '下一步', '目标'],
};

// Cross-domain prerequisite gates (Tier 1) — physics adapted
const PREREQUISITE_GATES = [
  {
    id: 'matter-gates-mechanics',
    condition: (mastery, activeModule) =>
      activeModule === 'mechanics' &&
      (mastery.matter || 0) < 0.50,
    target: 'matter',
    reason: "学力学需要先了解物质和质量的概念！",
    priority: 1,
  },
  {
    id: 'mechanics-gates-energy',
    condition: (mastery, activeModule) =>
      activeModule === 'energy' &&
      (mastery.mechanics || 0) < 0.50,
    target: 'mechanics',
    reason: "学能量需要先理解力和运动的基础！",
    priority: 1,
  },
  {
    id: 'mechanics-gates-waves',
    condition: (mastery, activeModule) =>
      activeModule === 'waves' &&
      (mastery.mechanics || 0) < 0.50,
    target: 'mechanics',
    reason: "学波动需要先了解力和运动的规律！",
    priority: 1,
  },
  {
    id: 'matter-gates-electricity',
    condition: (mastery, activeModule) =>
      activeModule === 'electricity' &&
      (mastery.matter || 0) < 0.50,
    target: 'matter',
    reason: "学电学需要先了解物质和粒子的基础！",
    priority: 1,
  },
];

// Smart detours (Tier 2)
const SMART_DETOURS = [
  {
    id: 'matter-ready-for-mechanics',
    condition: (mastery) =>
      (mastery.matter || 0) >= 0.80 &&
      (mastery.mechanics || 0) < 0.60,
    target: 'mechanics',
    reason: "物质基础扎实了！来学习力与运动吧！",
    priority: 2,
  },
  {
    id: 'mechanics-ready-for-energy',
    condition: (mastery) =>
      (mastery.mechanics || 0) >= 0.80 &&
      (mastery.energy || 0) < 0.60,
    target: 'energy',
    reason: "力学学得很好！来探索能量的世界吧！",
    priority: 2,
  },
  {
    id: 'mechanics-ready-for-waves',
    condition: (mastery) =>
      (mastery.mechanics || 0) >= 0.80 &&
      (mastery.waves || 0) < 0.60,
    target: 'waves',
    reason: "力学功底不错！来研究波动和声音吧！",
    priority: 2,
  },
  {
    id: 'matter-ready-for-electricity',
    condition: (mastery) =>
      (mastery.matter || 0) >= 0.80 &&
      (mastery.electricity || 0) < 0.60,
    target: 'electricity',
    reason: "物质知识掌握得好！来探索电学的奥秘吧！",
    priority: 2,
  },
];

// Tier 3: Difficulty adjustments
const DIFFICULTY_ADJUSTMENTS = [
  {
    id: 'matter-accelerates-mechanics',
    condition: (mastery, activeModule) =>
      (mastery.matter || 0) >= 0.85 && activeModule === 'mechanics',
    adjustments: { skipBasicParticles: true, complexityBias: 'high' },
  },
  {
    id: 'low-matter-scaffolds-electricity',
    condition: (mastery, activeModule) =>
      (mastery.matter || 0) < 0.40 && activeModule === 'electricity',
    adjustments: { addParticleReview: true, complexityBias: 'low' },
  },
];

const CROSS_MODULE_RULES = [...PREREQUISITE_GATES, ...SMART_DETOURS];

/**
 * Route student input to a module.
 */
function route(input, currentModule) {
  const lower = input.toLowerCase();
  const scores = {};

  for (const [mod, triggers] of Object.entries(TRIGGERS)) {
    const matched = triggers.filter(t => lower.includes(t));
    if (matched.length > 0) {
      scores[mod] = { count: matched.length, triggers: matched };
    }
  }

  const entries = Object.entries(scores);

  if (entries.length === 0) {
    if (/\b(help|start|begin|hi|hello|hey)\b/i.test(lower) && !currentModule) {
      return { module: 'study-planner', confidence: 'low', triggers: ['greeting/help'] };
    }
    if (currentModule) {
      return { module: currentModule, confidence: 'continuation', triggers: [] };
    }
    return { module: null, confidence: 'none', triggers: [] };
  }

  if (entries.length === 1) {
    const [mod, data] = entries[0];
    return { module: mod, confidence: 'high', triggers: data.triggers };
  }

  if (currentModule && scores[currentModule]) {
    return { module: currentModule, confidence: 'medium', triggers: scores[currentModule].triggers };
  }

  entries.sort((a, b) => b[1].count - a[1].count);
  const [bestMod, bestData] = entries[0];
  return { module: bestMod, confidence: entries[0][1].count > 1 ? 'high' : 'medium', triggers: bestData.triggers };
}

/**
 * Evaluate cross-module routing rules.
 */
function evaluateCrossModuleRules(mastery, activeModule, options = {}) {
  const recentScores = (options.recentScores || []).map(s => ({
    ...s,
    pct: s.pct != null ? s.pct : (s.total > 0 ? s.score / s.total : 0),
  }));
  const lastDetour = options.lastDetour || null;

  for (const rule of CROSS_MODULE_RULES) {
    if (lastDetour && rule.target === lastDetour.from) continue;

    const match = rule.condition.length >= 3
      ? rule.condition(mastery, activeModule, recentScores)
      : rule.condition(mastery, activeModule);

    if (match) {
      return { target: rule.target, reason: rule.reason, priority: rule.priority, ruleId: rule.id };
    }
  }
  return null;
}

/**
 * Evaluate Tier 3 difficulty adjustments.
 */
function evaluateDifficultyAdjustments(mastery, activeModule) {
  const adjustments = {};
  for (const rule of DIFFICULTY_ADJUSTMENTS) {
    if (rule.condition(mastery, activeModule)) {
      Object.assign(adjustments, rule.adjustments);
    }
  }
  return adjustments;
}

function isModuleSwitch(input, currentModule) {
  const switchPatterns = [
    /\b(switch|change|let's do|can we do|how about|move to|try)\b/i,
    /\b(instead|different|something else|another topic)\b/i,
  ];
  const wantsSwitch = switchPatterns.some(p => p.test(input));
  if (!wantsSwitch) return false;
  const result = route(input, null);
  return result.module && result.module !== currentModule;
}

module.exports = {
  route,
  evaluateCrossModuleRules,
  evaluateDifficultyAdjustments,
  isModuleSwitch,
  TRIGGERS,
  PREREQUISITE_GATES,
  SMART_DETOURS,
  DIFFICULTY_ADJUSTMENTS,
};
