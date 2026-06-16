#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"

echo ""
echo "Deleting resource group: $AZURE_RESOURCE_GROUP"
echo ""

az group delete \
  --name "$AZURE_RESOURCE_GROUP" \
  --yes

echo ""
echo "Delete requested."
echo ""
