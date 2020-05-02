// import { getCustomRepository } from 'typeorm';
import fs from 'fs';
import csv from 'csvtojson';
import path from 'path';
// import csv from 'csv-parse';
import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    // TODO
    const createTransactionsService = new CreateTransactionService();

    const csv_path = path.join(uploadConfig.directory, filename);

    const csvJson = await csv().fromFile(csv_path);

    const transactions: Transaction[] = [];
    for (const item of csvJson) {
      const { title, type, value, category } = item;

      const transaction = await createTransactionsService.execute({
        title,
        type,
        value: Number.parseFloat(value),
        category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
