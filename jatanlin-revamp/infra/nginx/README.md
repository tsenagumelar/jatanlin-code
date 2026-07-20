# Local DNS Reverse Proxy

This proxy simulates production-like hostnames for local site and data-center services.

## Hostnames

Add the entries from `infra/nginx/hosts.local` to `/etc/hosts`.

```sh
make dns-hosts-print
```

Expected local URLs:

```text
http://site.jatanlin.test
http://api.site.jatanlin.test
http://hasura.site.jatanlin.test
http://minio.site.jatanlin.test
http://console.minio.site.jatanlin.test

http://dc.jatanlin.test
http://api.dc.jatanlin.test
http://hasura.dc.jatanlin.test
http://minio.dc.jatanlin.test
http://console.minio.dc.jatanlin.test
```

## Run

Start the normal local services first, then start the proxy:

```sh
make infra-up
make proxy-up
make dev
```

Run data center infra and local apps separately:

```sh
cd data-center
make infra-up-local
make dev
```

## Notes

The proxy listens on port `80` by default. If port `80` is already used, run it with another published port:

```sh
EDGE_HTTP_PORT=8088 make proxy-up
```

Using a non-80 port requires opening URLs with that port, for example `http://site.jatanlin.test:8088`.
