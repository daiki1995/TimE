// ゲーム状態
let gameState = {
    player: {
        hp: 100,
        maxHp: 100,
        energy: 100,
        maxEnergy: 100,
        position: { x: 100, y: 300 }
    },
    availableCards: [],
    selectedDeck: [],
    handCards: [],
    selectedCard: null,
    enemies: [],
    stage: 1,
    wave: 1,
    isCharging: false,
    chargeInterval: null,
    gameStarted: false,
    routeChoices: 0,
    timePaused: false,
    attackTimerInterval: null,
    supportEffects: {},
    showingCardSwap: false
};

// カードデータ
const allCards = [
    {
        id: 1,
        name: "高出力放電",
        type: "攻撃",
        cost: 30,
        effect: "敵に50-70ダメージ (成功率70%)",
        damage: [50, 70],
        successRate: 70,
        action: "attack"
    },
    {
        id: 2,
        name: "時間ジャンプ",
        type: "時間操作",
        cost: 25,
        effect: "敵を3秒間停止 (成功率100%)",
        duration: 3000,
        successRate: 100,
        action: "freeze"
    },
    {
        id: 3,
        name: "緊急回復",
        type: "サポート",
        cost: 40,
        effect: "HP30回復",
        healing: 30,
        successRate: 100,
        action: "heal"
    },
    {
        id: 4,
        name: "オーバーロード",
        type: "サポート",
        cost: 20,
        effect: "5秒間電力消費なし",
        duration: 5000,
        successRate: 100,
        action: "overload"
    },
    {
        id: 5,
        name: "精密射撃",
        type: "攻撃",
        cost: 10,
        effect: "敵に15-25ダメージ (成功率95%)",
        damage: [15, 25],
        successRate: 95,
        action: "attack"
    },
    {
        id: 6,
        name: "時間加速",
        type: "時間操作",
        cost: 35,
        effect: "電力回復速度2倍 (10秒間)",
        duration: 10000,
        successRate: 100,
        action: "accelerate"
    },
    {
        id: 7,
        name: "連続攻撃",
        type: "攻撃",
        cost: 45,
        effect: "敵に3回×15ダメージ (各85%)",
        damage: [15, 15],
        shots: 3,
        successRate: 85,
        action: "multiattack"
    },
    {
        id: 8,
        name: "シールド展開",
        type: "サポート",
        cost: 30,
        effect: "3回攻撃を無効化",
        shield: 3,
        successRate: 100,
        action: "shield"
    }
];

// メイン画面表示
function showMainMenu() {
    console.log('Showing main menu');
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('deckBuilder').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'none';
}

// デッキ構築画面表示
function showDeckBuilder() {
    console.log('Showing deck builder');
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('deckBuilder').style.display = 'block';
    document.getElementById('gameScreen').style.display = 'none';
    renderAvailableCards();
    updateDeckBuilder();
}

// 操作説明
function showInstructions() {
    alert(`TimE: Stellar Drift - 操作説明

【目的】
時間操作能力を駆使して異形の宇宙生命体から生き延び、宇宙船の深部を目指す

【操作方法】
• マウスクリック: すべての操作
• カード選択: 手札のカードをクリック
• 射撃: 敵をクリック
• 電力チャージ: 右下の⚡ボタンを長押し

【カードの種類】
• 攻撃カード: 敵にダメージ
• 時間操作カード: 敵の動きを妨害
• サポートカード: 回復や強化効果

【戦略のコツ】
• 電力を管理して持続的に戦闘する
• 時間操作で敵の攻撃を回避
• 状況に応じてカードを使い分ける`);
}

