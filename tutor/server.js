// MS Physics Tutor — Express server.
// Serves the student UI, wraps the orchestrator as a REST API,
// and serves PhET interactive simulations from the physics lab.

// Load .env before anything else
const path = require('path');
const fs = require('fs');
(function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
})();

const express = require('express');
const Orchestrator = require('./lib/orchestrator');
const payment = require('./lib/payment');
const accounts = require('./lib/accounts');

const app = express();
const orch = new Orchestrator();

// Root of the physics lab (parent of tutor/)
const LAB_ROOT = path.resolve(__dirname, '..');

// PhET simulations source tree (sibling repo)
const PHETSIMS_ROOT = path.resolve(__dirname, '..', 'phetsims');

app.use(express.json());
app.use(express.text({ type: 'text/xml' }));    // for Leshua XML notifications
app.use(express.text({ type: 'application/xml' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── PhET Simulation Catalog (Middle School Physics) ─────────────────────────
const topics = [
  {
    id: 'forces-motion', title: '力与运动', icon: '⚡', color: '#ef4444',
    description: '学习力、运动、摩擦和万有引力。',
    sims: [
      { slug: 'forces-and-motion-basics', title: '力与运动基础',     desc: '探索力如何影响物体的运动，学习牛顿运动定律。' },
      { slug: 'projectile-motion',        title: '抛体运动',         desc: '发射物体并观察抛体运动的轨迹。' },
      { slug: 'friction',                 title: '摩擦力',           desc: '探索摩擦力如何影响物体的运动。' },
      { slug: 'gravity-and-orbits',       title: '万有引力与轨道',   desc: '模拟天体运动，了解万有引力如何形成轨道。' },
      { slug: 'balancing-act',            title: '平衡与杠杆',       desc: '在跷跷板上放置物体，探索力矩和平衡条件。' },
    ]
  },
  {
    id: 'energy-work', title: '能量与功', icon: '🔥', color: '#f59e0b',
    description: '探索能量的形式、转换和守恒。',
    sims: [
      { slug: 'energy-skate-park-basics', title: '能量滑板公园基础', desc: '在滑板公园中观察动能和势能的转换。' },
      { slug: 'energy-forms-and-changes', title: '能量的形式与转换', desc: '探索不同形式的能量以及它们之间的转换。' },
      { slug: 'masses-and-springs',       title: '弹簧与弹性势能',   desc: '挂上不同质量的物体，探索弹簧的弹性势能。' },
      { slug: 'pendulum-lab',             title: '钟摆实验室',       desc: '调节钟摆的长度和质量，观察周期的变化。' },
    ]
  },
  {
    id: 'waves-sound', title: '波与声', icon: '🌊', color: '#3b82f6',
    description: '了解波的特性、声音的传播和干涉。',
    sims: [
      { slug: 'wave-on-a-string',  title: '绳上的波',   desc: '在绳子上产生波，观察波的反射和传播。' },
      { slug: 'wave-interference',  title: '波的干涉',   desc: '探索两列波相遇时的干涉现象。' },
      { slug: 'sound-waves',         title: '声音',       desc: '了解声音的产生、传播和频率。' },
    ]
  },
  {
    id: 'electricity-circuits', title: '电学与电路', icon: '🔌', color: '#10b981',
    description: '搭建电路，学习电流、电压和电阻。',
    sims: [
      { slug: 'circuit-construction-kit-dc', title: '直流电路搭建',   desc: '用电池、灯泡和导线搭建直流电路。' },
      { slug: 'ohms-law',                    title: '欧姆定律',       desc: '探索电压、电流和电阻之间的关系。' },
      { slug: 'resistance-in-a-wire',        title: '导线电阻',       desc: '改变导线的长度和截面积，观察电阻的变化。' },
      { slug: 'capacitor-lab-basics',        title: '电容器基础',     desc: '了解电容器的充电和放电过程。' },
    ]
  },
  {
    id: 'states-of-matter', title: '物质状态', icon: '🧊', color: '#8b5cf6',
    description: '探索物质的三态、密度和压强。',
    sims: [
      { slug: 'states-of-matter-basics', title: '物质状态基础', desc: '观察固体、液体和气体中分子的运动。' },
      { slug: 'gas-properties',          title: '气体性质',     desc: '探索气体的压强、体积和温度之间的关系。' },
      { slug: 'density',                 title: '密度',         desc: '测量不同物体的质量和体积，计算密度。' },
      { slug: 'under-pressure',          title: '压强',         desc: '探索液体和气体中的压强。' },
    ]
  }
];

// Directory layout mapping: slug → category sub-folder
// Auto-discovered from filesystem for robustness.
const CATEGORY_DIRS = ['mechanics', 'energy', 'waves', 'electricity', 'matter', 'framework'];

const slugToCategory = {};
for (const cat of CATEGORY_DIRS) {
  const catPath = path.join(LAB_ROOT, cat);
  if (fs.existsSync(catPath)) {
    try {
      for (const entry of fs.readdirSync(catPath)) {
        const full = path.join(catPath, entry);
        if (fs.statSync(full).isDirectory()) {
          slugToCategory[entry] = cat;
        }
      }
    } catch { /* skip unreadable dirs */ }
  }
}

const MIME_TYPES = {
  '.html': 'text/html',       '.css': 'text/css',
  '.js':   'text/javascript',  '.mjs': 'text/javascript',
  '.ts':   'text/javascript',
  '.json': 'application/json', '.png': 'image/png',
  '.jpg':  'image/jpeg',       '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',        '.svg': 'image/svg+xml',
  '.ico':  'image/x-icon',     '.webp': 'image/webp',
  '.mp3':  'audio/mpeg',       '.wav': 'audio/wav',
  '.ogg':  'audio/ogg',        '.woff': 'font/woff',
  '.woff2':'font/woff2',       '.ttf':  'font/ttf',
};

// ── Auth Middleware ──

function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '请先登录' });
  const user = accounts.findUserByToken(token);
  if (!user) return res.status(401).json({ error: '登录已过期，请重新登录' });
  req.user = user;
  next();
}

