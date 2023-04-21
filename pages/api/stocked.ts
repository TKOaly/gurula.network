import { pool } from "@/db";
import { RowDataPacket } from "mysql2";
import { NextApiRequest, NextApiResponse } from "next";

interface StockQueryRow extends RowDataPacket {
  time: Date
  descr: string
  count: number
  prev_count: number
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const [result] = await pool.execute<StockQueryRow[]>(`
    SELECT
      time,
      descr,
      count,
      (
        SELECT count
        FROM ITEMHISTORY i2
        WHERE ITEMHISTORY.time > i2.time AND ITEMHISTORY.itemid = i2.itemid
        ORDER BY time DESC
        LIMIT 1
      ) AS prev_count,
      (
        SELECT count
        FROM ITEMHISTORY i2
        WHERE ITEMHISTORY.itemid = i2.itemid
        ORDER BY time DESC
        LIMIT 1
      ) AS current_count
    FROM ITEMHISTORY
    JOIN RVITEM ON RVITEM.itemid = ITEMHISTORY.itemid
    WHERE actionid IN (8,1)
    ORDER BY time DESC
    LIMIT 10
  `);

  res
    .status(200)
    .json(result.map((row) => ({
      time: row.time,
      name: row.descr,
      count: row.count,
      currentCount: row.current_count,
      isNew: row.prev_count === null,
    })));
}