// カード表示
function renderAvailableCards() {
    const container = document.getElementById('availableCards');
    container.innerHTML = '';
    
    gameState.availableCards.forEach(card => {
        if (gameState.selectedDeck.find(c => c.id === card.id)) return;
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-effect">${card.effect}</div>
        `;
        cardElement.onclick = () => selectCard(card);
        container.appendChild(cardElement);
    });
}

// カード選択
function selectCard(card) {
    if (gameState.selectedDeck.length < 5) {
        gameState.selectedDeck.push(card);
        renderAvailableCards();
        updateDeckBuilder();
    }
}

// 選択解除
function deselectCard(card) {
    gameState.selectedDeck = gameState.selectedDeck.filter(c => c.id !== card.id);
    renderAvailableCards();
    updateDeckBuilder();
}

// デッキ構築UI更新
function updateDeckBuilder() {
    const container = document.getElementById('selectedDeck');
    const countSpan = document.getElementById('selectedCount');
    const startButton = document.getElementById('startButton');
    
    countSpan.textContent = gameState.selectedDeck.length;
    
    container.innerHTML = '';
    gameState.selectedDeck.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card selected';
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-effect">${card.effect}</div>
        `;
        cardElement.onclick = () => deselectCard(card);
        container.appendChild(cardElement);
    });

    startButton.style.display = gameState.selectedDeck.length === 5 ? 'block' : 'none';
}

// ゲーム開始
function startGame() {
    document.getElementById('deckBuilder').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    gameState.handCards = [...gameState.selectedDeck];
    gameState.gameStarted = true;
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.energy = gameState.player.maxEnergy;
    
    generateEnemies();
    renderHand();
    updateUI();
    showMessage("ステージ1開始！ 異形の宇宙生命体が襲来している！");
    startEnergyRegeneration();
}

// 敵生成
function generateEnemies() {
    gameState.enemies = [];
    const enemyCount = Math.min(3 + gameState.wave, 6);
    
    for (let i = 0; i < enemyCount; i++) {
        const enemy = {
            id: i,
            hp: 30 + (gameState.wave * 10),
            maxHp: 30 + (gameState.wave * 10),
            x: 300 + Math.random() * 400,
            y: 100 + Math.random() * 300,
            frozen: false,
            freezeTimeout: null,
            attackInterval: null,
            attackTimer: 0,
            attackMaxTime: 4000 + Math.random() * 4000,
            isBoss: i === enemyCount - 1 && gameState.wave % 3 === 0
        };
        
        if (enemy.isBoss) {
            enemy.hp = 100 + (gameState.wave * 20);
            enemy.maxHp = enemy.hp;
        }
        
        gameState.enemies.push(enemy);
    }
    
    renderEnemies();
    startEnemyAI();
}

// 敵表示
function renderEnemies() {
    const gameArea = document.getElementById('gameArea');
    const existingEnemies = gameArea.querySelectorAll('.enemy');
    existingEnemies.forEach(e => e.remove());
    
    gameState.enemies.forEach(enemy => {
        const enemyElement = document.createElement('div');
        enemyElement.className = `enemy ${enemy.isBoss ? 'boss' : ''}`;
        enemyElement.id = `enemy-${enemy.id}`;
        enemyElement.style.left = enemy.x + 'px';
        enemyElement.style.top = enemy.y + 'px';
        enemyElement.innerHTML = `
            ${enemy.isBoss ? '👾' : '👽'}
            <div class="attack-timer-bar">
                <div class="attack-timer-fill" id="timer-${enemy.id}"></div>
            </div>
        `;
        enemyElement.onclick = () => shootEnemy(enemy);
        
        if (enemy.frozen) {
            enemyElement.classList.add('frozen');
        }
        
        gameArea.appendChild(enemyElement);
    });
}

