// --- 要素の取得 ---
const draggableBox = document.getElementById('draggableBox');
const ball = document.getElementById('ball');
const boxImage = document.getElementById('boxImage');
const box = draggableBox;

// --- 初期値の定数 ---
const INITIAL_BOX_X = 50;
const INITIAL_BOX_Y = 150;
const INITIAL_BALL_X = 160;
const INITIAL_BALL_Y = 160;

// --- lil-guiのセットアップ ---
const gui = new lil.GUI();
const boxSettings = {
    width: 100,
    height: 100,
};
const imageSettings = {
    scale: 100,
    rotation: 0,
    filename: 'default-image.png',
    upload: () => document.getElementById('image-input').click(),
    clear: () => {
        boxImage.src = '';
        imageSettings.filename = '選択されていません';
        document.getElementById('image-input').value = '';
    }
};
const ballSettings = {
    size: 20,
};
const displaySettings = {
    showCollision: false,
    showImage: true,
};

function clearSound(wallName) {
    wallSounds[wallName] = null;
    soundSettings.filenames[wallName] = '選択されていません';
    const input = document.getElementById(`${wallName}-wall-sound-input`);
    if (input) input.value = '';
}

const soundSettings = {
    volumes: {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100,
        all: 100,
    },
    filenames: {
        top: 'default-sound-top.mp3',
        bottom: 'default-sound-bottom.mp3',
        left: 'default-sound-left.mp3',
        right: 'default-sound-right.mp3',
        all: '選択されていません',
    },
    uploads: {
        uploadTop: () => document.getElementById('top-wall-sound-input').click(),
        uploadBottom: () => document.getElementById('bottom-wall-sound-input').click(),
        uploadLeft: () => document.getElementById('left-wall-sound-input').click(),
        uploadRight: () => document.getElementById('right-wall-sound-input').click(),
        uploadAll: () => document.getElementById('all-wall-sound-input').click(),
    },
    clears: {
        clearTop: () => clearSound('top'),
        clearBottom: () => clearSound('bottom'),
        clearLeft: () => clearSound('left'),
        clearRight: () => clearSound('right'),
        clearAll: () => clearSound('all'),
    }
};
const collisionThreshold = 10;

const resetSettings = {
    resetPosition: () => {
        draggableBox.style.left = `${INITIAL_BOX_X}px`;
        draggableBox.style.top = `${INITIAL_BOX_Y}px`;
        ballX = INITIAL_BALL_X;
        ballY = INITIAL_BALL_Y;
        vx = 0;
        vy = 0;
        prevBoxX = INITIAL_BOX_X;
        prevBoxY = INITIAL_BOX_Y;
        updateImagePosition();
    }
};
gui.add(resetSettings, 'resetPosition').name('位置をリセット');

function updateImageTransform() {
    const scaleValue = imageSettings.scale / 100;
    const rotationValue = imageSettings.rotation;
    boxImage.style.transform = `translate(-50%, -50%) scale(${scaleValue}) rotate(${rotationValue}deg)`;
}

function updateBallSizeConstraint() {
    const maxBallSize = Math.floor(Math.min(boxSettings.width, boxSettings.height) * 0.9);
    ballSizeController.max(maxBallSize);
    if (ballSettings.size > maxBallSize) {
        ballSettings.size = maxBallSize;
        ball.style.width = `${maxBallSize}px`;
        ball.style.height = `${maxBallSize}px`;
        ballSizeController.updateDisplay();
    }
}

const collisionFolder = gui.addFolder('当たり判定の設定');
collisionFolder.add(boxSettings, 'width', 50, 500).step(1).name('箱の幅(px)').onChange(value => {
    draggableBox.style.width = `${value}px`;
    updateImageSize();
    updateImagePosition();
    updateBallSizeConstraint();
});
collisionFolder.add(boxSettings, 'height', 50, 500).step(1).name('箱の高さ(px)').onChange(value => {
    draggableBox.style.height = `${value}px`;
    updateImageSize();
    updateImagePosition();
    updateBallSizeConstraint();
});
const ballSizeController = collisionFolder.add(ballSettings, 'size', 10, 90).step(1).name('玉の直径(px)').onChange(value => {
    ball.style.width = `${value}px`;
    ball.style.height = `${value}px`;
});
collisionFolder.open();

const imageFolder = gui.addFolder('画像設定');
imageFolder.add(imageSettings, 'upload').name('PNG画像を選択');
imageFolder.add(imageSettings, 'filename').name('ファイル名').listen().disable();
imageFolder.add(imageSettings, 'clear').name('画像をクリア');
imageFolder.add(imageSettings, 'scale', 0, 300).step(1).name('スケール (%)').onChange(updateImageTransform);
imageFolder.add(imageSettings, 'rotation', 0, 360).step(1).name('回転 (度)').onChange(updateImageTransform);
imageFolder.open();

