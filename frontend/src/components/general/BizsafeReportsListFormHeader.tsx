import ColumnsContainer from "@/components/general/ColumnsContainer";
import LoadingIndicator from "@/components/general/LoadingIndicator";
import NormalizedFieldset from "@/components/general/NormalizedFieldset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LONG_MONTHS } from "@/constants";
import type { setBizsafeResultsType } from "@/hooks/useBizsafeReportsList";
import { type ModeMonths } from "@/hooks/useBizsafeReportsListHeaderForm";
import useBizsafeReportsListHeaderForm from "@/hooks/useBizsafeReportsListHeaderForm";
import { getYearRange, toCap } from "@/lib/utils";
import { Controller } from "react-hook-form";

interface props {
  setResults: setBizsafeResultsType
}
function BizsafeReportsListFormHeader({
  setResults
}: props) {
    const {
      mode,      
      errors,
      control,
      isPending,
      handleChangeMode,
      handleSubmit,
      getValues,
      register,
      onSubmit,
    } = useBizsafeReportsListHeaderForm(setResults)
    
    return (
    <div className="card flex flex-col gap-5">
        <RadioGroup 
          value = {mode}
          onValueChange={(v: ModeMonths)=> handleChangeMode(v)}
          className=" flex flex-row gap-3">
          <div className="flex flex-row gap-2">
            <RadioGroupItem value = "month" id = "bs_m"/>
            <Label highlighted = { false } htmlFor="bs_m">Month</Label>
          </div>
           <div className="flex flex-row gap-2">
            <RadioGroupItem value = "period_month" id = "bs_p_m"/>
            <Label highlighted = { false } htmlFor="bs_p_m">Period (Month)</Label>
          </div>
        </RadioGroup>  
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <ColumnsContainer numberOfCols={3}>
            <NormalizedFieldset legendTitle = "Report Type" legendTitleVariant="sm">
              <div className="form-group">
                <Label highlighted = {false}>Client / Subject</Label>
              
                <div className="flex flex-row gap-2">
                  <Controller
                    control={control}
                    name = {`report_selection`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder = "Select Position"/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="subject">Subject</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input {...register("entity_value")} className="flex-1"/>
                </div>
                {
                  errors.entity_value && <p className="text-red-500 text-sm">{errors.entity_value.message}</p>
                }
                {
                  errors.report_selection && <p className="text-red-500 text-sm">{errors.report_selection.message}</p>
                }
              </div>
            </NormalizedFieldset>
            <NormalizedFieldset legendTitle = "Month" legendTitleVariant="sm">
              <ColumnsContainer numberOfCols={2}>
                <div className="form-group">
                  <Label highlighted = {false}>Year</Label>
                  <Controller
                    control={control}
                    name = {`m_year`}
                    render={({ field }) => (
                      <Select 
                        disabled = {mode === "period_month"}
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder = "Year"/>
                        </SelectTrigger>
                        <SelectContent>
                          {
                            getYearRange(50).map((year) => (
                              <SelectItem key = {year} value={year.toString()}>{year}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {
                    errors.m_year && <p className="text-red-500 text-sm">{errors.m_year.message}</p>
                  }
                </div>  
                <div className="form-group">
                  <Label highlighted = {false}>Month</Label>
                  <Controller
                    control={control}
                    name = {`m_month`}
                    render={({ field }) => (
                      <Select 
                        disabled = {mode === "period_month"}
                        key = {getValues("m_month")}
                        onValueChange={field.onChange} 
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder = "Select Position"/>
                        </SelectTrigger>
                        <SelectContent>
                          {
                            LONG_MONTHS.map((month, index) => (
                              <SelectItem key = {index} value={month}>{toCap(month)}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {
                    errors.m_month && <p className="text-red-500 text-sm">{errors.m_month.message}</p>
                  }
                </div>
              </ColumnsContainer>
            </NormalizedFieldset>

            <NormalizedFieldset legendTitle = "Period (Month)" legendTitleVariant="sm">
              <ColumnsContainer numberOfCols={3}>
                <div className="form-group">
                  <Label highlighted = {false}>Year</Label>
                  <Controller
                    control={control}
                    name = {`p_year`}
                    render={({ field }) => (
                      <Select 
                        disabled = {mode === "month"}
                        key = {getValues("p_year")}
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder = "Year"/>
                        </SelectTrigger>
                        <SelectContent>
                          {
                            getYearRange(50).map((year) => (
                              <SelectItem key = {year} value={year.toString()}>{year}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {
                    errors.p_year && <p className="text-red-500 text-sm">{errors.p_year.message}</p>
                  }
                </div>  
                <div className="form-group">
                  <Label highlighted = {false}>From</Label>
                  <Controller
                    control={control}
                    name = {`p_from`}
                    render={({ field }) => (
                      <Select
                        key = {getValues("p_from")}
                        disabled = {mode === "month"}
                        onValueChange={field.onChange} 
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder = "Select Position"/>
                        </SelectTrigger>
                        <SelectContent>
                          {
                            LONG_MONTHS.map((month, index) => (
                              <SelectItem key = {index} value={month}>{toCap(month)}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {
                    errors.p_from && <p className="text-red-500 text-sm">{errors.p_from.message}</p>
                  }
                </div>
                <div className="form-group">
                  <Label highlighted = {false}>To</Label>
                  <Controller
                    control={control}
                    name = {`p_to`}
                    render={({ field }) => (
                      <Select
                        key = {getValues("p_to")}
                        disabled = {mode === "month"}
                        onValueChange={field.onChange} 
                        defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder = "Select Position"/>
                        </SelectTrigger>
                        <SelectContent>
                          {
                            LONG_MONTHS.map((month, index) => (
                              <SelectItem key = {index} value={month}>{toCap(month)}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {
                    errors.p_to && <p className="text-red-500 text-sm">{errors.p_to.message}</p>
                  }
                </div>
              </ColumnsContainer>
            </NormalizedFieldset>
          </ColumnsContainer>
        </form>
        <div className="flex flex-row justify-end">
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            {
              isPending
              ? <div className="flex flex-row gap-2">
                <LoadingIndicator variant="button"/>
                Running ...
              </div>
              :"Run"
            }            
          </Button>
        </div>
    </div>
  )
}

export default BizsafeReportsListFormHeader