// เปลี่ยนแท็บ
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // โหลดเฉพาะเมื่อเปิดแท็บ forex
  if (tabName === 'forex') {
    loadForexPrices();
  }
}


// ธีม Light/Dark Toggle
function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// โหลดธีมที่เคยเลือกไว้
window.onload = function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
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
