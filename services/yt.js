const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();
const ytdl = require("ytdl-core");
const async = require("async");
const { readList, addYTIdToList } = require("./fs");

const API_KEY = process.env.API_KEY;
const AUTH_KEY = process.env.AUTH_KEY;
const DURATION = process.env.VIDEO_DURATION_IN_SEC;
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH;

module.exports.fetchVideoInfo = (id) =>
  new Promise((resolve, reject) => {
    console.info("Fetching info for", id);
    ytdl
      .getBasicInfo(`https://www.youtube.com/watch?v=${id}`)
      .then((det) => {
        var startTime =
          Math.random() *
          (Math.floor(det.formats[0].approxDurationMs / 1000) - 1);
        resolve(startTime);
      })
      .catch((e) => {
        console.info("Fetching info for", id, "failed:", e);
        reject(e);
      });
  });

module.exports.fetchYTList = () =>
  new Promise((resolve) => {
    console.info("Calling YouTube Data API v3");
    console.info("API KEY:", API_KEY);
    console.info("AUTH KEY:", AUTH_KEY);
    fetch(
      `https://youtube.googleapis.com/youtube/v3/search?q=medieval|Renaissance|ancient|classical|history|sad&order=relevance&part=id&maxResults=${DURATION}&regionCode=JP&videoDimension=2d&safeSearch=none&type=video&videoDuration=short&key=${API_KEY}`,
      {
        method: "GET",
        headers: { Accept: "application/json", Authorization: AUTH_KEY },
      }
    )
      .catch((e) => {
        console.error("Fetch Error:", e);
        resolve();
      })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          console.error("API Error:", json.error.message, "\n");
          console.error(json.error);
          resolve();
        } else {
          let list = "";
          console.log(json.items.length, "YT video IDs fetched");
          json.items.forEach((el) => {
            list += el.id.videoId + "\n";
          });
          if (list.length > 0) {
            addYTIdToList(list).finally(() => resolve());
          } else {
            resolve();
          }
        }
      });
  });

module.exports.downloadYTVideos = () =>
  new Promise((rs) => {
    console.info("Starting Download");
    readList().then((list) => {
      // var promises = [];
      const endIndex = list.length < DURATION ? list.length : DURATION;
      async.eachOfSeries(
        list,
        function (l, i, outerCB) {
          if (i >= endIndex) {
            outerCB("exceeded");
          } else {
            const url = `http://www.youtube.com/watch?v=${l}`;
            console.info("Downloading", l);
            try {
              ytdl(url).pipe(
                fs
                  .createWriteStream(DOWNLOAD_PATH + l + ".mp4")
                  .on("finish", () => {
                    console.log("Saved", l);
                    outerCB(null);
                  })
              );
            } catch (e) {
              console.error("Error while download the video", l, ":", e);
              outerCB(null);
            }
          }
        },
        () => {
          console.info("Download finished");
          rs();
        }
      );
      // Promise.all(promises).then(() => {
      //   console.info("Download finished");
      //   rs();
      // });
    });
  });
