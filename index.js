const TelegramBot = require('node-telegram-bot-api');
const Dropbox = require('dropbox');
const utf8 = require('utf8');
const dotenv = require('dotenv');


const token = dotenv.config().parsed.TOKEN;
const dropboxToken = dotenv.config().parsed.DROP_BOX_TOKEN;
const myChatId = dotenv.config().parsed.MY_CHAT_ID;
const ideaFile = dotenv.config().parsed.IDEA_FILE;

const bot = new TelegramBot(token, {polling: true});
let notes = [];

const getHello = (msg) => {
  bot.sendMessage(msg.chat.id, "Hello, Homo Sapiens", {
    "reply_markup": {
      "keyboard": [['Write new genius idea'], ['Collect new genius image']]
    }
  });
}

const writeIdea = (msg) => {
  notes = [];
  bot.sendMessage(
    msg.chat.id,
    'Ok man, just write someone and push <i>SAVE</i> button',
    {
      parse_mode : "HTML",
      "reply_markup": {
        "keyboard": [['SAVE'], ['Cancel']]
      }
    });
}

const getCommingSoon = (msg) => {
  bot.sendMessage(msg.chat.id, "Sorry man, its not working yet, coming soon");
  getHello(msg);
}

const saveIdeasOnBuffer = (msg) => {
  if (msg.text) {
    notes.push(msg.text);
  }
}


const addIdeaToFile = () => {
  const dbx = new Dropbox({ accessToken: dropboxToken});
  const newContent = notes.join(' ');
  const downloadFile = {path: ideaFile}
  dbx.filesDownload(downloadFile)
    .then(res => {
      const contents = `${utf8.decode(res.fileBinary)}\n${newContent}`;
      dbx.filesUpload({
        contents,
        path: '/test.txt',
        mode: {
          '.tag': 'overwrite',
        },
        autorename: false,
        mute: true,
      })
        .then(() => {})
        .catch(error => {
          console.log('error', error);
        })

    })
    .catch(error => {
      console.log('error', error);
    })
}

const saveIdea = (msg) => {
  addIdeaToFile();
  bot.sendMessage(msg.chat.id, "New Idea is saved, congrats!");
  getHello(msg);
}


bot.on('message', (msg) => {
  const msgChatId = msg.chat.id;
  if (msgChatId.toString() !== myChatId) {
    bot.sendMessage(msgChatId, 'Sorry, but you not <b>Vad Siam</b>',{parse_mode : "HTML"});
    return null;
  }

  const command = msg.text;
  switch (command) {
  case 'hi':
  case 'Hi':
  case 'HI':
  case 'Hello':
  case 'hello':
  case 'start':
  case 'привет':
  case 'Привет':
    getHello(msg);
    break;
  case 'Write new genius idea':
    writeIdea(msg);
    break;
  case 'Collect new genius image':
    getCommingSoon(msg);
    break;
  case 'SAVE':
    saveIdea(msg);
    break;
  default:
    saveIdeasOnBuffer(msg);
    break;
  }
  return null;
});
