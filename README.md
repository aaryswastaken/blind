*bl1nd*
---

Blind (or bl1nd) is a proof-of-concept, consisting of an injector (latest
version: `v2`) and a payload.

The injector is a headless-capable VMWare horizon arbitrary code executor,
requiring a user with its password.


***This proof of concept has been developed for educational purpose only. Use
it with your own credentials or on infrastructure you own***

## How to run

Edit `.env` to have the following content:

```
UNAME=<vmware username>
PASSWORD=<vmware password>
URL=<url of the webclient>
```

Then run `injectorv2.js`.

### Customisation

To customise the script, edit the `payload` constant according to your usage.
You can also alter the selector that is used to get which session to open, right
after `[*] Launching instance`


*Have fun*
