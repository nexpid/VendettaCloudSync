import { redisClient } from '../util/redis';
import { DBSave } from './db/latest';

export function updateToNewest(user: string, save?: DBSave.AllSaves | null): DBSave.Save {
	save ??= {
		user,
		sync: {
			plugins: [],
			themes: [],
		},
		version: 1,
	};

	// implement updating to the newest database version lol
	// (once new versions exist)

	return save as DBSave.Save;
}

export async function getSave(user: string): Promise<DBSave.Save> {
	const save = await redisClient.get<DBSave.AllSaves>(`data:${user}`);

	return updateToNewest(user, save);
}

export async function setSave(user: string, save: DBSave.Save) {
	return await redisClient.set(`data:${user}`, JSON.stringify(save));
}

export async function deleteSave(user: string) {
	return await redisClient.del(user);
}
