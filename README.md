# 🛡️ Secure React Development (pnpm + dotenvx)

This project implements a "Defense in Depth" strategy to protect against supply chain attacks and credential leaks using `pnpm` (v11+) and `dotenvx`.

## 🔐 Core Security Pillars

- **Package Release Cooldown (Quarantine):** Prevents the installation of any package version published within the last 24 hours to allow time for the security community to vet them.

- **Execution Prevention:** Automatically blocks unauthorized `postinstall` scripts, which are common vectors for malware.

- **Zero-Knowledge Secrets:** Uses `dotenvx` to encrypt environment variables, allowing them to be safely stored in version control without exposing sensitive data.

---

## 🛠️ Configuration & Setup

### 1. pnpm Security Configuration

Security settings are managed in an `.npmrc` file at your project root.

**File: `.npmrc**`

```ini
# Enforce a 24-hour (1440 minutes) cooldown on new versions
minimumReleaseAge=1440

# Block install scripts by default (Security by Default)
strictDepBuilds=true

# Ensure lockfile stays in sync with the registry
frozen-lockfile=true

# Prevent credential-downgrade attacks
trustPolicy=no-downgrade

```

### 2. Environment Variable Security (`dotenvx`)

`dotenvx` encrypts your `.env` values using a public/private key pair.

- **Install:** `pnpm add @dotenvx/dotenvx`

- **Encrypt:** Run `npx dotenvx encrypt` to encrypt `.env` and generate a `.env.keys` file.

- **IMPORTANT:** Add `.env.keys` to your `.gitignore`. **NEVER commit the private keys file**.

---

## 🚀 Development Workflow

### Installing Dependencies

Run the standard install command; `pnpm` will automatically follow the security rules in `.npmrc`.

```bash
pnpm install

```

### Managing Secrets

- **To add/update a secret:** Update your `.env` file, then run `npx dotenvx encrypt`.

- **Decryption:** Secrets are decrypted into process memory at runtime using the private key in `.env.keys`.

### Scripts

The `package.json` is configured to wrap Vite with `dotenvx` to inject secrets seamlessly.

**File: `package.json**`

```json
{
  "scripts": {
    "dev": "dotenvx run -- vite",
    "build": "dotenvx run -- vite build",
    "preview": "dotenvx run -- vite preview"
  }
}
```

---

## 💻 VS Code Integration

- **dotenvx Extension:** Install the official extension to edit encrypted files directly.

- **Integrated Terminal:** Automatically respects the security rules defined in `.npmrc`.
