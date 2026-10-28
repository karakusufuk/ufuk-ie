# DNS after the change (2026-10-28, ~14:55 local)

Done by Claude in the Hosting Ireland client area (DNS Manager of the active `ufuk.ie` domain), on the owner's explicit instruction and while the owner was logged in. Zone before: 20 records (see dns-before.md); after: 27 records.

Changes (nothing else was touched):
- added **A** `ufuk.ie` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- added **AAAA** `ufuk.ie` → 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 (typed in expanded form, e.g. `2606:50c0:8000:0:0:0:0:153`, because the panel's validator rejects the `::` form; the panel stores and serves them as `::153`)
- changed **CNAME** `www.ufuk.ie` from `ufuk.ie` to `karakusufuk.github.io`
- deleted **A** `ufuk.ie` → 185.43.232.251 (the old host's holding page)

Left exactly as they were: MX `ufuk.ie` 0 mail.ufuk.ie, A `mail.ufuk.ie` 185.43.232.251, TXT (SPF), A `localhost`, CNAME `ftp` (→ ufuk.ie), and all demo subdomain CNAMEs (fennel, lear, midland, monument, tierney, ashgrove, kenilworth, garveylennon, guess, brennock, reilly, bawn, o → karakusufuk.github.io). TTL of the new records: 14400.

Verified: both Hosting Ireland name servers and 8.8.8.8 answer the new records. GitHub Pages: custom domain `ufuk.ie` set, certificate (Let's Encrypt, ufuk.ie + www.ufuk.ie, valid until 2027-01-26) approved, "Enforce HTTPS" on. https://ufuk.ie serves the site (200), http → https (301), www → https://ufuk.ie (301), 404 page styled. Note: the machine that ran the tests still held the old IP in its local DNS cache (TTL was 4 h), so the live checks pinned the address; visitors get the new address as their resolvers' caches expire (up to ~4 hours for the old 14400 s TTL).
