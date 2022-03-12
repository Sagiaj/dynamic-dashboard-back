import * as fs from "fs";

const base_path = `/home/vbboard1/generator`;
const cartridge_path = `${base_path}/SYS_OP/cart`;
const live_data_path = `${base_path}/Sys_data/Solutions/Log_backup`;
const notification_path = `${base_path}`;
const experiments_path = `${base_path}/Sys_data/Solutions/Log_backup/Customer_Log`;
const ObjectTypes = ["particles", "yeast", "dust"];

const date = new Date();
const DateInfo = {
    date,
    date_file_str: `${(date.getDate()).toString().padStart(2, "0")}-${(date.getMonth()+1).toString().padStart(2,"0")}-${date.getFullYear()}`
};

// SYSTEM LOG DATA
let live_data_log_count = 1;
let bacteriaSum = 0;

const fileNameRefreshInterval = () => {
    setTimeout(() => {
        DateInfo.date = new Date();
        DateInfo.date_file_str = `${(DateInfo.date.getDate()).toString().padStart(2, "0")}-${(DateInfo.date.getMonth()+1).toString().padStart(2,"0")}-${DateInfo.date.getFullYear()}`;
        fileNameRefreshInterval();
    }, 500);
}
fileNameRefreshInterval();

function generateLiveDataLog() {
    const bacterias = Math.random() > 0.2 ? Math.round(Math.random() * 50) : -1;
    const dateStr = new Date().toJSON().slice(0, -5).replace("T", " ");
    const chancesMatrix = new Array(3).fill(0).map(n => Math.random() > 0.92 ? 1 : 0);
    chancesMatrix[Math.floor(Math.random() * chancesMatrix.length)] = 1;
    bacteriaSum += bacterias === -1 ? 0 : bacterias;
    let number_of_type_line = `${dateStr}: Number of bacteria detected:     ${bacterias}`;
    let detection_size_distribution_line = ``;
    let objectTypeIdx = 0;
    for (let objectType of ObjectTypes) {
        const arrayOfSumNumbers = new Array(5).fill(0).map(a => Math.round(Math.random() * 10));
        const totalNumber = arrayOfSumNumbers.reduce((sum, cur) => sum + cur, 0);
        number_of_type_line += `  	Number of ${objectType} detected:     ${chancesMatrix[objectTypeIdx] ? totalNumber : "-1"}`;
        detection_size_distribution_line += `Detections per type: ${chancesMatrix[objectTypeIdx] ? arrayOfSumNumbers.join(" ") : "-1"}     `;
        objectTypeIdx++;
    }
    let logLine = `${number_of_type_line}\n${detection_size_distribution_line.trimEnd()}`;
    live_data_log_count = live_data_log_count + 1;
    if (live_data_log_count >= 100) {
        logLine += `\n${dateStr}: Sum of bacteria in the last 100 images:     ${bacteriaSum}\n`;
        live_data_log_count = 1;
        bacteriaSum = 0;
    }

    return logLine;
}

function generateCartridgeLog() {
    const beginningStr = Math.random() > 0.5 ? "START" : "END";
    const utcDate = new Date(Date.now());
    const year = utcDate.getUTCFullYear();
    const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const date = utcDate.getUTCDate().toString().padStart(2, "0");
    const hours = utcDate.getUTCHours().toString().padStart(2, "0");
    const minutes = utcDate.getUTCMinutes().toString().padStart(2, "0");
    return `${beginningStr} ${date}-${month}-${year} ${hours}:${minutes} 123456`;
}

function generateNotificationLog() {
    const utcDate = new Date(Date.now());
    const year = utcDate.getUTCFullYear();
    const month = (utcDate.getUTCMonth() + 1).toString().padStart(2, "0");
    const date = utcDate.getUTCDate().toString().padStart(2, "0");
    const hours = utcDate.getUTCHours().toString().padStart(2, "0");
    const minutes = utcDate.getUTCMinutes().toString().padStart(2, "0");
    const seconds = utcDate.getUTCSeconds().toString().padStart(2, "0");
    const contaminationOrNorm = Math.random() > 0.4 ? "Back to Norm" : "Contamination Alert";
    return `${new Date().toJSON().slice(0, -5).replace("T", " ")}: ${contaminationOrNorm}`;
}

class FileManager {
    static _files: { [file: string]: number; } = {};

    static openFile(file_type: keyof typeof FileManager._files, file_path: string) {
        if (FileManager._files[file_type]) {
            return this._files[file_type];
        }
        
        const openedFile = openOrCreateFile(file_path);
        this._files[file_type] = openedFile;

        return openedFile;
    }

    static closeFile(file_type: keyof typeof FileManager._files) {
        if (!FileManager._files[file_type]) {
            return false;
        }

        const file = this._files[file_type];
        fs.closeSync(file);
        return true;
    }
}

function openOrCreateFile(file_path: string) {
    return fs.openSync(file_path, 'a');
}

async function writeToSystemLog() {
    setTimeout(() => {
        console.log("WRITING SYSTEM LOG")
        const file = FileManager.openFile("live_data", `${live_data_path}/Log_${DateInfo.date_file_str}.txt`);
        const curDate = Date.now().toString();
        const fileContent = `\n${generateLiveDataLog()}`;
        fs.appendFileSync(file, fileContent);
        writeToSystemLog();
    }, 10000);
}

async function writeToCartridge() {
    setTimeout(() => {
        console.log("WRITING CARTRIDGE")
        const file = FileManager.openFile("cartridge", `${cartridge_path}/CARTRIDGE_LOG.txt`);
        const curDate = Date.now().toString();
        const fileContent = `\n${generateCartridgeLog()}`;
        fs.appendFileSync(file, fileContent);
        writeToCartridge();
    }, 10000);
}

async function writeToNotification() {
    setTimeout(() => {
        console.log("WRITING NOTIFICATION")
        const file = FileManager.openFile("notification", `${notification_path}/Notification_log.txt`);
        const curDate = Date.now().toString();
        const fileContent = `\n${generateNotificationLog()}`;
        fs.appendFileSync(file, fileContent);
        writeToNotification();
    }, 10000);
}


writeToSystemLog();
writeToCartridge();
writeToNotification();
