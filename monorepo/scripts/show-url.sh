#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

STORAGE_ACCOUNT_NAME=$(az deployment group show \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --name "$AZURE_DEPLOYMENT_NAME" \
  --query "properties.outputs.storageAccountName.value" \
  --output tsv)

WEBSITE_URL=$(az storage account show \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --name "$STORAGE_ACCOUNT_NAME" \
  --query "primaryEndpoints.web" \
  --output tsv)

if [[ -z "$WEBSITE_URL" || "$WEBSITE_URL" == "null" ]]; then
  echo ""
  echo "Static website URL was not found for storage account: $STORAGE_ACCOUNT_NAME"
  echo "Run pnpm run infra:deploy first so static website hosting is enabled."
  echo ""
  exit 1
fi

echo ""
echo "Website URL:"
echo "$WEBSITE_URL"
echo ""
