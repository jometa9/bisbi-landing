import { exec } from "node:child_process";
import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { promisify } from "node:util";

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI() {
  try {
    await execAsync("stripe --version");

      try {
        await execAsync("stripe config --list");
      } catch {
        const answer = await question(
        "Have you completed the authentication? (y/n): "
      );
      if (answer.toLowerCase() !== "y") {
        process.exit(1);
      }

      try {
        await execAsync("stripe config --list");
      } catch {
        process.exit(1);
      }
    }
  } catch {
    process.exit(1);
  }
}

async function getPostgresURL(): Promise<string> {
  const dbChoice = await question(
    "Do you want to use a local Postgres instance with Docker (L) or a remote Postgres instance (R)? (L/R): "
  );

  if (dbChoice.toLowerCase() === "l") {
    await setupLocalPostgres();
    return process.env.POSTGRES_URL!;
  } else {
    return await question("Enter your POSTGRES_URL: ");
  }
}

async function setupLocalPostgres() {
  try {
    await execAsync("docker --version");
  } catch {
    process.exit(1);
  }

  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(
    path.join(process.cwd(), "docker-compose.yml"),
    dockerComposeContent
  );

  try {
    await execAsync("docker compose up -d");
  } catch {
    process.exit(1);
  }
}

async function getStripeSecretKey(): Promise<string> {
  return await question("Enter your Stripe Secret Key: ");
}

function generateAuthSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function writeEnvFile(envVars: Record<string, string>) {
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), envContent);
}

async function main() {
  await checkStripeCLI();

  const POSTGRES_URL = await getPostgresURL();
  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  const AUTH_SECRET = generateAuthSecret();
  const BASE_URL = "http://localhost:3000";

  await writeEnvFile({
    POSTGRES_URL,
    STRIPE_SECRET_KEY,
    BASE_URL,
    AUTH_SECRET,
  });

  try {
    const { migrateAppSettings } = await import(
      "./migrations/add_app_settings_table"
    );
    await migrateAppSettings();
  } catch (error) {
    console.error("Error running app settings migration:", error);
  }
}

main().catch(console.error);
