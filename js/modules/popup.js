window.openAbout = function(){
  if(document.getElementById('about-overlay')){
    const dlg = document.getElementById('about-overlay').querySelector('.about-dialog');
    if(dlg) dlg.focus();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'about-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.background = 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))';
  overlay.style.zIndex = '100000';

  overlay.innerHTML = `
  <div class="about-dialog" tabindex="-1">
    <h2 style="margin:0 0 8px 0;color:white">Trương Đình Hiệp</h2>
    <p style="margin:4px 0;color:#ffd6f5">my birthday: 22/08/2009</p>
    <p id="age-popup" class="age-text" style="margin:6px 0;color:#ff69b4"></p>
    <p style="margin:8px 0;color:#ffd6f5">ĐT419, Hòa Phú, Chương Mỹ, Hà Nội, Việt Nam</p>

    <div class="about-game-list">
      <div class="about-game-row">
        <img src="assets/images/valorant-logo.png" style="width:18px;height:18px;" alt="Valorant">
        <span>Valorant</span>
        <button class="copy-btn" data-copy="Ngân Anh#meo">copy idgame</button>
      </div>

      <div class="about-game-row">
        <img src="assets/images/lien-quan.png" style="width:18px;height:18px;" alt="Liên Quân">
        <span>Liên Quân Mobile</span>
        <button class="copy-btn" data-copy="姓•┊Araya">copy idgame</button>
      </div>

      <div class="about-game-row">
        <img src="assets/images/tft-icon.jpg" style="width:18px;height:18px;" alt="TFT">
        <span>Đấu Trường Chân Lý</span>
        <button class="copy-btn" data-copy="Kazukiaraya#ruru">copy idgame</button>
      </div>
    </div>

    <p style="margin-top:10px;color:#ffd6f5">📚 THPT Chương Mỹ B</p>
    <p style="margin:0 0 12px 0;color:#ffd6f5">💖 Nakano Miku</p>

    <button class="about-close"
      style="padding:10px 14px;border-radius:12px;border:none;background:#ff69b4;color:white;">
      Đóng
    </button>
  </div>
`;

  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.about-dialog');
  const closeBtn = overlay.querySelector('.about-close');
  const copyButtons = overlay.querySelectorAll('.copy-btn');

  const birth = new Date(2009,7,22);
  const agePopup = overlay.querySelector('#age-popup');
  if(agePopup) agePopup.textContent = ' ' + calculateAge(birth) + ' tuổi';

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy') || '';
      navigator.clipboard.writeText(text).then(()=>{
        btn.textContent = 'Copied';
        setTimeout(()=> btn.textContent = 'copy idgame', 1200);
      }).catch(()=>{});
    });
  });

  function closeOverlay(){
    document.removeEventListener('keydown', keyHandler);
    overlay.remove();
  }

  closeBtn.addEventListener('click', closeOverlay);

  overlay.addEventListener('click', (e)=>{
    if(e.target === overlay) closeOverlay();
  });

  function keyHandler(e){
    if(e.key === 'Escape') closeOverlay();
  }
  document.addEventListener('keydown', keyHandler);

  setTimeout(()=>{ if(dialog) dialog.focus(); }, 10);
};

function copyValorant() {
  navigator.clipboard.writeText("Ngân Anh#meo");
  alert("Đã copy ID Valorant");
}

function copyLQ() {
  navigator.clipboard.writeText("姓•┊Araya");
  alert("Đã copy ID Liên Quân");
}

function copyTFT() {
  navigator.clipboard.writeText("Kazukiaraya#ruru");
  alert("Đã copy ID TFT");
}

function initPopup(){
}

