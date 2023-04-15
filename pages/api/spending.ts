import { pool } from "@/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const [purchasesPerHourRows]: [Array<{ diff: number, count: number }>] = await pool.execute(`
    SELECT
      TIMESTAMPDIFF(HOUR, time, NOW()) diff,
      COUNT(*) count
    FROM ITEMHISTORY
    WHERE actionid = 5 AND time > DATE_SUB(NOW(), INTERVAL 31 DAY)
    GROUP BY DATE(time), TIMESTAMPDIFF(HOUR, time, NOW())
    ORDER BY TIMESTAMPDIFF(HOUR, time, NOW()) DESC
  `) as any;

  let purchasesPerHour: any = [];

  for (let i = purchasesPerHourRows[0].diff; i >= 0; i--) {
    let count = purchasesPerHourRows.find(r => r.diff === i)?.count;

    if (count) {
      purchasesPerHour.push({ diff: i, count });
    } else {
      purchasesPerHour.push({ diff: i, count: 0 });
    }
  }

  res.status(200).json(purchasesPerHour);
}
