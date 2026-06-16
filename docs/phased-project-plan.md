# ALL CHECKS OUT - DEVELOPMENT ROADMAP

## Phase Summary

- **Azure02 - Baseline Repository**  
  Create a clean version of the application that deploys using Azure-generated URLs and contains no custom domain or DNS configuration.

- **Azure03 - Custom Domains**  
  Add support for www.all-checks-out.com, testing.all-checks-out.com, DNS configuration and managed SSL certificates.

- **Azure04 - Entra Authentication**  
  Add Microsoft Entra login, logout, token management and API authorization.

- **Azure05 - Azure SQL**  
  Replace the existing persistence mechanism with Azure SQL, Entity Framework Core and modern ASP.NET Core data access patterns.

- **Azure06 - Document Storage**  
  Store uploaded documents in Azure Blob Storage and manage document metadata in Azure SQL.

- **Azure07 - AI Verification**  
  Analyse and verify uploaded documents using Azure AI services and implement verification workflows.

- **Azure08 - GitHub Actions Deployment**  
  Introduce automated build, test and deployment pipelines using GitHub Actions.

- **Azure09 - Environment Separation**  
  Create independent testing and production environments with separate resources, databases, storage and secrets.

- **Azure10 - Domain Model Review**  
  Review the completed application and identify bounded contexts and candidate service ownership boundaries.

- **Azure11 - Microservices**  
  Split the backend into independently deployable services based on the boundaries identified in Azure10.

- **Azure12 - Microfrontends**  
  Split the frontend into independently deployable applications aligned with backend service ownership.

- **Azure13 - Production Hardening**  
  Add monitoring, logging, alerting, backups, security reviews and operational procedures for long-term production operation.

## Current State

- Azure01 completed
- Single frontend application
- Single backend application
- Azure deployment working
- Public website currently running at www.all-checks-out.com
- No Entra authentication
- No Azure SQL
- No Blob Storage document management
- No AI document verification
- No GitHub Actions deployment pipeline
- No testing environment
- No production environment separation
- No microservices
- No microfrontends

---

# Azure02 - Baseline Repository

## Tasks

- [ ] Create Azure02 repository
- [ ] Remove all custom domain configuration
- [ ] Remove all DNS configuration
- [ ] Remove all SSL certificate configuration related to custom domains
- [ ] Remove all documentation related to domain registration
- [ ] Deploy using Azure-generated URL only
- [ ] Verify clean deployment from a new Azure subscription
- [ ] Verify complete setup can be performed from repository documentation

## Notes

Azure02 becomes the clean baseline project for the Azure course.

---

# Azure03 - Custom Domain Repository

## Tasks

- [ ] Create Azure03 repository from Azure02
- [ ] Purchase or transfer all-checks-out.com domain
- [ ] Configure Azure custom domain support
- [ ] Configure Azure managed certificates
- [ ] Configure DNS records
- [ ] Configure www.all-checks-out.com
- [ ] Configure testing.all-checks-out.com
- [ ] Document complete migration process from Azure02
- [ ] Document DNS changes
- [ ] Document certificate configuration
- [ ] Verify all URLs work correctly

## Notes

Azure03 contains everything required to move from Azure-generated URLs to production domains.

---

# Azure04 - Entra Authentication

## Tasks

- [ ] Create Entra tenant configuration
- [ ] Create application registration
- [ ] Configure frontend login
- [ ] Configure frontend logout
- [ ] Configure access tokens
- [ ] Configure protected API endpoints
- [ ] Add authenticated user profile endpoint
- [ ] Add authorization infrastructure
- [ ] Create user database tables
- [ ] Automatically provision users on first login

## Notes

All future functionality should assume authenticated users.

---

# Azure05 - Azure SQL Migration

## Tasks

- [ ] Create Azure SQL database
- [ ] Create ASP.NET Core data access layer
- [ ] Introduce Entity Framework Core
- [ ] Create migrations project
- [ ] Create database deployment process
- [ ] Replace existing persistence mechanism
- [ ] Implement repository pattern where appropriate
- [ ] Add integration tests
- [ ] Add local SQL development environment

## Notes

Use current ASP.NET Core best practices rather than older controller architectures.

---

# Azure06 - Document Storage

## Tasks

