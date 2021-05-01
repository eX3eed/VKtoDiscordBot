const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const {VKApi, ConsoleLogger, BotsLongPollUpdatesProvider} = require('node-vk-sdk');
const filename = 'vkdata.json'
//const DiscordToken = 'MzIxNjc4NDc1NTExNDYzOTM4.WTbQbQ.IjDysJvuAqq64g-SFC6wRktb0g4'

let config = fs.readFileSync('config.json')
let configData = JSON.parse(config)

let DiscordToken = configData.tokens.DiscordToken;
let VKToken = configData.tokens.VKToken;
let DiscordChannel = configData.DiscordChannel;

let photosURLs = [];
let message = '';
let check = null;

// Вк обвязка + запись в файл (в случае если данные уже существуют в файле, нужно сделать перезапить этих файлов)
let api = new VKApi({
    token: VKToken,
    logger: new ConsoleLogger(),
    timeout: 27000
})

let updatesProvider = new BotsLongPollUpdatesProvider(api, 204122253)

updatesProvider.getUpdates((updates) => {
  updateFile();
  fs.appendFile(filename, JSON.stringify(updates), (err) => {
    if (err) throw err;
    console.log("Данные были добавлены");
  });
});

//Получение необходимых данных из файла
setInterval(() => {

  let raWdata = fs.readFileSync(filename);
  let data = JSON.parse(raWdata);

//Проверяем, указаны ли фото в посте, если нет то записываем только текст
  function checkImageFromData() {
      setTimeout(() => {
        updateFile();
      }, 10000);
        console.log("Картинки не было")
        console.log(message);
  }

//В случае, если картинки есть, мы вытаскиваем данные из json объектов с high res качеством (которое дает вк)
  function getHighResImages(photosArray) {
    for (let i = 0; i < photosArray.length; i++) {
      let getURLArray = photosArray[i].photo.sizes;
      for (let k = 0; k < getURLArray.length; k++) {
        if (k === getURLArray.length - 1) {
          photosURLs.push(getURLArray[k].url)
        }
      }
    }
  }

//Проверяем, есть ли данные, в случае если данных нет, мы очищаем файл
  if (data[0] === undefined){
      updateFile();
      console.log("данных не было")
  }
  else
  {
    message = data[0].object.text;

    let temp = 'attachment' in data[0].object
    if(temp === false){
      checkImageFromData();
    }

    let photosArray = data[0].object.attachments;
    if(photosArray === undefined){
      setTimeout(() => {
        updateFile();
      }, 10000);
    }
    else{
        getHighResImages(photosArray)
        console.log(photosURLs)
    }
  }

    console.log("записал данные, все ок")

}, 28000);

function updateFile() {
    fs.writeFileSync(filename, " ", (err) => {
        if (err) throw err;
    })
    console.log("Почистил файл");
}

//Дискорд обвязка + отправка сообщения
client.login(DiscordToken);
client.on('ready', () => {
    console.log('Discord Bot activated');
    let temp = client.channels.cache.find(channel => channel.id === DiscordChannel)

    setInterval( () => {

        //Если есть только сообщение
        if(message){
            check = 1;
        }
        //Есть и сообщение и фото
        if(message && photosURLs.length){
            check = 2;
        }
        //Нет сообщений но есть фото
        if(!message && photosURLs.length){
            check = 3
        }
            switch (check) {
                case 1: {
                    temp.send(message)
                    message = undefined;
                    break;
                }
                case 2: {
                    temp.send(message);
                    for (let i = 0; i < photosURLs.length; i++) {
                        const attachemntPhoto = new Discord.MessageAttachment(photosURLs[i]);
                        temp.send(attachemntPhoto)
                    }
                    message = undefined;
                    photosURLs = [];
                    break;
                }
                case 3: {
                    for (let i = 0; i < photosURLs.length; i++) {
                        const attachemntPhoto = new Discord.MessageAttachment(photosURLs[i]);
                        temp.send(attachemntPhoto)
                    }
                    photosURLs = [];
                    break;
                }
                default: {
                    console.log('Небыло данных, сообщение не отправил')
                }

            }
    }, 40000)
})

//По хорошему, стоит бы вынести токен дискорда в отдельный файл