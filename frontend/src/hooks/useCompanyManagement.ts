import { handleAxiosError, handleTrackChangedArray, handleTrackChangedFields, genStorageKey } from "@/lib/utils";
import { getItem } from "@/lib/storage";
import type { CompanyManagement, CompanyManagementProps, ManagementMember, Report } from "@/types/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GENDERS } from "@/constants";
import useInstanceMutation, { type InstanceMutation } from "./api/useInstanceMutation";
import useDetailCacheUpdate from "./useDetailCacheUpdate";
import useSectionTouched from "./useSectionTouched";
import { useQueryClient } from "@tanstack/react-query";

const managementMemberSchema = z.object({
    id: z.number().optional(),
    individual: z.number().optional(),
    title: z.string().optional(),
    national_id: z.string().optional(),
    full_name: z.string().optional(),
    email: z.string().optional(),
    gender: GENDERS,
    date_of_birth: z.string().optional(),
    mobile_number: z.string().optional(),
    residential_address: z.string().optional(),
    address_prev: z.string().optional(),
    directorships: z.array(z.string()).optional(),
    insolvencies_judgements: z.string().optional(),
})

const schema = z.object({
    executive_head: managementMemberSchema,
    finance_head: managementMemberSchema,
    others: z.array(managementMemberSchema),
})

export type ManagementMemberFormData = z.infer<typeof managementMemberSchema>;
type CompanyManagementFormData = z.infer<typeof schema>;

export const emptyManagementMember = (): ManagementMemberFormData => ({
    id: undefined,
    individual: undefined,
    title: undefined,
    national_id: "",
    full_name: "",
    email: "",
    gender: "unknown",
    date_of_birth: undefined,
    mobile_number: "",
    residential_address: "",
    address_prev: "",
    directorships: [],
    insolvencies_judgements: undefined,
})

const toFormMember = (member?: ManagementMember | null): ManagementMemberFormData => {
    if (!member) return emptyManagementMember()
    return {
        id: member.id,
        individual: member.individual ?? undefined,
        title: member.title ?? undefined,
        national_id: member.national_id ?? "",
        full_name: member.full_name ?? "",
        email: member.email ?? "",
        gender: member.gender ?? "unknown",
        date_of_birth: member.date_of_birth ?? undefined,
        mobile_number: member.mobile_number ?? "",
        residential_address: member.residential_address ?? "",
        address_prev: member.address_prev ?? "",
        directorships: member.directorships ?? [],
        insolvencies_judgements: member.insolvencies_judgements ?? undefined,
    }
}

const managementToForm = (management?: CompanyManagement | null): CompanyManagementFormData => ({
    executive_head: toFormMember(management?.executive_head),
    finance_head: toFormMember(management?.finance_head),
    others: (management?.others ?? []).map(toFormMember),
})

export const hasManagementMemberData = (member: ManagementMemberFormData) => Boolean(
    member.individual ||
    member.full_name ||
    member.national_id ||
    member.title ||
    member.email ||
    member.mobile_number ||
    member.residential_address ||
    member.address_prev ||
    member.date_of_birth
)

const toWritePayload = (member: ManagementMemberFormData) => ({
    ...(member.id ? { id: member.id } : {}),
    ...(member.title ? { title: member.title } : {}),
    individual: {
        ...(member.individual ? { id: member.individual } : {}),
        full_name: member.full_name ?? "",
        ...(member.national_id ? { national_id: member.national_id } : {}),
        gender: member.gender,
        ...(member.date_of_birth ? { date_of_birth: member.date_of_birth } : {}),
        ...(member.email ? { email: member.email } : {}),
        ...(member.mobile_number ? { mobile_number: member.mobile_number } : {}),
        ...(member.residential_address ? { residential_address: member.residential_address } : {}),
        ...(member.address_prev ? { address_prev: member.address_prev } : {}),
    },
})

