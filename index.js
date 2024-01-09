const { deleteOldFiles } = require("./services/fs");
const { getTime } = require("./services/util");
const { cutVideos, joinVideos } = require("./services/video");
const { fetchYTList, downloadYTVideos } = require("./services/yt");

function run() {
  // deleteOldFiles().then(() => {
  console.log("Job started at", getTime());
  fetchYTList().then(() => {
    downloadYTVideos().then(() => {
      cutVideos().then(() => {
        joinVideos()
          .then(() => {
            console.log("JOB SUCCESS");
          })
          .catch("JOB FAILED")
          .finally(() => {
            console.log("Job ended at", getTime());
          });
      });
    });
  });
  // });
}
run();
