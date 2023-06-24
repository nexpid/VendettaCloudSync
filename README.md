# VendettaCloudSync

Backend for my [CloudSync](https://github.com/Gabe616/VendettaPlugins/tree/main/plugins/cloud-sync) Vendetta plugin

# How To Selfhost

very simply!!!!  
first, install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) and login using `wrangler login`  
then, cd into `vd-cloudsync` and run `wrangler deploy` (or `wrangler dev --remote` when testing)

now that your worker actually exists, create a new redis database on [upstash.com](https://console.upstash.com/) and copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
also create a discord client and copy it's secret  
rename the `.dev.vars.TEMPLATE` file to `.dev.vars` and replace the secrets with the secrets you copied  
and also set them in the worker itself using this:

- `echo FGHKDFJHKFDGH | wrangler secret put REDIS_URL`
- `echo BVNCHFZRETZRT | wrangler secret put REDIS_TOKEN`
- `echo VSDREWTRETERE | wrangler secret put CLIENT_SECRET`
  ... aaaaand you're done!!!
