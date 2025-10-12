import app from "./reservas.js";

process.loadEnvFile();

//lanzo servidor express
app.listen(process.env.PUERTO, () => {
    console.log("Servidor Levantado en puerto --> " + process.env.PUERTO);
})