- [ ] Create Blob Storage account
- [ ] Create document container
- [ ] Create upload API
- [ ] Create download API
- [ ] Create delete API
- [ ] Create metadata database tables
- [ ] Store document metadata in SQL
- [ ] Move document storage from local filesystem to Blob Storage
- [ ] Add security and authorization checks
- [ ] Add document versioning strategy

## Notes

Blob Storage becomes the system of record for uploaded documents.

---

# Azure07 - AI Document Verification

## Tasks

- [ ] Evaluate Azure AI services
- [ ] Evaluate Azure AI Document Intelligence
- [ ] Define verification workflow
- [ ] Create document verification service
- [ ] Extract document data
- [ ] Store extracted data
- [ ] Record verification decisions
- [ ] Add manual review workflow
- [ ] Add verification history
- [ ] Add verification audit trail

## Notes

Uploaded documents should be automatically analysed and verified where possible.

---

# Azure08 - GitHub Actions Deployment

## Tasks

- [ ] Create build workflow
- [ ] Create test workflow
- [ ] Create deployment workflow
- [ ] Create testing deployment workflow
- [ ] Create production deployment workflow
- [ ] Configure secrets management
- [ ] Configure environment approvals
- [ ] Configure deployment rollback strategy
- [ ] Document deployment process

## Notes

All deployments should originate from GitHub Actions.

---

# Azure09 - Environment Separation

## Tasks

- [ ] Create testing Azure environment
- [ ] Create production Azure environment
- [ ] Create separate SQL databases
- [ ] Create separate Blob Storage accounts
- [ ] Create separate Entra applications
- [ ] Create separate AI resources
- [ ] Create separate Key Vaults
- [ ] Configure testing.all-checks-out.com
- [ ] Configure production.all-checks-out.com
- [ ] Alias www.all-checks-out.com to production

## Decisions

- Separate Azure subscriptions
- Separate resource groups
- Separate secrets
- Separate databases

---

# Azure10 - Domain Model Review

## Tasks

- [ ] Review existing entity model
- [ ] Identify bounded contexts
- [ ] Identify ownership boundaries
- [ ] Identify reporting requirements
- [ ] Identify document workflows
- [ ] Identify notification workflows
- [ ] Identify external integrations
- [ ] Produce candidate service boundaries

## Notes

Do not split into microservices until core functionality is complete.

---

# Azure11 - Microservices

## Candidate Services

### Identity Service

- Authentication
- Authorization
- User management

### Case Service

- Cases
- Workflows
- Status management

### Participant Service

- Participants
- Relationships
- Contact details

### Document Service

- Uploads
- Metadata
- Blob Storage

### Verification Service

- AI verification
- Manual review
- Verification history

### Notification Service

- Email
- Alerts
- Workflow notifications

### Reporting Service

- Dashboards
- Analytics
- Exports

## Tasks

- [ ] Define service contracts
- [ ] Define database ownership
- [ ] Define event contracts
- [ ] Introduce service-to-service communication
- [ ] Introduce eventing architecture
- [ ] Extract services incrementally

---

# Azure12 - Microfrontends

## Candidate Frontends

### Shell

- Navigation
- Authentication
- Shared layout

### Cases

- Case management

### Participants

- Participant management

### Documents

- Document management

### Administration

- System administration

### Reporting

- Dashboards and reporting

## Tasks

- [ ] Select MFE architecture
- [ ] Create shell application
- [ ] Create shared design system
- [ ] Create shared authentication package
- [ ] Create deployment strategy
- [ ] Create independent build pipelines
- [ ] Extract frontends incrementally

## Notes

Microfrontends should follow service ownership boundaries.

---

# Azure13 - Production Hardening

## Tasks

- [ ] Application Insights
- [ ] Centralized logging
- [ ] Alerting
- [ ] Health checks
- [ ] Backup strategy
- [ ] Disaster recovery plan
- [ ] Security review
- [ ] Penetration testing
- [ ] Cost monitoring
- [ ] Operational runbooks

---

# Deferred Decisions

## Microservices

Do not finalise service boundaries until:

- Entra authentication exists
- Azure SQL exists
- Blob Storage exists
- AI verification exists
- Testing and production environments exist

## Microfrontends

Do not finalise frontend boundaries until:

- Service boundaries are agreed
- Navigation model is understood
- User roles are understood
- Operational ownership is understood
