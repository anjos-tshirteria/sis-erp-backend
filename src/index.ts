import express from "express";
import { env } from "@src/config/env";
import { routes } from "./routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.send("API funcionando!");
});

app.use("/api", routes);

const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
