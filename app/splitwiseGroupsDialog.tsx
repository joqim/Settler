"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface GroupDialogProps {
  onSaveChanges: (group: string, id: string) => void;
}

export function GroupDialog({ onSaveChanges }: GroupDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [groups, setGroups] = React.useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = React.useState("");
  const [selectedGroupId, setSelectedGroupId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleDialogSaveChanges = () => {
    // Add your save changes logic here
    onSaveChanges(selectedGroup, selectedGroupId);
  };

  let preparedGroups: any[] = [];
  const handleSwitchGroupClick = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');
      const groupsData = await response.json();
      //console.log("groups data", groupsData)

      preparedGroups = groupsData.map((group: {
        name: string,
        id: string
      }) => {
        return {
          value: group.name.toLowerCase().trimEnd(),
          label: group.name.trimEnd(),
          identifier: group.id
        }
      });
      setGroups(preparedGroups);
      setLoading(false);

      //console.log("preparedGroups", preparedGroups); // Process the data as needed
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <div className="">
      <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handleSwitchGroupClick} className="size-lg">Switch group</Button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-[550px] min-h-[250px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle>Switch group</DialogTitle>
          <DialogDescription>
            Switch to your dedicated splitwise group for poker settlements.
          </DialogDescription>
        </DialogHeader>
        {loading && (
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        )}
        {!loading && (
            <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[300px] justify-between"
                >
                {value
                    ? groups.find((group) => group.value === value)?.label
                    : "Select group..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                <Command>
                <CommandInput placeholder="Search group..." />
                <CommandEmpty>No group found.</CommandEmpty>
                <CommandGroup>
                    {groups.map((group) => (
                    <CommandItem
                        key={group.value}
                        onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        setSelectedGroup(currentValue === value ? "" : group.label);
                        setSelectedGroupId(currentValue === value ? "" : group.identifier);
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            value === group.value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {group.label}
                    </CommandItem>
                    ))}
                </CommandGroup>
                </Command>
            </PopoverContent>
            </Popover>
        )}
        
        <DialogFooter>
          <DialogClose asChild>
          <Button onClick={handleDialogSaveChanges}>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  )
}
