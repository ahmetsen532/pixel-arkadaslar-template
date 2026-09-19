// --- 1. ARKADAŞ VERİLERİ ---
const friends = [
    { id: 'İsim1', name: 'İsim1', img: 'images/' },
    { id: 'İsim2', name: 'İsim2', img: 'images/' },
    { id: 'İsim3', name: 'İsim3', img: 'images/' },
    { id: 'İsim4', name: 'İsim4', img: 'images/' },
    { id: 'İsim5', name: 'İsim5', img: 'images/' },
    { id: 'İsim6', name: 'İsim6', img: 'images/' },
    { id: 'İsim7', name: 'İsim7', img: 'images/' }
];

// --- 2. HTML ELEMENTLERİ ---
const personImg = document.getElementById('personImg');
const personName = document.getElementById('personName');
const cardTitle = document.getElementById('cardTitle');
const cardDesc = document.getElementById('cardDesc');
const mainContainer = document.getElementById('mainContainer');
const portraitContainer = document.getElementById('portraitContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');

const authorSelect = document.getElementById('authorSelect');
const readMode = document.getElementById('readMode');
const writeMode = document.getElementById('writeMode');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const commentInput = document.getElementById('commentInput');
const nicknameInput = document.getElementById('nicknameInput'); // YENİ EKLENDİ

const rainContainer = document.getElementById('rainContainer');
const shootingStarsLayer = document.getElementById('shootingStarsLayer');

let currentIndex = Math.floor(Math.random() * friends.length);
let commentsData = {};

// Sunucudan yazıları çeken fonksiyon
async function fetchComments() {
    try {
        const response = await fetch('/api/comments');
        commentsData = await response.json();
        updateCardContent();
    } catch (error) {
        console.error("Yorumlar çekilemedi:", error);
    }
}

// YENİ: Kartın içindeki yazıyı ve lakapları güncelleyen fonksiyon
function updateCardContent() {
    const currentPerson = friends[currentIndex].id;
    const currentAuthor = authorSelect.value;
    
    let displayName = friends[currentIndex].name; // Varsayılan isim
    let displayText = "Henüz bir şey yazılmamış...";
    let statsHtml = ""; // İstatistikler için boş kap

    const record = commentsData[currentPerson] && commentsData[currentPerson][currentAuthor];
    // --- YENİ: İstatistikleri Hazırla ---
    const stats = (record && record.stats) ? record.stats : { zeka: 5, sezgi: 5, kaos: 5, mizah: 5 };
    Object.keys(stats).forEach(key => {
        const percent = stats[key] * 10;
        statsHtml += `
            <div class="stat-bar-row">
                <span style="width: 80px; font-size: 8px;">${key.toUpperCase()}</span>
                <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${percent}%"></div></div>
                <span style="font-size: 8px;">${stats[key]}</span>
            </div>`;
    });
    document.getElementById('statsDisplay').innerHTML = statsHtml;
    // ------------------------------------
    if (record) {
        if (typeof record === 'string') {
            displayText = record.replace(/\n/g, '<br>');
        } else {
            displayText = record.text.replace(/\n/g, '<br>');
            // Yazar bu kişiye özel bir lakap girmişse, ismi ez!
            if (record.nickname && record.nickname.trim() !== "") {
                displayName = record.nickname; 
            }
        }
    }

    // Hem kart başlığını hem slider altındaki ismi GÜNCELLE
    cardTitle.textContent = displayName;
    personName.textContent = displayName;
    cardDesc.innerHTML = displayText;
}

// Yazar menüsü değiştiğinde hem yazıyı hem de (varsa) kişinin lakabını anında değiştir
authorSelect.addEventListener('change', updateCardContent);

// --- YAZI YAZMA / DÜZENLEME MANTIĞI ---
editBtn.addEventListener('click', () => {
    const currentPerson = friends[currentIndex].id;
    const currentAuthor = authorSelect.value;
    const record = commentsData[currentPerson] && commentsData[currentPerson][currentAuthor];
    
const stats = (record && record.stats) ? record.stats : { zeka: 5, sezgi: 5, kaos: 5, mizah: 5 };
    Object.keys(stats).forEach(key => {
        document.getElementById(`stat-${key}`).value = stats[key];
        document.getElementById(`val-${key}`).innerText = stats[key];
    });

    if (record) {
        if (typeof record === 'string') {
            commentInput.value = record;
            nicknameInput.value = "";
        } else {
            commentInput.value = record.text;
            nicknameInput.value = record.nickname || "";
        }
    } else {
        commentInput.value = "";
        nicknameInput.value = "";
    }
    
    readMode.style.display = "none";
    writeMode.style.display = "block";
});

