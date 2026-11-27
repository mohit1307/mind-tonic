const { supabase } = require('../config/supabase');
const ApiError = require('../utils/apiError');
const crypto = require('crypto');

// In-memory fallback store when PostgreSQL tables are awaiting migration in Supabase
const memoryStore = new Map();

function getStore(table) {
  if (!memoryStore.has(table)) {
    memoryStore.set(table, []);
  }
  return memoryStore.get(table);
}

function isSchemaCacheError(err) {
  if (!err) return false;
  const msg = err.message || '';
  return (
    err.code === 'PGRST205' ||
    err.code === '42P01' ||
    msg.includes('Could not find the table') ||
    msg.includes('schema cache')
  );
}

/**
 * Standard Supabase query wrapper and table repository.
 * Simplifies CRUD operations, enforces user scoping,
 * and standardizes error responses with graceful fallback.
 */
class SupabaseDb {
  constructor(client = supabase) {
    this.client = client;
  }

  // ── In-Memory Fallback Operations ──────────────────────────────────
  _memoryFindOne(table, filters = {}) {
    const store = getStore(table);
    return (
      store.find((item) =>
        Object.entries(filters).every(([k, v]) => String(item[k]) === String(v))
      ) || null
    );
  }

  _memoryFindMany(table, filters = {}, options = {}) {
    let store = [...getStore(table)];
    if (Object.keys(filters).length > 0) {
      store = store.filter((item) =>
        Object.entries(filters).every(([k, v]) =>
          v === null || v === undefined ? true : String(item[k]) === String(v)
        )
      );
    }
    if (options.orderBy) {
      const col = options.orderBy;
      const asc = options.ascending ?? true;
      store.sort((a, b) => {
        if (a[col] < b[col]) return asc ? -1 : 1;
        if (a[col] > b[col]) return asc ? 1 : -1;
        return 0;
      });
    }
    const total = store.length;
    if (options.limit) {
      const offset = options.offset || 0;
      store = store.slice(offset, offset + options.limit);
    }
    return { data: store, count: total };
  }

  _memoryInsert(table, records) {
    const isArray = Array.isArray(records);
    const list = isArray ? records : [records];
    const store = getStore(table);
    const created = [];

    for (const r of list) {
      const item = {
        id: r.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...r,
      };
      store.push(item);
      created.push(item);
    }

    return isArray ? created : created[0];
  }

  _memoryUpdate(table, filters = {}, updates = {}) {
    const store = getStore(table);
    const updated = [];

    store.forEach((item) => {
      const match = Object.entries(filters).every(([k, v]) => String(item[k]) === String(v));
      if (match) {
        Object.assign(item, updates, { updated_at: new Date().toISOString() });
        updated.push(item);
      }
    });

    return updated;
  }

  _memoryDelete(table, filters = {}) {
    let store = getStore(table);
    const remaining = [];
    const deleted = [];

    store.forEach((item) => {
      const match = Object.entries(filters).every(([k, v]) => String(item[k]) === String(v));
      if (match) {
        deleted.push(item);
      } else {
        remaining.push(item);
      }
    });

    memoryStore.set(table, remaining);
    return deleted;
  }

  _memoryUpsert(table, record, onConflict = 'id') {
    const store = getStore(table);
    const matchIdx = store.findIndex((item) => String(item[onConflict]) === String(record[onConflict]));

    if (matchIdx >= 0) {
      Object.assign(store[matchIdx], record, { updated_at: new Date().toISOString() });
      return store[matchIdx];
    } else {
      const item = {
        id: record.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...record,
      };
      store.push(item);
      return item;
    }
  }

  // ── Public Database Methods ────────────────────────────────────────

