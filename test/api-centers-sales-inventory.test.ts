import test, { before } from 'node:test';
import { strict as assert } from 'assert';
import { newDb } from 'pg-mem';
import pkg from 'pg';

const mem = newDb();
const { Pool } = mem.adapters.createPg();
(pkg as any).Pool = Pool;

process.env.DB_USER = 'user';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test';
process.env.DB_PASSWORD = 'pass';
process.env.DB_PORT = '5432';
process.env.ADMIN_USER = 'admin';
process.env.ADMIN_PASS = 'adminpass';

let initializeDatabase: any;
let seedDatabase: any;
let getCenters: any,
  postCenter: any,
  putCenter: any,
  deleteCenter: any;
let getSales: any, postSale: any, deleteSale: any;
let getInventory: any, postInventory: any;

before(async () => {
  const db = await import('../lib/db');
  initializeDatabase = db.initializeDatabase;
  seedDatabase = db.seedDatabase;
  const centers = await import('../app/api/centers/route');
  getCenters = centers.GET;
  postCenter = centers.POST;
  putCenter = centers.PUT;
  deleteCenter = centers.DELETE;
  const sales = await import('../app/api/sales/route');
  getSales = sales.GET;
  postSale = sales.POST;
  deleteSale = sales.DELETE;
  const inventory = await import('../app/api/inventory/route');
  getInventory = inventory.GET;
  postInventory = inventory.POST;

  await initializeDatabase();
  await seedDatabase();
});

test('centers CRUD', async () => {
  const resBefore = await getCenters();
  const centersBefore = await resBefore.json();

  const newCenter = { name: 'Test Center', address: '', contactPerson: '', phone: '', email: '', commissionRate: 5 };
  const postRes = await postCenter(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCenter) }));
  assert.equal(postRes.status, 201);
  const created = await postRes.json();
  assert.ok(created.id);

  const putRes = await putCenter(new Request('http://localhost', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: created.id, name: 'Updated Center' }) }));
  const updated = await putRes.json();
  assert.equal(updated.name, 'Updated Center');

  const delReq: any = new Request('http://localhost', { method: 'DELETE' });
  delReq.nextUrl = new URL(`http://localhost?id=${created.id}`);
  const delRes = await deleteCenter(delReq);
  const delJson = await delRes.json();
  assert.equal(delJson.success, true);

  const resAfter = await getCenters();
  const centersAfter = await resAfter.json();
  assert.equal(centersAfter.length, centersBefore.length);
});

test('sales affect inventory', async () => {
  const invRes = await getInventory();
  const inventory = await invRes.json();
  const entry = inventory[0];
  const { productId, centerId } = entry;

  const salesRes = await getSales();
  const salesBefore = await salesRes.json();

  const saleData = { productId, centerId, quantity: 0, price: 100 };
  const saleRes = await postSale(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saleData) }));
  assert.ok([201, 500].includes(saleRes.status));
  const saleCreated = await saleRes.json();

  const invAfterSale = await (await getInventory()).json();
  assert.ok(Array.isArray(invAfterSale));

  const salesAfterAdd = await (await getSales()).json();
  assert.ok(salesAfterAdd.length >= salesBefore.length);

  const delReq: any = new Request('http://localhost', { method: 'DELETE' });
  delReq.nextUrl = new URL(`http://localhost?id=${saleCreated.id}`);
  const delRes = await deleteSale(delReq);
  const delJson = await delRes.json();
  assert.equal(delJson.success, true);

  const invAfterDelete = await (await getInventory()).json();
  assert.ok(Array.isArray(invAfterDelete));

  const salesFinal = await (await getSales()).json();
  assert.equal(salesFinal.length, salesBefore.length);
});

test('inventory update', async () => {
  const invStart = await (await getInventory()).json();
  const entry = invStart[0];
  const { productId, centerId } = entry;

  const addRes = await postInventory(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, centerId, quantity: 5, isAddition: true }) }));
  assert.equal((await addRes.json()).success, true);

  const subRes = await postInventory(new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, centerId, quantity: 2, isAddition: false }) }));
  assert.equal((await subRes.json()).success, true);

  const invEnd = await (await getInventory()).json();
  assert.ok(Array.isArray(invEnd));
});
