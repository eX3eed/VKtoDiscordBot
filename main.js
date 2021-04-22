const Discord = require('discord.js');
const client = new Discord.Client();
const {VKApi, ConsoleLogger, BotsLongPollUpdatesProvider} = require('node-vk-sdk');
const fs = require('fs');
const filename = 'vkdata.json'

let photosURLs = '';
let message = '';

function updateFile() {
    fs.writeFile(filename, " ", (err) => {
      if (err) throw err;
      console.log("Создал файл");
    })
}

// Вк обвязка + запись в файл (в случае если данные уже существуют в файле, нужно сделать перезапить этих файлов)
// По хорошему, стоит вынести токен и айди группы в отдельный файл

let api = new VKApi({
    token: 'ec30948aa449534b8c4aca78178c981badcf4b549d6e3d4bf90a5c597ea297f3cc56568bb8f89beb60f71',
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
  function checkImageFromData(objectData) {
    if(objectData == false){
      setTimeout(() => {
        updateFile();
      }, 3000);
        console.log("Картинки не было")
        console.log(message);
    }
  }

//В случае, если картинки есть, мы вытаскиваем данные из json объектов с high res качеством (которое дает вк)
  function getHighResImages(photosArray) {
    for (let i = 0; i < photosArray.length; i++) {
      let getURLArray = photosArray[i].photo.sizes;
      for (let k = 0; k < getURLArray.length; k++) {
        if (k == getURLArray.length - 1) {
          photosURLs += getURLArray[k].url + " ";
        }
      }
    }
  }

//Проверяем, есть ли данные, в случае если данных нет, мы очищаем файл
  if (data[0] == undefined){ 
    setTimeout(() => {
      updateFile();
    }, 3000);
      console.log("данных не было")
  }
  else
  {
    message = data[0].object.text;
    let temp = 'attachment' in data[0].object
    checkImageFromData(temp);
    let photosArray = data[0].object.attachments;
    if(photosArray == undefined){
      setTimeout(() => {
        updateFile();
      }, 3000);
      console.log(message)
    }
    else{
        getHighResImages(photosArray)
    }
  }
    
    console.log("записал данные, все ок")
    updateFile();

    console.log(photosURLs);
    console.log(message)

    message = undefined;
    photosURLs = undefined;
}, 26000);

//Сделать проверку, в случае если нет текста в посте, но есть картинки
//Проверить код на работоспособность
//Подключить дискорд уже наконец-то, заебался ебаться с правильным получением данных

//Дискорд обвязка
// client.on('ready', () => {
//     console.log('Logged in ass ${client.user.tag}!');
// })

// //client.channels.get('832692528095559753').send(formatingText);

// client.on("message", (msg) => {
//     if(msg.content === 'hello'){
//         const attachemntPhoto = new Discord.MessageAttachment(photosURLs.split(' '));
//         msg.channel.send(message,attachemntPhoto);
//     }
// });

// //По хорошему, стоит бы вынести токен дискорда в отдельный файл
// client.login('MzIxNjc4NDc1NTExNDYzOTM4.WTbQbQ._fuQ_ZlbddOeKU_6X1Er-bGDJM8')