/** undefined = nothing to send, null = clear the slot, object = upsert the member. */
const buildMemberPayload = (
    initial: ManagementMemberFormData,
    current: ManagementMemberFormData
) => {
    if (!handleTrackChangedFields(initial, current)) return undefined
    if (hasManagementMemberData(current)) return toWritePayload(current)
    return initial.id ? null : undefined
}

function useCompanyManagement({
    management_data,
    report_id,
    subject_object_id,
    subject_type
}: CompanyManagementProps) {
    const defaultValues = useMemo(() => managementToForm(management_data), [management_data])

    // Rows submitted to the server get their ids back only in the response, so the
    // diff baseline is refreshed after every save instead of relying on the prop.
    const baseline = useRef(defaultValues)

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CompanyManagementFormData>({
        resolver: zodResolver(schema),
        defaultValues,
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "others",
    })

    const client = useQueryClient()
    const { mutate, isPending } = useInstanceMutation()
    const cache = useDetailCacheUpdate<Report>(["report", subject_type, report_id])
    const CACHE_KEY = useMemo(
        () => genStorageKey(report_id, subject_type, "management_details"),
        [report_id, subject_type]
    )
    const { onTouched, touched } = useSectionTouched(CACHE_KEY)

    useEffect(() => {
        const state = getItem(CACHE_KEY)
        if (state === "touched") onTouched();
    }, [report_id, subject_type, CACHE_KEY, onTouched])

    useEffect(() => {
        baseline.current = defaultValues
        reset(defaultValues)
    }, [reset, defaultValues])

    const onSubmit = (data: CompanyManagementFormData) => {
        const initial = baseline.current
        const filledOthers = data.others.filter(hasManagementMemberData)

        const titledMembers: [string, ManagementMemberFormData][] = [
            ["the Executive Head", data.executive_head],
            ["the Finance Head", data.finance_head],
            ...filledOthers.map((member, index): [string, ManagementMemberFormData] => (
                [`Manager ${index + 1}`, member]
            )),
        ]
        const missingTitle = titledMembers.find(
            ([, member]) => hasManagementMemberData(member) && !member.title
        )
        if (missingTitle) {
            toast.error(`Please select a title for ${missingTitle[0]}.`)
            return
        }

        const payload: Record<string, unknown> = {}

        // Each head is saved on its own - editing one never touches the other.
        const executiveHead = buildMemberPayload(initial.executive_head, data.executive_head)
        if (executiveHead !== undefined) payload.executive_head = executiveHead

        const financeHead = buildMemberPayload(initial.finance_head, data.finance_head)
        if (financeHead !== undefined) payload.finance_head = financeHead

        const hasRemovedOthers = initial.others.some(
            member => member.id && !filledOthers.some(current => current.id === member.id)
        )
        const hasChangedOthers = handleTrackChangedArray(initial.others, filledOthers).length > 0
        if (hasChangedOthers || hasRemovedOthers) {
            payload.others = filledOthers.map(toWritePayload)
        }

        if (Object.keys(payload).length === 0) {
            onTouched()
            return
        }

        const PAYLOAD: InstanceMutation = {
            url: `/api/companies/${subject_object_id}/management/`,
            mode: "create",
            data: payload,
        }

        mutate(PAYLOAD, {
            onSuccess: (response: { management: CompanyManagement }) => {
                const next = managementToForm(response.management)
                baseline.current = next
                reset(next)
                client.invalidateQueries({ queryKey: ["company"] })
                cache.set(["subject", "management"], response.management)
                toast.success("Company management updated successfully.")
                if (report_id) onTouched()
            },
            onError: (error) => handleAxiosError(error)
        })
    }

    return {
        onSubmit,
        register,
        handleSubmit,
        onTouched,
        touched,
        isPending,
        control,
        errors,
        fields,
        append,
        remove,
        setValue,
        watch,
    }
}

export default useCompanyManagement
