/*
  Simple migration script to seed MongoDB from local JSON files.
  Collections used: users, vehicles, drivers, tokens

  Usage:
    MONGODB_URI=... node scripts/migrate.js
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI env var. Aborting.');
  process.exit(1);
}

function readJsonSafe(fileName, fallback) {
  try {
    const p = path.join(projectRoot, fileName);
    if (!fs.existsSync(p)) return fallback;
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Warning: failed to read ${fileName}:`, e.message);
    return fallback;
  }
}

function normalizeUsers(obj) {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  // users.json is a map keyed by email
  return Object.values(obj).filter(u => u && u.email);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('carrental');

  const usersCol = db.collection('users');
  const vehiclesCol = db.collection('vehicles');
  const driversCol = db.collection('drivers');
  const tokensCol = db.collection('tokens');

  const usersJson = readJsonSafe('users.json', {});
  const vehiclesJson = readJsonSafe('vehicles.json', []);
  const driversJson = readJsonSafe('drivers.json', []);
  const tokensJson = readJsonSafe('tokens.json', {});

  const users = normalizeUsers(usersJson);
  const tokens = Array.isArray(tokensJson)
    ? tokensJson
    : Object.entries(tokensJson).map(([token, data]) => ({ token, ...data }));

  console.log('Seeding data...');

  // Upsert users by email
  for (const user of users) {
    await usersCol.updateOne(
      { email: user.email },
      { $set: user },
      { upsert: true }
    );
  }
  console.log(`Users upserted: ${users.length}`);

  // Upsert vehicles by id
  for (const v of vehiclesJson) {
    if (!v || typeof v.id === 'undefined') continue;
    await vehiclesCol.updateOne(
      { id: v.id },
      { $set: v },
      { upsert: true }
    );
  }
  console.log(`Vehicles upserted: ${vehiclesJson.length}`);

  // Upsert drivers by id
  for (const d of driversJson) {
    if (!d || typeof d.id === 'undefined') continue;
    await driversCol.updateOne(
      { id: d.id },
      { $set: d },
      { upsert: true }
    );
  }
  console.log(`Drivers upserted: ${driversJson.length}`);

  // Upsert tokens by token string
  for (const t of tokens) {
    if (!t || !t.token) continue;
    await tokensCol.updateOne(
      { token: t.token },
      { $set: t },
      { upsert: true }
    );
  }
  console.log(`Tokens upserted: ${tokens.length}`);

  await client.close();
  console.log('Seeding completed.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});


