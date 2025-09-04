import { client } from "@repo/redis";
import { client as prismaClient } from "@repo/db";
import chalk from 'chalk';

async function main() {
  let batch: { price: number; symbol: string; time: Date, quantity: number }[] = [];

  while (true) {
    const { element } = (await client.brPop("trade", 0)) as { key: string; element: string };
    console.log(element);
    const { p, s, T, q } = JSON.parse(element).data;
    batch.push({ price: p, symbol: s, quantity: q,  time: new Date(T) });

    if (batch.length === 100) {
      const values = batch
        .map(
          ({ price, symbol, time, quantity }) =>
            `('${symbol}', ${price}, '${time.toISOString()}', ${quantity})`
        )
        .join(", ");

      const query = `
        INSERT INTO ticks (symbol, price, time, quantity)
        VALUES ${values};
      `;

      await prismaClient.$executeRawUnsafe(query);

      console.log(chalk.green(`Inserted ${batch.length} ticks`));
      batch = [];
    }
  }
}

main().catch(console.error);
