require("dotenv").config();
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH;

module.exports.getTime = () => {
  return new Date(
    new Date(
      new Date().getTime() +
        (new Date().getTimezoneOffset() == 0
          ? 0
          : -1 * new Date().getTimezoneOffset()) *
          60000
    ).toLocaleString("en-US", { timeZone: "Asia/Calcutta" })
  ).toISOString();
};

module.exports.readFilesInDir = (path) =>
  new Promise((resolve) => {
    require("fs").readdir(path, (err, files) => {
      const result = shuffle(files);
      resolve(result);
    });
  });

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
