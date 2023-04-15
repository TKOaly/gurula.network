import { pool } from "@/db";
import sql from 'sql-template-strings';
import { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import { RowDataPacket } from "mysql2";

interface Row extends RowDataPacket {
  name: string
  time: Date
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const [mostRecentPurchases] = await pool.query<Row[]>(`
    SELECT
      descr AS name,
      time
    FROM ITEMHISTORY
    JOIN RVITEM ON RVITEM.itemid = ITEMHISTORY.itemid
    WHERE actionid = 5 AND ITEMHISTORY.itemid NOT IN (58, 56, 1432)
    ORDER BY time
    DESC LIMIT 10
  `);

  const result = mostRecentPurchases
    .map((row: any) => ({
      name: row.name,
      time: format(row.time, 'HH:mm'),
    }));

  res.status(200).json(result);
}
