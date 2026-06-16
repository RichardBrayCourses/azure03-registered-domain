import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConsoleLayout, MetricStrip, PageTitle } from "@/components/ConsoleLayout";
import ResourceActionPanel from "@/components/ResourceActionPanel";
import { useAuth } from "@/context/AuthContext";
import { useDomainData } from "@/context/DomainDataContext";
import {
  adminResources,
  authenticatableUsers,
  getCase,
  getTask,
  getStakeholder,
  getParticipant,
  getCaseTemplate,
  getCaseTemplateParticipants,
  getTemplateTasks,
  getCaseTemplatesForAuthority,
  getAccessGrantsForParticipant,
  getAuthorityTerminology,
  getAgent,
  getAgentsForAuthority,
  getGrantableAgentsForParticipant,
  getGrantableStakeholdersForParticipant,
  getAgentParticipantAccessViews,
  getHelperGrantForParticipant,
  getRequestsForCase,
  getRequestsForParticipant,
  getRequestsForTask,
  getStakeholderReviewForCase,
  getScopedCases,
  getScopedParticipants,
  getScopedParticipantSuppliers,
  getStakeholdersForAuthority,
  getTerminologyForUser,
  getParticipantSuppliersForParticipant,
  grantAllowsHelperEdit,
  AccessGrantPermissionLevel,
  AccessGrantStatus,
  AccessGrantDataScopeType,
  AccessGrantGranteeType,
  RequestForInformationStatus,
  Status,
  taskTypeTitle,
  terminologyLabel,
  terminologyTitle,
  TerminologyKey,
  taskTypes,
} from "@/data/console";
import { defaultTerminologyLabels } from "@/data/console";
import type { Task } from "@/data/console";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock3,
  History,
  MessageSquarePlus,
  Pencil,
  Plus,
  Save,
  SendHorizontal,
  Trash2,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

function StatusBadge({ status }: { status: Status | "open" | "closed" | "review" }) {
  const classes = {
    complete: "bg-[#00703c] text-white",
    "in-progress": "bg-[#1d70b8] text-white",
    attention: "bg-[#d4351c] text-white",
    "not-started": "bg-[#f3f2f1] text-[#0b0c0c] ring-1 ring-[#b1b4b6]",
    withdrawn: "bg-[#505a5f] text-white",
    open: "bg-[#1d70b8] text-white",
    closed: "bg-[#00703c] text-white",
    review: "bg-[#ffdd00] text-[#0b0c0c]",
  };

  const label = status.replace("-", " ");
  return (
    <span className={cn("inline-flex rounded-sm px-2 py-1 text-xs font-bold uppercase", classes[status])}>
      {label}
    </span>
  );
}

function GrantStatusBadge({ status }: { status: AccessGrantStatus }) {
  const classes: Record<AccessGrantStatus, string> = {
    INVITED: "bg-[#ffdd00] text-[#0b0c0c]",
    ACTIVE: "bg-[#00703c] text-white",
    SUSPENDED: "bg-[#505a5f] text-white",
    REVOKED: "bg-[#d4351c] text-white",
    EXPIRED: "bg-[#f3f2f1] text-[#0b0c0c] ring-1 ring-[#b1b4b6]",
  };

  return (
    <span className={cn("inline-flex rounded-sm px-2 py-1 text-xs font-bold uppercase", classes[status])}>
      {status.replace("_", " ").toLowerCase()}
    </span>
  );
}

