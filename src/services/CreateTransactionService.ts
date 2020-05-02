import { getRepository, getCustomRepository } from 'typeorm';

// import { check } from 'prettier';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO
    // Verifica se a transação já existe
    const categoriesRepository = getRepository(Category);

    const checkCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    let category_id;

    if (!checkCategoryExists) {
      const newCategory = categoriesRepository.create({ title: category });

      const newCategoryDB = await categoriesRepository.save(newCategory);

      category_id = newCategoryDB.id;
    } else {
      category_id = checkCategoryExists.id;
    }

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // Verifica se possui balanço para inserir a nova transação
    const transactions = await transactionsRepository.find();
    const balance = await transactionsRepository.getBalance(transactions);

    if (type === 'outcome') {
      const saldoFinal = balance.total - value;

      if (saldoFinal < 0) {
        throw new AppError('Valor de saída maior do que saldo disponível');
      }
    }

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;
