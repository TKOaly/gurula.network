import { pool } from "@/db";
import { NextApiRequest, NextApiResponse } from "next";
import { QueryResultRow } from "pg";

interface StockQueryRow extends QueryResultRow {
  time: Date
  descr: string
  count: number
  prev_count: number
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const result = await pool.query<StockQueryRow>(`
    SELECT
      time,
      descr,
      count,
      (
        SELECT count
        FROM "ITEMHISTORY" i2
        WHERE "ITEMHISTORY".time > i2.time AND "ITEMHISTORY".itemid = i2.itemid
        ORDER BY time DESC
        LIMIT 1
      ) AS prev_count
    FROM "ITEMHISTORY"
    JOIN "RVITEM" ON "RVITEM".itemid = "ITEMHISTORY".itemid
    WHERE actionid = 29
    ORDER BY time DESC
    LIMIT 10
  `).then(result => result.rows);

  res
    .status(200)
    .json(result.map((row) => ({
      time: row.time,
      name: row.descr,
      count: row.count,
      isNew: row.prev_count === null,
    })));
}
