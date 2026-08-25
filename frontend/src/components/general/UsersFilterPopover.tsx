import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ColumnsContainer from "./ColumnsContainer";
import { SlidersHorizontal } from "lucide-react";
import useUsersFiltersPopover from "@/hooks/useUsersFiltersPopover";

export function UsersFilterPopover() {
  const {
    control,
    watch,
    onCancel,
    onSubmit,
    handleSubmit,
  } = useUsersFiltersPopover()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal/>
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4 rounded-lg" align="end">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label highlighted = {false}>User type</Label>
            <Controller
              name="user_type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">All</SelectItem>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {
            watch("user_type") === "external" &&
            <div className="space-y-2">
              <Label highlighted = {false}>Client type</Label>
              <Controller
                name="client_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">All</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          }

          <div className="space-y-2">
            <Label highlighted = {false}>Status</Label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <ColumnsContainer>
            <div className="space-y-2">
              <Label highlighted = {false}>Created after</Label>
              <Controller
                name="created_at_after"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label highlighted = {false}>Created before</Label>
              <Controller
                name="created_at_before"
                control={control}
                render={({ field }) => (
                  <Input type="date" {...field} />
                )}
              />
            </div>
          </ColumnsContainer>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}