const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const {VKApi, BotsLongPollUpdatesProvider} = require("node-vk-sdk");
const filename = "vkdata.json";
const getDataToConfig = fs.readFileSync("config.json");
const config = JSON.parse(getDataToConfig);

//parse config data from file
const DiscordToken = config.tokens.DiscordToken;
const VKToken = config.tokens.VKToken;
const DiscordChannel = config.DiscordChannel;

let photosURLs = [];
let message = "";
let check = null;

// Вк обвязка + запись в файл (в случае если данные уже существуют в файле, нужно сделать перезапить этих файлов)
let api = new VKApi({
  token: VKToken,
  timeout: 30000,
});

let updatesProvider = new BotsLongPollUpdatesProvider(api, 204122253);

updatesProvider.getUpdates((updates) => {
  updateFile();
  fs.appendFile(filename, JSON.stringify(updates), (err) => {
    if (err) throw err;
    console.log("Data added");
  });
});

//Получение необходимых данных из файла
setInterval(() => {
  let RAWdata = fs.readFileSync(filename);
  let data = JSON.parse(RAWdata);

  //Проверяем, указаны ли фото в посте, если нет то записываем только текст
  function checkImageFromData() {
    setTimeout(() => {
      updateFile();
    }, 10000);
    console.log("No picture");
    console.log(message);
  }

  //В случае, если картинки есть, мы вытаскиваем данные из json объектов с high res качеством (которое дает вк)
  function getHighResImages(photosArray) {
    for (let i = 0; i < photosArray.length; i++) {
      let getURLArray = photosArray[i].photo.sizes;
      for (let k = 0; k < getURLArray.length; k++) {
        if (k === getURLArray.length - 1) {
          photosURLs.push(getURLArray[k].url);
        }
      }
    }
  }

  //Проверяем, есть ли данные, в случае если данных нет, мы очищаем файл
  if (data[0] === undefined) {
    updateFile();
    console.log("No data");
  } else {
    message = data[0].object.text;

    let temp = "attachment" in data[0].object;
    if (temp === false) {
      checkImageFromData();
    }

    let photosArray = data[0].object.attachments;
    if (photosArray === undefined) {
      setTimeout(() => {
        updateFile();
      }, 10000);
    } else {
      getHighResImages(photosArray);
      console.log(photosURLs);
    }
  }

  console.log("Write data");
}, 28000);

function updateFile() {
  fs.truncateSync(filename, 0, (err) => {
    if (err) throw err;
  });
  console.log("Update file");
}

//Дискорд обвязка + отправка сообщения
client.login(DiscordToken);
client.on("ready", () => {
  console.log("Discord Bot activated");
  let temp = client.channels.cache.find(
    (channel) => channel.id === DiscordChannel
  );

  setInterval(() => {
    //Если есть только сообщение
    if (message) {
      check = 1;
    }
    //Есть и сообщение и фото
    if (message && photosURLs.length) {
      check = 2;
    }
    //Нет сообщений но есть фото
    if (!message && photosURLs.length) {
      check = 3;
    }
    switch (check) {
      case 1: {
        temp.send(message);
        message = undefined;
        break;
      }
      case 2: {
        temp.send(message);
        for (let i = 0; i < photosURLs.length; i++) {
          const attachemntPhoto = new Discord.MessageAttachment(photosURLs[i]);
          temp.send(attachemntPhoto);
        }
        message = undefined;
        photosURLs = [];
        break;
      }
      case 3: {
        for (let i = 0; i < photosURLs.length; i++) {
          const attachemntPhoto = new Discord.MessageAttachment(photosURLs[i]);
          temp.send(attachemntPhoto);
        }
        photosURLs = [];
        break;
      }
      default: {
        console.log("no data, message not sent");
      }
    }
  }, 40000);
});
