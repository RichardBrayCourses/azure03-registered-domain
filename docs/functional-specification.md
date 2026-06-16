# All Checks Out - Functional Specification

## Product Summary

All Checks Out is a case management system.

"Authorities" design reusable "case templates" made up of ordered "tasks",

They then assign "cases" based on these case templates to "participants".

Participants complete the generated cases by completing each task, uploading "evidence" metadata where needed, and submitting the case when all active tasks are submitted.

Participants may invite "agents" to login and complete work on their behalf.

Participants may also invite "stakeholders" to observe case progress, review submitted task outcomes, add review notes, and request further information.

## Business Model

The business model is documented separately and is not repeated in this functional specification.

## Configurable Terminology

- The product should use generic internal concepts.
- Each authority should be able to configure the labels shown in the UI.
- The configured labels should display:

| Internal concept        | Display label           |
| ----------------------- | ----------------------- |
| Authority               | Authority               |
| Participant             | Participant             |
| Stakeholder             | Stakeholder             |
| Agent                   | Agent                   |
| Case template           | Case template           |
| Case                    | Case                    |
| Task                    | Task                    |
| Participant supplier    | Participant supplier    |
| Evidence                | Evidence                |
| Access grant            | Access grant            |
| Request for information | Request for information |

- UI labels are read from the active authority where practical.
- Business rules use the generic concepts.
- Terminology is stored per authority in `AuthorityTerminology.labels`.

## Core Business Objects

- `SystemOwner` stores the platform owner name and entity status.
- `Authority` stores the system owner, name, description, and entity status.
- `AuthorityTerminology` stores singular and plural labels for configurable internal concepts.
- `Participant` stores the authority and display name.
- `Stakeholder` stores the authority and display name.
- `Agent` stores the authority and display name.
- `UserAccount` stores the Entra object id, email, display name, user kind, and account status.
- `AuthorityUser`, `ParticipantUser`, `StakeholderUser`, and `AgentUser` connect a user account to an entity.
- `StakeholderParticipantAccess` records an approved stakeholder-to-participant access relationship.
- `AccessGrant` records participant-controlled access for a stakeholder, agent, user, or authority target, including permission level, data scope, status, creator, and expiry.
- `TaskType` defines a reusable task capability with a code, name, description, parameter schema, and status.
- `CaseTemplate` stores an authority-owned reusable case definition with draft or finalized status.
- `TemplateTask` stores the ordered task configuration inside a case template, including task type, title, description, parameters, sort order, active or withdrawn status, and withdrawal metadata.
- `CaseTemplateParticipant` records assignment of a finalized case template to a participant and links to the generated case.
- `Case` stores the participant-specific instance of a case template, including status, submitted and closed dates, optional participant supplier link, and withdrawal metadata.
- `Task` stores the participant-specific instance of a template task, including response JSON, evidence JSON, status, and withdrawal date.
- `StakeholderReview` stores a stakeholder's review note, reviewer, and review date for a case.
- `RequestForInformation` stores a stakeholder request and participant or agent response, including scope, status, assigned/responding users, timestamps, and status history.
- `ParticipantSupplier` stores a participant-owned supplier record, including relationship type, services provided, and data exposure.

## Status And Access Values

