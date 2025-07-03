// ==============================
// 🔁 Tab Switching
// ==============================
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // โหลดข้อมูลเมื่อเปิดแท็บที่เกี่ยวข้อง
  if (tabName === 'forex') loadForexPrices();
  if (tabName === 'set') loadSettrade();
}

// ==============================
// 🌓 Theme Toggle
// ==============================
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

window.onload = function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  loadWatchlist();
};

// ==============================
// ⭐ Watchlist Logic
// ==============================
function loadWatchlist() {
  const list = JSON.parse(localStorage.getItem('watchlist')) || [];
  const ul = document.getElementById('watchlist');
  ul.innerHTML = '';
  list.forEach(symbol => {
    const li = document.createElement('li');
    li.textContent = symbol;
    ul.appendChild(li);
  });
}

function addToWatchlist() {
  const input = document.getElementById('symbolInput');
  const symbol = input.value.trim().toUpperCase();
  if (!symbol) return;

  let list = JSON.parse(localStorage.getItem('watchlist')) || [];
  if (!list.includes(symbol)) {
    list.push(symbol);
    localStorage.setItem('watchlist', JSON.stringify(list));
    loadWatchlist();
    input.value = '';
  }
}

// ==============================
// 🔔 Send Alert (Local vs Netlify)
// ==============================
function sendAlert(symbol, price) {
  const isLocal = location.hostname === 'localhost' || location.protocol === 'file:';

  if (isLocal && typeof sendTelegramAlert === 'function') {
    // เรียกฟังก์ชันจาก config.js ที่โหลดเฉพาะ local
    sendTelegramAlert(`🚨 ${symbol} > ${price} จาก local`);
  } else {
    // เรียก Netlify Function
    fetch('/.netlify/functions/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, price })
    });
  }
}

// ==============================
// 💱 Load Forex Prices from Netlify
// ==============================
function loadForexPrices() {
  const output = document.getElementById('forex-output');
  if (!output) return;

  output.innerHTML = '📡 กำลังโหลด...';

  fetch('/.netlify/functions/forex_prices')
    .then(res => res.json())
    .then(data => {
      output.innerHTML = `
        <table>
          <tr><th>Code</th><th>ราคาปิดล่าสุด</th></tr>
          ${Object.entries(data).map(([code, price]) =>
            `<tr><td>${code}</td><td>${price}</td></tr>`
          ).join('')}
        </table>
      `;
    })
    .catch(err => {
      output.innerHTML = '❌ โหลดข้อมูลไม่สำเร็จ';
      console.error(err);
    });
}

// ==============================
// ⏱ Auto Refresh ทุก 30 วินาที
// ==============================
setInterval(() => {
  if (document.getElementById('forex-tab')?.classList.contains('active')) {
    loadForexPrices();
  }
  if (document.getElementById('set-tab')?.classList.contains('active')) {
    loadSettrade?.(); // เผื่อยังไม่ได้ import
  }
}, 30000);