  /**
   * Get single row by column filter (optionally scoped to userId)
   */
  async findOne(table, filters = {}, options = {}) {
    try {
      let query = this.client.from(table).select(options.select || '*');
      for (const [col, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null) {
          query = query.eq(col, val);
        }
      }
      const { data, error } = await query.maybeSingle();
      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryFindOne(table, filters);
        }
        throw ApiError.badRequest(`Failed to fetch from ${table}: ${error.message}`, error);
      }
      return data;
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryFindOne(table, filters);
      }
      throw err;
    }
  }

  /**
   * Get row by ID (and optional userId for ownership verification)
   */
  async findById(table, id, userId = null) {
    try {
      let query = this.client.from(table).select('*').eq('id', id);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.maybeSingle();
      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryFindOne(table, userId ? { id, user_id: userId } : { id });
        }
        throw ApiError.badRequest(`Failed to fetch ${table} record: ${error.message}`, error);
      }
      return data;
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryFindOne(table, userId ? { id, user_id: userId } : { id });
      }
      throw err;
    }
  }

  /**
   * Find many records matching filters
   */
  async findMany(table, filters = {}, options = {}) {
    try {
      let query = this.client
        .from(table)
        .select(options.select || '*', { count: options.count ? 'exact' : undefined });

      for (const [col, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null) {
          query = query.eq(col, val);
        }
      }
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset !== undefined && options.offset !== null) {
        const limit = options.limit || 10;
        query = query.range(options.offset, options.offset + limit - 1);
      }
      const { data, error, count } = await query;
      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryFindMany(table, filters, options);
        }
        throw ApiError.badRequest(`Failed to query ${table}: ${error.message}`, error);
      }
      return { data: data || [], count };
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryFindMany(table, filters, options);
      }
      throw err;
    }
  }

  /**
   * Insert one or multiple records
   */
  async insert(table, records) {
    try {
      const isArray = Array.isArray(records);
      const { data, error } = await this.client
        .from(table)
        .insert(records)
        .select();

      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryInsert(table, records);
        }
        if (error.code === '23505') {
          throw ApiError.conflict(`Duplicate record in ${table}`);
        }
        throw ApiError.badRequest(`Failed to insert into ${table}: ${error.message}`, error);
      }
      return isArray ? data : data?.[0];
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryInsert(table, records);
      }
      throw err;
    }
  }

  /**
   * Update records matching filters
   */
  async update(table, filters = {}, updates = {}) {
    try {
      updates.updated_at = new Date().toISOString();
      let query = this.client.from(table).update(updates);
      for (const [col, val] of Object.entries(filters)) {
        query = query.eq(col, val);
      }
      const { data, error } = await query.select();
      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryUpdate(table, filters, updates);
        }
        throw ApiError.badRequest(`Failed to update ${table}: ${error.message}`, error);
      }
      return data;
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryUpdate(table, filters, updates);
      }
      throw err;
    }
  }

  /**
   * Delete records matching filters
   */
  async delete(table, filters = {}) {
    try {
      let query = this.client.from(table).delete();
      for (const [col, val] of Object.entries(filters)) {
        query = query.eq(col, val);
      }
      const { data, error } = await query.select();
      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryDelete(table, filters);
        }
        throw ApiError.badRequest(`Failed to delete from ${table}: ${error.message}`, error);
      }
      return data;
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryDelete(table, filters);
      }
      throw err;
    }
  }

  /**
   * Upsert record (insert or update on conflict)
   */
  async upsert(table, record, onConflict = 'id') {
    try {
      record.updated_at = new Date().toISOString();
      const { data, error } = await this.client
        .from(table)
        .upsert(record, { onConflict })
        .select();

      if (error) {
        if (isSchemaCacheError(error)) {
          return this._memoryUpsert(table, record, onConflict);
        }
        throw ApiError.badRequest(`Failed to upsert into ${table}: ${error.message}`, error);
      }
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      if (isSchemaCacheError(err)) {
        return this._memoryUpsert(table, record, onConflict);
      }
      throw err;
    }
  }
}

const supabaseDb = new SupabaseDb();

module.exports = {
  SupabaseDb,
  supabaseDb,
  supabase,
};
