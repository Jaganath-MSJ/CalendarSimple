import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Calendar from "../Calendar";
import { ECalendarViewType } from "../types";

const meta: Meta<typeof Calendar> = {
  title: "Calendar/CustomView",
  component: Calendar,
  args: {
    view: ECalendarViewType.customDays,
    customDays: 3,
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    customDays: 3,
  },
};

export const FiveDays: Story = {
  args: {
    customDays: 5,
  },
};

export const OneDay: Story = {
  args: {
    customDays: 1,
  },
};

export const TenDays: Story = {
  args: {
    customDays: 10,
  },
};
