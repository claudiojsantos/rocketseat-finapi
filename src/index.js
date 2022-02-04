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

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});
