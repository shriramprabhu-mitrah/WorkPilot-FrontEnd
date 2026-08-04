'use client';

import { useState } from 'react';
import { Minus, Plus, X, ChevronUp, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { useCreateSprint } from '../hooks/useSprint';
import { SprintPayload } from '@/src/types/project';

interface SprintForm {
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
}

interface AddSprintModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddSprintModal = ({ projectId, onClose, onSuccess }: AddSprintModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [sprintCount, setSprintCount] = useState(1);
  const [sprintForms, setSprintForms] = useState<SprintForm[]>([]);
  const [openSprint, setOpenSprint] = useState(0);

  const { createSprint, isCreatingSprint } = useCreateSprint(projectId);

  const handleNext = () => {
    const newSprintForms: SprintForm[] = Array.from({ length: sprintCount }, (_, index) => ({
      name: `Sprint ${index + 1}`,
      goal: '',
      start_date: '',
      end_date: '',
    }));
    setSprintForms(newSprintForms);
    setOpenSprint(0);
    setStep(2);
  };

  const updateSprint = (index: number, field: keyof SprintForm, value: string) => {
    setSprintForms((prev) =>
      prev.map((sprint, i) => (i === index ? { ...sprint, [field]: value } : sprint))
    );
  };

  const handleCreateSprints = async () => {
    try {
      const payload: SprintPayload = {
        sprints: sprintForms.map((form) => ({
          name: form.name,
          goal: form.goal || undefined,
          start_date: form.start_date,
          end_date: form.end_date,
        })),
      };
      await createSprint(payload);
      onSuccess?.();
      onClose();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-md overflow-visible rounded-2xl bg-white shadow-xl">
        {step === 1 && (
          <>
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-xl font-bold">Add Sprints</h2>
              <WpButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="p-2"
                leftIcon={<X size={18} />}
              />
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500">How many sprints do you want to create?</p>
              <div className="mt-5 flex items-center gap-3">
                <WpButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSprintCount((prev) => Math.max(1, prev - 1))}
                  className="h-10 w-10 p-0"
                  leftIcon={<Minus size={16} />}
                />
                <div className="flex h-10 w-16 items-center justify-center rounded-lg border font-semibold">
                  {sprintCount}
                </div>
                <WpButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSprintCount((prev) => prev + 1)}
                  className="h-10 w-10 p-0"
                  leftIcon={<Plus size={16} />}
                />
              </div>
              <p className="mt-4 text-xs text-gray-400">
                {sprintCount} sprint{sprintCount > 1 ? 's' : ''} will be created.
              </p>
            </div>
            <div className="flex justify-between border-t p-5">
              <WpButton variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </WpButton>
              <WpButton
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight size={16} />}
              >
                Next
              </WpButton>
            </div>
          </>
        )}
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white">
          {step === 2 && (
            <>
              <div className="flex items-center justify-between border-b p-5">
                <h2 className="text-xl font-bold">Configure {sprintForms.length} Sprints</h2>
                <WpButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  aria-label="Close"
                  className="p-2"
                  leftIcon={<X size={18} />}
                />
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
                {sprintForms.map((sprint, index) => {
                  const isOpen = openSprint === index;
                  return (
                    <div key={index} className="overflow-hidden rounded-xl border border-gray-200">
                      <WpButton
                        variant="ghost"
                        size="md"
                        type="button"
                        onClick={() => setOpenSprint(isOpen ? -1 : index)}
                        className="w-full justify-between rounded-none p-4 text-gray-900 hover:bg-gray-50"
                        rightIcon={isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium">{sprint.name}</span>
                        </div>
                      </WpButton>
                      {isOpen && (
                        <div className="p-4 space-y-3">
                          <WpInput
                            id={`sprint-name-${index}`}
                            label="Sprint name"
                            value={sprint.name}
                            onChange={(e) => updateSprint(index, 'name', e.target.value)}
                          />
                          <WpInput
                            id={`sprint-goal-${index}`}
                            label="Goal"
                            value={sprint.goal}
                            onChange={(e) => updateSprint(index, 'goal', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <WpInput
                              id={`start-date-${index}`}
                              type="date"
                              label="Start date"
                              value={sprint.start_date}
                              onChange={(e) => updateSprint(index, 'start_date', e.target.value)}
                            />
                            <WpInput
                              id={`end-date-${index}`}
                              type="date"
                              label="Due date"
                              value={sprint.end_date}
                              onChange={(e) => updateSprint(index, 'end_date', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between p-5">
                <WpButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft size={16} />}
                >
                  Back
                </WpButton>
                <WpButton
                  variant="primary"
                  size="md"
                  onClick={handleCreateSprints}
                  disabled={isCreatingSprint}
                >
                  {isCreatingSprint ? 'Creating...' : 'Create Sprints'}
                </WpButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSprintModal;
