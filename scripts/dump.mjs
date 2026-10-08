const res = await fetch('http://localhost:3000/');
const html = await res.text();
// Look at the experience section structure
const expMatch = html.match(/id="experience"[\s\S]{0,500}/);
console.log('Experience section first 500 chars after id:');
console.log(expMatch ? expMatch[0] : 'NOT FOUND');
console.log('\n---\n');
// Count ExperienceCard components (.reveal under #experience)
const expSection = html.split('id="experience"')[1]?.split('</section>')[0] ?? '';
console.log('Experience section length:', expSection.length);
console.log('.reveal in experience section:', (expSection.match(/reveal/g) ?? []).length);
console.log('timeline-dot count in experience:', (expSection.match(/timeline-dot/g) ?? []).length);