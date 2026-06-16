# Database Entities

Common fields on all entities:

- `id: string`
- `createdAt: string`
- `updatedAt: string`

## SystemOwner

- `name: string`

## Authority

- `systemOwnerId: SystemOwnerId`
- `name: string`
- `description: string`

## AuthorityTerminology

- `authorityId: AuthorityId`
- `labels: TerminologyLabels`

## Participant

- `authorityId: AuthorityId`
- `displayName: string`

## Stakeholder

- `authorityId: AuthorityId`
- `displayName: string`

## Agent

- `authorityId: AuthorityId`
- `displayName: string`

## UserAccount

- `entraObjectId: string`
- `email: string`
- `displayName: string`
- `status: UserAccountStatus`

## SystemOwnerUser

- `entityId: SystemOwnerId`
- `userAccountId: UserAccountId`

## AuthorityUser

- `entityId: AuthorityId`
- `userAccountId: UserAccountId`

## ParticipantUser

- `entityId: ParticipantId`
- `userAccountId: UserAccountId`

## StakeholderUser

- `entityId: StakeholderId`
- `userAccountId: UserAccountId`

## AgentUser

- `entityId: AgentId`
- `userAccountId: UserAccountId`

## StakeholderParticipantAccess

- `stakeholderId: StakeholderId`
- `participantId: ParticipantId`
- `approvedByUserId: UserAccountId`
- `approvedAt: string`

## AccessGrant

- `authorityId: AuthorityId`
- `participantId: ParticipantId`
- `granteeType: AccessGrantGranteeType`
- `granteeStakeholderId: StakeholderId | null`
- `granteeAgentId: AgentId | null`
- `granteeUserId: UserAccountId | null`
- `permissionLevel: AccessGrantPermissionLevel`
- `dataScopeType: AccessGrantDataScopeType`
- `dataScopeId: string | null`
- `status: AccessGrantStatus`
- `createdByUserId: UserAccountId`
- `expiresAt: string | null`

## TaskType

- `code: string`
- `name: string`
- `description: string`
- `parameterSchemaJson: JsonObject`
- `status: TaskTypeStatus`

## CaseTemplate

- `authorityId: AuthorityId`
- `name: string`
- `description: string`
- `status: CaseTemplateStatus`

## TemplateTask

- `caseTemplateId: CaseTemplateId`
- `taskTypeId: TaskTypeId`
- `title: string`
- `description: string`
- `parametersJson: JsonObject`
- `sortOrder: number`
- `status: "ACTIVE" | "WITHDRAWN"`
- `withdrawnReason: string | null`
- `withdrawnAt: string | null`
- `withdrawnByUserId: UserAccountId | null`

## CaseTemplateParticipant

- `caseTemplateId: CaseTemplateId`
- `participantId: ParticipantId`
- `caseId: CaseRecordId | null`
- `exemptionReason: string | null`
- `decidedByUserId: UserAccountId | null`
- `decidedAt: string | null`

## Case

- `authorityId: AuthorityId`
- `caseTemplateId: CaseTemplateId`
- `participantId: ParticipantId`
- `participantSupplierId: ParticipantSupplierId | null`
- `status: CaseStatus`
- `submittedAt: string | null`
- `closedAt: string | null`
- `withdrawnAt: string | null`
- `withdrawnByUserId: UserAccountId | null`
- `withdrawnReason: string | null`

## Task

- `caseId: CaseRecordId`
- `templateTaskId: TemplateTaskId`
- `status: TaskStatus`
- `responseJson: JsonObject`
- `evidenceJson: JsonObject`
- `withdrawnAt: string | null`

## StakeholderReview

- `stakeholderId: StakeholderId`
- `caseId: CaseRecordId`
- `note: string`
- `reviewedByUserId: UserAccountId`
- `reviewedAt: string`

## RequestForInformation

- `authorityId: AuthorityId`
- `participantId: ParticipantId`
- `stakeholderId: StakeholderId`
- `caseId: CaseRecordId | null`
- `taskId: TaskId | null`
- `requestText: string`
- `responseText: string`
- `status: RequestForInformationStatus`
- `requestedByUserId: UserAccountId`
- `assignedToUserId: UserAccountId | null`
- `respondedByUserId: UserAccountId | null`
- `requestedAt: string`
- `respondedAt: string | null`
- `statusHistory: Array<{ status: RequestForInformationStatus; at: string; byUserId: UserAccountId; note: string }>`

## ParticipantSupplier

- `authorityId: AuthorityId`
- `participantId: ParticipantId`
- `supplierName: string`
- `relationshipType: string`
- `servicesProvided: string`
- `dataExposure: string`
