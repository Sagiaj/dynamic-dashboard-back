import { lstatSync, readFileSync, readdirSync, Stats, ReadStream, createReadStream, createWriteStream, watchFile, unwatchFile, promises, constants } from "fs";
import * as path from "path";
import * as readline from "readline";
import { PassThrough } from "stream";

type FileStats = { stats: Stats, filename: string };

export default class FileReader {
    static getFileStats(directory_path: string, filename: string) {
        return lstatSync(path.resolve(directory_path, filename));
    }

    static listMatchingFiles(directory_path: string, filename_regex: RegExp): FileStats[] {
        let matching_files: FileStats[] = [];
        let filenames: string[];

        filenames = readdirSync(directory_path);

        if (!filenames || filenames.length < 1) {
            throw `No files found in directory: '${directory_path}'`;
        }

        for (let i = 0; i < filenames.length; i++) {
            const file_stats = FileReader.getFileStats(directory_path, filenames[i]);
            const is_file_matched = file_stats.isFile() && filenames[i].match(filename_regex) !== null;
            if (is_file_matched) {
                matching_files.push({
                    stats: file_stats,
                    filename: filenames[i]
                })
            }
        }

        return matching_files;
    }

    static getLatestFile(directory_path: string, filename_regex: RegExp): FileStats {
        let file_buffer: Buffer;
        let latest_file;
        let matching_files = FileReader.listMatchingFiles(directory_path, filename_regex);

        latest_file = matching_files.sort((f1, f2) => f2.stats.mtimeMs - f1.stats.mtimeMs).shift();
        if (!latest_file) {
            throw `Could not find a file matching the pattern: '${filename_regex}'`;
        }

        return latest_file;
    }

    static readFile(directory_path: string, filename_regex: RegExp): Buffer {
        let latest_file = this.getLatestFile(directory_path, filename_regex);
        return readFileSync(`${directory_path}/${latest_file.filename}`);
    }

    static createLineReaderStream(read_stream: ReadStream): PassThrough {
        const output = new PassThrough({ objectMode: true, readableHighWaterMark: 4, writableHighWaterMark: 16 });
        const rl = readline.createInterface({ input: read_stream });

        output.on("resume", () => { rl.resume(); });
        rl.on("line", line => { output.write(line); });
        rl.on("pause", () => { output.pause(); });
        rl.on("close", () => { output.end(); });
        return output;
    }

    static async createFileLineIterator(directory_path: string, filename_regex: RegExp, chunk_size: number): Promise<PassThrough> {
        const readStream = await this.getFileStream(directory_path, filename_regex, chunk_size);
        const lineIterator = await this.createLineReaderStream(readStream);

        return lineIterator;
    }

    static async getFileStream(directory_path: string, filename_regex: RegExp, chunk_size?: number): Promise<ReadStream> {
        const latest_file = this.getLatestFile(directory_path, filename_regex);
        const file_path = `${directory_path}/${latest_file.filename}`;
        const readStream = createReadStream(file_path, {
            highWaterMark: chunk_size || undefined
        });

        return readStream;
    }

    static async copyFile(from_dir: string, from_file: RegExp, to_dir: string) {
        const copyName = `Log_02-08-2021 - Copy.txt`;
        const readStream = await this.getFileStream(from_dir, from_file);
        const writeStream = await createWriteStream(`${to_dir}/${copyName}`);
        
        console.time(`write file pm_id ${process.env.pm_id}`)
        await lockFile(`${to_dir}/${copyName}`);
        writeStream.on("close", () => {
            console.timeEnd(`write file pm_id ${process.env.pm_id}`);
            unlockFile(`${to_dir}/${copyName}`);
        });
        return await readStream.pipe(writeStream);
    }
}


export const lockFile = async (path: string): Promise<promises.FileHandle> => {
    const lockPath = `${path}.lock`
    // return promises.open(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR).catch(() => lockFile(path))
    return promises.open(lockPath, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR);
}

export const unlockFile = (path: string): Promise<void> => {
    const lockPath = `${path}.lock`
    return promises.unlink(lockPath).catch(() => unlockFile(path))
}

export const awaitLockLift = async (file_path: string, timeout_ms: number = 5000): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        let lock_lifted = false;
        try {
            const r = await lockFile(file_path);
            lock_lifted = true;
            console.log("Successfully locked file");
            return resolve(true);
        } catch (error) {
            console.log("Cloud not lock file. Watching for changes...", error);
            watchFile(`${file_path}.lock`, (cur, prev) => {
                console.log("Watched file change. locking...");
                if (cur.mode) {
                    lock_lifted = true;
                    return lockFile(file_path).then(r => resolve(true));
                } else {
                    console.log("Bad mode. returning false");
                    return resolve(false);
                }
            });
            
            setTimeout(() => {
                if (!lock_lifted) {
                    console.log("Time out. lock not lifted");
                    unwatchFile(`${file_path}.lock`, (cur, prev) => {
                    });
                    return resolve(false);
                }
            }, timeout_ms);
        }
    })
}
