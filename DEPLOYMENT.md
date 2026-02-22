# Deploying Silent Shutter

Step-by-step guide to deploy your photography portfolio on **Azure Static Web Apps** (free tier).

---

## Prerequisites

| Tool                                                                 | Why                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| [Node.js 18+](https://nodejs.org)                                    | Already installed — you built the site locally              |
| [Azure account](https://portal.azure.com)                            | Free tier is sufficient — use your monthly credits          |
| [GitHub account](https://github.com)                                 | Hosts the repo; Azure SWA deploys from it automatically     |
| [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) | Optional — you can do everything through the portal instead |

---

## 1. Push to GitHub

```bash
cd ~/silent-shutter
git init
git add .
git commit -m "Initial commit — Silent Shutter photography portfolio"

# Create a repo on GitHub (public or private), then:
git remote add origin https://github.com/<your-username>/silent-shutter.git
git branch -M main
git push -u origin main
```

---

## 2. Create the Azure Static Web App

### Option A — Azure Portal (easiest)

1. Go to [portal.azure.com](https://portal.azure.com) → **Create a resource** → search **Static Web App**
2. Fill in:
   - **Subscription**: your Azure subscription
   - **Resource Group**: create new → `silent-shutter-rg`
   - **Name**: `silent-shutter`
   - **Plan type**: **Free**
   - **Region**: pick the closest to you
   - **Source**: **GitHub**
3. Sign in to GitHub when prompted and select:
   - **Organization**: your GitHub username
   - **Repository**: `silent-shutter`
   - **Branch**: `main`
4. Under **Build Details**:
   - **Build Preset**: `Custom`
   - **App location**: `/`
   - **Output location**: `dist`
   - Leave **API location** empty
5. Click **Review + Create** → **Create**

Azure will automatically:

- Add a GitHub Actions workflow to your repo (you already have one — it may create a duplicate; delete whichever you prefer)
- Add the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret to your GitHub repo
- Trigger the first deployment

### Option B — Azure CLI

```bash
az login
az group create --name silent-shutter-rg --location westus2
az staticwebapp create \
  --name silent-shutter \
  --resource-group silent-shutter-rg \
  --source https://github.com/<your-username>/silent-shutter \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

## 3. Verify Deployment

After the GitHub Action completes (~2 min):

1. Go to your Static Web App in the Azure Portal
2. Copy the **URL** (e.g., `https://orange-sky-12345.azurestaticapps.net`)
3. Open it — your site should be live

Every push to `main` will automatically redeploy.

---

## 4. Custom Domain (optional)

1. In the Azure Portal → your Static Web App → **Custom domains**
2. Click **Add** → enter your domain (e.g., `silentshutter.com`)
3. Add the required DNS records at your registrar:
   - **CNAME** record: `www` → `<your-swa-hostname>.azurestaticapps.net`
   - **TXT** record for verification (Azure will tell you the value)
4. For apex domain (`silentshutter.com` without www): use an **ALIAS/ANAME** record if your registrar supports it, or add a redirect from apex to `www`
5. Azure provisions a free SSL certificate automatically

---

## 5. Replace Placeholder Images with Your Photos

You have two options:

### Option A — Commit images to the repo (simplest)

1. Create a folder: `public/photos/`
2. Add your images organized by category:
   ```
   public/photos/
     hero/main.jpg
     about/photographer.jpg
     landscapes/cover.jpg
     nature/cover.jpg
     street/cover.jpg
     architecture/cover.jpg
     travel/cover.jpg
   ```
3. Update `src/config/images.ts` — change each URL to a relative path:
   ```typescript
   // Change the Unsplash URLs to local paths
   hero: "/photos/hero/main.jpg",
   ```
4. Commit and push — Azure deploys automatically

### Option B — Azure Blob Storage + CDN (recommended for production)

This keeps your repo lightweight and images load from a global CDN.

#### Create a Storage Account

```bash
az storage account create \
  --name silentshutterphotos \
  --resource-group silent-shutter-rg \
  --location westus2 \
  --sku Standard_LRS \
  --kind StorageV2
```

#### Enable static website hosting & create a container

```bash
az storage container create \
  --name photos \
  --account-name silentshutterphotos \
  --public-access blob
```

#### Upload your photos

```bash
az storage blob upload-batch \
  --destination photos \
  --source ./my-photos/ \
  --account-name silentshutterphotos \
  --overwrite
```

Your photos will be available at:
`https://silentshutterphotos.blob.core.windows.net/photos/hero/main.jpg`

#### (Optional) Add Azure CDN for faster global delivery

1. Azure Portal → **Create a resource** → **Front Door and CDN profiles**
2. Create a **Azure CDN** profile (Standard Microsoft tier is free for basic usage)
3. Add an endpoint pointing to your storage account
4. Your CDN URL will look like: `https://silentshutter.azureedge.net/photos/...`

#### Update the code

Open `src/config/images.ts` and set the CDN base URL:

```typescript
const CDN_BASE_URL = "https://silentshutterphotos.blob.core.windows.net/photos";
// or with CDN:
// const CDN_BASE_URL = "https://silentshutter.azureedge.net/photos";
```

Commit and push. Done.

---

## 6. Environment-Specific Configuration

The included `staticwebapp.config.json` handles:

- **SPA routing**: All paths fall back to `index.html`
- **Cache headers**: Static assets cached for 1 year (immutable)
- **MIME types**: Correct content types for fonts and JSON

No additional configuration needed for the free tier.

---

## Quick Reference

| Action                   | Command                                       |
| ------------------------ | --------------------------------------------- |
| Local dev server         | `npm run dev`                                 |
| Production build         | `npm run build`                               |
| Preview production build | `npm run preview`                             |
| Deploy                   | Push to `main` — automatic via GitHub Actions |

---

## Cost

- **Azure Static Web Apps Free tier**: 100 GB bandwidth/month, 2 custom domains, free SSL
- **Azure Blob Storage**: ~$0.02/GB/month for storage, pennies for bandwidth
- **Total for a photography portfolio**: effectively **$0/month** on the free tier
