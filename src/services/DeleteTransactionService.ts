import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transactionsRepository = getRepository(Transaction);

    // Verifica se há a transação especificada
    const findTransaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (!findTransaction) {
      throw new AppError("Transaction doesn't exists");
    }

    await transactionsRepository.delete({ id });
  }
}

export default DeleteTransactionService;
