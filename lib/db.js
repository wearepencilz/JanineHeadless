import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env.local (for local development)
if (!process.env.VERCEL) {
  dotenv.config({ path: '.env.local' })
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if we're in production (Vercel) or development
const isProduction = process.env.VERCEL === '1'

// Database adapter that works with multiple storage backends
class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../public/data')
    this.kv = null
    this.redis = null
    this.storageType = 'file' // Default to file storage
    this.initialized = false
    this.initPromise = null
    
    // Initialize storage backend if in production
    if (isProduction) {
      this.initPromise = this.initStorage()
    } else {
      this.initialized = true
    }
  }

  async ensureInitialized() {
    if (!this.initialized && this.initPromise) {
      await this.initPromise
      this.initialized = true
    }
  }

  async initStorage() {
    // Try Vercel KV / Upstash Redis first (via @vercel/kv)
    if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const { kv } = await import('@vercel/kv')
        this.kv = kv
        this.storageType = 'kv'
        console.log('✓ Using Vercel KV / Upstash Redis for data storage')
        return
      } catch (error) {
        console.warn('⚠ Vercel KV not available:', error.message)
      }
    }

    // Try native Redis client (for custom Redis servers)
    if (process.env.REDIS_URL) {
      try {
        const { createClient } = await import('redis')
        console.log('Attempting Redis connection to:', process.env.REDIS_URL.replace(/:[^:@]+@/, ':****@'))
        this.redis = await createClient({
          url: process.env.REDIS_URL
        }).connect()
        this.storageType = 'redis'
        console.log('✓ Using Redis for data storage')
        return
      } catch (error) {
        console.error('⚠ Redis connection failed:', error.message)
        console.error('Full error:', error)
      }
    }

    // Fallback to file system (not recommended for production)
    console.warn('⚠ No database configured, using file system (data will not persist)')
    this.storageType = 'file'
  }

  async read(filename) {
    await this.ensureInitialized()
    
    const key = filename.replace('.json', '')
    
    // Try Vercel KV / Upstash first
    if (this.kv) {
      try {
        const data = await this.kv.get(key)
        if (data) {
          console.log(`✓ Read from KV: ${key}`)
          return data
        }
      } catch (error) {
        console.error('KV read error:', error)
      }
    }

    // Try native Redis
    if (this.redis) {
      try {
        const data = await this.redis.get(key)
        if (data) {
          console.log(`✓ Read from Redis: ${key}`)
          return JSON.parse(data)
        }
      } catch (error) {
        console.error('Redis read error:', error)
      }
    }
    
    // Fallback to file system
    try {
      const filePath = path.join(this.dataDir, filename)
      const data = fs.readFileSync(filePath, 'utf8')
      console.log(`✓ Read from file: ${filename}`)
      return JSON.parse(data)
    } catch (error) {
      console.error('File read error:', error)
      return null
    }
  }

  async write(filename, data) {
    await this.ensureInitialized()
    
    const key = filename.replace('.json', '')
    
    // Write to Vercel KV / Upstash if available
    if (this.kv) {
      try {
        await this.kv.set(key, data)
        console.log(`✓ Saved to KV: ${key}`)
      } catch (error) {
        console.error('KV write error:', error)
      }
    }

    // Write to native Redis if available
    if (this.redis) {
      try {
        await this.redis.set(key, JSON.stringify(data))
        console.log(`✓ Saved to Redis: ${key}`)
      } catch (error) {
        console.error('Redis write error:', error)
      }
    }
    
    // Always write to file system in development
    if (!isProduction) {
      try {
        const filePath = path.join(this.dataDir, filename)
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
        console.log(`✓ Saved to file: ${filename}`)
      } catch (error) {
        console.error('File write error:', error)
      }
    }
    
    return data
  }

  async close() {
    // Close Redis connection if exists
    if (this.redis) {
      await this.redis.quit()
    }
  }
}

export const db = new Database()

// Helper functions for data access
async function getData(type) {
  const data = await db.read(`${type}.json`)
  return data || []
}

async function saveData(type, data) {
  return await db.write(`${type}.json`, data)
}

// Ingredients
export async function getIngredients() {
  return getData('ingredients')
}

export async function saveIngredients(ingredients) {
  return saveData('ingredients', ingredients)
}

// Flavours
export async function getFlavours() {
  return getData('flavours')
}

export async function saveFlavours(flavours) {
  return saveData('flavours', flavours)
}

// Batches
export async function getBatches() {
  return getData('batches')
}

export async function saveBatches(batches) {
  return saveData('batches', batches)
}

// Stories
export async function getStories() {
  return getData('stories')
}

export async function saveStories(stories) {
  return saveData('stories', stories)
}

// Settings
export async function getSettings() {
  return getData('settings')
}

export async function saveSettings(settings) {
  return saveData('settings', settings)
}

// Legacy - Projects (keeping for backward compatibility)
export async function getProjects() {
  return getData('projects')
}

export async function saveProjects(projects) {
  return saveData('projects', projects)
}

// Legacy - News (keeping for backward compatibility)
export async function getNews() {
  return getData('news')
}

export async function saveNews(news) {
  return saveData('news', news)
}

// Sync Jobs
export async function getSyncJobs() {
  return getData('sync-jobs')
}

export async function saveSyncJobs(jobs) {
  return saveData('sync-jobs', jobs)
}

// Sync Logs
export async function getSyncLogs() {
  return getData('sync-logs')
}

export async function saveSyncLogs(logs) {
  return saveData('sync-logs', logs)
}

// Formats (Three-Layer Architecture)
export async function getFormats() {
  return getData('formats')
}

export async function saveFormats(formats) {
  return saveData('formats', formats)
}

// Offerings (Three-Layer Architecture)
export async function getOfferings() {
  return getData('offerings')
}

export async function saveOfferings(offerings) {
  return saveData('offerings', offerings)
}

// Bundles (Three-Layer Architecture)
export async function getBundles() {
  return getData('bundles')
}

export async function saveBundles(bundles) {
  return saveData('bundles', bundles)
}

// Components (Three-Layer Architecture)
export async function getComponents() {
  return getData('components')
}

export async function saveComponents(components) {
  return saveData('components', components)
}

// Seasonal Collections (Three-Layer Architecture)
export async function getSeasonalCollections() {
  return getData('seasonal-collections')
}

export async function saveSeasonalCollections(collections) {
  return saveData('seasonal-collections', collections)
}