cancelBtn.addEventListener('click', () => {
    writeMode.style.display = "none";
    readMode.style.display = "block";
});

// KAYDET BUTONU (Artık Lakabı da sunucuya yolluyor)
saveBtn.addEventListener('click', async () => {
    const currentPerson = friends[currentIndex].id;
    const currentAuthor = authorSelect.value;
    const text = commentInput.value;
    const nickname = nicknameInput.value;

// YENİ: Slider değerlerini topla
const stats = {
    zeka: document.getElementById('stat-zeka').value,
    sezgi: document.getElementById('stat-sezgi').value,
    kaos: document.getElementById('stat-kaos').value,
    mizah: document.getElementById('stat-mizah').value
};

    await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: currentAuthor, target: currentPerson, text: text, nickname: nickname,stats: stats })
    });

    await fetchComments();
    writeMode.style.display = "none";
    readMode.style.display = "block";
});

// --- SLIDER ÇALIŞMA MANTIĞI ---
function changePerson(direction) {
    nextBtn.disabled = true;
    prevBtn.disabled = true;
    portraitContainer.classList.remove('wipe-in-right', 'wipe-in-left', 'wipe-out-left', 'wipe-out-right');

    if (direction === 'next') { portraitContainer.classList.add('wipe-out-left'); } 
    else { portraitContainer.classList.add('wipe-out-right'); }

    writeMode.style.display = "none";
    readMode.style.display = "block";

    setTimeout(() => {
        if (direction === 'next') { currentIndex = (currentIndex + 1) % friends.length; } 
        else { currentIndex = (currentIndex - 1 + friends.length) % friends.length; }

        const person = friends[currentIndex];
        personImg.src = person.img;
        
        // YENİ: İsmi doğrudan yazmıyoruz, updateCardContent çağırıyoruz (Lakap varsa onu koyuyor)
        updateCardContent();

        portraitContainer.classList.remove('wipe-out-left', 'wipe-out-right');
        
        if (direction === 'next') { portraitContainer.classList.add('wipe-in-right'); } 
        else { portraitContainer.classList.add('wipe-in-left'); }

        setTimeout(() => {
            nextBtn.disabled = false;
            prevBtn.disabled = false;
        }, 400); 
    }, 400); 
}

// BUNDAN SONRAKİ KISIM (Tıklama Olayları, Yağmur, Yıldız vs.) AYNEN KALACAK...
// --- TIKLAMA OLAYLARI ---
nextBtn.addEventListener('click', () => changePerson('next'));
prevBtn.addEventListener('click', () => changePerson('prev'));
portraitContainer.addEventListener('click', () => mainContainer.classList.add('detail-mode'));
backBtn.addEventListener('click', () => mainContainer.classList.remove('detail-mode'));

// --- YAĞMUR EFEKTİ ---
function createRain() {
    if (!rainContainer) return;
    
    const dropCount = 60; 

    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.classList.add('raindrop');
        
        drop.style.left = Math.random() * 100 + 'vw';
        
        const duration = Math.random() * 1 + 1.5;
        drop.style.animationDuration = duration + 's';
        
        const delay = Math.random() * 4;
        drop.style.animationDelay = delay + 's';
        
        drop.style.opacity = Math.random() * 0.7 + 0.7;
        drop.style.height = (Math.random() * 30 + 20) + 'px';
        
        rainContainer.appendChild(drop);
    }
}

