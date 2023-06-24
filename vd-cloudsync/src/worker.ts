import router from './router';
import { redisClient, setRedisClient } from './util/redis';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (!redisClient) setRedisClient(env.REDIS_URL, env.REDIS_TOKEN);
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api')) return router.handle(request, env, ctx);

		return Response.redirect('https://github.com/Gabe616/vendettaplugins/tree/main/plugins/cloud-sync');
	},
};
