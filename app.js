/* 冒險者公會 — 開羅風 v2-kairo 可玩核心循環 */
(function () {
  const STORAGE_KEY = 'ag-v2-kairo-save-v1';
  const MAX_ITEMS_PER_QUEST = 3;
  const LILY = '莉莉';
  const REP_LABELS = [
    [20, '低'],
    [45, '偏低'],
    [70, '中'],
    [90, '高'],
    [101, '極高']
  ];

  const toastEl = document.getElementById('toast');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalRarity = document.getElementById('modal-rarity');
  const modalActions = document.getElementById('modal-actions');
  const dialogueText = document.getElementById('dialogue-text');
  const dialogueName = document.getElementById('dialogue-name');
  const questRow = document.getElementById('quest-row');
  const invHint = document.getElementById('inv-hint');
  const goldEl = document.getElementById('gold-val');
  const repEl = document.getElementById('rep-val');
  const dungeonRoot = document.getElementById('dungeon-lanes');
  const dungeonHint = document.getElementById('dungeon-hint');

  let toastTimer = null;
  let activeQuest = null;
  let selectedQuestId = null;
  let modalMode = 'quest'; // quest | plain

  const BASE_BY_RARITY = { R: 78, SR: 58, SSR: 38, UR: 26, EXTRA: 20 };

  const ELEMENT_BY_MONSTER = {
    phoenix: 'fire', yeti: 'water', beeQueen: 'earth', shadow: 'dark',
    fairy: 'light', dragonBaby: 'fire', unicorn: 'light', ghost: 'dark',
    slime: 'water', goblin: 'earth', wolf: 'wind', mushroom: 'earth',
    bee: 'earth', crystal: 'light', snake: 'earth', spider: 'dark',
    frog: 'water', imp: 'fire', golem: 'earth', jelly: 'water',
    crow: 'wind', crab: 'water', plant: 'earth', bossSlime: 'water',
    owl: 'wind', fish: 'water', mole: 'earth', turtle: 'earth',
    knight: 'light', witch: 'dark', angel: 'light', pumpkin: 'earth', mimicGold: 'light', slimeKing: 'water', harpy: 'wind', treant: 'earth', mermaid: 'water', centaur: 'earth', crocodile: 'water', peacock: 'wind', kraken: 'water', cyclops: 'earth', mandrake: 'earth', basilisk: 'earth', goblinChief: 'earth', chimera: 'fire', naga: 'water', skeletonKing: 'dark', minotaur: 'earth', dryad: 'earth', slimeQueen: 'water', beholder: 'dark', kitsune: 'wind', ironGolem: 'earth', cerberus: 'fire', siren: 'water', troll: 'earth', dragonAdult: 'fire', mummy: 'dark', pixie: 'light', wyvern: 'wind', kobold: 'earth', angelFallen: 'dark', leviathan: 'water', homunculus: 'dark', werewolf: 'earth', griffin: 'wind', zombie: 'dark', salamander: 'fire', bahamut: 'light', impLord: 'fire', mossSlime: 'earth', earthElemental: 'earth', frostSpider: 'water', thunderBird: 'wind', crystalGolem: 'light', poisonFrog: 'earth', shadowCat: 'dark', lavaSlug: 'fire', iceWolf: 'water', windSprite: 'wind', stoneTurtle: 'earth', flameImp: 'fire', mistWraith: 'dark', sandScorpion: 'earth', coralCrab: 'water', thunderBoar: 'wind', vineSnake: 'earth', caveBatking: 'dark', ruinGolem: 'earth', jellyBlob: 'water', mushroomSpore: 'earth', candyMimic: 'light', ironKnight: 'earth', armorMimic: 'dark', gemSprite: 'light', banditChief: 'dark', darkMage: 'dark', plagueRat: 'earth', paperGolem: 'light', bellSpirit: 'wind', festivalMask: 'dark', scarecrow: 'earth', rainSlime: 'water', frostHare: 'water', feralHound: 'earth', strayCat: 'dark', petMimic: 'light', echoBanshee: 'dark', drumGolem: 'earth', curtainMimic: 'dark', riverSerpent: 'water', roadBandit: 'earth', skyPiranha: 'wind', treasureMimic: 'light', goldBeetle: 'earth', jewelDrake: 'fire', clockworkOwl: 'light', shadowBat: 'dark', ledgerGolem: 'earth', bladeWraith: 'dark', healMimic: 'light', barrierGolem: 'earth', poisonToad: 'earth', emberFox: 'fire', frostCrab: 'water', arenaChamp: 'light', trophyMimic: 'light', fanSpirit: 'wind', wordWisp: 'light', inkSlime: 'dark', echoParrot: 'wind', gateGolem: 'earth', crateMimic: 'dark', compassWisp: 'wind', bagMimic: 'dark', lockSpecter: 'dark', coinSwarm: 'light', critBlade: 'dark', healBloom: 'light', shieldTurtle: 'earth', gearGolem: 'earth', noiseImp: 'dark', scrollWraith: 'dark', emptyChest: 'dark', arrowImp: 'wind', tutorialSlime: 'water', blossomSprite: 'light', sunScarab: 'fire', leafWyrm: 'earth', snowman: 'water', lanternFish: 'dark', steamSpirit: 'fire', brickGolem: 'earth', bedMimic: 'dark', priceTagImp: 'fire', fireSprite: 'fire', waterNymph: 'water', windHarpy: 'wind', earthMole: 'earth', lightMoth: 'light', darkRaven: 'dark', trophyKnight: 'light', coinDragon: 'fire', scrollDragon: 'dark', calendarImp: 'fire', heartSlime: 'light', giftMimic: 'dark', riverFish: 'water', oreGolem: 'earth', pickaxeImp: 'fire', slimeFlask: 'water', cauldronImp: 'fire', herbSprite: 'earth', madChick: 'earth', woolSheep: 'earth',
    bat: 'dark', rat: 'earth',
    mimic: 'dark', skeleton: 'dark'
  };
  const ELEMENT_LABEL = { fire: '火', water: '水', earth: '土', wind: '風', light: '光', dark: '暗' };
  const RARITY_FRAME = {
    R: 'assets/frames/frame-common.png',
    SR: 'assets/frames/frame-rare.png',
    SSR: 'assets/frames/frame-epic.png',
    UR: 'assets/frames/frame-epic.png',
    EXTRA: 'assets/frames/frame-epic.png'
  };
  function questElement(q) {
    if (q && q.element) return q.element;
    if (q && q.monsterId && ELEMENT_BY_MONSTER[q.monsterId]) return ELEMENT_BY_MONSTER[q.monsterId];
    return null;
  }
  function elementIconSrc(el) {
    if (el === 'fire' || el === 'water' || el === 'wind' || el === 'earth' || el === 'light' || el === 'dark') {
      return 'assets/ui/elem-' + el + '.png';
    }
    return 'assets/elements/el-' + el + '.png';
  }
  function gemIconSrc(el) {
    if (el === 'fire' || el === 'water' || el === 'wind' || el === 'earth' || el === 'light' || el === 'dark') {
      return 'assets/icons/gem-' + el + '.png';
    }
    return null;
  }
  function elementBonus(q) {
    const el = questElement(q);
    if (!el) return 0;
    const w = weatherForDay(state.day);
    if (w.id === 'sun' && (el === 'fire' || el === 'light')) return 3;
    if (w.id === 'rain' && (el === 'water' || el === 'earth')) return 3;
    if (w.id === 'cloud' && (el === 'wind' || el === 'dark')) return 2;
    if (w.id === 'sun' && el === 'water') return -1;
    if (w.id === 'rain' && el === 'fire') return -2;
    return 1;
  }
  function trainBonus() {
    if (!state.trainBuff) return 0;
    return state.trainBuff.rate || 0;
  }
  function fatiguePenalty() {
    const f = state.fatigue || 0;
    if (f >= 8) return -6;
    if (f >= 5) return -3;
    if (f >= 3) return -1;
    return 0;
  }
  function applyRest(kind) {
    if (state.guildHp == null) state.guildHp = 100;
    if (state.fatigue == null) state.fatigue = 0;
    let heal = 0, fat = 0, label = '';
    if (kind === 'pillow') { heal = 8; fat = 2; label = '軟枕小憩'; }
    else if (kind === 'bed') { heal = 22; fat = 4; label = '床鋪安眠'; }
    else if (kind === 'bath') { heal = 18; fat = 3; label = '浴缸清潔'; }
    else if (kind === 'tent') { heal = 14; fat = 3; label = '帳篷休整'; }
    else if (kind === 'bedroll') { heal = 8; fat = 2; label = '睡袋小憩'; }
    else { heal = 10; fat = 2; label = '營火休息'; }
    state.guildHp = Math.min(100, (state.guildHp || 0) + heal);
    state.fatigue = Math.max(0, (state.fatigue || 0) - fat);
    saveState();
    return { heal, fat, label, hp: state.guildHp, fatigue: state.fatigue };
  }



  const ASSET_V = '1794068200';

  /* —— r20/r21：空狀態／章節／NPC／教學／活動 —— */
  const NPC_HEADS = {
    merchant: { src: 'assets/heads/npc-merchant.png', name: '雜貨商人' },
    blacksmith: { src: 'assets/heads/npc-blacksmith.png', name: '鐵匠師傅' },
    innkeeper: { src: 'assets/heads/npc-innkeeper.png', name: '旅店老闆' },
    questgiver: { src: 'assets/heads/npc-questgiver.png', name: '委託人' },
    trainer: { src: 'assets/heads/npc-trainer.png', name: '訓練教官' },
    librarian: { src: 'assets/heads/npc-librarian.png', name: '圖書館員' },
    guard: { src: 'assets/heads/npc-guard.png', name: '公會守衛' },
    alchemist: { src: 'assets/heads/npc-alchemist.png', name: '煉金師' },
    stablehand: { src: 'assets/heads/npc-stablehand.png', name: '馬廄管理員' },
    receptionist: { src: 'assets/heads/npc-receptionist.png', name: '櫃台接待' },
    carpenter: { src: 'assets/heads/npc-carpenter.png', name: '木匠師傅' },
    tailor: { src: 'assets/heads/npc-tailor.png', name: '裁縫師傅' },
    fisher: { src: 'assets/heads/npc-fisher.png', name: '漁夫' },
    miner: { src: 'assets/heads/npc-miner.png', name: '礦工' },
    herbalist: { src: 'assets/heads/npc-herbalist.png', name: '藥草師' },
    bardNpc: { src: 'assets/heads/npc-bard-npc.png', name: '吟遊詩人' },
    jeweler: { src: 'assets/heads/npc-jeweler.png', name: '寶石商' },
    cook: { src: 'assets/heads/npc-cook.png', name: '廚師' },
    scribe: { src: 'assets/heads/npc-scribe.png', name: '書記官' },
    farmer: { src: 'assets/heads/npc-farmer.png', name: '農夫' },
    potter: { src: 'assets/heads/npc-potter.png', name: '陶匠' },
    cartographer: { src: 'assets/heads/npc-cartographer.png', name: '製圖師' },
    mayor: { src: 'assets/heads/npc-mayor.png', name: '鎮長' },
    child: { src: 'assets/heads/npc-child.png', name: '小鎮孩童' },
    elder: { src: 'assets/heads/npc-elder.png', name: '長老' },
    sailor: { src: 'assets/heads/npc-sailor.png', name: '水手' },
    hunter: { src: 'assets/heads/npc-hunter.png', name: '獵人' },
    priest: { src: 'assets/heads/npc-priest.png', name: '神官' },
    knightRetire: { src: 'assets/heads/npc-knight-retire.png', name: '退役騎士' },
    witchShop: { src: 'assets/heads/npc-witch-shop.png', name: '魔女雜貨' },
    dwarfSmith: { src: 'assets/heads/npc-dwarf-smith.png', name: '矮人鐵匠' },
    queen: { src: 'assets/heads/npc-queen.png', name: '女王特使' },
    thiefNpc: { src: 'assets/heads/npc-thief-npc.png', name: '盜賊公會聯絡' },
    scholar: { src: 'assets/heads/npc-scholar.png', name: '學者' },
    baker: { src: 'assets/heads/npc-baker.png', name: '麵包師傅' },
    florist: { src: 'assets/heads/npc-florist.png', name: '花匠' },
    courier: { src: 'assets/heads/npc-courier.png', name: '信使' },
    beekeeper: { src: 'assets/heads/npc-beekeeper.png', name: '養蜂人' },
    lumberjack: { src: 'assets/heads/npc-lumberjack.png', name: '伐木工' },
    miller: { src: 'assets/heads/npc-miller.png', name: '磨坊主' },
    veteran: { src: 'assets/heads/npc-veteran.png', name: '老兵' },
    apprentice: { src: 'assets/heads/npc-apprentice.png', name: '學徒' },
    noble: { src: 'assets/heads/npc-noble.png', name: '貴族委托人' },
    oracle: { src: 'assets/heads/npc-oracle.png', name: '神諭者' },
    bandit: { src: 'assets/heads/npc-bandit.png', name: '盜賊頭目' },
    chefRival: { src: 'assets/heads/npc-chef-rival.png', name: '對手廚師' },
    innMaid: { src: 'assets/heads/npc-inn-maid.png', name: '旅店女侍' },
    guildGuard: { src: 'assets/heads/npc-guild-guard.png', name: '公會衛兵' },
    travelingMerchant: { src: 'assets/heads/npc-traveling-merchant.png', name: '旅行商人' },
    librarianElder: { src: 'assets/heads/npc-librarian-elder.png', name: '資深圖書管理員' },
    stableBoy: { src: 'assets/heads/npc-stable-boy.png', name: '馬廄少年' },
    fortuneTeller: { src: 'assets/heads/npc-fortune-teller.png', name: '占卜師' },
    taxCollector: { src: 'assets/heads/npc-tax-collector.png', name: '稅務官' },
    bardStreet: { src: 'assets/heads/npc-bard-street.png', name: '街頭吟遊' },
    healerClinic: { src: 'assets/heads/npc-healer-clinic.png', name: '診所治療師' },
    pirate: { src: 'assets/heads/npc-pirate.png', name: '海盜' },
    nun: { src: 'assets/heads/npc-nun.png', name: '修女' },
    blacksmithApprentice: { src: 'assets/heads/npc-blacksmith-apprentice.png', name: '鐵匠學徒' },
    coachman: { src: 'assets/heads/npc-coachman.png', name: '馬車伕' },
    dockworker: { src: 'assets/heads/npc-dockworker.png', name: '碼頭工人' },
    teaLady: { src: 'assets/heads/npc-tea-lady.png', name: '茶婦' },
    trainerMaster: { src: 'assets/heads/npc-trainer-master.png', name: '訓練大師' },
    architect: { src: 'assets/heads/npc-architect.png', name: '建築師' },
    banker: { src: 'assets/heads/npc-banker.png', name: '銀行員' },
    minerBoss: { src: 'assets/heads/npc-miner-boss.png', name: '礦工頭目' },
    fishmonger: { src: 'assets/heads/npc-fishmonger.png', name: '魚販' },
    floristGirl: { src: 'assets/heads/npc-florist-girl.png', name: '賣花女孩' },
    weaver: { src: 'assets/heads/npc-weaver.png', name: '織布工' },
    alchemistGirl: { src: 'assets/heads/npc-alchemist-girl.png', name: '煉金少女' },
    carpenterOld: { src: 'assets/heads/npc-carpenter-old.png', name: '老木匠' },
    questBoardGirl: { src: 'assets/heads/npc-quest-board-girl.png', name: '委託板女孩' },
    innkeeperLady: { src: 'assets/heads/npc-innkeeper-lady.png', name: '旅店女主人' },
    trainerCoach: { src: 'assets/heads/npc-trainer-coach.png', name: '訓練教練' },
    bathAttendant: { src: 'assets/heads/npc-bath-attendant.png', name: '浴場侍者' },
    merchantLady: { src: 'assets/heads/npc-merchant-lady.png', name: '女商人' },
    courierBoy: { src: 'assets/heads/npc-courier-boy.png', name: '少年信使' },
    rangerScout: { src: 'assets/heads/npc-ranger-scout.png', name: '遊俠斥候' },
    caveGuide: { src: 'assets/heads/npc-cave-guide.png', name: '洞窟嚮導' },
    ruinsScholar: { src: 'assets/heads/npc-ruins-scholar.png', name: '遺跡學者' },
    chefLady: { src: 'assets/heads/npc-chef-lady.png', name: '女廚師' },
    bartender: { src: 'assets/heads/npc-bartender.png', name: '酒保' },
    candyGirl: { src: 'assets/heads/npc-candy-girl.png', name: '糖果女孩' },
    blacksmithLady: { src: 'assets/heads/npc-blacksmith-lady.png', name: '女鐵匠' },
    armorer: { src: 'assets/heads/npc-armorer.png', name: '鎧甲師' },
    jewelerGirl: { src: 'assets/heads/npc-jeweler-girl.png', name: '珠寶女孩' },
    partyRecruiter: { src: 'assets/heads/npc-party-recruiter.png', name: '隊伍招募員' },
    guildCaptain: { src: 'assets/heads/npc-guild-captain.png', name: '公會隊長' },
    healerSister: { src: 'assets/heads/npc-healer-sister.png', name: '治療修女' },
    postmaster: { src: 'assets/heads/npc-postmaster.png', name: '郵政局長' },
    townMayor: { src: 'assets/heads/npc-town-mayor.png', name: '鎮長大人' },
    festivalHost: { src: 'assets/heads/npc-festival-host.png', name: '祭典主持人' },
    farmerAunt: { src: 'assets/heads/npc-farmer-aunt.png', name: '農婦阿姨' },
    weatherman: { src: 'assets/heads/npc-weatherman.png', name: '天氣預報員' },
    seedSeller: { src: 'assets/heads/npc-seed-seller.png', name: '種子商人' },
    petShopGirl: { src: 'assets/heads/npc-pet-shop-girl.png', name: '寵物店員' },
    vetDoctor: { src: 'assets/heads/npc-vet-doctor.png', name: '獸醫' },
    breederBoy: { src: 'assets/heads/npc-breeder-boy.png', name: '繁殖少年' },
    bardSinger: { src: 'assets/heads/npc-bard-singer.png', name: '歌手吟遊' },
    drummerBoy: { src: 'assets/heads/npc-drummer-boy.png', name: '鼓手少年' },
    stageManager: { src: 'assets/heads/npc-stage-manager.png', name: '舞台監督' },
    ferryCaptain: { src: 'assets/heads/npc-ferry-captain.png', name: '渡船船長' },
    cartDriver: { src: 'assets/heads/npc-cart-driver.png', name: '馬車司機' },
    balloonPilot: { src: 'assets/heads/npc-balloon-pilot.png', name: '氣球駕駛' },
    appraiser: { src: 'assets/heads/npc-appraiser.png', name: '鑑定師' },
    collectorLady: { src: 'assets/heads/npc-collector-lady.png', name: '收藏家' },
    auctioneer: { src: 'assets/heads/npc-auctioneer.png', name: '拍賣官' },
    clockmaker: { src: 'assets/heads/npc-clockmaker.png', name: '鐘錶匠' },
    nightWatch: { src: 'assets/heads/npc-night-watch.png', name: '夜哨' },
    rentClerk: { src: 'assets/heads/npc-rent-clerk.png', name: '租金書記' },
    skillTutor: { src: 'assets/heads/npc-skill-tutor.png', name: '技能導師' },
    monkSensei: { src: 'assets/heads/npc-monk-sensei.png', name: '武僧師父' },
    barrierMage: { src: 'assets/heads/npc-barrier-mage.png', name: '結界法師' },
    apothecary: { src: 'assets/heads/npc-apothecary.png', name: '藥劑師' },
    herbWitch: { src: 'assets/heads/npc-herb-witch.png', name: '藥草女巫' },
    icePriest: { src: 'assets/heads/npc-ice-priest.png', name: '冰祭司' },
    arenaReferee: { src: 'assets/heads/npc-arena-referee.png', name: '競技裁判' },
    rankingClerk: { src: 'assets/heads/npc-ranking-clerk.png', name: '排名書記' },
    cheerGirl: { src: 'assets/heads/npc-cheer-girl.png', name: '啦啦隊員' },
    storyteller: { src: 'assets/heads/npc-storyteller.png', name: '說書人' },
    gossipAunt: { src: 'assets/heads/npc-gossip-aunt.png', name: '八卦阿嬸' },
    quietScribe: { src: 'assets/heads/npc-quiet-scribe.png', name: '沉默書吏' },
    gatekeeper: { src: 'assets/heads/npc-gatekeeper.png', name: '門衛' },
    warehouseClerk: { src: 'assets/heads/npc-warehouse-clerk.png', name: '倉庫書記' },
    mapCartographer: { src: 'assets/heads/npc-map-cartographer.png', name: '地圖製圖師' },
    inventoryMaid: { src: 'assets/heads/npc-inventory-maid.png', name: '背包女僕' },
    pawnbroker: { src: 'assets/heads/npc-pawnbroker.png', name: '當舖老板' },
    locksmith: { src: 'assets/heads/npc-locksmith.png', name: '鎖匠' },
    battleCoach: { src: 'assets/heads/npc-battle-coach.png', name: '戰鬥教練' },
    fieldMedic: { src: 'assets/heads/npc-field-medic.png', name: '戰地醫官' },
    tacticAdvisor: { src: 'assets/heads/npc-tactic-advisor.png', name: '戰術顧問' },
    settingsSteward: { src: 'assets/heads/npc-settings-steward.png', name: '設定管家' },
    soundTech: { src: 'assets/heads/npc-sound-tech.png', name: '音響技師' },
    translator: { src: 'assets/heads/npc-translator.png', name: '翻譯員' },
    tutorialGuide: { src: 'assets/heads/npc-tutorial-guide.png', name: '新手嚮導' },
    friendMatcher: { src: 'assets/heads/npc-friend-matcher.png', name: '好友配對' },
    questHelper: { src: 'assets/heads/npc-quest-helper.png', name: '委託助手' },
    floristSeason: { src: 'assets/heads/npc-florist-season.png', name: '季節花匠' },
    festivalDancer: { src: 'assets/heads/npc-festival-dancer.png', name: '祭典舞者' },
    lanternKeeper: { src: 'assets/heads/npc-lantern-keeper.png', name: '燈籠守護' },
    snowVendor: { src: 'assets/heads/npc-snow-vendor.png', name: '雪攤小販' },
    nightStall: { src: 'assets/heads/npc-night-stall.png', name: '夜市檔主' },
    onsenAttendant: { src: 'assets/heads/npc-onsen-attendant.png', name: '溫泉侍者' },
    innHost: { src: 'assets/heads/npc-inn-host.png', name: '旅店東主' },
    shopOwner: { src: 'assets/heads/npc-shop-owner.png', name: '店主' },
    elementalist: { src: 'assets/heads/npc-elementalist.png', name: '元素使' },
    crystalSeller: { src: 'assets/heads/npc-crystal-seller.png', name: '水晶商人' },
    windSage: { src: 'assets/heads/npc-wind-sage.png', name: '風賢者' },
    earthDruid: { src: 'assets/heads/npc-earth-druid.png', name: '地德魯伊' },
    lightCleric: { src: 'assets/heads/npc-light-cleric.png', name: '光牧師' },
    shadowRogue: { src: 'assets/heads/npc-shadow-rogue.png', name: '影盜賊' },
    achievementClerk: { src: 'assets/heads/npc-achievement-clerk.png', name: '成就書記' },
    historian: { src: 'assets/heads/npc-historian.png', name: '史官' },
    richPatron: { src: 'assets/heads/npc-rich-patron.png', name: '富豪贊助人' },
    dailyClerk: { src: 'assets/heads/npc-daily-clerk.png', name: '每日書記' },
    friendshipClerk: { src: 'assets/heads/npc-friendship-clerk.png', name: '友情書記' },
    giftCourier: { src: 'assets/heads/npc-gift-courier.png', name: '禮物信使' },
    angler: { src: 'assets/heads/npc-angler.png', name: '釣客' },
    minerGirl: { src: 'assets/heads/npc-miner-girl.png', name: '礦工少女' },
    baitSeller: { src: 'assets/heads/npc-bait-seller.png', name: '魚餌販' },
    labApprentice: { src: 'assets/heads/npc-lab-apprentice.png', name: '實驗室學徒' },
    rancher: { src: 'assets/heads/npc-rancher.png', name: '牧場主' },
    shepherdGirl: { src: 'assets/heads/npc-shepherd-girl.png', name: '牧羊女' }
  };

  function ensureDialogueChrome() {
    const panel = document.querySelector('.dialogue');
    if (!panel || panel.dataset.chrome === '1') return;
    panel.dataset.chrome = '1';
    panel.classList.add('dialog-wood');
    // wood corners
    ['tl','tr','bl','br'].forEach((pos) => {
      const c = document.createElement('img');
      c.className = 'dialog-corner ' + pos;
      c.src = 'assets/ui/dialog-corner-wood.png?v=' + ASSET_V;
      c.alt = '';
      panel.appendChild(c);
    });
    const tail = document.createElement('img');
    tail.className = 'dialog-tail';
    tail.src = 'assets/ui/dialog-tail-down.png?v=' + ASSET_V;
    tail.alt = '';
    panel.appendChild(tail);
    // receptionist beside lily mood
    let rec = document.getElementById('npc-receptionist-chip');
    if (!rec) {
      rec = document.createElement('img');
      rec.id = 'npc-receptionist-chip';
      rec.className = 'npc-receptionist-chip';
      rec.src = 'assets/heads/npc-receptionist.png?v=' + ASSET_V;
      rec.alt = '櫃台接待';
      rec.title = '櫃台接待';
      panel.appendChild(rec);
    }
    try { setDialogueBubble('speech'); } catch (e) {}
    panel.querySelectorAll('.dialog-corner, .dialog-tail, .npc-receptionist-chip').forEach((el) => {
      el.hidden = true;
    });
  }
  function npcBannerHtml(role, sub) {
    const n = NPC_HEADS[role];
    if (!n) return '';
    return '<div class="npc-banner" data-npc="' + role + '">' +
      '<img class="npc-head" src="' + n.src + '?v=' + ASSET_V + '" alt="' + n.name + '"/>' +
      '<div class="npc-meta"><b>' + n.name + '</b>' +
      (sub ? '<small>' + sub + '</small>' : '') +
      '</div></div>';
  }
  function setDialogueBubble(kind) {
    const panel = document.querySelector('.dialogue');
    if (!panel) return;
    panel.classList.add('framed');
    panel.classList.remove('bubble-decor', 'bubble-speech', 'bubble-thought', 'bubble-shout', 'dialog-wood');
    panel.classList.add('bubble-' + (kind || 'speech'));
    panel.style.backgroundImage = '';
    // 收埋木框角／尾／接待疊層，保持文字單一可讀
    panel.querySelectorAll('.dialog-corner, .dialog-tail, .npc-receptionist-chip').forEach((el) => {
      el.hidden = true;
    });
  }
  function sayAs(role, text, bubble) {
    const n = NPC_HEADS[role];
    if (dialogueName) dialogueName.textContent = n ? n.name : LILY;
    dialogueText.textContent = text;
    try { setDialogueBubble(bubble || 'speech'); } catch (e) {}
  }

  function chapterProgress() {
    const wins = state.wins || 0;
    const rep = state.rep != null ? state.rep : 0;
    const unlocked = [true, rep >= 70 || wins >= 5, rep >= 85 || wins >= 12];
    const cleared = [
      wins >= 3 || rep >= 60,
      unlocked[1] && (wins >= 8 || rep >= 80),
      unlocked[2] && (wins >= 15 || rep >= 95)
    ];
    return { unlocked, cleared, wins, rep };
  }
  function renderChapterStrip() {
    let el = document.getElementById('chapter-strip');
    if (!el) {
      const header = document.querySelector('.top-bar');
      if (!header) return;
      el = document.createElement('div');
      el.id = 'chapter-strip';
      el.className = 'chapter-strip';
      el.setAttribute('aria-label', '章節進度');
      header.insertAdjacentElement('afterend', el);
    }
    const cp = chapterProgress();
    let html = '';
    for (let i = 0; i < 3; i++) {
      const n = i + 1;
      const lock = !cp.unlocked[i];
      const clear = cp.cleared[i];
      let tip = '第' + n + '章';
      if (lock) tip += n === 2 ? '（聲譽≥70 或 勝≥5）' : '（聲譽≥85 或 勝≥12）';
      else if (clear) tip += '（已通關）';
      else tip += '（進行中）';
      html += '<button type="button" class="chapter-badge' + (lock ? ' locked' : '') + (clear ? ' cleared' : '') +
        '" data-chapter="' + n + '" title="' + tip + '">' +
        '<img class="ch-main" src="assets/ui/chapter-badge-' + n + '.png?v=' + ASSET_V + '" alt="第' + n + '章"/>' +
        (lock ? '<img class="ch-overlay" src="assets/ui/chapter-lock.png?v=' + ASSET_V + '" alt="鎖"/>' : '') +
        (clear && !lock ? '<img class="ch-overlay clear" src="assets/ui/chapter-clear.png?v=' + ASSET_V + '" alt="通關"/>' : '') +
        ((!lock) ? '<img class="ch-seal" src="assets/ui/chapter-seal-0' + n + '.png?v=' + ASSET_V + '" alt="章印"/>' : '') +
        '</button>';
    }
    el.innerHTML = html;
    el.querySelectorAll('.chapter-badge').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n = +btn.dataset.chapter;
        const cp2 = chapterProgress();
        if (!cp2.unlocked[n - 1]) {
          toast('第' + n + '章未解鎖');
          setLilyMood('think');
          sayAs('guard', n === 2
            ? '站住！第二章要聲譽≥70 或累勝≥5 先過得我呢度。'
            : '第三章門禁：聲譽≥85 或累勝≥12。再練一練啦。');
          return;
        }
        toast(cp2.cleared[n - 1] ? ('第' + n + '章已通關') : ('第' + n + '章進行中'));
        setLilyMood(cp2.cleared[n - 1] ? 'proud' : 'smile');
        sayAs('guard', cp2.cleared[n - 1]
          ? '第' + n + '章徽章認可——通關！'
          : '第' + n + '章通道開啓，小心行事。');
      });
    });
  }
  function chapterRowHtml() {
    const cp = chapterProgress();
    let html = '<div class="chapter-row-map">';
    for (let i = 0; i < 3; i++) {
      const n = i + 1;
      const lock = !cp.unlocked[i];
      const clear = cp.cleared[i];
      html += '<span class="chapter-mini' + (lock ? ' locked' : '') + (clear ? ' cleared' : '') + '" title="第' + n + '章">' +
        '<img src="assets/ui/chapter-badge-' + n + '.png?v=' + ASSET_V + '" alt=""/>' +
        (lock ? '<img class="ov" src="assets/ui/chapter-lock.png?v=' + ASSET_V + '" alt=""/>' : '') +
        (clear && !lock ? '<img class="ov" src="assets/ui/chapter-clear.png?v=' + ASSET_V + '" alt=""/>' : '') +
        '</span>';
    }
    return html + '</div>';
  }

  function emptyStateHtml(kind, tip) {
    const map = {
      quest: 'assets/ui/empty-quest.png',
      party: 'assets/ui/empty-party.png',
      inbox: 'assets/ui/empty-inbox.png',
      friends: 'assets/ui/empty-friends.png',
      inventory: 'assets/ui/empty-inventory.png'
    };
    const src = map[kind];
    if (!src) return '';
    return '<div class="empty-state" data-empty="' + kind + '">' +
      '<img src="' + src + '?v=' + ASSET_V + '" alt=""/>' +
      '<p>' + (tip || '') + '</p></div>';
  }
  function syncPartyEmpty() {
    let el = document.getElementById('party-empty');
    if (!el) {
      const row = document.querySelector('.window-row');
      if (!row) return;
      el = document.createElement('div');
      el.id = 'party-empty';
      el.className = 'party-empty-wrap';
      row.insertAdjacentElement('afterend', el);
    }
    if (partyCount() <= 0) {
      el.hidden = false;
      el.innerHTML = emptyStateHtml('party', '編成空空如也～撳頭像加入前後衛啦');
    } else {
      el.hidden = true;
      el.innerHTML = '';
    }
  }

  let invTab = 'item';
  const EQUIP_ICONS = { 'equip-sword':1,'equip-bow':1,'equip-staff':1,'equip-shield':1, sword:1, shield:1, armor:1, boots:1, helmet:1 };
  const QUEST_ICONS = { map:1, contract:1, letter:1, 'icon-scroll-quest':1, 'icon-map-scrap':1, 'icon-guild-pass':1, 'icon-ticket':1, 'icon-tome':1, 'icon-tarot':1 };
  function classifyInvSlot(slot) {
    const ico = slot.getAttribute('data-icon') || '';
    if (EQUIP_ICONS[ico] || ico.indexOf('equip-') === 0) return 'equip';
    if (QUEST_ICONS[ico] || slot.classList.contains('quest-item')) return 'quest';
    return 'item';
  }
  function setInvTab(tab) {
    invTab = tab || 'item';
    document.querySelectorAll('.inv-tab').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('data-inv-tab') === invTab);
    });
    document.querySelectorAll('#inventory .slot').forEach((slot) => {
      const kind = classifyInvSlot(slot);
      slot.style.display = (kind === invTab) ? '' : 'none';
    });
    try { syncInvEmpty(); } catch (e) {}
  }

  function ensureEquipSlots() {
    let wrap = document.getElementById('equip-slots');
    if (!wrap) {
      const inv = document.getElementById('inventory');
      if (!inv) return;
      wrap = document.createElement('div');
      wrap.id = 'equip-slots';
      wrap.className = 'equip-slots';
      wrap.innerHTML =
        '<div class="eq-slot" data-eq="weapon"><img class="eq-frame" src="assets/ui/slot-weapon.png?v=' + ASSET_V + '" alt="武器"/><img class="eq-item" id="eq-weapon-ico" src="assets/icons/eq-sword-wood.png?v=' + ASSET_V + '" alt=""/></div>' +
        '<div class="eq-slot" data-eq="armor"><img class="eq-frame" src="assets/ui/slot-armor.png?v=' + ASSET_V + '" alt="防具"/><img class="eq-item" id="eq-armor-ico" src="assets/icons/eq-shield-round.png?v=' + ASSET_V + '" alt=""/></div>' +
        '<div class="eq-slot" data-eq="accessory"><img class="eq-frame" src="assets/ui/slot-accessory.png?v=' + ASSET_V + '" alt="飾品"/><img class="eq-item" id="eq-acc-ico" src="assets/icons/eq-ring-ruby.png?v=' + ASSET_V + '" alt=""/></div>';
      inv.parentElement.insertBefore(wrap, inv);
    } else {
      const w = wrap.querySelector('[data-eq="weapon"] .eq-frame');
      const a = wrap.querySelector('[data-eq="armor"] .eq-frame');
      const c = wrap.querySelector('[data-eq="accessory"] .eq-frame');
      if (w) w.src = 'assets/ui/slot-weapon.png?v=' + ASSET_V;
      if (a) a.src = 'assets/ui/slot-armor.png?v=' + ASSET_V;
      if (c) c.src = 'assets/ui/slot-accessory.png?v=' + ASSET_V;
      const wi = document.getElementById('eq-weapon-ico');
      const ai = document.getElementById('eq-armor-ico');
      const ci = document.getElementById('eq-acc-ico');
      if (wi) wi.src = 'assets/icons/eq-sword-wood.png?v=' + ASSET_V;
      if (ai) ai.src = 'assets/icons/eq-shield-round.png?v=' + ASSET_V;
      if (ci) ci.src = 'assets/icons/eq-ring-ruby.png?v=' + ASSET_V;
    }
  }

  function ensureInvTabs() {
    const header = document.querySelector('.inv-header');
    if (!header) return;
    if (!document.getElementById('inv-tabs')) {
      const tabs = document.createElement('div');
      tabs.id = 'inv-tabs';
      tabs.className = 'inv-tabs';
      [
        ['item', 'assets/ui/inv-tab-item.png', '道具'],
        ['equip', 'assets/ui/inv-tab-equip.png', '裝備'],
        ['quest', 'assets/ui/inv-tab-quest.png', '任務']
      ].forEach(([id, src, label]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'inv-tab' + (id === 'item' ? ' active' : '');
        b.setAttribute('data-inv-tab', id);
        b.title = label;
        b.innerHTML = '<img src="' + src + '?v=' + ASSET_V + '" alt="' + label + '"/><span>' + label + '</span>';
        b.addEventListener('click', () => setInvTab(id));
        tabs.appendChild(b);
      });
      header.appendChild(tabs);
    }
    if (!document.getElementById('inv-filters')) {
      const filters = document.createElement('div');
      filters.id = 'inv-filters';
      filters.className = 'inv-filters';
      filters.innerHTML =
        '<button type="button" class="inv-filter active" data-inv-filter="all" title="全部"><img src="assets/ui/filter-all.png?v=' + ASSET_V + '" alt="全部"/></button>' +
        '<button type="button" class="inv-filter" data-inv-filter="equip" title="裝備"><img src="assets/ui/filter-equip.png?v=' + ASSET_V + '" alt="裝備"/></button>' +
        '<button type="button" class="inv-sort" id="inv-sort-btn" title="排序"><img src="assets/ui/sort-arrow.png?v=' + ASSET_V + '" alt="排序"/></button>';
      header.appendChild(filters);
      filters.querySelectorAll('.inv-filter').forEach((b) => {
        b.addEventListener('click', () => {
          filters.querySelectorAll('.inv-filter').forEach((x) => x.classList.remove('active'));
          b.classList.add('active');
          const f = b.getAttribute('data-inv-filter');
          if (f === 'equip') setInvTab('equip');
          else setInvTab('item');
        });
      });
      const sortBtn = document.getElementById('inv-sort-btn');
      if (sortBtn) sortBtn.addEventListener('click', () => {
        const inv = document.getElementById('inventory');
        if (!inv) return;
        const slots = Array.from(inv.querySelectorAll('.slot.filled'));
        slots.sort((a, b) => (a.dataset.item || '').localeCompare(b.dataset.item || '', 'zh-Hant'));
        slots.forEach((s) => inv.appendChild(s));
        try { toast('已按名稱排序', 'ok'); } catch (e) {}
      });
    }
    decorateInvSlots();
    setInvTab(invTab || 'item');
  }

  function decorateInvSlots() {
    const inv = document.getElementById('inventory');
    if (!inv) return;
    inv.querySelectorAll('.slot').forEach((slot) => {
      slot.classList.add('inv-chrome');
      if (!slot.style.backgroundImage || slot.style.backgroundImage.indexOf('inv-slot') < 0) {
        const selected = slot.classList.contains('selected') || slot.classList.contains('active');
        const locked = slot.classList.contains('locked') || slot.hasAttribute('disabled');
        const bg = locked ? 'assets/ui/inv-lock.png'
          : (selected ? 'assets/ui/inv-slot-selected.png' : 'assets/ui/inv-slot.png');
        slot.style.backgroundImage = 'url(\'' + bg + '?v=' + ASSET_V + '\')';
        slot.style.backgroundSize = '100% 100%';
        slot.style.backgroundRepeat = 'no-repeat';
      }
      if (!slot._invSelectBound) {
        slot._invSelectBound = true;
        slot.addEventListener('click', () => {
          inv.querySelectorAll('.slot').forEach((s) => {
            s.classList.remove('selected');
            if (s.classList.contains('inv-chrome') && !s.classList.contains('locked')) {
              s.style.backgroundImage = 'url(\'assets/ui/inv-slot.png?v=' + ASSET_V + '\')';
            }
          });
          if (!slot.classList.contains('locked')) {
            slot.classList.add('selected');
            slot.style.backgroundImage = 'url(\'assets/ui/inv-slot-selected.png?v=' + ASSET_V + '\')';
          }
        });
      }
    });
  }

  function syncInvEmpty() {
    const wrap = document.querySelector('.inventory-wrap');
    if (!wrap) return;
    let el = document.getElementById('inv-empty');
    if (!el) {
      el = document.createElement('div');
      el.id = 'inv-empty';
      el.className = 'inv-empty-wrap';
      wrap.appendChild(el);
    }
    const slots = document.querySelectorAll('#inventory .slot.filled');
    let anyLeft = false;
    slots.forEach((s) => { if (!s.classList.contains('consumed')) anyLeft = true; });
    if (!anyLeft && slots.length) {
      el.hidden = false;
      el.innerHTML = emptyStateHtml('inventory', '庫存清空啦 · 去商店補給或等過日回復');
    } else {
      el.hidden = true;
      el.innerHTML = '';
    }
  }

  function isDoubleRewardDay() {
    // mock：逢 3／6／9… 日雙倍；或 state.eventDouble
    if (state.eventDouble) return true;
    return (state.day || 1) % 3 === 0;
  }
  function isFestivalDay() {
    if (state.eventFestival) return true;
    return (state.day || 1) % 7 === 2; // 星期二氛圍節
  }

  function ensureSeasonDeco() {
    const scene = document.querySelector('.scene-bg') || document.getElementById('app');
    if (!scene) return;
    let wrap = document.getElementById('season-deco');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'season-deco';
      wrap.className = 'season-deco';
      wrap.setAttribute('aria-hidden', 'true');
      scene.appendChild(wrap);
    }
    let season;
    try { season = seasonForDay(state.day); } catch (e) { season = { id: 'spring', label: '春' }; }
    const map = {
      spring: 'assets/ui/deco-spring-blossom.png',
      summer: 'assets/ui/deco-summer-sun.png',
      autumn: 'assets/ui/deco-autumn-leaf.png',
      winter: 'assets/ui/deco-winter-snow.png'
    };
    const src = map[season.id] || map.spring;
    let tod = { id: 'day' };
    try { tod = todForDay(state.day); } catch (e) {}
    const nightish = (tod.id === 'night' || tod.id === 'evening' || tod.label && (tod.label.indexOf('夜') >= 0 || tod.label.indexOf('晚') >= 0));
    wrap.innerHTML =
      '<img class="deco deco-season" src="' + src + '?v=' + ASSET_V + '" alt="' + (season.label || '') + '"/>' +
      '<img class="deco deco-fest-lantern" src="assets/icons/fest-lantern.png?v=' + ASSET_V + '" alt="燈籠"/>' +
      '<img class="deco deco-fest-ribbon" src="assets/icons/fest-ribbon.png?v=' + ASSET_V + '" alt="絲帶"/>' +
      '<img class="deco deco-fest-firework" src="assets/icons/fest-firework.png?v=' + ASSET_V + '" alt="煙花"/>' +
      (season.id === 'winter' ? '<img class="deco deco-winter" src="assets/ui/deco-winter-snow.png?v=' + ASSET_V + '" alt="冬雪"/>' : '') +
      (nightish ? '<img class="deco deco-night" src="assets/ui/deco-night-market.png?v=' + ASSET_V + '" alt="夜市"/>' : '') +
      '<img class="deco deco-starry" src="assets/ui/deco-starry.png?v=' + ASSET_V + '" alt="星空"/>' +
      '<img class="deco deco-onsen" src="assets/icons/onsen-steam.png?v=' + ASSET_V + '" alt="溫泉蒸汽"/>' +
      '<img class="deco deco-pillow" src="assets/icons/rest-pillow.png?v=' + ASSET_V + '" alt="枕頭"/>' +
      '<img class="deco deco-towel" src="assets/icons/hot-towel.png?v=' + ASSET_V + '" alt="熱毛巾"/>';
  }

  function renderEventBanner() {
    let el = document.getElementById('event-banner');
    if (!el) {
      const strip = document.getElementById('chapter-strip');
      const host = strip || document.querySelector('.top-bar');
      if (!host) return;
      el = document.createElement('div');
      el.id = 'event-banner';
      el.className = 'event-banner';
      host.insertAdjacentElement('afterend', el);
    }
    const bits = [];
    if (isFestivalDay()) {
      bits.push('<img class="ev-fest" src="assets/ui/event-banner-festival.png?v=' + ASSET_V + '" alt="節慶" title="節慶活動日"/>');
      bits.push('<img class="ev-fest-lantern" src="assets/ui/festival-lantern.png?v=' + ASSET_V + '" alt="燈籠" title="祭典燈籠"/>');
      bits.push('<img class="ev-fest-mask" src="assets/ui/festival-mask.png?v=' + ASSET_V + '" alt="面具" title="祭典面具"/>');
      bits.push('<img class="ev-music" src="assets/ui/music-note.png?v=' + ASSET_V + '" alt="音符" title="舞台音樂"/>');
      bits.push('<img class="ev-drum" src="assets/ui/drum-beat.png?v=' + ASSET_V + '" alt="鼓點" title="鼓點"/>');
      bits.push('<img class="ev-mic" src="assets/ui/mic-stage.png?v=' + ASSET_V + '" alt="咪" title="舞台咪"/>');
      bits.push('<img class="ev-fest-ico" src="assets/icons/fest-lantern.png?v=' + ASSET_V + '" alt="祭典燈" title="祭典燈籠圖示"/>');
      bits.push('<img class="ev-fest-ico" src="assets/icons/fest-ribbon.png?v=' + ASSET_V + '" alt="絲帶" title="祭典絲帶"/>');
      bits.push('<img class="ev-fest-ico" src="assets/icons/fest-firework.png?v=' + ASSET_V + '" alt="煙花" title="祭典煙花"/>');
    }
    try {
      const season = seasonForDay(state.day);
      const decoMap = {
        spring: 'assets/ui/deco-spring-blossom.png',
        summer: 'assets/ui/deco-summer-sun.png',
        autumn: 'assets/ui/deco-autumn-leaf.png',
        winter: 'assets/ui/deco-winter-snow.png'
      };
      if (decoMap[season.id]) {
        bits.push('<img class="ev-season-deco" src="' + decoMap[season.id] + '?v=' + ASSET_V + '" alt="' + season.label + '" title="季節裝飾·' + season.label + '"/>');
      }
    } catch (e) {}
    if (isDoubleRewardDay()) {
      bits.push('<img class="ev-double" src="assets/ui/event-banner-double.png?v=' + ASSET_V + '" alt="雙倍" title="委託報酬雙倍日"/>');
    }
    if (!bits.length) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = bits.join('');
    try { ensureSeasonDeco(); } catch (e) {}
  }

  function ensureTutorialSeen() {
    if (!state.tutorial) state.tutorial = { seenTap: false, seenDrag: false, seenHold: false };
  }
  function showTutorialTip(kind) {
    ensureTutorialSeen();
    const key = kind === 'tap' ? 'seenTap' : kind === 'drag' ? 'seenDrag' : 'seenHold';
    if (state.tutorial[key]) return;
    state.tutorial[key] = true;
    saveState();
    let tip = document.getElementById('tutorial-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'tutorial-tip';
      tip.className = 'tutorial-tip';
      document.getElementById('app').appendChild(tip);
    }
    const src = kind === 'tap' ? 'assets/ui/guide-hand-tap.png'
      : kind === 'drag' ? 'assets/ui/tip-drag.png'
      : 'assets/ui/tip-hold.png';
    const arrow = kind === 'drag' ? 'assets/ui/guide-arrow-down.png' : 'assets/ui/guide-arrow-up.png';
    const label = kind === 'tap' ? '輕觸選擇' : kind === 'drag' ? '拖曳編成' : '長按詳情';
    tip.innerHTML =
      '<img class="tip-arrow" src="' + arrow + '?v=' + ASSET_V + '" alt=""/>' +
      '<img class="tip-hand" src="assets/ui/guide-hand-tap.png?v=' + ASSET_V + '" alt=""/>' +
      '<img class="tip-ico" src="' + src + '?v=' + ASSET_V + '" alt="' + label + '"/>' +
      '<span>' + label + '</span>' +
      '<button type="button" class="tip-ok" id="tip-dismiss">知道了</button>';
    tip.hidden = false;
    const d = document.getElementById('tip-dismiss');
    if (d) d.onclick = () => { tip.hidden = true; };
    clearTimeout(showTutorialTip._t);
    showTutorialTip._t = setTimeout(() => { tip.hidden = true; }, 4200);
  }

  const QUEST_POOL = [
    {
      id: 'newcomerWelcome', source: 'guild', sourceLabel: '公會推薦', rarity: 'R',
      name: '新面孔歡迎巡邏', type: '日常', power: 70, minHeads: 2, special: '',
      reward: 160, place: '公會週邊',
      desc: '帶新到嘅冒險者巡一圈街坊，熟悉路線同櫃台規矩。',
      laneHero: 0, laneMonster: 1, monsterId: 'tutorialSlime', poster: 'assets/quests/poster-daily.png'
    },
    {
      id: 'knightTrial', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '女騎士入會試煉', type: '戰鬥', power: 280, minHeads: 3,
      special: '女騎士同行', reward: 640, place: '演武場',
      desc: '希琳想以騎士禮證明自己。請佢入會再一齊出征，成功率會穩陣啲。',
      laneHero: 0, laneMonster: 0, monsterId: 'ironKnight', poster: 'assets/quests/poster-goblin.png'
    },
    {
      id: 'witchBrewEscort', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR',
      name: '魔女試藥護衛', type: '護送', power: 300, minHeads: 3,
      special: '魔女同行', reward: 700, place: '藥草坡',
      desc: '薇爾要採稀有藥草試新咒藥，需要護衛同行——請魔女入會再接更穩。',
      laneHero: 0, laneMonster: 0, monsterId: 'herbSprite', poster: 'assets/quests/poster-herb.png'
    },
    {
      id: 'herb', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '森林藥草採集', type: '採集', power: 80, minHeads: 2, special: '',
      reward: 120, place: '西邊藥草林',
      desc: '採集新鮮治癒藥草 5 束。適合新人練手。',
      laneHero: 3, laneMonster: 5, monsterId: 'mushroom', poster: 'assets/quests/poster-herb.png'
    },
    {
      id: 'goblin', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '哥布林哨站清剿', type: '戰鬥', power: 220, minHeads: 3,
      special: '最少 1 前衛', reward: 480, place: '東邊森林邊緣',
      desc: '清剿綠帽哥布林哨站，帶回首領標記。',
      laneHero: 0, laneMonster: 0, monsterId: 'goblinChief', poster: 'assets/quests/poster-goblin.png'
    },
    {
      id: 'starfall', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '星落遺跡封印', type: '討伐地區王', power: 900, minHeads: 5,
      special: '最少 2 前衛＋1 法師', reward: 3200, place: '星落遺跡深層',
      desc: '封印暴走嘅地區王「星落石像」。精銳隊伍限定。',
      laneHero: 1, laneMonster: 6, monsterId: 'mimic', poster: 'assets/quests/poster-chest.png'
    },
    {
      id: 'slime', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '史萊姆淤泥清理', type: '清掃', power: 60, minHeads: 2, special: '',
      reward: 90, place: '下水道入口',
      desc: '清理堵塞渠道嘅史萊姆群，帶回黏液樣本。',
      laneHero: 2, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-slime.png'
    },
    {
      id: 'escort', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '商隊護送到鎮', type: '護送', power: 260, minHeads: 3,
      special: '最少 1 前衛', reward: 520, place: '南邊商道',
      desc: '護送香料商隊過狼群出沒嘅商道。',
      laneHero: 4, laneMonster: 4, monsterId: 'wolf', poster: 'assets/quests/poster-escort.png'
    },
    {
      id: 'bee', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '巨蜂巢採蜜', type: '採集', power: 110, minHeads: 2, special: '',
      reward: 150, place: '陽光草原',
      desc: '採集野生巨蜂巢蜜，小心刺針。',
      laneHero: 3, laneMonster: 7, monsterId: 'bee', poster: 'assets/quests/poster-slime.png'
    },
    {
      id: 'crystal', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '水晶洞窟調查', type: '探索', power: 640, minHeads: 4,
      special: '最少 1 前衛', reward: 1800, place: '北嶺水晶洞',
      desc: '調查發光水晶異常共振，帶回樣本。',
      laneHero: 1, laneMonster: 8, monsterId: 'crystal', poster: 'assets/quests/poster-crystal.png'
    },
    {
      id: 'rat', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '糧倉滅鼠', type: '清掃', power: 70, minHeads: 2, special: '',
      reward: 100, place: '公會後倉',
      desc: '消滅偷糧嘅巨大老鼠，保護冬糧。',
      laneHero: 5, laneMonster: 9, monsterId: 'ratking', poster: 'assets/quests/poster-goblin.png'
    },
    {
      id: 'rescue', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR',
      name: '迷路旅人救援', type: '救援', power: 280, minHeads: 3,
      special: '最少 1 前衛', reward: 550, place: '迷霧林道',
      desc: '救出被毒蛇困住嘅旅人，帶回公會。',
      laneHero: 2, laneMonster: 0, monsterId: 'snake', poster: 'assets/quests/poster-rescue.png'
    },
    {
      id: 'haunt', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '廢祠驅靈', type: '討伐', power: 700, minHeads: 4,
      special: '最少 1 前衛', reward: 2000, place: '山脊廢祠',
      desc: '淨化盤據廢祠嘅幽靈，帶回鎮魂鈴。',
      laneHero: 1, laneMonster: 0, monsterId: 'wraith', poster: 'assets/quests/poster-ghost.png'
    },
    {
      id: 'spiderNest', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '蛛網洞窟清掃', type: '戰鬥', power: 310, minHeads: 3,
      special: '最少 1 前衛', reward: 580, place: '蛛網洞窟',
      desc: '清剿盤據洞窟嘅巨蛛，帶回蛛絲。',
      laneHero: 4, laneMonster: 0, monsterId: 'spider', poster: 'assets/quests/poster-spider.png'
    },
    {
      id: 'frogPond', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '毒蛙池調查', type: '採集', power: 95, minHeads: 2, special: '',
      reward: 130, place: '霧沼池邊',
      desc: '採集毒蛙黏液樣本，記得帶解毒劑。',
      laneHero: 3, laneMonster: 0, monsterId: 'frog', poster: 'assets/quests/poster-herb.png'
    },
    {
      id: 'impRaid', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR',
      name: '小惡魔搗亂驅除', type: '戰鬥', power: 340, minHeads: 3,
      special: '最少 1 前衛', reward: 620, place: '後巷倉庫',
      desc: '趕走偷物資嘅小惡魔群。',
      laneHero: 4, laneMonster: 0, monsterId: 'imp', poster: 'assets/quests/poster-imp.png'
    },
    {
      id: 'golemGate', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '石門魔像鎮壓', type: '討伐', power: 820, minHeads: 5,
      special: '最少 2 前衛＋1 法師', reward: 2800, place: '古代石門',
      desc: '鎮壓守護石門嘅石魔像，取回核心碎片。',
      laneHero: 5, laneMonster: 0, monsterId: 'golem', poster: 'assets/quests/poster-golem.png'
    },
    {
      id: 'dailyPatrol', source: 'guild', sourceLabel: '每日委託', rarity: 'R',
      name: '公會週邊巡邏', type: '日常', power: 50, minHeads: 2, special: '',
      reward: 80, place: '公會外圍',
      desc: '每日例行巡邏，適合熱身。',
      laneHero: 0, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-daily.png'
    },
    {
      id: 'jellyClear', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '果凍怪黏液回收', type: '清掃', power: 85, minHeads: 2, special: '',
      reward: 110, place: '甜點工房後巷',
      desc: '回收失控嘅果凍怪，唔好被黏住。',
      laneHero: 2, laneMonster: 0, monsterId: 'jelly', poster: 'assets/quests/poster-jelly.png'
    },
    {
      id: 'crowNest', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '鐘樓巨鴉驅趕', type: '戰鬥', power: 290, minHeads: 3,
      special: '最少 1 前衛', reward: 540, place: '舊鐘樓頂',
      desc: '趕走盤據鐘樓嘅巨鴉，保護信鴿。',
      laneHero: 3, laneMonster: 0, monsterId: 'crow', poster: 'assets/quests/poster-crow.png'
    },
    {
      id: 'rankExam', source: 'guild', sourceLabel: '公會考核', rarity: 'SR',
      name: '段位晉升試煉', type: '考核', power: 350, minHeads: 3,
      special: '最少 1 前衛', reward: 700, place: '試煉場',
      desc: '通過公會段位考核，提升聲譽評價。',
      laneHero: 0, laneMonster: 0, monsterId: 'goblinChief', poster: 'assets/quests/poster-rank.png'
    },
    {
      id: 'crabShore', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '岸邊巨蟹驅趕', type: '戰鬥', power: 130, minHeads: 2, special: '',
      reward: 160, place: '南岸沙灘',
      desc: '驅趕佔據漁網嘅巨蟹。',
      laneHero: 5, laneMonster: 0, monsterId: 'crab', poster: 'assets/quests/poster-crab.png'
    },
    {
      id: 'plantGrove', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '食人花林清理', type: '討伐', power: 400, minHeads: 3,
      special: '最少 1 前衛', reward: 680, place: '毒霧樹叢',
      desc: '砍掉擋住商道嘅食人花。',
      laneHero: 4, laneMonster: 0, monsterId: 'plant', poster: 'assets/quests/poster-plant.png'
    },
    {
      id: 'bossSlimeRaid', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '史萊姆王討伐', type: '討伐地區王', power: 880, minHeads: 5,
      special: '最少 2 前衛＋1 法師', reward: 3500, place: '黏液王座',
      desc: '討伐巨大史萊姆王，帶回核心凝膠。',
      laneHero: 1, laneMonster: 0, monsterId: 'bossSlime', poster: 'assets/quests/poster-boss-slime.png'
    },
    {
      id: 'owlTower', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR',
      name: '鐘樓夜梟監視', type: '探索', power: 270, minHeads: 3,
      special: '最少 1 前衛', reward: 500, place: '北塔簷口',
      desc: '驅趕夜梟，保護鐘樓夜間哨兵。',
      laneHero: 3, laneMonster: 0, monsterId: 'owl', poster: 'assets/quests/poster-owl.png'
    },
    {
      id: 'nightWatch', source: 'guild', sourceLabel: '夜間委託', rarity: 'SR',
      name: '夜間城牆巡邏', type: '巡邏', power: 240, minHeads: 3,
      special: '最少 1 前衛', reward: 460, place: '東城牆',
      desc: '夜間巡邏城牆，提防宵小。',
      laneHero: 0, laneMonster: 3, monsterId: 'bat', poster: 'assets/quests/poster-night.png'
    },
    {
      id: 'fishPier', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '碼頭巨魚驅趕', type: '戰鬥', power: 140, minHeads: 2, special: '',
      reward: 170, place: '南碼頭',
      desc: '趕走咬破漁網嘅巨魚。',
      laneHero: 5, laneMonster: 0, monsterId: 'fish', poster: 'assets/quests/poster-fish.png'
    },
    {
      id: 'moleTunnel', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '田地鼴鼠清剿', type: '清掃', power: 300, minHeads: 3,
      special: '最少 1 前衛', reward: 560, place: '東郊農田',
      desc: '清剿挖穿田埂嘅鼴鼠巢。',
      laneHero: 4, laneMonster: 0, monsterId: 'mole', poster: 'assets/quests/poster-mole.png'
    },
    {
      id: 'shopRun', source: 'request', sourceLabel: '商店委託', rarity: 'R',
      name: '雜貨進貨護送', type: '護送', power: 100, minHeads: 2, special: '',
      reward: 140, place: '市場街',
      desc: '護送商店進貨馬車，小心路霸。',
      laneHero: 0, laneMonster: 0, monsterId: 'goblinChief', poster: 'assets/quests/poster-shop.png'
    },
    {
      id: 'turtleBay', source: 'request', sourceLabel: '冒險者要求', rarity: 'R',
      name: '淺灣甲龜調查', type: '探索', power: 120, minHeads: 2, special: '',
      reward: 150, place: '淺灣礁石',
      desc: '調查擱淺甲龜，帶回殼片樣本。',
      laneHero: 5, laneMonster: 0, monsterId: 'turtle', poster: 'assets/quests/poster-fish.png'
    },
    {
      id: 'fairyGlade', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '妖精林交涉', type: '交涉', power: 280, minHeads: 3,
      special: '最少 1 前衛', reward: 580, place: '螢光妖精林',
      desc: '同任性妖精談判，取回被借走嘅公會印章。',
      laneHero: 1, laneMonster: 0, monsterId: 'fairy', poster: 'assets/quests/poster-herb.png'
    },
    {
      id: 'dragonNest', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '幼龍巢穴試探', type: '討伐地區王', power: 950, minHeads: 5,
      special: '最少 2 前衛＋1 法師', reward: 4000, place: '熔岩山麓',
      desc: '試探幼龍巢穴，帶回鱗片（極危）。',
      laneHero: 1, laneMonster: 0, monsterId: 'dragonBaby', poster: 'assets/quests/poster-dragon.png'
    },
    {
      id: 'unicornGlade', source: 'guild', sourceLabel: '公會推薦', rarity: 'UR',
      name: '獨角獸聖域邂逅', type: '探索', power: 700, minHeads: 4,
      special: '最少 1 前衛', reward: 2500, place: '月光聖域',
      desc: '喺聖域見證獨角獸，帶回銀鬃。',
      laneHero: 2, laneMonster: 0, monsterId: 'unicorn', poster: 'assets/quests/poster-unicorn.png'
    },
    {
      id: 'feastNight', source: 'guild', sourceLabel: '公會盛宴', rarity: 'SR',
      name: '豐收祭料理募集', type: '採集', power: 180, minHeads: 3,
      special: '最少 1 前衛', reward: 520, place: '公會食堂',
      desc: '為豐收祭募集燉菜同甜品材料。',
      laneHero: 2, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-feast.png'
    },
    {
      id: 'phoenixPeak', source: 'guild', sourceLabel: '公會推薦', rarity: 'UR', element: 'fire',
      name: '鳳凰峰試煉', type: '討伐地區王', power: 980, minHeads: 5,
      special: '最少 2 前衛＋1 法師', reward: 4500, place: '焚天峰',
      desc: '直面浴火鳳凰，帶回餘燼羽毛。',
      laneHero: 1, laneMonster: 0, monsterId: 'phoenix', poster: 'assets/quests/poster-phoenix.png'
    },
    {
      id: 'yetiRidge', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'water',
      name: '雪嶺雪人蹤跡', type: '探索', power: 760, minHeads: 4,
      special: '最少 1 前衛', reward: 2800, place: '北境雪嶺',
      desc: '追蹤雪人足跡，帶回冰晶毛。',
      laneHero: 5, laneMonster: 0, monsterId: 'yeti', poster: 'assets/quests/poster-yeti.png'
    },
    {
      id: 'petBond', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR', element: 'light',
      name: '寵物同行馴養', type: '探索', power: 280, minHeads: 2,
      special: '', reward: 540, place: '公會後院牧場',
      desc: '協助馴養同行寵物，帶回親和徽章。',
      laneHero: 4, laneMonster: 6, monsterId: 'fairy', poster: 'assets/quests/poster-pet.png'
    },
    {
      id: 'beeQueenHive', source: 'guild', sourceLabel: '公會推薦', rarity: 'UR', element: 'earth',
      name: '蜂后巢穴討伐', type: '討伐地區王', power: 920, minHeads: 5,
      special: '最少 2 前衛＋1 弓手', reward: 4200, place: '黃金蜜巢',
      desc: '清剿蜂后王座，帶回皇家蜜核。極高難度。',
      laneHero: 3, laneMonster: 0, monsterId: 'beeQueen', poster: 'assets/quests/poster-bee-queen.png'
    },
    {
      id: 'shadowCrypt', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'dark',
      name: '暗影地窖淨化', type: '戰鬥', power: 720, minHeads: 4,
      special: '最少 1 前衛＋1 法師', reward: 2600, place: '無光地窖',
      desc: '淨化暗屬影子怪，帶回影布碎片。',
      laneHero: 1, laneMonster: 0, monsterId: 'shadow', poster: 'assets/quests/poster-shadow.png'
    },
    {
      id: 'trainYard', source: 'guild', sourceLabel: '公會推薦', rarity: 'R',
      name: '訓練場特訓', type: '探索', power: 140, minHeads: 2,
      special: '', reward: 220, place: '公會訓練場', element: 'earth',
      desc: '啞鈴、靶子同木人樁特訓，帶回訓練證明。',
      laneHero: 0, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-train.png'
    },
    {
      id: 'fallenKnight', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR',
      name: '墮騎走廊', type: '戰鬥', power: 700, minHeads: 4,
      special: '最少 1 前衛', reward: 2400, place: '銀盔走廊', element: 'light',
      desc: '討伐墮落騎士，帶回碎裂徽章。',
      laneHero: 0, laneMonster: 0, monsterId: 'knight', poster: 'assets/quests/poster-knight.png'
    },
    {
      id: 'witchHut', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR',
      name: '沼地女巫小屋', type: '戰鬥', power: 480, minHeads: 3,
      special: '最少 1 法師', reward: 980, place: '霧沼小屋', element: 'dark',
      desc: '調查女巫咒術，帶回咒符碎片。',
      laneHero: 1, laneMonster: 0, monsterId: 'witch', poster: 'assets/quests/poster-witch.png'
    },
    {
      id: 'partyDrill', source: 'guild', sourceLabel: '公會推薦', rarity: 'R',
      name: '隊伍編成演練', type: '探索', power: 160, minHeads: 3,
      special: '最少 3 人', reward: 260, place: '公會訓練場', element: 'wind',
      desc: '前後衛換位演練，帶回編成證明。練熟 swap 同隊長位。',
      laneHero: 0, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-party.png'
    },
    {
      id: 'angelSpire', source: 'guild', sourceLabel: '公會推薦', rarity: 'UR', element: 'light',
      name: '光輝天使尖塔', type: '戰鬥', power: 920, minHeads: 4,
      special: '最少 1 治療', reward: 3200, place: '雲上尖塔',
      desc: '討伐墮天餘燼化成嘅光翼使者，帶回光羽。',
      laneHero: 2, laneMonster: 0, monsterId: 'angel', poster: 'assets/quests/poster-angel.png'
    },
    {
      id: 'pumpkinPatch', source: 'request', sourceLabel: '季節活動', rarity: 'SSR', element: 'earth',
      name: '南瓜田夜襲', type: '戰鬥', power: 640, minHeads: 3,
      special: '最少 1 前衛', reward: 1600, place: '秋日南瓜田',
      desc: '季節限定：討伐暴走南瓜精，帶回燈籠籽。',
      laneHero: 4, laneMonster: 0, monsterId: 'pumpkin', poster: 'assets/quests/poster-pumpkin.png'
    },
    {
      id: 'rentNotice', source: 'guild', sourceLabel: '公會事務', rarity: 'R',
      name: '租金催繳巡迴', type: '探索', power: 120, minHeads: 1,
      special: '', reward: 180, place: '鎮內街道', element: 'wind',
      desc: '帶住租金單巡迴租戶，順便睇客人臉色。',
      laneHero: 3, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-rent.png'
    },
    {
      id: 'goldMimicVault', source: 'guild', sourceLabel: '公會推薦', rarity: 'UR', element: 'light',
      name: '金寶箱金庫', type: '戰鬥', power: 880, minHeads: 4,
      special: '最少 1 盜賊', reward: 3600, place: '地下金庫',
      desc: '傳說金庫有會咬人嘅金寶箱——高報酬高風險。',
      laneHero: 4, laneMonster: 0, monsterId: 'mimicGold', poster: 'assets/quests/poster-gold-mimic.png'
    },
    {
      id: 'slimeKingThrone', source: 'guild', sourceLabel: '公會推薦', rarity: 'UR', element: 'water',
      name: '史萊姆王寶座', type: '戰鬥', power: 860, minHeads: 4,
      special: '最少 1 法師', reward: 3400, place: '黏液王座',
      desc: '討伐史萊姆王，帶回王冠黏液。',
      laneHero: 1, laneMonster: 0, monsterId: 'slimeKing', poster: 'assets/quests/poster-slime-king.png'
    },
    {
      id: 'skillDrill', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '技能特訓課', type: '探索', power: 280, minHeads: 2,
      special: '', reward: 520, place: '公會道場', element: 'wind',
      desc: '練習斬擊／火球／治療等技能，帶回特訓證書。',
      laneHero: 0, laneMonster: 1, monsterId: 'slime', poster: 'assets/quests/poster-skill.png'
    },
    {
      id: 'harpyCliff', source: 'request', sourceLabel: '冒險者要求', rarity: 'SSR', element: 'wind',
      name: '峭壁哈比群', type: '戰鬥', power: 620, minHeads: 3,
      special: '最少 1 弓手', reward: 1500, place: '風鳴峭壁',
      desc: '討伐哈比群，帶回羽毛披風碎片。',
      laneHero: 3, laneMonster: 0, monsterId: 'harpy', poster: 'assets/quests/poster-harpy.png'
    },
    {
      id: 'treantGrove', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'earth',
      name: '古樹人密林', type: '戰鬥', power: 680, minHeads: 3,
      special: '最少 1 前衛', reward: 1700, place: '千年密林',
      desc: '安撫暴走樹人，帶回世界樹芽。',
      laneHero: 5, laneMonster: 0, monsterId: 'treant', poster: 'assets/quests/poster-treant.png'
    },
    {
      id: 'voyageRoad', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'wind',
      name: '遠行商隊護送', type: '護送', power: 420, minHeads: 3,
      special: '最少 1 前衛', reward: 880, place: '南道驛站',
      desc: '護送商隊過橋出海，帶回旅行印章。馬車／船／橋路線。',
      laneHero: 0, laneMonster: 1, monsterId: 'goblinChief', poster: 'assets/quests/poster-voyage.png'
    },
    {
      id: 'mermaidCove', source: 'request', sourceLabel: '冒險者要求', rarity: 'SSR', element: 'water',
      name: '海灣人魚之歌', type: '探索', power: 640, minHeads: 3,
      special: '最少 1 治療', reward: 1800, place: '藍灣礁石',
      desc: '調查人魚歌聲的來源，帶回珍珠鱗片。',
      laneHero: 2, laneMonster: 0, monsterId: 'mermaid', poster: 'assets/quests/poster-mermaid.png'
    },
    {
      id: 'centaurPlains', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'earth',
      name: '平原半人馬試練', type: '戰鬥', power: 700, minHeads: 4,
      special: '最少 1 弓手', reward: 2100, place: '疾風草原',
      desc: '接受半人馬部族試練，帶回蹄印徽章。',
      laneHero: 3, laneMonster: 0, monsterId: 'centaur', poster: 'assets/quests/poster-centaur.png'
    },
    {
      id: 'fishJob', source: 'request', sourceLabel: '冒險者要求', rarity: 'R', element: 'water',
      name: '碼頭釣手打工', type: '採集', power: 160, minHeads: 1,
      special: '', reward: 280, place: '南碼頭',
      desc: '帶釣竿同魚餌去碼頭打工，帶回鮮魚同貝殼。',
      laneHero: 4, laneMonster: 1, monsterId: 'fish', poster: 'assets/quests/poster-fishjob.png'
    },
    {
      id: 'crocMarsh', source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'water',
      name: '沼地巨鱷清剿', type: '戰鬥', power: 740, minHeads: 4,
      special: '最少 1 前衛', reward: 2200, place: '黑泥沼澤',
      desc: '討伐沼地巨鱷，帶回堅韌鱗甲。',
      laneHero: 0, laneMonster: 0, monsterId: 'crocodile', poster: 'assets/quests/poster-fishjob.png'
    },
    {
      id: 'peacockGarden', source: 'request', sourceLabel: '季節活動', rarity: 'SR', element: 'wind',
      name: '花園孔雀騷動', type: '探索', power: 380, minHeads: 2,
      special: '', reward: 720, place: '貴族後花園',
      desc: '安撫暴走孔雀，帶回彩羽。',
      laneHero: 3, laneMonster: 0, monsterId: 'peacock', poster: 'assets/quests/poster-centaur.png'
    },
    {
      id: 'madChickRanch',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'R', element: 'earth',
      name: '牧場狂小雞',
      type: '戰鬥', power: 620, minHeads: 2,
      special: '帶飼料', reward: 1200, place: '牧場穀倉',
      desc: '牧場主請你打退狂小雞——帶回牛奶桶同羊毛。',
      laneHero: 0, laneMonster: 0, monsterId: 'madChick', poster: 'assets/quests/poster-daily.png'
    },
    {
      id: 'slimeFlaskBrew',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'water',
      name: '燒瓶史萊姆煉金戰',
      type: '戰鬥', power: 700, minHeads: 2,
      special: '帶研缽', reward: 1500, place: '煉金實驗室',
      desc: '煉金師請你打退燒瓶史萊姆——帶回藥草葉同空藥瓶。',
      laneHero: 0, laneMonster: 0, monsterId: 'slimeFlask', poster: 'assets/quests/poster-daily.png'
    },
    {
      id: 'riverFishCatch',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'water',
      name: '河魚垂釣戰',
      type: '採集', power: 680, minHeads: 2,
      special: '帶釣鉤', reward: 1400, place: '河岸釣點',
      desc: '釣客請你打退河魚——帶回藍魚同礦石塊。',
      laneHero: 0, laneMonster: 0, monsterId: 'riverFish', poster: 'assets/quests/poster-daily.png'
    },
    {
      id: 'calendarImpStamp',
      source: 'guild', sourceLabel: '每日委託', rarity: 'SR', element: 'fire',
      name: '日曆小鬼簽到戰',
      type: '日常', power: 720, minHeads: 2,
      special: '簽到連續', reward: 1600, place: '公會日曆堂',
      desc: '每日書記請你打退日曆小鬼——蓋印簽到攞禮盒。',
      laneHero: 0, laneMonster: 0, monsterId: 'calendarImp', poster: 'assets/quests/poster-daily.png'
    },
    {
      id: 'trophyKnightHall',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'light',
      name: '功勳堂獎盃騎士',
      type: '戰鬥', power: 760, minHeads: 3,
      special: '最少 1 前衛', reward: 2000, place: '功勳堂',
      desc: '成就書記請你挑戰獎盃騎士——帶回牌匾同史冊。',
      laneHero: 0, laneMonster: 0, monsterId: 'trophyKnight', poster: 'assets/quests/poster-gold-mimic.png'
    },
    {
      id: 'earthMoleBurrow',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'earth',
      name: '土丘土鼴鼠',
      type: '戰鬥', power: 460, minHeads: 2,
      special: '', reward: 840, place: '丘陵地底',
      desc: '地德魯伊請你帶回大地寶石——小心光飛蛾同暗鴉。',
      laneHero: 5, laneMonster: 0, monsterId: 'earthMole', poster: 'assets/quests/poster-herb.png'
    },
    {
      id: 'fireSpriteCrater',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'fire',
      name: '火口火焰精靈',
      type: '戰鬥', power: 480, minHeads: 2,
      special: '最少 1 法師', reward: 880, place: '熔岩火口',
      desc: '元素使請你帶回火焰寶石——小心水寧芙同風哈比。',
      laneHero: 1, laneMonster: 0, monsterId: 'fireSprite', poster: 'assets/quests/poster-skill.png'
    },
    {
      id: 'brickGolemYard',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'earth',
      name: '工地磚石魔像',
      type: '戰鬥', power: 520, minHeads: 3,
      special: '最少 1 前衛', reward: 900, place: '公會工地',
      desc: '建築師請你鎮壓磚石魔像——藍圖、房匙、店鈴備用。',
      laneHero: 0, laneMonster: 0, monsterId: 'brickGolem', poster: 'assets/quests/poster-voyage.png'
    },
    {
      id: 'snowmanYard',
      source: 'request', sourceLabel: '季節活動', rarity: 'SR', element: 'water',
      name: '冬夜雪人騷動',
      type: '探索', power: 360, minHeads: 2,
      special: '', reward: 700, place: '溫泉夜市',
      desc: '雪攤小販同溫泉侍者請你安撫雪人，順手睇燈籠魚。',
      laneHero: 2, laneMonster: 0, monsterId: 'snowman', poster: 'assets/quests/poster-voyage.png'
    },
    {
      id: 'blossomSpriteGrove',
      source: 'request', sourceLabel: '季節活動', rarity: 'SR', element: 'light',
      name: '春日花瓣精靈',
      type: '探索', power: 340, minHeads: 2,
      special: '', reward: 640, place: '花畑小徑',
      desc: '季節花匠請你帶回花瓣同楓葉，順手睇下太陽聖甲蟲。',
      laneHero: 3, laneMonster: 0, monsterId: 'blossomSprite', poster: 'assets/quests/poster-centaur.png'
    },
    {
      id: 'tutorialSlimeYard',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'R', element: 'water',
      name: '新手場教學史萊姆',
      type: '戰鬥', power: 90, minHeads: 1,
      special: '', reward: 160, place: '公會練習場',
      desc: '新手嚮導帶你打教學史萊姆——跟箭頭、撳手指就得。',
      laneHero: 3, laneMonster: 1, monsterId: 'tutorialSlime', poster: 'assets/quests/poster-herb.png'
    },
    {
      id: 'gearGolemWorkshop',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'earth',
      name: '工房齒輪魔像',
      type: '戰鬥', power: 500, minHeads: 2,
      special: '', reward: 860, place: '設定工房',
      desc: '設定管家請你調校齒輪魔像——帶扳手、耳罩、辭典。',
      laneHero: 5, laneMonster: 0, monsterId: 'gearGolem', poster: 'assets/quests/poster-skill.png'
    },
    {
      id: 'critBladeArena',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SSR', element: 'dark',
      name: '暴擊刃靈試練',
      type: '戰鬥', power: 720, minHeads: 3,
      special: '最少 1 前衛', reward: 1680, place: '競技道場',
      desc: '戰鬥教練請你挑戰暴擊刃靈——學會暴擊、治療同格擋。',
      laneHero: 0, laneMonster: 0, monsterId: 'critBlade', poster: 'assets/quests/poster-skill.png'
    },
    {
      id: 'bagMimicVault',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'dark',
      name: '倉庫背包擬態',
      type: '戰鬥', power: 460, minHeads: 2,
      special: '', reward: 780, place: '公會倉庫',
      desc: '背包女僕發現會咬人嘅背包——帶掛鎖同分類標籤清場。',
      laneHero: 4, laneMonster: 0, monsterId: 'bagMimic', poster: 'assets/quests/poster-chest.png'
    },
    {
      id: 'gateGolemWatch',
      source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'earth',
      name: '城門門扉魔像',
      type: '戰鬥', power: 480, minHeads: 3,
      special: '最少 1 前衛', reward: 820, place: '北城門',
      desc: '門衛請你安撫門扉魔像，帶回鑰匙圈同地圖圖釘。',
      laneHero: 0, laneMonster: 0, monsterId: 'gateGolem', poster: 'assets/quests/poster-voyage.png'
    },
    {
      id: 'wordWispTale', source: 'request', sourceLabel: '冒險者要求', rarity: 'SR', element: 'light',
      name: '說書台文字幽焰', type: '探索', power: 360, minHeads: 2,
      special: '', reward: 680, place: '公會說書台',
      desc: '說書人請你安撫文字幽焰，帶回墨跡卷軸同回聲羽毛。',
      laneHero: 2, laneMonster: 0, monsterId: 'wordWisp', poster: 'assets/quests/poster-skill.png'
    },
    {
      id: 'inkSlimeStudy', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR', element: 'dark',
      name: '書庫墨汁史萊姆', type: '戰鬥', power: 420, minHeads: 2,
      special: '最少 1 法師', reward: 760, place: '圖書館書庫',
      desc: '墨汁史萊姆沾污羊皮紙——帶墨壺同喇叭清場。',
      laneHero: 1, laneMonster: 0, monsterId: 'inkSlime', poster: 'assets/quests/poster-chest.png'
    },
    {
      id: 'echoParrotPlaza', source: 'request', sourceLabel: '季節活動', rarity: 'R', element: 'wind',
      name: '廣場回聲鸚鵡', type: '探索', power: 240, minHeads: 1,
      special: '', reward: 420, place: '中央廣場',
      desc: '八卦阿嬸話鸚鵡學人講大話——帶返安靜羽毛。',
      laneHero: 3, laneMonster: 0, monsterId: 'echoParrot', poster: 'assets/quests/poster-centaur.png'
    },
    {
      id: 'mimicHunt', source: 'guild', sourceLabel: '公會推薦', rarity: 'SR',
      name: '假寶箱狩獵', type: '戰鬥', power: 300, minHeads: 3,
      special: '最少 1 前衛', reward: 600, place: '廢棄倉庫',
      desc: '據說倉庫有會咬人嘅寶箱——小心！',
      laneHero: 4, laneMonster: 6, monsterId: 'mimic', poster: 'assets/quests/poster-chest.png'
    }
  ];
  /** 兼容舊 demo：初始板上三張 */
  const QUEST_DEFS = QUEST_POOL.slice(0, 3);

  const DUNGEON_ASSETS = {
    heroes: [
      { id: 'sword', src: 'assets/dungeon/hero-sword.png?v=1794068200', label: '劍士艾登' },
      { id: 'mage', src: 'assets/dungeon/hero-mage.png?v=1794068200', label: '法師路卡' },
      { id: 'healer', src: 'assets/dungeon/hero-healer.png?v=1794068200', label: '治療米莉' },
      { id: 'archer', src: 'assets/dungeon/hero-archer.png?v=1794068200', label: '弓手葵' },
      { id: 'rogue', src: 'assets/dungeon/hero-rogue.png?v=1794068200', label: '盜賊妮可' },
      { id: 'tank', src: 'assets/dungeon/hero-tank.png?v=1794068200', label: '盾衛蓋洛' },
      { id: 'bard', src: 'assets/dungeon/hero-bard.png?v=1794068200', label: '詩人里恩' },
      { id: 'spear', src: 'assets/dungeon/hero-spear.png?v=1794068200', label: '槍兵青葉' },
      { id: 'knight', src: 'assets/dungeon/hero-knight.png?v=1794068200', label: '女騎士希琳' },
      { id: 'witch', src: 'assets/dungeon/hero-witch.png?v=1794068200', label: '魔女薇爾' }
    ],
    monsters: [
      { id: 'goblin', src: 'assets/dungeon/monster-goblin.png?v=1794068200', label: '哥布林' },
      { id: 'slime', src: 'assets/dungeon/monster-slime.png?v=1794068200', label: '史萊姆' },
      { id: 'skeleton', src: 'assets/dungeon/monster-skeleton-r20.png?v=1794068200', label: '骷髏' },
      { id: 'bat', src: 'assets/dungeon/monster-bat-r20.png?v=1794068200', label: '蝙蝠' },
      { id: 'wolf', src: 'assets/dungeon/monster-wolf.png?v=1794068200', label: '狼' },
      { id: 'mushroom', src: 'assets/dungeon/monster-mushroom-r22.png?v=1794068200', label: '毒蘑菇' },
      { id: 'mimic', src: 'assets/dungeon/monster-mimic-r21.png?v=1794068200', label: '寶箱怪' },
      { id: 'bee', src: 'assets/dungeon/monster-bee-r23.png?v=1794068200', label: '巨蜂' },
      { id: 'crystal', src: 'assets/dungeon/monster-crystal.png?v=1794068200', label: '水晶怪' },
      { id: 'rat', src: 'assets/dungeon/monster-rat.png?v=1794068200', label: '巨鼠' },
      { id: 'ghost', src: 'assets/dungeon/monster-ghost.png?v=1794068200', label: '幽靈' },
      { id: 'snake', src: 'assets/dungeon/monster-snake.png?v=1794068200', label: '毒蛇' },
      { id: 'spider', src: 'assets/dungeon/monster-spider.png?v=1794068200', label: '巨蛛' },
      { id: 'frog', src: 'assets/dungeon/monster-frog.png?v=1794068200', label: '毒蛙' },
      { id: 'imp', src: 'assets/dungeon/monster-flameimp-r25.png?v=1794068200', label: '小惡魔' },
      { id: 'golem', src: 'assets/dungeon/monster-golem-r21.png?v=1794068200', label: '石魔像' },
      { id: 'jelly', src: 'assets/dungeon/monster-jelly.png?v=1794068200', label: '果凍怪' },
      { id: 'crow', src: 'assets/dungeon/monster-crow.png?v=1794068200', label: '巨鴉' },
      { id: 'crab', src: 'assets/dungeon/monster-crab.png?v=1794068200', label: '巨蟹' },
      { id: 'plant', src: 'assets/dungeon/monster-plant.png?v=1794068200', label: '食人花' },
      { id: 'bossSlime', src: 'assets/dungeon/monster-boss-slime.png?v=1794068200', label: '史萊姆王' },
      { id: 'owl', src: 'assets/dungeon/monster-owl-r25.png?v=1794068200', label: '夜梟' },
      { id: 'fish', src: 'assets/dungeon/monster-fish.png?v=1794068200', label: '巨魚' },
      { id: 'mole', src: 'assets/dungeon/monster-mole-r25.png?v=1794068200', label: '鼴鼠' },
      { id: 'turtle', src: 'assets/dungeon/monster-turtle-r23.png?v=1794068200', label: '甲龜' },
      { id: 'fairy', src: 'assets/dungeon/monster-fairy-r21.png?v=1794068200', label: '妖精' },
      { id: 'dragonBaby', src: 'assets/dungeon/monster-dragonling-r22.png?v=1794068200', label: '幼龍' },
      { id: 'unicorn', src: 'assets/dungeon/monster-unicorn-r30.png?v=1794068200', label: '獨角獸' },
      { id: 'phoenix', src: 'assets/dungeon/monster-phoenix-r29.png?v=1794068200', label: '鳳凰' },
      { id: 'yeti', src: 'assets/dungeon/monster-yeti-r28.png?v=1794068200', label: '雪人' },
      { id: 'beeQueen', src: 'assets/dungeon/monster-bee-queen.png?v=1794068200', label: '蜂后' },
      { id: 'shadow', src: 'assets/dungeon/monster-shadow-r22.png?v=1794068200', label: '暗影' },
      { id: 'knight', src: 'assets/dungeon/monster-knight.png?v=1794068200', label: '墮騎' },
      { id: 'witch', src: 'assets/dungeon/monster-witch.png?v=1794068200', label: '女巫' },
      { id: 'angel', src: 'assets/dungeon/monster-angel.png?v=1794068200', label: '光翼使者' },
      { id: 'pumpkin', src: 'assets/dungeon/monster-pumpkin.png?v=1794068200', label: '南瓜精' },
      { id: 'mimicGold', src: 'assets/dungeon/monster-mimic-gold.png?v=1794068200', label: '金寶箱怪' },
      { id: 'slimeKing', src: 'assets/dungeon/monster-slime-king-r20.png?v=1794068200', label: '史萊姆帝王' },
      { id: 'harpy', src: 'assets/dungeon/monster-harpy-r31.png?v=1794068200', label: '哈比' },
      { id: 'treant', src: 'assets/dungeon/monster-treant-r29.png?v=1794068200', label: '樹人' },
      { id: 'mermaid', src: 'assets/dungeon/monster-mermaid.png?v=1794068200', label: '人魚' },
      { id: 'centaur', src: 'assets/dungeon/monster-centaur.png?v=1794068200', label: '半人馬' },
      { id: 'crocodile', src: 'assets/dungeon/monster-crocodile.png?v=1794068200', label: '巨鱷' },
      { id: 'peacock', src: 'assets/dungeon/monster-peacock.png?v=1794068200', label: '孔雀' },
      { id: 'wraith', src: 'assets/dungeon/monster-wraith-r23.png?v=1794068200', label: '怨靈' },
      { id: 'boar', src: 'assets/dungeon/monster-boar-r24.png?v=1794068200', label: '野豬' },
      { id: 'serpent', src: 'assets/dungeon/monster-serpent-r24.png?v=1794068200', label: '巨蛇' },
      { id: 'gremlin', src: 'assets/dungeon/monster-gremlin-r24.png?v=1794068200', label: '小精靈怪' },
      { id: 'flameimp', src: 'assets/dungeon/monster-flameimp-r25.png?v=1794068200', label: '炎魔' },
      { id: 'cactus', src: 'assets/dungeon/monster-cactus-r26.png?v=1794068200', label: '仙人掌' },
      { id: 'penguin', src: 'assets/dungeon/monster-penguin-r26.png?v=1794068200', label: '企鵝' },
      { id: 'lich', src: 'assets/dungeon/monster-lich-r26.png?v=1794068200', label: '巫妖' },
      { id: 'ratking', src: 'assets/dungeon/monster-ratking-r27.png?v=1794068200', label: '鼠王' },
      { id: 'jellyfish', src: 'assets/dungeon/monster-jellyfish-r27.png?v=1794068200', label: '水母' },
      { id: 'gargoyle', src: 'assets/dungeon/monster-gargoyle-r27.png?v=1794068200', label: '石像鬼' },
      { id: 'scorpion', src: 'assets/dungeon/monster-scorpion-r28.png?v=1794068200', label: '蠍子' },
      { id: 'hydra', src: 'assets/dungeon/monster-hydra-r28.png?v=1794068200', label: '多頭蛇' },
      { id: 'kraken', src: 'assets/dungeon/monster-kraken-r29.png?v=1794068200', label: '克拉肯' },
      { id: 'cyclops', src: 'assets/dungeon/monster-cyclops-r30.png?v=1794068200', label: '獨眼巨人' },
      { id: 'mandrake', src: 'assets/dungeon/monster-mandrake-r30.png?v=1794068200', label: '曼陀羅' },
      { id: 'basilisk', src: 'assets/dungeon/monster-basilisk-r31.png?v=1794068200', label: '蛇蜥' },
      { id: 'goblinChief', src: 'assets/dungeon/monster-goblin-chief-r31.png?v=1794068200', label: '哥布林酋長' },
      { id: 'chimera', src: 'assets/dungeon/monster-chimera-r32.png?v=1794068200', label: '奇美拉' },
      { id: 'naga', src: 'assets/dungeon/monster-naga-r32.png?v=1794068200', label: '娜迦' },
      { id: 'skeletonKing', src: 'assets/dungeon/monster-skeleton-king-r32.png?v=1794068200', label: '骷髏王' },
      { id: 'minotaur', src: 'assets/dungeon/monster-minotaur-r33.png?v=1794068200', label: '牛頭人' },
      { id: 'dryad', src: 'assets/dungeon/monster-dryad-r33.png?v=1794068200', label: '樹精' },
      { id: 'slimeQueen', src: 'assets/dungeon/monster-slime-queen-r33.png?v=1794068200', label: '史萊姆女王' },
      { id: 'beholder', src: 'assets/dungeon/monster-beholder-r34.png?v=1794068200', label: '眼魔' },
      { id: 'kitsune', src: 'assets/dungeon/monster-kitsune-r34.png?v=1794068200', label: '妖狐' },
      { id: 'ironGolem', src: 'assets/dungeon/monster-iron-golem-r34.png?v=1794068200', label: '鐵魔像' },
      { id: 'cerberus', src: 'assets/dungeon/monster-cerberus-r35.png?v=1794068200', label: '地獄犬' },
      { id: 'siren', src: 'assets/dungeon/monster-siren-r35.png?v=1794068200', label: '海妖' },
      { id: 'troll', src: 'assets/dungeon/monster-troll-r35.png?v=1794068200', label: '巨魔' },
      { id: 'dragonAdult', src: 'assets/dungeon/monster-dragon-adult-r36.png?v=1794068200', label: '成年龍' },
      { id: 'mummy', src: 'assets/dungeon/monster-mummy-r36.png?v=1794068200', label: '木乃伊' },
      { id: 'pixie', src: 'assets/dungeon/monster-pixie-r36.png?v=1794068200', label: '小仙子' },
      { id: 'wyvern', src: 'assets/dungeon/monster-wyvern-r37.png?v=1794068200', label: '飛龍' },
      { id: 'kobold', src: 'assets/dungeon/monster-kobold-r37.png?v=1794068200', label: '狗頭人' },
      { id: 'angelFallen', src: 'assets/dungeon/monster-angel-fallen-r37.png?v=1794068200', label: '墮天使' },
      { id: 'leviathan', src: 'assets/dungeon/monster-leviathan-r38.png?v=1794068200', label: '利維坦' },
      { id: 'homunculus', src: 'assets/dungeon/monster-homunculus-r38.png?v=1794068200', label: '人造人' },
      { id: 'werewolf', src: 'assets/dungeon/monster-werewolf-r38.png?v=1794068200', label: '狼人' },
      { id: 'griffin', src: 'assets/dungeon/monster-griffin-r39.png?v=1794068200', label: '獅鷲' },
      { id: 'zombie', src: 'assets/dungeon/monster-zombie-r39.png?v=1794068200', label: '殭屍' },
      { id: 'salamander', src: 'assets/dungeon/monster-salamander-r39.png?v=1794068200', label: '火蜥蜴' },
      { id: 'bahamut', src: 'assets/dungeon/monster-bahamut-r40.png?v=1794068200', label: '巴哈姆特' },
      { id: 'impLord', src: 'assets/dungeon/monster-imp-lord-r40.png?v=1794068200', label: '魔王小鬼' },
      { id: 'mossSlime', src: 'assets/dungeon/monster-moss-slime-r40.png?v=1794068200', label: '苔蘚史萊姆' },
      { id: 'earthElemental', src: 'assets/dungeon/monster-earth-elemental-r41.png?v=1794068200', label: '土元素' },
      { id: 'frostSpider', src: 'assets/dungeon/monster-frost-spider-r41.png?v=1794068200', label: '霜蛛' },
      { id: 'thunderBird', src: 'assets/dungeon/monster-thunder-bird-r41.png?v=1794068200', label: '雷鳥' },
      { id: 'crystalGolem', src: 'assets/dungeon/monster-crystal-golem-r42.png?v=1794068200', label: '水晶魔像' },
      { id: 'poisonFrog', src: 'assets/dungeon/monster-poison-frog-r42.png?v=1794068200', label: '毒蛙' },
      { id: 'shadowCat', src: 'assets/dungeon/monster-shadow-cat-r42.png?v=1794068200', label: '影貓' },
      { id: 'lavaSlug', src: 'assets/dungeon/monster-lava-slug-r43.png?v=1794068200', label: '熔岩蛞蝓' },
      { id: 'iceWolf', src: 'assets/dungeon/monster-ice-wolf-r43.png?v=1794068200', label: '冰狼' },
      { id: 'windSprite', src: 'assets/dungeon/monster-wind-sprite-r43.png?v=1794068200', label: '風精靈' },
      { id: 'stoneTurtle', src: 'assets/dungeon/monster-stone-turtle-r44.png?v=1794068200', label: '石龜' },
      { id: 'flameImp', src: 'assets/dungeon/monster-flame-imp-r44.png?v=1794068200', label: '炎小鬼' },
      { id: 'mistWraith', src: 'assets/dungeon/monster-mist-wraith-r44.png?v=1794068200', label: '霧幽靈' },
      { id: 'sandScorpion', src: 'assets/dungeon/monster-sand-scorpion-r45.png?v=1794068200', label: '沙蠍' },
      { id: 'coralCrab', src: 'assets/dungeon/monster-coral-crab-r45.png?v=1794068200', label: '珊瑚蟹' },
      { id: 'thunderBoar', src: 'assets/dungeon/monster-thunder-boar-r45.png?v=1794068200', label: '雷野豬' },
      { id: 'vineSnake', src: 'assets/dungeon/monster-vine-snake-r46.png?v=1794068200', label: '藤蛇' },
      { id: 'caveBatking', src: 'assets/dungeon/monster-cave-batking-r46.png?v=1794068200', label: '洞窟蝠王' },
      { id: 'ruinGolem', src: 'assets/dungeon/monster-ruin-golem-r46.png?v=1794068200', label: '遺跡魔像' },
      { id: 'jellyBlob', src: 'assets/dungeon/monster-jelly-blob-r47.png?v=1794068200', label: '果凍怪' },
      { id: 'mushroomSpore', src: 'assets/dungeon/monster-mushroom-spore-r47.png?v=1794068200', label: '蘑菇孢子' },
      { id: 'candyMimic', src: 'assets/dungeon/monster-candy-mimic-r47.png?v=1794068200', label: '糖果擬態' },
      { id: 'ironKnight', src: 'assets/dungeon/monster-iron-knight-r48.png?v=1794068200', label: '鐵騎士' },
      { id: 'armorMimic', src: 'assets/dungeon/monster-armor-mimic-r48.png?v=1794068200', label: '鎧甲擬態' },
      { id: 'gemSprite', src: 'assets/dungeon/monster-gem-sprite-r48.png?v=1794068200', label: '寶石精靈' },
      { id: 'banditChief', src: 'assets/dungeon/monster-bandit-chief-r49.png?v=1794068200', label: '盜賊首領' },
      { id: 'darkMage', src: 'assets/dungeon/monster-dark-mage-r49.png?v=1794068200', label: '黑魔導' },
      { id: 'plagueRat', src: 'assets/dungeon/monster-plague-rat-r49.png?v=1794068200', label: '瘟疫鼠' },
      { id: 'paperGolem', src: 'assets/dungeon/monster-paper-golem-r50.png?v=1794068200', label: '紙魔像' },
      { id: 'bellSpirit', src: 'assets/dungeon/monster-bell-spirit-r50.png?v=1794068200', label: '鐘靈' },
      { id: 'festivalMask', src: 'assets/dungeon/monster-festival-mask-r50.png?v=1794068200', label: '祭典面具怪' },
      { id: 'scarecrow', src: 'assets/dungeon/monster-scarecrow-r51.png?v=1794068200', label: '稻草人' },
      { id: 'rainSlime', src: 'assets/dungeon/monster-rain-slime-r51.png?v=1794068200', label: '雨史萊姆' },
      { id: 'frostHare', src: 'assets/dungeon/monster-frost-hare-r51.png?v=1794068200', label: '霜兔' },
      { id: 'feralHound', src: 'assets/dungeon/monster-feral-hound-r52.png?v=1794068200', label: '野犬' },
      { id: 'strayCat', src: 'assets/dungeon/monster-stray-cat-r52.png?v=1794068200', label: '流浪貓' },
      { id: 'petMimic', src: 'assets/dungeon/monster-pet-mimic-r52.png?v=1794068200', label: '寵物擬態' },
      { id: 'echoBanshee', src: 'assets/dungeon/monster-echo-banshee-r53.png?v=1794068200', label: '回音報喪女妖' },
      { id: 'drumGolem', src: 'assets/dungeon/monster-drum-golem-r53.png?v=1794068200', label: '鼓魔像' },
      { id: 'curtainMimic', src: 'assets/dungeon/monster-curtain-mimic-r53.png?v=1794068200', label: '幕簾擬態' },
      { id: 'riverSerpent', src: 'assets/dungeon/monster-river-serpent-r54.png?v=1794068200', label: '河蛇' },
      { id: 'roadBandit', src: 'assets/dungeon/monster-road-bandit-r54.png?v=1794068200', label: '路匪' },
      { id: 'skyPiranha', src: 'assets/dungeon/monster-sky-piranha-r54.png?v=1794068200', label: '飛天食人魚' },
      { id: 'treasureMimic', src: 'assets/dungeon/monster-treasure-mimic-r55.png?v=1794068200', label: '寶箱擬態' },
      { id: 'goldBeetle', src: 'assets/dungeon/monster-gold-beetle-r55.png?v=1794068200', label: '金甲蟲' },
      { id: 'jewelDrake', src: 'assets/dungeon/monster-jewel-drake-r55.png?v=1794068200', label: '珠寶幼龍' },
      { id: 'clockworkOwl', src: 'assets/dungeon/monster-clockwork-owl-r56.png?v=1794068200', label: '發條貓頭鷹' },
      { id: 'shadowBat', src: 'assets/dungeon/monster-shadow-bat-r56.png?v=1794068200', label: '影蝠' },
      { id: 'ledgerGolem', src: 'assets/dungeon/monster-ledger-golem-r56.png?v=1794068200', label: '帳簿魔像' },
      { id: 'bladeWraith', src: 'assets/dungeon/monster-blade-wraith-r57.png?v=1794068200', label: '刀刃怨靈' },
      { id: 'healMimic', src: 'assets/dungeon/monster-heal-mimic-r57.png?v=1794068200', label: '治療擬態' },
      { id: 'barrierGolem', src: 'assets/dungeon/monster-barrier-golem-r57.png?v=1794068200', label: '結界魔像' },
      { id: 'poisonToad', src: 'assets/dungeon/monster-poison-toad-r58.png?v=1794068200', label: '毒蟾蜍' },
      { id: 'emberFox', src: 'assets/dungeon/monster-ember-fox-r58.png?v=1794068200', label: '餘燼狐' },
      { id: 'frostCrab', src: 'assets/dungeon/monster-frost-crab-r58.png?v=1794068200', label: '霜蟹' },
      { id: 'arenaChamp', src: 'assets/dungeon/monster-arena-champ-r59.png?v=1794068200', label: '競技場冠軍' },
      { id: 'trophyMimic', src: 'assets/dungeon/monster-trophy-mimic-r59.png?v=1794068200', label: '獎盃擬態' },
      { id: 'fanSpirit', src: 'assets/dungeon/monster-fan-spirit-r59.png?v=1794068200', label: '粉絲精靈' },
      { id: 'wordWisp', src: 'assets/dungeon/monster-word-wisp-r60.png?v=1794068200', label: '文字幽焰' },
      { id: 'inkSlime', src: 'assets/dungeon/monster-ink-slime-r60.png?v=1794068200', label: '墨汁史萊姆' },
      { id: 'echoParrot', src: 'assets/dungeon/monster-echo-parrot-r60.png?v=1794068200', label: '回聲鸚鵡' },
      { id: 'gateGolem', src: 'assets/dungeon/monster-gate-golem-r61.png?v=1794068200', label: '門扉魔像' },
      { id: 'crateMimic', src: 'assets/dungeon/monster-crate-mimic-r61.png?v=1794068200', label: '木箱擬態' },
      { id: 'compassWisp', src: 'assets/dungeon/monster-compass-wisp-r61.png?v=1794068200', label: '羅盤幽焰' },
      { id: 'bagMimic', src: 'assets/dungeon/monster-bag-mimic-r62.png?v=1794068200', label: '背包擬態' },
      { id: 'lockSpecter', src: 'assets/dungeon/monster-lock-specter-r62.png?v=1794068200', label: '鎖靈幽靈' },
      { id: 'coinSwarm', src: 'assets/dungeon/monster-coin-swarm-r62.png?v=1794068200', label: '金幣蟲群' },
      { id: 'critBlade', src: 'assets/dungeon/monster-crit-blade-r63.png?v=1794068200', label: '暴擊刃靈' },
      { id: 'healBloom', src: 'assets/dungeon/monster-heal-bloom-r63.png?v=1794068200', label: '治療花苞' },
      { id: 'shieldTurtle', src: 'assets/dungeon/monster-shield-turtle-r63.png?v=1794068200', label: '盾甲巨龜' },
      { id: 'gearGolem', src: 'assets/dungeon/monster-gear-golem-r64.png?v=1794068200', label: '齒輪魔像' },
      { id: 'noiseImp', src: 'assets/dungeon/monster-noise-imp-r64.png?v=1794068200', label: '噪音小惡魔' },
      { id: 'scrollWraith', src: 'assets/dungeon/monster-scroll-wraith-r64.png?v=1794068200', label: '卷軸怨靈' },
      { id: 'emptyChest', src: 'assets/dungeon/monster-empty-chest-r65.png?v=1794068200', label: '空箱怪' },
      { id: 'arrowImp', src: 'assets/dungeon/monster-arrow-imp-r65.png?v=1794068200', label: '箭頭小惡魔' },
      { id: 'tutorialSlime', src: 'assets/dungeon/monster-tutorial-slime-r65.png?v=1794068200', label: '教學史萊姆' },
      { id: 'blossomSprite', src: 'assets/dungeon/monster-blossom-sprite-r66.png?v=1794068200', label: '花瓣精靈' },
      { id: 'sunScarab', src: 'assets/dungeon/monster-sun-scarab-r66.png?v=1794068200', label: '太陽聖甲蟲' },
      { id: 'leafWyrm', src: 'assets/dungeon/monster-leaf-wyrm-r66.png?v=1794068200', label: '楓葉幼龍' },
      { id: 'snowman', src: 'assets/dungeon/monster-snowman-r67.png?v=1794068200', label: '雪人' },
      { id: 'lanternFish', src: 'assets/dungeon/monster-lantern-fish-r67.png?v=1794068200', label: '燈籠魚' },
      { id: 'steamSpirit', src: 'assets/dungeon/monster-steam-spirit-r67.png?v=1794068200', label: '蒸汽精魂' },
      { id: 'brickGolem', src: 'assets/dungeon/monster-brick-golem-r68.png?v=1794068200', label: '磚石魔像' },
      { id: 'bedMimic', src: 'assets/dungeon/monster-bed-mimic-r68.png?v=1794068200', label: '床鋪擬態' },
      { id: 'priceTagImp', src: 'assets/dungeon/monster-price-tag-imp-r68.png?v=1794068200', label: '價錢牌小惡魔' },
      { id: 'fireSprite', src: 'assets/dungeon/monster-fire-sprite-r69.png?v=1794068200', label: '火焰精靈' },
      { id: 'waterNymph', src: 'assets/dungeon/monster-water-nymph-r69.png?v=1794068200', label: '水之寧芙' },
      { id: 'windHarpy', src: 'assets/dungeon/monster-wind-harpy-r69.png?v=1794068200', label: '風哈比' },
      { id: 'earthMole', src: 'assets/dungeon/monster-earth-mole-r70.png?v=1794068200', label: '土鼴鼠' },
      { id: 'lightMoth', src: 'assets/dungeon/monster-light-moth-r70.png?v=1794068200', label: '光飛蛾' },
      { id: 'darkRaven', src: 'assets/dungeon/monster-dark-raven-r70.png?v=1794068200', label: '暗鴉' },
      { id: 'trophyKnight', src: 'assets/dungeon/monster-trophy-knight-r71.png?v=1794068200', label: '獎盃騎士' },
      { id: 'coinDragon', src: 'assets/dungeon/monster-coin-dragon-r71.png?v=1794068200', label: '金幣龍' },
      { id: 'scrollDragon', src: 'assets/dungeon/monster-scroll-dragon-r71.png?v=1794068200', label: '卷軸龍' },
      { id: 'calendarImp', src: 'assets/dungeon/monster-calendar-imp-r72.png?v=1794068200', label: '日曆小鬼' },
      { id: 'heartSlime', src: 'assets/dungeon/monster-heart-slime-r72.png?v=1794068200', label: '愛心史萊姆' },
      { id: 'giftMimic', src: 'assets/dungeon/monster-gift-mimic-r72.png?v=1794068200', label: '禮物寶箱怪' },
      { id: 'riverFish', src: 'assets/dungeon/monster-river-fish-r73.png?v=1794068200', label: '河魚' },
      { id: 'oreGolem', src: 'assets/dungeon/monster-ore-golem-r73.png?v=1794068200', label: '礦石魔像' },
      { id: 'pickaxeImp', src: 'assets/dungeon/monster-pickaxe-imp-r73.png?v=1794068200', label: '礦鎬小鬼' },
      { id: 'slimeFlask', src: 'assets/dungeon/monster-slime-flask-r74.png?v=1794068200', label: '燒瓶史萊姆' },
      { id: 'cauldronImp', src: 'assets/dungeon/monster-cauldron-imp-r74.png?v=1794068200', label: '藥鍋小鬼' },
      { id: 'herbSprite', src: 'assets/dungeon/monster-herb-sprite-r74.png?v=1794068200', label: '藥草精靈' },
      { id: 'madChick', src: 'assets/dungeon/monster-mad-chick-r75.png?v=1794068200', label: '狂小雞' },
      { id: 'woolSheep', src: 'assets/dungeon/monster-wool-sheep-r75.png?v=1794068200', label: '羊毛羊' }
    ],
    win: 'assets/dungeon/win-chest.png?v=1794068200',
    winOpen: 'assets/dungeon/win-chest-open.png?v=1794068200',
    loseCross: 'assets/dungeon/lose-cross.png?v=1794068200',
    resultVictory: 'assets/ui/result-victory.png?v=1794068200',
    resultDefeat: 'assets/ui/result-defeat.png?v=1794068200',
    resultFlee: 'assets/ui/result-flee.png?v=1794068200',
    loseTomb: 'assets/dungeon/lose-tomb.png?v=1794068200',
    loseBones: 'assets/dungeon/lose-bones.png?v=1794068200'
  };

  /** head-slot id → dungeon hero id（冇就 fallback） */
  const HERO_SPRITE_MAP = {
    sword: 'sword', tank: 'tank', spear: 'spear', rogue: 'rogue', knight: 'knight',
    mage: 'mage', healer: 'healer', archer: 'archer', bard: 'bard', witch: 'witch'
  };

  function heroAssetById(id) {
    const mapped = HERO_SPRITE_MAP[id] || id;
    return DUNGEON_ASSETS.heroes.find((h) => h.id === mapped) || DUNGEON_ASSETS.heroes[0];
  }

  function monsterAssetById(id) {
    return DUNGEON_ASSETS.monsters.find((m) => m.id === id) || DUNGEON_ASSETS.monsters[0];
  }

  const LANE_TAGS = ['A', 'B', 'C'];

  /** @type {{gold:number,rep:number,day:number,wageLeft:number,quests:Object,assigned:Object,consumed:string[],lanes:Object,seed:number}} */
  let state = defaultState();

  function defaultState() {
    const board = QUEST_POOL.slice(0, 3).map((q) => q.id);
    const quests = {};
    board.forEach((id) => {
      quests[id] = { status: 'open', result: null, rateAtDispatch: null };
    });
    return {
      gold: 87,
      rep: 55,
      day: 9,
      wageLeft: 5,
      board,
      quests,
      assigned: {},
      consumed: [],
      lanes: { A: null, B: null, C: null },
      laneLogs: { A: [], B: [], C: [] },
      party: { front: ['sword'], back: ['mage'], leader: 'sword' },
      partyStatus: {},
      mailRead: false,
      mails: [{ id: 'notice', title: '公會通告', body: '親愛嘅會長：\n本季賃金將於剩餘日數歸零時自動扣款。\n新到雜貨店可購買藥水／解毒劑／乾糧。\n夜間委託報酬略高，記得編成齊人。\n—— 櫃台 莉莉' }],
      tutorial: { seenTap: false, seenDrag: false, seenHold: false, seenRecruit: false, seenParty: false },
      bonds: {},
      eventDouble: false,
      eventFestival: false,
      shopStock: { potion: 3, antidote: 2, bread: 4, stew: 2, cake: 2, honey: 3, milk: 3, gift: 2, balloon: 3, dumbbell: 2, target: 2, hammer: 2, nails: 3, blueprint: 1, bombSmoke: 2, mirror: 2, feather: 2, crystalShard: 1, compass: 2, pillow: 3, soap: 3, rod: 2, bait: 4, ore: 3, log: 3, berry: 4, mushroomItem: 3, keySilver: 2, mapScrap: 3, guildPass: 1, potionMana: 3, scrollQuest: 2, charmLuck: 2, thread: 3, woodPlank: 3, oreIron: 3, herbGreen: 4, fishSmall: 4, gemRuby: 1, spice: 3, inkBottle: 3, seedBag: 3, clay: 3, ticket: 2, lanternItem: 2, ropeItem: 3, anchor: 2, arrowBundle: 3, holyWater: 2, pearl: 2, acorn: 4, crownMini: 1, lockpick: 2, tome: 2, bouquet: 3, parcel: 3, flour: 4, horn: 2, leaf: 3, silk: 3, crystalBall: 1, mask: 2, recipe: 3, equipSword: 2, equipBow: 2, equipStaff: 2, equipShield: 2, whetstone: 3, quiver: 2, manaCrystal: 2, trophy: 1, bandage: 4, tarot: 2, taxSeal: 2, lute: 2, herbRed: 4, rum: 2, rosary: 2, hammerSmall: 3, foodPie: 2, foodTea: 3, whip: 2, oar: 2, teapot: 2, coinPurse: 2, giftFlower: 2, giftLetter: 3, pickaxe: 2, shears: 3, matIngot: 3, matCloth: 3, matPotionEmpty: 4, needle: 3, vial: 3, saw: 2, chestBronze: 2, chestSilver: 1, chestGold: 1, keyBronze: 3, keyGold: 1, bookMagic: 2, towel: 4, scale: 2, abacus: 2, torch: 3, mapScroll: 2, foodCandy: 4, ladle: 2, mug: 2, lollipop: 4, eqRingRuby: 1, hammerSmith: 2, polishCloth: 3, gemCutter: 2, bannerFlag: 2, whistle: 3, medkit: 2, waxSeal: 3, quill: 3, inviteCard: 2, cropWheat: 4, cropTomato: 4, cropPumpkin: 3, wateringCan: 2, seedBagNew: 3, rake: 2, petFoodBowl: 2, petToyBall: 2, petRibbon: 3, leash: 2, brush: 2, treat: 4, drumstick: 2, stageTicket: 2, wheel: 2, balloonRope: 2, magnifier: 2, priceTag: 3, gavel: 1, hourglass: 2, lanternNew: 2, ledgerBook: 2, skillBook: 2, focusBead: 2, burnSalve: 2, warmTea: 3, pestle: 2, herbBundle: 3, iceCharm: 2, medalRibbon: 2, scoreboard: 1, speechScroll: 2, inkPot: 3, megaphone: 2, keyring: 2, crate: 3, mapPin: 3, backpack: 1, padlock: 2, sortTag: 3, tacticBoard: 2, powerGlove: 1, wrench: 2, earmuff: 2, dictionary: 2, helpBook: 2, friendToken: 2, questFeather: 2, petal: 4, sunCharm: 2, mapleLeaf: 4, snowflake: 4, stallFlag: 2, onsenTicket: 2, roomKey: 2, shopBell: 2, gemFire: 2, gemWater: 2, gemWind: 2, fireWand: 1, waterFlask: 2, windFan: 2, gemEarth: 2, gemLight: 2, gemDark: 2, earthStaff: 1, holyCross: 2, shadowDagger: 1, plaque: 1, goldSack: 1, historyTome: 2, stampPad: 2, friendLetter: 2, bondCharm: 1, fishingHook: 3, oreChunk: 3, lanternMine: 2, herbLeaf: 4, mortar: 2, emptyPhial: 4, milkPail: 2, feedBag: 3 },
      unlockedSlots: 0,
      recruited: ['sword', 'tank', 'spear', 'rogue', 'mage', 'healer', 'archer', 'bard'],
      recruitVoucher: 0,
      liveBars: {},
      achievements: {},
      wins: 0,
      questsAccepted: 0,
      pet: 'cat',
      foodBuff: null,
      muted: false,
      volume: 70,
      trainBuff: null,
      fatigue: 2,
      guildHp: 100,
      seed: Date.now() % 100000
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || typeof data.gold !== 'number') return;
      state.gold = data.gold;
      state.rep = data.rep != null ? data.rep : 55;
      state.day = data.day != null ? data.day : 9;
      state.wageLeft = data.wageLeft != null ? data.wageLeft : 5;
      state.consumed = Array.isArray(data.consumed) ? data.consumed : [];
      state.seed = data.seed != null ? data.seed : state.seed;
      if (typeof data.mailRead === 'boolean') state.mailRead = data.mailRead;
      if (Array.isArray(data.mails)) state.mails = data.mails;
      if (data.tutorial && typeof data.tutorial === 'object') state.tutorial = Object.assign({ seenTap: false, seenDrag: false, seenHold: false }, data.tutorial);
      if (typeof data.eventDouble === 'boolean') state.eventDouble = data.eventDouble;
      if (typeof data.eventFestival === 'boolean') state.eventFestival = data.eventFestival;
      if (data.shopStock && typeof data.shopStock === 'object') state.shopStock = Object.assign({ potion: 3, antidote: 2, bread: 4, stew: 2, cake: 2, honey: 3, milk: 3, gift: 2, balloon: 3, dumbbell: 2, target: 2, hammer: 2, nails: 3, blueprint: 1, bombSmoke: 2, mirror: 2, feather: 2, crystalShard: 1, compass: 2, pillow: 3, soap: 3, rod: 2, bait: 4, ore: 3, log: 3, berry: 4, mushroomItem: 3, keySilver: 2, mapScrap: 3, guildPass: 1, potionMana: 3, scrollQuest: 2, charmLuck: 2, thread: 3, woodPlank: 3, oreIron: 3, herbGreen: 4, fishSmall: 4, gemRuby: 1, spice: 3, inkBottle: 3, seedBag: 3, clay: 3, ticket: 2, lanternItem: 2, ropeItem: 3, anchor: 2, arrowBundle: 3, holyWater: 2, pearl: 2, acorn: 4, crownMini: 1, lockpick: 2, tome: 2, bouquet: 3, parcel: 3, flour: 4, horn: 2, leaf: 3, silk: 3, crystalBall: 1, mask: 2, recipe: 3, equipSword: 2, equipBow: 2, equipStaff: 2, equipShield: 2, whetstone: 3, quiver: 2, manaCrystal: 2, trophy: 1, bandage: 4, tarot: 2, taxSeal: 2, lute: 2, herbRed: 4, rum: 2, rosary: 2, hammerSmall: 3, foodPie: 2, foodTea: 3, whip: 2, oar: 2, teapot: 2, coinPurse: 2, giftFlower: 2, giftLetter: 3, pickaxe: 2, shears: 3, matIngot: 3, matCloth: 3, matPotionEmpty: 4, needle: 3, vial: 3, saw: 2, chestBronze: 2, chestSilver: 1, chestGold: 1, keyBronze: 3, keyGold: 1, bookMagic: 2, towel: 4, scale: 2, abacus: 2, torch: 3, mapScroll: 2, foodCandy: 4, ladle: 2, mug: 2, lollipop: 4, eqRingRuby: 1, hammerSmith: 2, polishCloth: 3, gemCutter: 2, bannerFlag: 2, whistle: 3, medkit: 2, waxSeal: 3, quill: 3, inviteCard: 2, cropWheat: 4, cropTomato: 4, cropPumpkin: 3, wateringCan: 2, seedBagNew: 3, rake: 2, petFoodBowl: 2, petToyBall: 2, petRibbon: 3, leash: 2, brush: 2, treat: 4, drumstick: 2, stageTicket: 2, wheel: 2, balloonRope: 2, magnifier: 2, priceTag: 3, gavel: 1, hourglass: 2, lanternNew: 2, ledgerBook: 2, skillBook: 2, focusBead: 2, burnSalve: 2, warmTea: 3, pestle: 2, herbBundle: 3, iceCharm: 2, medalRibbon: 2, scoreboard: 1, speechScroll: 2, inkPot: 3, megaphone: 2, keyring: 2, crate: 3, mapPin: 3, backpack: 1, padlock: 2, sortTag: 3, tacticBoard: 2, powerGlove: 1, wrench: 2, earmuff: 2, dictionary: 2, helpBook: 2, friendToken: 2, questFeather: 2, petal: 4, sunCharm: 2, mapleLeaf: 4, snowflake: 4, stallFlag: 2, onsenTicket: 2, roomKey: 2, shopBell: 2, gemFire: 2, gemWater: 2, gemWind: 2, fireWand: 1, waterFlask: 2, windFan: 2, gemEarth: 2, gemLight: 2, gemDark: 2, earthStaff: 1, holyCross: 2, shadowDagger: 1, plaque: 1, goldSack: 1, historyTome: 2, stampPad: 2, friendLetter: 2, bondCharm: 1, fishingHook: 3, oreChunk: 3, lanternMine: 2, herbLeaf: 4, mortar: 2, emptyPhial: 4, milkPail: 2, feedBag: 3 }, data.shopStock);
      if (typeof data.unlockedSlots === 'number') state.unlockedSlots = data.unlockedSlots;
      if (Array.isArray(data.recruited) && data.recruited.length) {
        const known = ROSTER.map((r) => r.id);
        state.recruited = data.recruited.filter((id) => known.indexOf(id) >= 0);
        DEFAULT_RECRUITED.forEach((id) => { if (state.recruited.indexOf(id) < 0) state.recruited.push(id); });
      }
      if (typeof data.recruitVoucher === 'number') state.recruitVoucher = data.recruitVoucher;
      if (data.bonds && typeof data.bonds === 'object') state.bonds = Object.assign({}, data.bonds);
      try { ensureExpandQuestsOnBoard(); } catch (e) {}
      if (data.liveBars && typeof data.liveBars === 'object') state.liveBars = data.liveBars;
      if (data.achievements && typeof data.achievements === 'object') state.achievements = data.achievements;
      if (typeof data.wins === 'number') state.wins = data.wins;
      if (typeof data.questsAccepted === 'number') state.questsAccepted = data.questsAccepted;
      if (typeof data.pet === 'string') state.pet = data.pet;
      if (data.foodBuff) state.foodBuff = data.foodBuff;
      if (typeof data.muted === 'boolean') state.muted = data.muted;
      if (typeof data.volume === 'number') state.volume = Math.max(0, Math.min(100, data.volume));
      if (data.trainBuff) state.trainBuff = data.trainBuff;
      if (typeof data.fatigue === 'number') state.fatigue = Math.max(0, Math.min(10, data.fatigue));
      if (typeof data.guildHp === 'number') state.guildHp = Math.max(0, Math.min(100, data.guildHp));
      if (Array.isArray(data.board) && data.board.length === 3) {
        state.board = data.board.slice();
        state.board.forEach((id) => {
          if (!state.quests[id]) state.quests[id] = { status: 'open', result: null, rateAtDispatch: null };
        });
      }
      if (data.quests) {
        Object.keys(data.quests).forEach((id) => {
          state.quests[id] = Object.assign(
            state.quests[id] || { status: 'open', result: null, rateAtDispatch: null },
            data.quests[id]
          );
        });
      }
      if (data.assigned) {
        state.assigned = {};
        Object.keys(data.assigned).forEach((qid) => {
          state.assigned[qid] = data.assigned[qid];
        });
      }
      if (data.lanes) state.lanes = Object.assign({ A: null, B: null, C: null }, data.lanes);
      if (data.party && typeof data.party === 'object') {
        state.party = {
          front: Array.isArray(data.party.front) ? data.party.front.slice() : ['sword'],
          back: Array.isArray(data.party.back) ? data.party.back.slice() : ['mage'],
          leader: data.party.leader || (Array.isArray(data.party.front) && data.party.front[0]) || 'sword'
        };
      }
      if (data.partyStatus && typeof data.partyStatus === 'object') state.partyStatus = data.partyStatus;
      else if (!state.partyStatus) state.partyStatus = {};
      if (data.laneLogs) {
        state.laneLogs = { A: [], B: [], C: [] };
        LANE_TAGS.forEach((tag) => {
          if (Array.isArray(data.laneLogs[tag])) state.laneLogs[tag] = data.laneLogs[tag].slice(-40);
        });
      }
    } catch (e) {
      console.warn('loadState', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function toast(msg, kind) {
    const msgEl = document.getElementById('toast-msg');
    const ico = document.getElementById('toast-ico');
    if (msgEl) msgEl.textContent = msg;
    else toastEl.textContent = msg;
    if (ico) {
      let src = '';
      if (kind === 'ok' || kind === 'success') src = 'assets/ui/toast-success.png';
      else if (kind === 'warn' || kind === 'error') src = 'assets/ui/toast-warn.png';
      if (src) {
        ico.src = src + '?v=' + ASSET_V;
        ico.hidden = false;
      } else {
        ico.hidden = true;
      }
    }
    toastEl.classList.toggle('toast-ok', kind === 'ok' || kind === 'success');
    toastEl.classList.toggle('toast-warn', kind === 'warn' || kind === 'error');
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 1400);
  }

  function questMarkerKind(q, st) {
    if (st && st.status === 'done') return 'done';
    if (!q) return 'side';
    if ((q.sourceLabel && q.sourceLabel.indexOf('每日') >= 0) || q.type === '日常') return 'daily';
    if (q.type === '討伐地區王' || q.rarity === 'UR' || q.rarity === 'SSR') return 'main';
    return 'side';
  }
  function winChestSrc(rarity) {
    if (rarity === 'SSR' || rarity === 'UR' || rarity === 'EXTRA') return 'assets/dungeon/chest-gold.png';
    if (rarity === 'SR') return 'assets/dungeon/chest-silver.png';
    return 'assets/dungeon/chest-bronze.png';
  }
  function questMarkerSrc(q, st) {
    const kind = questMarkerKind(q, st);
    if (kind === 'main' || kind === 'side' || kind === 'daily')
      return 'assets/ui/quest-marker-' + kind + '.png';
    return 'assets/quests/marker-' + kind + '.png';
  }
  function questTypeTagSrc(q) {
    if (!q) return 'assets/quests/quest-tag-story.png';
    const t = q.type || '';
    const sl = q.sourceLabel || '';
    if (sl.indexOf('夜間') >= 0 || sl.indexOf('每日') >= 0 || t === '討伐地區王' || q.rarity === 'UR') {
      return 'assets/quests/quest-tag-urgent.png';
    }
    if (t.indexOf('採集') >= 0 || t.indexOf('清掃') >= 0 || t === '日常') {
      return 'assets/quests/quest-tag-gather.png';
    }
    return 'assets/quests/quest-tag-story.png';
  }

  function rarityStarCount(r) {
    if (r === 'UR' || r === 'EXTRA' || r === 'SSR') return 5;
    if (r === 'SR') return 3;
    return 1;
  }
  function rarityStarsHtml(rarity) {
    const n = rarityStarCount(rarity);
    const src = n >= 5 ? 'assets/ui/star-5.png' : (n >= 3 ? 'assets/ui/star-3.png' : 'assets/ui/star-1.png');
    return '<span class="q-stars" title="星級 ' + n + '"><img class="q-star" src="' + src + '?v=' + ASSET_V + '" alt="' + n + '★"/></span>';
  }


  function showBootSplash(ms) {
    const el = document.getElementById('boot-splash');
    if (!el) return;
    let spin = el.querySelector('.loading-spinner');
    if (!spin) {
      spin = document.createElement('img');
      spin.className = 'loading-spinner';
      spin.alt = '載入';
      el.insertBefore(spin, el.firstChild.nextSibling);
    }
    spin.src = 'assets/ui/loading-spinner.png?v=' + ASSET_V;
    let dots = el.querySelector('.loading-dots');
    if (dots) dots.src = 'assets/ui/loading-dots.png?v=' + ASSET_V;
    let wait = el.querySelector('.please-wait-banner');
    if (!wait) {
      wait = document.createElement('img');
      wait.className = 'please-wait-banner';
      wait.alt = '請稍候';
      el.appendChild(wait);
    }
    wait.src = 'assets/ui/please-wait-banner.png?v=' + ASSET_V;
    el.hidden = false;
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('show');
    clearTimeout(showBootSplash._t);
    showBootSplash._t = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; el.setAttribute('aria-hidden', 'true'); }, 280);
    }, ms || 900);
  }

  function applyModalChromeBtns() {
    const ok = document.querySelector('#btn-accept .modal-ico');
    const dispatch = document.querySelector('#btn-dispatch .modal-ico');
    const close = document.querySelector('#modal-close img');
    if (ok) ok.src = 'assets/ui/btn-ok.png?v=' + ASSET_V;
    if (dispatch) dispatch.src = 'assets/ui/btn-ok.png?v=' + ASSET_V;
    if (close) {
      // back-style close affordance; keep accessible label
      close.src = 'assets/ui/btn-back.png?v=' + ASSET_V;
    }
    const cancel = document.getElementById('btn-modal-cancel');
    if (!cancel) {
      const actions = document.getElementById('modal-actions');
      if (actions) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'modal-btn cancel';
        b.id = 'btn-modal-cancel';
        b.innerHTML = '<img class="modal-ico" src="assets/ui/btn-cancel.png?v=' + ASSET_V + '" alt=""/>取消';
        b.addEventListener('click', () => { try { closeModal(); } catch (e) {} });
        actions.appendChild(b);
      }
    } else {
      const ico = cancel.querySelector('.modal-ico');
      if (ico) ico.src = 'assets/ui/btn-cancel.png?v=' + ASSET_V;
    }
  }

  function flashFriendship() {
    const el = document.getElementById('friendship-fx');
    if (!el) return;
    const img = el.querySelector('img');
    if (img) img.src = 'assets/ui/friendship-up.png?v=' + ASSET_V;
    el.hidden = false;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    clearTimeout(flashFriendship._t);
    flashFriendship._t = setTimeout(() => { el.hidden = true; el.classList.remove('pop'); }, 1200);
  }

  function syncGuestHeart() {
    const h = document.getElementById('guest-heart');
    if (!h) return;
    const rep = state.rep != null ? state.rep : 0;
    let src = 'assets/ui/heart-empty.png';
    if (rep >= 75) src = 'assets/ui/heart-full.png';
    else if (rep >= 40) src = 'assets/ui/heart-half.png';
    h.src = src + '?v=' + ASSET_V;
    h.title = '好感 ' + rep;
  }

  function say(text) {
    if (dialogueName) dialogueName.textContent = LILY;
    dialogueText.textContent = text;
  }

  function repLabel(score) {
    for (let i = 0; i < REP_LABELS.length; i++) {
      if (score < REP_LABELS[i][0]) return REP_LABELS[i][1];
    }
    return '極高';
  }


  function renderPixNumber(el, value) {
    if (!el) return;
    const s = String(Math.abs(value | 0));
    // keep text fallback for a11y; show sprites
    el.dataset.pix = s;
    el.textContent = '';
    el.classList.add('has-sprites');
    if ((value | 0) < 0) {
      const m = document.createElement('img');
      m.className = 'pix-digit';
      m.src = 'assets/numerals/minus.png?v=' + ASSET_V;
      m.alt = '-';
      el.appendChild(m);
    }
    for (let i = 0; i < s.length; i++) {
      const img = document.createElement('img');
      img.className = 'pix-digit';
      img.src = 'assets/numerals/num-' + s[i] + '.png?v=' + ASSET_V;
      img.alt = s[i];
      el.appendChild(img);
    }
  }

  function mockBarsFor(id) {
    let h = 0;
    String(id || '').split('').forEach((ch) => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; });
    return {
      hp: 70 + (h % 25),
      mp: 55 + ((h >> 3) % 35),
      xp: 20 + ((h >> 5) % 70)
    };
  }

  function getLiveBars(id) {
    if (!state.liveBars) state.liveBars = {};
    if (!state.liveBars[id]) state.liveBars[id] = mockBarsFor(id);
    return state.liveBars[id];
  }

  function setLiveBars(id, hp, mp, xp) {
    if (!state.liveBars) state.liveBars = {};
    const cur = getLiveBars(id);
    state.liveBars[id] = {
      hp: Math.max(5, Math.min(100, hp != null ? hp : cur.hp)),
      mp: Math.max(5, Math.min(100, mp != null ? mp : cur.mp)),
      xp: Math.max(0, Math.min(100, xp != null ? xp : cur.xp))
    };
    return state.liveBars[id];
  }

  function applyBarDelta(id, dHp, dMp, dXp) {
    const b = getLiveBars(id);
    return setLiveBars(id, b.hp + (dHp || 0), b.mp + (dMp || 0), b.xp + (dXp || 0));
  }

  function paintHeadBars() {
    document.querySelectorAll('.head-slot').forEach((el) => {
      const id = el.dataset.id;
      if (!id) return;
      ensureHeadBars(el);
      const bars = getLiveBars(id);
      const fillHp = el.querySelector('.head-bar.hp .bar-fill');
      const fillMp = el.querySelector('.head-bar.mp .bar-fill');
      const fillXp = el.querySelector('.head-bar.xp .bar-fill');
      if (fillHp) fillHp.style.width = bars.hp + '%';
      if (fillMp) fillMp.style.width = bars.mp + '%';
      if (fillXp) fillXp.style.width = bars.xp + '%';
    });
  }

  function recoverPartyBars(partial) {
    const p = partyList();
    [...p.front, ...p.back].forEach((id) => {
      const base = mockBarsFor(id);
      const cur = getLiveBars(id);
      if (partial) {
        setLiveBars(id, Math.round((cur.hp + base.hp) / 2), Math.round((cur.mp + base.mp) / 2), cur.xp);
      } else {
        setLiveBars(id, base.hp, base.mp, Math.min(100, cur.xp + 8));
      }
    });
    paintHeadBars();
  }

  function ensureHeadBars(btn) {
    if (!btn || btn.querySelector('.head-bars')) return;
    const wrap = document.createElement('div');
    wrap.className = 'head-bars';
    ['hp', 'mp', 'xp'].forEach((k) => {
      const row = document.createElement('div');
      row.className = 'head-bar ' + k;
      const bg = document.createElement('img');
      bg.className = 'bar-bg';
      bg.src = 'assets/bars/hp-bar-bg.png?v=' + ASSET_V;
      bg.alt = '';
      const fill = document.createElement('div');
      fill.className = 'bar-fill';
      const glow = document.createElement('img');
      glow.className = 'bar-glow';
      glow.src = 'assets/bars/bar-glow.png?v=' + ASSET_V;
      glow.alt = '';
      const capL = document.createElement('img');
      capL.className = 'bar-cap left';
      capL.src = 'assets/bars/bar-cap-left.png?v=' + ASSET_V;
      capL.alt = '';
      const capR = document.createElement('img');
      capR.className = 'bar-cap right';
      capR.src = 'assets/bars/bar-cap-right.png?v=' + ASSET_V;
      capR.alt = '';
      row.appendChild(bg);
      row.appendChild(fill);
      row.appendChild(glow);
      row.appendChild(capL);
      row.appendChild(capR);
      wrap.appendChild(row);
    });
    btn.appendChild(wrap);
  }

  function repRank(score) {
    // r44：銅／銀／金聲譽徽（badges/badge-rep-*；ui 有副本）
    if (score >= 75) return { id: 'gold', src: 'assets/badges/badge-rep-gold.png', label: '金聲譽徽' };
    if (score >= 45) return { id: 'silver', src: 'assets/badges/badge-rep-silver.png', label: '銀聲譽徽' };
    return { id: 'bronze', src: 'assets/badges/badge-rep-bronze.png', label: '銅聲譽徽' };
  }

  function arenaRank(wins) {
    const w = wins | 0;
    if (w >= 20) return { id: 'crown', src: 'assets/ui/rank-1-crown.png', label: '冠軍皇冠' };
    if (w >= 10) return { id: 'medal2', src: 'assets/ui/rank-2-medal.png', label: '亞軍獎章' };
    return { id: 'medal3', src: 'assets/ui/rank-3-medal.png', label: '季軍獎章' };
  }

  function syncEconomyBars() {
    const host = document.getElementById('btn-economy');
    if (!host) return;
    let wrap = document.getElementById('economy-bars');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'economy-bars';
      wrap.className = 'economy-bars';
      host.appendChild(wrap);
    }
    const repPct = Math.max(0, Math.min(100, state.rep | 0));
    const xpPct = Math.max(0, Math.min(100, ((state.wins || 0) * 5) % 100));
    wrap.innerHTML =
      '<span class="eb-row rep" title="聲譽條">' +
        '<img class="eb-empty" src="assets/ui/bar-empty.png?v=' + ASSET_V + '" alt=""/>' +
        '<img class="eb-fill" src="assets/ui/bar-rep-fill.png?v=' + ASSET_V + '" alt="" style="clip-path:inset(0 ' + (100 - repPct) + '% 0 0)"/>' +
      '</span>' +
      '<span class="eb-row xp" title="經驗條">' +
        '<img class="eb-empty" src="assets/ui/bar-empty.png?v=' + ASSET_V + '" alt=""/>' +
        '<img class="eb-fill" src="assets/ui/bar-xp-fill.png?v=' + ASSET_V + '" alt="" style="clip-path:inset(0 ' + (100 - xpPct) + '% 0 0)"/>' +
      '</span>';
    let arena = document.getElementById('arena-rank-ico');
    if (!arena) {
      const small = host.querySelector('.pill-stack small');
      if (small) {
        arena = document.createElement('img');
        arena.id = 'arena-rank-ico';
        arena.className = 'inline-ico';
        arena.alt = '';
        small.insertBefore(arena, small.firstChild);
      }
    }
    if (arena) {
      const ar = arenaRank(state.wins || 0);
      arena.src = ar.src + '?v=' + ASSET_V;
      arena.title = ar.label;
    }
  }

  function updateEconomyUI() {
    if (goldEl) {
      renderPixNumber(goldEl, state.gold);
      goldEl.classList.remove('bump');
      void goldEl.offsetWidth;
      goldEl.classList.add('bump');
    }
    const coinPill = document.querySelector('.pill-ico');
    if (coinPill && coinPill.getAttribute('src') && coinPill.getAttribute('src').indexOf('coin') >= 0) {
      let csrc = 'assets/icons/coin-copper.png';
      if (state.gold >= 200) csrc = 'assets/icons/coin-gold-stack.png';
      else if (state.gold >= 80) csrc = 'assets/icons/coin-silver.png';
      coinPill.src = csrc + '?v=' + ASSET_V;
    }
    if (repEl) repEl.textContent = repLabel(state.rep);
    const rankIco = document.getElementById('rank-ico');
    if (rankIco) {
      const rk = repRank(state.rep);
      rankIco.src = rk.src + '?v=' + ASSET_V;
      rankIco.title = rk.label;
    }
    const trend = document.getElementById('rep-trend');
    if (trend) {
      const up = (state._lastRepDelta == null) ? (state.rep >= 50) : (state._lastRepDelta >= 0);
      trend.src = (up ? 'assets/ui/reputation-up.png' : 'assets/ui/reputation-down.png') + '?v=' + ASSET_V;
      trend.title = up ? '聲譽↑' : '聲譽↓';
    }
    syncGuestFace();
    try { syncEconomyBars(); } catch (e) {}
      try { renderChapterStrip(); } catch (e) {}
  }

  function syncNeedStatus() {
    let el = document.getElementById('need-status');
    if (!el) {
      const host = document.getElementById('guest-face');
      if (!host || !host.parentElement) return;
      el = document.createElement('img');
      el.id = 'need-status';
      el.className = 'prop prop-need-status';
      el.alt = '';
      host.parentElement.appendChild(el);
    }
    let sid = 'happy';
    if ((state.fatigue || 0) >= 6) sid = 'sleepy';
    else if (state.gold < 30 || (state.wageLeft != null && state.wageLeft <= 1)) sid = 'hungry';
    el.src = 'assets/ui/status-' + sid + '.png?v=' + ASSET_V;
    el.title = (STATUS_DEFS[sid] && STATUS_DEFS[sid].label) || sid;
  }

  function syncGuestFace() {
    const g = document.getElementById('guest-face');
    if (!g) return;
    const tod = todForDay(state.day);
    let src = 'assets/ui/guest-happy.png';
    let clsAngry = false;
    if (state.wageLeft <= 0 || state.rep < 25) {
      src = 'assets/ui/guest-leave.png';
      clsAngry = true;
    } else if (tod.id === 'night' || tod.id === 'midnight') {
      src = 'assets/ui/guest-sleep.png';
    } else if (!(state.rep >= 45 && state.wageLeft > 1)) {
      src = 'assets/ui/guest-angry.png';
      clsAngry = true;
    }
    g.src = src + '?v=' + ASSET_V;
    g.classList.toggle('angry', clsAngry);
    g.classList.toggle('sleep', src.indexOf('guest-sleep') >= 0);
    g.classList.toggle('leave', src.indexOf('guest-leave') >= 0);
    try { syncGuestHeart(); } catch (e) {}
    try { syncNeedStatus(); } catch (e) {}
  }

  function bumpRep(delta) {
    const before = state.rep | 0;
    state.rep = Math.max(0, Math.min(100, before + (delta | 0)));
    if (state.rep > before) {
      try { flashFriendship(); } catch (e) {}
      try { toast('好感上升', 'ok'); } catch (e) {}
    }
    syncGuestFace();
    return state.rep;
  }


  function closeModal() {
    modal.hidden = true;
    activeQuest = null;
    modalMode = 'plain';
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  const greetings = [
    '（審批緊文件）有咩可以幫你？',
    '揀任務 → 派道具 → 派出，就可以睇地城結果啦～',
    '成功率愈高愈易勝；敗咗都會有少少學費金。',
    '自動選擇會優先補成功率最低嘅任務喔！'
  ];
  let gIdx = 0;
  document.getElementById('dialogue').addEventListener('click', () => {
    gIdx = (gIdx + 1) % greetings.length;
    popEmoji(['note', 'hearts', 'question', 'exclaim'][gIdx % 4]);
    say(greetings[gIdx]);
  });

  function headsHtml(n) {
    return '👤'.repeat(Math.max(0, n | 0));
  }

  function questById(id) {
    return QUEST_POOL.find((q) => q.id === id);
  }

  function assignedSet(questId) {
    const arr = state.assigned[questId] || [];
    return new Set(arr);
  }

  function itemBonusTotal(questId) {
    const set = assignedSet(questId);
    if (!set.size) return 0;
    let sum = 0;
    document.querySelectorAll('.slot.filled').forEach((slot) => {
      if (set.has(slot.dataset.item) && !state.consumed.includes(slot.dataset.item)) {
        sum += parseInt(slot.dataset.bonus, 10) || 0;
      }
    });
    return sum;
  }

  function baseRate(q) {
    const base = BASE_BY_RARITY[q.rarity] != null ? BASE_BY_RARITY[q.rarity] : 50;
    const powerPenalty = Math.min(18, Math.floor(q.power / 120));
    return Math.max(8, base - powerPenalty);
  }

  function partyList() {
    const p = state.party || { front: [], back: [] };
    return {
      front: Array.isArray(p.front) ? p.front.slice() : [],
      back: Array.isArray(p.back) ? p.back.slice() : []
    };
  }

  function partyCount() {
    const p = partyList();
    return p.front.length + p.back.length;
  }

  /** @returns {{ok:boolean, detail:string}} */
  function checkSpecial(q) {
    const special = (q.special || '').trim();
    if (!special) return { ok: true, detail: '無特殊需要' };
    const p = partyList();
    const frontN = p.front.length;
    const hasMage = p.back.includes('mage') || p.front.includes('mage');
    const hasWitch = p.back.includes('witch') || p.front.includes('witch');
    const hasKnight = p.front.includes('knight') || p.back.includes('knight');
    if (special.indexOf('女騎士') >= 0) {
      const ok = hasKnight;
      return { ok, detail: ok ? '女騎士同行' : '未滿足：需要女騎士希琳同行' };
    }
    if (special.indexOf('魔女') >= 0) {
      const ok = hasWitch;
      return { ok, detail: ok ? '魔女同行' : '未滿足：需要魔女薇爾同行' };
    }
    if (special.indexOf('2 前衛') >= 0 || special.indexOf('2前衛') >= 0) {
      const needMage = special.indexOf('法師') >= 0;
      const ok = frontN >= 2 && (!needMage || hasMage);
      return { ok, detail: ok ? '特殊條件達成' : '未滿足：' + special };
    }
    if (special.indexOf('1 前衛') >= 0 || special.indexOf('1前衛') >= 0) {
      const ok = frontN >= 1;
      return { ok, detail: ok ? '特殊條件達成' : '未滿足：最少 1 前衛' };
    }
    // generic fallback: treat as ok if any party
    return { ok: partyCount() > 0, detail: special };
  }

  function partyBonus(q) {
    const n = partyCount();
    const per = 4; // 每位成員 +4%
    let bonus = n * per;
    const sp = checkSpecial(q);
    if (q.special && sp.ok) bonus += 10;
    else if (q.special && !sp.ok) bonus -= 4;
    if (n < (q.minHeads || 0)) bonus -= 12; // under-manned penalty (dispatch still blocked)
    const plist = partyList();
    let bondB = 0;
    plist.front.concat(plist.back).forEach((id) => { bondB += Math.floor(bondOf(id) / 20); });
    bonus += Math.min(8, bondB);
    return bonus;
  }

  function weatherBonus() {
    const w = weatherForDay(state.day);
    if (w.id === 'sun') return 2;
    if (w.id === 'rain') return -3;
    return 0;
  }

  function petBonus() {
    const map = { cat: 2, dog: 3, bird: 2, slime: 1 };
    return map[state.pet] != null ? map[state.pet] : 0;
  }

  function foodBuffBonus() {
    if (!state.foodBuff) return 0;
    if (state.foodBuff.untilDay != null && state.day > state.foodBuff.untilDay) {
      state.foodBuff = null;
      return 0;
    }
    return state.foodBuff.rate || 0;
  }

  function rateBreakdown(q) {
    const base = baseRate(q);
    const items = itemBonusTotal(q.id);
    const party = partyBonus(q);
    const weather = weatherBonus();
    const pet = petBonus();
    const food = foodBuffBonus();
    const element = elementBonus(q);
    const train = trainBonus();
    const skill = skillBonus();
    const fatigue = fatiguePenalty();
    const total = Math.min(99, Math.max(1, base + items + party + weather + pet + food + element + train + skill + fatigue));
    return { base, items, party, weather, pet, food, element, train, skill, fatigue, total, special: checkSpecial(q), heads: partyCount(), minHeads: q.minHeads || 0 };
  }

  function successRate(q) {
    const st = state.quests[q.id];
    if (st && st.status === 'active' && st.rateAtDispatch != null) return st.rateAtDispatch;
    if (st && st.status === 'done' && st.rateAtDispatch != null) return st.rateAtDispatch;
    return rateBreakdown(q).total;
  }

  function canDispatchParty(q) {
    return partyCount() >= (q.minHeads || 1);
  }

  function rateClass(rate) {
    if (rate >= 70) return '';
    if (rate >= 45) return 'mid';
    return 'low';
  }

  function itemOwner(itemName) {
    for (const qid of Object.keys(state.assigned)) {
      const st = state.quests[qid];
      if (!st || st.status === 'done') continue;
      if ((state.assigned[qid] || []).includes(itemName)) return qid;
    }
    return null;
  }

  function updateInvHint() {
    if (!invHint) return;
    if (!selectedQuestId) {
      invHint.textContent = '先揀任務／編成，再派道具';
      return;
    }
    const q = questById(selectedQuestId);
    const st = state.quests[selectedQuestId];
    const n = (state.assigned[selectedQuestId] || []).length;
    if (st && (st.status === 'active' || st.status === 'done')) {
      invHint.textContent = q ? `「${q.name}」· ${st.status === 'active' ? '進行中' : '已完成'}` : '';
      return;
    }
    if (!q) { invHint.textContent = '先揀任務／編成，再派道具'; return; }
    const br = rateBreakdown(q);
    const sign = br.party >= 0 ? '+' : '';
    invHint.textContent = `派畀「${q.name}」· 道具 ${n}/${MAX_ITEMS_PER_QUEST} · 編成 ${sign}${br.party}%（${br.heads}人）`;
  }

  function syncSlotAssignedState() {
    document.querySelectorAll('.slot.filled').forEach((slot) => {
      const item = slot.dataset.item;
      const consumed = state.consumed.includes(item);
      slot.classList.toggle('consumed', consumed);
      const onSelected = selectedQuestId &&
        (state.assigned[selectedQuestId] || []).includes(item) &&
        !consumed;
      slot.classList.toggle('assigned', !!onSelected);
      const owner = itemOwner(item);
      const elsewhere = owner && owner !== selectedQuestId && !consumed;
      slot.style.opacity = consumed ? '' : (elsewhere ? '0.45' : '');
      slot.disabled = consumed || !!elsewhere;
    });
    try { syncInvEmpty(); } catch (e) {}
  }

  function statusLabel(st) {
    if (!st) return '';
    if (st.status === 'accepted') return '已接';
    if (st.status === 'active') return '進行中';
    if (st.status === 'done') return st.result === 'win' ? '勝利' : '敗北';
    return '';
  }

  function boardQuests() {
    if (!Array.isArray(state.board)) {
      state.board = QUEST_POOL.slice(0, 3).map((q) => q.id);
    }
    return state.board.map((id) => questById(id)).filter(Boolean);
  }

  function renderQuestTiles() {
    questRow.innerHTML = '';
    const boardList = boardQuests();
    if (!boardList.length) {
      questRow.innerHTML = emptyStateHtml('quest', '任務板暫時冇委託 · 過一日或等刷新');
      updateInvHint();
      syncSlotAssignedState();
      const refBtn0 = document.getElementById('btn-refresh-quests');
      if (refBtn0) refBtn0.disabled = true;
      try { renderChapterStrip(); renderEventBanner(); } catch (e) {}
      return;
    }
    boardList.forEach((q) => {
      if (!state.quests[q.id]) state.quests[q.id] = { status: 'open', result: null, rateAtDispatch: null };
      const st = state.quests[q.id];
      const rate = successRate(q);
      const btn = document.createElement('button');
      btn.type = 'button';
      let cls = `quest-tile rarity-${q.rarity}`;
      if (selectedQuestId === q.id) cls += ' selected';
      if (st.status === 'accepted') cls += ' status-accepted';
      if (st.status === 'active') cls += ' status-active';
      if (st.status === 'done') cls += ' status-done ' + (st.result || '');
      btn.className = cls;
      btn.dataset.quest = q.id;
      btn.dataset.source = q.source;
      const sl = statusLabel(st);
      const marker = `<img class="q-marker" src="${questMarkerSrc(q, st)}?v=${ASSET_V}" alt="" />`;
      const poster = q.poster ? `<span class="q-poster-wrap"><img class="q-poster-frame" src="assets/frames/poster-frame-wood.png?v=${ASSET_V}" alt=""/><img class="q-poster" src="${q.poster}?v=${ASSET_V}" alt="" /><img class="q-poster-seal" src="assets/frames/poster-seal-wax.png?v=${ASSET_V}" alt=""/><img class="q-poster-pin" src="assets/frames/poster-pin.png?v=${ASSET_V}" alt=""/></span>` : '';
      const el = questElement(q);
      const gem = gemIconSrc(el); const elImg = el ? `<img class="q-el" src="${elementIconSrc(el)}?v=${ASSET_V}" alt="${ELEMENT_LABEL[el]||el}" title="${ELEMENT_LABEL[el]||el}" />` + (gem ? `<img class="q-gem" src="${gem}?v=${ASSET_V}" alt="寶石" title="${ELEMENT_LABEL[el]||el}寶石" />` : '') : '';
      const frameSrc = RARITY_FRAME[q.rarity] || RARITY_FRAME.R;
      const frame = `<img class="q-rarity-frame" src="${frameSrc}?v=${ASSET_V}" alt="" />`;
      const isNewExpand = EXPAND1_QUESTS.indexOf(q.id) >= 0 && st.status === 'open';
      if (isNewExpand) cls += ' is-new';
      btn.className = cls;
      btn.innerHTML = `
        ${isNewExpand ? '<span class="q-new">新</span>' : ''}
        <span class="q-rarity">${q.rarity}</span>
        <span class="q-name">${q.name}</span>
        <span class="q-heads" title="最低 ${q.minHeads} 人">${headsHtml(q.minHeads)}</span>
        <span class="q-rate ${rateClass(rate)}">成功率 ${rate}%</span>
        <span class="q-reward">🪙 ${q.reward}</span>
        ${sl ? `<span class="q-status">${sl}</span>` : ''}
        <span class="q-detail" data-detail="${q.id}">詳情</span>
      `;
      btn.addEventListener('click', (e) => {
        if (e.target && e.target.classList && e.target.classList.contains('q-detail')) {
          e.stopPropagation();
          openQuest(q);
          return;
        }
        selectQuest(q);
      });
      questRow.appendChild(btn);
    });
    updateInvHint();
    syncSlotAssignedState();
    const refBtn = document.getElementById('btn-refresh-quests');
    if (refBtn) {
      const hasDone = boardQuests().some((q) => state.quests[q.id] && state.quests[q.id].status === 'done');
      refBtn.disabled = !hasDone;
    }
    try { renderChapterStrip(); renderEventBanner(); } catch (e) {}
  }

  function selectQuest(q) {
    try { showTutorialTip('tap'); } catch (e) {}
    selectedQuestId = q.id;
    const st = state.quests[q.id];
    if (!state.assigned[q.id]) state.assigned[q.id] = [];
    if (st.status === 'open') {
      say(`睇中「${q.name}」？撳「詳情」→「接任務」，再派道具同派出～`);
    } else if (st.status === 'accepted') {
      say(`「${q.name}」已接。派道具提高成功率，再撳詳情入面「派出」出發！而家 ${successRate(q)}%。`);
    } else if (st.status === 'active') {
      say(`「${q.name}」隊仲喺地城入面，睇下面跑道啦～`);
    } else if (st.status === 'done') {
      say(st.result === 'win'
        ? `「${q.name}」已經勝利收工啦～`
        : `「${q.name}」今轉惜敗，下次再加道具啦。`);
    }
    renderQuestTiles();
    saveState();
  }

  function openQuest(q) {
    activeQuest = q;
    modalMode = 'quest';
    const st = state.quests[q.id];
    const rate = successRate(q);
    const items = state.assigned[q.id] || [];
    modalRarity.textContent = q.rarity;
    modalRarity.className = 'modal-rarity rarity-' + q.rarity;
    modalTitle.textContent = q.name;
    const specialLine = q.special ? q.special : '無';
    let statusLine = '狀態：可接';
    if (st.status === 'accepted') statusLine = '狀態：已接（可派道具／派出）';
    if (st.status === 'active') statusLine = '狀態：進行中（地城攻略中）';
    if (st.status === 'done') statusLine = `狀態：已完成（${st.result === 'win' ? '勝利' : '敗北'}）`;
    const br = rateBreakdown(q);
    const p = partyList();
    const partyNames = [...p.front.map((id) => (members[id] && members[id].job) || id),
      ...p.back.map((id) => (members[id] && members[id].job) || id)];
    try { showTutorialTip('hold'); } catch (e) {}
    const rewardShow = isDoubleRewardDay() ? (q.reward * 2) : q.reward;
    const detailTxt =
      statusLine + '\n' +
      '來源：' + q.sourceLabel + '\n稀有度：' + q.rarity + '\n性質：' + q.type + '\n' +
      '戰力要求：' + q.power + '\n最低人數：' + q.minHeads + '　（而家 ' + br.heads + ' 人）\n' +
      '特殊需要：' + specialLine + '（' + br.special.detail + '）\n報酬：' + rewardShow + ' 金' +
      (isDoubleRewardDay() ? '（雙倍日！原 ' + q.reward + '）' : '') + '\n地點：' + q.place + '\n' +
      '成功率：' + rate + '% ＝ 基礎' + br.base + ' + 道具' + (br.items >= 0 ? '+' : '') + br.items +
      ' + 編成' + (br.party >= 0 ? '+' : '') + br.party + ' + 天氣' + (br.weather >= 0 ? '+' : '') + br.weather + '\n' +
      '編成：' + (partyNames.length ? partyNames.join('、') : '未揀') + '\n' +
      (items.length ? '道具：' + items.join('、') : '道具：未派') +
      '\n\n' + q.desc;
    modalBody.innerHTML = npcBannerHtml('questgiver', q.sourceLabel || '委託來源') +
      '<pre class="modal-pre">' + detailTxt.replace(/</g, '&lt;') + '</pre>';
    sayAs('questgiver', '呢單「' + q.name + '」交俾貴公會，拜託啦～');
    modalActions.hidden = false;
    const btnAccept = document.getElementById('btn-accept');
    const btnDispatch = document.getElementById('btn-dispatch');
    if (btnAccept) {
      btnAccept.disabled = st.status !== 'open';
      btnAccept.textContent = st.status === 'open' ? '接任務' : (st.status === 'accepted' ? '已接' : '——');
    }
    if (btnDispatch) {
      const okParty = canDispatchParty(q);
      btnDispatch.disabled = st.status !== 'accepted' || !okParty;
      if (st.status === 'accepted' && !okParty) btnDispatch.textContent = `人數不足(${partyCount()}/${q.minHeads})`;
      else btnDispatch.textContent = st.status === 'accepted' ? '派出' : (st.status === 'active' ? '進行中' : (st.status === 'done' ? '已完成' : '派出'));
    }
    modal.hidden = false;
    selectedQuestId = q.id;
    if (!state.assigned[q.id]) state.assigned[q.id] = [];
    renderQuestTiles();
  }

  function openPlainModal(title, body) {
    activeQuest = null;
    modalMode = 'plain';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modalActions.hidden = true;
    modal.hidden = false;
  }

  function acceptQuest(q) {
    const st = state.quests[q.id];
    if (st.status !== 'open') {
      toast('呢張任務唔可以再接');
      return;
    }
    st.status = 'accepted';
    state.questsAccepted = (state.questsAccepted || 0) + 1;
    selectedQuestId = q.id;
    if (!state.assigned[q.id]) state.assigned[q.id] = [];
    setLilyMood('smile');
    popEmoji('note');
    flashStamp('approve');
    say(`好～「${q.name}」已接下！喺庫存派道具，再撳「派出」出發。`);
    toast(`已接任務：${q.name}`);
    saveState();
    checkAchievements();
    renderQuestTiles();
    closeModal();
  }

  /** 可重現偽隨機 0..99 */
  function rollPercent() {
    state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
    saveState();
    return state.seed % 100;
  }

  function freeLaneTag() {
    for (const tag of LANE_TAGS) {
      const occ = state.lanes[tag];
      if (!occ || occ.phase === 'idle' || occ.phase === 'done') {
        // allow reuse of done lanes
        if (!occ || occ.phase === 'done' || occ.phase === 'idle') return tag;
      }
      if (occ && occ.phase === 'running') continue;
    }
    // prefer first done/null
    for (const tag of LANE_TAGS) {
      const occ = state.lanes[tag];
      if (!occ || occ.phase !== 'running') return tag;
    }
    return null;
  }

  function applyFoodFromAssigned(qid) {
    const items = state.assigned[qid] || [];
    let rate = 0; let heal = 0;
    items.forEach((name) => {
      const slot = document.querySelector('.slot.filled[data-item="' + name + '"]');
      if (!slot || !slot.classList.contains('food')) return;
      const buff = slot.dataset.buff;
      const bonus = parseInt(slot.dataset.bonus, 10) || 0;
      if (buff === 'heal') heal += bonus;
      else rate += Math.max(3, Math.floor(bonus / 2));
    });
    if (rate || heal) {
      state.foodBuff = { rate: rate, heal: heal, untilDay: state.day + 1 };
      if (heal) {
        (partyList().front.concat(partyList().back)).forEach((id) => applyBarDelta(id, heal, 0, 0));
        paintHeadBars();
      }
      toast('料理 buff：成功率+' + rate + '%' + (heal ? '，回復' + heal : ''));
    }
  }

  async function dispatchQuest(q) {
    const st = state.quests[q.id];
    if (st.status !== 'accepted') {
      toast('請先接任務，再派出');
      return;
    }
    if (!canDispatchParty(q)) {
      toast(`人數唔夠：要最少 ${q.minHeads} 人（而家 ${partyCount()}）`);
      say(`「${q.name}」要最少 ${q.minHeads} 人先派出啦，喺左右揀多啲前後衛～`);
      return;
    }
    const laneTag = freeLaneTag();
    if (!laneTag) {
      toast('三條跑道都忙緊，等一陣再派');
      return;
    }
    applyFoodFromAssigned(q.id);
    const hadTrain = !!(state.trainBuff && state.trainBuff.rate);
    const rate = successRate(q);
    if (hadTrain) { state.trainBuff = null; }
    const roll = rollPercent();
    const win = roll < rate;
    const items = (state.assigned[q.id] || []).slice();

    // consume items
    items.forEach((it) => {
      if (!state.consumed.includes(it)) state.consumed.push(it);
    });
    state.assigned[q.id] = [];
    st.status = 'active';
    st.rateAtDispatch = rate;
    st.result = null;
    state.lanes[laneTag] = {
      questId: q.id,
      phase: 'running',
      outcome: win ? 'win' : 'lose',
      rate,
      roll
    };
    saveState();
    closeModal();
    renderQuestTiles();
    syncSlotAssignedState();
    say(`「${q.name}」隊出發啦！成功率 ${rate}%（擲骰 ${roll}）——睇地城跑道 ${laneTag}！`);
    toast(`派出 → 跑道 ${laneTag}`);
    if (dungeonHint) dungeonHint.textContent = `${laneTag}：${q.name} 攻略中…`;

    await playLaneMission(laneTag, q, win);

    // settle
    st.status = 'done';
    st.result = win ? 'win' : 'lose';
    state.lanes[laneTag].phase = 'done';
    let goldDelta = 0;
    let repDelta = 0;
    if (win) {
      goldDelta = q.reward;
      repDelta = q.rarity === 'R' ? 2 : q.rarity === 'SR' ? 4 : 6;
      state.gold += goldDelta;
      state.rep = Math.min(100, state.rep + repDelta);
      state._lastRepDelta = repDelta;
      state.wins = (state.wins || 0) + 1;
      setLilyMood('proud');
      popEmoji('hearts');
      flashStamp('approve');
      try { flashFx('coin'); flashFx('levelup'); flashFx('levelSpark'); flashFx('expOrb'); celebrateFx('both'); flashRankFx(repDelta >= 6 ? 'perfect' : 'great'); } catch (e) {}
      checkAchievements();
      const namesW = partyList().front.concat(partyList().back).map(memberLabel).join('、') || '隊伍';
      try {
        partyList().front.concat(partyList().back).forEach((id) => {
          let n = 8;
          if ((q.special || '').indexOf('女騎士') >= 0 && id === 'knight') n += 6;
          if ((q.special || '').indexOf('魔女') >= 0 && id === 'witch') n += 6;
          addBond(id, n, true);
        });
        flashFriendship();
      } catch (e) {}
      const bondHint = partyList().front.concat(partyList().back).filter((id) => bondOf(id) > 0).map((id) => memberLabel(id) + '羈絆' + bondOf(id)).join('、');
      say(`凱旋～「${q.name}」勝出！${namesW} 帶回＋${goldDelta} 金、聲譽＋${repDelta}（而家 ${state.rep}）` + (bondHint ? `。${bondHint}` : '') + '。可以撳「換一批」或過日刷新委託～');
      toast(`勝利！＋${goldDelta} 金 · 聲譽＋${repDelta}`, 'ok');
    } else {
      goldDelta = Math.max(8, Math.floor(q.reward * 0.08));
      repDelta = -1;
      state.gold += goldDelta;
      state.rep = Math.max(0, state.rep + repDelta);
      state._lastRepDelta = repDelta;
      setLilyMood('panic');
      popEmoji('sweat');
      flashStamp('reject');
      try { flashRankFx('miss'); } catch (e) {}
      const namesL = partyList().front.concat(partyList().back).map(memberLabel).join('、') || '隊伍';
      try { partyList().front.concat(partyList().back).forEach((id) => addBond(id, 2, true)); } catch (e) {}
      say(`「${q.name}」惜敗…${namesL} 帶回安慰金＋${goldDelta}，聲譽 ${repDelta}（而家 ${state.rep}）。調整編成或補給再試啦。`);
      toast(`敗北…＋${goldDelta} 金 · 聲譽${repDelta}`, 'warn');
    }
    updateEconomyUI();
    checkAchievements();
    saveState();
    renderQuestTiles();
    if (dungeonHint) {
      dungeonHint.textContent = win
        ? `${laneTag} 勝利：${q.name}`
        : `${laneTag} 敗北：${q.name}`;
    }
  }

  document.getElementById('btn-accept').addEventListener('click', () => {
    if (modalMode === 'day') { advanceDay(); closeModal(); return; }
    if (!activeQuest) return;
    acceptQuest(activeQuest);
  });
  document.getElementById('btn-dispatch').addEventListener('click', () => {
    if (modalMode === 'day') { manualRefreshQuests(); closeModal(); return; }
    if (!activeQuest) return;
    dispatchQuest(activeQuest);
  });

  document.getElementById('btn-info').addEventListener('click', () => {
    setLilyMood('shy');
    popEmoji('sweat');
    say('诶？突然介紹人家……有啲害羞啦……');
    openPlainModal('莉莉 · 櫃台',
      '名：莉莉\n身份：冒險者公會櫃台接待\n服裝：正面女僕半身＋細工作台\n職責：接任務、派道具、派出結算\n\n玩法：選任務→接任務→庫存派道具→派出→地城結果→金幣／聲譽');
  });

  document.getElementById('btn-day').addEventListener('click', () => {
    openDayModal();
  });
  const petBtn = document.getElementById('btn-pet');
  if (petBtn) petBtn.addEventListener('click', () => openPetModal());
  const achBtn = document.getElementById('btn-ach');
  if (achBtn) achBtn.addEventListener('click', () => openAchModal());
  const shopBtn = document.getElementById('btn-shop');
  if (shopBtn) shopBtn.addEventListener('click', () => openShopModal());
  const mailBtn = document.getElementById('btn-mail');
  if (mailBtn) mailBtn.addEventListener('click', () => openMailModal());
  const settingsBtn = document.getElementById('btn-settings');
  if (settingsBtn) settingsBtn.addEventListener('click', () => openSettingsModal());
  const trainBtn = document.getElementById('btn-train');
  if (trainBtn) trainBtn.addEventListener('click', () => openTrainModal());
  const craftBtn = document.getElementById('btn-craft');
  if (craftBtn) craftBtn.addEventListener('click', () => openCraftModal());
  const recruitBtn = document.getElementById('btn-recruit');
  if (recruitBtn) recruitBtn.addEventListener('click', () => openRecruitModal());


  const economyBtn = document.getElementById('btn-economy');
  if (economyBtn) {
    economyBtn.addEventListener('click', () => {
      openPlainModal('金庫與聲譽',
        `現有金幣：${state.gold}\n目前聲譽：${repLabel(state.rep)}（${state.rep}）\n段位：${repRank(state.rep).label}\n\n勝：全額報酬＋聲譽↑\n敗：少少安慰金＋聲譽微跌\n\n進度已存 localStorage`);
    });
  }

  const members = {
    sword: { line: '前衛', job: '劍士', name: '艾登', talk: '我係前衛劍士艾登，交給我頂住前線！' },
    tank: { line: '前衛', job: '盾衛', name: '蓋洛', talk: '我係前衛盾戰蓋洛，負責擋傷害！' },
    spear: { line: '前衛', job: '槍兵', name: '青葉', talk: '槍兵青葉喺度，突進就靠我～' },
    rogue: { line: '前衛', job: '盜賊', name: '妮可', talk: '盜賊妮可就緒，側翼交給我！' },
    knight: { line: '前衛', job: '女騎士', name: '希琳', talk: '女騎士希琳報到——盾同劍，我守住大家！' },
    mage: { line: '後衛', job: '法師', name: '路卡', talk: '後衛法師路卡喺度，魔法輸出同支援～' },
    healer: { line: '後衛', job: '治療', name: '米莉', talk: '治療米莉就緒，會睇實大家血量！' },
    archer: { line: '後衛', job: '弓手', name: '葵', talk: '弓手葵就位，遠距輸出靠我。' },
    bard: { line: '後衛', job: '吟遊', name: '里恩', talk: '詩人里恩～用歌幫大家加持！' },
    witch: { line: '後衛', job: '魔女', name: '薇爾', talk: '魔女薇爾準備好，藥劑同咒文一齊上～' }
  };

  const ROSTER = [
    { id: 'sword', line: 'front', cost: 0, role: '劍士' },
    { id: 'tank', line: 'front', cost: 0, role: '盾戰' },
    { id: 'spear', line: 'front', cost: 0, role: '槍兵' },
    { id: 'rogue', line: 'front', cost: 0, role: '盜賊' },
    { id: 'knight', line: 'front', cost: 80, role: '女騎士' },
    { id: 'healer', line: 'back', cost: 0, role: '治療' },
    { id: 'archer', line: 'back', cost: 0, role: '弓手' },
    { id: 'witch', line: 'back', cost: 90, role: '魔女' },
    { id: 'bard', line: 'back', cost: 0, role: '詩人' },
    { id: 'mage', line: 'back', cost: 0, role: '法師' }
  ];
  const DEFAULT_RECRUITED = ['sword', 'tank', 'spear', 'rogue', 'mage', 'healer', 'archer', 'bard'];
  function chibiHeadSrc(id) { return 'assets/chibi/head-' + id + '.png?v=' + ASSET_V; }
  function chibiFullSrc(id) { return 'assets/chibi/full-' + id + '.png?v=' + ASSET_V; }
  function isRecruited(id) {
    if (!state.recruited || !state.recruited.length) state.recruited = DEFAULT_RECRUITED.slice();
    return state.recruited.indexOf(id) >= 0;
  }
  function memberLabel(id) {
    const m = members[id] || {};
    return (m.name ? m.name + '・' : '') + (m.job || id);
  }
  const EXPAND1_QUESTS = ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'];
  function bondOf(id) {
    return (state.bonds && state.bonds[id]) || 0;
  }
  function addBond(id, n, silent) {
    if (!id) return;
    if (typeof isRecruited === 'function' && !isRecruited(id)) return;
    if (!state.bonds) state.bonds = {};
    const before = state.bonds[id] || 0;
    state.bonds[id] = Math.max(0, Math.min(100, before + (n || 0)));
    if (!silent && state.bonds[id] > before) {
      try { flashFriendship(); } catch (e) {}
    }
    try { maybeBondTalk(id, before, state.bonds[id]); } catch (e) {}
  }
  function maybeBondTalk(id, before, after) {
    const generic = { 20: '開始信得過公會啦。', 40: '同會長一齊出任務，感覺唔錯。', 70: '……下次都交俾我哋啦。' };
    const special = {
      knight: { 20: '希琳：「盔甲擦亮咗……我會守好大門。」', 40: '希琳：「試煉之後，我更想留喺呢度。」', 70: '希琳：「會長，我嘅劍以後都為公會。」' },
      witch: { 20: '薇爾：「藥唔苦……多謝你信我。」', 40: '薇爾：「護法陣可以再密啲，我幫你。」', 70: '薇爾：「呢枝杖，只借畀你哋。」' }
    };
    [20, 40, 70].forEach((t) => {
      if (before < t && after >= t) {
        const msg = (special[id] && special[id][t]) || (memberLabel(id) + '：「' + generic[t] + '」');
        try { say(msg); } catch (e) {}
        try { toast('羈絆 ' + memberLabel(id) + ' ' + after, 'ok'); } catch (e) {}
      }
    });
  }
  function giftBondFromItem(itemName) {
    const n = itemName === '羈絆護符' ? 20 : (itemName === '好友信物' ? 12 : 0);
    if (!n) return false;
    const p = partyList();
    const id = (state.party && state.party.leader) || (p.front && p.front[0]) || (p.back && p.back[0]);
    if (!id) return false;
    addBond(id, n);
    try { say('將「' + itemName + '」交咗畀' + memberLabel(id) + '，羈絆升至 ' + bondOf(id) + '。'); } catch (e) {}
    return true;
  }
  function ensureExpandQuestsOnBoard() {
    if (!Array.isArray(state.board) || state.board.length !== 3) return;
    const missing = EXPAND1_QUESTS.filter((id) => state.board.indexOf(id) < 0);
    if (!missing.length) return;
    let mi = 0;
    for (let i = 0; i < state.board.length && mi < missing.length; i++) {
      const id = state.board[i];
      if (EXPAND1_QUESTS.indexOf(id) >= 0) continue;
      const st = state.quests[id];
      if (st && (st.status === 'accepted' || st.status === 'active')) continue;
      const nid = missing[mi++];
      try { if (typeof clearQuestRefs === 'function') clearQuestRefs(id); } catch (e) {}
      state.board[i] = nid;
      if (!state.quests[nid] || state.quests[nid].status === 'done') {
        state.quests[nid] = { status: 'open', result: null, rateAtDispatch: null };
      }
      if (selectedQuestId === id) selectedQuestId = nid;
    }
    state.pendingExpandQuests = missing.slice(mi);
  }
  function showRecruitTip(force) {
    try { if (typeof ensureTutorialSeen === 'function') ensureTutorialSeen(); } catch (e) {}
    if (!force && state.tutorial && state.tutorial.seenRecruit) return;
    if (!state.tutorial) state.tutorial = {};
    state.tutorial.seenRecruit = true;
    saveState();
    let tip = document.getElementById('tutorial-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'tutorial-tip';
      tip.className = 'tutorial-tip';
      const host = document.getElementById('app') || document.body;
      host.appendChild(tip);
    }
    tip.className = 'tutorial-tip tip-recruit';
    tip.innerHTML =
      '<img class="tip-arrow" src="assets/ui/guide-arrow-up.png?v=' + ASSET_V + '" alt=""/>' +
      '<img class="tip-hand" src="assets/ui/guide-hand-tap.png?v=' + ASSET_V + '" alt=""/>' +
      '<span>撳「招募」請希琳／薇爾入會～</span>' +
      '<button type="button" class="tip-ok" id="tip-dismiss">知道了</button>';
    tip.hidden = false;
    const d = document.getElementById('tip-dismiss');
    if (d) d.onclick = () => { tip.hidden = true; };
    clearTimeout(showRecruitTip._t);
    showRecruitTip._t = setTimeout(() => { tip.hidden = true; }, 5200);
  }
  function showPartyTip(force) {
    if (!force && state.tutorial && state.tutorial.seenParty) return;
    if (!state.tutorial) state.tutorial = {};
    state.tutorial.seenParty = true;
    saveState();
    let tip = document.getElementById('tutorial-tip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'tutorial-tip';
      tip.className = 'tutorial-tip';
      const host = document.getElementById('app') || document.body;
      host.appendChild(tip);
    }
    tip.className = 'tutorial-tip tip-party';
    tip.innerHTML =
      '<img class="tip-arrow" src="assets/ui/guide-arrow-up.png?v=' + ASSET_V + '" alt=""/>' +
      '<img class="tip-hand" src="assets/ui/guide-hand-tap.png?v=' + ASSET_V + '" alt=""/>' +
      '<span>撳兩側頭像編成——把新人編入隊伍～</span>' +
      '<button type="button" class="tip-ok" id="tip-dismiss">知道了</button>';
    tip.hidden = false;
    const d = document.getElementById('tip-dismiss');
    if (d) d.onclick = () => { tip.hidden = true; };
    clearTimeout(showPartyTip._t);
    showPartyTip._t = setTimeout(() => { tip.hidden = true; }, 6000);
  }


  const STATUS_DEFS = {
    burn:   { id: 'burn',   label: '灼傷', src: 'assets/ui/ailment-burn.png' },
    freeze: { id: 'freeze', label: '冰凍', src: 'assets/ui/ailment-freeze.png' },
    poison: { id: 'poison', label: '中毒', src: 'assets/ui/ailment-poison.png' },
    regen:  { id: 'regen',  label: '再生', src: 'assets/status/status-regen.png' },
    sleep:  { id: 'sleep',  label: '睡眠', src: 'assets/status/status-sleep.png' },
    stun:   { id: 'stun',   label: '暈眩', src: 'assets/status/status-stun.png' },
    buff:   { id: 'buff',   label: '強化', src: 'assets/status/status-buff.png' },
    atkUp:  { id: 'atkUp',  label: '攻擊↑', src: 'assets/ui/buff-atk-up.png' },
    defUp:  { id: 'defUp',  label: '防禦↑', src: 'assets/ui/buff-def-up.png' },
    debuff: { id: 'debuff', label: '弱化', src: 'assets/status/status-debuff.png' },
    hungry: { id: 'hungry', label: '飢餓', src: 'assets/status/status-hungry.png' },
    sleepy: { id: 'sleepy', label: '睏倦', src: 'assets/status/status-sleepy.png' },
    happy:  { id: 'happy',  label: '開心', src: 'assets/status/status-happy.png' }
  };
  const STATUS_ALIAS = { burn: 'burn', freeze: 'freeze', poison: 'poison', regen: 'regen', sleep: 'sleep', stun: 'stun', buff: 'buff', atkUp: 'atkUp', defUp: 'defUp', debuff: 'debuff', hungry: 'hungry', sleepy: 'sleepy', happy: 'happy', hunger: 'hungry', tired: 'sleepy', atk: 'atkUp', def: 'defUp' };

  function statusSrc(id) {
    const d = STATUS_DEFS[id] || STATUS_DEFS[STATUS_ALIAS[id]];
    return d ? (d.src + '?v=' + ASSET_V) : '';
  }
  function ensurePartyStatus() {
    if (!state.partyStatus || typeof state.partyStatus !== 'object') state.partyStatus = {};
  }
  function clearPartyStatus() {
    state.partyStatus = {};
    renderPartyStatusRow();
  }
  function applyMockStatuses(win) {
    ensurePartyStatus();
    const ids = partyList().front.concat(partyList().back);
    const pool = win
      ? ['regen', 'buff', 'poison', 'stun']
      : ['poison', 'debuff', 'stun', 'sleep', 'freeze'];
    state.partyStatus = {};
    ids.forEach((id, i) => {
      const st = pool[i % pool.length];
      state.partyStatus[id] = win && i === 0 ? ['regen'] : [st];
      if (win && i === 1) state.partyStatus[id] = ['burn'];
    });
  }
  function renderPartyStatusRow() {
    const row = document.getElementById('party-status-row');
    if (!row) return;
    ensurePartyStatus();
    const chips = [];
    Object.keys(state.partyStatus || {}).forEach((id) => {
      const list = state.partyStatus[id] || [];
      const info = members[id];
      list.forEach((sid) => {
        const def = STATUS_DEFS[sid];
        if (!def) return;
        chips.push('<span class="st-chip" title="' + (info ? info.job : id) + ' · ' + def.label + '">' +
          '<img src="' + statusSrc(sid) + '" alt="' + def.label + '"/>' +
          (info ? info.job : id) + '·' + def.label + '</span>');
      });
    });
    row.innerHTML = chips.join('');
  }


  const SKILL_BY_JOB = {
    sword: { id: 'slash', src: 'assets/icons/skill-slash.png', label: '斬擊', bonus: 3 },
    tank: { id: 'shield', src: 'assets/icons/skill-shield.png', label: '盾防', bonus: 2 },
    spear: { id: 'slash', src: 'assets/icons/skill-slash.png', label: '突刺', bonus: 3 },
    rogue: { id: 'steal', src: 'assets/skills/sk-steal.png', label: '盜取', bonus: 4 },
    mage: { id: 'fireball', src: 'assets/skills/skill-fireball.png', label: '火球', bonus: 4 },
    healer: { id: 'heal', src: 'assets/icons/skill-heal.png', label: '治療', bonus: 3 },
    archer: { id: 'arrow', src: 'assets/skills/sk-arrow.png', label: '貫箭', bonus: 3 },
    bard: { id: 'heal', src: 'assets/icons/skill-heal.png', label: '鼓舞', bonus: 2 },
    knight: { id: 'shield', src: 'assets/icons/skill-shield.png', label: '騎士守護', bonus: 4 },
    witch: { id: 'fireball', src: 'assets/skills/skill-fireball.png', label: '咒藥', bonus: 4 }
  };
  function skillBonus() {
    const p = partyList();
    let b = 0;
    p.front.concat(p.back).forEach((id) => {
      const sk = SKILL_BY_JOB[id];
      if (sk) b += sk.bonus;
    });
    return Math.min(12, b);
  }

  const BADGE_MAP = { sword: 'sword', tank: 'tank', mage: 'mage', healer: 'healer', archer: 'archer', rogue: 'rogue', spear: 'sword', bard: 'mage', knight: 'sword', witch: 'mage' };
  const CLASS_BADGE = {
    sword: 'assets/badges/class-warrior.png', tank: 'assets/badges/class-warrior.png', spear: 'assets/badges/class-warrior.png',
    mage: 'assets/badges/class-mage.png', bard: 'assets/badges/class-mage.png', rogue: 'assets/badges/class-mage.png',
    healer: 'assets/badges/class-healer.png', archer: 'assets/badges/class-warrior.png',
    knight: 'assets/badges/class-warrior.png', witch: 'assets/badges/class-mage.png'
  };
  function syncHeadActiveUI() {
    const sf = document.getElementById('party-strip-front');
    if (sf && sf.querySelectorAll('.head-slot').length < 5 && typeof renderPartyStrips === 'function') {
      try { renderPartyStrips(); } catch (e) {}
    }
    const p = partyList();
    if (!state.party) state.party = { front: [], back: [], leader: null };
    if (!state.party.leader || !(p.front.includes(state.party.leader) || p.back.includes(state.party.leader))) {
      state.party.leader = p.front[0] || p.back[0] || null;
    }
    ensurePartyStatus();
    document.querySelectorAll('.head-slot').forEach((el) => {
      const line = el.dataset.line;
      const id = el.dataset.id;
      const on = line === 'front' ? p.front.includes(id) : p.back.includes(id);
      el.classList.toggle('active', on);
      // empty-slot mark for inactive
      let empty = el.querySelector('.empty-mark');
      if (!empty) {
        empty = document.createElement('img');
        empty.className = 'empty-mark';
        empty.alt = '';
        el.appendChild(empty);
      }
      empty.src = (el.classList.contains('locked') ? 'assets/ui/party-slot-locked.png' : 'assets/ui/party-slot-empty.png') + '?v=' + ASSET_V;
      empty.style.display = on ? 'none' : '';
      // pos badge
      let pos = el.querySelector('.pos-badge');
      if (!pos) {
        pos = document.createElement('img');
        pos.className = 'pos-badge';
        pos.alt = '';
        el.appendChild(pos);
      }
      pos.src = (line === 'front' ? 'assets/party/pos-front.png' : 'assets/party/pos-back.png') + '?v=' + ASSET_V;
      pos.style.display = on ? '' : 'none';
      // leader badge
      let lead = el.querySelector('.leader-badge');
      if (!lead) {
        lead = document.createElement('img');
        lead.className = 'leader-badge';
        lead.alt = '隊長';
        el.appendChild(lead);
      }
      lead.src = 'assets/ui/party-leader-crown.png?v=' + ASSET_V;
      lead.style.display = (on && state.party.leader === id) ? '' : 'none';
      let cls = el.querySelector('.class-badge');
      if (!cls) {
        cls = document.createElement('img');
        cls.className = 'class-badge';
        cls.alt = '';
        el.appendChild(cls);
      }
      const csrc = CLASS_BADGE[id];
      if (csrc) {
        cls.src = csrc + '?v=' + ASSET_V;
        cls.style.display = on ? '' : 'none';
      } else {
        cls.style.display = 'none';
      }
      let ready = el.querySelector('.ready-check');
      if (!ready) {
        ready = document.createElement('img');
        ready.className = 'ready-check';
        ready.alt = '就緒';
        el.appendChild(ready);
      }
      ready.src = 'assets/ui/party-ready-check.png?v=' + ASSET_V;
      ready.style.display = on ? '' : 'none';
      let skI = el.querySelector('.skill-ico');
      const sk = SKILL_BY_JOB[id];
      if (sk) {
        if (!skI) {
          skI = document.createElement('img');
          skI.className = 'skill-ico';
          skI.alt = sk.label;
          el.appendChild(skI);
        }
        skI.src = sk.src + '?v=' + ASSET_V;
        skI.title = sk.label + ' +' + sk.bonus + '%';
        skI.style.display = on ? '' : 'none';
        let cdR = el.querySelector('.cd-ready');
        if (!cdR) {
          cdR = document.createElement('img');
          cdR.className = 'cd-ready';
          cdR.alt = '就緒';
          el.appendChild(cdR);
        }
        cdR.src = 'assets/ui/cd-ready.png?v=' + ASSET_V;
        cdR.style.display = on ? '' : 'none';
      } else if (skI) {
        skI.style.display = 'none';
        const cdR2 = el.querySelector('.cd-ready');
        if (cdR2) cdR2.style.display = 'none';
      }
      // status icons on head
      let srow = el.querySelector('.status-row');
      if (!srow) {
        srow = document.createElement('div');
        srow.className = 'status-row';
        el.appendChild(srow);
      }
      const sts = on ? (state.partyStatus[id] || []) : [];
      srow.innerHTML = sts.map((sid) => {
        const def = STATUS_DEFS[sid];
        if (!def) return '';
        return '<img class="status-ico" src="' + statusSrc(sid) + '" alt="' + def.label + '" title="' + def.label + '"/>';
      }).join('');
      let badge = el.querySelector('.job-badge');
      const bid = BADGE_MAP[id];
      if (bid) {
        if (!badge) {
          badge = document.createElement('img');
          badge.className = 'job-badge';
          badge.alt = '';
          el.appendChild(badge);
        }
        badge.src = 'assets/badges/badge-' + bid + '.png?v=' + ASSET_V;
        badge.style.display = on ? '' : 'none';
      }
      ensureHeadBars(el);
      const bars = getLiveBars(id);
      const fillHp = el.querySelector('.head-bar.hp .bar-fill');
      const fillMp = el.querySelector('.head-bar.mp .bar-fill');
      const fillXp = el.querySelector('.head-bar.xp .bar-fill');
      if (fillHp) fillHp.style.width = bars.hp + '%';
      if (fillMp) fillMp.style.width = bars.mp + '%';
      if (fillXp) fillXp.style.width = bars.xp + '%';
    });
    renderPartyStatusRow();
    try { syncPartyEmpty(); } catch (e) {}
  }


  let swapArmed = false;
  let swapPickEl = null;

  function setSwapArmed(on) {
    swapArmed = !!on;
    const btn = document.getElementById('btn-party-swap');
    if (btn) btn.classList.toggle('armed', swapArmed);
    document.querySelectorAll('.head-slot').forEach((el) => el.classList.remove('swap-pick'));
    swapPickEl = null;
    if (swapArmed) toast('交換模式：撳兩名隊員交換前後衛／次序');
  }

  function swapTwoMembers(idA, lineA, idB, lineB) {
    if (!state.party) state.party = { front: [], back: [], leader: null };
    const front = state.party.front.filter((x) => x !== idA && x !== idB);
    const back = state.party.back.filter((x) => x !== idA && x !== idB);
    // A goes to B's line, B goes to A's line
    if (lineB === 'front') front.push(idA); else back.push(idA);
    if (lineA === 'front') front.push(idB); else back.push(idB);
    state.party.front = front;
    state.party.back = back;
    if (!state.party.leader || (!front.includes(state.party.leader) && !back.includes(state.party.leader))) {
      state.party.leader = front[0] || back[0] || null;
    }
  }


  function recruitFee(id) {
    const row = ROSTER.find((r) => r.id === id);
    let fee = row ? (row.cost || 0) : 80;
    if (fee <= 0) return 0;
    if (state.recruitDiscount) fee = Math.floor(fee * (1 - state.recruitDiscount));
    if ((state.recruitVoucher || 0) > 0 || document.querySelector('.slot.filled[data-item="招人介紹信"]:not(.consumed)')) {
      fee = Math.floor(fee * 0.7);
    }
    return fee;
  }

  function hireAdventurer(id) {
    const info = members[id] || { job: id, line: '', name: id, talk: '……' };
    if (isRecruited(id)) { toast(memberLabel(id) + ' 已經入會'); return false; }
    const fee = recruitFee(id);
    if (state.gold < fee) {
      setLilyMood('think');
      toast('金幣唔夠，賺多轉再請人', 'warn');
      say('金庫未夠 ' + fee + ' 金……派完手頭委託再請「' + memberLabel(id) + '」啦。');
      return false;
    }
    state.gold -= fee;
    if ((state.recruitVoucher || 0) > 0) state.recruitVoucher -= 1;
    else {
      const slot = document.querySelector('.slot.filled[data-item="招人介紹信"]:not(.consumed)');
      if (slot && typeof consumeNamed === 'function') {
        try { consumeNamed('招人介紹信'); } catch (e) {}
      }
    }
    if (!state.recruited) state.recruited = DEFAULT_RECRUITED.slice();
    state.recruited.push(id);
    try { addBond(id, 15); } catch (e) {}
    updateEconomyUI();
    renderPartyStrips();
    syncHeadActiveUI();
    saveState();
    setLilyMood('smile');
    popEmoji('hearts');
    sayAs('partyRecruiter', '歡迎「' + memberLabel(id) + '」加入公會！記得撳頭像編成～');
    say('（' + info.line + '·' + info.job + '）「' + info.talk + '」——請好啦，撳頭像就可以編入隊伍。');
    toast('已招募：' + memberLabel(id) + '（-' + fee + ' 金）', 'ok');
    try { setTimeout(function () { showPartyTip(); }, 450); } catch (e) {}
    return true;
  }

  function openRecruitModal(focusId) {
    activeQuest = null;
    modalMode = 'recruit';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '公會招募';
    try {
      sayAs('partyRecruiter', '十位新面孔喺門口等——前衛後衛都齊，揀一位請入會啦！');
    } catch (e) {}
    let html = npcBannerHtml('partyRecruiter', '隊伍招募員') +
      '<div class="recruit-hint">見習八人已登記。女騎士希琳同魔女薇爾需要招募費（祭典或介紹信可減）。入會後撳隊伍欄頭像編成。</div>' +
      '<div class="recruit-grid">';
    ROSTER.forEach((row) => {
      const info = members[row.id] || {};
      const inParty = isRecruited(row.id) && (partyList().front.includes(row.id) || partyList().back.includes(row.id));
      const hired = isRecruited(row.id);
      const fee = recruitFee(row.id);
      const focus = focusId === row.id ? ' focus' : '';
      html += '<div class="recruit-card' + (hired ? ' hired' : '') + focus + '" data-recruit="' + row.id + '">' +
        '<img class="recruit-full" src="' + chibiFullSrc(row.id) + '" alt="' + (info.job || '') + '"/>' +
        '<img class="recruit-head" src="' + chibiHeadSrc(row.id) + '" alt=""/>' +
        '<div class="recruit-meta"><b>' + memberLabel(row.id) + '</b><small>' + (info.line || row.line) +
        (hired ? ' · 已入會 · 羈絆 ' + bondOf(row.id) : ' · 招募費 ' + fee + ' 金') +
        (inParty ? ' · 編成中' : '') + '</small></div>' +
        (hired
          ? '<button type="button" class="recruit-btn" data-form="' + row.id + '">' + (inParty ? '已編成' : '去編成') + '</button>'
          : '<button type="button" class="recruit-btn hire" data-hire="' + row.id + '">招募 ' + fee + '金</button>') +
        '</div>';
    });
    html += '</div>';
    modalBody.innerHTML = html;
    modalActions.hidden = true;
    modal.hidden = false;
    modalBody.querySelectorAll('[data-hire]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (hireAdventurer(btn.getAttribute('data-hire'))) openRecruitModal(btn.getAttribute('data-hire'));
      });
    });
    modalBody.querySelectorAll('[data-form]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeModal();
        const id = btn.getAttribute('data-form');
        const el = document.querySelector('.head-slot[data-id="' + id + '"]');
        if (el) selectHead(el);
        else toast('請喺隊伍欄撳頭像編成');
      });
    });
  }

  function renderPartyStrips() {
    const front = document.getElementById('party-strip-front');
    const back = document.getElementById('party-strip-back');
    if (!front || !back) return;
    function paint(host, line) {
      host.innerHTML = '';
      ROSTER.filter((r) => r.line === line).forEach((row) => {
        const info = members[row.id] || {};
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'head-slot' + (isRecruited(row.id) ? '' : ' locked');
        btn.dataset.line = line;
        btn.dataset.id = row.id;
        btn.dataset.job = info.job || row.role;
        btn.title = memberLabel(row.id);
        const img = document.createElement('img');
        img.src = chibiHeadSrc(row.id);
        img.alt = info.job || row.role;
        btn.appendChild(img);
        if (!isRecruited(row.id)) {
          const lock = document.createElement('img');
          lock.className = 'lock-mark';
          lock.alt = '未入會';
          lock.src = 'assets/ui/party-slot-locked.png?v=' + ASSET_V;
          btn.appendChild(lock);
          const tag = document.createElement('span');
          tag.className = 'unhired-tag';
          tag.textContent = '未入會';
          btn.appendChild(tag);
        } else if (bondOf(row.id) >= 20) {
          const ht = document.createElement('span');
          ht.className = 'bond-pip';
          ht.title = '羈絆 ' + bondOf(row.id);
          ht.textContent = '♥' + bondOf(row.id);
          btn.appendChild(ht);
        }
        host.appendChild(btn);
      });
    }
    paint(front, 'front');
    paint(back, 'back');
  }

  function selectHead(btn) {
    const line = btn.dataset.line; // front | back
    const id = btn.dataset.id;
    const info = members[id] || { line: line === 'front' ? '前衛' : '後衛', job: btn.dataset.job || '', talk: '……' };
    if (!isRecruited(id)) {
      toast('先去招募處請「' + memberLabel(id) + '」入會');
      openRecruitModal(id);
      return;
    }
    if (!state.party) state.party = { front: [], back: [], leader: null };
    if (!Array.isArray(state.party.front)) state.party.front = [];
    if (!Array.isArray(state.party.back)) state.party.back = [];
    if (swapArmed) {
      if (!swapPickEl) {
        swapPickEl = btn;
        btn.classList.add('swap-pick');
        toast('再撳另一位交換');
        return;
      }
      if (swapPickEl === btn) { setSwapArmed(false); return; }
      swapTwoMembers(swapPickEl.dataset.id, swapPickEl.dataset.line, id, line);
      setSwapArmed(false);
      syncHeadActiveUI();
      saveState();
      renderQuestTiles();
      toast('交換完成');
      say('編成已調整～前後衛位換好，隊長角標記得睇實。');
      return;
    }
    const arr = line === 'front' ? state.party.front : state.party.back;
    const idx = arr.indexOf(id);
    if (idx >= 0) {
      // keep at least 1 total member
      if (partyCount() <= 1) {
        toast('最少要留 1 人編成');
        return;
      }
      arr.splice(idx, 1);
      toast(`撤下${info.line}：${info.job}`);
    } else {
      arr.push(id);
      if (!state.party.leader) state.party.leader = id;
      toast(`編入${info.line}：${info.job}（+4%）`);
    }
    if (state.party.leader === id && !arr.includes(id)) {
      state.party.leader = (state.party.front[0] || state.party.back[0] || null);
    }
    syncHeadActiveUI();
    saveState();
    renderQuestTiles();
    const q = selectedQuestId ? questById(selectedQuestId) : null;
    if (q && state.quests[q.id] && (state.quests[q.id].status === 'open' || state.quests[q.id].status === 'accepted')) {
      const br = rateBreakdown(q);
      say(`（${info.line}·${info.job}）「${info.talk}」——「${q.name}」成功率而家 ${br.total}%（編成 ${br.party >= 0 ? '+' : ''}${br.party}%）。`);
    } else {
      say(`（${info.line}·${info.job}）「${info.talk}」—— 編成 ${partyCount()} 人，揀任務就睇到成功率變化～`);
    }
  }

  function onHeadSlotClick(e) {
    const btn = e.target.closest && e.target.closest('.head-slot');
    if (!btn) return;
    e.stopPropagation();
    try { showTutorialTip('drag'); } catch (err) {}
    selectHead(btn);
  }
  const stripF = document.getElementById('party-strip-front');
  const stripB = document.getElementById('party-strip-back');
  if (stripF) stripF.addEventListener('click', onHeadSlotClick);
  if (stripB) stripB.addEventListener('click', onHeadSlotClick);

  function toggleItemOnSelected(slot) {
    if (!selectedQuestId) {
      toast('請先揀一張任務，再派道具');
      return;
    }
    const st = state.quests[selectedQuestId];
    if (!st || st.status === 'active' || st.status === 'done') {
      toast('進行中／已完成任務唔可以再改道具');
      return;
    }
    if (st.status === 'open') {
      toast('請先「接任務」，再派道具');
      return;
    }
    const item = slot.dataset.item;
    const bonus = parseInt(slot.dataset.bonus, 10) || 0;
    if (state.consumed.includes(item)) {
      toast(`「${item}」已消耗`);
      return;
    }
    if (!state.assigned[selectedQuestId]) state.assigned[selectedQuestId] = [];
    const arr = state.assigned[selectedQuestId];
    const idx = arr.indexOf(item);
    if (idx >= 0) {
      arr.splice(idx, 1);
      toast(`收回「${item}」`);
    } else {
      const owner = itemOwner(item);
      if (owner && owner !== selectedQuestId) {
        toast(`「${item}」已派畀其他任務`);
        return;
      }
      if (arr.length >= MAX_ITEMS_PER_QUEST) {
        toast(`每任務最多 ${MAX_ITEMS_PER_QUEST} 件道具`);
        return;
      }
      arr.push(item);
      toast(`派畀任務：${item}（+${bonus}%）`);
      if (item === '燉菜' || item === '乾糧' || item === '糖果' || item === '棒棒糖' || item === '熱茶' || item === '餡餅') {
        try { state.fatigue = Math.max(0, (state.fatigue || 0) - 1); syncNeedStatus(); toast('飽肚開心', 'ok'); } catch (e) {}
      }
      if (item === '慶祝禮物' || item === '慶祝氣球' || item === '獻花花禮' || item === '禮物信') {
        setLilyMood('cheer');
        popEmoji('hearts');
      }
      if (item === '好友信物' || item === '羈絆護符') {
        try { giftBondFromItem(item); } catch (e) {}
      }
    }
    saveState();
    renderQuestTiles();
    const q = questById(selectedQuestId);
    if (q) say(`「${q.name}」而家成功率 ${successRate(q)}%。`);
  }

  document.querySelectorAll('.slot.filled').forEach((slot) => {
    slot.addEventListener('click', () => toggleItemOnSelected(slot));
  });

  function autoSelectItems() {
    // clear assignments for open/accepted only
    Object.keys(state.assigned).forEach((qid) => {
      const st = state.quests[qid];
      if (st && (st.status === 'open' || st.status === 'accepted')) {
        state.assigned[qid] = [];
      }
    });

    const slots = Array.from(document.querySelectorAll('.slot.filled'))
      .map((el) => ({
        item: el.dataset.item,
        bonus: parseInt(el.dataset.bonus, 10) || 0
      }))
      .filter((s) => !state.consumed.includes(s.item))
      .sort((a, b) => b.bonus - a.bonus);

    const targets = boardQuests().filter((q) => {
      const st = state.quests[q.id];
      return st && (st.status === 'accepted' || st.status === 'open');
    });
    // prefer accepted; if none, use open
    let pool = targets.filter((q) => state.quests[q.id].status === 'accepted');
    if (!pool.length) pool = targets;

    const used = new Set();
    const order = pool.slice().sort((a, b) => successRate(a) - successRate(b));
    for (let round = 0; round < MAX_ITEMS_PER_QUEST; round++) {
      for (const q of order) {
        if (!state.assigned[q.id]) state.assigned[q.id] = [];
        if (state.assigned[q.id].length >= MAX_ITEMS_PER_QUEST) continue;
        const next = slots.find((s) => !used.has(s.item));
        if (!next) break;
        state.assigned[q.id].push(next.item);
        used.add(next.item);
      }
    }

    if (!selectedQuestId && order.length) selectedQuestId = order[0].id;
    // auto-accept selected if still open for smoother play? No — keep explicit accept.
    saveState();
    renderQuestTiles();
    const q = questById(selectedQuestId);
    toast(`自動選擇：已派 ${used.size} 件`);
    if (q) {
      say(`自動配好道具啦～「${q.name}」成功率 ${successRate(q)}%。未接嘅記住先接任務再派出！`);
    }
  }

  document.getElementById('btn-auto-items').addEventListener('click', autoSelectItems);

  /* —— 地城跑道 —— */
  const laneUi = {};

  function setDungeonProgress(on, pct) {
    const box = document.getElementById('dungeon-progress');
    const fill = document.getElementById('dungeon-prog-fill');
    const spin = document.getElementById('dungeon-spinner');
    if (!box) return;
    if (!on) {
      box.hidden = true;
      if (spin) spin.classList.remove('spin');
      if (fill) fill.style.width = '0%';
      return;
    }
    box.hidden = false;
    if (spin) spin.classList.add('spin');
    if (fill) fill.style.width = Math.max(0, Math.min(100, pct || 0)) + '%';
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const battleLogEl = document.getElementById('battle-log');
  const battleLogBody = document.getElementById('battle-log-body');
  const battleLogLane = document.getElementById('battle-log-lane');
  const battleLogTitle = document.getElementById('battle-log-title');
  let logFocusLane = 'A';

  function ensureLaneLogs() {
    if (!state.laneLogs) state.laneLogs = { A: [], B: [], C: [] };
    LANE_TAGS.forEach((tag) => {
      if (!Array.isArray(state.laneLogs[tag])) state.laneLogs[tag] = [];
    });
  }

  function clearLaneLog(tag) {
    ensureLaneLogs();
    state.laneLogs[tag] = [];
  }

  function pushLaneLog(tag, text) {
    ensureLaneLogs();
    const line = String(text || '').trim();
    if (!line) return;
    state.laneLogs[tag].push(line);
    if (state.laneLogs[tag].length > 40) state.laneLogs[tag] = state.laneLogs[tag].slice(-40);
    // live update if panel open on this lane
    if (battleLogEl && !battleLogEl.hidden && logFocusLane === tag) renderBattleLogPanel(tag);
  }

  function renderBattleLogPanel(tag) {
    ensureLaneLogs();
    logFocusLane = tag || logFocusLane || 'A';
    const lines = state.laneLogs[logFocusLane] || [];
    if (battleLogLane) battleLogLane.textContent = '跑道 ' + logFocusLane;
    if (battleLogTitle) {
      const occ = state.lanes[logFocusLane];
      const q = occ && occ.questId ? questById(occ.questId) : null;
      battleLogTitle.textContent = q ? ('冒險紀錄 · ' + q.name) : '冒險紀錄';
    }
    if (!battleLogBody) return;
    if (!lines.length) {
      battleLogBody.innerHTML = '<div class="log-empty">未有紀錄。派出任務後再撳地城區睇文字 log～</div>';
      return;
    }
    battleLogBody.innerHTML = lines.map((ln) => '<div class="log-line">' + formatLogLine(ln) + '</div>').join('');
    battleLogBody.scrollTop = battleLogBody.scrollHeight;
  }

  function formatLogLine(s) {
    let out = escapeHtml(s);
    out = out.replace(/\{\{status:([a-z]+)\}\}/g, (m, id) => {
      const def = STATUS_DEFS[id];
      if (!def) return '';
      return '<img class="st-ico" src="' + statusSrc(id) + '" alt="' + def.label + '" title="' + def.label + '"/>';
    });
    return out;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openBattleLog(tag) {
    ensureLaneLogs();
    // prefer clicked lane; fallback last busy / first with logs
    let focus = tag;
    if (!focus) {
      const busy = LANE_TAGS.find((tg) => state.lanes[tg] && state.lanes[tg].phase === 'running');
      const withLog = LANE_TAGS.find((tg) => (state.laneLogs[tg] || []).length);
      focus = busy || withLog || logFocusLane || 'A';
    }
    renderBattleLogPanel(focus);
    if (battleLogEl) battleLogEl.hidden = false;
    try { flashFx('spark'); } catch (e) {}
  }

  function closeBattleLog() {
    if (battleLogEl) battleLogEl.hidden = true;
  }

  function makeActor(cls, src, alt) {
    const el = document.createElement('div');
    el.className = 'lane-actor ' + cls;
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.draggable = false;
    el.appendChild(img);
    return el;
  }

  function setLeft(el, pct) {
    el.style.left = pct + '%';
  }

  function buildLanes() {
    if (!dungeonRoot) return;
    dungeonRoot.innerHTML = '';
    LANE_TAGS.forEach((tag, i) => {
      const lane = document.createElement('div');
      lane.className = 'dungeon-lane';
      lane.dataset.lane = tag;

      const tagEl = document.createElement('span');
      tagEl.className = 'lane-tag';
      tagEl.textContent = tag;
      lane.appendChild(tagEl);

      const fx = document.createElement('span');
      fx.className = 'lane-fx';
      lane.appendChild(fx);

      const hero = DUNGEON_ASSETS.heroes[i % DUNGEON_ASSETS.heroes.length];
      /* idle 預覽：輪用全部怪種（含新骷髏／蝙蝠／狼） */
      const mon = DUNGEON_ASSETS.monsters[(i + 2) % DUNGEON_ASSETS.monsters.length];
      const party = makeActor('party', hero.src, hero.label);
      const monster = makeActor('monster', mon.src, mon.label);
      const chest = makeActor('chest outcome', DUNGEON_ASSETS.win, '寶箱');
      const cross = makeActor('cross outcome', i === 1 ? DUNGEON_ASSETS.loseCross : DUNGEON_ASSETS.loseTomb, '敗北');

      setLeft(party, 6);
      setLeft(monster, 72);
      setLeft(chest, 70);
      setLeft(cross, 48);
      party.classList.add('hidden-actor');
      monster.classList.add('hidden-actor');
      chest.classList.add('hidden-actor');
      cross.classList.add('hidden-actor');

      lane.appendChild(party);
      lane.appendChild(monster);
      lane.appendChild(chest);
      lane.appendChild(cross);
      dungeonRoot.appendChild(lane);

      laneUi[tag] = { lane, party, monster, chest, cross, fx, heroIdx: i };
    });
  }

  function resetLaneVisual(tag) {
    const ui = laneUi[tag];
    if (!ui) return;
    ui.lane.className = 'dungeon-lane';
    ui.fx.className = 'lane-fx';
    ui.fx.textContent = '';
    ui.party.classList.add('hidden-actor');
    ui.monster.classList.add('hidden-actor');
    ui.chest.classList.add('hidden-actor');
    ui.cross.classList.add('hidden-actor');
    ui.party.classList.remove('fighting');
    ui.monster.classList.remove('fighting');
    setLeft(ui.party, 6);
    setLeft(ui.monster, 72);
  }

  function showLaneOutcome(tag, win, fled) {
    const ui = laneUi[tag];
    if (!ui) return;
    try { flashFx(win ? 'win' : 'lose', ui.lane); flashFx('slash', ui.lane); flashFx(win ? 'spark' : 'stun', ui.lane); } catch (e) {}
    ui.party.classList.add('hidden-actor');
    ui.monster.classList.add('hidden-actor');
    let stamp = ui.lane.querySelector('.lane-result-stamp');
    if (!stamp) {
      stamp = document.createElement('img');
      stamp.className = 'lane-result-stamp';
      stamp.alt = '';
      ui.lane.appendChild(stamp);
    }
    if (fled) {
      ui.lane.className = 'dungeon-lane phase-lose flee';
      ui.chest.classList.add('hidden-actor');
      ui.cross.classList.add('hidden-actor');
      ui.fx.innerHTML = '';
      stamp.src = 'assets/ui/result-flee.png?v=' + ASSET_V;
      stamp.hidden = false;
      ui.fx.textContent = '逃跑';
      ui.fx.className = 'lane-fx lose show';
    } else if (win) {
      ui.lane.className = 'dungeon-lane phase-win';
      const openSrc = DUNGEON_ASSETS.winOpen || DUNGEON_ASSETS.win;
      try {
        const qWin = questById(ui._lastQuestId || (state.lanes && state.lanes[tag] && state.lanes[tag].questId));
        if (qWin) openSrc = winChestSrc(qWin.rarity) + '?v=' + ASSET_V;
        else openSrc = 'assets/dungeon/chest-bronze.png?v=' + ASSET_V;
      } catch (e) {}
      ui.chest.querySelector('img').src = openSrc;
      ui.chest.classList.remove('hidden-actor');
      setLeft(ui.chest, 70);
      ui.cross.classList.add('hidden-actor');
      stamp.src = 'assets/ui/result-victory.png?v=' + ASSET_V;
      stamp.hidden = false;
      ui.fx.textContent = '勝利';
      ui.fx.className = 'lane-fx win show';
    } else {
      ui.lane.className = 'dungeon-lane phase-lose';
      const bone = DUNGEON_ASSETS.loseBones || DUNGEON_ASSETS.loseCross;
      ui.cross.querySelector('img').src = bone;
      ui.cross.classList.remove('hidden-actor');
      setLeft(ui.cross, 48);
      ui.chest.classList.add('hidden-actor');
      stamp.src = 'assets/ui/result-defeat.png?v=' + ASSET_V;
      stamp.hidden = false;
      ui.fx.textContent = '敗北';
      ui.fx.className = 'lane-fx lose show';
    }
  }


  function resolveLaneHero(q) {
    const party = state.party || { front: [], back: [] };
    const all = (party.front || []).concat(party.back || []);
    const special = (q && q.special) || '';
    if (special.indexOf('女騎士') >= 0 && all.indexOf('knight') >= 0) return heroAssetById('knight');
    if (special.indexOf('魔女') >= 0 && all.indexOf('witch') >= 0) return heroAssetById('witch');
    const pick = (party.front && party.front[0]) || (party.back && party.back[0]);
    if (pick) return heroAssetById(pick);
    return DUNGEON_ASSETS.heroes[q.laneHero % DUNGEON_ASSETS.heroes.length];
  }

  async function playLaneMission(tag, q, win) {
    const ui = laneUi[tag];
    if (!ui) return;
    // swap sprites to match quest / party
    const hero = resolveLaneHero(q);
    const mon = q.monsterId ? monsterAssetById(q.monsterId)
      : DUNGEON_ASSETS.monsters[q.laneMonster % DUNGEON_ASSETS.monsters.length];
    ui.party.querySelector('img').src = hero.src;
    ui.party.classList.add('chibi-hero');
    ui.party.classList.remove('skill-flash', 'skill-flash-hold');
    ui.monster.querySelector('img').src = mon.src;

    clearLaneLog(tag);
    setDungeonProgress(true, 8);
    pushLaneLog(tag, `【出發】「${q.name}」隊由公會大門出發，開去${q.place}。`);
    pushLaneLog(tag, `【編成】帶頭嘅係${hero.label}，目標戰力 ${q.power}。`);

    resetLaneVisual(tag);
    ui.lane.classList.add('busy', 'phase-walk');
    ui.party.classList.remove('hidden-actor');
    setLeft(ui.party, 6);
    await wait(80);
    setLeft(ui.party, 42);
    setDungeonProgress(true, 28);
    pushLaneLog(tag, '【前進】隊伍沿石道前進，火把晃動，腳步聲響。');
    // door / trap flavour
    const uiDeco = laneUi[tag];
    if (uiDeco && uiDeco.lane) {
      let door = uiDeco.lane.querySelector('.lane-deco.door');
      let trap = uiDeco.lane.querySelector('.lane-deco.trap');
      if (!door) {
        door = document.createElement('img');
        door.className = 'lane-deco door';
        door.src = 'assets/dungeon/tiles/tile-door.png?v=' + ASSET_V;
        uiDeco.lane.appendChild(door);
      }
      const trapKinds = [
        { cls: 'spike', src: 'assets/dungeon/trap-spike.png' },
        { cls: 'arrow', src: 'assets/dungeon/trap-arrow.png' },
        { cls: 'pit', src: 'assets/dungeon/trap-pit.png' }
      ];
      const tk = trapKinds[(state.day + (tag === 'A' ? 0 : tag === 'B' ? 1 : 2)) % trapKinds.length];
      if (!trap) {
        trap = document.createElement('img');
        trap.className = 'lane-deco trap';
        uiDeco.lane.appendChild(trap);
      }
      trap.className = 'lane-deco trap ' + tk.cls;
      trap.src = tk.src + '?v=' + ASSET_V;
      let portal = uiDeco.lane.querySelector('.lane-deco.portal');
      if (!portal) {
        portal = document.createElement('img');
        portal.className = 'lane-deco portal';
        portal.src = 'assets/dungeon/portal.png?v=' + ASSET_V;
        uiDeco.lane.appendChild(portal);
      }
      let mimic = uiDeco.lane.querySelector('.lane-deco.mimic');
      if (!mimic) {
        mimic = document.createElement('img');
        mimic.className = 'lane-deco mimic';
        uiDeco.lane.appendChild(mimic);
      }
      mimic.src = 'assets/dungeon/chest-mimic-closed.png?v=' + ASSET_V;
      let torch = uiDeco.lane.querySelector('.lane-deco.torch');
      if (!torch) {
        torch = document.createElement('img');
        torch.className = 'lane-deco torch';
        torch.src = 'assets/dungeon/torch-wall.png?v=' + ASSET_V;
        uiDeco.lane.appendChild(torch);
      } else {
        torch.src = 'assets/dungeon/torch-wall.png?v=' + ASSET_V;
      }
      door.style.display = '';
      trap.style.display = '';
      portal.style.display = '';
      mimic.style.display = '';
      torch.style.display = '';

      const TILES = [
        { file: 'assets/tiles/tile-wood-floor.png', kind: 'wood' },
        { file: 'assets/tiles/tile-stone-path.png', kind: 'stone' },
        { file: 'assets/tiles/tile-grass.png', kind: 'grass' },
        { file: 'assets/tiles/tile-carpet-red.png', kind: 'carpet' }
      ];
      TILES.forEach((td, ti) => {
        let t = uiDeco.lane.querySelector('.lane-tile.t' + ti);
        if (!t) {
          t = document.createElement('img');
          t.className = 'lane-tile t' + ti;
          uiDeco.lane.appendChild(t);
        }
        t.className = 'lane-tile t' + ti + ' ' + td.kind;
        t.src = td.file + '?v=' + ASSET_V;
        t.style.display = '';
      });
    }
    pushLaneLog(tag, '【門】推開石門，潮濕空氣湧出。');
    await wait(280);
    pushLaneLog(tag, '【傳送門】前方浮現藍光傳送門，隊伍謹慎繞過。');
    await wait(260);
    pushLaneLog(tag, '【陷阱】尖刺陷阱彈起——幸好及時避開！');
    await wait(260);
    pushLaneLog(tag, '【偽裝箱】路邊寶箱……牙關一開，原來係偽裝！');
    try {
      const m = laneUi[tag] && laneUi[tag].lane && laneUi[tag].lane.querySelector('.lane-deco.mimic');
      if (m) m.src = 'assets/dungeon/chest-mimic-lid.png?v=' + ASSET_V;
    } catch (e) {}
    pushLaneLog(tag, '【陷阱】箭矢機關／陷坑交替出現——提高警覺！');
    await wait(260);
    ui.monster.classList.remove('hidden-actor');
    setLeft(ui.monster, 58);
    setDungeonProgress(true, 55);
    pushLaneLog(tag, `【遭遇】前面躀出${mon.label}！雙方對峙。`);
    await wait(320);
    ui.lane.classList.add('phase-fight');
    ui.party.classList.add('fighting');
    ui.monster.classList.add('fighting');
    ui.fx.textContent = '戰鬥';
    ui.fx.className = 'lane-fx show';
    ui.fx.style.background = 'rgba(196,138,90,.85)';
    ui.fx.style.color = '#fff8e0';
    if (q && q.special) {
      try {
        ui.party.classList.remove('skill-flash');
        void ui.party.offsetWidth;
        ui.party.classList.add('skill-flash');
        ui.fx.textContent = '技能閃';
      } catch (e) {}
    }
    const skHero = SKILL_BY_JOB[hero.id] || SKILL_BY_JOB.sword;
    if (skHero) pushLaneLog(tag, `【技能】${hero.label}使出「${skHero.label}」！`);
    pushLaneLog(tag, `【攻擊】${hero.label}率先出手，兵器同魔法交錯！`);
    setDungeonProgress(true, 78);
    try { flashFx('slashHit', ui.lane); showCombatFloat('slashHit', ui.lane); showCombatFloat('crit', ui.lane); } catch (e) {}
    // spend MP on attack
    (partyList().front.concat(partyList().back)).forEach((id) => applyBarDelta(id, 0, -8, 2));
    paintHeadBars();
    await wait(450);
    applyMockStatuses(win);
    syncHeadActiveUI();
    const stSample = Object.keys(state.partyStatus || {}).slice(0, 3).map((pid) => {
      const sid = (state.partyStatus[pid] || [])[0];
      const job = (members[pid] && members[pid].job) || pid;
      const lab = (STATUS_DEFS[sid] && STATUS_DEFS[sid].label) || sid;
      return job + lab + '{{status:' + sid + '}}';
    }).join('、');
    if (stSample) pushLaneLog(tag, '【狀態】異常／增益：' + stSample);
    if (win) {
      pushLaneLog(tag, `【受傷】${mon.label}反擊擦傷隊友，不過大家咬實牙關頂住。{{status:regen}}`);
      try { flashFx('sparkleHeal', ui.lane); showCombatFloat('heal', ui.lane); showCombatFloat('sparkleHeal', ui.lane); } catch (e) {}
      (partyList().front.concat(partyList().back)).forEach((id) => applyBarDelta(id, -12, 0, 3));
      // heal tick
      (partyList().back).forEach((id) => applyBarDelta(id, 10, -5, 1));
      paintHeadBars();
    } else {
      pushLaneLog(tag, `【受傷】${mon.label}一記重擊！隊伍陣腳大亂。{{status:stun}}{{status:poison}}`);
      try { flashFx('blockShield', ui.lane); showCombatFloat('block', ui.lane); showCombatFloat('miss', ui.lane); } catch (e) {}
      (partyList().front.concat(partyList().back)).forEach((id) => applyBarDelta(id, -28, -4, 1));
      paintHeadBars();
    }
    await wait(450);
    ui.party.classList.remove('fighting');
    ui.monster.classList.remove('fighting');
    ui.fx.style.background = '';
    ui.fx.style.color = '';
    setDungeonProgress(true, 100);
    showLaneOutcome(tag, win);
    if (win) {
      pushLaneLog(tag, `【擊破】成功打倒${mon.label}！`);
      pushLaneLog(tag, '【拾物】喺戰場執到少少戰利品碎片。');
      pushLaneLog(tag, '【開箱】打開寶箱——金幣同物資閃光！任務達成～');
    } else {
      pushLaneLog(tag, `【敗北】敵唔過${mon.label}，只好鳴金收兵……`);
      pushLaneLog(tag, '【標記】跑道豎起十字架，下次再嚟。');
    }
    recoverPartyBars(win ? false : true);
    saveState();
    await wait(700);
    setDungeonProgress(false, 0);
    ui.lane.classList.remove('busy');
  }

  function restoreLaneFromState() {
    LANE_TAGS.forEach((tag) => {
      const occ = state.lanes[tag];
      if (!occ) {
        resetLaneVisual(tag);
        return;
      }
      if (occ.phase === 'done' || occ.phase === 'running') {
        // if page reload mid-run, snap to outcome
        showLaneOutcome(tag, occ.outcome === 'win');
        if (occ.phase === 'running') {
          // finish settle if interrupted? mark done without double pay — check quest status
          const st = state.quests[occ.questId];
          if (st && st.status === 'active') {
            // treat as needing settle without re-animating gold if already? safer: complete without gold if unsure
            // Actually on reload, complete with rewards once
            const q = questById(occ.questId);
            if (q) {
              const win = occ.outcome === 'win';
              st.status = 'done';
              st.result = win ? 'win' : 'lose';
              occ.phase = 'done';
              // do not re-award gold on restore to avoid dupe — skip economy if already done snap
            }
          }
        }
      } else {
        resetLaneVisual(tag);
      }
    });
  }


  /* —— 委託刷新 —— */
  function pickFreshQuestId(exclude) {
    const ex = new Set(exclude || []);
    if (Array.isArray(state.pendingExpandQuests) && state.pendingExpandQuests.length) {
      const nxt = state.pendingExpandQuests.find((id) => !ex.has(id));
      if (nxt) {
        state.pendingExpandQuests = state.pendingExpandQuests.filter((id) => id !== nxt);
        return nxt;
      }
    }
    const pool = QUEST_POOL.filter((q) => !ex.has(q.id));
    if (!pool.length) return null;
    state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
    return pool[state.seed % pool.length].id;
  }

  function clearQuestRefs(qid) {
    delete state.assigned[qid];
    LANE_TAGS.forEach((tag) => {
      const occ = state.lanes[tag];
      if (occ && occ.questId === qid) {
        state.lanes[tag] = null;
        if (state.laneLogs) state.laneLogs[tag] = [];
        resetLaneVisual(tag);
      }
    });
  }

  /** 將板上 done／指定格換成新委託；keepOpen=true 時只換 done */
  function refreshBoardQuests(opts) {
    opts = opts || {};
    const onlyDone = opts.onlyDone !== false;
    if (!Array.isArray(state.board)) state.board = QUEST_POOL.slice(0, 3).map((q) => q.id);
    const names = [];
    for (let i = 0; i < state.board.length; i++) {
      const oldId = state.board[i];
      const st = state.quests[oldId];
      const should = opts.forceAll || (onlyDone && st && st.status === 'done') || (!onlyDone && (!st || st.status === 'done' || st.status === 'open'));
      // safer: default only replace done; never replace active/accepted unless force
      const replace = opts.forceAll
        ? !(st && st.status === 'active')
        : (st && st.status === 'done');
      if (!replace) continue;
      const exclude = state.board.slice();
      const nid = pickFreshQuestId(exclude);
      if (!nid) continue;
      clearQuestRefs(oldId);
      state.board[i] = nid;
      state.quests[nid] = { status: 'open', result: null, rateAtDispatch: null };
      const nq = questById(nid);
      if (nq) names.push(nq.name);
      if (selectedQuestId === oldId) selectedQuestId = nid;
    }
    saveState();
    renderQuestTiles();
    return names;
  }

  function manualRefreshQuests() {
    const names = refreshBoardQuests({ onlyDone: true });
    if (!names.length) {
      toast('未有已完成委託可換');
      setLilyMood('think');
      say('板上未有完成嘅委託可以換喔～等完成或者過日再嚟。');
      return;
    }
    setLilyMood('smile');
    say(`新委託貼上啦：${names.join('、')}！揀一張睇詳情啦～`);
    toast('已刷新 ' + names.length + ' 張委託');
  }

  /* —— 日曆／賃金 —— */
  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
  function weekdayLabel(day) {
    return '星期' + WEEKDAYS[day % 7];
  }
  function rentAmount() {
    // 聲譽略減租
    return Math.max(90, 120 - Math.floor(Math.max(0, state.rep - 50) / 10) * 5);
  }

  const WEATHER_CYCLE = [
    { id: 'sun', label: '晴', src: 'assets/ui/weather-sunny.png' },
    { id: 'cloud', label: '陰', src: 'assets/ui/weather-cloud.png' },
    { id: 'rain', label: '雨', src: 'assets/ui/weather-rain.png' },
    { id: 'snow', label: '雪', src: 'assets/ui/weather-snow.png' },
    { id: 'fog', label: '霧', src: 'assets/ui/weather-fog.png' },
    { id: 'storm', label: '暴風', src: 'assets/ui/weather-storm.png' },
    { id: 'aurora', label: '極光', src: 'assets/ui/weather-aurora.png' }
  ];
  function weatherForDay(day) {
    return WEATHER_CYCLE[Math.abs(day | 0) % WEATHER_CYCLE.length];
  }

  const TOD_CYCLE = [
    { id: 'dawn', label: '黎明', src: 'assets/ui/time-dawn.png' },
    { id: 'noon', label: '正午', src: 'assets/ui/time-noon.png' },
    { id: 'dusk', label: '黃昏', src: 'assets/ui/tod-dusk.png' },
    { id: 'night', label: '深夜', src: 'assets/ui/time-night.png' },
    { id: 'midnight', label: '子夜', src: 'assets/ui/tod-midnight.png' }
  ];
  function todForDay(day) {
    return TOD_CYCLE[Math.abs(day | 0) % TOD_CYCLE.length];
  }

  const SEASON_CYCLE = [
    { id: 'spring', label: '春', src: 'assets/ui/season-spring.png' },
    { id: 'summer', label: '夏', src: 'assets/ui/season-summer.png' },
    { id: 'autumn', label: '秋', src: 'assets/ui/season-autumn.png' },
    { id: 'winter', label: '冬', src: 'assets/ui/season-winter.png' }
  ];
  function seasonForDay(day) {
    // ~7 days per season slice
    return SEASON_CYCLE[Math.floor(Math.abs(day | 0) / 7) % SEASON_CYCLE.length];
  }

  function playWeatherFx() {
    let overlay = document.getElementById('weather-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'weather-overlay';
      overlay.className = 'weather-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      const appEl = document.getElementById('app') || document.body;
      appEl.appendChild(overlay);
    }
    const w = weatherForDay(state.day);
    const season = seasonForDay(state.day);
    let src = 'assets/fx/sunray.png';
    let cls = 'sunray';
    if (w.id === 'rain' || w.id === 'storm') { src = 'assets/fx/raindrop.png'; cls = 'raindrop'; }
    else if (w.id === 'snow') { src = 'assets/fx/snowflake.png'; cls = 'snowflake'; }
    else if (w.id === 'fog') { src = 'assets/fx/leaf-fall.png'; cls = 'leaf-fall'; }
    else if (w.id === 'aurora') { src = 'assets/fx/sunray.png'; cls = 'sunray'; }
    else if (w.id === 'cloud' && season.id === 'winter') { src = 'assets/fx/snowflake.png'; cls = 'snowflake'; }
    else if (w.id === 'cloud' && season.id === 'autumn') { src = 'assets/fx/leaf-fall.png'; cls = 'leaf-fall'; }
    else if (w.id === 'cloud') { src = 'assets/fx/leaf-fall.png'; cls = 'leaf-fall'; }
    else if (w.id === 'sun') { src = 'assets/fx/sunray.png'; cls = 'sunray'; }
    if (season.id === 'winter' && w.id !== 'rain' && w.id !== 'storm' && w.id !== 'snow' && (state.day % 2 === 0)) {
      src = 'assets/fx/snowflake.png'; cls = 'snowflake';
    }
    overlay.innerHTML = '';
    overlay.hidden = false;
    overlay.className = 'weather-overlay show ' + cls + (w.id === 'storm' ? ' storm' : '') + (w.id === 'aurora' ? ' aurora' : '') + (w.id === 'fog' ? ' fog' : '');
    const n = cls === 'sunray' ? 5 : 10;
    for (let i = 0; i < n; i++) {
      const img = document.createElement('img');
      img.className = 'weather-particle';
      img.src = src + '?v=' + ASSET_V;
      img.alt = '';
      img.style.left = (6 + Math.random() * 88) + '%';
      img.style.top = (4 + Math.random() * 50) + '%';
      img.style.animationDelay = (Math.random() * 0.45) + 's';
      img.style.opacity = String(0.55 + Math.random() * 0.4);
      overlay.appendChild(img);
    }
    clearTimeout(playWeatherFx._t);
    playWeatherFx._t = setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => { overlay.hidden = true; overlay.innerHTML = ''; }, 320);
    }, 1600);
  }

  function updateDayUI() {
    const dayLabel = document.getElementById('day-label');
    const wageVal = document.getElementById('wage-val');
    const wIco = document.getElementById('weather-ico');
    const wLab = document.getElementById('weather-label');
    if (dayLabel) dayLabel.textContent = `第${state.day}日 ${weekdayLabel(state.day)}`;
    if (wageVal) wageVal.textContent = String(state.wageLeft);
    const rentIco = document.getElementById('rent-ico');
    const rentLab = document.getElementById('rent-label');
    if (rentIco) {
      let src = 'assets/ui/rent-wood.png';
      if (state.wageLeft <= 0) src = 'assets/ui/cal-rent-due.png';
      else if (state.wageLeft >= 6) src = 'assets/ui/rent-paid.png';
      else if (state.wageLeft <= 2) src = 'assets/ui/cal-rent-due.png';
      else if (typeof isFestivalDay === 'function' && isFestivalDay()) src = 'assets/ui/cal-festival.png';
      else if ((state.day || 1) % 7 === 0) src = 'assets/ui/cal-payday.png';
      else src = 'assets/ui/rent-calendar-mark.png';
      rentIco.src = src + '?v=' + ASSET_V;
    }
    let cal = document.getElementById('rent-calendar-mark');
    if (!cal) {
      const rentLab = document.getElementById('rent-label');
      if (rentLab && rentLab.parentElement) {
        cal = document.createElement('img');
        cal.id = 'rent-calendar-mark';
        cal.className = 'inline-ico rent-cal';
        cal.alt = '租金日';
        rentLab.parentElement.insertBefore(cal, rentLab);
      }
    }
    if (cal) {
      let csrc = 'assets/ui/rent-calendar-mark.png';
      let show = false;
      if (state.wageLeft <= 2) { csrc = 'assets/ui/cal-rent-due.png'; show = true; }
      else if (typeof isFestivalDay === 'function' && isFestivalDay()) { csrc = 'assets/ui/cal-festival.png'; show = true; }
      else if ((state.day || 1) % 7 === 0) { csrc = 'assets/ui/cal-payday.png'; show = true; }
      else if (state.wageLeft > 2 && state.wageLeft < 6) { csrc = 'assets/ui/rent-calendar-mark.png'; show = true; }
      cal.src = csrc + '?v=' + ASSET_V;
      cal.hidden = !show;
    }
    if (rentLab) {
      rentLab.textContent = state.wageLeft <= 2 ? '催租' : (state.wageLeft >= 6 ? '已繳' : '賃金');
    }
    syncGuestFace();
    const w = weatherForDay(state.day);
    if (wIco) wIco.src = w.src + '?v=' + ASSET_V;
    if (wLab) wLab.textContent = w.label;
    const tod = todForDay(state.day);
    const todIco = document.getElementById('tod-ico');
    const todLab = document.getElementById('tod-label');
    if (todIco) todIco.src = tod.src + '?v=' + ASSET_V;
    if (todLab) todLab.textContent = tod.label;
    const season = seasonForDay(state.day);
    const sIco = document.getElementById('season-ico');
    const sLab = document.getElementById('season-label');
    if (sIco) sIco.src = season.src + '?v=' + ASSET_V;
    if (sLab) sLab.textContent = season.label;
    try { playWeatherFx(); } catch (e) {}
      try { renderEventBanner(); renderChapterStrip(); } catch (e) {}
  }

  function hasRunningLane() {
    return LANE_TAGS.some((tag) => state.lanes[tag] && state.lanes[tag].phase === 'running');
  }

  function recoverOneItem() {
    if (!state.consumed.length) return null;
    const idx = state.seed % state.consumed.length;
    const item = state.consumed.splice(idx, 1)[0];
    return item;
  }

  function advanceDay() {
    if (hasRunningLane()) {
      toast('仲有隊伍喺地城，等佢哋返先過日');
      setLilyMood('think');
      say('仲有人喺地城未返，等跑道打完先過日啦～');
      return false;
    }
    state.day += 1;
    state.wageLeft -= 1;
    let msg = `到咗第 ${state.day} 日（${weekdayLabel(state.day)}）。`;
    if (state.wageLeft <= 0) {
      const rent = rentAmount();
      state.gold -= rent;
      state.wageLeft = 7;
      if (state.gold < 0) {
        state.rep = Math.max(0, state.rep - 3);
        setLilyMood('angry');
        popEmoji('anger');
        msg += ` 賃金到期扣咗 ${rent} 金，金庫透支中（${state.gold}）……聲譽微跌。`;
        if (state.gold < -50) {
          state.gold = -50;
          msg += ' 負債到頂，快快派任務賺返啦！';
        }
      } else {
        setLilyMood('smile');
        msg += ` 賃金到期，繳交租金 ${rent} 金。下期 7 日後再收。`;
      }
    } else {
      if (state.wageLeft <= 1) {
        setLilyMood('sleepy');
        popEmoji('sweat');
        msg += ` 賃金仲剩 ${state.wageLeft} 日……夜深啦，記得準備租金。`;
      } else {
        setLilyMood('smile');
        msg += ` 賃金仲剩 ${state.wageLeft} 日。`;
      }
    }
    if (state.foodBuff && state.foodBuff.untilDay != null && state.day > state.foodBuff.untilDay) state.foodBuff = null;
    clearPartyStatus(); syncHeadActiveUI();
    const refreshed = refreshBoardQuests({ onlyDone: true });
    if (refreshed.length) msg += ` 新委託：${refreshed.join('、')}。`;
    const got = recoverOneItem();
    if (got) msg += ` 庫存補充返「${got}」。`;
    state.fatigue = Math.min(10, (state.fatigue || 0) + 1);
    try {
      const w = weatherForDay(state.day);
      if (w.id === 'rain') {
        msg += ' 落雨路滑，出門記得帶乾糧；租金日都會更催。';
      } else if (w.id === 'sun' && (state.rep || 0) >= 65) {
        const tip = 12 + ((state.day || 0) % 7);
        state.gold += tip;
        msg += ` 好評傳開，一位贊助人打賞 ${tip} 金。`;
      }
      if (typeof isFestivalDay === 'function' && isFestivalDay()) {
        state.recruitDiscount = 0.2;
        msg += ' 祭典日！招募處今日八折，去請新面孔入會啦。';
      } else {
        state.recruitDiscount = 0;
      }
      if (state.wageLeft === 2) {
        msg += ' 再兩日就到租金——可以派一轉委託補金庫。';
      }
    } catch (e) {}
    updateDayUI();
    updateEconomyUI();
    saveState();
    say(msg);
    try { showBootSplash(700); flashFx('door'); } catch (e) {}
    toast(`第 ${state.day} 日`, 'ok');
    renderQuestTiles();
    return true;
  }


  const SHOP_ITEMS = [
    { key: 'potion', name: '生命藥水', price: 35, bonus: 8, icon: 'assets/icons/potion.png', item: '生命藥水' },
    { key: 'antidote', name: '解毒劑', price: 40, bonus: 11, icon: 'assets/icons/item-antidote.png', item: '解毒劑' },
    { key: 'bread', name: '乾糧', price: 20, bonus: 6, icon: 'assets/icons/food-bread.png', item: '乾糧', food: true, buff: 'rate' },
    { key: 'stew', name: '燉菜', price: 45, bonus: 9, icon: 'assets/icons/food-stew.png', item: '燉菜', food: true, buff: 'rate' },
    { key: 'cake', name: '蛋糕', price: 50, bonus: 7, icon: 'assets/icons/cake.png', item: '蛋糕', food: true, buff: 'rate' },
    { key: 'honey', name: '蜂蜜', price: 30, bonus: 6, icon: 'assets/icons/icon-honey.png', item: '蜂蜜', food: true, buff: 'rate' },
    { key: 'milk', name: '鮮奶', price: 25, bonus: 5, icon: 'assets/icons/milk.png', item: '牛奶', food: true, buff: 'heal' },
    { key: 'gift', name: '慶祝禮物', price: 60, bonus: 10, icon: 'assets/icons/gift-box.png', item: '慶祝禮物' },
    { key: 'balloon', name: '慶祝氣球', price: 28, bonus: 4, icon: 'assets/icons/balloon.png', item: '慶祝氣球' },
    { key: 'dumbbell', name: '啞鈴', price: 35, bonus: 6, icon: 'assets/icons/icon-dumbbell.png', item: '啞鈴' },
    { key: 'target', name: '準星靶', price: 42, bonus: 7, icon: 'assets/icons/target.png', item: '準星靶' },
    { key: 'hammer', name: '鐵鎚', price: 48, bonus: 8, icon: 'assets/icons/hammer.png', item: '鐵鎚' },
    { key: 'nails', name: '鐵釘', price: 22, bonus: 5, icon: 'assets/icons/nails.png', item: '鐵釘' },
    { key: 'blueprint', name: '設計圖', price: 70, bonus: 9, icon: 'assets/icons/icon-blueprint.png', item: '設計圖' },
    { key: 'bombSmoke', name: '煙霧彈', price: 55, bonus: 12, icon: 'assets/icons/bomb-smoke.png', item: '煙霧彈' },
    { key: 'mirror', name: '魔鏡', price: 65, bonus: 10, icon: 'assets/icons/mirror.png', item: '魔鏡' },
    { key: 'feather', name: '鳳凰羽', price: 80, bonus: 11, icon: 'assets/icons/icon-feather.png', item: '鳳凰羽' },
    { key: 'crystalShard', name: '水晶碎片', price: 95, bonus: 13, icon: 'assets/icons/crystal-shard.png', item: '水晶碎片' },
    { key: 'compass', name: '指南針', price: 48, bonus: 8, icon: 'assets/icons/icon-compass.png', item: '指南針' },
    { key: 'pillow', name: '軟枕', price: 32, bonus: 4, icon: 'assets/icons/pillow.png', item: '軟枕' },
    { key: 'soap', name: '香皂', price: 26, bonus: 3, icon: 'assets/icons/soap.png', item: '香皂' },
    { key: 'rod', name: '釣竿', price: 55, bonus: 7, icon: 'assets/icons/icon-fishing-rod.png', item: '釣竿' },
    { key: 'bait', name: '魚餌', price: 18, bonus: 4, icon: 'assets/icons/icon-bait.png', item: '魚餌' },
    { key: 'ore', name: '礦石', price: 40, bonus: 6, icon: 'assets/icons/ore.png', item: '礦石' },
    { key: 'log', name: '原木', price: 28, bonus: 5, icon: 'assets/icons/icon-log.png', item: '原木' },
    { key: 'berry', name: '漿果', price: 16, bonus: 3, icon: 'assets/icons/berry.png', item: '漿果' },
    { key: 'mushroomItem', name: '野菇', price: 22, bonus: 4, icon: 'assets/icons/mushroom-item.png', item: '野菇' }
  ,
    { key: 'keySilver', name: '銀鑰匙', price: 55, bonus: 9, icon: 'assets/icons/icon-key-silver.png', item: '銀鑰匙' },
    { key: 'mapScrap', name: '地圖碎片', price: 38, bonus: 7, icon: 'assets/icons/icon-map-scrap.png', item: '地圖碎片' },
    { key: 'guildPass', name: '公會通行證', price: 80, bonus: 12, icon: 'assets/icons/icon-guild-pass.png', item: '公會通行證' },
    { key: 'potionMana', name: '魔力藥水', price: 42, bonus: 8, icon: 'assets/icons/icon-potion-mana.png', item: '魔力藥水' },
    { key: 'scrollQuest', name: '委託卷軸', price: 48, bonus: 10, icon: 'assets/icons/icon-scroll-quest.png', item: '委託卷軸' },
    { key: 'charmLuck', name: '幸運符', price: 65, bonus: 11, icon: 'assets/icons/icon-charm-luck.png', item: '幸運符' },
    { key: 'thread', name: '縫線', price: 20, bonus: 5, icon: 'assets/icons/icon-thread.png', item: '縫線' },
    { key: 'woodPlank', name: '木板', price: 26, bonus: 6, icon: 'assets/icons/icon-wood-plank.png', item: '木板' },
    { key: 'oreIron', name: '鐵礦', price: 44, bonus: 7, icon: 'assets/icons/icon-ore-iron.png', item: '鐵礦' },
    { key: 'herbGreen', name: '綠草', price: 18, bonus: 4, icon: 'assets/icons/icon-herb-green.png', item: '綠草' },
    { key: 'fishSmall', name: '小魚', price: 22, bonus: 5, icon: 'assets/icons/icon-fish-small.png', item: '小魚' },
    { key: 'gemRuby', name: '紅寶石', price: 120, bonus: 14, icon: 'assets/icons/icon-gem-ruby.png', item: '紅寶石' },
    { key: 'spice', name: '香料', price: 36, bonus: 6, icon: 'assets/icons/icon-spice.png', item: '香料' },
    { key: 'inkBottle', name: '墨水瓶', price: 28, bonus: 5, icon: 'assets/icons/icon-ink-bottle.png', item: '墨水瓶' },
    { key: 'seedBag', name: '種子袋', price: 24, bonus: 5, icon: 'assets/icons/icon-seed-bag.png', item: '種子袋' },
    { key: 'clay', name: '黏土', price: 22, bonus: 4, icon: 'assets/icons/icon-clay.png', item: '黏土' },
    { key: 'ticket', name: '通行票', price: 40, bonus: 5, icon: 'assets/icons/icon-ticket.png', item: '通行票' },
    { key: 'lanternItem', name: '提燈', price: 40, bonus: 7, icon: 'assets/icons/icon-lantern.png', item: '提燈' },
    { key: 'ropeItem', name: '精繩', price: 28, bonus: 6, icon: 'assets/icons/icon-rope.png', item: '精繩' },
    { key: 'anchor', name: '船錨', price: 52, bonus: 8, icon: 'assets/icons/icon-anchor.png', item: '船錨' },
    { key: 'arrowBundle', name: '箭束', price: 38, bonus: 7, icon: 'assets/icons/icon-arrow-bundle.png', item: '箭束' },
    { key: 'holyWater', name: '聖水', price: 45, bonus: 9, icon: 'assets/icons/icon-holy-water.png', item: '聖水' },
    { key: 'pearl', name: '珍珠', price: 70, bonus: 10, icon: 'assets/icons/icon-pearl.png', item: '珍珠' },
    { key: 'acorn', name: '橡實', price: 16, bonus: 3, icon: 'assets/icons/icon-acorn.png', item: '橡實' },
    { key: 'crownMini', name: '迷你王冠', price: 95, bonus: 12, icon: 'assets/icons/icon-crown-mini.png', item: '迷你王冠' },
    { key: 'lockpick', name: '開鎖器', price: 42, bonus: 8, icon: 'assets/icons/icon-lockpick.png', item: '開鎖器' },
    { key: 'tome', name: '魔法書', price: 68, bonus: 10, icon: 'assets/icons/icon-tome.png', item: '魔法書' },
    { key: 'bouquet', name: '花束', price: 30, bonus: 5, icon: 'assets/icons/icon-bouquet.png', item: '花束' },
    { key: 'parcel', name: '包裹', price: 34, bonus: 6, icon: 'assets/icons/icon-parcel.png', item: '包裹' },
    { key: 'flour', name: '麵粉', price: 22, bonus: 4, icon: 'assets/icons/icon-flour.png', item: '麵粉' },
    { key: 'horn', name: '獸角', price: 48, bonus: 8, icon: 'assets/icons/icon-horn.png', item: '獸角' },
    { key: 'leaf', name: '靈葉', price: 26, bonus: 5, icon: 'assets/icons/icon-leaf.png', item: '靈葉' },
    { key: 'silk', name: '絲線', price: 36, bonus: 6, icon: 'assets/icons/icon-silk.png', item: '絲線' },
    { key: 'crystalBall', name: '水晶球', price: 88, bonus: 11, icon: 'assets/icons/icon-crystal-ball.png', item: '水晶球' },
    { key: 'mask', name: '面具', price: 40, bonus: 7, icon: 'assets/icons/icon-mask.png', item: '面具' },
    { key: 'recipe', name: '食譜', price: 32, bonus: 6, icon: 'assets/icons/icon-recipe.png', item: '食譜' },
    { key: 'equipSword', name: '精鋼劍', price: 75, bonus: 14, icon: 'assets/icons/eq-sword-wood.png', item: '長劍' },
    { key: 'equipBow', name: '長弓', price: 70, bonus: 12, icon: 'assets/icons/equip-bow.png', item: '長弓' },
    { key: 'equipStaff', name: '法杖', price: 72, bonus: 12, icon: 'assets/icons/equip-staff.png', item: '法杖' },
    { key: 'equipShield', name: '精鋼盾', price: 65, bonus: 10, icon: 'assets/icons/equip-shield.png', item: '木盾' },
    { key: 'whetstone', name: '磨刀石', price: 28, bonus: 5, icon: 'assets/icons/icon-whetstone.png', item: '磨刀石' },
    { key: 'quiver', name: '箭筒', price: 38, bonus: 7, icon: 'assets/icons/icon-quiver.png', item: '箭筒' },
    { key: 'manaCrystal', name: '魔力結晶', price: 55, bonus: 9, icon: 'assets/icons/icon-mana-crystal.png', item: '魔力結晶' },
    { key: 'trophy', name: '勝利獎盃', price: 90, bonus: 12, icon: 'assets/icons/icon-trophy.png', item: '勝利獎盃' },
    { key: 'bandage', name: '繃帶', price: 24, bonus: 5, icon: 'assets/icons/icon-bandage.png', item: '繃帶' },
    { key: 'tarot', name: '塔羅牌', price: 45, bonus: 8, icon: 'assets/icons/icon-tarot.png', item: '塔羅牌' },
    { key: 'taxSeal', name: '稅印', price: 50, bonus: 7, icon: 'assets/icons/icon-tax-seal.png', item: '稅印' },
    { key: 'lute', name: '魯特琴', price: 58, bonus: 8, icon: 'assets/icons/icon-lute.png', item: '魯特琴' },
    { key: 'herbRed', name: '紅草藥', price: 28, bonus: 6, icon: 'assets/icons/icon-herb-red.png', item: '紅草藥' },
    { key: 'rum', name: '朗姆酒', price: 42, bonus: 6, icon: 'assets/icons/icon-rum.png', item: '朗姆酒' },
    { key: 'rosary', name: '念珠', price: 48, bonus: 7, icon: 'assets/icons/icon-rosary.png', item: '念珠' },
    { key: 'hammerSmall', name: '小鐵鎚', price: 36, bonus: 5, icon: 'assets/icons/icon-hammer-small.png', item: '小鐵鎚' },
    { key: 'foodPie', name: '餡餅', price: 40, bonus: 8, icon: 'assets/icons/food-pie.png', item: '餡餅', food: true, buff: 'rate' },
    { key: 'foodTea', name: '熱茶', price: 22, bonus: 4, icon: 'assets/icons/food-tea.png', item: '熱茶', food: true, buff: 'rate' },
    { key: 'whip', name: '馬鞭', price: 38, bonus: 5, icon: 'assets/icons/icon-whip.png', item: '馬鞭' },
    { key: 'oar', name: '船槳', price: 34, bonus: 5, icon: 'assets/icons/icon-oar.png', item: '船槳' },
    { key: 'teapot', name: '茶壺', price: 44, bonus: 6, icon: 'assets/icons/icon-teapot.png', item: '茶壺' },
    { key: 'coinPurse', name: '錢袋', price: 60, bonus: 8, icon: 'assets/icons/icon-coin-purse.png', item: '錢袋' },
    { key: 'giftFlower', name: '獻花花禮', price: 48, bonus: 8, icon: 'assets/icons/gift-flower.png', item: '獻花花禮' },
    { key: 'giftLetter', name: '禮物信', price: 35, bonus: 6, icon: 'assets/icons/gift-letter.png', item: '禮物信' },
    { key: 'pickaxe', name: '礦鎬', price: 52, bonus: 7, icon: 'assets/icons/icon-pickaxe.png', item: '礦鎬' },
    { key: 'shears', name: '修枝剪', price: 32, bonus: 5, icon: 'assets/icons/icon-shears.png', item: '修枝剪' },
    { key: 'matIngot', name: '錠材', price: 40, bonus: 6, icon: 'assets/icons/mat-ingot.png', item: '錠材' },
    { key: 'matCloth', name: '布料', price: 28, bonus: 5, icon: 'assets/icons/mat-cloth.png', item: '布料' },
    { key: 'matPotionEmpty', name: '空藥瓶', price: 18, bonus: 3, icon: 'assets/icons/mat-potion-empty.png', item: '空藥瓶' },
    { key: 'needle', name: '縫針', price: 24, bonus: 4, icon: 'assets/icons/icon-needle.png', item: '縫針' },
    { key: 'vial', name: '試管', price: 26, bonus: 4, icon: 'assets/icons/icon-vial.png', item: '試管' },
    { key: 'saw', name: '鋸子', price: 38, bonus: 5, icon: 'assets/icons/icon-saw.png', item: '鋸子' },
    { key: 'chestBronze', name: '青銅寶箱', price: 80, bonus: 10, icon: 'assets/icons/chest-bronze.png', item: '青銅寶箱' },
    { key: 'chestSilver', name: '白銀寶箱', price: 120, bonus: 14, icon: 'assets/icons/chest-silver.png', item: '白銀寶箱' },
    { key: 'chestGold', name: '黃金寶箱', price: 180, bonus: 18, icon: 'assets/icons/chest-gold.png', item: '黃金寶箱' },
    { key: 'keyBronze', name: '銅鑰匙', price: 35, bonus: 6, icon: 'assets/icons/icon-key-bronze.png', item: '銅鑰匙' },
    { key: 'keyGold', name: '金鑰匙', price: 90, bonus: 12, icon: 'assets/icons/icon-key-gold.png', item: '金鑰匙' },
    { key: 'bookMagic', name: '魔法書', price: 70, bonus: 10, icon: 'assets/icons/icon-book-magic.png', item: '魔法書' },
    { key: 'towel', name: '毛巾', price: 20, bonus: 3, icon: 'assets/icons/icon-towel.png', item: '毛巾' },
    { key: 'scale', name: '天秤', price: 45, bonus: 6, icon: 'assets/icons/icon-scale.png', item: '天秤' },
    { key: 'abacus', name: '算盤', price: 40, bonus: 5, icon: 'assets/icons/icon-abacus.png', item: '算盤' },
    { key: 'torch', name: '火把', price: 28, bonus: 4, icon: 'assets/icons/icon-torch.png', item: '火把' },
    { key: 'mapScroll', name: '地圖卷軸', price: 55, bonus: 8, icon: 'assets/icons/icon-map-scroll.png', item: '地圖卷軸' },
    { key: 'foodCandy', name: '糖果', price: 18, bonus: 4, icon: 'assets/icons/food-candy.png', item: '糖果', food: true, buff: 'rate' },
    { key: 'ladle', name: '湯勺', price: 26, bonus: 4, icon: 'assets/icons/icon-ladle.png', item: '湯勺' },
    { key: 'mug', name: '酒杯', price: 24, bonus: 3, icon: 'assets/icons/icon-mug.png', item: '酒杯' },
    { key: 'lollipop', name: '棒棒糖', price: 15, bonus: 3, icon: 'assets/icons/icon-lollipop.png', item: '棒棒糖' },
    { key: 'eqRingRuby', name: '紅寶石戒指', price: 88, bonus: 11, icon: 'assets/icons/eq-ring-ruby.png', item: '紅寶石戒指' },
    { key: 'hammerSmith', name: '鍛造鎚', price: 50, bonus: 7, icon: 'assets/icons/icon-hammer-smith.png', item: '鍛造鎚' },
    { key: 'polishCloth', name: '拋光布', price: 22, bonus: 3, icon: 'assets/icons/icon-polish-cloth.png', item: '拋光布' },
    { key: 'gemCutter', name: '切寶石刀', price: 60, bonus: 8, icon: 'assets/icons/icon-gem-cutter.png', item: '切寶石刀' },
    { key: 'bannerFlag', name: '旗幟', price: 42, bonus: 6, icon: 'assets/icons/icon-banner-flag.png', item: '旗幟' },
    { key: 'whistle', name: '哨子', price: 28, bonus: 4, icon: 'assets/icons/icon-whistle.png', item: '哨子' },
    { key: 'medkit', name: '醫療包', price: 55, bonus: 9, icon: 'assets/icons/icon-medkit.png', item: '醫療包' },
    { key: 'waxSeal', name: '火漆印', price: 36, bonus: 5, icon: 'assets/icons/icon-wax-seal.png', item: '火漆印' },
    { key: 'quill', name: '羽毛筆', price: 30, bonus: 4, icon: 'assets/icons/icon-quill.png', item: '羽毛筆' },
    { key: 'inviteCard', name: '邀請卡', price: 40, bonus: 6, icon: 'assets/icons/icon-invite-card.png', item: '邀請卡' },
    { key: 'cropWheat', name: '小麥', price: 16, bonus: 3, icon: 'assets/icons/crop-wheat.png', item: '小麥' },
    { key: 'cropTomato', name: '番茄', price: 18, bonus: 3, icon: 'assets/icons/crop-tomato.png', item: '番茄' },
    { key: 'cropPumpkin', name: '南瓜', price: 22, bonus: 4, icon: 'assets/icons/crop-pumpkin.png', item: '南瓜' },
    { key: 'wateringCan', name: '澆水壺', price: 32, bonus: 4, icon: 'assets/icons/icon-watering-can.png', item: '澆水壺' },
    { key: 'seedBagNew', name: '種子袋', price: 26, bonus: 4, icon: 'assets/icons/icon-seed-bag.png', item: '種子袋' },
    { key: 'rake', name: '耙子', price: 30, bonus: 4, icon: 'assets/icons/icon-rake.png', item: '耙子' },
    { key: 'petFoodBowl', name: '食盆', price: 24, bonus: 3, icon: 'assets/icons/pet-food-bowl.png', item: '食盆' },
    { key: 'petToyBall', name: '玩具球', price: 20, bonus: 3, icon: 'assets/icons/pet-toy-ball.png', item: '玩具球' },
    { key: 'petRibbon', name: '寵物絲帶', price: 18, bonus: 2, icon: 'assets/icons/pet-ribbon.png', item: '寵物絲帶' },
    { key: 'leash', name: '牽繩', price: 28, bonus: 4, icon: 'assets/icons/icon-leash.png', item: '牽繩' },
    { key: 'brush', name: '梳刷', price: 22, bonus: 3, icon: 'assets/icons/icon-brush.png', item: '梳刷' },
    { key: 'treat', name: '寵物零食', price: 16, bonus: 2, icon: 'assets/icons/icon-treat.png', item: '寵物零食' },
    { key: 'drumstick', name: '鼓槌', price: 28, bonus: 4, icon: 'assets/icons/icon-drumstick.png', item: '鼓槌' },
    { key: 'stageTicket', name: '舞台票', price: 45, bonus: 6, icon: 'assets/icons/icon-ticket.png', item: '舞台票' },
    { key: 'wheel', name: '車輪', price: 36, bonus: 5, icon: 'assets/icons/icon-wheel.png', item: '車輪' },
    { key: 'balloonRope', name: '氣球繩', price: 32, bonus: 4, icon: 'assets/icons/icon-balloon-rope.png', item: '氣球繩' },
    { key: 'magnifier', name: '放大鏡', price: 38, bonus: 5, icon: 'assets/icons/icon-magnifier.png', item: '放大鏡' },
    { key: 'priceTag', name: '價錢牌', price: 20, bonus: 3, icon: 'assets/icons/icon-price-tag.png', item: '價錢牌' },
    { key: 'gavel', name: '拍賣槌', price: 48, bonus: 7, icon: 'assets/icons/icon-gavel.png', item: '拍賣槌' },
    { key: 'hourglass', name: '沙漏', price: 44, bonus: 6, icon: 'assets/icons/icon-hourglass.png', item: '沙漏' },
    { key: 'lanternNew', name: '提燈', price: 36, bonus: 5, icon: 'assets/icons/icon-lantern.png', item: '提燈' },
    { key: 'ledgerBook', name: '帳簿', price: 50, bonus: 7, icon: 'assets/icons/icon-ledger.png', item: '帳簿' },
    { key: 'skillBook', name: '技能書', price: 60, bonus: 8, icon: 'assets/icons/icon-skill-book.png', item: '技能書' },
    { key: 'focusBead', name: '專注珠', price: 42, bonus: 6, icon: 'assets/icons/icon-focus-bead.png', item: '專注珠' },
    { key: 'burnSalve', name: '燒燙膏', price: 38, bonus: 7, icon: 'assets/icons/item-burn-salve.png', item: '燒燙膏' },
    { key: 'warmTea', name: '暖身茶', price: 28, bonus: 5, icon: 'assets/icons/item-warm-tea.png', item: '暖身茶' },
    { key: 'pestle', name: '研缽杵', price: 34, bonus: 4, icon: 'assets/icons/icon-pestle.png', item: '研缽杵' },
    { key: 'herbBundle', name: '藥草束', price: 26, bonus: 4, icon: 'assets/icons/icon-herb-bundle.png', item: '藥草束' },
    { key: 'iceCharm', name: '冰護符', price: 48, bonus: 7, icon: 'assets/icons/icon-ice-charm.png', item: '冰護符' },
    { key: 'medalRibbon', name: '獎章絲帶', price: 36, bonus: 5, icon: 'assets/icons/icon-medal-ribbon.png', item: '獎章絲帶' },
    { key: 'scoreboard', name: '計分板', price: 55, bonus: 7, icon: 'assets/icons/icon-scoreboard.png', item: '計分板' },
    { key: 'speechScroll', name: '說話卷軸', price: 40, bonus: 6, icon: 'assets/icons/icon-speech-scroll.png', item: '說話卷軸' },
    { key: 'inkPot', name: '墨壺', price: 32, bonus: 5, icon: 'assets/icons/icon-ink-pot.png', item: '墨壺' },
    { key: 'megaphone', name: '傳聲喇叭', price: 48, bonus: 7, icon: 'assets/icons/icon-megaphone.png', item: '傳聲喇叭' },
    { key: 'keyring', name: '鑰匙圈', price: 36, bonus: 5, icon: 'assets/icons/icon-keyring.png', item: '鑰匙圈' },
    { key: 'crate', name: '木箱', price: 28, bonus: 4, icon: 'assets/icons/icon-crate.png', item: '木箱' },
    { key: 'mapPin', name: '地圖圖釘', price: 22, bonus: 3, icon: 'assets/icons/icon-map-pin.png', item: '地圖圖釘' },
    { key: 'backpack', name: '冒險背包', price: 55, bonus: 8, icon: 'assets/icons/icon-backpack.png', item: '冒險背包' },
    { key: 'padlock', name: '掛鎖', price: 30, bonus: 4, icon: 'assets/icons/icon-padlock.png', item: '掛鎖' },
    { key: 'sortTag', name: '分類標籤', price: 18, bonus: 3, icon: 'assets/icons/icon-sort-tag.png', item: '分類標籤' },
    { key: 'tacticBoard', name: '戰術板', price: 52, bonus: 8, icon: 'assets/icons/icon-tactic-board.png', item: '戰術板' },
    { key: 'powerGlove', name: '力量手套', price: 60, bonus: 10, icon: 'assets/icons/icon-power-glove.png', item: '力量手套' },
    { key: 'wrench', name: '扳手', price: 34, bonus: 5, icon: 'assets/icons/icon-wrench.png', item: '扳手' },
    { key: 'earmuff', name: '耳罩', price: 28, bonus: 4, icon: 'assets/icons/icon-earmuff.png', item: '耳罩' },
    { key: 'dictionary', name: '辭典', price: 42, bonus: 6, icon: 'assets/icons/icon-dictionary.png', item: '辭典' },
    { key: 'helpBook', name: '求助手冊', price: 26, bonus: 4, icon: 'assets/icons/icon-help-book.png', item: '求助手冊' },
    { key: 'friendToken', name: '好友信物', price: 35, bonus: 5, icon: 'assets/icons/icon-friend-token.png', item: '好友信物' },
    { key: 'questFeather', name: '委託羽毛筆', price: 30, bonus: 5, icon: 'assets/icons/icon-quest-feather.png', item: '委託羽毛筆' },
    { key: 'petal', name: '花瓣', price: 18, bonus: 3, icon: 'assets/icons/icon-petal.png', item: '花瓣' },
    { key: 'sunCharm', name: '太陽護符', price: 45, bonus: 7, icon: 'assets/icons/icon-sun-charm.png', item: '太陽護符' },
    { key: 'mapleLeaf', name: '楓葉', price: 20, bonus: 3, icon: 'assets/icons/icon-maple-leaf.png', item: '楓葉' },
    { key: 'snowflake', name: '雪花結晶', price: 22, bonus: 3, icon: 'assets/icons/icon-snowflake.png', item: '雪花結晶' },
    { key: 'stallFlag', name: '檔攤旗', price: 26, bonus: 4, icon: 'assets/icons/icon-stall-flag.png', item: '檔攤旗' },
    { key: 'onsenTicket', name: '溫泉票', price: 48, bonus: 8, icon: 'assets/icons/icon-onsen-ticket.png', item: '溫泉票' },
    { key: 'roomKey', name: '房間鑰匙', price: 38, bonus: 5, icon: 'assets/icons/icon-room-key.png', item: '房間鑰匙' },
    { key: 'shopBell', name: '店鈴', price: 32, bonus: 4, icon: 'assets/icons/icon-shop-bell.png', item: '店鈴' },
    { key: 'gemFire', name: '火焰寶石', price: 55, bonus: 8, icon: 'assets/icons/gem-fire.png', item: '火焰寶石' },
    { key: 'gemWater', name: '流水寶石', price: 55, bonus: 8, icon: 'assets/icons/gem-water.png', item: '流水寶石' },
    { key: 'gemWind', name: '疾風寶石', price: 55, bonus: 8, icon: 'assets/icons/gem-wind.png', item: '疾風寶石' },
    { key: 'fireWand', name: '火焰魔杖', price: 68, bonus: 10, icon: 'assets/icons/icon-fire-wand.png', item: '火焰魔杖' },
    { key: 'waterFlask', name: '聖水壺', price: 42, bonus: 7, icon: 'assets/icons/icon-water-flask.png', item: '聖水壺' },
    { key: 'windFan', name: '疾風扇', price: 46, bonus: 7, icon: 'assets/icons/icon-wind-fan.png', item: '疾風扇' },
    { key: 'gemEarth', name: '大地寶石', price: 55, bonus: 8, icon: 'assets/icons/gem-earth.png', item: '大地寶石' },
    { key: 'gemLight', name: '聖光寶石', price: 60, bonus: 9, icon: 'assets/icons/gem-light.png', item: '聖光寶石' },
    { key: 'gemDark', name: '暗影寶石', price: 60, bonus: 9, icon: 'assets/icons/gem-dark.png', item: '暗影寶石' },
    { key: 'earthStaff', name: '大地法杖', price: 70, bonus: 10, icon: 'assets/icons/icon-earth-staff.png', item: '大地法杖' },
    { key: 'holyCross', name: '聖十字', price: 52, bonus: 8, icon: 'assets/icons/icon-holy-cross.png', item: '聖十字' },
    { key: 'shadowDagger', name: '影匕首', price: 58, bonus: 9, icon: 'assets/icons/icon-shadow-dagger.png', item: '影匕首' },
    { key: 'plaque', name: '功勳牌匾', price: 80, bonus: 10, icon: 'assets/icons/icon-plaque.png', item: '功勳牌匾' },
    { key: 'goldSack', name: '金袋', price: 95, bonus: 12, icon: 'assets/icons/icon-gold-sack.png', item: '金袋' },
    { key: 'historyTome', name: '史冊', price: 70, bonus: 9, icon: 'assets/icons/icon-history-tome.png', item: '史冊' },
    { key: 'stampPad', name: '簽到印台', price: 40, bonus: 5, icon: 'assets/icons/icon-stamp-pad.png', item: '簽到印台' },
    { key: 'friendLetter', name: '友情信箋', price: 45, bonus: 6, icon: 'assets/icons/icon-friend-letter.png', item: '友情信箋' },
    { key: 'bondCharm', name: '羈絆護符', price: 55, bonus: 8, icon: 'assets/icons/icon-bond-charm.png', item: '羈絆護符' },
    { key: 'fishingHook', name: '釣魚鉤', price: 28, bonus: 4, icon: 'assets/icons/icon-fishing-hook.png', item: '釣魚鉤' },
    { key: 'oreChunk', name: '礦石塊', price: 32, bonus: 5, icon: 'assets/icons/icon-ore-chunk.png', item: '礦石塊' },
    { key: 'lanternMine', name: '礦燈', price: 48, bonus: 7, icon: 'assets/icons/icon-lantern-mine.png', item: '礦燈' },
    { key: 'herbLeaf', name: '藥草葉', price: 18, bonus: 3, icon: 'assets/icons/icon-herb-leaf.png', item: '藥草葉' },
    { key: 'mortar', name: '研缽', price: 42, bonus: 6, icon: 'assets/icons/icon-mortar.png', item: '研缽' },
    { key: 'emptyPhial', name: '空藥瓶', price: 22, bonus: 3, icon: 'assets/icons/icon-empty-phial.png', item: '空藥瓶' },
    { key: 'milkPail', name: '牛奶桶', price: 36, bonus: 5, icon: 'assets/icons/icon-milk-pail.png', item: '牛奶桶' },
    { key: 'feedBag', name: '飼料袋', price: 24, bonus: 3, icon: 'assets/icons/feed-bag.png', item: '飼料袋' },
    { key: 'recruitVoucher', name: '招人介紹信', price: 40, bonus: 0, icon: 'assets/icons/icon-letter.png', item: '招人介紹信' }];


  const ACH_DEFS = [
    { id: 'first', name: '初出茅廬', desc: '接第一個任務', icon: 'assets/badges/ach-first-quest.png', test: (s) => (s.questsAccepted || 0) >= 1 },
    { id: 'tenWins', name: '十戰十勝', desc: '累計勝利 10 場', icon: 'assets/badges/ach-ten-wins.png', test: (s) => (s.wins || 0) >= 10 },
    { id: 'rich', name: '金庫充盈', desc: '持有 ≥500 金', icon: 'assets/badges/ach-rich.png', test: (s) => (s.gold || 0) >= 500 },
    { id: 'explorer', name: '探索者', desc: '完成過 ≥5 種委託模板', icon: 'assets/achievements/ach-explorer.png', test: (s) => Object.keys(s.quests || {}).filter((id) => s.quests[id] && s.quests[id].status === 'done').length >= 5 },
    { id: 'guild', name: '公會之光', desc: '聲譽 ≥80', icon: 'assets/achievements/ach-guild.png', test: (s) => (s.rep || 0) >= 80 },
    { id: 'fullParty', name: '滿編出擊', desc: '編成前後衛共 ≥6 人', icon: 'assets/achievements/ach-full-party.png', test: (s) => ((s.party&&s.party.front)||[]).length + ((s.party&&s.party.back)||[]).length >= 6 }
  ];

  function checkAchievements(silent) {
    if (!state.achievements) state.achievements = {};
    const unlocked = [];
    ACH_DEFS.forEach((def) => {
      if (state.achievements[def.id]) return;
      try {
        if (def.test(state)) {
          state.achievements[def.id] = { at: state.day, name: def.name };
          unlocked.push(def);
        }
      } catch (e) {}
    });
    if (unlocked.length) {
      saveState();
      if (!silent) {
        const d = unlocked[0];
        toast('成就解鎖：' + d.name);
        setLilyMood('wow');
        popEmoji('hearts');
        try { flashFx('levelup'); celebrateFx('confetti'); } catch (e) {}
      }
    }
    return unlocked;
  }


  const PET_DEFS = [
    { id: 'cat', name: '小貓', bonus: 2, src: 'assets/pets/pet-cat.png', talk: '喵～會喺櫃台陪住你。' },
    { id: 'dog', name: '小狗', bonus: 3, src: 'assets/pets/pet-dog.png', talk: '汪！巡邏加把勁！' },
    { id: 'bird', name: '小鳥', bonus: 2, src: 'assets/pets/pet-bird.png', talk: '吱吱，報信好手。' },
    { id: 'slime', name: '史萊姆崽', bonus: 1, src: 'assets/pets/pet-slime-pet.png', talk: '啵啵～黏人但乖。' },
    { id: 'owl', name: '夜梟寵物', bonus: 3, src: 'assets/pets/pet-owl.png', talk: '咕咕～夜間巡邏交給我。' }
  ];

  function syncPetUI() {
    const pet = PET_DEFS.find((p) => p.id === state.pet) || PET_DEFS[0];
    const follow = document.getElementById('pet-follow');
    if (follow) { follow.classList.toggle('prop-temp-show', !!(state.pet)); }
    if (follow) follow.src = pet.src + '?v=' + ASSET_V;
    const tb = document.getElementById('pet-toolbar-ico');
    if (tb) tb.src = pet.src + '?v=' + ASSET_V;
    let face = document.getElementById('pet-face-mood');
    if (!face) {
      const host = document.getElementById('pet-follow');
      if (host && host.parentElement) {
        face = document.createElement('img');
        face.id = 'pet-face-mood';
        face.className = 'prop prop-pet-face';
        face.alt = '';
        host.parentElement.appendChild(face);
      }
    }
    if (face) {
      let mood = 'happy';
      if ((state.fatigue || 0) >= 6) mood = 'sleep';
      else if (state.gold < 40) mood = 'hungry';
      face.src = 'assets/ui/pet-face-' + mood + '.png?v=' + ASSET_V;
      face.title = mood;
    }
  }

  function openPetModal() {
    activeQuest = null;
    modalMode = 'pet';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '公會寵物';
    sayAs('petShopGirl', '食盆、玩具球、絲帶——寵物店齊貨！');
    sayAs('vetDoctor', '體檢完再玩，牽繩同梳刷我備好。');
    sayAs('breederBoy', '零食獎勵，聽話就有！');
    sayAs('stablehand', '馬廄啲毛孩精神夾夾！揀一隻跟住你啦～');
    let html = npcBannerHtml('petShopGirl', '寵物店員') + npcBannerHtml('vetDoctor', '獸醫') + npcBannerHtml('breederBoy', '繁殖少年') + npcBannerHtml('stablehand', '寵物／馬廄') + npcBannerHtml('stableBoy', '馬廄少年') + npcBannerHtml('questBoardGirl', '委託板') +
      '<div style="font-size:12px;margin-bottom:6px">揀一隻跟隨（小幅成功率加成）</div>' +
      '<div class="pet-care">' +
      '<img src="assets/icons/pet-food-bowl.png?v=' + ASSET_V + '" alt="食盆" title="食盆"/>' +
      '<img src="assets/icons/pet-toy-ball.png?v=' + ASSET_V + '" alt="玩具球" title="玩具球"/>' +
      '<img src="assets/icons/pet-ribbon.png?v=' + ASSET_V + '" alt="絲帶" title="絲帶"/>' +
      '<img src="assets/icons/icon-leash.png?v=' + ASSET_V + '" alt="牽繩" title="牽繩"/>' +
      '<img src="assets/icons/icon-brush.png?v=' + ASSET_V + '" alt="梳刷" title="梳刷"/>' +
      '<img src="assets/icons/icon-treat.png?v=' + ASSET_V + '" alt="零食" title="零食"/>' +
      '</div><div class="pet-grid">';
    PET_DEFS.forEach((p) => {
      const on = state.pet === p.id;
      html += '<button type="button" class="pet-card' + (on ? ' active' : '') + '" data-pet="' + p.id + '">' +
        '<img src="' + p.src + '?v=' + ASSET_V + '" alt=""/><span>' + p.name + '</span><small>+' + p.bonus + '%</small></button>';
    });
    html += '</div>';
    modalBody.innerHTML = html;
    modalActions.hidden = true;
    modal.hidden = false;
    modalBody.querySelectorAll('[data-pet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.pet = btn.getAttribute('data-pet');
        const info = PET_DEFS.find((p) => p.id === state.pet);
        saveState();
        syncPetUI();
        renderQuestTiles();
        setLilyMood('smile');
        popEmoji('hearts');
        say(info ? info.talk + '（寵物加成 +' + info.bonus + '%）' : '寵物已更新');
        toast('跟隨：' + (info ? info.name : state.pet));
        openPetModal();
      });
    });
  }

  function titleFrameForAch(defId, unlocked) {
    if (!unlocked) return 'assets/ui/title-frame-wood.png';
    if (defId === 'rich' || defId === 'tenWins') return 'assets/ui/title-frame-gold.png';
    if (defId === 'guild' || defId === 'explorer') return 'assets/ui/title-frame-magic.png';
    return 'assets/ui/title-frame-wood.png';
  }

  function openAchModal() {
    activeQuest = null;
    modalMode = 'ach';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '成就';
    try {
      sayAs('achievementClerk', '成就牆——牌匾同稱號框齊晒！');
      sayAs('historian', '史冊記低每一場勝利～');
      sayAs('richPatron', '金袋贊助，金庫充盈有獎！');
    } catch (e) {}
    checkAchievements(true);
    let html = npcBannerHtml('achievementClerk', '成就書記') + npcBannerHtml('historian', '史官') + npcBannerHtml('richPatron', '富豪贊助人') +
      '<div class="title-frames">' +
      '<img src="assets/ui/title-frame-wood.png?v=' + ASSET_V + '" alt="木框" title="木稱號框"/>' +
      '<img src="assets/ui/title-frame-gold.png?v=' + ASSET_V + '" alt="金框" title="金稱號框"/>' +
      '<img src="assets/ui/title-frame-magic.png?v=' + ASSET_V + '" alt="魔框" title="魔法稱號框"/>' +
      '</div><div class="ach-grid">';
    ACH_DEFS.forEach((def) => {
      const on = !!(state.achievements && state.achievements[def.id]);
      const frame = titleFrameForAch(def.id, on);
      html += '<div class="ach-card' + (on ? '' : ' locked') + '" style="background-image:url(\'' + frame + '?v=' + ASSET_V + '\')">' +
        '<img src="' + def.icon + '?v=' + ASSET_V + '" alt=""/>' +
        '<div><b>' + def.name + '</b><br/><small>' + def.desc + (on ? ' · 已解鎖' : ' · 未解鎖') + '</small></div></div>';
    });
    html += '</div>';
    modalBody.innerHTML = html;
    modalActions.hidden = true;
    modal.hidden = false;
  }

  function openShopModal() {
    activeQuest = null;
    modalMode = 'shop';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '公會雜貨店';
    if (!state.shopStock) state.shopStock = { potion: 3, antidote: 2, bread: 4, stew: 2, cake: 2, honey: 3, milk: 3, gift: 2, balloon: 3, dumbbell: 2, target: 2, hammer: 2, nails: 3, blueprint: 1, bombSmoke: 2, mirror: 2, feather: 2, crystalShard: 1, compass: 2, pillow: 3, soap: 3, rod: 2, bait: 4, ore: 3, log: 3, berry: 4, mushroomItem: 3, keySilver: 2, mapScrap: 3, guildPass: 1, potionMana: 3, scrollQuest: 2, charmLuck: 2, thread: 3, woodPlank: 3, oreIron: 3, herbGreen: 4, fishSmall: 4, gemRuby: 1, spice: 3, inkBottle: 3, seedBag: 3, clay: 3, ticket: 2, lanternItem: 2, ropeItem: 3, anchor: 2, arrowBundle: 3, holyWater: 2, pearl: 2, acorn: 4, crownMini: 1, lockpick: 2, tome: 2, bouquet: 3, parcel: 3, flour: 4, horn: 2, leaf: 3, silk: 3, crystalBall: 1, mask: 2, recipe: 3, equipSword: 2, equipBow: 2, equipStaff: 2, equipShield: 2, whetstone: 3, quiver: 2, manaCrystal: 2, trophy: 1, bandage: 4, tarot: 2, taxSeal: 2, lute: 2, herbRed: 4, rum: 2, rosary: 2, hammerSmall: 3, foodPie: 2, foodTea: 3, whip: 2, oar: 2, teapot: 2, coinPurse: 2, giftFlower: 2, giftLetter: 3, pickaxe: 2, shears: 3, matIngot: 3, matCloth: 3, matPotionEmpty: 4, needle: 3, vial: 3, saw: 2, chestBronze: 2, chestSilver: 1, chestGold: 1, keyBronze: 3, keyGold: 1, bookMagic: 2, towel: 4, scale: 2, abacus: 2, torch: 3, mapScroll: 2, foodCandy: 4, ladle: 2, mug: 2, lollipop: 4, eqRingRuby: 1, hammerSmith: 2, polishCloth: 3, gemCutter: 2, bannerFlag: 2, whistle: 3, medkit: 2, waxSeal: 3, quill: 3, inviteCard: 2, cropWheat: 4, cropTomato: 4, cropPumpkin: 3, wateringCan: 2, seedBagNew: 3, rake: 2, petFoodBowl: 2, petToyBall: 2, petRibbon: 3, leash: 2, brush: 2, treat: 4, drumstick: 2, stageTicket: 2, wheel: 2, balloonRope: 2, magnifier: 2, priceTag: 3, gavel: 1, hourglass: 2, lanternNew: 2, ledgerBook: 2, skillBook: 2, focusBead: 2, burnSalve: 2, warmTea: 3, pestle: 2, herbBundle: 3, iceCharm: 2, medalRibbon: 2, scoreboard: 1, speechScroll: 2, inkPot: 3, megaphone: 2, keyring: 2, crate: 3, mapPin: 3, backpack: 1, padlock: 2, sortTag: 3, tacticBoard: 2, powerGlove: 1, wrench: 2, earmuff: 2, dictionary: 2, helpBook: 2, friendToken: 2, questFeather: 2, petal: 4, sunCharm: 2, mapleLeaf: 4, snowflake: 4, stallFlag: 2, onsenTicket: 2, roomKey: 2, shopBell: 2, gemFire: 2, gemWater: 2, gemWind: 2, fireWand: 1, waterFlask: 2, windFan: 2, gemEarth: 2, gemLight: 2, gemDark: 2, earthStaff: 1, holyCross: 2, shadowDagger: 1, plaque: 1, goldSack: 1, historyTome: 2, stampPad: 2, friendLetter: 2, bondCharm: 1, fishingHook: 3, oreChunk: 3, lanternMine: 2, herbLeaf: 4, mortar: 2, emptyPhial: 4, milkPail: 2, feedBag: 3 };
    if (state.shopStock.keySilver == null) state.shopStock.keySilver = 2;
    if (state.shopStock.mapScrap == null) state.shopStock.mapScrap = 3;
    if (state.shopStock.guildPass == null) state.shopStock.guildPass = 1;
    if (state.shopStock.potionMana == null) state.shopStock.potionMana = 3;
    if (state.shopStock.scrollQuest == null) state.shopStock.scrollQuest = 2;
    if (state.shopStock.charmLuck == null) state.shopStock.charmLuck = 2;
    if (state.shopStock.thread == null) state.shopStock.thread = 3;
    if (state.shopStock.woodPlank == null) state.shopStock.woodPlank = 3;
    if (state.shopStock.oreIron == null) state.shopStock.oreIron = 3;
    if (state.shopStock.herbGreen == null) state.shopStock.herbGreen = 4;
    if (state.shopStock.fishSmall == null) state.shopStock.fishSmall = 4;
    if (state.shopStock.gemRuby == null) state.shopStock.gemRuby = 1;
    if (state.shopStock.spice == null) state.shopStock.spice = 3;
    if (state.shopStock.inkBottle == null) state.shopStock.inkBottle = 3;
    if (state.shopStock.seedBag == null) state.shopStock.seedBag = 3;
    if (state.shopStock.clay == null) state.shopStock.clay = 3;
    if (state.shopStock.ticket == null) state.shopStock.ticket = 2;
    if (state.shopStock.lanternItem == null) state.shopStock.lanternItem = 2;
    if (state.shopStock.ropeItem == null) state.shopStock.ropeItem = 3;
    if (state.shopStock.anchor == null) state.shopStock.anchor = 2;
    if (state.shopStock.arrowBundle == null) state.shopStock.arrowBundle = 3;
    if (state.shopStock.holyWater == null) state.shopStock.holyWater = 2;
    if (state.shopStock.pearl == null) state.shopStock.pearl = 2;
    if (state.shopStock.acorn == null) state.shopStock.acorn = 4;
    if (state.shopStock.crownMini == null) state.shopStock.crownMini = 1;
    if (state.shopStock.lockpick == null) state.shopStock.lockpick = 2;
    if (state.shopStock.tome == null) state.shopStock.tome = 2;
    if (state.shopStock.bouquet == null) state.shopStock.bouquet = 3;
    if (state.shopStock.parcel == null) state.shopStock.parcel = 3;
    if (state.shopStock.flour == null) state.shopStock.flour = 4;
    if (state.shopStock.horn == null) state.shopStock.horn = 2;
    if (state.shopStock.leaf == null) state.shopStock.leaf = 3;
    if (state.shopStock.silk == null) state.shopStock.silk = 3;
    if (state.shopStock.crystalBall == null) state.shopStock.crystalBall = 1;
    if (state.shopStock.mask == null) state.shopStock.mask = 2;
    if (state.shopStock.recipe == null) state.shopStock.recipe = 3;
    if (state.shopStock.equipSword == null) state.shopStock.equipSword = 2;
    if (state.shopStock.equipBow == null) state.shopStock.equipBow = 2;
    if (state.shopStock.equipStaff == null) state.shopStock.equipStaff = 2;
    if (state.shopStock.equipShield == null) state.shopStock.equipShield = 2;
    if (state.shopStock.whetstone == null) state.shopStock.whetstone = 3;
    if (state.shopStock.quiver == null) state.shopStock.quiver = 2;
    if (state.shopStock.manaCrystal == null) state.shopStock.manaCrystal = 2;
    if (state.shopStock.trophy == null) state.shopStock.trophy = 1;
    if (state.shopStock.bandage == null) state.shopStock.bandage = 4;
    if (state.shopStock.tarot == null) state.shopStock.tarot = 2;
    if (state.shopStock.taxSeal == null) state.shopStock.taxSeal = 2;
    if (state.shopStock.lute == null) state.shopStock.lute = 2;
    if (state.shopStock.herbRed == null) state.shopStock.herbRed = 4;
    if (state.shopStock.rum == null) state.shopStock.rum = 2;
    if (state.shopStock.rosary == null) state.shopStock.rosary = 2;
    if (state.shopStock.hammerSmall == null) state.shopStock.hammerSmall = 3;
    if (state.shopStock.foodPie == null) state.shopStock.foodPie = 2;
    if (state.shopStock.foodTea == null) state.shopStock.foodTea = 3;
    if (state.shopStock.whip == null) state.shopStock.whip = 2;
    if (state.shopStock.oar == null) state.shopStock.oar = 2;
    if (state.shopStock.teapot == null) state.shopStock.teapot = 2;
    if (state.shopStock.coinPurse == null) state.shopStock.coinPurse = 2;
    if (state.shopStock.giftFlower == null) state.shopStock.giftFlower = 2;
    if (state.shopStock.giftLetter == null) state.shopStock.giftLetter = 3;
    if (state.shopStock.pickaxe == null) state.shopStock.pickaxe = 2;
    if (state.shopStock.shears == null) state.shopStock.shears = 3;
    if (state.shopStock.matIngot == null) state.shopStock.matIngot = 3;
    if (state.shopStock.matCloth == null) state.shopStock.matCloth = 3;
    if (state.shopStock.matPotionEmpty == null) state.shopStock.matPotionEmpty = 4;
    if (state.shopStock.needle == null) state.shopStock.needle = 3;
    if (state.shopStock.vial == null) state.shopStock.vial = 3;
    if (state.shopStock.saw == null) state.shopStock.saw = 2;
    if (state.shopStock.chestBronze == null) state.shopStock.chestBronze = 2;
    if (state.shopStock.chestSilver == null) state.shopStock.chestSilver = 1;
    if (state.shopStock.chestGold == null) state.shopStock.chestGold = 1;
    if (state.shopStock.keyBronze == null) state.shopStock.keyBronze = 3;
    if (state.shopStock.keyGold == null) state.shopStock.keyGold = 1;
    if (state.shopStock.bookMagic == null) state.shopStock.bookMagic = 2;
    if (state.shopStock.towel == null) state.shopStock.towel = 4;
    if (state.shopStock.scale == null) state.shopStock.scale = 2;
    if (state.shopStock.abacus == null) state.shopStock.abacus = 2;
    if (state.shopStock.torch == null) state.shopStock.torch = 3;
    if (state.shopStock.mapScroll == null) state.shopStock.mapScroll = 2;
    if (state.shopStock.foodCandy == null) state.shopStock.foodCandy = 4;
    if (state.shopStock.ladle == null) state.shopStock.ladle = 2;
    if (state.shopStock.mug == null) state.shopStock.mug = 2;
    if (state.shopStock.lollipop == null) state.shopStock.lollipop = 4;
    if (state.shopStock.eqRingRuby == null) state.shopStock.eqRingRuby = 1;
    if (state.shopStock.hammerSmith == null) state.shopStock.hammerSmith = 2;
    if (state.shopStock.polishCloth == null) state.shopStock.polishCloth = 3;
    if (state.shopStock.gemCutter == null) state.shopStock.gemCutter = 2;
    if (state.shopStock.bannerFlag == null) state.shopStock.bannerFlag = 2;
    if (state.shopStock.whistle == null) state.shopStock.whistle = 3;
    if (state.shopStock.medkit == null) state.shopStock.medkit = 2;
    if (state.shopStock.waxSeal == null) state.shopStock.waxSeal = 3;
    if (state.shopStock.quill == null) state.shopStock.quill = 3;
    if (state.shopStock.inviteCard == null) state.shopStock.inviteCard = 2;
    if (state.shopStock.cropWheat == null) state.shopStock.cropWheat = 4;
    if (state.shopStock.cropTomato == null) state.shopStock.cropTomato = 4;
    if (state.shopStock.cropPumpkin == null) state.shopStock.cropPumpkin = 3;
    if (state.shopStock.wateringCan == null) state.shopStock.wateringCan = 2;
    if (state.shopStock.seedBagNew == null) state.shopStock.seedBagNew = 3;
    if (state.shopStock.rake == null) state.shopStock.rake = 2;
    if (state.shopStock.petFoodBowl == null) state.shopStock.petFoodBowl = 2;
    if (state.shopStock.petToyBall == null) state.shopStock.petToyBall = 2;
    if (state.shopStock.petRibbon == null) state.shopStock.petRibbon = 3;
    if (state.shopStock.leash == null) state.shopStock.leash = 2;
    if (state.shopStock.brush == null) state.shopStock.brush = 2;
    if (state.shopStock.treat == null) state.shopStock.treat = 4;
    if (state.shopStock.drumstick == null) state.shopStock.drumstick = 2;
    if (state.shopStock.stageTicket == null) state.shopStock.stageTicket = 2;
    if (state.shopStock.wheel == null) state.shopStock.wheel = 2;
    if (state.shopStock.balloonRope == null) state.shopStock.balloonRope = 2;
    if (state.shopStock.magnifier == null) state.shopStock.magnifier = 2;
    if (state.shopStock.priceTag == null) state.shopStock.priceTag = 3;
    if (state.shopStock.gavel == null) state.shopStock.gavel = 1;
    if (state.shopStock.hourglass == null) state.shopStock.hourglass = 2;
    if (state.shopStock.lanternNew == null) state.shopStock.lanternNew = 2;
    if (state.shopStock.ledgerBook == null) state.shopStock.ledgerBook = 2;
    if (state.shopStock.skillBook == null) state.shopStock.skillBook = 2;
    if (state.shopStock.focusBead == null) state.shopStock.focusBead = 2;
    if (state.shopStock.burnSalve == null) state.shopStock.burnSalve = 2;
    if (state.shopStock.warmTea == null) state.shopStock.warmTea = 3;
    if (state.shopStock.pestle == null) state.shopStock.pestle = 2;
    if (state.shopStock.herbBundle == null) state.shopStock.herbBundle = 3;
    if (state.shopStock.iceCharm == null) state.shopStock.iceCharm = 2;
    if (state.shopStock.medalRibbon == null) state.shopStock.medalRibbon = 2;
    if (state.shopStock.scoreboard == null) state.shopStock.scoreboard = 1;
    if (state.shopStock.speechScroll == null) state.shopStock.speechScroll = 2;
    if (state.shopStock.inkPot == null) state.shopStock.inkPot = 3;
    if (state.shopStock.megaphone == null) state.shopStock.megaphone = 2;
    if (state.shopStock.keyring == null) state.shopStock.keyring = 2;
    if (state.shopStock.crate == null) state.shopStock.crate = 3;
    if (state.shopStock.mapPin == null) state.shopStock.mapPin = 3;
    if (state.shopStock.backpack == null) state.shopStock.backpack = 1;
    if (state.shopStock.padlock == null) state.shopStock.padlock = 2;
    if (state.shopStock.sortTag == null) state.shopStock.sortTag = 3;
    if (state.shopStock.tacticBoard == null) state.shopStock.tacticBoard = 2;
    if (state.shopStock.powerGlove == null) state.shopStock.powerGlove = 1;
    if (state.shopStock.wrench == null) state.shopStock.wrench = 2;
    if (state.shopStock.earmuff == null) state.shopStock.earmuff = 2;
    if (state.shopStock.dictionary == null) state.shopStock.dictionary = 2;
    if (state.shopStock.helpBook == null) state.shopStock.helpBook = 2;
    if (state.shopStock.friendToken == null) state.shopStock.friendToken = 2;
    if (state.shopStock.questFeather == null) state.shopStock.questFeather = 2;
    if (state.shopStock.petal == null) state.shopStock.petal = 4;
    if (state.shopStock.sunCharm == null) state.shopStock.sunCharm = 2;
    if (state.shopStock.mapleLeaf == null) state.shopStock.mapleLeaf = 4;
    if (state.shopStock.snowflake == null) state.shopStock.snowflake = 4;
    if (state.shopStock.stallFlag == null) state.shopStock.stallFlag = 2;
    if (state.shopStock.onsenTicket == null) state.shopStock.onsenTicket = 2;
    if (state.shopStock.roomKey == null) state.shopStock.roomKey = 2;
    if (state.shopStock.shopBell == null) state.shopStock.shopBell = 2;
    if (state.shopStock.gemFire == null) state.shopStock.gemFire = 2;
    if (state.shopStock.gemWater == null) state.shopStock.gemWater = 2;
    if (state.shopStock.gemWind == null) state.shopStock.gemWind = 2;
    if (state.shopStock.fireWand == null) state.shopStock.fireWand = 1;
    if (state.shopStock.waterFlask == null) state.shopStock.waterFlask = 2;
    if (state.shopStock.windFan == null) state.shopStock.windFan = 2;
    if (state.shopStock.gemEarth == null) state.shopStock.gemEarth = 2;
    if (state.shopStock.gemLight == null) state.shopStock.gemLight = 2;
    if (state.shopStock.gemDark == null) state.shopStock.gemDark = 2;
    if (state.shopStock.earthStaff == null) state.shopStock.earthStaff = 1;
    if (state.shopStock.holyCross == null) state.shopStock.holyCross = 2;
    if (state.shopStock.shadowDagger == null) state.shopStock.shadowDagger = 1;
    if (state.shopStock.plaque == null) state.shopStock.plaque = 1;
    if (state.shopStock.goldSack == null) state.shopStock.goldSack = 1;
    if (state.shopStock.historyTome == null) state.shopStock.historyTome = 2;
    if (state.shopStock.stampPad == null) state.shopStock.stampPad = 2;
    if (state.shopStock.friendLetter == null) state.shopStock.friendLetter = 2;
    if (state.shopStock.bondCharm == null) state.shopStock.bondCharm = 1;
    if (state.shopStock.fishingHook == null) state.shopStock.fishingHook = 3;
    if (state.shopStock.oreChunk == null) state.shopStock.oreChunk = 3;
    if (state.shopStock.lanternMine == null) state.shopStock.lanternMine = 2;
    if (state.shopStock.herbLeaf == null) state.shopStock.herbLeaf = 4;
    if (state.shopStock.mortar == null) state.shopStock.mortar = 2;
    if (state.shopStock.emptyPhial == null) state.shopStock.emptyPhial = 4;
    if (state.shopStock.milkPail == null) state.shopStock.milkPail = 2;
    if (state.shopStock.feedBag == null) state.shopStock.feedBag = 3;
    if (state.shopStock.recruitVoucher == null) state.shopStock.recruitVoucher = 2;
    let rows = npcBannerHtml('merchant', '歡迎光臨～今日進貨齊全') + npcBannerHtml('merchantLady', '女商人秤兌') + npcBannerHtml('travelingMerchant', '旅行商隊') + npcBannerHtml('jeweler', '寶石') + npcBannerHtml('jewelerGirl', '紅寶戒指') + npcBannerHtml('appraiser', '鑑定放大鏡') + npcBannerHtml('collectorLady', '收藏價錢牌') + npcBannerHtml('auctioneer', '拍賣槌') + npcBannerHtml('skillTutor', '技能書') + npcBannerHtml('monkSensei', '專注珠') + npcBannerHtml('barrierMage', '結界盾') + npcBannerHtml('farmer', '農產') + npcBannerHtml('farmerAunt', '農婦作物') + npcBannerHtml('seedSeller', '種子袋') + npcBannerHtml('weatherman', '天氣預報') + npcBannerHtml('cartographer', '製圖') + npcBannerHtml('ruinsScholar', '遺跡卷軸') + npcBannerHtml('rangerScout', '森林指南針') + npcBannerHtml('caveGuide', '洞窟火把') + npcBannerHtml('sailor', '航海補給') + npcBannerHtml('pirate', '海盜朗姆酒') + npcBannerHtml('coachman', '馬車出行') + npcBannerHtml('cartDriver', '馬車司機') + npcBannerHtml('dockworker', '碼頭船槳') + npcBannerHtml('ferryCaptain', '渡船船長') + npcBannerHtml('balloonPilot', '氣球駕駛') + npcBannerHtml('hunter', '狩獵用具') + npcBannerHtml('priest', '聖水祝福') + npcBannerHtml('nun', '修女念珠') + npcBannerHtml('witchShop', '魔女雜貨') + npcBannerHtml('apothecary', '藥劑／解毒') + npcBannerHtml('herbWitch', '藥草束／燒燙膏') + npcBannerHtml('icePriest', '暖身茶／冰護符') + npcBannerHtml('arenaReferee', '競技裁判／獎盃') + npcBannerHtml('rankingClerk', '排名書記／計分板') + npcBannerHtml('cheerGirl', '啦啦隊／絲帶') + npcBannerHtml('storyteller', '說書人／說話卷軸') + npcBannerHtml('gossipAunt', '八卦阿嬸／喇叭') + npcBannerHtml('quietScribe', '沉默書吏／墨壺') + npcBannerHtml('gatekeeper', '門衛／鑰匙圈') + npcBannerHtml('warehouseClerk', '倉庫書記／木箱') + npcBannerHtml('mapCartographer', '製圖師／圖釘') + npcBannerHtml('inventoryMaid', '背包女僕／背包') + npcBannerHtml('pawnbroker', '當舖／掛鎖') + npcBannerHtml('locksmith', '鎖匠／分類標') + npcBannerHtml('battleCoach', '戰鬥教練／力量手套') + npcBannerHtml('fieldMedic', '戰地醫官／繃帶') + npcBannerHtml('tacticAdvisor', '戰術顧問／戰術板') + npcBannerHtml('settingsSteward', '設定管家／扳手') + npcBannerHtml('soundTech', '音響技師／耳罩') + npcBannerHtml('translator', '翻譯員／辭典') + npcBannerHtml('tutorialGuide', '新手嚮導／求助手冊') + npcBannerHtml('friendMatcher', '好友配對／信物') + npcBannerHtml('questHelper', '委託助手／羽毛筆') + npcBannerHtml('floristSeason', '季節花匠／花瓣') + npcBannerHtml('festivalDancer', '祭典舞者／絲帶') + npcBannerHtml('lanternKeeper', '燈籠守護／燈籠') + npcBannerHtml('snowVendor', '雪攤／雪花') + npcBannerHtml('nightStall', '夜市／檔旗') + npcBannerHtml('onsenAttendant', '溫泉／票') + npcBannerHtml('architect', '建築師／藍圖') + npcBannerHtml('innHost', '旅店東主／房匙') + npcBannerHtml('shopOwner', '店主／店鈴') + npcBannerHtml('elementalist', '元素使／魔杖') + npcBannerHtml('crystalSeller', '水晶商人／寶石') + npcBannerHtml('windSage', '風賢者／扇') + npcBannerHtml('earthDruid', '地德魯伊／法杖') + npcBannerHtml('lightCleric', '光牧師／聖十字') + npcBannerHtml('shadowRogue', '影盜賊／匕首') + npcBannerHtml('achievementClerk', '成就書記／牌匾') + npcBannerHtml('historian', '史官／史冊') + npcBannerHtml('richPatron', '富豪／金袋') + npcBannerHtml('dailyClerk', '每日書記／印台') + npcBannerHtml('friendshipClerk', '友情書記／信箋') + npcBannerHtml('giftCourier', '禮物信使／羈絆') + npcBannerHtml('angler', '釣客／魚鉤') + npcBannerHtml('minerGirl', '礦工少女／礦石') + npcBannerHtml('baitSeller', '魚餌販／礦燈') + npcBannerHtml('alchemist', '煉金師／研缽') + npcBannerHtml('herbWitch', '藥草女巫／藥葉') + npcBannerHtml('labApprentice', '學徒／空瓶') + npcBannerHtml('rancher', '牧場主／奶桶') + npcBannerHtml('shepherdGirl', '牧羊女／剪刀') + npcBannerHtml('dwarfSmith', '矮人工藝') + npcBannerHtml('blacksmithApprentice', '學徒小鎚') + npcBannerHtml('blacksmithLady', '女鐵匠鍛造') + npcBannerHtml('armorer', '鎧甲師') + npcBannerHtml('jewelerGirl', '珠寶／切石') + npcBannerHtml('architect', '建築藍圖') + npcBannerHtml('banker', '錢袋兌金／算盤') + npcBannerHtml('minerBoss', '礦鎬採集') + npcBannerHtml('fishmonger', '魚販釣具') + npcBannerHtml('floristGirl', '花禮／修枝') + npcBannerHtml('weaver', '布料／縫針') + npcBannerHtml('alchemistGirl', '空瓶／試管') + npcBannerHtml('carpenterOld', '錠材／鋸子') + npcBannerHtml('thiefNpc', '開鎖器／暗器') + npcBannerHtml('bandit', '面具／暗路') + npcBannerHtml('baker', '乾糧／麵包') + npcBannerHtml('chefLady', '女廚') + npcBannerHtml('teaLady', '茶婦熱茶') + npcBannerHtml('florist', '花束') + npcBannerHtml('floristGirl', '賣花女孩') + npcBannerHtml('beekeeper', '蜂蜜') + npcBannerHtml('lumberjack', '原木') + npcBannerHtml('miller', '麵粉') + npcBannerHtml('veteran', '獸角戰利') +
      '<div class="shop-tabs">' +
      '<button type="button" class="shop-tab active" data-shop-tab="buy"><img src="assets/ui/shop-tab-buy.png?v=' + ASSET_V + '" alt="買"/><span>購入</span></button>' +
      '<button type="button" class="shop-tab" data-shop-tab="sell"><img src="assets/ui/shop-tab-sell.png?v=' + ASSET_V + '" alt="賣"/><span>出售</span></button>' +
      '<button type="button" class="shop-tab" data-shop-tab="trade"><img src="assets/ui/shop-tab-trade.png?v=' + ASSET_V + '" alt="換"/><span>交換</span></button>' +
      '</div>' +
      '<div class="shop-chrome"><img class="shop-cart" src="assets/ui/shop-cart.png?v=' + ASSET_V + '" alt="購物車"/><img class="shop-sale" src="assets/ui/shop-tag-sale.png?v=' + ASSET_V + '" alt="特賣"/><img class="shop-sell" src="assets/ui/shop-sell.png?v=' + ASSET_V + '" alt="回收"/></div>' +
      '<div style="font-size:12px;margin-bottom:6px">用金幣買消耗品（放返庫存未消耗清單）。金幣：' + state.gold + '</div>';
    sayAs('merchantLady', '買、賣、交換——三頁任揀！');
    sayAs('banker', '銅銀金堆，算盤幫你數清楚～');
    sayAs('courierBoy', '包裹準時送到，信使專線！');
    sayAs('merchant', '歡迎光臨雜貨店～銀鑰匙、地圖碎片、公會通行證都有貨！');
    SHOP_ITEMS.forEach((it) => {
      const left = state.shopStock[it.key] != null ? state.shopStock[it.key] : 0;
      rows += '<div class="shop-row" data-shop="' + it.key + '">' +
        '<img class="ico" src="' + it.icon + '?v=' + ASSET_V + '" alt=""/>' +
        '<div><b>' + it.name + '</b><br/><small>' + it.price + ' 金 · 存貨 ' + left + ' · +' + it.bonus + '%</small></div>' +
        '<button type="button" class="buybtn" data-buy="' + it.key + '" title="購買"><img src="assets/ui/shop-buy.png?v=' + ASSET_V + '" alt="買"/></button>' +
        '</div>';
    });
    rows += '<div style="margin-top:6px;font-size:11px;opacity:.85"><img src="assets/icons/icon-scale.png?v=' + ASSET_V + '" style="width:16px;height:16px;vertical-align:-3px"/> 公道買賣 · <img src="assets/icons/icon-abacus.png?v=' + ASSET_V + '" style="width:16px;height:16px;vertical-align:-3px"/> 算盤兌金 · <img src="assets/icons/icon-parcel.png?v=' + ASSET_V + '" style="width:16px;height:16px;vertical-align:-3px"/> 快遞包裹</div>';
    modalBody.innerHTML = rows;
    modalActions.hidden = true;
    modal.hidden = false;
    modalBody.querySelectorAll('[data-buy]').forEach((btn) => {
      btn.addEventListener('click', () => buyShopItem(btn.getAttribute('data-buy')));
    });
    modalBody.querySelectorAll('[data-shop-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        modalBody.querySelectorAll('[data-shop-tab]').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const kind = tab.getAttribute('data-shop-tab');
        try { toast(kind === 'buy' ? '購入頁' : kind === 'sell' ? '出售頁' : '交換頁', 'ok'); } catch (e) {}
      });
    });
  }

  function buyShopItem(key) {
    const it = SHOP_ITEMS.find((x) => x.key === key);
    if (!it) return;
    if (!state.shopStock) state.shopStock = { potion: 3, antidote: 2, bread: 4, stew: 2, cake: 2, honey: 3, milk: 3, gift: 2, balloon: 3, dumbbell: 2, target: 2, hammer: 2, nails: 3, blueprint: 1, bombSmoke: 2, mirror: 2, feather: 2, crystalShard: 1, compass: 2, pillow: 3, soap: 3, rod: 2, bait: 4, ore: 3, log: 3, berry: 4, mushroomItem: 3, keySilver: 2, mapScrap: 3, guildPass: 1, potionMana: 3, scrollQuest: 2, charmLuck: 2, thread: 3, woodPlank: 3, oreIron: 3, herbGreen: 4, fishSmall: 4, gemRuby: 1, spice: 3, inkBottle: 3, seedBag: 3, clay: 3, ticket: 2, lanternItem: 2, ropeItem: 3, anchor: 2, arrowBundle: 3, holyWater: 2, pearl: 2, acorn: 4, crownMini: 1, lockpick: 2, tome: 2, bouquet: 3, parcel: 3, flour: 4, horn: 2, leaf: 3, silk: 3, crystalBall: 1, mask: 2, recipe: 3, equipSword: 2, equipBow: 2, equipStaff: 2, equipShield: 2, whetstone: 3, quiver: 2, manaCrystal: 2, trophy: 1, bandage: 4, tarot: 2, taxSeal: 2, lute: 2, herbRed: 4, rum: 2, rosary: 2, hammerSmall: 3, foodPie: 2, foodTea: 3, whip: 2, oar: 2, teapot: 2, coinPurse: 2, giftFlower: 2, giftLetter: 3, pickaxe: 2, shears: 3, matIngot: 3, matCloth: 3, matPotionEmpty: 4, needle: 3, vial: 3, saw: 2, chestBronze: 2, chestSilver: 1, chestGold: 1, keyBronze: 3, keyGold: 1, bookMagic: 2, towel: 4, scale: 2, abacus: 2, torch: 3, mapScroll: 2, foodCandy: 4, ladle: 2, mug: 2, lollipop: 4, eqRingRuby: 1, hammerSmith: 2, polishCloth: 3, gemCutter: 2, bannerFlag: 2, whistle: 3, medkit: 2, waxSeal: 3, quill: 3, inviteCard: 2, cropWheat: 4, cropTomato: 4, cropPumpkin: 3, wateringCan: 2, seedBagNew: 3, rake: 2, petFoodBowl: 2, petToyBall: 2, petRibbon: 3, leash: 2, brush: 2, treat: 4, drumstick: 2, stageTicket: 2, wheel: 2, balloonRope: 2, magnifier: 2, priceTag: 3, gavel: 1, hourglass: 2, lanternNew: 2, ledgerBook: 2, skillBook: 2, focusBead: 2, burnSalve: 2, warmTea: 3, pestle: 2, herbBundle: 3, iceCharm: 2, medalRibbon: 2, scoreboard: 1, speechScroll: 2, inkPot: 3, megaphone: 2, keyring: 2, crate: 3, mapPin: 3, backpack: 1, padlock: 2, sortTag: 3, tacticBoard: 2, powerGlove: 1, wrench: 2, earmuff: 2, dictionary: 2, helpBook: 2, friendToken: 2, questFeather: 2, petal: 4, sunCharm: 2, mapleLeaf: 4, snowflake: 4, stallFlag: 2, onsenTicket: 2, roomKey: 2, shopBell: 2, gemFire: 2, gemWater: 2, gemWind: 2, fireWand: 1, waterFlask: 2, windFan: 2, gemEarth: 2, gemLight: 2, gemDark: 2, earthStaff: 1, holyCross: 2, shadowDagger: 1, plaque: 1, goldSack: 1, historyTome: 2, stampPad: 2, friendLetter: 2, bondCharm: 1, fishingHook: 3, oreChunk: 3, lanternMine: 2, herbLeaf: 4, mortar: 2, emptyPhial: 4, milkPail: 2, feedBag: 3 };
    if ((state.shopStock[key] || 0) <= 0) { toast('售罄啦', 'warn'); return; }
    if (state.gold < it.price) { toast('金幣唔夠'); setLilyMood('think'); return; }
    state.gold -= it.price;
    state.shopStock[key] -= 1;
    // un-consume if was consumed, else toast gained
    const ci = state.consumed.indexOf(it.item);
    if (ci >= 0) state.consumed.splice(ci, 1);
    updateEconomyUI();
    saveState();
    toast('買咗「' + it.name + '」', 'ok');
    if (it.key === 'recruitVoucher') {
      state.recruitVoucher = (state.recruitVoucher || 0) + 1;
      say('介紹信入手——下一個人招募費七折，去招募處用啦。');
    }
    if (it.key === 'friendToken' || it.key === 'bondCharm') {
      try { giftBondFromItem(it.item); } catch (e) {}
    }
    if (it.key === 'gift' || it.key === 'balloon') {
      setLilyMood('cheer');
      popEmoji('hearts');
      try { celebrateFx('confetti'); } catch (e) {}
      say('哇……送畀我？謝謝會長～（有啲害羞）');
      setTimeout(() => setLilyMood('shy'), 600);
    } else {
      setLilyMood('smile');
      popEmoji('note');
    }
    openShopModal();
    syncSlotAssignedState();
  }

  function openMailModal() {
    activeQuest = null;
    modalMode = 'mail';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '公會信箱 · 典藏';
    if (!Array.isArray(state.mails)) {
      state.mails = [{ id: 'notice', title: '公會通告', body: '親愛嘅會長：\n本季賃金將於剩餘日數歸零時自動扣款。\n新到雜貨店可購買藥水／解毒劑／乾糧。\n夜間委託報酬略高，記得編成齊人。\n—— 櫃台 莉莉' }];
    }
    if (!state.mails.length) {
      modalBody.innerHTML = npcBannerHtml('postmaster', '郵政局長') + npcBannerHtml('librarian', '信箋與傳說典藏') +
        emptyStateHtml('inbox', '信箱空空如也 · 有新通告會喺度出現');
      modalActions.hidden = true;
      modal.hidden = false;
      setLilyMood('think');
      sayAs('librarian', '信箱暫時冇新信～有 lore 通告我會幫你收好。');
      syncMailNotif();
      return;
    }
    const unread = !state.mailRead;
    const ico = unread ? 'assets/ui/mail-envelope.png' : 'assets/ui/mail-sealed.png';
    const m = state.mails[0];
    modalBody.innerHTML =
      npcBannerHtml('postmaster', '郵政局長') + npcBannerHtml('townMayor', '鎮長通告') + npcBannerHtml('festivalHost', '祭典邀請') + npcBannerHtml('librarian', '郵件／傳說管理員') + npcBannerHtml('librarianElder', '古籍典藏') + npcBannerHtml('fortuneTeller', '塔羅占卜') +
      '<div style="text-align:center;margin-bottom:8px"><img src="' + ico + '?v=' + ASSET_V + '" style="width:48px;height:48px;image-rendering:pixelated"/><img src="assets/ui/alert-exclaim.png?v=' + ASSET_V + '" style="width:18px;height:18px;vertical-align:top;margin-left:4px"/></div>' +
      '<div class="mail-body">【' + (m.title || '信件') + '】\n' + (m.body || '') + '</div>' +
      '<div style="text-align:center;margin-top:8px"><button type="button" class="modal-btn" id="mail-archive">封存信件</button></div>';
    state.mailRead = true;
    saveState();
    syncMailNotif();
    modalActions.hidden = true;
    modal.hidden = false;
    const mailIco = document.getElementById('mail-ico');
    if (mailIco) mailIco.src = 'assets/ui/mail-open.png?v=' + ASSET_V;
    setLilyMood('smile');
    popEmoji('note');
    sayAs('postmaster', '信封封蠟好，請查收！');
    sayAs('librarian', '呢封通告我幫你歸檔好喇，慢慢睇～');
    const arch = document.getElementById('mail-archive');
    if (arch) arch.addEventListener('click', () => {
      state.mails = [];
      saveState();
      syncMailNotif();
      openMailModal();
      toast('已封存');
    });
  }


  const UNLOCK_GOLD = 80;
  const UNLOCK_REP = 60;

  function syncLockedSlots() {
    let locked = document.querySelector('.slot.locked');
    if (!locked) {
      const inv = document.getElementById('inventory');
      if (inv && state.unlockedSlots < 1) {
        locked = document.createElement('button');
        locked.type = 'button';
        locked.className = 'slot locked';
        locked.setAttribute('aria-label', '鎖定格');
        locked.title = '花費 ' + UNLOCK_GOLD + ' 金（或聲譽≥' + UNLOCK_REP + '）解鎖';
        inv.appendChild(locked);
      }
    }
    if (!locked) return;
    if (state.unlockedSlots >= 1) {
      // convert to empty usable slot
      locked.className = 'slot empty';
      locked.disabled = false;
      locked.title = '已解鎖空格';
      locked.removeAttribute('aria-label');
      locked.onclick = null;
      return;
    }
    locked.disabled = false;
    locked.className = 'slot locked';
    locked.title = '撳解鎖：' + UNLOCK_GOLD + ' 金 或 聲譽≥' + UNLOCK_REP;
    locked.onclick = function () {
      if (state.unlockedSlots >= 1) return;
      if (state.gold >= UNLOCK_GOLD) {
        state.gold -= UNLOCK_GOLD;
        state.unlockedSlots = 1;
        toast('用 ' + UNLOCK_GOLD + ' 金解鎖咗一格庫存');
        setLilyMood('smile');
      } else if (state.rep >= UNLOCK_REP) {
        state.unlockedSlots = 1;
        toast('聲譽達標，免費解鎖一格');
        setLilyMood('wow');
      } else {
        toast('要 ' + UNLOCK_GOLD + ' 金 或 聲譽≥' + UNLOCK_REP);
        setLilyMood('think');
        return;
      }
      updateEconomyUI();
      saveState();
      syncLockedSlots();
    };
  }

  function syncMailNotif() {
    const n = document.getElementById('mail-notif');
    if (n) n.hidden = !!state.mailRead;
    const mailIco = document.getElementById('mail-ico');
    if (mailIco) {
      let src = 'assets/ui/mail-envelope.png';
      if (state.mailRead) src = 'assets/ui/mail-sealed.png';
      else if ((state.mails || []).length) src = 'assets/ui/mail-envelope.png';
      mailIco.src = src + '?v=' + ASSET_V;
    }
    const bell = document.querySelector('.prop-bell');
    if (bell) {
      bell.src = ((!state.mailRead && (state.mails || []).length)
        ? 'assets/ui/notify-bell.png'
        : 'assets/props/prop-bell.png') + '?v=' + ASSET_V;
      bell.classList.toggle('ringing', !state.mailRead && !!(state.mails || []).length);
    }
  }


  function buildMiniMapHtml() {
    const board = boardQuests();
    // quest pins spread by board index
    const qPins = board.map((q, i) => {
      const left = 48 + i * 14;
      const top = 30 + (i % 2) * 16;
      const title = (q && q.name) ? q.name : '委託';
      const stPin = state.quests[q.id] || { status: 'open' };
      return '<img class="map-pin pin-quest" src="' + questMarkerSrc(q, stPin) + '?v=' + ASSET_V + '" alt="' + title + '" title="' + title + '" style="left:' + left + '%;top:' + top + '%" />';
    }).join('');
    const dungeonPins = LANE_TAGS.map((tag, i) => {
      const occ = state.lanes[tag];
      if (!occ || (occ.phase !== 'running' && occ.phase !== 'done')) return '';
      const q = questById(occ.questId);
      const left = 68 + i * 8;
      const top = 22 + i * 10;
      const label = (q ? q.name : tag) + (occ.phase === 'running' ? '（進行中）' : '');
      return '<img class="map-pin pin-dungeon" src="assets/map/pin-dungeon.png?v=' + ASSET_V + '" alt="' + label + '" title="' + label + '" style="left:' + left + '%;top:' + top + '%" />';
    }).join('');
    return npcBannerHtml('guard', '章節門禁／聲譽哨崗') + npcBannerHtml('guildGuard', '大門衛兵') + npcBannerHtml('guildCaptain', '公會隊長') + npcBannerHtml('partyRecruiter', '隊伍招募') + npcBannerHtml('mayor', '城鎮事務') + npcBannerHtml('townMayor', '鎮長大人') + npcBannerHtml('festivalHost', '祭典主持') + npcBannerHtml('bardSinger', '歌手') + npcBannerHtml('drummerBoy', '鼓手') + npcBannerHtml('stageManager', '舞台監督') + npcBannerHtml('elder', '地方掌故') + npcBannerHtml('queen', '王室委託') + npcBannerHtml('noble', '貴族委托人') + chapterRowHtml() + '<div class="mini-map">' +
      '<img class="map-region map-town" src="assets/map/map-town.png?v=' + ASSET_V + '" alt="鎮" title="城鎮" style="left:18%;top:55%" />' +
      '<img class="map-region map-forest" src="assets/map/map-forest.png?v=' + ASSET_V + '" alt="林" title="森林" style="left:62%;top:18%" />' +
      '<img class="map-region map-cave" src="assets/map/map-cave.png?v=' + ASSET_V + '" alt="洞" title="洞窟" style="left:72%;top:42%" />' +
      '<img class="map-region map-harbor" src="assets/map/map-harbor.png?v=' + ASSET_V + '" alt="港" title="港口" style="left:8%;top:30%" />' +
      '<img class="map-tile mt-wood" src="assets/tiles/tile-wood-floor.png?v=' + ASSET_V + '" alt="" style="left:24%;top:68%" />' +
      '<img class="map-tile mt-stone" src="assets/tiles/tile-stone-path.png?v=' + ASSET_V + '" alt="" style="left:40%;top:58%" />' +
      '<img class="map-tile mt-grass" src="assets/tiles/tile-grass.png?v=' + ASSET_V + '" alt="" style="left:58%;top:36%" />' +
      '<img class="map-tile mt-carpet" src="assets/tiles/tile-carpet-red.png?v=' + ASSET_V + '" alt="" style="left:36%;top:50%" />' +
      '<img class="map-fog" src="assets/map/fog.png?v=' + ASSET_V + '" alt="" />' +
      '<img class="map-transport map-wagon" src="assets/map/wagon.png?v=' + ASSET_V + '" alt="馬車" title="商隊馬車" style="left:30%;top:62%" />' +
      '<img class="map-transport map-boat" src="assets/map/boat.png?v=' + ASSET_V + '" alt="船" title="渡船" style="left:12%;top:28%" />' +
      '<img class="map-transport map-bridge" src="assets/map/bridge.png?v=' + ASSET_V + '" alt="橋" title="石橋" style="left:55%;top:48%" />' +
      '<img class="map-travel travel-carriage" src="assets/map/travel-carriage.png?v=' + ASSET_V + '" alt="馬車出行" title="馬車出行" style="left:34%;top:70%" />' +
      '<img class="map-travel travel-boat" src="assets/map/travel-boat.png?v=' + ASSET_V + '" alt="乘船" title="乘船出行" style="left:6%;top:38%" />' +
      '<img class="map-travel travel-foot" src="assets/map/travel-foot.png?v=' + ASSET_V + '" alt="步行" title="步行" style="left:48%;top:60%" />' +
      '<img class="map-vehicle veh-cart" src="assets/map/vehicle-cart.png?v=' + ASSET_V + '" alt="貨車" title="貨車" style="left:38%;top:66%" />' +
      '<img class="map-vehicle veh-boat" src="assets/map/vehicle-boat.png?v=' + ASSET_V + '" alt="渡船" title="渡船" style="left:10%;top:34%" />' +
      '<img class="map-vehicle veh-balloon" src="assets/map/vehicle-balloon.png?v=' + ASSET_V + '" alt="熱氣球" title="熱氣球" style="left:70%;top:8%" />' +
      '<img class="map-sign sign-dock" src="assets/ui/sign-dock.png?v=' + ASSET_V + '" alt="碼頭" title="碼頭" style="left:2%;top:26%" />' +
      '<img class="map-sign sign-stable" src="assets/ui/sign-stable.png?v=' + ASSET_V + '" alt="馬廄" title="馬廄" style="left:26%;top:62%" />' +
      '<img class="map-sign sign-balloon" src="assets/ui/sign-balloon-pad.png?v=' + ASSET_V + '" alt="氣球坪" title="氣球坪" style="left:74%;top:14%" />' +
      '<img class="map-build build-inn" src="assets/ui/bldg-inn.png?v=' + ASSET_V + '" alt="旅館" title="旅館" style="left:16%;top:48%" />' +
      '<img class="map-build build-shop" src="assets/ui/bldg-shop.png?v=' + ASSET_V + '" alt="商店" title="商店" style="left:28%;top:44%" />' +
      '<img class="map-build build-guildhall" src="assets/ui/bldg-guildhall.png?v=' + ASSET_V + '" alt="公會堂" title="公會堂" style="left:42%;top:40%" />' +
      '<img class="map-upgrade up-arrow" src="assets/ui/upgrade-arrow.png?v=' + ASSET_V + '" alt="升級" title="建築升級" style="left:46%;top:34%" />' +
      '<img class="map-upgrade up-star" src="assets/ui/upgrade-star.png?v=' + ASSET_V + '" alt="星" title="升級星" style="left:32%;top:38%" />' +
      '<img class="map-upgrade up-hammer" src="assets/ui/upgrade-hammer.png?v=' + ASSET_V + '" alt="鎚" title="升級鎚" style="left:20%;top:42%" />' +
      '<img class="map-node node-ore" src="assets/map/node-ore.png?v=' + ASSET_V + '" alt="礦點" title="礦石採集" style="left:74%;top:36%" />' +
      '<img class="map-node node-herb" src="assets/map/node-herb.png?v=' + ASSET_V + '" alt="藥草" title="藥草採集" style="left:58%;top:12%" />' +
      '<img class="map-node node-wood" src="assets/map/node-wood.png?v=' + ASSET_V + '" alt="伐木" title="木材採集" style="left:66%;top:28%" />' +
      '<img class="map-node node-fish" src="assets/map/node-fish.png?v=' + ASSET_V + '" alt="釣魚" title="釣魚點" style="left:4%;top:42%" />' +
      '<img class="map-facility fac-library" src="assets/ui/facility-library.png?v=' + ASSET_V + '" alt="圖書館" title="圖書館" style="left:50%;top:52%" />' +
      '<img class="map-facility fac-training" src="assets/ui/facility-training.png?v=' + ASSET_V + '" alt="訓練場" title="訓練場" style="left:60%;top:62%" />' +
      '<img class="map-facility fac-bath" src="assets/ui/facility-bath.png?v=' + ASSET_V + '" alt="浴場" title="浴場" style="left:20%;top:64%" />' +
      '<img class="map-crop crop-wheat" src="assets/map/crop-wheat.png?v=' + ASSET_V + '" alt="小麥" title="小麥田" style="left:44%;top:72%" />' +
      '<img class="map-crop crop-tomato" src="assets/map/crop-tomato.png?v=' + ASSET_V + '" alt="番茄" title="番茄田" style="left:54%;top:74%" />' +
      '<img class="map-crop crop-pumpkin" src="assets/map/crop-pumpkin.png?v=' + ASSET_V + '" alt="南瓜" title="南瓜田" style="left:64%;top:72%" />' +
      '<img class="map-pin pin-town" src="assets/map/pin-town.png?v=' + ASSET_V + '" alt="鎮" title="公會鎮" style="left:22%;top:58%" />' +
      '<img class="map-pin pin-forest" src="assets/map/pin-forest.png?v=' + ASSET_V + '" alt="林" title="森林據點" style="left:64%;top:22%" />' +
      '<img class="map-pin pin-cave" src="assets/map/pin-cave.png?v=' + ASSET_V + '" alt="洞" title="洞窟入口" style="left:76%;top:46%" />' +
      '<img class="map-pin pin-ruins" src="assets/map/pin-ruins.png?v=' + ASSET_V + '" alt="遺跡" title="古代遺跡" style="left:52%;top:34%" />' +
      '<img class="map-pin pin-player" src="assets/map/pin-player.png?v=' + ASSET_V + '" alt="你" title="你喺公會" style="left:40%;top:52%" />' +
      qPins + dungeonPins +
      '</div>';
  }

  const TRAVEL_MODES = [
    { id: 'carriage', label: '馬車', src: 'assets/ui/travel-carriage.png' },
    { id: 'boat', label: '乘船', src: 'assets/ui/travel-boat.png' },
    { id: 'foot', label: '步行', src: 'assets/ui/travel-foot.png' }
  ];
  function travelModeForDay(day) {
    return TRAVEL_MODES[Math.abs(day | 0) % TRAVEL_MODES.length];
  }
  function syncTravelMode() {
    const tm = travelModeForDay(state.day);
    let el = document.getElementById('travel-mode-ico');
    let lab = document.getElementById('travel-mode-label');
    if (!el) {
      const host = document.querySelector('.top-bar small') || document.getElementById('day-label');
      if (host) {
        const sep = document.createTextNode(' · ');
        el = document.createElement('img');
        el.id = 'travel-mode-ico';
        el.className = 'inline-ico';
        el.alt = '';
        lab = document.createElement('span');
        lab.id = 'travel-mode-label';
        host.appendChild(sep);
        host.appendChild(el);
        host.appendChild(lab);
      }
    }
    if (el) el.src = tm.src + '?v=' + ASSET_V;
    if (lab) lab.textContent = tm.label;
  }


  function checkinBondHtml() {
    const streak = Math.max(1, (state.day || 1) % 7);
    return '<div class="checkin-panel">' +
      '<div class="checkin-row">' +
      '<img class="checkin-ico" src="assets/ui/checkin-stamp.png?v=' + ASSET_V + '" alt="簽到章"/>' +
      '<img class="checkin-ico" src="assets/ui/checkin-streak.png?v=' + ASSET_V + '" alt="連續簽到"/>' +
      '<img class="checkin-ico" src="assets/ui/checkin-giftbox.png?v=' + ASSET_V + '" alt="簽到禮盒"/>' +
      '<span class="checkin-label">簽到 · 連續 ' + streak + ' 日</span></div>' +
      '<div class="bond-row">' +
      '<img class="bond-ico" src="assets/icons/bond-heart.png?v=' + ASSET_V + '" alt="羈絆心"/>' +
      '<img class="bond-ico" src="assets/icons/friend-token.png?v=' + ASSET_V + '" alt="友情信物"/>' +
      '<img class="bond-ico" src="assets/icons/bond-ring.png?v=' + ASSET_V + '" alt="羈絆戒指"/>' +
      '<span class="bond-label">羈絆 · 好友信物</span></div>' +
      ((state.bonds && Object.keys(state.bonds).length)
        ? '<div class="bond-party">' + Object.keys(state.bonds).filter((id) => bondOf(id) > 0).map((id) => memberLabel(id) + ' ' + bondOf(id)).join(' · ') + '</div>'
        : '') +
      '</div>';
  }

  function openDayModal() {
    activeQuest = null;
    modalMode = 'day';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '公會日曆';
    sayAs('taxCollector', '賃金日近喇，記得到時交租～');
    sayAs('pirate', '朗姆酒夠暖身，冬天出海都唔驚！');
    sayAs('nun', '念珠保佑你一路平安～');
    sayAs('blacksmithApprentice', '小鐵鎚先學打釘，慢慢嚟！');
    sayAs('coachman', '今日搭馬車定步行？馬鞭我準備好啦！');
    sayAs('dockworker', '渡船開咗，記得帶船槳～');
    sayAs('teaLady', '遠行前飲杯熱茶暖吓身～');
    sayAs('architect', '旅館、商店、公會堂——藍圖我畫好咗！');
    sayAs('banker', '錢袋收好，升級同起屋都要本錢～');
    sayAs('minerBoss', '礦點開咗，帶礦鎬嚟啦！');
    sayAs('fishmonger', '港邊釣魚點新鮮到跳～');
    sayAs('floristGirl', '花禮定信箋？我幫你包靚啲！');
    sayAs('weaver', '布料同縫針喺工藝部～');
    sayAs('alchemistGirl', '空藥瓶要補貨嘛？');
    sayAs('carpenterOld', '鋸子磨利，鐵砧等你！');
    sayAs('questBoardGirl', '主線、支線、每日——標記我釘好啦！');
    sayAs('innkeeperLady', '休息夠再接委託，鑰匙同寶箱我幫你睇住～');
    sayAs('stableBoy', '馬廄就緒，接每日委託都唔怕趕路！');
    sayAs('trainerCoach', '訓練場開咗，啞鈴同毛巾準備好！');
    sayAs('bathAttendant', '浴場蒸汽剛好，浸完再出發～');
    sayAs('librarian', '圖書館魔法書借閱中——小心還期！');
    sayAs('rangerScout', '森林據點標記好，跟住指南針行！');
    sayAs('caveGuide', '洞窟入口黑咕隆咚，記得帶火把～');
    sayAs('ruinsScholar', '古代遺跡有魔像，地圖卷軸借你。');
    sayAs('chefLady', '燉菜滾起，湯勺攪一攪就香！');
    sayAs('bartender', '睏倦就來一杯，酒杯滿上～');
    sayAs('candyGirl', '餓就食糖果，開心到跳！');
    sayAs('blacksmithLady', '木劍先打底，鍛造鎚噹噹響！');
    sayAs('armorer', '圓盾拋光布擦完先出貨～');
    sayAs('jewelerGirl', '紅寶戒指切好，飾品欄等你！');
    sayAs('partyRecruiter', '空位招人，就緒剔就出征！');
    sayAs('guildCaptain', '隊長皇冠喺度，旗幟一揚就集合！');
    sayAs('healerSister', '醫療包同哨子，戰隊必備～');
    sayAs('postmaster', '郵差鈴響——有新信！');
    sayAs('townMayor', '第一章印章蓋好，鎮務順利～');
    sayAs('festivalHost', '祭典邀請卡發咗未？羽毛筆寫靚啲！');
    sayAs('farmerAunt', '晴天就種小麥，雨天番茄甜！');
    sayAs('weatherman', '今日天氣我報——記得睇頂欄！');
    sayAs('seedSeller', '種子袋同耙子、澆水壺齊套～');
    sayAs('petShopGirl', '毛孩肚餓就開食盆啦！');
    sayAs('vetDoctor', '梳刷同牽繩，健康散步～');
    sayAs('breederBoy', '零食一嚿，寵物笑咗！');
    sayAs('bardSinger', '音符響起來，魯特琴伴唱～');
    sayAs('drummerBoy', '鼓槌敲落，節奏穩陣！');
    sayAs('stageManager', '幕簾、射燈、台板——開演！');
    sayAs('ferryCaptain', '碼頭開船，船槳準備好！');
    sayAs('cartDriver', '車輪轉起，貨運準時～');
    sayAs('balloonPilot', '氣球繩綁穩，起飛！');
    sayAs('appraiser', '放大鏡睇清楚，框同星級唔會錯！');
    sayAs('collectorLady', '稀有框我收，價錢牌寫明～');
    sayAs('auctioneer', '一錘定音——拍賣開始！');
    sayAs('skillTutor', '斬擊、治療、護盾——技能書打開學！');
    sayAs('monkSensei', '專注珠一握，冷卻就緒～');
    sayAs('barrierMage', '攻擊↑防禦↑，結界護住你！');
    sayAs('apothecary', '中毒？解毒劑研缽杵一齊嚟！');
    sayAs('herbWitch', '灼傷抹燒燙膏，藥草束夠香～');
    sayAs('icePriest', '冰凍就飲暖身茶，冰護符護身！');
    sayAs('arenaReferee', '競技場開打——冠軍皇冠等你攞！');
    sayAs('rankingClerk', '計分板記低，排名升一級～');
    sayAs('cheerGirl', '加油！獎章絲帶為你飄～');
    sayAs('storyteller', '聽我講古——文字幽焰會自己寫結局～', 'speech');
    sayAs('gossipAunt', '阿嬸啱啱聽聞：廣場有隻鸚鵡學人嘈！', 'shout');
    sayAs('quietScribe', '……（墨壺一點，默默記低）。', 'thought');
    sayAs('gatekeeper', '門匙圈喺手——過關先！');
    sayAs('warehouseClerk', '木箱入庫，點齊件件～');
    sayAs('mapCartographer', '圖釘一插，路線清楚！');
    sayAs('inventoryMaid', '背包格子幫你執好，鎖住珍貴物品～');
    sayAs('pawnbroker', '當舖收齊——掛鎖保管最穩陣！');
    sayAs('locksmith', '分類標籤同排序箭頭，一按就齊！');
    sayAs('battleCoach', '暴擊要準——力量手套握實！');
    sayAs('fieldMedic', '受傷即刻包紮，治療數字會跳！');
    sayAs('tacticAdvisor', '戰術板一攤，格擋同回避清楚！');
    sayAs('settingsSteward', '設定齒輪轉一轉，扳手調好就得！');
    sayAs('soundTech', '戴耳罩定開聲——toggle 一撥！');
    sayAs('translator', '辭典喺手，粵語繁中無難度～');
    sayAs('tutorialGuide', '跟住箭頭同手指——新手唔使驚！');
    sayAs('friendMatcher', '好友信物一換，配對成功～');
    sayAs('questHelper', '委託羽毛筆寫好，任務板唔會空！');
    sayAs('floristSeason', '春花花瓣、夏陽護符、秋楓葉——四季齊！');
    sayAs('festivalDancer', '絲帶一舞，煙花同燈籠點亮夜空～');
    sayAs('lanternKeeper', '燈籠守護到位，祭典唔怕黑！');
    sayAs('snowVendor', '冬雪結晶新鮮出爐～暖笠笠！');
    sayAs('nightStall', '夜市檔旗一插，星空都亮！');
    sayAs('onsenAttendant', '溫泉票、熱毛巾、枕頭——浸完先瞓！');
    sayAs('architect', '藍圖同升級鎚——公會堂加建！');
    sayAs('innHost', '房間鑰匙喺度，旅店歡迎你～');
    sayAs('shopOwner', '店鈴一響，生意嚟啦！');
    sayAs('elementalist', '火水風三屬——寶石同魔杖齊！');
    sayAs('crystalSeller', '火焰、流水、疾風寶石，挑一件？');
    sayAs('windSage', '疾風扇一揮，風屬加成～');
    sayAs('earthDruid', '大地寶石同法杖——土屬穩陣！');
    sayAs('lightCleric', '聖光寶石、聖十字，驅暗必備～');
    sayAs('shadowRogue', '暗影寶石配影匕首，悄無聲息！');
    sayAs('achievementClerk', '功勳牌匾刻低——成就解鎖就掛牆！');
    sayAs('historian', '史冊翻開，舊日戰績一目了然～');
    sayAs('richPatron', '金袋贊助公會，金庫充盈有獎！');
    sayAs('dailyClerk', '每日簽到蓋印——連續簽到有禮盒！');
    sayAs('friendshipClerk', '羈絆心同友情信物，好友升一級～');
    sayAs('giftCourier', '禮物送到——羈絆戒指閃一閃！');
    sayAs('angler', '藍魚上鉤——釣竿同魚餌備好！');
    sayAs('minerGirl', '銅礦同木鎬，礦車載滿返嚟！');
    sayAs('baitSeller', '蟲餌同礦燈，夜釣夜採都唔驚！');
    sayAs('alchemist', '紅藍綠藥水——藥鍋一滾就成！');
    sayAs('herbWitch', '藥草葉同研缽，煉金書翻開嚟～');
    sayAs('labApprentice', '空藥瓶架好，學徒準備就緒！');
    sayAs('rancher', '小雞同綿羊——飼料袋倒滿！');
    sayAs('shepherdGirl', '羊毛剪同牛奶桶，牧場開工～');
    sayAs('clockmaker', '沙漏滴答，黎明正午深夜我報準！');
    sayAs('nightWatch', '深夜巡邏，提燈照路～');
    sayAs('rentClerk', '催租日、出糧日、祭典日——日曆記好！');
    sayAs('carpenter', '裝修腳手架穩陣～過一日記得交租呀！');
    try { flashFx('door'); } catch (e) {}
    const rent = rentAmount();
    const mapHtml = buildMiniMapHtml();
    modalBody.innerHTML =
      npcBannerHtml('carpenter', '裝修／木工') + npcBannerHtml('rentClerk', '租金書記') + npcBannerHtml('arenaReferee', '競技裁判') + npcBannerHtml('rankingClerk', '排名書記') + npcBannerHtml('cheerGirl', '啦啦隊員') + npcBannerHtml('storyteller', '說書人') + npcBannerHtml('gossipAunt', '八卦阿嬸') + npcBannerHtml('quietScribe', '沉默書吏') + npcBannerHtml('gatekeeper', '門衛') + npcBannerHtml('warehouseClerk', '倉庫書記') + npcBannerHtml('mapCartographer', '地圖製圖師') + npcBannerHtml('inventoryMaid', '背包女僕') + npcBannerHtml('pawnbroker', '當舖老板') + npcBannerHtml('locksmith', '鎖匠') + npcBannerHtml('battleCoach', '戰鬥教練') + npcBannerHtml('fieldMedic', '戰地醫官') + npcBannerHtml('tacticAdvisor', '戰術顧問') + npcBannerHtml('settingsSteward', '設定管家') + npcBannerHtml('soundTech', '音響技師') + npcBannerHtml('translator', '翻譯員') + npcBannerHtml('tutorialGuide', '新手嚮導') + npcBannerHtml('friendMatcher', '好友配對') + npcBannerHtml('questHelper', '委託助手') + npcBannerHtml('floristSeason', '季節花匠') + npcBannerHtml('festivalDancer', '祭典舞者') + npcBannerHtml('lanternKeeper', '燈籠守護') + npcBannerHtml('snowVendor', '雪攤小販') + npcBannerHtml('nightStall', '夜市檔主') + npcBannerHtml('onsenAttendant', '溫泉侍者') + npcBannerHtml('architect', '建築師') + npcBannerHtml('innHost', '旅店東主') + npcBannerHtml('shopOwner', '店主') + npcBannerHtml('elementalist', '元素使') + npcBannerHtml('crystalSeller', '水晶商人') + npcBannerHtml('windSage', '風賢者') + npcBannerHtml('earthDruid', '地德魯伊') + npcBannerHtml('lightCleric', '光牧師') + npcBannerHtml('shadowRogue', '影盜賊') + npcBannerHtml('achievementClerk', '成就書記') + npcBannerHtml('historian', '史官') + npcBannerHtml('richPatron', '富豪贊助人') + npcBannerHtml('dailyClerk', '每日書記') + npcBannerHtml('friendshipClerk', '友情書記') + npcBannerHtml('giftCourier', '禮物信使') + npcBannerHtml('angler', '釣客') + npcBannerHtml('minerGirl', '礦工少女') + npcBannerHtml('baitSeller', '魚餌販') + npcBannerHtml('alchemist', '煉金師') + npcBannerHtml('herbWitch', '藥草女巫') + npcBannerHtml('labApprentice', '實驗室學徒') + npcBannerHtml('rancher', '牧場主') + npcBannerHtml('shepherdGirl', '牧羊女') + npcBannerHtml('clockmaker', '鐘錶／沙漏') + npcBannerHtml('nightWatch', '夜哨提燈') + npcBannerHtml('taxCollector', '稅務／租金') + npcBannerHtml('rentClerk', '租金書記') + npcBannerHtml('clockmaker', '鐘錶匠') + npcBannerHtml('nightWatch', '夜哨') +
      '<div style="white-space:pre-wrap">第 ' + state.day + ' 日 · ' + weekdayLabel(state.day) +
      ' · 天氣' + weatherForDay(state.day).label + ' · ' + todForDay(state.day).label + '\n' +
      '賃金剩餘：' + state.wageLeft + ' 日\n' +
      '本期租金：' + rent + ' 金\n' +
      '現有金幣：' + state.gold + '</div>' +
      checkinBondHtml() +
      mapHtml +
      '<div style="margin-top:6px;white-space:pre-wrap">過一日會：推進日期、倒數賃金、刷新已完成委託、偶爾回復 1 件消耗道具。\n若有隊伍進行中就唔可以過日。</div>';
    modalActions.hidden = false;
    const btnAccept = document.getElementById('btn-accept');
    const btnDispatch = document.getElementById('btn-dispatch');
    if (btnAccept) {
      btnAccept.disabled = false;
      btnAccept.textContent = '過一日';
      const icoA = btnAccept.querySelector('img.modal-ico');
      if (icoA) icoA.src = 'assets/ui/btn-ok.png?v=' + ASSET_V;
    }
    if (btnDispatch) {
      btnDispatch.disabled = false;
      btnDispatch.textContent = '換一批委託';
      const ico = btnDispatch.querySelector('img.modal-ico');
      if (ico) ico.src = 'assets/ui/btn-cancel.png?v=' + ASSET_V;
    }
    modal.hidden = false;
  }

  /* —— 莉莉表情 —— */




  const CRAFT_STATIONS = [
    { id: 'anvil', name: '鐵砧鍛造', icon: 'assets/ui/craft-anvil.png', need: ['鐵礦', '木板', '錠材'], out: '鐵釘', cost: 10, talk: '噹噹～釘好啦！', npc: 'carpenterOld' },
    { id: 'loom', name: '織機紡織', icon: 'assets/ui/craft-loom.png', need: ['縫線', '布料'], out: '推薦信', cost: 12, talk: '布料織好，摺成書信邊～', npc: 'weaver' },
    { id: 'alchemy', name: '煉金台', icon: 'assets/ui/craft-alchemy.png', need: ['綠草', '空藥瓶'], out: '解毒劑', cost: 18, talk: '咕嚕咕嚕……藥水成啦！', npc: 'alchemistGirl' },
    { id: 'cookpot', name: '料理鍋', icon: 'assets/icons/cookpot.png', need: ['小魚', '香料'], out: '燉菜', cost: 15, talk: '香噴噴燉菜出爐！', npc: 'cook' }
  ];

  function itemAvailable(name) {
    const slot = document.querySelector('.slot.filled[data-item="' + name + '"]');
    if (!slot) return false;
    return !state.consumed.includes(name);
  }
  function consumeNamed(name) {
    if (!state.consumed.includes(name)) state.consumed.push(name);
  }
  function unconsumeNamed(name) {
    const i = state.consumed.indexOf(name);
    if (i >= 0) state.consumed.splice(i, 1);
  }




  function ranchPanelHtml() {
    return '<div class="ranch-panel">' +
      '<div class="ranch-row">' +
      '<img class="ranch-ico" src="assets/ui/barn-icon.png?v=' + ASSET_V + '" alt="穀倉"/>' +
      '<img class="ranch-ico" src="assets/icons/animal-chick.png?v=' + ASSET_V + '" alt="小雞"/>' +
      '<img class="ranch-ico" src="assets/icons/animal-sheep.png?v=' + ASSET_V + '" alt="綿羊"/>' +
      '<img class="ranch-ico" src="assets/icons/feed-bag.png?v=' + ASSET_V + '" alt="飼料"/>' +
      '<span class="ranch-label">牧場</span></div>' +
      '<div class="ranch-row">' +
      '<img class="ranch-ico" src="assets/icons/icon-milk-pail.png?v=' + ASSET_V + '" alt="奶桶"/>' +
      '<img class="ranch-ico" src="assets/icons/icon-shears.png?v=' + ASSET_V + '" alt="剪刀"/>' +
      '<span class="ranch-label">牛奶桶／羊毛剪</span></div></div>';
  }

  function alchemyPanelHtml() {
    return '<div class="alchemy-panel">' +
      '<div class="alch-row">' +
      '<img class="alch-ico" src="assets/ui/cauldron.png?v=' + ASSET_V + '" alt="藥鍋"/>' +
      '<img class="alch-ico" src="assets/ui/alchemy-book.png?v=' + ASSET_V + '" alt="煉金書"/>' +
      '<img class="alch-ico" src="assets/ui/phial-rack.png?v=' + ASSET_V + '" alt="藥瓶架"/>' +
      '<span class="alch-label">煉金台</span></div>' +
      '<div class="alch-row">' +
      '<img class="alch-ico" src="assets/icons/potion-red.png?v=' + ASSET_V + '" alt="紅藥"/>' +
      '<img class="alch-ico" src="assets/icons/potion-blue.png?v=' + ASSET_V + '" alt="藍藥"/>' +
      '<img class="alch-ico" src="assets/icons/potion-green.png?v=' + ASSET_V + '" alt="綠藥"/>' +
      '<span class="alch-label">紅／藍／綠藥水</span></div></div>';
  }

  function fishMineHtml() {
    return '<div class="fish-mine-panel">' +
      '<div class="fm-row">' +
      '<img class="fm-ico" src="assets/ui/rod-icon.png?v=' + ASSET_V + '" alt="釣竿"/>' +
      '<img class="fm-ico" src="assets/icons/fish-blue.png?v=' + ASSET_V + '" alt="藍魚"/>' +
      '<img class="fm-ico" src="assets/ui/bait-worm.png?v=' + ASSET_V + '" alt="蟲餌"/>' +
      '<span class="fm-label">釣魚</span></div>' +
      '<div class="fm-row">' +
      '<img class="fm-ico" src="assets/ui/mine-cart.png?v=' + ASSET_V + '" alt="礦車"/>' +
      '<img class="fm-ico" src="assets/icons/ore-copper.png?v=' + ASSET_V + '" alt="銅礦"/>' +
      '<img class="fm-ico" src="assets/icons/pickaxe-wood.png?v=' + ASSET_V + '" alt="木鎬"/>' +
      '<span class="fm-label">採礦</span></div></div>';
  }

  function openCraftModal() {
    try {
      sayAs('architect', '藍圖展開——升級鎚同星準備好！');
      sayAs('innHost', '旅店加建？房間鑰匙派晒～');
      sayAs('shopOwner', '店舖升級，店鈴叮叮！');
    } catch (e) {}

    activeQuest = null;
    modalMode = 'craft';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '工藝工房';
    sayAs('weaver', '織機同縫針備好，布料嚟！');
    sayAs('alchemistGirl', '空藥瓶裝滿就係藥水～');
    sayAs('carpenterOld', '鐵砧同鋸子，錠材打成釘！');
    sayAs('tailor', '縫線、木板、鐵礦、香料……工藝部齊啦！');
    let html = npcBannerHtml('tailor', '工藝織造') + npcBannerHtml('weaver', '織布工／縫針') + npcBannerHtml('miner', '採礦鍛造') + npcBannerHtml('minerBoss', '礦點頭目') + npcBannerHtml('carpenterOld', '老木匠／鋸') + npcBannerHtml('herbalist', '藥草煉金') + npcBannerHtml('apothecary', '藥劑師／研缽') + npcBannerHtml('herbWitch', '藥草魔女') + npcBannerHtml('icePriest', '冰祭司／暖茶') + npcBannerHtml('alchemistGirl', '煉金少女／藥瓶') + npcBannerHtml('healerClinic', '診所紅草藥') + npcBannerHtml('healerSister', '治療修女') + npcBannerHtml('cook', '料理鍋') + npcBannerHtml('chefLady', '女廚師燉菜') + npcBannerHtml('bartender', '酒保酒杯') + npcBannerHtml('candyGirl', '糖果／棒棒糖') + npcBannerHtml('teaLady', '茶點／熱茶') + npcBannerHtml('chefRival', '對手食譜') +
      '<div class="upgrade-chrome">' +
      '<img src="assets/ui/upgrade-arrow.png?v=' + ASSET_V + '" alt="升級" title="升級箭頭"/>' +
      '<img src="assets/ui/upgrade-star.png?v=' + ASSET_V + '" alt="星" title="升級星"/>' +
      '<img src="assets/ui/upgrade-hammer.png?v=' + ASSET_V + '" alt="鎚" title="升級鎚"/>' +
      '<img src="assets/ui/bldg-guildhall.png?v=' + ASSET_V + '" alt="公會堂"/>' +
      '<img src="assets/ui/bldg-inn.png?v=' + ASSET_V + '" alt="旅店"/>' +
      '<img src="assets/ui/bldg-shop.png?v=' + ASSET_V + '" alt="商店"/>' +
      '</div>' + fishMineHtml() + alchemyPanelHtml() + ranchPanelHtml() + npcBannerHtml('rancher', '牧場主') + npcBannerHtml('shepherdGirl', '牧羊女') + npcBannerHtml('angler', '釣客') + npcBannerHtml('minerGirl', '礦工少女') + npcBannerHtml('baitSeller', '魚餌販') + npcBannerHtml('alchemist', '煉金師') + npcBannerHtml('herbWitch', '藥草女巫') + npcBannerHtml('labApprentice', '實驗室學徒') +
      '<div style="font-size:12px;margin-bottom:6px">用採集物 mock 合成（消耗材料，產出放回庫存）。金幣：' + state.gold + '</div><div class="craft-grid">';
    CRAFT_STATIONS.forEach((st) => {
      const okMats = st.need.every(itemAvailable);
      const can = okMats && state.gold >= st.cost;
      html += '<div class="craft-row" data-craft="' + st.id + '">' +
        '<img class="ico" src="' + st.icon + '?v=' + ASSET_V + '" alt=""/>' +
        '<div class="meta"><b>' + st.name + '</b><br/><small>耗 ' + st.need.join('＋') + ' · ' + st.cost + ' 金 → 「' + st.out + '」</small></div>' +
        '<button type="button" class="craftbtn" data-craft-do="' + st.id + '"' + (can ? '' : ' disabled') + '>製作</button></div>';
    });
    html += '</div><div style="margin-top:6px;font-size:11px;opacity:.85">' + npcBannerHtml('fisher', '釣魚') + npcBannerHtml('fishmonger', '魚販') + npcBannerHtml('potter', '陶藝') + npcBannerHtml('child', '幫忙跑腿') + npcBannerHtml('scholar', '典籍／魔法書') + npcBannerHtml('courier', '包裹信使') + npcBannerHtml('courierBoy', '少年信使') +
      '<div><img src="assets/ui/rod-icon.png?v=' + ASSET_V + '" style="width:16px;height:16px;vertical-align:-3px"/> <img src="assets/ui/mine-cart.png?v=' + ASSET_V + '" style="width:16px;height:16px;vertical-align:-3px"/> 釣竿／礦車／蟲餌／銅礦可喺商店買</div></div>';
    modalBody.innerHTML = html;
    modalActions.hidden = true;
    modal.hidden = false;
    modalBody.querySelectorAll('[data-craft-do]').forEach((btn) => {
      btn.addEventListener('click', () => doCraft(btn.getAttribute('data-craft-do')));
    });
  }

  function doCraft(id) {
    const st = CRAFT_STATIONS.find((x) => x.id === id);
    if (!st) return;
    if (!st.need.every(itemAvailable)) { toast('材料唔夠'); setLilyMood('think'); return; }
    if (state.gold < st.cost) { toast('金幣唔夠'); setLilyMood('think'); return; }
    st.need.forEach(consumeNamed);
    state.gold -= st.cost;
    unconsumeNamed(st.out);
    updateEconomyUI();
    saveState();
    syncSlotAssignedState();
    setLilyMood('proud');
    popEmoji('note');
    try { flashFx('spark'); } catch (e) {}
    toast('製成「' + st.out + '」');
    say(st.talk);
    openCraftModal();
  }


  function openTrainModal() {
    activeQuest = null;
    modalMode = 'train';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = '訓練場／休息';
    const buff = state.trainBuff ? ('現有效果：下次派出 +' + state.trainBuff.rate + '%') : '目前無訓練加成';
    sayAs('trainerMaster', '啞鈴、火花、木人樁——練夠先升級！');
    sayAs('trainer', '隊列——啞鈴、靶子、木人樁準備好！休息交畀旅店老闆。');
    modalBody.innerHTML =
      npcBannerHtml('trainer', '訓練教官 · 肌力／精準／對打') + npcBannerHtml('trainerMaster', '訓練大師 · 升級火花') + npcBannerHtml('skillTutor', '技能導師 · 斬／療／盾') + npcBannerHtml('monkSensei', '武僧師父 · 專注') + npcBannerHtml('barrierMage', '結界法師 · Buff') + npcBannerHtml('trainerCoach', '訓練教練') + npcBannerHtml('knightRetire', '退役特訓顧問') + npcBannerHtml('veteran', '老兵特訓') + npcBannerHtml('apprentice', '見習陪練') +
      '<div class="train-panel">' +
      '<div style="font-size:12px;margin-bottom:4px">' + buff + ' · 金幣 ' + state.gold + '</div>' +
      '<div class="train-row"><img class="ico" src="assets/icons/dumbbell.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>肌力特訓</b><br/><small>花費 40 金 · 下次派出 +5%</small></div>' +
      '<button type="button" id="train-str">訓練</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/icons/target.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>精準射擊</b><br/><small>花費 55 金 · 下次派出 +8%</small></div>' +
      '<button type="button" id="train-aim">訓練</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/props/training-dummy.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>木人樁對打</b><br/><small>花費 1 日 · 下次派出 +6%</small></div>' +
      '<button type="button" id="train-day">練一日</button></div>' +
      '</div>' + npcBannerHtml('innMaid', '客房整理') + npcBannerHtml('innkeeper', '休息區 · 床鋪／浴缸／軟枕') + npcBannerHtml('innkeeperLady', '旅店女主人') + npcBannerHtml('bathAttendant', '浴場侍者') + '<div class="train-panel">' +
      '<div class="train-row"><img class="ico" src="assets/props/campfire-lit.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>營火休息</b><br/><small>免費 · HP+10 · 疲勞-2</small></div>' +
      '<button type="button" id="train-rest">休息</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/props/tent-rest.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>帳篷休整</b><br/><small>免費 · HP+14 · 疲勞-3</small></div>' +
      '<button type="button" id="train-tent">入帳</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/props/bedroll.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>睡袋小憩</b><br/><small>免費 · HP+8 · 疲勞-2</small></div>' +
      '<button type="button" id="train-bedroll">捲睡</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/icons/pillow.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>軟枕小憩</b><br/><small>免費 · HP+8 · 疲勞-2</small></div>' +
      '<button type="button" id="train-pillow">小憩</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/props/bed.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>床鋪安眠</b><br/><small>免費 · HP+22 · 疲勞-4</small></div>' +
      '<button type="button" id="train-bed">安眠</button></div>' +
      '<div class="train-row"><img class="ico" src="assets/props/bathtub.png?v=' + ASSET_V + '" alt=""/>' +
      '<div class="meta"><b>浴缸清潔</b><br/><small>免費 · HP+18 · 疲勞-3 · 香皂香</small></div>' +
      '<button type="button" id="train-bath">入浴</button></div>' +
      '<div style="font-size:11px;opacity:.85;margin-top:4px">公會 HP ' + (state.guildHp != null ? state.guildHp : 100) + '/100 · 疲勞 ' + (state.fatigue != null ? state.fatigue : 0) + '/10</div>' +
      '</div>';
    modalActions.hidden = true;
    modal.hidden = false;
    const doTrain = (cost, rate, label, useDay) => {
      if (!useDay) {
        if (state.gold < cost) { toast('金幣唔夠'); setLilyMood('think'); return; }
        state.gold -= cost;
      } else {
        state.day = (state.day || 1) + 1;
        if (state.wageLeft != null) state.wageLeft = Math.max(0, state.wageLeft - 1);
        try { updateDayUI(); } catch (e) {}
      }
      state.trainBuff = { rate: rate, label: label };
      updateEconomyUI();
      saveState();
      renderQuestTiles();
      setLilyMood('smile');
      popEmoji('note');
      try { flashFx('buff'); flashFx('trainSpar'); flashFx('levelSpark'); flashFx('expOrb'); } catch (e) {}
      toast(label + ' · 下次派出 +' + rate + '%');
      say(label + '完成！下次派出成功率 +' + rate + '%～');
      openTrainModal();
    };
    const b1 = document.getElementById('train-str');
    if (b1) b1.addEventListener('click', () => doTrain(40, 5, '肌力特訓', false));
    const b2 = document.getElementById('train-aim');
    if (b2) b2.addEventListener('click', () => doTrain(55, 8, '精準射擊', false));
    const b3 = document.getElementById('train-day');
    if (b3) b3.addEventListener('click', () => doTrain(0, 6, '木人樁一日', true));
    const doRest = (kind) => {
      const r = applyRest(kind);
      setLilyMood(kind === 'bath' ? 'cheer' : 'sleepy');
      popEmoji(kind === 'bath' ? 'hearts' : 'note');
      sayAs('innkeeper', r.label + '～公會 HP ' + r.hp + '，疲勞 ' + r.fatigue + '。慢慢休息啦。');
      toast(r.label + ' · HP+' + r.heal + ' · 疲勞-' + r.fat);
      try { flashFx('heal'); } catch (e) {}
      openTrainModal();
    };
    const b4 = document.getElementById('train-rest');
    if (b4) b4.addEventListener('click', () => doRest('camp'));
    const b4t = document.getElementById('train-tent');
    if (b4t) b4t.addEventListener('click', () => doRest('tent'));
    const b4b = document.getElementById('train-bedroll');
    if (b4b) b4b.addEventListener('click', () => doRest('bedroll'));
    const b5 = document.getElementById('train-pillow');
    if (b5) b5.addEventListener('click', () => doRest('pillow'));
    const b6 = document.getElementById('train-bed');
    if (b6) b6.addEventListener('click', () => doRest('bed'));
    const b7 = document.getElementById('train-bath');
    if (b7) b7.addEventListener('click', () => doRest('bath'));
  }


  function flashRankFx(kind) {
    let el = document.getElementById('rank-fx');
    if (!el) {
      el = document.createElement('img');
      el.id = 'rank-fx';
      el.className = 'rank-fx';
      el.alt = '';
      const app = document.getElementById('app') || document.body;
      app.appendChild(el);
    }
    const map = {
      good: 'assets/fx/rank-good.png',
      great: 'assets/fx/rank-great.png',
      perfect: 'assets/ui/rank-1-crown.png',
      miss: 'assets/fx/rank-miss.png',
      crown: 'assets/ui/rank-1-crown.png',
      medal2: 'assets/ui/rank-2-medal.png',
      medal3: 'assets/ui/rank-3-medal.png'
    };
    el.src = (map[kind] || map.good) + '?v=' + ASSET_V;
    el.hidden = false;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(flashRankFx._t);
    flashRankFx._t = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 280);
    }, 900);
  }

  function celebrateFx(kind) {
    const overlay = document.getElementById('celebrate-overlay');
    if (!overlay) {
      try { flashFx(kind === 'confetti' ? 'confetti' : 'firework'); } catch (e) {}
      return;
    }
    overlay.innerHTML = '';
    overlay.hidden = false;
    const srcFirework = 'assets/fx/firework.png?v=' + ASSET_V;
    const srcConfetti = 'assets/fx/confetti.png?v=' + ASSET_V;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const img = document.createElement('img');
      const useConfetti = kind === 'confetti' || (kind === 'both' && i % 2 === 1);
      img.className = 'cele-piece' + (useConfetti ? ' confetti' : '');
      img.src = useConfetti ? srcConfetti : srcFirework;
      img.alt = '';
      img.style.left = (8 + Math.random() * 84) + '%';
      img.style.top = (18 + Math.random() * 55) + '%';
      img.style.animationDelay = (Math.random() * 0.35) + 's';
      overlay.appendChild(img);
    }
    clearTimeout(celebrateFx._t);
    celebrateFx._t = setTimeout(() => {
      overlay.hidden = true;
      overlay.innerHTML = '';
    }, 1800);
  }

  function openSettingsModal(view) {
    activeQuest = null;
    modalMode = 'settings';
    modalRarity.textContent = '';
    modalRarity.className = 'modal-rarity';
    modalTitle.textContent = view === 'info' ? '遊戲說明' : '設定';
    const muted = !!state.muted;
    const vol = typeof state.volume === 'number' ? state.volume : 70;
    if (view === 'info') {
      modalBody.innerHTML =
        '<div class="settings-info">' +
        '【冒險者公會 · 開羅風】\n' +
        '1. 揀委託 → 接任務 → 庫存派道具 → 派出\n' +
        '2. 地城跑道會演出勝敗；勝有全額報酬\n' +
        '3. 寵物／料理／天氣會微調成功率\n' +
        '4. 設定可靜音（唔真播音樂，只記狀態）\n' +
        '5. 進度存喺本機 localStorage' +
        '</div>' +
        '<div class="settings-actions">' +
        '<button type="button" id="settings-back"><img src="assets/ui/back-arrow.png?v=' + ASSET_V + '" alt=""/>返回</button>' +
        '<button type="button" id="settings-close"><img src="assets/ui/close-x.png?v=' + ASSET_V + '" alt=""/>關閉</button>' +
        '</div>';
    } else {
      const lang = state.lang || 'zh-Hant';
      const langOn = lang === 'zh-Hant';
      modalBody.innerHTML =
        npcBannerHtml('settingsSteward', '設定管家') + npcBannerHtml('soundTech', '音響技師') + npcBannerHtml('translator', '翻譯員') +
        '<div class="settings-panel">' +
        '<div class="settings-tabs">' +
        '<button type="button" class="settings-tab active" data-set-tab="gear"><img src="assets/ui/settings-gear.png?v=' + ASSET_V + '" alt="設定"/><span>總覽</span></button>' +
        '<button type="button" class="settings-tab" data-set-tab="sound"><img src="assets/ui/settings-sound.png?v=' + ASSET_V + '" alt="音效"/><span>音效</span></button>' +
        '<button type="button" class="settings-tab" data-set-tab="lang"><img src="assets/ui/settings-language.png?v=' + ASSET_V + '" alt="語言"/><span>語言</span></button>' +
        '</div>' +
        '<div class="settings-row">' +
        '<img class="ico" src="assets/ui/settings-sound.png?v=' + ASSET_V + '" alt=""/>' +
        '<span class="label">音訊</span>' +
        '<button type="button" class="mute-btn toggle-btn" id="settings-mute" title="靜音切換">' +
        '<img class="toggle-ico" src="assets/ui/toggle-' + (muted ? 'off' : 'on') + '.png?v=' + ASSET_V + '" alt="' + (muted ? '關' : '開') + '"/>' +
        '</button>' +
        '<small>' + (muted ? '已靜音' : '開啟') + '</small>' +
        '</div>' +
        '<div class="settings-row">' +
        '<img class="ico" src="assets/ui/settings-sound.png?v=' + ASSET_V + '" alt=""/>' +
        '<div class="vol-wrap"><span class="label">音量</span>' +
        '<div class="vol-bar" title="音量"><div class="vol-fill" style="width:' + vol + '%"></div></div>' +
        '<input type="range" id="settings-vol" min="0" max="100" value="' + vol + '" ' + (muted ? 'disabled' : '') + '/>' +
        '<small id="settings-vol-label">' + vol + '%</small></div>' +
        '</div>' +
        '<div class="settings-row">' +
        '<img class="ico" src="assets/ui/settings-language.png?v=' + ASSET_V + '" alt=""/>' +
        '<span class="label">粵語繁中</span>' +
        '<button type="button" class="lang-btn" id="settings-lang" title="語言">' +
        '<img class="check-ico" src="assets/ui/checkbox-checked.png?v=' + ASSET_V + '" alt="已選"/>' +
        '</button>' +
        '<small>' + (langOn ? 'zh-Hant' : lang) + '</small>' +
        '</div>' +
        '<div class="settings-row">' +
        '<img class="ico" src="assets/ui/settings-gear.png?v=' + ASSET_V + '" alt=""/>' +
        '<span class="label">遊戲說明</span>' +
        '<button type="button" id="settings-info-btn" style="border:none;background:transparent;cursor:pointer">' +
        '<img src="assets/ui/info-i.png?v=' + ASSET_V + '" style="width:22px;height:22px;image-rendering:pixelated" alt="說明"/>' +
        '</button></div>' +
        '<div class="settings-actions">' +
        '<button type="button" id="settings-close"><img src="assets/ui/btn-back.png?v=' + ASSET_V + '" alt=""/>關閉</button>' +
        '</div></div>';
      try {
        sayAs('settingsSteward', '設定齒輪喺度——要調咩話我知！');
        sayAs('soundTech', muted ? '而家靜音，toggle 一撥就開返～' : '音效開啟中，耳罩備用！');
        sayAs('translator', '介面語言：粵語繁中（辭典就緒）');
      } catch (e) {}
    }
    modalActions.hidden = true;
    modal.hidden = false;
    const muteBtn = document.getElementById('settings-mute');
    if (muteBtn) muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      saveState();
      toast(state.muted ? '已靜音（視覺狀態）' : '已解除靜音');
      openSettingsModal();
    });
    const volEl = document.getElementById('settings-vol');
    if (volEl) volEl.addEventListener('input', () => {
      state.volume = Number(volEl.value) || 0;
      const fill = modalBody.querySelector('.vol-fill');
      if (fill) fill.style.width = state.volume + '%';
      const lab = document.getElementById('settings-vol-label');
      if (lab) lab.textContent = state.volume + '%';
      saveState();
    });
    const langBtn = document.getElementById('settings-lang');
    if (langBtn) langBtn.addEventListener('click', () => {
      state.lang = 'zh-Hant';
      saveState();
      toast('語言：粵語繁中');
      openSettingsModal();
    });
    const infoBtn = document.getElementById('settings-info-btn');
    if (infoBtn) infoBtn.addEventListener('click', () => openSettingsModal('info'));
    const backBtn = document.getElementById('settings-back');
    if (backBtn) backBtn.addEventListener('click', () => openSettingsModal());
    const closeBtn = document.getElementById('settings-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());
  }

  function showCombatFloat(kind, anchorEl) {
    const root = (anchorEl && anchorEl.querySelector) ? (anchorEl.querySelector('.lane-actors') || anchorEl) : (document.getElementById('dungeon') || document.body);
    if (!root) return;
    const map = {
      crit: 'assets/ui/dmg-crit.png',
      heal: 'assets/ui/heal-number.png',
      miss: 'assets/ui/miss-text.png',
      slashHit: 'assets/fx/fx-slash-hit.png',
      sparkleHeal: 'assets/fx/fx-sparkle-heal.png',
      block: 'assets/fx/fx-block-shield.png'
    };
    const el = document.createElement('img');
    el.className = 'combat-float ' + (kind || 'crit');
    el.src = (map[kind] || map.crit) + '?v=' + ASSET_V;
    el.alt = '';
    el.style.left = (40 + Math.random() * 20) + '%';
    el.style.top = (35 + Math.random() * 20) + '%';
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 280); }, 720);
  }

  function flashFx(kind, anchorEl) {
    const root = document.getElementById('app') || document.body;
    const el = document.createElement('img');
    el.className = 'fx-flash';
    const map = {
      win: 'assets/fx/star.png?v=' + ASSET_V,
      lose: 'assets/fx/debuff-down.png?v=' + ASSET_V,
      spark: 'assets/fx/fx-sparkle.png?v=' + ASSET_V,
      slash: 'assets/fx/fx-slash.png?v=' + ASSET_V,
      buff: 'assets/status/buff-up.png?v=' + ASSET_V,
      atkUp: 'assets/ui/buff-atk-up.png?v=' + ASSET_V,
      defUp: 'assets/ui/buff-def-up.png?v=' + ASSET_V,
      cdReady: 'assets/ui/cd-ready.png?v=' + ASSET_V,
      heart: 'assets/fx/heart.png?v=' + ASSET_V,
      hit: 'assets/fx/hit-star.png?v=' + ASSET_V,
      heal: 'assets/fx/fx-heal-cross.png?v=' + ASSET_V,
      stun: 'assets/fx/fx-stun-star.png?v=' + ASSET_V,
      coin: 'assets/ui/sfx-coin.png?v=' + ASSET_V,
      levelup: 'assets/ui/sfx-levelup.png?v=' + ASSET_V,
      levelSpark: 'assets/ui/level-spark.png?v=' + ASSET_V,
      expOrb: 'assets/ui/exp-orb.png?v=' + ASSET_V,
      trainSpar: 'assets/ui/train-spar.png?v=' + ASSET_V,
      trainDummy: 'assets/ui/train-dummy.png?v=' + ASSET_V,
      musicNote: 'assets/ui/music-note.png?v=' + ASSET_V,
      drumBeat: 'assets/ui/drum-beat.png?v=' + ASSET_V,
      micStage: 'assets/ui/mic-stage.png?v=' + ASSET_V,
      door: 'assets/ui/sfx-door.png?v=' + ASSET_V,
      hearts: 'assets/fx/emoji-hearts.png?v=' + ASSET_V,
      anger: 'assets/fx/emoji-anger.png?v=' + ASSET_V,
      sweat: 'assets/fx/emoji-sweat.png?v=' + ASSET_V,
      note: 'assets/fx/emoji-note.png?v=' + ASSET_V,
      firework: 'assets/fx/firework.png?v=' + ASSET_V,
      confetti: 'assets/fx/confetti.png?v=' + ASSET_V,
      raindrop: 'assets/fx/raindrop.png?v=' + ASSET_V,
      snowflake: 'assets/fx/snowflake.png?v=' + ASSET_V,
      leaf: 'assets/fx/leaf-fall.png?v=' + ASSET_V,
      sunray: 'assets/fx/sunray.png?v=' + ASSET_V,
      crit: 'assets/ui/dmg-crit.png?v=' + ASSET_V,
      dmgCrit: 'assets/ui/dmg-crit.png?v=' + ASSET_V,
      healNum: 'assets/ui/heal-number.png?v=' + ASSET_V,
      healNumber: 'assets/ui/heal-number.png?v=' + ASSET_V,
      miss: 'assets/ui/miss-text.png?v=' + ASSET_V,
      missText: 'assets/ui/miss-text.png?v=' + ASSET_V,
      slashHit: 'assets/fx/fx-slash-hit.png?v=' + ASSET_V,
      sparkleHeal: 'assets/fx/fx-sparkle-heal.png?v=' + ASSET_V,
      blockShield: 'assets/fx/fx-block-shield.png?v=' + ASSET_V,
      block: 'assets/fx/fx-block-shield.png?v=' + ASSET_V
    };
    // fallbacks if fx/ vs status/
    const alt = {
      win: 'assets/status/star.png?v=' + ASSET_V,
      lose: 'assets/status/debuff-down.png?v=' + ASSET_V,
      spark: 'assets/fx/fx-sparkle.png?v=' + ASSET_V,
      slash: 'assets/fx/fx-slash.png?v=' + ASSET_V,
      buff: 'assets/status/buff-up.png?v=' + ASSET_V,
      heart: 'assets/status/heart.png?v=' + ASSET_V,
      coin: 'assets/fx/coin-burst.png?v=' + ASSET_V,
      levelup: 'assets/fx/levelup.png?v=' + ASSET_V,
      door: 'assets/dungeon/tiles/tile-door.png?v=' + ASSET_V
    };
    el.src = map[kind] || map.spark;
    el.onerror = function () { el.src = alt[kind] || alt.spark; };
    el.style.left = '50%';
    el.style.top = anchorEl ? '72%' : '60%';
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 280); }, 520);
  }
  function popEmoji(kind) {
    const el = document.getElementById('emoji-bubble');
    if (!el) return;
    const map = {
      hearts: 'assets/ui/emote-heart.png',
      heart: 'assets/ui/emote-heart.png',
      anger: 'assets/ui/emo-exclaim.png',
      exclaim: 'assets/ui/emo-exclaim.png',
      question: 'assets/ui/emo-question.png',
      sweat: 'assets/ui/emote-sweat.png',
      sparkle: 'assets/ui/emote-sparkle.png',
      spark: 'assets/ui/emote-sparkle.png',
      note: 'assets/fx/emoji-note.png'
    };
    el.src = (map[kind] || map.sparkle) + '?v=' + ASSET_V;
    el.hidden = false;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(popEmoji._t);
    popEmoji._t = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 180);
    }, 650);
  }

  function setLilyMood(kind) {
    const el = document.getElementById('lily-mood');
    if (!el) return;
    const map = {
      smile: 'assets/heads/lily-mood-smile.png',
      think: 'assets/heads/lily-mood-think.png',
      wow: 'assets/heads/lily-mood-wow.png',
      sad: 'assets/heads/lily-mood-sad.png',
      angry: 'assets/heads/lily-mood-angry.png',
      sleepy: 'assets/heads/lily-mood-sleepy.png',
      cheer: 'assets/heads/lily-mood-cheer.png',
      shy: 'assets/heads/lily-mood-shy.png',
      proud: 'assets/heads/lily-mood-proud.png',
      panic: 'assets/heads/lily-mood-panic.png'
    };
    el.src = (map[kind] || map.smile) + '?v=' + ASSET_V;
  }

  function flashStamp(kind) {
    const el = document.getElementById('quest-stamp');
    if (!el) return;
    el.src = (kind === 'reject'
      ? 'assets/ui/dialog-stamp-no.png?v='
      : 'assets/ui/dialog-stamp-ok.png?v=') + ASSET_V;
    el.hidden = false;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(flashStamp._t);
    flashStamp._t = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { el.hidden = true; }, 280);
    }, 900);
  }

  const refreshBtn = document.getElementById('btn-refresh-quests');
  if (refreshBtn) refreshBtn.addEventListener('click', (e) => { e.stopPropagation(); manualRefreshQuests(); });

  /* —— 戰鬥 log UI —— */
  const dungeonWrapEl = document.querySelector('.dungeon-wrap');
  if (dungeonWrapEl) {
    dungeonWrapEl.addEventListener('click', (e) => {
      // ignore spare slots clicks as "empty" — still OK to open log
      const laneEl = e.target.closest && e.target.closest('.dungeon-lane');
      const tag = laneEl ? laneEl.dataset.lane : null;
      openBattleLog(tag);
    });
  }
  const battleLogClose = document.getElementById('battle-log-close');
  if (battleLogClose) battleLogClose.addEventListener('click', (e) => { e.stopPropagation(); closeBattleLog(); });
  if (battleLogEl) {
    battleLogEl.addEventListener('click', (e) => {
      if (e.target === battleLogEl) closeBattleLog();
    });
    const panel = battleLogEl.querySelector('.battle-log-panel');
    if (panel) panel.addEventListener('click', (e) => e.stopPropagation());
  }

  /* —— boot —— */
  const params = new URLSearchParams(location.search);
  const demo = params.get('demo');
  const reset = params.get('reset') === '1';
  if (reset) {
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
  } else {
    loadState();
  }

  buildLanes();
  updateEconomyUI();
  updateDayUI();
  syncMailNotif();
  syncLockedSlots();
  try { renderPartyStrips(); } catch (e) {}
  syncHeadActiveUI();
  paintHeadBars();
  renderQuestTiles();
  renderChapterStrip();
  renderEventBanner();
  try { ensureSeasonDeco(); } catch (e) {}
  syncPartyEmpty();
  try { ensureInvTabs(); ensureEquipSlots(); } catch (e) {}
  syncInvEmpty();
  restoreLaneFromState();
  setLilyMood('smile');
  try { ensureDialogueChrome(); } catch (e) {}
  say('歡迎嚟冒險者公會～揀任務、接任務、派道具、派出，就可以玩地城啦！門口有十位新面孔，撳「招募」請人入會再編成～');
  try { applyModalChromeBtns(); showBootSplash(1100); } catch (e) {}
  try { syncGuestHeart(); } catch (e) {}
  try { showTutorialTip('tap'); } catch (e) {}
  try { ensureExpandQuestsOnBoard(); renderQuestTiles(); } catch (e) {}
  try {
    const paramsBoot = new URLSearchParams(location.search);
    const demoBoot = paramsBoot.get('demo');
    if (paramsBoot.get('shot') === 'expand2') {
      try { if (state.tutorial) state.tutorial.seenRecruit = false; showRecruitTip(true); } catch (e2) {}
    } else if (paramsBoot.get('shot') === 'expand3') {
      try { if (state.tutorial) state.tutorial.seenParty = false; showPartyTip(true); } catch (e2) {}
    } else if (demoBoot !== 'expand1' && demoBoot !== 'expand2' && demoBoot !== 'expand3') {
      setTimeout(function () { try { showRecruitTip(); } catch (e2) {} }, 1600);
    }
  } catch (e) {}

  // demo / screenshot helpers
  async function runDemoPlaythrough() {
    // reset soft for clean shot
    state = defaultState();
    saveState();
    buildLanes();
    LANE_TAGS.forEach(resetLaneVisual);
    updateEconomyUI();
    // demo party: 2 front + mage to show special / rate
    state.party = { front: ['sword', 'tank'], back: ['mage', 'healer'] };
    syncHeadActiveUI();
    renderQuestTiles();

    const q0 = QUEST_DEFS[0];
    const q1 = QUEST_DEFS[1];
    acceptQuest(q0);
    selectedQuestId = q0.id;
    state.assigned[q0.id] = ['地下城地圖', '火把'];
    acceptQuest(q1);
    selectedQuestId = q1.id;
    state.assigned[q1.id] = ['長劍', '木盾'];
    saveState();
    renderQuestTiles();

    // force outcomes for screenshot: herb win, goblin lose
    await dispatchWithForced(q0, true, 'A');
    await dispatchWithForced(q1, false, 'B');
    // C fighting mid? leave idle or start starfall mid-fight freeze
    const q2 = QUEST_DEFS[2];
    acceptQuest(q2);
    selectedQuestId = q2.id;
    state.assigned[q2.id] = ['解毒劑'];
    saveState();
    renderQuestTiles();
    // start C animation then freeze mid via partial
    const ui = laneUi.C;
    const hero = resolveLaneHero(q2);
    const mon = q2.monsterId ? monsterAssetById(q2.monsterId) : DUNGEON_ASSETS.monsters[q2.laneMonster % DUNGEON_ASSETS.monsters.length];
    ui.party.querySelector('img').src = hero.src;
    ui.party.classList.toggle('chibi-hero', !!(hero && (hero.id === 'knight' || hero.id === 'witch')));
    ui.monster.querySelector('img').src = mon.src;
    resetLaneVisual('C');
    ui.party.classList.remove('hidden-actor');
    ui.monster.classList.remove('hidden-actor');
    setLeft(ui.party, 40);
    setLeft(ui.monster, 56);
    ui.party.classList.add('fighting');
    ui.monster.classList.add('fighting');
    ui.lane.className = 'dungeon-lane phase-fight busy';
    ui.fx.textContent = '戰鬥';
    ui.fx.className = 'lane-fx show';
    say('示範：藥草勝、哥布林敗、星落戰鬥中——撳地城區可睇文字 log！');
    if (new URLSearchParams(location.search).get('log') === '1') {
      openBattleLog('A');
    }
  }

  async function dispatchWithForced(q, win, laneTag) {
    const st = state.quests[q.id];
    const rate = successRate(q);
    const items = (state.assigned[q.id] || []).slice();
    items.forEach((it) => {
      if (!state.consumed.includes(it)) state.consumed.push(it);
    });
    state.assigned[q.id] = [];
    st.status = 'active';
    st.rateAtDispatch = rate;
    state.lanes[laneTag] = { questId: q.id, phase: 'running', outcome: win ? 'win' : 'lose', rate, roll: win ? 0 : 99 };
    saveState();
    renderQuestTiles();
    await playLaneMission(laneTag, q, win);
    st.status = 'done';
    st.result = win ? 'win' : 'lose';
    state.lanes[laneTag].phase = 'done';
    if (win) {
      state.gold += (isDoubleRewardDay() ? q.reward * 2 : q.reward);
      bumpRep(3);
    } else {
      state.gold += Math.max(8, Math.floor((isDoubleRewardDay() ? q.reward * 2 : q.reward) * 0.08));
      state.rep = Math.max(0, state.rep - 1);
    }
    updateEconomyUI();
    saveState();
    renderQuestTiles();
  }

  if (demo === 'expand3') {
    try {
      if (!state.recruited) state.recruited = DEFAULT_RECRUITED.slice();
      if (state.recruited.indexOf('knight') < 0) state.recruited.push('knight');
      if (state.recruited.indexOf('witch') < 0) state.recruited.push('witch');
      state.party = { front: ['knight', 'sword'], back: ['witch', 'mage'], leader: 'knight' };
      state.bonds = Object.assign({}, state.bonds, { knight: Math.max(bondOf('knight'), 40), witch: Math.max(bondOf('witch'), 28), sword: Math.max(bondOf('sword'), 24) });
      state.board = ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'];
      ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'].forEach((id) => {
        if (!state.quests[id] || state.quests[id].status === 'done') state.quests[id] = { status: 'open', result: null, rateAtDispatch: null };
      });
      state.tutorial = Object.assign({}, state.tutorial, { seenTap: true, seenDrag: true, seenHold: true, seenRecruit: true, seenParty: true });
      const hideTip = document.getElementById('tutorial-tip');
      if (hideTip) hideTip.hidden = true;
      renderPartyStrips();
      syncHeadActiveUI();
      updateEconomyUI();
      renderQuestTiles();
      const setup = function (tag, heroId, monId, label, flash) {
        const mon = monsterAssetById(monId);
        const hero = heroAssetById(heroId);
        const ui = laneUi[tag];
        if (!ui) return;
        ui.party.querySelector('img').src = hero.src;
        ui.party.classList.add('chibi-hero');
        ui.monster.querySelector('img').src = mon.src;
        resetLaneVisual(tag);
        ui.party.classList.remove('hidden-actor');
        ui.monster.classList.remove('hidden-actor');
        setLeft(ui.party, 36);
        setLeft(ui.monster, 58);
        ui.party.classList.add('fighting');
        ui.monster.classList.add('fighting');
        ui.lane.className = 'dungeon-lane phase-fight busy';
        if (flash) ui.party.classList.add('skill-flash', 'skill-flash-hold');
        if (ui.fx) { ui.fx.textContent = label; ui.fx.className = 'lane-fx show'; }
      };
      setup('A', 'knight', 'ironKnight', '希琳技能閃', true);
      setup('B', 'sword', 'goblin', '艾登出戰', false);
      sayAs('partyRecruiter', '跑道加高啦——十位冒險者而家統一用 Q 版精靈，唔再混舊像素！');
      toast('自由擴展③ 統一精靈', 'ok');
    } catch (e) { console.warn(e); }
  } else if (demo === 'expand2') {
    try {
      if (!state.recruited) state.recruited = DEFAULT_RECRUITED.slice();
      if (state.recruited.indexOf('knight') < 0) state.recruited.push('knight');
      if (state.recruited.indexOf('witch') < 0) state.recruited.push('witch');
      state.party = { front: ['knight', 'sword'], back: ['witch', 'mage'], leader: 'knight' };
      state.bonds = Object.assign({}, state.bonds, { knight: Math.max(bondOf('knight'), 36), witch: Math.max(bondOf('witch'), 28) });
      state.board = ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'];
      ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'].forEach((id) => {
        if (!state.quests[id]) state.quests[id] = { status: 'open', result: null, rateAtDispatch: null };
      });
      renderPartyStrips();
      syncHeadActiveUI();
      updateEconomyUI();
      renderQuestTiles();
      const mon = monsterAssetById('ironKnight');
      const hero = heroAssetById('knight');
      const ui = laneUi.A;
      if (ui) {
        ui.party.querySelector('img').src = hero.src;
        ui.party.classList.add('chibi-hero');
        ui.monster.querySelector('img').src = mon.src;
        resetLaneVisual('A');
        ui.party.classList.remove('hidden-actor');
        ui.monster.classList.remove('hidden-actor');
        setLeft(ui.party, 38);
        setLeft(ui.monster, 58);
        ui.party.classList.add('fighting');
        ui.monster.classList.add('fighting');
        ui.lane.className = 'dungeon-lane phase-fight busy';
        if (ui.fx) { ui.fx.textContent = '希琳出戰'; ui.fx.className = 'lane-fx show'; }
      }
      sayAs('partyRecruiter', '女騎士希琳喺跑道上——呢次唔再借用劍士像素啦！');
      toast('自由擴展② 地城精靈', 'ok');
    } catch (e) { console.warn(e); }
  } else if (demo === 'expand1') {
    try {
      state.gold = Math.max(state.gold || 0, 200);
      state.board = ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'];
      ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'].forEach((id) => {
        if (!state.quests[id]) state.quests[id] = { status: 'open', result: null, rateAtDispatch: null };
      });
      updateEconomyUI();
      renderQuestTiles();
      renderPartyStrips();
      syncHeadActiveUI();
      sayAs('partyRecruiter', '第一段擴展——十位新面孔等你招募、編成！');
      say('女騎士希琳同魔女薇爾喺門口等，歡迎巡邏亦掛咗喺任務板～');
      toast('自由擴展① 可玩', 'ok');
    } catch (e) { console.warn(e); }
    openRecruitModal();
  } else if (demo === 'pet') {
    updateDayUI(); syncPetUI(); openPetModal();
  } else if (demo === 'shop') {
    updateDayUI(); syncMailNotif(); openShopModal();
  } else if (demo === 'mail') {
    updateDayUI(); openMailModal();
  } else if (demo === 'ach') {
    updateDayUI(); state.questsAccepted = Math.max(state.questsAccepted||0,1); state.wins = Math.max(state.wins||0,10); state.gold = Math.max(state.gold,500); state.rep = Math.max(state.rep,80); checkAchievements(true); openAchModal();
  } else if (demo === 'play' || demo === 'items' || demo === 'log' || demo === 'refresh' || demo === 'day' || params.get('freeze') === '1') {
    runDemoPlaythrough().then(() => {
      if (demo === 'log' || params.get('log') === '1') openBattleLog('A');
      if (demo === 'refresh') {
        manualRefreshQuests();
      }
      if (demo === 'day') {
        // clear running freeze on C for day advance demo
        state.lanes.C = { questId: 'starfall', phase: 'done', outcome: 'win', rate: 40, roll: 1 };
        if (state.quests.starfall) { state.quests.starfall.status = 'done'; state.quests.starfall.result = 'win'; }
        openDayModal();
      }
    });
  } else if (demo === 'quest') {
    openQuest(questById('starfall') || QUEST_POOL[2]);
  } else if (demo === 'r20' || demo === 'r21' || demo === 'r22' || demo === 'r23' || demo === 'r24' || demo === 'r25' || demo === 'r26' || demo === 'r27' || demo === 'r28' || demo === 'r29' || demo === 'r30' || demo === 'r31' || demo === 'r32' || demo === 'r33' || demo === 'r34' || demo === 'r35' || demo === 'r36' || demo === 'r37' || demo === 'r38' || demo === 'r39' || demo === 'r40' || demo === 'r41' || demo === 'r42' || demo === 'r43' || demo === 'r44' || demo === 'r45' || demo === 'r46' || demo === 'r47' || demo === 'r48' || demo === 'r49' || demo === 'r50' || demo === 'r51' || demo === 'r52' || demo === 'r53' || demo === 'r54' || demo === 'r55' || demo === 'r56' || demo === 'r57' || demo === 'r58' || demo === 'r59') {
    state.rep = Math.max(state.rep, 78);
    state.wins = Math.max(state.wins || 0, 9);
    state.day = 9; // festival tue-ish + double (9%3==0)
    state.eventDouble = true;
    state.eventFestival = true;
    state.tutorial = { seenTap: true, seenDrag: true, seenHold: true };
    saveState();
    updateEconomyUI();
    updateDayUI();
    renderChapterStrip();
    renderEventBanner();
    const monTable = { r75: 'madChick', r74: 'slimeFlask', r73: 'riverFish', r72: 'calendarImp', r71: 'trophyKnight', r70: 'earthMole', r69: 'fireSprite', r68: 'brickGolem', r67: 'snowman', r66: 'blossomSprite', r65: 'tutorialSlime', r64: 'gearGolem', r63: 'critBlade', r62: 'bagMimic', r61: 'gateGolem', r60: 'wordWisp', r59: 'arenaChamp', r58: 'poisonToad', r57: 'bladeWraith', r56: 'clockworkOwl', r55: 'treasureMimic', r54: 'riverSerpent', r53: 'echoBanshee', r52: 'feralHound', r51: 'scarecrow', r50: 'paperGolem', r49: 'banditChief', r48: 'ironKnight', r47: 'jellyBlob', r46: 'vineSnake', r45: 'sandScorpion', r44: 'stoneTurtle', r43: 'lavaSlug', r42: 'crystalGolem', r41: 'earthElemental', r40: 'bahamut', r39: 'griffin', r38: 'leviathan', r37: 'wyvern', r36: 'dragonAdult', r35: 'cerberus', r34: 'beholder', r33: 'minotaur', r32: 'chimera', r31: 'harpy', r30: 'unicorn', r29: 'phoenix', r28: 'hydra', r27: 'gargoyle', r26: 'lich', r25: 'owl', r24: 'boar', r23: 'wraith', r22: 'dragonBaby', r21: 'mimic', r20: 'skeleton' };
    const monId = monTable[demo] || 'skeleton';
    const mon = monsterAssetById(monId);
    const hero = heroAssetById('sword');
    const ui = laneUi.A;
    if (ui) {
      ui.party.querySelector('img').src = hero.src;
      ui.monster.querySelector('img').src = mon.src;
      resetLaneVisual('A');
      ui.party.classList.remove('hidden-actor');
      ui.monster.classList.remove('hidden-actor');
      setLeft(ui.party, 38);
      setLeft(ui.monster, 58);
      ui.party.classList.add('fighting');
      ui.monster.classList.add('fighting');
      ui.lane.className = 'dungeon-lane phase-fight busy';
      ui.fx.textContent = mon.label || monId;
      ui.fx.className = 'lane-fx show';
    }
    try { ensureDialogueChrome(); } catch (e) {}
    if (demo === 'expand2') {
    try {
      if (!state.recruited) state.recruited = DEFAULT_RECRUITED.slice();
      if (state.recruited.indexOf('knight') < 0) state.recruited.push('knight');
      if (state.recruited.indexOf('witch') < 0) state.recruited.push('witch');
      state.party = { front: ['knight', 'sword'], back: ['witch', 'mage'], leader: 'knight' };
      state.bonds = Object.assign({}, state.bonds, { knight: Math.max(bondOf('knight'), 36), witch: Math.max(bondOf('witch'), 28) });
      state.board = ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'];
      ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'].forEach((id) => {
        if (!state.quests[id]) state.quests[id] = { status: 'open', result: null, rateAtDispatch: null };
      });
      renderPartyStrips();
      syncHeadActiveUI();
      updateEconomyUI();
      renderQuestTiles();
      const mon = monsterAssetById('ironKnight');
      const hero = heroAssetById('knight');
      const ui = laneUi.A;
      if (ui) {
        ui.party.querySelector('img').src = hero.src;
        ui.party.classList.add('chibi-hero');
        ui.monster.querySelector('img').src = mon.src;
        resetLaneVisual('A');
        ui.party.classList.remove('hidden-actor');
        ui.monster.classList.remove('hidden-actor');
        setLeft(ui.party, 38);
        setLeft(ui.monster, 58);
        ui.party.classList.add('fighting');
        ui.monster.classList.add('fighting');
        ui.lane.className = 'dungeon-lane phase-fight busy';
        if (ui.fx) { ui.fx.textContent = '希琳出戰'; ui.fx.className = 'lane-fx show'; }
      }
      sayAs('partyRecruiter', '女騎士希琳喺跑道上——呢次唔再借用劍士像素啦！');
      toast('自由擴展② 地城精靈', 'ok');
    } catch (e) { console.warn(e); }
  } else if (demo === 'expand1') {
      try {
        state.gold = Math.max(state.gold || 0, 200);
        state.board = ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'];
        ['newcomerWelcome', 'knightTrial', 'witchBrewEscort'].forEach((id) => {
          if (!state.quests[id]) state.quests[id] = { status: 'open', result: null, rateAtDispatch: null };
        });
        updateEconomyUI();
        try { renderQuestTiles(); } catch (e) {}
        sayAs('partyRecruiter', '第一段擴展——十位新面孔等你招募、編成！');
        say('女騎士希琳同魔女薇爾喺門口等，歡迎巡邏亦掛咗喺任務板～');
        toast('自由擴展① 可玩', 'ok');
      } catch (e) {}
      try { renderPartyStrips(); syncHeadActiveUI(); } catch (e) {}
      openRecruitModal();
    }
    else if (demo === 'r75') {
      try {
        sayAs('rancher', '第75輪——牧場小雞綿羊齊晒！');
        sayAs('shepherdGirl', '羊毛剪同牛奶桶準備好～');
        toast('第75輪掛入', 'ok');
      } catch (e) {}
      openCraftModal();
    }
    else if (demo === 'r74') {
      try {
        sayAs('alchemist', '第74輪——紅藍綠藥水同藥鍋齊晒！');
        sayAs('herbWitch', '藥草葉同煉金書準備好～');
        sayAs('labApprentice', '空藥瓶架同研缽就緒！');
        toast('第74輪掛入', 'ok');
      } catch (e) {}
      openCraftModal();
    }
    else if (demo === 'r73') {
      try {
        sayAs('angler', '第73輪——釣魚同採礦裝備齊晒！');
        sayAs('minerGirl', '銅礦同木鎬，礦車出發！');
        sayAs('baitSeller', '蟲餌同礦燈準備好～');
        toast('第73輪掛入', 'ok');
      } catch (e) {}
      openCraftModal();
    }
    else if (demo === 'r72') {
      try {
        sayAs('dailyClerk', '第72輪——簽到章、連續簽到、禮盒齊晒！');
        sayAs('friendshipClerk', '羈絆心同友情信物喺度～');
        sayAs('giftCourier', '禮物信使送到羈絆戒指！');
        toast('第72輪掛入', 'ok');
      } catch (e) {}
      openDayModal();
    }
    else if (demo === 'r71') {
      try {
        state.questsAccepted = Math.max(state.questsAccepted || 0, 1);
        state.wins = Math.max(state.wins || 0, 10);
        state.gold = Math.max(state.gold || 0, 500);
        state.rep = Math.max(state.rep || 0, 80);
        sayAs('achievementClerk', '第71輪——成就章同稱號框齊晒！');
        toast('第71輪掛入', 'ok');
      } catch (e) {}
      openAchModal();
      try {
        sayAs('historian', '史冊翻到最新一頁～');
        sayAs('richPatron', '金袋叮噹，贊助落成！');
      } catch (e) {}
    }
    else if (demo === 'r70') {
      try {
        sayAs('earthDruid', '第70輪——土／光／暗寶石同元素齊晒！');
        toast('第70輪掛入', 'ok');
      } catch (e) {}
      openShopModal();
      try {
        sayAs('lightCleric', '聖光寶石閃住～');
        sayAs('shadowRogue', '暗影寶石藏喺袖裡！');
      } catch (e) {}
    }
    else if (demo === 'r69') {
      try {
        sayAs('elementalist', '第69輪——火水風寶石同元素圖齊晒！');
        toast('第69輪掛入', 'ok');
      } catch (e) {}
      openShopModal();
      try {
        sayAs('crystalSeller', '三色寶石擺滿櫃～');
        sayAs('windSage', '風屬委託今日加成！');
      } catch (e) {}
    }
    else if (demo === 'r68') {
      try {
        sayAs('architect', '第68輪——公會堂、旅店、商店建築圖齊晒！');
        toast('第68輪掛入', 'ok');
      } catch (e) {}
      openCraftModal();
      try {
        sayAs('innHost', '升級星一閃，旅店升一級！');
        sayAs('shopOwner', '升級箭頭指住店舖～');
      } catch (e) {}
    }
    else if (demo === 'r67') {
      state.eventFestival = true;
      state.day = 22; // winter-ish slice
      try {
        updateDayUI();
        renderEventBanner();
        ensureSeasonDeco();
        flashFx('snowflake');
        sayAs('snowVendor', '第67輪——冬雪、夜市、溫泉齊晒！');
        toast('第67輪掛入', 'ok');
      } catch (e) {}
      openDayModal();
      try {
        sayAs('nightStall', '檔旗插好，星空夜市開檔～');
        sayAs('onsenAttendant', '溫泉票到手，熱毛巾同枕頭備好！');
      } catch (e) {}
    }
    else if (demo === 'r66') {
      state.eventFestival = true;
      state.day = 2; // spring-ish
      try {
        updateDayUI();
        renderEventBanner();
        ensureSeasonDeco();
        flashFx('firework');
        sayAs('floristSeason', '第66輪——春夏秋裝飾同祭典燈籠齊晒！');
        toast('第66輪掛入', 'ok');
      } catch (e) {}
      openDayModal();
      try {
        sayAs('festivalDancer', '絲帶飛起，煙花啪一聲！');
        sayAs('lanternKeeper', '燈籠守護緊，夜路唔使驚～');
      } catch (e) {}
    }
    else if (demo === 'r65') {
      try {
        state.tutorial = { seenTap: false, seenDrag: false, seenHold: false };
        state.board = [];
        state.mails = [];
        state.mailRead = true;
        sayAs('tutorialGuide', '第65輪——空狀態、引導箭頭、手指齊晒！');
        showTutorialTip('tap');
        toast('第65輪掛入', 'ok');
      } catch (e) {}
      try { renderBoard(); } catch (e) {}
      openMailModal();
      try {
        sayAs('friendMatcher', '好友名單空空？信物嚟配對！');
        sayAs('questHelper', '任務板空就用羽毛筆寫新委託～');
        const body = document.getElementById('modal-body');
        if (body) {
          body.insertAdjacentHTML('afterbegin',
            emptyStateHtml('friends', '暫時未有好友 · 用好友信物配對啦') +
            emptyStateHtml('quest', '任務板暫時冇委託 · 過一日或等刷新') +
            emptyStateHtml('inbox', '信箱空空如也 · 有新通告會喺度出現') +
            npcBannerHtml('tutorialGuide', '新手嚮導') + npcBannerHtml('friendMatcher', '好友配對') + npcBannerHtml('questHelper', '委託助手')
          );
        }
      } catch (e) {}
    }
    else if (demo === 'r64') {
      try {
        sayAs('settingsSteward', '第64輪——設定齒輪、音效、語言齊晒！');
        toast('第64輪掛入', 'ok');
      } catch (e) {}
      openSettingsModal();
      try {
        sayAs('soundTech', 'toggle 開、toggle 關——聽得清楚未？');
        sayAs('translator', 'checkbox 剔低：粵語繁中！');
      } catch (e) {}
    }
    else if (demo === 'r63') {
      try {
        sayAs('battleCoach', '第63輪——暴擊、治療數字、格擋齊晒！');
        flashFx('slashHit'); showCombatFloat('crit');
        setTimeout(function(){ try { flashFx('sparkleHeal'); showCombatFloat('heal'); } catch(e2){} }, 400);
        setTimeout(function(){ try { flashFx('blockShield'); showCombatFloat('miss'); showCombatFloat('block'); } catch(e3){} }, 800);
        toast('第63輪掛入', 'ok');
      } catch (e) {}
      openTrainModal();
      try {
        sayAs('fieldMedic', '繃帶備好，治療數字會跳～');
        sayAs('tacticAdvisor', '戰術板記低：暴擊、MISS、格擋！');
      } catch (e) {}
    }
    else if (demo === 'r62') {
      try {
        ensureInvTabs();
        decorateInvSlots();
        setInvTab('item');
        sayAs('inventoryMaid', '第62輪——背包格、篩選、排序齊晒！');
        toast('第62輪掛入', 'ok');
      } catch (e) {}
      openShopModal();
      try {
        sayAs('pawnbroker', '掛鎖保管，金幣蟲群小心！');
        sayAs('locksmith', '鎖靈幽靈？我啲鎖夠硬！');
      } catch (e) {}
    }
    else if (demo === 'r61') {
      try {
        showBootSplash(1200);
        sayAs('gatekeeper', '第61輪——門衛、倉庫、製圖師就位！');
        toast('第61輪掛入', 'ok');
      } catch (e) {}
      openDayModal();
      try {
        sayAs('warehouseClerk', '等陣……載入木箱清單中～');
        sayAs('mapCartographer', '圖釘釘好，請稍候～');
      } catch (e) {}
    }
    else if (demo === 'r60') {
      try {
        ensureDialogueChrome();
        setDialogueBubble('speech');
        sayAs('storyteller', '第60輪——氣泡、表情、說書人齊晒！', 'speech');
        popEmoji('sparkle');
        setTimeout(function () { try { setDialogueBubble('thought'); popEmoji('heart'); } catch (e2) {} }, 400);
        setTimeout(function () { try { setDialogueBubble('shout'); popEmoji('sweat'); } catch (e3) {} }, 900);
        toast('第60輪掛入', 'ok');
      } catch (e) {}
      openShopModal();
      try {
        sayAs('gossipAunt', '喇叭一響，全鎮都知你返嚟啦！', 'shout');
        sayAs('quietScribe', '卷軸、墨壺、喇叭——三樣我都備好。', 'thought');
      } catch (e) {}
    }
    else if (demo === 'r59') {
      state.wins = Math.max(state.wins || 0, 22);
      state.rep = Math.max(state.rep || 0, 82);
      try {
        updateEconomyUI();
        flashRankFx('crown');
        toast('第59輪掛入', 'ok');
      } catch (e) {}
      openDayModal();
    }
    else if (demo === 'r58') {
      try {
        ensurePartyStatus();
        state.partyStatus = state.partyStatus || {};
        state.partyStatus.sword = ['poison'];
        state.partyStatus.tank = ['burn'];
        state.partyStatus.mage = ['freeze'];
        syncHeadActiveUI();
        flashFx('heal');
        toast('第58輪掛入', 'ok');
      } catch (e) {}
      openShopModal();
    }
    else if (demo === 'r57') {
      try {
        ensurePartyStatus();
        state.partyStatus = state.partyStatus || {};
        state.partyStatus.sword = ['atkUp', 'buff'];
        state.partyStatus.tank = ['defUp'];
        state.partyStatus.healer = ['regen'];
        syncHeadActiveUI();
        flashFx('atkUp'); flashFx('defUp'); flashFx('cdReady');
        toast('第57輪掛入', 'ok');
      } catch (e) {}
      openTrainModal();
    }
    else if (demo === 'r56') { state.day = 3; state.wageLeft = 1; try { updateDayUI(); toast('第56輪掛入', 'ok'); } catch (e) {} openDayModal(); }
    else if (demo === 'r55') { try { toast('第55輪掛入', 'ok'); } catch (e) {} openShopModal(); }
    else if (demo === 'r54') { try { toast('第54輪掛入', 'ok'); } catch (e) {} openDayModal(); }
    else if (demo === 'r53') { state.eventFestival = true; try { renderEventBanner(); flashFx('musicNote'); flashFx('drumBeat'); toast('第53輪掛入', 'ok'); } catch (e) {} openDayModal(); }
    else if (demo === 'r52') { try { syncPetUI(); toast('第52輪掛入', 'ok'); } catch (e) {} openPetModal(); }
    else if (demo === 'r51') { state.day = 7; try { updateDayUI(); toast('第51輪掛入', 'ok'); } catch (e) {} openDayModal(); }
    else if (demo === 'r50') { state.mailRead = false; if (!state.mails || !state.mails.length) state.mails = [{ id: 'fest', title: '祭典邀請', body: '誠邀蒞臨本季祭典——請用火漆印回函。' }]; try { syncMailNotif(); renderChapterStrip(); toast('第50輪掛入', 'ok'); } catch (e) {} openMailModal(); }
    else if (demo === 'r49') { try { syncHeadActiveUI(); toast('第49輪掛入', 'ok'); } catch (e) {} openDayModal(); }
    else if (demo === 'r48') { try { ensureEquipSlots(); setInvTab('equip'); toast('第48輪掛入', 'ok'); } catch (e) {} openShopModal(); }
    else if (demo === 'r47') { state.fatigue = 7; state.gold = Math.min(state.gold, 25); try { updateEconomyUI(); syncNeedStatus(); } catch (e) {} openShopModal(); try { toast('第47輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r46') { openDayModal(); try { toast('第46輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r45') { openShopModal(); try { toast('第45輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r44') { openTrainModal(); try { toast('第44輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r43') { openDayModal(); try { toast('第43輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r42') { openCraftModal(); try { toast('第42輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r41') { openDayModal(); try { toast('第41輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r40') { openTrainModal(); try { flashFx('trainSpar'); flashFx('levelSpark'); flashFx('expOrb'); toast('第40輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r27' || demo === 'r28' || demo === 'r29' || demo === 'r30' || demo === 'r31' || demo === 'r32' || demo === 'r33' || demo === 'r34' || demo === 'r35' || demo === 'r36' || demo === 'r37' || demo === 'r38' || demo === 'r39') { openDayModal(); try { toast('第27輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r26') { openCraftModal(); try { flashFx('slash'); flashFx('stun'); } catch (e) {} }
    else if (demo === 'r25') { openShopModal(); try { flashFriendship(); syncGuestHeart(); } catch (e) {} }
    else if (demo === 'r24') { openDayModal(); try { showBootSplash(800); } catch (e) {} }
    else if (demo === 'r23') { openCraftModal(); try { toast('第23輪掛入', 'ok'); } catch (e) {} }
    else if (demo === 'r22') openCraftModal();
    else if (demo === 'r21') openTrainModal();
    else openShopModal();
  } else if (demo === 'empty') {
    state.board = [];
    state.party = { front: [], back: [], leader: null };
    state.mails = [];
    state.mailRead = true;
    document.querySelectorAll('#inventory .slot.filled').forEach((s) => {
      const it = s.dataset.item;
      if (it && !state.consumed.includes(it)) state.consumed.push(it);
    });
    saveState();
    syncHeadActiveUI();
    renderQuestTiles();
    syncInvEmpty();
    renderChapterStrip();
    openMailModal();
  }
})();
