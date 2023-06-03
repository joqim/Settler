"use client"

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { DollarInput } from '@/components/ui/dollarinput';
import { toast } from "@/components/ui/use-toast"
import { DollarSign } from 'lucide-react';
import { Slider } from "@/components/ui/slider"
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
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  language: z.string({
    required_error: "Please select a language.",
  }),
})

type AccountFormValues = z.infer<typeof accountFormSchema>
type GlobalDetailProps = {
  onBuyInValueChange: (value: string) => void;
  onPlayerCountValueChange: (value: string) => void;
};

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  // name: "Your name",
  // dob: new Date("2023-01-23"),
}

export function GlobalDetail({ onBuyInValueChange, onPlayerCountValueChange }: GlobalDetailProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  const [playerCount, setPlayerCount] = useState([2]); // Initial player count value
  const [buyIn, setBuyIn] = useState(); // Initial buy-in value

  const handleBuyInChange = (event: any) => {
    setBuyIn(event.target.value);
    onBuyInValueChange(event.target.value);
  };

  const handlePlayerCountChange = (value: any) => {
    setPlayerCount(value);
    onPlayerCountValueChange(value)
  }

  return (
    <Form {...form}>
    <form className="space-y-10">
        <div className="flex flex-wrap -mx-4">
        <div className="w-full sm:w-1/2 px-4">
            <div className="flex flex-col">
            <div className="flex">
              <FormField
                control={form.control}
                name="name"
                render={({ }) => (
                  <FormItem className="ml-2">
                  <FormLabel>Player count</FormLabel>
                    <FormControl className="w-[400px] p-2">
                    <Slider
                      value={playerCount}
                      onValueChange={handlePlayerCountChange}
                      min={0}
                      max={10}
                      step={1}
                    />
                    </FormControl>
                    <FormDescription>
                      Total number of players ({playerCount}).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="ml-14">
                    <FormLabel>Buy-in</FormLabel>
                    <FormControl className="relative w-[200px] p-4">
                      <DollarInput 
                        type="number"
                        min="0"
                        placeholder="Buy-in amount"
                        value={buyIn}
                        onChange={handleBuyInChange}
                        className="no-spin appearance-none pl-8"  
                      />
                    </FormControl>
                    <FormDescription>
                      Buy-in amount decided for the game.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            </div>
        </div>
        </div>
    </form>
    </Form>
  )
}