// --- KAYAN YILDIZ (Lokal Işık ve Çapraz Düşüş) ---
function createShootingStarLocal() {
    if (!shootingStarsLayer) return;

    const star = document.createElement('div');
    star.classList.add('shooting-star');

    // Başlangıç pozisyonu (Ekranın üst-sol kısmına yakın)
    const startX = Math.random() * 20 + 'vw'; 
    const startY = Math.random() * 20 + 'vh'; 
    star.style.left = startX;
    star.style.top = startY;

    // Yavaş düşüş animasyonu
    const duration = Math.random() * 3 + 4;
    star.style.animation = `shootLocal ${duration}s ease-out forwards`;

    shootingStarsLayer.appendChild(star);

    // Yıldız animasyonu bittiğinde sil
    setTimeout(() => {
        star.remove();
    }, duration * 1000); 
}

function initShootingStars() {
    setTimeout(() => {
        createShootingStarLocal();
        setInterval(createShootingStarLocal, Math.random() * 6000 + 4000);
    }, Math.random() * 2000);
}

// --- BAŞLANGIÇ KONTROLÜ (Tüm site yüklendiğinde tek bir yerden tetikliyoruz) ---
window.addEventListener('load', () => {
    // Efektleri başlat
    createRain(); 
    initShootingStars();
    
    // İlk kişiyi ekrana yükle
    const person = friends[currentIndex];
    personImg.src = person.img;
    personName.textContent = person.name;
    fetchComments();
});



const musicBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const bgAudio = document.getElementById('bg-audio');

let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        bgAudio.pause();
        musicIcon.innerText = '🔇';
    } else {
        bgAudio.play();
        musicIcon.innerText = '🎵';
    }
    isPlaying = !isPlaying;
});

// İsteğe bağlı: Ses seviyesini biraz düşürelim ki chill kalsın
bgAudio.volume = 0.3;




function createScreenSplash() {
    const splash = document.createElement('div');
    splash.classList.add('rain-splash');

    // Rastgele boyut (20px - 60px arası)
    const size = Math.random() * 40 + 20;
    splash.style.width = `${size}px`;
    splash.style.height = `${size}px`;

    // Ekranın rastgele bir yerine yerleştir
    splash.style.left = Math.random() * window.innerWidth + 'px';
    splash.style.top = Math.random() * window.innerHeight + 'px';

    document.body.appendChild(splash);

    // Animasyon bitince temizle
    setTimeout(() => {
        splash.remove();
    }, 600);
}

// Her 2-4 saniyede bir rastgele çarpma efekti tetikle
function startSplashing() {
    const randomTime = Math.random() * 2000 + 2000;
    setTimeout(() => {
        createScreenSplash();
        startSplashing();
    }, randomTime);
}

startSplashing();

// Slider değerlerini kaydırdıkça anlık sayıları güncelle
['zeka', 'kaos', 'sezgi', 'mizah'].forEach(stat => {
    const inputEl = document.getElementById(`stat-${stat}`);
    const valEl = document.getElementById(`val-${stat}`);
    if(inputEl && valEl) {
        inputEl.addEventListener('input', (e) => {
            valEl.innerText = e.target.value;
        });
    }
});


// --- DİNAMİK GÖKYÜZÜ MANTIĞI ---
function setTimeBasedTheme() {
    const hour =  20;
    const body = document.body;
    const cityLamp = document.getElementById('cityLamp'); // Lambayı yakalıyoruz

    // Önce varsa eski temaları temizle
    body.classList.remove('theme-day', 'theme-sunset');

// Varsayılan olarak lambayı söndür
    if (cityLamp) cityLamp.classList.remove('lamp-on');


if (hour >= 6 && hour < 17) {
        // GÜNDÜZ
        body.classList.add('theme-day');
        // Lamba kapalı kalır
    } 
    else if (hour >= 17 && hour < 20) {
        // GÜN BATIMI
        body.classList.add('theme-sunset');
        // Lamba kapalı kalır
    } 
    else {
        // GECE (20:00 - 06:00 arası)
        // Hiçbir body sınıfı eklenmez (varsayılan siyah tema kalır)
        
        // Sadece gece olduğunda lambayı yak!
        if (cityLamp) cityLamp.classList.add('lamp-on');
    }







    // Saatlere göre tema belirle
    if (hour >= 6 && hour < 17) {
        // Sabah 06:00 ile Akşam 17:00 arası: GÜNDÜZ
        body.classList.add('theme-day');
    } 
    else if (hour >= 17 && hour < 20) {
        // Akşam 17:00 ile 20:00 arası: GÜN BATIMI
        body.classList.add('theme-sunset');
    }
    // Saat 20:00 ile 06:00 arası hiçbir şey eklemiyoruz, 
    // çünkü senin default kodların (siyah/mor gökyüzü) zaten GECE teması!
}

