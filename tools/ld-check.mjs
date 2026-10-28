// Validates the JSON-LD of the given HTML files against the schema.org vocabulary (types and property names).
// Usage: node ld-check.mjs <schemaorg-current-https.jsonld> <page.html>...
//   vocabulary: https://schema.org/version/latest/schemaorg-current-https.jsonld
import fs from 'node:fs';
const vocab = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))['@graph'];
const byId = new Map(vocab.map((n) => [n['@id'], n]));
const arr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const supers = (id, seen = new Set()) => { if (seen.has(id)) return seen; seen.add(id); for (const s of arr(byId.get(id)?.['rdfs:subClassOf'])) supers(s['@id'], seen); return seen; };
const propsOf = (type) => { const set = new Set(); const sup = supers('schema:' + type); for (const n of vocab) if (n['@type'] === 'rdf:Property') for (const d of arr(n['schema:domainIncludes'])) if (sup.has(d['@id'])) set.add(n['@id'].replace('schema:', '')); return set; };
let bad = 0;
const check = (node, path) => {
  const type = node['@type']; if (!byId.has('schema:' + type)) { console.log('UNKNOWN TYPE', type, path); bad++; return; }
  const ok = propsOf(type);
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('@')) continue;
    if (!ok.has(k)) { console.log(`INVALID property ${k} on ${type} (${path})`); bad++; }
    for (const x of arr(v)) if (x && typeof x === 'object' && x['@type']) check(x, path + '.' + k);
  }
};
for (const f of process.argv.slice(3)) {
  const html = fs.readFileSync(f, 'utf8'); const m = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!m.length) { console.log('NO JSON-LD', f); bad++; continue; }
  for (const x of m) { const j = JSON.parse(x[1]); for (const n of j['@graph'] || [j]) check(n, n['@type']); console.log('parsed', f.split('/').pop(), (j['@graph'] || [j]).map((n) => n['@type']).join(' + ')); }
}
console.log(bad ? bad + ' problems' : 'JSON-LD: zero errors against the schema.org vocabulary');
