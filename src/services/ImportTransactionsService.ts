import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';

interface Request {
  filename: string;
}

interface Transactions {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    // Array para armazenar transações
    const transactions: Transactions[] = [];

    const createTransactionsService = new CreateTransactionService();

    const csv_path = path.join(uploadConfig.directory, filename);

    // Cria instancia para ler o CSV
    const read_stream = fs.createReadStream(csv_path);

    // Especifica o parser para ler a partir da segunda linha do csv (exclui cabeçalho)
    const parserConfig = csv({
      from_line: 2,
      trim: true,
    });

    // Aplica configurações do parser
    const parsedTransactions = read_stream.pipe(parserConfig);

    // Inicia iteração por linha do CSV
    parsedTransactions.on('data', async ([title, type, value, category]) => {
      // const [title, type, value, category] = row.map((field: string) =>
      //   field.trim(),
      // );

      if (!title || !type || !value || !category) {
        throw new AppError('Ĩnvalid transaction parameters');
      }

      const newTransaction = {
        title,
        value: Number.parseFloat(value),
        type,
        category,
      };

      transactions.push(newTransaction);
    });

    await new Promise((resolve, reject) => {
      parsedTransactions.on('end', resolve);
      parsedTransactions.on('error', reject);
    });

    const createdTransactions: Transaction[] = [];

    for (const item of transactions) {
      const newCreatedTransaction = await createTransactionsService.execute(
        item,
      );

      createdTransactions.push(newCreatedTransaction);
    }

    await fs.promises.unlink(csv_path);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
