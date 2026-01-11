"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, Plus, SortDescIcon, LayoutGrid } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

const mockProjects = [
  {
    id: "1",
    title: "Project 1",
    description: "Description 1",
  },
];

export default function AnthropicProjectsPage() {
  return (
    <div className="mt-12 p-4 flex flex-col gap-4">
      <div className="text-2xl font-bold">Projects</div>
      <Button variant="default" className="w-fit absolute right-4 top-4">
        <Plus className="size-4" />
        New Project
      </Button>
      <InputGroup className="h-11">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search projects..." />
      </InputGroup>

      <div className="flex flex-row items-start justify-between">
        <Tabs defaultValue="projects">
          <TabsList className="gap-3">
            <TabsTrigger value="projects" className="rounded-full px-4 py-2">
              Your projects
            </TabsTrigger>
            <TabsTrigger value="archived" className="rounded-full px-4 py-2">
              Archived
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects"></TabsContent>
          <TabsContent value="archived"></TabsContent>
        </Tabs>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="px-2">
              <SortDescIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit rounded-xl p-2">
            <DropdownMenuItem>
              <span className="flex items-center gap-2">
                Recent activity
                <Check className="ml-auto size-4 opacity-100" />
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem>Last edited</DropdownMenuItem>
            <DropdownMenuItem>Date created</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex justify-center mt-12">
        <Empty className="max-w-96">
          <EmptyMedia>
            <LayoutGrid className="size-16" />
          </EmptyMedia>
          <EmptyHeader>Looking to start a project?</EmptyHeader>
          <EmptyDescription>
            Upload materials, set custom instructions, and organize
            conversations in one space
          </EmptyDescription>
          <EmptyContent>
            <Button variant="outline" className="w-fit">
              <Plus className="size-4" />
              New Project
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
