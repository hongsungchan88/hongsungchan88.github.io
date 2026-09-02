// ============================================
// Expand / collapse project detail
// ============================================
document.querySelectorAll('.expand-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const target = document.getElementById(targetId);
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if (target) target.hidden = expanded;
    btn.textContent = expanded ? '자세히 보기' : '접기';
  });
});

// ============================================
// Scroll reveal (IntersectionObserver)
// ============================================
const revealTargets = document.querySelectorAll(
  '.section-inner > *, .hero-inner > *, .project-card, .side-card, .stack-card'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
revealTargets.forEach((el) => io.observe(el));

// ============================================
// Concurrency demo (Optimistic Lock simulation)
// ============================================
const lockToggle = document.getElementById('lockToggle');
const rushBtn = document.getElementById('rushBtn');
const resetBtn = document.getElementById('resetBtn');
const seatStatus = document.getElementById('seatStatus');
const seatCard = document.getElementById('seatCard');
const requestLog = document.getElementById('requestLog');

let seatTaken = false;
let currentVersion = 0;

function resetDemo() {
  seatTaken = false;
  currentVersion = 0;
  seatStatus.textContent = '예매 가능';
  seatStatus.style.color = 'var(--text-green)';
  seatCard.style.borderColor = 'var(--border)';
  requestLog.innerHTML = '<p class="log-empty">요청을 발사하면 결과가 여기에 표시됩니다.</p>';
}
resetDemo();

function fireRequests() {
  requestLog.innerHTML = '';
  seatTaken = false;
  currentVersion = 0;
  seatStatus.textContent = '처리 중…';
  seatStatus.style.color = 'var(--text-secondary)';

  const useLock = lockToggle.checked;
  const requestCount = 5;

  for (let i = 1; i <= requestCount; i++) {
    const delay = Math.random() * 400 + 100; // 서로 다른 네트워크 지연 흉내
    setTimeout(() => {
      const line = document.createElement('div');
      line.classList.add('log-line');

      if (useLock) {
        // Optimistic Lock: 버전 체크 후 최초 1건만 성공
        if (!seatTaken) {
          seatTaken = true;
          currentVersion += 1;
          line.classList.add('log-success');
          line.textContent = `요청 #${i} → 성공 (버전 ${currentVersion}로 커밋)`;
        } else {
          line.classList.add('log-fail');
          line.textContent = `요청 #${i} → 실패 (버전 충돌 감지, 재시도 필요)`;
        }
      } else {
        // Lock 미적용: 모두 성공(정합성 붕괴)
        seatTaken = true;
        line.classList.add('log-success');
        line.textContent = `요청 #${i} → 성공 (락 없음, 검증 없이 통과)`;
      }

      requestLog.appendChild(line);

      // 마지막 요청 처리 후 좌석 상태 갱신
      if (i === requestCount) {
        if (useLock) {
          seatStatus.textContent = '예매 완료 (중복 0건)';
          seatStatus.style.color = 'var(--text-green)';
          seatCard.style.borderColor = 'var(--text-green)';
        } else {
          seatStatus.textContent = `예매 완료 (중복 ${requestCount}건 발생!)`;
          seatStatus.style.color = 'var(--text-red)';
          seatCard.style.borderColor = 'var(--text-red)';
        }
      }
    }, delay);
  }
}

rushBtn.addEventListener('click', fireRequests);
resetBtn.addEventListener('click', resetDemo);