- User account status: `ACTIVE`, `DISABLED`.
- Access grant status: `INVITED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`.
- Access grant grantee type: `STAKEHOLDER`, `AGENT`, `USER`, `AUTHORITY`.
- Access grant permission level: `READ_ONLY`, `REQUEST_INFORMATION`, `REVIEW_AND_COMMENT`, `CREATE_AND_EDIT`, `ADMINISTER_GRANTS`.
- Access grant data scope type: `PARTICIPANT`, `CASE`, `TASK`, `EVIDENCE_METADATA`, `PARTICIPANT_SUPPLIER`.
- Task type status: `ACTIVE`, `DEPRECATED`.
- Case template status: `DRAFT`, `FINALIZED`.
- Case status: `INCOMPLETE`, `COMPLETE`, `WITHDRAWN`.
- Task status: `NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, `PASSED`, `FAILED`, `WITHDRAWN`.
- Request for information status: `OPEN`, `IN_PROGRESS`, `ANSWERED`, `ACCEPTED`, `WITHDRAWN`.

## Task Types

Task types are the reference catalogue of available task definitions. They are not separate tasks; they describe the kind of task that can be added to a case template.

The system includes these built-in task types:

| Code                        | Name                          | Purpose                                                                            |
| --------------------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| `POLICY_DOCUMENT`           | Policy document upload        | Upload a controlled policy, plan, or governance document.                          |
| `CERTIFICATION_EVIDENCE`    | Certification evidence        | Upload certification or equivalent assurance evidence.                             |
| `QUESTIONNAIRE`             | Questionnaire                 | Answer structured case questions.                                                  |
| `CONTROL_ATTESTATION`       | Control attestation           | Confirm that a required control exists and is operating.                           |
| `SUPPLIER_REGISTER`         | Supplier register             | List subprocessors, hosting providers, support tools, and critical suppliers.      |
| `PARTICIPANT_SUPPLIER_CASE` | Participant supplier case     | Record a case on a critical supplier or participant supplier.                      |
| `RISK_REGISTER`             | Risk and remediation register | Record issues, owners, mitigation dates, and residual risk.                        |
| `UPLOAD_DOCUMENT`           | Evidence metadata upload      | Record uploaded evidence metadata.                                                 |
| `DIGITAL_SIGNATURE`         | Digital signature             | Capture a senior officer attestation.                                              |
| `AI_USAGE_DISCLOSURE`       | AI usage disclosure           | Declare whether AI services process customer data and how they are controlled.     |
| `ACCESS_CONTROL_MFA`        | Access control and MFA        | Confirm MFA, privileged access, and joiner/mover/leaver controls.                  |
| `HOSTING_RESIDENCY`         | Hosting and data residency    | Document hosting provider, regions, backup locations, and customer-data residency. |

Case templates are built by adding task types with a task title, task description, sort order, status, and parameters. The implemented task parameter used by the UI is `due`.

## Sign In And Context

Users sign in by selecting an account type, an organisation or account entity, and an active user account attached to that entity. The active account context determines the available navigation, data scope, and actions. The four logged-on user types are Authority, Participant, Stakeholder, and Agent.

The system routes each context to its default page:

- Authority users go to Authority Administration.
- Participant users go to Cases.
- Stakeholder users go to the Stakeholder Portal.
- Agent users go to Cases scoped by active agent access grants.

## Authority User Stories

### Data Stored About The User

An authority user has a `UserAccount` containing `entraObjectId`, `email`, `displayName`, and `status`. The authority membership is stored in `AuthorityUser` with `entityId` and `userAccountId`.

Access status values for this user type:

- User account status: `ACTIVE`, `DISABLED`.

### Stories

- As an authority user, I start in Authority Administration and work with the participants, stakeholders, case templates, task types, users, and terminology that belong to my active authority.
- As an authority user, I create participant records with a display name and initial participant user.
- As an authority user, I create stakeholder records and add stakeholder users.
- As an authority user, I create authority users.
- As an authority user, I view task types as a reference list.
- As an authority user, I create case templates as drafts with a name and description.
- As an authority user, I add ordered template tasks to draft templates by selecting a task type, entering a title, entering a due value, and entering a description.
- As an authority user, I withdraw draft template tasks before finalization.
- As an authority user, I finalize a case template so it can no longer be edited.
- As an authority user, I assign finalized case templates to participants. The system creates one case and one task for each active template task.
- As an authority user, I withdraw assigned cases with a withdrawal reason and reinstate withdrawn cases.
- As an authority user, I delete a case template only when it has no participant assignments.
- As an authority user, I update authority terminology labels.

## Participant User Stories

### Data Stored About The User

A participant user has a `UserAccount` containing `entraObjectId`, `email`, `displayName`, and `status`. The participant membership is stored in `ParticipantUser` with `entityId` and `userAccountId`.

Access status values for this user type:

- User account status: `ACTIVE`, `DISABLED`.
- Access grant status controlled by the participant: `INVITED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`.
- Access grant permission levels available when granting access: `READ_ONLY`, `REQUEST_INFORMATION`, `REVIEW_AND_COMMENT`, `CREATE_AND_EDIT`, `ADMINISTER_GRANTS`.

### Stories

- As a participant user, I start in Cases and see the cases owned by my participant account.
- As a participant user, I open a case to see its status, progress, linked participant supplier, stakeholder requests, and tasks.
- As a participant user, I open a task, enter or update the response summary, and save it. The task moves to `IN_PROGRESS`.
- As a participant user, I record evidence metadata for a task. Evidence metadata is stored in `Task.evidenceJson`.
- As a participant user, I submit a task. The task moves to `SUBMITTED`.
- As a participant user, I submit a case only after every active task is no longer `NOT_STARTED` or `IN_PROGRESS`. The case moves to `COMPLETE` and records submitted and closed timestamps.
- As a participant user, I respond to requests for information for my participant account. I can save a response as `IN_PROGRESS` or `ANSWERED`.
- As a participant user, I create participant supplier records with supplier name, relationship type, services provided, and data exposure.
- As a participant user, I link one participant supplier record to one case and unlink it later if needed.
- As a participant user, I create participant users.
- As a participant user, I create agent records, add agent users, and assign agent users to agent organisations.
- As a participant user, I create access grants for stakeholders, agents, specific users, or authority grantees.
- As a participant user, I set each access grant's permission level, data scope, status, and optional expiry.
- As a participant user, I update an access grant status to `ACTIVE`, `SUSPENDED`, `REVOKED`, or `EXPIRED`.

## Stakeholder User Stories

### Data Stored About The User

A stakeholder user has a `UserAccount` containing `entraObjectId`, `email`, `displayName`, and `status`. The stakeholder membership is stored in `StakeholderUser` with `entityId` and `userAccountId`.

Access status values for this user type:

- User account status: `ACTIVE`, `DISABLED`.
- Access grant status: `INVITED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`.
- Access grant permission levels: `READ_ONLY`, `REQUEST_INFORMATION`, `REVIEW_AND_COMMENT`, `CREATE_AND_EDIT`, `ADMINISTER_GRANTS`.

### Stories

- As a stakeholder user, I start in the Stakeholder Portal and see only participants, cases, tasks, evidence metadata, and participant suppliers made visible by active access grants.
- As a stakeholder user, I open a participant page to see visible cases, visible participant suppliers, and task progress.
- As a stakeholder user, I open a case page to review submitted task outcomes and visible evidence metadata.
- As a stakeholder user, I save a stakeholder review note for a case.
- As a stakeholder user, I create a request for information against a whole case or a specific task when my active grant is not `READ_ONLY`.
- As a stakeholder user, I track request status and participant responses.
- As a stakeholder user, I mark a request for information as `ACCEPTED` or `WITHDRAWN`.
- As a stakeholder user, I cannot see participant data outside my active grant scope.

## Agent User Stories

### Data Stored About The User

An agent user has a `UserAccount` containing `entraObjectId`, `email`, `displayName`, and `status`. The agent membership is stored in `AgentUser` with `entityId` and `userAccountId`.

Access status values for this user type:

- User account status: `ACTIVE`, `DISABLED`.
- Access grant status: `INVITED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `EXPIRED`.
- Access grant permission levels: `READ_ONLY`, `REQUEST_INFORMATION`, `REVIEW_AND_COMMENT`, `CREATE_AND_EDIT`, `ADMINISTER_GRANTS`.

