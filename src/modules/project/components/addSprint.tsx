'use client';

import { useState } from 'react';
import { Minus, Plus, X, ChevronUp, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Sprint } from '../types/project';
import { WpButton } from '@/src/app/components/common/button';
import { WpInput } from '@/src/app/components/common/input';
import { WpDropdown } from '@/src/app/components/common/dropdown';
import { statusOptionss } from '../data/project';
interface AddSprintModalProps {
  onClose: () => void;
  onCreate: (sprints: Sprint[]) => void;
}
const AddSprintModal = ({ onClose, onCreate }: AddSprintModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [sprintCount, setSprintCount] = useState(1);
  const [sprintForms, setSprintForms] = useState<Sprint[]>([]);
  const [openSprint, setOpenSprint] = useState(0);
  const handleNext = () => {
    const newSprintForms: Sprint[] = Array.from({ length: sprintCount }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      name: `Sprint ${index + 1}`,
      startDate: '',
      endDate: '',
      status: 'Planned',
      tasks: 0,
    }));
    setSprintForms(newSprintForms);
    setOpenSprint(0);
    setStep(2);
  };

  const updateSprint = (index: number, field: keyof Sprint, value: string) => {
    setSprintForms((prev) =>
      prev.map((sprint, i) =>
        i === index
          ? {
              ...sprint,
              [field]: value,
            }
          : sprint
      )
    );
  };

  const handleCreateSprints = () => {
    onCreate(sprintForms);
    setSprintForms([]);
    setSprintCount(1);
    setOpenSprint(0);
    setStep(1);
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
                {sprintCount} sprint
                {sprintCount > 1 ? 's' : ''} will be created.
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
            <div className="space-y-3 p-5">
              {sprintForms.map((sprint, index) => {
                const isOpen = openSprint === index;
                return (
                  <div
                    key={sprint.id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
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
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
                          {sprint.status}
                        </span>
                      </div>
                    </WpButton>
                    {isOpen && (
                      <div className="border-t p-4">
                        <WpInput
                          id={`sprint-name-${sprint.id}`}
                          label="Sprint name"
                          value={sprint.name}
                          onChange={(e) => updateSprint(index, 'name', e.target.value)}
                        />
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <WpInput
                              id={`start-date-${sprint.id}`}
                              type="date"
                              label="Start date"
                              value={sprint.startDate}
                              onChange={(e) => updateSprint(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <WpInput
                              id={`end-date-${sprint.id}`}
                              type="date"
                              label="Due date"
                              value={sprint.endDate}
                              onChange={(e) => updateSprint(index, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        <WpDropdown
                          label="Status"
                          options={statusOptionss}
                          value={sprint.status}
                          onChange={(value) => updateSprint(index, 'status', value)}
                          placeholder="Select status"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between border-t p-5">
              <WpButton
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                leftIcon={<ArrowLeft size={16} />}
              >
                Back
              </WpButton>
              <WpButton variant="primary" size="md" onClick={handleCreateSprints}>
                Create Sprints
              </WpButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddSprintModal;
