# wg-auto

Automatically set up a wireguard server that is capable of generating new TCP/UDP ports if forbidden.

![](demo.png)

![](https://raw.githubusercontent.com/WeeJeWel/wg-easy/master/assets/screenshot.png)

## Quick Start

```
$ docker pull weejewel/wg-easy
$ docker run -d \
  --network host \
  -e WG_PASSWORD=🚨YOUR_ADMIN_PASSWORD \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wuhanstudio/wg-auto
```

The website is available now at **http://YOUR_HOST_IP:3000**

## For Development

```
$ docker pull weejewel/wg-easy
$ export WG_PASSWORD=YOUR_PASSWORD
$ npm install
$ node server.js
```

The website is available now at **http://localhost:3000**
