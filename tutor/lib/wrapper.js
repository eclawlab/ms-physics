// 对话包装器 — 将结构化模块输出转换为导师的对话。
// 初中物理专用：清晰、鼓励、联系生活的语言。

// ── 工具函数 ──

function formatSkillName(skill) {
  if (!skill) return '这个知识点';
  return skill.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatModuleName(mod) {
  if (!mod) return '新的主题';
  const names = {
    'mechanics': '力与运动',
    'energy': '能量与功',
    'waves': '波与声',
    'electricity': '电学与电路',
    'matter': '物质状态',
    'study-planner': '你的学习计划',
  };
  return names[mod] || mod.replace(/-/g, ' ');
}

function extractHint(rule) {
  if (!rule) return '这里涉及的物理知识';
  const clause = rule.split(/[.;]/)[0].trim();
  const words = clause.split(' ');
  if (words.length <= 10) return clause.toLowerCase();
  return words.slice(0, 8).join(' ').toLowerCase() + '...';
}

// ── 导师定义 (Middle-school physics personas) ──

const TUTORS = {
  methodical: {
    id: 'methodical',
    name: '猫头鹰教授',
    title: 'Professor Owl',
    emoji: '\uD83E\uDD89',
    style: '耐心引导型',
    description: '像猫头鹰一样智慧，耐心带你理解每一个物理概念。',
    affirmations: ['太棒了！', '答对啦！', '做得好！', '没错没错！', '非常厉害！', '很好很好！', '你真聪明！'],
    wrongFirst: '嗯，差一点点哦——不过没关系！',
    wrongReveal: '这道题确实有点难——我来告诉你答案吧。',
    encourageAfterReveal: '别担心——知道了答案，下次一定能答对！我们继续！',
    streakMild: '你答得越来越好了，加油！',
    streakHot: '哇塞！你太厉害了！来道更有趣的！',
    welcomeNew: (name) => [
      `你好呀${name ? '，' + name : ''}！我是猫头鹰教授，你的物理学习伙伴！\uD83E\uDD89`,
      '',
      '我们可以一起探索力与运动、能量、波动、电学、物质状态，还有好多好玩的物理知识！',
      '',
      '在开始之前，我想问你几个小问题，这样我就知道怎么帮你最好啦。',
    ].join('\n'),
    welcomeBack: (name, mod) => {
      const parts = [`欢迎回来${name ? '，' + name : ''}！`];
      if (mod) { parts.push(`上次我们一起学了${formatModuleName(mod)}哦。`); parts.push('想继续上次的内容，还是学点新的？'); }
      else parts.push('今天想学什么呀？');
      return parts.join(' ');
    },
    askQ1: '你平时喜欢怎么学新的物理知识呀？\n\nA) 自己动手做实验、试一试\nB) 先看别人怎么做，再自己来\nC) 直接做做看，做错了也没关系',
    askQ2: '遇到不会的物理题，你会怎么做呢？\n\nA) 自己再想一想\nB) 请人帮忙或看提示\nC) 先做别的，回头再看',
    askQ3: '你喜欢怎样的学习节奏？\n\nA) 慢慢来，每次学一点点\nB) 看心情，有时多有时少\nC) 一口气学好多好多！',
    onboardingSummary: (profile) => {
      const parts = ['好的，我了解你啦！\n'];
      if (profile.learningPref === 'hands-on') parts.push('- 你喜欢动手——我会给你很多好玩的物理实验！');
      else if (profile.learningPref === 'examples-first') parts.push('- 你喜欢先看例子——我会先演示给你看，再让你试。');
      else parts.push('- 你喜欢直接试——我会让你先做，做错了我来帮你。');
      if (profile.studyPace === 'steady') parts.push('- 我们慢慢来，不着急。');
      else if (profile.studyPace === 'intensive') parts.push('- 你精力充沛！我们多学一些。');
      else parts.push('- 我们根据你的状态来安排。');
      parts.push('\n你最感兴趣的是什么？力与运动、能量、波动、电学还是物质状态？');
      return parts.join('\n');
    },
  },
  competitive: {
    id: 'competitive',
    name: '猎豹教练',
    title: 'Coach Cheetah',
    emoji: '\uD83D\uDC06',
    style: '闯关挑战型',
    description: '像猎豹一样敏捷，带你攻克物理难关！',
    affirmations: ['太棒啦！', '闯关成功！', '命中目标！', '又答对了！', '连击！', '你是物理小英雄！', '满分！'],
    wrongFirst: '差一点点——再来一次，你可以的！',
    wrongReveal: '这个关卡有点难——看看正确答案，下次打败它！',
    encourageAfterReveal: '记住这个答案，下次遇到就能秒杀啦！',
    streakMild: '连续答对，手感来了！继续冲！',
    streakHot: '火力全开！你就是物理冠军！来个超级关卡！',
    welcomeNew: (name) => [
      `嘿${name ? '，' + name : ''}！我是猎豹教练，你的物理教练！\uD83D\uDC06`,
      '',
      '力与运动、能量、波动、电学、物质状态——五大关卡等你来挑战！',
      '',
      '开始之前，让我先了解一下你是什么类型的小勇士。',
    ].join('\n'),
    welcomeBack: (name, mod) => {
      const parts = [`${name ? name + '，' : ''}你回来啦！准备好继续闯关了吗？`];
      if (mod) { parts.push(`上次你在攻克${formatModuleName(mod)}关卡。`); parts.push('继续还是换个新关卡？'); }
      else parts.push('今天想挑战哪个关卡？');
      return parts.join(' ');
    },
    askQ1: '先告诉我，你是哪种类型的小勇士？\n\nA) 行动派——先动手做实验试试看\nB) 观察派——先看别人怎么做\nC) 冒险派——直接上，错了再说',
    askQ2: '遇到物理难题的时候，你会怎么做？\n\nA) 自己再想想，不放弃\nB) 找找提示和线索\nC) 先跳过，回头再战',
    askQ3: '你的学习速度是？\n\nA) 稳稳的，一步一个脚印\nB) 看心情，有时快有时慢\nC) 全速冲！一口气学好多',
    onboardingSummary: (profile) => {
      const parts = ['收到！你的勇士档案建好啦：\n'];
      if (profile.learningPref === 'hands-on') parts.push('- 你是行动型勇士，我会多安排动手挑战！');
      else if (profile.learningPref === 'examples-first') parts.push('- 你是策略型勇士，先看攻略再上场！');
      else parts.push('- 你是冒险型勇士，直接实战！');
      if (profile.studyPace === 'steady') parts.push('- 训练计划：少量多次，稳步升级。');
      else if (profile.studyPace === 'intensive') parts.push('- 训练计划：高强度冲刺，快速升级！');
      else parts.push('- 训练计划：看状态灵活调整。');
      parts.push('\n选个关卡开始吧！力与运动、能量、波动、电学还是物质状态？');
      return parts.join('\n');
    },
  },
  creative: {
    id: 'creative',
    name: '海豚博士',
    title: 'Dr. Dolphin',
    emoji: '\uD83D\uDC2C',
    style: '故事探索型',
    description: '像海豚一样好奇，用实验和故事探索物理世界。',
    affirmations: ['说得太好了！', '你发现了秘密！', '就是这样！', '真聪明！', '你的物理直觉好棒！', '神奇吧？', '你像小物理学家一样思考！'],
    wrongFirst: '嗯，不太对——但你的想法很有意思哦。',
    wrongReveal: '这个答案不容易想到——来看看物理世界里藏的小秘密。',
    encourageAfterReveal: '每个"错误"都是在帮你变得更聪明哦。',
    streakMild: '你越来越有感觉了！',
    streakHot: '简直像魔法师一样！来个更有趣的挑战！',
    welcomeNew: (name) => [
      `你好呀${name ? '，' + name : ''}！我是海豚博士。\uD83D\uDC2C`,
      '',
      '你知道吗？为什么天空是蓝色的？声音是怎么传播的？磁铁为什么能吸引铁？',
      '',
      '这些都是物理的秘密哦！在开始探索之前，我想先了解一下你。',
    ].join('\n'),
    welcomeBack: (name, mod) => {
      const parts = [`${name ? name + '，' : ''}又见面啦！`];
      if (mod) { parts.push(`上次我们一起探索了${formatModuleName(mod)}的秘密。`); parts.push('想继续那个故事，还是开始新的冒险？'); }
      else parts.push('今天想探索什么秘密？');
      return parts.join(' ');
    },
    askQ1: '想象一下，面前有一个从没见过的神奇装置——你会怎么做？\n\nA) 先打开看看，动手试试\nB) 先看看别人是怎么玩的\nC) 随便按按，看会发生什么',
    askQ2: '如果你在做一个物理实验，卡住了，你会？\n\nA) 慢慢想，不着急\nB) 找找有没有线索\nC) 先去做别的，灵感来了再回来',
    askQ3: '你看一本很好看的科学书，会怎么读？\n\nA) 每天读一点点，慢慢看\nB) 看心情，有时多看有时少看\nC) 停不下来，一口气看完！',
    onboardingSummary: (profile) => {
      const parts = ['太棒了，我了解你啦！\n'];
      if (profile.learningPref === 'hands-on') parts.push('- 你喜欢动手探索——我会带你做好多有趣的物理实验！');
      else if (profile.learningPref === 'examples-first') parts.push('- 你喜欢先看故事——我会先给你讲个物理小故事，再一起探索。');
      else parts.push('- 你喜欢自己发现——我会让你直接体验，在"犯错"中找到答案。');
      if (profile.studyPace === 'steady') parts.push('- 我们慢慢来，像读故事书一样享受每个知识点。');
      else if (profile.studyPace === 'intensive') parts.push('- 你精力充沛！我们一起快快地探索更多秘密。');
      else parts.push('- 我们随心所欲，跟着好奇心走。');
      parts.push('\n你最感兴趣的是什么？力与运动、能量、波动、电学还是物质状态？');
      return parts.join('\n');
    },
  },
};

// ── 练习题展示 ──

function presentExerciseItem(item, type, instruction, context = {}) {
  const { itemNumber, totalItems, streak } = context;
  const tutor = TUTORS[(context && context.tutor) || 'methodical'] || TUTORS.methodical;
  const parts = [];

  if (itemNumber && totalItems) {
    parts.push(`（第 ${itemNumber} 题，共 ${totalItems} 题）`);
  }

  if (streak >= 3 && streak < 5) {
    parts.push(tutor.streakMild);
  } else if (streak >= 5) {
    parts.push(tutor.streakHot);
  }

  switch (type) {
    case 'short':
    case 'open':
      parts.push(item.q || item.prompt || instruction);
      break;

    case 'tf':
      parts.push(item.q || item.prompt);
      parts.push('\n（判断对错）');
      break;

    case 'multi':
      parts.push(item.q || item.prompt);
      if (item.options && item.options.length > 0) {
        parts.push(`\n选项：${item.options.join('  /  ')}`);
      }
      break;

    case 'fill-in-choice':
      parts.push(item.prompt || instruction);
      if (item.options && item.options.length > 0) {
        parts.push(`\n选项：${item.options.join('  /  ')}`);
      }
      break;

    case 'calculation':
      parts.push(item.q || item.prompt);
      if (item.formula) {
        parts.push(`\n（小提示：${item.formula}）`);
      }
      break;

    default:
      parts.push(item.q || item.prompt || item.question || instruction || '你觉得呢？');
      if (item.options && item.options.length > 0) {
        parts.push(`\n选项：${item.options.join('  /  ')}`);
      }
      break;
  }

  return parts.join('\n');
}

// ── 答案反馈 ──

function affirmCorrect(item, type, studentAnswer, context = {}) {
  const { streak } = context;
  const tutor = TUTORS[(context && context.tutor) || 'methodical'] || TUTORS.methodical;
  const affirmations = tutor.affirmations;

  const idx = Math.min((streak || 0), affirmations.length - 1);
  const parts = [affirmations[idx]];

  if (item.explanation) {
    parts.push(item.explanation);
  } else if (item.rule) {
    parts.push(item.rule);
  } else if (item.concept) {
    parts.push(`这就是「${item.concept}」哦！`);
  }

  return parts.join(' ');
}

function explainWrong(item, type, studentAnswer, attempt, context = {}, maxAttempts = 2) {
  const tutor = TUTORS[(context && context.tutor) || 'methodical'] || TUTORS.methodical;
  const parts = [];
  let revealAnswer = false;

  if (attempt < maxAttempts) {
    parts.push(tutor.wrongFirst);

    if (item.misconception) {
      parts.push(`小心这个容易搞混的地方：${item.misconception}。想想正确的做法是什么。`);
    } else if (item.hint) {
      parts.push(`小提示：${item.hint}`);
    } else if (item.formula) {
      parts.push(`试试用这个公式：${item.formula}`);
    } else if (item.rule) {
      parts.push(`想一想：${extractHint(item.rule)}`);
    } else {
      parts.push('想想生活中这个物理知识是怎么体现的。');
    }

    parts.push('\n再试试看！');
  } else {
    revealAnswer = true;
    parts.push(tutor.wrongReveal);

    const answer = item.a || item.answer || item.expected;
    if (Array.isArray(answer)) {
      parts.push(`正确答案是：${answer[0]}`);
    } else {
      parts.push(`正确答案是：${answer}`);
    }

    if (item.explanation) {
      parts.push(item.explanation);
    } else if (item.rule) {
      parts.push(item.rule);
    }

    if (item.misconception) {
      parts.push(`小心这个容易搞混的地方：${item.misconception}`);
    }

    parts.push('\n' + tutor.encourageAfterReveal);
  }

  return { text: parts.join('\n'), revealAnswer };
}

// ── 课程展示 ──

function presentLesson(lesson, context = {}) {
  const parts = [];

  if (lesson.targetSkill) {
    const skillName = formatSkillName(lesson.targetSkill.skill || lesson.targetSkill);
    parts.push(`今天我们来学「${skillName}」！`);
  }

  if (lesson.phenomenon) {
    parts.push(`\n有个有趣的现象：${lesson.phenomenon}`);
    parts.push("你觉得是怎么回事呢？");
  }

  if (lesson.teach || (lesson.lessonPlan && lesson.lessonPlan.teach)) {
    parts.push(`\n${lesson.teach || lesson.lessonPlan.teach}`);
  }

  if (!lesson.phenomenon) {
    parts.push("\n准备好做练习了吗？我们一题一题来！");
  }

  return parts.join('\n');
}

// ── CER 展示 ──

function presentCER(cerData) {
  const parts = [];
  parts.push("让我们来做一个物理探究吧！\n");
  parts.push(`问题：${cerData.phenomenon || cerData.topic}`);
  if (cerData.scaffold) {
    parts.push(`\n${cerData.scaffold}`);
  }
  parts.push("\n先说说你的想法——你觉得答案是什么？为什么呢？");
  return parts.join('\n');
}

function presentCERStep(step) {
  switch (step) {
    case 'evidence':
      return "说得好！现在说说支持你想法的证据是什么？想想我们学过的物理知识。";
    case 'reasoning':
      return "证据找得不错！现在把它们联系起来——解释为什么你的证据能支持你的想法。";
    case 'complete':
      return "很棒，探究做完了！让我来看看你的作品...";
    default:
      return "你觉得呢？";
  }
}

function presentCERFeedback(scores) {
  const parts = ["你的物理探究评分：\n"];

  const labels = { 0: '继续努力', 1: '还在进步', 2: '不错', 3: '优秀' };

  if (scores.claim !== undefined) parts.push(`  想法：${labels[scores.claim] || scores.claim}/3`);
  if (scores.evidence !== undefined) parts.push(`  证据：${labels[scores.evidence] || scores.evidence}/3`);
  if (scores.reasoning !== undefined) parts.push(`  推理：${labels[scores.reasoning] || scores.reasoning}/3`);

  if (scores.feedback) {
    parts.push(`\n${scores.feedback}`);
  }

  const total = (scores.claim || 0) + (scores.evidence || 0) + (scores.reasoning || 0);
  if (total >= 7) {
    parts.push("\n太棒了！你的物理思维真厉害！");
  } else if (total >= 5) {
    parts.push("\n做得很好！你的思考能力在进步哦。");
  } else {
    parts.push("\n好的开始！多练习几次就会越来越好的。");
  }

  return parts.join('\n');
}

// ── 图表标注 ──

function presentDiagram(diagramData) {
  const parts = [];
  parts.push(`看看这个「${formatSkillName(diagramData.topic || '物理')}」图表：\n`);
  parts.push(diagramData.diagram || diagramData.ascii || '[图表]');
  parts.push("\n把空白的地方填上吧！格式：A=答案, B=答案, ...");
  return parts.join('\n');
}

function presentDiagramFeedback(results) {
  const parts = [];
  let correct = 0;
  let total = 0;

  for (const [label, data] of Object.entries(results.labels || results)) {
    total++;
    if (data.correct) {
      correct++;
      parts.push(`  ${label}：正确！${data.expected || ''}`);
    } else {
      parts.push(`  ${label}：正确答案是"${data.expected}"。${data.explanation || ''}`);
    }
  }

  if (correct === total) {
    return `完美——全部 ${total} 个都答对了！你对这个图太熟悉啦！` + '\n' + parts.join('\n');
  }
  return `你答对了 ${total} 个中的 ${correct} 个。\n` + parts.join('\n');
}

// ── 实验展示 ──

function presentLab(labData) {
  const parts = [];
  parts.push(`物理实验：${labData.title || labData.name}\n`);
  if (labData.purpose) parts.push(`目的：${labData.purpose}\n`);
  if (labData.materials) parts.push(`需要：${labData.materials}\n`);
  parts.push("我们会一步步来。准备好开始了吗？");
  return parts.join('\n');
}

function presentLabStep(stepData, stepNum, totalSteps) {
  const parts = [`（第 ${stepNum} 步，共 ${totalSteps} 步）\n`];
  parts.push(stepData.instruction || stepData.prompt || stepData);
  if (stepData.question) {
    parts.push(`\n${stepData.question}`);
  }
  return parts.join('\n');
}

function presentLabComplete(observations) {
  const parts = ["实验做完啦！做得真好！\n"];
  if (observations && observations.length > 0) {
    parts.push("你发现了这些：");
    observations.forEach((obs, i) => parts.push(`  ${i + 1}. ${obs}`));
  }
  parts.push("\n想用探究的方式写一个物理实验报告吗？");
  return parts.join('\n');
}

// ── 词汇展示 ──

function presentVocab(vocabData) {
  const parts = ["我们先来认识几个物理术语：\n"];

  const terms = vocabData.terms || vocabData;
  if (Array.isArray(terms)) {
    terms.forEach(t => {
      if (typeof t === 'string') {
        parts.push(`  - ${t}`);
      } else {
        parts.push(`  - ${t.term}：${t.definition || t.simplified || ''}`);
        if (t.cognate) parts.push(`    （英文：${t.cognate}）`);
      }
    });
  }

  parts.push("\n这些词你认识吗？我们开始练习吧！");
  return parts.join('\n');
}

// ── 进度展示 ──

function presentProgress(progress, context = {}) {
  const parts = [];

  if (progress.mastered !== undefined && progress.total !== undefined) {
    const pct = progress.overallPct || 0;
    parts.push(`你已经学会了 ${progress.total} 个知识点中的 ${progress.mastered} 个（${pct}%）。`);

    if (pct >= 90) parts.push("太棒了——你快全部学完啦！");
    else if (pct >= 70) parts.push("进步好大！已经完成三分之二啦。");
    else if (pct >= 40) parts.push("进展不错，继续加油！");
    else parts.push("你正在打基础——每学会一个知识点都是进步哦。");
  }

  if (progress.skills) {
    const mastered = [];
    const developing = [];

    for (const [cat, skills] of Object.entries(progress.skills)) {
      for (const [sk, data] of Object.entries(skills || {})) {
        if (!data) continue;
        if (data.label === 'mastered') mastered.push(formatSkillName(sk));
        else if (data.label === 'developing' || data.label === 'emerging') developing.push(formatSkillName(sk));
      }
    }

    if (mastered.length > 0) {
      parts.push(`\n你的强项：${mastered.slice(0, 3).join('、')}${mastered.length > 3 ? `，还有 ${mastered.length - 3} 个` : ''}。`);
    }
    if (developing.length > 0) {
      parts.push(`建议多练习：${developing.slice(0, 3).join('、')}。`);
    }
  }

  return parts.join('\n');
}

function presentNextSkills(nextData) {
  if (!nextData.next || nextData.next.length === 0) {
    return "太厉害了——你已经学会了这个级别的所有知识！准备好挑战更高难度了吗？";
  }

  const top = nextData.next.slice(0, 3);
  const parts = ["我建议你接下来学："];

  top.forEach((s, i) => {
    const name = formatSkillName(s.skill);
    const status = s.label || (s.mastery > 0 ? '学习中' : '新知识');
    parts.push(`  ${i + 1}. ${name}（${status}）`);
  });

  parts.push('\n选一个吧？或者说「开始」，我来帮你选！');
  return parts.join('\n');
}

// ── 练习总结 ──

function presentExerciseSummary(result, context = {}) {
  const { score, total, skill } = result;
  const pct = total > 0 ? Math.round(score / total * 100) : 0;
  const parts = [];

  parts.push(`「${formatSkillName(skill)}」练习完成：${score}/${total} 正确（${pct}%）。`);

  if (pct >= 90) parts.push("太棒了！你学得真好！");
  else if (pct >= 80) parts.push("做得很好——已经很熟练啦。");
  else if (pct >= 60) parts.push("不错！再练习一下就能完全学会了。");
  else parts.push("这个确实有点难，但每次练习都会进步的！");

  parts.push('\n想再来一轮，还是换个新的知识点？');
  return parts.join('\n');
}

// ── 欢迎 ──

function presentWelcome(session, isNew) {
  const tutor = TUTORS[session.tutor] || TUTORS.methodical;

  if (isNew) {
    return tutor.welcomeNew(session.studentId);
  }
  return tutor.welcomeBack(session.studentId, session.activeModule);
}

// ── 模块切换 ──

function presentModuleSwitch(fromModule, toModule, reason) {
  const parts = [];
  if (fromModule) parts.push(`好的，我们先离开${formatModuleName(fromModule)}。`);
  parts.push(`现在进入${formatModuleName(toModule)}！`);
  if (reason) parts.push(reason);
  return parts.join(' ');
}

function askForClarification() {
  return "你想学哪个物理内容呀？我们有力与运动、能量与功、波与声、电学与电路和物质状态！";
}

// ── 挫折处理 ──

function checkFrustration(session) {
  if (session.consecutiveWrong >= 3) {
    return [
      "嘿，这道题确实有点难呢。没关系的——物理就是要多观察多思考。",
      '',
      "你想：",
      "  1. 试一道简单一点的题",
      "  2. 换一个内容",
      "  3. 休息一下",
      '',
      "你选哪个？",
    ].join('\n');
  }
  return null;
}

// ── 复习（间隔重复）──

function presentReview(reviewData) {
  if (!reviewData || reviewData.error) {
    return "目前没有需要复习的——你都记住啦！";
  }

  if (reviewData.due && reviewData.due.length === 0) {
    return "目前没有到期需要复习的知识。做得好，继续保持！";
  }

  const parts = ["复习时间到！这些物理知识需要回顾一下：\n"];
  const items = reviewData.due || reviewData.skills || [];
  items.slice(0, 5).forEach((item, i) => {
    const name = typeof item === 'string' ? item : (item.skill || item.topic);
    parts.push(`  ${i + 1}. ${formatSkillName(name)}`);
  });
  parts.push("\n准备好复习了吗？");
  return parts.join('\n');
}

// ── 入学引导 ──

function getOnboardingQuestion(tutorId, questionIndex) {
  const tutor = TUTORS[tutorId] || TUTORS.methodical;
  const questions = [tutor.askQ1, tutor.askQ2, tutor.askQ3];
  return questions[questionIndex] || null;
}

function getOnboardingSummary(tutorId, studyProfile) {
  const tutor = TUTORS[tutorId] || TUTORS.methodical;
  return tutor.onboardingSummary(studyProfile);
}

function getTutorName(tutorId) {
  const tutor = TUTORS[tutorId] || TUTORS.methodical;
  return tutor.name;
}

module.exports = {
  presentExerciseItem,
  affirmCorrect,
  explainWrong,
  presentLesson,
  presentCER,
  presentCERStep,
  presentCERFeedback,
  presentDiagram,
  presentDiagramFeedback,
  presentLab,
  presentLabStep,
  presentLabComplete,
  presentVocab,
  presentProgress,
  presentNextSkills,
  presentExerciseSummary,
  presentWelcome,
  presentModuleSwitch,
  askForClarification,
  checkFrustration,
  presentReview,
  formatSkillName,
  formatModuleName,
  getOnboardingQuestion,
  getOnboardingSummary,
  getTutorName,
  TUTORS,
};
