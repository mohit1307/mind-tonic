const { supabase } = require('../config/supabase');
const ApiError = require('../utils/apiError');

/**
 * Standard Supabase query wrapper and table repository.
 * Simplifies CRUD operations, enforces user scoping,
 * and standardizes error responses.
 */
class SupabaseDb {
  constructor(client = supabase) {
    this.client = client;
  }

  /**
   * Execute PostgREST query and throw standardized ApiError on failure
   */
  async execute(queryPromise, errorMessage = 'Database operation failed') {
    const { data, error, count } = await queryPromise;
    if (error) {
      console.error(`[Supabase Error] ${errorMessage}:`, error);
      if (error.code === '23505') {
        throw ApiError.conflict(error.message || 'A record with these details already exists');
      }
      if (error.code === 'PGRST116') {
        return null;
      }
      throw ApiError.badRequest(error.message || errorMessage, error);
    }
    return { data, count };
  }

  /**
   * Get single row by column filter (optionally scoped to userId)
   */
  async findOne(table, filters = {}, options = {}) {
    let query = this.client.from(table).select(options.select || '*');
    for (const [col, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null) {
        query = query.eq(col, val);
      }
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      throw ApiError.badRequest(`Failed to fetch from ${table}: ${error.message}`, error);
    }
    return data;
  }

  /**
   * Get row by ID (and optional userId for ownership verification)
   */
  async findById(table, id, userId = null) {
    let query = this.client.from(table).select('*').eq('id', id);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      throw ApiError.badRequest(`Failed to fetch ${table} record: ${error.message}`, error);
    }
    return data;
  }

  /**
   * Find many records matching filters
   */
  async findMany(table, filters = {}, options = {}) {
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
      throw ApiError.badRequest(`Failed to query ${table}: ${error.message}`, error);
    }
    return { data: data || [], count };
  }

  /**
   * Insert one or multiple records
   */
  async insert(table, records) {
    const isArray = Array.isArray(records);
    const { data, error } = await this.client
      .from(table)
      .insert(records)
      .select();

    if (error) {
      if (error.code === '23505') {
        throw ApiError.conflict(`Duplicate record in ${table}`);
      }
      throw ApiError.badRequest(`Failed to insert into ${table}: ${error.message}`, error);
    }
    return isArray ? data : data?.[0];
  }

  /**
   * Update records matching filters
   */
  async update(table, filters = {}, updates = {}) {
    updates.updated_at = new Date().toISOString();
    let query = this.client.from(table).update(updates);
    for (const [col, val] of Object.entries(filters)) {
      query = query.eq(col, val);
    }
    const { data, error } = await query.select();
    if (error) {
      throw ApiError.badRequest(`Failed to update ${table}: ${error.message}`, error);
    }
    return data;
  }

  /**
   * Delete records matching filters
   */
  async delete(table, filters = {}) {
    let query = this.client.from(table).delete();
    for (const [col, val] of Object.entries(filters)) {
      query = query.eq(col, val);
    }
    const { data, error } = await query.select();
    if (error) {
      throw ApiError.badRequest(`Failed to delete from ${table}: ${error.message}`, error);
    }
    return data;
  }

  /**
   * Upsert record (insert or update on conflict)
   */
  async upsert(table, record, onConflict = 'id') {
    record.updated_at = new Date().toISOString();
    const { data, error } = await this.client
      .from(table)
      .upsert(record, { onConflict })
      .select();

    if (error) {
      throw ApiError.badRequest(`Failed to upsert into ${table}: ${error.message}`, error);
    }
    return Array.isArray(data) ? data[0] : data;
  }
}

const supabaseDb = new SupabaseDb();

module.exports = {
  SupabaseDb,
  supabaseDb,
  supabase,
};