// Sayfa yüklendiğinde temayı ayarla
window.addEventListener('DOMContentLoaded', setTimeBasedTheme);

// İsteğe bağlı: Sayfa açıkken saat değişirse temayı da güncellesin
setInterval(setTimeBasedTheme, 60000); // Her dakikada bir saati kontrol et

// --- SOKAK LAMBASI SÜRPRİZİ (GÜVENLİ TIKLAMA) ---
const cityLamp = document.getElementById('cityLamp');
const lampHitbox = document.getElementById('lampHitbox'); // Yeni Görünmez Kutumuz
let animalTimer; 

if (lampHitbox && cityLamp) {
    lampHitbox.addEventListener('click', () => {
        // Kediyi görünür yap
        cityLamp.classList.add('show-animals');
        
        // Kuşları bembeyaz şekilde gökyüzünde uçur
        document.body.classList.add('show-birds-layer');
        
        clearTimeout(animalTimer); 
        
        // 10 saniye sonra geri gönder
        animalTimer = setTimeout(() => {
            cityLamp.classList.remove('show-animals');
            document.body.classList.remove('show-birds-layer');
        }, 10000); 
    });
}













// =========================================
//   VS MODU OYUN MOTORU
// =========================================

const vsArena = document.getElementById('vsArena');
const openVsBtn = document.getElementById('openVsBtn');
const closeVsBtn = document.getElementById('closeVsBtn');
const p1Select = document.getElementById('p1Select');
const p2Select = document.getElementById('p2Select');
const p1Img = document.getElementById('p1Img');
const p2Img = document.getElementById('p2Img');
const p1HpBar = document.getElementById('p1HpBar');
const p2HpBar = document.getElementById('p2HpBar');
const p1HpText = document.getElementById('p1HpText');
const p2HpText = document.getElementById('p2HpText');
const rollDiceBtn = document.getElementById('rollDiceBtn');
const battleLog = document.getElementById('battleLog');

// Oyun Değişkenleri
let hp1 = 20, hp2 = 20;
let currentTurn = 1; // 1 = P1, 2 = P2
let isGameOver = false;

// 1. Arenayı Aç / Kapat
if(openVsBtn) {
    openVsBtn.addEventListener('click', () => {
        vsArena.classList.add('active');
        initArena(); // Seçenekleri doldur ve resetle
    });
}
if(closeVsBtn) {
    closeVsBtn.addEventListener('click', () => {
        vsArena.classList.remove('active');
    });
}

// 2. Seçicileri (Select) Doldur ve Kurulumu Yap
function initArena() {
    p1Select.innerHTML = ''; p2Select.innerHTML = '';
    
    // Arkadaşları listeye ekle
    friends.forEach((f, index) => {
        p1Select.innerHTML += `<option value="${index}">${f.name}</option>`;
        p2Select.innerHTML += `<option value="${index}">${f.name}</option>`;
    });

    // Varsayılan farklı kişileri seçtir
    p1Select.value = 0; // İlk kişi
    p2Select.value = 1 % friends.length; // İkinci kişi

    // Seçim değiştiğinde resimleri güncelle
    p1Select.addEventListener('change', updateFighters);
    p2Select.addEventListener('change', updateFighters);

    resetGame();
}

// Resimleri ekrana bas
function updateFighters() {
    p1Img.src = friends[p1Select.value].img;
    p2Img.src = friends[p2Select.value].img;
}

// 3. Oyunu Sıfırla (Canlar 20, Sıra 1'de)
function resetGame() {
    hp1 = 20; hp2 = 20;
    currentTurn = 1;
    isGameOver = false;
    updateFighters();
    updateHpUI();
    
    battleLog.innerHTML = "SAVAŞ BAŞLASIN!<br>İlk Zar P1'in.";
    rollDiceBtn.innerText = "P1 ZAR AT 🎲";
    rollDiceBtn.style.backgroundColor = "#f0f"; // P1 Rengi (Mor)
    
    // Tıklamayı tekrar aç (Oyun bittiyse kapanmıştı)
    rollDiceBtn.disabled = false;
}

