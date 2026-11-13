import bcrypt from "bcryptjs";

async function gerarHashes() {
    const ana = await bcrypt.hash("senha_exemplo_ana", 10);
    const lucas = await bcrypt.hash("senha_exemplo_lucas", 10);
    const admin = await bcrypt.hash("senha_exemplo_admin", 10);

    console.log("ANA:", ana);
    console.log("LUCAS:", lucas);
    console.log("ADMIN:", admin);
}

gerarHashes();