import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { JSONContent } from 'novel';

interface IData {
  id: number;
  title: string
  markdown: string;
  htmlContent: string;
  novelContent: JSONContent;
  createdAt: string;
}

const DB_NAME = 'ai-novel';
const STORE_NAME = 'ai-novel';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: IData
    indexes: {
      'byId': number;
    };
  };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  const db = await openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('byId', 'id');  // 创建索引
      }
    },
  });
  return db;
}

export async function addOrUpdateData(data: IData): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).put(data);
  await tx.done;
}

export async function addData(data: IData): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).add(data);
  await tx.done;
}

export async function getData(id: number): Promise<IData | undefined> {
  const db = await initDB();
  return await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
}

export async function getAllData(): Promise<Array<IData>> {
  const db = await initDB();
  const reault = await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
  return reault.sort((a, b) => b.id - a.id);
}

// export async function getDataById(toolId: string): Promise<Array<IData>> {
//   const db = await initDB();
//   const reault = await db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).index('byId').getAll(toolId);
//   return reault;
// }

// 新增的删除功能
export async function deleteData(id: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}