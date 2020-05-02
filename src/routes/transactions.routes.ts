import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  // Busca todas as transações
  const transactions = await transactionsRepository.find();

  // Calcula o balanço das transações
  const balance = await transactionsRepository.getBalance(transactions);

  // Busca o nome e id da categoria
  const transactionsWithCategories = await transactionsRepository.getTransactionsWithCategories(
    transactions,
  );

  const transactionsSummary = {
    transactions: transactionsWithCategories,
    balance,
  };

  return response.json(transactionsSummary);
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  // Insere os dados na tabela de transação
  const { title, value, type, category } = request.body;

  // Verifica se já existe a categoria no banco, e cria uma caso não haja
  // em seguida, insere no banco a transação
  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;
  // Verifica se transação existe
  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(id);

  // return response.json(resp);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO
    const importTransactionService = new ImportTransactionsService();

    const transactions = await importTransactionService.execute({
      filename: request.file.filename,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