// 手札表示
function renderHand() {
    const container = document.getElementById('handCards');
    container.innerHTML = '';
    
    gameState.handCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'hand-card';
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-effect">${card.effect}</div>
        `;
        
        if (gameState.selectedCard === card) {
            cardElement.classList.add('selected');
        }
        
        cardElement.onclick = () => selectHandCard(card);
        container.appendChild(cardElement);
    });
}

// 手札カード選択
function selectHandCard(card) {
    if (gameState.timePaused && (card.action === 'overload' || card.action === 'accelerate' || card.action === 'shield')) {
        showMessage("時間停止中はサポートカードを使用できません");
        return;
    }
    
    if (gameState.player.energy >= card.cost || gameState.overloadActive) {
        // サポート系カードは即座に実行
        if (card.action === 'heal' || card.action === 'overload' || card.action === 'accelerate' || card.action === 'shield') {
            // 電力消費
            if (!gameState.overloadActive) {
                if (gameState.player.energy < card.cost) {
                    showMessage("電力が不足しています");
                    return;
                }
                gameState.player.energy = Math.max(0, gameState.player.energy - card.cost);
            }
            
            // 成功判定
            const success = Math.random() * 100 < card.successRate;
            
            if (success) {
                executeSupportCardEffect(card);
            } else {
                showMessage(`${card.name}が失敗しました！`);
            }
            
            updateUI();
            return;
        }
        
        // 攻撃系・時間操作系は従来通り装填
        gameState.selectedCard = card;
        renderHand();
        showMessage(`${card.name}を装填しました`);
    } else {
        showMessage("電力が不足しています");
    }
}

// 敵への射撃
function shootEnemy(enemy) {
    if (gameState.timePaused) {
        showMessage("時間停止中は攻撃できません");
        return;
    }
    
    if (!gameState.selectedCard) {
        showMessage("カードを選択してください");
        return;
    }
    
    const card = gameState.selectedCard;
    
    // 電力消費
    if (!gameState.overloadActive) {
        if (gameState.player.energy < card.cost) {
            showMessage("電力が不足しています");
            return;
        }
        gameState.player.energy = Math.max(0, gameState.player.energy - card.cost);
    }
    
    // 成功判定
    const success = Math.random() * 100 < card.successRate;
    
    if (success) {
        executeCardEffect(card, enemy);
    } else {
        showMessage(`${card.name}が失敗しました！`);
    }
    
    gameState.selectedCard = null;
    renderHand();
    updateUI();
}

// サポートカード効果実行
function executeSupportCardEffect(card) {
    switch (card.action) {
        case 'heal':
            const healAmount = card.healing;
            gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + healAmount);
            showMessage(`${card.name}でHP${healAmount}回復！`);
            break;
            
        case 'overload':
            gameState.overloadActive = true;
            addSupportEffect('overload', 'オーバーロード', card.duration);
            setTimeout(() => {
                gameState.overloadActive = false;
                removeSupportEffect('overload');
                showMessage("オーバーロード効果が切れました");
            }, card.duration);
            showMessage(`${card.name}発動！電力消費なし！`);
            break;
            
        case 'shield':
            gameState.player.shield = (gameState.player.shield || 0) + card.shield;
            addSupportEffect('shield', `シールド (${gameState.player.shield}回)`, null);
            showMessage(`${card.name}でシールド展開！`);
            break;
            
        case 'accelerate':
            gameState.accelerateActive = true;
            addSupportEffect('accelerate', '時間加速', card.duration);
            setTimeout(() => {
                gameState.accelerateActive = false;
                removeSupportEffect('accelerate');
                showMessage("時間加速効果が切れました");
            }, card.duration);
            showMessage(`${card.name}発動！電力回復速度アップ！`);
            break;
    }
}

// カード効果実行
function executeCardEffect(card, enemy) {
    switch (card.action) {
        case 'attack':
            const damage = Math.floor(Math.random() * (card.damage[1] - card.damage[0] + 1)) + card.damage[0];
            enemy.hp = Math.max(0, enemy.hp - damage);
            showDamage(enemy, damage);
            showMessage(`${card.name}で${damage}ダメージ！`);
            break;
            
        case 'multiattack':
            for (let i = 0; i < card.shots; i++) {
                if (Math.random() * 100 < card.successRate) {
                    const damage = card.damage[0];
                    enemy.hp = Math.max(0, enemy.hp - damage);
                    setTimeout(() => showDamage(enemy, damage), i * 200);
                }
            }
            showMessage(`${card.name}で連続攻撃！`);
            break;
            
        case 'freeze':
            enemy.frozen = true;
            const enemyElement = document.getElementById(`enemy-${enemy.id}`);
            if (enemyElement) {
                enemyElement.classList.add('frozen');
            }
            
            if (enemy.freezeTimeout) {
                clearTimeout(enemy.freezeTimeout);
            }
            
            enemy.freezeTimeout = setTimeout(() => {
                enemy.frozen = false;
                const elemUpdate = document.getElementById(`enemy-${enemy.id}`);
                if (elemUpdate) {
                    elemUpdate.classList.remove('frozen');
                }
            }, card.duration);
            
            showMessage(`${card.name}で敵を凍結！`);
            break;
    }
    
    // 敵死亡チェック
    if (enemy.hp <= 0) {
        killEnemy(enemy);
    }
}

// ダメージ表示
function showDamage(enemy, damage) {
    const gameArea = document.getElementById('gameArea');
    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    damageText.textContent = `-${damage}`;
    damageText.style.left = (enemy.x + 40) + 'px';
    damageText.style.top = (enemy.y + 20) + 'px';
    gameArea.appendChild(damageText);
    
    setTimeout(() => {
        if (damageText.parentNode) {
            damageText.parentNode.removeChild(damageText);
        }
    }, 1500);
}

// 敵を倒す
function killEnemy(enemy) {
    gameState.enemies = gameState.enemies.filter(e => e.id !== enemy.id);
    const enemyElement = document.getElementById(`enemy-${enemy.id}`);
    if (enemyElement) {
        enemyElement.remove();
    }
    
    if (enemy.attackInterval) {
        clearInterval(enemy.attackInterval);
    }
    
    if (enemy.freezeTimeout) {
        clearTimeout(enemy.freezeTimeout);
    }
    
    // 全滅チェック
    if (gameState.enemies.length === 0) {
        setTimeout(() => {
            showCardSwap();
        }, 1000);
    }
}

// 次のウェーブ
function nextWave() {
    gameState.wave++;
    
    if (gameState.wave % 3 === 1 && gameState.wave > 1) {
        // ルート選択
        showRouteChoice();
    } else {
        generateEnemies();
        showMessage(`ウェーブ ${gameState.wave} 開始！`);
    }
}

// ルート選択表示
function showRouteChoice() {
    const choices = [
        { text: "物資が豊富な通路へ", description: "回復アイテムが多いが敵も強い" },
        { text: "近道な通路へ", description: "早く進めるが準備時間が少ない" },
        { text: "安全な通路へ", description: "敵は弱いがアイテムは少ない" }
    ];
    
    const dialog = document.getElementById('routeChoice');
    const desc = document.getElementById('routeDescription');
    const buttons = document.getElementById('routeButtons');
    
    desc.textContent = "どの通路を進みますか？";
    buttons.innerHTML = '';
    
    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.onclick = () => selectRoute(index);
        buttons.appendChild(button);
    });
    
    dialog.classList.remove('hidden');
}

// ルート選択
function selectRoute(choiceIndex) {
    gameState.routeChoices++;
    document.getElementById('routeChoice').classList.add('hidden');
    
    switch (choiceIndex) {
        case 0: // 物資豊富
            gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + 30);
            showMessage("物資を発見！HP回復");
            break;
        case 1: // 近道
            gameState.wave++; // 追加でウェーブを進める
            showMessage("近道を発見！しかし敵が待ち受けていた");
            break;
        case 2: // 安全
            gameState.player.energy = gameState.player.maxEnergy;
            showMessage("安全な場所で休憩。電力全回復");
            break;
    }
    
    generateEnemies();
    updateUI();
}

// 敵AI開始
function startEnemyAI() {
    // 攻撃タイマーの更新を開始
    if (gameState.attackTimerInterval) {
        clearInterval(gameState.attackTimerInterval);
    }
    
    gameState.attackTimerInterval = setInterval(() => {
        if (!gameState.timePaused && gameState.gameStarted) {
            updateAttackTimers();
        }
    }, 50);
}

// 攻撃タイマー更新
function updateAttackTimers() {
    gameState.enemies.forEach(enemy => {
        if (!enemy.frozen) {
            enemy.attackTimer += 50;
            
            const timerFill = document.getElementById(`timer-${enemy.id}`);
            if (timerFill) {
                const progress = Math.min(enemy.attackTimer / enemy.attackMaxTime, 1);
                timerFill.style.width = (progress * 100) + '%';
                
                // 危険度に応じて色を変更
                if (progress > 0.8) {
                    timerFill.style.backgroundColor = '#ff4444';
                } else if (progress > 0.6) {
                    timerFill.style.backgroundColor = '#ffaa44';
                } else {
                    timerFill.style.backgroundColor = '#44ff44';
                }
            }
            
            // 攻撃実行
            if (enemy.attackTimer >= enemy.attackMaxTime) {
                attackPlayer(enemy);
                enemy.attackTimer = 0;
                enemy.attackMaxTime = 4000 + Math.random() * 4000;
            }
        }
    });
}

// 時間停止/再開
function toggleTimePause() {
    gameState.timePaused = !gameState.timePaused;
    const button = document.getElementById('pauseButton');
    if (button) {
        button.textContent = gameState.timePaused ? '▶️ 時間再開' : '⏸️ 時間停止';
    }
    
    // 時間停止/再開に応じてサポート効果のタイマーを調整
    if (gameState.timePaused) {
        // 時間停止時：現在の残り時間を保存
        Object.keys(gameState.supportEffects).forEach(id => {
            const effect = gameState.supportEffects[id];
            if (effect && effect.endTime) {
                effect.pausedTime = effect.endTime - Date.now();
            }
        });
    } else {
        // 時間再開時：保存された残り時間から新しい終了時刻を計算
        Object.keys(gameState.supportEffects).forEach(id => {
            const effect = gameState.supportEffects[id];
            if (effect && effect.pausedTime !== undefined) {
                effect.endTime = Date.now() + effect.pausedTime;
                delete effect.pausedTime;
            }
        });
    }
    
    showMessage(gameState.timePaused ? '時間を停止しました' : '時間を再開しました');
}

// プレイヤーへの攻撃
function attackPlayer(enemy) {
    if (gameState.player.shield && gameState.player.shield > 0) {
        gameState.player.shield--;
        updateSupportEffect('shield', `シールド (${gameState.player.shield}回)`);
        if (gameState.player.shield === 0) {
            removeSupportEffect('shield');
        }
        showMessage("シールドが攻撃を防いだ！");
    } else {
        const damage = enemy.isBoss ? 20 : 15;
        gameState.player.hp = Math.max(0, gameState.player.hp - damage);
        showMessage(`敵の攻撃！${damage}ダメージを受けた`);
    }
    
    updateUI();
    
    if (gameState.player.hp <= 0) {
        gameOver();
    }
}

// 電力チャージ開始
function startCharging() {
    if (gameState.timePaused) {
        showMessage("時間停止中は電力チャージできません");
        return;
    }
    
    if (gameState.isCharging) return;
    
    gameState.isCharging = true;
    showMessage("電力チャージ中... 無防備状態");
    
    gameState.chargeInterval = setInterval(() => {
        const regenRate = gameState.accelerateActive ? 4 : 2;
        gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + regenRate);
        updateUI();
    }, 100);
}

// 電力チャージ終了
function stopCharging() {
    if (!gameState.isCharging) return;
    
    gameState.isCharging = false;
    if (gameState.chargeInterval) {
        clearInterval(gameState.chargeInterval);
        gameState.chargeInterval = null;
    }
    showMessage("チャージ終了");
}

// 電力自然回復開始
function startEnergyRegeneration() {
    setInterval(() => {
        if (!gameState.isCharging && gameState.gameStarted && !gameState.timePaused) {
            const regenRate = gameState.accelerateActive ? 2 : 1;
            gameState.player.energy = Math.min(gameState.player.maxEnergy, gameState.player.energy + regenRate);
            updateUI();
        }
    }, 1000);
}

// UI更新
function updateUI() {
    // HP更新
    document.getElementById('playerHp').textContent = gameState.player.hp;
    const hpBar = document.getElementById('hpBar');
    const hpPercent = (gameState.player.hp / gameState.player.maxHp) * 100;
    hpBar.style.width = hpPercent + '%';
    
    // エネルギー更新
    document.getElementById('playerEnergy').textContent = gameState.player.energy;
    const energyBar = document.getElementById('energyBar');
    const energyPercent = (gameState.player.energy / gameState.player.maxEnergy) * 100;
    energyBar.style.width = energyPercent + '%';
}

// メッセージ表示
function showMessage(text) {
    const messageArea = document.getElementById('messageArea');
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    messageArea.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
}

// ゲームオーバー
function gameOver() {
    gameState.gameStarted = false;
    
    // 全てのインターバルをクリア
    if (gameState.attackTimerInterval) {
        clearInterval(gameState.attackTimerInterval);
    }
    
    gameState.enemies.forEach(enemy => {
        if (enemy.attackInterval) {
            clearInterval(enemy.attackInterval);
        }
        if (enemy.freezeTimeout) {
            clearTimeout(enemy.freezeTimeout);
        }
    });
    
    if (gameState.chargeInterval) {
        clearInterval(gameState.chargeInterval);
    }
    
    setTimeout(() => {
        alert(`ゲームオーバー\n\n到達ウェーブ: ${gameState.wave}\n\n時間の渦に再び飲み込まれてしまった...`);
        resetGame();
        showMainMenu();
    }, 1000);
}

// ゲームリセット
function resetGame() {
    gameState.player.hp = gameState.player.maxHp;
    gameState.player.energy = gameState.player.maxEnergy;
    gameState.selectedDeck = [];
    gameState.handCards = [];
    gameState.selectedCard = null;
    gameState.enemies = [];
    gameState.stage = 1;
    gameState.wave = 1;
    gameState.isCharging = false;
    gameState.gameStarted = false;
    gameState.routeChoices = 0;
    gameState.overloadActive = false;
    gameState.accelerateActive = false;
    gameState.player.shield = 0;
    gameState.timePaused = false;
    gameState.supportEffects = {};
    gameState.showingCardSwap = false;
    
    // UI要素をクリア
    const gameArea = document.getElementById('gameArea');
    const enemies = gameArea.querySelectorAll('.enemy');
    enemies.forEach(e => e.remove());
    
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = '';
    
    // サポート効果表示をクリア
    const supportEffectsContainer = document.getElementById('supportEffects');
    if (supportEffectsContainer) {
        supportEffectsContainer.innerHTML = '';
    }
}

// 初期化
function init() {
    console.log('Initializing game...');
    gameState.availableCards = [...allCards];
    updateUI();
}

// ページ読み込み時の初期化
window.addEventListener('load', () => {
    init();
});

// キーボードイベント
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && gameState.gameStarted) {
        event.preventDefault(); // ページのスクロールを防ぐ
        toggleTimePause();
    }
});

// サポート効果管理
function addSupportEffect(id, name, duration) {
    const container = document.getElementById('supportEffects');
    
    // 既存の効果を更新または新規作成
    let effectElement = document.getElementById(`support-${id}`);
    if (!effectElement) {
        effectElement = document.createElement('div');
        effectElement.id = `support-${id}`;
        effectElement.className = `support-effect ${id}`;
        container.appendChild(effectElement);
    }
    
    const timerText = duration ? `${Math.ceil(duration / 1000)}秒` : '';
    effectElement.innerHTML = `
        <span>${name}</span>
        <span class="support-effect-timer">${timerText}</span>
    `;
    
    // タイマー付きの効果の場合、カウントダウンを開始
    if (duration) {
        gameState.supportEffects[id] = {
            endTime: Date.now() + duration,
            interval: setInterval(() => updateSupportEffectTimer(id), 1000)
        };
    }
}

function updateSupportEffect(id, name) {
    const effectElement = document.getElementById(`support-${id}`);
    if (effectElement) {
        const timerSpan = effectElement.querySelector('.support-effect-timer');
        const timerText = timerSpan ? timerSpan.textContent : '';
        effectElement.innerHTML = `
            <span>${name}</span>
            <span class="support-effect-timer">${timerText}</span>
        `;
    }
}

function updateSupportEffectTimer(id) {
    const effect = gameState.supportEffects[id];
    if (!effect) return;
    
    // 時間停止中はタイマーを進めない
    if (gameState.timePaused) return;
    
    const remainingTime = Math.max(0, effect.endTime - Date.now());
    const seconds = Math.ceil(remainingTime / 1000);
    
    const timerSpan = document.querySelector(`#support-${id} .support-effect-timer`);
    if (timerSpan) {
        timerSpan.textContent = `${seconds}秒`;
    }
    
    if (remainingTime <= 0) {
        clearInterval(effect.interval);
        delete gameState.supportEffects[id];
    }
}

