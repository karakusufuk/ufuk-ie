import * as R from './recorder.mjs';
await R.open();
const r = await R.record({ name: 'try-garvey', url: 'https://garveylennon.ufuk.ie/', seconds: 3, setup: async (p) => { await p.waitForTimeout(3000); }, act: async (p, mark) => { await R.sleep(500); mark('click'); await p.getByText('Start here').first().click(); } }, '/private/tmp/claude-501/clips');
console.log(r); await R.close();
