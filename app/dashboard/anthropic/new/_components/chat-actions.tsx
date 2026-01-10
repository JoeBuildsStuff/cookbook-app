"use client";

import { Button } from "@/components/ui/button";
import {
  Pencil,
  GraduationCap,
  Code,
  Coffee,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const GoogleDriveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 229"
    width="16"
    height="16"
    style={{ opacity: 1 }}
  >
    <path
      fill="#0066DA"
      d="m19.354 196.034l11.29 19.5c2.346 4.106 5.718 7.332 9.677 9.678q17.009-21.591 23.68-33.137q6.77-11.717 16.641-36.655q-26.604-3.502-40.32-3.502q-13.165 0-40.322 3.502c0 4.545 1.173 9.09 3.519 13.196z"
    />
    <path
      fill="#EA4335"
      d="M215.681 225.212c3.96-2.346 7.332-5.572 9.677-9.677l4.692-8.064l22.434-38.855a26.57 26.57 0 0 0 3.518-13.196q-27.315-3.502-40.247-3.502q-13.899 0-40.248 3.502q9.754 25.075 16.422 36.655q6.724 11.683 23.752 33.137"
    />
    <path
      fill="#00832D"
      d="M128.001 73.311q19.68-23.768 27.125-36.655q5.996-10.377 13.196-33.137C164.363 1.173 159.818 0 155.126 0h-54.25C96.184 0 91.64 1.32 87.68 3.519q9.16 26.103 15.544 37.154q7.056 12.213 24.777 32.638"
    />
    <path
      fill="#2684FC"
      d="M175.36 155.42H80.642l-40.32 69.792c3.958 2.346 8.503 3.519 13.195 3.519h148.968c4.692 0 9.238-1.32 13.196-3.52z"
    />
    <path
      fill="#00AC47"
      d="M128.001 73.311L87.681 3.52c-3.96 2.346-7.332 5.571-9.678 9.677L3.519 142.224A26.57 26.57 0 0 0 0 155.42h80.642z"
    />
    <path
      fill="#FFBA00"
      d="m215.242 77.71l-37.243-64.514c-2.345-4.106-5.718-7.331-9.677-9.677l-40.32 69.792l47.358 82.109h80.496c0-4.546-1.173-9.09-3.519-13.196z"
    />
  </svg>
);

const actions = [
  {
    label: "Write",
    icon: Pencil,
    prompts: [
      {
        label: "Draft email newsletters",
        standardText:
          "Hi Claude! Could you help me draft email newsletters? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label:
          "Craft something that reads differently depending on the reader's mood",
        standardText:
          "Hi Claude! Could you craft something that reads differently depending on the reader's mood? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Help me develop my unique voice as a writer",
        standardText:
          "Hi Claude! Could you help me develop my unique voice as a writer? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Develop podcast scripts",
        standardText:
          "Hi Claude! Could you help me develop podcast scripts? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Create presentation scripts",
        standardText:
          "Hi Claude! Could you help me create presentation scripts? If you need more information from me, ask me 1-2 key questions...",
      },
    ],
  },
  {
    label: "Learn",
    icon: GraduationCap,
    prompts: [
      {
        label: "Find credible sources for my research",
        standardText:
          "Hi Claude! Could you help me find credible sources for my research? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Compare learning resources",
        standardText:
          "Hi Claude! Could you help me compare learning resources? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Develop a learning framework based on my personal heroes",
        standardText:
          "Hi Claude! Could you help me develop a learning framework based on my personal heroes? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Develop reflection exercises",
        standardText:
          "Hi Claude! Could you help me develop reflection exercises? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Design learning journals",
        standardText:
          "Hi Claude! Could you help me design learning journals? If you need more information from me, ask me 1-2 key questions...",
      },
    ],
  },
  {
    label: "Code",
    icon: Code,
    prompts: [
      {
        label: "Design a digital pet that grows based on my coding habits",
        standardText:
          "Hi Claude! Could you help me design a digital pet that grows based on my coding habits? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Help me develop a personal learning roadmap for coding",
        standardText:
          "Hi Claude! Could you help me develop a personal learning roadmap for coding? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Develop coding standards",
        standardText:
          "Hi Claude! Could you help me develop coding standards? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Create security protocols",
        standardText:
          "Hi Claude! Could you help me create security protocols? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Build an app based on my idea",
        standardText:
          "Hi Claude! Could you help me build an app based on my idea? If you need more information from me, ask me 1-2 key questions...",
      },
    ],
  },
  {
    label: "Life stuff",
    icon: Coffee,
    prompts: [
      {
        label: "Improve financial literacy",
        standardText:
          "Hi Claude! Could you help me improve my financial literacy? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Improve sleep habits",
        standardText:
          "Hi Claude! Could you help me improve my sleep habits? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Guide me through a decision-making framework for a life choice",
        standardText:
          "Hi Claude! Could you guide me through a decision-making framework for a life choice? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Help with decision making",
        standardText:
          "Hi Claude! Could you help me with decision making? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Create family traditions",
        standardText:
          "Hi Claude! Could you help me create family traditions? If you need more information from me, ask me 1-2 key questions...",
      },
    ],
  },
  {
    label: "From Drive",
    icon: GoogleDriveIcon,
    prompts: [
      {
        label:
          "Identify and visualize my most brilliant moments from my documents",
        standardText:
          "Hi Claude! Could you identify and visualize my most brilliant moments from my documents? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Give me a TLDR on the new docs l've been given access to",
        standardText:
          "Hi Claude! Could you give me a TLDR on the new docs I've been given access to? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label:
          "Look at my docs and tell me what kind of genre writer I could be",
        standardText:
          "Hi Claude! Could you look at my docs and tell me what kind of genre writer I could be? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Locate documents that represent pivotal moments in my thinking",
        standardText:
          "Hi Claude! Could you locate documents that represent pivotal moments in my thinking? If you need more information from me, ask me 1-2 key questions...",
      },
      {
        label: "Summarize my top projects this quarter",
        standardText:
          "Hi Claude! Could you summarize my top projects this quarter? If you need more information from me, ask me 1-2 key questions...",
      },
    ],
  },
];

