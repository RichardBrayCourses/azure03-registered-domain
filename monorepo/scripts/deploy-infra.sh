#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo ""
echo "Creating resource group: $AZURE_RESOURCE_GROUP"
echo ""

az group create \
  --name "$AZURE_RESOURCE_GROUP" \
  --location "$AZURE_LOCATION" \
  --output table

echo ""
echo "Deploying Bicep template..."
echo ""

az deployment group create \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --name "$AZURE_DEPLOYMENT_NAME" \
  --template-file infra/main.bicep \
  --parameters \
    location="$AZURE_LOCATION" \
    appName="$AZURE_APP_NAME" \
  --output table

STORAGE_ACCOUNT_NAME=$(az deployment group show \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --name "$AZURE_DEPLOYMENT_NAME" \
  --query "properties.outputs.storageAccountName.value" \
  --output tsv)

if [[ "$AZURE_STORAGE_AUTH_MODE" == "key" ]]; then
  STORAGE_ACCOUNT_KEY=$(az storage account keys list \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --query "[0].value" \
    --output tsv)
  STORAGE_AUTH_ARGS=(--account-key "$STORAGE_ACCOUNT_KEY")
else
  STORAGE_AUTH_ARGS=(--auth-mode "$AZURE_STORAGE_AUTH_MODE")
fi

echo ""
echo "Enabling static website hosting on: $STORAGE_ACCOUNT_NAME"
echo ""

az storage blob service-properties update \
  --account-name "$STORAGE_ACCOUNT_NAME" \
  --static-website \
  --index-document index.html \
  --404-document index.html \
  "${STORAGE_AUTH_ARGS[@]}" \
  --output table

echo ""
echo "Infrastructure deployment complete."
echo ""
