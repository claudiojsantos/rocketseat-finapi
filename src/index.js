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
