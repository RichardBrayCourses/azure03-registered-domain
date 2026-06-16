#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

if [ ! -d "$UI_DIST_DIR" ]; then
  echo "Build output not found at $UI_DIST_DIR"
  echo "Run: pnpm run ui:build"
  exit 1
fi

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
echo "Uploading $UI_DIST_DIR to the static website container in $STORAGE_ACCOUNT_NAME"
echo ""

az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT_NAME" \
  --destination '$web' \
  --source "$UI_DIST_DIR" \
  --overwrite true \
  "${STORAGE_AUTH_ARGS[@]}" \
  --output table

echo ""
echo "Upload complete."
echo ""