### Stories

- As an agent user, I start in Cases and see only participants covered by active agent access grants.
- As an agent user, I see assigned cases, participant suppliers, open requests, permission level, and scope for granted participants.
- As an agent user, I open granted cases and tasks inside my access scope.
- As an agent user with `CREATE_AND_EDIT` or `ADMINISTER_GRANTS`, I update task responses, record evidence metadata, submit tasks, and submit cases for granted participants.
- As an agent user with `CREATE_AND_EDIT` or `ADMINISTER_GRANTS`, I respond to requests for information for granted participants.
- As an agent user without edit permission, I can review granted information but cannot update task responses, evidence metadata, case status, or request responses.
- As an agent user, I cannot open participants, cases, tasks, or participant suppliers outside my active grant scope.
- As an agent user, I do not see the participant Access grants screen.

## Case Template Behaviour

- Draft case templates can be edited.
- Finalized case templates cannot be edited.
- Participants can be assigned only to finalized case templates.
- A participant cannot be assigned to the same case template twice.
- A participant must belong to the same authority as the case template.
- Assigning a participant creates a case and one task for each active template task.
- Deleting a case template is blocked if any participant assignment exists.

## Case And Task Behaviour

- Completing a task stores response JSON and changes the task to `IN_PROGRESS`.
- Uploading evidence metadata stores evidence JSON and changes a `NOT_STARTED` task to `IN_PROGRESS`.
- Submitting a task changes the task to `SUBMITTED`.
- Reviewing a task changes it to `PASSED` or `FAILED`.
- `SUBMITTED` and `PASSED` tasks count as complete in the UI.
- `FAILED` tasks require attention in the UI.
- A withdrawn task cannot be completed, receive evidence metadata, be submitted, or be reviewed.
- A case cannot be submitted while any active task is `NOT_STARTED` or `IN_PROGRESS`.
- Submitting a case changes it to `COMPLETE` and records submitted and closed timestamps.
- A withdrawn case cannot be completed.
- Reinstating a withdrawn case clears withdrawal metadata and recalculates status from its tasks.

## Access Grant Behaviour

- Access grants belong to one authority and one participant.
- The participant in an access grant must belong to the selected authority.
- Stakeholder and agent grantees must belong to the selected authority.
- Participant supplier grant scope must belong to the granting participant.
- Duplicate non-revoked grants for the same participant, grantee, data scope type, and data scope id are blocked.
- Only `ACTIVE` grants provide visibility or agent access.
- Active stakeholder grants determine the participants and cases visible in the Stakeholder Portal.
- Active agent grants determine the participants visible to agents.

## Request For Information Behaviour

- Stakeholders can create requests for information against visible cases or tasks when they have an active grant with a permission level other than `READ_ONLY`.
- Requests start as `OPEN`.
- Participant users can respond to requests for their participant account.
- Agent users can respond only when an active agent grant gives `CREATE_AND_EDIT` or `ADMINISTER_GRANTS`.
- A response requires response text.
- Responses can move a request to `IN_PROGRESS` or `ANSWERED`.
- Stakeholders can move a request to `ACCEPTED` or `WITHDRAWN`.
- Request status changes append to `statusHistory`.

## Participant Supplier Behaviour

- Participant suppliers are owned by a participant inside an authority.
- A participant supplier can be linked to a case only when both records belong to the same participant and authority.
- A participant supplier can be linked to only one case at a time.
- Access grant scope can expose participant supplier records to stakeholders or agents.
