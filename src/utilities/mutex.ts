import * as fs from "fs";
import PL from "proper-lockfile";

export class Mutex {
	private static DirPrefix = `queue_tmp`;
	private _base_path = process.cwd();
	private _lock_name: string = "";
	private _acquired: boolean = false;
	private _options: PL.LockOptions = { stale: 10000, retries: 100 };

	private get lockName() {
		return `${Mutex.DirPrefix}/${this._lock_name}`;
	}

	constructor(lock_name: string, options?: PL.LockOptions) {
		if (!lock_name) {
			throw new Error("No lock_name provided. Invalid Mutex");
		}
		this._lock_name = lock_name;
		this._options = options || this._options;
	}

	private async awaitLock(timeout_ms: number) {
		try {
			return new Promise(async (resolve, reject) => {
				setTimeout(() => {
					if (!this._acquired) { return reject("Timed out waiting for file lock"); }
				}, timeout_ms);
				await this.lock( { stale: timeout_ms } );
				return resolve(true);
			});
		} catch (err) {
			throw err;
		}
	}

	async acquireLock(options?: PL.LockOptions) {
		const opts = options || this._options;
		try {
			const isLocked = await this.isLocked(opts);
			if (isLocked) {
				await this.awaitLock(opts.stale ? opts.stale : 10000)
				return true;
			}
			await this.lock(opts);
			this._acquired = true;
			return true;
		} catch (err) {
			throw err;
		}
	}

	async releaseLock(options?: PL.UnlockOptions) {
		const opts = options || this._options;
		try {
			await this.unlock(opts);
			this._acquired = false;
			return true;
		} catch (err) {
			throw err;
		}
	}

	private async lock(options?: PL.LockOptions) {
		const opts = options || this._options;
		try {
			const file_path = `${this._base_path}/${this.lockName}`;
			if (!fs.existsSync(`${this._base_path}/${Mutex.DirPrefix}`)) {
				await fs.promises.mkdir(`${this._base_path}/${Mutex.DirPrefix}`);
			}
			if (!fs.existsSync(file_path)) {
				await fs.promises.writeFile(file_path, Buffer.from(""));
			}
			await PL.lock(this.lockName, { ...opts, retries: 100 });
			this._acquired = true;
		} catch (err) {
			this._acquired = false;
			throw err;
		}
	}
	
	private async unlock(options?: PL.UnlockOptions) {
		const opts = options || this._options;
		try {
			const file_path = `${this._base_path}/${this.lockName}`;
			if (!fs.existsSync(file_path)) {
				this._acquired = false;
				return true;
			}
			await PL.unlock(this.lockName, opts);
			this._acquired = false;
			return true;
		} catch (err) {
			throw err;
		}
	}

	private async isLocked(options?: PL.CheckOptions) {
		const opts = options || this._options;
		const file_path = `${this._base_path}/${this.lockName}`;
		try {
			if (!fs.existsSync(file_path)) {
				return false;
			}
			return await PL.check(this.lockName, opts);
		} catch (err) {
			throw err;
		}
	}
}
