import express from "express";
import { env } from "@src/config/env";
import { prisma } from "./database/intex";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.send("API funcionando!");
});

app.post("/test-db", async (_req, res) => {
  try {
    await prisma.client.create({
      data: {
        name: "Test Client",
      },
    });

    const client = await prisma.client.findFirst();
    res.send(`Client criado no DB: ${JSON.stringify(client, null, 2)}`);
  } catch (e) {
    res.send(`Erro ao tentar acessar o DB: ${e}`);
  }
});

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
