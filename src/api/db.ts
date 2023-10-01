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

interface D1DBSave {
	user: string;
	version: DBSave.AllSaves['version'];
	sync: string;
}

export async function getSave(env: Env, user: string): Promise<DBSave.Save> {
	const cmd = (await env.DB.prepare(`select * from data where user=?1`).bind(user).first()) as D1DBSave;

	return updateToNewest(
		user,
		cmd && {
			user: cmd.user,
			version: cmd.version,
			sync: JSON.parse(cmd.sync),
		}
	);
}

export async function setSave(env: Env, user: string, save: DBSave.Save): Promise<boolean> {
	if (!save.sync.plugins.length && !save.sync.themes.length) return await deleteSave(env, user);
	return (
		await env.DB.prepare(`insert or replace into data (user, version, sync) values (?1, ?2, ?3)`)
			.bind(user, save.version, JSON.stringify(save.sync))
			.run()
	).success;
}

export async function deleteSave(env: Env, user: string): Promise<boolean> {
	return (await env.DB.prepare(`delete from data where user=?1`).bind(user).run()).success;
}
