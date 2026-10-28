# DNS before any change (recorded 2026-10-28, read-only)

Nothing in DNS was changed by this job.

```
$ dig ufuk.ie A AAAA CNAME +short
[A] 185.43.232.251 
[AAAA] 
[CNAME] 
$ dig www.ufuk.ie +short
ufuk.ie.
185.43.232.251
$ dig ufuk.ie NS +short
ns3.webhostingireland.ie.
ns4.webhostingireland.eu.
ns1.webhostingireland.ie.
ns2.webhostingireland.ie.
$ dig ufuk.ie MX +short
0 mail.ufuk.ie.
$ dig mail.ufuk.ie +short
185.43.232.251
$ dig ufuk.ie TXT +short
"v=spf1 +a +mx +ip4:91.210.232.8 include:spf.webhostingireland.ie +ip4:185.43.232.251 ~all"

# demo subdomains (names from the CNAME files of the other repos under ~/Desktop/portUK/)
$ dig brennock.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.110.153 185.199.108.153 185.199.111.153 
$ dig reilly.ufuk.ie +short
karakusufuk.github.io. 185.199.108.153 185.199.111.153 185.199.109.153 185.199.110.153 
$ dig bawn.ufuk.ie +short
karakusufuk.github.io. 185.199.110.153 185.199.108.153 185.199.111.153 185.199.109.153 
$ dig garveylennon.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.111.153 185.199.108.153 185.199.110.153 
$ dig tierney.ufuk.ie +short
karakusufuk.github.io. 185.199.110.153 185.199.108.153 185.199.111.153 185.199.109.153 
$ dig midland.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.110.153 185.199.108.153 185.199.111.153 
$ dig fennel.ufuk.ie +short
karakusufuk.github.io. 185.199.110.153 185.199.108.153 185.199.111.153 185.199.109.153 
$ dig kenilworth.ufuk.ie +short
karakusufuk.github.io. 185.199.110.153 185.199.109.153 185.199.111.153 185.199.108.153 
$ dig monument.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.111.153 185.199.108.153 185.199.110.153 
$ dig lear.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.108.153 185.199.111.153 185.199.110.153 
$ dig ashgrove.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.108.153 185.199.111.153 185.199.110.153 
$ dig o.ufuk.ie +short
karakusufuk.github.io. 185.199.109.153 185.199.110.153 185.199.108.153 185.199.111.153 
```

## What answers today

- `https://ufuk.ie` -> 000 https://ufuk.ie/
- `http://ufuk.ie` -> 200 http://ufuk.ie/
- `https://www.ufuk.ie` -> 000 https://www.ufuk.ie/

## Reading

- The apex and www point to 185.43.232.251, a shared host at webhostingireland (name servers ns1-ns4.webhostingireland.ie/.eu). The same host handles the mail of ufuk.ie (MX `mail.ufuk.ie`, SPF text above).
- The demo subdomains are separate GitHub Pages sites (CNAME to karakusufuk.github.io / A records to the 185.199.x.153 addresses) and must stay as they are.
