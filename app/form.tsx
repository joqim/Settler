"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import React, { useState, useEffect } from 'react';

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/react-hook-form/form"

const accountFormSchema = z.object({
  player: z.string({
    required_error: "Please select a player.",
  }),
  chips: z.number({
    required_error: "Chips count is required."
  }),
  buyin: z.number({
    required_error: "Buy-in count for this player is required."
  })
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  // name: "Your name",
  // dob: new Date("2023-01-23"),
}

type AccountFormProps = {
    index: number;
    playerCount: number[];
    members: any[];
};

export function AccountForm({ index, playerCount, members }: AccountFormProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  let preparedMembersArray: any = []
  if(members) {
    preparedMembersArray = members.map((member: { name: any; id: any }) => {
      const isPlayerSelected = form.watch("player") === member.name.toLowerCase();
      return {
        value: member.name.toLowerCase(),
        label: member.name,
        identifier: member.id,
        disabled: isPlayerSelected,
      };
    });
  }
  

  const handleSelectItem = (value: any) => {
    form.setValue("player", value);
    setIsPopoverOpen(false); // Close the popover
  };

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Watch for changes in the form values
  const watchValues = form.watch();

  const getIdentifier = (playerName: string) => {
    //console.log("playerName in getIdentifier", playerName)
    const matchingMember = preparedMembersArray.find((item: any) => item.value === playerName);
    return matchingMember ? matchingMember.identifier : '';
  };

  const handleClearClick = () => {
    // Retrieve existing player array from local storage
    const existingArray = JSON.parse(localStorage.getItem("players") || "[]");
  
    // Find the player object with the matching identifier
    const playerToDelete = existingArray.find(
      (item: any) =>
        item.identifier ===
        preparedMembersArray.find((player: any) => player.value === watchValues?.player)
          ?.identifier
    );
  
    if (playerToDelete) {
      // Remove the player object from the array
      const indexToDelete = existingArray.indexOf(playerToDelete);
      existingArray.splice(indexToDelete, 1);
  
      // Update the player array in local storage
      localStorage.setItem("players", JSON.stringify(existingArray));
    }
  
    // Reset the form values
    const chipsInput = document.querySelector('input[name="chips"]') as HTMLInputElement;
    const buyinInput = document.querySelector('input[name="buyin"]') as HTMLInputElement;
    if (chipsInput) chipsInput.value = "";
    if (buyinInput) buyinInput.value = "";
    form.reset();
  };

  useEffect(() => {
    // Update the values when the form values change
    // console.log("val", watchValues);
    // console.log("preparedMembersArray", preparedMembersArray)
    // Retrieve existing player array from local storage
    const existingArray = JSON.parse(localStorage.getItem('players') || '[]');

    // Check if there is an object with the same player name in the array
    const existingPlayer = existingArray.find((item: any) => item.identifier === getIdentifier(watchValues.player));

    if (existingPlayer) {
        // If the player already exists, update the chips and buyin properties
        existingPlayer.chips = watchValues.chips;
        existingPlayer.buyin = watchValues.buyin;
    } else {
        // If the player doesn't exist, create a new object and add it to the array
        if(watchValues.player) {
            const newPlayer = {
                name: watchValues.player,
                chips: watchValues.chips,
                buyin: watchValues.buyin,
                identifier: getIdentifier(watchValues.player)
            };
            existingArray.push(newPlayer);
        }
    }

    // Update the player array in local storage
    localStorage.setItem('players', JSON.stringify(existingArray));

    //console.log("localStorage", localStorage.getItem('players'));
  }, [watchValues, preparedMembersArray]);

  return (
    <Form {...form}>
      <form className="space-y-10">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 sm:w-1/2">
            <div className="flex flex-col">
              <div className="flex flex-wrap">
                <div className="w-full sm:w-1/2">
                  <FormField
                    control={form.control}
                    name="player"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player</FormLabel>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between sm:w-[400px]",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!!field.value} // Disable the button if a value is selected
                              >
                                {field.value
                                  ? preparedMembersArray.find(
                                      (player: any) => player.value === field.value
                                    )?.label
                                  : "Select player"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-full p-0 sm:w-[400px]"
                            style={{ maxHeight: "220px", overflowY: "auto" }}
                          >
                            <Command>
                              <CommandInput placeholder="Search player..." />
                              <CommandEmpty>No player found.</CommandEmpty>
                              <CommandGroup>
                                {preparedMembersArray.map((player: any) => (
                                  <CommandItem
                                    value={player.value}
                                    key={player.value}
                                    onSelect={handleSelectItem} // Handle item selection
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        player.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {player.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {index === playerCount[0] - 1 ? (
                          <FormDescription>
                            Participant actively engaged in the poker match.
                          </FormDescription>
                        ) : null}
                        <FormMessage />                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <div className="flex flex-wrap">
                    <FormField
                      control={form.control}
                      name="chips"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-[250px]">
                          <FormLabel className="mt-4 sm:mt-0">Chips</FormLabel>
                          <FormControl className="w-full p-4">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Chips count"
                              {...field}
                              className="no-spin appearance-none"
                            />
                          </FormControl>
                          {index === playerCount[0] - 1 ? (
                            <FormDescription>
                              Chips balance left with this player.
                            </FormDescription>
                          ) : null}
                          <FormMessage />                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="buyin"
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-[200px]">
                          <FormLabel className="mt-4 sm:mt-0">Buy-in&apos;s</FormLabel>
                          <FormControl className="w-full p-4">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Buy-in count"
                              {...field}
                              className="no-spin appearance-none"
                            />
                          </FormControl>
                          {index === playerCount[0] - 1 ? (
                            <FormDescription className="mt-2">
                              Number of buy-ins purchased by this player.
                            </FormDescription>
                          ) : null}
                          <FormMessage />                        
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    className="my-4 sm:ml-14 sm:mt-2"
                    variant="secondary"
                    type="button"
                    onClick={handleClearClick}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>

  )
}