function removeSupportEffect(id) {
    const effectElement = document.getElementById(`support-${id}`);
    if (effectElement) {
        effectElement.remove();
    }
    
    if (gameState.supportEffects[id]) {
        clearInterval(gameState.supportEffects[id].interval);
        delete gameState.supportEffects[id];
    }
}

// カード交換システム

// カード交換画面表示
function showCardSwap() {
    gameState.showingCardSwap = true;
    const dialog = document.getElementById('cardSwap');
    const currentCards = document.getElementById('currentCards');
    const availableSwapCards = document.getElementById('availableSwapCards');
    
    // 現在の手札を表示
    currentCards.innerHTML = '';
    gameState.handCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'swap-card current';
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-effect">${card.effect}</div>
        `;
        cardElement.onclick = () => selectCardForSwap(card, index);
        currentCards.appendChild(cardElement);
    });
    
    // 利用可能なカードを表示（現在の手札以外）
    availableSwapCards.innerHTML = '';
    const availableCards = allCards.filter(card => 
        !gameState.handCards.find(handCard => handCard.id === card.id)
    );
    
    availableCards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'swap-card available';
        cardElement.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-effect">${card.effect}</div>
        `;
        cardElement.onclick = () => selectReplacementCard(card);
        availableSwapCards.appendChild(cardElement);
    });
    
    dialog.classList.remove('hidden');
    showMessage("カードを1枚交換できます。不要なカードを選んでから新しいカードを選んでください。");
}

