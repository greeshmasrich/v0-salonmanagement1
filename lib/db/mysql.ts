import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: process.env.DB_HOST || "194.163.45.105",
  user: process.env.DB_USER || "marketingOwner",
  password: process.env.DB_PASSWORD || "M@rketing123!",
  database: process.env.DB_NAME || "MarketingDb",
  waitForConnections: true,
  connectionLimit: 10,
})

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params)
  return rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

export default pool