// Can Barlarını Güncelle
function updateHpUI() {
    // Genişlik
    const p1Percent = (hp1 / 20) * 100;
    const p2Percent = (hp2 / 20) * 100;
    p1HpBar.style.width = p1Percent + '%';
    p2HpBar.style.width = p2Percent + '%';
    
    // Yazılar
    p1HpText.innerText = hp1 + "/20";
    p2HpText.innerText = hp2 + "/20";

    // Can azaldıkça barı kırmızı yap
    p1HpBar.style.backgroundColor = p1Percent <= 30 ? "#f00" : "#0f0";
    p2HpBar.style.backgroundColor = p2Percent <= 30 ? "#f00" : "#0f0";
}

// 4. D20 (20 Yüzlü) Zar Atma ve Hasar Mantığı
rollDiceBtn.addEventListener('click', () => {
    if (isGameOver) { resetGame(); return; }

    // 1 ile 20 arası rastgele D20 zarı!
    // Ağırlıklı D20 Sistemi (Yüksek sayılar daha zor çıkar)
// 1.5 sayısını büyüterek (örn: 2 veya 2.5) yüksek sayıları daha da imkansız yapabilirsin!
let randomWeight = Math.pow(Math.random(), 1.5); 
let rollResult = Math.floor(randomWeight * 20) + 1;
    let damage = rollResult;
    let critMessage = ""; // Kritik vuruş veya ıskalama mesajı için

    // FRP Kuralı: 20 gelirse Kritik Vuruş (Çok daha havalı)
    if (rollResult === 20) {
        critMessage = "<br><span style='color: #ff0; font-size: 16px;'>🔥 KRİTİK VURUŞ! TEK ATTI! 🔥</span>";
    } 
    // FRP Kuralı: 1 gelirse Kritik Hata (Iskalama, hasar yok)
    else if (rollResult === 1) {
        damage = 0;
        critMessage = "<br><span style='color: #888;'>💨 KRİTİK HATA! ISKALADI...</span>";
    }

    let attackerName, defenderName;

    if (currentTurn === 1) {
        // P1 Vuruyor
        attackerName = friends[p1Select.value].name;
        defenderName = friends[p2Select.value].name;
        
        hp2 -= damage;
        if (hp2 < 0) hp2 = 0; // Can eksiye düşmesin
        
        if (damage > 0) triggerSlashEffect(2); // Sadece hasar vurursa animasyon girsin
        
        battleLog.innerHTML = `${attackerName} D20 attı: <b>${rollResult}</b>! ${critMessage}`;
        
        // Sırayı 2'ye geçir
        currentTurn = 2;
        rollDiceBtn.innerText = "P2 ZAR AT (D20)";
        rollDiceBtn.style.backgroundColor = "#0ff"; // P2 Rengi (Cyan)
        rollDiceBtn.style.color = "#000";

    } else {
        // P2 Vuruyor
        attackerName = friends[p2Select.value].name;
        defenderName = friends[p1Select.value].name;
        
        hp1 -= damage;
        if (hp1 < 0) hp1 = 0;
        
        if (damage > 0) triggerSlashEffect(1); 
        
        battleLog.innerHTML = `${attackerName} D20 attı: <b>${rollResult}</b>! ${critMessage}`;
        
        // Sırayı 1'e geçir
        currentTurn = 1;
        rollDiceBtn.innerText = "P1 ZAR AT (D20)";
        rollDiceBtn.style.backgroundColor = "#f0f";
        rollDiceBtn.style.color = "#fff";
    }

    updateHpUI();
    checkWinner();
});

// 5. Kesme (Slash) Animasyonunu Tetikleyici
function triggerSlashEffect(target) {
    const slash = document.getElementById(target === 1 ? 'p1Slash' : 'p2Slash');
    const img = document.getElementById(target === 1 ? 'p1Img' : 'p2Img');
    
    // Animasyonu sıfırlayıp baştan oynatmak için trick
    slash.classList.remove('active');
    void slash.offsetWidth; 
    slash.classList.add('active');

    // Resme sarsılma efekti ver
    img.classList.remove('shake');
    void img.offsetWidth;
    img.classList.add('shake');
}

