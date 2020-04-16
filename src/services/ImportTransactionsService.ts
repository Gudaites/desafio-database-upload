import csv from 'csvtojson';
import path from 'path';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  file: string;
}

class ImportTransactionsService {
  async execute({ file }: Request): Promise<Transaction[]> {
    // console.log(file);
    const filePath = path.join(uploadConfig.directory, file);
    const csvJson = await csv().fromFile(filePath);

    const createTransactionService = new CreateTransactionService();

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const element of csvJson) {
      const { title, type, value, category } = element;

      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionService.execute({
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