function RequestStatusBadge({ status }: { status: RequestForInformationStatus }) {
  const classes: Record<RequestForInformationStatus, string> = {
    OPEN: "bg-[#1d70b8] text-white",
    IN_PROGRESS: "bg-[#ffdd00] text-[#0b0c0c]",
    ANSWERED: "bg-[#00703c] text-white",
    ACCEPTED: "bg-[#005a30] text-white",
    WITHDRAWN: "bg-[#505a5f] text-white",
  };

  return (
    <span className={cn("inline-flex rounded-sm px-2 py-1 text-xs font-bold uppercase", classes[status])}>
      {status.replace("_", " ").toLowerCase()}
    </span>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold text-[#505a5f] dark:text-muted-foreground">
        <span>{value} of {total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-[#b1b4b6]">
        <div className="h-2 bg-[#00703c]" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ResourceTable({
  children,
  columnWidths,
  headings,
}: {
  columnWidths?: string[];
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden border border-[#b1b4b6] bg-white dark:bg-card">
      <div className="overflow-x-auto">
        <table className={cn("w-full min-w-[760px] border-collapse text-left text-sm", columnWidths && "table-fixed")}>
          {columnWidths && (
            <colgroup>
              {columnWidths.map((width, index) => (
                <col key={`${width}-${index}`} className={width} />
              ))}
            </colgroup>
          )}
          <thead className="bg-[#f3f2f1] text-[#0b0c0c] dark:bg-accent dark:text-foreground">
            <tr>
              {headings.map((heading) => (
                <th key={heading} className="h-12 border-b border-[#b1b4b6] px-4 py-3 font-bold leading-5 align-middle">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-bold text-[#0b0c0c] dark:text-white">{label}</span>
      {children}
    </label>
  );
}

function SelectField({
  children,
  disabled = false,
  value,
  onChange,
}: {
  children: ReactNode;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      className="h-9 w-full border border-input bg-white px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50 dark:bg-input/30"
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm font-bold text-[#d4351c]">{message}</p>;
}

function titleCaseForPage(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function stakeholderCanSeeEvidence(task: Task) {
  return task.domainStatus === "SUBMITTED" || task.domainStatus === "PASSED" || task.domainStatus === "FAILED";
}

function EvidenceMetadataList({ task }: { task: Task }) {
  const { user } = useAuth();
  const terminology = getTerminologyForUser(user);

  if (!stakeholderCanSeeEvidence(task)) {
    return <span className="text-sm text-[#505a5f] dark:text-muted-foreground">Visible after submission</span>;
  }

  if (task.evidenceFiles.length === 0) {
    return <span className="text-sm text-[#505a5f] dark:text-muted-foreground">No {terminologyLabel(terminology, "evidence")} metadata</span>;
  }

  return (
    <ul className="grid gap-1 text-sm">
      {task.evidenceFiles.map((file) => (
        <li key={`${task.id}-${file.name}-${file.uploadedAt}`}>
          <span className="font-bold text-[#1d70b8]">{file.name}</span>
          <span className="block text-xs text-[#505a5f] dark:text-muted-foreground">
            {file.size} · {new Date(file.uploadedAt).toLocaleString("en-GB")}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AdministrationResourceNav({ actions }: { actions?: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const terminology = getAuthorityTerminology(user.authorityId ?? undefined);

  function resourceName(resource: (typeof adminResources)[number]) {
    if (resource.path === "/admin/participants") return terminologyTitle(terminology, "participant", true);
    if (resource.path === "/admin/stakeholders") return terminologyTitle(terminology, "stakeholder", true);
    if (resource.path === "/admin/case-templates") return terminologyTitle(terminology, "caseTemplate", true);
    if (resource.path === "/admin/task-types") return taskTypeTitle(terminology, true);
    return resource.name;
  }

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-[#b1b4b6] md:flex-row md:items-end md:justify-between">
      <nav aria-label="Administration resources" className="min-w-0">
        <div className="flex gap-1 overflow-x-auto">
          {adminResources.map((resource) => {
            const isCurrent =
              location.pathname === resource.path ||
              (resource.path !== "/admin" && location.pathname.startsWith(`${resource.path}/`));
            return (
              <Button
                key={resource.path}
                asChild
                variant="ghost"
                className={cn(
                  "h-11 rounded-none border-b-4 border-transparent px-4 font-bold",
                  isCurrent && "border-[#1d70b8] bg-white dark:bg-card",
                )}
              >
                <Link to={resource.path}>{resourceName(resource)}</Link>
              </Button>
            );
          })}
        </div>
      </nav>
      {actions && <div className="flex shrink-0 flex-wrap gap-2 pb-2">{actions}</div>}
    </div>
  );
}

function ParticipantNav({ actions }: { actions?: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const terminology = getTerminologyForUser(user);
  const resources = [
    { name: terminologyTitle(terminology, "case", true), path: "/cases" },
    { name: terminologyTitle(terminology, "participantSupplier", true), path: "/cases/suppliers" },
    ...(user.role === "participant"
      ? [
          { name: terminologyTitle(terminology, "accessGrant", true), path: "/cases/access-grants" },
          { name: "Users", path: "/cases/users" },
        ]
      : []),
  ];

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-[#b1b4b6] md:flex-row md:items-end md:justify-between">
      <nav aria-label="Participant navigation" className="min-w-0">
        <div className="flex gap-1 overflow-x-auto">
          {resources.map((resource) => {
            const isCurrent = location.pathname === resource.path;
            return (
              <Button
                key={resource.path}
                asChild
                variant="ghost"
                className={cn(
                  "h-11 rounded-none border-b-4 border-transparent px-4 font-bold",
                  isCurrent && "border-[#1d70b8] bg-white dark:bg-card",
                )}
              >
                <Link to={resource.path}>{resource.name}</Link>
              </Button>
            );
          })}
        </div>
      </nav>
      {actions && <div className="flex shrink-0 flex-wrap gap-2 pb-2">{actions}</div>}
    </div>
  );
}

type UserManagementTab = "participants" | "agents" | "agent-organizations";

export function AgentParticipantAccessPage() {
  const { user } = useAuth();
  if (user.role !== "agent") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const agentTitle = terminologyTitle(terminology, "agent");
  const accessViews = getAgentParticipantAccessViews(user);
  const scopedCases = getScopedCases(user);
  const scopedParticipantSuppliers = getScopedParticipantSuppliers(user);
  const editableAccessViews = accessViews.filter((accessView) => accessView.canEdit).length;

  return (
    <ConsoleLayout
      breadcrumbs={[{ label: `${agentTitle} access` }]}
      readOnly
    >
      <PageTitle
        title="Client access"
      />
      <MetricStrip
        items={[
          { label: `Client ${terminologyLabel(terminology, "participant", true)}`, value: String(accessViews.length), tone: "blue" },
          { label: `Assigned ${terminologyLabel(terminology, "case", true)}`, value: String(scopedCases.length), tone: "blue" },
          { label: terminologyTitle(terminology, "participantSupplier", true), value: String(scopedParticipantSuppliers.length), tone: "yellow" },
          { label: "Editable access", value: String(editableAccessViews), tone: "green" },
        ]}
      />
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Granted {terminologyLabel(terminology, "participant")} access</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "participant"), "Permission", "Scope", terminologyTitle(terminology, "case", true), "Open requests", "Actions"]}>
          {accessViews.map((accessView) => (
            <tr key={accessView.grant.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <Link className="font-bold text-[#1d70b8] hover:underline" to={`/agent/participants/${accessView.participant.id}`}>
                  {accessView.participant.name}
                </Link>
                <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                  Access granted by {terminologyLabel(terminology, "participant")}
                </span>
              </td>
              <td className="px-4 py-3">{accessView.grant.permissionLabel}</td>
              <td className="px-4 py-3">{accessView.grant.scopeLabel}</td>
              <td className="px-4 py-3">{accessView.cases.length}</td>
              <td className="px-4 py-3">{accessView.openRequests}</td>
              <td className="px-4 py-3">
                <Button asChild variant="outline">
                  <Link to={`/agent/participants/${accessView.participant.id}`}>Open {terminologyLabel(terminology, "participant")}</Link>
                </Button>
              </td>
            </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "participantSupplier", true)}</h3>
        <ResourceTable headings={[`Client ${terminologyLabel(terminology, "participant")}`, terminologyTitle(terminology, "participantSupplier"), `Linked ${terminologyLabel(terminology, "case", true)}`]}>
          {accessViews.flatMap((accessView) =>
            accessView.participantSuppliers.map((relationship) => (
              <tr key={`${accessView.grant.id}-${relationship.id}`} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">{accessView.participant.name}</td>
                <td className="px-4 py-3">
                  <span className="block font-bold text-[#1d70b8]">{relationship.supplierName}</span>
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                    {relationship.relationshipType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {relationship.linkedCases.length > 0
                    ? relationship.linkedCases.map((caseRecord) => (
                        <Link key={caseRecord.id} className="block font-bold text-[#1d70b8] hover:underline" to={`/cases/${caseRecord.id}`}>
                          {caseRecord.title}
                        </Link>
                      ))
                    : `No ${terminologyLabel(terminology, "case")} linked`}
                </td>
              </tr>
            )),
          )}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Assigned {terminologyLabel(terminology, "case", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "participant"), terminologyTitle(terminology, "case"), "Status", "Progress", "Permission"]}>
          {accessViews.flatMap((accessView) =>
            accessView.cases.map((caseRecord) => (
              <tr key={`${accessView.grant.id}-${caseRecord.id}`} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">{accessView.participant.name}</td>
                <td className="px-4 py-3">
                  <Link className="font-bold text-[#1d70b8] hover:underline" to={`/cases/${caseRecord.id}`}>
                    {caseRecord.title}
                  </Link>
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                    {caseRecord.reference}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={caseRecord.status} /></td>
                <td className="px-4 py-3"><ProgressBar value={caseRecord.completedTasks} total={caseRecord.totalTasks} /></td>
                <td className="px-4 py-3">{accessView.canEdit ? "Can assist with edits" : "Review only"}</td>
              </tr>
            )),
          )}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function HelperParticipantPage() {
  const { user } = useAuth();
  const { participantId } = useParams();
  if (user.role !== "agent") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const agentTitle = terminologyTitle(terminology, "agent");
  const accessView = getAgentParticipantAccessViews(user).find((item) => item.participant.id === participantId);
  if (!accessView) return <Navigate to="/agent" replace />;
  const requests = getRequestsForParticipant(accessView.participant.id, user);
  const activeRequests = requests.filter((request) => request.status === "OPEN" || request.status === "IN_PROGRESS");

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: `${agentTitle} access`, path: "/agent" },
        { label: accessView.participant.name },
      ]}
      readOnly
    >
      <PageTitle
        title={accessView.participant.name}
      />
      <MetricStrip
        items={[
          { label: "Permission", value: accessView.grant.permissionLabel, tone: accessView.canEdit ? "green" : "yellow" },
          { label: "Scope", value: accessView.grant.scopeLabel, tone: "blue" },
          { label: terminologyTitle(terminology, "case", true), value: String(accessView.cases.length), tone: "blue" },
          { label: terminologyTitle(terminology, "participantSupplier", true), value: String(accessView.participantSuppliers.length), tone: "yellow" },
          { label: "Open requests", value: String(activeRequests.length), tone: activeRequests.length > 0 ? "red" : "green" },
        ]}
      />
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Assigned {terminologyLabel(terminology, "case", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "case"), "Status", "Progress", "Risk", "Last activity"]}>
          {accessView.cases.map((caseRecord) => (
            <tr key={caseRecord.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <Link className="font-bold text-[#1d70b8] hover:underline" to={`/cases/${caseRecord.id}`}>
                  {caseRecord.title}
                </Link>
                <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                  {caseRecord.caseType}
                </span>
              </td>
              <td className="px-4 py-3"><StatusBadge status={caseRecord.status} /></td>
              <td className="px-4 py-3"><ProgressBar value={caseRecord.completedTasks} total={caseRecord.totalTasks} /></td>
              <td className="px-4 py-3 capitalize">{caseRecord.risk}</td>
              <td className="px-4 py-3">{caseRecord.lastActivity}</td>
            </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "participantSupplier", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "participantSupplier"), "Relationship", "Data exposure", `Linked ${terminologyLabel(terminology, "case", true)}`]}>
          {accessView.participantSuppliers.map((relationship) => (
            <tr key={relationship.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <span className="block font-bold text-[#1d70b8]">{relationship.supplierName}</span>
              </td>
              <td className="px-4 py-3">{relationship.relationshipType}</td>
              <td className="px-4 py-3">{relationship.dataExposure}</td>
              <td className="px-4 py-3">
                {relationship.linkedCases.length > 0
                  ? relationship.linkedCases.map((caseRecord) => (
                      <Link key={caseRecord.id} className="block font-bold text-[#1d70b8] hover:underline" to={`/cases/${caseRecord.id}`}>
                        {caseRecord.title}
                      </Link>
                    ))
                  : `No ${terminologyLabel(terminology, "case")} linked`}
              </td>
            </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Requests you can assist with</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "stakeholder"), "Scope", "Status", "Request", "Response"]}>
          {requests.map((request) => (
            <tr key={request.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">{request.stakeholderName}</td>
              <td className="px-4 py-3">
                {request.caseId ? (
                  <Link className="font-bold text-[#1d70b8] hover:underline" to={`/cases/${request.caseId}`}>
                    {request.scopeLabel}
                  </Link>
                ) : (
                  request.scopeLabel
                )}
              </td>
              <td className="px-4 py-3"><RequestStatusBadge status={request.status} /></td>
              <td className="px-4 py-3">{request.requestText}</td>
              <td className="px-4 py-3">{request.responseText || "No response yet"}</td>
            </tr>
          ))}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function StakeholderPortalPage() {
  const { user } = useAuth();
  if (user.role !== "stakeholder") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const scopedParticipants = getScopedParticipants(user);
  const scopedCases = getScopedCases(user);
  const scopedParticipantSuppliers = getScopedParticipantSuppliers(user);
  const reviewSummaries = scopedCases.map((caseRecord) => getStakeholderReviewForCase(user, caseRecord.id));
  const totalTasks = scopedCases.reduce((sum, caseRecord) => sum + caseRecord.totalTasks, 0);
  const completedTasks = scopedCases.reduce((sum, caseRecord) => sum + caseRecord.completedTasks, 0);

  return (
    <ConsoleLayout
      breadcrumbs={[{ label: `${terminologyTitle(terminology, "stakeholder")} Portal` }]}
      readOnly
    >
      <PageTitle
        title={`Granted ${terminologyLabel(terminology, "participant")} ${terminologyLabel(terminology, "case", true)}`}
      />
      <MetricStrip
        items={[
          { label: `Granted ${terminologyLabel(terminology, "participant", true)}`, value: String(scopedParticipants.length), tone: "blue" },
          { label: `Visible ${terminologyLabel(terminology, "case", true)}`, value: String(scopedCases.length), tone: "blue" },
          { label: terminologyTitle(terminology, "participantSupplier", true), value: String(scopedParticipantSuppliers.length), tone: "yellow" },
          { label: `${terminologyTitle(terminology, "stakeholder")} reviews`, value: String(reviewSummaries.filter(Boolean).length), tone: "green" },
        ]}
      />
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Visible {terminologyLabel(terminology, "case")} status</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "participant"), `Visible ${terminologyLabel(terminology, "case")}`, `${terminologyTitle(terminology, "participant")} status`, "Progress"]}>
          {scopedParticipants.map((participant) => {
            const visibleCase = scopedCases.find((caseRecord) => caseRecord.participantId === participant.id);
            const visibleCasesForParticipant = scopedCases.filter((caseRecord) => caseRecord.participantId === participant.id);
            const visibleCompletedTasks = visibleCasesForParticipant.reduce((sum, caseRecord) => sum + caseRecord.completedTasks, 0);
            const visibleTotalTasks = visibleCasesForParticipant.reduce((sum, caseRecord) => sum + caseRecord.totalTasks, 0);
            return (
              <tr key={participant.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">
                  <Link className="font-bold text-[#1d70b8] hover:underline" to={`/stakeholder/participants/${participant.id}`}>
                    {participant.name}
                  </Link>
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                    {terminologyTitle(terminology, "participant")} access granted to this {terminologyLabel(terminology, "stakeholder")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {visibleCase ? (
                    <>
                      <Link className="font-bold text-[#1d70b8] hover:underline" to={`/stakeholder/${visibleCase.id}`}>
                        {visibleCase.title}
                      </Link>
                      <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                        {visibleCase.caseType}
                      </span>
                    </>
                  ) : (
                    "No visible case"
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={visibleCase?.status ?? "not-started"} /></td>
                <td className="px-4 py-3"><ProgressBar value={visibleCompletedTasks} total={visibleTotalTasks} /></td>
              </tr>
            );
          })}
        </ResourceTable>
      </section>
      <p className="mt-4 text-sm text-[#505a5f] dark:text-muted-foreground">
        Visible {terminologyLabel(terminology, "task")} progress across granted {terminologyLabel(terminology, "participant", true)}: {completedTasks} of {totalTasks}.
      </p>
    </ConsoleLayout>
  );
}

export function StakeholderParticipantDetailPage() {
  const { user } = useAuth();
  if (user.role !== "stakeholder") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const { participantId } = useParams();
  const participant = getScopedParticipants(user).find((item) => item.id === participantId);
  if (!participant) return <Navigate to="/stakeholder" replace />;

  const participantCases = getScopedCases(user).filter((caseRecord) => caseRecord.participantId === participant.id);
  const visibleParticipantSuppliers = getScopedParticipantSuppliers(user).filter((relationship) => relationship.participantId === participant.id);
  const openCases = participantCases.filter((caseRecord) => caseRecord.status !== "closed").length;
  const completedVisibleTasks = participantCases.reduce((sum, caseRecord) => sum + caseRecord.completedTasks, 0);
  const totalVisibleTasks = participantCases.reduce((sum, caseRecord) => sum + caseRecord.totalTasks, 0);

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: `${terminologyTitle(terminology, "stakeholder")} Portal`, path: "/stakeholder" },
        { label: participant.name },
      ]}
      readOnly
    >
      <PageTitle
        title={participant.name}
      />
      <MetricStrip
        items={[
          { label: `Visible ${terminologyLabel(terminology, "case", true)}`, value: String(participantCases.length), tone: "blue" },
          { label: `Incomplete ${terminologyLabel(terminology, "case", true)}`, value: String(openCases), tone: "yellow" },
          { label: terminologyTitle(terminology, "participantSupplier", true), value: String(visibleParticipantSuppliers.length), tone: "yellow" },
          { label: "Items complete", value: `${completedVisibleTasks}/${totalVisibleTasks}`, tone: "green" },
        ]}
      />
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Visible {terminologyLabel(terminology, "participantSupplier", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "participantSupplier"), "Relationship", "Data exposure", `Linked ${terminologyLabel(terminology, "case", true)}`]}>
          {visibleParticipantSuppliers.map((relationship) => (
            <tr key={relationship.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <span className="block font-bold text-[#1d70b8]">{relationship.supplierName}</span>
              </td>
              <td className="px-4 py-3">{relationship.relationshipType}</td>
              <td className="px-4 py-3">{relationship.dataExposure}</td>
              <td className="px-4 py-3">
                {relationship.linkedCases.length > 0
                  ? relationship.linkedCases.map((caseRecord) => (
                      <Link key={caseRecord.id} className="block font-bold text-[#1d70b8] hover:underline" to={`/stakeholder/${caseRecord.id}`}>
                        {caseRecord.title}
                      </Link>
                    ))
                  : `No ${terminologyLabel(terminology, "case")} linked`}
              </td>
            </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Visible {terminologyLabel(terminology, "case", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "case"), `${terminologyTitle(terminology, "participant")} status`, "Progress", "Last activity"]}>
          {participantCases.map((caseRecord) => (
              <tr key={caseRecord.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">
                  <Link className="font-bold text-[#1d70b8] hover:underline" to={`/stakeholder/${caseRecord.id}`}>
                    {caseRecord.title}
                  </Link>
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                    {caseRecord.caseType}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={caseRecord.status} /></td>
                <td className="px-4 py-3"><ProgressBar value={caseRecord.completedTasks} total={caseRecord.totalTasks} /></td>
                <td className="px-4 py-3">{caseRecord.lastActivity}</td>
              </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "task")} outcomes and {terminologyLabel(terminology, "evidence")}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "case"), terminologyTitle(terminology, "task"), "Outcome", `${terminologyTitle(terminology, "evidence")} metadata`]}>
          {participantCases.flatMap((caseRecord) =>
            caseRecord.tasks.map((task) => (
              <tr key={`${caseRecord.id}-${task.id}`} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">
                  <Link className="font-bold text-[#1d70b8] hover:underline" to={`/stakeholder/${caseRecord.id}`}>
                    {caseRecord.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="block font-bold">{task.title}</span>
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">{task.type}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                  <span className="mt-2 block text-xs font-bold text-[#505a5f] dark:text-muted-foreground">
                    {task.domainStatus.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3"><EvidenceMetadataList task={task} /></td>
              </tr>
            )),
          )}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function StakeholderCaseDetailPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const { caseId } = useParams();
  const [reviewNote, setReviewNote] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [requestTaskId, setRequestTaskId] = useState("");
  const [requestText, setRequestText] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const caseRecord = getCase(caseId);
  const stakeholderReview = getStakeholderReviewForCase(user, caseRecord?.id);

  useEffect(() => {
    setReviewNote(stakeholderReview?.note ?? "");
    setReviewError(null);
  }, [stakeholderReview?.id, stakeholderReview?.note]);

  if (user.role !== "stakeholder") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  if (!caseRecord) return <Navigate to="/stakeholder" replace />;
  const scopedCaseIds = new Set(getScopedCases(user).map((item) => item.id));
  if (!scopedCaseIds.has(caseRecord.id)) return <Navigate to="/stakeholder" replace />;

  const participant = getParticipant(caseRecord.participantId);
  const requests = getRequestsForCase(caseRecord.id, user);
  const openRequests = requests.filter((request) => request.status === "OPEN" || request.status === "IN_PROGRESS").length;

  function saveStakeholderReview() {
    setReviewError(null);
    if (!user.stakeholderId || !user.authenticatableUserId) {
      setReviewError("No stakeholder context is selected for this session.");
      return;
    }
    try {
      db.upsertStakeholderReview({
        stakeholderId: user.stakeholderId,
        caseId: caseRecord?.id ?? "",
        note: reviewNote.trim(),
        reviewedByUserId: user.authenticatableUserId,
      });
      refresh();
    } catch (caught) {
      setReviewError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "stakeholder")} review could not be saved.`);
    }
  }

  function createRequestForInformation() {
    setRequestError(null);
    if (!user.stakeholderId || !user.authenticatableUserId) {
      setRequestError("No stakeholder context is selected for this session.");
      return;
    }
    if (!requestText.trim()) {
      setRequestError("Enter a request for information.");
      return;
    }
    try {
      db.createRequestForInformation({
        stakeholderId: user.stakeholderId,
        caseId: caseRecord?.id ?? "",
        taskId: requestTaskId || null,
        requestText,
        requestedByUserId: user.authenticatableUserId,
      });
      refresh();
      setRequestTaskId("");
      setRequestText("");
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "Request for information could not be created.");
    }
  }

  function updateRequestStatus(requestId: string, status: Extract<RequestForInformationStatus, "ACCEPTED" | "WITHDRAWN">) {
    setRequestError(null);
    if (!user.authenticatableUserId) {
      setRequestError("No stakeholder user is selected for this session.");
      return;
    }
    try {
      db.updateRequestForInformationStatus({
        requestId,
        status,
        updatedByUserId: user.authenticatableUserId,
        note: status === "ACCEPTED" ? `${terminologyTitle(terminology, "stakeholder")} accepted ${terminologyLabel(terminology, "participant")} response` : `${terminologyTitle(terminology, "stakeholder")} withdrew request`,
      });
      refresh();
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "Request status could not be updated.");
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: `${terminologyTitle(terminology, "stakeholder")} Portal`, path: "/stakeholder" },
        { label: `${participant?.name ?? "Organization"} ${caseRecord.reference}` },
      ]}
    >
      <PageTitle
        title={caseRecord.title}
      />
      <MetricStrip
        items={[
          { label: `${terminologyTitle(terminology, "case")} status`, value: caseRecord.status, tone: caseRecord.status === "closed" ? "green" : "blue" },
          { label: `${terminologyTitle(terminology, "task", true)} complete`, value: `${caseRecord.completedTasks}/${caseRecord.totalTasks}`, tone: "green" },
          { label: `Linked ${terminologyLabel(terminology, "participantSupplier")}`, value: caseRecord.participantSupplierName ?? terminologyTitle(terminology, "participant"), tone: caseRecord.participantSupplierName ? "yellow" : "blue" },
          { label: "Open requests", value: String(openRequests), tone: openRequests > 0 ? "red" : "green" },
        ]}
      />
      <section className="mt-8 border border-[#b1b4b6] bg-white p-5 dark:bg-card">
        <h3 className="text-xl font-bold">{terminologyTitle(terminology, "case")} outcome</h3>
        <p className="mt-2 text-sm leading-6 text-[#505a5f] dark:text-muted-foreground">{caseRecord.outcome}</p>
      </section>
      <section className="mt-8 border border-[#b1b4b6] bg-white p-5 dark:bg-card">
        <h3 className="text-xl font-bold">{terminologyTitle(terminology, "requestForInformation", true)}</h3>
        <FormError message={requestError} />
        <div className="mt-4 grid gap-4 lg:grid-cols-[18rem_1fr_auto] lg:items-end">
          <FormField label="Related scope">
            <SelectField value={requestTaskId} onChange={setRequestTaskId}>
              <option value="">Whole {terminologyLabel(terminology, "case")}</option>
              {caseRecord.tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </SelectField>
          </FormField>
          <FormField label="Request text">
            <Input value={requestText} onChange={(event) => setRequestText(event.target.value)} />
          </FormField>
          <Button type="button" onClick={createRequestForInformation}>
            <MessageSquarePlus />
            Send request
          </Button>
        </div>
        <div className="mt-5">
          <ResourceTable headings={["Scope", "Status", "Request", `${terminologyTitle(terminology, "participant")} response`, "Actions"]}>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">
                  <span className="block font-bold">{request.scopeLabel}</span>
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                    Requested by {request.requestedByName} on {new Date(request.requestedAt).toLocaleDateString("en-GB")}
                  </span>
                </td>
                <td className="px-4 py-3"><RequestStatusBadge status={request.status} /></td>
                <td className="px-4 py-3">{request.requestText}</td>
                <td className="px-4 py-3">
                  {request.responseText || `No ${terminologyLabel(terminology, "participant")} response yet`}
                  {request.respondedByName && (
                    <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                      By {request.respondedByName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {request.status === "ANSWERED" && (
                      <Button type="button" variant="outline" onClick={() => updateRequestStatus(request.id, "ACCEPTED")}>
                        <CheckCircle2 />
                        Accept
                      </Button>
                    )}
                    {request.status !== "ACCEPTED" && request.status !== "WITHDRAWN" && (
                      <Button type="button" variant="outline" onClick={() => updateRequestStatus(request.id, "WITHDRAWN")}>
                        <XCircle />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </ResourceTable>
        </div>
      </section>
      <section className="mt-8 border border-[#b1b4b6] bg-white p-5 dark:bg-card">
        <h3 className="text-xl font-bold">{terminologyTitle(terminology, "stakeholder")} review</h3>
        <FormError message={reviewError} />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <FormField label={`${terminologyTitle(terminology, "stakeholder")} note`}>
            <Input value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} />
          </FormField>
          <Button type="button" onClick={saveStakeholderReview}>
            <Save />
            Save review
          </Button>
        </div>
        {stakeholderReview && (
          <p className="mt-3 text-sm text-[#505a5f] dark:text-muted-foreground">
            Last saved by {stakeholderReview.reviewedByName} on {new Date(stakeholderReview.reviewedAt).toLocaleString("en-GB")}.
          </p>
        )}
      </section>
      <section className="mt-8 border border-[#b1b4b6] bg-white p-5 dark:bg-card">
        <h3 className="text-xl font-bold">{terminologyTitle(terminology, "participant")} performance</h3>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Progress</dt>
            <dd className="mt-2"><ProgressBar value={caseRecord.completedTasks} total={caseRecord.totalTasks} /></dd>
          </div>
          <div>
            <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Recent activity</dt>
            <dd className="mt-2">{caseRecord.lastActivity}</dd>
          </div>
          <div>
            <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Visible status</dt>
            <dd className="mt-2">
              {caseRecord.status === "closed"
                ? `Completed ${terminologyLabel(terminology, "case")}`
                : caseRecord.risk === "high"
                  ? `${terminologyTitle(terminology, "case")} needs attention`
                  : "Work in progress"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "task")} outcomes and {terminologyLabel(terminology, "evidence")}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "task"), "Status", "Response", `${terminologyTitle(terminology, "evidence")} metadata`]}>
          {caseRecord.tasks.map((task) => (
            <tr key={task.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <span className="block font-bold">{task.title}</span>
                <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">{task.type}</span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={task.status} />
                <span className="mt-2 block text-xs font-bold text-[#505a5f] dark:text-muted-foreground">
                  {task.domainStatus.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3">{task.responseText || "No response visible"}</td>
              <td className="px-4 py-3"><EvidenceMetadataList task={task} /></td>
            </tr>
          ))}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function StakeholdersPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const scopedStakeholders = getStakeholdersForAuthority(user.authorityId ?? undefined);

  function createStakeholder() {
    setError(null);
    if (!user.authorityId) {
      setError("No authority is selected for this session.");
      return;
    }
    if (!displayName.trim()) {
      setError("Enter a stakeholder name.");
      return;
    }
    try {
      const stakeholder = db.createStakeholder({
        authorityId: user.authorityId,
        displayName: displayName.trim(),
      });
      refresh();
      setDisplayName("");
      setShowCreate(false);
      navigate(`/admin/stakeholders/${stakeholder.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "stakeholder")} could not be created.`);
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[{ label: "Administration", path: "/admin/participants" }, { label: terminologyTitle(terminology, "stakeholder", true) }]}
    >
      <AdministrationResourceNav
        actions={
          <Button onClick={() => setShowCreate((current) => !current)}>
            <Plus />
            Create {terminologyLabel(terminology, "stakeholder")}
          </Button>
        }
      />
      <ResourceActionPanel
        open={showCreate}
        title={`Create ${terminologyLabel(terminology, "stakeholder")}`}
        description={`Create a ${terminologyLabel(terminology, "stakeholder")} inside the current ${terminologyLabel(terminology, "authority")}.`}
        onClose={() => setShowCreate(false)}
        footer={
          <Button type="button" onClick={createStakeholder}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4">
          <FormField label="Display name">
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </FormField>
        </div>
        <div className="mt-3"><FormError message={error} /></div>
      </ResourceActionPanel>
      <ResourceTable headings={[terminologyTitle(terminology, "stakeholder"), `${terminologyTitle(terminology, "participant")} access`]}>
        {scopedStakeholders.map((stakeholder) => (
          <tr key={stakeholder.id} className="border-b border-[#b1b4b6] last:border-b-0">
            <td className="px-4 py-3">
              <Link className="font-bold text-[#1d70b8] hover:underline" to={`/admin/stakeholders/${stakeholder.id}`}>
                {stakeholder.name}
              </Link>
            </td>
            <td className="px-4 py-3">{stakeholder.visibleParticipants} approved</td>
          </tr>
        ))}
      </ResourceTable>
    </ConsoleLayout>
  );
}

export function StakeholderDetailPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const { stakeholderId } = useParams();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [userError, setUserError] = useState<string | null>(null);
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const stakeholder = getStakeholder(stakeholderId);
  if (!stakeholder) return <Navigate to="/admin/stakeholders" replace />;
  const scopedStakeholders = getStakeholdersForAuthority(user.authorityId ?? undefined);
  if (!scopedStakeholders.some((item) => item.id === stakeholder.id)) return <Navigate to="/admin/stakeholders" replace />;
  const stakeholderRecord = stakeholder;

  const stakeholderUsers = authenticatableUsers.filter(
    (account) =>
      account.membership.entityType === "stakeholder" &&
      account.membership.entityId === stakeholderRecord.id,
  );
  const accessibleParticipantIds = new Set(
    db.getAccessibleParticipantsForStakeholder(stakeholderRecord.id).map((participant) => participant.id),
  );
  const accessibleParticipants = getScopedParticipants(user).filter((participant) => accessibleParticipantIds.has(participant.id));

  function createStakeholderUser() {
    setUserError(null);
    if (!newUserName.trim()) {
      setUserError("Enter a user name.");
      return;
    }
    if (!newUserEmail.trim()) {
      setUserError("Enter an email address.");
      return;
    }
    try {
      db.createStakeholderUser(stakeholderRecord.id, {
        displayName: newUserName.trim(),
        email: newUserEmail.trim(),
      });
      refresh();
      setNewUserName("");
      setNewUserEmail("");
      setShowCreateUser(false);
    } catch (caught) {
      setUserError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "stakeholder")} user could not be created.`);
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: "Administration", path: "/admin/participants" },
        { label: terminologyTitle(terminology, "stakeholder", true), path: "/admin/stakeholders" },
        { label: stakeholder.name },
      ]}
    >
      <MetricStrip
        items={[
          { label: "Users", value: String(stakeholderUsers.length), tone: "green" },
          { label: `${terminologyTitle(terminology, "participant")} access`, value: String(accessibleParticipants.length), tone: "yellow" },
        ]}
      />
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Users</h3>
          <Button type="button" onClick={() => setShowCreateUser((current) => !current)}>
            <UserPlus />
            Add user
          </Button>
        </div>
        <ResourceActionPanel
          open={showCreateUser}
          title={`Add ${terminologyLabel(terminology, "stakeholder")} user`}
          description={`Add a user to this ${terminologyLabel(terminology, "stakeholder")}.`}
          onClose={() => setShowCreateUser(false)}
          footer={
            <Button type="button" onClick={createStakeholderUser}>
              <CheckCircle2 />
              Save
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Display name">
              <Input value={newUserName} onChange={(event) => setNewUserName(event.target.value)} />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} />
            </FormField>
          </div>
          <div className="mt-3"><FormError message={userError} /></div>
        </ResourceActionPanel>
        <ResourceTable headings={["User", "Email"]}>
          {stakeholderUsers.map((account) => (
            <tr key={account.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3 font-bold text-[#1d70b8]">{account.name}</td>
              <td className="px-4 py-3">{account.email}</td>
            </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">{terminologyTitle(terminology, "participant")} access</h3>
        </div>
        <p className="mb-3 max-w-3xl text-sm leading-6 text-[#505a5f] dark:text-muted-foreground">
          {terminologyTitle(terminology, "participant")} {terminologyLabel(terminology, "case")} access is granted by the {terminologyLabel(terminology, "participant")} account, not by the {terminologyLabel(terminology, "authority")}. This view only shows existing access relationships.
        </p>
        <ResourceTable headings={[terminologyTitle(terminology, "participant"), "Status", "Progress"]}>
          {accessibleParticipants.map((participant) => (
            <tr key={participant.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <Link className="font-bold text-[#1d70b8] hover:underline" to={`/admin/participants/${participant.id}`}>
                  {participant.name}
                </Link>
              </td>
              <td className="px-4 py-3"><StatusBadge status={participant.status} /></td>
              <td className="px-4 py-3"><ProgressBar value={participant.completedTasks} total={participant.totalTasks} /></td>
            </tr>
          ))}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function CaseTemplatesPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const scopedTemplates = getCaseTemplatesForAuthority(user.authorityId ?? undefined);

  function createTemplate() {
    setError(null);
    if (!user.authorityId) {
      setError("No authority is selected for this session.");
      return;
    }
    if (!name.trim()) {
      setError("Enter a template name.");
      return;
    }
    try {
      const template = db.createCaseTemplate({
        authorityId: user.authorityId,
        name: name.trim(),
        description: description.trim() || "Reusable case template",
      });
      refresh();
      setName("");
      setDescription("");
      setShowCreate(false);
      navigate(`/admin/case-templates/${template.id}/edit`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Template could not be created.");
    }
  }

  function deleteTemplate(templateId: string) {
    setError(null);
    try {
      db.deleteCaseTemplate(templateId);
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Template could not be deleted.");
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[{ label: "Administration", path: "/admin/participants" }, { label: terminologyTitle(terminology, "caseTemplate", true) }]}
    >
      <AdministrationResourceNav
        actions={
          <Button onClick={() => setShowCreate((current) => !current)}>
            <Plus />
            Create template
          </Button>
        }
      />
      <ResourceActionPanel
        open={showCreate}
        title={`Create ${terminologyLabel(terminology, "caseTemplate")}`}
        description={`Create a ${terminologyLabel(terminology, "caseTemplate")} inside the current ${terminologyLabel(terminology, "authority")}.`}
        onClose={() => setShowCreate(false)}
        footer={
          <Button type="button" onClick={createTemplate}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-[1fr_1.5fr]">
          <FormField label="Name">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="Description">
            <Input value={description} onChange={(event) => setDescription(event.target.value)} />
          </FormField>
        </div>
        <div className="mt-3"><FormError message={error} /></div>
      </ResourceActionPanel>
      {!showCreate && <FormError message={error} />}
      <ResourceTable headings={[terminologyTitle(terminology, "caseTemplate"), "Finalized", terminologyTitle(terminology, "task", true), terminologyTitle(terminology, "participant", true), "Actions"]}>
        {scopedTemplates.map((template) => (
          <tr key={template.id} className="border-b border-[#b1b4b6] last:border-b-0">
            <td className="px-4 py-3">
              {template.status === "FINALIZED" ? (
                <Link className="font-bold text-[#1d70b8] hover:underline" to={`/admin/case-templates/${template.id}/assign`}>
                  {template.name}
                </Link>
              ) : (
                <span className="font-bold text-[#0b0c0c] dark:text-white">{template.name}</span>
              )}
              <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">{template.description}</span>
            </td>
            <td className="px-4 py-3 font-bold">{template.status === "FINALIZED" ? "Yes" : "No"}</td>
            <td className="px-4 py-3">{template.taskCount}</td>
            <td className="px-4 py-3">{template.participantCount}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {template.status === "FINALIZED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled
                  >
                    <Pencil />
                    Edit
                  </Button>
                ) : (
                  <Button asChild type="button" size="sm" variant="outline">
                    <Link to={`/admin/case-templates/${template.id}/edit`}>
                      <Pencil />
                      Edit
                    </Link>
                  </Button>
                )}
                {template.status === "FINALIZED" ? (
                  <Button asChild type="button" size="sm">
                    <Link to={`/admin/case-templates/${template.id}/assign`}>
                      <UserPlus />
                      Assign
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" size="sm" disabled>
                    <UserPlus />
                    Assign
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => deleteTemplate(template.id)}
                  disabled={template.participantCount > 0}
                >
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </ResourceTable>
    </ConsoleLayout>
  );
}

export function CaseTemplateDetailPage({ mode }: { mode?: "edit" | "assign" }) {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAssignParticipant, setShowAssignParticipant] = useState(false);
  const [withdrawingCaseId, setWithdrawingCaseId] = useState<string | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [taskTypeId, setTaskTypeId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDue, setTaskDue] = useState("");
  const [taskError, setTaskError] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const template = getCaseTemplate(templateId);
  if (!template) return <Navigate to="/admin/case-templates" replace />;
  const scopedTemplates = getCaseTemplatesForAuthority(user.authorityId ?? undefined);
  const templateRecord = template;
  if (!scopedTemplates.some((item) => item.id === templateRecord.id)) return <Navigate to="/admin/case-templates" replace />;
  const templateTasks = getTemplateTasks(templateRecord.id);
  const templateParticipants = getCaseTemplateParticipants(templateRecord.id);
  const assignedCases = templateParticipants
    .map((assignment) => (assignment.caseId ? getCase(assignment.caseId) : null))
    .filter((caseRecord): caseRecord is NonNullable<typeof caseRecord> => Boolean(caseRecord));
  const assignedParticipantIds = new Set(templateParticipants.map((assignment) => assignment.participantId));
  const assignableParticipants = getScopedParticipants(user).filter((participant) => !assignedParticipantIds.has(participant.id));
  const canDeleteTemplate = templateParticipants.length === 0;
  const isFinalized = templateRecord.status === "FINALIZED";
  const effectiveMode = mode ?? (isFinalized ? "assign" : "edit");
  const activeTaskTypes = taskTypes.filter((taskType) => taskType.status === "ACTIVE");

  if (!mode) {
    return <Navigate to={`/admin/case-templates/${templateRecord.id}/${effectiveMode}`} replace />;
  }
  if (mode === "edit" && isFinalized) {
    return <Navigate to={`/admin/case-templates/${templateRecord.id}/assign`} replace />;
  }
  if (mode === "assign" && !isFinalized) {
    return <Navigate to={`/admin/case-templates/${templateRecord.id}/edit`} replace />;
  }

  function addTemplateTask() {
    setTaskError(null);
    if (!taskTypeId) {
      setTaskError(`Select a ${terminologyLabel(terminology, "task")} type.`);
      return;
    }
    if (!taskTitle.trim()) {
      setTaskError("Enter a task title.");
      return;
    }
    try {
      db.addTaskToTemplate({
        caseTemplateId: templateRecord.id,
        taskTypeId,
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        parametersJson: { due: taskDue.trim() || "No due date" },
      });
      refresh();
      setTaskTypeId("");
      setTaskTitle("");
      setTaskDescription("");
      setTaskDue("");
      setShowAddTask(false);
    } catch (caught) {
      setTaskError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "task")} could not be added.`);
    }
  }

  function finalizeTemplate() {
    setFinalizeError(null);
    if (!window.confirm("Finalizing a template cannot be undone. Continue?")) return;
    try {
      db.finalizeCaseTemplate(templateRecord.id);
      refresh();
      setShowAddTask(false);
    } catch (caught) {
      setFinalizeError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "caseTemplate")} could not be finalized.`);
    }
  }

  function removeTemplateTask(taskId: string) {
    setTaskError(null);
    if (!user.authenticatableUserId) {
      setTaskError("No authority user is selected for this session.");
      return;
    }
    try {
      db.withdrawTemplateTask(taskId, user.authenticatableUserId, "Removed before finalization.");
      refresh();
    } catch (caught) {
      setTaskError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "task")} could not be removed.`);
    }
  }

  function assignParticipant() {
    setAssignmentError(null);
    if (!isFinalized) {
      setAssignmentError(`${terminologyTitle(terminology, "caseTemplate")} must be finalized before it can be assigned.`);
      return;
    }
    if (!participantId) {
      setAssignmentError("Select a participant.");
      return;
    }
    try {
      db.assignParticipantToTemplate({
        caseTemplateId: templateRecord.id,
        participantId,
        decidedByUserId: user.authenticatableUserId,
      });
      refresh();
      setParticipantId("");
      setShowAssignParticipant(false);
    } catch (caught) {
      setAssignmentError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "participant")} could not be assigned.`);
    }
  }

  function openWithdrawCase(caseId: string) {
    setWithdrawingCaseId(caseId);
    setWithdrawReason("");
    setWithdrawError(null);
  }

  function closeWithdrawCase() {
    setWithdrawingCaseId(null);
    setWithdrawReason("");
    setWithdrawError(null);
  }

  function withdrawCase() {
    setWithdrawError(null);
    if (!withdrawingCaseId) {
      setWithdrawError(`Select a ${terminologyLabel(terminology, "case")} to withdraw.`);
      return;
    }
    if (!withdrawReason.trim()) {
      setWithdrawError("Enter a withdrawal reason.");
      return;
    }
    if (!user.authenticatableUserId) {
      setWithdrawError("No authority user is selected for this session.");
      return;
    }
    try {
      db.withdrawCase(withdrawingCaseId, user.authenticatableUserId, withdrawReason.trim());
      refresh();
      closeWithdrawCase();
    } catch (caught) {
      setWithdrawError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "case")} could not be withdrawn.`);
    }
  }

  function reinstateCase(caseId: string) {
    setWithdrawError(null);
    try {
      db.reinstateCase(caseId);
      refresh();
    } catch (caught) {
      setWithdrawError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "case")} could not be reinstated.`);
    }
  }

  function deleteTemplate() {
    setDeleteError(null);
    try {
      db.deleteCaseTemplate(templateRecord.id);
      refresh();
      navigate("/admin/case-templates");
    } catch (caught) {
      setDeleteError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "caseTemplate")} could not be deleted.`);
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: "Administration", path: "/admin/participants" },
        { label: terminologyTitle(terminology, "caseTemplate", true), path: "/admin/case-templates" },
        { label: `${effectiveMode === "edit" ? "Edit" : "Assign"} ${templateRecord.name}` },
      ]}
    >
      <PageTitle
        title={`${effectiveMode === "edit" ? "Edit" : "Assign"} ${templateRecord.name}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {effectiveMode === "edit" && !isFinalized && (
              <Button type="button" onClick={finalizeTemplate}>
                <CheckCircle2 />
                Finalize
              </Button>
            )}
            <Button type="button" variant="outline" onClick={deleteTemplate} disabled={!canDeleteTemplate}>
              <Trash2 />
              Delete
            </Button>
          </div>
        }
      />
      <MetricStrip
        items={[
          { label: "Finalized", value: isFinalized ? "Yes" : "No", tone: isFinalized ? "green" : "yellow" },
          { label: terminologyTitle(terminology, "task", true), value: String(templateRecord.taskCount), tone: "blue" },
          { label: terminologyTitle(terminology, "participant", true), value: String(templateRecord.participantCount), tone: "blue" },
          { label: `Assigned ${terminologyLabel(terminology, "case", true)}`, value: String(assignedCases.length), tone: "green" },
        ]}
      />
      <div className="mt-3">
        <FormError message={finalizeError ?? deleteError} />
      </div>
      {effectiveMode === "edit" && (
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">{terminologyTitle(terminology, "task", true)}</h3>
          {!isFinalized && (
            <Button type="button" onClick={() => setShowAddTask((current) => !current)}>
              <Plus />
              Add {terminologyLabel(terminology, "task")}
            </Button>
          )}
        </div>
        <ResourceActionPanel
          open={showAddTask}
          title={`Add ${terminologyLabel(terminology, "task")}`}
          description={`${terminologyTitle(terminology, "task", true)} can be added until the ${terminologyLabel(terminology, "caseTemplate")} is finalized.`}
          onClose={() => setShowAddTask(false)}
          footer={
            <Button type="button" onClick={addTemplateTask}>
              <CheckCircle2 />
              Save
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label={taskTypeTitle(terminology)}>
              <SelectField value={taskTypeId} onChange={setTaskTypeId}>
                <option value="">Select {terminologyLabel(terminology, "task")} type</option>
                {activeTaskTypes.map((taskType) => (
                  <option key={taskType.id} value={taskType.id}>{taskType.name}</option>
                ))}
              </SelectField>
            </FormField>
            <FormField label="Title">
              <Input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} />
            </FormField>
            <FormField label="Due">
              <Input value={taskDue} onChange={(event) => setTaskDue(event.target.value)} />
            </FormField>
            <FormField label="Description">
              <Input value={taskDescription} onChange={(event) => setTaskDescription(event.target.value)} />
            </FormField>
          </div>
          <div className="mt-3"><FormError message={taskError} /></div>
        </ResourceActionPanel>
        {!showAddTask && <FormError message={taskError} />}
        <ResourceTable headings={isFinalized ? ["Order", terminologyTitle(terminology, "task"), taskTypeTitle(terminology), "Due", "Status"] : ["Order", terminologyTitle(terminology, "task"), taskTypeTitle(terminology), "Due", "Status", "Actions"]}>
          {templateTasks.map((task) => (
            <tr key={task.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">{task.sortOrder}</td>
              <td className="px-4 py-3">
                <span className="block font-bold text-[#0b0c0c] dark:text-white">{task.title}</span>
                <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">{task.description}</span>
                {task.withdrawnReason && (
                  <span className="mt-2 block text-xs font-bold text-[#d4351c]">
                    Withdrawn: {task.withdrawnReason}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{task.taskTypeName}</td>
              <td className="px-4 py-3">{task.due}</td>
              <td className="px-4 py-3">
                <span className="block font-bold">{task.status}</span>
                {task.withdrawnAt && (
                  <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                    Withdrawn {new Date(task.withdrawnAt).toLocaleString("en-GB")}
                  </span>
                )}
              </td>
              {!isFinalized && (
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeTemplateTask(task.id)}
                    disabled={task.status === "WITHDRAWN"}
                  >
                    <XCircle />
                    Remove
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </ResourceTable>
      </section>
      )}
      {effectiveMode === "assign" && (
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-bold">{terminologyTitle(terminology, "participant", true)}</h3>
          <Button type="button" onClick={() => setShowAssignParticipant((current) => !current)} disabled={!isFinalized || assignableParticipants.length === 0}>
            <Plus />
            Assign {terminologyLabel(terminology, "participant")}
          </Button>
        </div>
        <ResourceActionPanel
          open={showAssignParticipant}
          title={`Assign ${terminologyLabel(terminology, "participant")}`}
          description={`Assigning a ${terminologyLabel(terminology, "participant")} creates a ${terminologyLabel(terminology, "case")}.`}
          onClose={() => setShowAssignParticipant(false)}
          footer={
            <Button type="button" onClick={assignParticipant}>
              <CheckCircle2 />
              Save
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-[1fr]">
            <FormField label={terminologyTitle(terminology, "participant")}>
              <SelectField value={participantId} onChange={setParticipantId}>
                <option value="">Select {terminologyLabel(terminology, "participant")}</option>
                {assignableParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id}>{participant.name}</option>
                ))}
              </SelectField>
            </FormField>
          </div>
          <div className="mt-3"><FormError message={assignmentError} /></div>
        </ResourceActionPanel>
        <ResourceTable headings={[terminologyTitle(terminology, "participant"), terminologyTitle(terminology, "case"), "Actions"]}>
          {templateParticipants.map((assignment) => (
            <Fragment key={assignment.id}>
              <tr className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3 font-bold text-[#1d70b8]">{assignment.participantName}</td>
                <td className="px-4 py-3">{assignment.caseStatus?.toLowerCase() ?? "created"}</td>
                <td className="px-4 py-3">
                  {assignment.caseStatus === "WITHDRAWN" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => assignment.caseId && reinstateCase(assignment.caseId)}
                      disabled={!assignment.caseId}
                    >
                      <CheckCircle2 />
                      Reinstate
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => assignment.caseId && openWithdrawCase(assignment.caseId)}
                      disabled={!assignment.caseId}
                    >
                      <XCircle />
                      Withdraw
                    </Button>
                  )}
                </td>
              </tr>
              {withdrawingCaseId === assignment.caseId && (
                <tr className="border-b border-[#b1b4b6] bg-white dark:bg-card">
                  <td className="px-4 py-4" colSpan={4}>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                      <FormField label="Reason">
                        <Input value={withdrawReason} onChange={(event) => setWithdrawReason(event.target.value)} />
                      </FormField>
                      <Button type="button" variant="destructive" onClick={withdrawCase}>
                        <XCircle />
                        Withdraw
                      </Button>
                      <Button type="button" variant="outline" onClick={closeWithdrawCase}>
                        Cancel
                      </Button>
                    </div>
                    <div className="mt-3"><FormError message={withdrawError} /></div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </ResourceTable>
      </section>
      )}
      {effectiveMode === "assign" && (
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">Assigned {terminologyLabel(terminology, "case", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "case"), terminologyTitle(terminology, "participant"), "Status", "Progress", "Outcome"]}>
          {assignedCases.map((caseRecord) => {
            const participant = getParticipant(caseRecord.participantId);
            return (
              <tr key={caseRecord.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3 font-bold text-[#0b0c0c] dark:text-white">{caseRecord.title}</td>
                <td className="px-4 py-3">{participant?.name ?? `Unknown ${terminologyLabel(terminology, "participant")}`}</td>
                <td className="px-4 py-3"><StatusBadge status={caseRecord.status} /></td>
                <td className="px-4 py-3"><ProgressBar value={caseRecord.completedTasks} total={caseRecord.totalTasks} /></td>
                <td className="px-4 py-3">{caseRecord.outcome}</td>
              </tr>
            );
          })}
        </ResourceTable>
      </section>
      )}
    </ConsoleLayout>
  );
}

const terminologyKeys: TerminologyKey[] = [
  "authority",
  "participant",
  "stakeholder",
  "agent",
  "case",
  "caseTemplate",
  "task",
  "participantSupplier",
  "evidence",
  "accessGrant",
  "requestForInformation",
];

export function ParametersPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const terminology = getAuthorityTerminology(user.authorityId ?? undefined);
  const [labels, setLabels] = useState(terminology.labels);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLabels(terminology.labels);
  }, [terminology]);

  if (user.role !== "authority-admin") return <Navigate to="/" replace />;

  function updateLabel(key: TerminologyKey, plurality: "singular" | "plural", value: string) {
    setLabels((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [plurality]: value,
      },
    }));
  }

  function saveParameters() {
    setError(null);
    if (!user.authorityId) {
      setError("No authority context is selected.");
      return;
    }
    try {
      db.updateAuthorityTerminology({
        authorityId: user.authorityId,
        labels,
      });
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Parameters could not be saved.");
    }
  }

  function resetDefaults() {
    setLabels(defaultTerminologyLabels);
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: "Administration", path: "/admin/participants" },
        { label: "Parameters" },
      ]}
    >
      <AdministrationResourceNav />
      <PageTitle
        title="Terminology"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={resetDefaults}>
              Reset defaults
            </Button>
            <Button type="button" onClick={saveParameters}>
              <Save />
              Save parameters
            </Button>
          </div>
        }
      />
      <FormError message={error} />
      <section className="mt-6">
        <ResourceTable headings={["Concept", "Singular label", "Plural label"]}>
          {terminologyKeys.map((key) => (
            <tr key={key} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3 font-bold">{titleCaseForPage(defaultTerminologyLabels[key].singular)}</td>
              <td className="px-4 py-3">
                <Input value={labels[key].singular} onChange={(event) => updateLabel(key, "singular", event.target.value)} />
              </td>
              <td className="px-4 py-3">
                <Input value={labels[key].plural} onChange={(event) => updateLabel(key, "plural", event.target.value)} />
              </td>
            </tr>
          ))}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function ParticipantsPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const [showCreate, setShowCreate] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [initialUserName, setInitialUserName] = useState("");
  const [initialUserEmail, setInitialUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const scopedParticipants = getScopedParticipants(user);

  function createParticipant() {
    setError(null);
    if (!user.authorityId) {
      setError("No authority is selected for this session.");
      return;
    }
    if (!displayName.trim()) {
      setError("Enter a participant name.");
      return;
    }
    if (!initialUserName.trim()) {
      setError("Enter the first user name.");
      return;
    }
    if (!initialUserEmail.trim()) {
      setError("Enter the first user email address.");
      return;
    }
    try {
      db.createParticipant({
        authorityId: user.authorityId,
        displayName: displayName.trim(),
        initialUser: {
          displayName: initialUserName.trim(),
          email: initialUserEmail.trim(),
        },
      });
      refresh();
      setDisplayName("");
      setInitialUserName("");
      setInitialUserEmail("");
      setShowCreate(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "participant")} could not be created.`);
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[{ label: "Administration", path: "/admin/participants" }, { label: terminologyTitle(terminology, "participant", true) }]}
    >
      <AdministrationResourceNav
        actions={
          <Button onClick={() => setShowCreate((current) => !current)}>
            <Plus />
            Create {terminologyLabel(terminology, "participant")}
          </Button>
        }
      />
      <ResourceActionPanel
        open={showCreate}
        title={`Create ${terminologyLabel(terminology, "participant")}`}
        description={`Create a ${terminologyLabel(terminology, "participant")} inside the current ${terminologyLabel(terminology, "authority")} and add its first user.`}
        onClose={() => setShowCreate(false)}
        footer={
          <Button type="button" onClick={createParticipant}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Display name">
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </FormField>
          <FormField label="First user name">
            <Input value={initialUserName} onChange={(event) => setInitialUserName(event.target.value)} />
          </FormField>
          <FormField label="First user email">
            <Input type="email" value={initialUserEmail} onChange={(event) => setInitialUserEmail(event.target.value)} />
          </FormField>
        </div>
        <div className="mt-3"><FormError message={error} /></div>
      </ResourceActionPanel>
      <ResourceTable headings={[terminologyTitle(terminology, "participant"), "Status", `Incomplete ${terminologyLabel(terminology, "case", true)}`, "Progress", "Last activity"]}>
        {scopedParticipants.map((participant) => (
          <tr key={participant.id} className="border-b border-[#b1b4b6] last:border-b-0">
            <td className="px-4 py-3">
              <Link className="font-bold text-[#1d70b8] hover:underline" to={`/admin/participants/${participant.id}`}>
                {participant.name}
              </Link>
            </td>
            <td className="px-4 py-3"><StatusBadge status={participant.status} /></td>
            <td className="px-4 py-3">{participant.openCases}</td>
            <td className="px-4 py-3"><ProgressBar value={participant.completedTasks} total={participant.totalTasks} /></td>
            <td className="px-4 py-3">{participant.lastActivity}</td>
          </tr>
        ))}
      </ResourceTable>
    </ConsoleLayout>
  );
}

export function ParticipantDetailPage() {
  const { user } = useAuth();
  const { participantId } = useParams();
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const terminology = getTerminologyForUser(user);
  const participant = getParticipant(participantId);
  if (!participant) return <Navigate to="/admin/participants" replace />;
  const scopedParticipantIds = new Set(getScopedParticipants(user).map((item) => item.id));
  if (!scopedParticipantIds.has(participant.id)) return <Navigate to="/admin/participants" replace />;
  const participantRecord = participant;

  const participantAccessGrants = getAccessGrantsForParticipant(participantRecord.id);
  const activeAccessGrants = participantAccessGrants.filter((grant) => grant.status === "ACTIVE").length;
  const assignedCaseTemplates = getCaseTemplatesForAuthority(user.authorityId ?? undefined)
    .flatMap((caseTemplate) =>
      getCaseTemplateParticipants(caseTemplate.id)
        .filter((assignment) => assignment.participantId === participantRecord.id)
        .map((assignment) => ({ caseTemplate, assignment })),
    );

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: "Administration", path: "/admin/participants" },
        { label: terminologyTitle(terminology, "participant", true), path: "/admin/participants" },
        { label: participant.name },
      ]}
    >
      <PageTitle
        title={participant.name}
      />
      <MetricStrip
        items={[
          { label: `${terminologyTitle(terminology, "participant")} status`, value: participant.status.replace("-", " "), tone: participant.status === "attention" ? "red" : "blue" },
          { label: `Incomplete ${terminologyLabel(terminology, "case", true)}`, value: String(participant.openCases), tone: "blue" },
          { label: `${terminologyTitle(terminology, "task", true)} complete`, value: `${participant.completedTasks}/${participant.totalTasks}`, tone: "green" },
          { label: `Active ${terminologyLabel(terminology, "accessGrant", true)}`, value: String(activeAccessGrants), tone: "yellow" },
        ]}
      />
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "participant")}</h3>
        <ResourceTable headings={["Status"]}>
          <tr className="border-b border-[#b1b4b6] last:border-b-0">
            <td className="px-4 py-3"><StatusBadge status={participant.status} /></td>
          </tr>
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "caseTemplate", true)}</h3>
        <ResourceTable headings={[terminologyTitle(terminology, "caseTemplate"), "Status", terminologyTitle(terminology, "case")]}>
          {assignedCaseTemplates.map(({ caseTemplate, assignment }) => (
            <tr key={assignment.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <Link className="font-bold text-[#1d70b8] hover:underline" to={`/admin/case-templates/${caseTemplate.id}`}>
                  {caseTemplate.name}
                </Link>
              </td>
              <td className="px-4 py-3">{caseTemplate.status.toLowerCase()}</td>
              <td className="px-4 py-3">{assignment.caseId ? "Created" : "Not created"}</td>
            </tr>
          ))}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function CaseManagementHome({ mode }: { mode: "cases" | "suppliers" | "users" }) {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [usersTab, setUsersTab] = useState<UserManagementTab>("participants");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [agentOrganizationId, setAgentOrganizationId] = useState("");
  const [agentOrganizationName, setAgentOrganizationName] = useState("");
  const [agentOrganizationError, setAgentOrganizationError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [servicesProvided, setServicesProvided] = useState("");
  const [dataExposure, setDataExposure] = useState("");
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [linkingSupplierId, setLinkingSupplierId] = useState<string | null>(null);
  const [supplierCaseId, setSupplierCaseId] = useState("");
  const [supplierLinkError, setSupplierLinkError] = useState<string | null>(null);
  if (user.role === "stakeholder") return <Navigate to="/stakeholder" replace />;
  if (user.role === "authority-admin") return <Navigate to="/admin/participants" replace />;
  if (user.role === "agent" && mode === "users") return <Navigate to="/cases" replace />;
  const terminology = getTerminologyForUser(user);
  const participant = getParticipant(user.participantId ?? undefined);
  const scopedCases = getScopedCases(user);
  const participantSuppliersForParticipant = user.role === "agent"
    ? getScopedParticipantSuppliers(user)
    : getParticipantSuppliersForParticipant(user.participantId ?? undefined);
  const participantUsers = authenticatableUsers.filter(
    (account) =>
      account.membership.entityType === "participant" &&
      account.membership.entityId === user.participantId,
  );
  const scopedAgents = getAgentsForAuthority(user.authorityId ?? undefined);
  const agentOrganizations = scopedAgents;
  const agentUsers = authenticatableUsers.filter(
    (account) =>
      account.membership.entityType === "agent" &&
      scopedAgents.some((agent) => agent.id === account.membership.entityId),
  );
  const activeUsersTab = mode === "users" ? usersTab : "participants";
  const createUserType = activeUsersTab === "agents" ? "AGENT" : "PARTICIPANT";
  const showCreateUserPanel = mode === "users" && showCreateUser && activeUsersTab !== "agent-organizations";
  const showCreateAgentOrganizationPanel = mode === "users" && showCreateUser && activeUsersTab === "agent-organizations";

  function createUser() {
    setUserError(null);
    if (!userName.trim()) {
      setUserError("Enter a user name.");
      return;
    }
    if (!userEmail.trim()) {
      setUserError("Enter an email address.");
      return;
    }
    try {
      if (createUserType === "PARTICIPANT") {
        if (!user.participantId) {
          setUserError("No participant is selected.");
          return;
        }
        db.createParticipantUser(user.participantId, {
          displayName: userName.trim(),
          email: userEmail.trim(),
        });
      } else {
        if (!user.authorityId) {
          setUserError("No authority is selected for this session.");
          return;
        }
        const agent = agentOrganizationId
          ? getAgent(agentOrganizationId)
          : db.createAgent({
              authorityId: user.authorityId,
              displayName: userName.trim(),
            });
        if (!agent) {
          setUserError(`Select a valid ${terminologyLabel(terminology, "agent")} organization.`);
          return;
        }
        db.createAgentUser(agent.id, {
          displayName: userName.trim(),
          email: userEmail.trim(),
        });
      }
      refresh();
      setUserName("");
      setUserEmail("");
      setAgentOrganizationId("");
      setShowCreateUser(false);
    } catch (caught) {
      setUserError(caught instanceof Error ? caught.message : "User could not be created.");
    }
  }

  function createAgentOrganization() {
    setAgentOrganizationError(null);
    if (!user.authorityId) {
      setAgentOrganizationError("No authority is selected for this session.");
      return;
    }
    if (!agentOrganizationName.trim()) {
      setAgentOrganizationError(`Enter a ${terminologyLabel(terminology, "agent")} organization name.`);
      return;
    }
    try {
      db.createAgent({
        authorityId: user.authorityId,
        displayName: agentOrganizationName.trim(),
      });
      refresh();
      setAgentOrganizationName("");
      setShowCreateUser(false);
    } catch (caught) {
      setAgentOrganizationError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "agent")} organization could not be created.`);
    }
  }

  function createParticipantSupplier() {
    setSupplierError(null);
    if (!participant || !user.authorityId) {
      setSupplierError("No participant is selected.");
      return;
    }
    try {
      db.createParticipantSupplier({
        authorityId: user.authorityId,
        participantId: participant.id,
        supplierName,
        relationshipType,
        servicesProvided,
        dataExposure,
      });
      refresh();
      setSupplierName("");
      setRelationshipType("");
      setServicesProvided("");
      setDataExposure("");
      setShowCreateSupplier(false);
    } catch (caught) {
      setSupplierError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "participantSupplier")} record could not be created.`);
    }
  }

  function openLinkSupplier(relationshipId: string) {
    setLinkingSupplierId(relationshipId);
    setSupplierCaseId("");
    setSupplierLinkError(null);
  }

  function closeLinkSupplier() {
    setLinkingSupplierId(null);
    setSupplierCaseId("");
    setSupplierLinkError(null);
  }

  function linkSupplierToCase() {
    setSupplierLinkError(null);
    if (!linkingSupplierId) {
      setSupplierLinkError(`Select a ${terminologyLabel(terminology, "participantSupplier")}.`);
      return;
    }
    if (!supplierCaseId) {
      setSupplierLinkError(`Select a ${terminologyLabel(terminology, "case")}.`);
      return;
    }
    try {
      db.linkParticipantSupplierToCase(linkingSupplierId, supplierCaseId);
      refresh();
      closeLinkSupplier();
    } catch (caught) {
      setSupplierLinkError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "participantSupplier")} could not be linked to this ${terminologyLabel(terminology, "case")}.`);
    }
  }

  function unlinkSupplierFromCase(caseId: string) {
    setSupplierLinkError(null);
    if (!caseId) {
      setSupplierLinkError(`No linked ${terminologyLabel(terminology, "case")} was found.`);
      return;
    }
    try {
      db.unlinkParticipantSupplierFromCase(caseId);
      refresh();
      closeLinkSupplier();
    } catch (caught) {
      setSupplierLinkError(caught instanceof Error ? caught.message : `${terminologyTitle(terminology, "participantSupplier")} could not be unlinked from this ${terminologyLabel(terminology, "case")}.`);
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: participant?.name ?? terminologyTitle(terminology, "participant") },
        { label: mode === "cases" ? terminologyTitle(terminology, "case", true) : mode === "suppliers" ? terminologyTitle(terminology, "participantSupplier", true) : "Users" },
      ]}
      readOnly
    >
      <ParticipantNav
        actions={
          mode === "suppliers" && user.role === "participant" ? (
            <Button type="button" onClick={() => setShowCreateSupplier((current) => !current)}>
              <Plus />
              Add {terminologyLabel(terminology, "participantSupplier")}
            </Button>
          ) : mode === "users" ? (
            <Button type="button" onClick={() => setShowCreateUser((current) => !current)}>
              {activeUsersTab === "agent-organizations" ? <Plus /> : <UserPlus />}
              {activeUsersTab === "participants"
                ? `Add ${terminologyLabel(terminology, "participant")}`
                : activeUsersTab === "agents"
                  ? `Add ${terminologyLabel(terminology, "agent")}`
                  : `Add ${terminologyLabel(terminology, "agent")} organization`}
            </Button>
          ) : undefined
        }
      />
      <ResourceActionPanel
        open={showCreateUserPanel}
        title={`Add ${createUserType === "PARTICIPANT" ? terminologyLabel(terminology, "participant") : terminologyLabel(terminology, "agent")}`}
        description={
          createUserType === "PARTICIPANT"
            ? `Create a ${terminologyLabel(terminology, "participant")} user.`
            : `Create a ${terminologyLabel(terminology, "agent")} and optionally assign them to one ${terminologyLabel(terminology, "agent")} organization.`
        }
        onClose={() => setShowCreateUser(false)}
        footer={
          <Button type="button" onClick={createUser}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Display name">
            <Input value={userName} onChange={(event) => setUserName(event.target.value)} />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={userEmail} onChange={(event) => setUserEmail(event.target.value)} />
          </FormField>
          {createUserType === "AGENT" && (
            <FormField label={`${terminologyTitle(terminology, "agent")} organization`}>
              <SelectField value={agentOrganizationId} onChange={setAgentOrganizationId}>
                <option value="">No organisation</option>
                {agentOrganizations.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </SelectField>
            </FormField>
          )}
        </div>
        <div className="mt-3"><FormError message={userError} /></div>
      </ResourceActionPanel>
      <ResourceActionPanel
        open={showCreateAgentOrganizationPanel}
        title={`Add ${terminologyLabel(terminology, "agent")} organization`}
        description={`Create an organization that ${terminologyLabel(terminology, "agent", true)} can be assigned to.`}
        onClose={() => setShowCreateUser(false)}
        footer={
          <Button type="button" onClick={createAgentOrganization}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4">
          <FormField label="Organisation name">
            <Input value={agentOrganizationName} onChange={(event) => setAgentOrganizationName(event.target.value)} />
          </FormField>
        </div>
        <div className="mt-3"><FormError message={agentOrganizationError} /></div>
      </ResourceActionPanel>
      <ResourceActionPanel
        open={mode === "suppliers" && showCreateSupplier}
        title={`Add ${terminologyLabel(terminology, "participantSupplier")}`}
        description={`Record a ${terminologyLabel(terminology, "participantSupplier")} controlled by this ${terminologyLabel(terminology, "participant")}.`}
        onClose={() => setShowCreateSupplier(false)}
        footer={
          <Button type="button" onClick={createParticipantSupplier}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label={terminologyTitle(terminology, "participantSupplier")}>
            <Input value={supplierName} onChange={(event) => setSupplierName(event.target.value)} />
          </FormField>
          <FormField label="Relationship">
            <Input value={relationshipType} onChange={(event) => setRelationshipType(event.target.value)} />
          </FormField>
          <FormField label="Services provided">
            <Input value={servicesProvided} onChange={(event) => setServicesProvided(event.target.value)} />
          </FormField>
          <FormField label="Data exposure">
            <Input value={dataExposure} onChange={(event) => setDataExposure(event.target.value)} />
          </FormField>
        </div>
        <div className="mt-3"><FormError message={supplierError} /></div>
      </ResourceActionPanel>
      {mode === "cases" && (
      <section>
        <ResourceTable
          headings={[terminologyTitle(terminology, "case"), "Type", "Status", "Progress", "Risk", "Outcome", "Last activity"]}
        >
          {scopedCases.map((caseRecord) => {
            return (
              <tr key={caseRecord.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">
                  <Link className="font-bold text-[#1d70b8] hover:underline" to={`/cases/${caseRecord.id}`}>
                    {caseRecord.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{caseRecord.caseType}</td>
                <td className="px-4 py-3"><StatusBadge status={caseRecord.status} /></td>
                <td className="px-4 py-3"><ProgressBar value={caseRecord.completedTasks} total={caseRecord.totalTasks} /></td>
                <td className="px-4 py-3 capitalize">{caseRecord.risk}</td>
                <td className="px-4 py-3">{caseRecord.outcome}</td>
                <td className="px-4 py-3">{caseRecord.lastActivity}</td>
              </tr>
            );
          })}
        </ResourceTable>
      </section>
      )}
      {mode === "suppliers" && (
      <section>
        <ResourceTable
          columnWidths={["w-[22%]", "w-[16%]", "w-[24%]", "w-[22%]", "w-[12rem]"]}
          headings={[terminologyTitle(terminology, "participantSupplier"), "Relationship", "Data exposure", `Linked ${terminologyLabel(terminology, "case", true)}`, "Actions"]}
        >
          {participantSuppliersForParticipant.map((relationship) => {
            const linkableCases = scopedCases.filter((caseRecord) => !caseRecord.participantSupplierId);
            const linkedCase = relationship.linkedCases[0] ?? null;
            const canLinkCase = !linkedCase && linkableCases.length > 0;
            return (
            <Fragment key={relationship.id}>
            <tr className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <span className="block font-bold text-[#0b0c0c] dark:text-white">{relationship.supplierName}</span>
                <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">{relationship.servicesProvided}</span>
              </td>
              <td className="px-4 py-3">{relationship.relationshipType}</td>
              <td className="px-4 py-3">{relationship.dataExposure}</td>
              <td className="px-4 py-3">
                {relationship.linkedCases.length > 0
                  ? relationship.linkedCases.map((caseRecord) => (
                      <Link key={caseRecord.id} className="block font-bold text-[#1d70b8] hover:underline" to={`/cases/${caseRecord.id}`}>
                        {caseRecord.title}
                      </Link>
                    ))
                  : `No ${terminologyLabel(terminology, "case")} linked`}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openLinkSupplier(relationship.id)}
                    disabled={!canLinkCase}
                  >
                    <Plus />
                    Link
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => linkedCase && unlinkSupplierFromCase(linkedCase.id)}
                    disabled={!linkedCase}
                  >
                    <XCircle />
                    Unlink
                  </Button>
                </div>
              </td>
            </tr>
            {linkingSupplierId === relationship.id && (
              <tr className="border-b border-[#b1b4b6] bg-white dark:bg-card">
                <td className="px-4 py-4" colSpan={5}>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
                    <FormField label={terminologyTitle(terminology, "case")}>
                      <SelectField value={supplierCaseId} onChange={setSupplierCaseId}>
                        <option value="">Select {terminologyLabel(terminology, "case")}</option>
                        {linkableCases.map((caseRecord) => (
                          <option key={caseRecord.id} value={caseRecord.id}>
                            {caseRecord.title}
                          </option>
                        ))}
                      </SelectField>
                    </FormField>
                    <Button type="button" onClick={linkSupplierToCase}>
                      <CheckCircle2 />
                      Link
                    </Button>
                    <Button type="button" variant="outline" onClick={closeLinkSupplier}>
                      Cancel
                    </Button>
                  </div>
                  <div className="mt-3"><FormError message={supplierLinkError} /></div>
                </td>
              </tr>
            )}
            </Fragment>
          );
          })}
        </ResourceTable>
      </section>
      )}
      {mode === "users" && (
      <section>
        <div className="mb-5 border-b border-[#b1b4b6]">
          <nav aria-label="User management sections" className="flex gap-1 overflow-x-auto">
            {[
              { id: "participants" as const, label: terminologyTitle(terminology, "participant", true) },
              { id: "agents" as const, label: terminologyTitle(terminology, "agent", true) },
              { id: "agent-organizations" as const, label: `${terminologyTitle(terminology, "agent")} organizations` },
            ].map((tab) => {
              const isCurrent = usersTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-11 rounded-none border-b-4 border-transparent px-4 font-bold",
                    isCurrent && "border-[#1d70b8] bg-white dark:bg-card",
                  )}
                  onClick={() => {
                    setUsersTab(tab.id);
                    setShowCreateUser(false);
                    setUserError(null);
                    setAgentOrganizationError(null);
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {usersTab === "participants" && (
          <ResourceTable headings={["User", "Email"]}>
            {participantUsers.map((account) => (
              <tr key={account.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3 font-bold text-[#1d70b8]">{account.name}</td>
                <td className="px-4 py-3">{account.email}</td>
              </tr>
            ))}
          </ResourceTable>
        )}

        {usersTab === "agents" && (
          <ResourceTable headings={[terminologyTitle(terminology, "agent"), "Email", "Organisation"]}>
            {agentUsers.map((account) => {
              const agent = scopedAgents.find((item) => item.id === account.membership.entityId);
              return (
                <tr key={account.id} className="border-b border-[#b1b4b6] last:border-b-0">
                  <td className="px-4 py-3 font-bold text-[#1d70b8]">{account.name}</td>
                  <td className="px-4 py-3">{account.email}</td>
                  <td className="px-4 py-3">{agent?.name ?? "No organisation"}</td>
                </tr>
              );
            })}
          </ResourceTable>
        )}

        {usersTab === "agent-organizations" && (
          <ResourceTable headings={["Organisation", "Assigned agents", "Granted access"]}>
            {agentOrganizations.map((agent) => {
              const assignedAgents = agentUsers.filter((account) => account.membership.entityId === agent.id).length;
              return (
                <tr key={agent.id} className="border-b border-[#b1b4b6] last:border-b-0">
                  <td className="px-4 py-3 font-bold text-[#1d70b8]">{agent.name}</td>
                  <td className="px-4 py-3">{assignedAgents}</td>
                  <td className="px-4 py-3">{agent.grantedParticipants}</td>
                </tr>
              );
            })}
          </ResourceTable>
        )}
      </section>
      )}
    </ConsoleLayout>
  );
}

export function AccessGrantsPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const [showCreate, setShowCreate] = useState(false);
  const [granteeType, setGranteeType] = useState<AccessGrantGranteeType>("STAKEHOLDER");
  const [granteeEntityId, setGranteeEntityId] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<AccessGrantPermissionLevel>("REQUEST_INFORMATION");
  const [dataScopeType, setDataScopeType] = useState<AccessGrantDataScopeType>("PARTICIPANT");
  const [dataScopeId, setDataScopeId] = useState("");
  const [status, setStatus] = useState<AccessGrantStatus>("ACTIVE");
  const [error, setError] = useState<string | null>(null);

  if (user.role === "stakeholder") return <Navigate to="/stakeholder" replace />;
  if (user.role === "agent") return <Navigate to="/cases" replace />;
  if (user.role === "authority-admin") return <Navigate to="/admin/participants" replace />;
  const terminology = getTerminologyForUser(user);

  const participant = getParticipant(user.participantId ?? undefined);
  if (!participant || !user.authorityId || !user.authenticatableUserId) return <Navigate to="/cases" replace />;

  const grants = getAccessGrantsForParticipant(participant.id);
  const grantableGrantees = granteeType === "AGENT"
    ? getGrantableAgentsForParticipant(participant.id)
    : getGrantableStakeholdersForParticipant(participant.id);
  const participantSuppliersForParticipant = getParticipantSuppliersForParticipant(participant.id);
  const stakeholderLabel = terminologyLabel(terminology, "stakeholder");
  const stakeholderTitle = terminologyTitle(terminology, "stakeholder");
  const agentLabel = terminologyLabel(terminology, "agent");
  const agentTitle = terminologyTitle(terminology, "agent");
  const granteeTypeLabel = granteeType === "AGENT" ? agentLabel : stakeholderLabel;
  const granteeTypeTitle = granteeType === "AGENT" ? agentTitle : stakeholderTitle;

  function createGrant() {
    setError(null);
    if (!granteeEntityId) {
      setError(`Select a ${granteeTypeLabel}.`);
      return;
    }
    try {
      db.createAccessGrant({
        authorityId: user.authorityId ?? "",
        participantId: participant?.id ?? "",
        granteeType,
        granteeStakeholderId: granteeType === "STAKEHOLDER" ? granteeEntityId : null,
        granteeAgentId: granteeType === "AGENT" ? granteeEntityId : null,
        permissionLevel,
        dataScopeType,
        dataScopeId: dataScopeType === "PARTICIPANT_SUPPLIER" ? dataScopeId : null,
        status,
        createdByUserId: user.authenticatableUserId ?? "",
      });
      refresh();
      setGranteeEntityId("");
      setPermissionLevel("REQUEST_INFORMATION");
      setDataScopeType("PARTICIPANT");
      setDataScopeId("");
      setStatus("ACTIVE");
      setShowCreate(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Access grant could not be created.");
    }
  }

  function updateGrantStatus(accessGrantId: string, nextStatus: AccessGrantStatus) {
    setError(null);
    try {
      db.updateAccessGrantStatus(accessGrantId, nextStatus);
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Access grant status could not be updated.");
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: participant.name, path: "/cases" },
        { label: terminologyTitle(terminology, "accessGrant", true) },
      ]}
    >
      <ParticipantNav
        actions={
          <Button type="button" onClick={() => setShowCreate((current) => !current)}>
            <UserPlus />
            Add grant
          </Button>
        }
      />
      <ResourceActionPanel
        open={showCreate}
        title={`Add ${terminologyLabel(terminology, "accessGrant")}`}
        description={`Grant scoped access to this ${terminologyLabel(terminology, "participant")}.`}
        onClose={() => setShowCreate(false)}
        footer={
          <Button type="button" onClick={createGrant}>
            <CheckCircle2 />
            Save
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-[12rem_1fr_14rem_14rem_14rem_10rem]">
          <FormField label="Grantee type">
            <SelectField
              value={granteeType}
              onChange={(value) => {
                setGranteeType(value as AccessGrantGranteeType);
                setGranteeEntityId("");
              }}
            >
              <option value="STAKEHOLDER">{stakeholderTitle}</option>
              <option value="AGENT">{agentTitle}</option>
            </SelectField>
          </FormField>
          <FormField label={granteeTypeTitle}>
            <SelectField value={granteeEntityId} onChange={setGranteeEntityId}>
              <option value="">Select {granteeTypeLabel}</option>
              {grantableGrantees.map((grantee) => (
                <option key={grantee.id} value={grantee.id}>
                  {grantee.name}
                </option>
              ))}
            </SelectField>
          </FormField>
          <FormField label="Permission">
            <SelectField value={permissionLevel} onChange={(value) => setPermissionLevel(value as AccessGrantPermissionLevel)}>
              <option value="READ_ONLY">Read only</option>
              <option value="REQUEST_INFORMATION">Request information</option>
              <option value="REVIEW_AND_COMMENT">Review and comment</option>
              <option value="CREATE_AND_EDIT">Create and edit</option>
              <option value="ADMINISTER_GRANTS">Administer grants</option>
            </SelectField>
          </FormField>
          <FormField label="Scope">
            <SelectField
              value={dataScopeType}
              onChange={(value) => {
                setDataScopeType(value as AccessGrantDataScopeType);
                setDataScopeId("");
              }}
            >
              <option value="PARTICIPANT">Entire {terminologyLabel(terminology, "participant")}</option>
              <option value="PARTICIPANT_SUPPLIER">{terminologyTitle(terminology, "participantSupplier")}</option>
            </SelectField>
          </FormField>
          <FormField label={terminologyTitle(terminology, "participantSupplier")}>
            <SelectField
              value={dataScopeId}
              onChange={setDataScopeId}
              disabled={dataScopeType !== "PARTICIPANT_SUPPLIER"}
            >
              <option value="">Select record</option>
              {participantSuppliersForParticipant.map((relationship) => (
                <option key={relationship.id} value={relationship.id}>{relationship.supplierName}</option>
              ))}
            </SelectField>
          </FormField>
          <FormField label="Status">
            <SelectField value={status} onChange={(value) => setStatus(value as AccessGrantStatus)}>
              <option value="INVITED">Invited</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </SelectField>
          </FormField>
        </div>
        <div className="mt-3"><FormError message={error} /></div>
      </ResourceActionPanel>
      <section>
        <ResourceTable headings={["Grantee", "Type", "Permission", "Scope", "Status", "Created", "Actions"]}>
          {grants.map((grant) => (
            <tr key={grant.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">
                <span className="block font-bold text-[#1d70b8]">{grant.granteeName}</span>
                <span className="mt-1 block text-xs text-[#505a5f] dark:text-muted-foreground">
                  Created by {grant.createdByName}
                </span>
              </td>
              <td className="px-4 py-3">{grant.granteeType === "AGENT" ? agentTitle : stakeholderTitle}</td>
              <td className="px-4 py-3">{grant.permissionLabel}</td>
              <td className="px-4 py-3">{grant.scopeLabel}</td>
              <td className="px-4 py-3"><GrantStatusBadge status={grant.status} /></td>
              <td className="px-4 py-3">{new Date(grant.createdAt).toLocaleDateString("en-GB")}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {grant.status !== "ACTIVE" && (
                    <Button type="button" variant="outline" onClick={() => updateGrantStatus(grant.id, "ACTIVE")}>
                      <CheckCircle2 />
                      Activate
                    </Button>
                  )}
                  {grant.status === "ACTIVE" && (
                    <Button type="button" variant="outline" onClick={() => updateGrantStatus(grant.id, "SUSPENDED")}>
                      <Clock3 />
                      Suspend
                    </Button>
                  )}
                  {grant.status !== "REVOKED" && (
                    <Button type="button" variant="outline" onClick={() => updateGrantStatus(grant.id, "REVOKED")}>
                      <XCircle />
                      Revoke
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </ResourceTable>
      </section>
    </ConsoleLayout>
  );
}

export function CaseDetailPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const { caseId } = useParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [requestResponseText, setRequestResponseText] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  if (user.role === "stakeholder") return <Navigate to="/stakeholder" replace />;
  if (user.role === "authority-admin") return <Navigate to="/admin/participants" replace />;
  const terminology = getTerminologyForUser(user);
  const caseRecord = getCase(caseId);
  if (!caseRecord) return <Navigate to="/cases" replace />;
  const scopedCaseIds = new Set(getScopedCases(user).map((item) => item.id));
  if (!scopedCaseIds.has(caseRecord.id)) return <Navigate to="/cases" replace />;

  const currentCase = caseRecord;
  const participant = getParticipant(caseRecord.participantId);
  const helperGrant = getHelperGrantForParticipant(user, caseRecord.participantId);
  const canRespondToRequests = user.role === "participant" || grantAllowsHelperEdit(helperGrant);
  const tasks = caseRecord.tasks;
  const requests = getRequestsForCase(caseRecord.id, user);
  const activeRequests = requests.filter((request) => request.status === "OPEN" || request.status === "IN_PROGRESS");
  const canSubmitCase =
    user.role === "participant" &&
    caseRecord.domainStatus !== "COMPLETE" &&
    caseRecord.domainStatus !== "WITHDRAWN" &&
    tasks.length > 0 &&
    tasks.every((task) => task.domainStatus === "SUBMITTED" || task.domainStatus === "PASSED" || task.domainStatus === "WITHDRAWN");

  function submitCase() {
    setSubmitError(null);
    try {
      db.submitCase(currentCase.id);
      refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The case could not be submitted.");
    }
  }

  function openRequestResponse(requestId: string, currentResponse: string) {
    setRespondingRequestId(requestId);
    setRequestResponseText(currentResponse);
    setRequestError(null);
  }

  function saveRequestResponse(status: Extract<RequestForInformationStatus, "IN_PROGRESS" | "ANSWERED">) {
    setRequestError(null);
    if (!respondingRequestId) {
      setRequestError("Select a request to respond to.");
      return;
    }
    if (!user.authenticatableUserId) {
      setRequestError("No participant user is selected for this session.");
      return;
    }
    try {
      db.respondToRequestForInformation({
        requestId: respondingRequestId,
        responseText: requestResponseText,
        respondedByUserId: user.authenticatableUserId,
        status,
      });
      refresh();
      setRespondingRequestId(null);
      setRequestResponseText("");
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "Request response could not be saved.");
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: terminologyTitle(terminology, "case", true), path: "/cases" },
        { label: `${participant?.name ?? "Organization"} ${caseRecord.reference}` },
      ]}
      readOnly
    >
      <PageTitle
        title={caseRecord.title}
        actions={
          user.role === "participant" ? (
            <Button type="button" onClick={submitCase} disabled={!canSubmitCase}>
              <SendHorizontal />
              Submit {terminologyLabel(terminology, "case")}
            </Button>
          ) : undefined
        }
      />
      <FormError message={submitError} />
      <MetricStrip
        items={[
          { label: `${terminologyTitle(terminology, "case")} status`, value: caseRecord.status, tone: caseRecord.status === "review" ? "yellow" : "blue" },
          { label: `${terminologyTitle(terminology, "task", true)} complete`, value: `${caseRecord.completedTasks}/${caseRecord.totalTasks}`, tone: "green" },
          { label: "Open requests", value: String(activeRequests.length), tone: activeRequests.length > 0 ? "red" : "green" },
          { label: `Linked ${terminologyLabel(terminology, "participantSupplier")}`, value: caseRecord.participantSupplierName ?? terminologyTitle(terminology, "participant"), tone: caseRecord.participantSupplierName ? "yellow" : "blue" },
        ]}
      />
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "stakeholder")} requests</h3>
        <FormError message={requestError} />
        {respondingRequestId && (
          <ResourceActionPanel
            open
            title="Respond to request"
            description={`Save a ${terminologyLabel(terminology, "participant")} response without changing ${terminologyLabel(terminology, "task")} answers or ${terminologyLabel(terminology, "evidence")} metadata.`}
            onClose={() => setRespondingRequestId(null)}
            footer={
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => saveRequestResponse("IN_PROGRESS")}>
                  <Save />
                  Save progress
                </Button>
                <Button type="button" onClick={() => saveRequestResponse("ANSWERED")}>
                  <CheckCircle2 />
                  Mark answered
                </Button>
              </div>
            }
          >
            <FormField label={`${terminologyTitle(terminology, "participant")} response`}>
              <Input value={requestResponseText} onChange={(event) => setRequestResponseText(event.target.value)} />
            </FormField>
          </ResourceActionPanel>
        )}
        <ResourceTable headings={[terminologyTitle(terminology, "stakeholder"), "Scope", "Status", "Request", "Response", "Actions"]}>
          {requests.map((request) => (
            <tr key={request.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3">{request.stakeholderName}</td>
              <td className="px-4 py-3">{request.scopeLabel}</td>
              <td className="px-4 py-3"><RequestStatusBadge status={request.status} /></td>
              <td className="px-4 py-3">{request.requestText}</td>
              <td className="px-4 py-3">{request.responseText || "No response yet"}</td>
              <td className="px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openRequestResponse(request.id, request.responseText)}
                  disabled={!canRespondToRequests || request.status === "ACCEPTED" || request.status === "WITHDRAWN"}
                >
                  <History />
                  Respond
                </Button>
              </td>
            </tr>
          ))}
        </ResourceTable>
      </section>
      <section className="mt-8">
        <h3 className="mb-3 text-xl font-bold">{terminologyTitle(terminology, "task", true)}</h3>
        <div className="grid gap-3">
          {tasks.map((task) => {
            const Icon = task.Icon;
            return (
              <Link
                key={task.id}
                to={`/cases/${caseRecord.id}/tasks/${task.id}`}
                className="grid gap-4 border border-[#b1b4b6] bg-white p-4 hover:border-[#1d70b8] dark:bg-card md:grid-cols-[auto_1fr_auto]"
              >
                <span className="flex size-11 items-center justify-center rounded-sm bg-[#eaf4fb] text-[#1d70b8]">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-lg font-bold text-[#1d70b8]">{task.title}</span>
                  <span className="mt-1 block text-sm text-[#505a5f] dark:text-muted-foreground">{task.description}</span>
                  <span className="mt-2 block text-xs font-bold text-[#505a5f] dark:text-muted-foreground">
                    Due: {task.due} · Status: {task.domainStatus.replace("_", " ")}
                  </span>
                  {task.domainStatus === "FAILED" && (
                    <span className="mt-2 block text-sm font-bold text-[#d4351c]">
                      Review outcome: more evidence requested.
                    </span>
                  )}
                  {task.domainStatus === "PASSED" && (
                    <span className="mt-2 block text-sm font-bold text-[#00703c]">
                      Review outcome: passed.
                    </span>
                  )}
                </span>
                <span className="self-start"><StatusBadge status={task.status} /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </ConsoleLayout>
  );
}

export function TaskDetailPage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const { caseId, taskId } = useParams();
  const [isEdited, setIsEdited] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [requestResponseText, setRequestResponseText] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const caseRecord = getCase(caseId);
  const task = getTask(caseId, taskId);

  useEffect(() => {
    if (!task) return;
    setResponseText(task.responseText);
    setIsEdited(false);
    setError(null);
  }, [task?.id, task?.responseText]);

  if (user.role === "stakeholder") return <Navigate to="/stakeholder" replace />;
  if (user.role === "authority-admin") return <Navigate to="/admin/participants" replace />;
  const terminology = getTerminologyForUser(user);

  if (!caseRecord || !task) return <Navigate to="/cases" replace />;
  const scopedCaseIds = new Set(getScopedCases(user).map((item) => item.id));
  if (!scopedCaseIds.has(caseRecord.id)) return <Navigate to="/cases" replace />;

  const currentTask = task;
  const participant = getParticipant(caseRecord.participantId);
  const helperGrant = getHelperGrantForParticipant(user, caseRecord.participantId);
  const Icon = task.Icon;
  const taskRequests = getRequestsForTask(task.id, user);
  const canEditTask =
    (user.role === "participant" || grantAllowsHelperEdit(helperGrant)) &&
    task.domainStatus !== "SUBMITTED" &&
    task.domainStatus !== "PASSED" &&
    task.domainStatus !== "WITHDRAWN";
  const canSubmitTask =
    canEditTask &&
    task.domainStatus !== "SUBMITTED" &&
    task.domainStatus !== "PASSED" &&
    task.domainStatus !== "WITHDRAWN" &&
    (responseText.trim().length > 0 || task.evidenceFiles.length > 0);
  const statusText = task.domainStatus.replace("_", " ");

  function saveResponse() {
    setError(null);
    try {
      db.completeTask({
        taskId: currentTask.id,
        responseJson: {
          summary: responseText.trim(),
          savedAt: new Date().toISOString(),
        },
      });
      refresh();
      setIsEdited(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The task response could not be saved.");
    }
  }

  function uploadEvidence(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    const uploadedAt = new Date().toISOString();
    const nextFiles = [
      ...currentTask.evidenceFiles,
      ...Array.from(files).map((file) => ({
        name: file.name,
        size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        uploadedAt,
      })),
    ];
    try {
      db.uploadEvidence({
        taskId: currentTask.id,
        evidenceJson: {
          files: nextFiles,
        },
      });
      refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : `${terminologyTitle(terminology, "evidence")} metadata could not be uploaded.`);
    }
  }

  function submitTaskUpdate() {
    setError(null);
    try {
      if (isEdited) {
        db.completeTask({
          taskId: currentTask.id,
          responseJson: {
            summary: responseText.trim(),
            savedAt: new Date().toISOString(),
          },
        });
      }
      db.submitTask(currentTask.id);
      refresh();
      setIsEdited(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The task could not be submitted.");
    }
  }

  function openRequestResponse(requestId: string, currentResponse: string) {
    setRespondingRequestId(requestId);
    setRequestResponseText(currentResponse);
    setRequestError(null);
  }

  function saveRequestResponse(status: Extract<RequestForInformationStatus, "IN_PROGRESS" | "ANSWERED">) {
    setRequestError(null);
    if (!respondingRequestId) {
      setRequestError("Select a request to respond to.");
      return;
    }
    if (!user.authenticatableUserId) {
      setRequestError("No participant user is selected for this session.");
      return;
    }
    try {
      db.respondToRequestForInformation({
        requestId: respondingRequestId,
        responseText: requestResponseText,
        respondedByUserId: user.authenticatableUserId,
        status,
      });
      refresh();
      setRespondingRequestId(null);
      setRequestResponseText("");
    } catch (caught) {
      setRequestError(caught instanceof Error ? caught.message : "Request response could not be saved.");
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: terminologyTitle(terminology, "case", true), path: "/cases" },
        { label: `${participant?.name ?? "Organization"} ${caseRecord.reference}`, path: `/cases/${caseRecord.id}` },
        { label: task.title },
      ]}
      isEdited={isEdited}
    >
      <PageTitle
        title={task.title}
        actions={
          <label
            className={cn(
              "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90",
              !canEditTask && "pointer-events-none opacity-50",
            )}
          >
              <Upload className="size-4" />
            Upload evidence
            <input
              className="sr-only"
              disabled={!canEditTask}
              multiple
              type="file"
              onChange={(event) => {
                uploadEvidence(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        }
      />
      <FormError message={error} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-[#b1b4b6] bg-white p-5 dark:bg-card">
          <div className="flex items-start gap-4">
            <span className="flex size-12 items-center justify-center rounded-sm bg-[#eaf4fb] text-[#1d70b8]">
              <Icon className="size-6" />
            </span>
            <div>
              <StatusBadge status={task.status} />
              <h3 className="mt-4 text-xl font-bold">Work area</h3>
              <p className="mt-2 text-sm leading-6 text-[#505a5f] dark:text-muted-foreground">
                Record the response and {terminologyLabel(terminology, "evidence")} metadata for this {terminologyLabel(terminology, "task")}, then submit it when it is ready for {terminologyLabel(terminology, "stakeholder")} review.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <FormField label="Response">
              <textarea
                className="min-h-36 w-full border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-input/30"
                disabled={!canEditTask}
                value={responseText}
                onChange={(event) => {
                  setResponseText(event.target.value);
                  setIsEdited(event.target.value !== task.responseText);
                }}
              />
            </FormField>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={saveResponse} disabled={!isEdited || !canEditTask}>
                <Save />
                Save response
              </Button>
              <Button type="button" onClick={submitTaskUpdate} disabled={!canSubmitTask}>
                <SendHorizontal />
                Submit item
              </Button>
            </div>
            <div>
              <h4 className="mb-2 text-base font-bold">{terminologyTitle(terminology, "evidence")}</h4>
              {task.evidenceFiles.length === 0 ? (
                <p className="text-sm text-[#505a5f] dark:text-muted-foreground">No {terminologyLabel(terminology, "evidence")} metadata has been uploaded.</p>
              ) : (
                <ResourceTable headings={["File", "Size", "Uploaded"]}>
                  {task.evidenceFiles.map((file) => (
                    <tr key={`${file.name}-${file.uploadedAt}`} className="border-b border-[#b1b4b6] last:border-b-0">
                      <td className="px-4 py-3 font-bold text-[#1d70b8]">{file.name}</td>
                      <td className="px-4 py-3">{file.size}</td>
                      <td className="px-4 py-3">{new Date(file.uploadedAt).toLocaleString("en-GB")}</td>
                    </tr>
                  ))}
                </ResourceTable>
              )}
            </div>
          </div>
        </section>
        <aside className="border border-[#b1b4b6] bg-white p-5 dark:bg-card">
          <h3 className="text-xl font-bold">Details</h3>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Due date</dt>
              <dd>{task.due}</dd>
            </div>
            <div>
              <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Type</dt>
              <dd>{task.type}</dd>
            </div>
            <div>
              <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Review outcome</dt>
              <dd className="capitalize">{statusText.toLowerCase()}</dd>
              {task.domainStatus === "FAILED" && (
                <dd className="mt-2 text-sm font-bold text-[#d4351c]">More evidence requested.</dd>
              )}
              {task.domainStatus === "PASSED" && (
                <dd className="mt-2 text-sm font-bold text-[#00703c]">Accepted for this {terminologyLabel(terminology, "case")}.</dd>
              )}
            </div>
            <div>
              <dt className="font-bold text-[#505a5f] dark:text-muted-foreground">Timeline</dt>
              <dd className="mt-2 flex items-center gap-2">
                <Clock3 className="size-4 text-[#1d70b8]" />
                Last updated {new Date(task.updatedAt).toLocaleString("en-GB")}
              </dd>
              <dd className="mt-2 flex items-center gap-2">
                <History className="size-4 text-[#1d70b8]" />
                {task.evidenceFiles.length} evidence upload{task.evidenceFiles.length === 1 ? "" : "s"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
      {taskRequests.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-xl font-bold">Requests for this item</h3>
          <FormError message={requestError} />
          {respondingRequestId && (
            <ResourceActionPanel
              open
              title="Respond to request"
              description={`Add a response to the ${terminologyLabel(terminology, "stakeholder")}'s request without overwriting this ${terminologyLabel(terminology, "task")} answer.`}
              onClose={() => setRespondingRequestId(null)}
              footer={
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => saveRequestResponse("IN_PROGRESS")}>
                    <Save />
                    Save progress
                  </Button>
                  <Button type="button" onClick={() => saveRequestResponse("ANSWERED")}>
                    <CheckCircle2 />
                    Mark answered
                  </Button>
                </div>
              }
            >
            <FormField label={`${terminologyTitle(terminology, "participant")} response`}>
              <Input value={requestResponseText} onChange={(event) => setRequestResponseText(event.target.value)} />
            </FormField>
            </ResourceActionPanel>
          )}
          <ResourceTable headings={[terminologyTitle(terminology, "stakeholder"), "Status", "Request", "Response", "Actions"]}>
            {taskRequests.map((request) => (
              <tr key={request.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3">{request.stakeholderName}</td>
                <td className="px-4 py-3"><RequestStatusBadge status={request.status} /></td>
                <td className="px-4 py-3">{request.requestText}</td>
                <td className="px-4 py-3">{request.responseText || "No response yet"}</td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openRequestResponse(request.id, request.responseText)}
                    disabled={
                      (!grantAllowsHelperEdit(helperGrant) && user.role !== "participant") ||
                      request.status === "ACCEPTED" ||
                      request.status === "WITHDRAWN"
                    }
                  >
                    <History />
                    Respond
                  </Button>
                </td>
              </tr>
            ))}
          </ResourceTable>
        </section>
      )}
    </ConsoleLayout>
  );
}

export function AdminReferencePage() {
  const { user } = useAuth();
  const { db, refresh } = useDomainData();
  const location = useLocation();
  const terminology = getAuthorityTerminology(user.authorityId ?? undefined);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [userError, setUserError] = useState<string | null>(null);
  if (user.role !== "authority-admin") return <Navigate to="/" replace />;
  const authorityId = user.authorityId ?? undefined;
  const authorityUsers = authenticatableUsers.filter(
    (account) =>
      account.membership.entityType === "authority" &&
      account.membership.entityId === authorityId,
  );
  const resource = location.pathname.includes("task-types") ? "task-types" : "users";
  const titleMap: Record<typeof resource, string> = {
    "task-types": taskTypeTitle(terminology, true),
    users: "Users",
  };

  function createAuthorityUser() {
    setUserError(null);
    if (!authorityId) {
      setUserError("No authority is selected for this session.");
      return;
    }
    if (!newUserName.trim()) {
      setUserError("Enter a user name.");
      return;
    }
    if (!newUserEmail.trim()) {
      setUserError("Enter an email address.");
      return;
    }
    try {
      db.createAuthorityUser(authorityId, {
        displayName: newUserName.trim(),
        email: newUserEmail.trim(),
      });
      refresh();
      setNewUserName("");
      setNewUserEmail("");
      setShowCreateUser(false);
    } catch (caught) {
      setUserError(caught instanceof Error ? caught.message : "Authority user could not be created.");
    }
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: "Administration", path: "/admin/participants" },
        { label: titleMap[resource] },
      ]}
    >
      <AdministrationResourceNav
        actions={
          resource === "users" ? (
            <Button type="button" onClick={() => setShowCreateUser((current) => !current)}>
              <UserPlus />
              Create user
            </Button>
          ) : undefined
        }
      />
      {resource === "task-types" && (
        <ResourceTable headings={["Code", "Name", "Status", "Description"]}>
          {taskTypes.map((taskType) => (
            <tr key={taskType.id} className="border-b border-[#b1b4b6] last:border-b-0">
              <td className="px-4 py-3 font-mono text-xs">{taskType.code}</td>
              <td className="px-4 py-3 font-bold text-[#1d70b8]">{taskType.name}</td>
              <td className="px-4 py-3">{taskType.status}</td>
              <td className="px-4 py-3">{taskType.description}</td>
            </tr>
          ))}
        </ResourceTable>
      )}
      {resource === "users" && (
        <>
          <ResourceActionPanel
            open={showCreateUser}
            title="Create authority user"
            description="Create a login user for this authority."
            onClose={() => setShowCreateUser(false)}
            footer={
              <Button type="button" onClick={createAuthorityUser}>
                <CheckCircle2 />
                Save
              </Button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Display name">
                <Input value={newUserName} onChange={(event) => setNewUserName(event.target.value)} />
              </FormField>
              <FormField label="Email">
                <Input type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} />
              </FormField>
            </div>
            <div className="mt-3"><FormError message={userError} /></div>
          </ResourceActionPanel>
          <ResourceTable headings={["User", "Email"]}>
            {authorityUsers.map((account) => (
              <tr key={account.id} className="border-b border-[#b1b4b6] last:border-b-0">
                <td className="px-4 py-3 font-bold text-[#1d70b8]">{account.name}</td>
                <td className="px-4 py-3">{account.email}</td>
              </tr>
            ))}
          </ResourceTable>
        </>
      )}
    </ConsoleLayout>
  );
}