// 6. Kazananı Kontrol Et
// 6. Kazananı Kontrol Et ve Sinematiği Tetikle
function checkWinner() {
    if (hp1 === 0 || hp2 === 0) {
        isGameOver = true;
        
        // Kazananı tespit et
        let winnerIndex = hp1 === 0 ? p2Select.value : p1Select.value;
        let winnerName = friends[winnerIndex].name;
        let winnerImg = friends[winnerIndex].img;
        
        battleLog.innerHTML = `<h1>K.O.!</h1>`;
        rollDiceBtn.innerText = "SİNEMATİK GİRİYOR...";
        rollDiceBtn.disabled = true;

        // Sinematik Elementlerini Yakala
        const finisherContainer = document.getElementById('cinematicFinisher');
        const finisherImg = document.getElementById('finisherImg');
        const finisherText = document.getElementById('finisherText');
        
        if (finisherContainer && finisherImg && finisherText) {
            // Resmi ve yazıyı ayarla
            finisherImg.src = winnerImg; 
            finisherText.innerText = winnerName + " WINS!";
            
            // Sinematiği Başlat
            finisherContainer.classList.add('active');
            
            // 3.5 saniye ekranda kaldıktan sonra sinematiği kapat ve normal ekrana dön
            setTimeout(() => {
                finisherContainer.classList.remove('active');
                
                // Normal oyun bitiş ekranını ayarla
                battleLog.innerHTML = `<h1>K.O.!</h1>${winnerName} KAZANDI! 🏆`;
                rollDiceBtn.innerText = "TEKRAR OYNA";
                rollDiceBtn.style.backgroundColor = "#fff";
                rollDiceBtn.style.color = "#000";
                rollDiceBtn.disabled = false;
            }, 3500); // 3.5 saniye sürer
        }
    }
}


// =========================================
//   GERÇEKÇİ ŞİMŞEK VE 5 SANİYELİK SES (DÜZELTİLDİ)
// =========================================

// Kodların diğerleriyle çakışmaması için süslü parantez içine aldık
{
    const cloudsContainer = document.getElementById('clickableClouds');
    const flashOverlay = document.getElementById('lightningFlash');
    const thunderAudio = document.getElementById('thunder-audio');
    
    let isStriking = false; 

    if (cloudsContainer) {
        cloudsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('interactive-cloud') && !isStriking) {
                isStriking = true;

                // bgAudio zaten en yukarıda tanımlı olduğu için onu bozmadan direkt yakalıyoruz
                const currentBgAudio = document.getElementById('bg-audio');

                // Arka plan müziğini iyice kıs
                let originalVolume = currentBgAudio ? currentBgAudio.volume : 0.3;
                if (currentBgAudio && !currentBgAudio.paused) currentBgAudio.volume = 0.05;

                // 1) Gök gürültüsünü çal
                if (thunderAudio) {
                    thunderAudio.currentTime = 0;
                    thunderAudio.volume = 0.6; 
                    thunderAudio.play();

                    // TAM 5 SANİYE SONRA SESİ KES
                    setTimeout(() => {
                        thunderAudio.pause();
                        thunderAudio.currentTime = 0;
                        
                        // Müziği eski sesine döndür
                        if (currentBgAudio && !currentBgAudio.paused) currentBgAudio.volume = originalVolume;
                    }, 5000); // 5 saniye
                }

                // 2) Gerçekçi gökyüzü patlamasını tetikle
                if (flashOverlay) flashOverlay.classList.add('flash');

                // 3) Görsel animasyon bitince sınıfı temizle
                setTimeout(() => {
                    if (flashOverlay) flashOverlay.classList.remove('flash');
                    isStriking = false; // Yeniden tıklanabilir
                }, 1200); 
            }
        });
    }
}




