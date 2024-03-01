import dotenv from 'dotenv';
import { model } from 'mongoose'
import { schedule } from 'node-cron'
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { InMemorySigner, importKey } from '@taquito/signer';
import { bytes2Char, char2Bytes } from '@taquito/utils';
import { Entrypoint } from '../models/Entrypoint';
import { Config } from '../config/constants';
const EntrypointModel = model<Entrypoint>('Entrypoint')

dotenv.config({
	path: '.env',
});

class ContractController {
	private tezos: TezosToolkit;
	private tasks: any[] = [];

	constructor() {
		this.tezos = new TezosToolkit(Config.RPC);
		this.tezos.setProvider({
			signer: new InMemorySigner(process.env.PRIVATE_KEY as string),
		});

		this.getEntrypoints().then((entrypoints: Entrypoint[] | null) => {
			entrypoints && this.createSchedules(entrypoints);
		});
	}

	createTask(entrypoint: Entrypoint) {
		//return schedule('*/30 * * * * *', () => {
		return schedule('* * * * *', () => {
			console.log('running a task every minute', entrypoint.method, new Date());
			this.callEntrypoint(entrypoint);
		});
	}

	createSchedules(entrypoints: Entrypoint[]) {
		this.tasks.forEach(it => it.task.stop());
		this.tasks = [];

		entrypoints
			.filter(it => it.running && !!it.method)
			.map((entrypoint: Entrypoint) => {
				const task = this.createTask(entrypoint)
				this.tasks.push({entrypoint, task})
				console.log('add-task', entrypoint.method)
			})
	}

	async callEntrypoint(entrypoint: Entrypoint) {
		console.log("call_entrypoint", entrypoint);
		try {
			const contract = await this.tezos.contract.at(entrypoint.contract)

			const methods = contract.parameterSchema.ExtractSignatures();
			const method = methods.find(m => m[0] === entrypoint.method);
			console.log('method', method)
			if (!method) {
				return {
					success: false, 
					message: 'Invalid method'
				};
			}

			const transaction = await contract.methods[entrypoint.method](entrypoint.amount).send();
			const confirm = await transaction.confirmation();
			return null;

		} catch (e) {
			console.error('call_entrypoint', e);
			return {
				success: false,
				error: e
			};
		}
	}

	async getEntrypoints() {
		try {
			return await EntrypointModel.find()			
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async deleteEntrypoint(id: string) {
		try {
			console.log('id', id)
			const result = await EntrypointModel.deleteOne({ _id: id })

			const entrypoints = await this.getEntrypoints();
			entrypoints && this.createSchedules(entrypoints);
			
			return result;
						
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	async saveEntrypoints(entrypoints: Entrypoint[]) {
		console.log('saveEntrypoints', entrypoints);
		try {
			const updated = entrypoints.filter(e => !!e.id);
			for (let item of updated) {
				await EntrypointModel.updateOne({ _id: item.id }, item)
			}

			const created = entrypoints.filter(e => !e.id);
			if (created.length > 0) {
				await EntrypointModel.insertMany(created);
			}

			this.createSchedules(entrypoints);
			return await this.getEntrypoints();

		} catch (err) {
			console.error(err);
			return null;
		}
	}
}

export = new ContractController();
