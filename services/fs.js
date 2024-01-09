require("dotenv").config();
const fs = require("fs");

const path = process.env.FILE_PATH;
const DWN = process.env.DOWNLOAD_PATH;
const ED = process.env.EDIT_PATH;

module.exports.addYTIdToList = (list) =>
  new Promise((resolve) => {
    fs.readFile(path, "utf8", function (err, data) {
      if (err) {
        console.log("Error reading the file:", err);
        reject();
      }
      fs.writeFile(
        path,
        data.toString() + list,
        { overwrite: true },
        function (e) {
          if (e) console.error("Add list to file failed:", e);
          resolve();
        }
      );
    });
  });

module.exports.readList = () =>
  new Promise((resolve, reject) => {
    console.log("Reading list file");
    var idList = [];
    fs.readFile(path, "utf8", function (err, data) {
      if (err) {
        console.log("Error reading the file:", err);
        reject();
      }
      idList = data.toString().split("\n");
      idList.pop();
      console.log("Found total", idList.length, "IDs in the list");
      resolve(idList);
    });
  });

module.exports.deleteOldFiles = () =>
  new Promise((resolve) => {
    console.info("Deleting old files");
    fs.unlink(DWN, (err) => {
      if (err) {
        console.log("Error deleting in", DWN, ":", err);
      }
      fs.unlink(ED, (err) => {
        if (err) {
          console.log("Error deleting in", ED, ":", err);
        }
        resolve();
      });
    });
  });