// =========================================
//   KANLI AY (BLOOD MOON) ETKİLEŞİMİ
// =========================================
{
    const moon = document.getElementById('interactiveMoon');
    let moonClicks = 0;
    let moonClickTimer;

    if (moon) {
        moon.addEventListener('click', () => {
            moonClicks++; // Tıklama sayısını artır

            // 2 saniye içinde tekrar tıklamazsa sayacı başa sarar
            clearTimeout(moonClickTimer);
            moonClickTimer = setTimeout(() => {
                moonClicks = 0; 
            }, 2000);

            // Eğer tam 5 kere tıklandıysa ritüel gerçekleşir
            if (moonClicks === 5) {
                document.body.classList.toggle('theme-blood-moon');
                moonClicks = 0; // Sayacı sıfırla
                
                const thunderAudio = document.getElementById('thunder-audio');
                const flashOverlay = document.getElementById('lightningFlash');
                const currentBgAudio = document.getElementById('bg-audio');
                
                if (thunderAudio) {
                    // Arka plan müziğini 5 saniyeliğine kıs (Daha korkutucu olur)
                    let originalVolume = currentBgAudio ? currentBgAudio.volume : 0.3;
                    if (currentBgAudio && !currentBgAudio.paused) currentBgAudio.volume = 0.05;

                    thunderAudio.currentTime = 0;
                    thunderAudio.volume = 0.8; // Gök gürültüsünü yüksek sesle ver
                    thunderAudio.play();
                    
                    // Gökyüzü patlaması efekti
                    if (flashOverlay) {
                        flashOverlay.classList.remove('flash');
                        void flashOverlay.offsetWidth; // reset
                        flashOverlay.classList.add('flash');
                    }

                    // --- YENİ EKLENEN 5 SANİYE KURALI ---
                    setTimeout(() => {
                        thunderAudio.pause();
                        thunderAudio.currentTime = 0;
                        
                        // Müziği geri aç
                        if (currentBgAudio && !currentBgAudio.paused) {
                            currentBgAudio.volume = originalVolume;
                        }
                    }, 5000); // Tam 5 saniye sonra sesi kes
                }
            }
        });
    }
}

// =========================================
//   RETRO TERMİNAL (DAKTİLO) EFEKTİ - SONSUZ DÖNGÜ
// =========================================
{
    const textElement = document.getElementById('typewriter-text');
    
    // İstediğin kadar mesaj ekleyebilirsin, sonuncusu bitince otomatik olarak 1. mesaja dönecek!
    const messages = [
        "Sadece bir anı sitesi... ",
        "GÜNÜN SÖZÜ: Günün Sözü yazılacak... ",
       
    ];
    
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeWriter() {
        if (!textElement) return;

        const currentMessage = messages[messageIndex];
        
        // İmleç pozisyonunu ayarla
        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }
        
        // Metni ekrana bas
        textElement.innerText = currentMessage.substring(0, charIndex);
        
        // Yazma ve Silme hızları (Milisaniye)
        let typingSpeed = isDeleting ? 30 : 70;
        
        // Cümle tamamen yazıldıysa 3 saniye bekle ve silmeye başla
        if (!isDeleting && charIndex === currentMessage.length) {
            typingSpeed = 3000; 
            isDeleting = true;
        } 
        // Cümle tamamen silindiyse sıradaki mesaja geç
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            messageIndex++; // Bir sonraki mesaja geç
            
            // 🔄 İŞTE SONSUZ DÖNGÜ BURASI: Tüm mesajlar bittiyse en başa (0'a) sar!
            if (messageIndex >= messages.length) {
                messageIndex = 0; 
            }
            
            typingSpeed = 500; // Yeni cümleye başlamadan önce yarım saniye bekle
        }
        
        setTimeout(typeWriter, typingSpeed);
    }
    
    // Sistemi başlat
    setTimeout(typeWriter, 1000);
}