// ── Account API ──

// Register with phone number
app.post('/api/account/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;
    const result = await accounts.register(phone, password, name);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login with phone + password
app.post('/api/account/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    const result = accounts.login(phone, password);
    const profile = accounts.getProfile(result.userId);
    res.json({ ...result, profile });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Get own profile (requires auth)
app.get('/api/account/profile', authMiddleware, (req, res) => {
  const profile = accounts.getProfile(req.user.userId);
  res.json(profile);
});

// Update profile (name, grade, tutor)
app.put('/api/account/profile', authMiddleware, (req, res) => {
  try {
    const profile = accounts.updateProfile(req.user.userId, req.body);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get subscription plans
app.get('/api/account/plans', (req, res) => {
  res.json({ plans: accounts.getPlans() });
});

// Subscribe — creates payment order for a plan
app.post('/api/account/subscribe', authMiddleware, async (req, res) => {
  if (!payment.isEnabled()) {
    return res.status(503).json({ error: '支付功能未配置' });
  }
  try {
    const { planId } = req.body;
    const plan = accounts.PLANS[planId];
    if (!plan) return res.status(400).json({ error: '无效的套餐' });

    const result = await payment.createOrder({
      amountFen: plan.amountFen,
      body: `物理探索 — ${plan.name}`,
      payWay: undefined,
      jsPayFlag: '0',
    });

    if (result.success) {
      // Save order with userId and planId
      const orderDir = path.join(process.env.HOME, 'data', 'ms-physics-orders');
      if (!fs.existsSync(orderDir)) fs.mkdirSync(orderDir, { recursive: true });
      fs.writeFileSync(path.join(orderDir, `${result.orderId}.json`), JSON.stringify({
        orderId: result.orderId,
        leshuaOrderId: result.leshuaOrderId,
        userId: req.user.userId,
        planId,
        amountFen: plan.amountFen,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, null, 2));
    }

    res.json({ ...result, plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check subscription status
app.get('/api/account/subscription', authMiddleware, (req, res) => {
  const active = accounts.hasActiveSubscription(req.user.userId);
  const profile = accounts.getProfile(req.user.userId);
  res.json({ active, subscription: profile.subscription });
});

// Save progress (called by frontend after exercises)
app.post('/api/account/progress', authMiddleware, (req, res) => {
  try {
    const { mastery, exercisesDone, correctAnswers, streak } = req.body;
    accounts.saveProgress(req.user.userId, mastery, { exercisesDone, correctAnswers, streak });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Tutor API Routes ──

// Start or resume a session
app.post('/api/start', authMiddleware, (req, res) => {
  try {
    const { studentId, grade, tutorId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'studentId required' });
    const result = orch.startSession(studentId, grade, tutorId);
    res.json({
      message: result.message,
      session: sanitizeSession(result.session),
      mastery: orch.getMasteryData(studentId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process a student turn (async for LLM calls)
app.post('/api/turn', authMiddleware, async (req, res) => {
  try {
    const { studentId, message } = req.body;
    if (!studentId || !message) return res.status(400).json({ error: 'studentId and message required' });
    const result = await orch.processTurn(studentId, message);
    res.json({
      message: result.message,
      session: sanitizeSession(result.session),
      mastery: orch.getMasteryData(studentId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get mastery dashboard data
app.get('/api/progress/:studentId', authMiddleware, (req, res) => {
  try {
    const mastery = orch.getMasteryData(req.params.studentId);
    const session = orch.getSessionData(req.params.studentId);
    res.json({
      mastery,
      session: sanitizeSession(session),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get session state
app.get('/api/session/:studentId', authMiddleware, (req, res) => {
  try {
    const session = orch.getSessionData(req.params.studentId);
    res.json({ session: sanitizeSession(session) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Simulation Catalog API ──

app.get('/api/simulations', (req, res) => {
  res.json({ topics });
});

// ── Payment API (Leshua 乐刷) ──

// Check if payment is configured
app.get('/api/payment/status', (req, res) => {
  res.json({ enabled: payment.isEnabled() });
});

// Create QR code payment order (requires auth)
app.post('/api/payment/create', authMiddleware, async (req, res) => {
  if (!payment.isEnabled()) {
    return res.status(503).json({ error: 'Payment not configured' });
  }
  try {
    const { amountFen, body, payWay, studentId } = req.body;
    if (!amountFen || amountFen <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const result = await payment.createOrder({
      amountFen,
      body: body || '物理探索 — 学习套餐',
      payWay: payWay || undefined,
      jsPayFlag: '0', // QR scan mode
    });
    if (result.success) {
      // Save order to session data
      const orderFile = path.join(process.env.HOME, 'data', 'ms-physics-orders', `${result.orderId}.json`);
      const orderDir = path.dirname(orderFile);
      if (!fs.existsSync(orderDir)) fs.mkdirSync(orderDir, { recursive: true });
      fs.writeFileSync(orderFile, JSON.stringify({
        orderId: result.orderId,
        leshuaOrderId: result.leshuaOrderId,
        userId: req.user.userId,
        studentId: studentId || 'anonymous',
        amountFen,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, null, 2));
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Barcode payment (requires auth)
app.post('/api/payment/barcode', authMiddleware, async (req, res) => {
  if (!payment.isEnabled()) {
    return res.status(503).json({ error: 'Payment not configured' });
  }
  try {
    const { amountFen, authCode, body, studentId } = req.body;
    if (!amountFen || !authCode) {
      return res.status(400).json({ error: 'amountFen and authCode required' });
    }
    const result = await payment.barcodePay({
      amountFen,
      authCode,
      body: body || '物理探索 — 学习套餐',
    });
    if (result.success) {
      const orderFile = path.join(process.env.HOME, 'data', 'ms-physics-orders', `${result.orderId}.json`);
      const orderDir = path.dirname(orderFile);
      if (!fs.existsSync(orderDir)) fs.mkdirSync(orderDir, { recursive: true });
      fs.writeFileSync(orderFile, JSON.stringify({
        orderId: result.orderId,
        leshuaOrderId: result.leshuaOrderId,
        userId: req.user.userId,
        studentId: studentId || 'anonymous',
        amountFen,
        status: result.status === '2' ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
      }, null, 2));
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Query order status
app.get('/api/payment/query/:orderId', authMiddleware, async (req, res) => {
  if (!payment.isEnabled()) {
    return res.status(503).json({ error: 'Payment not configured' });
  }
  try {
    const result = await payment.queryOrder({ orderId: req.params.orderId });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refund (requires auth)
app.post('/api/payment/refund', authMiddleware, async (req, res) => {
  if (!payment.isEnabled()) {
    return res.status(503).json({ error: 'Payment not configured' });
  }
  try {
    const { orderId, leshuaOrderId, refundAmountFen } = req.body;
    if (!refundAmountFen) {
      return res.status(400).json({ error: 'refundAmountFen required' });
    }
    const result = await payment.refund({ orderId, leshuaOrderId, refundAmountFen });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leshua async payment notification callback (receives XML)
app.post('/api/payment/notify', (req, res) => {
  try {
    const xmlBody = typeof req.body === 'string' ? req.body : '';
    const result = payment.handleNotification(xmlBody);

    if (!result.valid) {
      console.error('Payment notification: invalid signature');
      res.status(400).send('FAIL');
      return;
    }

    console.log(`Payment notification: order=${result.orderId} status=${result.status} paid=${result.paid} amount=${result.amount}`);

    // Update order file and activate subscription if paid
    if (result.orderId) {
      const orderFile = path.join(process.env.HOME, 'data', 'ms-physics-orders', `${result.orderId}.json`);
      if (fs.existsSync(orderFile)) {
        try {
          const order = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
          order.status = result.paid ? 'paid' : 'failed';
          order.paidAt = result.paid ? new Date().toISOString() : undefined;
          order.leshuaOrderId = result.leshuaOrderId || order.leshuaOrderId;
          fs.writeFileSync(orderFile, JSON.stringify(order, null, 2));

          // Auto-activate subscription on successful payment
          if (result.paid && order.userId && order.planId) {
            try {
              accounts.activateSubscription(order.userId, order.planId, order.orderId);
              console.log(`Subscription activated: user=${order.userId} plan=${order.planId}`);
            } catch (e) {
              console.error(`Subscription activation failed: ${e.message}`);
            }
          }
        } catch (e) { console.error('Order file update error:', e.message); }
      }
    }

    // Respond with success to stop Leshua from retrying
    res.send('000000');
  } catch (err) {
    console.error('Payment notification error:', err.message);
    res.status(500).send('FAIL');
  }
});

// ── PhET Simulation File Serving ──

// Serve the entire phetsims directory so that dev-mode HTML files can resolve
// sibling-repo imports (../chipper, ../sherpa, ../scenery, etc.) via relative paths.
if (fs.existsSync(PHETSIMS_ROOT)) {
  app.use('/phetsims', express.static(PHETSIMS_ROOT, {
    // PhET TypeScript source served as JS modules in dev mode
    setHeaders(res, filePath) {
      res.set('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.ts')) {
        res.set('Content-Type', 'text/javascript');
      }
    },
  }));
  console.log(`  PhET sims served from ${PHETSIMS_ROOT}`);
}

// Simulation screenshot thumbnails — served from phetsims/{slug}/assets/
app.get('/sim-thumb/:slug', (req, res) => {
  const slug = req.params.slug;
  const assetDir = path.join(PHETSIMS_ROOT, slug, 'assets');
  if (!fs.existsSync(assetDir)) return res.status(404).send('No assets');

  // Try common screenshot naming patterns
  const candidates = [
    `${slug}-screenshot.png`,
    `${slug}_screenshot.png`,
    `${slug}-600.png`,
  ];
  // Also look for any PNG file in assets/
  try {
    const files = fs.readdirSync(assetDir).filter(f => f.endsWith('.png'));
    candidates.push(...files);
  } catch { /* ignore */ }

  for (const file of candidates) {
    const filePath = path.join(assetDir, file);
    if (fs.existsSync(filePath)) {
      res.set({ 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' });
      return fs.createReadStream(filePath).pipe(res);
    }
  }
  res.status(404).send('No thumbnail found');
});

app.get('/sim/:slug/*', (req, res, next) => {
  const slug = req.params.slug;
  const rest = req.params[0];
  const cat = slugToCategory[slug];
  if (!cat) { res.status(404).send('Simulation not found'); return; }

  const filePath = path.join(LAB_ROOT, cat, slug, rest);
  serveLabFile(filePath, res, next);
});

app.get('/sim-lib/:lib/*', (req, res, next) => {
  const lib = req.params.lib;
  const rest = req.params[0];
  const cat = slugToCategory[lib];
  if (!cat) { res.status(404).send('Library not found'); return; }

  const filePath = path.join(LAB_ROOT, cat, lib, rest);
  serveLabFile(filePath, res, next);
});

app.use((req, res, next) => {
  const segments = req.path.split('/').filter(Boolean);
  if (segments.length >= 1) {
    const first = segments[0];
    if (['api', 'css', 'js', 'sim', 'sim-lib'].includes(first)) return next();
    const cat = slugToCategory[first];
    if (cat) {
      const rest = segments.slice(1).join('/');
      const filePath = path.join(LAB_ROOT, cat, first, rest);
      return serveLabFile(filePath, res, next);
    }
  }
  next();
});

function serveLabFile(filePath, res, next) {
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(LAB_ROOT + path.sep) && resolved !== LAB_ROOT) {
    res.status(403).send('Forbidden');
    return;
  }
  fs.stat(resolved, (err, stats) => {
    if (err || !stats.isFile()) { res.status(404).send('Not found'); return; }
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.set({
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(resolved).pipe(res);
  });
}

// Strip heavy data from session for frontend
function sanitizeSession(session) {
  if (!session) return null;
  return {
    studentId: session.studentId,
    grade: session.grade,
    goal: session.goal,
    tutor: session.tutor,
    onboarded: session.onboarded,
    studyProfile: session.studyProfile,
    activeModule: session.activeModule,
    activeSkill: session.activeSkill,
    phase: session.phase,
    turnCount: session.turnCount,
    correctStreak: session.correctStreak,
    consecutiveWrong: session.consecutiveWrong,
    recentResults: session.recentResults,
    currentLab: session.currentLab ? { labId: session.currentLab.labId, step: session.currentLab.step, totalSteps: session.currentLab.totalSteps } : null,
    currentCER: session.currentCER ? { topic: session.currentCER.topic, step: session.currentCER.step } : null,
    currentDiagram: session.currentDiagram ? { topic: session.currentDiagram.topic } : null,
  };
}

// ── Start Server ──

const PORT = process.env.PORT || 3930;
app.listen(PORT, () => {
  console.log('');
  console.log('  ┌──────────────────────────────────────────────────┐');
  console.log('  │                                                  │');
  console.log('  │   🔬  MS Physics — 中学物理探索                  │');
  console.log('  │                                                  │');
  console.log(`  │   ➜  http://localhost:${PORT}                       │`);
  console.log('  │                                                  │');
  console.log('  └──────────────────────────────────────────────────┘');
  console.log('');
});
