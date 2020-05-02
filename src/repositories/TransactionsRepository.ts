import { EntityRepository, Repository, getRepository } from 'typeorm';

// import { response } from 'express';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    // TODO
    // const transactions = await this.
    const income = transactions.reduce((accumulator, transaction) => {
      return transaction.type === 'income'
        ? accumulator + transaction.value
        : accumulator;
    }, 0);

    const outcome = transactions.reduce((accumulator, transaction) => {
      return transaction.type === 'outcome'
        ? accumulator + transaction.value
        : accumulator;
    }, 0);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }

  public async getTransactionsWithCategories(
    transactions: Transaction[],
  ): Promise<any> {
    const categoriesRepository = getRepository(Category);

    const categories = await categoriesRepository.find();

    const formattedCategories = categories.map(category => {
      return { id: category.id, title: category.title };
    });

    const transactionsWithCategories = transactions.map(
      ({ id, title, value, type, category_id }: Transaction) => {
        return {
          id,
          title,
          value,
          type,
          category: formattedCategories.find(
            category => category.id === category_id,
          ),
        };
      },
    );

    return transactionsWithCategories;
  }
}

export default TransactionsRepository;