let selectedCardForSwap = null;
let selectedCardIndex = -1;

// 交換するカードを選択
function selectCardForSwap(card, index) {
    selectedCardForSwap = card;
    selectedCardIndex = index;
    
    // 現在のカードの選択状態をリセット
    document.querySelectorAll('.swap-card.current').forEach(el => {
        el.classList.remove('selected');
    });
    
    // 選択されたカードをハイライト
    document.querySelectorAll('.swap-card.current')[index].classList.add('selected');
    
    showMessage(`${card.name}を選択しました。交換する新しいカードを選んでください。`);
}

// 交換先のカードを選択
function selectReplacementCard(newCard) {
    if (!selectedCardForSwap) {
        showMessage("まず交換したいカードを選択してください。");
        return;
    }
    
    // カードを交換
    gameState.handCards[selectedCardIndex] = newCard;
    
    showMessage(`${selectedCardForSwap.name}を${newCard.name}に交換しました！`);
    
    // 交換画面を閉じて次のウェーブへ
    setTimeout(() => {
        closeCardSwap();
        nextWave();
    }, 1500);
}

// カード交換をスキップ
function skipCardSwap() {
    closeCardSwap();
    nextWave();
}

// カード交換画面を閉じる
function closeCardSwap() {
    gameState.showingCardSwap = false;
    selectedCardForSwap = null;
    selectedCardIndex = -1;
    document.getElementById('cardSwap').classList.add('hidden');
    renderHand(); // 手札を再描画
}