// =========================================
//   DİNAMİK GÖREV PANOSU İŞLEMLERİ
// =========================================
{
    const questBtn = document.getElementById('questBtn');
    const questOverlay = document.getElementById('questBoardOverlay');
    const closeQuestBtn = document.getElementById('closeQuestBtn');
    
    const addQuestBtn = document.getElementById('addQuestBtn');
    const questList = document.getElementById('questList');

    // Panoyu Aç/Kapat
    if (questBtn) questBtn.addEventListener('click', () => questOverlay.classList.add('active'));
    if (closeQuestBtn) closeQuestBtn.addEventListener('click', () => questOverlay.classList.remove('active'));

    // YENİ GÖREV EKLEME MOTORU
    if (addQuestBtn) {
        addQuestBtn.addEventListener('click', () => {
            const author = document.getElementById('questAuthor').value;
            const title = document.getElementById('questTitle').value;
            const desc = document.getElementById('questDesc').value;

            // Boş alan kontrolü
            if (!author || !title || !desc) {
                alert("Dur yolcu! Önce kim olduğunu seçip görevi tam yazmalısın.");
                return;
            }

            // Yeni Görev Kutusunu (HTML) Oluştur
            const li = document.createElement('li');
            li.className = 'quest-item';
            
            li.innerHTML = `
                <div class="quest-info">
                    <span class="quest-author-tag">📜 Veren: ${author}</span>
                    <h3>${title}</h3>
                    <p>${desc}</p>
                </div>
                <button class="complete-btn">TAMAMLA</button>
            `;

            // Oluşturulan bu yeni görevin "Tamamla" butonuna tıklama özelliği ekle
            const newCompleteBtn = li.querySelector('.complete-btn');
            newCompleteBtn.addEventListener('click', function() {
                const questItem = this.parentElement;
                if (questItem.classList.contains('completed')) return;
                
                questItem.classList.add('completed');
                this.innerText = "YAPILDI ✔️";
            });

            // Görevi listenin EN ÜSTÜNE ekle
            questList.prepend(li);

            // Formu temizle ki yeni görev yazılabilsin (İsmi sıfırlamıyoruz, aynı kişi art arda yazabilsin)
            document.getElementById('questTitle').value = '';
            document.getElementById('questDesc').value = '';
        });
    }
}



// =========================================
//   BOYUT ÇATLAĞI (RIFT) RİTÜELİ (GÜNCEL)
// =========================================
{
    const myVideoFile = "deneme.mp4"; 

    const cityLamp = document.getElementById('cityLamp');
    const moon = document.getElementById('interactiveMoon');
    const riftOverlay = document.getElementById('dimensionRift');
    const riftVideo = document.getElementById('riftVideo'); // 'img' yerine 'video' yakalıyoruz
    const closeRiftBtn = document.getElementById('closeRiftBtn');
    const bgAudio = document.getElementById('bg-audio');

    let ritualStep = 0; 

    // Ritüel Başlangıcı: Kediye Tıklama
    if (cityLamp) {
        cityLamp.addEventListener('click', () => {
            if(cityLamp.classList.contains('lamp-on')) {
                ritualStep = 1;
                console.log("🐈 Kedi miyavladı...");
                
                // 3 saniye içinde Ay'a tıklamazsa ritüel sıfırlanır
                setTimeout(() => {
                    if (ritualStep === 1) {
                        ritualStep = 0;
                        console.log("🐈 Ritüel sıfırlandı.");
                    }
                }, 3000); 
            }
        });
    }

    // Ritüel Tamamlanması: Ay'a Tıklama
    if (moon) {
        moon.addEventListener('click', () => {
            if (ritualStep === 1) {
                ritualStep = 0;
                console.log("🌕 Ritüel tamamlandı! Videolu çatlak açılıyor...");

                if (riftOverlay && riftVideo) {
                    // Videoyu Yükle
                    const videoSource = riftVideo.querySelector('source');
                    videoSource.src = myVideoFile; 
                    riftVideo.load(); // Videoyu yeni kaynakla tekrar yükle
                    
                    // Arka plan müziğini kıs
                    if(bgAudio && !bgAudio.paused) bgAudio.volume = 0.05;

                    // Çatlağı aç
                    riftOverlay.classList.add('active');
                    
                    // Videoyu oynat (autoplay bazen yetmez, JS ile garantiliyoruz)
                    riftVideo.play();
                }
            }
        });
    }

    // Çatlağı Mühürleme (Kapatma)
    if (closeRiftBtn && riftOverlay && riftVideo) {
        closeRiftBtn.addEventListener('click', () => {
            riftOverlay.classList.remove('active');
            riftVideo.pause(); // Videoyu durdur ki arkada oynamaya devam etmesin
            
            // Müziği eski sesine döndür
            if(bgAudio && !bgAudio.paused) bgAudio.volume = 0.3; 
        });
    }
}