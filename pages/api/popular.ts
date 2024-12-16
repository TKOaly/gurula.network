import { pool } from "@/db";
import sql from 'sql-template-strings';
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const queryPopular = (hours: number) => pool.query(`
    SELECT c.*, COALESCE(p.count, 0) AS previous_count
    FROM (
      SELECT
        "RVITEM".itemid,
        "RVITEM".descr name,
        COUNT(*)::int count
      FROM "ITEMHISTORY"
      JOIN "RVITEM" ON "RVITEM".itemid = "ITEMHISTORY".itemid
      WHERE actionid = 5
        AND age(NOW(), time) <= $1::interval
        AND "ITEMHISTORY".itemid NOT IN (58, 56, 1432)
      GROUP BY "RVITEM".itemid, "RVITEM".descr
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) c
    LEFT JOIN ( 
      SELECT
        itemid,
        COUNT(*)::int count
      FROM "ITEMHISTORY"
      WHERE actionid = 5
        AND age(NOW(), time) > $1::interval
        AND age(NOW(), time) <= $2::interval
      GROUP BY itemid
    ) p ON p.itemid = c.itemid
    ORDER BY c.count DESC
  `, [`${hours} hour`, `${hours * 2} hour`]).then(result => result.rows)

  const [day, week, month, year] = await Promise.all([
    queryPopular(24),
    queryPopular(24 * 7),
    queryPopular(24 * 31),
    queryPopular(24 * 365),
  ]);

  const result = { day, week, month, year };

  res.status(200).json(result);
}
