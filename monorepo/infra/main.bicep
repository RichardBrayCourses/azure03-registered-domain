@description('The Azure region where the storage account will be created.')
param location string = resourceGroup().location

@description('A short lowercase name used to build the storage account name.')
@minLength(3)
@maxLength(16)
param appName string = 'azure02web'

var storageAccountName = take('${appName}${uniqueString(resourceGroup().id)}', 24)

resource websiteStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: true
  }
}

output storageAccountName string = websiteStorage.name
