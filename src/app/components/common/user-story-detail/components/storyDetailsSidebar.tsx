import { useMemo, useState, type ComponentProps, type Dispatch, type SetStateAction } from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors } from '@/src/styles/colors';
import { DetailRow } from '../../task-detail/components/detail-row';
import {
  EditableDate,
  EditableNumber,
  EditablePriority,
} from '../../task-detail/components/editable-fields';
import { useGetUserStoryStatuses } from '@/src/modules/tasks/hooks/useUserStory';
import type { EditableUserStoryFields } from '@/src/types/userstories';
import { AssigneeField, ReporterField, SprintField } from './assigneeReporterFileds';
import UserStoryStatusSelector from './userStoryStatusSelector';

type StoryDetailsData = Pick<
  EditableUserStoryFields,
  'priority' | 'status' | 'storyPoints' | 'assigneeId' | 'reporterId' | 'sprintId' | 'due_date'
> & {
  assigneeName: string;
  assigneeInitials: string;
  assigneeColor: ComponentProps<typeof AssigneeField>['assigneeColor'];
  reporterName: string;
  reporterInitials: string;
  reporterColor: ComponentProps<typeof ReporterField>['reporterColor'];
};

interface StoryDetailsSidebarProps {
  projectId: string;
  userStoryData: StoryDetailsData;
  canEditUserStory: boolean;
  currentUserId: ComponentProps<typeof AssigneeField>['currentUserId'];
  handleUpdate: (patch: Partial<EditableUserStoryFields>) => Promise<void>;
  handleAssignToMe: () => void;
  handleMoveToBacklog: () => Promise<void>;
  selectedSprintName: string;
  setSelectedSprintName: Dispatch<SetStateAction<string>>;
  isMobile: boolean;
  mobileTab: 'content' | 'details';
  width: number;
}

export const StoryDetailsSidebar = ({
  projectId,
  userStoryData,
  canEditUserStory,
  currentUserId,
  handleUpdate,
  handleAssignToMe,
  handleMoveToBacklog,
  selectedSprintName,
  setSelectedSprintName,
  isMobile,
  mobileTab,
  width,
}: StoryDetailsSidebarProps) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const { userStoryStatuses = [] } = useGetUserStoryStatuses(projectId);

  const userStoryStatusOptions = userStoryStatuses.map((status) => ({
    value: status.id,
    label: status.name,
    color: status.color,
    bg: `${status.color}18`,
    dot: status.color,
    is_final: status.is_final,
  }));

  const userStoryStatusConfig = Object.fromEntries(
    userStoryStatusOptions.map((option) => [option.value, option])
  );

  const isDueDateExpired = useMemo(() => {
    if (!userStoryData.due_date) return false;

    const dueDate = new Date(userStoryData.due_date);
    const today = new Date();

    // Compare dates only, ignoring time
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
  }, [userStoryData.due_date]);

  const dueDateField = (
    <EditableDate
      value={userStoryData.due_date}
      onChange={(dueDate) => handleUpdate({ due_date: dueDate })}
      placeholder="Set due date"
      includeTime={false}
      disabled={!canEditUserStory}
    />
  );

  return (
    <div
      className={`overflow-y-auto bg-gray-50/60 dark:bg-slate-950/50 ${
        mobileTab === 'content' ? 'hidden sm:block sm:shrink-0' : 'block w-full sm:shrink-0'
      }`}
      style={{ width: isMobile ? undefined : width }}
    >
      {/* Status */}
      <UserStoryStatusSelector
        status={userStoryData.status}
        canEditUserStory={canEditUserStory}
        showStatusMenu={showStatusMenu}
        setShowStatusMenu={setShowStatusMenu}
        statusConfig={userStoryStatusConfig}
        statusOptions={userStoryStatusOptions}
        fallbackBg={colors.colTodoBg}
        fallbackDot={colors.colTodo}
        onStatusChange={(status) => handleUpdate({ status })}
      />

      {/* Details */}
      <div className="px-5 py-5 border-b border-gray-200">
        <p className="text-base font-semibold text-gray-800 mb-2 dark:text-slate-100">Details</p>

        <AssigneeField
          projectId={projectId}
          assigneeId={userStoryData.assigneeId}
          assigneeName={userStoryData.assigneeName}
          assigneeInitials={userStoryData.assigneeInitials}
          assigneeColor={userStoryData.assigneeColor}
          canEditUserStory={canEditUserStory}
          currentUserId={currentUserId}
          handleUpdate={handleUpdate}
          handleAssignToMe={handleAssignToMe}
        />

        <ReporterField
          projectId={projectId}
          reporterId={userStoryData.reporterId}
          reporterName={userStoryData.reporterName}
          reporterInitials={userStoryData.reporterInitials}
          reporterColor={userStoryData.reporterColor}
          canEditUserStory={canEditUserStory}
          handleUpdate={handleUpdate}
        />

        <DetailRow label="Priority">
          <EditablePriority
            value={userStoryData.priority}
            onChange={(priority) => handleUpdate({ priority })}
            disabled={!canEditUserStory}
          />
        </DetailRow>

        <DetailRow label="Story pts">
          <EditableNumber
            value={userStoryData.storyPoints}
            onChange={(storyPoints) => handleUpdate({ storyPoints })}
            disabled={!canEditUserStory}
          />
        </DetailRow>

        <SprintField
          projectId={projectId}
          sprintId={userStoryData.sprintId}
          canEditUserStory={canEditUserStory}
          selectedSprintName={selectedSprintName}
          setSelectedSprintName={setSelectedSprintName}
          handleUpdate={handleUpdate}
          handleMoveToBacklog={handleMoveToBacklog}
        />

        <DetailRow label="Due Date">
          {isDueDateExpired ? (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-red-50 px-2 py-1 text-sm text-red-600 dark:bg-gray-100">
              <AlertTriangle size={14} />
              {dueDateField}
            </div>
          ) : (
            dueDateField
          )}
        </DetailRow>
      </div>
    </div>
  );
};

export default StoryDetailsSidebar;
