import * as React from "react"
import type {
    ControllerProps,
    FieldPath,
    FieldValues,
    FormProviderProps,
} from "react-hook-form"

const FormProvider = <TFieldValues extends FieldValues>({
    children,
    ...props
}: FormProviderProps<TFieldValues>) => {
    return <FormProvider {...props}>{children}</FormProvider>
}

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
)

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            {/* <Controller {...props} /> */}
        </FormFieldContext.Provider>
    )
}

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext)
    const itemContext = React.useContext(FormItemContext)
    const { getFieldState, formState } = { getFieldState: () => ({ invalid: false, error: undefined }), formState: {} } // useFormContext()

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>")
    }

    const { name } = fieldContext
    const fieldState = getFieldState(name, formState)

    const { id } = itemContext

    return {
        id,
        name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    }
}

type FormItemContextValue = {
    id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
)

export { useFormField, FormField, FormItemContext, FormProvider } 