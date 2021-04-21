const Discord = require('discord.js');
const client = new Discord.Client();
const {VKApi, ConsoleLogger, BotsLongPollUpdatesProvider} = require('node-vk-sdk');
const fs = require('fs');
const filename = 'vkdata.json'

function createFile() {
    fs.writeFile(filename, " ", (err) => {
      if (err) throw err;
      console.log("Создал файл");
    })
}

//Вк обвязка + запись в файл (в случае если данные уже существуют в файле, нужно сделать перезапить этих файлов)
// По хорошему, стоит вынести токен и айди группы в отдельный файл

let api = new VKApi({
    token: 'ec30948aa449534b8c4aca78178c981badcf4b549d6e3d4bf90a5c597ea297f3cc56568bb8f89beb60f71',
    logger: new ConsoleLogger(),
    timeout: 27000
})

let updatesProvider = new BotsLongPollUpdatesProvider(api, 204122253)

updatesProvider.getUpdates((updates) => {
  createFile();
  fs.appendFile(filename, JSON.stringify(updates), (err) => {
    if (err) throw err;
    console.log("Данные были добавлены");
  });
});

//Получение необходимых данных из файла (при учете, что файл vkdata.json существует)
setInterval(() => {
  let raWdata = fs.readFileSync(filename);
  let data = JSON.parse(raWdata);
  if (data[0] == undefined) {
    setTimeout(() => {
      createFile();
    }, 1500);
      console.log("данных не было")
  } else {
    let message = data[0].object.text;
    let photosArray = data[0].object.attachments;
    let photosURLs = "";

    for (let i = 0; i < photosArray.length; i++) {
      let getURLArray = photosArray[i].photo.sizes;
      for (let k = 0; k < getURLArray.length; k++) {
        if (k == getURLArray.length - 1) {
          photosURLs += getURLArray[k].url + " ";
        }
      }
    }
    console.log("записать данные, все ок")
    createFile();

    console.log(photosURLs);
    console.log(message)
  }
}, 26000);


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