const ALL_STARS = ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"];
let scores = {};
let currentIndex = 0;
let answers = new Array(20).fill(null); // 记录每题选了哪个选项索引

function initScores() {
  scores = {};
  ALL_STARS.forEach(s => scores[s] = 0);
  answers = new Array(20).fill(null);
}

function recalcScores() {
  scores = {};
  ALL_STARS.forEach(s => scores[s] = 0);
  answers.forEach((ansIdx, qIdx) => {
    if (ansIdx !== null) {
      const optScores = QUESTIONS[qIdx].options[ansIdx].scores;
      Object.entries(optScores).forEach(([star, val]) => {
        scores[star] = (scores[star] || 0) + val;
      });
    }
  });
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function startQuiz() {
  initScores();
  currentIndex = 0;
  showPage('page-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentIndex];
  document.getElementById('currentQ').textContent = currentIndex + 1;
  document.getElementById('progressFill').style.width = ((currentIndex + 1) / 20 * 100) + '%';
  document.getElementById('qDimension').textContent = q.dim;
  document.getElementById('qText').textContent = q.text;

  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  container.className = 'options fade-in';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (answers[currentIndex] === i) btn.classList.add('selected');
    btn.innerHTML = `<span class="option-label">${opt.label}</span><span class="option-text">${opt.text}</span>`;
    btn.onclick = () => selectOption(i);
    container.appendChild(btn);
  });

  // 导航按钮
  const nav = document.getElementById('quizNav');
  const prevBtn = document.getElementById('btnPrev');
  const nextBtn = document.getElementById('btnNext');

  prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';

  if (answers[currentIndex] !== null) {
    nextBtn.style.display = 'inline-flex';
    if (currentIndex < 19) {
      nextBtn.textContent = '下一题 →';
    } else {
      nextBtn.textContent = '查看结果 →';
    }
  } else {
    nextBtn.style.display = 'none';
  }
}

function selectOption(optIndex) {
  answers[currentIndex] = optIndex;
  recalcScores();

  document.querySelectorAll('.option-btn').forEach((b, i) => {
    b.classList.toggle('selected', i === optIndex);
  });

  const nextBtn = document.getElementById('btnNext');
  nextBtn.style.display = 'inline-flex';
  if (currentIndex < 19) {
    nextBtn.textContent = '下一题 →';
  } else {
    nextBtn.textContent = '查看结果 →';
  }

  // 自动跳转（短延迟），但只在首次选择时自动跳
  setTimeout(() => {
    if (currentIndex < 19) {
      goNext();
    }
  }, 500);
}

function goPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

function goNext() {
  if (answers[currentIndex] === null) return;
  if (currentIndex < 19) {
    currentIndex++;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  showPage('page-result');
  recalcScores();
  const sorted = ALL_STARS.map(s => ({name:s, score:scores[s]})).sort((a,b) => b.score - a.score);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const isDual = (top1.score - top2.score) <= 3 && top2.score > 0;
  const maxScore = top1.score;

  const star = STAR_DATA[top1.name];
  const container = document.getElementById('resultContainer');

  let dualNote = '';
  if (isDual) {
    const star2 = STAR_DATA[top2.name];
    dualNote = `<div class="dual-star-note">你同时具有 <strong>${top2.name}星（${star2.alias}）</strong>的特质，属于"${top1.name}+${top2.name}"双星人格</div>`;
  }

  let scoreBarsHTML = '';
  const topN = sorted.slice(0, 8);
  topN.forEach((item, idx) => {
    const pct = maxScore > 0 ? Math.round(item.score / maxScore * 100) : 0;
    const cls = idx === 0 ? 'top1' : idx === 1 ? 'top2' : 'other';
    scoreBarsHTML += `
      <div class="score-bar-item">
        <span class="score-bar-name">${item.name}</span>
        <div class="score-bar-track"><div class="score-bar-fill ${cls}" style="width:0%;" data-w="${pct}%"></div></div>
        <span class="score-bar-val">${item.score}</span>
      </div>`;
  });

  let detailHTML = '';
  detailHTML += buildDetailCard(top1.name);
  if (isDual) {
    detailHTML += buildDetailCard(top2.name);
  }

  container.innerHTML = `
    <div class="result-fade-in">
      <div class="result-header">
        <span class="result-star-icon">${star.icon}</span>
        <div class="result-star-name">${top1.name}星</div>
        <div class="result-star-alias">${star.alias}</div>
        <div class="result-star-title">${star.title}</div>
      </div>

      ${dualNote}

      <div class="result-summary">
        <div class="summary-title">✦ 综合评价</div>
        ${star.summary}
        ${isDual ? '<br><br><strong>你的副星 · ' + top2.name + '星：</strong>' + STAR_DATA[top2.name].summary : ''}
      </div>

      <div class="score-chart">
        <h3>📊 主星能量分布</h3>
        ${scoreBarsHTML}
      </div>

      <div class="detail-section">
        ${detailHTML}
      </div>

      <button class="btn-restart" onclick="restart()">重新测试</button>

      <div class="qrcode-section">
        <p>想深入了解你的命盘？<br>关注公众号「以明玄览」</p>
        <p style="margin-top:8px;font-size:12px;color:#444;">· 相信科学切勿迷信 ·</p>
      </div>
    </div>
  `;

  setTimeout(() => {
    container.querySelectorAll('.score-bar-fill').forEach(el => {
      el.style.width = el.dataset.w;
    });
  }, 300);
}

function buildDetailCard(starName) {
  const s = STAR_DATA[starName];
  let tagsHTML = s.keywords.map(k => `<span class="tag">${k}</span>`).join('');

  return `
    <div class="detail-card">
      <h3><span class="icon">${s.icon}</span> ${starName}星 · ${s.alias}详解</h3>
      <div class="tag-list">${tagsHTML}</div>
      <div class="detail-text">
        <p><strong>✦ 正面特质</strong><br>${s.positive}</p>
        <p><strong>✦ 负面特质</strong><br>${s.negative}</p>
        <p><strong>✦ 行为模式</strong><br>${s.behavior}</p>
        <p><strong>✦ 最搭主星</strong><br>${s.bestMatch}</p>
      </div>
    </div>
  `;
}

function restart() {
  initScores();
  currentIndex = 0;
  showPage('page-home');
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.stars-container');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.className = 'star-dot';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = Math.random() * 100 + '%';
    dot.style.animationDelay = Math.random() * 3 + 's';
    dot.style.animationDuration = (2 + Math.random() * 3) + 's';
    container.appendChild(dot);
  }
});
