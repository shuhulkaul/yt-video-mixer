var ffmpeg = require("fluent-ffmpeg");
const concat = require("ffmpeg-concat");
const { readFilesInDir } = require("./util");
const { fetchVideoInfo } = require("./yt");
const glob = require("glob");

const CHUNK_DURATION = process.env.CHUNK_DURATION_IN_SEC;
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH;
const EDIT_PATH = process.env.EDIT_PATH;
const MIX_PATH = process.env.MIX_PATH;
const MUSIC_PATH = process.env.MUSIC_PATH;
const DURATION = process.env.VIDEO_DURATION_IN_SEC;

const clip = (fileName, startTime) =>
  new Promise((resolve, reject) => {
    console.info("Cutting started for", fileName);
    ffmpeg().concat;
    ffmpeg()
      .input(DOWNLOAD_PATH + fileName)
      .setStartTime(startTime)
      .setDuration(CHUNK_DURATION)
      .output(EDIT_PATH + fileName)
      .setSize("640x480", false, false)
      .withAspectRatio("4:3")
      .withAudioBitrate(128)
      .withVideoBitrate(320)
      .videoBitrate(400)
      .on("end", function (err) {
        if (!err) {
          console.info("Cutting done for", fileName);
        }
        resolve();
      })
      .on("error", function (err) {
        console.error("Error cutting ", fileName, ":", err);
        reject();
      })
      .run();
  });

module.exports.cutVideos = () =>
  new Promise((rs) => {
    readFilesInDir(DOWNLOAD_PATH).then((files) => {
      console.info("Cutting started");
      var promises = [];
      const endIndex = files.length < DURATION ? files.length : DURATION;
      for (let i = 0; i < endIndex; i++) {
        promises.push(
          new Promise((resolve, reject) => {
            fetchVideoInfo(files[i].split(".")[0])
              .then((startTime) => {
                clip(files[i], startTime)
                  .then(() => {
                    resolve();
                  })
                  .catch(() => reject());
              })
              .catch(() => {
                reject();
              });
          })
        );
      }
      Promise.all(promises).then(() => {
        console.info("Cutting finished");
        rs();
      });
    });
  });

module.exports.joinVideos = () =>
  new Promise((resolve, reject) => {
    const videos = glob.sync(EDIT_PATH + "*.mp4");
    const output = MIX_PATH + "final.mp4";
    console.info("Joining videos started");
    concat({
      output,
      videos,
      audio: MUSIC_PATH,
    })
      .then(() => {
        console.info("Joining videos ended");
        resolve();
      })
      .catch((e) => {
        console.error("Joining videos failed", e);
        reject();
      });
  });
