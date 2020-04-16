import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid type.');
    }

    if (value <= 0) {
      throw new AppError('Value must be grater than 0.');
    }

    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();

      if (balance.total - value < 0) {
        throw new AppError('Not sufficient balance.');
      }
    }

    const categoryExist = await categoriesRepository.findOne({
      where: { title: category },
    });

    let createCategory;

    if (!categoryExist) {
      createCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(createCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
    });

    if (createCategory) {
      transaction.category_id = createCategory.id;
    } else if (categoryExist) {
      transaction.category_id = categoryExist.id;
    }

    await transactionsRepository.save(transaction);

    delete transaction.category_id;
    delete transaction.created_at;
    delete transaction.updated_at;

    return transaction;
  }
}

export default CreateTransactionService;
