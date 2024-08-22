import { pool } from "@/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const purchasesPerHourRows: Array<{ diff: number, count: number }> = await pool.query(`
    SELECT
       FLOOR(EXTRACT(EPOCH FROM (NOW() - time)) / 3600)::INTEGER diff,
       DATE(time),
      COUNT(*)::INTEGER count
    FROM "ITEMHISTORY"
    WHERE actionid = 5 AND age(NOW(), time) <= interval '8 day'
    GROUP BY DATE(time),  FLOOR(EXTRACT(EPOCH FROM (NOW() - time)) / 3600)
    ORDER BY FLOOR(EXTRACT(EPOCH FROM (NOW() - time)) / 3600)::INTEGER ASC
  `).then(result => result.rows) as any;
  let purchasesPerHour: any = [];

  for (let i = 0; i < 24 * 31; i++) {
    let count = purchasesPerHourRows.find(r => r.diff === i)?.count;

    if (count) {
      purchasesPerHour.push({ diff: i, count });
    } else {
      purchasesPerHour.push({ diff: i, count: 0 });
    }
  }

  res
    .status(200)
    .json({
      timestamp: new Date(),
      purchasesPerHour,
    });
}