const displayFolder = gui.addFolder('表示設定');
displayFolder.add(displaySettings, 'showCollision').name('当たり判定を表示').onChange(value => {
    const opacity = value ? '1' : '0';
    draggableBox.style.opacity = opacity;
    ball.style.opacity = opacity;
});
displayFolder.add(displaySettings, 'showImage').name('画像を表示').onChange(value => {
     boxImage.style.visibility = value ? 'visible' : 'hidden';
});
displayFolder.open();

draggableBox.style.opacity = displaySettings.showCollision ? '1' : '0';
ball.style.opacity = displaySettings.showCollision ? '1' : '0';

const soundFolder = gui.addFolder('壁のサウンド設定');
// 四方
const allSoundFolder = soundFolder.addFolder('四方 (共通)');
allSoundFolder.add(soundSettings.uploads, 'uploadAll').name('ファイル選択');
allSoundFolder.add(soundSettings.filenames, 'all').name('ファイル名').listen().disable();
allSoundFolder.add(soundSettings.volumes, 'all', 0, 100).step(1).name('音量 (%)');
allSoundFolder.add(soundSettings.clears, 'clearAll').name('音声をクリア');
// 上
const topSoundFolder = soundFolder.addFolder('上 (個別)');
topSoundFolder.add(soundSettings.uploads, 'uploadTop').name('ファイル選択');
topSoundFolder.add(soundSettings.filenames, 'top').name('ファイル名').listen().disable();
topSoundFolder.add(soundSettings.volumes, 'top', 0, 100).step(1).name('音量 (%)');
topSoundFolder.add(soundSettings.clears, 'clearTop').name('音声をクリア');
// 下
const bottomSoundFolder = soundFolder.addFolder('下 (個別)');
bottomSoundFolder.add(soundSettings.uploads, 'uploadBottom').name('ファイル選択');
bottomSoundFolder.add(soundSettings.filenames, 'bottom').name('ファイル名').listen().disable();
bottomSoundFolder.add(soundSettings.volumes, 'bottom', 0, 100).step(1).name('音量 (%)');
bottomSoundFolder.add(soundSettings.clears, 'clearBottom').name('音声をクリア');
// 左
const leftSoundFolder = soundFolder.addFolder('左 (個別)');
leftSoundFolder.add(soundSettings.uploads, 'uploadLeft').name('ファイル選択');
leftSoundFolder.add(soundSettings.filenames, 'left').name('ファイル名').listen().disable();
leftSoundFolder.add(soundSettings.volumes, 'left', 0, 100).step(1).name('音量 (%)');
leftSoundFolder.add(soundSettings.clears, 'clearLeft').name('音声をクリア');
// 右
const rightSoundFolder = soundFolder.addFolder('右 (個別)');
rightSoundFolder.add(soundSettings.uploads, 'uploadRight').name('ファイル選択');
rightSoundFolder.add(soundSettings.filenames, 'right').name('ファイル名').listen().disable();
rightSoundFolder.add(soundSettings.volumes, 'right', 0, 100).step(1).name('音量 (%)');
rightSoundFolder.add(soundSettings.clears, 'clearRight').name('音声をクリア');
soundFolder.open();

updateBallSizeConstraint();

function updateImagePosition() {
    if (!boxImage.src) return;
    const centerX = draggableBox.offsetLeft + draggableBox.offsetWidth / 2;
    const centerY = draggableBox.offsetTop + draggableBox.offsetHeight / 2;
    boxImage.style.left = `${centerX}px`;
    boxImage.style.top = `${centerY}px`;
}

function updateImageSize() {
    if (!boxImage.src || !boxImage.naturalWidth) return;
    const boxWidth = draggableBox.clientWidth;
    const boxHeight = draggableBox.clientHeight;
    const imageAspect = boxImage.naturalWidth / boxImage.naturalHeight;
    let targetWidth, targetHeight;
    if (boxWidth > boxHeight) {
        targetWidth = boxWidth;
        targetHeight = targetWidth / imageAspect;
    } else {
        targetHeight = boxHeight;
        targetWidth = targetHeight * imageAspect;
    }
    boxImage.style.width = targetWidth + 'px';
    boxImage.style.height = targetHeight + 'px';
}

boxImage.onload = () => {
    updateImageSize();
    updateImagePosition();
};

const imageInput = document.getElementById('image-input');
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        imageSettings.clear();
        return;
    }
    if (file.type === "image/png") {
        imageSettings.filename = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            boxImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        imageSettings.filename = '読み込み失敗';
        alert("PNGファイルを選択してください。");
    }
});

