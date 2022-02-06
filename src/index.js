const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");

app.use(express.json());

const customers = [];

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customer_exists = customers.some((customer) => customer.cpf === cpf);

  if (customer_exists) {
    return res.status(400).json({ error: "customer already exists" });
  }

  const account = {
    id: uuidv4(),
    name,
    cpf,
    statements: [],
  };

  customers.push(account);

  return res.status(201).send();
});

app.get("/statement", verifyIfExistsAccountCpf, (req, res) => {
  const { customer } = req;
  return res.status(200).json(customer.statements);
});

app.get("/statement/date", verifyIfExistsAccountCpf, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + "00:00");

  const statement = customer.statements.filter(
    (statement) =>
      statement.createdAt.toDateString() === dateFormat.toDateString()
  );

  return res.status(200).json(statement);
});

app.post("/deposit", verifyIfExistsAccountCpf, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit",
  };

  customer.statements.push(statementOperation);

  return res.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCpf, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statements);

  if (balance < amount) {
    return res.status(400).json({ error: "Insificient funds!!!" });
  }

  const statementOperation = {
    amount,
    createdAt: new Date(),
    type: "debit",
  };

  customer.statements.push(statementOperation);

  return res.send(201).send();
});

app.put("/account", verifyIfExistsAccountCpf, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(204).json();
});

app.get("/account", verifyIfExistsAccountCpf, (req, res) => {
  const { customer } = req;

  return res.json(customer);
});

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

function verifyIfExistsAccountCpf(req, res, next) {
  const { cpf } = req.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);

  req.customer = customer;

  if (customer) {
    return next();
  }

  return res.status(400).json({ error: "customer not found" });
}

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});
