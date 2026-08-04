const correctHash = "63b58ddff48fa640e8d306323996581f1a1f02f7f12ce31f6ac2e61f8a9b91e0";
async function hash(text){
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,"0")).join("");
}
window.openSecret = async function(){
  let password = prompt("Nhập mật khẩu:");
  if(password === null) return;
  password = password.trim();
  const inputHash = await hash(password);
  if(inputHash === correctHash){
    openPortal(()=>{
      openSecretRoom();
    });
  } 
  else {
    alert("Sai mật khẩu");
  }
};
function openSecretRoom(){
  const secretMusic = new Audio("assets/audio/kazuki.mp3");
  secretMusic.loop = true;
  secretMusic.play().catch(()=>{});
  const sakuraCanvas = document.createElement("canvas");
  sakuraCanvas.style.position="fixed";
  sakuraCanvas.style.inset="0";
  sakuraCanvas.style.zIndex="99998";
  sakuraCanvas.style.pointerEvents="none";
  document.body.appendChild(sakuraCanvas);
  const ctx = sakuraCanvas.getContext("2d");
  sakuraCanvas.width = window.innerWidth;
  sakuraCanvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    sakuraCanvas.width = window.innerWidth;
    sakuraCanvas.height = window.innerHeight;
  });
  let petals = [];
  let petalRaf = null;
  function createPetal(){
    petals.push({
      x: Math.random()*sakuraCanvas.width,
      y: -20,
      size: Math.random()*6+4,
      speed: Math.random()*2+1,
      drift: Math.random()*2-1
    });
  }
  function animatePetals(){
    // rAF-driven loop with spawn accumulator to keep ~200ms spawn interval
    let lastFrame = 0;
    let spawnAccumulator = 0;

    function _animate(ts){
      if (!lastFrame) lastFrame = ts;
      const dt = ts - lastFrame;
      lastFrame = ts;
      spawnAccumulator += dt;

      // spawn petals approximately every 200ms
      while (spawnAccumulator >= 200) {
        createPetal();
        spawnAccumulator -= 200;
      }

      ctx.clearRect(0,0,sakuraCanvas.width,sakuraCanvas.height);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.speed;
        p.x += p.drift;
        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.y > sakuraCanvas.height) {
          petals.splice(i, 1);
        }
      }

      petalRaf = requestAnimationFrame(_animate);
    }

    petalRaf = requestAnimationFrame(_animate);
  }

  animatePetals();

  let overlay=document.createElement("div");
  overlay.style.position="fixed";
  overlay.style.inset="0";
  overlay.style.display="flex";
  overlay.style.justifyContent="center";
  overlay.style.alignItems="center";
  overlay.style.zIndex="99999";
  overlay.style.background="linear-gradient(rgba(0,0,0,0.8),rgba(255,105,180,0.4))";
  overlay.style.backdropFilter="blur(15px)";
  overlay.style.willChange = "backdrop-filter, opacity";
  overlay.style.webkitBackdropFilter = "blur(15px)";
  overlay.innerHTML = `
  <div style="
    background:rgba(255,255,255,0.15);
    padding:35px;
    border-radius:30px;
    text-align:center;
    backdrop-filter:blur(25px);
    box-shadow:0 0 50px #ff69b4;
    max-width:350px;
    width:90%;
    color:white;
  ">
    <h2 id="secretTitle">room secret</h2>

    <p>こんにちは</p>
    <p>📞 0974841943</p>

    <a href="https://www.facebook.com/share/1JkxtfpxmX/?mibextid=wwXIfr"
      target="_blank"
      rel="noopener noreferrer"
      class="secret-link"
      id="hiddenPortal"
      style="display:none;">
      Hidden Portal
    </a>

    <br>

    <button id="closeSecret"
      style="
        margin-top:15px;
        padding:10px 18px;
        border:none;
        border-radius:15px;
        background:#ff69b4;
        color:white;
        cursor:pointer;
      ">
      Đóng
    </button>
  </div>
`;
  document.body.appendChild(overlay);
  let clickCount = 0;
  const secretTitle = document.getElementById("secretTitle");
  const hiddenLink = document.getElementById("hiddenPortal");
  secretTitle.addEventListener("click",()=>{
    clickCount++;
    if(clickCount === 3){
      hiddenLink.style.display = "inline-block";
    }
  });
  document.getElementById("closeSecret").onclick = function(){
    secretMusic.pause();
    try { if (typeof petalRaf !== 'undefined' && petalRaf) cancelAnimationFrame(petalRaf); } catch(e){}
    sakuraCanvas.remove();
    overlay.remove();
  };
}
function openPortal(callback){
  let portal=document.createElement("div");
  portal.className="portal";
  portal.innerHTML='<div class="portal-circle"></div>';
  document.body.appendChild(portal);
  setTimeout(()=>{
    portal.remove();
    if(callback) callback();
  },1200);
}
function initSecret(){
  const avatar = document.querySelector(".avatar");
  let clickTimeout;
  if (avatar) {
    avatar.addEventListener("click", (e) => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        triggerFireworks(e.clientX, e.clientY, {
          count: 20,
          speed: 4,
          radius: 3,
          colors: ["#ff79c6", "#ffb6c1", "#ff1493", "#ffffff"],
        });
      }, 50);
    });
  }

  const discordStatusText = document.getElementById("discord-status");
  const discordStatusBadge = document.querySelector(".status-badge");
  const secretTrigger = discordStatusBadge || discordStatusText;

  if (secretTrigger && discordStatusText) {
    secretTrigger.style.cursor = "pointer";
    secretTrigger.title = "Double-click when Online to open the secret";
    secretTrigger.addEventListener("dblclick", () => {
      if (discordStatusText.textContent.trim().toLowerCase() === "online") {
        openSecret();
      }
    });
  }

  // Double-click on hero description to open secret
  const heroDescription = document.querySelector(".hero-description");
  if (heroDescription) {
    heroDescription.style.cursor = "pointer";
    heroDescription.title = "Double-click to reveal the secret";
    heroDescription.addEventListener("dblclick", (e) => {
      e.preventDefault();
      openSecret();
    });
  }
}