let isDragging = false;
let offsetX, offsetY;
draggableBox.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - draggableBox.offsetLeft;
    offsetY = e.clientY - draggableBox.offsetTop;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    e.preventDefault();
});
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    draggableBox.style.left = (e.clientX - offsetX) + 'px';
    draggableBox.style.top = (e.clientY - offsetY) + 'px';
    updateImagePosition();
});
document.addEventListener('mouseup', () => { isDragging = false; });
document.addEventListener('mouseleave', () => { isDragging = false; });

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const wallSounds = {
    top: null,
    bottom: null,
    left: null,
    right: null,
    all: null
};

function loadSound(url, wallName) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            wallSounds[wallName] = audioBuffer;
        })
        .catch(e => console.error(e));
}

loadSound('sounds/default-sound-top.mp3', 'top');
loadSound('sounds/default-sound-bottom.mp3', 'bottom');
loadSound('sounds/default-sound-left.mp3', 'left');
loadSound('sounds/default-sound-right.mp3', 'right');

function playCollisionSound(buffer, volume = 1.0) {
    if (!buffer) return;
    const source = audioCtx.createBufferSource();
    const gainNode = audioCtx.createGain();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const clampedVolume = Math.min(Math.max(volume, 0), 1.0);
    gainNode.gain.setValueAtTime(clampedVolume, audioCtx.currentTime);
    const playbackDuration = Math.min(buffer.duration, 2.0);
    source.start(0, 0, playbackDuration);
}

function setupFileInput(inputId, wallName) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            clearSound(wallName);
            return;
        }
        soundSettings.filenames[wallName] = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            audioCtx.decodeAudioData(e.target.result, (buffer) => {
                wallSounds[wallName] = buffer;
            }, (error) => {
                console.error('音声ファイルのデコードに失敗しました:', error);
                soundSettings.filenames[wallName] = '読み込み失敗';
            });
        };
        reader.readAsArrayBuffer(file);
    });
}
setupFileInput('top-wall-sound-input', 'top');
setupFileInput('bottom-wall-sound-input', 'bottom');
setupFileInput('left-wall-sound-input', 'left');
setupFileInput('right-wall-sound-input', 'right');
setupFileInput('all-wall-sound-input', 'all');

const friction = 0.5;
let ballX = INITIAL_BALL_X, ballY = INITIAL_BALL_Y, vx = 0, vy = 0;
let prevBoxX = box.offsetLeft;
let prevBoxY = box.offsetTop;
let lastSoundTime = 0;
const soundCooldown = 100;
let lastWallHit = '';

function updateBallPosition() {
    const currentTime = performance.now();
    const boxVx = box.offsetLeft - prevBoxX;
    const boxVy = box.offsetTop - prevBoxY;
    vx *= friction; vy *= friction;
    ballX += vx; ballY += vy;
    const ballSize = ball.offsetWidth;
    const boxLeft = box.offsetLeft, boxTop = box.offsetTop;
    const boxRight = boxLeft + box.clientWidth, boxBottom = boxTop + box.clientHeight;
    
    let currentWallHit = '';
    if (ballX + ballSize > boxRight) {
        currentWallHit = 'right';
        ballX = boxRight - ballSize;
    } else if (ballX < boxLeft) {
        currentWallHit = 'left';
        ballX = boxLeft;
    }
    if (ballY + ballSize > boxBottom) {
        currentWallHit = 'bottom';
        ballY = boxBottom - ballSize;
    } else if (ballY < boxTop) {
        currentWallHit = 'top';
        ballY = boxTop;
    }
    
    if (currentWallHit && currentWallHit !== lastWallHit && currentTime - lastSoundTime > soundCooldown) {
        let relativeV;
        // 個別サウンドを優先し、なければ共通サウンドを使用
        let sound = wallSounds[currentWallHit];
        let volumeSetting = soundSettings.volumes[currentWallHit];
        if (!sound) {
            sound = wallSounds.all;
            volumeSetting = soundSettings.volumes.all;
        }

        if (currentWallHit === 'right' || currentWallHit === 'left') {
            relativeV = Math.abs(vx - boxVx);
        } else {
            relativeV = Math.abs(vy - boxVy);
        }

        if (relativeV > collisionThreshold) {
            const speedBasedVolume = (relativeV - collisionThreshold) / 15;
            const finalVolume = (volumeSetting / 100) * speedBasedVolume;
            playCollisionSound(sound, finalVolume);
            lastSoundTime = currentTime;
        }
    }
    
    lastWallHit = currentWallHit;
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
    prevBoxX = box.offsetLeft;
    prevBoxY = box.offsetTop;
    requestAnimationFrame(updateBallPosition);
}

updateBallPosition();
if (boxImage.complete) {
    updateImageSize();
    updateImagePosition();
}