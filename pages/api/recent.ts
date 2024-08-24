import { pool } from "@/db";
import sql from 'sql-template-strings';
import { NextApiRequest, NextApiResponse } from "next";
import { format } from "date-fns";
import { QueryResultRow } from "pg";

interface Row extends QueryResultRow {
  name: string
  time: Date
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const mostRecentPurchases = (await pool.query<Row[]>(`
    SELECT
      descr AS name,
      time
    FROM "ITEMHISTORY"
    JOIN "RVITEM" ON "RVITEM".itemid = "ITEMHISTORY".itemid
    JOIN "RVPERSON" ON "RVPERSON".userid = "ITEMHISTORY".userid
    WHERE actionid = 5 AND "ITEMHISTORY".itemid NOT IN (58, 56, 1432) AND privacy_level <= 1
    ORDER BY time
    DESC LIMIT 10
  `)).rows;

  const result = mostRecentPurchases
    .map((row: any) => ({
      name: row.name,
      time: row.time,
    }));

  res.status(200).json(result);
}