interface ChatActionsProps {
  onPromptHover?: (standardText: string | null) => void;
  onPromptSelect?: (standardText: string) => void;
}

export function ChatActions({
  onPromptHover,
  onPromptSelect,
}: ChatActionsProps) {
  const [selectedAction, setSelectedAction] = useState<
    (typeof actions)[number] | null
  >(null);

  // If an action is selected, show the popover content
  if (selectedAction) {
    const Icon = selectedAction.icon;
    return (
      <div className="w-full p-2">
        <div className="flex flex-col rounded-xl border bg-[#FFFFFF] dark:bg-[#30302E] shadow-none">
          {/* popover header */}
          <div className="flex flex-row items-center justify-between px-4 pt-3 relative">
            <div className="flex flex-row items-center gap-2">
              {selectedAction.icon === GoogleDriveIcon ? (
                <Icon />
              ) : (
                <Icon className="size-3 text-muted-foreground" />
              )}
              <div className="text-xs text-muted-foreground">
                {selectedAction.label}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground h-8 w-8"
              onClick={() => setSelectedAction(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
          {/* popover prompt list */}
          <div className="flex flex-col pt-2">
            {selectedAction.prompts.map((prompt, index) => (
              <div key={index}>
                {index > 0 && (
                  <div className="border-t border-border/50 mx-2" />
                )}
                <button
                  className="w-full text-left text-sm h-auto py-2.5 px-4 hover:bg-accent/50 transition-colors flex flex-row items-center group"
                  onMouseEnter={() => {
                    onPromptHover?.(prompt.standardText);
                  }}
                  onMouseLeave={() => {
                    onPromptHover?.(null);
                  }}
                  onClick={() => {
                    // Handle prompt selection here
                    onPromptSelect?.(prompt.standardText);
                    onPromptHover?.(null); // Clear hover state
                    setSelectedAction(null);
                  }}
                >
                  <span className="line-clamp-2">{prompt.label}</span>
                  <ChevronRight className="size-4 ml-auto hidden group-hover:block text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, show the action buttons
  return (
    <div className="flex flex-row items-center justify-center gap-2 w-full flex-wrap relative">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="text-muted-foreground bg-transparent dark:bg-transparent border-border dark:border-border dark:border-[0.5px] border shadow-none"
            onClick={() => setSelectedAction(action)}
          >
            {action.icon === GoogleDriveIcon ? (
              <Icon />
            ) : (
              <Icon className="size-4" />
            )}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
